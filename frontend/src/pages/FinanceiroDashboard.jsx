import React, { useState, useEffect } from 'react';
import { getFinanceiroDetalhado, getComercialDetalhado, getFluxoCaixa } from '../services/api';
import {
  ComposedChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import DataTable from '../components/DataTable';

const COLORS = {
  receita: '#22c55e',
  despesas: '#ef4444',
  lucro: '#3b82f6',
  primary: ['#ef4444', '#fb923c', '#facc15', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#9333ea', '#ec4899', '#9ca3af'],
  secondary: ['#22c55e', '#06b6d4', '#3b82f6', '#9333ea', '#ec4899']
};

const FinanceiroDashboard = ({ mes, ano }) => {
  const [loading, setLoading] = useState(true);
  const [dadosMes, setDadosMes] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [fluxoCaixa, setFluxoCaixa] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    categoria: 'todos',
    periodo: 'mes'
  });

  useEffect(() => {
    loadDados();
  }, [mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const [financeiro, comercial, fluxo] = await Promise.all([
        getFinanceiroDetalhado(mes, ano),
        getComercialDetalhado(mes, ano),
        getFluxoCaixa(6, mes, ano)
      ]);

      setDadosMes(financeiro);
      setVendas(comercial.vendas || []);
      setFluxoCaixa(fluxo);
    } catch (error) {
      console.error('Erro ao carregar dashboard financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatCurrencyDetailed = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Calcula KPIs principais
  const calcularKPIs = () => {
    if (!dadosMes) return null;

    const receitaTotal = dadosMes.total_entradas || 0;
    const despesasTotal = dadosMes.total_saidas || 0;
    const lucroOperacional = receitaTotal - despesasTotal;
    const saldoCaixa = dadosMes.saldo || 0;
    const margem = receitaTotal > 0 ? (lucroOperacional / receitaTotal) * 100 : 0;

    return {
      receitaTotal,
      despesasTotal,
      lucroOperacional,
      saldoCaixa,
      margem
    };
  };

  // Prepara dados para gráfico de evolução mensal
  const prepararDadosEvolucao = () => {
    if (!fluxoCaixa?.historico) return [];

    return fluxoCaixa.historico.map(h => {
      const data = new Date(h.mes_ref);
      return {
        mes: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        Receita: h.entradas || 0,
        Despesas: h.saidas || 0,
        Lucro: (h.entradas || 0) - (h.saidas || 0)
      };
    });
  };

  // Prepara dados para breakdown de despesas por categoria
  const prepararDadosDespesasCategoria = () => {
    if (!dadosMes?.saidas) return [];

    const despesasPorCategoria = {};
    dadosMes.saidas.forEach(saida => {
      const cat = saida.categoria_custo || saida.categoria || 'Outros';
      despesasPorCategoria[cat] = (despesasPorCategoria[cat] || 0) + (saida.valor || 0);
    });

    return Object.entries(despesasPorCategoria).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepara dados para breakdown de despesas por centro de custo
  const prepararDadosDespesasCentro = () => {
    if (!dadosMes?.saidas) return [];

    const despesasPorCentro = {};
    dadosMes.saidas.forEach(saida => {
      const centro = saida.centro_custo || 'Não Especificado';
      despesasPorCentro[centro] = (despesasPorCentro[centro] || 0) + (saida.valor || 0);
    });

    return Object.entries(despesasPorCentro).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepara dados para breakdown de despesas por tipo
  const prepararDadosDespesasTipo = () => {
    if (!dadosMes?.saidas) return [];

    const despesasPorTipo = {};
    dadosMes.saidas.forEach(saida => {
      const tipo = saida.tipo || saida.tipo_custo || 'Outros';
      despesasPorTipo[tipo] = (despesasPorTipo[tipo] || 0) + (saida.valor || 0);
    });

    return Object.entries(despesasPorTipo).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepara dados para breakdown de receitas por produto
  const prepararDadosReceitasProduto = () => {
    if (!vendas || vendas.length === 0) return [];

    const receitasPorProduto = {};
    vendas.forEach(venda => {
      const produto = venda.produto || 'Outros';
      receitasPorProduto[produto] = (receitasPorProduto[produto] || 0) + (venda.valor_liquido || venda.valor || 0);
    });

    return Object.entries(receitasPorProduto).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepara dados para breakdown de receitas por tipo
  const prepararDadosReceitasTipo = () => {
    if (!vendas || vendas.length === 0) return [];

    const receitasPorTipo = {};
    vendas.forEach(venda => {
      const tipo = venda.tipo_receita || 'Outros';
      receitasPorTipo[tipo] = (receitasPorTipo[tipo] || 0) + (venda.valor_liquido || venda.valor || 0);
    });

    return Object.entries(receitasPorTipo).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Calcula MRR vs TCV
  const calcularMRRvsTCV = () => {
    if (!vendas || vendas.length === 0) return { mrr: 0, tcv: 0 };

    let mrr = 0;
    let tcv = 0;

    vendas.forEach(venda => {
      const valor = venda.valor_liquido || venda.valor || 0;
      const tipo = venda.tipo_receita || '';

      if (tipo.toLowerCase().includes('recorrência') || tipo.toLowerCase().includes('recorrente')) {
        mrr += valor;
      }
      tcv += valor;
    });

    return { mrr, tcv };
  };

  // Prepara dados de transações para tabela
  const prepararTransacoes = () => {
    if (!dadosMes) return [];

    const entradas = (dadosMes.entradas || []).map(e => ({
      ...e,
      tipo_transacao: 'Entrada',
      tipo_badge: 'success'
    }));

    const saidas = (dadosMes.saidas || []).map(s => ({
      ...s,
      tipo_transacao: 'Saída',
      tipo_badge: 'danger'
    }));

    const vendasMapeadas = vendas.map(v => ({
      id: `venda-${v.id}`,
      data: v.data,
      descricao: `Venda - ${v.cliente}`,
      categoria: v.produto,
      valor: v.valor_liquido || v.valor,
      tipo_transacao: 'Entrada',
      tipo_badge: 'success',
      tipo_custo: v.tipo_receita,
      centro_custo: v.funil
    }));

    let todas = [...entradas, ...saidas, ...vendasMapeadas];

    // Aplicar filtros
    if (filtros.tipo !== 'todos') {
      todas = todas.filter(t => t.tipo_transacao.toLowerCase() === filtros.tipo);
    }

    if (filtros.categoria !== 'todos') {
      todas = todas.filter(t => {
        const cat = t.categoria || t.categoria_custo || '';
        return cat.toLowerCase().includes(filtros.categoria.toLowerCase());
      });
    }

    // Ordenar por data (mais recente primeiro)
    todas.sort((a, b) => new Date(b.data) - new Date(a.data));

    return todas;
  };

  // Custom Tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Label para gráficos de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Não mostrar labels menores que 5%

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const transacoes = prepararTransacoes();
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Centro de Custo', 'Valor'];
    const csv = [
      headers.join(','),
      ...transacoes.map(t => [
        t.data,
        t.tipo_transacao,
        t.categoria || '',
        `"${(t.descricao || '').replace(/"/g, '""')}"`,
        t.centro_custo || '',
        t.valor
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${mes}_${ano}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const kpis = calcularKPIs();
  const dadosEvolucao = prepararDadosEvolucao();
  const dadosDespesasCategoria = prepararDadosDespesasCategoria();
  const dadosDespesasCentro = prepararDadosDespesasCentro();
  const dadosDespesasTipo = prepararDadosDespesasTipo();
  const dadosReceitasProduto = prepararDadosReceitasProduto();
  const dadosReceitasTipo = prepararDadosReceitasTipo();
  const mrrTcv = calcularMRRvsTCV();
  const transacoes = prepararTransacoes();

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-green-700">Receita Total</div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(kpis?.receitaTotal)}
          </div>
          <div className="text-xs text-green-600 mt-1">Mês atual</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-md border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-red-700">Despesas Totais</div>
            <div className="text-2xl">💸</div>
          </div>
          <div className="text-2xl font-bold text-red-900">
            {formatCurrency(kpis?.despesasTotal)}
          </div>
          <div className="text-xs text-red-600 mt-1">Mês atual</div>
        </div>

        <div className={`bg-gradient-to-br ${kpis?.lucroOperacional >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'} p-6 rounded-lg shadow-md border`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${kpis?.lucroOperacional >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              Lucro Operacional
            </div>
            <div className="text-2xl">{kpis?.lucroOperacional >= 0 ? '📈' : '📉'}</div>
          </div>
          <div className={`text-2xl font-bold ${kpis?.lucroOperacional >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {formatCurrency(kpis?.lucroOperacional)}
          </div>
          <div className={`text-xs ${kpis?.lucroOperacional >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>
            Receita - Despesas
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-purple-700">Saldo em Caixa</div>
            <div className="text-2xl">🏦</div>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(kpis?.saldoCaixa)}
          </div>
          <div className="text-xs text-purple-600 mt-1">Disponível</div>
        </div>

        <div className={`bg-gradient-to-br ${kpis?.margem >= 0 ? 'from-teal-50 to-teal-100 border-teal-200' : 'from-yellow-50 to-yellow-100 border-yellow-200'} p-6 rounded-lg shadow-md border`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${kpis?.margem >= 0 ? 'text-teal-700' : 'text-yellow-700'}`}>
              Margem
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <div className={`text-2xl font-bold ${kpis?.margem >= 0 ? 'text-teal-900' : 'text-yellow-900'}`}>
            {kpis?.margem.toFixed(1)}%
          </div>
          <div className={`text-xs ${kpis?.margem >= 0 ? 'text-teal-600' : 'text-yellow-600'} mt-1`}>
            Lucro / Receita
          </div>
        </div>
      </div>

      {/* Gráfico Principal: Evolução Mensal */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução Mensal</h3>
        <ResponsiveContainer width="100%" height={320}>
          {dadosEvolucao.length > 0 ? (
            <ComposedChart data={dadosEvolucao} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="Receita" stroke={COLORS.receita} strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="Despesas" stroke={COLORS.despesas} strokeWidth={3} dot={{ r: 5 }} />
              <Bar dataKey="Lucro" fill={COLORS.lucro} />
            </ComposedChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Sem dados históricos disponíveis
            </div>
          )}
        </ResponsiveContainer>
      </div>

      {/* Breakdown de Despesas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={250}>
            {dadosDespesasCategoria.length > 0 ? (
              <PieChart>
                <Pie
                  data={dadosDespesasCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosDespesasCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem despesas no período
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Despesas por Centro de Custo</h3>
          <ResponsiveContainer width="100%" height={250}>
            {dadosDespesasCentro.length > 0 ? (
              <BarChart data={dadosDespesasCentro} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis type="category" dataKey="name" width={70} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill={COLORS.despesas} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem despesas no período
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Despesas por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            {dadosDespesasTipo.length > 0 ? (
              <PieChart>
                <Pie
                  data={dadosDespesasTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosDespesasTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem despesas no período
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown de Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Receitas por Produto</h3>
          <ResponsiveContainer width="100%" height={250}>
            {dadosReceitasProduto.length > 0 ? (
              <PieChart>
                <Pie
                  data={dadosReceitasProduto}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosReceitasProduto.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.secondary[index % COLORS.secondary.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem receitas no período
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Receitas por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            {dadosReceitasTipo.length > 0 ? (
              <PieChart>
                <Pie
                  data={dadosReceitasTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosReceitasTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.secondary[index % COLORS.secondary.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem receitas no período
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* MRR vs TCV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg shadow-md border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-indigo-700">MRR (Receita Recorrente)</div>
            <div className="text-2xl">🔄</div>
          </div>
          <div className="text-2xl font-bold text-indigo-900">
            {formatCurrency(mrrTcv.mrr)}
          </div>
          <div className="text-xs text-indigo-600 mt-1">Mensalmente recorrente</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg shadow-md border border-cyan-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-cyan-700">TCV (Valor Total)</div>
            <div className="text-2xl">💎</div>
          </div>
          <div className="text-2xl font-bold text-cyan-900">
            {formatCurrency(mrrTcv.tcv)}
          </div>
          <div className="text-xs text-cyan-600 mt-1">Total de contratos</div>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Transações Financeiras</h3>

          {/* Filtros */}
          <div className="flex gap-3">
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todos">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saída">Saídas</option>
            </select>

            <button
              onClick={exportarCSV}
              className="px-4 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        <DataTable
          columns={[
            { key: 'data', label: 'Data', format: 'date', sortable: true },
            {
              key: 'tipo_transacao',
              label: 'Tipo',
              sortable: true,
              render: (value, row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {value}
                </span>
              )
            },
            { key: 'categoria', label: 'Categoria', sortable: true },
            { key: 'descricao', label: 'Descrição', sortable: false },
            { key: 'centro_custo', label: 'Centro', sortable: true, badge: true },
            {
              key: 'valor',
              label: 'Valor',
              format: 'currency',
              align: 'right',
              sortable: true,
              render: (value, row) => (
                <span className={`font-semibold ${
                  row.tipo_transacao === 'Entrada' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrencyDetailed(value)}
                </span>
              )
            }
          ]}
          data={transacoes}
          showActions={false}
          itemsPerPage={20}
        />
      </div>
    </div>
  );
};

export default FinanceiroDashboard;
