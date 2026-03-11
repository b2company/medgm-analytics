# Correções Necessárias nos Routers - Módulo Comercial

**Data:** 2026-02-25
**Backend Agent**

---

## Arquivo 1: `/backend/app/routers/metas.py`

### Correção 1: Linhas 76-84 (Função `get_meta_pessoa`)

**ANTES (INCORRETO):**
```python
if not meta:
    # Se nao tem meta cadastrada no mes, retorna meta padrao da pessoa
    return {
        "meta_ativacoes": pessoa.meta_ativacoes or 0,  # ❌ Campo não existe
        "meta_leads": pessoa.meta_leads or 0,          # ❌ Campo não existe
        "meta_reunioes": pessoa.meta_reunioes or 0,    # ❌ Campo não existe
        "meta_vendas": pessoa.meta_vendas or 0,        # ❌ Campo não existe
        "meta_faturamento": pessoa.meta_faturamento or 0  # ❌ Campo não existe
    }
```

**DEPOIS (CORRETO):**
```python
if not meta:
    # Se não tem meta cadastrada no mês, retorna zeros
    # Metas devem ser criadas explicitamente via endpoint /metas/pessoa/{pessoa_id}
    return {
        "meta_ativacoes": 0,
        "meta_leads": 0,
        "meta_reunioes": 0,
        "meta_vendas": 0,
        "meta_faturamento": 0
    }
```

---

### Correção 2: Linhas 86-92 (Função `get_meta_pessoa`)

**ANTES (INCORRETO):**
```python
return {
    "meta_ativacoes": meta.meta_ativacoes or pessoa.meta_ativacoes or 0,  # ❌
    "meta_leads": meta.meta_leads or pessoa.meta_leads or 0,              # ❌
    "meta_reunioes": meta.meta_reunioes or pessoa.meta_reunioes or 0,    # ❌
    "meta_vendas": meta.meta_vendas or pessoa.meta_vendas or 0,          # ❌
    "meta_faturamento": meta.meta_faturamento or pessoa.meta_faturamento or 0  # ❌
}
```

**DEPOIS (CORRETO):**
```python
return {
    "meta_ativacoes": meta.meta_ativacoes or 0,
    "meta_leads": meta.meta_leads or 0,
    "meta_reunioes": meta.meta_reunioes or 0,
    "meta_vendas": meta.meta_vendas or 0,
    "meta_faturamento": meta.meta_faturamento or 0
}
```

---

### Correção 3: Linhas 290-310 (Função `bulk_gerar_metas`)

**ANTES (INCORRETO):**
```python
# Criar nova meta baseada na pessoa
nova_meta = Meta(
    mes=mes,
    ano=ano,
    pessoa_id=pessoa.id,
    tipo="pessoa",
    meta_ativacoes=pessoa.meta_ativacoes,        # ❌ Campo não existe
    meta_leads=pessoa.meta_leads,                # ❌ Campo não existe
    meta_reunioes=pessoa.meta_reunioes,          # ❌ Campo não existe
    meta_vendas=pessoa.meta_vendas,              # ❌ Campo não existe
    meta_faturamento=pessoa.meta_faturamento     # ❌ Campo não existe
)
```

**DEPOIS (CORRETO):**
```python
# Criar nova meta zerada (valores devem ser definidos manualmente ou via endpoint)
# Alternativamente, pode-se copiar metas do mês anterior
meta_anterior = db.query(Meta).filter(
    Meta.pessoa_id == pessoa.id,
    Meta.mes == (mes - 1) if mes > 1 else 12,
    Meta.ano == ano if mes > 1 else ano - 1
).first()

nova_meta = Meta(
    mes=mes,
    ano=ano,
    pessoa_id=pessoa.id,
    tipo="pessoa",
    meta_ativacoes=meta_anterior.meta_ativacoes if meta_anterior else 0,
    meta_leads=meta_anterior.meta_leads if meta_anterior else 0,
    meta_reunioes=meta_anterior.meta_reunioes if meta_anterior else 0,
    meta_vendas=meta_anterior.meta_vendas if meta_anterior else 0,
    meta_faturamento=meta_anterior.meta_faturamento if meta_anterior else 0
)
```

---

### Correção 4: Linhas 322-335 (Função `bulk_gerar_metas`)

**ANTES (INCORRETO):**
```python
# Criar nova meta copiando do mes anterior ou da pessoa
nova_meta = Meta(
    mes=proximo_mes,
    ano=proximo_ano,
    pessoa_id=pessoa.id,
    tipo="pessoa",
    meta_ativacoes=meta_ant.meta_ativacoes,        # OK se meta_ant existe
    meta_leads=meta_ant.meta_leads,                # OK
    meta_reunioes=meta_ant.meta_reunioes,          # OK
    meta_vendas=meta_ant.meta_vendas,              # OK
    meta_faturamento=meta_ant.meta_faturamento     # OK
)
```

