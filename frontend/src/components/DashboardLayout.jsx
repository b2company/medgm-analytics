import React from 'react';

/**
 * Layout padrão para dashboards com estrutura profissional
 * Similar ao exemplo fornecido, mas adaptado para MedGM
 */
const DashboardLayout = ({
  title,
  subtitle,
  actions,
  filters,
  children
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container principal com max-width */}
      <div className="mx-auto" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
        {/* Header fixo */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Título e subtítulo */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-500 mt-1 text-base">{subtitle}</p>
                )}
              </div>

              {/* Ações (botões) */}
              {actions && (
                <div className="flex items-center gap-3 flex-wrap">
                  {actions}
                </div>
              )}
            </div>

            {/* Filtros (se houver) */}
            {filters && (
              <div className="mt-6">
                {filters}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="px-4 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
