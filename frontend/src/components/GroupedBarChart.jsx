import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { customRound } from '../utils/formatters';

const GroupedBarChart = ({ data, bars, height = 300, title = null }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: <span className="font-bold">{customRound(entry.value).toLocaleString('pt-BR')}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#6B7280"
            style={{ fontSize: '12px', fontWeight: '500' }}
            tickLine={false}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px', fontWeight: '500' }}
            tickFormatter={(value) => customRound(value).toLocaleString('pt-BR')}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }} />
          <Legend
            wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: '500' }}
            iconType="circle"
            iconSize={8}
          />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              name={bar.key}
              radius={[8, 8, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GroupedBarChart;
