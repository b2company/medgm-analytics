import React, { useState, useEffect } from 'react';
import { getDashboardGeral } from '../services/api';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';
import { AlertTriangle, Zap, TrendingUp, TrendingDown, ChevronDown, Calendar, Filter, Maximize2, Expand } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FunilBarras from '../components/FunilBarras';
import KPICard from '../components/KPICard';
import SecaoExpansivel from '../components/SecaoExpansivel';
import TabelaRanking from '../components/TabelaRanking';

const DashboardGeralExecutivo = ({ mes: mesProp, ano: anoProp }) => {
  const [data, setData] = useState(null);
  const [dataMesAnterior, setDataMesAnterior] = useState(null);
  const [dadosHistorico, setDadosHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [funilFilter, setFunilFilter] = useState('todos');
  const [funis, setFunis] = useState([]);
  const [mes, setMes] = useState(mesProp);
  const [ano, setAno] = useState(anoProp);
  const [expandedSections, setExpandedSections] = useState({
    socialSelling: true,
    sdr: true,
    closers: true
  });
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [tvMode, setTvMode] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFullscreen = () => {
    setTvMode(!tvMode);
  };

  useEffect(() => {
    setMes(mesProp);
    setAno(anoProp);
  }, [mesProp, anoProp]);

  useEffect(() => {
    fetchData();
  }, [mes, ano, funilFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardGeral(mes, ano, funilFilter);
      setData(response);
      if (response.funis && response.funis.length > 0) {
        setFunis(response.funis);
      }

      // Buscar dados do mês anterior para comparação
      const mesAnterior = mes === 1 ? 12 : mes - 1;
      const anoAnterior = mes === 1 ? ano - 1 : ano;
      try {
        const responseMesAnterior = await getDashboardGeral(mesAnterior, anoAnterior, funilFilter);
        setDataMesAnterior(responseMesAnterior);
      } catch (error) {
        console.error('Erro ao buscar dados do mês anterior:', error);
        setDataMesAnterior(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dashboard geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorico = async (mesesRetroativos = 6) => {
    setLoadingHistorico(true);
    const historico = [];

    for (let i = mesesRetroativos - 1; i >= 0; i--) {
      let mesHistorico = mes - i;
      let anoHistorico = ano;

      while (mesHistorico <= 0) {
        mesHistorico += 12;
        anoHistorico -= 1;
      }

      try {
        const response = await getDashboardGeral(mesHistorico, anoHistorico, funilFilter);
        historico.push({
          mes: mesHistorico,
          ano: anoHistorico,
          mesNome: getMesNome(mesHistorico),
          data: response
        });
      } catch (error) {
        console.error(`Erro ao buscar dados de ${mesHistorico}/${anoHistorico}:`, error);
      }
    }

    setDadosHistorico(historico);
    setLoadingHistorico(false);
  };

  // Funções de utilidade
  const getProgressBarColor = (perc) => {
    if (perc < 20) return 'bg-red-500';
    if (perc < 50) return 'bg-amber-500';
    if (perc < 80) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStatusColor = (perc) => {
    if (perc < 20) return 'text-red-600 bg-red-50';
    if (perc < 50) return 'text-amber-600 bg-amber-50';
    if (perc < 80) return 'text-blue-600 bg-blue-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getMesNome = (mesNum) => {
    return new Date(2000, mesNum - 1).toLocaleString('pt-BR', { month: 'long' })
      .charAt(0).toUpperCase() + new Date(2000, mesNum - 1).toLocaleString('pt-BR', { month: 'long' }).slice(1);
  };

  const getDataHoraAtual = () => {
    const agora = new Date();
    const dia = agora.getDate().toString().padStart(2, '0');
    const mesAtual = (agora.getMonth() + 1).toString().padStart(2, '0');
    const hora = agora.getHours().toString().padStart(2, '0');
    const minuto = agora.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mesAtual} • ${hora}:${minuto}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="text-center backdrop-blur-xl bg-white/80 border border-white/40 rounded-2xl shadow-2xl p-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-6"></div>
          <p className="text-lg text-slate-800 font-bold">Carregando dashboard...</p>
          <p className="text-sm text-slate-600 mt-2">Aguarde enquanto processamos seus dados</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="text-center backdrop-blur-xl bg-white/80 border border-white/40 rounded-2xl shadow-2xl p-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-2xl text-slate-900 font-extrabold mb-2">Nenhum dado disponível</p>
          <p className="text-slate-600 font-semibold">Tente selecionar outro período</p>
        </div>
      </div>
    );
  }

  const { social_selling, comercial, projecoes, funil_origem } = data;

  // Calcular taxas de conversão
  const txAtivacaoSS = social_selling.kpis.ativacoes.valor > 0
    ? (social_selling.kpis.conversoes.valor / social_selling.kpis.ativacoes.valor * 100).toFixed(1)
    : 0;

  const txConversaoSS = social_selling.kpis.conversoes.valor > 0
    ? (social_selling.kpis.leads.valor / social_selling.kpis.conversoes.valor * 100).toFixed(1)
    : 0;

  const txAgendamento = comercial.kpis.leads.valor > 0
    ? (comercial.kpis.reunioes_agendadas.valor / comercial.kpis.leads.valor * 100).toFixed(1)
    : 0;

  const txComparecimento = comercial.kpis.reunioes_agendadas.valor > 0
    ? (comercial.kpis.reunioes_realizadas.valor / comercial.kpis.reunioes_agendadas.valor * 100).toFixed(1)
    : 0;

  const txNoShow = 100 - parseFloat(txComparecimento);

  const txConversaoFinal = comercial.kpis.reunioes_realizadas.valor > 0
    ? (comercial.kpis.vendas.valor / comercial.kpis.reunioes_realizadas.valor * 100).toFixed(1)
    : 0;

  // Calcular leads por origem
  const leadsSS = funil_origem?.ss?.leads || social_selling.kpis.leads.valor;
  const leadsMarketing = comercial.kpis.leads.valor - leadsSS; // Todos os leads menos SS

  // Buscar meta de Leads Marketing das metas gerais
  const metaLeadsMarketing = comercial.meta_leads_marketing || (comercial.kpis.leads.meta - social_selling.kpis.leads.meta);
  const percLeadsMarketing = metaLeadsMarketing > 0 ? (leadsMarketing / metaLeadsMarketing * 100) : 0;
  const percLeadsSS = social_selling.kpis.leads.meta > 0 ? (leadsSS / social_selling.kpis.leads.meta * 100) : 0;

  // Calcular variação vs mês anterior (até o mesmo dia)
  const getDiaAtual = () => {
    const hoje = new Date();
    // Se estivermos visualizando o mês atual, usar dia de hoje, senão usar último dia com dados
    if (mes === hoje.getMonth() + 1 && ano === hoje.getFullYear()) {
      return hoje.getDate();
    }
    // Para meses passados, pegar o último dia com dados
    return comercial.acumulado_vendas?.[comercial.acumulado_vendas.length - 1]?.dia || 1;
  };

  const calcularVariacao = (valorAtual, valorAnterior) => {
    if (!dataMesAnterior || !valorAnterior || valorAnterior === 0) return null;
    const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
    return variacao;
  };

  const diaAtual = getDiaAtual();

  // Buscar valores do mês anterior até o mesmo dia
  const getValorMesAnteriorAteDia = (acumuladoArray, dia) => {
    if (!acumuladoArray || acumuladoArray.length === 0) return 0;
    const registro = acumuladoArray.find(item => item.dia === dia);
    return registro?.acumulado || 0;
  };

  const variacaoFaturamento = dataMesAnterior ? calcularVariacao(
    comercial.kpis.faturamento.valor,
    getValorMesAnteriorAteDia(dataMesAnterior.comercial?.acumulado_faturamento, diaAtual)
  ) : null;

  const variacaoVendas = dataMesAnterior ? calcularVariacao(
    comercial.kpis.vendas.valor,
    getValorMesAnteriorAteDia(dataMesAnterior.comercial?.acumulado_vendas, diaAtual)
  ) : null;

  const variacaoReunioes = dataMesAnterior ? calcularVariacao(
    comercial.kpis.reunioes_realizadas.valor,
    dataMesAnterior.comercial?.kpis?.reunioes_realizadas?.valor || 0
  ) : null;

  const variacaoLeadsMarketing = dataMesAnterior ? calcularVariacao(
    leadsMarketing,
    (dataMesAnterior.comercial?.kpis?.leads?.valor || 0) - (dataMesAnterior.social_selling?.kpis?.leads?.valor || 0)
  ) : null;

  const variacaoLeadsSS = dataMesAnterior ? calcularVariacao(
    leadsSS,
    dataMesAnterior.social_selling?.kpis?.leads?.valor || 0
  ) : null;

  // Backend retorna todos os dias do mês completos
  const dadosVendasCompletos = comercial.acumulado_vendas || [];
  const dadosFaturamentoCompletos = comercial.acumulado_faturamento || [];

return (
    <div className={`h-screen overflow-hidden flex flex-col ${tvMode ? 'fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50' : 'bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50'}`}>
      {/* HEADER GLASSMORPHISM */}
      <div className="shrink-0 backdrop-blur-xl bg-white/80 border-b border-white/40 shadow-lg px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MedGM Analytics</h1>
            <p className="text-xs text-slate-600 font-semibold">{getMesNome(mes)} {ano} • {getDataHoraAtual()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleFullscreen} className="px-3 py-2 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/40 hover:shadow-lg rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
              <Maximize2 className="w-4 h-4" />
              <span>Tela Cheia</span>
            </button>
            <select value={funilFilter} onChange={(e) => setFunilFilter(e.target.value)} className="px-3 py-2 bg-white/60 backdrop-blur-md border border-white/40 hover:shadow-lg rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer">
              <option value="todos">Todos os Funis</option>
              {funis.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))} className="px-3 py-2 bg-white/60 backdrop-blur-md border border-white/40 hover:shadow-lg rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{getMesNome(i + 1)}</option>
              ))}
            </select>
            <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))} className="px-3 py-2 bg-white/60 backdrop-blur-md border border-white/40 hover:shadow-lg rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer">
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL - SEM SCROLL */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3">

        {/* KPIs NO TOPO - LINHA HORIZONTAL */}
        <div className="shrink-0 grid grid-cols-5 gap-3">
          <KPICard
            titulo="Faturamento"
            valor={comercial.kpis.faturamento.valor}
            valorFormatado={formatCurrency(comercial.kpis.faturamento.valor).replace('.', '')}
            meta={comercial.kpis.faturamento.meta}
            metaFormatada={formatCurrency(comercial.kpis.faturamento.meta).replace('.', '')}
            percentual={comercial.kpis.faturamento.perc}
            variacao={variacaoFaturamento || 0}
            valorAnterior={getValorMesAnteriorAteDia(dataMesAnterior?.comercial?.acumulado_faturamento, diaAtual)}
            valorAnteriorFormatado={formatCurrency(getValorMesAnteriorAteDia(dataMesAnterior?.comercial?.acumulado_faturamento, diaAtual)).replace('.', '')}
            onClick={() => {
              fetchHistorico(6);
              setExpandedMetric({ tipo: 'Faturamento', data: comercial, metricaKey: 'faturamento' });
            }}
          />
          <KPICard
            titulo="Vendas"
            valor={comercial.kpis.vendas.valor}
            valorFormatado={comercial.kpis.vendas.valor.toString()}
            meta={comercial.kpis.vendas.meta}
            metaFormatada={comercial.kpis.vendas.meta.toString()}
            percentual={comercial.kpis.vendas.perc}
            variacao={variacaoVendas || 0}
            valorAnterior={getValorMesAnteriorAteDia(dataMesAnterior?.comercial?.acumulado_vendas, diaAtual)}
            valorAnteriorFormatado={getValorMesAnteriorAteDia(dataMesAnterior?.comercial?.acumulado_vendas, diaAtual).toString()}
            onClick={() => {
              fetchHistorico(6);
              setExpandedMetric({ tipo: 'Vendas', data: comercial, metricaKey: 'vendas' });
            }}
          />
          <KPICard
            titulo="Reuniões Realizadas"
            valor={comercial.kpis.reunioes_realizadas.valor}
            valorFormatado={comercial.kpis.reunioes_realizadas.valor.toString()}
            meta={comercial.kpis.reunioes_realizadas.meta}
            metaFormatada={comercial.kpis.reunioes_realizadas.meta.toString()}
            percentual={comercial.kpis.reunioes_realizadas.perc}
            variacao={variacaoReunioes || 0}
            valorAnterior={dataMesAnterior?.comercial?.kpis?.reunioes_realizadas?.valor || 0}
            valorAnteriorFormatado={(dataMesAnterior?.comercial?.kpis?.reunioes_realizadas?.valor || 0).toString()}
            onClick={() => {
              fetchHistorico(6);
              setExpandedMetric({ tipo: 'Reuniões', data: comercial, metricaKey: 'reunioes_realizadas' });
            }}
          />
          <KPICard
            titulo="Leads Marketing"
            valor={leadsMarketing}
            valorFormatado={leadsMarketing.toString()}
            meta={Math.abs(metaLeadsMarketing)}
            metaFormatada={Math.abs(metaLeadsMarketing).toString()}
            percentual={percLeadsMarketing}
            variacao={variacaoLeadsMarketing || 0}
            valorAnterior={(dataMesAnterior?.comercial?.kpis?.leads?.valor || 0) - (dataMesAnterior?.social_selling?.kpis?.leads?.valor || 0)}
            valorAnteriorFormatado={((dataMesAnterior?.comercial?.kpis?.leads?.valor || 0) - (dataMesAnterior?.social_selling?.kpis?.leads?.valor || 0)).toString()}
            onClick={() => {
              fetchHistorico(6);
              setExpandedMetric({ tipo: 'Leads Marketing', data: comercial, metricaKey: 'leads_marketing' });
            }}
          />
          <KPICard
            titulo="Leads Social Selling"
            valor={leadsSS}
            valorFormatado={leadsSS.toString()}
            meta={social_selling.kpis.leads.meta}
            metaFormatada={social_selling.kpis.leads.meta.toString()}
            percentual={percLeadsSS}
            variacao={variacaoLeadsSS || 0}
            valorAnterior={dataMesAnterior?.social_selling?.kpis?.leads?.valor || 0}
            valorAnteriorFormatado={(dataMesAnterior?.social_selling?.kpis?.leads?.valor || 0).toString()}
            onClick={() => {
              fetchHistorico(6);
              setExpandedMetric({ tipo: 'Leads SS', data: social_selling, metricaKey: 'leads_ss' });
            }}
          />
        </div>

        {/* CONTEÚDO ABAIXO DOS KPIs - 3 COLUNAS */}
        <div className="flex-1 grid grid-cols-12 gap-3 overflow-hidden">

          {/* COLUNA ESQUERDA: Gráficos (5 colunas) */}
          <div className="col-span-5 space-y-3 overflow-y-auto">
            {comercial.acumulado_vendas && comercial.acumulado_vendas.length > 0 && (
              <SecaoExpansivel titulo="Meta x Realizado" defaultExpanded={true} cor="blue">
                <div className="space-y-2">
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-700 mb-1">Vendas</h4>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={dadosVendasCompletos}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="dia"
                          type="number"
                          domain={[1, new Date(ano, mes, 0).getDate()]}
                          ticks={[1, 5, 10, 15, 20, 25, new Date(ano, mes, 0).getDate()]}
                          tick={{ fontSize: 8 }}
                        />
                        <YAxis tick={{ fontSize: 8 }} allowDecimals={false} />
                        <Tooltip formatter={(value) => Math.round(value)} contentStyle={{ fontSize: '10px' }} />
                        <Line dataKey="meta_acumulada" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Meta" />
                        <Line dataKey="acumulado" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 1.5 }} name="Realizado" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-700 mb-1">Faturamento</h4>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={dadosFaturamentoCompletos}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="dia"
                          type="number"
                          domain={[1, new Date(ano, mes, 0).getDate()]}
                          ticks={[1, 5, 10, 15, 20, 25, new Date(ano, mes, 0).getDate()]}
                          tick={{ fontSize: 8 }}
                        />
                        <YAxis tick={{ fontSize: 8 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ fontSize: '10px' }} />
                        <Line dataKey="meta_acumulada" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Meta" />
                        <Line dataKey="acumulado" stroke="#10b981" strokeWidth={1.5} dot={{ r: 1.5 }} name="Realizado" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SecaoExpansivel>
            )}
          </div>

          {/* COLUNA CENTRAL: Funis (4 colunas) */}
          <div className="col-span-4 space-y-3 overflow-y-auto">
            <SecaoExpansivel titulo="Funil Social Selling" cor="purple" defaultExpanded={true}>
              <FunilBarras stages={[
                { name: 'Ativações', value: social_selling.kpis.ativacoes.valor },
                { name: 'Conversões', value: social_selling.kpis.conversoes.valor },
                { name: 'Leads', value: social_selling.kpis.leads.valor }
              ]} />
            </SecaoExpansivel>

            <SecaoExpansivel titulo="Funil Comercial" cor="blue" defaultExpanded={true}>
              <FunilBarras stages={[
                { name: 'Leads', value: comercial.kpis.leads.valor },
                { name: 'Agendadas', value: comercial.kpis.reunioes_agendadas.valor },
                { name: 'Realizadas', value: comercial.kpis.reunioes_realizadas.valor },
                { name: 'Vendas', value: comercial.kpis.vendas.valor }
              ]} />
            </SecaoExpansivel>
          </div>

          {/* COLUNA DIREITA: Performance Individual (3 colunas) */}
          <div className="col-span-3 space-y-3 overflow-y-auto">
            {social_selling.por_vendedor && social_selling.por_vendedor.length > 0 && (
              <TabelaRanking
                titulo="Social Selling"
                cor="purple"
                metricaPrincipal="leads"
                colunas={[
                  { key: 'leads', label: 'Leads', formatter: formatNumber }
                ]}
                dados={social_selling.por_vendedor.map(v => ({
                  nome: v.vendedor,
                  role: 'Social Seller',
                  leads: v.leads,
                  valor: v.leads,
                  meta: v.meta
                }))}
              />
            )}

            {comercial.por_pessoa && comercial.por_pessoa.filter(p => p.area === 'SDR').length > 0 && (
              <TabelaRanking
                titulo="SDRs"
                cor="blue"
                metricaPrincipal="reunioes"
                colunas={[
                  { key: 'reunioes', label: 'Reuniões', formatter: formatNumber }
                ]}
                dados={comercial.por_pessoa.filter(p => p.area === 'SDR').map(sdr => ({
                  nome: sdr.pessoa,
                  role: 'SDR',
                  reunioes: sdr.realizado || 0,
                  valor: sdr.realizado || 0,
                  meta: sdr.meta || 0
                }))}
              />
            )}

            {comercial.por_pessoa && comercial.por_pessoa.filter(p => p.area === 'Closer').length > 0 && (
              <TabelaRanking
                titulo="Closers"
                cor="emerald"
                metricaPrincipal="faturamento"
                colunas={[
                  { key: 'faturamento', label: 'Faturamento', formatter: formatCurrency },
                  { key: 'vendas', label: 'Vendas', formatter: formatNumber }
                ]}
                dados={comercial.por_pessoa.filter(p => p.area === 'Closer').map(closer => ({
                  nome: closer.pessoa,
                  role: 'Closer',
                  faturamento: closer.realizado,
                  vendas: closer.vendas || 0,
                  valor: closer.realizado,
                  meta: closer.meta
                }))}
              />
            )}
          </div>

        </div>
      </div>

      {/* Modal de Métrica Expandida Glassmorphism */}
      {expandedMetric && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setExpandedMetric(null)}>
          <div className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{expandedMetric.tipo}</h2>
              <button onClick={() => setExpandedMetric(null)} className="text-slate-400 hover:text-slate-600 text-4xl transition-all duration-200 hover:scale-110 cursor-pointer">×</button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="space-y-6">
              {/* KPIs Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-200">
                  <div className="text-sm text-slate-600 mb-1">Realizado</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {expandedMetric.tipo.includes('Faturamento')
                      ? formatCurrency(expandedMetric.data?.kpis?.faturamento?.valor || 0)
                      : (expandedMetric.data?.kpis?.vendas?.valor || expandedMetric.data?.kpis?.reunioes_realizadas?.valor || 0)
                    }
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                  <div className="text-sm text-slate-600 mb-1">Meta</div>
                  <div className="text-2xl font-bold text-slate-700">
                    {expandedMetric.tipo.includes('Faturamento')
                      ? formatCurrency(expandedMetric.data?.kpis?.faturamento?.meta || 0)
                      : (expandedMetric.data?.kpis?.vendas?.meta || expandedMetric.data?.kpis?.reunioes_realizadas?.meta || 0)
                    }
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-200">
                  <div className="text-sm text-slate-600 mb-1">Atingimento</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {(expandedMetric.data?.kpis?.faturamento?.perc || expandedMetric.data?.kpis?.vendas?.perc || expandedMetric.data?.kpis?.reunioes_realizadas?.perc || 0).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Gráfico de Evolução */}
              {(() => {
                let dadosGrafico = null;
                let formatter = null;

                if (expandedMetric.metricaKey === 'faturamento') {
                  dadosGrafico = expandedMetric.data?.acumulado_faturamento;
                  formatter = (value) => formatCurrency(value);
                } else if (expandedMetric.metricaKey === 'vendas') {
                  dadosGrafico = expandedMetric.data?.acumulado_vendas;
                  formatter = (value) => formatNumber(value);
                } else if (expandedMetric.metricaKey === 'reunioes_realizadas') {
                  dadosGrafico = expandedMetric.data?.acumulado_reunioes;
                  formatter = (value) => formatNumber(value);
                } else if (expandedMetric.metricaKey === 'leads_marketing' || expandedMetric.metricaKey === 'leads_ss') {
                  dadosGrafico = expandedMetric.data?.acumulado_leads;
                  formatter = (value) => formatNumber(value);
                }

                return dadosGrafico && dadosGrafico.length > 0 ? (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">📈 Evolução no Mês</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dadosGrafico}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={formatter} contentStyle={{ fontSize: '12px' }} />
                        <Legend />
                        <Line dataKey="meta_acumulada" stroke="#94a3b8" strokeWidth={2} name="Meta" />
                        <Line dataKey="acumulado" stroke="#3b82f6" strokeWidth={2} name="Realizado" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : null;
              })()}

              {/* Comparação com Meses Anteriores */}
              {loadingHistorico ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3 text-slate-600">Carregando histórico...</span>
                  </div>
                </div>
              ) : dadosHistorico.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Comparação com Meses Anteriores</h3>

                  {/* Gráfico de Barras Comparativo */}
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dadosHistorico.map(item => {
                      let valor = 0;
                      let meta = 0;

                      if (expandedMetric.metricaKey === 'faturamento') {
                        valor = item.data?.comercial?.kpis?.faturamento?.valor || 0;
                        meta = item.data?.comercial?.kpis?.faturamento?.meta || 0;
                      } else if (expandedMetric.metricaKey === 'vendas') {
                        valor = item.data?.comercial?.kpis?.vendas?.valor || 0;
                        meta = item.data?.comercial?.kpis?.vendas?.meta || 0;
                      } else if (expandedMetric.metricaKey === 'reunioes_realizadas') {
                        valor = item.data?.comercial?.kpis?.reunioes_realizadas?.valor || 0;
                        meta = item.data?.comercial?.kpis?.reunioes_realizadas?.meta || 0;
                      } else if (expandedMetric.metricaKey === 'leads_marketing') {
                        valor = (item.data?.comercial?.kpis?.leads?.valor || 0) - (item.data?.social_selling?.kpis?.leads?.valor || 0);
                        meta = (item.data?.comercial?.kpis?.leads?.meta || 0) - (item.data?.social_selling?.kpis?.leads?.meta || 0);
                      } else if (expandedMetric.metricaKey === 'leads_ss') {
                        valor = item.data?.social_selling?.kpis?.leads?.valor || 0;
                        meta = item.data?.social_selling?.kpis?.leads?.meta || 0;
                      }

                      return {
                        mes: `${item.mesNome.substring(0, 3)}/${item.ano.toString().substring(2)}`,
                        Realizado: valor,
                        Meta: meta
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => expandedMetric.tipo.includes('Faturamento') ? formatCurrency(value) : formatNumber(value)}
                        contentStyle={{ fontSize: '12px' }}
                      />
                      <Legend />
                      <Bar dataKey="Meta" fill="#94a3b8" />
                      <Bar dataKey="Realizado" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Tabela Comparativa */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Mês</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-700">Realizado</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-700">Meta</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-700">%</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-700">MoM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dadosHistorico.map((item, idx) => {
                          let valor = 0;
                          let meta = 0;

                          if (expandedMetric.metricaKey === 'faturamento') {
                            valor = item.data?.comercial?.kpis?.faturamento?.valor || 0;
                            meta = item.data?.comercial?.kpis?.faturamento?.meta || 0;
                          } else if (expandedMetric.metricaKey === 'vendas') {
                            valor = item.data?.comercial?.kpis?.vendas?.valor || 0;
                            meta = item.data?.comercial?.kpis?.vendas?.meta || 0;
                          } else if (expandedMetric.metricaKey === 'reunioes_realizadas') {
                            valor = item.data?.comercial?.kpis?.reunioes_realizadas?.valor || 0;
                            meta = item.data?.comercial?.kpis?.reunioes_realizadas?.meta || 0;
                          } else if (expandedMetric.metricaKey === 'leads_marketing') {
                            valor = (item.data?.comercial?.kpis?.leads?.valor || 0) - (item.data?.social_selling?.kpis?.leads?.valor || 0);
                            meta = (item.data?.comercial?.kpis?.leads?.meta || 0) - (item.data?.social_selling?.kpis?.leads?.meta || 0);
                          } else if (expandedMetric.metricaKey === 'leads_ss') {
                            valor = item.data?.social_selling?.kpis?.leads?.valor || 0;
                            meta = item.data?.social_selling?.kpis?.leads?.meta || 0;
                          }

                          const perc = meta > 0 ? (valor / meta * 100) : 0;

                          // Calcular MoM
                          let mom = null;
                          if (idx > 0) {
                            const valorAnterior = (() => {
                              const itemAnterior = dadosHistorico[idx - 1];
                              if (expandedMetric.metricaKey === 'faturamento') {
                                return itemAnterior.data?.comercial?.kpis?.faturamento?.valor || 0;
                              } else if (expandedMetric.metricaKey === 'vendas') {
                                return itemAnterior.data?.comercial?.kpis?.vendas?.valor || 0;
                              } else if (expandedMetric.metricaKey === 'reunioes_realizadas') {
                                return itemAnterior.data?.comercial?.kpis?.reunioes_realizadas?.valor || 0;
                              } else if (expandedMetric.metricaKey === 'leads_marketing') {
                                return (itemAnterior.data?.comercial?.kpis?.leads?.valor || 0) - (itemAnterior.data?.social_selling?.kpis?.leads?.valor || 0);
                              } else if (expandedMetric.metricaKey === 'leads_ss') {
                                return itemAnterior.data?.social_selling?.kpis?.leads?.valor || 0;
                              }
                              return 0;
                            })();

                            if (valorAnterior > 0) {
                              mom = ((valor - valorAnterior) / valorAnterior * 100);
                            }
                          }

                          const isCurrentMonth = item.mes === mes && item.ano === ano;

                          return (
                            <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50 ${isCurrentMonth ? 'bg-blue-50 font-semibold' : ''}`}>
                              <td className="py-2 px-3">
                                {item.mesNome} {item.ano}
                                {isCurrentMonth && <span className="ml-2 text-xs text-blue-600">(Atual)</span>}
                              </td>
                              <td className="text-right py-2 px-3 font-medium">
                                {expandedMetric.tipo.includes('Faturamento') ? formatCurrency(valor) : formatNumber(valor)}
                              </td>
                              <td className="text-right py-2 px-3 text-slate-600">
                                {expandedMetric.tipo.includes('Faturamento') ? formatCurrency(meta) : formatNumber(meta)}
                              </td>
                              <td className={`text-right py-2 px-3 font-semibold ${
                                perc >= 80 ? 'text-emerald-600' : perc >= 50 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {perc.toFixed(0)}%
                              </td>
                              <td className="text-right py-2 px-3">
                                {mom !== null ? (
                                  <span className={`flex items-center justify-end gap-1 font-semibold ${
                                    mom > 0 ? 'text-emerald-600' : mom < 0 ? 'text-red-600' : 'text-slate-600'
                                  }`}>
                                    {mom > 0 ? <TrendingUp className="w-3 h-3" /> : mom < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                    {mom > 0 ? '+' : ''}{mom.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Ranking por Pessoa */}
              {expandedMetric.data?.por_pessoa && expandedMetric.data.por_pessoa.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">👥 Ranking Individual</h3>
                  <div className="space-y-2">
                    {expandedMetric.data.por_pessoa
                      .sort((a, b) => (b.realizado || 0) - (a.realizado || 0))
                      .slice(0, 10)
                      .map((pessoa, idx) => {
                        const perc = pessoa.meta > 0 ? (pessoa.realizado / pessoa.meta * 100) : 0;
                        return (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-800">{pessoa.pessoa}</div>
                              <div className="text-xs text-slate-500">{pessoa.area}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-900">
                                {expandedMetric.tipo.includes('Faturamento') ? formatCurrency(pessoa.realizado) : pessoa.realizado}
                              </div>
                              <div className={`text-xs font-semibold ${perc >= 80 ? 'text-emerald-600' : perc >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                {perc.toFixed(0)}% da meta
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Análise e Insights */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-bold text-indigo-900 mb-4">💡 Análise Automática</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/80 p-3 rounded-lg">
                    <div className="text-slate-600 mb-1">Faltam para a meta</div>
                    <div className="font-bold text-indigo-900">
                      {expandedMetric.tipo.includes('Faturamento')
                        ? formatCurrency((expandedMetric.data?.kpis?.faturamento?.meta || 0) - (expandedMetric.data?.kpis?.faturamento?.valor || 0))
                        : ((expandedMetric.data?.kpis?.vendas?.meta || 0) - (expandedMetric.data?.kpis?.vendas?.valor || 0))
                      }
                    </div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg">
                    <div className="text-slate-600 mb-1">Dias restantes no mês</div>
                    <div className="font-bold text-indigo-900">
                      {new Date(ano, mes, 0).getDate() - new Date().getDate()} dias
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardGeralExecutivo;
