import React from 'react';

const FunilCompleto = ({ dados, agrupamento = "geral" }) => {
  if (!dados) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  if (agrupamento === "geral") {
    const etapas = [
      { nome: "Leads", valor: dados.leads, cor: "#3B82F6" },
      { nome: "Reuniao Agendada", valor: dados.reunioes_agendadas, taxa: dados.taxas?.lead_reuniao, cor: "#10B981" },
      { nome: "Reuniao Realizada", valor: dados.reunioes_realizadas, taxa: dados.taxas?.agendada_realizada, cor: "#F59E0B" },
      { nome: "Vendas", valor: dados.vendas, taxa: dados.taxas?.reuniao_venda, cor: "#EF4444" },
      { nome: "Faturamento", valor: dados.faturamento, isCurrency: true, cor: "#14B8A6" }
    ];

    const maxValor = Math.max(...etapas.filter(e => !e.isCurrency).map(e => e.valor || 0), 1);

    return (
      <div className="space-y-3">
        {etapas.map((etapa, idx) => {
          const largura = etapa.isCurrency ? 100 : Math.max((etapa.valor / maxValor) * 100, 5);

          return (
            <div key={idx} className="relative">
              <div className="flex items-center gap-4">
                <div className="w-36 text-sm font-medium text-gray-700">{etapa.nome}</div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-full h-10 overflow-hidden">
                    <div
                      className="h-full flex items-center justify-between px-4 text-white font-bold transition-all duration-500 rounded-full"
                      style={{ width: `${largura}%`, backgroundColor: etapa.cor, minWidth: '80px' }}
                    >
                      <span className="text-sm">
                        {etapa.isCurrency ? formatCurrency(etapa.valor) : formatNumber(etapa.valor)}
                      </span>
                      {etapa.taxa !== undefined && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                          {etapa.taxa.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Resumo */}
        <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Ticket Medio</div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(dados.ticket_medio)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Taxa Geral (Lead-Venda)</div>
            <div className="text-xl font-bold text-green-700">
              {dados.leads > 0 ? ((dados.vendas / dados.leads) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (agrupamento === "por_closer" && dados.closers) {
    return (
      <div className="space-y-4">
        {Object.entries(dados.closers).map(([nome, metricas]) => (
          <div key={nome} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900">{nome}</h4>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(metricas.faturamento)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Vendas</div>
                <div className="font-semibold">{metricas.vendas}</div>
              </div>
              <div>
                <div className="text-gray-500">Ticket Medio</div>
                <div className="font-semibold">{formatCurrency(metricas.ticket_medio)}</div>
              </div>
              <div>
                <div className="text-gray-500">Tx. Comparec.</div>
                <div className="font-semibold">{metricas.tx_comparecimento?.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-500">Tx. Conversao</div>
                <div className="font-semibold">{metricas.tx_conversao?.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (agrupamento === "por_canal" && dados.canais) {
    return (
      <div className="space-y-4">
        {Object.entries(dados.canais).map(([nome, metricas]) => (
          <div key={nome} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900">{nome}</h4>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(metricas.faturamento)}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Leads</div>
                <div className="font-semibold">{metricas.leads_recebidos}</div>
              </div>
              <div>
                <div className="text-gray-500">Agendadas</div>
                <div className="font-semibold">{metricas.reunioes_agendadas}</div>
              </div>
              <div>
                <div className="text-gray-500">Realizadas</div>
                <div className="font-semibold">{metricas.reunioes_realizadas}</div>
              </div>
              <div>
                <div className="text-gray-500">Vendas</div>
                <div className="font-semibold">{metricas.vendas}</div>
              </div>
              <div>
                <div className="text-gray-500">Conversao</div>
                <div className="font-semibold">{metricas.tx_conversao?.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default FunilCompleto;