**DEPOIS (CORRETO):**
```python
# Esta parte está CORRETA - copia do mês anterior
# Apenas documentar melhor
nova_meta = Meta(
    mes=proximo_mes,
    ano=proximo_ano,
    pessoa_id=pessoa.id,
    tipo="pessoa",
    # Copia valores do mês anterior
    meta_ativacoes=meta_ant.meta_ativacoes or 0,
    meta_leads=meta_ant.meta_leads or 0,
    meta_reunioes=meta_ant.meta_reunioes or 0,
    meta_vendas=meta_ant.meta_vendas or 0,
    meta_faturamento=meta_ant.meta_faturamento or 0
)
```

---

## Arquivo 2: `/backend/app/routers/comercial.py`

### Correção 5: Função `dashboard_social_selling()` - Linhas 469-518

**PROBLEMA:** Tenta acessar `m.meta_ativacoes` e `m.meta_leads` das métricas.

**ANTES (INCORRETO):**
```python
@router.get("/dashboard/social-selling")
async def dashboard_social_selling(mes: int, ano: int, db: Session = Depends(get_db)):
    try:
        metricas = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).all()

        # ... código ...

        total_meta_ativacoes = sum(m.meta_ativacoes for m in metricas)  # ❌
        total_meta_leads = sum(m.meta_leads for m in metricas)          # ❌
```

**DEPOIS (CORRETO):**
```python
@router.get("/dashboard/social-selling")
async def dashboard_social_selling(mes: int, ano: int, db: Session = Depends(get_db)):
    try:
        metricas = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).all()

        # Buscar metas da tabela Meta
        metas_query = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Pessoa.funcao == 'social_selling'
        ).all()

        total_meta_ativacoes = sum(m.meta_ativacoes or 0 for m in metas_query)
        total_meta_leads = sum(m.meta_leads or 0 for m in metas_query)
```

---

### Correção 6: Função `dashboard_sdr()` - Linhas 736-785

**PROBLEMA:** Tenta acessar `m.meta_reunioes` das métricas.

**ANTES (INCORRETO):**
```python
for sdr, lista_metricas in por_sdr.items():
    # ... código ...
    total_meta = sum(m.meta_reunioes for m in lista_metricas)  # ❌
```

**DEPOIS (CORRETO):**
```python
# Buscar metas da tabela Meta por SDR
metas_por_sdr = {}
for sdr in por_sdr.keys():
    pessoa = db.query(Pessoa).filter(Pessoa.nome == sdr).first()
    if pessoa:
        meta = db.query(Meta).filter(
            Meta.pessoa_id == pessoa.id,
            Meta.mes == mes,
            Meta.ano == ano
        ).first()
        metas_por_sdr[sdr] = meta.meta_reunioes if meta else 0
    else:
        metas_por_sdr[sdr] = 0

# Calcular totais por SDR
totais_por_sdr = {}
for sdr, lista_metricas in por_sdr.items():
    # ... código ...
    total_meta = metas_por_sdr.get(sdr, 0)
```

---

### Correção 7: Função `dashboard_closer()` - Linhas 955-1022

**PROBLEMA:** Tenta acessar `m.meta_vendas` e `m.meta_faturamento` das métricas.

**ANTES (INCORRETO):**
```python
por_closer[m.closer]["meta_vendas"] = m.meta_vendas            # ❌
por_closer[m.closer]["meta_faturamento"] = m.meta_faturamento  # ❌
```

**DEPOIS (CORRETO):**
```python
# Buscar metas da tabela Meta por Closer
metas_por_closer = {}
for closer in por_closer.keys():
    pessoa = db.query(Pessoa).filter(Pessoa.nome == closer).first()
    if pessoa:
        meta = db.query(Meta).filter(
            Meta.pessoa_id == pessoa.id,
            Meta.mes == mes,
            Meta.ano == ano
        ).first()
        if meta:
            metas_por_closer[closer] = {
                "meta_vendas": meta.meta_vendas or 0,
                "meta_faturamento": meta.meta_faturamento or 0
            }
    if closer not in metas_por_closer:
        metas_por_closer[closer] = {"meta_vendas": 0, "meta_faturamento": 0}

# Atribuir metas
for m in metricas:
    # ... código existente ...
    por_closer[m.closer]["meta_vendas"] = metas_por_closer[m.closer]["meta_vendas"]
    por_closer[m.closer]["meta_faturamento"] = metas_por_closer[m.closer]["meta_faturamento"]
```

---

### Correção 8: Função `consolidar_metricas_mes()` - Linhas 1027-1157

**PROBLEMA:** Tenta acessar `metrica.meta_*` das métricas.

**ANTES (INCORRETO):**
```python
por_vendedor_ss[metrica.vendedor] = {
    # ... código ...
    "meta_ativacoes": metrica.meta_ativacoes or 0,  # ❌
    "meta_leads": metrica.meta_leads or 0           # ❌
}
```

