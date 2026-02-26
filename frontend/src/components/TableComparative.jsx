import React from 'react';

const TableComparative = ({ data, columns }) => {
  const formatValue = (value, format) => {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'number':
        return value.toLocaleString('pt-BR');
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(1);
      default:
        return value;
    }
  };

  // Determinar cor de fundo para células de percentual
  const getPercentColor = (value) => {
    if (value === null || value === undefined) return '';
    if (value >= 80) return 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500';
    if (value >= 40) return 'bg-amber-50 text-amber-700 border-l-4 border-amber-500';
    return 'bg-red-50 text-red-700 border-l-4 border-red-500';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 text-${col.align || 'left'} text-xs font-semibold text-gray-700 uppercase tracking-wider`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
              {columns.map((col) => {
                const value = row[col.key];
                const isPercent = col.format === 'percent';
                const colorClass = isPercent ? getPercentColor(value) : '';
                const isFirstCol = col === columns[0];

                return (
                  <td
                    key={col.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-${col.align || 'left'} ${colorClass} ${isFirstCol ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                  >
                    {formatValue(value, col.format)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComparative;
