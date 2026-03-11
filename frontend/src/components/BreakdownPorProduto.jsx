import React, { useState, useEffect } from 'react';
import { getComercialDetalhado } from '../services/api';
import PieChart from './PieChart';

const BreakdownPorProduto = ({ mes, ano }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, [mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const data = await getComercialDetalhado(mes, ano);
      setDados(data);
    } catch (error) {
      console.error('Erro ao carregar breakdown por produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!dados || !dados.vendas || dados.vendas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Receita por Produto</h3>
        <p className="text-gray-500">Nenhuma venda registrada neste período.</p>
      </div>
    );
  }

  // Agrupar vendas por produto
  const porProduto = {};
  let total = 0;

  dados.vendas.forEach(venda => {
    const produto = venda.produto || 'Não especificado';
    const valor = venda.valor || 0;

    if (!porProduto[produto]) {
      porProduto[produto] = {
        valor: 0,
        qtd: 0
      };
    }

    porProduto[produto].valor += valor;
    porProduto[produto].qtd += 1;
    total += valor;
  });

  // Converter para array e ordenar por valor
  const produtosArray = Object.entries(porProduto)
    .map(([produto, data]) => ({
      produto,
      valor: data.valor,
      qtd: data.qtd,
      percentual: (data.valor / total * 100).toFixed(1),
      ticket_medio: data.valor / data.qtd
    }))
    .sort((a, b) => b.valor - a.valor);

  // Dados para o gráfico de pizza
  const chartData = produtosArray.map(item => ({
    name: item.produto,
    value: item.valor
  }));

  // Identificar produto dominante
  const produtoDominante = produtosArray[0];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Receita por Produto</h3>
        <p className="text-sm text-gray-600 mt-1">
          Composição da receita do mês por linha de produto
        </p>
      </div>

      {/* Destaque do Produto Dominante */}
      {produtoDominante && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-blue-600 font-medium mb-1">🏆 Produto Dominante do Mês</div>
              <div className="text-xl font-bold text-blue-900">{produtoDominante.produto}</div>
              <div className="text-sm text-blue-700 mt-1">
                {produtoDominante.qtd} {produtoDominante.qtd === 1 ? 'venda' : 'vendas'} • {produtoDominante.percentual}% do total
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(produtoDominante.valor)}
              </div>
              <div className="text-sm text-blue-600">
                Ticket: {formatCurrency(produtoDominante.ticket_medio)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid com Gráfico e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribuição Visual</h4>
          <PieChart
            data={chartData}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </div>

        {/* Tabela Detalhada */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Detalhamento por Produto</h4>
          <div className="overflow-y-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Produto</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Qtd</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Receita</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {produtosArray.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-gray-900 font-medium">
                      {item.produto}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-700">
                      {item.qtd}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(item.valor)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${item.percentual}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-blue-600 w-12 text-right">
                          {item.percentual}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td className="px-3 py-3 font-bold text-gray-900">TOTAL</td>
                  <td className="px-3 py-3 text-center font-bold text-gray-900">
                    {dados.vendas.length}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-gray-900">
                    {formatCurrency(total)}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-blue-600">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Insights</h4>
        <div className="space-y-2 text-sm text-gray-600">
          {produtosArray.length > 1 && (
            <>
              <p>
                • O portfólio tem <strong>{produtosArray.length} produtos ativos</strong> gerando receita neste mês.
              </p>
              {produtoDominante.percentual > 50 && (
                <p className="text-orange-600">
                  ⚠️ <strong>Concentração alta:</strong> {produtoDominante.produto} representa mais de 50% da receita.
                  Considere diversificar o portfólio.
                </p>
              )}
              {produtosArray.filter(p => p.percentual < 10).length > 0 && (
                <p>
                  • Há <strong>{produtosArray.filter(p => p.percentual < 10).length} produtos</strong> com menos de 10% de participação.
                  Avaliar se mantém ou descontinua.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakdownPorProduto;
