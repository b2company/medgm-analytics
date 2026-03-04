# 📖 Guia Completo: Configurar Google Sheets API

Siga este guia passo a passo para conectar sua planilha ao sistema.

---

## PASSO 1: Criar Projeto no Google Cloud

### 1.1 - Acessar Google Cloud Console
1. Abra seu navegador
2. Acesse: https://console.cloud.google.com/
3. Faça login com sua conta Google (a mesma da planilha)

### 1.2 - Criar Novo Projeto
1. No topo da página, clique na **seta para baixo** ao lado do nome do projeto atual
2. Na janela que abrir, clique em **"NEW PROJECT"** (canto superior direito)
3. Preencha:
   - **Project name**: `MedGM Analytics` (ou outro nome que preferir)
   - **Organization**: pode deixar sem organização
   - **Location**: deixe como está
4. Clique em **"CREATE"**
5. Aguarde alguns segundos até o projeto ser criado
6. Você verá uma notificação no sino (🔔) no topo direito
7. Clique na notificação para ir para o novo projeto

---

## PASSO 2: Habilitar APIs Necessárias

### 2.1 - Habilitar Google Sheets API
1. No menu lateral esquerdo (☰), vá em: **APIs & Services** > **Library**
   - Ou acesse direto: https://console.cloud.google.com/apis/library
2. Na barra de busca, digite: `Google Sheets API`
3. Clique no card **"Google Sheets API"**
4. Clique no botão azul **"ENABLE"**
5. Aguarde alguns segundos (a página vai recarregar)

### 2.2 - Habilitar Google Drive API
1. Clique em **"← ENABLE APIS AND SERVICES"** (canto superior esquerdo)
   - Ou volte para: https://console.cloud.google.com/apis/library
2. Na barra de busca, digite: `Google Drive API`
3. Clique no card **"Google Drive API"**
4. Clique no botão azul **"ENABLE"**
5. Aguarde alguns segundos

---

## PASSO 3: Criar Service Account

### 3.1 - Ir para Credentials
1. No menu lateral esquerdo (☰), vá em: **APIs & Services** > **Credentials**
   - Ou acesse direto: https://console.cloud.google.com/apis/credentials

### 3.2 - Criar Service Account
1. No topo da página, clique em **"+ CREATE CREDENTIALS"**
2. No menu que abrir, selecione **"Service account"**

### 3.3 - Preencher Detalhes
Na tela "Service account details":
1. **Service account name**: `medgm-sheets-reader`
2. **Service account ID**: (vai preencher automaticamente)
3. **Service account description**: `Lê dados das planilhas de marketing`
4. Clique em **"CREATE AND CONTINUE"**

### 3.4 - Pular Permissões (Opcional)
1. Na tela "Grant this service account access to project":
   - **NÃO precisa selecionar nada**
   - Clique em **"CONTINUE"** (pular esta etapa)

### 3.5 - Pular Acesso de Usuário (Opcional)
1. Na tela "Grant users access to this service account":
   - **NÃO precisa preencher nada**
   - Clique em **"DONE"**

---

## PASSO 4: Baixar Credenciais JSON

### 4.1 - Acessar Service Account
1. Você voltará para a página de Credentials
2. Role para baixo até a seção **"Service Accounts"**
3. Você verá sua service account `medgm-sheets-reader@...`
4. Clique no **email** da service account (linha inteira é clicável)

### 4.2 - Criar Chave
1. Na página da service account, clique na aba **"KEYS"** (no topo)
2. Clique em **"ADD KEY"** > **"Create new key"**
3. Na janela que abrir:
   - Selecione **"JSON"** (deve estar selecionado por padrão)
   - Clique em **"CREATE"**
4. Um arquivo JSON será **baixado automaticamente** para sua pasta de Downloads
   - O nome do arquivo será algo como: `medgm-analytics-123abc456def.json`

### 4.3 - Copiar Email do Service Account
**IMPORTANTE: Você vai precisar deste email no próximo passo!**

1. Ainda na página da service account
2. Na seção "Service account details"
3. **COPIE o email** (algo como `medgm-sheets-reader@medgm-analytics.iam.gserviceaccount.com`)
4. Cole em um bloco de notas temporariamente

---

## PASSO 5: Mover Arquivo de Credenciais

### 5.1 - Localizar Arquivo Baixado
1. Abra sua pasta de **Downloads**
2. Encontre o arquivo JSON que acabou de baixar
   - Nome parecido com: `medgm-analytics-123abc456def.json`

### 5.2 - Renomear e Mover
**No Terminal/Prompt de Comando:**

```bash
# Ir para a pasta de Downloads
cd ~/Downloads

# Listar arquivos para encontrar o nome exato
ls -la medgm*.json

# Renomear e mover para a pasta backend
mv medgm-analytics-*.json ~/Desktop/Projetos_Dev/gerador-ads/medgm-analytics/backend/google-credentials.json
```

