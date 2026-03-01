import React from 'react';

/**
 * DashboardLayout - Layout premium para dashboards MedGM 2026
 * Header fixo com backdrop blur, espaçamento generoso, design clean
 *
 * @param {string} title - Título principal do dashboard
 * @param {string} subtitle - Subtítulo ou descrição
 * @param {React.ReactNode} actions - Botões de ação (export, filters, etc)
 * @param {React.ReactNode} filters - Componente de filtros
 * @param {React.ReactNode} children - Conteúdo do dashboard (cards, charts, tables)
 * @param {string} maxWidth - Max width: 'default' | 'wide' | 'full'
 */
const DashboardLayout = ({
  title,
  subtitle,
  actions,
  filters,
  children,
  maxWidth = 'default'
}) => {
  const maxWidthClasses = {
    default: 'max-w-7xl',
    wide: 'max-w-[1600px]',
    full: 'max-w-full'
  };

  return (
    <div className="min-h-screen bg-medgm-clean">
      {/* Header Fixo com Backdrop Blur */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-medgm-gray-200 shadow-sm">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-6 lg:px-8 py-6`}>
          {/* Título e Ações */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Título */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-medgm-black tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-medgm-gray-600 mt-2 text-base font-normal">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Ações (botões) */}
            {actions && (
              <div className="flex items-center gap-3 flex-wrap">
                {actions}
              </div>
            )}
          </div>

          {/* Filtros (abaixo do header) */}
          {filters && (
            <div className="mt-6 pt-6 border-t border-medgm-gray-200">
              {filters}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-6 lg:px-8 py-8`}>
        <div className="flex flex-col gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

/**
 * DashboardSection - Seção com título opcional
 */
export const DashboardSection = ({ title, subtitle, children, className = '' }) => (
  <section className={className}>
    {(title || subtitle) && (
      <div className="mb-6">
        {title && (
          <h2 className="text-2xl font-semibold text-medgm-black mb-1">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-medgm-gray-600 text-sm">
            {subtitle}
          </p>
        )}
      </div>
    )}
    {children}
  </section>
);

/**
 * DashboardGrid - Grid responsivo para cards/widgets
 */
export const DashboardGrid = ({ cols = 4, gap = 6, children, className = '' }) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};
