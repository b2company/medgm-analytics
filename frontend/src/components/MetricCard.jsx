import React from 'react';

const MetricCard = ({ title, value, subtitle, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className={'rounded-lg border-2 p-6 ' + (colors[color] || colors.blue)}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-sm mt-1 opacity-60">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
