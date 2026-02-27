import React, { useState, useEffect } from 'react';
import {
  getFinanceiroDetalhado,
  createFinanceiro,
  updateFinanceiro,
  deleteFinanceiro,
  getComercialDetalhado
} from '../services/api';
import Modal from './Modal';
import FinanceiroForm from './FinanceiroForm';
import DataTable from './DataTable';
import EditableDataTable from './EditableDataTable';
import UploadComercialModal from './UploadComercialModal';

const TransacoesFinanceiras = ({ mes, ano }) => {
  const [dados, setDados] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadDados();
  }, [mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const [financeiro, comercial] = await Promise.all([
        getFinanceiroDetalhado(mes, ano),
        getComercialDetalhado(mes, ano)
      ]);
      setDados(financeiro);
      setVendas(comercial.vendas || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await createFinanceiro(formData);
      setShowModal(false);
      await loadDados();
      alert('Transação criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert('Erro ao criar transação. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem({
      id: item.id,
      tipo: item.tipo,
      categoria: item.categoria,
      descricao: item.descricao || '',
      valor: item.valor.toString(),
      data: item.data,
      previsto_realizado: item.previsto_realizado,
      tipo_custo: item.tipo_custo || '',
      centro_custo: item.centro_custo || ''
    });
    setShowModal(true);
  };

  const handleUpdate = async (formData) => {
    try {
      const { id, ...updateData } = editingItem;
      await updateFinanceiro(id, { ...updateData, ...formData });
      setShowModal(false);
      setEditingItem(null);
      await loadDados();
      alert('Transação atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      alert('Erro ao atualizar transação. Verifique os dados e tente novamente.');
    }
  };

  const handleInlineUpdate = async (id, updatedRow) => {
    try {
      await updateFinanceiro(id, updatedRow);
      await loadDados();
    } catch (error) {
      console.error('Erro ao atualizar inline:', error);
      alert('Erro ao atualizar. Verifique os dados e tente novamente.');
      throw error;
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Deseja realmente deletar a transação de ${formatCurrency(item.valor)}?`)) {
      return;
    }
    try {
      await deleteFinanceiro(item.id);
      await loadDados();
      alert('Transação deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      alert('Erro ao deletar transação. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Saldo Atual</div>
          <div className={`text-2xl font-bold ${dados?.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(dados?.saldo)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Entradas</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(dados?.total_entradas)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Saídas</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(dados?.total_saidas)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Margem Líquida</div>
          <div className="text-2xl font-bold text-blue-600">
            {(dados?.dre?.margem_liquida_pct || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Botão Nova Transação */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2 transition-colors"
        >
          <span className="text-xl">+</span>
          Nova Transação
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          📤 Upload em Massa
        </button>
      </div>

      {/* Vendas do Mês (Automático) */}
      {vendas.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            💰 Vendas do Mês (Incluídas Automaticamente)
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            As vendas abaixo são puxadas automaticamente do módulo Comercial e contam como entradas.
          </p>
          <DataTable
            columns={[
              { key: 'data', label: 'Data', format: 'date', sortable: true },
              { key: 'cliente', label: 'Cliente', sortable: true, bold: true },
              { key: 'valor', label: 'Valor Bruto', format: 'currency', align: 'right', sortable: true },
              { key: 'valor_liquido', label: 'Valor Líquido', format: 'currency', align: 'right', sortable: true, showTotal: true },
              { key: 'produto', label: 'Produto', sortable: true },
              { key: 'closer', label: 'Closer', sortable: true }
            ]}
            data={vendas}
            showTotal={true}
            totalLabel="TOTAL VENDAS"
            showActions={false}
          />
        </div>
      )}

      {/* Tabela de Entradas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-green-700">
          ⬆️ Entradas - {new Date(2000, mes - 1).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(2000, mes - 1).toLocaleString('pt-BR', { month: 'long' }).slice(1)} {ano}
        </h3>
        {dados?.entradas && dados.entradas.length > 0 ? (
          <EditableDataTable
            columns={[
              { key: 'data', label: 'Data', format: 'date', sortable: true },
              { key: 'categoria', label: 'Categoria', sortable: true },
              { key: 'descricao', label: 'Descrição', sortable: false },
              { key: 'valor', label: 'Valor', format: 'currency', align: 'right', sortable: true, showTotal: true }
            ]}
            data={dados.entradas}
            editableColumns={['categoria', 'descricao', 'valor']}
            showTotal={true}
            totalLabel="TOTAL ENTRADAS"
            showActions={true}
            onUpdate={handleInlineUpdate}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhuma entrada registrada neste mês (além das vendas automáticas).
          </div>
        )}
      </div>

      {/* Tabela de Saídas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-red-700">
          ⬇️ Saídas - {new Date(2000, mes - 1).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(2000, mes - 1).toLocaleString('pt-BR', { month: 'long' }).slice(1)} {ano}
        </h3>
        {dados?.saidas && dados.saidas.length > 0 ? (
          <EditableDataTable
            columns={[
              { key: 'data', label: 'Data', format: 'date', sortable: true },
              { key: 'categoria', label: 'Categoria', sortable: true },
              { key: 'tipo_custo', label: 'Tipo', sortable: true, badge: true },
              { key: 'centro_custo', label: 'Centro', sortable: true, badge: true },
              { key: 'descricao', label: 'Descrição', sortable: false },
              { key: 'valor', label: 'Valor', format: 'currency', align: 'right', sortable: true, showTotal: true }
            ]}
            data={dados.saidas}
            editableColumns={['categoria', 'tipo_custo', 'centro_custo', 'descricao', 'valor']}
            showTotal={true}
            totalLabel="TOTAL SAÍDAS"
            showActions={true}
            onUpdate={handleInlineUpdate}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhuma saída registrada neste mês.
          </div>
        )}
      </div>

      {/* Modal de Transação */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Transação' : 'Nova Transação'}
      >
        <FinanceiroForm
          onSubmit={editingItem ? handleUpdate : handleCreate}
          initialData={editingItem}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Modal de Upload */}
      <UploadComercialModal
        isOpen={showUploadModal}
        tipo="financeiro"
        onClose={(sucesso) => {
          setShowUploadModal(false);
          if (sucesso) {
            loadDados();
          }
        }}
      />
    </div>
  );
};

export default TransacoesFinanceiras;
