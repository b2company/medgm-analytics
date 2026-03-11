# Relatório de Integridade das Métricas - MedGM Analytics

**Data:** 26/02/2026
**Executor:** Claude Code (Chief of Staff)
**Objetivo:** Verificar integridade de todas as métricas calculadas nos dashboards

---

## 1. SOCIAL SELLING

### ✓ Métricas CORRETAS

**Taxa Ativação → Conversão**
- **Fórmula:** `(conversões / ativações) * 100`
- **Localização:** `comercial.py` linha 67, 609, 769
- **Status:** ✓ Calculada corretamente em todos os endpoints
- **Valor Esperado (Jan/2026):** 1.35% (227 conversões / 16.781 ativações)

**Taxa Conversão → Lead**
- **Fórmula:** `(leads_gerados / conversões) * 100`
- **Localização:** `comercial.py` linha 68, 610, 770
- **Status:** ✓ Calculada corretamente
- **Valor Esperado (Jan/2026):** 48.90% (111 leads / 227 conversões)

**Comparação com Meta**
- **Meta Ativações:** 20.000 (Jessica 10k + Artur 10k)
- **Meta Leads:** 80 (Jessica 40 + Artur 40)
- **Realizado Ativações:** 16.781 (83.91% da meta)
- **Realizado Leads:** 111 (138.75% da meta) ✓ BATEU A META!

### ✗ Problema CRÍTICO
**DADOS NÃO IMPORTADOS**
- Total de registros no banco: **0**
- CSVs disponíveis: `social_selling_diario (1).csv` com 42 linhas
- **Ação necessária:** Importar dados dos CSVs para o banco de dados

---

## 2. SDR

### ✓ Métricas CORRETAS

**Taxa Agendamento**
- **Fórmula:** `(reuniões_agendadas / leads_recebidos) * 100`
- **Localização:** `comercial.py` linha 200, 906
- **Status:** ✓ Calculada corretamente
- **Valor Esperado (Jan/2026):** 83.19% (94 agendadas / 113 leads)

**Taxa Comparecimento**
- **Fórmula:** `(reuniões_realizadas / reuniões_agendadas) * 100`
- **Localização:** `comercial.py` linha 201, 907
- **Status:** ✓ Calculada corretamente
- **Valor Esperado (Jan/2026):** 68.09% (64 realizadas / 94 agendadas)

**Comparação com Meta**
- **Meta Reuniões:** 60 (Fernando Dutra)
- **Realizado:** 64 reuniões realizadas
- **% Meta:** 106.67% ✓ BATEU A META!

### ✗ Problema CRÍTICO
**DADOS NÃO IMPORTADOS**
- Total de registros no banco: **0**
- CSVs disponíveis: `sdr_diario (1).csv` com 22 linhas
- **Ação necessária:** Importar dados dos CSVs para o banco de dados

---

## 3. CLOSER

### ✓ Métricas CORRETAS

**Taxa Comparecimento**
- **Fórmula:** `(calls_realizadas / calls_agendadas) * 100`
- **Localização:** `comercial.py` linha 335, 1210
- **Status:** ✓ Calculada corretamente
- **Valor Esperado (Jan/2026):** 71.43% (65 realizadas / 91 agendadas)

**Taxa Conversão**
- **Fórmula:** `(vendas / calls_realizadas) * 100`
- **Localização:** `comercial.py` linha 336, 1211
- **Status:** ✓ Calculada corretamente
- **Valor Esperado (Jan/2026):** 13.85% (9 vendas / 65 calls realizadas)

**Comparação com Meta**
- **Meta Vendas:** 13 (Fabio 12 + Monã 1)
- **Meta Faturamento:** R$ 70.000,00 (Fabio R$ 30k + Monã R$ 40k)
- **Realizado Vendas:** 9 vendas (69.23% da meta)
- **Realizado Faturamento Líquido:** R$ 66.486,72 (94.98% da meta)

### ⚠️ Problema INCONSISTÊNCIA - Ticket Médio

**Linha 337 (create_closer):**
```python
ticket = (item.faturamento_bruto / item.vendas) if item.vendas > 0 else 0
```
- Usa `faturamento_bruto`
- Ticket calculado: R$ 8.555,56 (R$ 77.000 / 9 vendas)

