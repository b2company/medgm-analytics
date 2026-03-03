import React, { useState, useEffect } from 'react';
import {
  getMetaConfig,
  createMetaConfig,
  deleteMetaConfig,
  getMetaCampaigns,
  getMetaInsightsSummary
} from '../services/api';
import KPICardWithProgress from '../components/KPICardWithProgress';
import Modal from '../components/Modal';

const Marketing = () => {
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [formData, setFormData] = useState({
    access_token: '',
    ad_account_id: ''
  });

  // Dados de campanhas e métricas
  const [campaigns, setCampaigns] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [datePreset, setDatePreset] = useState('last_30d');

  useEffect(() => {
    checkConfig();
  }, []);

  useEffect(() => {
    if (config) {
      loadData();
    }
  }, [config, datePreset]);

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
        getMetaCampaigns('ACTIVE'),
        getMetaInsightsSummary(datePreset)
      ]);
      setCampaigns(campaignsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do Meta Ads. Verifique sua configuração.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createMetaConfig(formData);
      setShowConfigModal(false);
      setFormData({ access_token: '', ad_account_id: '' });
      alert('Meta Ads configurado com sucesso!');
      await checkConfig();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert(error.response?.data?.detail || 'Erro ao configurar Meta Ads');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Deseja desconectar do Meta Ads?')) return;
    try {
      await deleteMetaConfig();
      setConfig(null);
      setCampaigns([]);
      setInsights(null);
      alert('Desconectado com sucesso!');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      alert('Erro ao desconectar');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'PAUSED': 'bg-yellow-100 text-yellow-800',
      'ARCHIVED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Tela de configuração inicial
  if (configLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-primary mb-6">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Conecte sua conta Meta Ads
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Para começar a visualizar suas métricas de campanhas do Facebook e Instagram,
            você precisa conectar sua conta Meta Ads.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Como obter suas credenciais:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Acesse <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Graph API Explorer</a></li>
              <li>Selecione seu app em "Meta App"</li>
              <li>Adicione as permissões: <code className="bg-blue-100 px-1 rounded">ads_read</code>, <code className="bg-blue-100 px-1 rounded">ads_management</code></li>
              <li>Clique em "Generate Access Token"</li>
              <li>Copie o token gerado</li>
              <li>Obtenha o ID da sua conta de anúncios (formato: act_XXXXXXXXXX)</li>
            </ol>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
          >
            Configurar Meta Ads
          </button>
        </div>

        {/* Modal de Configuração */}
        <Modal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          title="Configurar Meta Ads"
        >
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token *
              </label>
              <textarea
                value={formData.access_token}
                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary min-h-[100px] font-mono text-sm"
                placeholder="Cole aqui o access token do Graph API Explorer"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Token obtido no Graph API Explorer com permissões ads_read e ads_management
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID da Conta de Anúncios *
              </label>
              <input
                type="text"
                value={formData.ad_account_id}
                onChange={(e) => setFormData({ ...formData, ad_account_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                placeholder="act_XXXXXXXXXX"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Encontre em: Gerenciador de Anúncios → Configurações da Conta
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar e Conectar'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing - Meta Ads</h1>
          <p className="text-gray-600 mt-1">
            Conta: <span className="font-medium">{config.ad_account_name || config.ad_account_id}</span>
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Filtro de Período */}
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
          >
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="last_7d">Últimos 7 dias</option>
            <option value="last_30d">Últimos 30 dias</option>
            <option value="this_month">Este mês</option>
          </select>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : '🔄 Atualizar'}
          </button>

          <button
            onClick={handleDisconnect}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Desconectar
          </button>
        </div>
      </div>

      {/* KPIs Principais */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICardWithProgress
            title="Gastos Totais"
            value={insights.spend}
            formatter={formatCurrency}
            showProgress={false}
            info="Total investido em anúncios no período selecionado"
          />
          <KPICardWithProgress
            title="Impressões"
            value={insights.impressions}
            formatter={formatNumber}
            showProgress={false}
            info="Número total de vezes que seus anúncios foram exibidos"
          />
          <KPICardWithProgress
            title="Cliques"
            value={insights.clicks}
            formatter={formatNumber}
            showProgress={false}
            info="Número total de cliques nos seus anúncios"
          />
          <KPICardWithProgress
            title="CTR"
            value={insights.ctr}
            formatter={formatPercent}
            showProgress={false}
            info="Taxa de cliques (Clicks ÷ Impressões × 100)"
          />
          <KPICardWithProgress
            title="CPC"
            value={insights.cpc}
            formatter={formatCurrency}
            showProgress={false}
            info="Custo por clique (Gastos ÷ Cliques)"
          />
          <KPICardWithProgress
            title="CPM"
            value={insights.cpm}
            formatter={formatCurrency}
            showProgress={false}
            info="Custo por mil impressões"
          />
          <KPICardWithProgress
            title="Alcance"
            value={insights.reach}
            formatter={formatNumber}
            showProgress={false}
            info="Número de pessoas únicas que viram seus anúncios"
          />
          <KPICardWithProgress
            title="Conversões"
            value={insights.conversions}
            formatter={formatNumber}
            showProgress={false}
            info="Total de conversões rastreadas (compras, leads, registros)"
          />
        </div>
      )}

      {/* Tabela de Campanhas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Campanhas Ativas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome da Campanha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objetivo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget Diário
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget Vitalício
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Nenhuma campanha ativa encontrada
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-xs text-gray-500">{campaign.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.objective || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {campaign.daily_budget ? formatCurrency(campaign.daily_budget) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {campaign.lifetime_budget ? formatCurrency(campaign.lifetime_budget) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