**OU usando o Finder (Mac) / Explorer (Windows):**

1. Renomeie o arquivo para: `google-credentials.json`
2. Arraste o arquivo para a pasta:
   ```
   /Users/odavi.feitosa/Desktop/Projetos_Dev/gerador-ads/medgm-analytics/backend/
   ```

### 5.3 - Verificar
No terminal, verifique se o arquivo está no lugar certo:

```bash
ls -la ~/Desktop/Projetos_Dev/gerador-ads/medgm-analytics/backend/google-credentials.json
```

Deve mostrar o arquivo com tamanho aproximado de 2-3 KB.

---

## PASSO 6: Compartilhar Planilha com Service Account

### 6.1 - Abrir Planilha
1. Abra sua planilha do Google Sheets:
   - https://docs.google.com/spreadsheets/d/1MCoJQ_sDEO4kFgsIGExDIsiI2l3gYT4MHvz8urGt9Aw/edit

### 6.2 - Compartilhar
1. No canto superior direito, clique no botão verde **"Compartilhar"** (ou **"Share"**)
2. Na janela que abrir:
   - No campo "Adicionar pessoas e grupos", **cole o email** do service account
     - (aquele email que você copiou no Passo 4.3)
     - Exemplo: `medgm-sheets-reader@medgm-analytics.iam.gserviceaccount.com`
3. Clique na pessoa/email que apareceu
4. **IMPORTANTE**: No dropdown ao lado, selecione **"Viewer"** (Visualizador)
   - NÃO selecione "Editor"
5. **DESMARQUE** a caixa "Notify people" (não precisa enviar email)
6. Clique em **"Share"** ou **"Compartilhar"**

### 6.3 - Confirmar
Você verá o email do service account na lista de pessoas com acesso à planilha.

---

## PASSO 7: Instalar Dependências

### 7.1 - Ir para pasta backend
```bash
cd ~/Desktop/Projetos_Dev/gerador-ads/medgm-analytics/backend
```

### 7.2 - Instalar bibliotecas Python
```bash
pip install gspread google-auth google-auth-oauthlib google-auth-httplib2
```

Aguarde a instalação terminar (pode levar 1-2 minutos).

---

## PASSO 8: Testar a Integração

### 8.1 - Iniciar Backend
```bash
# Na pasta backend
cd ~/Desktop/Projetos_Dev/gerador-ads/medgm-analytics/backend

# Iniciar servidor
python -m uvicorn app.main:app --reload --port 8000
```

Aguarde até ver:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 8.2 - Testar Endpoint
**Abra um NOVO terminal** e rode:

```bash
# Teste 1: Sincronizar todas as métricas
curl http://localhost:8000/google-sheets/sync-metrics

# Teste 2: Buscar dados de Captura de Lead
curl http://localhost:8000/google-sheets/captura-lead

# Teste 3: Buscar dados de Venda Direta
curl http://localhost:8000/google-sheets/venda-direta

# Teste 4: Filtrar por mês
curl "http://localhost:8000/google-sheets/captura-lead?mes=3&ano=2025"
```

### 8.3 - Resultado Esperado
Você deve ver um JSON com os dados da planilha:

```json
{
  "dados_diarios": [
    {
      "data": "2025-02-26",
      "valor_gasto": 9.53,
      "leads": 0,
      "cliques": 229,
      ...
    }
  ],
  "totais": {
    "valor_gasto": 784.05,
    "leads": 4,
    "cpl": 196.01,
    ...
  },
  "tipo": "captura_lead"
}
```

---

## ✅ Pronto!

Se você conseguiu ver os dados no Teste 2 ou 3, a integração está funcionando!

## 🆘 Problemas Comuns

### Erro: "Arquivo google-credentials.json não encontrado"
**Solução**: Verifique se o arquivo está em:
```bash
ls ~/Desktop/Projetos_Dev/gerador-ads/medgm-analytics/backend/google-credentials.json
```

### Erro: "Permission denied" ou "403"
**Solução**:
1. Verifique se você compartilhou a planilha com o email correto do service account
2. Abra a planilha e veja se o email está na lista de pessoas com acesso

### Erro: "Worksheet not found"
**Solução**: Verifique se os nomes das abas estão exatamente assim:
- `[QUIZ] [SE] Métricas de Trafego`
- `[ISCA] [SCRIPT] Métricas de Trafego`

### Erro ao instalar bibliotecas
**Solução**: Certifique-se de estar usando Python 3.8 ou superior:
```bash
python --version
```

---

## 📞 Próximo Passo

Depois de testar e confirmar que está funcionando, me avise que eu:
- Adapto o frontend para usar esses dados
- Crio os dashboards de Venda Direta e Captura de Lead com os dados da planilha
- Adiciono botão de sincronização manual
