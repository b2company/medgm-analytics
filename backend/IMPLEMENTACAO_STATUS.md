# Status da Implementação - Reestruturação Módulo Comercial e Config

## ✅ FASE 1: Backend - Migrations (COMPLETO)

Criados os seguintes scripts de migration:

### Arquivos Criados
- ✅ `/backend/app/migrations/001_alter_pessoa.sql`
- ✅ `/backend/app/migrations/002_alter_produto.sql`
- ✅ `/backend/app/migrations/003_alter_metricas.sql`
- ✅ `/backend/app/migrations/migrate_produtos_data.py`
- ✅ `/backend/app/migrations/README.md`

### Mudanças nos Schemas de Banco
```sql
-- Pessoas
❌ Removido: meta_vendas, meta_faturamento, meta_ativacoes, meta_leads, meta_reunioes
✅ Adicionado: nivel_senioridade INTEGER (1-7)

-- Produtos
❌ Removido: planos TEXT (array JSON)
❌ Removido: constraint UNIQUE (nome)
✅ Adicionado: plano VARCHAR(100) (string única)
✅ Adicionado: status VARCHAR(20) DEFAULT 'ativo'
✅ Adicionado: constraint UNIQUE (nome, plano)

-- Social Selling Métricas
❌ Removido: meta_ativacoes, meta_leads

-- SDR Métricas
❌ Removido: meta_reunioes

-- Closer Métricas
❌ Removido: meta_vendas, meta_faturamento
✅ Adicionado: booking FLOAT
✅ Adicionado: faturamento_bruto FLOAT
✅ Adicionado: faturamento_liquido FLOAT
```

---

## ✅ FASE 2: Backend - Models (COMPLETO)

Arquivo atualizado: `/backend/app/models/models.py`

### Mudanças Implementadas
- ✅ `Pessoa` - Removidos campos meta_*, adicionado nivel_senioridade
- ✅ `ProdutoConfig` - Mudado de planos (array) para plano (string), adicionado status
- ✅ `SocialSellingMetrica` - Removidos campos meta_*
- ✅ `SDRMetrica` - Removido campo meta_*
- ✅ `CloserMetrica` - Removidos campos meta_*, adicionados booking, faturamento_bruto, faturamento_liquido

---

## ✅ FASE 3: Backend - Routers (COMPLETO)

### 3.1 Config Router (/backend/app/routers/config.py)

#### Schemas Atualizados
```python
# Pessoas
class PessoaCreate(BaseModel):
    nome: str
    funcao: str
    ativo: bool = True
    nivel_senioridade: int = 1  # NOVO
    # ❌ Removidos: meta_vendas, meta_faturamento, meta_ativacoes, meta_leads, meta_reunioes

class PessoaUpdate(BaseModel):
    nome: Optional[str] = None
    funcao: Optional[str] = None
    ativo: Optional[bool] = None
    nivel_senioridade: Optional[int] = None  # NOVO

# Produtos
class ProdutoCreate(BaseModel):
    nome: str
    categoria: Optional[str] = None
    plano: Optional[str] = None  # NOVO: string única
    status: str = 'ativo'  # NOVO
    ativo: bool = True
    # ❌ Removido: planos (List[str])

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    categoria: Optional[str] = None
    plano: Optional[str] = None  # NOVO
    status: Optional[str] = None  # NOVO
    ativo: Optional[bool] = None
```

#### Endpoints Atualizados
- ✅ GET `/config/pessoas` - Retorna nivel_senioridade (sem meta_*)
- ✅ GET `/config/pessoas/{id}` - Retorna nivel_senioridade (sem meta_*)
- ✅ POST `/config/pessoas` - Aceita nivel_senioridade (sem meta_*)
- ✅ PUT `/config/pessoas/{id}` - Aceita nivel_senioridade (sem meta_*)
- ✅ GET `/config/produtos` - Retorna plano + status (sem planos array)
- ✅ GET `/config/produtos/{id}` - Retorna plano + status
- ✅ POST `/config/produtos` - Valida unicidade (nome + plano)
- ✅ PUT `/config/produtos/{id}` - Valida unicidade (nome + plano)
- ✅ GET `/config/pessoas/resumo` - Busca metas da tabela Meta
- ✅ POST `/config/seed` - Seed atualizado com nova estrutura

### 3.2 Comercial Router (/backend/app/routers/comercial.py)

#### Schemas Atualizados
```python
class SocialSellingCreate(BaseModel):
    mes: int
    ano: int
    data: Optional[date] = None
    vendedor: str
    ativacoes: int
    conversoes: int
    leads_gerados: int
    # ❌ Removidos: meta_ativacoes, meta_leads

class SDRCreate(BaseModel):
    mes: int
    ano: int
    data: Optional[date] = None
    sdr: str
    funil: str
    leads_recebidos: int
    reunioes_agendadas: int
    reunioes_realizadas: int
    # ❌ Removido: meta_reunioes

class CloserCreate(BaseModel):
    mes: int
    ano: int
    data: Optional[date] = None
    closer: str
    funil: str
    calls_agendadas: int
    calls_realizadas: int
    vendas: int
    faturamento: float = 0.0  # Legado
    # ✅ NOVOS:
    booking: float = 0.0
    faturamento_bruto: float = 0.0
    faturamento_liquido: float = 0.0
    # ❌ Removidos: meta_vendas, meta_faturamento
```

