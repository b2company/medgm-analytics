import React, { useState, useEffect } from 'react';
import { getConfigPessoas, getMetaPessoaMes } from '../services/api';

const SocialSellingForm = ({ onSubmit, onClose, initialData = null }) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    data: today,
    vendedor: '',
    ativacoes: 0,
    conversoes: 0,
    leads_gerados: 0
  });

  const [pessoas, setPessoas] = useState([]);
  const [metaPessoa, setMetaPessoa] = useState({ meta_ativacoes: 0, meta_leads: 0 });

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (initialData && pessoas.length > 0) {
      // Garantir que o vendedor existe na lista antes de setar
      const vendedorExiste = pessoas.some(p => p.nome === initialData.vendedor);
      setFormData({
        ...initialData,
        vendedor: vendedorExiste ? initialData.vendedor : ''
      });
    }
  }, [initialData, pessoas]);

  // Buscar meta quando vendedor/mes/ano mudar
  useEffect(() => {
    if (formData.vendedor && formData.mes && formData.ano) {
      loadMetaPessoa();
    }
  }, [formData.vendedor, formData.mes, formData.ano]);

  const loadConfig = async () => {
    try {
      const pessoasRes = await getConfigPessoas('social_selling');
      setPessoas(pessoasRes.pessoas || []);
    } catch (error) {
      console.error('Erro ao carregar configuracoes:', error);
    }
  };

  const loadMetaPessoa = async () => {
    try {
      const meta = await getMetaPessoaMes(formData.vendedor, formData.mes, formData.ano);
      setMetaPessoa(meta);
    } catch (error) {
      console.error('Erro ao carregar meta:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['mes', 'ano', 'ativacoes', 'conversoes', 'leads_gerados'].includes(name)
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data
        </label>
        <input
          type="date"
          name="data"
          value={formData.data || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mes
          </label>
          <select
            name="mes"
            value={formData.mes}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value={1}>Janeiro</option>
            <option value={2}>Fevereiro</option>
            <option value={3}>Marco</option>
            <option value={4}>Abril</option>
            <option value={5}>Maio</option>
            <option value={6}>Junho</option>
            <option value={7}>Julho</option>
            <option value={8}>Agosto</option>
            <option value={9}>Setembro</option>
            <option value={10}>Outubro</option>
            <option value={11}>Novembro</option>
            <option value={12}>Dezembro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ano
          </label>
          <input
            type="number"
            name="ano"
            value={formData.ano}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vendedor Social Selling
        </label>
        <select
          name="vendedor"
          value={formData.vendedor}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="">Selecione um vendedor</option>
          {pessoas.filter(p => p.ativo).map(p => (
            <option key={p.id} value={p.nome}>{p.nome}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Cadastre vendedores SS em Configuracoes
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ativações
        </label>
        <input
          type="number"
          name="ativacoes"
          value={formData.ativacoes}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conversões
        </label>
        <input
          type="number"
          name="conversoes"
          value={formData.conversoes}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Leads Gerados
        </label>
        <input
          type="number"
          name="leads_gerados"
          value={formData.leads_gerados}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          min="0"
          required
        />
      </div>

      {/* Exibição da Meta do Mês */}
      {formData.vendedor && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">
            📊 Meta de {formData.vendedor} para {formData.mes}/{formData.ano}:
          </p>
          {(metaPessoa.meta_ativacoes > 0 || metaPessoa.meta_leads > 0) ? (
            <div className="flex gap-4 text-sm">
              <span className="font-bold text-blue-900">
                Ativações: {(metaPessoa.meta_ativacoes || 0).toLocaleString('pt-BR')}
              </span>
              <span className="font-bold text-blue-900">
                Leads: {(metaPessoa.meta_leads || 0).toLocaleString('pt-BR')}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              ⚠️ Nenhuma meta cadastrada para este mês. Configure na aba <strong>Metas</strong>.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
        >
          {initialData ? 'Atualizar' : 'Criar'} Métrica
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default SocialSellingForm;
