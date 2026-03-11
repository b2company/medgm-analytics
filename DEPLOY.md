# 🚀 Guia de Deploy - MedGM Analytics

Deploy completo usando **Supabase PostgreSQL + Railway (Backend) + Vercel (Frontend)**.

---

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com) (você já tem pago ✅)
- Conta no [Railway](https://railway.app) (grátis ou pago)
- Conta no [Vercel](https://vercel.com) (grátis)
- Git instalado
- Repositório GitHub com o código

---

## 1️⃣ Configurar Supabase (Banco de Dados)

### 1.1 Criar Database no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto (ou crie um novo)
3. No menu lateral, clique em **SQL Editor**
4. Cole o conteúdo do arquivo `backend/scripts/create_supabase_schema.sql`
5. Clique em **Run** para criar todas as tabelas

### 1.2 Obter Credenciais

1. No Supabase Dashboard, vá em **Settings > Database**
2. Role até **Connection string** e copie a **URI Connection**
3. Exemplo: `postgresql://postgres:[YOUR-PASSWORD]@db.xyz.supabase.co:5432/postgres`
4. **Guarde essa URL**, você vai usar no Railway e localmente

### 1.3 Migrar Dados do SQLite → PostgreSQL

```bash
# No diretório backend/
cd backend

# Instalar dependências
pip install -r requirements.txt

# Criar arquivo .env com a URL do Supabase
echo "DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJECT.supabase.co:5432/postgres" > .env

# Executar migração
python scripts/migrate_to_supabase.py
```

Se tudo der certo, você verá:
```
✅ Migração concluída!
📊 Migrando tabela: vendas
   📝 X registros encontrados
   ✅ X registros migrados com sucesso
```

---

## 2️⃣ Deploy do Backend no Railway

### 2.1 Criar Projeto no Railway

1. Acesse [Railway Dashboard](https://railway.app)
2. Clique em **New Project**
3. Selecione **Deploy from GitHub repo**
4. Autorize o Railway a acessar seu GitHub
5. Selecione o repositório `medgm-analytics`
6. **Root Directory**: `/backend` (importante!)

### 2.2 Configurar Variáveis de Ambiente

1. No Railway, clique no serviço criado
2. Vá em **Variables**
3. Adicione as seguintes variáveis:

```bash
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJECT.supabase.co:5432/postgres
CORS_ORIGINS=https://seu-app.vercel.app,http://localhost:5173
PORT=8000
```

### 2.3 Deploy Automático

1. Railway detecta automaticamente o `requirements.txt`
2. O deploy inicia automaticamente
3. Após 2-3 minutos, você terá uma URL tipo: `https://medgm-backend-production.up.railway.app`
4. **Guarde essa URL**, você vai usar no frontend

### 2.4 Testar Backend

Acesse no navegador:
```
https://sua-url.railway.app/docs
```

Você deve ver a documentação interativa do FastAPI.

---

## 3️⃣ Deploy do Frontend no Vercel

### 3.1 Preparar Frontend

No diretório `frontend/`, crie ou edite o arquivo `.env.production`:

```bash
# frontend/.env.production
VITE_API_URL=https://sua-url.railway.app
```

### 3.2 Deploy no Vercel

**Opção 1: Via CLI (Recomendado)**

```bash
# Instalar Vercel CLI
npm install -g vercel

# No diretório frontend/
cd frontend

# Login no Vercel
vercel login

# Deploy
vercel --prod
```

**Opção 2: Via Dashboard**

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Clique em **Add New > Project**
3. Selecione o repositório `medgm-analytics`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Em **Environment Variables**, adicione:
   ```
   VITE_API_URL=https://sua-url.railway.app
   ```
6. Clique em **Deploy**

### 3.3 URL do Frontend

Após deploy, você terá uma URL tipo:
```
https://medgm-analytics.vercel.app
```

---

## 4️⃣ Atualizar CORS no Backend

1. Volte ao **Railway Dashboard**
2. Vá em **Variables**
3. Atualize `CORS_ORIGINS` com a URL do Vercel:

```bash
CORS_ORIGINS=https://medgm-analytics.vercel.app,http://localhost:5173
```

4. Railway faz redeploy automático

---

## 5️⃣ Verificação Final

### Checklist ✅

- [ ] Supabase: Tabelas criadas com sucesso
- [ ] Supabase: Dados migrados do SQLite
- [ ] Railway: Backend deployado e acessível em `/docs`
- [ ] Vercel: Frontend deployado e acessível
- [ ] CORS configurado corretamente
- [ ] Frontend consegue fazer requisições ao backend
- [ ] Login funciona
- [ ] Dashboards carregam dados

### Testar Conexão

1. Acesse o frontend: `https://seu-app.vercel.app`
2. Faça login
3. Vá em **Dashboard Geral**
4. Verifique se os KPIs carregam corretamente

---

## 🔧 Configurações Adicionais

### Custom Domain (Opcional)

**Vercel:**
1. Vá em **Settings > Domains**
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções

**Railway:**
1. Vá em **Settings > Networking > Custom Domain**
2. Adicione seu domínio para API (ex: `api.seudominio.com`)

### Monitoramento

**Railway:**
- Logs em tempo real: Railway Dashboard > Logs
- Métricas: Railway Dashboard > Metrics

**Vercel:**
- Analytics: Vercel Dashboard > Analytics
- Logs: Vercel Dashboard > Logs

**Supabase:**
- Database health: Supabase Dashboard > Database > Health
- Logs: Supabase Dashboard > Logs

---

## 🚨 Troubleshooting

### Erro de CORS

```bash
Access to fetch at 'https://...' has been blocked by CORS policy
```

**Solução:**
- Verifique `CORS_ORIGINS` no Railway
- Deve incluir a URL exata do Vercel (com https://)
- Redeploy o backend após alterar

### Erro de Conexão com Banco

```bash
FATAL: password authentication failed
```

**Solução:**
- Verifique `DATABASE_URL` no Railway
- Confirme senha no Supabase Dashboard > Settings > Database
- Use a Connection String exata do Supabase

### Frontend não carrega dados

1. Verifique logs do Railway: há erros?
2. Teste backend diretamente: `https://sua-url.railway.app/docs`
3. Verifique `VITE_API_URL` no Vercel Dashboard > Settings > Environment Variables
4. Redeploy o frontend após alterar variáveis

### Migração falhou

```bash
❌ Erro ao migrar tabela: ...
```

**Solução:**
1. Verifique se as tabelas foram criadas no Supabase (SQL Editor)
2. Confirme `DATABASE_URL` no `.env` local
3. Tente migrar tabela por tabela (edite `TABLES` em `migrate_to_supabase.py`)

---

## 📱 Desenvolvimento Local

Para continuar desenvolvendo localmente após deploy:

```bash
# Backend - usa SQLite local
cd backend
# Não configure DATABASE_URL no .env (ou deixe vazio)
uvicorn app.main:app --reload

# Frontend - aponta para backend local
cd frontend
# .env.development
VITE_API_URL=http://localhost:8000
npm run dev
```

---

## 🎉 Pronto!

Seu sistema está no ar:
- ✅ **Frontend**: Vercel (CDN global, SSL automático)
- ✅ **Backend**: Railway (escalável, logs em tempo real)
- ✅ **Database**: Supabase (PostgreSQL gerenciado, backups automáticos)

**URLs Importantes:**
- Frontend: `https://seu-app.vercel.app`
- Backend API: `https://sua-url.railway.app`
- Backend Docs: `https://sua-url.railway.app/docs`
- Supabase Dashboard: `https://app.supabase.com`

---

**Dúvidas?** Verifique os logs:
- Railway: Dashboard > Deployments > View Logs
- Vercel: Dashboard > Deployments > Function Logs
- Supabase: Dashboard > Logs > Postgres Logs
