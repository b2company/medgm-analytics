import React, { useState } from 'react';

const DataTable = ({
  columns,
  data,
  showTotal = false,
  totalLabel = 'TOTAL',
  onEdit = null,
  onDelete = null,
  showActions = false
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;

      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig]);

  const formatValue = (value, column) => {
    if (column.format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0);
    }
    if (column.format === 'percent') {
      return `${(value || 0).toFixed(2)}%`;
    }
    if (column.format === 'number') {
      return new Intl.NumberFormat('pt-BR').format(value || 0);
    }
    if (column.format === 'date') {
      return new Date(value).toLocaleDateString('pt-BR');
    }
    return value;
  };

  const calculateTotal = (columnKey, column) => {
    if (!column.showTotal) return null;

    const total = data.reduce((sum, row) => {
      const value = typeof row[columnKey] === 'number' ? row[columnKey] : 0;
      return sum + value;
    }, 0);

    return formatValue(total, column);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable !== false && getSortIcon(column.key)}
                </div>
              </th>
            ))}
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((column, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    column.align === 'right' ? 'text-right' :
                    column.align === 'center' ? 'text-center' :
                    'text-left'
                  } ${column.bold ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                >
                  {formatValue(row[column.key], column)}
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {showTotal && (
            <tr className="bg-gray-100 font-bold">
              {columns.map((column, idx) => (
                <td
                  key={idx}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    column.align === 'right' ? 'text-right' :
                    column.align === 'center' ? 'text-center' :
                    'text-left'
                  } text-gray-900`}
                >
                  {idx === 0 ? totalLabel : calculateTotal(column.key, column)}
                </td>
              ))}
              {showActions && <td></td>}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
