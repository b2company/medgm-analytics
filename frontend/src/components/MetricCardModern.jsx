import React from 'react';

/**
 * MetricCard Moderno - Baseado nas melhores práticas de UX 2026
 * Features:
 * - Ícone SVG colorido
 * - Indicador de tendência (+15% verde / -5% vermelho)
 * - Hover state com shadow-xl
 * - Transitions suaves (200ms)
 * - Cursor pointer quando clicável
 */
const MetricCardModern = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  onClick,
  className = ''
}) => {
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
      value: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
      value: 'text-green-900'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      value: 'text-red-900'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      value: 'text-yellow-900'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-100',
      value: 'text-purple-900'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      iconBg: 'bg-gray-100',
      value: 'text-gray-900'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  const getTrendColor = () => {
    if (!trend) return '';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${scheme.bg} rounded-xl p-6 shadow-md
        hover:shadow-xl transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
        min-h-[180px] flex flex-col
        ${className}
      `}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Header com Ícone */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${scheme.iconBg} p-3 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center`}>
          {Icon && <Icon className={`w-6 h-6 ${scheme.icon}`} />}
        </div>

        {/* Indicador de Tendência */}
        {trend && trendValue && (
          <div className={`flex items-center gap-1 ${getTrendColor()} text-sm font-semibold`}>
            {getTrendIcon()}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>

      {/* Título */}
      <p className="text-sm md:text-base font-medium text-gray-600 mb-2">{title}</p>

      {/* Valor Principal */}
      <p className={`text-2xl md:text-3xl font-bold ${scheme.value} mb-1 break-words flex-grow`}>{value}</p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-gray-500 mt-auto">{subtitle}</p>
      )}
    </div>
  );
};

export default MetricCardModern;
