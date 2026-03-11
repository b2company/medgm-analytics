import React, { useState, useEffect } from 'react';
import { getConfigPessoas, getConfigFunis, getMetaPessoaMes } from '../services/api';

const CloserForm = ({ onSubmit, onClose, initialData = null }) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    data: today,
    closer: '',
    funil: 'SS',
    calls_agendadas: 0,
    calls_realizadas: 0,
    vendas: 0,
    faturamento_bruto: 0,
    faturamento_liquido: 0
  });

  const [pessoas, setPessoas] = useState([]);
  const [funis, setFunis] = useState([]);
  const [metaPessoa, setMetaPessoa] = useState({ meta_vendas: 0, meta_faturamento: 0 });

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (initialData && pessoas.length > 0) {
      // Garantir que o closer existe na lista antes de setar
      const closerExiste = pessoas.some(p => p.nome === initialData.closer);
      setFormData({
        ...initialData,
        closer: closerExiste ? initialData.closer : ''
      });
    }
  }, [initialData, pessoas]);

  // Buscar meta quando closer/mes/ano mudar
  useEffect(() => {
    if (formData.closer && formData.mes && formData.ano) {
      loadMetaPessoa();
    }
  }, [formData.closer, formData.mes, formData.ano]);

  const loadConfig = async () => {
    try {
      const [pessoasRes, funisRes] = await Promise.all([
        getConfigPessoas('closer'),
        getConfigFunis()
      ]);
      setPessoas(pessoasRes.pessoas || []);
      setFunis(funisRes.funis || []);
    } catch (error) {
      console.error('Erro ao carregar configuracoes:', error);
    }
  };

  const loadMetaPessoa = async () => {
    try {
      const meta = await getMetaPessoaMes(formData.closer, formData.mes, formData.ano);
      setMetaPessoa(meta);
      
    } catch (error) {
      console.error('Erro ao carregar meta:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['mes', 'ano', 'calls_agendadas', 'calls_realizadas', 'vendas'].includes(name)
        ? parseInt(value) || 0
        : ['faturamento_bruto', 'faturamento_liquido'].includes(name)
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
          Closer
        </label>
        <select
          name="closer"
          value={formData.closer}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="">Selecione um closer</option>
          {pessoas.filter(p => p.ativo).map(p => (
            <option key={p.id} value={p.nome}>{p.nome}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Cadastre closers em Configuracoes
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Funil
        </label>
        <select
          name="funil"
          value={formData.funil}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="">Selecione um funil</option>
          {funis.filter(f => f.ativo).map(f => (
            <option key={f.id} value={f.nome}>{f.nome} {f.descricao ? `(${f.descricao})` : ''}</option>
          ))}
          {funis.length === 0 && (
            <>
              <option value="SS">Social Selling</option>
              <option value="Quiz">Quiz</option>
              <option value="Indicacao">Indicacao</option>
              <option value="Webinario">Webinario</option>
            </>
          )}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calls Agendadas
          </label>
          <input
            type="number"
            name="calls_agendadas"
            value={formData.calls_agendadas}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calls Realizadas
          </label>
          <input
            type="number"
            name="calls_realizadas"
            value={formData.calls_realizadas}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            min="0"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vendas
        </label>
        <input
          type="number"
          name="vendas"
          value={formData.vendas}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          min="0"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Faturamento Bruto (R$)
          </label>
          <input
            type="number"
            name="faturamento_bruto"
            value={formData.faturamento_bruto}
            onChange={handleChange}
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Faturamento Líquido (R$)
        </label>
        <input
          type="number"
          name="faturamento_liquido"
          value={formData.faturamento_liquido}
          onChange={handleChange}
          step="0.01"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          min="0"
        />
        <p className="text-xs text-gray-500 mt-1">Faturamento após descontos e impostos</p>
      </div>

      {/* Exibição da Meta do Mês */}
      {formData.closer && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">
            📊 Meta de {formData.closer} para {formData.mes}/{formData.ano}:
          </p>
          {(metaPessoa.meta_vendas > 0 || metaPessoa.meta_faturamento > 0) ? (
            <div className="flex gap-4 text-sm">
              <span className="font-bold text-blue-900">
                Vendas: {(metaPessoa.meta_vendas || 0).toLocaleString('pt-BR')}
              </span>
              <span className="font-bold text-blue-900">
                Faturamento: R$ {(metaPessoa.meta_faturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

export default CloserForm;
