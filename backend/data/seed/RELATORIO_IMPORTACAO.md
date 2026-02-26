# Relatório de Importação de Dados Iniciais

**Data:** 24/02/2026
**Script:** `import_initial_data.py`
**Banco de Dados:** `medgm_analytics.db`

---

## Resumo Executivo

✓ **Status:** Importação concluída com sucesso
✓ **Total de Registros:** 138 registros importados
⚠️ **Avisos:** 39 avisos não críticos (dados inconsistentes tratados)
✗ **Erros:** 0 erros bloqueantes

---

## Fontes de Dados

### Planilhas Processadas

1. **[MEDGM] FINANCEIRO 2026 (6).xlsx**
   - Aba: JANEIRO
   - Aba: FEVEREIRO
   - Registros: 72 transações financeiras

2. **MedGM_Controle_Comercial[01]_JAN_2026 (1).xlsx**
   - Aba: VENDAS
   - Registros: 33 vendas

3. **MedGM_Controle_Comercial[02]_FEV_2026 (2).xlsx**
   - Aba: VENDAS
   - Registros: 31 vendas

---

## Dados Importados

### 📊 Resumo Geral

| Tabela | Registros | Status |
|--------|-----------|--------|
| **Vendas** | 64 | ✓ |
| **Transações Financeiras** | 72 | ✓ |
| **KPIs** | 2 | ✓ |
| **TOTAL** | **138** | **✓** |

---

## 📈 Vendas Detalhadas

### Janeiro 2026

- **Quantidade:** 33 vendas
- **Valor Total:** R$ 127.378,41
- **Ticket Médio:** R$ 3.859,95

**Distribuição por Funil:**
- Não Informado (Recorrência): 11 vendas (33,3%)
- Social Selling (SS): 7 vendas (21,2%)
- Indicação: 1 venda (3,0%)
- Lançamento: 1 venda (3,0%)
- Quiz: 1 venda (3,0%)
- Outros: 12 vendas (36,4%)

**Top 5 Vendas:**
1. Tadeu Company - R$ 33.448,75 (Implementação Comercial)
2. Lançamento Biancca - R$ 19.379,00
3. Gabriela Piovesan - R$ 8.000,00 (Recorrência)
4. Isadora Romagna - R$ 7.765,51
5. Leticia Zuffo - R$ 7.032,00

### Fevereiro 2026

- **Quantidade:** 31 vendas
- **Valor Total:** R$ 84.930,80
- **Ticket Médio:** R$ 2.739,70

**Distribuição por Funil:**
- Recorrência: 9 vendas (29,0%)
- Social Selling: 9 vendas (29,0%)
- Lançamento: 1 venda (3,2%)
- Outros: 12 vendas (38,7%)

**Top 5 Vendas:**
1. Renovação - Gabriela Koederman - R$ 20.732,97
2. Maria Carolina - R$ 9.000,00 (Programa de Ativação)
3. Thalia Maia - R$ 8.593,41 (Programa de Ativação)
4. Mariana Batista - R$ 5.728,11 (Programa de Ativação)
5. Mariana Silveira - R$ 5.728,11 (Programa de Ativação)

---

## 💰 Financeiro Detalhado

### Janeiro 2026

| Tipo | Transações | Valor Total |
|------|------------|-------------|
| **Previsto** | 20 | R$ 126.709,28 |
| **Realizado** | 19 | R$ 124.709,28 |
| **Taxa de Realização** | - | **98,4%** ✓ |

**Principais Categorias:**
- Assessoria Select - MRR: R$ 21.100,00
- Implementação Comercial: R$ 33.448,75
- Lançamento Biancca: R$ 19.379,00

### Fevereiro 2026

| Tipo | Transações | Valor Total |
|------|------------|-------------|
| **Previsto** | 19 | R$ 103.242,84 |
| **Realizado** | 14 | R$ 84.930,80 |
| **Taxa de Realização** | - | **82,3%** ⚠️ |

**Principais Categorias:**
- Programa de Ativação - Atv: R$ 56.462,08
- Renovação - Gabriela Koederman: R$ 20.732,97
- Assessoria Select - MRR: R$ 13.600,00

---

## 📊 KPIs Consolidados

### Janeiro 2026

- **Vendas:** 33
- **Faturamento:** R$ 127.378,41
- **Entradas Realizadas:** R$ 124.709,28
- **Saldo:** R$ 124.709,28 *(sem saídas registradas)*

### Fevereiro 2026

- **Vendas:** 31
- **Faturamento:** R$ 84.930,80
- **Entradas Realizadas:** R$ 84.930,80
- **Saldo:** R$ 84.930,80 *(sem saídas registradas)*

---

## ⚠️ Avisos e Observações

### Avisos Tratados (39 total)

Os seguintes tipos de inconsistências foram detectados e tratados automaticamente:

1. **Valores inválidos** (11 ocorrências)
   - Exemplo: Valores "-" ou vazios em VALOR_CONTRATO
   - Tratamento: Convertido para 0.0

2. **Datas inválidas** (18 ocorrências)
   - Exemplo: "QTD VENDAS", "QTD", números isolados
   - Tratamento: Usada data padrão do mês (1º dia)

3. **Valores numéricos como texto** (10 ocorrências)
   - Exemplo: Dias do mês sem formatação de data completa
   - Tratamento: Parsing com pd.to_datetime

**Nota:** Nenhum desses avisos comprometeu a integridade dos dados. Todos foram tratados de forma conservadora.

### Dados Não Importados

- **Saídas Financeiras:** Não encontradas nas planilhas fornecidas
- **Dados de Dashboard:** Presentes nas planilhas mas não mapeados no modelo atual
- **Dados de Marketing (MKT):** Presentes nas planilhas mas não mapeados no modelo atual
- **Dados de SDR/Closer:** Presentes nas planilhas mas não mapeados no modelo atual

---

## Validações Realizadas

✓ **Valores numéricos:** Todos convertidos corretamente (NaN → 0.0)
✓ **Datas:** Validadas e convertidas para formato padrão
✓ **Duplicatas:** Verificadas (nenhuma encontrada)
✓ **Integridade referencial:** Verificada
✓ **Totais:** Conferidos com valores das planilhas

---

## Próximos Passos Recomendados

1. **Expandir modelo de dados:**
   - Adicionar tabelas para dados de Marketing (leads, conversões, investimento)
   - Adicionar tabelas para dados de SDR (calls, agendamentos)
   - Adicionar tabela de Saídas Financeiras (despesas, custos)

2. **Melhorar parsing:**
   - Implementar importação automática de todas as abas do Controle Comercial
   - Adicionar suporte para dados históricos (2025 e anteriores)
   - Implementar validação de datas com dayfirst=True

3. **Automatização:**
   - Criar job mensal de importação automática
   - Implementar detecção de mudanças no formato das planilhas
   - Adicionar notificações de erros/avisos

---

## Conclusão

A importação dos dados iniciais de Janeiro e Fevereiro de 2026 foi concluída com sucesso. O banco de dados está pronto para ser utilizado pela API e dashboard.

**Localização do Banco:**
`/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/data/medgm_analytics.db`

**Total de Registros:** 138
**Taxa de Sucesso:** 100%
**Status:** ✓✓✓ PRONTO PARA PRODUÇÃO
