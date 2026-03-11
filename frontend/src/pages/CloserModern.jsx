import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardSection from '../components/DashboardSection';
import { KPIGrid, ChartGrid } from '../components/DashboardGrid';
import KPICardWithProgress from '../components/KPICardWithProgress';
import CumulativeLineChart from '../components/CumulativeLineChart';
import FunnelTable from '../components/FunnelTable';
import HorizontalFunnel from '../components/HorizontalFunnel';
import TableComparative from '../components/TableComparative';
import BarChart from '../components/BarChart';
import Modal from '../components/Modal';
import CloserForm from '../components/CloserForm';
import UploadComercialModal from '../components/UploadComercialModal';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Dashboard Closer com layout moderno
 * Inspirado em design systems profissionais, adaptado para MedGM
 */
const CloserModern = ({ mes: mesProp, ano: anoProp }) => {
  const [dashboardDiario, setDashboardDiario] = useState(null);
  const [metasIndividuais, setMetasIndividuais] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filtroCloser, setFiltroCloser] = useState('');
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
    const timer = setTimeout(() => {
      fetchDashboardDiario();
    }, 10);
    return () => clearTimeout(timer);
  }, [mesAno.mes, mesAno.ano, filtroCloser, filtroFunil]);

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

      const dashData = await dashboardResponse.json();
      const metasData = await metasResponse.json();

      setDashboardDiario(dashData);
      setMetasIndividuais(metasData.filter(m => m.pessoa?.papel === 'Closer'));
    } catch (error) {
      console.error('Erro ao buscar dashboard Closer:', error);
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

  const agruparPorSemana = (dadosDiarios, campo) => {
    const semanas = {
      'S1': 0,
      'S2': 0,
      'S3': 0,
      'S4': 0,
      'S5': 0
    };

    dadosDiarios.forEach(dia => {
      const semana =
        dia.dia <= 7 ? 'S1' :
        dia.dia <= 14 ? 'S2' :
        dia.dia <= 21 ? 'S3' :
        dia.dia <= 28 ? 'S4' : 'S5';

      semanas[semana] += dia[campo] || 0;
    });

    return Object.keys(semanas).map(semana => ({
      name: semana,
      valor: semanas[semana]
    }));
  };

  const handleExport = () => {
    window.open(`${API_URL}/export/closer?mes=${mesAno.mes}&ano=${mesAno.ano}`, '_blank');
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
      {dashboardDiario.closers && dashboardDiario.closers.length > 0 && (
        <div>
          <label className="block text-[10px] font-semibold text-gray-700 mb-1">
            Closer
          </label>
          <select
            value={filtroCloser}
            onChange={(e) => setFiltroCloser(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-xs font-medium text-gray-900"
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
      title="Closer"
      subtitle={`Gestão de vendas e faturamento - ${meses[mesAno.mes - 1]} ${mesAno.ano}`}
      actions={headerActions}
      filters={headerFilters}
    >
      {/* Seção 1: KPIs Principais */}
      {dashboardDiario?.totais && (
        <DashboardSection
          title="Métricas Principais"
          subtitle="Visão geral de performance do mês"
          icon="💰"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <KPICardWithProgress
              title="Vendas"
              value={dashboardDiario.totais.vendas}
              showProgress={false}
              formatter={formatNumber}
              info="Total de vendas fechadas no mês"
            />
            <KPICardWithProgress
              title="Calls Agendadas"
              value={dashboardDiario.totais.calls_agendadas}
              showProgress={false}
              info="Calls de fechamento agendadas"
            />
            <KPICardWithProgress
              title="Calls Realizadas"
              value={dashboardDiario.totais.calls_realizadas}
              showProgress={false}
              info="Calls que de fato aconteceram"
            />
            <KPICardWithProgress
              title="Tx Conversão"
              value={formatPercent(dashboardDiario.totais.tx_conversao)}
              subtitle={`${formatNumber(dashboardDiario.totais.vendas)} de ${formatNumber(dashboardDiario.totais.calls_realizadas)} calls`}
              showProgress={false}
              info="Percentual de calls que resultaram em venda"
            />
            <KPICardWithProgress
              title="Faturamento Bruto"
              value={dashboardDiario.totais.faturamento_bruto}
              meta={dashboardDiario.totais.faturamento_meta}
              formatter={formatCurrency}
              info="Valor total bruto (antes de descontos)"
            />
            <KPICardWithProgress
              title="Faturamento Líquido"
              value={dashboardDiario.totais.faturamento_liquido}
              showProgress={false}
              formatter={formatCurrency}
              info="Valor líquido (após descontos)"
            />
            <KPICardWithProgress
              title="Ticket Médio"
              value={formatCurrency(dashboardDiario.totais.ticket_medio)}
              showProgress={false}
              info="Valor médio por venda"
            />
          </div>
        </DashboardSection>
      )}

      {/* Seção 2: Funil de Conversão */}
      {dashboardDiario?.totais && (
        <DashboardSection
          title="Funil de Conversão"
          subtitle="Visualização do fluxo de fechamento"
          icon="🔄"
        >
          <HorizontalFunnel
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
                color: 'bg-emerald-500'
              }
            ]}
            formatValue={formatNumber}
          />

          {/* Alerta se Calls Realizadas > Calls Agendadas */}
          {dashboardDiario.totais.calls_realizadas > dashboardDiario.totais.calls_agendadas && (
            <div className="mt-3 p-2 bg-blue-50 border-l-2 border-blue-500 rounded-r-lg">
              <div className="flex items-start gap-2">
                <span className="text-base">ℹ️</span>
                <div>
                  <p className="text-[10px] font-semibold text-blue-900">
                    Calls de meses anteriores
                  </p>
                  <p className="text-[9px] text-blue-800 mt-0.5">
                    Calls realizadas ({dashboardDiario.totais.calls_realizadas}) &gt; agendadas ({dashboardDiario.totais.calls_agendadas})
                    indica que há calls de meses anteriores sendo realizadas neste mês.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DashboardSection>
      )}

      {/* Seção 3: Comparativo entre Closers */}
      {dashboardDiario?.breakdown_closer && dashboardDiario.breakdown_closer.length > 1 && (
        <DashboardSection
          title="Comparativo entre Closers"
          subtitle="Performance detalhada do time"
          icon="👥"
          collapsible={true}
        >
          <TableComparative
            data={dashboardDiario.breakdown_closer.map(closer => {
              const txConversao = closer.calls_realizadas > 0
                ? (closer.vendas / closer.calls_realizadas * 100)
                : 0;
              const ticketMedio = closer.vendas > 0
                ? closer.faturamento_bruto / closer.vendas
                : 0;
              const metaCloser = metasIndividuais.find(m => m.pessoa?.nome === closer.closer);

              return {
                closer: closer.closer,
                vendas: closer.vendas,
                calls_agendadas: closer.calls_agendadas,
                calls_realizadas: closer.calls_realizadas,
                tx_conversao: txConversao,
                faturamento: closer.faturamento_bruto,
                meta_faturamento: metaCloser?.meta_faturamento || 0,
                ticket_medio: ticketMedio
              };
            })}
            columns={[
              { key: 'closer', label: 'Closer', align: 'left' },
              { key: 'vendas', label: 'Vendas', align: 'right', format: 'number' },
              { key: 'calls_agendadas', label: 'Calls Agd.', align: 'right', format: 'number' },
              { key: 'calls_realizadas', label: 'Calls Real.', align: 'right', format: 'number' },
              { key: 'tx_conversao', label: 'Tx Conv.', align: 'right', format: 'percent' },
              { key: 'faturamento', label: 'Faturamento', align: 'right', format: 'currency' },
              { key: 'meta_faturamento', label: 'Meta Fat.', align: 'right', format: 'currency' },
              { key: 'ticket_medio', label: 'Ticket Médio', align: 'right', format: 'currency' }
            ]}
          />
        </DashboardSection>
      )}

      {/* Seção 4: Evolução Acumulada */}
      {dashboardDiario?.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <DashboardSection
          title="Evolução Acumulada"
          subtitle="Progresso vs metas ao longo do mês"
          icon="📈"
          collapsible={true}
        >
          <ChartGrid>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">
                Vendas Acumuladas vs Meta
              </h3>
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
                height={120}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">
                Faturamento Bruto Acumulado vs Meta
              </h3>
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
                height={120}
                isCurrency={true}
              />
            </div>
          </ChartGrid>
        </DashboardSection>
      )}

      {/* Seção 5: Distribuição por Funil */}
      {dashboardDiario?.breakdown_funil && dashboardDiario.breakdown_funil.length > 0 && (
        <DashboardSection
          title="Distribuição por Funil"
          subtitle="Performance por origem de lead"
          icon="🎯"
          collapsible={true}
        >
          <FunnelTable
            data={dashboardDiario.breakdown_funil}
            type="closer"
          />

          {/* Barras Horizontais de Vendas por Funil */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
            <h3 className="text-xs font-semibold text-gray-900 mb-3">
              Vendas e Faturamento por Funil
            </h3>
            <div className="space-y-2">
              {dashboardDiario.breakdown_funil.map((item) => {
                const totalVendas = dashboardDiario.totais.vendas;
                const percentual = totalVendas > 0 ? (item.vendas / totalVendas * 100) : 0;
                return (
                  <div key={item.funil} className="flex items-center gap-2">
                    <div className="w-24 text-[10px] font-semibold text-gray-700">{item.funil}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.max(percentual, 5)}%` }}
                        >
                          {percentual > 15 && (
                            <span className="text-white text-[9px] font-bold drop-shadow">
                              {percentual.toFixed(0)}%
                            </span>
                          )}
                        </div>
                        {percentual <= 15 && percentual > 0 && (
                          <span className="absolute left-[calc(100%-80px)] top-1/2 -translate-y-1/2 text-gray-700 text-[9px] font-bold">
                            {percentual.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-16 text-right text-[9px] font-semibold text-gray-900">
                      {item.vendas} {item.vendas === 1 ? 'venda' : 'vendas'}
                    </div>
                    <div className="w-28 text-right text-[10px] font-bold text-emerald-700">
                      {formatCurrency(item.faturamento_bruto)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DashboardSection>
      )}

      {/* Seção 6: Gráficos Semanais */}
      {dashboardDiario?.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <DashboardSection
          title="Evolução Semanal"
          subtitle="Agregação por semana do mês"
          icon="📊"
          collapsible={true}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h3 className="text-[10px] font-semibold text-gray-700 mb-2">
                Calls Realizadas
              </h3>
              <BarChart
                data={agruparPorSemana(dashboardDiario.dados_diarios, 'calls_realizadas')}
                dataKey="valor"
                color="#3B82F6"
                height={120}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h3 className="text-[10px] font-semibold text-gray-700 mb-2">
                Vendas por Semana
              </h3>
              <BarChart
                data={agruparPorSemana(dashboardDiario.dados_diarios, 'vendas')}
                dataKey="valor"
                color="#10B981"
                height={120}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h3 className="text-[10px] font-semibold text-gray-700 mb-2">
                Faturamento Semanal
              </h3>
              <BarChart
                data={agruparPorSemana(dashboardDiario.dados_diarios, 'faturamento_bruto').map(s => ({
                  ...s,
                  valor: Math.round(s.valor)
                }))}
                dataKey="valor"
                color="#F59E0B"
                height={120}
                isCurrency={true}
              />
            </div>
          </div>
        </DashboardSection>
      )}

      {/* Modais */}
      <Modal
        isOpen={showModal}
        title="Nova Métrica Closer"
        onClose={() => setShowModal(false)}
      >
        <CloserForm
          onSubmit={() => {
            setShowModal(false);
            fetchDashboardDiario();
          }}
          onClose={() => setShowModal(false)}
        />
      </Modal>

      <UploadComercialModal
        isOpen={showUploadModal}
        tipo="closer"
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

export default CloserModern;
