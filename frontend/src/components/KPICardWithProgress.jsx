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
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 min-h-[180px] flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-10 h-10 min-w-[44px] min-h-[44px] bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-lg">{icon}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
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

      <div className="mb-3 flex-grow">
        <p className="text-2xl md:text-3xl font-bold text-gray-900 break-words">{formatter(value)}</p>
        {subtitle && (
          <p className="text-sm md:text-xs text-gray-500 mt-0.5 break-words">{subtitle}</p>
        )}
      </div>

      {showProgress && meta && (
        <div className="space-y-1.5 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm md:text-xs text-gray-500 truncate">Meta: {formatter(meta)}</span>
            <span className={`text-sm md:text-xs font-bold ${textColor} flex-shrink-0`}>
              {percent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 md:h-2 overflow-hidden">
            <div
              className={`${progressColor} h-full rounded-full transition-all duration-700 ease-out shadow-sm`}
              style={{ width: `${Math.min(percent, 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.min(percent, 100)}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`${percent.toFixed(0)}% da meta atingida`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICardWithProgress;
