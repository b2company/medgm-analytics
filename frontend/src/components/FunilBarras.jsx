import React from 'react';
import { ArrowDown } from 'lucide-react';

const FunilBarras = ({ stages }) => {
  const getStatusColor = (index) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-indigo-500 to-indigo-600',
      'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-gradient-to-r from-emerald-500 to-emerald-600'
    ];
    return colors[index] || 'bg-gradient-to-r from-slate-500 to-slate-600';
  };

  // Larguras fixas decrescentes
  const getWidth = (index, total) => {
    if (total === 3) {
      return ['100%', '75%', '50%'][index];
    }
    if (total === 4) {
      return ['100%', '80%', '60%', '40%'][index];
    }
    // Default para outros casos
    const step = 100 / (total + 1);
    return `${100 - (step * index)}%`;
  };

  // Conversão do primeiro ao último
  const conversionTotal = stages.length > 1
    ? ((stages[stages.length - 1].value / stages[0].value) * 100).toFixed(1)
    : null;

  return (
    <div className="relative pr-12">
      <div className="space-y-1.5">
        {stages.map((stage, index) => {
          const conversion = index < stages.length - 1
            ? ((stages[index + 1].value / stage.value) * 100).toFixed(1)
            : null;

          return (
            <div key={index} className="space-y-1">
              {/* Barra Centralizada */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-800">{stage.name}</span>
                <div
                  className="relative group"
                  style={{ width: getWidth(index, stages.length) }}
                >
                  <div
                    className={`h-8 ${getStatusColor(index)} rounded-xl transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm`}
                  >
                    <span className="text-white font-extrabold text-[11px] drop-shadow-md">{stage.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Taxa de Conversão */}
              {conversion && (
                <div className="flex items-center justify-center">
                  <div className="text-[9px] font-bold text-slate-700 bg-gradient-to-br from-slate-100/90 to-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md border border-slate-200/40">
                    ↓ {conversion}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Seta Lateral Simples com Conversão Total */}
      {conversionTotal && (
        <div className="absolute right-1 top-4 bottom-4 flex items-end">
          <div className="relative h-full flex flex-col items-center">
            {/* Linha vertical simples */}
            <div className="w-0.5 bg-emerald-500 flex-1" />

            {/* Seta na ponta embaixo */}
            <div className="flex flex-col items-center -mt-1">
              <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[8px] font-bold text-emerald-700 bg-white px-1 py-0.5 rounded mt-0.5">{conversionTotal}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunilBarras;
