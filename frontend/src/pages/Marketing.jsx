import React, { useState, useEffect } from 'react';
import {
  getCapturaLeadMetrics,
  getVendaDiretaMetrics,
  syncGoogleSheetsMetrics
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
    { id: 'captura-lead', label: 'Captura de Lead', icon: '📋' }
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
