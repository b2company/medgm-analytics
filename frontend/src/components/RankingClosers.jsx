import React, { useState, useEffect } from 'react';
import { getFunilCompleto } from '../services/api';

const RankingClosers = ({ mes, ano }) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordenarPor, setOrdenarPor] = useState('conversao'); // 'conversao' ou 'receita'

  useEffect(() => {
    loadRanking();
  }, [mes, ano]);

  const loadRanking = async () => {
    setLoading(true);
    try {
      const data = await getFunilCompleto(mes, ano, 'por_closer');

      if (data.closers) {
        const rankingArray = Object.entries(data.closers).map(([nome, metricas]) => ({
          nome,
          reunioes: metricas.reunioes_realizadas || 0,
          vendas: metricas.vendas || 0,
          receita: metricas.faturamento || 0,
          ticket_medio: metricas.ticket_medio || 0,
          tx_conversao: metricas.tx_conversao || 0,
          tx_comparecimento: metricas.tx_comparecimento || 0
        }));

        setRanking(rankingArray);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const getRankingOrdenado = () => {
    if (ordenarPor === 'conversao') {
      return [...ranking].sort((a, b) => b.tx_conversao - a.tx_conversao);
    } else {
      return [...ranking].sort((a, b) => b.receita - a.receita);
    }
  };

  const getMedalha = (posicao) => {
    switch (posicao) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${posicao + 1}º`;
    }
  };

  const getInsight = (closer, posicao) => {
    const insights = [];

    if (closer.tx_conversao >= 25) {
      insights.push('🔥 Excelente taxa de conversão');
    } else if (closer.tx_conversao < 15) {
      insights.push('⚠️ Precisa melhorar técnica de fechamento');
    }

    if (closer.reunioes >= 20 && closer.tx_conversao < 20) {
      insights.push('💪 Alto volume, baixa conversão - foco em qualificação');
    }

    if (closer.tx_conversao >= 20 && closer.reunioes < 15) {
      insights.push('🎯 Alta conversão, baixo volume - precisa mais reuniões');
    }

    if (closer.ticket_medio > ranking.reduce((acc, c) => acc + c.ticket_medio, 0) / ranking.length * 1.2) {
      insights.push('💰 Ticket médio acima da média');
    }

    return insights[0] || (posicao === 0 ? '👑 Melhor closer do mês' : '');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Ranking de Closers</h3>
        <p className="text-gray-500">Nenhum dado de closers disponível para este período.</p>
      </div>
    );
  }

  const rankingOrdenado = getRankingOrdenado();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Ranking de Closers</h3>
          <p className="text-sm text-gray-600 mt-1">
            Performance rankeada por taxa de conversão e receita gerada
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOrdenarPor('conversao')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              ordenarPor === 'conversao'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Por Conversão
          </button>
          <button
            onClick={() => setOrdenarPor('receita')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              ordenarPor === 'receita'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Por Receita
          </button>
        </div>
      </div>

      {/* Cards dos Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {rankingOrdenado.slice(0, 3).map((closer, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-lg border-2 ${
              idx === 0 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' :
              idx === 1 ? 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100' :
              'border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{getMedalha(idx)}</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {ordenarPor === 'conversao' ? `${closer.tx_conversao.toFixed(1)}%` : formatCurrency(closer.receita)}
                </div>
                <div className="text-xs text-gray-600">
                  {ordenarPor === 'conversao' ? 'Conversão' : 'Receita'}
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">{closer.nome}</div>
            <div className="text-xs text-gray-600 mb-2">
              {closer.reunioes} reuniões • {closer.vendas} vendas
            </div>
            <div className="text-xs text-gray-700 italic">
              {getInsight(closer, idx)}
            </div>
          </div>
        ))}
      </div>

      {/* Tabela Completa */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Ranking</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Closer</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Reuniões</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Vendas</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Taxa Conv.</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Receita</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Ticket Médio</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Insight</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rankingOrdenado.map((closer, idx) => (
              <tr
                key={idx}
                className={`hover:bg-gray-50 transition-colors ${
                  idx < 3 ? 'bg-blue-50/30' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {getMedalha(idx)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-gray-900">{closer.nome}</td>
                <td className="px-4 py-3 text-center text-gray-700">{closer.reunioes}</td>
                <td className="px-4 py-3 text-center font-semibold text-blue-600">{closer.vendas}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-bold ${
                    closer.tx_conversao >= 25 ? 'text-green-600' :
                    closer.tx_conversao >= 15 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {closer.tx_conversao.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-600">
                  {formatCurrency(closer.receita)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(closer.ticket_medio)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 italic">
                  {getInsight(closer, idx)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comparação Geral */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-bold text-gray-700 mb-3">📊 Comparação Geral</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Média Conversão</div>
            <div className="text-xl font-bold text-gray-900">
              {(ranking.reduce((acc, c) => acc + c.tx_conversao, 0) / ranking.length).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Melhor Conversão</div>
            <div className="text-xl font-bold text-green-600">
              {Math.max(...ranking.map(c => c.tx_conversao)).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Total Receita</div>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(ranking.reduce((acc, c) => acc + c.receita, 0))}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Total Vendas</div>
            <div className="text-xl font-bold text-purple-600">
              {ranking.reduce((acc, c) => acc + c.vendas, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingClosers;
