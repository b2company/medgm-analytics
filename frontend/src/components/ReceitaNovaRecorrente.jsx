import React, { useState, useEffect } from 'react';
import { getComercialDetalhado, getFinanceiroDetalhado } from '../services/api';
import LineChart from './LineChart';

const ReceitaNovaRecorrente = ({ mes, ano }) => {
  const [dados, setDados] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, [mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const comercial = await getComercialDetalhado(mes, ano);

      // Separar receita nova vs recorrente
      let receitaNova = 0;
      let receitaRecorrente = 0;

      if (comercial.vendas) {
        comercial.vendas.forEach(venda => {
          const valor = venda.valor_liquido || venda.valor || 0;
          if (venda.tipo_receita === 'Recorrência' || venda.tipo_receita === 'Renovação') {
            receitaRecorrente += valor;
          } else {
            receitaNova += valor;
          }
        });
      }

      setDados({
        nova: receitaNova,
        recorrente: receitaRecorrente,
        total: receitaNova + receitaRecorrente,
        pct_nova: ((receitaNova / (receitaNova + receitaRecorrente)) * 100) || 0,
        pct_recorrente: ((receitaRecorrente / (receitaNova + receitaRecorrente)) * 100) || 0
      });

      // Buscar histórico dos últimos 6 meses
      const historicoData = [];
      for (let i = 5; i >= 0; i--) {
        let mesHist = mes - i;
        let anoHist = ano;

        while (mesHist <= 0) {
          mesHist += 12;
          anoHist -= 1;
        }

        try {
          const comHist = await getComercialDetalhado(mesHist, anoHist);
          let nova = 0;
          let recorrente = 0;

          if (comHist.vendas) {
            comHist.vendas.forEach(v => {
              const valor = v.valor_liquido || v.valor || 0;
              if (v.tipo_receita === 'Recorrência' || v.tipo_receita === 'Renovação') {
                recorrente += valor;
              } else {
                nova += valor;
              }
            });
          }

          historicoData.push({
            mes: mesHist,
            ano: anoHist,
            mes_nome: new Date(anoHist, mesHist - 1).toLocaleString('pt-BR', { month: 'short' }),
            nova,
            recorrente
          });
        } catch (e) {
          console.warn(`Erro ao buscar histórico ${mesHist}/${anoHist}:`, e);
        }
      }

      setHistorico(historicoData);
    } catch (error) {
      console.error('Erro ao carregar receita nova/recorrente:', error);
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
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Receita Nova vs Recorrente</h3>
        <p className="text-gray-500">Sem dados disponíveis.</p>
      </div>
    );
  }

  // Verificar queda na recorrência
  const ultimosMeses = historico.slice(-2);
  const quedaRecorrencia = ultimosMeses.length === 2 &&
    ultimosMeses[1].recorrente < ultimosMeses[0].recorrente * 0.9;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Receita Nova vs Recorrente</h3>
        <p className="text-sm text-gray-600 mt-1">
          Composição da receita: vendas novas e recorrências
        </p>
      </div>

      {/* Alerta de Queda */}
      {quedaRecorrencia && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-bold text-red-900 mb-1">Alerta: Queda na Recorrência!</div>
              <div className="text-sm text-red-700">
                A receita recorrente caiu mais de 10% em relação ao mês anterior.
                Verificar churn e renovações.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Card Receita Nova */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-blue-600 font-medium mb-1">💰 Receita Nova</div>
              <div className="text-3xl font-bold text-blue-900">
                {formatCurrency(dados.nova)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {dados.pct_nova.toFixed(0)}%
              </div>
              <div className="text-xs text-blue-600">do total</div>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${dados.pct_nova}%` }}
            />
          </div>
        </div>

        {/* Card Receita Recorrente */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-green-600 font-medium mb-1">🔄 Receita Recorrente</div>
              <div className="text-3xl font-bold text-green-900">
                {formatCurrency(dados.recorrente)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-600">
                {dados.pct_recorrente.toFixed(0)}%
              </div>
              <div className="text-xs text-green-600">do total</div>
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-3">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: `${dados.pct_recorrente}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      {historico.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Evolução - Últimos 6 Meses</h4>
          <LineChart
            data={historico.map(h => ({
              name: h.mes_nome,
              'Nova': h.nova,
              'Recorrente': h.recorrente
            }))}
            dataKeys={['Nova', 'Recorrente']}
            colors={['#3B82F6', '#10B981']}
            height={250}
          />
        </div>
      )}

      {/* Análise */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3">📊 Análise</h4>
        <div className="space-y-2 text-sm text-gray-700">
          {dados.pct_recorrente >= 50 ? (
            <p className="text-green-700">
              ✓ <strong>Saúde boa:</strong> Receita recorrente representa {dados.pct_recorrente.toFixed(0)}% do total.
              Base sólida para previsibilidade.
            </p>
          ) : (
            <p className="text-yellow-700">
              → Receita recorrente é {dados.pct_recorrente.toFixed(0)}% do total.
              Focar em aumentar base recorrente para maior previsibilidade.
            </p>
          )}

          {dados.pct_nova >= 60 && (
            <p className="text-blue-700">
              💪 Alta dependência de vendas novas ({dados.pct_nova.toFixed(0)}%).
              Bom para crescimento mas risco de volatilidade.
            </p>
          )}

          {dados.recorrente === 0 && (
            <p className="text-red-700">
              ⚠️ <strong>Crítico:</strong> Nenhuma receita recorrente neste mês.
              Criar produtos com modelo de recorrência.
            </p>
          )}

          <p className="text-gray-600">
            • Total do mês: <strong>{formatCurrency(dados.total)}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceitaNovaRecorrente;
