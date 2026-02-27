import React, { useState, useRef, useEffect } from 'react';

const EditableDataTable = ({
  columns,
  data,
  showTotal = false,
  totalLabel = 'TOTAL',
  onUpdate = null,
  onDelete = null,
  showActions = false,
  editableColumns = [], // Array de column keys que podem ser editados
  selectable = false, // Habilitar seleção múltipla
  selectedRows = [], // Array de IDs selecionados
  onToggleSelect = null, // Função para toggle de linha individual
  onToggleSelectAll = null // Função para toggle de todas as linhas
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, columnKey }
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

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

  const handleCellClick = (row, rowIndex, columnKey) => {
    if (!editableColumns.includes(columnKey)) return;

    setEditingCell({ rowIndex, columnKey });
    setEditValue(row[columnKey] || '');
  };

  const handleSave = async () => {
    if (!editingCell || !onUpdate) return;

    const row = sortedData[editingCell.rowIndex];
    const updatedData = {
      ...row,
      [editingCell.columnKey]: editValue
    };

    try {
      await onUpdate(row.id, updatedData);
      setEditingCell(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

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

  const isEditing = (rowIndex, columnKey) => {
    return editingCell?.rowIndex === rowIndex && editingCell?.columnKey === columnKey;
  };

  const isEditable = (columnKey) => {
    return editableColumns.includes(columnKey);
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 shadow-sm border border-gray-200 rounded-lg">
      <div className="max-h-[600px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-12 bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedRows.length > 0 && selectedRows.length === data.length}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[44px] ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 select-none transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {isEditable(column.key) && <span className="text-blue-500 text-xs">✏️</span>}
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {showActions && (
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider sticky right-0 bg-gray-50">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIdx) => (
              <tr key={rowIdx} className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                {selectable && (
                  <td className="px-4 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => onToggleSelect(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((column, colIdx) => (
                  <td
                    key={colIdx}
                    onClick={() => handleCellClick(row, rowIdx, column.key)}
                    className={`px-4 sm:px-6 py-4 text-sm ${
                      column.align === 'right' ? 'text-right' :
                      column.align === 'center' ? 'text-center' :
                      'text-left'
                    } ${column.bold ? 'font-semibold text-gray-900' : 'text-gray-700'} ${
                      isEditable(column.key) ? 'cursor-pointer hover:bg-yellow-50' : ''
                    } ${isEditing(rowIdx, column.key) ? 'bg-blue-100' : ''}`}
                  >
                    {isEditing(rowIdx, column.key) ? (
                      <input
                        ref={inputRef}
                        type={column.format === 'currency' || column.format === 'number' ? 'number' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="break-words max-w-xs">
                        {column.render ? column.render(row[column.key], row) : formatValue(row[column.key], column)}
                      </div>
                    )}
                  </td>
                ))}
                {showActions && (
                  <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium sticky right-0 bg-inherit">
                    <div className="flex justify-end gap-2">
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Deletar registro"
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
              <tr className="bg-gray-100 font-bold sticky bottom-0 shadow-md">
                {selectable && <td className="px-4 py-4 w-12 bg-gray-100"></td>}
                {columns.map((column, idx) => (
                  <td
                    key={idx}
                    className={`px-4 sm:px-6 py-4 text-sm ${
                      column.align === 'right' ? 'text-right' :
                      column.align === 'center' ? 'text-center' :
                      'text-left'
                    } text-gray-900`}
                  >
                    {idx === 0 ? totalLabel : calculateTotal(column.key, column)}
                  </td>
                ))}
                {showActions && <td className="sticky right-0 bg-gray-100"></td>}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ajuda */}
      <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 border-t border-blue-200">
        💡 <strong>Dica:</strong> Clique em qualquer célula com ✏️ para editar. Pressione Enter ou Tab para salvar, ESC para cancelar.
      </div>
    </div>
  );
};

export default EditableDataTable;
