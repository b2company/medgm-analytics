import React from 'react';

const PainelRealTime = ({ dataFinanceiro, dataComercial, metaEmpresa, mes, ano }) => {
  if (!dataFinanceiro || !dataComercial) return null;

  // Debug: verificar dados das 3 abas comerciais
  console.log('📊 PainelRealTime - metricas_comerciais:', dataComercial.metricas_comerciais);

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
  // Usar faturamento do Closer (mais preciso) se disponível, senão usar de Vendas
  const faturamentoRealizado = dataComercial.metricas_comerciais?.closer?.faturamento_bruto || dataComercial.faturamento_total || 0;
  const metaMensal = (metaEmpresa?.meta_faturamento_anual || 5000000) / 12;
  const percAtingimento = (faturamentoRealizado / metaMensal) * 100;

  const lucroOperacional = dataFinanceiro.dre?.lucro_liquido || 0;
  const saldoCaixa = dataFinanceiro.saldo || 0;

  // Métricas das 3 abas comerciais
  const socialSelling = dataComercial.metricas_comerciais?.social_selling || {};
  const sdr = dataComercial.metricas_comerciais?.sdr || {};
  const closer = dataComercial.metricas_comerciais?.closer || {};

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

        {/* Cards Laterais - Funil Comercial */}
        <div className="space-y-4">
          {/* Social Selling */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-amber-400 text-sm font-semibold mb-3 flex items-center gap-2">
              <span>📱</span> Social Selling
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Ativações</span>
                <span className="text-lg font-bold text-white">{socialSelling.ativacoes || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Conversões</span>
                <span className="text-lg font-bold text-white">{socialSelling.conversoes || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Leads</span>
                <span className="text-lg font-bold text-green-400">{socialSelling.leads || 0}</span>
              </div>
            </div>
          </div>

          {/* SDR */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-blue-400 text-sm font-semibold mb-3 flex items-center gap-2">
              <span>📞</span> SDR
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Leads Recebidos</span>
                <span className="text-lg font-bold text-white">{sdr.leads_recebidos || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Reuniões Agendadas</span>
                <span className="text-lg font-bold text-white">{sdr.reunioes_agendadas || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Reuniões Realizadas</span>
                <span className="text-lg font-bold text-green-400">{sdr.reunioes_realizadas || 0}</span>
              </div>
            </div>
          </div>

          {/* Closer */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-green-400 text-sm font-semibold mb-3 flex items-center gap-2">
              <span>🎯</span> Closer
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Calls Realizadas</span>
                <span className="text-lg font-bold text-white">{closer.calls_realizadas || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Vendas</span>
                <span className="text-lg font-bold text-green-400">{closer.vendas || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Faturamento</span>
                <span className="text-lg font-bold text-green-400">{formatShortCurrency(closer.faturamento_bruto || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelRealTime;
