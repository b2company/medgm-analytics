import React, { useState } from 'react';
import { ChevronDown, Maximize2 } from 'lucide-react';

const SecaoExpansivel = ({ titulo, children, defaultExpanded = false, cor = 'blue' }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [fullscreen, setFullscreen] = useState(false);

  const cores = {
    blue: 'bg-gradient-to-r from-blue-50/90 to-blue-100/80 border-blue-200/50 text-blue-900',
    purple: 'bg-gradient-to-r from-purple-50/90 to-purple-100/80 border-purple-200/50 text-purple-900',
    emerald: 'bg-gradient-to-r from-emerald-50/90 to-emerald-100/80 border-emerald-200/50 text-emerald-900',
    amber: 'bg-gradient-to-r from-amber-50/90 to-amber-100/80 border-amber-200/50 text-amber-900'
  };

  return (
    <>
      <div className="border border-white/40 rounded-xl overflow-hidden backdrop-blur-md bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full px-3 py-2 flex items-center justify-between transition-all duration-300 backdrop-blur-sm ${cores[cor]}`}
        >
          <span className="font-bold text-sm">{titulo}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen(true);
              }}
              className="p-1 hover:bg-white/60 rounded-lg transition-all duration-200 cursor-pointer"
              title="Expandir tela cheia"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
        {expanded && (
          <div className="p-3 bg-white/40 backdrop-blur-sm">
            {children}
          </div>
        )}
      </div>

      {/* Modal Fullscreen Glassmorphism */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreen(false)}
        >
          <div
            className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{titulo}</h2>
              <button
                onClick={() => setFullscreen(false)}
                className="text-slate-400 hover:text-slate-600 text-4xl transition-all duration-200 hover:scale-110 cursor-pointer"
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
