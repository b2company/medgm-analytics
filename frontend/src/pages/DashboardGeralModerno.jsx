import React, { useState, useEffect } from 'react';
import MetricCardModern from '../components/MetricCardModern';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DashboardGeralModerno = ({ mes, ano }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [mes, ano]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/metrics/comercial/detalhado?mes=${mes}&ano=${ano}`);
      const comercialData = await response.json();
      setData(comercialData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum dado disponível para este período</p>
      </div>
    );
  }

  // Ícones
  const DollarIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const CartIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const TicketIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );

  const TrendIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  // Calcular tendências
  const getTrend = (comparacao) => {
    if (!comparacao) return { trend: null, value: null };
    const variacao = comparacao.variacao_faturamento_pct || 0;
    return {
      trend: variacao >= 0 ? 'up' : 'down',
      value: Math.abs(variacao).toFixed(1)
    };
  };

  const faturamentoTrend = getTrend(data.comparacao_mes_anterior);
  const vendasTrend = getTrend({ variacao_faturamento_pct: data.comparacao_mes_anterior?.variacao_vendas_pct });
  const ticketTrend = getTrend({ variacao_faturamento_pct: data.comparacao_mes_anterior?.variacao_ticket_pct });

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCardModern
          title="Faturamento Total"
          value={formatCurrency(data.faturamento_total)}
          subtitle={`${data.total_vendas} vendas realizadas`}
          icon={DollarIcon}
          trend={faturamentoTrend.trend}
          trendValue={faturamentoTrend.value}
          color="green"
        />

        <MetricCardModern
          title="Quantidade de Vendas"
          value={formatNumber(data.total_vendas)}
          subtitle="Vendas fechadas"
          icon={CartIcon}
          trend={vendasTrend.trend}
          trendValue={vendasTrend.value}
          color="blue"
        />

        <MetricCardModern
          title="Ticket Médio"
          value={formatCurrency(data.ticket_medio)}
          subtitle="Por venda"
          icon={TicketIcon}
          trend={ticketTrend.trend}
          trendValue={ticketTrend.value}
          color="purple"
        />

        <MetricCardModern
          title="Melhor Vendedor"
          value={data.melhor_vendedor?.vendedor || '-'}
          subtitle={data.melhor_vendedor ? formatCurrency(data.melhor_vendedor.valor_total) : 'Sem dados'}
          icon={TrendIcon}
          color="yellow"
        />
      </div>

      {/* Performance por Vendedor */}
      {data.por_vendedor && data.por_vendedor.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-heading font-bold mb-4 text-gray-900">
            Performance por Vendedor
          </h2>
          <div className="space-y-3">
            {data.por_vendedor.slice(0, 5).map((vendedor, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-yellow-500' :
                    idx === 1 ? 'bg-gray-400' :
                    idx === 2 ? 'bg-orange-600' :
                    'bg-blue-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{vendedor.vendedor}</p>
                    <p className="text-sm text-gray-500">{vendedor.qtd_vendas} vendas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">{formatCurrency(vendedor.valor_total)}</p>
                  <p className="text-sm text-gray-500">Ticket: {formatCurrency(vendedor.ticket_medio)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance por Canal */}
      {data.por_canal && data.por_canal.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-heading font-bold mb-4 text-gray-900">
              Vendas por Canal
            </h2>
            <div className="space-y-3">
              {data.por_canal.map((canal, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{canal.canal}</p>
                    <p className="text-sm text-gray-500">{canal.qtd_vendas} vendas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(canal.valor_total)}</p>
                    <p className="text-xs text-gray-500">{formatPercent(canal.pct_total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparação Mês Anterior */}
          {data.comparacao_mes_anterior && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-heading font-bold mb-4 text-gray-900">
                Comparação Mensal
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Faturamento</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    data.comparacao_mes_anterior.variacao_faturamento_pct >= 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.comparacao_mes_anterior.variacao_faturamento_pct >= 0 ? '↑' : '↓'}
                    <span className="font-bold">{Math.abs(data.comparacao_mes_anterior.variacao_faturamento_pct).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Vendas</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    data.comparacao_mes_anterior.variacao_vendas_pct >= 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.comparacao_mes_anterior.variacao_vendas_pct >= 0 ? '↑' : '↓'}
                    <span className="font-bold">{Math.abs(data.comparacao_mes_anterior.variacao_vendas_pct).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Ticket Médio</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    data.comparacao_mes_anterior.variacao_ticket_pct >= 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.comparacao_mes_anterior.variacao_ticket_pct >= 0 ? '↑' : '↓'}
                    <span className="font-bold">{Math.abs(data.comparacao_mes_anterior.variacao_ticket_pct).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardGeralModerno;
