# FASE 2 - Exemplos de Requisições API

Este documento contém exemplos práticos de requisições para testar os novos endpoints.

---

## Social Selling

### Criar Métrica
```bash
curl -X POST "http://localhost:8000/comercial/social-selling" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "vendedor": "João Silva",
    "ativacoes": 100,
    "conversoes": 50,
    "leads_gerados": 25,
    "meta_ativacoes": 120,
    "meta_leads": 30
  }'
```

### Listar Métricas do Mês
```bash
curl "http://localhost:8000/comercial/social-selling?mes=2&ano=2026"
```

### Atualizar Métrica
```bash
curl -X PUT "http://localhost:8000/comercial/social-selling/1" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "vendedor": "João Silva",
    "ativacoes": 120,
    "conversoes": 60,
    "leads_gerados": 30,
    "meta_ativacoes": 120,
    "meta_leads": 30
  }'
```

### Deletar Métrica
```bash
curl -X DELETE "http://localhost:8000/comercial/social-selling/1"
```

### Dashboard Consolidado
```bash
curl "http://localhost:8000/comercial/dashboard/social-selling?mes=2&ano=2026"
```

---

## SDR

### Criar Métrica
```bash
curl -X POST "http://localhost:8000/comercial/sdr" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "sdr": "Maria Santos",
    "funil": "SS",
    "leads_recebidos": 25,
    "reunioes_agendadas": 15,
    "reunioes_realizadas": 12,
    "meta_reunioes": 20
  }'
```

### Criar Várias Métricas (diferentes funis)
```bash
# Funil SS
curl -X POST "http://localhost:8000/comercial/sdr" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2, "ano": 2026, "sdr": "Maria Santos", "funil": "SS",
    "leads_recebidos": 25, "reunioes_agendadas": 15,
    "reunioes_realizadas": 12, "meta_reunioes": 20
  }'

# Funil Quiz
curl -X POST "http://localhost:8000/comercial/sdr" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2, "ano": 2026, "sdr": "Maria Santos", "funil": "Quiz",
    "leads_recebidos": 30, "reunioes_agendadas": 18,
    "reunioes_realizadas": 15, "meta_reunioes": 25
  }'

# Funil Indicação
curl -X POST "http://localhost:8000/comercial/sdr" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2, "ano": 2026, "sdr": "Carlos Oliveira", "funil": "Indicacao",
    "leads_recebidos": 20, "reunioes_agendadas": 16,
    "reunioes_realizadas": 14, "meta_reunioes": 18
  }'
```

### Listar Métricas
```bash
curl "http://localhost:8000/comercial/sdr?mes=2&ano=2026"
```

### Dashboard Consolidado
```bash
curl "http://localhost:8000/comercial/dashboard/sdr?mes=2&ano=2026"
```

---

## Closer

### Criar Métrica
```bash
curl -X POST "http://localhost:8000/comercial/closer" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "closer": "Pedro Costa",
    "funil": "SS",
    "calls_agendadas": 12,
    "calls_realizadas": 10,
    "vendas": 5,
    "faturamento": 25000.00,
    "meta_vendas": 8,
    "meta_faturamento": 40000.00
  }'
```

### Criar Várias Métricas (diferentes closers e funis)
```bash
# Pedro Costa - SS
curl -X POST "http://localhost:8000/comercial/closer" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2, "ano": 2026, "closer": "Pedro Costa", "funil": "SS",
    "calls_agendadas": 12, "calls_realizadas": 10, "vendas": 5,
    "faturamento": 25000.00, "meta_vendas": 8, "meta_faturamento": 40000.00
  }'

# Pedro Costa - Quiz
curl -X POST "http://localhost:8000/comercial/closer" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2, "ano": 2026, "closer": "Pedro Costa", "funil": "Quiz",
    "calls_agendadas": 15, "calls_realizadas": 12, "vendas": 6,
    "faturamento": 30000.00, "meta_vendas": 8, "meta_faturamento": 40000.00
  }'

# Ana Souza - Indicação
curl -X POST "http://localhost:8000/comercial/closer" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2, "ano": 2026, "closer": "Ana Souza", "funil": "Indicacao",
    "calls_agendadas": 14, "calls_realizadas": 12, "vendas": 8,
    "faturamento": 45000.00, "meta_vendas": 10, "meta_faturamento": 50000.00
  }'
```

