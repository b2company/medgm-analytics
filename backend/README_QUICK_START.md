# MedGM Analytics Backend - Quick Start

## Instalação e Execução Rápida

### 1. Instalar Dependências
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
pip3 install -r requirements.txt
```

### 2. Importar Dados Iniciais
```bash
python3 data/seed/import_initial_data.py
```

### 3. Iniciar Servidor
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Acesse: `http://localhost:8000/docs` (Swagger UI)

---

## Endpoints Principais

### Saúde da API
```bash
curl http://localhost:8000/health
```

### Métricas Comerciais (Janeiro 2026)
```bash
curl "http://localhost:8000/metrics/comercial?mes=1&ano=2026"
```

### Métricas Financeiras (Janeiro 2026)
```bash
curl "http://localhost:8000/metrics/financeiro?mes=1&ano=2026"
```

### Métricas de Inteligência (CAC, LTV, ROI)
```bash
curl "http://localhost:8000/metrics/inteligencia?mes=1&ano=2026"
```

### Lista de Vendas
```bash
curl "http://localhost:8000/metrics/vendas?mes=1&ano=2026"
```

### Resumo de Todos os Meses
```bash
curl "http://localhost:8000/metrics/all"
```

---

## Upload de Planilhas

### Upload Comercial
```bash
curl -X POST "http://localhost:8000/upload/comercial" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/comercial.xlsx"
```

### Upload Financeiro
```bash
curl -X POST "http://localhost:8000/upload/financeiro" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/financeiro.xlsx"
```

---

## Testar API (Sem Servidor)
```bash
python3 test_api_direct.py
```

---

## Estrutura do Banco

- **vendas**: 64 registros (Jan + Fev 2026)
- **financeiro**: 72 registros (entradas/saídas)
- **kpis**: 2 registros (1 por mês)

---

## Métricas Atuais

**Janeiro 2026:**
- Faturamento: R$ 127,378.41
- Vendas: 33
- Ticket Médio: R$ 3,859.95

**Fevereiro 2026:**
- Faturamento: R$ 84,930.80
- Vendas: 31
- Ticket Médio: R$ 2,739.70

---

## Arquivos Importantes

- `app/main.py` - FastAPI app principal
- `app/models/models.py` - Modelos de dados (Venda, Financeiro, KPI)
- `app/parsers/` - Parsers para Excel
- `app/routers/` - Endpoints da API
- `data/seed/import_initial_data.py` - Script de importação
- `BACKEND_REPORT.md` - Documentação completa

---

## Problemas Comuns

### Erro: "command not found: python"
Use `python3` ao invés de `python`

### Erro: "ModuleNotFoundError: No module named 'fastapi'"
Execute: `pip3 install -r requirements.txt`

### Erro: "Database locked"
Feche outras conexões ao banco SQLite

---

Para documentação completa, veja `BACKEND_REPORT.md`
