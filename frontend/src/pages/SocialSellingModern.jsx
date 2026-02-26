import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardSection from '../components/DashboardSection';
import { KPIGrid, ChartGrid } from '../components/DashboardGrid';
import KPICardWithProgress from '../components/KPICardWithProgress';
import CumulativeLineChart from '../components/CumulativeLineChart';
import TableComparative from '../components/TableComparative';
import GroupedBarChart from '../components/GroupedBarChart';
import HorizontalFunnel from '../components/HorizontalFunnel';
import Modal from '../components/Modal';
import SocialSellingForm from '../components/SocialSellingForm';
import UploadComercialModal from '../components/UploadComercialModal';
import { formatNumber, formatPercent } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Dashboard Social Selling com layout moderno
 * Inspirado em design systems profissionais, adaptado para MedGM
 */
const SocialSellingModern = ({ mes: mesProp, ano: anoProp }) => {
  const [dashboardDiario, setDashboardDiario] = useState(null);
  const [dadosComparativos, setDadosComparativos] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [mesAno, setMesAno] = useState({
    mes: mesProp || new Date().getMonth() + 1,
    ano: anoProp || new Date().getFullYear()
  });

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    fetchDashboardDiario();
    fetchComparativo();
  }, [mesAno.mes, mesAno.ano, filtroVendedor]);

  const fetchDashboardDiario = async () => {
    try {
      const params = new URLSearchParams({
        mes: mesAno.mes,
        ano: mesAno.ano
      });
      if (filtroVendedor) params.append('vendedor', filtroVendedor);

      const response = await fetch(`${API_URL}/comercial/dashboard/social-selling-diario?${params}`);
      const data = await response.json();
      setDashboardDiario(data);
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
    }
  };

  const fetchComparativo = async () => {
    try {
      const response = await fetch(
        `${API_URL}/comercial/dashboard/social-selling-comparativo?mes=${mesAno.mes}&ano=${mesAno.ano}`
      );
      const data = await response.json();
      setDadosComparativos(data);
    } catch (error) {
      console.error('Erro ao buscar comparativo:', error);
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
    window.open(`${API_URL}/export/social-selling?mes=${mesAno.mes}&ano=${mesAno.ano}`, '_blank');
  };

  // Ações do header
  const headerActions = (
    <>
      <button
        onClick={handleExport}
        className="bg-white text-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-sm border border-gray-200"
      >
        📊 Exportar
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all font-medium shadow-md"
      >
        + Nova Métrica
      </button>
      <button
        onClick={() => setShowUploadModal(true)}
        className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium shadow-md"
      >
        📤 Upload
      </button>
    </>
  );

  // Filtros do header
  const headerFilters = dashboardDiario?.vendedores && dashboardDiario.vendedores.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Vendedor
        </label>
        <select
          value={filtroVendedor}
          onChange={(e) => setFiltroVendedor(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white font-medium text-gray-900"
        >
          <option value="">Todos os Vendedores</option>
          {dashboardDiario.vendedores.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mês
        </label>
        <select
          value={mesAno.mes}
          onChange={(e) => setMesAno({ ...mesAno, mes: parseInt(e.target.value) })}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white font-medium text-gray-900"
        >
          {meses.map((mes, idx) => (
            <option key={idx} value={idx + 1}>{mes}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ano
        </label>
        <input
          type="number"
          value={mesAno.ano}
          onChange={(e) => setMesAno({ ...mesAno, ano: parseInt(e.target.value) })}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white font-medium text-gray-900"
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title="Social Selling"
      subtitle={`Acompanhamento de métricas de marketing e ativação - ${meses[mesAno.mes - 1]} ${mesAno.ano}`}
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
          <KPIGrid>
            <KPICardWithProgress
              title="Ativações"
              value={dashboardDiario.totais.ativacoes}
              meta={dashboardDiario.totais.ativacoes_meta}
              formatter={formatNumber}
              icon="👥"
              info="Total de ativações de Social Selling (contatos iniciais com potenciais clientes)"
            />
            <KPICardWithProgress
              title="Conversões"
              value={dashboardDiario.totais.conversoes}
              subtitle={`Taxa: ${formatPercent(dashboardDiario.totais.tx_ativ_conv)}`}
              showProgress={false}
              icon="💬"
              info="Ativações que geraram alguma conversão (interesse demonstrado)"
            />
            <KPICardWithProgress
              title="Leads"
              value={dashboardDiario.totais.leads}
              meta={dashboardDiario.totais.leads_meta}
              formatter={formatNumber}
              icon="🎯"
              info="Leads qualificados gerados pelo Social Selling"
            />
            <KPICardWithProgress
              title="Taxa Conv>Lead"
              value={dashboardDiario.totais.tx_conv_lead}
              meta={100}
              formatter={(v) => formatPercent(v)}
              subtitle={`${formatNumber(dashboardDiario.totais.leads)} de ${formatNumber(dashboardDiario.totais.conversoes)} conversões`}
              progressPercent={dashboardDiario.totais.tx_conv_lead}
              icon="📈"
              info="Percentual de conversões que viraram leads qualificados"
            />
          </KPIGrid>
        </DashboardSection>
      )}

      {/* Seção 2: Funil de Conversão */}
      {dashboardDiario?.totais && (
        <DashboardSection
          title="Funil de Conversão"
          subtitle="Visualização do fluxo de conversão"
          icon="🔄"
        >
          <HorizontalFunnel
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
                color: 'bg-emerald-500'
              }
            ]}
            formatValue={formatNumber}
          />
        </DashboardSection>
      )}

      {/* Seção 3: Comparativo por Vendedor */}
      {dadosComparativos && dadosComparativos.length > 0 && (
        <DashboardSection
          title="Performance por Vendedor"
          subtitle="Comparação detalhada entre os vendedores"
          icon="👥"
          collapsible={true}
        >
          <TableComparative
            data={dadosComparativos}
            columns={[
              { key: 'vendedor', label: 'Vendedor', align: 'left' },
              { key: 'ativacoes', label: 'Ativações', align: 'right', format: 'number' },
              { key: 'ativacoes_perc', label: '% Meta Ativ.', align: 'right', format: 'percent' },
              { key: 'conversoes', label: 'Conv.', align: 'right', format: 'number' },
              { key: 'tx_ativ_conv', label: 'Tx Ativ>Conv', align: 'right', format: 'percent' },
              { key: 'leads', label: 'Leads', align: 'right', format: 'number' },
              { key: 'leads_perc', label: '% Meta Leads', align: 'right', format: 'percent' },
              { key: 'tx_conv_lead', label: 'Tx Conv>Lead', align: 'right', format: 'percent' }
            ]}
          />
        </DashboardSection>
      )}

      {/* Seção 4: Gráficos de Evolução */}
      {dashboardDiario?.dados_diarios && dashboardDiario.dados_diarios.length > 0 && (
        <DashboardSection
          title="Evolução Temporal"
          subtitle="Acompanhamento de progresso ao longo do mês"
          icon="📈"
          collapsible={true}
          defaultExpanded={true}
        >
          <ChartGrid>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Ativações Acumuladas vs Meta
              </h3>
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
                height={280}
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Leads Acumulados vs Meta
              </h3>
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
                height={280}
              />
            </div>
          </ChartGrid>
        </DashboardSection>
      )}

      {/* Modais */}
      <Modal
        isOpen={showModal}
        title="Nova Métrica de Social Selling"
        onClose={() => setShowModal(false)}
      >
        <SocialSellingForm
          onSubmit={() => {
            setShowModal(false);
            fetchDashboardDiario();
            fetchComparativo();
          }}
          onClose={() => setShowModal(false)}
        />
      </Modal>

      <UploadComercialModal
        isOpen={showUploadModal}
        tipo="social-selling"
        onClose={(sucesso) => {
          setShowUploadModal(false);
          if (sucesso) {
            fetchDashboardDiario();
            fetchComparativo();
          }
        }}
      />
    </DashboardLayout>
  );
};

export default SocialSellingModern;
