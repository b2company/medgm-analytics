import React from 'react';

const FunnelTable = ({ data, type }) => {
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR');
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(1)}%`;
  };

  // Determinar cor de fundo para células de percentual
  const getPercentColor = (value) => {
    if (value === null || value === undefined) return '';
    if (value >= 80) return 'bg-emerald-50 text-emerald-700 font-semibold';
    if (value >= 40) return 'bg-amber-50 text-amber-700 font-semibold';
    return 'bg-red-50 text-red-700 font-semibold';
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderSDRTable = () => (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Funil
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Leads Recebidos
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Reuniões Agendadas
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Reuniões Realizadas
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Tx Agendamento
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Tx Comparecimento
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {row.funil}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                {formatNumber(row.leads_recebidos)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                {formatNumber(row.reunioes_agendadas)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                {formatNumber(row.reunioes_realizadas)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right rounded-lg ${getPercentColor(row.tx_agendamento)}`}>
                {formatPercent(row.tx_agendamento)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right rounded-lg ${getPercentColor(row.tx_comparecimento)}`}>
                {formatPercent(row.tx_comparecimento)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCloserTable = () => (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Funil
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Calls Agendadas
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Calls Realizadas
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Vendas
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Faturamento
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Ticket Médio
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {row.funil}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                {formatNumber(row.calls_agendadas)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                {formatNumber(row.calls_realizadas)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                {formatNumber(row.vendas)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                {formatCurrency(row.faturamento_bruto)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                {formatCurrency(row.ticket_medio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return type === 'sdr' ? renderSDRTable() : renderCloserTable();
};

export default FunnelTable;
