import React from 'react';
import {
  BarChart3,
  Table,
  FileText,
  Search,
  Filter,
  Inbox,
  Calendar,
  Users,
  DollarSign,
  Plus
} from 'lucide-react';
import Button from './Button';

/**
 * EmptyState - Estados vazios premium MedGM 2026
 * Com ícones Lucide, mensagens claras e CTAs
 *
 * @param {string} iconName - Nome do ícone: 'chart' | 'table' | 'document' | 'search' | 'filter' | 'inbox' | 'calendar' | 'user' | 'money'
 * @param {string} title - Título principal
 * @param {string} message - Mensagem descritiva
 * @param {function} action - Callback do botão de ação
 * @param {string} actionLabel - Label do botão
 * @param {string} variant - Estilo: 'default' | 'gold'
 * @param {string} className - Classes adicionais
 */
const EmptyState = ({
  iconName = 'chart',
  title = 'Nenhum dado encontrado',
  message = 'Não há informações disponíveis para o período selecionado.',
  action = null,
  actionLabel = 'Adicionar',
  variant = 'default',
  className = ''
}) => {
  // Mapeamento de ícones Lucide
  const iconMap = {
    chart: BarChart3,
    table: Table,
    document: FileText,
    search: Search,
    filter: Filter,
    inbox: Inbox,
    calendar: Calendar,
    user: Users,
    money: DollarSign
  };

  const Icon = iconMap[iconName] || BarChart3;

  const variantClasses = {
    default: 'text-medgm-gray-300',
    gold: 'text-medgm-gold/30'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Ícone */}
      <div className={`mb-6 ${variantClasses[variant]}`}>
        <Icon className="w-20 h-20 md:w-24 md:h-24" strokeWidth={1.5} />
      </div>

      {/* Título */}
      <h3 className="text-lg md:text-xl font-semibold text-medgm-black mb-2">
        {title}
      </h3>

      {/* Mensagem */}
      <p className="text-sm md:text-base text-medgm-gray-600 max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      {/* CTA (se fornecido) */}
      {action && (
        <Button
          variant="primary"
          onClick={action}
          leftIcon={Plus}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

/**
 * Variantes pré-configuradas para contextos comuns
 */
export const EmptyStates = {
  NoData: (props) => (
    <EmptyState
      iconName="chart"
      title="Nenhum dado disponível"
      message="Não há dados para o período selecionado. Tente ajustar os filtros."
      {...props}
    />
  ),

  NoResults: (props) => (
    <EmptyState
      iconName="search"
      title="Nenhum resultado encontrado"
      message="Sua busca não retornou resultados. Tente usar outros termos."
      {...props}
    />
  ),

  NoTransactions: (props) => (
    <EmptyState
      iconName="money"
      title="Nenhuma transação registrada"
      message="Comece adicionando sua primeira transação financeira."
      actionLabel="Nova transação"
      {...props}
    />
  ),

  NoSales: (props) => (
    <EmptyState
      iconName="chart"
      title="Nenhuma venda registrada"
      message="Não há vendas para este período. Adicione vendas para visualizar métricas."
      actionLabel="Nova venda"
      {...props}
    />
  ),

  EmptyPeriod: (props) => (
    <EmptyState
      iconName="calendar"
      title="Período sem dados"
      message="Não há informações registradas para este mês. Selecione outro período."
      {...props}
    />
  ),

  NoUsers: (props) => (
    <EmptyState
      iconName="user"
      title="Nenhuma pessoa encontrada"
      message="Não há pessoas cadastradas. Adicione a primeira pessoa ao sistema."
      actionLabel="Nova pessoa"
      {...props}
    />
  ),

  EmptyTable: (props) => (
    <EmptyState
      iconName="table"
      title="Tabela vazia"
      message="Não há registros para exibir nesta tabela."
      {...props}
    />
  ),

  NoDocuments: (props) => (
    <EmptyState
      iconName="document"
      title="Nenhum documento"
      message="Não há documentos cadastrados. Faça upload do primeiro documento."
      actionLabel="Fazer upload"
      {...props}
    />
  )
};
