import React, { useState, useEffect } from 'react';
import { getProjecaoCaixa } from '../services/api';
import LineChart from './LineChart';

const ProjecaoCaixa = ({ mes, ano }) => {
  const [projecao, setProjecao] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjecao();
  }, [mes, ano]);

  const loadProjecao = async () => {
    setLoading(true);
    try {
      const data = await getProjecaoCaixa(3, mes, ano);
      setProjecao(data);
    } catch (error) {
      console.error('Erro ao carregar projeção:', error);
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!projecao) return null;

  // Preparar dados para o gráfico
  const chartData = projecao.projecoes.map(p => ({
    name: p.mes_nome,
    Receita: p.receita_projetada,
    Custos: p.custos_projetados,
    Saldo: p.saldo_projetado
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Projeção de Fluxo de Caixa</h3>
          <p className="text-sm text-gray-600 mt-1">
            Projeção automática dos próximos {projecao.projecoes.length} meses baseada em MRR e custos médios
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Saldo Atual</div>
          <div className={`text-2xl font-bold ${
            projecao.saldo_atual >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatShortCurrency(projecao.saldo_atual)}
          </div>
        </div>
      </div>

      {/* Alertas Críticos */}
      {projecao.mes_critico && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          projecao.mes_critico.status === 'critico'
            ? 'bg-red-50 border-red-500'
            : 'bg-yellow-50 border-yellow-500'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {projecao.mes_critico.status === 'critico' ? '🚨' : '⚠️'}
            </span>
            <div className="flex-1">
              <div className={`font-bold ${
                projecao.mes_critico.status === 'critico' ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {projecao.mes_critico.alerta}
              </div>
              <div className={`text-sm mt-1 ${
                projecao.mes_critico.status === 'critico' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                Receita projetada: {formatCurrency(projecao.mes_critico.receita_projetada)} |
                Custos projetados: {formatCurrency(projecao.mes_critico.custos_projetados)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parâmetros da Projeção */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600">MRR (Receita Recorrente)</div>
          <div className="text-xl font-bold text-green-700">
            {formatCurrency(projecao.mrr)}
          </div>
          <div className="text-xs text-green-600 mt-1">Por mês</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-600">Custos Fixos Mensais</div>
          <div className="text-xl font-bold text-red-700">
            {formatCurrency(projecao.custos_fixos_mensais)}
          </div>
          <div className="text-xs text-red-600 mt-1">Média últimos 3 meses</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-yellow-600">Custos Variáveis</div>
          <div className="text-xl font-bold text-yellow-700">
            {formatCurrency(projecao.custos_variaveis_mensais)}
          </div>
          <div className="text-xs text-yellow-600 mt-1">Média últimos 3 meses</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="mb-6">
        <LineChart
          data={chartData}
          dataKeys={['Receita', 'Custos', 'Saldo']}
          colors={['#10B981', '#EF4444', '#3B82F6']}
          height={300}
        />
      </div>

      {/* Tabela Detalhada */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Mês</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Receita</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Custos</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Resultado</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Saldo</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projecao.projecoes.map((proj, idx) => (
              <tr key={idx} className={`hover:bg-gray-50 ${
                proj.status === 'critico' ? 'bg-red-50' :
                proj.status === 'atencao' ? 'bg-yellow-50' : ''
              }`}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {proj.mes_nome} {proj.ano}
                </td>
                <td className="px-4 py-3 text-right text-green-600 font-semibold">
                  {formatCurrency(proj.receita_projetada)}
                </td>
                <td className="px-4 py-3 text-right text-red-600 font-semibold">
                  {formatCurrency(proj.custos_projetados)}
                </td>
                <td className={`px-4 py-3 text-right font-bold ${
                  proj.resultado_mes >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(proj.resultado_mes)}
                </td>
                <td className={`px-4 py-3 text-right font-bold ${
                  proj.saldo_projetado >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatCurrency(proj.saldo_projetado)}
                </td>
                <td className="px-4 py-3 text-center">
                  {proj.status === 'critico' && <span className="text-red-600 text-xl">🚨</span>}
                  {proj.status === 'atencao' && <span className="text-yellow-600 text-xl">⚠️</span>}
                  {proj.status === 'alerta' && <span className="text-yellow-600 text-xl">⚡</span>}
                  {proj.status === 'saudavel' && <span className="text-green-600 text-xl">✓</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumo */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Total Receita Projetada</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(projecao.resumo.total_receita_projetada)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Custos Projetados</div>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(projecao.resumo.total_custos_projetados)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Saldo Final Projetado</div>
            <div className={`text-lg font-bold ${
              projecao.resumo.saldo_final_projetado >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              {formatCurrency(projecao.resumo.saldo_final_projetado)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjecaoCaixa;
