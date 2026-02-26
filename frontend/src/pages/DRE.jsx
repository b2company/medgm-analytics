import React, { useState, useEffect } from 'react';
import { getDRE, getDREAnual } from '../services/api';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';

const DRE = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dados, setDados] = useState(null);
  const [dadosAnuais, setDadosAnuais] = useState(null);
  const [dadosMesAnterior, setDadosMesAnterior] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('mensal'); // mensal | anual

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Marco' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  useEffect(() => {
    loadData();
  }, [mes, ano, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'mensal') {
        const res = await getDRE(mes, ano);
        setDados(res);

        // Buscar mês anterior para comparação
        const mesAnterior = mes === 1 ? 12 : mes - 1;
        const anoAnterior = mes === 1 ? ano - 1 : ano;
        try {
          const resAnterior = await getDRE(mesAnterior, anoAnterior);
          setDadosMesAnterior(resAnterior);
        } catch (err) {
          setDadosMesAnterior(null);
        }
      } else {
        const res = await getDREAnual(ano);
        setDadosAnuais(res);
      }
    } catch (error) {
      console.error('Erro ao carregar DRE:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatNegative = (value) => {
    if (value === 0 || value === null || value === undefined) return '-';
    return `(${formatCurrency(Math.abs(value))})`;
  };

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const gerarInsights = (dados) => {
    if (!dados) return [];

    const insights = [];

    // Benchmark: Margem Bruta (SaaS ideal: 70-80%, Consultoria: 50-60%)
    if (dados.margem_bruta_pct < 50) {
      insights.push({
        tipo: 'alerta',
        titulo: '⚠️ Margem Bruta Baixa',
        descricao: `${formatPercent(dados.margem_bruta_pct)} está abaixo do ideal (50-80%). CMV muito alto pode indicar ineficiência operacional.`,
        acao: 'Revisar custos diretos, automatizar processos, renegociar fornecedores.'
      });
    } else if (dados.margem_bruta_pct >= 70) {
      insights.push({
        tipo: 'sucesso',
        titulo: '✓ Margem Bruta Saudável',
        descricao: `${formatPercent(dados.margem_bruta_pct)} está no range ideal para negócios de serviço.`,
        acao: null
      });
    }

    // Margem EBITDA
    if (dados.margem_ebitda_pct < 0) {
      insights.push({
        tipo: 'critico',
        titulo: '🚨 EBITDA Negativo',
        descricao: `Empresa operando no prejuízo. Despesas operacionais (${formatCurrency(dados.despesas?.total)}) excedem lucro bruto.`,
        acao: 'URGENTE: Reduzir custos fixos ou aumentar receita imediatamente.'
      });
    } else if (dados.margem_ebitda_pct < 20) {
      insights.push({
        tipo: 'atencao',
        titulo: '⚡ EBITDA Apertado',
        descricao: `${formatPercent(dados.margem_ebitda_pct)} é baixo. Pouca margem para despesas não-operacionais.`,
        acao: 'Otimizar estrutura de custos, revisar eficiência da equipe.'
      });
    } else if (dados.margem_ebitda_pct >= 30) {
      insights.push({
        tipo: 'sucesso',
        titulo: '💪 EBITDA Forte',
        descricao: `${formatPercent(dados.margem_ebitda_pct)} indica operação saudável e escalável.`,
        acao: null
      });
    }

    // Margem Líquida
    if (dados.lucro_liquido < 0) {
      insights.push({
        tipo: 'critico',
        titulo: '🔴 Prejuízo no Mês',
        descricao: `Lucro líquido de ${formatCurrency(dados.lucro_liquido)}. Gastos totais superam receita.`,
        acao: 'Análise urgente: revisar todas as categorias de custo e buscar novas receitas.'
      });
    } else if (dados.margem_liquida_pct >= 20) {
      insights.push({
        tipo: 'sucesso',
        titulo: '🎯 Lucratividade Alta',
        descricao: `${formatPercent(dados.margem_liquida_pct)} de margem líquida é excelente.`,
        acao: 'Considerar reinvestir lucros em crescimento ou reserva de emergência.'
      });
    }

    // Análise de despesas operacionais vs receita
    const despesas_pct = ((dados.despesas?.total || 0) / dados.receita_liquida * 100);
    if (despesas_pct > 50) {
      insights.push({
        tipo: 'atencao',
        titulo: '💸 Despesas Operacionais Altas',
        descricao: `${formatPercent(despesas_pct)} da receita vai para despesas operacionais.`,
        acao: 'Identificar despesas desnecessárias, automatizar processos, terceirizar atividades não-core.'
      });
    }

    // Deduções muito altas
    if (dados.deducoes > dados.receita_bruta * 0.15) {
      insights.push({
        tipo: 'info',
        titulo: '📊 Deduções Significativas',
        descricao: `${formatCurrency(dados.deducoes)} em impostos/deduções (${formatPercent((dados.deducoes / dados.receita_bruta) * 100)}).`,
        acao: 'Revisar regime tributário, considerar consultoria fiscal para otimização.'
      });
    }

    // Despesas financeiras altas
    if (dados.despesas_financeiras > dados.receita_liquida * 0.05) {
      insights.push({
        tipo: 'alerta',
        titulo: '💳 Despesas Financeiras Elevadas',
        descricao: `${formatCurrency(dados.despesas_financeiras)} em juros/taxas.`,
        acao: 'Renegociar dívidas, reduzir uso de crédito, buscar capital mais barato.'
      });
    }

    return insights;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Demonstracao de Resultado (DRE)
        </h1>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Toggle Mensal/Anual */}
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode('mensal')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'mensal'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setViewMode('anual')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'anual'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anual
            </button>
          </div>

          {viewMode === 'mensal' && (
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              {meses.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* DRE Mensal */}
      {!loading && viewMode === 'mensal' && dados && (
        <div className="space-y-6">
          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Receita Liquida</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dados.receita_liquida)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Lucro Bruto</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(dados.lucro_bruto)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Margem: {formatPercent(dados.margem_bruta_pct)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">EBITDA</div>
              <div className={`text-xl font-bold ${dados.ebitda >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {formatCurrency(dados.ebitda)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Margem: {formatPercent(dados.margem_ebitda_pct)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Lucro Liquido</div>
              <div className={`text-2xl font-bold ${dados.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dados.lucro_liquido)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Margem: {formatPercent(dados.margem_liquida_pct)}
              </div>
            </div>
          </div>

          {/* Insights Automáticos */}
          {gerarInsights(dados).length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                Análise Automática do DRE
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gerarInsights(dados).map((insight, idx) => {
                  const bgColor = {
                    'sucesso': 'bg-green-50 border-green-300 text-green-900',
                    'info': 'bg-blue-50 border-blue-300 text-blue-900',
                    'atencao': 'bg-yellow-50 border-yellow-300 text-yellow-900',
                    'alerta': 'bg-orange-50 border-orange-300 text-orange-900',
                    'critico': 'bg-red-50 border-red-300 text-red-900'
                  }[insight.tipo] || 'bg-gray-50 border-gray-300 text-gray-900';

                  return (
                    <div key={idx} className={`border-l-4 rounded-r-lg p-4 ${bgColor}`}>
                      <div className="font-bold text-sm mb-2">{insight.titulo}</div>
                      <div className="text-sm mb-2">{insight.descricao}</div>
                      {insight.acao && (
                        <div className="text-xs opacity-90 mt-2 pt-2 border-t border-current/20">
                          <strong>Ação:</strong> {insight.acao}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparação com Mês Anterior */}
          {dadosMesAnterior && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📈</span>
                Comparação com {dadosMesAnterior.mes_nome}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Receita Líquida', atual: dados.receita_liquida, anterior: dadosMesAnterior.receita_liquida },
                  { label: 'Lucro Bruto', atual: dados.lucro_bruto, anterior: dadosMesAnterior.lucro_bruto },
                  { label: 'EBITDA', atual: dados.ebitda, anterior: dadosMesAnterior.ebitda },
                  { label: 'Lucro Líquido', atual: dados.lucro_liquido, anterior: dadosMesAnterior.lucro_liquido }
                ].map((item, idx) => {
                  const variacao = item.anterior !== 0 ? ((item.atual - item.anterior) / Math.abs(item.anterior)) * 100 : 0;
                  const cor = variacao >= 0 ? 'text-green-600' : 'text-red-600';
                  const seta = variacao >= 0 ? '↑' : '↓';

                  return (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">{item.label}</div>
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        {formatCurrency(item.atual)}
                      </div>
                      <div className={`text-sm font-bold ${cor}`}>
                        {seta} {Math.abs(variacao).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        vs {formatCurrency(item.anterior)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tabela DRE */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Demonstrativo Detalhado</h3>
              </div>
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">RECEITA BRUTA</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {formatCurrency(dados.receita_bruta)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 w-20">
                      100%
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 text-gray-700">(-) Deducoes</td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatNegative(dados.deducoes)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">
                      {dados.receita_bruta > 0 ? formatPercent((dados.deducoes / dados.receita_bruta) * 100) : '-'}
                    </td>
                  </tr>
                  <tr className="bg-green-50 font-medium">
                    <td className="px-6 py-4 text-green-900">(=) RECEITA LIQUIDA</td>
                    <td className="px-6 py-4 text-right text-green-700">
                      {formatCurrency(dados.receita_liquida)}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600">
                      {dados.receita_bruta > 0 ? formatPercent((dados.receita_liquida / dados.receita_bruta) * 100) : '-'}
                    </td>
                  </tr>

                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 text-gray-700">(-) CMV / Custos Diretos</td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatNegative(dados.cmv)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">
                      {formatPercent(dados.composicao?.cmv_pct)}
                    </td>
                  </tr>
                  <tr className="bg-blue-50 font-medium">
                    <td className="px-6 py-4 text-blue-900">(=) LUCRO BRUTO</td>
                    <td className="px-6 py-4 text-right text-blue-700">
                      {formatCurrency(dados.lucro_bruto)}
                    </td>
                    <td className="px-6 py-4 text-right text-blue-600">
                      {formatPercent(dados.margem_bruta_pct)}
                    </td>
                  </tr>

                  <tr className="bg-gray-100">
                    <td colSpan="3" className="px-6 py-2 text-xs font-bold text-gray-500 uppercase">
                      Despesas Operacionais
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-gray-700 pl-10">(-) Comerciais</td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatNegative(dados.despesas?.comerciais)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">-</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 text-gray-700 pl-10">(-) Administrativas</td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatNegative(dados.despesas?.administrativas)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">-</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-gray-700 pl-10">(-) Operacionais</td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatNegative(dados.despesas?.operacionais)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">-</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 text-gray-700 pl-10">(-) Outras</td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatNegative(dados.despesas?.outras)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">-</td>
                  </tr>

                  <tr className="bg-purple-50 font-medium">
                    <td className="px-6 py-4 text-purple-900">(=) EBITDA</td>
                    <td className={`px-6 py-4 text-right ${dados.ebitda >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                      {formatCurrency(dados.ebitda)}
                    </td>
                    <td className="px-6 py-4 text-right text-purple-600">
                      {formatPercent(dados.margem_ebitda_pct)}
                    </td>
                  </tr>

                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 text-gray-700">(-) Despesas Financeiras</td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatNegative(dados.despesas_financeiras)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">-</td>
                  </tr>

                  <tr className={`font-bold text-lg ${dados.lucro_liquido >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <td className={`px-6 py-4 ${dados.lucro_liquido >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      (=) LUCRO LIQUIDO
                    </td>
                    <td className={`px-6 py-4 text-right ${dados.lucro_liquido >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(dados.lucro_liquido)}
                    </td>
                    <td className={`px-6 py-4 text-right ${dados.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(dados.margem_liquida_pct)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Grafico de Composicao */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Composicao da Receita</h3>
              <PieChart
                data={[
                  { name: 'Lucro Liquido', value: Math.max(dados.lucro_liquido, 0) },
                  { name: 'Despesas Operacionais', value: dados.despesas?.total || 0 },
                  { name: 'CMV', value: dados.cmv || 0 },
                  { name: 'Deducoes', value: dados.deducoes || 0 }
                ].filter(d => d.value > 0)}
                dataKey="value"
                nameKey="name"
                height={300}
              />
            </div>
          </div>
        </div>
      )}

      {/* DRE Anual */}
      {!loading && viewMode === 'anual' && dadosAnuais && (
        <div className="space-y-6">
          {/* Cards Resumo Anual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Receita Total</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dadosAnuais.totais?.receita_total)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Custos Totais</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dadosAnuais.totais?.custos_total)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Lucro Total</div>
              <div className={`text-2xl font-bold ${dadosAnuais.totais?.lucro_total >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(dadosAnuais.totais?.lucro_total)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Margem Media</div>
              <div className={`text-2xl font-bold ${dadosAnuais.totais?.margem_media_pct >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {formatPercent(dadosAnuais.totais?.margem_media_pct)}
              </div>
            </div>
          </div>

          {/* Grafico de Evolucao */}
          {dadosAnuais.historico && dadosAnuais.historico.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Evolucao Mensal - {ano}</h3>
              <LineChart
                data={dadosAnuais.historico.map(h => ({
                  name: h.mes_nome,
                  Receita: h.receita,
                  Custos: h.custos,
                  Lucro: h.lucro
                }))}
                dataKeys={['Receita', 'Custos', 'Lucro']}
                colors={['#10B981', '#EF4444', '#3B82F6']}
              />
            </div>
          )}

          {/* Tabela Mensal */}
          {dadosAnuais.historico && dadosAnuais.historico.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receita</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custos</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Lucro</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dadosAnuais.historico.map((h, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{h.mes_nome}</td>
                      <td className="px-6 py-4 text-right text-green-600">{formatCurrency(h.receita)}</td>
                      <td className="px-6 py-4 text-right text-red-600">{formatCurrency(h.custos)}</td>
                      <td className={`px-6 py-4 text-right font-medium ${h.lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(h.lucro)}
                      </td>
                      <td className={`px-6 py-4 text-right ${h.margem_pct >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        {formatPercent(h.margem_pct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td className="px-6 py-4">TOTAL</td>
                    <td className="px-6 py-4 text-right text-green-700">{formatCurrency(dadosAnuais.totais?.receita_total)}</td>
                    <td className="px-6 py-4 text-right text-red-700">{formatCurrency(dadosAnuais.totais?.custos_total)}</td>
                    <td className={`px-6 py-4 text-right ${dadosAnuais.totais?.lucro_total >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      {formatCurrency(dadosAnuais.totais?.lucro_total)}
                    </td>
                    <td className={`px-6 py-4 text-right ${dadosAnuais.totais?.margem_media_pct >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                      {formatPercent(dadosAnuais.totais?.margem_media_pct)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && viewMode === 'mensal' && !dados && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum dado encontrado</h3>
          <p className="text-gray-500 mt-1">Nao ha movimentacoes financeiras para este periodo.</p>
        </div>
      )}
    </div>
  );
};

export default DRE;