**Linha 1140 (dashboard_closer_diario):**
```python
'ticket_medio': round((total_faturamento_liquido / total_vendas) if total_vendas > 0 else 0, 2)
```
- Usa `faturamento_liquido`
- Ticket calculado: R$ 7.387,41 (R$ 66.486,72 / 9 vendas)

**Diferença:** R$ 1.168,15 por venda

**Recomendação:** PADRONIZAR para usar `faturamento_liquido` em todos os cálculos, pois:
- Reflete o valor real após descontos e impostos
- É o valor que realmente entra no caixa
- É mais útil para análise financeira

**Arquivos a corrigir:**
- `/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/app/routers/comercial.py` (linhas 337, 410)

### ✗ Problema CRÍTICO
**DADOS NÃO IMPORTADOS**
- Total de registros no banco: **0**
- CSVs disponíveis: `closer_diario (1).csv` com 38 linhas
- **Ação necessária:** Importar dados dos CSVs para o banco de dados

---

## 4. FINANCEIRO

### ✓ Métricas CORRETAS

**Total Entradas**
- **Fórmula:** `SUM(valor) WHERE tipo='entrada'`
- **Localização:** `metrics.py` linha 141-152, `demonstrativos.py` linha 211-216
- **Status:** ✓ Query correta

**Total Saídas**
- **Fórmula:** `SUM(valor) WHERE tipo='saida'`
- **Localização:** `metrics.py` linha 154-165, `demonstrativos.py` linha 219-224
- **Status:** ✓ Query correta
- **Valor Atual (Jan/2026):** R$ 329.164,34

**Saldo**
- **Fórmula:** `total_entradas - total_saídas`
- **Localização:** `metrics.py` linha 168
- **Status:** ✓ Cálculo correto
- **Valor Atual (Jan/2026):** -R$ 329.164,34

**Lucro Operacional**
- **Fórmula:** Saldo sem considerar despesas societárias
- **Localização:** Não implementado explicitamente
- **Valor Calculado:** -R$ 160.832,34 (excluindo R$ 168.332,00 de Societário)

### ⚠️ Problema - Cálculo de Runway

**Linha 171 (metrics.py):**
```python
runway = round(saldo / total_saidas, 1) if total_saidas > 0 else 0
```

**Problema:** Usa `total_saidas` do mês, não a média mensal de saídas operacionais.

**Fórmula atual:** `saldo_atual / saidas_do_mes`
- Resultado: -1,0 meses (negativo por estar no prejuízo)

**Fórmula recomendada:** `saldo_atual / media_saidas_operacionais_mensal`
- Excluir: Societário, Investimentos, Pontuais
- Considerar apenas: Fixos e Variáveis recorrentes

**Exemplo de correção:**
```python
# Calcular saídas operacionais recorrentes (excluir Societário, Investimentos)
saidas_operacionais = db.query(func.sum(Financeiro.valor)).filter(
    Financeiro.mes == mes,
    Financeiro.ano == ano,
    Financeiro.tipo == 'saida',
    Financeiro.centro_custo.notin_(['Societário', 'Investimento']),
    Financeiro.tipo_custo.in_(['Fixo', 'Variavel'])
).scalar() or 0

runway = round(saldo / saidas_operacionais, 1) if saidas_operacionais > 0 else 0
```

### ✗ Problema CRÍTICO - Entradas Ausentes

**Situação Atual:**
- Total Entradas no banco: R$ 0,00
- Não há CSV de entradas

**Valor Esperado:**
- Entradas deveriam vir das vendas (Closer)
- Faturamento Líquido das vendas: R$ 66.486,72
- **As vendas (tabela `closer_metricas`) devem gerar entradas na tabela `financeiro`**

**Saldo Esperado (Jan/2026):**
- Entradas: R$ 66.486,72
- Saídas: R$ 329.164,34
- **Saldo Real:** -R$ 262.677,62
- **Saldo no Banco:** -R$ 329.164,34
- **Diferença:** R$ 66.486,72 (exatamente o faturamento das vendas)

**Ação necessária:**
1. Criar trigger ou processo para registrar vendas como entradas em `financeiro`
2. Importar vendas dos CSVs
3. Sincronizar entradas financeiras com vendas realizadas

---

## 5. DRE (Demonstração de Resultado)

### ✓ Métricas CORRETAS

**Receita Líquida**
- **Fórmula:** `receita_bruta - deduções`
- **Localização:** `demonstrativos.py` linha 240
- **Status:** ✓ Correta

