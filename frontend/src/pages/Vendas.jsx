import React, { useState, useEffect } from 'react';
import { getVendas, createVenda, updateVenda, deleteVenda } from '../services/api';
import Modal from '../components/Modal';
import VendaForm from '../components/VendaForm';
import EditableDataTable from '../components/EditableDataTable';
import UploadComercialModal from '../components/UploadComercialModal';
import FilterPanel from '../components/FilterPanel';
import { FilterSelect, FilterDateRange } from '../components/FilterInput';

const Vendas = ({ mes: mesProp, ano: anoProp }) => {
  const mes = mesProp || new Date().getMonth() + 1;
  const ano = anoProp || new Date().getFullYear();

  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingVenda, setEditingVenda] = useState(null);
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', closer: '', funil: '' });
  const [selectedVendas, setSelectedVendas] = useState([]);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  useEffect(() => {
    fetchVendas();
  }, [mes, ano]);

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const data = await getVendas(mes, ano);
      console.log(`📊 Vendas ${meses[mes - 1]}/${ano}:`, data);
      setVendas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setVendas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data, isEdit) => {
    try {
      if (isEdit && editingVenda) {
        await updateVenda(editingVenda.id, data);
      } else {
        await createVenda(data);
      }
      setShowModal(false);
      setEditingVenda(null);
      fetchVendas();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Deseja realmente deletar esta venda?')) return;
    try {
      await deleteVenda(row.id);
      fetchVendas();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar venda');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedVendas.length === 0) return;

    const confirm = window.confirm(
      `Deseja realmente deletar ${selectedVendas.length} venda(s) selecionada(s)?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirm) return;

    setLoading(true);
    try {
      // Deletar todas as vendas selecionadas em paralelo
      await Promise.all(selectedVendas.map(id => deleteVenda(id)));
      setSelectedVendas([]);
      fetchVendas();
      alert(`${selectedVendas.length} venda(s) deletada(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao deletar vendas:', error);
      alert('Erro ao deletar algumas vendas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectVenda = (id) => {
    setSelectedVendas(prev =>
      prev.includes(id)
        ? prev.filter(vendaId => vendaId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVendas.length === vendasFiltradas.length) {
      setSelectedVendas([]);
    } else {
      setSelectedVendas(vendasFiltradas.map(v => v.id));
    }
  };

  const handleInlineUpdate = async (id, updatedRow) => {
    try {
      await updateVenda(id, updatedRow);
      await fetchVendas();
    } catch (error) {
      console.error('Erro ao atualizar inline:', error);
      alert('Erro ao atualizar. Tente novamente.');
      throw error;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const vendasFiltradas = vendas.filter(v => {
    // Filtro de data
    if (filtros.dataInicio || filtros.dataFim) {
      const vendaData = v.data_venda ? new Date(v.data_venda) : null;
      if (vendaData) {
        if (filtros.dataInicio) {
          const [dia, mes, ano] = filtros.dataInicio.split('/');
          const dataInicio = new Date(ano, mes - 1, dia);
          if (vendaData < dataInicio) return false;
        }
        if (filtros.dataFim) {
          const [dia, mes, ano] = filtros.dataFim.split('/');
          const dataFim = new Date(ano, mes - 1, dia);
          dataFim.setHours(23, 59, 59);
          if (vendaData > dataFim) return false;
        }
      }
    }

    if (filtros.closer && v.closer !== filtros.closer) return false;
    if (filtros.funil && v.funil !== filtros.funil) return false;
    return true;
  });

  // Listas únicas para filtros
  const closersUnicos = [...new Set(vendas.map(v => v.closer).filter(Boolean))].sort();
  const funisUnicos = [...new Set(vendas.map(v => v.funil).filter(Boolean))].sort();

  const totais = vendasFiltradas.reduce((acc, v) => ({
    previsto: acc.previsto + (v.previsto || 0),
    valor_bruto: acc.valor_bruto + (v.valor_bruto || 0),
    valor_liquido: acc.valor_liquido + (v.valor_liquido || 0)
  }), { previsto: 0, valor_bruto: 0, valor_liquido: 0 });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestão de Vendas - {meses[mes - 1]} {ano}
          </h1>
          {selectedVendas.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedVendas.length} venda(s) selecionada(s)
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {selectedVendas.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Deletar Selecionadas ({selectedVendas.length})
            </button>
          )}
          <button
            onClick={() => { setEditingVenda(null); setShowModal(true); }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            + Nova Venda
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📤 Upload em Massa
          </button>
        </div>
      </div>

      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Total Previsto</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(totais.previsto)}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Faturamento Bruto</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(totais.valor_bruto)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-medium">Faturamento Líquido</p>
          <p className="text-2xl font-bold text-orange-900">{formatCurrency(totais.valor_liquido)}</p>
        </div>
      </div>

      {/* Filtros para Tabela */}
      <FilterPanel
        filters={filtros}
        onFilterChange={(key, value) => setFiltros({ ...filtros, [key]: value })}
        onClearFilters={() => setFiltros({ dataInicio: '', dataFim: '', closer: '', funil: '' })}
        totalRecords={vendas.length}
        filteredRecords={vendasFiltradas.length}
      >
        <FilterDateRange
          labelInicio="Data Início"
          labelFim="Data Fim"
          valueInicio={filtros.dataInicio}
          valueFim={filtros.dataFim}
          onChangeInicio={(value) => setFiltros({ ...filtros, dataInicio: value })}
          onChangeFim={(value) => setFiltros({ ...filtros, dataFim: value })}
        />
        <FilterSelect
          label="Closer"
          value={filtros.closer}
          onChange={(value) => setFiltros({ ...filtros, closer: value })}
          options={closersUnicos}
          placeholder="Todos os Closers"
        />
        <FilterSelect
          label="Funil"
          value={filtros.funil}
          onChange={(value) => setFiltros({ ...filtros, funil: value })}
          options={funisUnicos}
          placeholder="Todos os Funis"
        />
      </FilterPanel>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div><p>Carregando...</p></div>
        ) : vendas.length === 0 ? (
          <div className="p-8 text-center text-gray-500"><p>Nenhuma venda encontrada</p></div>
        ) : (
          <EditableDataTable
            columns={[
              { key: 'data', label: 'Data', format: 'date', sortable: true },
              { key: 'cliente', label: 'Cliente', sortable: true, bold: true },
              { key: 'closer', label: 'Closer', sortable: true },
              { key: 'funil', label: 'Funil', sortable: true },
              { key: 'tipo_receita', label: 'Tipo', sortable: true },
              { key: 'produto', label: 'Produto', sortable: true },
              { key: 'previsto', label: 'Previsto', format: 'currency', align: 'right', sortable: true },
              { key: 'valor_bruto', label: 'Valor Bruto', format: 'currency', align: 'right', sortable: true },
              { key: 'booking', label: 'Booking', format: 'currency', align: 'right', sortable: true },
              { key: 'valor_liquido', label: 'Líquido', format: 'currency', align: 'right', sortable: true, showTotal: true }
            ]}
            data={vendasFiltradas}
            editableColumns={['cliente', 'closer', 'funil', 'tipo_receita', 'produto', 'previsto', 'valor_bruto', 'booking', 'valor_liquido']}
            showTotal={true}
            totalLabel="TOTAL VENDAS"
            showActions={true}
            onUpdate={handleInlineUpdate}
            onDelete={handleDelete}
            selectable={true}
            selectedRows={selectedVendas}
            onToggleSelect={toggleSelectVenda}
            onToggleSelectAll={toggleSelectAll}
          />
        )}
      </div>

      <Modal isOpen={showModal} title={editingVenda ? 'Editar Venda' : 'Nova Venda'}
        onClose={() => { setShowModal(false); setEditingVenda(null); }}>
        <VendaForm
          onSubmit={(data) => handleSubmit(data, !!editingVenda)}
          onClose={() => { setShowModal(false); setEditingVenda(null); }}
          initialData={editingVenda}
        />
      </Modal>

      {/* Modal de Upload */}
      <UploadComercialModal
        isOpen={showUploadModal}
        tipo="vendas"
        onClose={(sucesso) => {
          setShowUploadModal(false);
          if (sucesso) {
            fetchVendas();
          }
        }}
      />
    </div>
  );
};

export default Vendas;
