import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal - Modal premium MedGM 2026
 * Backdrop blur, animações suaves, acessível
 *
 * @param {boolean} isOpen - Estado do modal
 * @param {function} onClose - Callback para fechar
 * @param {string} title - Título do modal
 * @param {React.ReactNode} children - Conteúdo
 * @param {string} size - Tamanho: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
 * @param {React.ReactNode} footer - Ações do footer (botões)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer
}) => {
  // Bloquear scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fechar com ESC (acessibilidade)
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div
      className="fixed inset-0 bg-medgm-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`
          bg-white rounded-xl shadow-premium w-full ${sizeClasses[size]}
          transform transition-all duration-200 animate-scale-in
          max-h-[90vh] flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-medgm-gray-200">
          <h3
            id="modal-title"
            className="text-2xl font-semibold text-medgm-black pr-8"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="
              -mr-2 -mt-2 p-2 rounded-lg
              text-medgm-gray-600 hover:text-medgm-black hover:bg-medgm-gray-100
              transition-all duration-200 cursor-pointer
              min-w-[44px] min-h-[44px] flex items-center justify-center
            "
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-medgm">
          {children}
        </div>

        {/* Footer (opcional) */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-medgm-gray-200 bg-medgm-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
