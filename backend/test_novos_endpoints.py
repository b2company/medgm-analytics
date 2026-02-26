#!/usr/bin/env python3
"""
Script de teste para os novos endpoints detalhados do Dashboard.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url):
    """Testa um endpoint e retorna resultado."""
    print(f"\n{'='*60}")
    print(f"Testando: {name}")
    print(f"URL: {url}")
    print('='*60)

    try:
        response = requests.get(url, timeout=5)

        if response.status_code == 200:
            data = response.json()
            print(f"✓ Status: {response.status_code} OK")
            print(f"✓ Resposta recebida: {len(json.dumps(data))} caracteres")

            # Mostrar estrutura da resposta
            print(f"\nEstrutura da resposta:")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:500] + "...")

            return True
        else:
            print(f"✗ Status: {response.status_code}")
            print(f"✗ Erro: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"✗ ERRO: Não foi possível conectar ao servidor em {BASE_URL}")
        print(f"  Certifique-se de que o backend está rodando: cd backend && uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"✗ ERRO: {str(e)}")
        return False

def main():
    print(f"\n{'#'*60}")
    print(f"# TESTE DOS NOVOS ENDPOINTS - DASHBOARD DETALHADO")
    print(f"# Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*60}")

    # Parâmetros de teste
    mes = 2
    ano = 2026

    endpoints = [
        ("Financeiro Detalhado", f"{BASE_URL}/metrics/financeiro/detalhado?mes={mes}&ano={ano}"),
        ("Comercial Detalhado", f"{BASE_URL}/metrics/comercial/detalhado?mes={mes}&ano={ano}"),
        ("Inteligência Detalhado", f"{BASE_URL}/metrics/inteligencia/detalhado?mes={mes}&ano={ano}"),
    ]

    resultados = []
    for name, url in endpoints:
        resultado = test_endpoint(name, url)
        resultados.append((name, resultado))

    # Sumário
    print(f"\n{'='*60}")
    print("SUMÁRIO DOS TESTES")
    print('='*60)

    total = len(resultados)
    passou = sum(1 for _, r in resultados if r)
    falhou = total - passou

    for name, resultado in resultados:
        status = "✓ PASSOU" if resultado else "✗ FALHOU"
        print(f"{status:15} - {name}")

    print(f"\nTotal: {total} testes | Passou: {passou} | Falhou: {falhou}")

    if falhou == 0:
        print("\n🎉 TODOS OS TESTES PASSARAM! Os novos endpoints estão funcionando.")
    else:
        print(f"\n⚠️  {falhou} teste(s) falharam. Verifique os erros acima.")

    return falhou == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
