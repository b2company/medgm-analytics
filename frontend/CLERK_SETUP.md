# Configuração do Clerk Authentication

Este guia explica como configurar a autenticação Clerk no MedGM Analytics.

## 📋 Pré-requisitos

- Conta no [Clerk](https://clerk.com) (gratuita)
- Node.js instalado
- Projeto MedGM Analytics clonado

## 🚀 Passo a Passo

### 1. Criar Aplicação no Clerk

1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Clique em **"+ Create Application"**
3. Nome da aplicação: **"MedGM Analytics"**
4. Selecione os métodos de autenticação:
   - ✅ Email
   - ✅ Google (opcional)
   - ✅ Password
5. Clique em **"Create Application"**

### 2. Obter as Chaves de API

No dashboard do Clerk:

1. Vá em **"API Keys"** no menu lateral
2. Copie a **Publishable Key** (começa com `pk_test_` ou `pk_live_`)
3. **NÃO compartilhe** a Secret Key publicamente

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione sua chave:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
   ```

### 4. Configurar Roles (Papéis)

Para habilitar controle de acesso baseado em papéis (Admin vs Usuário):

1. No dashboard Clerk, vá em **"Organizations"** → **"Settings"**
2. Habilite **"Organization Roles"**
3. Crie os papéis:
   - **admin**: Acesso total ao sistema
   - **user**: Acesso limitado (sem configurações)

### 5. Configurar URLs de Redirecionamento

No dashboard Clerk, em **"Paths"**:

1. **Sign-in URL**: `/sign-in`
2. **Sign-up URL**: `/sign-up`
3. **After sign-in URL**: `/comercial`
4. **After sign-up URL**: `/comercial`

### 6. Testar Autenticação

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:5173`

3. Você será redirecionado para `/sign-in`

4. Crie uma conta de teste

5. Após login, você verá o dashboard

### 7. Criar Primeiro Usuário Admin

Para criar o primeiro usuário administrador:

1. No dashboard Clerk, vá em **"Users"**
2. Clique no usuário criado
3. Em **"Metadata"** → **"Public Metadata"**, adicione:
   ```json
   {
     "orgRole": "admin"
   }
   ```
4. Salve as alterações

## 🔒 Recursos Implementados

### ✅ Páginas de Autenticação

- `/sign-in` - Login
- `/sign-up` - Cadastro
- Componente `ProtectedRoute` para proteger rotas

### ✅ Proteção de Rotas

Todas as rotas do dashboard estão protegidas. Acesso apenas após login.

### ✅ Controle de Acesso por Papel

```jsx
// Rota apenas para admins
<ProtectedRoute requireAdmin={true}>
  <ConfigPage />
</ProtectedRoute>
```

### ✅ Perfil de Usuário

- UserButton na sidebar com avatar
- Menu dropdown com:
  - Perfil
  - Configurações de conta
  - Sign out

## 🎨 Customização Visual

O Clerk está configurado com aparência personalizada:

```jsx
<SignIn
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "shadow-xl"
    }
  }}
/>
```

Para mais customizações, consulte: [Clerk Appearance](https://clerk.com/docs/components/appearance)

## 🔧 Backend (Opcional)

Para proteger endpoints do backend com Clerk:

### Python/FastAPI

1. Instale o SDK:
   ```bash
   pip install clerk-backend-api
   ```

2. Configure middleware:
   ```python
   from clerk_backend_api import Clerk

   clerk = Clerk(bearer_auth="sk_test_sua_secret_key")

   async def verify_token(token: str):
       try:
           session = clerk.sessions.verify_token(token)
           return session
       except Exception:
           raise HTTPException(status_code=401)
   ```

3. Proteja rotas:
   ```python
   @app.get("/api/comercial")
   async def get_comercial(
       authorization: str = Header(None)
   ):
       await verify_token(authorization)
       # ... resto do código
   ```

## 📚 Recursos Úteis

- [Documentação Clerk](https://clerk.com/docs)
- [React SDK](https://clerk.com/docs/references/react/overview)
- [Organizações e Roles](https://clerk.com/docs/organizations/overview)
- [Customização de UI](https://clerk.com/docs/components/appearance)

## 🐛 Troubleshooting

### Erro: "Missing Clerk Publishable Key"

- Verifique se o arquivo `.env` existe
- Confirme que a variável `VITE_CLERK_PUBLISHABLE_KEY` está definida
- Reinicie o servidor de desenvolvimento

### Redirecionamento em loop para /sign-in

- Verifique se a chave Publishable Key está correta
- Limpe o cache do navegador
- Verifique se o domínio está na lista de "Allowed origins" no Clerk

### UserButton não aparece

- Verifique se o usuário está autenticado: `const { isSignedIn } = useAuth()`
- Confirme que o ClerkProvider está envolvendo toda a aplicação

## 📞 Suporte

- Issues do Clerk: [github.com/clerk/javascript](https://github.com/clerk/javascript/issues)
- Documentação: [clerk.com/docs](https://clerk.com/docs)
- Discord da Clerk: [clerk.com/discord](https://clerk.com/discord)
