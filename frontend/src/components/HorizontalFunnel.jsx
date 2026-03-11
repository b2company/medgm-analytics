import React from 'react';
import InfoTooltip from './InfoTooltip';

const HorizontalFunnel = ({ stages, formatValue = (v) => v, title = null, info = null }) => {
  // Larguras fixas decrescentes para formato de funil
  const funnelWidths = [90, 70, 50, 35, 25]; // Percentuais fixos decrescentes

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          {title}
          {info && <InfoTooltip text={info} />}
        </h3>
      )}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const widthPercent = funnelWidths[index] || 20; // Usa largura fixa do array
          const isLast = index === stages.length - 1;

          // Calcular taxa de conversão para a próxima etapa
          const nextStage = stages[index + 1];
          const conversionRate = nextStage
            ? ((nextStage.value / stage.value) * 100).toFixed(1)
            : null;

          return (
            <div key={stage.name} className="flex flex-col items-center">
              {/* Nome da etapa acima da barra */}
              <span className="text-sm font-semibold text-gray-700 mb-2">{stage.name}</span>

              {/* Barra do funil com número centralizado */}
              <div
                className={`${stage.color || 'bg-blue-500'} rounded-xl h-16 flex items-center justify-center shadow-md transition-all duration-500 hover:shadow-lg hover:scale-[1.02]`}
                style={{ width: `${widthPercent}%` }}
              >
                <span className="text-white text-2xl font-bold drop-shadow-sm">{formatValue(stage.value)}</span>
              </div>

              {/* Taxa de conversão abaixo da barra */}
              {!isLast && conversionRate && (
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {conversionRate}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalFunnel;
