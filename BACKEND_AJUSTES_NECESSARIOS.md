# Backend - Ajustes Necessários para Dashboard Executivo V2

## 📋 Análise Completa

### ✅ O que JÁ está funcionando

O endpoint `/comercial/dashboard/geral` já retorna:

1. **Social Selling KPIs**
   - ✅ ativacoes (valor, meta, perc)
   - ✅ conversoes (valor, taxa)
   - ✅ leads (valor, meta, perc)

2. **Social Selling por_vendedor**
   - ✅ vendedor (nome)
   - ✅ leads (total)
   - ✅ meta
   - ✅ perc
   - ✅ status

3. **Comercial KPIs**
   - ✅ leads
   - ✅ reunioes_agendadas
   - ✅ reunioes_realizadas
   - ✅ calls_agendadas
   - ✅ calls_realizadas
   - ✅ vendas
   - ✅ faturamento
   - ✅ ticket_medio

4. **Comercial por_pessoa**
   - ✅ pessoa (nome)
   - ✅ area (SDR/Closer)
   - ✅ metrica
   - ✅ realizado
   - ✅ meta
   - ✅ perc
   - ✅ status

5. **Projeções**
   - ✅ vendas (projecao, meta, realizado)
   - ✅ faturamento (projecao, meta, realizado)
   - ✅ dias_uteis_restantes
   - ✅ ritmo_atual e ritmo_necessario

---

### ❌ O que está FALTANDO

#### 1. **`ativacoes` e `conversoes` em `social_selling.por_vendedor`**

**Atual:**
```python
por_vendedor.append({
    "vendedor": v.vendedor,
    "leads": int(v.leads or 0),
    "meta": meta_v,
    "perc": round(perc_v, 1),
    "status": "..."
})
```

**Necessário:**
```python
por_vendedor.append({
    "vendedor": v.vendedor,
    "ativacoes": int(v.ativacoes or 0),     # FALTA
    "conversoes": int(v.conversoes or 0),   # FALTA
    "leads": int(v.leads or 0),
    "meta": meta_v,
    "perc": round(perc_v, 1),
    "status": "..."
})
```

**Onde ajustar:** Linha ~1758

---

#### 2. **`calls`, `vendas`, `tx_conversao` nos Closers individuais**

**Atual:**
```python
por_pessoa.append({
    "pessoa": c.closer,
    "area": "Closer",
    "metrica": "Faturamento",
    "realizado": int(c.faturamento or 0),
    "meta": int(meta_fat),
    "perc": round(perc_c, 1),
    "status": "..."
})
```

**Necessário:**
```python
por_pessoa.append({
    "pessoa": c.closer,
    "area": "Closer",
    "metrica": "Faturamento",
    "realizado": int(c.faturamento or 0),
    "meta": int(meta_fat),
    "perc": round(perc_c, 1),
    "status": "...",
    "calls": int(c.calls_realizadas or 0),        # FALTA
    "vendas": int(c.vendas or 0),                 # FALTA
    "tx_conversao": round(tx_conv_closer, 1)      # FALTA
})
```

**Onde ajustar:** Linha ~1924

---

#### 3. **`pipeline_ativo` nos Closers (OPCIONAL)**

Para mostrar o ícone ⚡ quando há oportunidades ativas.

**Necessário:**
```python
# Query para contar oportunidades ativas por closer
pipeline_ativo = db.query(func.count(Venda.id)).filter(
    Venda.closer == c.closer,
    Venda.status == 'Em Pipeline',  # ou campo similar
    Venda.mes == mes,
    Venda.ano == ano
).scalar() or 0

por_pessoa.append({
    # ... campos existentes ...
    "pipeline_ativo": pipeline_ativo  # FALTA
})
```

**Onde ajustar:** Linha ~1924

---

#### 4. **`funil_origem` - Breakdown por SS/Isca/Quiz**

Este é o **mais importante** - mostra performance por origem do lead no rodapé.

**Necessário adicionar ao return:**
```python
return {
    # ... campos existentes ...
    "funil_origem": {
        "ss": {
            "leads": 32,
            "agendadas": 36,
            "realizadas": 19,
            "vendas": 1,
            "faturamento": 6000.00,
            "tx_comparecimento": 52.8,
            "tx_conversao": 3.1
        },
        "isca": {
            "leads": 46,
            "agendadas": 3,
            "realizadas": 2,
            "vendas": 1,
            "faturamento": 6000.00,
            "tx_comparecimento": 66.7,
            "tx_conversao": 2.2
        },
        "quiz": {
            "leads": 20,
            "agendadas": 3,
            "realizadas": 2,
            "vendas": 0,
            "faturamento": 0.00,
            "tx_comparecimento": 66.7,
            "tx_conversao": 0.0
        }
    }
}
```

