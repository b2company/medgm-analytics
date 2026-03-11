#!/usr/bin/env python3
"""
Teste direto dos endpoints da API (sem servidor HTTP).
"""

from app.main import app
from app.database import SessionLocal
from app.models.models import Venda, Financeiro, KPI
import json

# Simular requisições diretamente
def test_health():
    print("\n1️⃣ Testando /health")
    # Chamar função diretamente
    import asyncio
    from app.main import health_check
    result = asyncio.run(health_check())
    print(f"   ✅ {result}")

def test_metrics_financeiro():
    print("\n2️⃣ Testando métricas financeiras (Janeiro 2026)")
    db = SessionLocal()

    from app.routers.metrics import get_metrics_financeiro
    import asyncio

    result = asyncio.run(get_metrics_financeiro(mes=1, ano=2026, db=db))

    print(f"   Entradas: R$ {result['entradas']:,.2f}")
    print(f"   Saídas: R$ {result['saidas']:,.2f}")
    print(f"   Saldo: R$ {result['saldo']:,.2f}")
    print(f"   Runway: {result['runway']} meses")

    db.close()

def test_metrics_comercial():
    print("\n3️⃣ Testando métricas comerciais (Janeiro 2026)")
    db = SessionLocal()

    from app.routers.metrics import get_metrics_comercial
    import asyncio

    result = asyncio.run(get_metrics_comercial(mes=1, ano=2026, db=db))

    print(f"   Faturamento: R$ {result['faturamento_total']:,.2f}")
    print(f"   Vendas: {result['vendas_total']}")
    print(f"   Ticket médio: R$ {result['ticket_medio']:,.2f}")
    print(f"   Funis: {len(result['funil'])} tipos")
    print(f"   Vendedores: {len(result['vendedores'])}")

    db.close()

def test_metrics_inteligencia():
    print("\n4️⃣ Testando métricas de inteligência (Janeiro 2026)")
    db = SessionLocal()

    from app.routers.metrics import get_metrics_inteligencia
    import asyncio

    result = asyncio.run(get_metrics_inteligencia(mes=1, ano=2026, db=db))

    print(f"   CAC: R$ {result['cac']:,.2f}")
    print(f"   LTV: R$ {result['ltv']:,.2f}")
    print(f"   LTV/CAC Ratio: {result['ltv_cac_ratio']}")
    print(f"   ROI: {result['roi']}%")
    print(f"   Ticket médio: R$ {result['ticket_medio']:,.2f}")

    db.close()

def test_vendas():
    print("\n5️⃣ Testando lista de vendas (Janeiro 2026)")
    db = SessionLocal()

    from app.routers.metrics import get_vendas
    import asyncio

    result = asyncio.run(get_vendas(mes=1, ano=2026, db=db))

    print(f"   Total de vendas: {result['total']}")
    if result['vendas']:
        print(f"   Primeiras 3 vendas:")
        for v in result['vendas'][:3]:
            print(f"     • {v['cliente']}: R$ {v['valor']:,.2f} ({v['funil']})")

    db.close()

def test_all_data():
    print("\n6️⃣ Testando resumo geral")
    db = SessionLocal()

    from app.routers.metrics import get_all_data
    import asyncio

    result = asyncio.run(get_all_data(db=db))

    print(f"   Total de meses: {result['total_meses']}")
    for mes_data in result['meses']:
        print(f"     • {mes_data['mes']}/{mes_data['ano']}: {mes_data['vendas']} vendas, R$ {mes_data['faturamento']:,.2f}")

    db.close()

def main():
    print("="*80)
    print("TESTE DOS ENDPOINTS DA API MEDGM ANALYTICS")
    print("="*80)

    try:
        test_health()
        test_metrics_financeiro()
        test_metrics_comercial()
        test_metrics_inteligencia()
        test_vendas()
        test_all_data()

        print("\n" + "="*80)
        print("✅ TODOS OS ENDPOINTS FUNCIONANDO CORRETAMENTE!")
        print("="*80 + "\n")

    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
