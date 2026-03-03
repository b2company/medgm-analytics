import React, { useState, useEffect } from 'react';
import {
  getMetaConfig,
  createMetaConfig,
  deleteMetaConfig,
  getMetaCampaigns,
  getMetaInsightsSummary,
  getQuizMetrics,
  createQuizMetrics,
  updateQuizMetrics,
  deleteQuizMetrics,
  getVendaDiretaMetrics,
  createVendaDiretaMetrics,
  updateVendaDiretaMetrics,
  deleteVendaDiretaMetrics
} from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import KPICardWithProgress from '../components/KPICardWithProgress';
import Modal from '../components/Modal';

const Marketing = () => {
  const [activeTab, setActiveTab] = useState('meta-ads');

  const tabs = [
    { id: 'meta-ads', label: 'Meta Ads', icon: '⚡' },
    { id: 'quiz-se', label: 'Quiz SE', icon: '📋' },
    { id: 'venda-direta', label: 'Venda Direta', icon: '🛒' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Marketing</h1>
        <p className="text-gray-600 mt-1">Gestão de campanhas e funis de conversão</p>
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
      {activeTab === 'meta-ads' && <MetaAdsTab />}
      {activeTab === 'quiz-se' && <QuizSETab />}
      {activeTab === 'venda-direta' && <VendaDiretaTab />}
    </div>
  );
};

// ==================== META ADS TAB ====================
function MetaAdsTab() {
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [formData, setFormData] = useState({
    access_token: '',
    ad_account_id: ''
  });

  const [campaigns, setCampaigns] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [datePreset, setDatePreset] = useState('last_30d');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  useEffect(() => {
    checkConfig();
  }, []);

  useEffect(() => {
    if (config) {
      loadData();
    }
  }, [config, datePreset, statusFilter]);

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
      const [campaignsData, insightsData] = await Promise.all([
        getMetaCampaigns(statusFilter),
        getMetaInsightsSummary(datePreset)
      ]);
      setCampaigns(campaignsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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
            Configure sua integração com Meta Marketing API para visualizar métricas de campanhas.
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <input
                  type="text"
                  value={formData.access_token}
                  onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                  required
                  placeholder="Cole seu access token do Meta"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gere em: Graph API Explorer → Permissions: ads_read, ads_management, business_management
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Account ID
                </label>
                <input
                  type="text"
                  value={formData.ad_account_id}
                  onChange={(e) => setFormData({ ...formData, ad_account_id: e.target.value })}
                  required
                  placeholder="act_XXXXXXXXXX"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: act_XXXXX (encontre em Meta Business Suite)
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
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
      {/* Header com filtros e desconectar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="last_7d">Últimos 7 dias</option>
              <option value="last_30d">Últimos 30 dias</option>
              <option value="this_month">Este mês</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Todas</option>
              <option value="ACTIVE">Ativas</option>
              <option value="PAUSED">Pausadas</option>
              <option value="ARCHIVED">Arquivadas</option>
            </select>
          </div>
          <div className="pt-6">
            <span className="text-sm text-gray-600">
              Conta: <strong>{config.ad_account_name || config.ad_account_id}</strong>
            </span>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Desconectar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando métricas...</div>
      ) : (
        <>
          {/* KPI Cards */}
          {insights && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <KPICard title="Gastos" value={`R$ ${insights.spend.toFixed(2)}`} color="blue" />
                <KPICard title="Impressões" value={insights.impressions.toLocaleString()} color="purple" />
                <KPICard title="Cliques" value={insights.clicks.toLocaleString()} color="green" />
                <KPICard title="CTR" value={`${insights.ctr.toFixed(2)}%`} color="yellow" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <KPICard title="CPC" value={`R$ ${insights.cpc.toFixed(2)}`} color="indigo" />
                <KPICard title="CPM" value={`R$ ${insights.cpm.toFixed(2)}`} color="pink" />
                <KPICard title="Alcance" value={insights.reach.toLocaleString()} color="cyan" />
                <KPICard title="Conversões" value={insights.conversions || 0} color="orange" />
              </div>
            </>
          )}

          {/* Tabela de Campanhas */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Campanhas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objetivo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget Diário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Nenhuma campanha encontrada
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{campaign.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{campaign.objective || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {campaign.daily_budget ? `R$ ${campaign.daily_budget.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== QUIZ SE TAB ====================
function QuizSETab() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [filters, setFilters] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    campanha: ''
  });

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    campanha_nome: '',
    campanha_id: '',
    verba: 0,
    impressoes: 0,
    cliques: 0,
    pageviews: 0,
    quiz_inicio: 0,
    quiz_end: 0,
    leads: 0
  });

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getQuizMetrics(filters.mes, filters.ano, filters.campanha);
      setMetrics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMetric) {
        await updateQuizMetrics(editingMetric.id, formData);
      } else {
        await createQuizMetrics(formData);
      }
      resetForm();
      loadMetrics();
    } catch (error) {
      console.error('Erro ao salvar métrica:', error);
      alert('Erro ao salvar métrica');
    }
  };

  const handleEdit = (metric) => {
    setEditingMetric(metric);
    setFormData({
      data: metric.data,
      campanha_nome: metric.campanha_nome,
      campanha_id: metric.campanha_id || '',
      verba: metric.verba,
      impressoes: metric.impressoes,
      cliques: metric.cliques,
      pageviews: metric.pageviews,
      quiz_inicio: metric.quiz_inicio,
      quiz_end: metric.quiz_end,
      leads: metric.leads
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta métrica?')) return;
    try {
      await deleteQuizMetrics(id);
      loadMetrics();
    } catch (error) {
      console.error('Erro ao deletar métrica:', error);
      alert('Erro ao deletar métrica');
    }
  };

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      campanha_nome: '',
      campanha_id: '',
      verba: 0,
      impressoes: 0,
      cliques: 0,
      pageviews: 0,
      quiz_inicio: 0,
      quiz_end: 0,
      leads: 0
    });
    setEditingMetric(null);
    setShowModal(false);
  };

  // Calcular totais
  const totals = metrics.reduce((acc, m) => ({
    verba: acc.verba + (m.verba || 0),
    impressoes: acc.impressoes + (m.impressoes || 0),
    cliques: acc.cliques + (m.cliques || 0),
    pageviews: acc.pageviews + (m.pageviews || 0),
    quiz_inicio: acc.quiz_inicio + (m.quiz_inicio || 0),
    quiz_end: acc.quiz_end + (m.quiz_end || 0),
    leads: acc.leads + (m.leads || 0)
  }), { verba: 0, impressoes: 0, cliques: 0, pageviews: 0, quiz_inicio: 0, quiz_end: 0, leads: 0 });

  const avgCTR = totals.impressoes > 0 ? (totals.cliques / totals.impressoes * 100) : 0;
  const avgCPC = totals.cliques > 0 ? (totals.verba / totals.cliques) : 0;
  const avgCPL = totals.leads > 0 ? (totals.verba / totals.leads) : 0;

  // Preparar dados para o gráfico (agrupados por dia)
  const chartData = metrics
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map(m => ({
      data: new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      leads: m.leads || 0,
      verba: m.verba || 0,
      cpl: m.leads > 0 ? m.verba / m.leads : 0
    }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quiz SE - Funil de Leads</h2>
          <p className="text-gray-600 mt-1">Métricas de Squeeze Page com Quiz</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Métrica
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
            <select
              value={filters.mes}
              onChange={(e) => setFilters({ ...filters, mes: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <select
              value={filters.ano}
              onChange={(e) => setFilters({ ...filters, ano: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campanha</label>
            <input
              type="text"
              value={filters.campanha}
              onChange={(e) => setFilters({ ...filters, campanha: e.target.value })}
              placeholder="Filtrar por nome"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), campanha: '' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando métricas...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard title="Verba Total" value={`R$ ${totals.verba.toFixed(2)}`} color="blue" />
            <KPICard title="Leads" value={totals.leads.toLocaleString()} color="green" />
            <KPICard title="CPL Médio" value={`R$ ${avgCPL.toFixed(2)}`} color="yellow" />
            <KPICard title="CTR Médio" value={`${avgCTR.toFixed(2)}%`} color="purple" />
          </div>

          {/* Gráficos */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Leads */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Leads por Dia</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="leads" fill="#10b981" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de CPL */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 CPL por Dia</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value) => `R$ ${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="cpl" stroke="#f59e0b" strokeWidth={3} name="CPL" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Histórico de Métricas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campanha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Verba</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Impressões</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CPL</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {metrics.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        Nenhuma métrica encontrada. Clique em "Nova Métrica" para adicionar.
                      </td>
                    </tr>
                  ) : (
                    metrics.map((metric) => (
                      <tr key={metric.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(metric.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{metric.campanha_nome}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {metric.verba.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.impressoes.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.leads.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {metric.cpl.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <button
                            onClick={() => handleEdit(metric)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(metric.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de Formulário (simplificado) */}
          {showModal && (
            <QuizSEModal
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              resetForm={resetForm}
              editingMetric={editingMetric}
            />
          )}
        </>
      )}
    </div>
  );
}

// Modal separado para Quiz SE (para não deixar o componente muito grande)
function QuizSEModal({ formData, setFormData, handleSubmit, resetForm, editingMetric }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingMetric ? 'Editar Métrica' : 'Nova Métrica'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha *</label>
                <input
                  type="text"
                  value={formData.campanha_nome}
                  onChange={(e) => setFormData({ ...formData, campanha_nome: e.target.value })}
                  required
                  placeholder="Ex: Quiz - Harmonização Facial"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Métricas de Ads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verba (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.verba}
                    onChange={(e) => setFormData({ ...formData, verba: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impressões *</label>
                  <input
                    type="number"
                    value={formData.impressoes}
                    onChange={(e) => setFormData({ ...formData, impressoes: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliques *</label>
                  <input
                    type="number"
                    value={formData.cliques}
                    onChange={(e) => setFormData({ ...formData, cliques: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Métricas de Conversão</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pageviews</label>
                  <input
                    type="number"
                    value={formData.pageviews}
                    onChange={(e) => setFormData({ ...formData, pageviews: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início de Quiz</label>
                  <input
                    type="number"
                    value={formData.quiz_inicio}
                    onChange={(e) => setFormData({ ...formData, quiz_inicio: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conclusão de Quiz</label>
                  <input
                    type="number"
                    value={formData.quiz_end}
                    onChange={(e) => setFormData({ ...formData, quiz_end: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leads</label>
                  <input
                    type="number"
                    value={formData.leads}
                    onChange={(e) => setFormData({ ...formData, leads: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingMetric ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==================== VENDA DIRETA TAB ====================
function VendaDiretaTab() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [filters, setFilters] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    campanha: ''
  });

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    campanha_nome: '',
    campanha_id: '',
    verba: 0,
    impressoes: 0,
    cliques: 0,
    pageviews: 0,
    leads: 0,
    checkout_inicio: 0,
    vendas: 0,
    receita: 0
  });

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getVendaDiretaMetrics(filters.mes, filters.ano, filters.campanha);
      setMetrics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMetric) {
        await updateVendaDiretaMetrics(editingMetric.id, formData);
      } else {
        await createVendaDiretaMetrics(formData);
      }
      resetForm();
      loadMetrics();
    } catch (error) {
      console.error('Erro ao salvar métrica:', error);
      alert('Erro ao salvar métrica');
    }
  };

  const handleEdit = (metric) => {
    setEditingMetric(metric);
    setFormData({
      data: metric.data,
      campanha_nome: metric.campanha_nome,
      campanha_id: metric.campanha_id || '',
      verba: metric.verba,
      impressoes: metric.impressoes,
      cliques: metric.cliques,
      pageviews: metric.pageviews,
      leads: metric.leads,
      checkout_inicio: metric.checkout_inicio,
      vendas: metric.vendas,
      receita: metric.receita
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta métrica?')) return;
    try {
      await deleteVendaDiretaMetrics(id);
      loadMetrics();
    } catch (error) {
      console.error('Erro ao deletar métrica:', error);
      alert('Erro ao deletar métrica');
    }
  };

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      campanha_nome: '',
      campanha_id: '',
      verba: 0,
      impressoes: 0,
      cliques: 0,
      pageviews: 0,
      leads: 0,
      checkout_inicio: 0,
      vendas: 0,
      receita: 0
    });
    setEditingMetric(null);
    setShowModal(false);
  };

  // Calcular totais
  const totals = metrics.reduce((acc, m) => ({
    verba: acc.verba + (m.verba || 0),
    vendas: acc.vendas + (m.vendas || 0),
    receita: acc.receita + (m.receita || 0)
  }), { verba: 0, vendas: 0, receita: 0 });

  const avgROAS = totals.verba > 0 ? (totals.receita / totals.verba) : 0;
  const avgCPA = totals.vendas > 0 ? (totals.verba / totals.vendas) : 0;
  const avgAOV = totals.vendas > 0 ? (totals.receita / totals.vendas) : 0;

  // Preparar dados para o gráfico
  const chartData = metrics
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map(m => ({
      data: new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      vendas: m.vendas || 0,
      receita: m.receita || 0,
      roas: m.verba > 0 ? (m.receita / m.verba) : 0
    }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Venda Direta - Funil de Vendas</h2>
          <p className="text-gray-600 mt-1">Métricas de Campanhas com Venda Direta</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Métrica
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
            <select
              value={filters.mes}
              onChange={(e) => setFilters({ ...filters, mes: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <select
              value={filters.ano}
              onChange={(e) => setFilters({ ...filters, ano: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campanha</label>
            <input
              type="text"
              value={filters.campanha}
              onChange={(e) => setFilters({ ...filters, campanha: e.target.value })}
              placeholder="Filtrar por nome"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), campanha: '' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando métricas...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard title="Verba Total" value={`R$ ${totals.verba.toFixed(2)}`} color="blue" />
            <KPICard title="Vendas" value={totals.vendas.toLocaleString()} color="green" />
            <KPICard title="Receita Total" value={`R$ ${totals.receita.toFixed(2)}`} color="emerald" />
            <KPICard title="ROAS Médio" value={`${avgROAS.toFixed(2)}x`} color="purple" />
          </div>

          {/* Gráficos */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Vendas */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Vendas e Receita por Dia</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="vendas" fill="#10b981" name="Vendas" />
                    <Bar yAxisId="right" dataKey="receita" fill="#3b82f6" name="Receita (R$)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de ROAS */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 ROAS por Dia</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value) => `${value.toFixed(2)}x`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="roas" stroke="#8b5cf6" strokeWidth={3} name="ROAS" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Histórico de Métricas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campanha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Verba</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vendas</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receita</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROAS</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {metrics.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        Nenhuma métrica encontrada. Clique em "Nova Métrica" para adicionar.
                      </td>
                    </tr>
                  ) : (
                    metrics.map((metric) => (
                      <tr key={metric.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(metric.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{metric.campanha_nome}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {metric.verba.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.vendas.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {metric.receita.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.roas.toFixed(2)}x</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <button
                            onClick={() => handleEdit(metric)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(metric.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de Formulário */}
          {showModal && (
            <VendaDiretaModal
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              resetForm={resetForm}
              editingMetric={editingMetric}
            />
          )}
        </>
      )}
    </div>
  );
}

// Modal para Venda Direta
function VendaDiretaModal({ formData, setFormData, handleSubmit, resetForm, editingMetric }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingMetric ? 'Editar Métrica' : 'Nova Métrica'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha *</label>
                <input
                  type="text"
                  value={formData.campanha_nome}
                  onChange={(e) => setFormData({ ...formData, campanha_nome: e.target.value })}
                  required
                  placeholder="Ex: Venda Direta - Botox"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Métricas de Ads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verba (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.verba}
                    onChange={(e) => setFormData({ ...formData, verba: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impressões *</label>
                  <input
                    type="number"
                    value={formData.impressoes}
                    onChange={(e) => setFormData({ ...formData, impressoes: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliques *</label>
                  <input
                    type="number"
                    value={formData.cliques}
                    onChange={(e) => setFormData({ ...formData, cliques: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Métricas de Conversão</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pageviews</label>
                  <input
                    type="number"
                    value={formData.pageviews}
                    onChange={(e) => setFormData({ ...formData, pageviews: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leads</label>
                  <input
                    type="number"
                    value={formData.leads}
                    onChange={(e) => setFormData({ ...formData, leads: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início de Checkout</label>
                  <input
                    type="number"
                    value={formData.checkout_inicio}
                    onChange={(e) => setFormData({ ...formData, checkout_inicio: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Métricas de Vendas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendas</label>
                  <input
                    type="number"
                    value={formData.vendas}
                    onChange={(e) => setFormData({ ...formData, vendas: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receita (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.receita}
                    onChange={(e) => setFormData({ ...formData, receita: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingMetric ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==================== KPI CARD COMPONENT ====================
function KPICard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]} shadow-sm`}>
      <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default Marketing;
