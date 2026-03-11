# Quick Start - MedGM Analytics Backend

## Setup Rápido

```bash
# 1. Criar virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Inicializar banco de dados
python3 seed.py

# 4. Rodar servidor
./run.sh
```

## Comandos Úteis

### Desenvolvimento
```bash
# Rodar servidor com reload automático
uvicorn app.main:app --reload --port 8000

# Rodar em outra porta
uvicorn app.main:app --reload --port 8080

# Rodar sem reload (produção)
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Database
```bash
# Inicializar database
python3 -c "from app.database import init_db; init_db()"

# Resetar database (CUIDADO: apaga todos os dados!)
python3 -c "from app.database import reset_db; reset_db()"

# Verificar tabelas
python3 -c "from app.models.models import *; from app.database import engine; print([table for table in Base.metadata.tables.keys()])"
```

### Testes
```bash
# Testar parsers
python3 test_parsers.py

# Testar API
curl http://localhost:8000/health

# Testar endpoint de métricas
curl "http://localhost:8000/metrics/comercial?mes=1&ano=2026"
```

### Upload de Arquivos
```bash
# Upload comercial
curl -X POST "http://localhost:8000/upload/comercial" \
  -F "file=@planilha_comercial.xlsx"

# Upload financeiro
curl -X POST "http://localhost:8000/upload/financeiro" \
  -F "file=@planilha_financeiro.xlsx"
```

## URLs Importantes

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## Estrutura das Planilhas

### Comercial (Excel)
**Aba VENDAS:**
| Data       | Cliente      | Valor   | Funil   | Vendedor |
|------------|--------------|---------|---------|----------|
| 01/01/2026 | Cliente A    | 5000.00 | Funil A | João     |
| 02/01/2026 | Cliente B    | 3000.00 | Funil B | Maria    |

### Financeiro (Excel)
**Aba JAN 2026:**
| Tipo    | Categoria | Valor   | Data       | Previsto/Realizado |
|---------|-----------|---------|------------|--------------------|
| entrada | Vendas    | 5000.00 | 15/01/2026 | realizado          |
| saida   | Marketing | 2000.00 | 10/01/2026 | realizado          |

## Troubleshooting

### Port já em uso
```bash
# Verificar processo na porta 8000
lsof -i :8000

# Matar processo
kill -9 <PID>
```

### Erro de importação
```bash
# Verificar se está no diretório correto
pwd  # Deve estar em /backend/

# Verificar se venv está ativo
which python3  # Deve apontar para venv
```

### Database locked
```bash
# Fechar todas as conexões e reiniciar
rm data/medgm_analytics.db
python3 seed.py
```

## Logs

Para ver logs detalhados, edite `app/parsers/comercial.py` ou `financeiro.py` e ajuste:
```python
logging.basicConfig(level=logging.DEBUG)  # Era INFO
```

## Próximos Passos

1. Importe dados reais via `/upload/comercial` e `/upload/financeiro`
2. Verifique os dados via endpoints de métricas
3. Integre com frontend em http://localhost:5173
