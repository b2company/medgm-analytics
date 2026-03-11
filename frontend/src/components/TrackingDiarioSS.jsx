import React, { useState, useEffect } from 'react';
import { getTrackingDiarioSS } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrackingDiarioSS = ({ mes, ano }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendedorFiltro, setVendedorFiltro] = useState('');

  useEffect(() => {
    loadDados();
  }, [mes, ano, vendedorFiltro]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const data = await getTrackingDiarioSS(mes, ano, vendedorFiltro || null);
      setDados(data);
    } catch (error) {
      console.error('Erro ao carregar tracking diário:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (tipo) => {
    switch (tipo) {
      case 'alerta': return '🚨';
      case 'sucesso': return '🏆';
      case 'info': return '📊';
      case 'padrao': return '📅';
      default: return '💡';
    }
  };

  const getInsightColor = (tipo) => {
    switch (tipo) {
      case 'alerta': return 'bg-red-50 border-red-200 text-red-800';
      case 'sucesso': return 'bg-green-50 border-green-200 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'padrao': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const cores = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316'  // orange
  ];

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

  if (!dados || dados.dados_diarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">📈 Tracking Diário - Social Selling</h3>
        <p className="text-gray-500">
          Sem dados diários disponíveis. Para usar esta funcionalidade, cadastre métricas com datas específicas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">📈 Tracking Diário - Social Selling</h3>
            <p className="text-sm text-gray-600 mt-1">
              Acompanhamento diário de ativações para identificar padrões e oportunidades
            </p>
          </div>

          {/* Filtro por Vendedor */}
          {dados.vendedores.length > 1 && (
            <select
              value={vendedorFiltro}
              onChange={(e) => setVendedorFiltro(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os vendedores</option>
              {dados.vendedores.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          )}
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Total Ativações</div>
            <div className="text-3xl font-bold text-blue-900">
              {dados.resumo.total_ativacoes}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              em {dados.resumo.total_dias_com_dados} dias
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">Média Diária</div>
            <div className="text-3xl font-bold text-green-900">
              {dados.resumo.media_diaria}
            </div>
            <div className="text-xs text-green-600 mt-1">
              ativações/dia
            </div>
          </div>

          {dados.resumo.melhor_dia && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-600 mb-1">Melhor Dia</div>
              <div className="text-3xl font-bold text-yellow-900">
                {dados.resumo.melhor_dia.total_ativacoes}
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                {dados.resumo.melhor_dia.data_formatada}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Linha */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dados.dados_diarios} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="data_formatada"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                      <p className="font-bold text-gray-900 mb-2">{label} ({data.dia_semana})</p>
                      <p className="text-sm text-gray-700 mb-1">
                        Total: <span className="font-bold text-blue-600">{data.total_ativacoes}</span> ativações
                      </p>
                      {!vendedorFiltro && Object.keys(data.por_vendedor).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Por vendedor:</p>
                          {Object.entries(data.por_vendedor).map(([vendedor, qtd]) => (
                            <p key={vendedor} className="text-xs text-gray-700">
                              • {vendedor}: {qtd}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />

            {/* Linha Total */}
            <Line
              type="monotone"
              dataKey="total_ativacoes"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Total Ativações"
              dot={{ r: 4, fill: '#3B82F6' }}
              activeDot={{ r: 6 }}
            />

            {/* Linhas por Vendedor (se não filtrado) */}
            {!vendedorFiltro && dados.vendedores.map((vendedor, idx) => (
              <Line
                key={vendedor}
                type="monotone"
                dataKey={`por_vendedor.${vendedor}`}
                stroke={cores[idx % cores.length]}
                strokeWidth={2}
                name={vendedor}
                dot={{ r: 3 }}
                strokeDasharray="3 3"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      {dados.insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-700 mb-3">💡 Insights Automáticos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dados.insights.map((insight, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${getInsightColor(insight.tipo)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getInsightIcon(insight.tipo)}</span>
                  <div>
                    <div className="font-bold text-sm mb-1">{insight.titulo}</div>
                    <div className="text-xs">{insight.descricao}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explicação */}
      <div className="mt-6 pt-6 border-t text-sm text-gray-600">
        <p className="mb-2">
          <strong>Como usar:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Identifique padrões de dias com alta ou baixa performance</li>
          <li>Detecte quedas repentinas que podem indicar problemas operacionais</li>
          <li>Compare performance entre vendedores no mesmo período</li>
          <li>Use insights para ajustar estratégias e definir metas realistas</li>
        </ul>
      </div>
    </div>
  );
};

export default TrackingDiarioSS;
