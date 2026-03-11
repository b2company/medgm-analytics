# Lista Completa de Problemas - MedGM Analytics
**Data:** 26/02/2026 14:15
**Reportado por:** Davi Feitosa

---

## 🔴 PROBLEMAS CRÍTICOS (Frontend não mostra dados corretos)

### 1. Visão Geral - Janeiro Zerado
**Problema:** Quando clica em Janeiro, todas as métricas ficam zeradas
**Status:** ⏳ PENDENTE
**Causa:** Não investigada ainda
**Prioridade:** 🔴 ALTA

---

### 2. Aba Vendas - Janeiro Vazio
**Problema:** Janeiro não consta nenhuma venda, está tudo em branco
**Status:** ⚠️ INVESTIGADO
**Causa:** API retorna 16 vendas, problema é no frontend
**API:** `GET /metrics/vendas?mes=1&ano=2026` → 16 vendas ✅
**Prioridade:** 🔴 ALTA

---

### 3. Aba Metas - Jessica e Fernando com "-"
**Problema:**
```
Jessica Leopoldino | Social Selling | -
Fernando Dutra     | SDR            | -
```
**Status:** ⚠️ INVESTIGADO
**Causa:** Frontend não sabe exibir múltiplas metas (ativações + leads / reuniões)
**API:** Jessica tem `meta_ativacoes: 10000, meta_leads: 50` ✅
**API:** Fernando tem `meta_reunioes: 60` ✅
**Prioridade:** 🔴 ALTA

---

### 4. Aba Closer (Fevereiro) - Faturamento Líquido e Ticket Médio Zerados
**Problema:** KPIs principais mostram R$ 0,00 para faturamento líquido e ticket médio
**Status:** ⏳ PENDENTE
**Causa:** Não investigada ainda
**Banco:** Faturamento líquido R$ 46.231,46 ✅
**Prioridade:** 🔴 ALTA

---

### 5. Aba Closer - Faturamento Realizado por Semana Vazio
**Problema:** Gráfico/tabela de faturamento semanal está em branco
**Status:** ⏳ PENDENTE
**Prioridade:** 🟡 MÉDIA

---

## 🟡 PROBLEMAS DE UX (Dados corretos, mas confusos)

### 6. Aba SDR - Meta não aparece nos KPIs
**Problema:** Em "Reuniões Realizadas" (KPIs de cima), não está puxando a meta do SDR
**Status:** ⏳ PENDENTE
**Nota:** Também afeta "Progresso Acumulado vs Meta"
**Prioridade:** 🟡 MÉDIA

---

### 7. Aba SDR - Nomes dos gráficos não sugestivos
**Problema:** "Progresso Acumulado vs Meta" não diz de que é o progresso
**Sugestão:** "Progresso Acumulado vs Meta de Reuniões"
**Status:** ⏳ PENDENTE
**Prioridade:** 🟢 BAIXA

---

### 8. Aba Financeiro (Fevereiro) - Métricas duplicadas/confusas
**Problema:**
- "Total Previsto" e "Total Pago" são métricas separadas?
- "Total Pago" e "Faturamento Bruto" não são a mesma coisa?
- Faturamento Bruto não aparece

**Status:** ⏳ PENDENTE
**Prioridade:** 🟡 MÉDIA

---

## 🔴 PROBLEMAS NA ABA FINANCEIRO

### 9. Seção "Vendas do Mês" - Valores Incorretos
**Problema:**
- **Valor Líquido** aparece como "Valor Bruto" (primeira coluna)
- **Valor Bruto** não aparece (deveria ser segunda coluna)
- **Produto** em branco
- **Closer** em branco

**Exemplo atual:**
```
Data       | Cliente            | Valor (col 1) | Valor (col 2)
27/02/2026 | Julia Vaconcelos   | R$ 0,00       | R$ 0,00
23/02/2026 | Gabriela Mello     | R$ 5.728,11   | R$ 0,00  ← LÍQUIDO aparece como BRUTO
```

