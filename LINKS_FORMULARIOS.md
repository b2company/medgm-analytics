# Links dos Formulários Públicos - MedGM Analytics

Compartilhe estes links com seu time para que possam inserir dados diretamente, sem acessar o painel completo.

## 📋 Formulários Disponíveis

### Social Selling
**Link:** `https://seu-dominio.com/form/social-selling`

**Quem usa:** Vendedores de Social Selling (Jessica, Artur, Karina)

**Campos:**
- Data
- Vendedor
- Mês/Ano
- Ativações
- Conversões
- Leads Gerados

---

### SDR
**Link:** `https://seu-dominio.com/form/sdr`

**Quem usa:** SDRs (Fernando Dutra)

**Campos:**
- Data
- SDR
- Mês/Ano
- Funil
- Leads Recebidos
- Reuniões Agendadas
- Reuniões Realizadas

---

### Closer
**Link:** `https://seu-dominio.com/form/closer`

**Quem usa:** Closers (Fabio Lima, Mona Garcia)

**Campos:**
- Data
- Closer
- Mês/Ano
- Funil
- Calls Agendadas
- Calls Realizadas
- Vendas
- Booking
- Faturamento Bruto
- Faturamento Líquido

---

### Vendas
**Link:** `https://seu-dominio.com/form/vendas`

**Quem usa:** Closers e time comercial

**Campos:**
- Data
- Cliente
- Closer
- Funil
- Tipo Receita
- Produto
- Booking
- Previsto
- Valor Pago
- Valor Líquido

---

## 🔧 Configuração

### Localmente (desenvolvimento)
```
http://localhost:5173/form/social-selling
http://localhost:5173/form/sdr
http://localhost:5173/form/closer
http://localhost:5173/form/vendas
```

### Produção (após deploy)
Substitua `seu-dominio.com` pelo domínio real após o deploy.

---

## 🚀 Deploy Recomendado - Vercel

1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. No diretório do frontend:
```bash
cd frontend
vercel
```

3. Siga as instruções e confirme as configurações
4. O Vercel irá gerar um URL público automaticamente
5. Substitua os links acima pelo URL gerado

---

## ⚙️ Variáveis de Ambiente

Certifique-se de configurar a variável `VITE_API_URL` no Vercel apontando para o backend em produção.

**Exemplo:**
```
VITE_API_URL=https://seu-backend.herokuapp.com
```

---

## 📱 Mobile-Friendly

Todos os formulários são responsivos e funcionam perfeitamente em celulares.

---

## ✅ Benefícios

- ✅ Sem necessidade de login/senha
- ✅ Interface simples e direta
- ✅ Validação automática de campos
- ✅ Mensagens de sucesso/erro
- ✅ Mobile-friendly
- ✅ Dados vão direto para o banco
- ✅ Time não tem acesso ao painel completo
