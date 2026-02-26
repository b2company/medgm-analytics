import React, { useState, useEffect } from 'react';
import { getRunway } from '../services/api';

const VisaoRunway = ({ mes, ano }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, [mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const data = await getRunway(mes, ano);
      setDados(data);
    } catch (error) {
      console.error('Erro ao carregar runway:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const getColorClass = (cor) => {
    switch (cor) {
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-700',
          light: 'bg-green-50'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-700',
          light: 'bg-yellow-50'
        };
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-red-700',
          light: 'bg-red-50'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-700',
          light: 'bg-gray-50'
        };
    }
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
        <h3 className="text-lg font-bold mb-4">Runway - Meses de Sobrevivência</h3>
        <p className="text-gray-500">Sem dados disponíveis.</p>
      </div>
    );
  }

  const colors = getColorClass(dados.cor);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Runway - Meses de Sobrevivência</h3>
        <p className="text-sm text-gray-600 mt-1">
          Quantos meses a empresa sobrevive sem vendas novas
        </p>
      </div>

      {/* Card Principal */}
      <div className={`${colors.light} border-2 ${colors.bg.replace('bg-', 'border-')} rounded-lg p-8 mb-6`}>
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-2">Runway Atual</div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className={`text-7xl font-black ${colors.text}`}>
              {dados.runway_meses >= 100 ? '∞' : dados.runway_meses.toFixed(1)}
            </div>
            {dados.runway_meses < 100 && (
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900">
                  {dados.runway_meses < 2 ? 'mês' : 'meses'}
                </div>
                <span className={`${colors.bg} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                  {dados.status_texto}
                </span>
              </div>
            )}
          </div>
          {dados.data_zero_caixa && (
            <div className={`text-base ${colors.text} font-medium`}>
              Caixa zera em: {dados.data_zero_caixa}
            </div>
          )}
        </div>

        {/* Alertas */}
        {dados.runway_meses < 2 && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 text-red-900 font-bold mb-2">
              <span className="text-xl">🚨</span>
              ALERTA VERMELHO
            </div>
            <div className="text-sm text-red-700">
              Caixa crítico! Menos de 2 meses de runway. Ação imediata necessária:
              acelerar vendas ou reduzir custos urgentemente.
            </div>
          </div>
        )}

        {dados.runway_meses >= 2 && dados.runway_meses < 3 && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 text-yellow-900 font-bold mb-2">
              <span className="text-xl">⚠️</span>
              ATENÇÃO
            </div>
            <div className="text-sm text-yellow-700">
              Runway abaixo de 3 meses. Monitorar de perto e planejar ações para aumentar receita ou reduzir custos.
            </div>
          </div>
        )}

        {dados.runway_meses >= 6 && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 text-green-900 font-bold mb-2">
              <span className="text-xl">✓</span>
              RUNWAY SAUDÁVEL
            </div>
            <div className="text-sm text-green-700">
              Mais de 6 meses de runway. Situação confortável para crescimento e investimentos.
            </div>
          </div>
        )}
      </div>

      {/* Detalhamento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-2">Saldo de Caixa Atual</div>
          <div className={`text-2xl font-bold ${
            dados.saldo_atual >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(dados.saldo_atual)}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-2">Custo Mensal Médio</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(dados.custos_mensais_medio)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Média últimos 3 meses</div>
        </div>
      </div>

      {/* Explicação */}
      <div className="mt-6 pt-6 border-t text-sm text-gray-600">
        <p className="mb-2">
          <strong>O que é Runway?</strong>
        </p>
        <p>
          É o número de meses que a empresa consegue operar com o caixa atual,
          sem considerar receitas futuras. Calculado como: <strong>Saldo de Caixa ÷ Custo Mensal Médio</strong>.
        </p>
        <p className="mt-2">
          Um runway saudável (6+ meses) dá segurança para investir em crescimento e tomar decisões estratégicas.
        </p>
      </div>
    </div>
  );
};

export default VisaoRunway;
