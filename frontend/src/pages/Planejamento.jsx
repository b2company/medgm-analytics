import React, { useState, useEffect } from 'react';
import {
  getMetaEmpresa,
  updateMetaEmpresa,
  calcularAcumuladoEmpresa,
  getFunilHistorico,
  getDREAnual
} from '../services/api';
import LineChart from '../components/LineChart';
import ProgressBar from '../components/ProgressBar';

const Planejamento = () => {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('projecao');
  const [loading, setLoading] = useState(false);

  // Dados
  const [metaEmpresa, setMetaEmpresa] = useState(null);
  const [funilHistorico, setFunilHistorico] = useState(null);
  const [dreAnual, setDreAnual] = useState(null);

  // Edicao de metas
  const [editingMetas, setEditingMetas] = useState(false);
  const [metaFat, setMetaFat] = useState('5000000');
  const [metaCaixa, setMetaCaixa] = useState('1000000');

  useEffect(() => {
    loadData();
  }, [ano]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empresaRes, funilRes, dreRes] = await Promise.all([
        getMetaEmpresa(ano),
        getFunilHistorico(ano),
        getDREAnual(ano)
      ]);

      setMetaEmpresa(empresaRes);
      setMetaFat(empresaRes?.meta_faturamento_anual?.toString() || '5000000');
      setMetaCaixa(empresaRes?.meta_caixa_anual?.toString() || '1000000');
      setFunilHistorico(funilRes);
      setDreAnual(dreRes);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMetas = async () => {
    try {
      await updateMetaEmpresa(ano, {
        ano,
        meta_faturamento_anual: parseFloat(metaFat),
        meta_caixa_anual: parseFloat(metaCaixa)
      });
      await calcularAcumuladoEmpresa(ano);
      await loadData();
      setEditingMetas(false);
      alert('Metas atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar metas:', error);
      alert('Erro ao salvar metas.');
    }
  };

  const handleRecalcular = async () => {
    try {
      setLoading(true);
      await calcularAcumuladoEmpresa(ano);
      await loadData();
      alert('Valores recalculados!');
    } catch (error) {
      console.error('Erro ao recalcular:', error);
      alert('Erro ao recalcular valores.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatShortCurrency = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  const tabs = [
    { id: 'projecao', label: 'Projecao Receita' },
    { id: 'funil', label: 'Funil Detalhado' },
    { id: 'dre', label: 'Evolucao DRE' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Business Plan {ano}</h1>
        <div className="flex gap-3 items-center">
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          <button
            onClick={handleRecalcular}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            Recalcular
          </button>
        </div>
      </div>

      {/* Cards Meta Anual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card Faturamento */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Meta Faturamento</h3>
              <p className="text-sm text-gray-500">Faturamento acumulado no ano</p>
            </div>
            {!editingMetas && (
              <button
                onClick={() => setEditingMetas(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Editar
              </button>
            )}
          </div>

          {editingMetas ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Faturamento (R$)
                </label>
                <input
                  type="number"
                  value={metaFat}
                  onChange={(e) => setMetaFat(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  step="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Caixa (R$)
                </label>
                <input
                  type="number"
                  value={metaCaixa}
                  onChange={(e) => setMetaCaixa(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  step="100000"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveMetas}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setEditingMetas(false);
                    setMetaFat(metaEmpresa?.meta_faturamento_anual?.toString() || '5000000');
                    setMetaCaixa(metaEmpresa?.meta_caixa_anual?.toString() || '1000000');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  {formatShortCurrency(metaEmpresa?.faturamento_acumulado)}
                </span>
                <span className="text-gray-500 mb-1">
                  / {formatShortCurrency(metaEmpresa?.meta_faturamento_anual)}
                </span>
              </div>
              <ProgressBar
                value={metaEmpresa?.faturamento_acumulado || 0}
                max={metaEmpresa?.meta_faturamento_anual || 5000000}
                showPercentage={true}
                color="blue"
                size="lg"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Falta:</span>
                  <span className="ml-2 font-medium">
                    {formatShortCurrency((metaEmpresa?.meta_faturamento_anual || 5000000) - (metaEmpresa?.faturamento_acumulado || 0))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Media/mes restante:</span>
                  <span className="ml-2 font-medium">
                    {formatShortCurrency(
                      ((metaEmpresa?.meta_faturamento_anual || 5000000) - (metaEmpresa?.faturamento_acumulado || 0)) /
                      Math.max(12 - new Date().getMonth(), 1)
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Card Caixa */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Meta Caixa</h3>
              <p className="text-sm text-gray-500">Saldo em caixa atual</p>
            </div>
          </div>

          <div className="flex items-end gap-2 mb-4">
            <span className={`text-3xl font-bold ${(metaEmpresa?.caixa_atual || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatShortCurrency(metaEmpresa?.caixa_atual)}
            </span>
            <span className="text-gray-500 mb-1">
              / {formatShortCurrency(metaEmpresa?.meta_caixa_anual)}
            </span>
          </div>
          <ProgressBar
            value={Math.max(metaEmpresa?.caixa_atual || 0, 0)}
            max={metaEmpresa?.meta_caixa_anual || 1000000}
            showPercentage={true}
            color={metaEmpresa?.caixa_atual >= 0 ? 'green' : 'red'}
            size="lg"
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 font-medium ${
                (metaEmpresa?.perc_caixa || 0) >= 100 ? 'text-green-600' :
                (metaEmpresa?.perc_caixa || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(metaEmpresa?.perc_caixa || 0) >= 100 ? 'Meta Atingida' :
                 (metaEmpresa?.perc_caixa || 0) >= 50 ? 'Em Progresso' : 'Abaixo da Meta'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">% da meta:</span>
              <span className="ml-2 font-medium">
                {(metaEmpresa?.perc_caixa || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <>
          {/* Tab Projecao */}
          {activeTab === 'projecao' && dreAnual && (
            <div className="space-y-6">
              {/* Grafico de Receita */}
              {dreAnual.historico && dreAnual.historico.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Evolucao da Receita - {ano}</h3>
                  <LineChart
                    data={dreAnual.historico.map(h => ({
                      name: h.mes_nome,
                      Receita: h.receita,
                      Lucro: h.lucro
                    }))}
                    dataKeys={['Receita', 'Lucro']}
                    colors={['#10B981', '#3B82F6']}
                  />
                </div>
              )}

              {/* Tabela de Projecao */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receita</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custos</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Lucro</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margem</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dreAnual?.historico?.map((h, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{h.mes_nome}</td>
                        <td className="px-6 py-4 text-right text-green-600">{formatCurrency(h.receita)}</td>
                        <td className="px-6 py-4 text-right text-red-600">{formatCurrency(h.custos)}</td>
                        <td className={`px-6 py-4 text-right font-medium ${h.lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(h.lucro)}
                        </td>
                        <td className="px-6 py-4 text-right">{h.margem_pct?.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right font-medium">{formatCurrency(h.receita_acumulada)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {dreAnual?.totais && (
                    <tfoot className="bg-gray-100 font-bold">
                      <tr>
                        <td className="px-6 py-4">TOTAL</td>
                        <td className="px-6 py-4 text-right text-green-700">{formatCurrency(dreAnual.totais.receita_total)}</td>
                        <td className="px-6 py-4 text-right text-red-700">{formatCurrency(dreAnual.totais.custos_total)}</td>
                        <td className={`px-6 py-4 text-right ${dreAnual.totais.lucro_total >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                          {formatCurrency(dreAnual.totais.lucro_total)}
                        </td>
                        <td className="px-6 py-4 text-right">{dreAnual.totais.margem_media_pct?.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(dreAnual.totais.receita_total)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Tab Funil */}
          {activeTab === 'funil' && funilHistorico && (
            <div className="space-y-6">
              {/* Grafico de Evolucao do Funil */}
              {funilHistorico.historico && funilHistorico.historico.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Evolucao do Funil - {ano}</h3>
                  <LineChart
                    data={funilHistorico.historico.map(h => ({
                      name: h.mes_nome,
                      Ativacoes: h.ativacoes,
                      Leads: h.leads,
                      Vendas: h.vendas
                    }))}
                    dataKeys={['Ativacoes', 'Leads', 'Vendas']}
                    colors={['#3B82F6', '#F59E0B', '#10B981']}
                  />
                </div>
              )}

              {/* Tabela de Metricas do Funil */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ativacoes</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversoes</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reunioes</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vendas</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {funilHistorico?.historico?.map((h, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{h.mes_nome}</td>
                        <td className="px-6 py-4 text-right">{h.ativacoes}</td>
                        <td className="px-6 py-4 text-right">{h.conversoes}</td>
                        <td className="px-6 py-4 text-right">{h.leads}</td>
                        <td className="px-6 py-4 text-right">{h.reunioes_realizadas}</td>
                        <td className="px-6 py-4 text-right font-medium text-green-600">{h.vendas}</td>
                        <td className="px-6 py-4 text-right font-medium text-blue-600">{formatCurrency(h.faturamento)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {funilHistorico?.historico?.length > 0 && (
                    <tfoot className="bg-gray-100 font-bold">
                      <tr>
                        <td className="px-6 py-4">TOTAL</td>
                        <td className="px-6 py-4 text-right">
                          {funilHistorico.historico.reduce((sum, h) => sum + (h.ativacoes || 0), 0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {funilHistorico.historico.reduce((sum, h) => sum + (h.conversoes || 0), 0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {funilHistorico.historico.reduce((sum, h) => sum + (h.leads || 0), 0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {funilHistorico.historico.reduce((sum, h) => sum + (h.reunioes_realizadas || 0), 0)}
                        </td>
                        <td className="px-6 py-4 text-right text-green-700">
                          {funilHistorico.historico.reduce((sum, h) => sum + (h.vendas || 0), 0)}
                        </td>
                        <td className="px-6 py-4 text-right text-blue-700">
                          {formatCurrency(funilHistorico.historico.reduce((sum, h) => sum + (h.faturamento || 0), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Tab DRE */}
          {activeTab === 'dre' && dreAnual && (
            <div className="space-y-6">
              {/* Grafico DRE */}
              {dreAnual.historico && dreAnual.historico.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Receita vs Custos vs Lucro - {ano}</h3>
                  <LineChart
                    data={dreAnual.historico.map(h => ({
                      name: h.mes_nome,
                      Receita: h.receita,
                      Custos: h.custos,
                      Lucro: h.lucro
                    }))}
                    dataKeys={['Receita', 'Custos', 'Lucro']}
                    colors={['#10B981', '#EF4444', '#3B82F6']}
                  />
                </div>
              )}

              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Receita Total</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(dreAnual.totais?.receita_total)}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Custos Totais</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(dreAnual.totais?.custos_total)}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Lucro Total</div>
                  <div className={`text-2xl font-bold ${dreAnual.totais?.lucro_total >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(dreAnual.totais?.lucro_total)}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Margem Media</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(dreAnual.totais?.margem_media_pct || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Planejamento;
