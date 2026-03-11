# 🚀 MedGM Analytics - Backend

Backend FastAPI para o sistema de analytics da MedGM.

## 📦 Stack

- **Framework**: FastAPI 0.109.0
- **Database**: PostgreSQL (Supabase) ou SQLite (desenvolvimento)
- **ORM**: SQLAlchemy 2.0.25
- **Server**: Uvicorn
- **Deploy**: Railway

---

## ⚡ Quick Start (Desenvolvimento)

```bash
# Instalar dependências
pip install -r requirements.txt

# Rodar servidor (usa SQLite local automaticamente)
uvicorn app.main:app --reload
```

Acesse: http://localhost:8000/docs

---

## 🌐 Deploy Produção

Consulte os guias completos na raiz do projeto:
- [DEPLOY.md](../DEPLOY.md) - Guia detalhado
- [DEPLOY_CHECKLIST.md](../DEPLOY_CHECKLIST.md) - Checklist passo a passo
- [COMANDOS_RAPIDOS.md](../COMANDOS_RAPIDOS.md) - Comandos úteis

### Resumo Deploy

**1. Criar Schema no Supabase:**
```bash
# Executar scripts/create_supabase_schema.sql no SQL Editor do Supabase
```

**2. Migrar Dados:**
```bash
echo "DATABASE_URL=postgresql://..." > .env
python scripts/migrate_to_supabase.py
```

**3. Deploy no Railway:**
```
- New Project → GitHub repo
- Root Directory: /backend
- Variables: DATABASE_URL, CORS_ORIGINS
```

---

## 📁 Estrutura

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── database.py          # Config banco (SQLite/PostgreSQL)
│   ├── models/
│   │   └── models.py        # SQLAlchemy models
│   └── routers/
│       ├── comercial.py     # Dashboard comercial
│       ├── vendas.py        # CRUD vendas
│       ├── metas.py         # Gestão de metas
│       └── ...
├── data/
│   └── medgm_analytics.db   # SQLite local
├── scripts/
│   ├── create_supabase_schema.sql    # Schema PostgreSQL
│   ├── migrate_to_supabase.py        # Migração de dados
│   └── validate_setup.py             # Validação pré-deploy
├── requirements.txt
├── Procfile                 # Railway config
└── railway.json             # Railway config
```

---

## 🔑 Variáveis de Ambiente

**Desenvolvimento (.env):**
```bash
# Deixe vazio para usar SQLite local
DATABASE_URL=
CORS_ORIGINS=http://localhost:5173
```

**Produção (Railway):**
```bash
DATABASE_URL=postgresql://postgres:senha@db.projeto.supabase.co:5432/postgres
CORS_ORIGINS=https://seu-app.vercel.app,http://localhost:5173
PORT=8000
```

---

## 📊 Endpoints Principais

### Comercial
- `GET /api/comercial/dashboard-geral` - Dashboard consolidado
- `GET /api/comercial/dashboard-ss` - Social Selling
- `GET /api/comercial/dashboard-sdr` - SDR
- `GET /api/comercial/dashboard-closer` - Closer

### CRUD
- `GET/POST/PUT/DELETE /api/vendas` - Vendas
- `GET/POST/PUT/DELETE /api/social-selling` - Métricas SS
- `GET/POST/PUT/DELETE /api/sdr` - Métricas SDR
- `GET/POST/PUT/DELETE /api/closer` - Métricas Closer

### Upload
- `POST /api/upload/comercial` - Upload Excel

Documentação completa: http://localhost:8000/docs

---

## 🛠️ Scripts Úteis

```bash
# Validar setup antes do deploy
python scripts/validate_setup.py

# Migrar dados para Supabase
python scripts/migrate_to_supabase.py

# Resetar banco local
rm data/medgm_analytics.db
python -c "from app.database import init_db; init_db()"
```

---

## 🚨 Troubleshooting

### CORS Error
```bash
# Verificar CORS_ORIGINS no Railway
# Deve incluir URL exata do Vercel com https://
```

### Database Connection
```bash
# Testar conexão
python scripts/validate_setup.py
```

### Railway Deploy Failed
```bash
# Verificar:
- Root Directory: /backend
- Arquivo Procfile existe
- requirements.txt existe
- Logs do Railway para erro específico
```

---

## 📚 Documentação

- **API Docs**: http://localhost:8000/docs
- **Railway**: https://docs.railway.app
- **Supabase**: https://supabase.com/docs
- **FastAPI**: https://fastapi.tiangolo.com

---

**Desenvolvido com ❤️ para MedGM**
