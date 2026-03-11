import React from 'react';

const ProgressBar = ({ value, max = 100, label, showPercentage = true, color = 'blue', size = 'md' }) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    blue: { bg: 'bg-blue-100', fill: 'bg-blue-600' },
    green: { bg: 'bg-green-100', fill: 'bg-green-600' },
    yellow: { bg: 'bg-yellow-100', fill: 'bg-yellow-500' },
    red: { bg: 'bg-red-100', fill: 'bg-red-600' },
    purple: { bg: 'bg-purple-100', fill: 'bg-purple-600' },
    auto: {
      bg: 'bg-gray-100',
      fill: percentage >= 100 ? 'bg-green-600' : percentage >= 75 ? 'bg-blue-600' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-600'
    }
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={`w-full ${colors.bg} rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`${colors.fill} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {max > 0 && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">0</span>
          <span className="text-xs text-gray-500">Meta: {max.toLocaleString('pt-BR')}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
