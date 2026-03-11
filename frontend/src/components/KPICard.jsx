import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const KPICard = ({
  titulo,
  valor,
  valorFormatado,
  meta,
  metaFormatada,
  percentual,
  variacao,
  valorAnterior,
  valorAnteriorFormatado,
  onClick
}) => {
  // Determinar cor do card baseado na saúde
  const getCardColor = () => {
    if (percentual < 30) return 'border-red-300 bg-red-50';
    if (percentual < 70) return 'border-amber-300 bg-amber-50';
    return 'border-emerald-300 bg-emerald-50';
  };

  const getProgressColor = () => {
    if (percentual < 30) return 'bg-red-500';
    if (percentual < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getTextColor = () => {
    if (percentual < 30) return 'text-red-700';
    if (percentual < 70) return 'text-amber-700';
    return 'text-emerald-700';
  };

  const getAlertIcon = () => {
    if (percentual < 30) return <AlertTriangle className="w-3 h-3 text-red-600" />;
    if (percentual < 70) return <AlertTriangle className="w-3 h-3 text-amber-600" />;
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-2 transition-all hover:shadow-md cursor-pointer ${getCardColor()}`}
    >
      {/* Header: Título + Status */}
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-[9px] font-bold text-slate-700 uppercase tracking-wide">{titulo}</h3>
        <div className="flex items-center gap-1">
          {getAlertIcon()}
          <span className={`text-[10px] font-bold ${getTextColor()}`}>
            {percentual.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Número Principal */}
      <div className="mb-1.5">
        <div className="text-lg font-bold text-slate-900">
          {valorFormatado}
        </div>
      </div>

      {/* Barra de Progresso com Label */}
      <div className="mb-1.5">
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-2 ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${Math.min(percentual, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[8px] text-slate-600">
            {percentual.toFixed(0)}% da meta
          </span>
          <span className="text-[8px] text-slate-600 font-medium">
            Meta: {metaFormatada}
          </span>
        </div>
      </div>

      {/* Rodapé: Comparativo vs Mês Anterior */}
      <div className="pt-1.5 border-t border-slate-300/50">
        <div className="flex items-center justify-between text-[8px]">
          <div className="flex items-center gap-0.5">
            <span className="text-slate-600">vs LM:</span>
            <span className={`font-bold flex items-center gap-0.5 ${variacao >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {variacao >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {variacao >= 0 ? '+' : ''}{variacao.toFixed(0)}%
            </span>
          </div>
          <span className="text-slate-500">
            {valorAnteriorFormatado}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