### Listar Métricas
```bash
curl "http://localhost:8000/comercial/closer?mes=2&ano=2026"
```

### Dashboard Consolidado
```bash
curl "http://localhost:8000/comercial/dashboard/closer?mes=2&ano=2026"
```

---

## Vendas (Expandidas)

### Criar Venda com Campos Expandidos
```bash
curl -X POST "http://localhost:8000/crud/venda" \
  -H "Content-Type: application/json" \
  -d '{
    "data": "2026-02-24",
    "cliente": "Dr. Carlos Mendes",
    "valor": 5000.00,
    "funil": "SS",
    "vendedor": "João Silva",
    "mes": 2,
    "ano": 2026,
    "closer": "Pedro Costa",
    "tipo_receita": "Recorrencia",
    "produto": "Plano Gestão Completa",
    "booking": 60000.00,
    "previsto": 5000.00,
    "valor_pago": 5000.00,
    "valor_liquido": 4750.00
  }'
```

### Criar Venda Simples (sem campos expandidos)
```bash
curl -X POST "http://localhost:8000/crud/venda" \
  -H "Content-Type: application/json" \
  -d '{
    "data": "2026-02-24",
    "cliente": "Dra. Maria Silva",
    "valor": 3000.00,
    "funil": "Quiz",
    "vendedor": "João Silva",
    "mes": 2,
    "ano": 2026
  }'
```

---

## Testes de Validação

### Teste: Valor Negativo (deve falhar)
```bash
curl -X POST "http://localhost:8000/comercial/social-selling" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "vendedor": "Teste",
    "ativacoes": -100,
    "conversoes": 50,
    "leads_gerados": 25,
    "meta_ativacoes": 120,
    "meta_leads": 30
  }'
```

### Teste: Campo Obrigatório Faltando (deve falhar)
```bash
curl -X POST "http://localhost:8000/comercial/sdr" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "funil": "SS",
    "leads_recebidos": 25
  }'
```

### Teste: Atualizar Registro Inexistente (deve retornar 404)
```bash
curl -X PUT "http://localhost:8000/comercial/closer/9999" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2, "ano": 2026, "closer": "Teste", "funil": "SS",
    "calls_agendadas": 10, "calls_realizadas": 5, "vendas": 2,
    "faturamento": 10000.00, "meta_vendas": 5, "meta_faturamento": 20000.00
  }'
```

---

## Cenário Completo de Teste

Execute os comandos abaixo em sequência para criar um cenário completo:

```bash
# 1. Social Selling - João Silva
curl -X POST "http://localhost:8000/comercial/social-selling" \
  -H "Content-Type: application/json" \
  -d '{"mes": 2, "ano": 2026, "vendedor": "João Silva", "ativacoes": 150, "conversoes": 75, "leads_gerados": 40, "meta_ativacoes": 120, "meta_leads": 35}'

# 2. SDR - Maria Santos recebe leads do João
curl -X POST "http://localhost:8000/comercial/sdr" \
  -H "Content-Type: application/json" \
  -d '{"mes": 2, "ano": 2026, "sdr": "Maria Santos", "funil": "SS", "leads_recebidos": 40, "reunioes_agendadas": 25, "reunioes_realizadas": 20, "meta_reunioes": 30}'

# 3. Closer - Pedro Costa recebe reuniões da Maria
curl -X POST "http://localhost:8000/comercial/closer" \
  -H "Content-Type: application/json" \
  -d '{"mes": 2, "ano": 2026, "closer": "Pedro Costa", "funil": "SS", "calls_agendadas": 20, "calls_realizadas": 18, "vendas": 10, "faturamento": 50000.00, "meta_vendas": 12, "meta_faturamento": 60000.00}'

# 4. Registrar Vendas
curl -X POST "http://localhost:8000/crud/venda" \
  -H "Content-Type: application/json" \
  -d '{"data": "2026-02-15", "cliente": "Dr. João Paulo", "valor": 5000.00, "funil": "SS", "vendedor": "João Silva", "mes": 2, "ano": 2026, "closer": "Pedro Costa", "tipo_receita": "Recorrencia", "produto": "Plano Premium"}'

curl -X POST "http://localhost:8000/crud/venda" \
  -H "Content-Type: application/json" \
  -d '{"data": "2026-02-18", "cliente": "Dra. Ana Maria", "valor": 4500.00, "funil": "SS", "vendedor": "João Silva", "mes": 2, "ano": 2026, "closer": "Pedro Costa", "tipo_receita": "Venda", "produto": "Plano Standard"}'

# 5. Consultar Dashboards
echo "\n=== Dashboard Social Selling ==="
curl "http://localhost:8000/comercial/dashboard/social-selling?mes=2&ano=2026"

echo "\n=== Dashboard SDR ==="
curl "http://localhost:8000/comercial/dashboard/sdr?mes=2&ano=2026"

echo "\n=== Dashboard Closer ==="
curl "http://localhost:8000/comercial/dashboard/closer?mes=2&ano=2026"
```

