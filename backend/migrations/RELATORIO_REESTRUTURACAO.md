# Relatório de Reestruturação do Backend - Módulo Comercial

**Data:** 2026-02-25
**Responsável:** Backend Agent
**Projeto:** MedGM Analytics

---

## Resumo Executivo

A reestruturação do backend do módulo Comercial foi **parcialmente concluída** nos models, mas há **inconsistências críticas** nos routers que precisam ser corrigidas.

### Status Geral
- ✅ **Models (SQLAlchemy):** CORRETOS
- ⚠️ **Routers (FastAPI):** INCONSISTENTES - tentam acessar campos que não existem
- ⚠️ **Schemas (Pydantic):** CORRETOS, mas usados incorretamente

---

## FASE 1: Análise da Estrutura Atual

### ✅ Modelo `Pessoa` (models.py)
**Status:** CORRETO

```python
class Pessoa(Base):
    __tablename__ = "pessoas"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False, unique=True)
    funcao = Column(String(50), nullable=False)
    ativo = Column(Boolean, default=True)
    nivel_senioridade = Column(Integer, default=1)  # ✅ Existe
    # ✅ NÃO possui campos meta_* (correto)
```

**Conclusão:** Estrutura ideal. Não requer alterações.

---

### ✅ Modelo `ProdutoConfig` (models.py)
**Status:** CORRETO

```python
class ProdutoConfig(Base):
    __tablename__ = "produtos_config"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    categoria = Column(String(100), nullable=True)
    plano = Column(String(100), nullable=True)  # ✅ String única (correto)
    status = Column(String(20), default='ativo')  # ✅ Existe
    ativo = Column(Boolean, default=True)
```

**Conclusão:** Estrutura ideal. Campo `plano` já é string única.

---

### ✅ Modelo `SocialSellingMetrica` (models.py)
**Status:** CORRETO

```python
class SocialSellingMetrica(Base):
    __tablename__ = "social_selling_metricas"

    # Métricas principais
    ativacoes = Column(Integer, default=0)
    conversoes = Column(Integer, default=0)
    leads_gerados = Column(Integer, default=0)

    # ✅ NÃO possui campos meta_ativacoes ou meta_leads (correto)
```

**Conclusão:** Estrutura ideal. Metas devem vir da tabela `Meta`.

---

### ✅ Modelo `SDRMetrica` (models.py)
**Status:** CORRETO

```python
class SDRMetrica(Base):
    __tablename__ = "sdr_metricas"

    # Métricas principais
    leads_recebidos = Column(Integer, default=0)
    reunioes_agendadas = Column(Integer, default=0)
    reunioes_realizadas = Column(Integer, default=0)

    # ✅ NÃO possui campo meta_reunioes (correto)
```

**Conclusão:** Estrutura ideal. Metas devem vir da tabela `Meta`.

---

### ✅ Modelo `CloserMetrica` (models.py)
**Status:** CORRETO

```python
class CloserMetrica(Base):
    __tablename__ = "closer_metricas"

    # Métricas principais
    calls_agendadas = Column(Integer, default=0)
    calls_realizadas = Column(Integer, default=0)
    vendas = Column(Integer, default=0)
    faturamento = Column(Float, default=0.0)  # Campo legado

    # ✅ Novos campos financeiros existem
    booking = Column(Float, default=0.0)
    faturamento_bruto = Column(Float, default=0.0)
    faturamento_liquido = Column(Float, default=0.0)

    # ✅ NÃO possui campos meta_vendas ou meta_faturamento (correto)
```

**Conclusão:** Estrutura ideal. Campos financeiros detalhados já existem.

---

### ✅ Modelo `Meta` (models.py)
**Status:** CORRETO

