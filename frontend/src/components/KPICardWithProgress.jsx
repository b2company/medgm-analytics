import React from 'react';
import InfoTooltip from './InfoTooltip';

const KPICardWithProgress = ({
  title,
  value,
  meta,
  subtitle,
  formatter = (v) => v,
  showProgress = true,
  progressPercent = null,
  info = null,
  icon = null,
  trend = null
}) => {
  // Calcular percentual se não fornecido
  const percent = progressPercent !== null
    ? progressPercent
    : meta > 0 ? (value / meta * 100) : 0;

  // Determinar cor baseado no percentual (usando dourado da marca)
  const getColor = (pct) => {
    if (pct >= 80) return 'bg-amber-500';
    if (pct >= 40) return 'bg-yellow-400';
    return 'bg-gray-300';
  };

  const getTextColor = (pct) => {
    if (pct >= 80) return 'text-amber-600';
    if (pct >= 40) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const progressColor = getColor(percent);
  const textColor = getTextColor(percent);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-xl">{icon}</span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              {title}
              {info && <InfoTooltip text={info} />}
            </h3>
            {trend && (
              <div className={`text-xs font-semibold mt-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-4xl font-bold text-gray-900 break-words">{formatter(value)}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {showProgress && meta && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Meta: {formatter(meta)}</span>
            <span className={`text-sm font-bold ${textColor}`}>
              {percent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`${progressColor} h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICardWithProgress;
