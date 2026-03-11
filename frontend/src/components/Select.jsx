import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Select - Select premium MedGM 2026
 * Dropdown estilizado com label e error states
 *
 * @param {string} label - Label do select
 * @param {string} error - Mensagem de erro
 * @param {string} helperText - Texto de ajuda
 * @param {Array} options - Array de opções: [{ value, label }]
 * @param {string} placeholder - Placeholder
 * @param {boolean} required - Campo obrigatório
 * @param {string} className - Classes adicionais
 */
const Select = ({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Selecione...',
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="label-medgm">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        <select
          className={`
            input-medgm appearance-none cursor-pointer
            ${error ? 'input-error' : ''}
            pr-10
          `}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {error ? (
            <AlertCircle className="w-5 h-5 text-danger" />
          ) : (
            <ChevronDown className="w-5 h-5 text-medgm-gray-400" />
          )}
        </div>
      </div>

      {/* Helper Text or Error Message */}
      {(helperText || error) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-danger' : 'text-medgm-gray-600'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
