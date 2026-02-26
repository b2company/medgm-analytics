import React, { useState } from 'react';
import ExpandModal from './ExpandModal';
import InfoTooltip from './InfoTooltip';

const ExpandableCard = ({
  title,
  children,
  expandedContent,
  className = '',
  info = null
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative hover:shadow-xl transition-all duration-300 ${className}`}>
        {/* Ícone de expandir */}
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 cursor-pointer"
          title="Expandir visualização"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>

        {/* Título */}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-12 flex items-center gap-2">
            {title}
            {info && <InfoTooltip text={info} />}
          </h3>
        )}

        {/* Conteúdo normal */}
        {children}
      </div>

      {/* Modal expandido */}
      {isExpanded && (
        <ExpandModal
          title={title}
          onClose={() => setIsExpanded(false)}
        >
          {expandedContent || children}
        </ExpandModal>
      )}
    </>
  );
};

export default ExpandableCard;