**Lucro Bruto**
- **Fórmula:** `receita_liquida - cmv`
- **Localização:** `demonstrativos.py` linha 252
- **Status:** ✓ Correto

**Margem Bruta %**
- **Fórmula:** `(lucro_bruto / receita_liquida) * 100`
- **Localização:** `demonstrativos.py` linha 252
- **Status:** ✓ Correta

**EBITDA**
- **Fórmula:** `lucro_bruto - despesas_operacionais`
- **Localização:** `demonstrativos.py` linha 284
- **Status:** ✓ Correto

**Lucro Líquido**
- **Fórmula:** `ebitda - despesas_financeiras`
- **Localização:** `demonstrativos.py` linha 296
- **Status:** ✓ Correto

**Margem Líquida %**
- **Fórmula:** `(lucro_liquido / receita_liquida) * 100`
- **Localização:** `demonstrativos.py` linha 296
- **Status:** ✓ Correta

### ⚠️ Observação
Todos os cálculos do DRE estão corretos, mas dependem de ter entradas no `financeiro`. Com entradas = R$ 0, todas as margens serão negativas ou zero.

---

## 6. DFC (Demonstração de Fluxo de Caixa)

### ✓ Métricas CORRETAS

**Atividades Operacionais**
- **Recebimento de clientes:** Categorias de receita ✓
- **Pagamento a fornecedores:** Categorias operacionais ✓
- **Pagamento de salários:** Categorias de equipe ✓
- **Impostos pagos:** Categorias tributárias ✓

**Atividades de Investimento**
- **Compra de ativos:** tipo_custo = 'Investimento' ✓

**Atividades de Financiamento**
- **Distribuição de lucros:** centro_custo = 'Societário' ✓
- **Empréstimos:** Categorias financeiras ✓

**Variação de Caixa**
- **Fórmula:** `operacional + investimento + financiamento` ✓

**Saldo Final**
- **Fórmula:** `saldo_inicial + variacao_caixa` ✓

Todas as fórmulas do DFC estão corretas.

---

## RESUMO EXECUTIVO

### ✓ Métricas CORRETAS (11 de 15)

1. ✓ Social Selling - Taxa Ativação → Conversão
2. ✓ Social Selling - Taxa Conversão → Lead
3. ✓ Social Selling - Comparação com meta
4. ✓ SDR - Taxa Agendamento
5. ✓ SDR - Taxa Comparecimento
6. ✓ SDR - Comparação com meta
7. ✓ Closer - Taxa Comparecimento
8. ✓ Closer - Taxa Conversão
9. ✓ Financeiro - Total Entradas (query correta)
10. ✓ Financeiro - Total Saídas
11. ✓ Financeiro - Saldo

### ✗ Problemas CRÍTICOS (3)

1. **✗ DADOS COMERCIAIS NÃO IMPORTADOS**
   - Social Selling: 0 registros (esperado: 42)
   - SDR: 0 registros (esperado: 22)
   - Closer: 0 registros (esperado: 38)
   - **Impacto:** Dashboards comerciais não funcionam
   - **Solução:** Executar script de importação dos CSVs

2. **✗ ENTRADAS FINANCEIRAS AUSENTES**
   - Entradas no banco: R$ 0,00
   - Entradas esperadas: R$ 66.486,72 (vendas do Closer)
   - **Impacto:** Saldo financeiro incorreto, DRE e DFC sem receita
   - **Solução:** Criar sincronização entre vendas e entradas financeiras

3. **✗ SINCRONIZAÇÃO VENDAS ↔ FINANCEIRO**
   - Não há processo automático para registrar vendas como entradas
   - **Solução:** Criar trigger ou processo batch

### ⚠️ Problemas MÉDIOS (2)

1. **⚠️ INCONSISTÊNCIA - Ticket Médio do Closer**
   - `create_closer`: usa `faturamento_bruto`
   - `dashboard_closer_diario`: usa `faturamento_liquido`
   - Diferença: R$ 1.168,15 por venda
   - **Solução:** Padronizar para `faturamento_liquido`
   - **Arquivos:** `comercial.py` linhas 337, 410

2. **⚠️ CÁLCULO DE RUNWAY SIMPLIFICADO**
   - Fórmula atual: `saldo / saidas_do_mes`
   - Problema: Não exclui despesas não recorrentes (Societário, Pontuais)
   - **Solução:** Calcular runway baseado em saídas operacionais recorrentes
   - **Arquivo:** `metrics.py` linha 171