```python
class Meta(Base):
    __tablename__ = "metas"

    id = Column(Integer, primary_key=True)
    mes = Column(Integer, nullable=False, index=True)
    ano = Column(Integer, nullable=False, index=True)
    tipo = Column(String(20), nullable=False, default="pessoa")
    pessoa_id = Column(Integer, nullable=True, index=True)

    # ✅ Metas centralizadas
    meta_ativacoes = Column(Integer, nullable=True)
    meta_leads = Column(Integer, nullable=True)
    meta_reunioes = Column(Integer, nullable=True)
    meta_vendas = Column(Integer, nullable=True)
    meta_faturamento = Column(Float, nullable=True)

    # ✅ Campos de realizado e delta
    realizado_ativacoes = Column(Integer, nullable=True)
    # ... (demais campos de realizado e delta)
```

**Conclusão:** Tabela centralizada de metas funcionando corretamente.

---

## FASE 2: Problemas Identificados nos Routers

### ⚠️ CRÍTICO: Router `metas.py` - Linhas 79-91

**Problema:** Tenta acessar campos `meta_*` da tabela `Pessoa`, que não existem.

```python
# ❌ CÓDIGO INCORRETO (linhas 79-83)
return {
    "meta_ativacoes": pessoa.meta_ativacoes or 0,  # ❌ Campo não existe
    "meta_leads": pessoa.meta_leads or 0,          # ❌ Campo não existe
    "meta_reunioes": pessoa.meta_reunioes or 0,    # ❌ Campo não existe
    "meta_vendas": pessoa.meta_vendas or 0,        # ❌ Campo não existe
    "meta_faturamento": pessoa.meta_faturamento or 0  # ❌ Campo não existe
}
```

**Impacto:** Erro em runtime quando meta não existe no mês.

**Correção necessária:** Retornar zeros quando não há meta cadastrada, ou buscar meta do mês anterior.

---

### ⚠️ CRÍTICO: Router `metas.py` - Linhas 297-301

**Problema:** Tenta criar meta usando campos `meta_*` da tabela `Pessoa`.

```python
# ❌ CÓDIGO INCORRETO
meta_ativacoes=pessoa.meta_ativacoes,  # ❌ Campo não existe
meta_leads=pessoa.meta_leads,          # ❌ Campo não existe
# ... etc
```

**Impacto:** Falha ao gerar metas a partir de dados da pessoa.

---

### ⚠️ CRÍTICO: Router `comercial.py` - Múltiplas Linhas

**Problema:** Dashboards legados tentam acessar `metrica.meta_*`, que não existem nas tabelas de métricas.

**Linhas problemáticas:**
- Linha 500: `sum(m.meta_ativacoes for m in metricas)` ❌
- Linha 501: `sum(m.meta_leads for m in metricas)` ❌
- Linha 766: `sum(m.meta_reunioes for m in lista_metricas)` ❌
- Linha 986-987: `m.meta_vendas`, `m.meta_faturamento` ❌
- Linha 1044-1045: `metrica.meta_ativacoes`, `metrica.meta_leads` ❌
- Linha 1079: `metrica.meta_reunioes` ❌
- Linha 1111-1112: `metrica.meta_vendas`, `metrica.meta_faturamento` ❌

**Impacto:** Dashboards legados não funcionam. AttributeError em runtime.

**Correção necessária:** Buscar metas da tabela `Meta` via join com `Pessoa`.

---

### ⚠️ CRÍTICO: Router `comercial.py` - Função `dashboard_social_selling()`

**Problema:** Linhas 489-492, 500-501, 511-514 tentam acessar campos que não existem.

```python
# ❌ CÓDIGO INCORRETO (linhas 500-501)
total_meta_ativacoes = sum(m.meta_ativacoes for m in metricas)  # ❌
total_meta_leads = sum(m.meta_leads for m in metricas)  # ❌
```

**Correção necessária:**
```python
# ✅ CÓDIGO CORRETO
# Buscar metas da tabela Meta por pessoa e mês
metas_query = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
    Meta.mes == mes,
    Meta.ano == ano,
    Pessoa.funcao == 'social_selling'
).all()

total_meta_ativacoes = sum(m.meta_ativacoes or 0 for m in metas_query)
total_meta_leads = sum(m.meta_leads or 0 for m in metas_query)
```

