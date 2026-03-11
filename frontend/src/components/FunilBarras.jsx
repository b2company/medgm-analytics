import React from 'react';
import { ArrowDown } from 'lucide-react';

const FunilBarras = ({ stages }) => {
  const getStatusColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-emerald-500'
    ];
    return colors[index] || 'bg-slate-500';
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
            <div key={index} className="space-y-0.5">
              {/* Barra Centralizada */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-medium text-slate-700">{stage.name}</span>
                <div
                  className="relative"
                  style={{ width: getWidth(index, stages.length) }}
                >
                  <div
                    className={`h-6 ${getStatusColor(index)} rounded-lg transition-all duration-500 flex items-center justify-center shadow-sm`}
                  >
                    <span className="text-white font-bold text-[10px]">{stage.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Taxa de Conversão */}
              {conversion && (
                <div className="flex items-center justify-center">
                  <div className="text-[8px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
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
