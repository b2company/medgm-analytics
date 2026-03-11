import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { customRound } from '../utils/formatters';

const ComboChartWithLine = ({ data, bars, line, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} style={{ fontSize: '8px' }} />
        <YAxis
          yAxisId="left"
          tickFormatter={(value) => customRound(value).toLocaleString('pt-BR')}
          label={{ value: 'Volume', angle: -90, position: 'insideLeft', style: { fontSize: '8px' } }}
          style={{ fontSize: '8px' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          label={{ value: 'Taxa (%)', angle: 90, position: 'insideRight', style: { fontSize: '8px' } }}
          style={{ fontSize: '8px' }}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === line.name) {
              return [`${value.toFixed(1)}%`, name];
            }
            return [customRound(value).toLocaleString('pt-BR'), name];
          }}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '9px' }}
        />
        <Legend wrapperStyle={{ fontSize: '9px' }} />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            yAxisId="left"
            dataKey={bar.key}
            fill={bar.color}
            name={bar.key}
          />
        ))}
        {line && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={1.5}
            name={line.name}
            dot={{ r: 2 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ComboChartWithLine;
