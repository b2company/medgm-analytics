import React from 'react';

/**
 * Grid responsivo para organizar conteúdo do dashboard
 * Usa container queries para adaptação fluida
 */
const DashboardGrid = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6
}) => {
  // Mapear tamanhos de gap para classes Tailwind
  const gapClass = `gap-${gap}`;

  // Construir classes de grid responsivas
  const gridCols = `
    grid-cols-${cols.sm}
    md:grid-cols-${cols.md}
    lg:grid-cols-${cols.lg}
    ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`grid ${gridCols} ${gapClass}`}>
      {children}
    </div>
  );
};

/**
 * Grid para KPIs - otimizado para cards de métricas
 */
export const KPIGrid = ({ children }) => (
  <DashboardGrid
    cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
    gap={6}
  >
    {children}
  </DashboardGrid>
);

/**
 * Grid para gráficos - 2 colunas em desktop
 */
export const ChartGrid = ({ children }) => (
  <DashboardGrid
    cols={{ sm: 1, md: 1, lg: 2 }}
    gap={6}
  >
    {children}
  </DashboardGrid>
);

/**
 * Grid para cards menores - 3 colunas em desktop
 */
export const CardGrid = ({ children }) => (
  <DashboardGrid
    cols={{ sm: 1, md: 2, lg: 3 }}
    gap={4}
  >
    {children}
  </DashboardGrid>
);

export default DashboardGrid;
