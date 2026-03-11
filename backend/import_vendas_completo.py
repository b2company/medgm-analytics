"""
Importa vendas de Janeiro + Fevereiro 2026
Remove vendas antigas e reinsere com dados corretos
"""

import csv
import sys
import re
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.models import Venda

DATA_DIR = Path("/Users/odavi.feitosa/Downloads")

def limpar_moeda(valor_str):
    """Remove R$, pontos e converte vírgula em ponto"""
    if not valor_str or valor_str.strip() in ['', '-', '--']:
        return 0.0

    # Remove R$, espaços, pontos de milhar
    limpo = valor_str.replace('R$', '').replace('.', '').replace(' ', '').strip()
    # Substitui vírgula decimal por ponto
    limpo = limpo.replace(',', '.')

    try:
        return float(limpo)
    except ValueError:
        return 0.0

def parse_date(date_str):
    """Parse DD/MM/YYYY format"""
    if not date_str or date_str.strip() == '':
        return None

    try:
        return datetime.strptime(date_str.strip(), '%d/%m/%Y').date()
    except ValueError:
        print(f"⚠️  Data inválida: {date_str}")
        return None

def normalizar_closer(closer_str):
    """Converte '-' ou '--' em None"""
    if not closer_str or closer_str.strip() in ['-', '--', '']:
        return None
    return closer_str.strip()

def importar_vendas(db):
    print("="*60)
    print("IMPORTANDO VENDAS - JANEIRO + FEVEREIRO 2026")
    print("="*60)

    # Limpar vendas antigas
    count_old = db.query(Venda).count()
    db.query(Venda).delete()
    db.commit()
    print(f"✓ {count_old} vendas antigas deletadas\n")

    csv_path = DATA_DIR / "Entradas consolidado - vendas_jan2026.csv"

    count_jan = 0
    count_fev = 0
    count_2025 = 0
    errors = 0

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        for row in reader:
            data_obj = parse_date(row['DATA'])
            if not data_obj:
                errors += 1
                continue

            # Filtrar apenas 2026 (ignorar vendas de 2025)
            if data_obj.year != 2026:
                count_2025 += 1
                continue

            # Parse valores
            previsto = limpar_moeda(row.get('PREVISTO', '0'))
            valor_pago = limpar_moeda(row.get('VALOR_PAGO', '0'))
            valor_liquido = limpar_moeda(row.get('VALOR_LIQUIDO', '0'))

            # BOOKING = VALOR_PAGO (valor do contrato fechado)
            booking = valor_pago

            # VALOR_BRUTO = VALOR_PAGO
            valor_bruto = valor_pago

            # VALOR = VALOR_LIQUIDO (ou VALOR_PAGO se não tiver líquido)
            valor = valor_liquido if valor_liquido > 0 else valor_pago

            # Closer (NULL se for '-' ou '--')
            closer = normalizar_closer(row.get('CLOSER', ''))

            # Funil (NULL se vazio)
            funil = row.get('FUNIL', '').strip() if row.get('FUNIL', '').strip() not in ['-', '--', ''] else None

            venda = Venda(
                data=data_obj,
                mes=data_obj.month,
                ano=data_obj.year,
                cliente=row['CLIENTE'].strip(),
                closer=closer,
                funil=funil,
                tipo_receita=row.get('TIPO_RECEITA', '').strip(),
                produto=row.get('PRODUTO', '').strip(),
                booking=booking,
                valor_bruto=valor_bruto,
                valor_pago=valor_pago,
                valor_liquido=valor_liquido,
                previsto=previsto,
                valor=valor
            )
            db.add(venda)

            if data_obj.month == 1:
                count_jan += 1
            elif data_obj.month == 2:
                count_fev += 1

    db.commit()

    print(f"✅ VENDAS IMPORTADAS:")
    print(f"   ├─ Janeiro 2026: {count_jan} vendas")
    print(f"   └─ Fevereiro 2026: {count_fev} vendas")
    print(f"\n⏭️  Ignoradas:")
    print(f"   ├─ Vendas de 2025: {count_2025}")
    print(f"   └─ Erros de data: {errors}")
    print(f"\n✓ Total válido: {count_jan + count_fev}\n")

if __name__ == "__main__":
    db = SessionLocal()

    try:
        importar_vendas(db)
        print("="*60)
        print("✅ IMPORTAÇÃO CONCLUÍDA!")
        print("="*60)

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()