**Onde adicionar:** Linha ~2095 (antes do return final)

---

## 🛠️ Implementação das Correções

### Correção 1: Ativações e Conversões por Vendedor

**Localização:** `backend/app/routers/comercial.py` linha ~1758

**Substituir:**
```python
# Por vendedor (Social Selling)
vendedores_ss = db.query(
    SocialSellingMetrica.vendedor,
    func.sum(SocialSellingMetrica.leads_gerados).label('leads')
).filter(
    SocialSellingMetrica.mes == mes,
    SocialSellingMetrica.ano == ano
).group_by(SocialSellingMetrica.vendedor).all()
```

**Por:**
```python
# Por vendedor (Social Selling)
vendedores_ss = db.query(
    SocialSellingMetrica.vendedor,
    func.sum(SocialSellingMetrica.ativacoes).label('ativacoes'),
    func.sum(SocialSellingMetrica.conversoes).label('conversoes'),
    func.sum(SocialSellingMetrica.leads_gerados).label('leads')
).filter(
    SocialSellingMetrica.mes == mes,
    SocialSellingMetrica.ano == ano
).group_by(SocialSellingMetrica.vendedor).all()
```

**E atualizar o append:**
```python
por_vendedor.append({
    "vendedor": v.vendedor,
    "ativacoes": int(v.ativacoes or 0),
    "conversoes": int(v.conversoes or 0),
    "leads": int(v.leads or 0),
    "meta": meta_v,
    "perc": round(perc_v, 1),
    "status": "verde" if perc_v >= 80 else "amarelo" if perc_v >= 40 else "vermelho"
})
```

---

### Correção 2: Calls, Vendas e TX nos Closers

**Localização:** `backend/app/routers/comercial.py` linha ~1924

**Substituir:**
```python
# Closers individuais
closers = db.query(
    CloserMetrica.closer,
    func.sum(CloserMetrica.vendas).label('vendas'),
    func.sum(CloserMetrica.faturamento_bruto).label('faturamento')
).filter(
    CloserMetrica.mes == mes,
    CloserMetrica.ano == ano
)
```

**Por:**
```python
# Closers individuais
closers = db.query(
    CloserMetrica.closer,
    func.sum(CloserMetrica.calls_realizadas).label('calls_realizadas'),
    func.sum(CloserMetrica.vendas).label('vendas'),
    func.sum(CloserMetrica.faturamento_bruto).label('faturamento')
).filter(
    CloserMetrica.mes == mes,
    CloserMetrica.ano == ano
)
```

**E atualizar o append:**
```python
for c in closers:
    meta_closer = next((m for m in metas_closer if m.pessoa and m.pessoa.nome == c.closer), None)
    meta_fat = meta_closer.meta_faturamento or 0 if meta_closer else 0
    perc_c = (c.faturamento / meta_fat * 100) if meta_fat > 0 else 0

    # Calcular tx de conversão do closer
    tx_conv_closer = (c.vendas / c.calls_realizadas * 100) if c.calls_realizadas > 0 else 0

    por_pessoa.append({
        "pessoa": c.closer,
        "area": "Closer",
        "metrica": "Faturamento",
        "realizado": int(c.faturamento or 0),
        "meta": int(meta_fat),
        "perc": round(perc_c, 1),
        "status": "verde" if perc_c >= 80 else "amarelo" if perc_c >= 40 else "vermelho",
        "calls": int(c.calls_realizadas or 0),
        "vendas": int(c.vendas or 0),
        "tx_conversao": round(tx_conv_closer, 1)
    })
```

---

### Correção 3: Pipeline Ativo (OPCIONAL)

**Localização:** Dentro do loop de closers (linha ~1940)

**Adicionar antes do append:**
```python
# Contar oportunidades ativas (vendas em pipeline)
# Assumindo que existe uma tabela Venda ou similar
# Ajustar conforme modelo de dados real
pipeline_ativo = 0  # Placeholder - implementar se houver tabela de vendas em pipeline
```

**E adicionar ao append:**
```python
por_pessoa.append({
    # ... campos existentes ...
    "pipeline_ativo": pipeline_ativo
})
```

---

### Correção 4: Funil por Origem

**Localização:** `backend/app/routers/comercial.py` linha ~2070 (antes do return)

