import React, { useState } from 'react';

/**
 * Seção expansível para organizar conteúdo do dashboard
 * Inspirado no design moderno com container queries
 */
const DashboardSection = ({
  title,
  subtitle,
  icon,
  children,
  defaultExpanded = true,
  collapsible = false,
  actions = null
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header da seção */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {icon && (
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white text-lg">{icon}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h2>
                {collapsible && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={isExpanded ? 'Recolher' : 'Expandir'}
                  >
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Ações da seção */}
          {actions && (
            <div className="flex items-center gap-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo da seção */}
      {(!collapsible || isExpanded) && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default DashboardSection;
