# Checklist de Teste - Dashboard Refatorado

Use este checklist para validar que tudo está funcionando corretamente.

---

## Pré-requisitos

- [ ] Backend rodando: `cd backend && uvicorn app.main:app --reload`
- [ ] Frontend rodando: `cd frontend && npm start`
- [ ] Navegador aberto: `http://localhost:3000`

---

## Dashboard Financeiro

### Cards no Topo
- [ ] Vejo 4 cards: Saldo Atual, Total Entradas, Total Saídas, Margem Líquida
- [ ] Cada card tem badge de comparação com seta ↑ ou ↓
- [ ] Badges verdes para positivo, vermelhos para negativo

### Receita Recorrente
- [ ] Vejo MRR (Receita Mensal Recorrente)
- [ ] Vejo Receita Nova
- [ ] Vejo % Recorrente

### DRE Simplificado
- [ ] Vejo Receita Total
- [ ] Vejo (-) Custos Diretos
- [ ] Vejo (=) Margem Bruta com %
- [ ] Vejo (-) Custos Fixos
- [ ] Vejo (=) Lucro Líquido com %

### Tabela de Entradas
- [ ] Vejo TODAS as entradas do mês
- [ ] Colunas: Data, Categoria, Descrição, Valor
- [ ] Posso clicar no cabeçalho para ordenar
- [ ] Linhas zebradas (alternadas)
- [ ] Rodapé com TOTAL
- [ ] Vejo subtotais por categoria (cards coloridos verdes)

### Tabela de Saídas
- [ ] Vejo TODAS as saídas do mês
- [ ] Colunas: Data, Categoria, Descrição, Valor
- [ ] Posso clicar no cabeçalho para ordenar
- [ ] Linhas zebradas (alternadas)
- [ ] Rodapé com TOTAL
- [ ] Vejo subtotais por categoria (cards coloridos vermelhos)

### Funcionalidades
- [ ] Consigo mudar o mês no filtro
- [ ] Dados atualizam quando mudo o mês
- [ ] Valores em formato R$ X.XXX,XX

---

## Dashboard Comercial

### Cards no Topo
- [ ] Vejo 4 cards: Faturamento Total, Qtd Vendas, Ticket Médio, Melhor Vendedor
- [ ] Cada card tem badge de comparação com seta ↑ ou ↓
- [ ] Nome do melhor vendedor aparece no 4º card

### Banner de Comparação
- [ ] Vejo banner azul com texto tipo "Fev 2026 vs Jan 2026"
- [ ] Badges mostrando variação de vendas e faturamento

### Tabela de Vendas Completa
- [ ] Vejo TODAS as vendas do mês
- [ ] Colunas: Data, Cliente, Valor, Funil/Canal, Vendedor
- [ ] Posso clicar no cabeçalho para ordenar
- [ ] Linhas zebradas
- [ ] Rodapé com TOTAL

### Performance por Vendedor
- [ ] Tabela com: Vendedor, Qtd Vendas, Valor Total, Ticket Médio, % do Total
- [ ] Vendedores ordenados por valor (maior primeiro)
- [ ] Gráfico de barras horizontais abaixo da tabela
- [ ] Barras proporcionais aos valores

### Performance por Canal/Funil
- [ ] Tabela com: Canal, Qtd Vendas, Valor Total, Ticket Médio, % do Total
- [ ] Canais ordenados por valor (maior primeiro)
- [ ] Gráfico de pizza abaixo da tabela
- [ ] Fatias com cores diferentes
- [ ] Percentuais dentro das fatias
- [ ] Legenda abaixo do gráfico

### Funcionalidades
- [ ] Consigo mudar o mês no filtro
- [ ] Dados atualizam quando mudo o mês
- [ ] Valores em formato R$ X.XXX,XX

---

## Dashboard Inteligência

### Alertas Acionáveis
- [ ] Vejo seção de alertas no topo (se houver alertas)
- [ ] Alertas com cores: verde (success), amarelo (warning), azul (info)
- [ ] Mensagens claras e acionáveis
- [ ] Exemplos:
  - "Vendas caíram X% - investigar"
  - "Vendedor X sem vendas - verificar pipeline"
  - "Canal Y com melhor ROI - aumentar investimento"

### CAC por Canal
- [ ] Tabela com: Canal, Investimento MKT, Vendas, Receita, CAC, ROI
- [ ] Valores formatados corretamente
- [ ] Posso ordenar por CAC para ver mais eficiente

