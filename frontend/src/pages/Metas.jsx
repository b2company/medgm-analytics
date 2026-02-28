import React, { useState, useEffect, useCallback } from 'react';
import {
  getMetas,
  createMeta,
  updateMeta,
  deleteMeta,
  replicarMetas,
  calcularRealizado
} from '../services/api';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import LineChart from '../components/LineChart';
import { useConfig } from '../context/ConfigContext';

const Metas = ({ mes: mesProp, ano: anoProp }) => {
  // Usar props do componente pai (Comercial.jsx) se fornecidas, senão usar valores padrão
  const mes = mesProp || new Date().getMonth() + 1;
  const ano = anoProp || new Date().getFullYear();
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Usar contexto para pessoas
  const { pessoas, fetchPessoas } = useConfig();
  const [showModal, setShowModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [formData, setFormData] = useState({
    pessoa_id: '',
    meta_ativacoes: '',
    meta_leads: '',
    meta_reunioes_agendadas: '',
    meta_reunioes: '',
    meta_vendas: '',
    meta_faturamento: ''
  });

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Marco' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const metasRes = await getMetas(mes, ano);
      setMetas(metasRes.metas || []);
      // Pessoas vêm do contexto, mas garantir que estejam carregadas
      if (pessoas.length === 0) {
        fetchPessoas();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [mes, ano, pessoas.length, fetchPessoas]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReplicarMes = async () => {
    if (!window.confirm(`Deseja replicar as metas do mes anterior para ${meses.find(m => m.value === mes)?.label}/${ano}?`)) {
      return;
    }
    try {
      setLoading(true);
      await replicarMetas(mes, ano);
      await loadData();
      alert('Metas replicadas com sucesso!');
    } catch (error) {
      console.error('Erro ao replicar metas:', error);
      alert('Erro ao replicar metas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalcularRealizado = async () => {
    try {
      setLoading(true);
      await calcularRealizado(mes, ano);
      await loadData();
      alert('Realizado calculado com sucesso!');
    } catch (error) {
      console.error('Erro ao calcular realizado:', error);
      alert('Erro ao calcular realizado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        mes,
        ano,
        tipo: 'pessoa',
        pessoa_id: parseInt(formData.pessoa_id),
        meta_ativacoes: formData.meta_ativacoes ? parseInt(formData.meta_ativacoes) : null,
        meta_leads: formData.meta_leads ? parseInt(formData.meta_leads) : null,
        meta_reunioes_agendadas: formData.meta_reunioes_agendadas ? parseInt(formData.meta_reunioes_agendadas) : null,
        meta_reunioes: formData.meta_reunioes ? parseInt(formData.meta_reunioes) : null,
        meta_vendas: formData.meta_vendas ? parseInt(formData.meta_vendas) : null,
        meta_faturamento: formData.meta_faturamento ? parseFloat(formData.meta_faturamento) : null
      };

      if (editingMeta) {
        await updateMeta(editingMeta.id, data);
      } else {
        await createMeta(data);
      }

      setShowModal(false);
      setEditingMeta(null);
      setFormData({
        pessoa_id: '',
        meta_ativacoes: '',
        meta_leads: '',
        meta_reunioes_agendadas: '',
        meta_reunioes: '',
        meta_vendas: '',
        meta_faturamento: ''
      });
      await loadData();
      alert(editingMeta ? 'Meta atualizada!' : 'Meta criada!');
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      alert('Erro ao salvar meta. Verifique os dados.');
    }
  };

  const handleEdit = (meta) => {
    setEditingMeta(meta);
    setFormData({
      pessoa_id: meta.pessoa_id?.toString() || '',
      meta_ativacoes: meta.meta_ativacoes?.toString() || '',
      meta_leads: meta.meta_leads?.toString() || '',
      meta_reunioes_agendadas: meta.meta_reunioes_agendadas?.toString() || '',
      meta_reunioes: meta.meta_reunioes?.toString() || '',
      meta_vendas: meta.meta_vendas?.toString() || '',
      meta_faturamento: meta.meta_faturamento?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (meta) => {
    if (!window.confirm(`Deseja deletar a meta de ${meta.pessoa?.nome}?`)) {
      return;
    }
    try {
      await deleteMeta(meta.id);
      await loadData();
      alert('Meta deletada!');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar meta.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const getStatusBadge = (perc) => {
    if (perc >= 100) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Bateu</span>;
    } else if (perc >= 80) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Quase</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Abaixo</span>;
    }
  };

  const getDeltaDisplay = (delta, isPositiveGood = true) => {
    if (delta === null || delta === undefined) return '-';
    const isPositive = delta >= 0;
    const color = (isPositive === isPositiveGood) ? 'text-green-600' : 'text-red-600';
    const arrow = isPositive ? '+' : '';
    return <span className={color}>{arrow}{typeof delta === 'number' && delta % 1 !== 0 ? formatCurrency(delta) : delta}</span>;
  };

  const getMetricasPorFuncao = (meta) => {
    const funcao = (meta.pessoa?.funcao || '').toLowerCase().replace(/\s+/g, '_');

    if (funcao.includes('social')) {
      return {
        meta: meta.meta_leads || meta.meta_ativacoes,
        realizado: meta.realizado_leads || meta.realizado_ativacoes,
        delta: meta.delta_leads || meta.delta_ativacoes,
        label: meta.meta_leads ? 'Leads' : 'Ativacoes/Leads'
      };
    } else if (funcao.includes('sdr')) {
      // Priorizar reuniões realizadas, mas mostrar agendadas se for a única disponível
      const usarRealizadas = meta.meta_reunioes !== null;
      return {
        meta: usarRealizadas ? meta.meta_reunioes : meta.meta_reunioes_agendadas,
        realizado: usarRealizadas ? meta.realizado_reunioes : meta.realizado_reunioes_agendadas,
        delta: usarRealizadas ? meta.delta_reunioes : meta.delta_reunioes_agendadas,
        label: usarRealizadas ? 'Reuniões Realizadas' : 'Reuniões Agendadas'
      };
    } else if (funcao.includes('closer')) {
      return {
        meta: meta.meta_faturamento || meta.meta_vendas,
        realizado: meta.realizado_faturamento || meta.realizado_vendas,
        delta: meta.delta_faturamento || meta.delta_vendas,
        label: meta.meta_faturamento ? 'Faturamento' : 'Vendas',
        isCurrency: !!meta.meta_faturamento
      };
    }
    return { meta: 0, realizado: 0, delta: 0, label: '' };
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Gestao de Metas - {meses.find(m => m.value === mes)?.label} {ano}</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleReplicarMes}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            Replicar Mes Anterior
          </button>
          <button
            onClick={handleCalcularRealizado}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            Calcular Realizado
          </button>
          <button
            onClick={() => {
              setEditingMeta(null);
              setFormData({
                pessoa_id: '',
                meta_ativacoes: '',
                meta_leads: '',
                meta_reunioes_agendadas: '',
                meta_reunioes: '',
                meta_vendas: '',
                meta_faturamento: ''
              });
              setShowModal(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            + Nova Meta
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Tabela de Metas */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pessoa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcao
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      Nenhuma meta cadastrada para este periodo.
                      <br />
                      <span className="text-sm">Clique em "Replicar Mes Anterior" ou "Nova Meta" para comecar.</span>
                    </td>
                  </tr>
                ) : (
                  metas.map((meta) => {
                    const metricas = getMetricasPorFuncao(meta);
                    return (
                      <tr key={meta.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{meta.pessoa?.nome || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {meta.pessoa?.funcao || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500">{metricas.label}</div>
                          <div className="font-medium">
                            {metricas.isCurrency ? formatCurrency(metricas.meta) : metricas.meta || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(meta)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Editar"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(meta)}
                              className="text-red-600 hover:text-red-800"
                              title="Deletar"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Meta */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingMeta(null);
        }}
        title={editingMeta ? 'Editar Meta' : 'Nova Meta'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pessoa *
            </label>
            <select
              value={formData.pessoa_id}
              onChange={(e) => setFormData({ ...formData, pessoa_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              required
              disabled={!!editingMeta}
            >
              <option value="">Selecione uma pessoa</option>
              {pessoas.filter(p => p.ativo).map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.funcao})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Ativacoes
              </label>
              <input
                type="number"
                value={formData.meta_ativacoes}
                onChange={(e) => setFormData({ ...formData, meta_ativacoes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Leads
              </label>
              <input
                type="number"
                value={formData.meta_leads}
                onChange={(e) => setFormData({ ...formData, meta_leads: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Reuniões Agendadas (SDR)
              </label>
              <input
                type="number"
                value={formData.meta_reunioes_agendadas}
                onChange={(e) => setFormData({ ...formData, meta_reunioes_agendadas: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Reuniões Realizadas (SDR)
              </label>
              <input
                type="number"
                value={formData.meta_reunioes}
                onChange={(e) => setFormData({ ...formData, meta_reunioes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Vendas
              </label>
              <input
                type="number"
                value={formData.meta_vendas}
                onChange={(e) => setFormData({ ...formData, meta_vendas: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Faturamento (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.meta_faturamento}
                onChange={(e) => setFormData({ ...formData, meta_faturamento: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Faturamento (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.meta_faturamento}
              onChange={(e) => setFormData({ ...formData, meta_faturamento: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              {editingMeta ? 'Atualizar' : 'Criar'} Meta
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingMeta(null);
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Metas;