---

### ⚠️ Router `import_csv.py` - Linhas 296-297, 343-344

**Problema:** Documentação e código de importação CSV referenciam campos meta_* nas tabelas de métricas.

```python
# ❌ CÓDIGO INCORRETO (linhas 343-344)
meta_ativacoes=parse_int(row.get('meta_ativacoes', 0)),  # ❌
meta_leads=parse_int(row.get('meta_leads', 0)),          # ❌
```

**Impacto:** CSV imports não funcionam.

**Correção necessária:** Remover campos meta_* dos schemas de importação e criar registros na tabela `Meta` separadamente.

---

### ⚠️ Router `export.py` - Linhas 225-231, 297-298, 343-346

**Problema:** Exportação de dados tenta acessar campos meta_* das métricas.

```python
# ❌ CÓDIGO INCORRETO (linhas 225-226)
'Meta Ativações': d.meta_ativacoes,  # ❌
'% Meta Ativ.': f"{(d.ativacoes / d.meta_ativacoes * 100):.1f}%" if d.meta_ativacoes > 0 else "0%"  # ❌
```

**Impacto:** Exports falham ou retornam dados vazios.

---

## FASE 3: Schemas dos Routers

### ✅ Router `config.py` - Schemas
**Status:** CORRETOS

```python
class PessoaCreate(BaseModel):
    nome: str
    funcao: str
    ativo: bool = True
    nivel_senioridade: int = 1  # ✅ Correto

class ProdutoCreate(BaseModel):
    nome: str
    categoria: Optional[str] = None
    plano: Optional[str] = None  # ✅ String única (correto)
    status: str = 'ativo'  # ✅ Correto
    ativo: bool = True
```

**Conclusão:** Schemas Pydantic estão corretos e alinhados com os models.

---

### ✅ Router `comercial.py` - Schemas
**Status:** CORRETOS

```python
class SocialSellingCreate(BaseModel):
    mes: int
    ano: int
    data: Optional[date] = None
    vendedor: str
    ativacoes: int
    conversoes: int
    leads_gerados: int
    # ✅ NÃO possui campos meta_* (correto)

class CloserCreate(BaseModel):
    # ... campos básicos ...
    booking: float = 0.0  # ✅ Existe
    faturamento_bruto: float = 0.0  # ✅ Existe
    faturamento_liquido: float = 0.0  # ✅ Existe
    # ✅ NÃO possui campos meta_* (correto)
```

**Conclusão:** Schemas Pydantic estão corretos.

---

## FASE 4: Migration SQL

### Arquivo Criado
`/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/migrations/restructure_comercial.sql`

### Conclusão da Migration
**NENHUMA ALTERAÇÃO DE SCHEMA NECESSÁRIA**

Os modelos SQLAlchemy já refletem a estrutura desejada:
- Pessoa: sem campos meta_*, com nivel_senioridade
- ProdutoConfig: com plano (string única) e status
- Métricas: sem campos meta_*
- CloserMetrica: com booking, faturamento_bruto, faturamento_liquido

---

## Correções Necessárias

### 1. ⚠️ PRIORIDADE ALTA: Corrigir `metas.py`

**Arquivo:** `/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/app/routers/metas.py`

**Linhas a corrigir:**
- 79-83: Remover acesso a `pessoa.meta_*`
- 87-91: Remover fallback para `pessoa.meta_*`
- 297-301: Remover uso de `pessoa.meta_*`
- 329-333: Remover uso de `pessoa.meta_*`

