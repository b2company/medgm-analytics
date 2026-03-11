import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardSection from '../components/DashboardSection';
import { KPIGrid, ChartGrid } from '../components/DashboardGrid';
import KPICardWithProgress from '../components/KPICardWithProgress';
import CumulativeLineChart from '../components/CumulativeLineChart';
import GroupedBarChart from '../components/GroupedBarChart';
import FunnelTable from '../components/FunnelTable';
import HorizontalFunnel from '../components/HorizontalFunnel';
import ComboChartWithLine from '../components/ComboChartWithLine';
import Modal from '../components/Modal';
import SDRForm from '../components/SDRForm';
import UploadComercialModal from '../components/UploadComercialModal';
import { formatNumber, formatPercent } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Dashboard SDR com layout moderno
 * Inspirado em design systems profissionais, adaptado para MedGM
 */
const SDRModern = ({ mes: mesProp, ano: anoProp }) => {
  const [dashboardDiario, setDashboardDiario] = useState(null);
  const [closerDiario, setCloserDiario] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filtroSDR, setFiltroSDR] = useState('');
  const [filtroFunil, setFiltroFunil] = useState('');
  const [mesAno, setMesAno] = useState({
    mes: mesProp || new Date().getMonth() + 1,
    ano: anoProp || new Date().getFullYear()
  });

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    setDashboardDiario(null);
    setCloserDiario(null);
    const timer = setTimeout(() => {
      fetchDashboardDiario();
      fetchCloserDiario();
    }, 10);
    return () => clearTimeout(timer);
  }, [mesAno.mes, mesAno.ano, filtroSDR, filtroFunil]);

  const fetchDashboardDiario = async () => {
    try {
      const params = new URLSearchParams({
        mes: mesAno.mes,
        ano: mesAno.ano
      });
      if (filtroSDR) params.append('sdr', filtroSDR);
      if (filtroFunil) params.append('funil', filtroFunil);

      const response = await fetch(`${API_URL}/comercial/dashboard/sdr-diario?${params}`);
      const data = await response.json();
      setDashboardDiario(data);
    } catch (error) {
      console.error('Erro ao buscar dashboard SDR:', error);
    }
  };

  const fetchCloserDiario = async () => {
    try {
      const params = new URLSearchParams({
        mes: mesAno.mes,
        ano: mesAno.ano
      });
      if (filtroFunil) params.append('funil', filtroFunil);

      const response = await fetch(`${API_URL}/comercial/dashboard/closer-diario?${params}`);
      const data = await response.json();
      setCloserDiario(data);
    } catch (error) {
      console.error('Erro ao buscar dados do Closer:', error);
    }
  };

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

  const handleExport = () => {
    window.open(`${API_URL}/export/sdr?mes=${mesAno.mes}&ano=${mesAno.ano}`, '_blank');
  };

  // Ações do header
  const headerActions = (
    <>
      <button
        onClick={handleExport}
        className="bg-white text-gray-900 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium shadow-sm border border-gray-200"
      >
        📊 Exportar
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-1.5 rounded-lg hover:shadow-lg transition-all text-xs font-medium shadow-md"
      >
        + Nova Métrica
      </button>
      <button
        onClick={() => setShowUploadModal(true)}
        className="bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-all text-xs font-medium shadow-md"
      >
        📤 Upload
      </button>
    </>
  );

  // Filtros do header
  const headerFilters = dashboardDiario && (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {dashboardDiario.sdrs && dashboardDiario.sdrs.length > 0 && (
        <div>
          <label className="block text-[10px] font-semibold text-gray-700 mb-1">
            SDR
          </label>
          <select
            value={filtroSDR}
            onChange={(e) => setFiltroSDR(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-xs font-medium text-gray-900"
          >
            <option value="">Todos os SDRs</option>
            {dashboardDiario.sdrs.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {dashboardDiario.funis && dashboardDiario.funis.length > 0 && (
        <div>
          <label className="block text-[10px] font-semibold text-gray-700 mb-1">
            Funil
          </label>
          <select
            value={filtroFunil}
            onChange={(e) => setFiltroFunil(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-xs font-medium text-gray-900"
          >
            <option value="">Todos os Funis</option>
            {dashboardDiario.funis.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-semibold text-gray-700 mb-1">
          Mês
        </label>
        <select
          value={mesAno.mes}
          onChange={(e) => setMesAno({ ...mesAno, mes: parseInt(e.target.value) })}
          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-xs font-medium text-gray-900"
        >
          {meses.map((mes, idx) => (
            <option key={idx} value={idx + 1}>{mes}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-gray-700 mb-1">
          Ano
        </label>
        <input
          type="number"
          value={mesAno.ano}
          onChange={(e) => setMesAno({ ...mesAno, ano: parseInt(e.target.value) })}
          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-xs font-medium text-gray-900"
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title="SDR"
      subtitle={`Gestão de leads e agendamento de reuniões - ${meses[mesAno.mes - 1]} ${mesAno.ano}`}
      actions={headerActions}
      filters={headerFilters}
    >
      {/* Seção 1: KPIs Principais */}
      {dashboardDiario?.totais && (
        <DashboardSection
          title="Métricas Principais"
          subtitle="Visão geral de performance do mês"
          icon="📊"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICardWithProgress
              title="Leads Recebidos"
              value={dashboardDiario.totais.leads_recebidos || 0}
              meta={dashboardDiario.totais.leads_recebidos_meta}
              formatter={formatNumber}
              showProgress={!!dashboardDiario.totais.leads_recebidos_meta}
              info="Total de leads que entraram no funil do SDR"
            />
            <KPICardWithProgress
              title="Reuniões Agendadas"
              value={dashboardDiario.totais.reunioes_agendadas}
              meta={dashboardDiario.totais.reunioes_agendadas_meta}
              formatter={formatNumber}
              showProgress={!!dashboardDiario.totais.reunioes_agendadas_meta}
              info="Reuniões marcadas pelo SDR"
            />
            <KPICardWithProgress
              title="Reuniões Realizadas"
              value={dashboardDiario.totais.reunioes_realizadas}
              meta={dashboardDiario.totais.reunioes_realizadas_meta}
              formatter={formatNumber}
              info="Reuniões que de fato aconteceram"
            />
            <KPICardWithProgress
              title="Tx Agendamento"
              value={dashboardDiario.totais.tx_agendamento}
              meta={100}
              formatter={(v) => formatPercent(v)}
              subtitle={`${formatNumber(dashboardDiario.totais.reunioes_agendadas)} de ${formatNumber(dashboardDiario.totais.leads_recebidos)} leads`}
              progressPercent={dashboardDiario.totais.tx_agendamento}
              info="Percentual de leads que aceitaram reunião"
            />
            <KPICardWithProgress
              title="Tx Comparecimento"
              value={dashboardDiario.totais.tx_comparecimento}
              meta={80}
              formatter={(v) => formatPercent(v)}
              subtitle={`${formatNumber(dashboardDiario.totais.reunioes_realizadas)} de ${formatNumber(dashboardDiario.totais.reunioes_agendadas)} agendadas`}
              progressPercent={(dashboardDiario.totais.tx_comparecimento / 80) * 100}
              info="Percentual de comparecimento (Meta: 80%)"
            />
          </div>
        </DashboardSection>
      )}

      {/* Seção 2: Funil de Conversão */}
      {dashboardDiario?.totais && (
        <DashboardSection
          title="Funil de Conversão SDR"
          subtitle="Visualização do fluxo de conversão"
          icon="🔄"
        >
          <HorizontalFunnel
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
                color: 'bg-emerald-500'
              }
            ]}
            formatValue={formatNumber}
          />
        </DashboardSection>
      )}

      {/* Seção 3: Gráficos de Atividade */}
      {dashboardDiario?.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <DashboardSection
          title="Atividade e Performance"
          subtitle="Acompanhamento diário das operações"
          icon="📈"
          collapsible={true}
          defaultExpanded={true}
        >
          <ChartGrid>
            {/* Atividade do SDR */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">
                Atividade do SDR - Dia a Dia
              </h3>
              <GroupedBarChart
                data={dashboardDiario.dados_diarios.map(d => ({
                  name: `${d.dia}`,
                  'Leads Recebidos': d.leads_recebidos || 0,
                  'Reuniões Agendadas': d.reunioes_agendadas || 0
                }))}
                bars={[
                  { key: 'Leads Recebidos', color: '#9CA3AF' },
                  { key: 'Reuniões Agendadas', color: '#3B82F6' }
                ]}
                height={120}
              />
            </div>

            {/* Taxa de Comparecimento Real */}
            {closerDiario?.dados_diarios && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">
                  Taxa de Comparecimento Real
                </h3>
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
                  height={120}
                />
              </div>
            )}
          </ChartGrid>
        </DashboardSection>
      )}

      {/* Seção 4: Progresso e Distribuição */}
      {dashboardDiario?.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <DashboardSection
          title="Progresso vs Meta e Distribuição"
          subtitle="Análise de cumprimento de metas e origem de leads"
          icon="🎯"
          collapsible={true}
        >
          <ChartGrid>
            {/* Progresso Acumulado */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">
                Progresso Acumulado vs Meta
              </h3>
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
                height={120}
              />
            </div>

            {/* Distribuição por Funil */}
            {dashboardDiario.breakdown_funil && dashboardDiario.breakdown_funil.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">
                  Distribuição por Funil
                </h3>
                <FunnelTable
                  data={dashboardDiario.breakdown_funil}
                  type="sdr"
                />
              </div>
            )}
          </ChartGrid>
        </DashboardSection>
      )}

      {/* Modais */}
      <Modal
        isOpen={showModal}
        title="Nova Métrica SDR"
        onClose={() => setShowModal(false)}
      >
        <SDRForm
          onSubmit={() => {
            setShowModal(false);
            fetchDashboardDiario();
          }}
          onClose={() => setShowModal(false)}
        />
      </Modal>

      <UploadComercialModal
        isOpen={showUploadModal}
        tipo="sdr"
        onClose={(sucesso) => {
          setShowUploadModal(false);
          if (sucesso) {
            fetchDashboardDiario();
          }
        }}
      />
    </DashboardLayout>
  );
};

export default SDRModern;
