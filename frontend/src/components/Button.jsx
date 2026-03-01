import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button - Componente de botão premium MedGM
 * Design System 2026: Clean, elegante, com estados de loading
 *
 * @param {string} variant - Estilo: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - Tamanho: 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Estado de carregamento
 * @param {boolean} disabled - Estado desabilitado
 * @param {React.ReactNode} leftIcon - Ícone à esquerda
 * @param {React.ReactNode} rightIcon - Ícone à direita
 * @param {string} className - Classes Tailwind adicionais
 * @param {React.ReactNode} children - Conteúdo do botão
 * @param {function} onClick - Callback de click
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-lg font-medium
    transition-all duration-200 cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  `.trim();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  const variantClasses = {
    primary: `
      bg-medgm-gold text-white
      hover:bg-medgm-gold/90 hover:shadow-gold-glow
      focus:ring-medgm-gold
      active:scale-[0.98]
    `,
    secondary: `
      bg-medgm-dark text-white
      hover:bg-medgm-black hover:shadow-card-hover
      focus:ring-medgm-dark
      active:scale-[0.98]
    `,
    outline: `
      border-2 border-medgm-gold text-medgm-dark bg-white
      hover:bg-medgm-gold hover:text-white
      focus:ring-medgm-gold
      active:scale-[0.98]
    `,
    ghost: `
      text-medgm-dark bg-transparent
      hover:bg-medgm-gray-100 hover:text-medgm-black
      focus:ring-medgm-gray-300
    `,
    danger: `
      bg-danger text-white
      hover:bg-danger/90 hover:shadow-card-hover
      focus:ring-danger
      active:scale-[0.98]
    `
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && LeftIcon && <LeftIcon className="w-4 h-4" />}

      {children}

      {!loading && RightIcon && <RightIcon className="w-4 h-4" />}
    </button>
  );
};

export default Button;