**DEPOIS (CORRETO):**
```python
# Buscar metas uma única vez no início da função
metas_ss = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
    Meta.mes == mes,
    Meta.ano == ano,
    Pessoa.funcao == 'social_selling'
).all()

metas_sdr = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
    Meta.mes == mes,
    Meta.ano == ano,
    Pessoa.funcao == 'sdr'
).all()

metas_closer = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
    Meta.mes == mes,
    Meta.ano == ano,
    Pessoa.funcao == 'closer'
).all()

# Criar dicionários de metas por nome
metas_por_nome = {}
for meta in metas_ss + metas_sdr + metas_closer:
    pessoa = db.query(Pessoa).filter(Pessoa.id == meta.pessoa_id).first()
    if pessoa:
        metas_por_nome[pessoa.nome] = meta

# Usar metas do dicionário ao invés de buscar da métrica
for metrica in ss_metricas:
    if metrica.vendedor not in por_vendedor_ss:
        meta = metas_por_nome.get(metrica.vendedor)
        por_vendedor_ss[metrica.vendedor] = {
            "ativacoes": 0,
            "conversoes": 0,
            "leads_gerados": 0,
            "meta_ativacoes": meta.meta_ativacoes if meta else 0,
            "meta_leads": meta.meta_leads if meta else 0
        }
    # ... resto do código ...
```

---

## Arquivo 3: `/backend/app/routers/import_csv.py`

### Correção 9: Remover campos meta_* dos schemas de importação

**ANTES (INCORRETO):**
```python
# Linhas 296-297, 343-344
# Documentação incorreta
"""
Campos opcionais:
- meta_ativacoes (opcional)
- meta_leads (opcional)
"""

# Código incorreto
novo = SocialSellingMetrica(
    # ... campos ...
    meta_ativacoes=parse_int(row.get('meta_ativacoes', 0)),  # ❌
    meta_leads=parse_int(row.get('meta_leads', 0)),          # ❌
)
```

**DEPOIS (CORRETO):**
```python
# Remover campos meta_* da documentação e do código
"""
Campos obrigatórios:
- mes, ano, vendedor, ativacoes, conversoes, leads_gerados

Campos opcionais:
- data (específica)

NOTA: Metas devem ser importadas separadamente via endpoint /metas/pessoa/{pessoa_id}
"""

novo = SocialSellingMetrica(
    mes=parse_int(row['mes']),
    ano=parse_int(row['ano']),
    data=parse_date(row.get('data')),
    vendedor=row['vendedor'].strip(),
    ativacoes=parse_int(row.get('ativacoes', 0)),
    conversoes=parse_int(row.get('conversoes', 0)),
    leads_gerados=parse_int(row.get('leads_gerados', 0))
    # Taxas são calculadas automaticamente no model
)
```

Aplicar correção similar para SDRMetrica (linhas 386, 433) e CloserMetrica (linhas 476-477, 527-528).

---

## Arquivo 4: `/backend/app/routers/export.py`

### Correção 10: Buscar metas da tabela Meta ao exportar

**ANTES (INCORRETO):**
```python
# Linha 225-226
'Meta Ativações': d.meta_ativacoes,  # ❌
'% Meta Ativ.': f"{(d.ativacoes / d.meta_ativacoes * 100):.1f}%" if d.meta_ativacoes > 0 else "0%"  # ❌
```

**DEPOIS (CORRETO):**
```python
# Buscar metas antes de exportar
metas_dict = {}
for metrica in dados:
    pessoa = db.query(Pessoa).filter(Pessoa.nome == metrica.vendedor).first()
    if pessoa:
        meta = db.query(Meta).filter(
            Meta.pessoa_id == pessoa.id,
            Meta.mes == mes,
            Meta.ano == ano
        ).first()
        if meta:
            metas_dict[metrica.vendedor] = meta

# Ao exportar
for d in dados:
    meta = metas_dict.get(d.vendedor)
    excel_data.append({
        # ... campos ...
        'Meta Ativações': meta.meta_ativacoes if meta else 0,
        '% Meta Ativ.': f"{(d.ativacoes / meta.meta_ativacoes * 100):.1f}%" if meta and meta.meta_ativacoes > 0 else "0%",
        # ... resto ...
    })
```

Aplicar correção similar para SDR (linhas 297-298) e Closer (linhas 343-346).

---

## Resumo das Correções

### Arquivos a Modificar
1. ✅ `/backend/app/routers/metas.py` - 4 correções
2. ⚠️ `/backend/app/routers/comercial.py` - 4 correções
3. ⚠️ `/backend/app/routers/import_csv.py` - 1 correção (aplicar em 3 lugares)
4. ⚠️ `/backend/app/routers/export.py` - 1 correção (aplicar em 3 lugares)

### Total de Alterações
- **12 correções** distribuídas em 4 arquivos
- **Risco:** ALTO - Endpoints críticos podem falhar

### Ordem de Aplicação
1. Primeiro: `metas.py` (fundação do sistema de metas)
2. Segundo: `comercial.py` (dashboards principais)
3. Terceiro: `import_csv.py` e `export.py` (funcionalidades auxiliares)

---

**Próximo passo:** Aplicar as correções uma a uma e testar cada endpoint após a correção.
