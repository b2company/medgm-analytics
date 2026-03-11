import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * TextArea - TextArea premium MedGM 2026
 * Multi-line input com auto-resize opcional
 *
 * @param {string} label - Label do textarea
 * @param {string} error - Mensagem de erro
 * @param {string} helperText - Texto de ajuda
 * @param {number} rows - Número de linhas (default: 4)
 * @param {boolean} required - Campo obrigatório
 * @param {number} maxLength - Limite de caracteres
 * @param {boolean} showCounter - Mostrar contador de caracteres
 * @param {string} className - Classes adicionais
 */
const TextArea = ({
  label,
  error,
  helperText,
  rows = 4,
  required = false,
  maxLength,
  showCounter = false,
  value = '',
  className = '',
  ...props
}) => {
  const charCount = value?.length || 0;

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="label-medgm">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {/* TextArea */}
      <textarea
        className={`
          input-medgm resize-y
          ${error ? 'input-error' : ''}
        `}
        rows={rows}
        maxLength={maxLength}
        value={value}
        {...props}
      />

      {/* Footer com Helper Text / Error / Counter */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p className={`text-sm ${error ? 'text-danger' : 'text-medgm-gray-600'}`}>
            {error || helperText}
          </p>
        )}

        {/* Character Counter */}
        {showCounter && maxLength && (
          <p className={`text-sm ml-auto ${charCount > maxLength * 0.9 ? 'text-warning' : 'text-medgm-gray-500'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default TextArea;
