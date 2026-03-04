import React, { useState, useEffect } from 'react';
import {
  getCapturaLeadMetrics,
  getVendaDiretaMetrics,
  syncGoogleSheetsMetrics,
  getMetaAdsPerformance,
  getMetaCampaignsPerformance
} from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area, AreaChart } from 'recharts';

const Marketing = () => {
  const [activeTab, setActiveTab] = useState('venda-direta');
  const [mesAno, setMesAno] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
  });

  const tabs = [
    { id: 'venda-direta', label: 'Venda Direta', icon: '🛒' },
    { id: 'captura-lead', label: 'Captura de Lead', icon: '📋' },
    { id: 'analise-detalhada', label: 'Análise Detalhada (Meta Ads)', icon: '📊' }
  ];

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Marketing - Métricas de Tráfego</h1>
          <p className="text-gray-600 mt-1">Dados importados automaticamente do Google Sheets</p>
        </div>

        {/* Seletor de Mês/Ano */}
        <div className="flex gap-3 items-center">
          <select
            value={mesAno.mes}
            onChange={(e) => setMesAno({ ...mesAno, mes: parseInt(e.target.value) })}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            {meses.map((mes, idx) => (
              <option key={idx} value={idx + 1}>{mes}</option>
            ))}
          </select>
          <input
            type="number"
            value={mesAno.ano}
            onChange={(e) => setMesAno({ ...mesAno, ano: parseInt(e.target.value) })}
            className="border border-gray-300 rounded-lg px-4 py-2 w-28"
          />
        </div>
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
      {activeTab === 'venda-direta' && <VendaDiretaTab mesAno={mesAno} />}
      {activeTab === 'captura-lead' && <CapturaLeadTab mesAno={mesAno} />}
      {activeTab === 'analise-detalhada' && <AnáliseDetalhadaTab />}
    </div>
  );
};

