import React, { useState, useEffect } from 'react';
import {
  getFunilCompleto,
  getMetas,
  getMetaEmpresa,
  calcularAcumuladoEmpresa,
  getComercialDetalhado
} from '../services/api';
import FunilCompleto from '../components/FunilCompleto';
import ProgressBar from '../components/ProgressBar';
import BarChart from '../components/BarChart';

const DashboardTV = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // Dados
  const [dadosFunil, setDadosFunil] = useState(null);
  const [dadosClosers, setDadosClosers] = useState(null);
  const [metas, setMetas] = useState([]);
  const [metaEmpresa, setMetaEmpresa] = useState(null);

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

  useEffect(() => {
    loadData();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [mes, ano]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [funilRes, closersRes, metasRes, empresaRes] = await Promise.all([
        getFunilCompleto(mes, ano, 'geral'),
        getFunilCompleto(mes, ano, 'por_closer'),
        getMetas(mes, ano),
        getMetaEmpresa(ano)
      ]);

      setDadosFunil(funilRes);
      setDadosClosers(closersRes);
      setMetas(metasRes.metas || []);
      setMetaEmpresa(empresaRes);

      // Tentar atualizar acumulado
      try {
        await calcularAcumuladoEmpresa(ano);
        const empresaAtualizada = await getMetaEmpresa(ano);
        setMetaEmpresa(empresaAtualizada);
      } catch (e) {
        // Ignorar erro se nao conseguir atualizar
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
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

  // Preparar dados para grafico de closers
  const closersChartData = dadosClosers?.closers
    ? Object.entries(dadosClosers.closers).map(([nome, dados]) => ({
        name: nome,
        Faturamento: dados.faturamento || 0
      })).slice(0, 5) // Top 5
    : [];

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-gray-100' : 'max-w-7xl mx-auto py-4 px-4'}`}>
      {/* Header */}
      <div className={`flex justify-between items-center mb-4 ${fullscreen ? 'px-6 pt-4' : ''}`}>
        <div className="flex items-center gap-4">
          <h1 className={`font-bold text-gray-900 ${fullscreen ? 'text-2xl' : 'text-xl'}`}>
            Dashboard Executivo
          </h1>
          <span className="text-sm text-gray-500">
            {meses.find(m => m.value === mes)?.label} {ano}
          </span>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!fullscreen && (
            <>
              <select
                value={mes}
                onChange={(e) => setMes(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
              >
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </>
          )}
          <button
            onClick={toggleFullscreen}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
          >
            {fullscreen ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Sair
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Modo TV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid 2x2 */}
      <div className={`grid grid-cols-2 gap-4 ${fullscreen ? 'h-[calc(100vh-80px)] px-6 pb-6' : ''}`}>
        {/* Quadrante 1: Funil Completo */}
        <div className="bg-white rounded-lg shadow p-5 overflow-auto">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Funil de Conversao</h2>
          {dadosFunil ? (
            <FunilCompleto dados={dadosFunil} agrupamento="geral" />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              Sem dados para exibir
            </div>
          )}
        </div>

        {/* Quadrante 2: Performance por Closer */}
        <div className="bg-white rounded-lg shadow p-5 overflow-auto">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Top Closers</h2>
          {closersChartData.length > 0 ? (
            <BarChart
              data={closersChartData}
              dataKey="Faturamento"
              color="#3B82F6"
              height={fullscreen ? 280 : 220}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              Sem dados de closers
            </div>
          )}
        </div>

        {/* Quadrante 3: Metas vs Realizado */}
        <div className="bg-white rounded-lg shadow p-5 overflow-auto">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Metas do Mes</h2>
          {metas.length > 0 ? (
            <div className="space-y-3">
              {metas.slice(0, fullscreen ? 8 : 5).map(meta => (
                <div key={meta.id} className="flex items-center gap-3">
                  <div className="w-28 text-sm font-medium text-gray-700 truncate">
                    {meta.pessoa?.nome || '-'}
                  </div>
                  <div className="flex-1">
                    <ProgressBar
                      value={meta.perc_atingimento || 0}
                      max={100}
                      showPercentage={false}
                      color="auto"
                      size="md"
                    />
                  </div>
                  <span className={`text-sm font-bold w-14 text-right ${
                    (meta.perc_atingimento || 0) >= 100 ? 'text-green-600' :
                    (meta.perc_atingimento || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(meta.perc_atingimento || 0).toFixed(0)}%
                  </span>
                </div>
              ))}
              {metas.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  Nenhuma meta cadastrada
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              Nenhuma meta cadastrada para este mes
            </div>
          )}
        </div>

        {/* Quadrante 4: Meta Anual da Empresa */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Meta Anual {ano}</h2>
          <div className="space-y-6">
            {/* Faturamento */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Faturamento</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatShortCurrency(metaEmpresa?.faturamento_acumulado || 0)} / {formatShortCurrency(metaEmpresa?.meta_faturamento_anual || 5000000)}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.min((metaEmpresa?.perc_faturamento || 0), 100)}%`, minWidth: '40px' }}
                  >
                    <span className="text-xs font-bold text-white">
                      {(metaEmpresa?.perc_faturamento || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">R$ 0</span>
                <span className="text-xs text-gray-500">R$ 5M</span>
              </div>
            </div>

            {/* Caixa */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Caixa</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatShortCurrency(metaEmpresa?.caixa_atual || 0)} / {formatShortCurrency(metaEmpresa?.meta_caixa_anual || 1000000)}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${
                      (metaEmpresa?.caixa_atual || 0) >= 0
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${Math.min(Math.abs(metaEmpresa?.perc_caixa || 0), 100)}%`, minWidth: '40px' }}
                  >
                    <span className="text-xs font-bold text-white">
                      {(metaEmpresa?.perc_caixa || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">R$ 0</span>
                <span className="text-xs text-gray-500">R$ 1M</span>
              </div>
            </div>

            {/* Cards de Status */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <div className={`p-3 rounded-lg ${
                (metaEmpresa?.perc_faturamento || 0) >= 100 ? 'bg-green-100' :
                (metaEmpresa?.perc_faturamento || 0) >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <div className="text-xs text-gray-600">Status Fat.</div>
                <div className={`text-sm font-bold ${
                  (metaEmpresa?.perc_faturamento || 0) >= 100 ? 'text-green-700' :
                  (metaEmpresa?.perc_faturamento || 0) >= 50 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {(metaEmpresa?.perc_faturamento || 0) >= 100 ? 'Meta Batida!' :
                   (metaEmpresa?.perc_faturamento || 0) >= 50 ? 'Em Progresso' : 'Atencao'}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                (metaEmpresa?.perc_caixa || 0) >= 100 ? 'bg-green-100' :
                (metaEmpresa?.perc_caixa || 0) >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <div className="text-xs text-gray-600">Status Caixa</div>
                <div className={`text-sm font-bold ${
                  (metaEmpresa?.perc_caixa || 0) >= 100 ? 'text-green-700' :
                  (metaEmpresa?.perc_caixa || 0) >= 50 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {(metaEmpresa?.perc_caixa || 0) >= 100 ? 'Meta Batida!' :
                   (metaEmpresa?.perc_caixa || 0) >= 50 ? 'Em Progresso' : 'Atencao'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTV;
