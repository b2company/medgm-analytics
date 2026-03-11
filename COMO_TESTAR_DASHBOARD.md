# Como Testar o Novo Dashboard Financeiro

## Passo a Passo para Validação

### 1. Iniciar o Backend

```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
source venv/bin/activate  # ou venv\Scripts\activate no Windows
python -m uvicorn app.main:app --reload
```

Deve estar rodando em: `http://localhost:8000`

### 2. Iniciar o Frontend

Em outro terminal:

```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/frontend
npm run dev
```

Deve estar rodando em: `http://localhost:5173`

### 3. Navegar até o Dashboard

1. Abra o navegador em `http://localhost:5173`
2. Clique na aba **Financeiro** no menu principal
3. Você deve ver automaticamente a nova sub-aba **Dashboard** (primeira opção)

### 4. Checklist de Validação

#### ✅ KPIs no Topo
- [ ] 5 cards coloridos aparecem no topo
- [ ] Valores estão formatados em R$ (ex: R$ 87.930)
- [ ] Ícones aparecem corretamente (💰, 💸, 📈, 🏦, 📊)
- [ ] Margem está calculada e exibida em % (ex: 3.5%)
- [ ] Cards mudam de cor baseado no valor (positivo = verde/azul, negativo = vermelho/laranja)

#### ✅ Gráfico de Evolução Mensal
- [ ] Gráfico aparece com dados dos últimos 6 meses
- [ ] Linha verde (Receita) está visível
- [ ] Linha vermelha (Despesas) está visível
- [ ] Barras azuis (Lucro) aparecem
- [ ] Hover mostra tooltip com valores
- [ ] Eixo Y mostra valores em R$
- [ ] Eixo X mostra meses (jan/26, fev/26, etc.)

#### ✅ Breakdown de Despesas (3 gráficos)
- [ ] Gráfico de pizza "Por Categoria" aparece
- [ ] Gráfico de barras "Por Centro de Custo" aparece
- [ ] Gráfico de pizza "Por Tipo" aparece
- [ ] Porcentagens aparecem dentro das fatias
- [ ] Legendas aparecem ao lado dos gráficos
- [ ] Hover mostra valores em R$
- [ ] Cores são distintas e legíveis

#### ✅ Breakdown de Receitas (2 gráficos)
- [ ] Gráfico de pizza "Por Produto" aparece
- [ ] Gráfico de pizza "Por Tipo" aparece
- [ ] Vendas estão corretamente categorizadas
- [ ] Valores batem com as vendas do mês

#### ✅ MRR vs TCV
- [ ] 2 cards aparecem lado a lado
- [ ] MRR mostra apenas vendas recorrentes
- [ ] TCV mostra total de todas as vendas
- [ ] Valores estão formatados em R$

#### ✅ Tabela de Transações
- [ ] Tabela carrega com todas as transações
- [ ] Vendas do módulo Comercial aparecem automaticamente
- [ ] Ordenação funciona (clique nos headers)
- [ ] Badges de tipo aparecem coloridos (verde/vermelho)
- [ ] Filtro por tipo funciona (Todos/Entradas/Saídas)
- [ ] Paginação aparece se houver mais de 20 itens
- [ ] Botão "Exportar CSV" funciona
- [ ] Valores em verde para entradas, vermelho para saídas

### 5. Testar Filtros

#### Filtro de Mês/Ano (Topo da Página)
1. Mude o mês para "Janeiro"
   - [ ] Todos os dados atualizam
   - [ ] KPIs mostram valores de janeiro
   - [ ] Gráficos atualizam

2. Mude o ano para "2025" (se houver dados)
   - [ ] Dashboard atualiza corretamente

#### Filtro na Tabela
1. Selecione "Entradas" no filtro
   - [ ] Tabela mostra apenas entradas
   - [ ] Todos os valores são verdes

2. Selecione "Saídas" no filtro
   - [ ] Tabela mostra apenas saídas
   - [ ] Todos os valores são vermelhos

### 6. Testar Export CSV

1. Clique em "Exportar CSV"
   - [ ] Arquivo baixa automaticamente
   - [ ] Nome do arquivo: `transacoes_2_2026.csv` (exemplo)
   - [ ] Arquivo abre no Excel/Google Sheets
   - [ ] Headers estão corretos
   - [ ] Dados estão completos

### 7. Testar Responsividade

