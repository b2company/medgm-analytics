import React, { useState, useEffect } from 'react';
import { getDashboardGeral } from '../services/api';
import KPICardWithProgress from '../components/KPICardWithProgress';
import HorizontalFunnel from '../components/HorizontalFunnel';
import ExpandableCard from '../components/ExpandableCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

const DashboardGeral = ({ mes, ano }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [funilFilter, setFunilFilter] = useState('todos');

  useEffect(() => {
    fetchData();
  }, [mes, ano, funilFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardGeral(mes, ano, funilFilter);
      setData(response);
    } catch (error) {
      console.error('Erro ao buscar dashboard geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (perc) => {
    if (perc >= 80) return 'bg-green-500';
    if (perc >= 40) return 'bg-yellow-400';
    return 'bg-gray-300';
  };

  const getStatusBg = (perc) => {
    if (perc >= 80) return 'bg-green-100';
    if (perc >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusText = (perc) => {
    if (perc >= 80) return 'text-green-700';
    if (perc >= 40) return 'text-yellow-700';
    return 'text-red-700';
  };

  const calcularTrend = (valorAtual, valorAnterior) => {
    if (valorAnterior === undefined || valorAnterior === null || valorAnterior === 0) return null;
    return ((valorAtual - valorAnterior) / valorAnterior) * 100;
  };

  // Função para preencher todos os dias do mês nos dados acumulados
  const preencherDiasMes = (dadosAcumulados, mes, ano) => {
    if (!dadosAcumulados || dadosAcumulados.length === 0) return [];

    // Calcular número total de dias no mês
    const totalDiasNoMes = new Date(ano, mes, 0).getDate();

    // Criar objeto de lookup para dados existentes
    const dadosPorDia = {};
    dadosAcumulados.forEach(d => {
      dadosPorDia[d.dia] = d;
    });

    // Calcular meta diária baseado no primeiro dia com dados
    // A meta acumulada é linear: meta_dia_N = metaDiaria * N
    const primeiroDiaComDados = dadosAcumulados[0];
    const metaDiaria = primeiroDiaComDados.meta / primeiroDiaComDados.dia;

    // Pegar último valor conhecido para o realizado
    const ultimoDiaComDados = Math.max(...dadosAcumulados.map(d => d.dia));
    const ultimoValorRealizado = dadosAcumulados.find(d => d.dia === ultimoDiaComDados)?.realizado || 0;

    const resultado = [];

    // Iterar por TODOS os dias do mês
    for (let dia = 1; dia <= totalDiasNoMes; dia++) {
      if (dadosPorDia[dia]) {
        // Dia com dados - usar os dados reais
        resultado.push(dadosPorDia[dia]);
      } else {
        // Dia sem dados - adicionar só a meta
        resultado.push({
          dia: dia,
          realizado: dia <= ultimoDiaComDados ? ultimoValorRealizado : null, // Mantém último valor até o último dia com dados
          meta: metaDiaria * dia // Meta linear até o final do mês
        });
      }
    }

    return resultado;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  const { social_selling, comercial, projecoes, mes_anterior } = data;

  // Calcular alerta principal (menor percentual entre todas as áreas)
  const calcularAlerta = () => {
    const areas = [
      { nome: 'Social Selling (Ativações)', perc: social_selling.kpis.ativacoes.perc },
      { nome: 'Social Selling (Leads)', perc: social_selling.kpis.leads.perc },
      { nome: 'SDR (Leads)', perc: comercial.kpis.leads.perc },
      { nome: 'SDR (Reuniões Agendadas)', perc: comercial.kpis.reunioes_agendadas.perc },
      { nome: 'Closer (Vendas)', perc: comercial.kpis.vendas.perc },
      { nome: 'Closer (Faturamento)', perc: comercial.kpis.faturamento.perc }
    ];

    const menorArea = areas.reduce((min, area) => area.perc < min.perc ? area : min);
    const percFormatted = menorArea.perc.toFixed(1);
    return `⚠️ ${menorArea.nome} com ${percFormatted}% — gargalo principal`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* FILTRO DE FUNIL - DROPDOWN */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar Comercial por Funil
        </label>
        <select
          value={funilFilter}
          onChange={(e) => setFunilFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="todos">Todos os Funis</option>
          <option value="SS">Social Selling</option>
          <option value="Quiz">Quiz</option>
          <option value="Indicacao">Indicação</option>
          <option value="Webinario">Webinário</option>
        </select>
        {funilFilter !== 'todos' && (
          <span className="ml-3 text-sm text-gray-600">
            Exibindo dados filtrados por funil: <strong>{funilFilter}</strong>
          </span>
        )}
      </div>

      {/* SEÇÃO 1: KPIs PRINCIPAIS - 2 linhas de 3 cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 KPIs Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICardWithProgress
            title="Leads Gerados (SS)"
            value={social_selling.kpis.leads.valor}
            meta={social_selling.kpis.leads.meta}
            formatter={formatNumber}
            showProgress={true}
            trend={mes_anterior ? calcularTrend(social_selling.kpis.leads.valor, mes_anterior.social_selling.leads) : null}
            info="Total de leads gerados pelo Social Selling. Primeira etapa do funil completo."
          />
          <KPICardWithProgress
            title="Reuniões Realizadas"
            value={comercial.kpis.reunioes_realizadas.valor}
            meta={comercial.kpis.reunioes_realizadas.meta}
            formatter={formatNumber}
            showProgress={true}
            trend={mes_anterior ? calcularTrend(comercial.kpis.reunioes_realizadas.valor, mes_anterior.comercial.reunioes_realizadas) : null}
            info="Reuniões que o SDR agendou e que foram efetivamente realizadas. Passam para o Closer."
          />
          <KPICardWithProgress
            title="Vendas"
            value={comercial.kpis.vendas.valor}
            meta={comercial.kpis.vendas.meta}
            formatter={formatNumber}
            showProgress={true}
            trend={mes_anterior ? calcularTrend(comercial.kpis.vendas.valor, mes_anterior.comercial.vendas) : null}
            info="Total de vendas fechadas pelos Closers neste mês."
          />
          <KPICardWithProgress
            title="Faturamento"
            value={comercial.kpis.faturamento.valor}
            meta={comercial.kpis.faturamento.meta}
            formatter={formatCurrency}
            showProgress={true}
            trend={mes_anterior ? calcularTrend(comercial.kpis.faturamento.valor, mes_anterior.comercial.faturamento) : null}
            info="Faturamento bruto total do mês. Meta baseada no faturamento planejado."
          />
          <KPICardWithProgress
            title="Ticket Médio"
            value={comercial.kpis.ticket_medio}
            showProgress={false}
            formatter={formatCurrency}
            trend={mes_anterior ? calcularTrend(comercial.kpis.ticket_medio, mes_anterior.comercial.ticket_medio) : null}
            info="Valor médio de cada venda (faturamento ÷ vendas). Ajuda a entender o perfil dos clientes."
          />
          <KPICardWithProgress
            title="Tx Conversão Final"
            value={comercial.funil.tx_conversao}
            meta={100}
            formatter={formatPercent}
            subtitle={`${comercial.kpis.vendas.valor} de ${comercial.kpis.calls_realizadas?.valor || 0} calls`}
            progressPercent={comercial.funil.tx_conversao}
            showProgress={false}
            info="Taxa de conversão de calls realizadas em vendas. Principal indicador de efetividade do Closer."
          />
        </div>
      </div>

      {/* SEÇÃO 2: FUNIS SEPARADOS - Social Selling e Comercial lado a lado */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Funil de Conversão</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Funil Social Selling */}
          <HorizontalFunnel
            title="Social Selling"
            stages={[
              {
                name: 'Ativações',
                value: social_selling.kpis.ativacoes.valor,
                color: 'bg-purple-500'
              },
              {
                name: 'Conversões',
                value: social_selling.kpis.conversoes.valor,
                color: 'bg-purple-600'
              },
              {
                name: 'Leads Gerados',
                value: social_selling.kpis.leads.valor,
                color: 'bg-indigo-500'
              }
            ]}
            formatValue={formatNumber}
            info="Funil de geração de leads pelo Social Selling. Desde a ativação inicial até a conversão em lead qualificado."
          />

          {/* Funil Comercial (SDR + Closer) */}
          <HorizontalFunnel
            title="Comercial (SDR + Closer)"
            stages={[
              {
                name: 'Leads Recebidos',
                value: comercial.kpis.leads.valor,
                color: 'bg-gray-500'
              },
              {
                name: 'Reuniões Agendadas',
                value: comercial.kpis.reunioes_agendadas.valor,
                color: 'bg-blue-500'
              },
              {
                name: 'Reuniões Realizadas',
                value: comercial.kpis.reunioes_realizadas.valor,
                color: 'bg-blue-600'
              },
              {
                name: 'Vendas',
                value: comercial.kpis.vendas.valor,
                color: 'bg-green-600'
              }
            ]}
            formatValue={formatNumber}
            info="Funil comercial completo desde o recebimento do lead até o fechamento. SDR qualifica e agenda, Closer realiza reunião e converte em venda."
          />
        </div>
      </div>

      {/* SEÇÃO 3: EQUIPE - 2 colunas (Geração de Demanda + Conversão) */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Performance por Equipe</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Coluna Esquerda: Geração de Demanda (Social Selling) */}
          <ExpandableCard
            title="Geração de Demanda (Social Selling)"
            info="Performance individual dos vendedores na geração de leads pelo Social Selling. Verde (≥80%), Amarelo (40-80%), Vermelho (<40%)."
          >
            <div className="space-y-3">
              {social_selling.por_vendedor.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 transition-all hover:shadow-md hover:border-gray-300"
                >
                  <span className="text-sm font-semibold text-gray-900">{v.vendedor}</span>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getStatusText(v.perc)}`}>
                        {v.perc.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {v.leads} / {v.meta}
                      </div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${getStatusColor(v.perc)}`}
                        style={{ width: `${Math.min(v.perc, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>

          {/* Coluna Direita: Conversão (SDR + Closer) */}
          <ExpandableCard
            title="Conversão (SDR + Closer)"
            info="Performance individual de SDRs e Closers nas suas respectivas metas. SDR medido por reuniões realizadas, Closer por faturamento. Verde (≥80%), Amarelo (40-80%), Vermelho (<40%)."
          >
            <div className="space-y-3">
              {comercial.por_pessoa.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 transition-all hover:shadow-md hover:border-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{p.pessoa}</span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      p.area === 'SDR' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {p.area}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getStatusText(p.perc)}`}>
                        {p.perc.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {p.area === 'Closer'
                          ? `${formatCurrency(p.realizado)} / ${formatCurrency(p.meta)}`
                          : `${p.realizado} / ${p.meta}`
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {p.metrica}
                      </div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${getStatusColor(p.perc)}`}
                        style={{ width: `${Math.min(p.perc, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>
        </div>
      </div>

      {/* SEÇÃO 4: TENDÊNCIA - 2 gráficos lado a lado, altura 350px */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 Tendência Acumulada</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Gráfico 1: Vendas Acumuladas */}
          <ExpandableCard
            title="Vendas Acumuladas vs Meta"
            info="Progresso acumulado de vendas ao longo do mês. A linha azul mostra as vendas reais, e a linha cinza tracejada mostra a meta proporcional ao dia."
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={preencherDiasMes(comercial.acumulado_vendas, mes, ano)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5, fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Vendas', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="acumulado"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Vendas Realizadas"
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="meta_acumulada"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Meta Linear"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ExpandableCard>

          {/* Gráfico 2: Faturamento Acumulado */}
          <ExpandableCard
            title="Faturamento Acumulado vs Meta"
            info="Progresso acumulado do faturamento bruto ao longo do mês. Permite visualizar se o ritmo de vendas + ticket médio estão alinhados com a meta financeira."
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={preencherDiasMes(comercial.acumulado_faturamento, mes, ano)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5, fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Faturamento (R$)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="acumulado"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Faturamento Realizado"
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="meta_acumulada"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Meta Linear"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ExpandableCard>
        </div>
      </div>

      {/* SEÇÃO 5: PROJEÇÕES DO MÊS */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Projeções do Mês</h2>

        {/* Grid 2 colunas: Vendas e Faturamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card Vendas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas</h3>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Projeção</p>
                <p className={`text-3xl font-bold ${
                  projecoes.vendas.projecao >= projecoes.vendas.meta ? 'text-green-600' : 'text-red-600'
                }`}>
                  {projecoes.vendas.projecao}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Meta</p>
                <p className="text-2xl font-bold text-gray-700">{projecoes.vendas.meta}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Realizado</p>
                <p className="text-2xl font-bold text-blue-600">{projecoes.vendas.realizado}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ritmo atual:</span>
                <span className="font-semibold text-gray-900">
                  {projecoes.ritmo_atual.vendas_dia.toFixed(2)} vendas/dia
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ritmo necessário:</span>
                <span className="font-semibold text-gray-900">
                  {projecoes.ritmo_necessario.vendas_dia.toFixed(2)} vendas/dia
                </span>
              </div>
            </div>
          </div>

          {/* Card Faturamento */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Faturamento</h3>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Projeção</p>
                <p className={`text-2xl font-bold ${
                  projecoes.faturamento.projecao >= projecoes.faturamento.meta ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(projecoes.faturamento.projecao)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Meta</p>
                <p className="text-xl font-bold text-gray-700">
                  {formatCurrency(projecoes.faturamento.meta)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Realizado</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(projecoes.faturamento.realizado)}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ritmo atual:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(projecoes.ritmo_atual.faturamento_dia)}/dia
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ritmo necessário:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(projecoes.ritmo_necessario.faturamento_dia)}/dia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Dias Úteis Restantes */}
        {projecoes.dias_uteis_restantes >= 0 && (
          <div className="mt-6 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">
                {projecoes.dias_uteis_restantes} dias úteis restantes no mês
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardGeral;
