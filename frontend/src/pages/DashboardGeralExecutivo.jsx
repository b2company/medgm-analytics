import React, { useState, useEffect } from 'react';
import { getDashboardGeral } from '../services/api';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';
import { AlertTriangle, Zap, TrendingUp, TrendingDown, ChevronDown, Calendar, Filter, Maximize2, Expand } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FunilBarras from '../components/FunilBarras';
import KPICard from '../components/KPICard';
import SecaoExpansivel from '../components/SecaoExpansivel';
import TabelaRanking from '../components/TabelaRanking';

const DashboardGeralExecutivo = ({ mes: mesProp, ano: anoProp }) => {
  const [data, setData] = useState(null);
  const [dataMesAnterior, setDataMesAnterior] = useState(null);
  const [loading, setLoading] = useState(true);
  const [funilFilter, setFunilFilter] = useState('todos');
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
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl text-slate-700 font-semibold">Nenhum dado disponível</p>
          <p className="text-slate-500 mt-2">Tente selecionar outro período</p>
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

  // Completar dados até o final do mês
  const completarDadosAteUltimoDia = (dadosAcumulados, metaMensal) => {
    if (!dadosAcumulados || dadosAcumulados.length === 0) return [];

    const ultimoDiaMes = new Date(ano, mes, 0).getDate();
    const dadosCompletos = [];

    // Adicionar todos os dias do mês
    for (let dia = 1; dia <= ultimoDiaMes; dia++) {
      const registroExistente = dadosAcumulados.find(item => item.dia === dia);

      if (registroExistente) {
        dadosCompletos.push(registroExistente);
      } else {
        // Calcular meta linear até o final
        const metaAcumulada = (metaMensal / ultimoDiaMes) * dia;

        // Para realizado, manter o último valor conhecido até o final do mês
        const ultimoRegistro = dadosAcumulados[dadosAcumulados.length - 1];
        const acumulado = ultimoRegistro.acumulado;

        dadosCompletos.push({
          dia,
          meta_acumulada: metaAcumulada,
          acumulado: acumulado
        });
      }
    }

    return dadosCompletos;
  };

  const dadosVendasCompletos = comercial.acumulado_vendas
    ? completarDadosAteUltimoDia(comercial.acumulado_vendas, comercial.kpis.vendas.meta)
    : [];

  const dadosFaturamentoCompletos = comercial.acumulado_faturamento
    ? completarDadosAteUltimoDia(comercial.acumulado_faturamento, comercial.kpis.faturamento.meta)
    : [];

return (
    <div className={`h-screen overflow-hidden flex flex-col ${tvMode ? 'fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50'}`}>
      {/* HEADER COMPACTO */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">MedGM Analytics</h1>
            <p className="text-xs text-slate-500">{getMesNome(mes)} {ano} • {getDataHoraAtual()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleFullscreen} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Tela Cheia</span>
            </button>
            <select value={funilFilter} onChange={(e) => setFunilFilter(e.target.value)} className="px-3 py-1.5 bg-white border rounded-lg text-xs">
              <option value="todos">Todos</option>
              <option value="SS">SS</option>
              <option value="Quiz">Quiz</option>
              <option value="Isca">Isca</option>
            </select>
            <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))} className="px-3 py-1.5 bg-white border rounded-lg text-xs">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{getMesNome(i + 1)}</option>
              ))}
            </select>
            <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))} className="px-3 py-1.5 bg-white border rounded-lg text-xs">
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
            onClick={() => setExpandedMetric({ tipo: 'Faturamento', data: comercial })}
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
            onClick={() => setExpandedMetric({ tipo: 'Vendas', data: comercial })}
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
            onClick={() => setExpandedMetric({ tipo: 'Reuniões', data: comercial })}
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
            onClick={() => setExpandedMetric({ tipo: 'Leads Marketing', data: comercial })}
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
            onClick={() => setExpandedMetric({ tipo: 'Leads SS', data: social_selling })}
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
                metricaPrincipal="calls"
                colunas={[
                  { key: 'calls', label: 'Calls', formatter: formatNumber }
                ]}
                dados={comercial.por_pessoa.filter(p => p.area === 'SDR').map(sdr => ({
                  nome: sdr.pessoa,
                  role: 'SDR',
                  calls: sdr.calls || 0,
                  valor: sdr.calls || 0,
                  meta: sdr.meta_calls || 0
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

            {funil_origem && (
              <SecaoExpansivel titulo="Por Origem" cor="amber">
                <div className="space-y-2 text-xs">
                  {funil_origem.ss && (
                    <div className="p-2 bg-purple-50 rounded border border-purple-200">
                      <div className="font-bold text-purple-900 mb-1">Social Selling</div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <span>Leads: {funil_origem.ss.leads}</span>
                        <span>Vendas: {funil_origem.ss.vendas}</span>
                        <span>Real: {funil_origem.ss.realizadas}</span>
                        <span>Conv: {funil_origem.ss.tx_conversao}%</span>
                      </div>
                    </div>
                  )}
                  {funil_origem.isca && (
                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="font-bold text-blue-900 mb-1">Isca Paga</div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <span>Leads: {funil_origem.isca.leads}</span>
                        <span>Vendas: {funil_origem.isca.vendas}</span>
                        <span>Real: {funil_origem.isca.realizadas}</span>
                        <span>Conv: {funil_origem.isca.tx_conversao}%</span>
                      </div>
                    </div>
                  )}
                  {funil_origem.quiz && (
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                      <div className="font-bold text-emerald-900 mb-1">Quiz</div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <span>Leads: {funil_origem.quiz.leads}</span>
                        <span>Vendas: {funil_origem.quiz.vendas}</span>
                        <span>Real: {funil_origem.quiz.realizadas}</span>
                        <span>Conv: {funil_origem.quiz.tx_conversao}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </SecaoExpansivel>
            )}
          </div>

        </div>
      </div>

      {/* Modal de Métrica Expandida */}
      {expandedMetric && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setExpandedMetric(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{expandedMetric.tipo}</h2>
              <button onClick={() => setExpandedMetric(null)} className="text-slate-400 hover:text-slate-600 text-3xl">×</button>
            </div>
            <div className="text-sm text-slate-600">
              Histórico detalhado e análise para {expandedMetric.tipo} será exibido aqui.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardGeralExecutivo;