---

## Exemplos em Python

Se preferir testar via Python:

```python
import requests

API_URL = "http://localhost:8000"

# Criar métrica de Social Selling
response = requests.post(
    f"{API_URL}/comercial/social-selling",
    json={
        "mes": 2,
        "ano": 2026,
        "vendedor": "João Silva",
        "ativacoes": 100,
        "conversoes": 50,
        "leads_gerados": 25,
        "meta_ativacoes": 120,
        "meta_leads": 30
    }
)
print(response.json())

# Consultar dashboard
response = requests.get(
    f"{API_URL}/comercial/dashboard/social-selling",
    params={"mes": 2, "ano": 2026}
)
print(response.json())
```

---

## Exemplos em JavaScript (Frontend)

```javascript
const API_URL = 'http://localhost:8000';

// Criar métrica de SDR
async function criarMetricaSDR() {
  const response = await fetch(`${API_URL}/comercial/sdr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mes: 2,
      ano: 2026,
      sdr: 'Maria Santos',
      funil: 'SS',
      leads_recebidos: 25,
      reunioes_agendadas: 15,
      reunioes_realizadas: 12,
      meta_reunioes: 20
    })
  });

  const data = await response.json();
  console.log(data);
}

// Consultar métricas
async function listarMetricas() {
  const response = await fetch(`${API_URL}/comercial/sdr?mes=2&ano=2026`);
  const data = await response.json();
  console.log(data);
}
```

---

## Verificação de Cálculos

### Social Selling
```
Entrada:
- ativacoes: 100
- conversoes: 50
- leads_gerados: 25

Esperado:
- tx_ativ_conv: 50.00% (50/100 * 100)
- tx_conv_lead: 50.00% (25/50 * 100)
```

### SDR
```
Entrada:
- leads_recebidos: 20
- reunioes_agendadas: 10
- reunioes_realizadas: 8

Esperado:
- tx_agendamento: 50.00% (10/20 * 100)
- tx_comparecimento: 80.00% (8/10 * 100)
```

### Closer
```
Entrada:
- calls_agendadas: 10
- calls_realizadas: 8
- vendas: 4
- faturamento: 20000.00

Esperado:
- tx_comparecimento: 80.00% (8/10 * 100)
- tx_conversao: 50.00% (4/8 * 100)
- ticket_medio: 5000.00 (20000/4)
```

---

## Troubleshooting

### Erro: Connection Refused
```bash
# Verificar se backend está rodando
curl http://localhost:8000/health

# Se não estiver, iniciar:
cd backend
uvicorn app.main:app --reload
```

### Erro: 422 Unprocessable Entity
- Verifique se todos os campos obrigatórios foram enviados
- Verifique se os tipos de dados estão corretos (int, float, string)
- Verifique se o JSON está formatado corretamente

### Erro: 404 Not Found
- Verifique se o ID existe no banco de dados
- Verifique se a URL está correta
- Verifique se o endpoint foi registrado no main.py

---

**Documentação Técnica Completa:** `FASE2_IMPLEMENTACAO.md`
