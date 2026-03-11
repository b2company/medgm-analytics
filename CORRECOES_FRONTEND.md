# Correções Necessárias no Frontend - Comercial
**Data:** 26/02/2026 15:00
**Status:** Backend 100% OK | Frontend com bugs de exibição

---

## ✅ BACKEND VALIDADO (Todas APIs funcionando)

### API: Vendas Janeiro
```bash
GET /metrics/vendas?mes=1&ano=2026
```
**Resposta:** ✅ 14 vendas
**Dados:** cliente, valor, funil, data
**Status:** FUNCIONANDO

---

### API: Closer Diário Fevereiro
```bash
GET /comercial/dashboard/closer-diario?mes=2&ano=2026
```
**Resposta:**
```json
{
  "totais": {
    "calls_agendadas": 66,
    "calls_realizadas": 45,
    "vendas": 8,
    "faturamento_bruto": 48000.0,
    "faturamento_liquido": 46231.46,  ✅ EXISTE
    "ticket_medio": 5778.93,           ✅ EXISTE
    "tx_conversao": 17.78
  }
}
```
**Status:** FUNCIONANDO

---

### API: Metas Fevereiro
```bash
GET /metas/?mes=2&ano=2026
```
**Resposta:**
```json
{
  "metas": [
    {
      "pessoa": {"nome": "Jessica Leopoldino"},
      "meta_ativacoes": 10000,
      "meta_leads": 50,              ✅ EXISTE
      "realizado_leads": 38          ✅ EXISTE
    },
    {
      "pessoa": {"nome": "Fernando Dutra"},
      "meta_reunioes": 60,            ✅ EXISTE
      "realizado_reunioes": 70        ✅ EXISTE
    }
  ]
}
```
**Status:** FUNCIONANDO

---

## 🔴 PROBLEMAS NO FRONTEND (Bugs de exibição)

### 1. Aba Vendas - Janeiro não aparece
**Problema:** Janeiro mostra em branco, mas API tem 14 vendas
**API:** ✅ `/metrics/vendas?mes=1&ano=2026` retorna 14 vendas
**Arquivo:** `/frontend/src/pages/Vendas.jsx` (provavelmente)
**Possível causa:**
- Filtro de mês não está funcionando
- useEffect não dispara ao mudar mês
- Condição de renderização bloqueando exibição

**Como debugar:**
```javascript
useEffect(() => {
  console.log('Mês selecionado:', mesAno);
  fetchVendas();
}, [mesAno]);

const fetchVendas = async () => {
  const response = await fetch(`/metrics/vendas?mes=${mesAno.mes}&ano=${mesAno.ano}`);
  const data = await response.json();
  console.log('Vendas recebidas:', data);
  setVendas(data.vendas);
};
```

---

### 2. Aba Closer (Fev) - Faturamento Líquido e Ticket Médio zerados
**Problema:** KPIs mostram R$ 0,00 mas API retorna valores corretos
**API:** ✅ `faturamento_liquido: 46231.46` e `ticket_medio: 5778.93`
**Arquivo:** `/frontend/src/pages/Closer.jsx`
**Possível causa:**
- Campo errado sendo lido: `dashboardDiario.totais.faturamento_liquido`
- Formatação quebrada (mostra 0 se valor for undefined)
- Condição de renderização bloqueando

**Como corrigir:**
```javascript
// Verificar se está lendo o campo correto
{dashboardDiario?.totais?.faturamento_liquido && (
  <KPICardWithProgress
    title="Faturamento Líquido"
    value={formatCurrency(dashboardDiario.totais.faturamento_liquido)}
  />
)}

// Adicionar log para debug
console.log('Faturamento Líquido:', dashboardDiario?.totais?.faturamento_liquido);
console.log('Ticket Médio:', dashboardDiario?.totais?.ticket_medio);
```

---

### 3. Aba Metas - Jessica e Fernando com "-"
**Problema:** Coluna "Meta" mostra "-" ao invés do valor
**API:** ✅ Jessica tem `meta_leads: 50`, Fernando tem `meta_reunioes: 60`
**Arquivo:** `/frontend/src/pages/Metas.jsx` (ou similar)
**Possível causa:**
- Frontend espera apenas UM campo de meta (ex: `meta_faturamento`)
- Mas Jessica tem múltiplos: `meta_ativacoes` E `meta_leads`
- Fernando tem `meta_reunioes` (diferente dos closers)

**Formato esperado pelo frontend:**
```javascript
// Provavelmente está fazendo:
meta.meta_faturamento || '-'

// Mas deveria fazer:
meta.meta_faturamento ||
meta.meta_leads ||
meta.meta_reunioes ||
meta.meta_ativacoes || '-'
```

**Como corrigir:**
```javascript
// Função helper para exibir meta correta por função
const getMetaDisplay = (meta) => {
  const funcao = meta.pessoa.funcao.toLowerCase();

  if (funcao.includes('closer')) {
    return meta.meta_faturamento
      ? formatCurrency(meta.meta_faturamento)
      : meta.meta_vendas + ' vendas';
  }

  if (funcao.includes('sdr')) {
    return meta.meta_reunioes + ' reuniões';
  }

  if (funcao.includes('social')) {
    return `${meta.meta_ativacoes} ativações / ${meta.meta_leads} leads`;
  }

  return '-';
};

// Usar na renderização
<td>{getMetaDisplay(meta)}</td>
```