// ==================== VENDA DIRETA TAB ====================
function VendaDiretaTab({ mesAno }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, [mesAno.mes, mesAno.ano]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getVendaDiretaMetrics(mesAno.mes, mesAno.ano);
      setData(response);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncGoogleSheetsMetrics();
      await loadData();
      alert('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando métricas...</div>;
  }

  if (!data || !data.dados_diarios || data.dados_diarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum dado encontrado</h3>
        <p className="text-gray-600 mb-4">
          Não há dados de Venda Direta para {mesAno.mes}/{mesAno.ano}
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {syncing ? 'Sincronizando...' : '🔄 Sincronizar Google Sheets'}
        </button>
      </div>
    );
  }

  const totais = data.totais || {};

  return (
    <div>
      {/* Botão de Sincronização */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <span>{syncing ? '⏳' : '🔄'}</span>
          {syncing ? 'Sincronizando...' : 'Sincronizar Google Sheets'}
        </button>
      </div>

      {/* Visão geral das métricas */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Visão geral das métricas</h2>
      <div className="grid grid-cols-5 gap-4 mb-8">
        <MetricCard label="Valor Gasto" value={`R$ ${totais.valor_gasto?.toFixed(2) || '0,00'}`} />
        <MetricCard label="Vendas" value={totais.vendas || 0} />
        <MetricCard label="CPA" value={`R$ ${totais.cpa?.toFixed(2) || '0,00'}`} subtitle="Custo por Venda" />
        <MetricCard label="CTR" value={`${totais.ctr?.toFixed(2) || 0}%`} subtitle="Taxa de Cliques" />
        <MetricCard label="Init. Checkout" value={totais.init_checkout || 0} subtitle="Iniciaram Checkout" />
      </div>

      {/* Gráficos */}
      {data.dados_diarios.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Visão diária das métricas</h2>
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Gráfico principal: Valor Gasto + Vendas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Valor Gasto e Vendas por Dia</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data.dados_diarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'Valor Gasto') return `R$ ${value.toFixed(2)}`;
                    return value;
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="valor_gasto" fill="#3b82f6" name="Valor Gasto" />
                  <Line yAxisId="right" type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={2} name="Vendas" dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Gráficos secundários */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">CPA (Custo por Venda)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.dados_diarios}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="cpa" stroke="#f59e0b" strokeWidth={2} name="CPA" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">CTR (Taxa de Cliques)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.dados_diarios}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="ctr" stroke="#8b5cf6" fill="#ede9fe" name="CTR (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Nota sobre Google Sheets */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>📊 Fonte de Dados:</strong> Dados importados automaticamente da planilha Google Sheets
          <strong> [ISCA] [SCRIPT] Métricas de Trafego</strong>.
          Atualize a planilha e clique em "Sincronizar" para ver os dados mais recentes.
        </p>
      </div>
    </div>
  );
}

// ==================== CAPTURA LEAD TAB ====================
function CapturaLeadTab({ mesAno }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, [mesAno.mes, mesAno.ano]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getCapturaLeadMetrics(mesAno.mes, mesAno.ano);
      setData(response);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncGoogleSheetsMetrics();
      await loadData();
      alert('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando métricas...</div>;
  }

  if (!data || !data.dados_diarios || data.dados_diarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum dado encontrado</h3>
        <p className="text-gray-600 mb-4">
          Não há dados de Captura de Lead para {mesAno.mes}/{mesAno.ano}
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {syncing ? 'Sincronizando...' : '🔄 Sincronizar Google Sheets'}
        </button>
      </div>
    );
  }

  const totais = data.totais || {};
  const conversionRate = totais.impressoes > 0 ? (totais.leads / totais.impressoes) * 100 : 0;

  return (
    <div>
      {/* Botão de Sincronização */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <span>{syncing ? '⏳' : '🔄'}</span>
          {syncing ? 'Sincronizando...' : 'Sincronizar Google Sheets'}
        </button>
      </div>

      {/* Visão geral das métricas */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Visão geral das métricas</h2>
      <div className="grid grid-cols-6 gap-4 mb-8">
        <MetricCard label="Leads" value={totais.leads || 0} />
        <MetricCard label="Valor Gasto" value={`R$ ${totais.valor_gasto?.toFixed(2) || '0,00'}`} />
        <MetricCard label="CTR" value={`${totais.ctr?.toFixed(2) || 0}%`} />
        <MetricCard label="CPM" value={`R$ ${totais.cpm?.toFixed(2) || '0,00'}`} />
        <MetricCard label="Taxa de Conversão" value={`${conversionRate.toFixed(2)}%`} />
        <MetricCard label="CPL" value={`R$ ${totais.cpl?.toFixed(2) || '0,00'}`} />
      </div>

      {/* Gráficos */}
      {data.dados_diarios.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Visão diária das métricas</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Leads por dia */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Leads por dia</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.dados_diarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Valor gasto */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Valor gasto</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.dados_diarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                  <Area type="monotone" dataKey="valor_gasto" stroke="#f59e0b" fill="#fef3c7" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* CPL */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">CPL (Custo por Lead)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.dados_diarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="cpl" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* CTR */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">CTR (Taxa de Cliques)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.dados_diarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  <Area type="monotone" dataKey="ctr" stroke="#06b6d4" fill="#cffafe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Nota sobre Google Sheets */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>📊 Fonte de Dados:</strong> Dados importados automaticamente da planilha Google Sheets
          <strong> [QUIZ] [SE] Métricas de Trafego</strong>.
          Atualize a planilha e clique em "Sincronizar" para ver os dados mais recentes.
        </p>
      </div>
    </div>
  );
}

// ==================== ANÁLISE DETALHADA (META ADS) TAB ====================
function AnáliseDetalhadaTab() {
  const [loading, setLoading] = useState(true);
  const [adsData, setAdsData] = useState(null);
  const [campaignsData, setCampaignsData] = useState(null);
  const [datePreset, setDatePreset] = useState('last_30d');
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState([]);
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [datePreset]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (campaignDropdownOpen && !event.target.closest('.relative')) {
        setCampaignDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [campaignDropdownOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ads, campaigns] = await Promise.all([
        getMetaAdsPerformance(datePreset),
        getMetaCampaignsPerformance(datePreset)
      ]);
      console.log('Dados do Meta Ads carregados:', { ads, campaigns });
      setAdsData(ads);
      setCampaignsData(campaigns);
    } catch (error) {
      console.error('Erro detalhado ao carregar Meta Ads:', error);
      console.error('Response:', error.response);
      const errorMsg = error.response?.data?.detail || error.message || 'Erro desconhecido';
      setError(`Erro: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando dados do Meta Ads...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">⚠️ {error}</div>
        <p className="text-sm text-gray-600">Configure o Meta Ads na página de Configurações.</p>
      </div>
    );
  }

  const datePresetOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last_7d', label: 'Últimos 7 dias' },
    { value: 'last_30d', label: 'Últimos 30 dias' },
    { value: 'this_month', label: 'Este mês' }
  ];

  // Aplicar filtros nos dados
  const filteredAds = adsData?.ads?.filter(ad => {
    if (statusFilter !== 'all' && ad.status !== statusFilter) return false;
    if (campaignFilter.length > 0 && !campaignFilter.includes(ad.campaign_name)) return false;
    return true;
  }).slice(0, topN) || [];

  const filteredCampaigns = campaignsData?.campaigns?.filter(campaign => {
    if (statusFilter !== 'all' && campaign.status !== statusFilter) return false;
    if (campaignFilter.length > 0 && !campaignFilter.includes(campaign.name)) return false;
    return true;
  }) || [];

  // Handler para toggle de campanha
  const toggleCampaign = (campaignName) => {
    if (campaignFilter.includes(campaignName)) {
      setCampaignFilter(campaignFilter.filter(c => c !== campaignName));
    } else {
      setCampaignFilter([...campaignFilter, campaignName]);
    }
  };

  // Extrair lista de campanhas únicas para o filtro
  const uniqueCampaigns = [...new Set(adsData?.ads?.map(ad => ad.campaign_name) || [])];

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Análise Detalhada - Meta Ads</h2>

        <div className="flex gap-3 flex-wrap items-center bg-gray-50 p-4 rounded-lg">
          {/* Período */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Período</label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {datePresetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Top N */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mostrar Top</label>
            <select
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="ACTIVE">Ativos</option>
              <option value="PAUSED">Pausados</option>
              <option value="CAMPAIGN_PAUSED">Camp. Pausada</option>
            </select>
          </div>

          {/* Campanhas (Multi-select Dropdown) */}
          <div className="relative">
            <label className="block text-xs text-gray-600 mb-1">Campanhas</label>
            <button
              onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 flex items-center justify-between min-w-[200px]"
            >
              <span className="truncate">
                {campaignFilter.length === 0
                  ? 'Todas as campanhas'
                  : `${campaignFilter.length} selecionada${campaignFilter.length > 1 ? 's' : ''}`}
              </span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {campaignDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                <div className="p-2 space-y-1">
                  <label className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={campaignFilter.length === 0}
                      onChange={() => setCampaignFilter([])}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Todas as campanhas</span>
                  </label>
                  <div className="border-t border-gray-200 my-1"></div>
                  {uniqueCampaigns.map((campaign) => (
                    <label key={campaign} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={campaignFilter.includes(campaign)}
                        onChange={() => toggleCampaign(campaign)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 truncate">{campaign}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contador */}
          <div className="ml-auto">
            <div className="text-sm text-gray-600">
              Mostrando <strong>{filteredAds.length}</strong> de {adsData?.total_ads || 0} anúncios
            </div>
          </div>
        </div>
      </div>

      {/* Análise por Campanha/Público */}
      <div className="mb-8">
        <h3 className="text-md font-semibold text-gray-800 mb-4">📊 Análise por Campanha/Público</h3>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campanha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Gasto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversões</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CPA</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROAS</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTR</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{campaign.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">R$ {campaign.valor_gasto.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right">{campaign.conversoes}</td>
                    <td className="px-4 py-3 text-sm text-right">R$ {campaign.cpa.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right">{campaign.roas.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right">{campaign.ctr.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Análise por Criativo */}
      <div className="mb-8">
        <h3 className="text-md font-semibold text-gray-800 mb-4">🎨 Análise por Criativo</h3>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criativo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Gasto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversões</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receita</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CPA</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROAS</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Link</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{ad.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ad.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        ad.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">R$ {ad.valor_gasto.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right">{ad.conversoes}</td>
                    <td className="px-4 py-3 text-sm text-right">R$ {ad.receita.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right">R$ {ad.cpa.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{ad.roas.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {ad.post_link && (
                        <a href={ad.post_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          🔗 Ver
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Nota sobre Meta Ads */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>📊 Fonte de Dados:</strong> Dados importados automaticamente da Meta Ads API (Facebook/Instagram).
          Os dados são atualizados em tempo real quando você seleciona um novo período.
        </p>
      </div>
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
