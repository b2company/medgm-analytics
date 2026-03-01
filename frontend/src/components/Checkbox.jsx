import React from 'react';

/**
 * Checkbox - Checkbox premium MedGM 2026
 * Custom styled checkbox com accent gold
 *
 * @param {string} label - Label do checkbox
 * @param {string} description - Descrição adicional
 * @param {boolean} checked - Estado do checkbox
 * @param {function} onChange - Callback de mudança
 * @param {boolean} disabled - Desabilitado
 * @param {string} className - Classes adicionais
 */
const Checkbox = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {/* Checkbox Input */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="
          w-5 h-5 mt-0.5 rounded border-2 border-medgm-gray-300
          text-medgm-gold focus:ring-2 focus:ring-medgm-gold focus:ring-offset-2
          transition-all duration-200 cursor-pointer
          disabled:cursor-not-allowed disabled:opacity-50
        "
        {...props}
      />

      {/* Label & Description */}
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-medgm-black group-hover:text-medgm-gold transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-sm text-medgm-gray-600 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default Checkbox;

/**
 * CheckboxGroup - Grupo de checkboxes
 */
export const CheckboxGroup = ({ label, children, className = '' }) => (
  <div className={className}>
    {label && (
      <p className="label-medgm mb-3">{label}</p>
    )}
    <div className="space-y-3">
      {children}
    </div>
  </div>
);
