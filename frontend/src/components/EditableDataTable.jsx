import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown, Trash2, Edit2 } from 'lucide-react';
import Button from './Button';
import Checkbox from './Checkbox';

/**
 * EditableDataTable - Tabela premium MedGM 2026 com edição inline e bulk delete
 *
 * @param {Array} columns - Colunas: [{ key, label, format, sortable, showTotal, align, bold, render }]
 * @param {Array} data - Dados da tabela
 * @param {boolean} showTotal - Mostrar linha de total
 * @param {string} totalLabel - Label da linha de total
 * @param {function} onUpdate - Callback de atualização (id, updatedData)
 * @param {function} onDelete - Callback de deleção individual
 * @param {function} onBulkDelete - Callback de deleção em massa
 * @param {boolean} showActions - Mostrar coluna de ações
 * @param {boolean} enableBulkSelect - Habilitar seleção em massa
 * @param {Array} editableColumns - Array de column keys que podem ser editados
 * @param {string} rowKeyField - Campo usado como ID único (default: 'id')
 */
const EditableDataTable = ({
  columns,
  data,
  showTotal = false,
  totalLabel = 'TOTAL',
  onUpdate = null,
  onDelete = null,
  onBulkDelete = null,
  showActions = false,
  enableBulkSelect = false,
  editableColumns = [],
  rowKeyField = 'id'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, columnKey }
  const [editValue, setEditValue] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
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

  // Seleção em massa
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(sortedData.map(row => row[rowKeyField]));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;

    const selectedData = data.filter(row => selectedRows.has(row[rowKeyField]));
    if (onBulkDelete) {
      onBulkDelete(selectedData);
      setSelectedRows(new Set());
    }
  };

  const allSelected = sortedData.length > 0 && sortedData.every(row => selectedRows.has(row[rowKeyField]));
  const someSelected = sortedData.some(row => selectedRows.has(row[rowKeyField])) && !allSelected;

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
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 ml-1 text-medgm-gold" />
      : <ChevronDown className="w-4 h-4 ml-1 text-medgm-gold" />;
  };

  const isEditing = (rowIndex, columnKey) => {
    return editingCell?.rowIndex === rowIndex && editingCell?.columnKey === columnKey;
  };

  const isEditable = (columnKey) => {
    return editableColumns.includes(columnKey);
  };

  return (
    <div>
      {/* Toolbar de ações em massa */}
      {enableBulkSelect && selectedRows.size > 0 && (
        <div className="mb-4 p-4 bg-medgm-gold/10 border border-medgm-gold/30 rounded-lg flex items-center justify-between animate-fade-in">
          <p className="text-sm font-medium text-medgm-black">
            {selectedRows.size} {selectedRows.size === 1 ? 'item selecionado' : 'itens selecionados'}
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleBulkDelete}
            leftIcon={Trash2}
          >
            Deletar selecionados
          </Button>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:mx-0 shadow-card border border-medgm-gray-200 rounded-xl">
        <div className="max-h-[600px] overflow-y-auto scrollbar-medgm">
          <table className="table-medgm">
            {/* Header */}
            <thead className="sticky top-0 z-10 shadow-sm bg-medgm-gray-50">
              <tr>
                {/* Checkbox Select All */}
                {enableBulkSelect && (
                  <th className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="flex items-center justify-center"
                    />
                  </th>
                )}
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                    className={`${
                      column.sortable !== false ? 'cursor-pointer hover:bg-medgm-gray-100 select-none transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {isEditable(column.key) && <Edit2 className="w-3 h-3 text-medgm-gold" />}
                      {column.sortable !== false && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
                {showActions && (
                  <th className="sticky right-0 bg-medgm-gray-50 text-right">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
          {/* Body */}
          <tbody>
            {sortedData.map((row, rowIdx) => {
              const rowId = row[rowKeyField];
              const isSelected = selectedRows.has(rowId);

              return (
                <tr
                  key={rowIdx}
                  className={isSelected ? 'bg-medgm-gold/5' : ''}
                >
                  {/* Checkbox de seleção */}
                  {enableBulkSelect && (
                    <td>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                        className="flex items-center justify-center"
                      />
                    </td>
                  )}
                  {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      onClick={() => handleCellClick(row, rowIdx, column.key)}
                      className={`${
                        column.align === 'right' ? 'text-right' :
                        column.align === 'center' ? 'text-center' :
                        'text-left'
                      } ${column.bold ? 'font-semibold text-medgm-black' : ''} ${
                        isEditable(column.key) ? 'cursor-pointer hover:bg-medgm-gold/10 transition-colors' : ''
                      } ${isEditing(rowIdx, column.key) ? 'bg-medgm-gold/20' : ''}`}
                    >
                      {isEditing(rowIdx, column.key) ? (
                        <input
                          ref={inputRef}
                          type={column.format === 'currency' || column.format === 'number' ? 'number' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleBlur}
                          className="input-medgm w-full !py-1"
                        />
                      ) : (
                        <div className="break-words max-w-xs">
                          {column.render ? column.render(row[column.key], row) : formatValue(row[column.key], column)}
                        </div>
                      )}
                    </td>
                  ))}
                  {showActions && (
                    <td className="text-right sticky right-0 bg-inherit">
                      <div className="flex justify-end gap-2">
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-2 text-danger hover:bg-danger hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                            aria-label="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {/* Total Row */}
            {showTotal && (
              <tr className="bg-medgm-gold/10 font-semibold sticky bottom-0 shadow-md border-t-2 border-medgm-gold">
                {enableBulkSelect && <td></td>}
                {columns.map((column, idx) => (
                  <td
                    key={idx}
                    className={`${
                      column.align === 'right' ? 'text-right' :
                      column.align === 'center' ? 'text-center' :
                      'text-left'
                    } text-medgm-black`}
                  >
                    {idx === 0 ? totalLabel : calculateTotal(column.key, column)}
                  </td>
                ))}
                {showActions && <td className="sticky right-0 bg-medgm-gold/10"></td>}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ajuda */}
      <div className="bg-medgm-gold/5 px-4 py-2 text-xs text-medgm-dark border-t border-medgm-gold/20">
        <Edit2 className="w-3 h-3 inline mr-1 text-medgm-gold" />
        <strong>Dica:</strong> Clique em qualquer célula editável para modificar. Pressione Enter ou Tab para salvar, ESC para cancelar.
      </div>
    </div>
    </div>
  );
};

export default EditableDataTable;