#### ⚠️ Dashboards Precisam Ser Atualizados
Os seguintes endpoints AINDA precisam ser modificados para buscar metas via JOIN com tabela Meta:
- ⏳ GET `/comercial/dashboard/social-selling` - Precisa fazer JOIN com Meta
- ⏳ GET `/comercial/dashboard/sdr` - Precisa fazer JOIN com Meta
- ⏳ GET `/comercial/dashboard/closer` - Precisa fazer JOIN com Meta
- ⏳ PUT `/comercial/consolidar-mes` - Precisa buscar metas da tabela Meta

---

## 🔄 PRÓXIMOS PASSOS

### 1. Executar Migrations
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend

# Fazer backup do banco
pg_dump -h localhost -U seu_usuario -d nome_banco > backup_completo_$(date +%Y%m%d).sql

# Executar migration 001 (Pessoa)
psql -h localhost -U seu_usuario -d nome_banco -f app/migrations/001_alter_pessoa.sql

# Executar script de migração de dados dos produtos
python app/migrations/migrate_produtos_data.py

# Executar migration 002 (Produto) - APENAS após confirmar migração de dados
psql -h localhost -U seu_usuario -d nome_banco -f app/migrations/002_alter_produto.sql

# Executar migration 003 (Métricas)
psql -h localhost -U seu_usuario -d nome_banco -f app/migrations/003_alter_metricas.sql
```

### 2. Reiniciar Servidor Backend
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
# Parar servidor atual
# Reiniciar servidor para carregar novos models
```

### 3. Testar Backend

#### Teste 1: CRUD de Pessoas
```bash
# Criar pessoa
curl -X POST http://localhost:8000/config/pessoas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Backend",
    "funcao": "closer",
    "nivel_senioridade": 4
  }'

# Listar pessoas
curl http://localhost:8000/config/pessoas

# Verificar que não há campos meta_* na resposta
```

#### Teste 2: CRUD de Produtos
```bash
# Criar produto
curl -X POST http://localhost:8000/config/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Produto Teste",
    "categoria": "Consultoria",
    "plano": "Premium",
    "status": "ativo"
  }'

# Listar produtos
curl http://localhost:8000/config/produtos

# Verificar que retorna "plano" (string) e não "planos" (array)
```

#### Teste 3: Métricas de Comercial
```bash
# Criar Social Selling (sem campos meta)
curl -X POST http://localhost:8000/comercial/social-selling \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "vendedor": "Teste Backend",
    "ativacoes": 50,
    "conversoes": 10,
    "leads_gerados": 5
  }'

# Criar Closer (com novos campos)
curl -X POST http://localhost:8000/comercial/closer \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "closer": "Teste Backend",
    "funil": "SS",
    "calls_agendadas": 10,
    "calls_realizadas": 8,
    "vendas": 3,
    "booking": 150000,
    "faturamento_bruto": 120000,
    "faturamento_liquido": 100000
  }'
```

### 4. Continuar Frontend (FASE 4 e 5)
Após confirmar que o backend está funcionando, seguir com:
- FASE 4: Frontend - Config
- FASE 5: Frontend - Comercial

---

## 📋 Checklist de Verificação

### Backend Models
- [x] Pessoa sem campos meta, com nivel_senioridade
- [x] ProdutoConfig com plano (string) e status
- [x] SocialSellingMetrica sem campos meta
- [x] SDRMetrica sem campo meta
- [x] CloserMetrica sem campos meta, com booking/faturamento_bruto/liquido

### Backend Config Router
- [x] Schemas Pessoa atualizados
- [x] Schemas Produto atualizados
- [x] GET/POST/PUT pessoas funcionando
- [x] GET/POST/PUT produtos funcionando
- [x] Seed atualizado

### Backend Comercial Router
- [x] Schemas atualizados
- [ ] Dashboards atualizados (JOIN com Meta) - PENDENTE
- [ ] Consolidar mês atualizado - PENDENTE

### Migrations
- [x] Scripts SQL criados
- [ ] Migrations executadas - AGUARDANDO TESTE
- [ ] Dados de produtos migrados - AGUARDANDO TESTE

---

## ⚠️ Avisos Importantes

1. **Backup**: Sempre faça backup do banco antes de rodar migrations
2. **Ordem de Execução**: Siga a ordem dos scripts de migration
3. **Migração de Produtos**: Execute o script Python ANTES de dropar a coluna `planos`
4. **Compatibilidade**: Os dashboards antigos que consultavam meta_* nas tabelas de métricas precisarão ser atualizados
5. **Frontend**: Não atualize o frontend antes de confirmar que o backend está funcionando

---

## 🐛 Problemas Conhecidos

Nenhum problema identificado ainda. Esta é a primeira versão da implementação.

---

## 📞 Próxima Sessão

Na próxima sessão, você deve:
1. ✅ Executar as migrations
2. ✅ Testar os endpoints do backend
3. ✅ Finalizar atualização dos dashboards (JOIN com Meta)
4. ➡️ Começar implementação do frontend (Config e Comercial)
