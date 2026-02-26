import React, { useState, useEffect } from 'react';
import { getConfigPessoas, getConfigFunis, getConfigProdutos } from '../services/api';

const VendaForm = ({ onSubmit, onClose, initialData = null }) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    data: today,
    cliente: '',
    closer: '',
    funil: 'SS',
    tipo_receita: 'Venda',
    produto: '',
    booking: 0,
    previsto: 0,
    valor_pago: 0,
    valor_liquido: 0
  });

  const [closers, setClosers] = useState([]);
  const [funis, setFunis] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        data: initialData.data || today
      });
    }
  }, [initialData]);

  const loadConfig = async () => {
    try {
      const [closersRes, funisRes, produtosRes] = await Promise.all([
        getConfigPessoas('closer'),
        getConfigFunis(),
        getConfigProdutos()
      ]);
      setClosers(closersRes.pessoas || []);
      setFunis(funisRes.funis || []);
      setProdutos(produtosRes.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar configuracoes:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['booking', 'previsto', 'valor_pago', 'valor_liquido'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
          <input
            type="date"
            name="data"
            value={formData.data || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <input
            type="text"
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Nome do cliente"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Closer *</label>
          <select
            name="closer"
            value={formData.closer}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Selecione</option>
            {closers.filter(p => p.ativo).map(p => (
              <option key={p.id} value={p.nome}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Funil *</label>
          <select
            name="funil"
            value={formData.funil}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            {funis.filter(f => f.ativo).map(f => (
              <option key={f.id} value={f.nome}>{f.nome}</option>
            ))}
            {funis.length === 0 && (
              <>
                <option value="SS">SS</option>
                <option value="Quiz">Quiz</option>
                <option value="Indicacao">Indicacao</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Receita</label>
          <select
            name="tipo_receita"
            value={formData.tipo_receita}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="Venda">Venda</option>
            <option value="Recorrencia">Recorrência</option>
            <option value="Renovacao">Renovação</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
          <select
            name="produto"
            value={formData.produto}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Selecione</option>
            {produtos.filter(p => p.ativo).map(p => {
              const displayName = p.plano ? `${p.nome} - ${p.plano}` : p.nome;
              return (
                <option key={p.id} value={displayName}>{displayName}</option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Booking (R$)</label>
          <input type="number" name="booking" value={formData.booking} onChange={handleChange}
            step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Previsto (R$)</label>
          <input type="number" name="previsto" value={formData.previsto} onChange={handleChange}
            step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2" min="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago (R$)</label>
          <input type="number" name="valor_pago" value={formData.valor_pago} onChange={handleChange}
            step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor Líquido (R$)</label>
          <input type="number" name="valor_liquido" value={formData.valor_liquido} onChange={handleChange}
            step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2" min="0" />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="flex-1 bg-primary text-white py-2 px-4 rounded-lg">
          {initialData ? 'Atualizar' : 'Criar'} Venda
        </button>
        <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2 px-4 rounded-lg">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default VendaForm;
