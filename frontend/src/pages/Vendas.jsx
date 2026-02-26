import React, { useState, useEffect } from 'react';
import { getVendas, createVenda, updateVenda, deleteVenda } from '../services/api';
import Modal from '../components/Modal';
import VendaForm from '../components/VendaForm';

const Vendas = ({ mes: mesProp, ano: anoProp }) => {
  const mes = mesProp || new Date().getMonth() + 1;
  const ano = anoProp || new Date().getFullYear();

  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVenda, setEditingVenda] = useState(null);
  const [filtros, setFiltros] = useState({ closer: '', funil: '' });

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  useEffect(() => {
    fetchVendas();
  }, [mes, ano]);

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const data = await getVendas(mes, ano);
      setVendas(data);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente deletar esta venda?')) return;
    try {
      await deleteVenda(id);
      fetchVendas();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar venda');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const closersUnicos = [...new Set(vendas.map(v => v.closer).filter(Boolean))];
  const funisUnicos = [...new Set(vendas.map(v => v.funil).filter(Boolean))];

  const vendasFiltradas = vendas.filter(v => {
    if (filtros.closer && v.closer !== filtros.closer) return false;
    if (filtros.funil && v.funil !== filtros.funil) return false;
    return true;
  });

  const totais = vendasFiltradas.reduce((acc, v) => ({
    booking: acc.booking + (v.booking || 0),
    previsto: acc.previsto + (v.previsto || 0),
    valor_pago: acc.valor_pago + (v.valor_pago || 0),
    valor_liquido: acc.valor_liquido + (v.valor_liquido || 0)
  }), { booking: 0, previsto: 0, valor_pago: 0, valor_liquido: 0 });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestão de Vendas - {meses[mes - 1]} {ano}
        </h1>
        <button
          onClick={() => { setEditingVenda(null); setShowModal(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          + Nova Venda
        </button>
      </div>

      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Total Booking</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(totais.booking)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Total Previsto</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(totais.previsto)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Total Pago</p>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(totais.valor_pago)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-medium">Total Líquido</p>
          <p className="text-2xl font-bold text-orange-900">{formatCurrency(totais.valor_liquido)}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div><p>Carregando...</p></div>
        ) : vendas.length === 0 ? (
          <div className="p-8 text-center text-gray-500"><p>Nenhuma venda encontrada</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funil</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Booking</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Previsto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pago</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Líquido</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2">
                    <select value={filtros.closer} onChange={(e) => setFiltros({...filtros, closer: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded">
                      <option value="">Todos</option>
                      {closersUnicos.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </th>
                  <th className="px-2 py-2">
                    <select value={filtros.funil} onChange={(e) => setFiltros({...filtros, funil: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded">
                      <option value="">Todos</option>
                      {funisUnicos.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{v.data ? new Date(v.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{v.cliente || '-'}</td>
                    <td className="px-4 py-3 text-sm">{v.closer || '-'}</td>
                    <td className="px-4 py-3 text-sm">{v.funil || '-'}</td>
                    <td className="px-4 py-3 text-sm">{v.tipo_receita || '-'}</td>
                    <td className="px-4 py-3 text-sm">{v.produto || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(v.booking)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(v.previsto)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(v.valor_pago)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(v.valor_liquido)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => { setEditingVenda(v); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                      <button onClick={() => handleDelete(v.id)}
                        className="text-red-600 hover:text-red-800">Deletar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  );
};

export default Vendas;
