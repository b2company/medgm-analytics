import React from 'react';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, dataKeys, colors }) => {
  const formatValue = (value) => {
    if (typeof value === 'number' && value > 999) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLine data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => {
          if (value >= 1000) {
            return `R$ ${(value / 1000).toFixed(0)}k`;
          }
          return value;
        }} />
        <Tooltip formatter={formatValue} />
        <Legend />
        {dataKeys.map((key, idx) => (
          <Line key={key} type="monotone" dataKey={key} stroke={colors[idx]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        ))}
      </RechartsLine>
    </ResponsiveContainer>
  );
};

export default LineChart;
