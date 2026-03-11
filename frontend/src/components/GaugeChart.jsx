import React from 'react';

const GaugeChart = ({ value, max = 100, label, color = '#3B82F6', size = 'md' }) => {
  const percentage = (value / max) * 100;
  const rotation = Math.min((percentage / 100) * 180, 180);

  const sizeClasses = {
    sm: { wrapper: 'w-32 h-16', text: 'text-lg', label: 'text-xs' },
    md: { wrapper: 'w-48 h-24', text: 'text-2xl', label: 'text-sm' },
    lg: { wrapper: 'w-64 h-32', text: 'text-3xl', label: 'text-base' }
  };

  const getColor = () => {
    if (percentage >= 100) return '#10B981'; // green
    if (percentage >= 75) return '#3B82F6'; // blue
    if (percentage >= 50) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const gaugeColor = color === 'auto' ? getColor() : color;

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeClasses[size].wrapper} relative overflow-hidden`}>
        {/* Background arc */}
        <div
          className="absolute inset-0 rounded-t-full"
          style={{
            background: '#E5E7EB',
            clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 0)'
          }}
        />
        {/* Foreground arc */}
        <div
          className="absolute inset-0 origin-bottom rounded-t-full transition-transform duration-700 ease-out"
          style={{
            background: gaugeColor,
            clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 0)',
            transform: `rotate(${rotation - 180}deg)`
          }}
        />
        {/* Inner circle (white) */}
        <div
          className="absolute bg-white rounded-t-full"
          style={{
            left: '15%',
            right: '15%',
            top: '30%',
            bottom: 0
          }}
        />
        {/* Value display */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-1">
          <span className={`font-bold ${sizeClasses[size].text}`} style={{ color: gaugeColor }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      {label && (
        <span className={`mt-2 text-gray-600 ${sizeClasses[size].label}`}>{label}</span>
      )}
    </div>
  );
};

export default GaugeChart;
