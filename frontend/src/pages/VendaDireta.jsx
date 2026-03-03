import { useState, useEffect } from 'react';
import { getVendaDiretaMetrics, createVendaDiretaMetrics, updateVendaDiretaMetrics, deleteVendaDiretaMetrics } from '../services/api';

export default function VendaDireta() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [filters, setFilters] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    campanha: ''
  });

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    campanha_nome: '',
    campanha_id: '',
    verba: 0,
    impressoes: 0,
    cliques: 0,
    pageviews: 0,
    leads: 0,
    checkout_inicio: 0,
    vendas: 0,
    receita: 0
  });

  useEffect(() => {
    loadMetrics();
  }, [filters.mes, filters.ano, filters.campanha]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getVendaDiretaMetrics(filters.mes, filters.ano, filters.campanha);
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMetric) {
        await updateVendaDiretaMetrics(editingMetric.id, formData);
      } else {
        await createVendaDiretaMetrics(formData);
      }
      resetForm();
      loadMetrics();
    } catch (error) {
      console.error('Erro ao salvar métrica:', error);
      alert('Erro ao salvar métrica');
    }
  };

  const handleEdit = (metric) => {
    setEditingMetric(metric);
    setFormData({
      data: metric.data,
      campanha_nome: metric.campanha_nome,
      campanha_id: metric.campanha_id || '',
      verba: metric.verba,
      impressoes: metric.impressoes,
      cliques: metric.cliques,
      pageviews: metric.pageviews,
      leads: metric.leads,
      checkout_inicio: metric.checkout_inicio,
      vendas: metric.vendas,
      receita: metric.receita
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta métrica?')) return;
    try {
      await deleteVendaDiretaMetrics(id);
      loadMetrics();
    } catch (error) {
      console.error('Erro ao deletar métrica:', error);
      alert('Erro ao deletar métrica');
    }
  };

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      campanha_nome: '',
      campanha_id: '',
      verba: 0,
      impressoes: 0,
      cliques: 0,
      pageviews: 0,
      leads: 0,
      checkout_inicio: 0,
      vendas: 0,
      receita: 0
    });
    setEditingMetric(null);
    setShowModal(false);
  };

  // Calcular totais agregados
  const totals = metrics.reduce((acc, m) => ({
    verba: acc.verba + m.verba,
    impressoes: acc.impressoes + m.impressoes,
    cliques: acc.cliques + m.cliques,
    pageviews: acc.pageviews + m.pageviews,
    leads: acc.leads + m.leads,
    checkout_inicio: acc.checkout_inicio + m.checkout_inicio,
    vendas: acc.vendas + m.vendas,
    receita: acc.receita + m.receita
  }), { verba: 0, impressoes: 0, cliques: 0, pageviews: 0, leads: 0, checkout_inicio: 0, vendas: 0, receita: 0 });

  const avgCTR = totals.impressoes > 0 ? (totals.cliques / totals.impressoes * 100) : 0;
  const avgCPC = totals.cliques > 0 ? (totals.verba / totals.cliques) : 0;
  const avgHookRate = totals.impressoes > 0 ? (totals.cliques / totals.impressoes * 100) : 0;
  const avgBodyRate = totals.cliques > 0 ? (totals.pageviews / totals.cliques * 100) : 0;
  const avgTaxaConversao = totals.pageviews > 0 ? (totals.leads / totals.pageviews * 100) : 0;
  const avgCVRCheckout = totals.checkout_inicio > 0 ? (totals.vendas / totals.checkout_inicio * 100) : 0;
  const avgCVRGeral = totals.pageviews > 0 ? (totals.vendas / totals.pageviews * 100) : 0;
  const avgAOV = totals.vendas > 0 ? (totals.receita / totals.vendas) : 0;
  const avgCPA = totals.vendas > 0 ? (totals.verba / totals.vendas) : 0;
  const avgROAS = totals.verba > 0 ? (totals.receita / totals.verba) : 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Venda Direta - Funil de Vendas</h1>
          <p className="text-gray-600 mt-1">Métricas de Campanhas com Venda Direta</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Métrica
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
            <select
              value={filters.mes}
              onChange={(e) => setFilters({ ...filters, mes: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <select
              value={filters.ano}
              onChange={(e) => setFilters({ ...filters, ano: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campanha</label>
            <input
              type="text"
              value={filters.campanha}
              onChange={(e) => setFilters({ ...filters, campanha: e.target.value })}
              placeholder="Filtrar por nome"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), campanha: '' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards - Ads */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Verba Total" value={`R$ ${totals.verba.toFixed(2)}`} color="blue" />
        <KPICard title="Impressões" value={totals.impressoes.toLocaleString()} color="purple" />
        <KPICard title="Cliques" value={totals.cliques.toLocaleString()} color="green" />
        <KPICard title="CTR Médio" value={`${avgCTR.toFixed(2)}%`} color="yellow" />
      </div>

      {/* KPI Cards - Conversão */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Hook Rate" value={`${avgHookRate.toFixed(2)}%`} color="indigo" />
        <KPICard title="Body Rate" value={`${avgBodyRate.toFixed(2)}%`} color="pink" />
        <KPICard title="Pageviews" value={totals.pageviews.toLocaleString()} color="cyan" />
        <KPICard title="Leads" value={totals.leads.toLocaleString()} color="orange" />
      </div>

      {/* KPI Cards - Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <KPICard title="Checkout Início" value={totals.checkout_inicio.toLocaleString()} color="teal" />
        <KPICard title="Vendas" value={totals.vendas.toLocaleString()} color="green" />
        <KPICard title="Receita Total" value={`R$ ${totals.receita.toFixed(2)}`} color="emerald" />
        <KPICard title="AOV" value={`R$ ${avgAOV.toFixed(2)}`} color="blue" />
        <KPICard title="ROAS" value={`${avgROAS.toFixed(2)}x`} color="purple" />
      </div>

      {/* KPI Cards - Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="CVR Checkout" value={`${avgCVRCheckout.toFixed(2)}%`} color="red" />
        <KPICard title="CVR Geral Funil" value={`${avgCVRGeral.toFixed(2)}%`} color="orange" />
        <KPICard title="CPA" value={`R$ ${avgCPA.toFixed(2)}`} color="yellow" />
        <KPICard title="CPC Médio" value={`R$ ${avgCPC.toFixed(2)}`} color="indigo" />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campanha</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Verba</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Impressões</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cliques</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pageviews</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vendas</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receita</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROAS</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    Carregando métricas...
                  </td>
                </tr>
              ) : metrics.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    Nenhuma métrica encontrada. Clique em "Nova Métrica" para adicionar.
                  </td>
                </tr>
              ) : (
                metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(metric.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{metric.campanha_nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {metric.verba.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.impressoes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.cliques.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.pageviews.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.leads.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.vendas.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">R$ {metric.receita.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.roas.toFixed(2)}x</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => handleEdit(metric)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(metric.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingMetric ? 'Editar Métrica' : 'Nova Métrica'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                    <input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha *</label>
                    <input
                      type="text"
                      value={formData.campanha_nome}
                      onChange={(e) => setFormData({ ...formData, campanha_nome: e.target.value })}
                      required
                      placeholder="Ex: Venda Direta - Botox"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID da Campanha (Meta Ads)</label>
                  <input
                    type="text"
                    value={formData.campanha_id}
                    onChange={(e) => setFormData({ ...formData, campanha_id: e.target.value })}
                    placeholder="Opcional - ID da campanha no Meta"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="border-t pt-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Métricas de Ads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verba (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.verba}
                        onChange={(e) => setFormData({ ...formData, verba: parseFloat(e.target.value) || 0 })}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Impressões *</label>
                      <input
                        type="number"
                        value={formData.impressoes}
                        onChange={(e) => setFormData({ ...formData, impressoes: parseInt(e.target.value) || 0 })}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cliques *</label>
                      <input
                        type="number"
                        value={formData.cliques}
                        onChange={(e) => setFormData({ ...formData, cliques: parseInt(e.target.value) || 0 })}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Métricas de Conversão</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pageviews</label>
                      <input
                        type="number"
                        value={formData.pageviews}
                        onChange={(e) => setFormData({ ...formData, pageviews: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leads</label>
                      <input
                        type="number"
                        value={formData.leads}
                        onChange={(e) => setFormData({ ...formData, leads: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Início de Checkout</label>
                      <input
                        type="number"
                        value={formData.checkout_inicio}
                        onChange={(e) => setFormData({ ...formData, checkout_inicio: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Métricas de Vendas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendas</label>
                      <input
                        type="number"
                        value={formData.vendas}
                        onChange={(e) => setFormData({ ...formData, vendas: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Receita (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.receita}
                        onChange={(e) => setFormData({ ...formData, receita: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingMetric ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]} shadow-sm`}>
      <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