### Tendências (Últimos 6 Meses)
- [ ] Vejo 3 gráficos de linha:
  1. Faturamento
  2. Quantidade de Vendas
  3. Ticket Médio
- [ ] Eixo X mostra meses (Jan/2026, Fev/2026, etc)
- [ ] Eixo Y mostra valores
- [ ] Tooltip ao passar mouse sobre os pontos
- [ ] Vejo tabela com dados dos 6 meses abaixo dos gráficos

### Funcionalidades
- [ ] Consigo mudar o mês no filtro (afeta cálculo de alertas)
- [ ] Tendências sempre mostram últimos 6 meses a partir do mês selecionado
- [ ] Valores em formato R$ X.XXX,XX

---

## Testes de Navegação

- [ ] Consigo alternar entre abas: Financeiro, Comercial, Inteligência
- [ ] Cada aba carrega sem erro
- [ ] Loading spinner aparece enquanto carrega
- [ ] Não vejo erros no console do navegador (F12)

---

## Testes de Responsividade

- [ ] Cards se reorganizam em mobile (vertical)
- [ ] Tabelas têm scroll horizontal em telas pequenas
- [ ] Gráficos se adaptam ao tamanho da tela

---

## Testes de Performance

- [ ] Página carrega em menos de 2 segundos
- [ ] Troca de aba é instantânea
- [ ] Ordenação de tabelas é instantânea
- [ ] Sem travamentos ao clicar

---

## Validação de Dados

### Compare com suas planilhas Excel:

#### Financeiro
- [ ] Total de entradas bate com planilha
- [ ] Total de saídas bate com planilha
- [ ] Saldo (entradas - saídas) está correto
- [ ] Categorias estão corretas

#### Comercial
- [ ] Quantidade de vendas bate
- [ ] Faturamento total bate
- [ ] Ticket médio está correto (faturamento / vendas)
- [ ] Vendas estão todas listadas

#### Inteligência
- [ ] CAC faz sentido (custo mkt / vendas)
- [ ] Tendências mostram evolução real

---

## Testes Backend (Opcional)

Se quiser testar os endpoints diretamente:

```bash
cd backend
python3 test_novos_endpoints.py
```

Resultado esperado:
```
✓ PASSOU - Financeiro Detalhado
✓ PASSOU - Comercial Detalhado
✓ PASSOU - Inteligência Detalhado

Total: 3 testes | Passou: 3 | Falhou: 0
```

---

## Problemas Comuns

### Erro "Cannot GET /metrics/financeiro/detalhado"
- **Causa**: Backend não está rodando
- **Solução**: `cd backend && uvicorn app.main:app --reload`

### Tabelas vazias
- **Causa**: Mês selecionado não tem dados
- **Solução**: Selecione mês/ano com dados (ex: Fevereiro 2026)

### Badges não aparecem
- **Causa**: Mês anterior não tem dados para comparar
- **Solução**: Normal para o primeiro mês. Adicione dados no mês anterior.

### Gráficos não renderizam
- **Causa**: Biblioteca recharts não instalada
- **Solução**: `cd frontend && npm install recharts`

### Erros no console
- **Causa**: Diversos
- **Solução**:
  1. Abra console (F12)
  2. Veja o erro completo
  3. Me envie o erro para análise

---

## Após Validar Tudo

Marque abaixo quando terminar:

- [ ] ✓ Testei Dashboard Financeiro - Tudo funcionando
- [ ] ✓ Testei Dashboard Comercial - Tudo funcionando
- [ ] ✓ Testei Dashboard Inteligência - Tudo funcionando
- [ ] ✓ Validei dados vs planilhas - Números batem
- [ ] ✓ Testei em mobile - Responsivo ok
- [ ] ✓ Performance ok - Rápido e fluido

---

## Próximos Passos Após Validação

Se tudo estiver OK:
1. Começar a usar o dashboard no dia a dia
2. Identificar ajustes necessários (categorias, cálculos, etc)
3. Solicitar novas funcionalidades (exportar Excel, filtros, etc)

Se houver problemas:
1. Marcar o item que falhou acima
2. Anotar o erro/comportamento esperado
3. Me enviar para correção

---

**Data**: ___/___/______
**Testado por**: _________________
**Status**: [ ] Aprovado [ ] Com ressalvas [ ] Reprovado
**Observações**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

Boa validação! 🎯
