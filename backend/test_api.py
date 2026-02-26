#!/usr/bin/env python3
"""
Script de teste rápido da API MedGM Analytics.
Testa todos os principais endpoints.
"""

import requests
import json
import time
import subprocess
import sys
import signal
import os

BASE_URL = "http://localhost:8000"

def start_server():
    """Inicia o servidor FastAPI em background."""
    print("🚀 Iniciando servidor FastAPI...")
    proc = subprocess.Popen(
        ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd="/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend"
    )

    # Aguardar servidor iniciar
    max_retries = 10
    for i in range(max_retries):
        time.sleep(1)
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=1)
            if response.status_code == 200:
                print("✅ Servidor iniciado com sucesso!")
                return proc
        except:
            pass

    print("❌ Erro ao iniciar servidor")
    proc.kill()
    return None

def test_endpoints():
    """Testa todos os endpoints da API."""

    print("\n" + "="*80)
    print("TESTANDO ENDPOINTS DA API")
    print("="*80)

    # 1. Health check
    print("\n1️⃣ Testando /health")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")

    # 2. Métricas financeiras
    print("\n2️⃣ Testando /metrics/financeiro")
    response = requests.get(f"{BASE_URL}/metrics/financeiro?mes=1&ano=2026")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Entradas: R$ {data['entradas']:,.2f}")
    print(f"   Saídas: R$ {data['saidas']:,.2f}")
    print(f"   Saldo: R$ {data['saldo']:,.2f}")
    print(f"   Runway: {data['runway']} meses")

    # 3. Métricas comerciais
    print("\n3️⃣ Testando /metrics/comercial")
    response = requests.get(f"{BASE_URL}/metrics/comercial?mes=1&ano=2026")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Faturamento: R$ {data['faturamento_total']:,.2f}")
    print(f"   Vendas: {data['vendas_total']}")
    print(f"   Ticket médio: R$ {data['ticket_medio']:,.2f}")
    print(f"   Funis: {len(data['funil'])} tipos")

    # 4. Métricas de inteligência
    print("\n4️⃣ Testando /metrics/inteligencia")
    response = requests.get(f"{BASE_URL}/metrics/inteligencia?mes=1&ano=2026")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   CAC: R$ {data['cac']:,.2f}")
    print(f"   LTV: R$ {data['ltv']:,.2f}")
    print(f"   LTV/CAC Ratio: {data['ltv_cac_ratio']}")
    print(f"   ROI: {data['roi']}%")

    # 5. Lista de vendas
    print("\n5️⃣ Testando /metrics/vendas")
    response = requests.get(f"{BASE_URL}/metrics/vendas?mes=1&ano=2026")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Total de vendas: {data['total']}")
    if data['vendas']:
        print(f"   Primeira venda: {data['vendas'][0]['cliente']} - R$ {data['vendas'][0]['valor']:,.2f}")

    # 6. Resumo geral
    print("\n6️⃣ Testando /metrics/all")
    response = requests.get(f"{BASE_URL}/metrics/all")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Total de meses: {data['total_meses']}")
    for mes_data in data['meses']:
        print(f"     • {mes_data['mes']}/{mes_data['ano']}: {mes_data['vendas']} vendas, R$ {mes_data['faturamento']:,.2f}")

    print("\n" + "="*80)
    print("✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!")
    print("="*80 + "\n")

if __name__ == "__main__":
    proc = None
    try:
        proc = start_server()
        if proc:
            test_endpoints()
    except KeyboardInterrupt:
        print("\n⚠️ Teste interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante teste: {e}")
    finally:
        if proc:
            print("\n🛑 Encerrando servidor...")
            proc.terminate()
            proc.wait()
            print("✅ Servidor encerrado")
