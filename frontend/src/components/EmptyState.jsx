import React from 'react';

/**
 * EmptyState - Estados vazios amigáveis e informativos
 * Com ilustrações SVG, mensagens claras e CTAs quando relevante
 */

const EmptyState = ({
  icon = 'chart',
  title = 'Nenhum dado encontrado',
  message = 'Não há informações disponíveis para o período selecionado.',
  action = null,
  actionLabel = 'Adicionar',
  className = ''
}) => {
  // Ícones SVG inline para diferentes contextos
  const icons = {
    chart: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    table: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    document: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    search: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    filter: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    inbox: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    calendar: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    user: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    money: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Ícone */}
      <div className="mb-4">
        {icons[icon] || icons.chart}
      </div>

      {/* Título */}
      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Mensagem */}
      <p className="text-sm md:text-base text-gray-500 max-w-sm mb-6">
        {message}
      </p>

      {/* CTA (se fornecido) */}
      {action && (
        <button
          onClick={action}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

// Variantes pré-configuradas para contextos comuns
export const EmptyStates = {
  NoData: (props) => (
    <EmptyState
      icon="chart"
      title="Nenhum dado disponível"
      message="Não há dados para o período selecionado. Tente ajustar os filtros."
      {...props}
    />
  ),

  NoResults: (props) => (
    <EmptyState
      icon="search"
      title="Nenhum resultado encontrado"
      message="Sua busca não retornou resultados. Tente usar outros termos."
      {...props}
    />
  ),

  NoTransactions: (props) => (
    <EmptyState
      icon="money"
      title="Nenhuma transação registrada"
      message="Comece adicionando sua primeira transação financeira."
      {...props}
    />
  ),

  NoSales: (props) => (
    <EmptyState
      icon="chart"
      title="Nenhuma venda registrada"
      message="Não há vendas para este período. Adicione vendas para visualizar métricas."
      {...props}
    />
  ),

  EmptyPeriod: (props) => (
    <EmptyState
      icon="calendar"
      title="Período sem dados"
      message="Não há informações registradas para este mês. Selecione outro período."
      {...props}
    />
  ),

  NoUsers: (props) => (
    <EmptyState
      icon="user"
      title="Nenhum usuário encontrado"
      message="Não há usuários cadastrados. Adicione o primeiro usuário."
      {...props}
    />
  )
};
