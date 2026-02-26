import React, { useState, useEffect } from 'react';
import { getComercialDetalhado } from '../services/api';
import BarChart from './BarChart';

const ComparativoMensal = ({ mes, ano }) => {
  const [mesAtual, setMesAtual] = useState(null);
  const [mesAnterior, setMesAnterior] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, [mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    try {
      // Calcular mês anterior
      let mesAnt = mes - 1;
      let anoAnt = ano;
      if (mesAnt === 0) {
        mesAnt = 12;
        anoAnt = ano - 1;
      }

      const [atual, anterior] = await Promise.all([
        getComercialDetalhado(mes, ano),
        getComercialDetalhado(mesAnt, anoAnt)
      ]);

      setMesAtual(atual);
      setMesAnterior(anterior);
    } catch (error) {
      console.error('Erro ao carregar comparativo:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const calcularVariacao = (atual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const getMesNome = (mesNum) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[mesNum - 1];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!mesAtual || !mesAnterior) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Comparativo Mensal</h3>
        <p className="text-gray-500">Dados insuficientes para comparação.</p>
      </div>
    );
  }

  // Calcular mês anterior
  let mesAnt = mes - 1;
  let anoAnt = ano;
  if (mesAnt === 0) {
    mesAnt = 12;
    anoAnt = ano - 1;
  }

  const comparacao = {
    faturamento: {
      atual: mesAtual.faturamento_total || 0,
      anterior: mesAnterior.faturamento_total || 0,
      variacao: calcularVariacao(mesAtual.faturamento_total, mesAnterior.faturamento_total)
    },
    vendas: {
      atual: mesAtual.total_vendas || 0,
      anterior: mesAnterior.total_vendas || 0,
      variacao: calcularVariacao(mesAtual.total_vendas, mesAnterior.total_vendas)
    },
    ticket: {
      atual: mesAtual.ticket_medio || 0,
      anterior: mesAnterior.ticket_medio || 0,
      variacao: calcularVariacao(mesAtual.ticket_medio, mesAnterior.ticket_medio)
    }
  };

  // Dados para gráfico de barras
  const chartData = [
    {
      name: 'Faturamento',
      [getMesNome(mesAnt)]: mesAnterior.faturamento_total || 0,
      [getMesNome(mes)]: mesAtual.faturamento_total || 0
    },
    {
      name: 'Vendas',
      [getMesNome(mesAnt)]: mesAnterior.total_vendas || 0,
      [getMesNome(mes)]: mesAtual.total_vendas || 0
    },
    {
      name: 'Ticket Médio',
      [getMesNome(mesAnt)]: mesAnterior.ticket_medio || 0,
      [getMesNome(mes)]: mesAtual.ticket_medio || 0
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Comparativo Mensal</h3>
        <p className="text-sm text-gray-600 mt-1">
          {getMesNome(mes)} {ano} vs {getMesNome(mesAnt)} {anoAnt}
        </p>
      </div>

      {/* Cards de Comparação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Faturamento */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
          <div className="text-sm text-green-700 font-medium mb-2">Faturamento</div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xs text-green-600 mb-1">{getMesNome(mesAnt)}</div>
              <div className="text-lg font-bold text-green-900">
                {formatCurrency(comparacao.faturamento.anterior)}
              </div>
            </div>
            <div className="text-3xl text-green-700">→</div>
            <div>
              <div className="text-xs text-green-600 mb-1">{getMesNome(mes)}</div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(comparacao.faturamento.atual)}
              </div>
            </div>
          </div>
          <div className={`text-center px-3 py-2 rounded-lg font-bold ${
            comparacao.faturamento.variacao >= 0
              ? 'bg-green-200 text-green-900'
              : 'bg-red-200 text-red-900'
          }`}>
            {comparacao.faturamento.variacao >= 0 ? '↑' : '↓'} {Math.abs(comparacao.faturamento.variacao).toFixed(1)}%
          </div>
        </div>

        {/* Vendas */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5">
          <div className="text-sm text-blue-700 font-medium mb-2">Quantidade de Vendas</div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xs text-blue-600 mb-1">{getMesNome(mesAnt)}</div>
              <div className="text-lg font-bold text-blue-900">
                {comparacao.vendas.anterior}
              </div>
            </div>
            <div className="text-3xl text-blue-700">→</div>
            <div>
              <div className="text-xs text-blue-600 mb-1">{getMesNome(mes)}</div>
              <div className="text-2xl font-bold text-blue-900">
                {comparacao.vendas.atual}
              </div>
            </div>
          </div>
          <div className={`text-center px-3 py-2 rounded-lg font-bold ${
            comparacao.vendas.variacao >= 0
              ? 'bg-green-200 text-green-900'
              : 'bg-red-200 text-red-900'
          }`}>
            {comparacao.vendas.variacao >= 0 ? '↑' : '↓'} {Math.abs(comparacao.vendas.variacao).toFixed(1)}%
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-5">
          <div className="text-sm text-yellow-700 font-medium mb-2">Ticket Médio</div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xs text-yellow-600 mb-1">{getMesNome(mesAnt)}</div>
              <div className="text-lg font-bold text-yellow-900">
                {formatCurrency(comparacao.ticket.anterior)}
              </div>
            </div>
            <div className="text-3xl text-yellow-700">→</div>
            <div>
              <div className="text-xs text-yellow-600 mb-1">{getMesNome(mes)}</div>
              <div className="text-2xl font-bold text-yellow-900">
                {formatCurrency(comparacao.ticket.atual)}
              </div>
            </div>
          </div>
          <div className={`text-center px-3 py-2 rounded-lg font-bold ${
            comparacao.ticket.variacao >= 0
              ? 'bg-green-200 text-green-900'
              : 'bg-red-200 text-red-900'
          }`}>
            {comparacao.ticket.variacao >= 0 ? '↑' : '↓'} {Math.abs(comparacao.ticket.variacao).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Gráfico de Barras */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Comparação Visual</h4>
        <BarChart
          data={[
            {
              name: 'Faturamento (K)',
              [getMesNome(mesAnt)]: (mesAnterior.faturamento_total || 0) / 1000,
              [getMesNome(mes)]: (mesAtual.faturamento_total || 0) / 1000
            }
          ]}
          dataKey={getMesNome(mes)}
          secondDataKey={getMesNome(mesAnt)}
          color="#3B82F6"
          secondColor="#9CA3AF"
          height={200}
        />
      </div>

      {/* Análise e Insights */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3">📊 Análise</h4>
        <div className="space-y-2 text-sm text-gray-700">
          {comparacao.faturamento.variacao < -10 && (
            <p className="text-red-700">
              ⚠️ <strong>Alerta:</strong> Faturamento caiu mais de 10% em relação ao mês anterior.
              Revisar estratégia comercial.
            </p>
          )}
          {comparacao.faturamento.variacao > 20 && (
            <p className="text-green-700">
              ✓ <strong>Excelente:</strong> Faturamento cresceu mais de 20%! Manter o ritmo.
            </p>
          )}
          {comparacao.vendas.variacao < 0 && comparacao.ticket.variacao > 0 && (
            <p className="text-yellow-700">
              → Menos vendas mas ticket médio maior. Foco em qualidade sobre quantidade.
            </p>
          )}
          {comparacao.vendas.variacao > 0 && comparacao.ticket.variacao < 0 && (
            <p className="text-yellow-700">
              → Mais vendas mas ticket médio menor. Avaliar mix de produtos.
            </p>
          )}
          {Math.abs(comparacao.faturamento.variacao) < 5 && (
            <p className="text-gray-700">
              ➡️ Faturamento estável (variação menor que 5%). Crescimento consistente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparativoMensal;
