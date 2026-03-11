# Dashboard Executivo V2 - MedGM Analytics

## 📊 O que foi feito

Criado **DashboardGeralExecutivo.jsx** - uma versão completamente reformulada da Visão Geral com foco em:
- Layout executivo compacto e acionável
- Informações críticas em destaque
- Sistema de alertas visuais automáticos
- Performance individual detalhada

---

## 🎯 Estrutura do Novo Dashboard

### 1. **CABEÇALHO**
```
┌─────────────────────────────────────────────────────┐
│  MEDGM    MARÇO 2026              11/03 • 14:32     │
└─────────────────────────────────────────────────────┘
```
- Logo + mês/ano
- Data e hora atual

### 2. **TOPO EXECUTIVO - 4 KPIs em linha**
```
┌──────────┬──────────┬──────────┬──────────┐
│  FAT.    │  VENDAS  │  REUN.   │  LEADS SS│
│  R$12k   │    2     │   23     │    31    │
│  /R$117k │  /16     │  /85     │   /90    │
│  ██░ 10% │  █░░ 13% │  ██░ 27% │  ███░ 34%│
│  proj.   │  proj.   │          │          │
│  R$33k ⚠ │   6  ⚠   │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

**Cada card mostra:**
- Valor realizado
- Meta (/meta)
- Barra de progresso visual
- Percentual
- Projeção do mês (quando < 50% da meta, mostra ⚠)

**Cores da barra:**
- 🔴 Vermelho: < 20% da meta
- 🟡 Amarelo: 20-49%
- 🔵 Azul: 50-79%
- 🟢 Verde: ≥ 80%

### 3. **CORPO PRINCIPAL - 2 Colunas**

#### **Coluna Esquerda: SOCIAL SELLING**

**[FUNIL SS]**
```
Ativações    4.200
     ↓ 1,0%
Conversões      43
     ↓ 72,1%
Leads           31
```

**[TIME SS]**
Performance individual com:
- Ativações | Conversões | Leads | % Meta
- Barra de progresso colorida

**[TX CONVERSÃO INDIVIDUAL]**
- Taxa de conversão por vendedor (leads/ativações)

#### **Coluna Direita: COMERCIAL (SDR + CLOSER)**

**[FUNIL COMERCIAL]**
```
Leads Recebidos    98
  SS 32 | Quiz 20 | Isca 46
     ↓ 42,9%
Agendadas          42
     ↓ 54,8% ⚠ no-show 45,2%
Realizadas         23
     ↓ 8,7%
