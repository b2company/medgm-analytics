# 🚀 Instruções de Deploy - MedGM Analytics

## 📋 O que foi feito

### ✅ Frontend
1. **Abas ocultas** - Agora só aparecem **Comercial** e **Config** no menu
2. **Redirecionamento** - Ao acessar `/`, vai direto para `/comercial`
3. **Formulários públicos criados**:
   - `/form/social-selling` - Para vendedores de Social Selling
   - `/form/sdr` - Para SDRs
   - `/form/closer` - Para Closers
   - `/form/vendas` - Para registro de vendas

### ✅ Backend
- Endpoints já existentes e funcionando
- CORS configurado para localhost

---

## 🌐 Deploy Recomendado

### Frontend: Vercel (Grátis)
### Backend: Railway / Render / Heroku

---

## 1️⃣ Deploy do Frontend (Vercel)

### Passo a Passo:

1. **Criar conta no Vercel**
   - Acesse: https://vercel.com
   - Faça login com GitHub

2. **Instalar Vercel CLI** (opcional, mas recomendado)
   ```bash
   npm i -g vercel
   ```

3. **Fazer deploy**
   ```bash
   cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/frontend
   vercel
   ```

4. **Configurar variáveis de ambiente no Vercel**
   - Após o primeiro deploy, acesse o dashboard do Vercel
   - Vá em Settings > Environment Variables
   - Adicione:
     ```
     VITE_API_URL = https://seu-backend-url.com
     ```
   - **IMPORTANTE:** Não inclua `/` no final da URL

5. **Redeploy** após configurar as variáveis
   ```bash
   vercel --prod
   ```

### URLs que serão geradas:
```
https://seu-app.vercel.app
https://seu-app.vercel.app/comercial
https://seu-app.vercel.app/config
https://seu-app.vercel.app/form/social-selling
https://seu-app.vercel.app/form/sdr
https://seu-app.vercel.app/form/closer
https://seu-app.vercel.app/form/vendas
```

---

## 2️⃣ Deploy do Backend (Railway - Recomendado)

### Por que Railway?
- Deploy grátis de FastAPI
- Banco de dados PostgreSQL grátis
- Configuração simples
- URL HTTPS automática

### Passo a Passo:

1. **Criar conta no Railway**
   - Acesse: https://railway.app
   - Faça login com GitHub

2. **Criar novo projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório (ou crie um novo)

3. **Adicionar PostgreSQL**
   - No dashboard do Railway, clique em "+ New"
   - Selecione "Database" > "PostgreSQL"
   - Railway criará automaticamente e conectará ao seu app

4. **Configurar variáveis de ambiente**
   Railway detecta automaticamente FastAPI, mas você precisa adicionar:
   ```
   DATABASE_URL=postgresql://... (gerado automaticamente)
   PORT=8000
   ```

5. **Adicionar arquivo `railway.json` no backend**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

6. **Adicionar `requirements.txt` se não existir**
   ```txt
   fastapi==0.104.1
   uvicorn[standard]==0.24.0
   sqlalchemy==2.0.23
   psycopg2-binary==2.9.9
   python-multipart==0.0.6
   pandas==2.1.3
   openpyxl==3.1.2
   ```

7. **Deploy automático**
   - Railway faz deploy automaticamente ao detectar mudanças no GitHub
   - URL será gerada: `https://seu-app.up.railway.app`

---

## 3️⃣ Atualizar CORS no Backend

**MUITO IMPORTANTE!** Após o deploy, você precisa atualizar o CORS no backend.

Edite `/backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://seu-app.vercel.app",  # ← Adicionar URL do Vercel
        "https://*.vercel.app"          # ← Permitir todos os previews do Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 4️⃣ Testar os Formulários

Após o deploy, teste os links:

```
https://seu-app.vercel.app/form/social-selling
https://seu-app.vercel.app/form/sdr
https://seu-app.vercel.app/form/closer
https://seu-app.vercel.app/form/vendas
```

### Checklist de Testes:
- [ ] Formulário carrega corretamente
- [ ] Selects (vendedor, closer, funil, produto) aparecem preenchidos
- [ ] Ao submeter, aparece mensagem de sucesso
- [ ] Dados aparecem no painel principal

---

## 5️⃣ Compartilhar com o Time

Copie os links dos formulários e compartilhe:

**Social Selling (Jessica, Artur, Karina):**
```
https://seu-app.vercel.app/form/social-selling
```

**SDR (Fernando):**
```
https://seu-app.vercel.app/form/sdr
```

**Closer (Fabio, Mona):**
```
https://seu-app.vercel.app/form/closer
```

**Vendas (Time Comercial):**
```
https://seu-app.vercel.app/form/vendas
```

---

## 🔒 Segurança

### Os formulários são seguros?
- ✅ SIM - Apenas enviam dados, não permitem leitura
- ✅ Validação de campos obrigatórios
- ✅ Não têm acesso ao painel completo
- ✅ HTTPS automático (Vercel + Railway)

### Como restringir mais?
Se precisar adicionar autenticação simples no futuro:
1. Adicionar campo de senha nos formulários
2. Verificar senha no backend antes de inserir
3. Criar tokens de acesso únicos por pessoa

---

## 💰 Custos

### Vercel (Frontend)
- Grátis até 100GB bandwidth/mês
- Suficiente para 1000+ acessos/dia

### Railway (Backend + DB)
- $5/mês de crédito grátis
- PostgreSQL grátis até 1GB
- Suficiente para começar

### Alternativa Gratuita Total
- Frontend: Vercel (grátis)
- Backend: Render.com (grátis, mas mais lento)
- DB: Railway PostgreSQL (grátis até 1GB)

---

## 🆘 Troubleshooting

### Erro de CORS
```
Access to fetch at '...' has been blocked by CORS policy
```
**Solução:** Adicione o domínio do Vercel no CORS do backend

### Formulário não carrega opções
```
Selects aparecem vazios
```
**Solução:** Verifique se `VITE_API_URL` está correto no Vercel

### Erro 500 ao submeter
```
Internal Server Error
```
**Solução:** Verifique logs no Railway dashboard

---

## 📞 Próximos Passos

1. ✅ Fazer deploy do backend no Railway
2. ✅ Fazer deploy do frontend no Vercel
3. ✅ Atualizar CORS com domínio do Vercel
4. ✅ Testar todos os formulários
5. ✅ Compartilhar links com o time
6. ⏭️ Monitorar uso e ajustar conforme necessário

---

## 🎯 Comandos Rápidos

### Deploy frontend:
```bash
cd frontend
vercel --prod
```

### Ver logs do backend (Railway):
```bash
# No dashboard do Railway > View Logs
```

### Testar localmente antes do deploy:
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```
