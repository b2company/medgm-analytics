import React from 'react';

const FunilVisual = ({ stages, colors = [] }) => {
  const maxValue = stages[0]?.value || 1;

  const defaultColors = [
    'from-purple-500 to-purple-600',
    'from-purple-600 to-indigo-600',
    'from-indigo-600 to-blue-600',
    'from-blue-600 to-emerald-600'
  ];

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const widthPercent = (stage.value / maxValue) * 100;
        const nextWidthPercent = index < stages.length - 1
          ? (stages[index + 1].value / maxValue) * 100
          : widthPercent * 0.8;

        const conversion = index < stages.length - 1
          ? ((stages[index + 1].value / stage.value) * 100).toFixed(1)
          : null;

        return (
          <div key={index} className="space-y-1">
            {/* Funil Stage */}
            <div className="relative">
              <div
                className="mx-auto transition-all duration-500"
                style={{ width: `${widthPercent}%` }}
              >
                <div
                  className={`relative bg-gradient-to-r ${colors[index] || defaultColors[index]} text-white rounded-lg py-4 px-6 shadow-md hover:shadow-lg transition-all cursor-pointer group`}
                  style={{
                    clipPath: index < stages.length - 1
                      ? `polygon(0 0, 100% 0, ${(nextWidthPercent/widthPercent) * 95}% 100%, ${100 - (nextWidthPercent/widthPercent) * 95}% 100%)`
                      : 'none'
                  }}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="font-semibold text-sm">{stage.name}</span>
                    <span className="text-2xl font-bold">{stage.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Taxa de Conversão */}
            {conversion && (
              <div className="flex items-center justify-center">
                <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  ↓ {conversion}%
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FunilVisual;
