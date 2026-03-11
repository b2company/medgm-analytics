# 📦 Resumo da Migração para Supabase

## ✅ Arquivos Criados

```
medgm-analytics/
├── DEPLOY.md                      # 📘 Guia completo de deploy
├── DEPLOY_CHECKLIST.md            # ✅ Checklist passo a passo
├── COMANDOS_RAPIDOS.md            # ⚡ Comandos úteis
│
└── backend/
    ├── .env.example               # 📝 Template de variáveis de ambiente
    ├── requirements.txt           # 📦 Dependências atualizadas (com psycopg2)
    ├── Procfile                   # 🚂 Config para Railway/Heroku
    ├── railway.json               # 🚂 Config específica do Railway
    │
    ├── app/
    │   └── database.py            # 🔄 Atualizado para suportar PostgreSQL
    │
    └── scripts/
        ├── create_supabase_schema.sql   # 🗄️ SQL para criar tabelas no Supabase
        ├── migrate_to_supabase.py       # 🔄 Script de migração SQLite → PostgreSQL
        └── setup_env.sh                 # 🛠️ Helper para setup inicial
```

---

## 🎯 Próximos Passos

### 1. Criar Schema no Supabase (5 min)

```bash
# Acesse: https://app.supabase.com
# SQL Editor → Colar conteúdo de:
backend/scripts/create_supabase_schema.sql
```

### 2. Migrar Dados (2 min)

```bash
cd backend

# Configurar .env com URL do Supabase
echo "DATABASE_URL=postgresql://postgres:SUA_SENHA@db.PROJECT.supabase.co:5432/postgres" > .env

# Instalar dependências
pip install -r requirements.txt

# Migrar dados
python scripts/migrate_to_supabase.py
```

### 3. Deploy Backend no Railway (10 min)

```
1. https://railway.app
2. New Project → Deploy from GitHub
3. Root Directory: /backend
4. Variáveis:
   DATABASE_URL=postgresql://...
   CORS_ORIGINS=http://localhost:5173
   PORT=8000
```

### 4. Deploy Frontend no Vercel (5 min)

```
1. https://vercel.com
2. New Project → Import medgm-analytics
3. Root Directory: frontend
4. Framework: Vite
5. Environment Variables:
   VITE_API_URL=https://sua-url.railway.app
```

### 5. Atualizar CORS (1 min)

```
Railway → Settings → Variables
CORS_ORIGINS=https://seu-app.vercel.app,http://localhost:5173
```

---

## 🔍 O Que Mudou

### Database.py

**Antes:**
```python
# Apenas SQLite
DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'medgm_analytics.db')}"
```

**Depois:**
```python
# Suporta PostgreSQL (produção) e SQLite (desenvolvimento)
DATABASE_URL = os.getenv("DATABASE_URL")  # PostgreSQL se configurado

if not DATABASE_URL:
    # Fallback para SQLite local
    DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'medgm_analytics.db')}"
```

### Requirements.txt

**Adicionado:**
- `psycopg2-binary` - Driver PostgreSQL
- `python-dotenv` - Leitura de .env

---

## 🎨 Arquitetura Atual vs Nova

### Antes (Local)
```
┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │
│ (React:5173)│      │(FastAPI:8000)│
└─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   SQLite    │
                     │  (arquivo)  │
                     └─────────────┘
```

### Depois (Produção)
```
┌─────────────────────┐
│      Vercel CDN     │ Frontend (React + Vite)
│ https://seu-app.app │ ✅ SSL automático
└──────────┬──────────┘ ✅ Deploy automático
           │            ✅ Edge network
           │
           ▼
┌─────────────────────┐
│      Railway        │ Backend (FastAPI)
│ https://api.up.app  │ ✅ Auto-scaling
└──────────┬──────────┘ ✅ Logs em tempo real
           │            ✅ Zero-downtime deploy
           │
           ▼
┌─────────────────────┐
│   Supabase (AWS)    │ PostgreSQL
│  db.supabase.co     │ ✅ Backups automáticos
└─────────────────────┘ ✅ Connection pooling
                         ✅ Real-time (futuro)
```

---

