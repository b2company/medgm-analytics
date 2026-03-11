import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TabelaRanking = ({ titulo, cor = 'blue', colunas, dados, metricaPrincipal }) => {
  const cores = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', barBom: 'bg-emerald-500', barMedio: 'bg-amber-500', barRuim: 'bg-red-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', barBom: 'bg-emerald-500', barMedio: 'bg-amber-500', barRuim: 'bg-red-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', barBom: 'bg-emerald-500', barMedio: 'bg-amber-500', barRuim: 'bg-red-500' }
  };

  const getStatusBarra = (percentual) => {
    if (percentual >= 80) return cores[cor].barBom;
    if (percentual >= 50) return cores[cor].barMedio;
    return cores[cor].barRuim;
  };

  const getStatusBadge = (percentual) => {
    if (percentual >= 80) return { color: 'bg-emerald-100 text-emerald-700' };
    if (percentual >= 50) return { color: 'bg-amber-100 text-amber-700' };
    return { color: 'bg-red-100 text-red-700' };
  };

  // Ordenar dados por percentual (melhor primeiro)
  const dadosOrdenados = [...dados].sort((a, b) => {
    const percA = a.meta > 0 ? (a.valor / a.meta) * 100 : 0;
    const percB = b.meta > 0 ? (b.valor / b.meta) * 100 : 0;
    return percB - percA;
  });

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className={`px-3 py-1.5 ${cores[cor].bg} border-b ${cores[cor].border}`}>
        <span className={`font-bold text-xs ${cores[cor].text}`}>{titulo}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-2 py-1.5 text-left font-semibold text-slate-600 text-[9px]">Atendente</th>
              {colunas.map((col, idx) => (
                <th key={idx} className="px-2 py-1.5 text-center font-semibold text-slate-600 text-[9px]">{col.label}</th>
              ))}
              <th className="px-2 py-1.5 text-center font-semibold text-slate-600 text-[9px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {dadosOrdenados.map((item, idx) => {
              const percentual = item.meta > 0 ? (item.valor / item.meta) * 100 : 0;
              const status = getStatusBadge(percentual);

              return (
                <tr
                  key={idx}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  {/* Barra colorida lateral + Nome */}
                  <td className="px-2 py-1.5 relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusBarra(percentual)}`}></div>
                    <div className="flex items-center gap-1.5 pl-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-600">
                        {item.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-[10px]">{item.nome}</div>
                        <div className="text-[8px] text-slate-500">{item.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Colunas de dados */}
                  {colunas.map((col, colIdx) => {
                    const valorCol = item[col.key];
                    const isPrincipal = col.key === metricaPrincipal;

                    return (
                      <td key={colIdx} className="px-2 py-1.5 text-center">
                        {isPrincipal ? (
                          <div className="flex flex-col items-center">
                            <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${percentual >= 80 ? 'bg-emerald-100 text-emerald-700' : percentual >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                              {col.formatter ? col.formatter(valorCol) : valorCol}
                            </span>
                            <span className="text-[8px] text-slate-500 mt-0.5">
                              {col.formatter ? col.formatter(item.meta) : item.meta}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-700 text-[10px]">
                            {col.formatter ? col.formatter(valorCol) : valorCol || '-'}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Status - Percentual */}
                  <td className="px-2 py-1.5 text-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status.color}`}>
                      {percentual.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaRanking;
