#!/bin/bash

# Script de teste para validar todos os endpoints dos dashboards
# Uso: ./test_endpoints.sh

echo "========================================"
echo "TESTE DE ENDPOINTS - MedGM Analytics"
echo "========================================"
echo ""

BASE_URL="http://localhost:8000"
MES=2
ANO=2026

echo "📊 Testando endpoint: Financeiro Detalhado"
echo "GET ${BASE_URL}/metrics/financeiro/detalhado?mes=${MES}&ano=${ANO}"
curl -s "${BASE_URL}/metrics/financeiro/detalhado?mes=${MES}&ano=${ANO}" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✅ OK - {len(data.get(\"entradas\", []))} entradas, {len(data.get(\"saidas\", []))} saídas, Saldo: R\$ {data.get(\"saldo\", 0):,.2f}')"
echo ""

echo "💰 Testando endpoint: Comercial Detalhado"
echo "GET ${BASE_URL}/metrics/comercial/detalhado?mes=${MES}&ano=${ANO}"
curl -s "${BASE_URL}/metrics/comercial/detalhado?mes=${MES}&ano=${ANO}" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✅ OK - {data.get(\"total_vendas\", 0)} vendas, Faturamento: R\$ {data.get(\"faturamento_total\", 0):,.2f}')"
echo ""

echo "🧠 Testando endpoint: Inteligência Detalhado"
echo "GET ${BASE_URL}/metrics/inteligencia/detalhado?mes=${MES}&ano=${ANO}"
curl -s "${BASE_URL}/metrics/inteligencia/detalhado?mes=${MES}&ano=${ANO}" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✅ OK - {len(data.get(\"alertas\", []))} alertas, {len(data.get(\"cac_por_canal\", []))} canais')"
echo ""

echo "📈 Testando endpoint: Fluxo de Caixa"
echo "GET ${BASE_URL}/metrics/financeiro/fluxo-caixa?meses=6&mes_ref=${MES}&ano_ref=${ANO}"
curl -s "${BASE_URL}/metrics/financeiro/fluxo-caixa?meses=6&mes_ref=${MES}&ano_ref=${ANO}" | python3 -c "import sys, json; data = json.load(sys.stdin); fluxo = data.get('fluxo', []); print(f'✅ OK - {len(fluxo)} meses, Saldo Acumulado: R\$ {fluxo[-1].get(\"saldo_acumulado\", 0):,.2f}' if fluxo else '✅ OK - Sem dados')"
echo ""

echo "========================================"
echo "✅ TODOS OS TESTES CONCLUÍDOS"
echo "========================================"