#### Desktop (> 1024px)
- [ ] KPIs em 5 colunas
- [ ] Breakdown de despesas em 3 colunas
- [ ] Breakdown de receitas em 2 colunas
- [ ] Tabela com todas as colunas visíveis

#### Tablet (768px - 1024px)
1. Redimensione a janela para ~900px
   - [ ] KPIs se ajustam (2-3 colunas)
   - [ ] Gráficos se ajustam
   - [ ] Tabela permanece scrollable

#### Mobile (< 768px)
1. Redimensione para ~400px
   - [ ] KPIs empilhados (1 coluna)
   - [ ] Gráficos redimensionam corretamente
   - [ ] Tabela horizontal scroll funciona
   - [ ] Paginação mobile aparece (botões Anterior/Próximo)

### 8. Testar Estados de Loading/Erro

#### Loading State
1. Recarregue a página
   - [ ] Skeleton screens aparecem durante loading
   - [ ] Animação de pulse visível
   - [ ] Depois de carregar, skeleton desaparece

#### Sem Dados
1. Selecione um mês sem transações
   - [ ] Mensagens "Sem dados disponíveis" aparecem nos gráficos
   - [ ] Não quebra a interface

### 9. Validar Cálculos

Use os dados de exemplo para verificar:

#### Fevereiro 2026
Com base nos CSVs fornecidos:

**Receitas esperadas:**
- Vendas Programa de Ativação: 6 vendas
- Recorrências: ~9 clientes
- Total vendas: ~R$ 87.930

**Despesas esperadas:**
- Equipe: ~R$ 57.000
- Pró-labore: R$ 20.000
- Outros: ~R$ 10.000
- Total: ~R$ 84.815

**Validações:**
- [ ] Receita Total ≈ R$ 87.930
- [ ] Despesas Totais ≈ R$ 84.815
- [ ] Lucro Operacional ≈ R$ 3.115
- [ ] Margem ≈ 3.5%

### 10. Checklist Final

- [ ] Todas as visualizações carregam sem erro
- [ ] Cores são consistentes e legíveis
- [ ] Tooltips aparecem e funcionam
- [ ] Paginação funciona
- [ ] Ordenação funciona
- [ ] Filtros funcionam
- [ ] Export CSV funciona
- [ ] Responsividade funciona
- [ ] Não há erros no console do navegador
- [ ] Performance é boa (carregamento < 2 segundos)

## Erros Comuns e Soluções

### ❌ Erro: "Cannot read property 'historico' of null"
**Solução**: Backend não está retornando fluxo de caixa. Verifique se o endpoint `/metrics/financeiro/fluxo-caixa` está funcionando.

### ❌ Gráficos não aparecem
**Solução**: Verifique se Recharts está instalado: `npm list recharts`

### ❌ Tabela sem paginação
**Solução**: Certifique-se de que `itemsPerPage={20}` está passado para o DataTable

### ❌ Valores não formatados (ex: 87930.8 ao invés de R$ 87.930)
**Solução**: Verifique se a função `formatCurrency` está sendo chamada corretamente

### ❌ Cores não aparecem nos gráficos
**Solução**: Verifique se o objeto COLORS está definido no topo do arquivo

## Console do Navegador

Abra o DevTools (F12) e verifique:

### ✅ Sem Erros
Não deve haver erros em vermelho no console.

### ✅ Network Tab
- Requests para `/metrics/financeiro/detalhado` - Status 200
- Requests para `/metrics/comercial/detalhado` - Status 200
- Requests para `/metrics/financeiro/fluxo-caixa` - Status 200

### ✅ Performance
- Carregamento inicial < 2 segundos
- Interações responsivas (< 100ms)

## Screenshots de Referência

Se tudo estiver correto, você deve ver:

1. **Topo**: 5 cards coloridos em linha
2. **Meio**: Gráfico grande de evolução com 2 linhas e barras
3. **Abaixo**: 3 gráficos de despesas lado a lado
4. **Abaixo**: 2 gráficos de receitas lado a lado
5. **Abaixo**: 2 cards de MRR e TCV
6. **Final**: Tabela grande com paginação

## Próximo Passo

Após validar tudo acima, está pronto para uso em produção!

Se encontrar algum bug:
1. Anote a mensagem de erro
2. Verifique o console do navegador
3. Verifique o terminal do backend
4. Consulte a documentação em `FINANCEIRO_DASHBOARD.md`

---

**Boa validação!** 🚀
