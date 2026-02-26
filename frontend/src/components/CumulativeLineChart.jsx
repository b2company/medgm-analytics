import React from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { customRound } from '../utils/formatters';

const CumulativeLineChart = ({
  data,
  lineKey,
  metaKey,
  lineColor = '#3B82F6',
  metaColor = '#10B981',
  height = 300,
  isCurrency = false
}) => {
  const formatValue = (value) => {
    const rounded = customRound(value);
    if (isCurrency) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(rounded);
    }
    return rounded.toLocaleString('pt-BR');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">Dia {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: <span className="font-bold">{formatValue(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <defs>
          <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={lineColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={lineColor} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="dia"
          label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#6B7280' } }}
          stroke="#6B7280"
          style={{ fontSize: '12px', fontWeight: '500' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatValue}
          stroke="#6B7280"
          style={{ fontSize: '12px', fontWeight: '500' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '10px', fontSize: '13px', fontWeight: '500' }}
          iconType="circle"
          iconSize={8}
        />
        {/* Área sombreada representando o gap */}
        <Area
          type="monotone"
          dataKey={metaKey}
          stroke="none"
          fill="url(#gapGradient)"
          fillOpacity={0.3}
        />
        <Line
          type="monotone"
          dataKey={lineKey}
          stroke={lineColor}
          strokeWidth={3}
          name="Realizado"
          dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey={metaKey}
          stroke={metaColor}
          strokeWidth={2}
          strokeDasharray="8 4"
          name="Meta"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CumulativeLineChart;
