import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import SDRForm from '../components/SDRForm';
import UploadComercialModal from '../components/UploadComercialModal';
import MetricCard from '../components/MetricCard';
import BarChart from '../components/BarChart';
import ComboChart from '../components/ComboChart';
import PieChart from '../components/PieChart';
import ProgressBar from '../components/ProgressBar';
import GaugeChart from '../components/GaugeChart';
import GroupedBarChart from '../components/GroupedBarChart';
import CumulativeLineChart from '../components/CumulativeLineChart';
import FunnelTable from '../components/FunnelTable';
import KPICardWithProgress from '../components/KPICardWithProgress';
import HorizontalFunnel from '../components/HorizontalFunnel';
import CompactHorizontalFunnel from '../components/CompactHorizontalFunnel';
import ComboChartWithLine from '../components/ComboChartWithLine';
import ExpandableCard from '../components/ExpandableCard';
import EditableDataTable from '../components/EditableDataTable';
import FilterPanel from '../components/FilterPanel';
import { FilterSelect, FilterDateRange } from '../components/FilterInput';
import { formatNumber, formatPercent } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SDR = ({ mes: mesProp, ano: anoProp }) => {
  const [metricas, setMetricas] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardDiario, setDashboardDiario] = useState(null);
  const [dashboardMesAnterior, setDashboardMesAnterior] = useState(null);
  const [closerDiario, setCloserDiario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMetrica, setEditingMetrica] = useState(null);
  const [filtroSDR, setFiltroSDR] = useState('');
  const [filtroFunil, setFiltroFunil] = useState('');
  const [funisDisponiveis, setFunisDisponiveis] = useState([]);
  const [viewMode, setViewMode] = useState('pessoa'); // 'pessoa' ou 'funil'
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
    sdr: '',
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
  }, [mesAno.mes, mesAno.ano, filtroSDR, filtroFunil]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricasRes, dashRes] = await Promise.all([
        fetch(`${API_URL}/comercial/sdr?mes=${mesAno.mes}&ano=${mesAno.ano}`),
        fetch(`${API_URL}/comercial/dashboard/sdr?mes=${mesAno.mes}&ano=${mesAno.ano}`)
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
      if (filtroSDR) {
        params.append('sdr', filtroSDR);
      }
      if (filtroFunil) {
        params.append('funil', filtroFunil);
      }

      // Calcular mês anterior
      const mesAnterior = mesAno.mes === 1 ? 12 : mesAno.mes - 1;
      const anoAnterior = mesAno.mes === 1 ? mesAno.ano - 1 : mesAno.ano;

      const paramsMesAnterior = new URLSearchParams({
        mes: mesAnterior,
        ano: anoAnterior
      });
      if (filtroSDR) {
        paramsMesAnterior.append('sdr', filtroSDR);
      }
      if (filtroFunil) {
        paramsMesAnterior.append('funil', filtroFunil);
      }

      // Buscar dados do SDR (atual e anterior), Closer e Metas em paralelo
      const [sdrResponse, sdrMesAnteriorResponse, closerResponse, metasResponse] = await Promise.all([
        fetch(`${API_URL}/comercial/dashboard/sdr-diario?${params}`),
        fetch(`${API_URL}/comercial/dashboard/sdr-diario?${paramsMesAnterior}`),
        fetch(`${API_URL}/comercial/dashboard/closer-diario?mes=${mesAno.mes}&ano=${mesAno.ano}`),
        fetch(`${API_URL}/metas/?mes=${mesAno.mes}&ano=${mesAno.ano}`)
      ]);

      const sdrData = await sdrResponse.json();
      const sdrMesAnteriorData = await sdrMesAnteriorResponse.json();
      const closerData = await closerResponse.json();
      const metasData = await metasResponse.json();

      // Encontrar meta do SDR
      const metaSDR = metasData.metas?.find(m =>
        m.pessoa?.funcao?.toLowerCase().includes('sdr')
      );

      // Adicionar metas aos totais do SDR se existirem
      if (metaSDR && sdrData.totais) {
        sdrData.totais.reunioes_agendadas_meta = metaSDR.meta_reunioes_agendadas || null;
        sdrData.totais.reunioes_realizadas_meta = metaSDR.meta_reunioes || null;
      }

      setDashboardDiario(sdrData);
      setDashboardMesAnterior(sdrMesAnteriorData);
      setCloserDiario(closerData);

      // Extrair funis disponíveis do breakdown_funil
      if (sdrData.breakdown_funil && sdrData.breakdown_funil.length > 0) {
        const funis = sdrData.breakdown_funil.map(item => item.funil);
        setFunisDisponiveis(funis);
      }
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

  const handleSubmit = async (formData, isEdit = false) => {
    try {
      const url = isEdit
        ? `${API_URL}/comercial/sdr/${editingMetrica.id}`
        : `${API_URL}/comercial/sdr`;
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

  const handleDelete = async (row) => {
    if (!confirm('Tem certeza que deseja deletar esta metrica?')) return;

    try {
      const response = await fetch(`${API_URL}/comercial/sdr/${row.id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Metrica deletada!');
        fetchData();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleInlineUpdate = async (id, updatedRow) => {
    try {
      const response = await fetch(`${API_URL}/comercial/sdr/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRow)
      });

      if (response.ok) {
        await fetchData();
        await fetchDashboardDiario();
      } else {
        alert('Erro ao salvar');
        throw new Error('Falha ao salvar');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar. Tente novamente.');
      throw error;
    }
  };

  const handleExport = async () => {
    try {
      window.open(`${API_URL}/export/sdr?mes=${mesAno.mes}&ano=${mesAno.ano}`, '_blank');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados');
    }
  };

  const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

  // Calcular trend (variação % em relação ao mês anterior)
  const calcularTrend = (valorAtual, valorAnterior) => {
    if (!valorAnterior || valorAnterior === 0) return null;
    return ((valorAtual - valorAnterior) / valorAnterior) * 100;
  };

  // Extrair valores únicos para os dropdowns
  const sdrsUnicos = [...new Set(metricas.map(m => m.sdr))].sort();
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
      (!filtros.sdr || m.sdr === filtros.sdr) &&
      (!filtros.funil || m.funil === filtros.funil)
    );
  });

  // Calcular totais gerais
  const totaisGerais = metricas.reduce((acc, m) => ({
    leads: acc.leads + m.leads_recebidos,
    agendadas: acc.agendadas + m.reunioes_agendadas,
    realizadas: acc.realizadas + m.reunioes_realizadas,
    meta: acc.meta + m.meta_reunioes
  }), { leads: 0, agendadas: 0, realizadas: 0, meta: 0 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SDR</h1>
        <p className="text-gray-600 mt-2">Metricas de qualificacao e agendamento de reunioes</p>
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
          {dashboardDiario.sdrs && dashboardDiario.sdrs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por SDR
              </label>
              <select
                value={filtroSDR}
                onChange={(e) => setFiltroSDR(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos os SDRs</option>
                {dashboardDiario.sdrs.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {funisDisponiveis.length > 0 && (
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <KPICardWithProgress
            title="Leads Recebidos"
            value={dashboardDiario.totais.leads_recebidos || 0}
            meta={dashboardDiario.totais.leads_recebidos_meta}
            formatter={formatNumber}
            showProgress={!!dashboardDiario.totais.leads_recebidos_meta}
            trend={dashboardMesAnterior?.totais ? calcularTrend(dashboardDiario.totais.leads_recebidos, dashboardMesAnterior.totais.leads_recebidos) : null}
            info="Total de leads que entraram no funil do SDR neste mês. Cada lead é uma oportunidade de agendamento de reunião."
          />
          <KPICardWithProgress
            title="Reuniões Agendadas"
            value={dashboardDiario.totais.reunioes_agendadas}
            meta={dashboardDiario.totais.reunioes_agendadas_meta}
            formatter={formatNumber}
            showProgress={!!dashboardDiario.totais.reunioes_agendadas_meta}
            trend={dashboardMesAnterior?.totais ? calcularTrend(dashboardDiario.totais.reunioes_agendadas, dashboardMesAnterior.totais.reunioes_agendadas) : null}
            info="Número de reuniões que o SDR conseguiu marcar com os leads. A barra mostra o progresso em relação à meta mensal."
          />
          <KPICardWithProgress
            title="Reuniões Realizadas"
            value={dashboardDiario.totais.reunioes_realizadas}
            meta={dashboardDiario.totais.reunioes_realizadas_meta}
            formatter={formatNumber}
            trend={dashboardMesAnterior?.totais ? calcularTrend(dashboardDiario.totais.reunioes_realizadas, dashboardMesAnterior.totais.reunioes_realizadas) : null}
            info="Reuniões que de fato aconteceram (leads compareceram). Este é o número que passa para o Closer."
          />
          <KPICardWithProgress
            title="Tx Agendamento"
            value={dashboardDiario.totais.tx_agendamento}
            meta={100}
            formatter={(v) => formatPercent(v)}
            subtitle={`${formatNumber(dashboardDiario.totais.reunioes_agendadas)} de ${formatNumber(dashboardDiario.totais.leads_recebidos)} leads`}
            progressPercent={dashboardDiario.totais.tx_agendamento}
            trend={dashboardMesAnterior?.totais ? calcularTrend(dashboardDiario.totais.tx_agendamento, dashboardMesAnterior.totais.tx_agendamento) : null}
            info="Percentual de leads que aceitaram agendar uma reunião. Quanto maior, melhor a qualificação e abordagem do SDR."
          />
          <KPICardWithProgress
            title="Tx Comparecimento"
            value={dashboardDiario.totais.tx_comparecimento}
            meta={80}
            formatter={(v) => formatPercent(v)}
            subtitle={`${formatNumber(dashboardDiario.totais.reunioes_realizadas)} de ${formatNumber(dashboardDiario.totais.reunioes_agendadas)} agendadas`}
            progressPercent={(dashboardDiario.totais.tx_comparecimento / 80) * 100}
            trend={dashboardMesAnterior?.totais ? calcularTrend(dashboardDiario.totais.tx_comparecimento, dashboardMesAnterior.totais.tx_comparecimento) : null}
            info="Percentual de leads que compareceram às reuniões agendadas. Taxa baixa pode indicar problema na qualificação ou confirmação. Meta: 80%"
          />
        </div>
      )}

      {/* LINHA 2 - Funil de Conversão */}
      {dashboardDiario && dashboardDiario.totais && (
        <div className="mb-6">
          <HorizontalFunnel
            title="Funil de Conversão SDR"
            stages={[
              {
                name: 'Leads Recebidos',
                value: dashboardDiario.totais.leads_recebidos || 0,
                color: 'bg-gray-500'
              },
              {
                name: 'Reuniões Agendadas',
                value: dashboardDiario.totais.reunioes_agendadas,
                color: 'bg-blue-500'
              },
              {
                name: 'Reuniões Realizadas',
                value: dashboardDiario.totais.reunioes_realizadas,
                color: 'bg-green-500'
              }
            ]}
            formatValue={formatNumber}
            info="Visualização do funil completo mostrando a taxa de conversão entre cada etapa. Os percentuais indicam quantos leads avançaram para a próxima fase."
          />
        </div>
      )}

      {/* LINHA 3 - Grid com 2 gráficos */}
      {dashboardDiario && dashboardDiario.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico 1: Atividade do SDR */}
          <ExpandableCard
            title="Atividade do SDR - Dia a Dia"
            info="Leads recebidos pelo SDR e reuniões que ele agendou naquele dia. A linha mostra a taxa de agendamento do dia."
          >
            <ComboChartWithLine
              data={dashboardDiario.dados_diarios.map(d => ({
                name: `${d.dia}`,
                'Leads Recebidos': d.leads_recebidos || 0,
                'Reuniões Agendadas': d.reunioes_agendadas || 0,
                'Taxa Agendamento': d.leads_recebidos > 0
                  ? (d.reunioes_agendadas / d.leads_recebidos * 100)
                  : 0
              }))}
              bars={[
                { key: 'Leads Recebidos', color: '#9CA3AF' },
                { key: 'Reuniões Agendadas', color: '#3B82F6' }
              ]}
              line={{
                key: 'Taxa Agendamento',
                name: 'Tx Agendamento (%)',
                color: '#EF4444'
              }}
              height={300}
            />
          </ExpandableCard>

          {/* Gráfico 2: Taxa de Comparecimento Real (Closer) */}
          {closerDiario && closerDiario.dados_diarios && (
            <ExpandableCard
              title="Taxa de Comparecimento Real - Dia a Dia"
              info="Calls que estavam agendadas PARA aquele dia vs calls que foram efetivamente realizadas. A linha mostra a taxa de comparecimento real."
            >
              <ComboChartWithLine
                data={closerDiario.dados_diarios.map(d => ({
                  name: `${d.dia}`,
                  'Calls Agendadas': d.calls_agendadas || 0,
                  'Calls Realizadas': d.calls_realizadas || 0,
                  'Taxa Comparecimento': d.calls_agendadas > 0
                    ? (d.calls_realizadas / d.calls_agendadas * 100)
                    : 0
                }))}
                bars={[
                  { key: 'Calls Agendadas', color: '#3B82F6' },
                  { key: 'Calls Realizadas', color: '#10B981' }
                ]}
                line={{
                  key: 'Taxa Comparecimento',
                  name: 'Tx Comparecimento (%)',
                  color: '#EF4444'
                }}
                height={300}
              />
            </ExpandableCard>
          )}
        </div>
      )}

      {/* LINHA 4 - Grid 2 colunas */}
      {dashboardDiario && dashboardDiario.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Coluna esquerda: Progresso Acumulado */}
          <ExpandableCard
            title="Progresso Acumulado vs Meta"
            info="Mostra se o ritmo de reuniões realizadas está no caminho certo para bater a meta mensal. A área sombreada indica o gap entre realizado e meta."
          >
            <CumulativeLineChart
              data={calcularAcumulado(
                dashboardDiario.dados_diarios,
                'reunioes_realizadas',
                dashboardDiario.totais.reunioes_realizadas_meta
              )}
              lineKey="realizado"
              metaKey="meta"
              lineColor="#10B981"
              metaColor="#059669"
              height={300}
            />
          </ExpandableCard>

          {/* Coluna direita: Tabela Funil */}
          {dashboardDiario.breakdown_funil && dashboardDiario.breakdown_funil.length > 0 && (
            <ExpandableCard
              title="Distribuição por Funil"
              info="Performance detalhada por origem de lead (Social Selling, Quiz, Indicação, Webinário). As cores indicam: Verde (>80%), Amarelo (40-80%), Vermelho (<40%)."
            >
              <FunnelTable
                data={dashboardDiario.breakdown_funil}
                type="sdr"
              />
            </ExpandableCard>
          )}
        </div>
      )}


      {/* Filtros para Tabela de Métricas Detalhadas */}
      <FilterPanel
        filters={filtros}
        onFilterChange={(key, value) => setFiltros({ ...filtros, [key]: value })}
        onClearFilters={() => setFiltros({ dataInicio: '', dataFim: '', sdr: '', funil: '' })}
        totalRecords={metricas.length}
        filteredRecords={metricasFiltradas.length}
      >
        <FilterDateRange
          labelInicio="Data Início"
          labelFim="Data Fim"
          valueInicio={filtros.dataInicio}
          valueFim={filtros.dataFim}
          onChangeInicio={(value) => setFiltros({ ...filtros, dataInicio: value })}
          onChangeFim={(value) => setFiltros({ ...filtros, dataFim: value })}
        />
        <FilterSelect
          label="SDR"
          value={filtros.sdr}
          onChange={(value) => setFiltros({ ...filtros, sdr: value })}
          options={sdrsUnicos}
          placeholder="Todos os SDRs"
        />
        <FilterSelect
          label="Funil"
          value={filtros.funil}
          onChange={(value) => setFiltros({ ...filtros, funil: value })}
          options={funisUnicos}
          placeholder="Todos os Funis"
        />
      </FilterPanel>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Metricas {viewMode === 'pessoa' ? 'por SDR' : 'por Funil'} - {meses[mesAno.mes - 1]} {mesAno.ano}
            </h2>
            <div className="flex gap-4 items-center">
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
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('pessoa')}
                  className={`px-4 py-1 rounded ${viewMode === 'pessoa' ? 'bg-white shadow' : ''}`}
                >
                  Por Pessoa
                </button>
                <button
                  onClick={() => setViewMode('funil')}
                  className={`px-4 py-1 rounded ${viewMode === 'funil' ? 'bg-white shadow' : ''}`}
                >
                  Por Funil
                </button>
              </div>
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
          <EditableDataTable
            columns={[
              { key: 'data', label: 'Data', format: 'date', sortable: true },
              { key: 'sdr', label: 'SDR', sortable: true, bold: true },
              { key: 'funil', label: 'Funil', sortable: true },
              { key: 'leads_recebidos', label: 'Leads', sortable: true, align: 'center' },
              { key: 'reunioes_agendadas', label: 'Agendadas', sortable: true, align: 'center' },
              { key: 'tx_agendamento', label: 'Tx Agend.', format: 'percent', sortable: true, align: 'center' },
              { key: 'reunioes_realizadas', label: 'Realizadas', sortable: true, align: 'center', bold: true },
              { key: 'tx_comparecimento', label: 'Tx Comp.', format: 'percent', sortable: true, align: 'center' },
              { key: 'meta_reunioes', label: 'Meta', sortable: true, align: 'center' }
            ]}
            data={metricasFiltradas}
            editableColumns={['sdr', 'funil', 'leads_recebidos', 'reunioes_agendadas', 'reunioes_realizadas', 'meta_reunioes']}
            showTotal={false}
            showActions={true}
            onUpdate={handleInlineUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={editingMetrica ? 'Editar Metrica SDR' : 'Nova Metrica SDR'}
        onClose={() => { setShowModal(false); setEditingMetrica(null); }}
      >
        <SDRForm
          onSubmit={(data) => handleSubmit(data, !!editingMetrica)}
          onClose={() => { setShowModal(false); setEditingMetrica(null); }}
          initialData={editingMetrica}
        />
      </Modal>

      {/* Modal de Upload */}
      <UploadComercialModal
        isOpen={showUploadModal}
        tipo="sdr"
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

export default SDR;
