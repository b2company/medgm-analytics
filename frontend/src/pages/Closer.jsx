import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import CloserForm from '../components/CloserForm';
import UploadComercialModal from '../components/UploadComercialModal';
import MetricCard from '../components/MetricCard';
import BarChart from '../components/BarChart';
import ComboChart from '../components/ComboChart';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';
import ProgressBar from '../components/ProgressBar';
import GaugeChart from '../components/GaugeChart';
import CumulativeLineChart from '../components/CumulativeLineChart';
import FunnelTable from '../components/FunnelTable';
import FunnelChart from '../components/FunnelChart';
import KPICardWithProgress from '../components/KPICardWithProgress';
import HorizontalFunnel from '../components/HorizontalFunnel';
import ExpandableCard from '../components/ExpandableCard';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Closer = ({ mes: mesProp, ano: anoProp }) => {
  const [metricas, setMetricas] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardDiario, setDashboardDiario] = useState(null);
  const [metasIndividuais, setMetasIndividuais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMetrica, setEditingMetrica] = useState(null);
  const [filtroCloser, setFiltroCloser] = useState('');
  const [filtroFunil, setFiltroFunil] = useState('');
  const [mesAno, setMesAno] = useState({
    mes: mesProp || new Date().getMonth() + 1,
    ano: anoProp || new Date().getFullYear()
  });

  // Sincronizar com props quando mudarem (filtros globais do Comercial)
  useEffect(() => {
    if (mesProp && anoProp) {
      setMesAno({ mes: mesProp, ano: anoProp });
    }
  }, [mesProp, anoProp]);

  // Estados para filtros da tabela de métricas
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    closer: '',
    funil: ''
  });

  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    // Limpar TODOS os dados antes de buscar novos para forçar re-renderização
    setDashboardDiario(null);
    setDashboard(null);
    setMetricas([]);

    // Pequeno delay para garantir que o estado foi limpo
    const timer = setTimeout(() => {
      fetchData();
      fetchDashboardDiario();
    }, 10);

    return () => clearTimeout(timer);
  }, [mesAno.mes, mesAno.ano, filtroCloser, filtroFunil]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricasRes, dashRes] = await Promise.all([
        fetch(`${API_URL}/comercial/closer?mes=${mesAno.mes}&ano=${mesAno.ano}`),
        fetch(`${API_URL}/comercial/dashboard/closer?mes=${mesAno.mes}&ano=${mesAno.ano}`)
      ]);
      setMetricas(await metricasRes.json());
      setDashboard(await dashRes.json());
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardDiario = async () => {
    try {
      const params = new URLSearchParams({
        mes: mesAno.mes,
        ano: mesAno.ano
      });
      if (filtroCloser) params.append('closer', filtroCloser);
      if (filtroFunil) params.append('funil', filtroFunil);

      const [dashboardResponse, metasResponse] = await Promise.all([
        fetch(`${API_URL}/comercial/dashboard/closer-diario?${params}`),
        fetch(`${API_URL}/metas/?mes=${mesAno.mes}&ano=${mesAno.ano}`)
      ]);

      const data = await dashboardResponse.json();
      const metasData = await metasResponse.json();

      setDashboardDiario(data);
      setMetasIndividuais(metasData.metas || []);
    } catch (error) {
      console.error('Erro ao buscar dashboard diário:', error);
    }
  };

  // Função helper para calcular dados acumulados
  const calcularAcumulado = (dadosDiarios, campo, metaMensal) => {
    let acumulado = 0;
    const diasNoMes = dadosDiarios.length;
    const metaDiaria = metaMensal / diasNoMes;

    return dadosDiarios.map((dia, index) => {
      acumulado += dia[campo] || 0;
      return {
        dia: dia.dia,
        realizado: acumulado,
        meta: metaDiaria * (index + 1)
      };
    });
  };

  // Função helper para agrupar dados por semana
  const agruparPorSemana = (dadosDiarios, campo) => {
    const semanas = {
      'S1 (1-7)': 0,
      'S2 (8-14)': 0,
      'S3 (15-21)': 0,
      'S4 (22-28)': 0,
      'S5 (29+)': 0
    };

    dadosDiarios.forEach(dia => {
      const semana =
        dia.dia <= 7 ? 'S1 (1-7)' :
        dia.dia <= 14 ? 'S2 (8-14)' :
        dia.dia <= 21 ? 'S3 (15-21)' :
        dia.dia <= 28 ? 'S4 (22-28)' : 'S5 (29+)';

      semanas[semana] += dia[campo] || 0;
    });

    return Object.keys(semanas).map(semana => ({
      name: semana,
      valor: semanas[semana]
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Extrair valores únicos para os dropdowns
  const closersUnicos = [...new Set(metricas.map(m => m.closer))].sort();
  const funisUnicos = [...new Set(metricas.map(m => m.funil))].sort();

  // Filtrar métricas baseado nos filtros ativos
  const metricasFiltradas = metricas.filter(m => {
    const metricaData = m.data ? new Date(m.data) : null;

    // Filtro de data range
    let passaFiltroData = true;
    if (filtros.dataInicio && metricaData) {
      const [dia, mes, ano] = filtros.dataInicio.split('/');
      const dataInicio = new Date(ano, mes - 1, dia);
      passaFiltroData = passaFiltroData && metricaData >= dataInicio;
    }
    if (filtros.dataFim && metricaData) {
      const [dia, mes, ano] = filtros.dataFim.split('/');
      const dataFim = new Date(ano, mes - 1, dia);
      dataFim.setHours(23, 59, 59); // Incluir o dia inteiro
      passaFiltroData = passaFiltroData && metricaData <= dataFim;
    }

    return (
      passaFiltroData &&
      (!filtros.closer || m.closer === filtros.closer) &&
      (!filtros.funil || m.funil === filtros.funil)
    );
  });

  const handleSubmit = async (formData, isEdit = false) => {
    try {
      const url = isEdit
        ? `${API_URL}/comercial/closer/${editingMetrica.id}`
        : `${API_URL}/comercial/closer`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Metrica ${isEdit ? 'atualizada' : 'criada'} com sucesso!`);
        setShowModal(false);
        setEditingMetrica(null);
        fetchData();
      } else {
        alert('Erro ao salvar metrica');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar metrica');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta metrica?')) return;

    try {
      const response = await fetch(`${API_URL}/comercial/closer/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Metrica deletada!');
        fetchData();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleExport = async () => {
    try {
      window.open(`${API_URL}/export/closer?mes=${mesAno.mes}&ano=${mesAno.ano}`, '_blank');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados');
    }
  };

  const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

  // Calcular totais gerais
  const totaisGerais = metricas.reduce((acc, m) => ({
    vendas: acc.vendas + m.vendas,
    faturamento: acc.faturamento + m.faturamento,
    calls_agendadas: acc.calls_agendadas + m.calls_agendadas,
    calls_realizadas: acc.calls_realizadas + m.calls_realizadas,
    meta_vendas: acc.meta_vendas + m.meta_vendas,
    meta_faturamento: acc.meta_faturamento + m.meta_faturamento
  }), { vendas: 0, faturamento: 0, calls_agendadas: 0, calls_realizadas: 0, meta_vendas: 0, meta_faturamento: 0 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Closer</h1>
        <p className="text-gray-600 mt-2">Metricas de fechamento e faturamento</p>
      </div>

      <div className="flex justify-end items-center mb-6 gap-3">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
        >
          Exportar Excel
        </button>
        <button
          onClick={() => { setEditingMetrica(null); setShowModal(true); }}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-medium"
        >
          + Nova Metrica
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          📤 Upload em Massa
        </button>
      </div>

      {/* Filtros */}
      {dashboardDiario && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {dashboardDiario.closers && dashboardDiario.closers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Closer
              </label>
              <select
                value={filtroCloser}
                onChange={(e) => setFiltroCloser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos os Closers</option>
                {dashboardDiario.closers.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {dashboardDiario.funis && dashboardDiario.funis.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Funil
              </label>
              <select
                value={filtroFunil}
                onChange={(e) => setFiltroFunil(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos os Funis</option>
                {dashboardDiario.funis.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Atingimento de Metas */}
      {/* LINHA 1 - KPIs com barra de progresso */}
      {dashboardDiario && dashboardDiario.totais && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          <KPICardWithProgress
            title="Vendas"
            value={dashboardDiario.totais.vendas}
            showProgress={false}
            formatter={formatNumber}
            info="Total de vendas fechadas no mês."
          />
          <KPICardWithProgress
            title="Calls Agendadas"
            value={dashboardDiario.totais.calls_agendadas}
            showProgress={false}
            info="Calls de fechamento que foram agendadas no mês."
          />
          <KPICardWithProgress
            title="Calls Realizadas"
            value={dashboardDiario.totais.calls_realizadas}
            showProgress={false}
            info="Calls que de fato aconteceram (podem incluir calls agendadas em meses anteriores)."
          />
          <KPICardWithProgress
            title="Tx Conversão"
            value={formatPercent(dashboardDiario.totais.tx_conversao)}
            subtitle={`${formatNumber(dashboardDiario.totais.vendas)} de ${formatNumber(dashboardDiario.totais.calls_realizadas)} calls`}
            showProgress={false}
            info="Percentual de calls que resultaram em venda. É o principal indicador de efetividade do Closer."
          />
          <KPICardWithProgress
            title="Faturamento Bruto"
            value={dashboardDiario.totais.faturamento_bruto}
            meta={dashboardDiario.totais.faturamento_meta}
            formatter={formatCurrency}
            info="Valor total de faturamento bruto (antes de descontos/impostos). Meta baseada no bruto."
          />
          <KPICardWithProgress
            title="Faturamento Líquido"
            value={dashboardDiario.totais.faturamento_liquido}
            showProgress={false}
            formatter={formatCurrency}
            info="Valor líquido faturado no mês (após descontos/impostos)."
          />
          <KPICardWithProgress
            title="Ticket Médio"
            value={formatCurrency(dashboardDiario.totais.ticket_medio)}
            showProgress={false}
            info="Valor médio de cada venda (faturamento ÷ número de vendas). Ajuda a entender o perfil dos clientes fechados."
          />
        </div>
      )}

      {/* LINHA 2 - Funil de Conversão horizontal */}
      {dashboardDiario && dashboardDiario.totais && (
        <div className="mb-6">
          <HorizontalFunnel
            title="Funil de Conversão"
            stages={[
              {
                name: 'Calls Agendadas',
                value: dashboardDiario.totais.calls_agendadas,
                color: 'bg-blue-500'
              },
              {
                name: 'Calls Realizadas',
                value: dashboardDiario.totais.calls_realizadas,
                color: 'bg-indigo-500'
              },
              {
                name: 'Vendas',
                value: dashboardDiario.totais.vendas,
                color: 'bg-green-500'
              }
            ]}
            formatValue={formatNumber}
            info="Visualização completa do funil de vendas. As taxas mostram a conversão entre cada etapa. Útil para identificar onde estão os gargalos."
          />

          {/* Alerta se Calls Realizadas > Calls Agendadas */}
          {dashboardDiario.totais.calls_realizadas > dashboardDiario.totais.calls_agendadas && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Calls realizadas ({dashboardDiario.totais.calls_realizadas}) &gt; agendadas ({dashboardDiario.totais.calls_agendadas}) indica calls de meses anteriores sendo realizadas neste mês.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Comparativo entre Closers */}
      {dashboardDiario && dashboardDiario.breakdown_closer && dashboardDiario.breakdown_closer.length > 1 && (
        <div className="mb-6">
          <ExpandableCard
            title="Comparativo entre Closers"
            info="Comparação detalhada de performance entre os closers do time"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closer</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Vendas</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Calls Agendadas</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Calls Realizadas</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tx Conversão</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Meta Fat.</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardDiario.breakdown_closer.map((closer) => {
                    const txConversao = closer.calls_realizadas > 0
                      ? (closer.vendas / closer.calls_realizadas * 100)
                      : 0;
                    const ticketMedio = closer.vendas > 0
                      ? closer.faturamento_bruto / closer.vendas
                      : 0;

                    // Buscar meta individual do closer no array de metas
                    const metaCloser = metasIndividuais.find(m => m.pessoa?.nome === closer.closer);
                    const metaVendas = metaCloser?.meta_vendas || 0;
                    const metaFaturamento = metaCloser?.meta_faturamento || 0;

                    return (
                      <tr key={closer.closer} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{closer.closer}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="font-bold text-gray-900">{formatNumber(closer.vendas)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {formatNumber(closer.calls_agendadas)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {formatNumber(closer.calls_realizadas)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            txConversao >= 20 ? 'bg-green-100 text-green-800' :
                            txConversao >= 15 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {formatPercent(txConversao)}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {closer.vendas} de {closer.calls_realizadas} calls
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">
                          {formatCurrency(closer.faturamento_bruto)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {formatCurrency(metaFaturamento)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {formatCurrency(ticketMedio)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ExpandableCard>
        </div>
      )}

      {/* LINHA 3 - Grid 2 colunas: Gráficos Acumulados */}
      {dashboardDiario && dashboardDiario.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExpandableCard
            title="Vendas Acumuladas vs Meta"
            info="Mostra se o ritmo de vendas está no caminho certo para bater a meta mensal. A área sombreada indica o gap entre realizado e meta."
          >
            <CumulativeLineChart
              data={calcularAcumulado(
                dashboardDiario.dados_diarios,
                'vendas',
                dashboardDiario.totais.vendas_meta
              )}
              lineKey="realizado"
              metaKey="meta"
              lineColor="#3B82F6"
              metaColor="#10B981"
              height={300}
            />
          </ExpandableCard>

          <ExpandableCard
            title="Faturamento Bruto Acumulado vs Meta"
            info="Acompanhamento do faturamento bruto acumulado. Permite visualizar se o ritmo de vendas + ticket médio estão alinhados com a meta financeira."
          >
            <CumulativeLineChart
              data={calcularAcumulado(
                dashboardDiario.dados_diarios,
                'faturamento_bruto',
                dashboardDiario.totais.faturamento_meta
              )}
              lineKey="realizado"
              metaKey="meta"
              lineColor="#10B981"
              metaColor="#059669"
              height={300}
              isCurrency={true}
            />
          </ExpandableCard>
        </div>
      )}

      {/* LINHA 4 - Distribuição por Funil */}
      {dashboardDiario && dashboardDiario.breakdown_funil && dashboardDiario.breakdown_funil.length > 0 && (
        <div className="mb-6">
          <ExpandableCard
            title="Distribuição por Funil"
            info="Performance detalhada por origem de lead (Social Selling, Quiz, Indicação, Webinário). Use para identificar quais funis têm melhor taxa de conversão."
          >
            <FunnelTable
              data={dashboardDiario.breakdown_funil}
              type="closer"
            />
          </ExpandableCard>

          {/* Vendas e Faturamento por Funil - Barras Horizontais */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas e Faturamento por Funil</h3>
            <div className="space-y-3">
              {dashboardDiario.breakdown_funil.map((item) => {
                const totalVendas = dashboardDiario.totais.vendas;
                const percentual = totalVendas > 0 ? (item.vendas / totalVendas * 100) : 0;
                return (
                  <div key={item.funil} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-gray-700">{item.funil}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-8 relative">
                        <div
                          className="bg-green-500 h-8 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                          style={{ width: `${percentual}%` }}
                        >
                          {percentual > 10 && (
                            <span className="text-white text-sm font-semibold">
                              {percentual.toFixed(0)}%
                            </span>
                          )}
                        </div>
                        {percentual <= 10 && percentual > 0 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 text-sm font-semibold">
                            {percentual.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-semibold text-gray-900">
                      {item.vendas} venda{item.vendas !== 1 ? 's' : ''}
                    </div>
                    <div className="w-32 text-right text-sm font-bold text-green-700">
                      {formatCurrency(item.faturamento_bruto)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LINHA 5 - Gráficos Semanais */}
      {dashboardDiario && dashboardDiario.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ExpandableCard
            title="Calls Realizadas por Semana"
            info="Agregação semanal de calls realizadas. Facilita visualização do ritmo de trabalho ao longo do mês."
          >
            <BarChart
              data={agruparPorSemana(dashboardDiario.dados_diarios, 'calls_realizadas')}
              dataKey="valor"
              color="#3B82F6"
              height={250}
            />
          </ExpandableCard>

          <ExpandableCard
            title="Vendas Realizadas por Semana"
            info="Distribuição semanal das vendas fechadas. Mostra em quais semanas houve maior conversão."
          >
            <BarChart
              data={agruparPorSemana(dashboardDiario.dados_diarios, 'vendas')}
              dataKey="valor"
              color="#10B981"
              height={250}
            />
          </ExpandableCard>

          <ExpandableCard
            title="Faturamento Realizado por Semana"
            info="Faturamento bruto agregado por semana. Permite identificar semanas com maior volume financeiro."
          >
            <BarChart
              data={agruparPorSemana(dashboardDiario.dados_diarios, 'faturamento_liquido')}
              dataKey="valor"
              color="#059669"
              height={250}
              isCurrency={true}
            />
          </ExpandableCard>
        </div>
      )}

      {/* Graficos */}
      {metricas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Grafico de Barras - Faturamento por Closer */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Faturamento por Closer</h3>
            {dashboard && dashboard.metricas_por_closer && (
              <BarChart
                data={Object.entries(dashboard.metricas_por_closer).map(([closer, dados]) => ({
                  name: closer,
                  Faturamento: dados.total_faturamento
                }))}
                dataKey="Faturamento"
                color="#10B981"
              />
            )}
          </div>

          {/* Grafico de Pizza - Vendas por Funil */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Funil</h3>
            {(() => {
              // Agrupar vendas por funil
              const vendasPorFunil = metricas.reduce((acc, m) => {
                acc[m.funil] = (acc[m.funil] || 0) + m.vendas;
                return acc;
              }, {});

              return (
                <PieChart
                  data={Object.entries(vendasPorFunil).map(([funil, vendas]) => ({
                    name: funil,
                    value: vendas
                  }))}
                  dataKey="value"
                  nameKey="name"
                  height={300}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Grafico de Barras Calls x Vendas */}
      {dashboard && dashboard.metricas_por_closer && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls vs Vendas por Closer</h3>
          <div className="h-80">
            <BarChart
              data={Object.entries(dashboard.metricas_por_closer).map(([closer, dados]) => ({
                name: closer,
                Calls: dados.total_calls_realizadas,
                Vendas: dados.total_vendas
              }))}
              dataKey={['Calls', 'Vendas']}
              colors={['#3B82F6', '#10B981']}
              height={300}
            />
          </div>
        </div>
      )}

      {/* Tabela Detalhada */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Metricas Detalhadas - {meses[mesAno.mes - 1]} {mesAno.ano}
            </h2>
            <div className="flex gap-4">
              <select
                value={mesAno.mes}
                onChange={(e) => setMesAno({ ...mesAno, mes: parseInt(e.target.value) })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
              >
                {meses.map((mes, idx) => (
                  <option key={idx} value={idx + 1}>{mes}</option>
                ))}
              </select>
              <input
                type="number"
                value={mesAno.ano}
                onChange={(e) => setMesAno({ ...mesAno, ano: parseInt(e.target.value) })}
                className="border border-gray-300 rounded-lg px-4 py-2 w-32"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p>Carregando...</p>
          </div>
        ) : metricas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">Nenhuma metrica encontrada</p>
            <p className="text-sm">Clique em "+ Nova Metrica" para adicionar dados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funil</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Agendadas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Realizadas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tx Comp.</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Vendas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tx Conv.</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ticket</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acoes</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="px-2 py-2">
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder="De DD/MM/AAAA"
                        value={filtros.dataInicio}
                        onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                        className="w-full px-2 py-1 text-xs border rounded"
                        maxLength={10}
                      />
                      <input
                        type="text"
                        placeholder="Até DD/MM/AAAA"
                        value={filtros.dataFim}
                        onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                        className="w-full px-2 py-1 text-xs border rounded"
                        maxLength={10}
                      />
                    </div>
                  </th>
                  <th className="px-2 py-2">
                    <select
                      value={filtros.closer}
                      onChange={(e) => setFiltros({...filtros, closer: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    >
                      <option value="">Todos</option>
                      {closersUnicos.map(closer => (
                        <option key={closer} value={closer}>{closer}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-2 py-2">
                    <select
                      value={filtros.funil}
                      onChange={(e) => setFiltros({...filtros, funil: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    >
                      <option value="">Todos</option>
                      {funisUnicos.map(funil => (
                        <option key={funil} value={funil}>{funil}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-2 py-2"></th>
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
                {metricasFiltradas.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {m.data ? new Date(m.data).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{m.closer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{m.funil}</td>
                    <td className="px-6 py-4 text-center">{m.calls_agendadas}</td>
                    <td className="px-6 py-4 text-center">{m.calls_realizadas}</td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-600">
                      {formatPercent(m.tx_comparecimento)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{m.vendas}</td>
                    <td className="px-6 py-4 text-center font-semibold text-purple-600">
                      {formatPercent(m.tx_conversao)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-green-700">
                      {formatCurrency(m.faturamento_bruto)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {formatCurrency(m.ticket_medio)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => { setEditingMetrica(m); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={editingMetrica ? 'Editar Metrica Closer' : 'Nova Metrica Closer'}
        onClose={() => { setShowModal(false); setEditingMetrica(null); }}
      >
        <CloserForm
          onSubmit={(data) => handleSubmit(data, !!editingMetrica)}
          onClose={() => { setShowModal(false); setEditingMetrica(null); }}
          initialData={editingMetrica}
        />
      </Modal>

      {/* Modal de Upload */}
      <UploadComercialModal
        isOpen={showUploadModal}
        tipo="closer"
        onClose={(sucesso) => {
          setShowUploadModal(false);
          if (sucesso) {
            fetchMetricas();
            fetchDashboard();
          }
        }}
      />
    </div>
  );
};

export default Closer;
