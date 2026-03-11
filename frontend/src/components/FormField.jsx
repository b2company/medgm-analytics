import React from 'react';
import Input from './Input';
import Select from './Select';
import TextArea from './TextArea';
import Checkbox from './Checkbox';
import Radio, { RadioGroup } from './Radio';

/**
 * FormField - Wrapper inteligente que renderiza o campo correto
 * Simplifica a criação de formulários
 *
 * @param {string} type - Tipo: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'password' | 'date'
 * @param {string} label - Label do campo
 * @param {string} name - Nome do campo
 * @param {*} value - Valor atual
 * @param {function} onChange - Callback de mudança
 * @param {string} error - Mensagem de erro
 * @param {Array} options - Opções (para select/radio)
 * @param {boolean} required - Campo obrigatório
 * @param {string} className - Classes adicionais
 */
const FormField = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  error,
  options,
  required = false,
  className = '',
  ...props
}) => {
  // Handler unificado
  const handleChange = (e) => {
    if (type === 'checkbox') {
      onChange(e.target.checked);
    } else if (type === 'radio') {
      onChange(e); // RadioGroup já passa o value
    } else {
      onChange(e.target.value);
    }
  };

  // Renderiza o componente apropriado
  switch (type) {
    case 'select':
      return (
        <Select
          label={label}
          name={name}
          value={value}
          onChange={handleChange}
          error={error}
          options={options || []}
          required={required}
          className={className}
          {...props}
        />
      );

    case 'textarea':
      return (
        <TextArea
          label={label}
          name={name}
          value={value}
          onChange={handleChange}
          error={error}
          required={required}
          className={className}
          {...props}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          label={label}
          name={name}
          checked={value}
          onChange={handleChange}
          className={className}
          {...props}
        />
      );

    case 'radio':
      return (
        <RadioGroup
          label={label}
          name={name}
          value={value}
          onChange={handleChange}
          options={options || []}
          className={className}
          {...props}
        />
      );

    default:
      // text, email, number, password, date, etc
      return (
        <Input
          type={type}
          label={label}
          name={name}
          value={value}
          onChange={handleChange}
          error={error}
          required={required}
          className={className}
          {...props}
        />
      );
  }
};

export default FormField;

/**
 * Form - Wrapper para formulários com onSubmit
 */
export const Form = ({ onSubmit, children, className = '' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
};

/**
 * FormRow - Grid para campos lado a lado
 */
export const FormRow = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
};
