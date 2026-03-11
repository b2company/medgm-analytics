# Configuração do Google Sheets API

Para integrar com Google Sheets, você precisa configurar credenciais do Google Cloud.

## Passo a Passo:

### 1. Criar Service Account no Google Cloud

1. Acesse https://console.cloud.google.com/
2. Crie um novo projeto (ou selecione um existente)
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **Service Account**
5. Preencha:
   - Nome: `medgm-analytics-sheets`
   - Descrição: `Service account para ler planilhas do Google Sheets`
6. Clique em **Create and Continue**
7. Pule as permissões (pode deixar em branco)
8. Clique em **Done**

### 2. Baixar Credenciais JSON

1. Na lista de Service Accounts, clique na que você acabou de criar
2. Vá na aba **Keys**
3. Clique em **Add Key** > **Create new key**
4. Selecione **JSON**
5. Clique em **Create**
6. Um arquivo JSON será baixado automaticamente

### 3. Configurar no Projeto

1. Renomeie o arquivo baixado para `google-credentials.json`
2. Mova o arquivo para a pasta `backend/`:
   ```
   mv ~/Downloads/medgm-analytics-*.json backend/google-credentials.json
   ```

### 4. Habilitar Google Sheets API

1. No Google Cloud Console, vá em **APIs & Services** > **Library**
2. Procure por "Google Sheets API"
3. Clique em **Enable**
4. Procure por "Google Drive API"
5. Clique em **Enable**

### 5. Compartilhar Planilha com Service Account

1. Abra o arquivo `backend/google-credentials.json`
2. Copie o email que está no campo `client_email` (algo como `medgm-analytics-sheets@project-id.iam.gserviceaccount.com`)
3. Abra sua planilha do Google Sheets
4. Clique em **Compartilhar**
5. Cole o email do service account
6. Selecione permissão **Viewer** (somente leitura)
7. Clique em **Enviar**

## Testando a Integração

Depois de configurar, teste os endpoints:

```bash
# Teste 1: Sincronizar todas as métricas
curl http://localhost:8000/google-sheets/sync-metrics

# Teste 2: Buscar métricas de Captura de Lead
curl http://localhost:8000/google-sheets/captura-lead

# Teste 3: Buscar métricas de Venda Direta
curl http://localhost:8000/google-sheets/venda-direta

# Teste 4: Filtrar por mês
curl http://localhost:8000/google-sheets/captura-lead?mes=3&ano=2025
```

## Estrutura das Respostas

### Captura de Lead (Quiz/SE)
```json
{
  "dados_diarios": [
    {
      "data": "2025-02-26",
      "dia": 26,
      "mes": 2,
      "ano": 2025,
      "valor_gasto": 9.53,
      "leads": 0,
      "cpl": 0,
      "cliques": 229,
      "cpc": 0.04,
      "ctr": 35.45,
      "cpm": 14.75,
      "impressoes": 646,
      ...
    }
  ],
  "totais": {
    "valor_gasto": 784.05,
    "leads": 4,
    "cpl": 196.01,
    "cliques": 902,
    "cpc": 0.87,
    "ctr": 7.42,
    "cpm": 64.50,
    "impressoes": 12067
  },
  "tipo": "captura_lead"
}
```

### Venda Direta (Isca/Script)
```json
{
  "dados_diarios": [...],
  "totais": {
    "valor_gasto": 516.83,
    "vendas": 9,
    "cpa": 57.43,
    "cliques": 249,
    "cpc": 2.08,
    "ctr": 2.38,
    "cpm": 52.90,
    "impressoes": 9616,
    "init_checkout": 13,
    "roas": 0,
    "faturamento": 0
  },
  "tipo": "venda_direta"
}
```

## Troubleshooting

**Erro: "Arquivo google-credentials.json não encontrado"**
- Certifique-se de que o arquivo está na pasta `backend/` (não em subpastas)

**Erro: "Permission denied"**
- Verifique se você compartilhou a planilha com o email do service account
- Verifique se as APIs (Sheets e Drive) estão habilitadas no Google Cloud

**Erro: "Worksheet not found"**
- Verifique se os nomes das abas estão corretos:
  - `[QUIZ] [SE] Métricas de Trafego`
  - `[ISCA] [SCRIPT] Métricas de Trafego`
