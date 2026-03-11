import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * MetricCard - Componente premium para exibir KPIs
 * Usa o design system MedGM 2026
 *
 * @param {string} title - Título da métrica
 * @param {string|number} value - Valor principal
 * @param {string} subtitle - Texto auxiliar ou período
 * @param {number} change - Variação percentual (ex: 12.5 para +12.5%)
 * @param {string} variant - Estilo do card: 'default' | 'gold' | 'premium'
 * @param {React.ReactNode} icon - Ícone opcional (Lucide React)
 * @param {boolean} loading - Estado de carregamento
 */
const MetricCard = ({
  title,
  value,
  subtitle,
  change,
  variant = 'default',
  icon: Icon,
  loading = false
}) => {
  const isPositive = change > 0;
  const isNegative = change < 0;

  const cardClasses = {
    default: 'card-premium',
    gold: 'card-gold',
    premium: 'card-premium border-medgm-gold/30'
  };

  if (loading) {
    return (
      <div className={`${cardClasses[variant]} p-6 animate-fade-in`}>
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton-text w-24 h-4" />
          {Icon && <div className="skeleton-circle w-10 h-10" />}
        </div>
        <div className="skeleton-text w-32 h-8 mb-2" />
        {subtitle && <div className="skeleton-text w-20 h-4" />}
      </div>
    );
  }

  return (
    <div className={`${cardClasses[variant]} p-6 group animate-fade-in cursor-default`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="metric-label">{title}</p>
        {Icon && (
          <div className="p-2 rounded-lg bg-medgm-gold/10 text-medgm-gold group-hover:bg-medgm-gold group-hover:text-white transition-all duration-200">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="metric-value mb-2">{value}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-sm text-medgm-gray-600">{subtitle}</p>
        )}

        {change !== undefined && change !== null && (
          <div className="flex items-center gap-1.5">
            {isPositive && (
              <>
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="metric-change-positive">
                  +{change.toFixed(1)}%
                </span>
              </>
            )}
            {isNegative && (
              <>
                <TrendingDown className="w-4 h-4 text-danger" />
                <span className="metric-change-negative">
                  {change.toFixed(1)}%
                </span>
              </>
            )}
            {!isPositive && !isNegative && (
              <span className="text-sm font-medium text-medgm-gray-600">
                {change.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
