"""
Script para testar os parsers de Excel.
"""

import os
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

def test_comercial_parser():
    """Test comercial parser with sample file"""
    from app.parsers.comercial import ComercialParser
    
    # This would need a real Excel file to test
    print("ComercialParser loaded successfully")
    print("Expected structure: Aba VENDAS com colunas [Data, Cliente, Valor, Funil, Vendedor]")
    return True

def test_financeiro_parser():
    """Test financeiro parser with sample file"""
    from app.parsers.financeiro import FinanceiroParser
    
    # This would need a real Excel file to test
    print("FinanceiroParser loaded successfully")
    print("Expected structure: Abas mensais (JAN 2026, FEV 2026) com colunas [Tipo, Categoria, Valor, Data]")
    return True

def test_models():
    """Test database models"""
    from app.models.models import Venda, Financeiro, KPI
    
    print("Models loaded successfully:")
    print(f"  - Venda: {Venda.__tablename__}")
    print(f"  - Financeiro: {Financeiro.__tablename__}")
    print(f"  - KPI: {KPI.__tablename__}")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Testing MedGM Analytics Backend Components")
    print("=" * 60)
    
    tests = [
        ("Models", test_models),
        ("Comercial Parser", test_comercial_parser),
        ("Financeiro Parser", test_financeiro_parser),
    ]
    
    for name, test_func in tests:
        print(f"\nTesting {name}...")
        try:
            test_func()
            print(f"✓ {name} OK")
        except Exception as e:
            print(f"✗ {name} FAILED: {e}")
    
    print("\n" + "=" * 60)
    print("All tests completed!")
    print("=" * 60)
