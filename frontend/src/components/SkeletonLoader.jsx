import React from 'react';

/**
 * SkeletonLoader - Loading states premium MedGM 2026
 * Skeleton screens (não spinners) para melhor UX
 */

const SkeletonCard = () => (
  <div className="card-premium p-6 min-h-[180px] animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 skeleton-medgm rounded-lg flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 skeleton-medgm rounded w-24 mb-2"></div>
        <div className="h-3 skeleton-medgm rounded w-16"></div>
      </div>
    </div>
    <div className="mb-4">
      <div className="h-8 skeleton-medgm rounded w-32 mb-2"></div>
      <div className="h-3 skeleton-medgm rounded w-20"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 skeleton-medgm rounded w-full"></div>
      <div className="h-2 skeleton-medgm rounded-full w-3/4"></div>
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-xl shadow-card border border-medgm-gray-200 overflow-hidden animate-pulse">
    {/* Header */}
    <div className="border-b border-medgm-gray-200">
      <div className="flex gap-4 p-4 bg-medgm-gray-50">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={idx} className="h-4 skeleton-medgm rounded flex-1"></div>
        ))}
      </div>
    </div>
    {/* Rows */}
    <div className="divide-y divide-medgm-gray-200">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 p-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className="h-4 skeleton-medgm rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const SkeletonChart = ({ height = 300 }) => (
  <div className="card-premium p-6 animate-pulse">
    {/* Chart Title */}
    <div className="mb-6">
      <div className="h-5 skeleton-medgm rounded w-32 mb-2"></div>
      <div className="h-3 skeleton-medgm rounded w-48"></div>
    </div>
    {/* Chart Bars */}
    <div
      className="flex items-end justify-between gap-2"
      style={{ height: `${height}px` }}
    >
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton-medgm rounded-t w-full"
          style={{ height: `${Math.random() * 60 + 40}%` }}
        ></div>
      ))}
    </div>
  </div>
);

const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, idx) => (
      <div
        key={idx}
        className="h-4 skeleton-medgm rounded"
        style={{ width: idx === lines - 1 ? '80%' : '100%' }}
      ></div>
    ))}
  </div>
);

const SkeletonMetric = () => (
  <div className="card-premium p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-3 skeleton-medgm rounded w-24"></div>
      <div className="w-10 h-10 skeleton-medgm rounded-lg"></div>
    </div>
    <div className="h-8 skeleton-medgm rounded w-28 mb-2"></div>
    <div className="h-4 skeleton-medgm rounded w-16"></div>
  </div>
);

const SkeletonDashboard = () => (
  <div className="space-y-6 p-6">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <SkeletonMetric key={idx} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart height={300} />
      <SkeletonChart height={300} />
    </div>

    {/* Table */}
    <SkeletonTable rows={5} columns={5} />
  </div>
);

/**
 * Spinner - Spinner premium para loading inline
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`spinner-medgm ${sizeClasses[size]} ${className}`} />
  );
};

/**
 * LoadingOverlay - Overlay de loading fullscreen
 */
export const LoadingOverlay = ({ message = 'Carregando...' }) => (
  <div className="fixed inset-0 bg-medgm-clean/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="card-premium p-8 text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-medgm-dark font-medium">{message}</p>
    </div>
  </div>
);

const SkeletonLoader = {
  Card: SkeletonCard,
  Table: SkeletonTable,
  Chart: SkeletonChart,
  Text: SkeletonText,
  Metric: SkeletonMetric,
  Dashboard: SkeletonDashboard
};

export default SkeletonLoader;

// Componente standalone para compatibilidade
export const LoadingSkeleton = SkeletonDashboard;
