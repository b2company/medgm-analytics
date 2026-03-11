import React from 'react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, dataKey, color = '#3B82F6', colors = [], horizontal = false, height = 300, isCurrency = false }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatValue = (value) => {
    if (typeof value === 'number' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  // Suporta múltiplas barras se dataKey for array
  const isMultipleBars = Array.isArray(dataKey);
  const barKeys = isMultipleBars ? dataKey : [dataKey];
  const barColors = isMultipleBars ? colors : [color];

  // Calcular altura dinamicamente para barras horizontais
  const chartHeight = horizontal ? Math.max(300, data.length * 50) : height;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <RechartsBar data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
        <CartesianGrid strokeDasharray="3 3" />
        {horizontal ? (
          <>
            <XAxis type="number" tickFormatter={formatValue} />
            <YAxis type="category" dataKey="name" width={120} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis tickFormatter={formatValue} />
          </>
        )}
        <Tooltip formatter={(value) => isCurrency ? formatCurrency(value) : (typeof value === 'number' ? value.toLocaleString('pt-BR') : value)} />
        <Legend />
        {barKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={barColors[index] || color}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          />
        ))}
      </RechartsBar>
    </ResponsiveContainer>
  );
};

export default BarChart;
