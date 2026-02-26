# Scripts de Importação de Dados

Esta pasta contém scripts para popular o banco de dados da MedGM Analytics com dados iniciais das planilhas Excel.

## Arquivos

### `import_initial_data.py`
Script principal de importação de dados.

**Funcionalidades:**
- Importa vendas do Controle Comercial (Janeiro e Fevereiro 2026)
- Importa transações financeiras (Entradas previstas e realizadas)
- Calcula e armazena KPIs consolidados mensalmente
- Validação automática de dados (números, datas, duplicatas)
- Log detalhado de operações, avisos e erros
- Relatório final de importação

**Como executar:**
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
python3 data/seed/import_initial_data.py
```

**Pré-requisitos:**
- Planilhas Excel no diretório `/Users/odavi.feitosa/Downloads/`:
  - `[MEDGM] FINANCEIRO 2026 (6).xlsx`
  - `MedGM_Controle_Comercial[01]_JAN_2026 (1).xlsx`
  - `MedGM_Controle_Comercial[02]_FEV_2026 (2).xlsx`

**Saída:**
- Banco de dados SQLite populado em `../medgm_analytics.db`
- Logs no console com timestamp e nível (INFO/WARNING/ERROR)
- Relatório final com estatísticas

---

### `check_data.py`
Script de verificação rápida dos dados.

**Funcionalidades:**
- Verifica contagem de registros em todas as tabelas
- Exibe KPIs resumidos por mês
- Status geral do banco de dados

**Como executar:**
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
python3 data/seed/check_data.py
```

**Saída exemplo:**
```
============================================================
VERIFICAÇÃO RÁPIDA DO BANCO DE DADOS
============================================================

📊 Total de Registros:
  • Vendas: 64
  • Financeiro: 72
  • KPIs: 2
  • TOTAL: 138

📈 KPIs por Mês:
  • Jan/2026: 33 vendas | R$ 127,378.41 faturamento
  • Fev/2026: 31 vendas | R$ 84,930.80 faturamento

✓ Banco de dados está populado e funcional
```

---

### `RELATORIO_IMPORTACAO.md`
Relatório detalhado da última importação realizada.

**Conteúdo:**
- Resumo executivo com status e estatísticas
- Fontes de dados processadas
- Dados importados por tabela
- Análise detalhada de vendas (valor, ticket médio, distribuição)
- Análise financeira (previsto vs realizado)
- KPIs consolidados
- Avisos e observações
- Validações realizadas
- Recomendações de próximos passos

---

## Workflow Recomendado

### Primeira Importação
```bash
# 1. Garantir que as planilhas estão no diretório correto
ls /Users/odavi.feitosa/Downloads/*MEDGM*.xlsx

# 2. Executar importação
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
python3 data/seed/import_initial_data.py

# 3. Verificar dados importados
python3 data/seed/check_data.py

# 4. Revisar relatório detalhado
cat data/seed/RELATORIO_IMPORTACAO.md
```

### Re-importação (Limpar e Importar Novamente)
```bash
# 1. Resetar banco de dados
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
python3 -c "from app.database import reset_db; reset_db()"

# 2. Re-importar dados
python3 data/seed/import_initial_data.py

# 3. Verificar
python3 data/seed/check_data.py
```

---

## Validações Implementadas

### Valores Numéricos
- Conversão automática de strings para float
- Tratamento de NaN/Inf → 0.0
- Valores inválidos geram avisos mas não bloqueiam importação

### Datas
- Parsing automático de diversos formatos
- Fallback para data padrão do mês (dia 1) se inválida
- Suporte para timestamps do pandas e strings

### Duplicatas
- Verificação automática de registros duplicados
- Não permite inserção de duplicatas

### Logs
- Todas as operações são logadas com timestamp
- Avisos para dados inconsistentes (não bloqueantes)
- Erros para problemas críticos (bloqueantes)

---

## Estrutura dos Dados

### Tabela: `vendas`
- `id`: ID único (auto-increment)
- `data`: Data da venda
- `cliente`: Nome do cliente
- `valor`: Valor da venda (valor líquido ou pago)
- `funil`: Funil de origem (SS, Quiz, Indicação, etc)
- `vendedor`: Nome do closer/vendedor
- `mes`: Mês (1-12)
- `ano`: Ano (2026)
- `created_at`: Timestamp de criação

### Tabela: `financeiro`
- `id`: ID único (auto-increment)
- `tipo`: 'entrada' ou 'saida'
- `categoria`: Categoria da transação (produto + plano)
- `valor`: Valor da transação
- `data`: Data da transação
- `mes`: Mês (1-12)
- `ano`: Ano (2026)
- `previsto_realizado`: 'previsto' ou 'realizado'
- `descricao`: Descrição detalhada
- `created_at`: Timestamp de criação

### Tabela: `kpis`
- `id`: ID único (auto-increment)
- `mes`: Mês (1-12)
- `ano`: Ano (2026)
- `faturamento`: Faturamento total do mês
- `saldo`: Saldo (entradas - saídas)
- `vendas_total`: Quantidade de vendas
- `calls`: Calls realizados (não populado ainda)
- `leads`: Leads gerados (não populado ainda)
- `cac`: CAC calculado (não populado ainda)
- `ltv`: LTV calculado (não populado ainda)
- `runway`: Runway em meses (não populado ainda)
- `created_at`: Timestamp de criação
- `updated_at`: Timestamp de última atualização

---

## Troubleshooting

### Erro: "Planilha não encontrada"
**Solução:** Verificar se os arquivos Excel estão no diretório `/Users/odavi.feitosa/Downloads/` com os nomes exatos.

### Erro: "No module named 'app'"
**Solução:** Executar o script a partir do diretório `backend/`:
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
python3 data/seed/import_initial_data.py
```

### Avisos sobre datas
**Solução:** Avisos de parsing de datas são normais e tratados automaticamente. Apenas indique que algumas datas foram inferidas.

### Banco vazio após importação
**Solução:** Verificar logs de erro no console. Executar `check_data.py` para diagnóstico.

---

## Próximas Melhorias

1. **Importação de dados históricos (2025)**
2. **Importação automática de novas abas** (MKT, SDR, CLOSER, etc)
3. **Suporte para saídas financeiras** (despesas, custos)
4. **Importação incremental** (apenas novos registros)
5. **Agendamento automático** (cron job mensal)
6. **Interface web** para upload de planilhas
7. **Validação avançada** (regras de negócio específicas)

---

**Última atualização:** 24/02/2026
**Autor:** MedGM Analytics Team