Vendas              2
```

**[SDR — Nome do SDR]**
- Leads recebidos hoje
- Reuniões agendadas hoje
- Acumulados do mês
- Tx agendamento e comparecimento
- Breakdown por funil (SS, Isca, Quiz)

**[CLOSERS]**
Performance individual:
- Calls | Vendas | Conv%
- Faturamento realizado / meta
- Barra de progresso
- ⚡ Oportunidades ativas (se houver)

### 4. **RODAPÉ - Performance por Funil de Origem**

Grid 3 colunas:
```
┌─────────────┬─────────────┬─────────────┐
│ SOCIAL      │ ISCA PAGA   │ QUIZ        │
│ SELLING     │             │             │
├─────────────┼─────────────┼─────────────┤
│ Leads: 32   │ Leads: 46   │ Leads: 20   │
│ Real.: 19   │ Real.:  2   │ Real.:  2   │
│ Vendas: 1   │ Vendas: 1   │ Vendas: 0   │
│ Fat.: R$6k  │ Fat.: R$6k  │ Fat.: R$0   │
│ Conv.: 3,1% │ Conv.: 2,2% │ Conv.: 0,0% │
└─────────────┴─────────────┴─────────────┘
```

---

## 🔴 Alertas Visuais Automáticos

O dashboard implementa um sistema inteligente de alertas:

### Ícones
- ⚠ **AlertTriangle (amarelo)**: Usado quando:
  - Projeção < 50% da meta
  - No-show > 40%

- ⚡ **Zap (azul)**: Indica pipeline ativo
  - Mostra oportunidades em andamento que ainda não viraram venda

### Cores de Progresso
- **Vermelho** (bg-red-500): < 20% da meta
- **Amarelo** (bg-yellow-400): 20-49% da meta
- **Azul** (bg-blue-500): 50-79% da meta
- **Verde** (bg-green-500): ≥ 80% da meta

---

## 📡 Dados Necessários do Backend

O componente espera receber de `getDashboardGeral(mes, ano, funilFilter)`:

```javascript
{
  social_selling: {
    kpis: {
      ativacoes: { valor, meta, perc },
      conversoes: { valor, meta, perc },
      leads: { valor, meta, perc }
    },
    por_vendedor: [
      {
        vendedor: "Jessica L.",
        ativacoes: 386,
        conversoes: 7,
        leads: 27,
        meta: 50,
        perc: 54
      }
    ]
  },

  comercial: {
    kpis: {
      leads: { valor, meta, perc },
      reunioes_agendadas: { valor, meta, perc },
      reunioes_realizadas: { valor, meta, perc },
      vendas: { valor, meta, perc },
      faturamento: { valor, meta, perc }
    },
    por_pessoa: [
      {
        pessoa: "Fernando Dutra",
        area: "SDR",  // ou "Closer"
        realizado: 23,
        meta: 85,
        perc: 27.1,
        metrica: "Reuniões Realizadas",
        calls: 13,          // para Closers
        vendas: 0,          // para Closers
        tx_conversao: 0,    // para Closers
        pipeline_ativo: 1   // OPCIONAL - mostra ⚡ se > 0
      }
    ]
  },

  projecoes: {
    vendas: {
      realizado: 2,
      meta: 16,
      projecao: 6
    },
    faturamento: {
      realizado: 12000,
      meta: 117000,
      projecao: 33000
    },
    dias_uteis_restantes: 15,
    ritmo_atual: {
      vendas_dia: 0.18,
      faturamento_dia: 1090.91
    },
    ritmo_necessario: {
      vendas_dia: 0.93,
      faturamento_dia: 7000
    }
  },

  funil_origem: {
    ss: {
      leads: 32,
      agendadas: 36,
      realizadas: 19,
      vendas: 1,
      faturamento: 6000,
      tx_comparecimento: 52.8,
      tx_conversao: 3.1
    },
    isca: {
      leads: 46,
      agendadas: 3,
      realizadas: 2,
      vendas: 1,
      faturamento: 6000,
      tx_comparecimento: 66.7,
      tx_conversao: 2.2
    },
    quiz: {
      leads: 20,
      agendadas: 3,
      realizadas: 2,
      vendas: 0,
      faturamento: 0,
      tx_comparecimento: 66.7,
      tx_conversao: 0.0
    }
  }
}
```

---

## 📝 Campos Novos/Opcionais

### 1. **`ativacoes` e `conversoes` no social_selling.por_vendedor**
```javascript
{
  vendedor: "Jessica L.",
  ativacoes: 386,    // NOVO
  conversoes: 7,     // NOVO
  leads: 27,
  meta: 50,
  perc: 54
}
```

### 2. **`pipeline_ativo` nos Closers** (OPCIONAL)
```javascript
{
  pessoa: "Fabio Lima",
  area: "Closer",
  pipeline_ativo: 1  // Se > 0, mostra ⚡ com mensagem
}
```

### 3. **`funil_origem`** (breakdown por origem do lead)
Objeto com chaves: `ss`, `isca`, `quiz`, cada uma com:
- leads, agendadas, realizadas, vendas, faturamento
- tx_comparecimento, tx_conversao

---

## 🚀 Como Usar

### 1. **Desenvolvimento Local**
```bash
cd frontend
npm run dev
```

Acesse: http://localhost:5174/comercial#geral

### 2. **Alternar entre versões**

**Para usar a NOVA versão executiva** (já configurado):
```javascript
// frontend/src/pages/Comercial.jsx
import DashboardGeralExecutivo from './DashboardGeralExecutivo';
```

**Para voltar à versão ANTIGA**:
```javascript
// frontend/src/pages/Comercial.jsx
import DashboardGeral from './DashboardGeral';
```

---

## 🎨 Diferenças Visuais

| Aspecto | Versão Antiga | Versão Executiva |
|---------|--------------|------------------|
| KPIs Topo | 2 linhas × 3 cards | 1 linha × 4 cards compactos |
| Layout | Vertical empilhado | 2 colunas lado a lado |
| Funis | Separados em cards | Integrados com taxas de conversão |
| Time Individual | Só % da meta | Ativ → Conv → Leads + % |
| Alertas | Cores em cards | Ícones ⚠⚡ + cores |
| No-show | Não destacado | Destacado se > 40% |
| Pipeline | Não visível | Mostra oportunidades ativas |
| Funil Origem | Não existia | Rodapé dedicado com 3 funis |

---

## ⚙️ Ajustes no Backend (se necessário)

Se o endpoint `/comercial/dashboard/geral` não retornar todos os dados necessários:

### Adicionar em `social_selling.por_vendedor`:
```python
"ativacoes": vendedor.ativacoes,
"conversoes": vendedor.conversoes
```

### Adicionar em `comercial.por_pessoa` (Closers):
```python
"pipeline_ativo": count_oportunidades_ativas(closer_id)
```

### Criar/ajustar `funil_origem`:
```python
funil_origem = {
    "ss": calcular_metricas_funil("SS", mes, ano),
    "isca": calcular_metricas_funil("Isca", mes, ano),
    "quiz": calcular_metricas_funil("Quiz", mes, ano)
}
```

---

## 📦 Arquivos Modificados

```
frontend/src/pages/
├── DashboardGeralExecutivo.jsx  ← NOVO
├── DashboardGeral.jsx.v1-backup ← BACKUP do original
├── Comercial.jsx                ← Atualizado para usar novo componente
```

---

## ✅ Checklist de Validação

- [x] Componente criado e funcionando
- [x] Integrado no Comercial.jsx
- [x] Layout 2 colunas responsivo
- [x] 4 KPIs compactos no topo
- [x] Funil SS com taxas de conversão
- [x] Time SS individual detalhado
- [x] Funil Comercial com breakdown
- [x] SDR com métricas diárias + acumuladas
- [x] Closers com pipeline ativo
- [x] Rodapé com performance por funil
- [x] Alertas visuais (⚠⚡)
- [x] Sistema de cores por desempenho
- [ ] Backend retornando todos os dados necessários
- [ ] Testado com dados reais
- [ ] Deploy em produção

---

## 🎯 Próximos Passos

1. **Validar estrutura de dados do backend**
   - Verificar se todos os campos estão sendo retornados
   - Adicionar campos faltantes se necessário

2. **Testar com dados reais**
   - Popular banco com dados de março
   - Verificar cálculos de taxas

3. **Ajustes visuais finos**
   - Espaçamentos
   - Cores
   - Responsividade mobile

4. **Deploy**
   - Commit e push
   - Vercel auto-deploy

---

**Criado em:** 11/03/2026
**Autor:** Davi Feitosa + Claude Sonnet 4.5
**Versão:** 2.0 (Executivo)
