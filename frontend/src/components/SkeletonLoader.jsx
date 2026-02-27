import React from 'react';

/**
 * SkeletonLoader - Componente de loading state moderno
 * Usando skeleton screens ao invés de spinners para melhor UX
 */

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 min-h-[180px] animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    <div className="mb-4">
      <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-2 bg-gray-200 rounded-full w-full"></div>
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
    <div className="border-b border-gray-200">
      <div className="flex gap-4 p-4 bg-gray-50">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={idx} className="h-4 bg-gray-200 rounded flex-1"></div>
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 p-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const SkeletonChart = ({ height = 300 }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 animate-pulse">
    <div className="mb-4">
      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-48"></div>
    </div>
    <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-gray-200 rounded-t w-full"
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
        className="h-4 bg-gray-200 rounded"
        style={{ width: idx === lines - 1 ? '80%' : '100%' }}
      ></div>
    ))}
  </div>
);

const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Cards KPI */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>

    {/* Gráfico */}
    <SkeletonChart />

    {/* Tabela */}
    <SkeletonTable rows={5} columns={5} />
  </div>
);

const SkeletonLoader = {
  Card: SkeletonCard,
  Table: SkeletonTable,
  Chart: SkeletonChart,
  Text: SkeletonText,
  Dashboard: SkeletonDashboard
};

export default SkeletonLoader;

// Componente standalone para compatibilidade
export const LoadingSkeleton = SkeletonDashboard;
