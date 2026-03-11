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

const ComboChart = ({ data, barKey = 'Realizado', lineKey = 'Meta', barColor = '#3B82F6', lineColor = '#10B981', height = 300, isCurrency = false }) => {
  const formatValue = (value) => {
    if (typeof value === 'number' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  const formatTooltip = (value) => {
    if (isCurrency && typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return value;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          style={{ fontSize: '10px' }}
        />
        <YAxis
          tickFormatter={formatValue}
          domain={[0, 'auto']}
        />
        <Tooltip formatter={(value) => formatTooltip(value)} />
        <Legend />
        <Bar
          dataKey={barKey}
          fill={barColor}
          radius={[4, 4, 0, 0]}
          name={barKey}
          minPointSize={2}
        />
        <Line
          type="monotone"
          dataKey={lineKey}
          stroke={lineColor}
          strokeWidth={2}
          dot={{ fill: lineColor, r: 3 }}
          name={lineKey}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ComboChart;