**Adicionar:**
```python
# ========== FUNIL POR ORIGEM ==========

funil_origem = {}

# Lista de funis para processar
funis_lista = ["SS", "Isca", "Quiz"]

for funil_nome in funis_lista:
    # SDR por funil
    sdr_funil = db.query(
        func.sum(SDRMetrica.leads_recebidos).label('leads'),
        func.sum(SDRMetrica.reunioes_agendadas).label('agendadas'),
        func.sum(SDRMetrica.reunioes_realizadas).label('realizadas')
    ).filter(
        SDRMetrica.mes == mes,
        SDRMetrica.ano == ano,
        SDRMetrica.funil == funil_nome
    ).first()

    # Closer por funil
    closer_funil = db.query(
        func.sum(CloserMetrica.vendas).label('vendas'),
        func.sum(CloserMetrica.faturamento_bruto).label('faturamento')
    ).filter(
        CloserMetrica.mes == mes,
        CloserMetrica.ano == ano,
        CloserMetrica.funil == funil_nome
    ).first()

    leads_f = int(sdr_funil.leads or 0) if sdr_funil else 0
    agendadas_f = int(sdr_funil.agendadas or 0) if sdr_funil else 0
    realizadas_f = int(sdr_funil.realizadas or 0) if sdr_funil else 0
    vendas_f = int(closer_funil.vendas or 0) if closer_funil else 0
    faturamento_f = float(closer_funil.faturamento or 0) if closer_funil else 0

    tx_comparecimento_f = (realizadas_f / agendadas_f * 100) if agendadas_f > 0 else 0
    tx_conversao_f = (vendas_f / realizadas_f * 100) if realizadas_f > 0 else 0

    # Mapear nome do funil para chave
    chave = funil_nome.lower()
    if funil_nome == "SS":
        chave = "ss"
    elif funil_nome == "Isca":
        chave = "isca"
    elif funil_nome == "Quiz":
        chave = "quiz"

    funil_origem[chave] = {
        "leads": leads_f,
        "agendadas": agendadas_f,
        "realizadas": realizadas_f,
        "vendas": vendas_f,
        "faturamento": round(faturamento_f, 2),
        "tx_comparecimento": round(tx_comparecimento_f, 1),
        "tx_conversao": round(tx_conversao_f, 1)
    }
```

**E adicionar ao return (linha ~2095):**
```python
return {
    # ... campos existentes ...
    "funil_origem": funil_origem  # ADICIONAR ESTA LINHA
}
```

---

## 📝 Checklist de Implementação

- [ ] Correção 1: Ativações e Conversões por Vendedor
- [ ] Correção 2: Calls, Vendas e TX nos Closers
- [ ] Correção 3: Pipeline Ativo (OPCIONAL)
- [ ] Correção 4: Funil por Origem (IMPORTANTE)
- [ ] Testar endpoint: `GET /comercial/dashboard/geral?mes=3&ano=2026`
- [ ] Verificar estrutura JSON retornada
- [ ] Testar frontend com dados reais
- [ ] Commit e deploy

---

## 🧪 Como Testar

### 1. Testar o endpoint direto

```bash
curl "http://localhost:8000/comercial/dashboard/geral?mes=3&ano=2026" | jq .
```

### 2. Verificar campos específicos

```bash
# Verificar por_vendedor
curl "http://localhost:8000/comercial/dashboard/geral?mes=3&ano=2026" | jq '.social_selling.por_vendedor[0]'

# Verificar closers
curl "http://localhost:8000/comercial/dashboard/geral?mes=3&ano=2026" | jq '.comercial.por_pessoa[] | select(.area=="Closer")'

# Verificar funil_origem
curl "http://localhost:8000/comercial/dashboard/geral?mes=3&ano=2026" | jq '.funil_origem'
```

### 3. Testar no frontend

```bash
cd frontend
npm run dev
```

Acessar: http://localhost:5174/comercial#geral

---

## ⚡ Prioridade

| Correção | Prioridade | Impacto |
|----------|-----------|---------|
| 1. Ativações/Conversões por vendedor | 🟡 Média | Layout SS ficará incompleto |
| 2. Calls/Vendas nos Closers | 🟡 Média | Não mostra detalhes individuais |
| 3. Pipeline Ativo | 🟢 Baixa | Apenas visual (ícone ⚡) |
| 4. Funil por Origem | 🔴 Alta | Rodapé inteiro não funciona |

**Recomendação:** Implementar **Correção 4 primeiro** (funil_origem), pois é a mais crítica.

---

**Próximo passo:** Você quer que eu implemente essas correções no código?
