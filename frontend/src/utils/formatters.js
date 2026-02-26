/**
 * Arredonda números com regra customizada:
 * - >= 0.6: arredonda para cima
 * - < 0.6: arredonda para baixo
 */
export const customRound = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 0;

  const decimal = value - Math.floor(value);
  if (decimal >= 0.6) {
    return Math.ceil(value);
  }
  return Math.floor(value);
};

/**
 * Formata número com arredondamento customizado
 */
export const formatNumber = (value) => {
  return customRound(value).toLocaleString('pt-BR');
};

/**
 * Formata moeda com arredondamento customizado
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(customRound(value));
};

/**
 * Formata percentual (mantém 1 casa decimal para precisão)
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
};
