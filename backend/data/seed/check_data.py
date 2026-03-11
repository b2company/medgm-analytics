"""
Script de verificação rápida dos dados importados.
Útil para validar a integridade após importações.

Uso: python3 check_data.py
"""

import sys
from pathlib import Path

# Add parent directories to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.models import Venda, Financeiro, KPI
from sqlalchemy import func


def main():
    """Verifica dados no banco de dados"""
    db = SessionLocal()

    try:
        print("\n" + "="*60)
        print("VERIFICAÇÃO RÁPIDA DO BANCO DE DADOS")
        print("="*60 + "\n")

        # Contagem de registros
        vendas_count = db.query(func.count(Venda.id)).scalar()
        financeiro_count = db.query(func.count(Financeiro.id)).scalar()
        kpis_count = db.query(func.count(KPI.id)).scalar()

        print("📊 Total de Registros:")
        print(f"  • Vendas: {vendas_count}")
        print(f"  • Financeiro: {financeiro_count}")
        print(f"  • KPIs: {kpis_count}")
        print(f"  • TOTAL: {vendas_count + financeiro_count + kpis_count}")
        print()

        # KPIs resumidos
        print("📈 KPIs por Mês:")
        kpis = db.query(KPI).order_by(KPI.ano, KPI.mes).all()
        for kpi in kpis:
            mes_nome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][kpi.mes - 1]
            print(f"  • {mes_nome}/{kpi.ano}: "
                  f"{kpi.vendas_total} vendas | "
                  f"R$ {kpi.faturamento:,.2f} faturamento")
        print()

        # Status
        if vendas_count > 0 and financeiro_count > 0:
            print("✓ Banco de dados está populado e funcional")
        else:
            print("⚠️ Banco de dados vazio - execute import_initial_data.py")

        print("\n" + "="*60 + "\n")

    finally:
        db.close()


if __name__ == "__main__":
    main()
