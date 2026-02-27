import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICardWithProgress from '../components/KPICardWithProgress';
import HorizontalFunnel from '../components/HorizontalFunnel';
import TableComparative from '../components/TableComparative';
import CumulativeLineChart from '../components/CumulativeLineChart';
import ExpandableCard from '../components/ExpandableCard';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DashboardGeral = ({ mes, ano }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filtroFunil, setFiltroFunil] = useState('');

  // Estado dos dados
  const [socialSellingData, setSocialSellingData] = useState(null);
  const [comercialData, setComercialData] = useState(null);
  const [funisDisponiveis, setFunisDisponiveis] = useState([]);
  const [metasIndividuais, setMetasIndividuais] = useState([]);

  useEffect(() => {
    fetchData();
  }, [mes, ano, filtroFunil]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar dados de Social Selling
      const ssParams = new URLSearchParams({ mes, ano });
      if (filtroFunil) ssParams.append('funil', filtroFunil);
      const ssResponse = await fetch(
        `${API_URL}/comercial/dashboard/social-selling-diario?${ssParams}`
      );
      const ssData = await ssResponse.json();

      // Buscar dados comparativos de Social Selling
      const ssCompParams = new URLSearchParams({ mes, ano });
      if (filtroFunil) ssCompParams.append('funil', filtroFunil);
      const ssCompResponse = await fetch(
        `${API_URL}/comercial/dashboard/social-selling-comparativo?${ssCompParams}`
      );
      const ssCompData = await ssCompResponse.json();

      // Buscar dados de SDR
      const sdrParams = new URLSearchParams({ mes, ano });
      if (filtroFunil) sdrParams.append('funil', filtroFunil);
      const sdrResponse = await fetch(
        `${API_URL}/comercial/dashboard/sdr-diario?${sdrParams}`
      );
      const sdrData = await sdrResponse.json();

      // Buscar dados de Closer
      const closerParams = new URLSearchParams({ mes, ano });
      if (filtroFunil) closerParams.append('funil', filtroFunil);
      const closerResponse = await fetch(
        `${API_URL}/comercial/dashboard/closer-diario?${closerParams}`
      );
      const closerData = await closerResponse.json();

      // Buscar metas individuais
      const metasResponse = await fetch(
        `${API_URL}/metas/?mes=${mes}&ano=${ano}`
      );
      const metasData = await metasResponse.json();
      setMetasIndividuais(metasData.metas || []);

      // Validar dados antes de setar
      if (ssData && ssData.totais && ssData.dados_diarios) {
        setSocialSellingData({
          totais: ssData.totais,
          dados_diarios: ssData.dados_diarios,
          comparativo: ssCompData || []
        });
      } else {
        console.warn('Dados de Social Selling incompletos:', ssData);
      }

      if (sdrData && sdrData.totais && closerData && closerData.totais) {
        setComercialData({
          sdr: sdrData,
          closer: closerData
        });
      } else {
        console.warn('Dados comerciais incompletos:', { sdrData, closerData });
      }

      // Extrair funis disponíveis do breakdown_funil
      if (sdrData && sdrData.breakdown_funil && sdrData.breakdown_funil.length > 0) {
        const funis = sdrData.breakdown_funil.map(item => item.funil);
        setFunisDisponiveis(funis);
      } else if (sdrData && sdrData.funis && sdrData.funis.length > 0) {
        setFunisDisponiveis(sdrData.funis);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do Dashboard Geral:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular dados acumulados
  const calcularAcumulado = (dadosDiarios, campo, metaMensal) => {
    if (!dadosDiarios || dadosDiarios.length === 0) return [];

    const dadosPorDia = dadosDiarios.reduce((acc, item) => {
      if (!acc[item.dia]) acc[item.dia] = 0;
      acc[item.dia] += item[campo] || 0;
      return acc;
    }, {});

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

  // Calcular projeções e alertas
  const calcularProjecoes = () => {
    if (!socialSellingData || !comercialData) return null;

    const diasDecorridos = Math.max(...socialSellingData.dados_diarios.map(d => d.dia));
    const diasNoMes = 30; // Simplificação

    // Social Selling
    const ativacoesRealizadas = socialSellingData.totais.ativacoes;
    const ativacoesMeta = socialSellingData.totais.ativacoes_meta;
    const projecaoAtivacoes = (ativacoesRealizadas / diasDecorridos) * diasNoMes;
    const atingimentoAtivacoes = (ativacoesRealizadas / ativacoesMeta) * 100;

    // Comercial (Closer)
    const vendasRealizadas = comercialData.closer.totais.vendas;
    const vendasMeta = comercialData.closer.totais.vendas_meta;
    const projecaoVendas = (vendasRealizadas / diasDecorridos) * diasNoMes;
    const atingimentoVendas = (vendasRealizadas / vendasMeta) * 100;

    // Identificar gargalo
    let gargalo = '';
    if (atingimentoAtivacoes < 70) {
      gargalo = 'Ativações de Social Selling abaixo do esperado';
    } else if (comercialData.sdr.totais.tx_agendamento < 90) {
      gargalo = 'Taxa de agendamento SDR abaixo de 90%';
    } else if (comercialData.sdr.totais.tx_comparecimento < 70) {
      gargalo = 'Taxa de comparecimento abaixo de 70%';
    } else if (comercialData.closer.totais.tx_conversao < 15) {
      gargalo = 'Taxa de conversão Closer abaixo de 15%';
    } else {
      gargalo = 'Processo saudável, continue o ritmo!';
    }

    return {
      ativacoesRealizadas,
      ativacoesMeta,
      projecaoAtivacoes,
      atingimentoAtivacoes,
      vendasRealizadas,
      vendasMeta,
      projecaoVendas,
      atingimentoVendas,
      diasDecorridos,
      diasRestantes: diasNoMes - diasDecorridos,
      ritmoNecessarioAtivacoes: (ativacoesMeta - ativacoesRealizadas) / (diasNoMes - diasDecorridos),
      ritmoNecessarioVendas: (vendasMeta - vendasRealizadas) / (diasNoMes - diasDecorridos),
      gargalo
    };
  };

  const projecoes = socialSellingData && comercialData ? calcularProjecoes() : null;


  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    );
  }

  if (!socialSellingData || !comercialData) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Nenhum dado disponível para o período selecionado.</p>
        <p className="text-sm mt-2">Social Selling: {socialSellingData ? '✓' : '✗'} | Comercial: {comercialData ? '✓' : '✗'}</p>
      </div>
    );
  }

  // Validações adicionais
  if (!socialSellingData.totais || !socialSellingData.dados_diarios ||
      !comercialData.sdr || !comercialData.closer) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Dados incompletos. Verifique se há métricas cadastradas para este período.</p>
        <div className="text-sm mt-4 space-y-1">
          <p>SS Totais: {socialSellingData.totais ? '✓' : '✗'}</p>
          <p>SS Diários: {socialSellingData.dados_diarios?.length > 0 ? `✓ (${socialSellingData.dados_diarios.length})` : '✗'}</p>
          <p>SDR: {comercialData.sdr?.totais ? '✓' : '✗'}</p>
          <p>Closer: {comercialData.closer?.totais ? '✓' : '✗'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Funil (só afeta lado Comercial) */}
      {funisDisponiveis.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filtrar por Funil:
            </label>
            <select
              value={filtroFunil}
              onChange={(e) => setFiltroFunil(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos os Funis</option>
              {funisDisponiveis.map((funil) => (
                <option key={funil} value={funil}>
                  {funil}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Layout Principal: Social Selling (1/3) + Comercial (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA - SOCIAL SELLING (1 coluna) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              📱 Social Selling
            </h2>
          </div>

          {/* KPIs Social Selling */}
          <div className="grid grid-cols-1 gap-4">
            <KPICardWithProgress
              title="Ativações"
              value={socialSellingData.totais.ativacoes}
              meta={socialSellingData.totais.ativacoes_meta}
              formatter={formatNumber}
              info="Total de ativações realizadas vs meta mensal"
            />
            <KPICardWithProgress
              title="Conversões"
              value={socialSellingData.totais.conversoes}
              subtitle={`Tx Ativ>Conv: ${socialSellingData.totais.tx_ativ_conv.toFixed(2)}%`}
              showProgress={false}
              formatter={formatNumber}
              info="Total de conversões (ativações que viraram conversas). Taxa de conversão ativação→conversa"
            />
            <KPICardWithProgress
              title="Leads Gerados"
              value={socialSellingData.totais.leads}
              meta={socialSellingData.totais.leads_meta}
              formatter={formatNumber}
              info="Leads qualificados gerados vs meta"
            />
          </div>

          {/* Funil Social Selling */}
          <ExpandableCard
            title="Funil de Social Selling"
            info="Funil completo do Social Selling: ativações → conversões → leads"
          >
            <HorizontalFunnel
              stages={[
                {
                  name: 'Ativações',
                  value: socialSellingData.totais.ativacoes,
                  color: 'bg-blue-500'
                },
                {
                  name: 'Conversões',
                  value: socialSellingData.totais.conversoes,
                  color: 'bg-indigo-500'
                },
                {
                  name: 'Leads',
                  value: socialSellingData.totais.leads,
                  color: 'bg-green-500'
                }
              ]}
              formatValue={formatNumber}
            />
          </ExpandableCard>

          {/* Tabela Comparativa por Vendedor */}
          <ExpandableCard
            title="Performance por Social Selling"
            info="Comparativo de desempenho entre vendedores de Social Selling"
          >
            <TableComparative
              data={socialSellingData.comparativo.map(v => ({
                ...v,
                leads_por_1k: v.ativacoes > 0 ? (v.leads / v.ativacoes * 1000) : 0
              }))}
              columns={[
                { key: 'vendedor', label: 'Vendedor', align: 'left' },
                { key: 'ativacoes', label: 'Ativações', align: 'right', format: 'number' },
                { key: 'tx_ativ_conv', label: 'Tx Conv', align: 'right', format: 'percent' },
                { key: 'leads', label: 'Leads', align: 'right', format: 'number' },
                { key: 'leads_por_1k', label: 'Leads/1k', align: 'right', format: 'decimal' }
              ]}
            />
          </ExpandableCard>

        </div>

        {/* COLUNA DIREITA - COMERCIAL (2 colunas) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              💰 Comercial
            </h2>
          </div>

          {/* KPIs Comercial */}
          <div className="grid grid-cols-2 gap-4">
            <KPICardWithProgress
              title="Reuniões Agendadas"
              value={comercialData.sdr.totais.reunioes_agendadas}
              showProgress={false}
              formatter={formatNumber}
              info="Total de reuniões agendadas pelo SDR no mês"
            />
            <KPICardWithProgress
              title="Reuniões Realizadas"
              value={comercialData.sdr.totais.reunioes_realizadas}
              meta={comercialData.sdr.totais.reunioes_realizadas_meta}
              formatter={formatNumber}
              info="Reuniões que de fato aconteceram vs meta"
            />
            <KPICardWithProgress
              title="Tx Comparecimento"
              value={comercialData.sdr.totais.tx_comparecimento}
              meta={80}
              formatter={formatPercent}
              progressPercent={(comercialData.sdr.totais.tx_comparecimento / 80) * 100}
              info="Percentual de reuniões agendadas que foram realizadas. Meta: 80%"
            />
            <KPICardWithProgress
              title="Vendas"
              value={comercialData.closer.totais.vendas}
              meta={comercialData.closer.totais.vendas_meta}
              formatter={formatNumber}
              info="Total de vendas fechadas vs meta"
            />
            <KPICardWithProgress
              title="Faturamento Bruto"
              value={comercialData.closer.totais.faturamento_bruto}
              meta={comercialData.closer.totais.faturamento_meta}
              formatter={formatCurrency}
              info="Faturamento bruto vs meta (antes de descontos/impostos)"
            />
            <KPICardWithProgress
              title="Faturamento Líquido"
              value={comercialData.closer.totais.faturamento_liquido}
              showProgress={false}
              formatter={formatCurrency}
              info="Faturamento líquido (após descontos/impostos)"
            />
            <KPICardWithProgress
              title="Tx Conversão"
              value={comercialData.closer.totais.tx_conversao}
              meta={20}
              formatter={formatPercent}
              progressPercent={(comercialData.closer.totais.tx_conversao / 20) * 100}
              info="Taxa de conversão de calls em vendas. Meta: 20%"
            />
          </div>

          {/* Funil Comercial Completo */}
          <ExpandableCard
            title="Funil Comercial Completo"
            info="Funil desde leads recebidos até vendas fechadas"
          >
            <div className="flex items-center gap-4">
              {/* Funil Principal */}
              <div className="flex-1">
                <HorizontalFunnel
                  stages={[
                    {
                      name: 'Leads Recebidos',
                      value: comercialData.sdr.totais.leads_recebidos || 0,
                      color: 'bg-gray-500'
                    },
                    {
                      name: 'Reuniões Agendadas',
                      value: comercialData.sdr.totais.reunioes_agendadas,
                      color: 'bg-blue-500'
                    },
                    {
                      name: 'Reuniões Realizadas',
                      value: comercialData.sdr.totais.reunioes_realizadas,
                      color: 'bg-indigo-500'
                    },
                    {
                      name: 'Vendas',
                      value: comercialData.closer.totais.vendas,
                      color: 'bg-green-500'
                    }
                  ]}
                  formatValue={formatNumber}
                />
              </div>

              {/* Seta de Conversão Direta */}
              {comercialData.sdr.totais.leads_recebidos > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center min-h-[200px]">
                    {/* Linha vertical */}
                    <div className="flex-1 w-1 bg-green-600"></div>
                    {/* Ponta da seta */}
                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-green-600"></div>
                  </div>
                  <div className="text-xl font-bold text-green-600 whitespace-nowrap">
                    {((comercialData.closer.totais.vendas / comercialData.sdr.totais.leads_recebidos) * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </ExpandableCard>

          {/* Tabela por Pessoa (SDR + Closer combinados) */}
          <ExpandableCard
            title="Performance por Pessoa"
            info="Desempenho individual do time comercial"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pessoa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Função
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Meta
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Realizado
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Atingimento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Social Selling */}
                  {socialSellingData.comparativo && socialSellingData.comparativo.map((vendedor) => {
                    const atingimento = vendedor.leads_meta > 0
                      ? (vendedor.leads / vendedor.leads_meta * 100)
                      : 0;
                    return (
                      <tr key={vendedor.vendedor}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {vendedor.vendedor}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Social Selling</td>
                        <td className="px-4 py-3 text-sm text-center font-medium">
                          {formatNumber(vendedor.leads_meta)} leads
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-bold">
                          {formatNumber(vendedor.leads)} leads
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              atingimento >= 80
                                ? 'bg-green-100 text-green-800'
                                : atingimento >= 40
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {atingimento.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {/* SDRs */}
                  {comercialData.sdr.sdrs && comercialData.sdr.sdrs.map((sdr) => {
                    const atingimento = comercialData.sdr.totais.reunioes_realizadas_meta > 0
                      ? (comercialData.sdr.totais.reunioes_realizadas / comercialData.sdr.totais.reunioes_realizadas_meta * 100)
                      : 0;
                    return (
                      <tr key={sdr}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {sdr}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">SDR</td>
                        <td className="px-4 py-3 text-sm text-center font-medium">
                          {formatNumber(comercialData.sdr.totais.reunioes_realizadas_meta)} reuniões
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-bold">
                          {formatNumber(comercialData.sdr.totais.reunioes_realizadas)} reuniões
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              atingimento >= 80
                                ? 'bg-green-100 text-green-800'
                                : atingimento >= 40
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {atingimento.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Closers */}
                  {comercialData.closer.breakdown_closer && comercialData.closer.breakdown_closer.map((closerData) => {
                    // Buscar meta individual do closer no array de metas
                    const metaCloser = metasIndividuais.find(m => m.pessoa?.nome === closerData.closer);
                    const metaIndividual = metaCloser?.meta_faturamento || 0;
                    const realizadoIndividual = closerData.faturamento_liquido;
                    const atingimento = metaIndividual > 0
                      ? (realizadoIndividual / metaIndividual * 100)
                      : 0;
                    return (
                      <tr key={closerData.closer}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {closerData.closer}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Closer</td>
                        <td className="px-4 py-3 text-sm text-center font-medium">
                          {formatCurrency(metaIndividual)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-bold">
                          {formatCurrency(realizadoIndividual)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              atingimento >= 80
                                ? 'bg-green-100 text-green-800'
                                : atingimento >= 40
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {atingimento.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ExpandableCard>

        </div>
      </div>

      {/* Seção de Gráficos Acumulados - Largura Total */}
      <div className="space-y-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-900">📈 Progresso Acumulado</h2>

        <ExpandableCard
          title="Ativações Acumuladas (Social Selling)"
          info="Progresso de ativações vs meta ao longo do mês"
        >
          <CumulativeLineChart
            data={calcularAcumulado(
              socialSellingData.dados_diarios,
              'ativacoes_realizado',
              socialSellingData.totais.ativacoes_meta
            )}
            lineKey="realizado"
            metaKey="meta"
            lineColor="#3B82F6"
            metaColor="#10B981"
            height={300}
          />
        </ExpandableCard>

        <ExpandableCard
          title="Vendas Acumuladas (Comercial)"
          info="Progresso de vendas vs meta ao longo do mês"
        >
          <CumulativeLineChart
            data={calcularAcumulado(
              comercialData.closer.dados_diarios,
              'vendas',
              comercialData.closer.totais.vendas_meta
            )}
            lineKey="realizado"
            metaKey="meta"
            lineColor="#3B82F6"
            metaColor="#10B981"
            height={300}
          />
        </ExpandableCard>

        <ExpandableCard
          title="Faturamento Bruto Acumulado (Comercial)"
          info="Progresso de faturamento bruto vs meta ao longo do mês"
        >
          <CumulativeLineChart
            data={calcularAcumulado(
              comercialData.closer.dados_diarios,
              'faturamento_bruto',
              comercialData.closer.totais.faturamento_meta
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

    </div>
  );
};

export default DashboardGeral;