---

## AÇÕES RECOMENDADAS

### 1. URGENTE - Importar Dados Comerciais

```bash
# Executar script de importação
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
python import_all_data.py
```

Verificar se o script importa:
- `social_selling_diario (1).csv` → tabela `social_selling_metricas`
- `sdr_diario (1).csv` → tabela `sdr_metricas`
- `closer_diario (1).csv` → tabela `closer_metricas`

### 2. URGENTE - Sincronizar Vendas com Financeiro

Criar processo para registrar vendas como entradas:

```python
# Exemplo de implementação
def sincronizar_venda_financeiro(venda: CloserMetrica):
    """Registra venda como entrada no financeiro"""
    if venda.vendas > 0 and venda.faturamento_liquido > 0:
        entrada = Financeiro(
            tipo='entrada',
            produto='Venda',  # ou buscar produto específico
            valor=venda.faturamento_liquido,
            data=venda.data,
            mes=venda.mes,
            ano=venda.ano,
            previsto_realizado='realizado',
            categoria='Venda',
            descricao=f'Venda {venda.closer} - {venda.funil}'
        )
        db.add(entrada)
        db.commit()
```

### 3. MÉDIO - Corrigir Ticket Médio

**Arquivo:** `/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/app/routers/comercial.py`

**Linha 337:**
```python
# ANTES
ticket = (item.faturamento_bruto / item.vendas) if item.vendas > 0 else 0

# DEPOIS
ticket = (item.faturamento_liquido / item.vendas) if item.vendas > 0 else 0
```

**Linha 410:**
```python
# ANTES
ticket = (item.faturamento_bruto / item.vendas) if item.vendas > 0 else 0

# DEPOIS
ticket = (item.faturamento_liquido / item.vendas) if item.vendas > 0 else 0
```

**Linha 1215:**
```python
# ANTES
dados["total_faturamento"] += m.faturamento_bruto

# DEPOIS
dados["total_faturamento"] += m.faturamento_liquido
```

### 4. MÉDIO - Corrigir Cálculo de Runway

**Arquivo:** `/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/app/routers/metrics.py`

**Linha 171:**
```python
# ANTES
runway = round(saldo / total_saidas, 1) if total_saidas > 0 else 0

# DEPOIS
# Calcular saídas operacionais recorrentes
saidas_operacionais = db.query(
    func.sum(Financeiro.valor)
).filter(
    Financeiro.mes == mes,
    Financeiro.ano == ano,
    Financeiro.tipo == 'saida',
    Financeiro.centro_custo.notin_(['Societário']),
    Financeiro.tipo_custo.in_(['Fixo', 'Variavel'])
).scalar() or 0

runway = round(saldo / saidas_operacionais, 1) if saidas_operacionais > 0 else 0
```

---

## VALIDAÇÃO FINAL

Após implementar as correções, validar com:

```bash
# 1. Verificar importação de dados
sqlite3 data/medgm_analytics.db "
SELECT
  'Social Selling' as tabela, COUNT(*) as registros
FROM social_selling_metricas WHERE mes=1 AND ano=2026
UNION ALL
SELECT 'SDR', COUNT(*) FROM sdr_metricas WHERE mes=1 AND ano=2026
UNION ALL
SELECT 'Closer', COUNT(*) FROM closer_metricas WHERE mes=1 AND ano=2026
UNION ALL
SELECT 'Entradas', COUNT(*) FROM financeiro WHERE mes=1 AND ano=2026 AND tipo='entrada';
"

# Resultado esperado:
# Social Selling | 42
# SDR | 22
# Closer | 38
# Entradas | 9 (uma para cada venda)

# 2. Verificar totais financeiros
sqlite3 data/medgm_analytics.db "
SELECT
  tipo,
  SUM(valor) as total,
  COUNT(*) as qtd
FROM financeiro
WHERE mes=1 AND ano=2026
GROUP BY tipo;
"

# Resultado esperado:
# entrada | 66486.72 | 9
# saida | 329164.34 | 64

# 3. Testar endpoint de métricas
curl http://localhost:8000/api/comercial/dashboard/social-selling?mes=1&ano=2026

# Deve retornar:
# - ativacoes: 16781
# - conversoes: 227
# - leads: 111
# - tx_ativ_conv: 1.35
# - tx_conv_lead: 48.90
```

---

**FIM DO RELATÓRIO**
