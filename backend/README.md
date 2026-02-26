# MedGM Analytics - Backend

Backend API em FastAPI para plataforma de analytics da MedGM.

## Estrutura

```
backend/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py          # SQLAlchemy models (Venda, Financeiro, KPI)
│   ├── parsers/
│   │   ├── __init__.py
│   │   ├── comercial.py       # Parser para planilhas comerciais
│   │   └── financeiro.py      # Parser para planilhas financeiras
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── upload.py          # Endpoints de upload
│   │   └── metrics.py         # Endpoints de métricas
│   ├── database.py            # Configuração SQLAlchemy
│   ├── main.py                # FastAPI app
│   └── __init__.py
├── data/                      # SQLite database
├── uploads/                   # Arquivos temporários
├── requirements.txt
├── seed.py                    # Script de inicialização do DB
└── run.sh                     # Script para rodar servidor
```

## Setup

1. Criar virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
```

2. Instalar dependências:
```bash
pip install -r requirements.txt
```

3. Inicializar banco de dados:
```bash
python seed.py
```

4. Rodar servidor:
```bash
./run.sh
# ou
uvicorn app.main:app --reload --port 8000
```

## Endpoints

### Health Check
- `GET /health` - Status da API

### Upload
- `POST /upload/comercial` - Upload planilha comercial (Excel)
- `POST /upload/financeiro` - Upload planilha financeira (Excel)

### Metrics
- `GET /metrics/financeiro?mes=1&ano=2026` - Métricas financeiras
- `GET /metrics/comercial?mes=1&ano=2026` - Métricas comerciais
- `GET /metrics/inteligencia?mes=1&ano=2026` - CAC, LTV, projeções

## Estrutura dos Dados

### Tabela: vendas
- id, data, cliente, valor, funil, vendedor, mes, ano

### Tabela: financeiro
- id, tipo, categoria, valor, data, mes, ano, previsto_realizado, descricao

### Tabela: kpis
- id, mes, ano, faturamento, vendas_total, calls, leads, cac, ltv, runway

## Parsers

### ComercialParser
Processa planilhas comerciais com estrutura:
- Aba VENDAS: Data, Cliente, Valor, Funil, Vendedor

### FinanceiroParser
Processa planilhas financeiras com estrutura:
- Abas mensais (JAN 2026, FEV 2026, etc)
- Colunas: Tipo, Categoria, Valor, Data, Previsto/Realizado

## Desenvolvimento

API documentada automaticamente em:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