**Esperado:**
```
Data       | Cliente            | Closer        | Produto              | Valor Bruto   | Valor Líquido
27/02/2026 | Julia Vaconcelos   | --            | Assessoria Start     | R$ 0,00       | R$ 0,00
23/02/2026 | Gabriela Mello     | Monã Garcia   | Programa de Ativação | R$ 6.000,00   | R$ 5.728,11
```

**Status:** ⏳ PENDENTE
**Banco:** `vendas` table tem todos campos preenchidos ✅
**Prioridade:** 🔴 ALTA

---

### 10. Seção "Entradas" - Mostra apenas consolidado
**Problema:**
- Aparece só "Receita Consolidada 2/2026 | R$ 87.930,80"
- **Usuário quer:** Ver vendas individuais na seção de Entradas (não na seção "Vendas do Mês")

**Status:** ⏳ PENDENTE
**Prioridade:** 🟡 MÉDIA (depende do que usuário prefere)

---

### 11. Seção "Saídas" - Falta Tipo e Centro de Custo
**Problema:** Colunas "Tipo" e "Centro de Custo" não aparecem nas saídas

**Exemplo atual:**
```
Data       | Descrição          | Valor         | Ações
15/02/2026 | Salário João       | R$ 5.000,00   | Editar Deletar
```

**Esperado:**
```
Data       | Descrição          | Tipo        | Centro Custo  | Valor         | Ações
15/02/2026 | Salário João       | Operacional | RH            | R$ 5.000,00   | Editar Deletar
```

**Status:** ⏳ PENDENTE
**Banco:** `financeiro` table tem `tipo_custo` e `centro_custo` ✅
**Prioridade:** 🔴 ALTA

---

### 12. Aba Financeiro (Janeiro) - Mesmos problemas
**Problema:** Janeiro tem os mesmos problemas de Fevereiro:
- Entradas não aparecem (apenas consolidado)
- Saídas sem tipo e centro de custo

**Status:** ⏳ PENDENTE
**Prioridade:** 🔴 ALTA

---

## 📊 RESUMO POR PRIORIDADE

### 🔴 ALTA (9 problemas)
1. Visão Geral - Janeiro zerado
2. Aba Vendas - Janeiro vazio
3. Aba Metas - Jessica/Fernando com "-"
4. Closer Fev - Faturamento líquido zerado
5. Financeiro - Vendas (bruto/líquido/closer/produto)
6. Financeiro - Saídas (tipo/centro custo) Fev
7. Financeiro - Saídas (tipo/centro custo) Jan
8. Financeiro - Entradas Jan não aparecem

### 🟡 MÉDIA (3 problemas)
9. SDR - Meta não aparece nos KPIs
10. Closer - Faturamento semanal vazio
11. Financeiro - Métricas duplicadas/confusas
12. Financeiro - Entradas individuais vs consolidado

### 🟢 BAIXA (1 problema)
13. SDR - Nomes dos gráficos não sugestivos

---

## 🎯 PLANO DE AÇÃO SUGERIDO

### Fase 1: Corrigir Dados Visíveis (Prioridade ALTA)
1. ✅ Vendas importadas (FEITO)
2. ✅ Closer Jan/Fev importados (FEITO)
3. ⏳ Corrigir exibição Vendas Janeiro
4. ⏳ Corrigir exibição Metas (Jessica/Fernando)
5. ⏳ Corrigir Financeiro (colunas saídas)
6. ⏳ Corrigir Financeiro (vendas bruto/líquido)

### Fase 2: Importar Planilhas Restantes
7. ⏳ SDR Janeiro (meta)
8. ⏳ SDR Fevereiro (meta)
9. ⏳ Saídas com tipo/centro (se precisar)

### Fase 3: Ajustes de UX (Prioridade MÉDIA/BAIXA)
10. ⏳ SDR - Puxar meta nos KPIs
11. ⏳ Renomear gráficos
12. ⏳ Ajustar métricas Financeiro

---

## 📝 PLANILHAS PENDENTES

- [ ] SDR Janeiro (com metas)
- [ ] SDR Fevereiro (com metas)
- [ ] Saídas Financeiro (com tipo e centro de custo) ?

---

**Última atualização:** 26/02/2026 14:15
**Próxima ação:** Aguardando decisão de prioridade do usuário
