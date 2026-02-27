# ✅ Checklist de Deploy - MedGM Analytics

Use este guia rápido para deploy. Para detalhes completos, veja `DEPLOY.md`.

---

## 🎯 Sequência de Deploy

### [ ] 1. Supabase (Banco de Dados)

**1.1 Criar Schema**
- [ ] Acessar [Supabase Dashboard](https://app.supabase.com)
- [ ] Ir em **SQL Editor**
- [ ] Colar conteúdo de `backend/scripts/create_supabase_schema.sql`
- [ ] Clicar em **Run**

**1.2 Obter Credenciais**
- [ ] Settings > Database > Connection string
- [ ] Copiar URI: `postgresql://postgres:[SUA-SENHA]@db.xyz.supabase.co:5432/postgres`
- [ ] Guardar URL em local seguro

**1.3 Migrar Dados**
```bash
cd backend
pip install -r requirements.txt
echo "DATABASE_URL=sua-url-do-supabase" > .env
python scripts/migrate_to_supabase.py
```
- [ ] Migração executada com sucesso
- [ ] Verificar dados no Supabase Dashboard > Table Editor

---

### [ ] 2. Railway (Backend API)

**2.1 Criar Projeto**
- [ ] Acessar [Railway Dashboard](https://railway.app)
- [ ] New Project > Deploy from GitHub repo
- [ ] Selecionar repositório `medgm-analytics`
- [ ] **Root Directory**: `/backend`

**2.2 Configurar Variáveis**
Settings > Variables:
```bash
DATABASE_URL=postgresql://postgres:...@db.xyz.supabase.co:5432/postgres
CORS_ORIGINS=http://localhost:5173
PORT=8000
```

**2.3 Verificar Deploy**
- [ ] Deploy finalizado (aguardar ~2-3 min)
- [ ] Copiar URL do Railway: `https://medgm-backend-production.up.railway.app`
- [ ] Testar: `https://sua-url.railway.app/docs` deve mostrar Swagger

---

### [ ] 3. Vercel (Frontend)

**3.1 Configurar Variável de Ambiente**
```bash
cd frontend
echo "VITE_API_URL=https://sua-url.railway.app" > .env.production
```

**3.2 Deploy via Dashboard**
- [ ] Acessar [Vercel Dashboard](https://vercel.com)
- [ ] New Project > Import Git Repository
- [ ] Selecionar `medgm-analytics`
- [ ] Configurar:
  - Framework: **Vite**
  - Root Directory: **frontend**
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Environment Variables:
  ```
  VITE_API_URL=https://sua-url.railway.app
  ```
- [ ] Deploy

**3.3 Verificar Deploy**
- [ ] Deploy finalizado (aguardar ~1-2 min)
- [ ] Copiar URL do Vercel: `https://medgm-analytics.vercel.app`
- [ ] Testar: acessar URL deve mostrar tela de login

---

### [ ] 4. Atualizar CORS

**Voltar ao Railway:**
- [ ] Settings > Variables
- [ ] Atualizar `CORS_ORIGINS`:
  ```
  CORS_ORIGINS=https://medgm-analytics.vercel.app,http://localhost:5173
  ```
- [ ] Aguardar redeploy automático (~1 min)

---

### [ ] 5. Teste End-to-End

- [ ] Acessar frontend: `https://seu-app.vercel.app`
- [ ] Fazer login (se tiver autenticação)
- [ ] Verificar Dashboard Geral carrega KPIs
- [ ] Testar filtros de mês/ano
- [ ] Verificar tabelas de Social Selling
- [ ] Testar aba SDR
- [ ] Testar aba Closer
- [ ] Testar upload de arquivos (se aplicável)

---

## 📝 URLs Importantes

Anote aqui suas URLs de produção:

```
Frontend (Vercel):  https://_____________________________.vercel.app
Backend (Railway):  https://_____________________________.railway.app
Database (Supabase): db._____________________________.supabase.co
```

---

## 🚨 Troubleshooting Rápido

### Erro de CORS
```
CORS_ORIGINS no Railway deve incluir URL EXATA do Vercel (com https://)
```

### Dados não carregam
```
1. Testar backend: https://sua-url.railway.app/docs
2. Verificar logs do Railway: Dashboard > Logs
3. Verificar VITE_API_URL no Vercel: Settings > Environment Variables
```

### Erro de autenticação do banco
```
DATABASE_URL está correta?
Verifique senha no Supabase: Settings > Database > Reset Database Password
```

---

## 🎉 Deploy Concluído!

Após todos os checkboxes marcados:
- ✅ Sistema rodando em produção
- ✅ Frontend na Vercel (CDN global)
- ✅ Backend no Railway (escalável)
- ✅ Database no Supabase (backups automáticos)

**Próximos passos:**
1. Configurar domínio customizado (opcional)
2. Adicionar monitoramento (Sentry, LogRocket)
3. Configurar alertas de uptime (UptimeRobot)
