# MedGM Analytics API - Exemplos de Uso

## Base URL
```
http://localhost:8000
```

## Documentação Interativa
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### 1. Health Check

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "MedGM Analytics API",
  "version": "1.0.0"
}
```

### 2. Upload Planilha Comercial

```bash
curl -X POST "http://localhost:8000/upload/comercial" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@planilha_comercial.xlsx"
```

Response:
```json
{
  "success": true,
  "message": "15 vendas importadas com sucesso",
  "vendas_imported": 15,
  "summary": {
    "total_vendas": 15,
    "faturamento_total": 45000.0,
    "vendedores": ["João", "Maria"],
    "funis": ["Funil A", "Funil B"]
  },
  "warnings": []
}
```

### 3. Upload Planilha Financeira

```bash
curl -X POST "http://localhost:8000/upload/financeiro" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@planilha_financeiro.xlsx"
```

Response:
```json
{
  "success": true,
  "message": "45 movimentações importadas com sucesso",
  "movimentacoes_imported": 45,
  "summary": {
    "total_movimentacoes": 45,
    "entradas": 120000.0,
    "saidas": 85000.0,
    "saldo": 35000.0,
    "categorias": ["Vendas", "Marketing", "Salários"]
  },
  "warnings": []
}
```

### 4. Métricas Financeiras

```bash
curl "http://localhost:8000/metrics/financeiro?mes=1&ano=2026"
```

Response:
```json
{
  "mes": 1,
  "ano": 2026,
  "entradas": 120000.0,
  "saidas": 85000.0,
  "saldo": 35000.0,
  "runway": 4.1,
  "entradas_por_categoria": {
    "Vendas": 100000.0,
    "Consultoria": 20000.0
  },
  "saidas_por_categoria": {
    "Salários": 50000.0,
    "Marketing": 20000.0,
    "Operacional": 15000.0
  }
}
```

### 5. Métricas Comerciais

```bash
curl "http://localhost:8000/metrics/comercial?mes=1&ano=2026"
```

Response:
```json
{
  "mes": 1,
  "ano": 2026,
  "faturamento_total": 100000.0,
  "vendas_total": 20,
  "ticket_medio": 5000.0,
  "funil": {
    "Funil A": {
      "vendas": 12,
      "faturamento": 60000.0
    },
    "Funil B": {
      "vendas": 8,
      "faturamento": 40000.0
    }
  },
  "vendedores": {
    "João": {
      "vendas": 13,
      "faturamento": 65000.0
    },
    "Maria": {
      "vendas": 7,
      "faturamento": 35000.0
    }
  }
}
```

### 6. Métricas de Inteligência

```bash
curl "http://localhost:8000/metrics/inteligencia?mes=1&ano=2026"
```

Response:
```json
{
  "mes": 1,
  "ano": 2026,
  "cac": 1000.0,
  "ltv": 60000.0,
  "roi": 400.0,
  "ticket_medio": 5000.0,
  "projecao_faturamento": 95000.0,
  "ltv_cac_ratio": 60.0
}
```

## Python Examples

### Upload usando Python

```python
import requests

# Upload comercial
with open('planilha_comercial.xlsx', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/upload/comercial', files=files)
    print(response.json())

# Upload financeiro
with open('planilha_financeiro.xlsx', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/upload/financeiro', files=files)
    print(response.json())
```

### Buscar métricas usando Python

```python
import requests

# Métricas financeiras
response = requests.get('http://localhost:8000/metrics/financeiro', 
                       params={'mes': 1, 'ano': 2026})
print(response.json())

# Métricas comerciais
response = requests.get('http://localhost:8000/metrics/comercial',
                       params={'mes': 2, 'ano': 2026})
print(response.json())

# Métricas de inteligência
response = requests.get('http://localhost:8000/metrics/inteligencia',
                       params={'mes': 1, 'ano': 2026})
print(response.json())
```

## Estrutura das Planilhas

### Planilha Comercial
- **Aba VENDAS** (obrigatória)
  - Colunas: Data, Cliente, Valor, Funil, Vendedor

### Planilha Financeira
- **Abas mensais** (JAN 2026, FEV 2026, etc)
  - Colunas: Tipo, Categoria, Valor, Data, Previsto/Realizado (opcional), Descrição (opcional)
  - Tipo: "entrada" ou "saida"

## Erros Comuns

### Arquivo inválido
```json
{
  "detail": "Arquivo deve ser Excel (.xlsx ou .xls)"
}
```

### Planilha sem aba obrigatória
```json
{
  "success": false,
  "message": "Erro ao processar planilha",
  "errors": ["Aba 'VENDAS' não encontrada na planilha"]
}
```

### Parâmetros inválidos
```json
{
  "detail": [
    {
      "loc": ["query", "mes"],
      "msg": "ensure this value is greater than or equal to 1",
      "type": "value_error.number.not_ge"
    }
  ]
}
```
