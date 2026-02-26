import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import DataTable from '../components/DataTable';
import ComparisonBadge from '../components/ComparisonBadge';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import AlertBox from '../components/AlertBox';
import FluxoCaixaChart from '../components/FluxoCaixaChart';
import Modal from '../components/Modal';
import FinanceiroForm from '../components/FinanceiroForm';
import VendaForm from '../components/VendaForm';
import ProgressBar from '../components/ProgressBar';
import FunilCompleto from '../components/FunilCompleto';
import PainelRealTime from '../components/PainelRealTime';
import ProjecaoCaixa from '../components/ProjecaoCaixa';
import {
  getFinanceiroDetalhado,
  getComercialDetalhado,
  getInteligenciaDetalhado,
  getFluxoCaixa,
  createFinanceiro,
  updateFinanceiro,
  deleteFinanceiro,
  createVenda,
  updateVenda,
  deleteVenda,
  getMetaEmpresa,
  calcularAcumuladoEmpresa,
  getFunilCompleto,
  getMetas
} from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSubTabFromURL = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'visao-geral';
  };

  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromURL());
  const [activeTab, setActiveTab] = useState('financeiro');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [modoTV, setModoTV] = useState(false);

  const [dataFinanceiro, setDataFinanceiro] = useState(null);
  const [dataComercial, setDataComercial] = useState(null);
  const [dataInteligencia, setDataInteligencia] = useState(null);
  const [dataFluxoCaixa, setDataFluxoCaixa] = useState(null);
  const [metaEmpresa, setMetaEmpresa] = useState(null);

  // Dados para modo TV
  const [dadosFunil, setDadosFunil] = useState(null);
  const [dadosClosers, setDadosClosers] = useState(null);
  const [metas, setMetas] = useState([]);

  // Estados para modais CRUD
  const [showFinanceiroModal, setShowFinanceiroModal] = useState(false);
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [editingFinanceiro, setEditingFinanceiro] = useState(null);
  const [editingVenda, setEditingVenda] = useState(null);

  useEffect(() => {
    setActiveSubTab(getSubTabFromURL());
  }, [location.hash]);

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    navigate(`/dashboard#${tab}`);
  };

  useEffect(() => {
    loadData();
  }, [mes, ano, activeTab, modoTV]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Sempre carregar meta empresa
      try {
        await calcularAcumuladoEmpresa(ano);
        const empresaRes = await getMetaEmpresa(ano);
        setMetaEmpresa(empresaRes);
      } catch (e) {
        console.warn('Erro ao carregar meta empresa:', e);
      }

      // Carregar dados para modo TV
      if (modoTV) {
        try {
          const [funilRes, closersRes, metasRes] = await Promise.all([
            getFunilCompleto(mes, ano, 'geral'),
            getFunilCompleto(mes, ano, 'por_closer'),
            getMetas(mes, ano)
          ]);
          setDadosFunil(funilRes);
          setDadosClosers(closersRes);
          setMetas(metasRes.metas || []);
        } catch (e) {
          console.warn('Erro ao carregar dados TV:', e);
        }
      }

      if (activeTab === 'financeiro') {
        const fin = await getFinanceiroDetalhado(mes, ano);
        setDataFinanceiro(fin);
        const fluxo = await getFluxoCaixa(6, mes, ano);
        setDataFluxoCaixa(fluxo);
      } else if (activeTab === 'comercial') {
        const com = await getComercialDetalhado(mes, ano);
        setDataComercial(com);
      } else if (activeTab === 'inteligencia') {
        const intel = await getInteligenciaDetalhado(mes, ano);
        setDataInteligencia(intel);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== CRUD FINANCEIRO ====================

  const handleCreateFinanceiro = async (formData) => {
    try {
      await createFinanceiro(formData);
      setShowFinanceiroModal(false);
      await loadData();
      alert('Transacao criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar transacao:', error);
      alert('Erro ao criar transacao. Verifique os dados e tente novamente.');
    }
  };

  const handleEditFinanceiro = (item) => {
    setEditingFinanceiro({
      id: item.id,
      tipo: item.tipo,
      categoria: item.categoria,
      descricao: item.descricao || '',
      valor: item.valor.toString(),
      data: item.data,
      previsto_realizado: item.previsto_realizado
    });
    setShowFinanceiroModal(true);
  };

  const handleUpdateFinanceiro = async (formData) => {
    try {
      const { id, ...updateData } = editingFinanceiro;
      await updateFinanceiro(id, { ...updateData, ...formData });
      setShowFinanceiroModal(false);
      setEditingFinanceiro(null);
      await loadData();
      alert('Transacao atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar transacao:', error);
      alert('Erro ao atualizar transacao. Verifique os dados e tente novamente.');
    }
  };

  const handleDeleteFinanceiro = async (item) => {
    if (!window.confirm(`Deseja realmente deletar a transacao de ${formatCurrency(item.valor)}?`)) {
      return;
    }
    try {
      await deleteFinanceiro(item.id);
      await loadData();
      alert('Transacao deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar transacao:', error);
      alert('Erro ao deletar transacao. Tente novamente.');
    }
  };

  // ==================== CRUD VENDA ====================

  const handleCreateVenda = async (formData) => {
    try {
      await createVenda(formData);
      setShowVendaModal(false);
      await loadData();
      alert('Venda criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      alert('Erro ao criar venda. Verifique os dados e tente novamente.');
    }
  };

  const handleEditVenda = (item) => {
    setEditingVenda({
      id: item.id,
      cliente: item.cliente,
      valor: item.valor.toString(),
      funil: item.funil || '',
      vendedor: item.vendedor || '',
      data: item.data
    });
    setShowVendaModal(true);
  };

  const handleUpdateVenda = async (formData) => {
    try {
      const { id, ...updateData } = editingVenda;
      await updateVenda(id, { ...updateData, ...formData });
      setShowVendaModal(false);
      setEditingVenda(null);
      await loadData();
      alert('Venda atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      alert('Erro ao atualizar venda. Verifique os dados e tente novamente.');
    }
  };

  const handleDeleteVenda = async (item) => {
    if (!window.confirm(`Deseja realmente deletar a venda de ${item.cliente}?`)) {
      return;
    }
    try {
      await deleteVenda(item.id);
      await loadData();
      alert('Venda deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
      alert('Erro ao deletar venda. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setShowFinanceiroModal(false);
    setShowVendaModal(false);
    setEditingFinanceiro(null);
    setEditingVenda(null);
  };

  // ==================== EXPORT ====================

  const handleExport = (tipo) => {
    let url = '';
    switch (tipo) {
      case 'financeiro':
        url = `${API_URL}/export/financeiro?mes=${mes}&ano=${ano}`;
        break;
      case 'vendas':
        url = `${API_URL}/export/vendas?mes=${mes}&ano=${ano}`;
        break;
      case 'completo':
        url = `${API_URL}/export/completo?mes=${mes}&ano=${ano}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank');
    setShowExportModal(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Marco' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const getMesNome = (mesNum) => {
    return meses.find(m => m.value === mesNum)?.label || '';
  };

  const formatShortCurrency = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  // Preparar dados para grafico de closers (modo TV)
  const closersChartData = dadosClosers?.closers
    ? Object.entries(dadosClosers.closers).map(([nome, dados]) => ({
        name: nome,
        Faturamento: dados.faturamento || 0
      })).slice(0, 5)
    : [];

  // ==================== COMPONENTE MODO TV ====================
  if (modoTV && activeSubTab === 'modo-tv') {
    return (
      <div className="fixed inset-0 bg-gray-50 overflow-auto z-50 p-6">
        {/* Header do Modo TV */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Dashboard Executivo - {getMesNome(mes)} {ano}
            </h2>
            {loading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            )}
          </div>
          <button
            onClick={() => { setModoTV(false); handleSubTabChange('visao-geral'); }}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Sair do Modo TV
          </button>
        </div>

        {/* Grid 2x2 do Modo TV */}
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Q1: Funil de Conversao */}
          <div className="bg-white rounded-lg shadow p-6 overflow-auto flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Funil de Conversao</h2>
            <div className="flex-1 flex items-center justify-center">
              {dadosFunil ? (
                <div className="w-full">
                  <FunilCompleto dados={dadosFunil} agrupamento="geral" />
                </div>
              ) : (
                <div className="text-center text-gray-400 text-lg">
                  Sem dados para exibir
                </div>
              )}
            </div>
          </div>

          {/* Q2: Top Closers */}
          <div className="bg-white rounded-lg shadow p-6 overflow-auto flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Top Closers</h2>
            <div className="flex-1 flex items-center justify-center">
              {closersChartData.length > 0 ? (
                <div className="w-full h-full">
                  <BarChart
                    data={closersChartData}
                    dataKey="Faturamento"
                    color="#3B82F6"
                    horizontal={true}
                    height={400}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400 text-lg">
                  Sem dados de closers
                </div>
              )}
            </div>
          </div>

          {/* Q3: Metas do Mes */}
          <div className="bg-white rounded-lg shadow p-6 overflow-auto flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Metas do Mes</h2>
            <div className="flex-1">
              {metas.length > 0 ? (
                <div className="space-y-4">
                  {metas.slice(0, 10).map(meta => (
                    <div key={meta.id} className="flex items-center gap-4">
                      <div className="w-32 text-base font-medium text-gray-700 truncate">
                        {meta.pessoa?.nome || '-'}
                      </div>
                      <div className="flex-1">
                        <ProgressBar
                          value={meta.perc_atingimento || 0}
                          max={100}
                          showPercentage={false}
                          color="auto"
                          size="lg"
                        />
                      </div>
                      <span className={`text-lg font-bold w-16 text-right ${
                        (meta.perc_atingimento || 0) >= 100 ? 'text-green-600' :
                        (meta.perc_atingimento || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(meta.perc_atingimento || 0).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-gray-400 text-lg">
                  Nenhuma meta cadastrada para este mes
                </div>
              )}
            </div>
          </div>

          {/* Q4: Resultado do Mes */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Resultado do Mes - {getMesNome(mes)} {ano}</h2>
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {/* Faturamento Mensal */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-base font-medium text-gray-700">Meta Mensal</span>
                  <span className="text-base font-bold text-gray-900">
                    {formatShortCurrency(metaEmpresa?.meta_faturamento_anual / 12 || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-medium text-gray-700">Realizado</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatShortCurrency(dataComercial?.faturamento_total || 0)}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${Math.min(((dataComercial?.faturamento_total || 0) / (metaEmpresa?.meta_faturamento_anual / 12 || 1)) * 100, 100)}%`, minWidth: '50px' }}
                    >
                      <span className="text-sm font-bold text-white">
                        {(((dataComercial?.faturamento_total || 0) / (metaEmpresa?.meta_faturamento_anual / 12 || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
        ))}
      </div>
      <div className="bg-gray-200 h-64 rounded-lg"></div>
      <div className="bg-gray-200 h-96 rounded-lg"></div>
    </div>
  );

  // Empty State
  const EmptyState = ({ message }) => (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado encontrado</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header com filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard - Dados Reais</h1>
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
          >
            {meses.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          <button
            onClick={() => { setModoTV(true); handleSubTabChange('modo-tv'); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Modo TV
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      {/* Sub-tabs do Dashboard */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'visao-geral', label: 'Visão Geral' },
            { id: 'modo-tv', label: 'Modo TV' },
            { id: 'meta-anual', label: 'Meta Anual' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSubTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Cards Meta Anual */}
      {metaEmpresa && (activeSubTab === 'visao-geral' || activeSubTab === 'meta-anual') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-lg shadow text-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm opacity-90">Meta Faturamento {ano}</div>
                <div className="text-2xl font-bold">
                  R$ {((metaEmpresa.faturamento_acumulado || 0) / 1000000).toFixed(2)}M
                  <span className="text-lg font-normal opacity-80">
                    {' '}/ R$ {((metaEmpresa.meta_faturamento_anual || 5000000) / 1000000).toFixed(0)}M
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {(metaEmpresa.perc_faturamento || 0).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metaEmpresa.perc_faturamento || 0, 100)}%` }}
              />
            </div>
          </div>

          <div className={`p-5 rounded-lg shadow text-white ${
            (metaEmpresa.caixa_atual || 0) >= 0
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm opacity-90">Meta Caixa {ano}</div>
                <div className="text-2xl font-bold">
                  R$ {((metaEmpresa.caixa_atual || 0) / 1000000).toFixed(2)}M
                  <span className="text-lg font-normal opacity-80">
                    {' '}/ R$ {((metaEmpresa.meta_caixa_anual || 1000000) / 1000000).toFixed(0)}M
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {(metaEmpresa.perc_caixa || 0).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.abs(metaEmpresa.perc_caixa || 0), 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Visão Geral (padrão) */}
      {activeSubTab === 'visao-geral' && (
        <>
          {/* Painel Real-Time */}
          {dataFinanceiro && dataComercial && (
            <PainelRealTime
              dataFinanceiro={dataFinanceiro}
              dataComercial={dataComercial}
              metaEmpresa={metaEmpresa}
              mes={mes}
              ano={ano}
            />
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {['financeiro', 'comercial', 'inteligencia'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* ==================== DASHBOARD FINANCEIRO ==================== */}
              {activeTab === 'financeiro' && dataFinanceiro && (
            <div className="space-y-6">
              {/* Botao Nova Transacao */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFinanceiroModal(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2 transition-colors"
                >
                  <span className="text-xl">+</span>
                  Nova Transacao
                </button>
              </div>

              {/* Cards no Topo com Comparacao */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Saldo Atual</div>
                  <div className={`text-2xl font-bold ${dataFinanceiro.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(dataFinanceiro.saldo)}
                  </div>
                  <div className="mt-2">
                    <ComparisonBadge value={dataFinanceiro.comparacao_mes_anterior?.variacao_saldo_pct || 0} size="sm" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Total Entradas</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(dataFinanceiro.total_entradas)}</div>
                  <div className="mt-2">
                    <ComparisonBadge value={dataFinanceiro.comparacao_mes_anterior?.variacao_entradas_pct || 0} size="sm" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Total Saidas</div>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(dataFinanceiro.total_saidas)}</div>
                  <div className="mt-2">
                    <ComparisonBadge value={dataFinanceiro.comparacao_mes_anterior?.variacao_saidas_pct || 0} size="sm" invertColors />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Margem Liquida</div>
                  <div className="text-2xl font-bold text-blue-600">{(dataFinanceiro.dre?.margem_liquida_pct || 0).toFixed(1)}%</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Lucro: {formatCurrency(dataFinanceiro.dre?.lucro_liquido || 0)}
                  </div>
                </div>
              </div>

              {/* Receita Recorrente */}
              {dataFinanceiro.receita_recorrente && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Receita Recorrente (MRR)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">MRR</div>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(dataFinanceiro.receita_recorrente.mrr)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Receita Nova</div>
                      <div className="text-xl font-bold text-blue-600">
                        {formatCurrency(dataFinanceiro.receita_recorrente.receita_nova)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">% Recorrente</div>
                      <div className="text-xl font-bold text-gray-900">
                        {(dataFinanceiro.receita_recorrente.pct_recorrente || 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grafico de Fluxo de Caixa */}
              {dataFluxoCaixa && dataFluxoCaixa.fluxo && dataFluxoCaixa.fluxo.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Fluxo de Caixa - Ultimos 6 Meses</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Acompanhe a evolucao das entradas, saidas e saldo acumulado ao longo do tempo.
                  </p>
                  <FluxoCaixaChart data={dataFluxoCaixa.fluxo} />
                </div>
              )}

              {/* Projeção de Caixa */}
              <ProjecaoCaixa mes={mes} ano={ano} />

              {/* Graficos de Pizza */}
              {(Object.keys(dataFinanceiro.entradas_por_categoria || {}).length > 0 ||
                Object.keys(dataFinanceiro.saidas_por_categoria || {}).length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.keys(dataFinanceiro.entradas_por_categoria || {}).length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-bold mb-4">Entradas por Categoria</h3>
                      <PieChart
                        data={Object.entries(dataFinanceiro.entradas_por_categoria).map(([cat, valor]) => ({
                          name: cat,
                          value: valor
                        }))}
                        dataKey="value"
                        nameKey="name"
                        height={300}
                      />
                    </div>
                  )}

                  {Object.keys(dataFinanceiro.saidas_por_categoria || {}).length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-bold mb-4">Saidas por Categoria</h3>
                      <PieChart
                        data={Object.entries(dataFinanceiro.saidas_por_categoria).map(([cat, valor]) => ({
                          name: cat,
                          value: valor
                        }))}
                        dataKey="value"
                        nameKey="name"
                        height={300}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* DRE Simplificado */}
              {dataFinanceiro.dre && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">DRE Simplificado</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Receita Total</span>
                      <span className="font-bold text-green-600">{formatCurrency(dataFinanceiro.dre.receita_total)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">(-) Custos Diretos</span>
                      <span className="text-red-600">{formatCurrency(dataFinanceiro.dre.custos_diretos)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b bg-gray-50 px-2 rounded">
                      <span className="font-semibold">(=) Margem Bruta</span>
                      <span className="font-bold">
                        {formatCurrency(dataFinanceiro.dre.margem_bruta)}
                        <span className="text-sm text-gray-500 ml-2">
                          ({(dataFinanceiro.dre.margem_bruta_pct || 0).toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">(-) Custos Fixos</span>
                      <span className="text-red-600">{formatCurrency(dataFinanceiro.dre.custos_fixos)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-blue-50 px-2 rounded">
                      <span className="font-bold text-lg">(=) Lucro Liquido</span>
                      <span className={`font-bold text-lg ${dataFinanceiro.dre.lucro_liquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(dataFinanceiro.dre.lucro_liquido)}
                        <span className="text-sm text-gray-600 ml-2">
                          ({(dataFinanceiro.dre.margem_liquida_pct || 0).toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabelas de Entradas e Saidas */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Entradas Detalhadas - {getMesNome(mes)} {ano}</h3>
                {dataFinanceiro.entradas && dataFinanceiro.entradas.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'data', label: 'Data', format: 'date', sortable: true },
                      { key: 'categoria', label: 'Categoria', sortable: true },
                      { key: 'descricao', label: 'Descricao', sortable: false },
                      { key: 'valor', label: 'Valor', format: 'currency', align: 'right', sortable: true, showTotal: true }
                    ]}
                    data={dataFinanceiro.entradas}
                    showTotal={true}
                    totalLabel="TOTAL"
                    showActions={true}
                    onEdit={handleEditFinanceiro}
                    onDelete={handleDeleteFinanceiro}
                  />
                ) : (
                  <EmptyState message="Nenhuma entrada registrada neste mes." />
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Saidas Detalhadas - {getMesNome(mes)} {ano}</h3>
                {dataFinanceiro.saidas && dataFinanceiro.saidas.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'data', label: 'Data', format: 'date', sortable: true },
                      { key: 'categoria', label: 'Categoria', sortable: true },
                      { key: 'descricao', label: 'Descricao', sortable: false },
                      { key: 'valor', label: 'Valor', format: 'currency', align: 'right', sortable: true, showTotal: true }
                    ]}
                    data={dataFinanceiro.saidas}
                    showTotal={true}
                    totalLabel="TOTAL"
                    showActions={true}
                    onEdit={handleEditFinanceiro}
                    onDelete={handleDeleteFinanceiro}
                  />
                ) : (
                  <EmptyState message="Nenhuma saida registrada neste mes." />
                )}
              </div>
            </div>
          )}

          {/* ==================== DASHBOARD COMERCIAL ==================== */}
          {activeTab === 'comercial' && dataComercial && (
            <div className="space-y-6">
              {/* Botao Nova Venda */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowVendaModal(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2 transition-colors"
                >
                  <span className="text-xl">+</span>
                  Nova Venda
                </button>
              </div>

              {/* Cards no Topo com Comparacao */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Faturamento Total</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(dataComercial.faturamento_total)}</div>
                  <div className="mt-2">
                    <ComparisonBadge value={dataComercial.comparacao_mes_anterior?.variacao_faturamento_pct || 0} size="sm" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Quantidade de Vendas</div>
                  <div className="text-2xl font-bold text-blue-600">{dataComercial.total_vendas}</div>
                  <div className="mt-2">
                    <ComparisonBadge value={dataComercial.comparacao_mes_anterior?.variacao_vendas_pct || 0} size="sm" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Ticket Medio</div>
                  <div className="text-2xl font-bold text-yellow-600">{formatCurrency(dataComercial.ticket_medio)}</div>
                  <div className="mt-2">
                    <ComparisonBadge value={dataComercial.comparacao_mes_anterior?.variacao_ticket_pct || 0} size="sm" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Melhor Vendedor</div>
                  <div className="text-lg font-bold text-gray-900">
                    {dataComercial.melhor_vendedor?.vendedor || '-'}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {dataComercial.melhor_vendedor && formatCurrency(dataComercial.melhor_vendedor.valor_total)}
                  </div>
                </div>
              </div>

              {/* Comparacao Mes Anterior */}
              {dataComercial.comparacao_mes_anterior && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-900">
                    <strong>{getMesNome(mes)} {ano}</strong> vs{' '}
                    <strong>{getMesNome(dataComercial.comparacao_mes_anterior.mes_anterior)} {dataComercial.comparacao_mes_anterior.ano_anterior}</strong>
                    {': '}
                    <ComparisonBadge value={dataComercial.comparacao_mes_anterior.variacao_vendas_pct} size="sm" /> vendas,{' '}
                    <ComparisonBadge value={dataComercial.comparacao_mes_anterior.variacao_faturamento_pct} size="sm" /> faturamento
                  </p>
                </div>
              )}

              {/* Graficos */}
              {(dataComercial.por_vendedor?.length > 0 || dataComercial.por_canal?.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dataComercial.por_vendedor?.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-bold mb-4">Faturamento por Vendedor</h3>
                      <BarChart
                        data={dataComercial.por_vendedor.map(v => ({
                          name: v.vendedor,
                          Valor: v.valor_total
                        }))}
                        dataKey="Valor"
                        color="#3B82F6"
                        horizontal={true}
                      />
                    </div>
                  )}

                  {dataComercial.por_canal?.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-bold mb-4">Vendas por Canal/Funil</h3>
                      <PieChart
                        data={dataComercial.por_canal.map(c => ({
                          name: c.canal,
                          value: c.valor_total
                        }))}
                        dataKey="value"
                        nameKey="name"
                        height={350}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tabela de Vendas */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Todas as Vendas - {getMesNome(mes)} {ano}</h3>
                {dataComercial.vendas?.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'data', label: 'Data', format: 'date', sortable: true },
                      { key: 'cliente', label: 'Cliente', sortable: true, bold: true },
                      { key: 'valor', label: 'Valor', format: 'currency', align: 'right', sortable: true, showTotal: true },
                      { key: 'funil', label: 'Funil/Canal', sortable: true },
                      { key: 'vendedor', label: 'Vendedor', sortable: true }
                    ]}
                    data={dataComercial.vendas}
                    showTotal={true}
                    totalLabel="TOTAL"
                    showActions={true}
                    onEdit={handleEditVenda}
                    onDelete={handleDeleteVenda}
                  />
                ) : (
                  <EmptyState message="Nenhuma venda registrada neste mes." />
                )}
              </div>

              {/* Performance por Vendedor */}
              {dataComercial.por_vendedor?.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Performance por Vendedor</h3>
                  <DataTable
                    columns={[
                      { key: 'vendedor', label: 'Vendedor', sortable: true, bold: true },
                      { key: 'qtd_vendas', label: 'Qtd Vendas', format: 'number', align: 'center', sortable: true },
                      { key: 'valor_total', label: 'Valor Total', format: 'currency', align: 'right', sortable: true, showTotal: true },
                      { key: 'ticket_medio', label: 'Ticket Medio', format: 'currency', align: 'right', sortable: true },
                      { key: 'pct_total', label: '% do Total', format: 'percent', align: 'right', sortable: true }
                    ]}
                    data={dataComercial.por_vendedor}
                    showTotal={false}
                  />
                </div>
              )}
            </div>
          )}

          {/* ==================== DASHBOARD INTELIGENCIA ==================== */}
          {activeTab === 'inteligencia' && dataInteligencia && (
            <div className="space-y-6">
              {/* Alertas Acionaveis */}
              {dataInteligencia.alertas && dataInteligencia.alertas.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Alertas Acionaveis</h3>
                  {dataInteligencia.alertas.map((alerta, idx) => (
                    <AlertBox
                      key={idx}
                      type={alerta.tipo}
                      title={alerta.titulo}
                      message={alerta.mensagem}
                    />
                  ))}
                </div>
              )}

              {/* CAC por Canal */}
              {dataInteligencia.cac_por_canal?.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">CAC por Canal</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Identifique qual canal e mais eficiente em custo de aquisicao.
                  </p>
                  <DataTable
                    columns={[
                      { key: 'canal', label: 'Canal', sortable: true, bold: true },
                      { key: 'investimento', label: 'Investimento MKT', format: 'currency', align: 'right', sortable: true },
                      { key: 'vendas', label: 'Vendas', format: 'number', align: 'center', sortable: true },
                      { key: 'receita', label: 'Receita', format: 'currency', align: 'right', sortable: true },
                      { key: 'cac', label: 'CAC', format: 'currency', align: 'right', sortable: true },
                      { key: 'roi', label: 'ROI', format: 'number', align: 'right', sortable: true }
                    ]}
                    data={dataInteligencia.cac_por_canal}
                    showTotal={false}
                  />
                </div>
              )}

              {/* Tendencias */}
              {dataInteligencia.tendencias?.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Tendencias - Ultimos 6 Meses</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Faturamento</h4>
                      <LineChart
                        data={dataInteligencia.tendencias.map(t => ({
                          name: t.mes_nome,
                          Faturamento: t.faturamento
                        }))}
                        dataKeys={['Faturamento']}
                        colors={['#10B981']}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Quantidade de Vendas</h4>
                      <LineChart
                        data={dataInteligencia.tendencias.map(t => ({
                          name: t.mes_nome,
                          Vendas: t.qtd_vendas
                        }))}
                        dataKeys={['Vendas']}
                        colors={['#3B82F6']}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Ticket Medio</h4>
                      <LineChart
                        data={dataInteligencia.tendencias.map(t => ({
                          name: t.mes_nome,
                          'Ticket Medio': t.ticket_medio
                        }))}
                        dataKeys={['Ticket Medio']}
                        colors={['#F59E0B']}
                      />
                    </div>

                    <DataTable
                      columns={[
                        { key: 'mes_nome', label: 'Mes', sortable: false },
                        { key: 'qtd_vendas', label: 'Vendas', format: 'number', align: 'center', sortable: false },
                        { key: 'faturamento', label: 'Faturamento', format: 'currency', align: 'right', sortable: false },
                        { key: 'ticket_medio', label: 'Ticket Medio', format: 'currency', align: 'right', sortable: false }
                      ]}
                      data={dataInteligencia.tendencias}
                      showTotal={false}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </>
      )}

      {/* Conteúdo Meta Anual */}
      {activeSubTab === 'meta-anual' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Análise da Meta Anual - {ano}</h2>
          {metaEmpresa ? (
            <div className="space-y-6">
              {/* Cards de Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 rounded-lg shadow text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm opacity-90 mb-2">Meta Faturamento {ano}</div>
                      <div className="text-3xl font-bold">
                        R$ {((metaEmpresa.faturamento_acumulado || 0) / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-sm opacity-80 mt-2">
                        Objetivo: R$ {((metaEmpresa.meta_faturamento_anual || 5000000) / 1000000).toFixed(0)}M
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">
                        {(metaEmpresa.perc_faturamento || 0).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-4">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(metaEmpresa.perc_faturamento || 0, 100)}%` }}
                    />
                  </div>
                </div>

                <div className={`p-8 rounded-lg shadow text-white ${
                  (metaEmpresa.caixa_atual || 0) >= 0
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm opacity-90 mb-2">Meta Caixa {ano}</div>
                      <div className="text-3xl font-bold">
                        R$ {((metaEmpresa.caixa_atual || 0) / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-sm opacity-80 mt-2">
                        Objetivo: R$ {((metaEmpresa.meta_caixa_anual || 1000000) / 1000000).toFixed(0)}M
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">
                        {(metaEmpresa.perc_caixa || 0).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-4">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Math.abs(metaEmpresa.perc_caixa || 0), 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Resumo da Performance */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-6">Resumo de Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Faturamento até {getMesNome(mes)}</div>
                    <div className="text-2xl font-bold text-blue-600">R$ {((metaEmpresa.faturamento_acumulado || 0) / 1000000).toFixed(2)}M</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Meses do Ano</div>
                    <div className="text-2xl font-bold text-green-600">{mes} / 12</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Faturamento Mensal Médio</div>
                    <div className="text-2xl font-bold text-yellow-600">R$ {((metaEmpresa.faturamento_acumulado || 0) / mes / 1000000).toFixed(2)}M</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">Carregando dados da meta anual...</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAIS ====================  */}

      {/* Modal Financeiro */}
      <Modal
        isOpen={showFinanceiroModal}
        onClose={handleCloseModal}
        title={editingFinanceiro ? 'Editar Transacao' : 'Nova Transacao'}
      >
        <FinanceiroForm
          onSubmit={editingFinanceiro ? handleUpdateFinanceiro : handleCreateFinanceiro}
          initialData={editingFinanceiro}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Modal Venda */}
      <Modal
        isOpen={showVendaModal}
        onClose={handleCloseModal}
        title={editingVenda ? 'Editar Venda' : 'Nova Venda'}
      >
        <VendaForm
          onSubmit={editingVenda ? handleUpdateVenda : handleCreateVenda}
          initialData={editingVenda}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Modal Export */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exportar Dados"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione o tipo de exportacao para {getMesNome(mes)} {ano}:
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleExport('financeiro')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium">Dados Financeiros</div>
              <div className="text-sm text-gray-500">Entradas, saidas e saldo</div>
            </button>
            <button
              onClick={() => handleExport('vendas')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium">Dados de Vendas</div>
              <div className="text-sm text-gray-500">Todas as vendas do periodo</div>
            </button>
            <button
              onClick={() => handleExport('completo')}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border-2 border-blue-200"
            >
              <div className="font-medium text-blue-700">Relatorio Completo</div>
              <div className="text-sm text-blue-600">Todos os dados em um unico arquivo</div>
            </button>
          </div>
          <button
            onClick={() => setShowExportModal(false)}
            className="w-full mt-4 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
