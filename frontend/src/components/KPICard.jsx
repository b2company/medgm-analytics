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
  // Determinar cor do card baseado na saúde (glassmorphism)
  const getCardColor = () => {
    if (percentual < 30) return 'border-red-200/40 bg-gradient-to-br from-red-50/90 to-white/80';
    if (percentual < 70) return 'border-amber-200/40 bg-gradient-to-br from-amber-50/90 to-white/80';
    return 'border-emerald-200/40 bg-gradient-to-br from-emerald-50/90 to-white/80';
  };

  const getProgressColor = () => {
    if (percentual < 30) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (percentual < 70) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
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
      className={`backdrop-blur-md border rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer ${getCardColor()} shadow-lg`}
    >
      {/* Header: Título + Status */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{titulo}</h3>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm">
          {getAlertIcon()}
          <span className={`text-[11px] font-extrabold ${getTextColor()}`}>
            {percentual.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Número Principal */}
      <div className="mb-2">
        <div className="text-2xl font-extrabold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {valorFormatado}
        </div>
      </div>

      {/* Barra de Progresso com Label */}
      <div className="mb-2">
        <div className="relative h-2.5 bg-white/60 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
          <div
            className={`h-2.5 ${getProgressColor()} transition-all duration-700 ease-out shadow-lg`}
            style={{ width: `${Math.min(percentual, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-slate-700 font-semibold">
            {percentual.toFixed(0)}% da meta
          </span>
          <span className="text-[9px] text-slate-600 font-bold px-1.5 py-0.5 bg-white/60 rounded-md">
            Meta: {metaFormatada}
          </span>
        </div>
      </div>

      {/* Rodapé: Comparativo vs Mês Anterior */}
      <div className="pt-2 border-t border-white/40">
        <div className="flex items-center justify-between text-[9px]">
          <div className="flex items-center gap-1">
            <span className="text-slate-600 font-medium">vs LM:</span>
            <span className={`font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${variacao >= 0 ? 'text-emerald-700 bg-emerald-100/80' : 'text-red-700 bg-red-100/80'}`}>
              {variacao >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {variacao >= 0 ? '+' : ''}{variacao.toFixed(0)}%
            </span>
          </div>
          <span className="text-slate-600 font-semibold">
            {valorAnteriorFormatado}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
