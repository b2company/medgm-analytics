import React, { useState, useEffect } from 'react';
import { getConfigPessoas, getConfigFunis, getConfigProdutos } from '../../services/api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VendasFormPublic = () => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    data: today,
    cliente: '',
    closer: '',
    funil: 'SS',
    tipo_receita: 'Venda',
    produto: '',
    valor_bruto: 0,
    previsto: 0,
    valor_pago: 0,
    valor_liquido: 0
  });

  const [closers, setClosers] = useState([]);
  const [funis, setFunis] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadConfig();
  }, []);

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
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['valor_bruto', 'previsto', 'valor_pago', 'valor_liquido'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_URL}/vendas`, formData);
      setMessage({ type: 'success', text: 'Venda registrada com sucesso!' });

      // Reset form
      setFormData({
        data: today,
        cliente: '',
        closer: '',
        funil: 'SS',
        tipo_receita: 'Venda',
        produto: '',
        valor_bruto: 0,
        previsto: 0,
        valor_pago: 0,
        valor_liquido: 0
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erro ao registrar venda. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MedGM Analytics</h1>
            <p className="text-lg text-gray-600">Formulário de Vendas</p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <input
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Nome do cliente"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Closer *</label>
                <select
                  name="closer"
                  value={formData.closer}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  {closers.filter(c => c.ativo).map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funil *</label>
                <select
                  name="funil"
                  value={formData.funil}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {funis.filter(f => f.ativo).map(f => (
                    <option key={f.id} value={f.nome}>{f.nome}</option>
                  ))}
                  {funis.length === 0 && (
                    <>
                      <option value="SS">SS</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Indicacao">Indicação</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Receita</label>
                <select
                  name="tipo_receita"
                  value={formData.tipo_receita}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Venda">Venda</option>
                  <option value="Recorrencia">Recorrência</option>
                  <option value="Renovacao">Renovação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Produto</label>
                <select
                  name="produto"
                  value={formData.produto}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Bruto (R$)</label>
                <input
                  type="number"
                  name="valor_bruto"
                  value={formData.valor_bruto}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Previsto (R$)</label>
                <input
                  type="number"
                  name="previsto"
                  value={formData.previsto}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Pago (R$)</label>
                <input
                  type="number"
                  name="valor_pago"
                  value={formData.valor_pago}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Líquido (R$)</label>
                <input
                  type="number"
                  name="valor_liquido"
                  value={formData.valor_liquido}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Registrar Venda'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendasFormPublic;
