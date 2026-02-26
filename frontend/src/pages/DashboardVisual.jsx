import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PainelRealTime from '../components/PainelRealTime';
import BreakdownPorProduto from '../components/BreakdownPorProduto';
import ScorecardsIndividuais from '../components/ScorecardsIndividuais';
import ProjecaoCaixa from '../components/ProjecaoCaixa';
import FunilCompleto from '../components/FunilCompleto';
import RankingClosers from '../components/RankingClosers';
import ComparativoMensal from '../components/ComparativoMensal';
import ReceitaNovaRecorrente from '../components/ReceitaNovaRecorrente';
import PontoEquilibrio from '../components/PontoEquilibrio';
import VisaoRunway from '../components/VisaoRunway';
import BreakdownCustos from '../components/BreakdownCustos';
import BarChart from '../components/BarChart';
import ProgressBar from '../components/ProgressBar';
import {
  getFinanceiroDetalhado,
  getComercialDetalhado,
  getMetaEmpresa,
  calcularAcumuladoEmpresa,
  getFunilCompleto,
  getMetas
} from '../services/api';

const DashboardVisual = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSubTabFromURL = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'visao-geral';
  };

  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromURL());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [modoTV, setModoTV] = useState(false);

  const [dataFinanceiro, setDataFinanceiro] = useState(null);
  const [dataComercial, setDataComercial] = useState(null);
  const [metaEmpresa, setMetaEmpresa] = useState(null);
  const [dadosFunil, setDadosFunil] = useState(null);
  const [dadosClosers, setDadosClosers] = useState(null);
  const [metas, setMetas] = useState([]);

  useEffect(() => {
    setActiveSubTab(getSubTabFromURL());
  }, [location.hash]);

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    navigate(`/dashboard#${tab}`);
  };

  useEffect(() => {
    loadData();
  }, [mes, ano, modoTV]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Meta empresa
      try {
        await calcularAcumuladoEmpresa(ano);
        const empresaRes = await getMetaEmpresa(ano);
        setMetaEmpresa(empresaRes);
      } catch (e) {
        console.warn('Erro ao carregar meta empresa:', e);
      }

      // Dados para modo TV
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

      // Dados principais
      const [fin, com] = await Promise.all([
        getFinanceiroDetalhado(mes, ano),
        getComercialDetalhado(mes, ano)
      ]);
      setDataFinanceiro(fin);
      setDataComercial(com);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatShortCurrency = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
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

  // Preparar dados para gráfico de closers (modo TV)
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
          {/* Q1: Funil de Conversão */}
          <div className="bg-white rounded-lg shadow p-6 overflow-auto flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Funil de Conversão</h2>
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

          {/* Q3: Metas do Mês */}
          <div className="bg-white rounded-lg shadow p-6 overflow-auto flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Metas do Mês</h2>
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
                  Nenhuma meta cadastrada para este mês
                </div>
              )}
            </div>
          </div>

          {/* Q4: Resultado do Mês */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Resultado do Mês - {getMesNome(mes)} {ano}</h2>
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header com filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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

      {/* Conteúdo Visão Geral */}
      {activeSubTab === 'visao-geral' && (
        <div className="space-y-6">
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

          {/* Comparativo Mensal */}
          <ComparativoMensal mes={mes} ano={ano} />

          {/* Breakdown por Produto */}
          <BreakdownPorProduto mes={mes} ano={ano} />

          {/* Breakdown de Custos */}
          <BreakdownCustos mes={mes} ano={ano} />

          {/* Ranking de Closers */}
          <RankingClosers mes={mes} ano={ano} />

          {/* Receita Nova vs Recorrente */}
          <ReceitaNovaRecorrente mes={mes} ano={ano} />

          {/* Ponto de Equilíbrio */}
          <PontoEquilibrio mes={mes} ano={ano} />

          {/* Runway */}
          <VisaoRunway mes={mes} ano={ano} />

          {/* Scorecards Individuais */}
          <ScorecardsIndividuais mes={mes} ano={ano} />

          {/* Projeção de Caixa */}
          <ProjecaoCaixa mes={mes} ano={ano} />
        </div>
      )}

      {/* Conteúdo Meta Anual */}
      {activeSubTab === 'meta-anual' && metaEmpresa && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Análise da Meta Anual - {ano}</h2>

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
      )}
    </div>
  );
};

export default DashboardVisual;
