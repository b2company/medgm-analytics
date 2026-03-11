import React, { useState } from 'react';
import { ChevronDown, Maximize2 } from 'lucide-react';

const SecaoExpansivel = ({ titulo, children, defaultExpanded = false, cor = 'blue' }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [fullscreen, setFullscreen] = useState(false);

  const cores = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900'
  };

  return (
    <>
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full px-3 py-1.5 flex items-center justify-between transition-colors ${cores[cor]}`}
        >
          <span className="font-bold text-xs">{titulo}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen(true);
              }}
              className="p-0.5 hover:bg-white/50 rounded transition-colors"
              title="Expandir tela cheia"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
        {expanded && (
          <div className="p-2">
            {children}
          </div>
        )}
      </div>

      {/* Modal Fullscreen */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{titulo}</h2>
              <button
                onClick={() => setFullscreen(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl"
              >
                ×
              </button>
            </div>
            <div>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SecaoExpansivel;
