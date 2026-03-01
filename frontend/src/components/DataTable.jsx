import React, { useState } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import Checkbox from './Checkbox';

/**
 * DataTable - Tabela premium MedGM 2026
 * Com sort, paginação, ações, totais, SELEÇÃO EM MASSA
 *
 * @param {Array} columns - Colunas: [{ key, label, format, sortable, showTotal, align, bold, render }]
 * @param {Array} data - Dados da tabela
 * @param {boolean} showTotal - Mostrar linha de total
 * @param {string} totalLabel - Label da linha de total
 * @param {function} onEdit - Callback de edição
 * @param {function} onDelete - Callback de deleção
 * @param {function} onBulkDelete - Callback de deleção em massa
 * @param {boolean} showActions - Mostrar coluna de ações
 * @param {boolean} enableBulkSelect - Habilitar seleção em massa
 * @param {number} itemsPerPage - Items por página (null = sem paginação)
 * @param {string} rowKeyField - Campo usado como ID único (default: 'id')
 */
const DataTable = ({
  columns,
  data,
  showTotal = false,
  totalLabel = 'TOTAL',
  onEdit = null,
  onDelete = null,
  onBulkDelete = null,
  showActions = false,
  enableBulkSelect = false,
  itemsPerPage = null,
  rowKeyField = 'id'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());

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

  // Paginação
  const totalPages = itemsPerPage ? Math.ceil(sortedData.length / itemsPerPage) : 1;
  const paginatedData = itemsPerPage
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Seleção em massa
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(paginatedData.map(row => row[rowKeyField]));
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

  const allSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(row[rowKeyField]));
  const someSelected = paginatedData.some(row => selectedRows.has(row[rowKeyField])) && !allSelected;

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
              {paginatedData.map((row, rowIdx) => {
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
                        className={`${
                          column.align === 'right' ? 'text-right' :
                          column.align === 'center' ? 'text-center' :
                          'text-left'
                        } ${column.bold ? 'font-semibold text-medgm-black' : ''}`}
                      >
                        <div className="break-words max-w-xs">
                          {column.render ? column.render(row[column.key], row) : formatValue(row[column.key], column)}
                        </div>
                      </td>
                    ))}
                    {showActions && (
                      <td className="text-right sticky right-0 bg-inherit">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="p-2 text-medgm-gold hover:bg-medgm-gold hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                              aria-label="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
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

        {/* Paginação */}
        {itemsPerPage && totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-medgm-gray-200 sm:px-6">
            {/* Mobile */}
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                leftIcon={ChevronLeft}
              >
                Anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                rightIcon={ChevronRight}
              >
                Próximo
              </Button>
            </div>

            {/* Desktop */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-medgm-gray-600">
                  Mostrando <span className="font-medium text-medgm-black">{(currentPage - 1) * itemsPerPage + 1}</span> até{' '}
                  <span className="font-medium text-medgm-black">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> de{' '}
                  <span className="font-medium text-medgm-black">{sortedData.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-medgm-gray-300 bg-white text-medgm-gray-600 hover:bg-medgm-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Números de página */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'z-10 bg-medgm-gold border-medgm-gold text-white shadow-premium'
                            : 'bg-white border-medgm-gray-300 text-medgm-gray-700 hover:bg-medgm-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-medgm-gray-300 bg-white text-medgm-gray-600 hover:bg-medgm-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
