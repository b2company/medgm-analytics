import React, { useState, useEffect } from 'react';
import { getScorecardsIndividuais } from '../services/api';
import LineChart from './LineChart';

const ScorecardsIndividuais = ({ mes, ano }) => {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    loadScorecards();
  }, [mes, ano]);

  const loadScorecards = async () => {
    setLoading(true);
    try {
      const data = await getScorecardsIndividuais(mes, ano);
      setScorecards(data.scorecards || []);
    } catch (error) {
      console.error('Erro ao carregar scorecards:', error);
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

  const getColorClass = (cor) => {
    switch (cor) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-700',
          badge: 'bg-green-500'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-700',
          badge: 'bg-yellow-500'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-700',
          badge: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-500',
          text: 'text-gray-700',
          badge: 'bg-gray-500'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (scorecards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Scorecards Individuais</h3>
        <p className="text-gray-500">Nenhum scorecard disponível para este período.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Scorecards Individuais</h3>
        <p className="text-sm text-gray-600 mt-1">
          Performance individual de cada membro da equipe com tendência de atingimento
        </p>
      </div>

      <div className="space-y-4">
        {scorecards.map((scorecard, idx) => {
          const colors = getColorClass(scorecard.cor);
          const isExpanded = expandedCard === idx;

          return (
            <div
              key={idx}
              className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-5 transition-all duration-300 hover:shadow-md`}
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl font-bold text-gray-900">{scorecard.pessoa}</h4>
                    <span className={`${colors.badge} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
                      {scorecard.area}
                    </span>
                  </div>
                  <div className={`text-sm ${colors.text} mt-1 font-medium`}>
                    {scorecard.tendencia_texto}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : idx)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  {isExpanded ? '▼ Menos' : '▶ Mais'}
                </button>
              </div>

              {/* Progresso Principal */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm text-gray-600">Realizado: </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatShortCurrency(scorecard.realizado_mes)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Meta: </span>
                    <span className="text-lg font-semibold text-gray-700">
                      {formatShortCurrency(scorecard.meta_mes)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className={`h-full ${colors.badge} transition-all duration-1000 ease-out flex items-center justify-center`}
                      style={{
                        width: `${Math.min(scorecard.perc_meta, 100)}%`,
                        minWidth: scorecard.perc_meta > 0 ? '50px' : '0'
                      }}
                    >
                      <span className="text-sm font-bold text-white">
                        {scorecard.perc_meta.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/70 p-3 rounded">
                  <div className="text-xs text-gray-600">Projeção Fim Mês</div>
                  <div className={`text-base font-bold ${colors.text}`}>
                    {scorecard.perc_projecao.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatShortCurrency(scorecard.projecao_fim_mes)}
                  </div>
                </div>
                <div className="bg-white/70 p-3 rounded">
                  <div className="text-xs text-gray-600">Ritmo Diário</div>
                  <div className="text-base font-bold text-blue-600">
                    {formatShortCurrency(scorecard.ritmo_diario)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {scorecard.dias_decorridos}/{scorecard.dias_totais} dias
                  </div>
                </div>
                <div className="bg-white/70 p-3 rounded">
                  <div className="text-xs text-gray-600">Falta para Meta</div>
                  <div className={`text-base font-bold ${
                    scorecard.falta_para_meta > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {formatShortCurrency(scorecard.falta_para_meta)}
                  </div>
                </div>
              </div>

              {/* Seção Expandida */}
              {isExpanded && scorecard.historico.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h5 className="text-sm font-bold text-gray-700 mb-3">
                    Histórico de Performance (Últimos 3 Meses)
                  </h5>

                  {/* Gráfico */}
                  <div className="mb-4">
                    <LineChart
                      data={scorecard.historico.reverse().map(h => ({
                        name: h.mes_nome.substring(0, 3),
                        Meta: h.meta,
                        Realizado: h.realizado
                      }))}
                      dataKeys={['Meta', 'Realizado']}
                      colors={['#9CA3AF', colors.badge.replace('bg-', '#')]}
                      height={150}
                    />
                  </div>

                  {/* Tabela Histórico */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Mês</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Meta</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Realizado</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {scorecard.historico.map((hist, i) => (
                          <tr key={i} className="hover:bg-white/50">
                            <td className="px-3 py-2 text-gray-700">{hist.mes_nome} {hist.ano}</td>
                            <td className="px-3 py-2 text-right text-gray-600">
                              {formatShortCurrency(hist.meta)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900">
                              {formatShortCurrency(hist.realizado)}
                            </td>
                            <td className={`px-3 py-2 text-right font-bold ${
                              hist.perc >= 100 ? 'text-green-600' :
                              hist.perc >= 80 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {hist.perc.toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScorecardsIndividuais;