**Solução:**
```python
# Linha 79-83: Quando não há meta cadastrada, retornar zeros
return {
    "meta_ativacoes": 0,
    "meta_leads": 0,
    "meta_reunioes": 0,
    "meta_vendas": 0,
    "meta_faturamento": 0
}

# Linha 87-91: Usar apenas meta da tabela Meta
return {
    "meta_ativacoes": meta.meta_ativacoes or 0,
    "meta_leads": meta.meta_leads or 0,
    "meta_reunioes": meta.meta_reunioes or 0,
    "meta_vendas": meta.meta_vendas or 0,
    "meta_faturamento": meta.meta_faturamento or 0
}

# Linhas 297-301 e 329-333: Remover campos meta_* ao criar metas
# Metas devem ser definidas manualmente ou via endpoint de criação de metas
```

---

### 2. ⚠️ PRIORIDADE ALTA: Corrigir dashboards em `comercial.py`

**Arquivo:** `/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/app/routers/comercial.py`

**Funções a corrigir:**
- `dashboard_social_selling()` (linhas 469-518)
- `dashboard_sdr()` (linhas 736-785)
- `dashboard_closer()` (linhas 955-1022)
- `consolidar_metricas_mes()` (linhas 1027-1157)

**Solução:** Buscar metas da tabela `Meta` via join, não das métricas.

---

### 3. ⚠️ PRIORIDADE MÉDIA: Corrigir `import_csv.py`

**Arquivo:** `/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/app/routers/import_csv.py`

**Ações:**
- Remover campos meta_* dos schemas de importação
- Documentar que metas devem ser importadas separadamente via endpoint de metas

---

### 4. ⚠️ PRIORIDADE MÉDIA: Corrigir `export.py`

**Arquivo:** `/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend/app/routers/export.py`

**Ações:**
- Buscar metas via join com tabela Meta
- Adicionar metas aos exports consultando a tabela correta

---

## Próximos Passos Recomendados

### Imediato (Crítico)
1. Corrigir `metas.py` - linhas 79-91, 297-301, 329-333
2. Corrigir dashboards em `comercial.py` que acessam `metrica.meta_*`
3. Testar endpoints críticos:
   - `/comercial/dashboard/social-selling`
   - `/comercial/dashboard/sdr`
   - `/comercial/dashboard/closer`
   - `/metas/pessoa/{pessoa_id}`

### Curto Prazo (Alta Prioridade)
4. Atualizar `import_csv.py` para não aceitar campos meta_* nas métricas
5. Atualizar `export.py` para buscar metas da tabela Meta
6. Criar testes unitários para validar:
   - Criação de metas
   - Consulta de metas por pessoa/mês
   - Dashboards consolidados

### Médio Prazo (Melhorias)
7. Documentar API com exemplos corretos
8. Criar migration script para ambientes legados (se necessário)
9. Adicionar validações para evitar acesso a campos inexistentes
10. Implementar cache de metas para melhor performance

---

## Validações Necessárias

Antes de considerar a reestruturação completa:

1. ✅ Verificar se banco de dados tem campos meta_* nas tabelas de métricas
2. ⚠️ Corrigir código que acessa campos inexistentes
3. ⚠️ Atualizar testes automatizados
4. ⚠️ Validar que todos os endpoints retornam dados corretos
5. ⚠️ Testar fluxo completo: criar pessoa → criar meta → consultar dashboard

---

## Conclusão

Os **models SQLAlchemy estão corretos**, mas os **routers têm código legado** que tenta acessar campos que não existem mais (ou nunca existiram).

### Status Final
- ✅ **Models:** 100% corretos
- ⚠️ **Migration SQL:** Criada, mas desnecessária (schema já correto)
- ❌ **Routers:** Precisam correção urgente
- ⚠️ **Schemas:** Corretos, mas mal utilizados em alguns lugares

### Risco
**ALTO** - Endpoints críticos podem falhar em runtime com AttributeError.

### Ação Recomendada
Corrigir imediatamente os routers antes de usar o sistema em produção.

---

**Documento gerado automaticamente pelo Backend Agent**
**Data:** 2026-02-25
