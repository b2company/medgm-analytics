# Dashboard Financeiro - MedGM Analytics

## Visão Geral

A nova aba **Dashboard** no módulo Financeiro oferece uma visualização profissional e completa das finanças da empresa, com gráficos interativos, KPIs estratégicos e análise detalhada de receitas e despesas.

## Funcionalidades Implementadas

### 1. KPIs Principais (Cards no Topo)

5 cards coloridos com as métricas mais importantes:

- **Receita Total** (verde): Total de entradas do mês atual
- **Despesas Totais** (vermelho): Total de saídas do mês atual
- **Lucro Operacional** (azul/laranja): Receita - Despesas
- **Saldo em Caixa** (roxo): Saldo disponível
- **Margem** (verde-água/amarelo): % de lucro sobre receita

Cada card mostra:
- Ícone representativo
- Valor em destaque
- Label descritivo
- Cores dinâmicas baseadas no valor (positivo/negativo)

### 2. Gráfico de Evolução Mensal

Gráfico combinado (linha + barras) mostrando os últimos 6 meses:

- **Linha Verde**: Receitas ao longo do tempo
- **Linha Vermelha**: Despesas ao longo do tempo
- **Barras Azuis**: Lucro mensal

Características:
- Interativo (hover mostra valores)
- Eixo Y formatado em R$
- Tooltip customizado
- Responsivo

### 3. Breakdown de Despesas

Três visualizações diferentes das despesas:

#### a) Por Categoria (Gráfico de Pizza)
- Visualiza distribuição por categoria de custo
- Cores distintas para cada categoria
- Porcentagens exibidas diretamente no gráfico
- Legend com nomes das categorias

#### b) Por Centro de Custo (Gráfico de Barras Horizontal)
- Operação
- Comercial
- Administrativo
- Diretoria
- Societário

#### c) Por Tipo (Gráfico de Pizza)
- Fixo
- Pontual
- Variável
- Não operacional

### 4. Breakdown de Receitas

Duas visualizações das receitas:

#### a) Por Produto
- Assessoria Select
- Assessoria Start
- Programa de Ativação
- Extra
- Outros

#### b) Por Tipo de Receita
- Recorrência
- Venda
- Renovação
- Lançamento

### 5. MRR vs TCV

Dois cards destacando:

- **MRR (Monthly Recurring Revenue)**: Receita recorrente mensal
- **TCV (Total Contract Value)**: Valor total de contratos

Identificação automática de vendas recorrentes baseada no campo `tipo_receita`.

### 6. Tabela de Transações Financeiras

Tabela completa e interativa com:

**Funcionalidades:**
- Ordenação por qualquer coluna (clique no header)
- Filtro por tipo (Entrada/Saída)
- Paginação (20 itens por página)
- Export para CSV
- Cores dinâmicas (verde para entradas, vermelho para saídas)

**Colunas:**
- Data
- Tipo (badge colorido)
- Categoria
- Descrição
- Centro de Custo
- Valor (formatado e colorido)

**Dados incluídos:**
- Entradas manuais
- Saídas manuais
- Vendas do módulo Comercial (automático)

## Estrutura de Arquivos

```
frontend/src/
├── pages/
│   ├── Financeiro.jsx              # Página principal com abas
│   └── FinanceiroDashboard.jsx     # Novo dashboard (TASK #7)
└── components/
    ├── DataTable.jsx               # Atualizado com paginação
    ├── TransacoesFinanceiras.jsx   # Aba de transações
    └── FinanceiroForm.jsx          # Formulário de transações
```

## Dados Utilizados

O dashboard consome dados de três fontes:

1. **Financeiro Detalhado** (`/metrics/financeiro/detalhado`)
   - Entradas e saídas do mês
   - Saldo atual
   - Totais calculados

2. **Comercial Detalhado** (`/metrics/comercial/detalhado`)
   - Vendas do mês
   - Valores líquidos
   - Produtos e tipos

3. **Fluxo de Caixa** (`/metrics/financeiro/fluxo-caixa`)
   - Histórico dos últimos 6 meses
   - Entradas e saídas mensais
   - Para o gráfico de evolução

## Tecnologias Utilizadas

- **React**: Framework principal
- **Recharts**: Biblioteca de gráficos
- **Tailwind CSS**: Estilização
- **Axios**: Comunicação com API

## Como Acessar

1. Navegue até a aba **Financeiro** no menu principal
2. Selecione a sub-aba **Dashboard** (primeira opção)
3. Use os filtros de mês/ano no topo para navegar entre períodos

## Filtros e Interatividade

### Filtros Globais (Topo da Página)
- **Mês**: Seletor de mês (1-12)
- **Ano**: Seletor de ano (2025-2026)

### Filtros na Tabela
- **Tipo**: Todos / Entradas / Saídas
- **Export CSV**: Baixa todas as transações filtradas

### Interatividade dos Gráficos
- Hover sobre qualquer ponto mostra detalhes
- Valores formatados em R$
- Cores consistentes em todo o dashboard

## Cores do Design System

```javascript
COLORS = {
  receita: '#22c55e',      // Verde
  despesas: '#ef4444',     // Vermelho
  lucro: '#3b82f6',        // Azul
  primary: [               // Paleta para gráficos de pizza/barras
    '#ef4444', '#fb923c', '#facc15', '#84cc16',
    '#22c55e', '#06b6d4', '#3b82f6', '#9333ea',
    '#ec4899', '#9ca3af'
  ]
}
```

## Responsividade

O dashboard é totalmente responsivo:

- **Desktop**: Grid de 5 colunas para KPIs, 3 colunas para breakdown
- **Tablet**: Grid de 2-3 colunas adaptativo
- **Mobile**: Grid de 1 coluna (cards empilhados)

Todos os gráficos usam `ResponsiveContainer` do Recharts.

## Melhorias Futuras (Sugestões)

1. **Filtros Avançados**
   - Range de datas customizado
   - Filtro por centro de custo
   - Filtro por categoria

2. **Comparação de Períodos**
   - Comparar mês atual vs mês anterior
   - Comparar com mesmo mês do ano anterior
   - Exibir variação percentual

3. **Metas e Previsões**
   - Linha de meta no gráfico de evolução
   - Projeção de fechamento do mês
   - Alertas quando abaixo da meta

4. **Drill-down**
   - Clicar em uma categoria abre detalhes
   - Modal com transações específicas
   - Gráficos secundários

5. **Export e Reports**
   - PDF com dashboard completo
   - Excel com todos os dados
   - Agendamento de relatórios

## Observações Importantes

- Os dados de vendas são integrados automaticamente do módulo Comercial
- Vendas recorrentes são identificadas pelo campo `tipo_receita` contendo "recorrência" ou "recorrente"
- O cálculo de margem considera apenas receitas e despesas operacionais
- Despesas societárias (distribuição de lucros) não entram no cálculo de margem operacional
- O saldo em caixa reflete o saldo acumulado até o mês selecionado

## Suporte

Para dúvidas ou problemas, contate o desenvolvedor ou consulte a documentação do projeto.

---

**Desenvolvido para MedGM Analytics**
*Última atualização: 26/02/2026*
