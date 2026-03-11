import React, { useState, useEffect } from 'react';
import { getPontoEquilibrio } from '../services/api';

const PontoEquilibrio = ({ mes, ano }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, [mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const data = await getPontoEquilibrio(mes, ano);
      setDados(data);
    } catch (error) {
      console.error('Erro ao carregar ponto de equilíbrio:', error);
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

  const getColorClass = (cor) => {
    switch (cor) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-700',
          badge: 'bg-green-500'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-700',
          badge: 'bg-yellow-500'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-700',
          badge: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-500',
          text: 'text-gray-700',
          badge: 'bg-gray-500'
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
        <h3 className="text-lg font-bold mb-4">Ponto de Equilíbrio</h3>
        <p className="text-gray-500">Sem dados disponíveis.</p>
      </div>
    );
  }

  const colors = getColorClass(dados.cor);

  return (
    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg shadow p-6`}>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Ponto de Equilíbrio - {new Date(2000, mes - 1).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(2000, mes - 1).toLocaleString('pt-BR', { month: 'long' }).slice(1)}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Quanto precisa faturar líquido para empatar
            </p>
          </div>
          <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-bold`}>
            {dados.status_texto}
          </span>
        </div>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-2">Este mês precisa de</div>
          <div className="text-5xl font-black text-gray-900 mb-2">
            {formatShortCurrency(dados.ponto_equilibrio)}
          </div>
          <div className="text-sm text-gray-600">líquido para empatar</div>
        </div>

        {/* Barra de Progresso */}
        <div className="relative mb-4">
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <div
              className={`h-full ${colors.badge} transition-all duration-1000 ease-out flex items-center justify-center`}
              style={{
                width: `${Math.min(dados.perc_atingido, 100)}%`,
                minWidth: dados.perc_atingido > 0 ? '60px' : '0'
              }}
            >
              <span className="text-sm font-bold text-white">
                {dados.perc_atingido.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-600">Realizado</div>
            <div className="text-xl font-bold text-green-600">
              {formatShortCurrency(dados.receita_realizada)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">Falta</div>
            <div className={`text-xl font-bold ${dados.falta_para_equilibrio > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatShortCurrency(dados.falta_para_equilibrio)}
            </div>
          </div>
        </div>
      </div>

      {/* Com Recorrências */}
      {dados.mrr_confirmado > 0 && dados.falta_para_equilibrio > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-bold text-blue-900 mb-3">
            💰 Com Recorrências Confirmadas
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">MRR Confirmado</span>
              <span className="text-base font-bold text-blue-900">
                {formatCurrency(dados.mrr_confirmado)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-blue-200">
              <span className="text-sm font-bold text-blue-700">Falta após MRR</span>
              <span className="text-xl font-bold text-blue-900">
                {formatShortCurrency(dados.falta_apos_mrr)}
              </span>
            </div>
            {dados.vendas_necessarias > 0 && (
              <p className="text-sm text-blue-700 mt-2">
                → Precisa de aproximadamente <strong>{Math.ceil(dados.vendas_necessarias)} vendas</strong> para empatar
                (ticket médio: {formatCurrency(dados.ticket_medio)})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Ritmo Necessário */}
      {dados.dias_restantes > 0 && dados.falta_apos_mrr > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <h4 className="text-sm font-bold text-gray-700 mb-3">⏱️ Ritmo Necessário</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600">Dias Restantes</div>
              <div className="text-2xl font-bold text-gray-900">{dados.dias_restantes}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Meta Diária</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatShortCurrency(dados.meta_diaria)}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Para empatar, precisa faturar <strong>{formatCurrency(dados.meta_diaria)}</strong> por dia útil restante
          </p>
        </div>
      )}

      {/* Mensagem de Sucesso */}
      {dados.falta_para_equilibrio === 0 && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-5 mt-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <div className="text-base font-bold text-green-900">Ponto de Equilíbrio Atingido!</div>
              <div className="text-sm text-green-700">
                Receita do mês já cobre todos os custos. Todo faturamento adicional é lucro.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PontoEquilibrio;
