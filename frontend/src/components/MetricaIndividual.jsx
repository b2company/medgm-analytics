import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricaIndividual = ({ pessoa, metrica, valor, meta, formatter = (v) => v, cor = 'blue' }) => {
  const perc = meta > 0 ? (valor / meta) * 100 : 0;

  const getColorClasses = () => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      emerald: {
        bg: 'bg-emerald-500',
        bgLight: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      },
      purple: {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200'
      },
      amber: {
        bg: 'bg-amber-500',
        bgLight: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200'
      }
    };
    return colors[cor] || colors.blue;
  };

  const getStatusColor = () => {
    if (perc >= 80) return 'bg-emerald-500';
    if (perc >= 50) return 'bg-blue-500';
    if (perc >= 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const colors = getColorClasses();

  return (
    <div className={`p-5 ${colors.bgLight} rounded-xl border ${colors.border} hover:shadow-md transition-all cursor-pointer`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-bold text-slate-900">{pessoa}</div>
          <div className="text-xs text-slate-500 mt-0.5">{metrica}</div>
        </div>
        {perc >= 80 ? (
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        ) : perc < 50 ? (
          <TrendingDown className="w-5 h-5 text-red-500" />
        ) : null}
      </div>

      {/* Valores */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">
            {formatter(valor)}
          </div>
          <div className="text-sm text-slate-500">
            de {formatter(meta)}
          </div>
        </div>
        <div className={`text-2xl font-bold ${colors.text}`}>
          {perc.toFixed(0)}%
        </div>
      </div>

      {/* Barra de Progresso Grande e Quadrada */}
      <div className="relative">
        <div className="h-8 bg-slate-200 rounded-lg overflow-hidden">
          <div
            className={`h-8 ${getStatusColor()} rounded-lg transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(perc, 100)}%` }}
          />
        </div>
        {/* Indicador de Meta */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-slate-400 rounded-r"
          style={{ left: '100%' }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-slate-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default MetricaIndividual;