---

### 4. Aba SDR - Meta não aparece nos KPIs
**Problema:** Meta do SDR não puxa nos KPIs superiores
**API:** ✅ Metas existem no backend
**Arquivo:** `/frontend/src/pages/SDR.jsx`
**Possível causa:**
- Não está fazendo fetch de `/metas/`
- Não está passando meta como prop para KPICard

**Como corrigir:**
```javascript
// Buscar metas junto com métricas
const [metas, setMetas] = useState([]);

useEffect(() => {
  Promise.all([
    fetch(`/comercial/dashboard/sdr?mes=${mes}&ano=${ano}`),
    fetch(`/metas/?mes=${mes}&ano=${ano}`)
  ]).then(([sdrRes, metasRes]) => {
    const sdrData = await sdrRes.json();
    const metasData = await metasRes.json();

    setDashboard(sdrData);
    setMetas(metasData.metas);
  });
}, [mes, ano]);

// Filtrar meta do Fernando
const metaFernando = metas.find(m =>
  m.pessoa.funcao.toLowerCase().includes('sdr')
);

// Passar para KPI
<KPICardWithProgress
  title="Reuniões Realizadas"
  value={dashboard.totais.reunioes_realizadas}
  meta={metaFernando?.meta_reunioes}
  progress={metaFernando?.perc_atingimento}
/>
```

---

### 5. Aba Closer - Faturamento por Semana Vazio
**Problema:** Gráfico/tabela de faturamento semanal está em branco
**API:** Não há endpoint específico para isso (precisa agregar no frontend)
**Arquivo:** `/frontend/src/pages/Closer.jsx`
**Possível causa:**
- Não está agregando dados_diarios por semana
- Gráfico não está renderizando

**Como corrigir:**
```javascript
// Função para agrupar por semana
const agruparPorSemana = (dadosDiarios) => {
  const semanas = {};

  dadosDiarios.forEach(dia => {
    const data = new Date(dia.data);
    const numSemana = Math.ceil(data.getDate() / 7);
    const chaveSemana = `Semana ${numSemana}`;

    if (!semanas[chaveSemana]) {
      semanas[chaveSemana] = {
        semana: chaveSemana,
        faturamento_bruto: 0,
        faturamento_liquido: 0,
        vendas: 0
      };
    }

    semanas[chaveSemana].faturamento_bruto += dia.faturamento_bruto || 0;
    semanas[chaveSemana].faturamento_liquido += dia.faturamento_liquido || 0;
    semanas[chaveSemana].vendas += dia.vendas || 0;
  });

  return Object.values(semanas);
};

// Usar no gráfico
const dadosSemana = agruparPorSemana(dashboardDiario.dados_diarios);

<BarChart
  data={dadosSemana}
  xKey="semana"
  bars={[
    { key: 'faturamento_bruto', name: 'Faturamento Bruto', color: '#3b82f6' },
    { key: 'faturamento_liquido', name: 'Faturamento Líquido', color: '#10b981' }
  ]}
/>
```

---

## 📋 CHECKLIST DE CORREÇÕES

### Prioridade ALTA
- [ ] Vendas Janeiro não aparece → Verificar `Vendas.jsx` filtro/fetch
- [ ] Closer Fev líquido zerado → Verificar `Closer.jsx` campo `faturamento_liquido`
- [ ] Metas Jessica/Fernando "-" → Criar função `getMetaDisplay()` em `Metas.jsx`

### Prioridade MÉDIA
- [ ] SDR meta não puxa → Adicionar fetch de `/metas/` em `SDR.jsx`
- [ ] Closer faturamento semanal → Criar função `agruparPorSemana()`

### Prioridade BAIXA
- [ ] Renomear gráficos SDR → Adicionar texto descritivo

---

## 🛠️ COMANDOS PARA TESTAR

### Testar APIs manualmente:
```bash
# Vendas Janeiro
curl "http://localhost:8000/metrics/vendas?mes=1&ano=2026" | python3 -m json.tool

# Closer Fevereiro
curl "http://localhost:8000/comercial/dashboard/closer-diario?mes=2&ano=2026" | python3 -m json.tool

# Metas Fevereiro
curl "http://localhost:8000/metas/?mes=2&ano=2026" | python3 -m json.tool
```

### Ver logs do frontend:
```bash
tail -f frontend/frontend.log
```

### Recarregar frontend:
1. Abrir DevTools (F12)
2. Ir na aba Console
3. Procurar por erros React
4. Verificar Network → XHR para ver requisições

---

## 📊 RESUMO

| Problema | Causa | Onde Corrigir | Prioridade |
|----------|-------|---------------|------------|
| Vendas Jan vazio | Filtro/fetch não funciona | `Vendas.jsx` | 🔴 ALTA |
| Closer líquido R$ 0 | Campo errado | `Closer.jsx` linha ~330 | 🔴 ALTA |
| Metas com "-" | Lógica de exibição | `Metas.jsx` | 🔴 ALTA |
| SDR sem meta | Falta fetch | `SDR.jsx` | 🟡 MÉDIA |
| Faturamento semanal | Falta agregação | `Closer.jsx` | 🟡 MÉDIA |

---

**Última atualização:** 26/02/2026 15:00
**Backend:** ✅ 100% funcionando
**Frontend:** ⚠️ Bugs de exibição
