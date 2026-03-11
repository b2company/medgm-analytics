import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Input - Input premium MedGM 2026
 * Com label, error states, ícones, etc
 *
 * @param {string} label - Label do input
 * @param {string} error - Mensagem de erro
 * @param {string} helperText - Texto de ajuda
 * @param {React.ReactNode} leftIcon - Ícone à esquerda
 * @param {React.ReactNode} rightIcon - Ícone à direita
 * @param {boolean} required - Campo obrigatório
 * @param {string} className - Classes adicionais
 */
const Input = ({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
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

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-medgm-gray-400">
            <LeftIcon className="w-5 h-5" />
          </div>
        )}

        {/* Input */}
        <input
          className={`
            input-medgm
            ${LeftIcon ? 'pl-10' : ''}
            ${RightIcon || error ? 'pr-10' : ''}
            ${error ? 'input-error' : ''}
          `}
          {...props}
        />

        {/* Right Icon or Error Icon */}
        {(RightIcon || error) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="w-5 h-5 text-danger" />
            ) : (
              RightIcon && <RightIcon className="w-5 h-5 text-medgm-gray-400" />
            )}
          </div>
        )}
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

export default Input;

/**
 * InputGroup - Grupo de inputs inline
 */
export const InputGroup = ({ children, className = '' }) => (
  <div className={`flex gap-4 ${className}`}>
    {children}
  </div>
);

/**
 * FormRow - Row para formulários com 2 colunas
 */
export const FormRow = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
    {children}
  </div>
);