## 📊 Comparação SQLite vs PostgreSQL

| Feature                | SQLite (Antes)     | PostgreSQL (Agora)   |
|------------------------|-------------------|----------------------|
| Concorrência           | ❌ Baixa          | ✅ Alta              |
| Escala                 | ❌ Limitada       | ✅ Milhões de rows   |
| Backup                 | ⚠️ Manual         | ✅ Automático        |
| Joins complexos        | ⚠️ Lento          | ✅ Otimizado         |
| Full-text search       | ❌ Limitado       | ✅ Nativo            |
| Replicação             | ❌ Não            | ✅ Sim               |
| Monitoramento          | ❌ Nenhum         | ✅ Dashboard Supabase|
| Custo                  | ✅ Grátis         | ✅ Grátis (até 500MB)|

---

## 🛡️ Segurança

### Variáveis de Ambiente (.env)

**✅ Arquivo .gitignore já configurado:**
```gitignore
.env
.env.local
.env.production
```

**❌ NUNCA commitar:**
- Senhas do banco
- URLs de conexão completas
- API keys

**✅ Usar sempre:**
- `.env.example` como template
- Variables no Railway/Vercel para produção
- `.env` apenas local (não commitado)

---

## 📈 Monitoramento

### Railway (Backend)
- **Logs**: Dashboard > Logs
- **Métricas**: CPU, Memory, Network
- **Alertas**: Email quando deploy falha

### Vercel (Frontend)
- **Analytics**: Dashboard > Analytics
- **Web Vitals**: Performance automático
- **Deploy Preview**: Cada commit tem preview URL

### Supabase (Database)
- **Health**: Dashboard > Database > Health
- **Query Performance**: Slow queries automático
- **Backups**: Automático diário (plano pago)

---

## 💰 Custos Estimados

### Grátis para Sempre
- **Vercel**: 100GB bandwidth/mês
- **Railway**: $5 crédito/mês (suficiente para MVP)
- **Supabase Free**: 500MB database, 1GB bandwidth

### Se Escalar (Opcional)
- **Vercel Pro**: $20/mês (analytics avançado)
- **Railway**: $10-30/mês (recursos dedicados)
- **Supabase Pro**: $25/mês (8GB database, backups)

**Total atual: $0-5/mês** (Railway free tier)

---

## 🚨 Troubleshooting Rápido

### Migração Falhou

```bash
# Verificar conexão
python -c "from sqlalchemy import create_engine; engine = create_engine('postgresql://...'); print('OK')"

# Verificar tabelas no Supabase
# Dashboard > Table Editor
```

### CORS Error

```bash
# Verificar CORS_ORIGINS no Railway
# Deve incluir URL EXATA do Vercel (com https://)
```

### Dados Não Carregam

```bash
# 1. Testar backend
curl https://sua-url.railway.app/docs

# 2. Verificar logs Railway
# Dashboard > Logs > filtrar "error"

# 3. Verificar variável no Vercel
# Settings > Environment Variables > VITE_API_URL
```

---

## 📞 Suporte

### Documentação
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs

### Status das Plataformas
- Railway: https://railway.statuspage.io
- Vercel: https://vercel-status.com
- Supabase: https://status.supabase.com

---

## ✅ Checklist Final

Antes de considerar deploy concluído:

- [ ] Schema criado no Supabase (15 tabelas)
- [ ] Dados migrados (verificar no Table Editor)
- [ ] Backend no Railway (testar /docs)
- [ ] Frontend no Vercel (testar login)
- [ ] CORS configurado (frontend consegue buscar dados)
- [ ] Filtros funcionando (mês/ano, closers, funis)
- [ ] KPIs carregando corretamente
- [ ] Tabelas exibindo dados
- [ ] Upload de arquivos funcionando (se aplicável)
- [ ] URLs anotadas em local seguro

---

**Dúvidas?** Consulte:
1. `DEPLOY.md` - Guia detalhado
2. `DEPLOY_CHECKLIST.md` - Passo a passo
3. `COMANDOS_RAPIDOS.md` - Comandos úteis

**Pronto para começar? 🚀**
```bash
cd backend
python scripts/migrate_to_supabase.py
```
