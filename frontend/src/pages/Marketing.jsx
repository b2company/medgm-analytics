import React, { useState, useEffect } from 'react';
import {
  getMetaConfig,
  createMetaConfig,
  deleteMetaConfig,
  getMetaCampaigns,
  getMetaInsightsSummary,
  getMetaDailyInsights,
  getCampaignAds
} from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import Modal from '../components/Modal';

const Marketing = () => {
  const [activeTab, setActiveTab] = useState('venda-direta');

  const tabs = [
    { id: 'venda-direta', label: 'Venda Direta', icon: '🛒' },
    { id: 'captura-lead', label: 'Captura de Lead', icon: '📋' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Marketing - Meta Ads</h1>
        <p className="text-gray-600 mt-1">Dashboards de performance de campanhas</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'venda-direta' && <VendaDiretaTab />}
      {activeTab === 'captura-lead' && <CapturaLeadTab />}
    </div>
  );
};

// ==================== VENDA DIRETA TAB ====================
function VendaDiretaTab() {
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [formData, setFormData] = useState({
    access_token: '',
    ad_account_id: ''
  });

  const [campaigns, setCampaigns] = useState([]);
  const [insights, setInsights] = useState(null);
  const [dailyInsights, setDailyInsights] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [datePreset, setDatePreset] = useState('last_30d');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);

  useEffect(() => {
    checkConfig();
  }, []);

  useEffect(() => {
    if (config) {
      loadData();
    }
  }, [config, datePreset, selectedCampaigns]);

  useEffect(() => {
    if (config && selectedCampaigns.length > 0) {
      loadAds();
    } else {
      setAds([]);
    }
  }, [config, selectedCampaigns]);

  const checkConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await getMetaConfig();
      setConfig(response);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Erro ao verificar configuração:', error);
      }
    } finally {
      setConfigLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [campaignsData, insightsData, dailyData] = await Promise.all([
        getMetaCampaigns(''),
        getMetaInsightsSummary(datePreset),
        getMetaDailyInsights(datePreset)
      ]);
      setCampaigns(campaignsData);
      setInsights(insightsData);
      setDailyInsights(dailyData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAds = async () => {
    setLoadingAds(true);
    try {
      const allAds = [];
      for (const campaignId of selectedCampaigns) {
        const campaignAds = await getCampaignAds(campaignId);
        allAds.push(...campaignAds);
      }
      setAds(allAds);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
    } finally {
      setLoadingAds(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMetaConfig(formData);
      setShowConfigModal(false);
      setFormData({ access_token: '', ad_account_id: '' });
      await checkConfig();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao conectar com Meta Ads. Verifique o token e ID da conta.');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja desconectar do Meta Ads?')) return;
    try {
      await deleteMetaConfig();
      setConfig(null);
      setCampaigns([]);
      setInsights(null);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  const handleCampaignSelect = (campaignId) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  if (configLoading) {
    return <div className="text-center py-12">Carregando configuração...</div>;
  }

  if (!config) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Conectar Meta Ads</h2>
          <p className="text-gray-600 mb-6">
            Configure sua integração com Meta Marketing API
          </p>
          <button
            onClick={() => setShowConfigModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Configurar Agora
          </button>
        </div>

        {showConfigModal && (
          <Modal onClose={() => setShowConfigModal(false)} title="Configurar Meta Ads">
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                <input
                  type="text"
                  value={formData.access_token}
                  onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Account ID</label>
                <input
                  type="text"
                  value={formData.ad_account_id}
                  onChange={(e) => setFormData({ ...formData, ad_account_id: e.target.value })}
                  required
                  placeholder="act_XXXXXXXXXX"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowConfigModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Conectar
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Filtros estilo Meta Ads */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="last_7d">Últimos 7 dias</option>
              <option value="last_30d">Últimos 30 dias</option>
              <option value="this_month">Este mês</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campanhas ({selectedCampaigns.length} selecionadas)
            </label>
            <div className="relative">
              <select
                multiple
                value={selectedCampaigns}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions);
                  setSelectedCampaigns(options.map(opt => opt.value));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-10 overflow-hidden"
                style={{ appearance: 'none' }}
              >
                <option value="">Todas as campanhas</option>
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Segure Ctrl/Cmd para selecionar múltiplas</p>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
            >
              Desconectar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando métricas...</div>
      ) : (
        <>
          {/* Visão geral das métricas */}
          {insights && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Visão geral das métricas</h2>
              <div className="grid grid-cols-5 gap-4 mb-8">
                <MetricCard label="Valor Gasto" value={`R$ ${insights.spend.toFixed(2)}`} />
                <MetricCard label="Compras" value={insights.conversions || 0} />
                <MetricCard label="Valor Retornado" value="R$ 0,00" subtitle="(Não disponível na API)" />
                <MetricCard label="ROAS" value="0,00" subtitle="(Calcular com vendas)" />
                <MetricCard label="Custo/Compra" value={insights.conversions > 0 ? `R$ ${(insights.spend / insights.conversions).toFixed(2)}` : 'R$ 0,00'} />
              </div>
            </>
          )}

          {/* Gráficos */}
          {dailyInsights.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Visão diária das métricas</h2>
              <div className="grid grid-cols-1 gap-6 mb-8">
                {/* Gráfico principal: Valor Gasto + Valor Retornado + Compras */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={dailyInsights.map(d => ({
                      ...d,
                      date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="spend" fill="#3b82f6" name="Valor Gasto" />
                      <Line yAxisId="right" type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} name="Compras" dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico Custo/Compra e ROAS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Custo/Compra e ROAS</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <ComposedChart data={dailyInsights.map(d => ({
                        ...d,
                        date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        custoCompra: d.clicks > 0 ? d.spend / d.clicks : 0
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar yAxisId="left" dataKey="custoCompra" fill="#10b981" name="Custo/Compra" />
                        <Line yAxisId="right" type="monotone" dataKey="ctr" stroke="#3b82f6" strokeWidth={2} name="ROAS" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Visão diária do CPA</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dailyInsights.map(d => ({
                        ...d,
                        date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        cpa: d.clicks > 0 ? d.spend / d.clicks : 0
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="cpa" stroke="#3b82f6" strokeWidth={2} name="Custo/Compra" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Análise por criativo */}
          {selectedCampaigns.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Análise por criativo</h2>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Criativo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Valor Gasto</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Impressões</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Cliques</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">CTR</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">CPC</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">CPM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loadingAds ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                            Carregando anúncios...
                          </td>
                        </tr>
                      ) : ads.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                            Nenhum anúncio encontrado para as campanhas selecionadas
                          </td>
                        </tr>
                      ) : (
                        ads.map((ad) => (
                          <tr key={ad.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="font-medium max-w-xs truncate">{ad.name}</div>
                              <div className="text-xs text-gray-500 mt-1">ID: {ad.id}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                ad.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                ad.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {ad.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {ad.spend.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{ad.impressions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${Math.min((ad.clicks / ad.impressions) * 100 * 10, 100)}%` }}
                                  ></div>
                                </div>
                                <span>{ad.clicks}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{ad.ctr.toFixed(2)}%</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {ad.cpc.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {ad.cpm.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {ads.length > 0 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                    Mostrando {ads.length} anúncios | Ordenados por melhor CTR
                  </div>
                )}
              </div>
            </>
          )}

          {/* Nota sobre dados de conversão */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Para métricas completas de vendas (Valor Retornado, ROAS, Funil de Vendas),
              você precisa integrar com sua plataforma de e-commerce (Shopify, WooCommerce, etc.) ou
              configurar conversões personalizadas no Meta Pixel.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== CAPTURA LEAD TAB ====================
function CapturaLeadTab() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Dashboard de Captura de Lead</h3>
      <p className="text-gray-600 mb-4">
        Dashboard focado em campanhas de geração de leads com métricas de CPL, taxa de conversão e qualidade de leads.
      </p>
      <p className="text-sm text-gray-500">Em desenvolvimento...</p>
    </div>
  );
}

// ==================== METRIC CARD ====================
function MetricCard({ label, value, subtitle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default Marketing;
