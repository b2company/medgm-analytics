import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import SocialSellingForm from '../components/SocialSellingForm';
import UploadComercialModal from '../components/UploadComercialModal';
import MetricCard from '../components/MetricCard';
import BarChart from '../components/BarChart';
import ComboChart from '../components/ComboChart';
import PieChart from '../components/PieChart';
import ProgressBar from '../components/ProgressBar';
import GaugeChart from '../components/GaugeChart';
import TrackingDiarioSS from '../components/TrackingDiarioSS';
import GroupedBarChart from '../components/GroupedBarChart';
import CumulativeLineChart from '../components/CumulativeLineChart';
import TableComparative from '../components/TableComparative';
import KPICardWithProgress from '../components/KPICardWithProgress';
import HorizontalFunnel from '../components/HorizontalFunnel';
import ExpandableCard from '../components/ExpandableCard';
import { formatNumber, formatPercent } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SocialSelling = ({ mes: mesProp, ano: anoProp }) => {
  const [metricas, setMetricas] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardDiario, setDashboardDiario] = useState(null);
  const [dadosComparativos, setDadosComparativos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMetrica, setEditingMetrica] = useState(null);
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroFunil, setFiltroFunil] = useState('');
  const [funisDisponiveis, setFunisDisponiveis] = useState([]);
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
    vendedor: ''
  });

  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    // Limpar TODOS os dados antes de buscar novos para forçar re-renderização
    setDashboardDiario(null);
    setDadosComparativos(null);
    setDashboard(null);
    setMetricas([]);

    // Pequeno delay para garantir que o estado foi limpo
    const timer = setTimeout(() => {
      fetchMetricas();
      fetchDashboard();
      fetchDashboardDiario();
      fetchComparativo();
    }, 10);

    return () => clearTimeout(timer);
  }, [mesAno.mes, mesAno.ano, filtroVendedor, filtroFunil]);

  const fetchMetricas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/comercial/social-selling?mes=${mesAno.mes}&ano=${mesAno.ano}`);
      const data = await response.json();
      setMetricas(data);
    } catch (error) {
      console.error('Erro ao buscar metricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/comercial/dashboard/social-selling?mes=${mesAno.mes}&ano=${mesAno.ano}`);
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
    }
  };

  const fetchDashboardDiario = async () => {
    try {
      const params = new URLSearchParams({
        mes: mesAno.mes,
        ano: mesAno.ano
      });
      if (filtroVendedor) {
        params.append('vendedor', filtroVendedor);
      }
      if (filtroFunil) {
        params.append('funil', filtroFunil);
      }
      const response = await fetch(`${API_URL}/comercial/dashboard/social-selling-diario?${params}`);
      const data = await response.json();
      console.log('📊 Dashboard Diário recebido:', data);
      console.log('📈 Total de dias:', data.dados_diarios?.length);
      setDashboardDiario(data);

      // Extrair funis disponíveis
      if (data.funis && data.funis.length > 0) {
        setFunisDisponiveis(data.funis);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dashboard diário:', error);
    }
  };

  const fetchComparativo = async () => {
    try {
      const params = new URLSearchParams({
        mes: mesAno.mes,
        ano: mesAno.ano
      });
      if (filtroFunil) {
        params.append('funil', filtroFunil);
      }
      const response = await fetch(
        `${API_URL}/comercial/dashboard/social-selling-comparativo?${params}`
      );
      const data = await response.json();
      setDadosComparativos(data);
    } catch (error) {
      console.error('Erro ao buscar comparativo:', error);
    }
  };

  // Função helper para agrupar dados por semana (dados agregados)
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

  // Função helper para calcular dados acumulados
  const calcularAcumulado = (dadosDiarios, campo, metaMensal) => {
    // Agrupar por dia (somar valores de todos os vendedores)
    const dadosPorDia = dadosDiarios.reduce((acc, item) => {
      if (!acc[item.dia]) {
        acc[item.dia] = 0;
      }
      acc[item.dia] += item[campo] || 0;
      return acc;
    }, {});

    // Calcular acumulado
    let acumulado = 0;
    const diasNoMes = Math.max(...Object.keys(dadosPorDia).map(d => parseInt(d)));
    const metaDiaria = metaMensal / diasNoMes;

    return Object.keys(dadosPorDia)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((dia, index) => {
        acumulado += dadosPorDia[dia];
        return {
          dia: parseInt(dia),
          realizado: acumulado,
          meta: metaDiaria * (index + 1)
        };
      });
  };

  // Extrair valores únicos para os dropdowns
  const vendedoresUnicos = [...new Set(metricas.map(m => m.vendedor))].sort();

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
      dataFim.setHours(23, 59, 59);
      passaFiltroData = passaFiltroData && metricaData <= dataFim;
    }

    return (
      passaFiltroData &&
      (!filtros.vendedor || m.vendedor === filtros.vendedor)
    );
  });

  const handleCreate = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/comercial/social-selling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Metrica criada com sucesso!');
        setShowModal(false);
        fetchMetricas();
        fetchDashboard();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao criar metrica:', error);
      alert('Erro ao criar metrica');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/comercial/social-selling/${editingMetrica.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Metrica atualizada com sucesso!');
        setShowModal(false);
        setEditingMetrica(null);
        fetchMetricas();
        fetchDashboard();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar metrica:', error);
      alert('Erro ao atualizar metrica');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta metrica?')) return;

    try {
      const response = await fetch(`${API_URL}/comercial/social-selling/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Metrica deletada com sucesso!');
        fetchMetricas();
        fetchDashboard();
      } else {
        alert('Erro ao deletar metrica');
      }
    } catch (error) {
      console.error('Erro ao deletar metrica:', error);
      alert('Erro ao deletar metrica');
    }
  };

  const handleExport = async () => {
    try {
      window.open(`${API_URL}/export/social-selling?mes=${mesAno.mes}&ano=${mesAno.ano}`, '_blank');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados');
    }
  };

  const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Social Selling</h1>
          <p className="text-gray-500 mt-2 text-lg">Acompanhamento de métricas de marketing e ativação</p>
        </div>

        {/* Acoes */}
        <div className="flex justify-end items-center mb-8 gap-4">
          <button
            onClick={handleExport}
            className="bg-white text-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-md border border-gray-100"
          >
            📊 Exportar Excel
          </button>
          <button
            onClick={() => {
              setEditingMetrica(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all font-medium shadow-md"
          >
            + Nova Métrica
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-950 transition-all font-medium shadow-md"
          >
            📤 Upload em Massa
          </button>
        </div>

      {/* Filtros */}
      {dashboardDiario && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {dashboardDiario.vendedores && dashboardDiario.vendedores.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-50">
              <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Filtrar por Vendedor
              </label>
              <select
                value={filtroVendedor}
                onChange={(e) => setFiltroVendedor(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 font-medium text-gray-900"
              >
                <option value="">Todos os Vendedores</option>
                {dashboardDiario.vendedores.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}

          {funisDisponiveis.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-50">
              <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Filtrar por Funil
              </label>
              <select
                value={filtroFunil}
                onChange={(e) => setFiltroFunil(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 font-medium text-gray-900"
              >
                <option value="">Todos os Funis</option>
                {funisDisponiveis.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* LINHA 1 - KPIs com barra de progresso */}
      {dashboardDiario && dashboardDiario.totais && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICardWithProgress
            title="Ativações"
            value={dashboardDiario.totais.ativacoes}
            meta={dashboardDiario.totais.ativacoes_meta}
            formatter={formatNumber}
            icon="👥"
            trend={15.3}
            info="Total de ativações de Social Selling (contatos iniciais com potenciais clientes). A barra mostra progresso vs meta mensal."
          />
          <KPICardWithProgress
            title="Conversões"
            value={dashboardDiario.totais.conversoes}
            subtitle={`Taxa: ${formatPercent(dashboardDiario.totais.tx_ativ_conv)}`}
            showProgress={false}
            icon="💬"
            trend={10.5}
            info="Ativações que geraram alguma conversão (interesse demonstrado). A taxa indica o percentual de ativações que converteram."
          />
          <KPICardWithProgress
            title="Leads"
            value={dashboardDiario.totais.leads}
            meta={dashboardDiario.totais.leads_meta}
            formatter={formatNumber}
            icon="🎯"
            trend={9.4}
            info="Conversões qualificadas que viraram leads prontos para o SDR. A barra mostra progresso vs meta mensal."
          />
          <KPICardWithProgress
            title="Taxa Conv→Lead"
            value={formatPercent(dashboardDiario.totais.tx_conv_lead)}
            subtitle={`${formatNumber(dashboardDiario.totais.leads)} de ${formatNumber(dashboardDiario.totais.conversoes)} conversões`}
            showProgress={false}
            icon="📊"
            trend={6.7}
            info="Percentual de conversões que se tornaram leads qualificados. Indica a qualidade da qualificação do time de Social Selling."
          />
        </div>
      )}

      {/* LINHA 2 - Funil horizontal compacto */}
      {dashboardDiario && dashboardDiario.totais && (
        <div className="mb-6">
          <HorizontalFunnel
            title="Funil de Conversão Social Selling"
            stages={[
              {
                name: 'Ativações',
                value: dashboardDiario.totais.ativacoes,
                color: 'bg-blue-500'
              },
              {
                name: 'Conversões',
                value: dashboardDiario.totais.conversoes,
                color: 'bg-indigo-500'
              },
              {
                name: 'Leads',
                value: dashboardDiario.totais.leads,
                color: 'bg-green-500'
              }
            ]}
            formatValue={formatNumber}
            info="Visualização completa do funil de Social Selling mostrando a taxa de conversão entre cada etapa. Use para identificar onde está o maior gargalo."
          />
        </div>
      )}

      {/* LINHA 3 - Grid 2 colunas: Gráficos Acumulados */}
      {dashboardDiario && dashboardDiario.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExpandableCard
            title="Ativações Acumuladas vs Meta"
            info="Mostra se o ritmo de ativações está no caminho certo para bater a meta mensal. A área sombreada indica o gap entre realizado e meta."
          >
            <CumulativeLineChart
              data={calcularAcumulado(
                dashboardDiario.dados_diarios,
                'ativacoes_realizado',
                dashboardDiario.totais.ativacoes_meta
              )}
              lineKey="realizado"
              metaKey="meta"
              lineColor="#3B82F6"
              metaColor="#10B981"
              height={300}
            />
          </ExpandableCard>

          <ExpandableCard
            title="Leads Acumulados vs Meta"
            info="Acompanhamento do ritmo de geração de leads qualificados. Permite visualizar se a conversão está alinhada com a meta mensal."
          >
            <CumulativeLineChart
              data={calcularAcumulado(
                dashboardDiario.dados_diarios,
                'leads_realizado',
                dashboardDiario.totais.leads_meta
              )}
              lineKey="realizado"
              metaKey="meta"
              lineColor="#10B981"
              metaColor="#059669"
              height={300}
            />
          </ExpandableCard>
        </div>
      )}

      {/* LINHA 4 - Tabela Comparativa por Vendedor */}
      {dadosComparativos && dadosComparativos.length > 0 && (
        <div className="mb-6">
          <ExpandableCard
            title="Comparativo por Vendedor"
            info="Comparação completa de performance entre vendedores. As cores indicam: Verde (>80%), Amarelo (40-80%), Vermelho (<40%). Use para identificar quem tem melhor taxa de conversão e volume."
          >
            <TableComparative
              data={dadosComparativos.map(v => ({
                ...v,
                leads_por_1k: v.ativacoes > 0 ? ((v.leads / v.ativacoes) * 1000) : 0
              }))}
              columns={[
                { key: 'vendedor', label: 'Vendedor', align: 'left' },
                { key: 'ativacoes', label: 'Ativações', align: 'right', format: 'number' },
                { key: 'ativacoes_meta', label: 'Meta Ativ.', align: 'right', format: 'number' },
                { key: 'ativacoes_perc', label: '% Ativ.', align: 'right', format: 'percent' },
                { key: 'conversoes', label: 'Conv.', align: 'right', format: 'number' },
                { key: 'tx_ativ_conv', label: 'Tx Ativ>Conv', align: 'right', format: 'percent' },
                { key: 'leads', label: 'Leads', align: 'right', format: 'number' },
                { key: 'leads_meta', label: 'Meta Leads', align: 'right', format: 'number' },
                { key: 'leads_perc', label: '% Leads', align: 'right', format: 'percent' },
                { key: 'tx_conv_lead', label: 'Tx Conv>Lead', align: 'right', format: 'percent' },
                { key: 'leads_por_1k', label: 'Leads/1k Ativ', align: 'right', format: 'decimal' }
              ]}
            />
          </ExpandableCard>
        </div>
      )}

      {/* LINHA 5 - Grid 2 colunas: Gráficos Semanais */}
      {dashboardDiario && dashboardDiario.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExpandableCard
            title="Ativações por Semana"
            info="Evolução semanal de ativações (S1-S5). Use para identificar tendências e períodos de maior produtividade."
          >
            <BarChart
              data={agruparPorSemana(dashboardDiario.dados_diarios, 'ativacoes_realizado')}
              dataKey="valor"
              color="#3B82F6"
              height={300}
            />
          </ExpandableCard>

          <ExpandableCard
            title="Leads por Semana"
            info="Evolução semanal de leads gerados (S1-S5). Mostra o ritmo de qualificação ao longo do mês."
          >
            <BarChart
              data={agruparPorSemana(dashboardDiario.dados_diarios, 'leads_realizado')}
              dataKey="valor"
              color="#10B981"
              height={300}
            />
          </ExpandableCard>
        </div>
      )}


      {/* Tabela de Metricas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Metricas por Vendedor - {meses[mesAno.mes - 1]} {mesAno.ano}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ativacoes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversoes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tx Ativ-Conv
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leads
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tx Conv-Lead
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acoes
                  </th>
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
                      value={filtros.vendedor}
                      onChange={(e) => setFiltros({...filtros, vendedor: e.target.value})}
                      className="w-full px-2 py-1 text-xs border rounded"
                    >
                      <option value="">Todos</option>
                      {vendedoresUnicos.map(vendedor => (
                        <option key={vendedor} value={vendedor}>{vendedor}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metricasFiltradas.map((metrica) => (
                  <tr key={metrica.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {metrica.data ? new Date(metrica.data).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {metrica.vendedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {metrica.ativacoes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {metrica.conversoes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`font-semibold ${metrica.tx_ativ_conv >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {formatPercent(metrica.tx_ativ_conv)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold">
                      {metrica.leads_gerados}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`font-semibold ${metrica.tx_conv_lead >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {formatPercent(metrica.tx_conv_lead)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          setEditingMetrica(metrica);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(metrica.id)}
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
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        title={editingMetrica ? 'Editar Metrica' : 'Nova Metrica de Social Selling'}
        onClose={() => {
          setShowModal(false);
          setEditingMetrica(null);
        }}
      >
        <SocialSellingForm
          onSubmit={editingMetrica ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setEditingMetrica(null);
          }}
          initialData={editingMetrica}
        />
      </Modal>

      {/* Modal de Upload */}
      <UploadComercialModal
        isOpen={showUploadModal}
        tipo="social-selling"
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

export default SocialSelling;
