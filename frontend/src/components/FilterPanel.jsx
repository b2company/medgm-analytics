import React from 'react';

const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalRecords,
  filteredRecords,
  children
}) => {
  // Contar filtros ativos (não vazios)
  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'ativo' : 'ativos'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {totalRecords !== undefined && filteredRecords !== undefined && (
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredRecords}</span> de {totalRecords} registros
            </span>
          )}
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Área dos filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>

      {/* Badges de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Filtros ativos:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === '') return null;

              // Formatar label do filtro
              const labels = {
                dataInicio: 'Data Início',
                dataFim: 'Data Fim',
                sdr: 'SDR',
                closer: 'Closer',
                funil: 'Funil',
                vendedor: 'Vendedor'
              };

              const label = labels[key] || key;

              return (
                <div
                  key={key}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  <span>{label}:</span>
                  <span className="font-bold">{value}</span>
                  <button
                    onClick={() => onFilterChange(key, '')}
                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
