import React from 'react';
import InfoTooltip from './InfoTooltip';

const CompactHorizontalFunnel = ({ stages, formatValue = (v) => v, title = null, info = null }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          {title}
          {info && <InfoTooltip text={info} />}
        </h3>
      )}

      <div className="flex items-center justify-center gap-4">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          const nextStage = stages[index + 1];
          const conversionRate = nextStage
            ? ((nextStage.value / stage.value) * 100).toFixed(1)
            : null;

          return (
            <React.Fragment key={stage.name}>
              {/* Etapa do funil */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-gray-600 mb-1">{stage.name}</span>
                <div
                  className={`${stage.color || 'bg-blue-500'} rounded-lg px-6 py-3 shadow-sm`}
                >
                  <span className="text-white text-xl font-bold">{formatValue(stage.value)}</span>
                </div>
              </div>

              {/* Seta e taxa de conversão */}
              {!isLast && conversionRate && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-green-600 mb-1">{conversionRate}%</span>
                    <svg
                      className="w-8 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CompactHorizontalFunnel;
