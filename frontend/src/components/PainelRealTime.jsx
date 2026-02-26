import React from 'react';

const PainelRealTime = ({ dataFinanceiro, dataComercial, metaEmpresa, mes, ano }) => {
  if (!dataFinanceiro || !dataComercial) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatShortCurrency = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  // Cálculos principais
  const faturamentoRealizado = dataComercial.faturamento_total || 0;
  const metaMensal = (metaEmpresa?.meta_faturamento_anual || 5000000) / 12;
  const percAtingimento = (faturamentoRealizado / metaMensal) * 100;

  const lucroOperacional = dataFinanceiro.dre?.lucro_liquido || 0;
  const saldoCaixa = dataFinanceiro.saldo || 0;

  // Determinar cor do indicador
  let statusColor = 'red';
  let statusBg = 'bg-red-500';
  let statusText = 'ATENÇÃO';
  let statusIcon = '⚠️';

  if (percAtingimento >= 100) {
    statusColor = 'green';
    statusBg = 'bg-green-500';
    statusText = 'META BATIDA';
    statusIcon = '✓';
  } else if (percAtingimento >= 70) {
    statusColor = 'yellow';
    statusBg = 'bg-yellow-500';
    statusText = 'NO CAMINHO';
    statusIcon = '→';
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel Principal - Faturamento */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white opacity-80">
              Resultado do Mês
            </h2>
            <div className={`${statusBg} text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2`}>
              <span className="text-lg">{statusIcon}</span>
              {statusText}
            </div>
          </div>

          {/* Número GIGANTE */}
          <div className="mb-6">
            <div className="text-gray-400 text-sm mb-2">Faturamento Realizado</div>
            <div className={`text-7xl font-black mb-2 ${
              percAtingimento >= 100 ? 'text-green-400' :
              percAtingimento >= 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {formatShortCurrency(faturamentoRealizado)}
            </div>
            <div className="text-gray-400 text-lg">
              Meta: {formatShortCurrency(metaMensal)} ({percAtingimento.toFixed(0)}%)
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out flex items-center justify-end px-3 ${
                  percAtingimento >= 100 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  percAtingimento >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${Math.min(percAtingimento, 100)}%`, minWidth: percAtingimento > 0 ? '50px' : '0' }}
              >
                <span className="text-xs font-bold text-white">
                  {percAtingimento.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Falta para Meta */}
          {percAtingimento < 100 && (
            <div className="mt-4 text-gray-300">
              <span className="text-sm">Falta: </span>
              <span className="text-xl font-bold text-yellow-400">
                {formatShortCurrency(metaMensal - faturamentoRealizado)}
              </span>
              <span className="text-sm text-gray-400"> para bater a meta</span>
            </div>
          )}
        </div>

        {/* Cards Laterais */}
        <div className="space-y-4">
          {/* Lucro Operacional */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Lucro Operacional</div>
            <div className={`text-3xl font-bold ${
              lucroOperacional >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatShortCurrency(lucroOperacional)}
            </div>
            <div className="text-gray-500 text-xs mt-2">
              Margem: {(dataFinanceiro.dre?.margem_liquida_pct || 0).toFixed(1)}%
            </div>
          </div>

          {/* Saldo de Caixa */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Saldo de Caixa</div>
            <div className={`text-3xl font-bold ${
              saldoCaixa >= 0 ? 'text-blue-400' : 'text-red-400'
            }`}>
              {formatShortCurrency(saldoCaixa)}
            </div>
            <div className="text-gray-500 text-xs mt-2">
              Disponível agora
            </div>
          </div>

          {/* Total de Vendas */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Vendas no Mês</div>
            <div className="text-3xl font-bold text-purple-400">
              {dataComercial.total_vendas || 0}
            </div>
            <div className="text-gray-500 text-xs mt-2">
              Ticket: {formatShortCurrency(dataComercial.ticket_medio || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelRealTime;
