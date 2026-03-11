import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const FluxoCaixaChart = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatAxisValue = (value) => {
    if (Math.abs(value) >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes_nome" />
        <YAxis tickFormatter={formatAxisValue} />
        <Tooltip
          formatter={formatCurrency}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
        />
        <Legend />
        <Bar dataKey="entradas" fill="#10B981" name="Entradas" />
        <Bar dataKey="saidas" fill="#EF4444" name="Saídas" />
        <Line
          type="monotone"
          dataKey="saldo_acumulado"
          stroke="#3B82F6"
          strokeWidth={3}
          name="Saldo Acumulado"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default FluxoCaixaChart;
