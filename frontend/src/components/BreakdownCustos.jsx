import React, { useState, useEffect } from 'react';
import { getFinanceiroDetalhado } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const BreakdownCustos = ({ mes, ano }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, [mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const data = await getFinanceiroDetalhado(mes, ano);
      setDados(data);
    } catch (error) {
      console.error('Erro ao carregar breakdown de custos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatShortCurrency = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  const calcularBreakdown = () => {
    if (!dados || !dados.saidas) return { porTipo: [], porCentro: [] };

    // Agrupar por tipo_custo
    const porTipo = {};
    const porCentro = {};

    dados.saidas.forEach(saida => {
      const tipo = saida.tipo_custo || 'Não Categorizado';
      const centro = saida.centro_custo || 'Não Categorizado';

      porTipo[tipo] = (porTipo[tipo] || 0) + saida.valor;
      porCentro[centro] = (porCentro[centro] || 0) + saida.valor;
    });

    const porTipoArray = Object.entries(porTipo).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      percentual: (value / dados.total_saidas * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    const porCentroArray = Object.entries(porCentro).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      percentual: (value / dados.total_saidas * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    return { porTipo: porTipoArray, porCentro: porCentroArray };
  };

  const getColorByTipo = (tipo) => {
    const cores = {
      'Fixo': '#EF4444',        // red
      'Variável': '#F59E0B',    // yellow
      'Investimento': '#3B82F6', // blue
      'Pontual': '#8B5CF6',     // purple
      'Não Categorizado': '#9CA3AF' // gray
    };
    return cores[tipo] || '#6B7280';
  };

  const getColorByCentro = (centro) => {
    const cores = {
      'Comercial': '#10B981',      // green
      'Operacao': '#3B82F6',       // blue
      'Marketing': '#F59E0B',      // yellow
      'Administrativo': '#8B5CF6', // purple
      'Diretoria': '#EC4899',      // pink
      'Financeiro': '#EF4444',     // red
      'Não Categorizado': '#9CA3AF' // gray
    };
    return cores[centro] || '#6B7280';
  };

  const gerarInsights = (breakdown) => {
    const insights = [];

    // Insight sobre custos fixos vs variáveis
    const fixo = breakdown.porTipo.find(t => t.name === 'Fixo')?.value || 0;
    const variavel = breakdown.porTipo.find(t => t.name === 'Variável')?.value || 0;
    const total = fixo + variavel;

    if (total > 0) {
      const percFixo = (fixo / total * 100).toFixed(1);
      if (percFixo > 70) {
        insights.push({
          tipo: 'atencao',
          titulo: '⚠️ Estrutura de Custos Rígida',
          descricao: `${percFixo}% dos custos são fixos. Estrutura pouco flexível em caso de queda de receita.`,
          acao: 'Considerar terceirização ou variabilização de custos fixos.'
        });
      } else if (variavel > fixo) {
        insights.push({
          tipo: 'sucesso',
          titulo: '✓ Estrutura Escalável',
          descricao: 'Mais custos variáveis que fixos. Estrutura saudável para crescer.',
          acao: null
        });
      }
    }

    // Insight sobre centro de custo mais pesado
    if (breakdown.porCentro.length > 0) {
      const maior = breakdown.porCentro[0];
      if (maior.percentual > 40) {
        insights.push({
          tipo: 'info',
          titulo: `📊 ${maior.name} Concentra Custos`,
          descricao: `${maior.percentual}% dos custos (${formatCurrency(maior.value)}) estão em ${maior.name}.`,
          acao: 'Revisar eficiência desta área, buscar otimizações e automações.'
        });
      }
    }

    // Insight sobre custos não categorizados
    const naoCategorizado = breakdown.porTipo.find(t => t.name === 'Não Categorizado')?.value || 0;
    if (naoCategorizado > dados.total_saidas * 0.2) {
      insights.push({
        tipo: 'alerta',
        titulo: '⚡ Custos Sem Categorização',
        descricao: `${formatCurrency(naoCategorizado)} (${(naoCategorizado / dados.total_saidas * 100).toFixed(1)}%) não categorizados.`,
        acao: 'Categorizar todas as despesas para análises mais precisas do DRE.'
      });
    }

    // Insight sobre investimentos
    const investimento = breakdown.porTipo.find(t => t.name === 'Investimento')?.value || 0;
    if (investimento > 0) {
      insights.push({
        tipo: 'sucesso',
        titulo: '💡 Investindo em Crescimento',
        descricao: `${formatCurrency(investimento)} em investimentos este mês.`,
        acao: 'Acompanhar ROI dos investimentos nos próximos meses.'
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!dados || !dados.saidas || dados.saidas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">📊 Breakdown de Custos</h3>
        <p className="text-gray-500">Sem dados de custos disponíveis para este mês.</p>
      </div>
    );
  }

  const breakdown = calcularBreakdown();
  const insights = gerarInsights(breakdown);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">📊 Breakdown de Custos por Categoria</h3>
        <p className="text-sm text-gray-600 mt-1">
          Análise detalhada da estrutura de custos
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">Total de Custos</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatShortCurrency(dados.total_saidas)}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Categorias de Tipo</div>
          <div className="text-2xl font-bold text-purple-900">
            {breakdown.porTipo.length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">Centros de Custo</div>
          <div className="text-2xl font-bold text-green-900">
            {breakdown.porCentro.length}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Por Tipo de Custo */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-4">Por Tipo de Custo</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={breakdown.porTipo}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percentual }) => `${name}: ${percentual}%`}
              >
                {breakdown.porTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorByTipo(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {breakdown.porTipo.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColorByTipo(item.name) }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-gray-600">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por Centro de Custo */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-4">Por Centro de Custo</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={breakdown.porCentro} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {breakdown.porCentro.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorByCentro(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {breakdown.porCentro.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColorByCentro(item.name) }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{item.percentual}%</span>
                  <span className="text-gray-600">{formatCurrency(item.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-bold text-gray-700 mb-3">💡 Insights Automáticos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, idx) => {
              const bgColor = {
                'sucesso': 'bg-green-50 border-green-300 text-green-900',
                'info': 'bg-blue-50 border-blue-300 text-blue-900',
                'atencao': 'bg-yellow-50 border-yellow-300 text-yellow-900',
                'alerta': 'bg-orange-50 border-orange-300 text-orange-900'
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
    </div>
  );
};

export default BreakdownCustos;
