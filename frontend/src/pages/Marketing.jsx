import React, { useState, useEffect } from 'react';
import {
  getMetaConfig,
  createMetaConfig,
  deleteMetaConfig,
  getMetaCampaigns,
  getMetaInsightsSummary
} from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Modal from '../components/Modal';

const Marketing = () => {
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
  const [campanhaFiltro, setCampanhaFiltro] = useState('');

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

  // Filtrar campanhas
  const campanhasFiltradas = campaigns.filter(c =>
    c.name.toLowerCase().includes(campanhaFiltro.toLowerCase())
  );

  if (configLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Marketing - Meta Ads</h1>
        <div className="text-center py-12">Carregando configuração...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Marketing - Meta Ads</h1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Conectar Meta Ads</h2>
            <p className="text-gray-600 mb-6">
              Configure sua integração com Meta Marketing API para visualizar métricas detalhadas de campanhas.
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
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Marketing - Meta Ads</h1>
        <p className="text-gray-600 mt-1">Dashboard completo de campanhas e performance</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todas</option>
              <option value="ACTIVE">Ativas</option>
              <option value="PAUSED">Pausadas</option>
              <option value="ARCHIVED">Arquivadas</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Campanha</label>
            <input
              type="text"
              value={campanhaFiltro}
              onChange={(e) => setCampanhaFiltro(e.target.value)}
              placeholder="Digite o nome da campanha..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm font-medium"
            >
              Desconectar
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Conta: <strong>{config.ad_account_name || config.ad_account_id}</strong>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando métricas...</div>
      ) : (
        <>
          {/* KPI Cards - Resumo Geral */}
          {insights && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumo Geral</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <KPICard title="Gastos Total" value={`R$ ${insights.spend.toFixed(2)}`} color="blue" />
                <KPICard title="Impressões" value={insights.impressions.toLocaleString()} color="purple" />
                <KPICard title="Cliques" value={insights.clicks.toLocaleString()} color="green" />
                <KPICard title="Alcance" value={insights.reach.toLocaleString()} color="cyan" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <KPICard title="CTR" value={`${insights.ctr.toFixed(2)}%`} color="yellow" />
                <KPICard title="CPC" value={`R$ ${insights.cpc.toFixed(2)}`} color="indigo" />
                <KPICard title="CPM" value={`R$ ${insights.cpm.toFixed(2)}`} color="pink" />
                <KPICard title="Conversões" value={insights.conversions || 0} color="orange" />
              </div>
            </>
          )}

          {/* Tabela de Campanhas */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Campanhas Detalhadas</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objetivo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget Diário</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget Vitalício</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campanhasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        {campanhaFiltro ? 'Nenhuma campanha encontrada com esse nome' : 'Nenhuma campanha encontrada'}
                      </td>
                    </tr>
                  ) : (
                    campanhasFiltradas.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="font-medium truncate">{campaign.name}</div>
                          <div className="text-xs text-gray-500 mt-1">ID: {campaign.id}</div>
                        </td>
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
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {campaign.lifetime_budget ? `R$ ${campaign.lifetime_budget.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {campanhasFiltradas.length > 0 && (
            <div className="text-sm text-gray-600 mb-6">
              Mostrando {campanhasFiltradas.length} de {campaigns.length} campanhas
            </div>
          )}
        </>
      )}
    </div>
  );
};

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
