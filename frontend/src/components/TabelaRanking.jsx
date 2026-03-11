import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TabelaRanking = ({ titulo, cor = 'blue', colunas, dados, metricaPrincipal }) => {
  const cores = {
    blue: { bg: 'bg-gradient-to-r from-blue-50/90 to-blue-100/80', border: 'border-blue-200/50', text: 'text-blue-900', barBom: 'bg-gradient-to-r from-emerald-500 to-emerald-600', barMedio: 'bg-gradient-to-r from-amber-500 to-amber-600', barRuim: 'bg-gradient-to-r from-red-500 to-red-600' },
    purple: { bg: 'bg-gradient-to-r from-purple-50/90 to-purple-100/80', border: 'border-purple-200/50', text: 'text-purple-900', barBom: 'bg-gradient-to-r from-emerald-500 to-emerald-600', barMedio: 'bg-gradient-to-r from-amber-500 to-amber-600', barRuim: 'bg-gradient-to-r from-red-500 to-red-600' },
    emerald: { bg: 'bg-gradient-to-r from-emerald-50/90 to-emerald-100/80', border: 'border-emerald-200/50', text: 'text-emerald-900', barBom: 'bg-gradient-to-r from-emerald-500 to-emerald-600', barMedio: 'bg-gradient-to-r from-amber-500 to-amber-600', barRuim: 'bg-gradient-to-r from-red-500 to-red-600' }
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
    <div className="border border-white/40 rounded-xl overflow-hidden backdrop-blur-md bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={`px-3 py-2 ${cores[cor].bg} border-b ${cores[cor].border} backdrop-blur-sm`}>
        <span className={`font-bold text-sm ${cores[cor].text}`}>{titulo}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50/90 to-white/80 backdrop-blur-sm border-b border-slate-200/50">
              <th className="px-2 py-2 text-left font-bold text-slate-700 text-[10px]">Atendente</th>
              {colunas.map((col, idx) => (
                <th key={idx} className="px-2 py-2 text-center font-bold text-slate-700 text-[10px]">{col.label}</th>
              ))}
              <th className="px-2 py-2 text-center font-bold text-slate-700 text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody className="backdrop-blur-sm">
            {dadosOrdenados.map((item, idx) => {
              const percentual = item.meta > 0 ? (item.valor / item.meta) * 100 : 0;
              const status = getStatusBadge(percentual);

              return (
                <tr
                  key={idx}
                  className={`border-b border-white/30 hover:bg-white/60 transition-all duration-200 cursor-pointer ${idx % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/40'}`}
                >
                  {/* Barra colorida lateral + Nome */}
                  <td className="px-2 py-2 relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${getStatusBarra(percentual)} shadow-md`}></div>
                    <div className="flex items-center gap-2 pl-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg backdrop-blur-sm border border-white/40">
                        {item.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[10px]">{item.nome}</div>
                        <div className="text-[9px] text-slate-600 font-medium">{item.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Colunas de dados */}
                  {colunas.map((col, colIdx) => {
                    const valorCol = item[col.key];
                    const isPrincipal = col.key === metricaPrincipal;

                    return (
                      <td key={colIdx} className="px-2 py-2 text-center">
                        {isPrincipal ? (
                          <div className="flex flex-col items-center">
                            <span className={`font-extrabold text-[11px] px-2 py-1 rounded-lg shadow-md backdrop-blur-sm ${percentual >= 80 ? 'bg-emerald-100/90 text-emerald-700' : percentual >= 50 ? 'bg-amber-100/90 text-amber-700' : 'bg-red-100/90 text-red-700'}`}>
                              {col.formatter ? col.formatter(valorCol) : valorCol}
                            </span>
                            <span className="text-[9px] text-slate-600 font-semibold mt-0.5">
                              {col.formatter ? col.formatter(item.meta) : item.meta}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-800 text-[10px]">
                            {col.formatter ? col.formatter(valorCol) : valorCol || '-'}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Status - Percentual */}
                  <td className="px-2 py-2 text-center">
                    <span className={`text-[11px] font-extrabold px-2 py-1 rounded-lg ${status.color} shadow-md backdrop-blur-sm`}>
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
