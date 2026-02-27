# ⚡ Comandos Rápidos - MedGM Analytics

## 🔧 Setup Inicial (Local)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

---

## 🚀 Migração para Supabase

### 1. Criar Schema no Supabase

1. Acessar: https://app.supabase.com
2. SQL Editor → Colar `backend/scripts/create_supabase_schema.sql`
3. Run

### 2. Configurar .env Local

```bash
cd backend

# Copiar exemplo
cp .env.example .env

# Editar .env com suas credenciais
# DATABASE_URL=postgresql://postgres:SENHA@db.PROJECT.supabase.co:5432/postgres
```

### 3. Migrar Dados

```bash
# No diretório backend/
python scripts/migrate_to_supabase.py
```

---

## 🌐 Deploy Produção

### Backend → Railway

1. **Criar projeto:**
   - https://railway.app → New Project → Deploy from GitHub
   - Root Directory: `/backend`

2. **Variáveis (Settings > Variables):**
   ```
   DATABASE_URL=postgresql://postgres:...@db.xyz.supabase.co:5432/postgres
   CORS_ORIGINS=https://seu-app.vercel.app,http://localhost:5173
   PORT=8000
   ```

3. **Deploy automático!** Railway detecta `requirements.txt` e `Procfile`

### Frontend → Vercel

**Opção 1: CLI**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

**Opção 2: Dashboard**
1. https://vercel.com → New Project → Import `medgm-analytics`
2. Settings:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Output: `dist`
3. Environment Variables:
   ```
   VITE_API_URL=https://sua-url.railway.app
   ```

---

## 🧪 Testes

### Testar Backend (Local)
```bash
cd backend
pytest
# ou
curl http://localhost:8000/api/comercial/dashboard-geral?mes=2&ano=2026
```

### Testar Backend (Produção)
```bash
curl https://sua-url.railway.app/docs
# ou abrir no navegador
```

### Testar Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 📊 Verificar Logs

### Railway (Backend)
```
Dashboard → Deployments → View Logs
```

### Vercel (Frontend)
```
Dashboard → Deployments → Function Logs
```

### Supabase (Database)
```
Dashboard → Logs → Postgres Logs
```

---

## 🔄 Atualizar Produção

### Atualizar Backend
```bash
# Commit e push no GitHub
git add .
git commit -m "Update backend"
git push

# Railway faz redeploy automático!
```

### Atualizar Frontend
```bash
# Commit e push no GitHub
git add .
git commit -m "Update frontend"
git push

# Vercel faz redeploy automático!
```

### Atualizar Banco (Schema)
```bash
# Editar backend/scripts/create_supabase_schema.sql
# Executar no Supabase SQL Editor
```

---

## 🗄️ Backup do Banco

### Exportar do Supabase
```sql
-- No Supabase SQL Editor
COPY (SELECT * FROM vendas) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM social_selling_metricas) TO STDOUT WITH CSV HEADER;
-- etc...
```

Ou usar ferramenta de backup do Supabase:
```
Settings → Database → Database Backups → Download
```

---

## 🆘 Comandos de Emergência

### Resetar Banco Local (SQLite)
```bash
cd backend
rm data/medgm_analytics.db
python -c "from app.database import init_db; init_db()"
```

### Limpar Cache do Build
```bash
# Frontend
cd frontend
rm -rf node_modules .vite
npm install
npm run dev

# Backend
cd backend
find . -type d -name __pycache__ -exec rm -r {} +
pip install -r requirements.txt --force-reinstall
```

### Verificar Portas em Uso
```bash
# Backend usa porta 8000
lsof -i :8000

# Frontend usa porta 5173
lsof -i :5173

# Matar processo
kill -9 <PID>
```

---

## 📦 Instalar Dependências Novas

### Backend
```bash
cd backend
pip install nome-do-pacote
pip freeze > requirements.txt
```

### Frontend
```bash
cd frontend
npm install nome-do-pacote
# Automático no package.json
```

---

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env local)
```bash
# Backend
DATABASE_URL=  # vazio = usa SQLite
CORS_ORIGINS=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:8000
```

### Produção (Railway + Vercel)
```bash
# Railway
DATABASE_URL=postgresql://...supabase...
CORS_ORIGINS=https://seu-app.vercel.app,http://localhost:5173
PORT=8000

# Vercel
VITE_API_URL=https://sua-url.railway.app
```

---

## 💡 Dicas

### Desenvolvimento Rápido
```bash
# Terminal 1: Backend com auto-reload
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend com HMR
cd frontend && npm run dev
```

### Ver Schema do Banco
```bash
# SQLite local
sqlite3 backend/data/medgm_analytics.db ".schema"

# PostgreSQL Supabase
# Acessar Table Editor no dashboard
```

### Gerar Migration SQL
```bash
# Se fizer mudanças nos models.py
cd backend
alembic revision --autogenerate -m "descrição"
alembic upgrade head
```

---

**Última atualização:** $(date +%Y-%m-%d)
