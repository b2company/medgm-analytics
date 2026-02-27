"""
Atualiza dados de Closer Janeiro com faturamento_liquido correto
"""

import csv
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.models import CloserMetrica
from sqlalchemy import func

DATA_DIR = Path("/Users/odavi.feitosa/Downloads")

def parse_float(value):
    if not value or value.strip() == '':
        return 0.0
    try:
        # Remove espaços, pontos de milhar, e substitui vírgula por ponto
        clean_value = value.strip().replace('.', '').replace(',', '.')
        return float(clean_value)
    except ValueError:
        return 0.0

def parse_int(value):
    if not value or value.strip() == '':
        return 0
    try:
        return int(float(value))
    except ValueError:
        return 0

def parse_date(value):
    """Parse DD/MM/YYYY format"""
    if not value or value.strip() == '':
        return None

    try:
        return datetime.strptime(value.strip(), '%d/%m/%Y').date()
    except ValueError:
        print(f"⚠️  Data inválida: {value}")
        return None

def atualizar_closer_jan(db):
    print("="*60)
    print("ATUALIZANDO CLOSER - JANEIRO 2026")
    print("="*60)

    # Deletar apenas Closer de Janeiro 2026
    count_old = db.query(CloserMetrica).filter(
        CloserMetrica.mes == 1,
        CloserMetrica.ano == 2026
    ).count()

    db.query(CloserMetrica).filter(
        CloserMetrica.mes == 1,
        CloserMetrica.ano == 2026
    ).delete()
    db.commit()

    print(f"✓ {count_old} registros de Janeiro deletados\n")

    csv_path = DATA_DIR / "Closer Jan - closer_diario (1).csv"
    count = 0

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        for row in reader:
            data_obj = parse_date(row['data'])
            if not data_obj:
                continue

            # Parse valores
            faturamento_bruto = parse_float(row.get('faturamento_bruto', 0))
            faturamento_liquido = parse_float(row.get('faturamento_liquido', 0))

            # Normalizar nome do closer
            closer = row['closer'].strip()
            if closer == "Mona Garcia":
                closer = "Monã Garcia"

            metrica = CloserMetrica(
                data=data_obj,
                mes=data_obj.month,
                ano=data_obj.year,
                closer=closer,
                funil=row['funil'].strip(),
                calls_agendadas=parse_int(row['calls_agendadas']),
                calls_realizadas=parse_int(row['calls_realizadas']),
                vendas=parse_int(row['vendas']),
                booking=faturamento_bruto,  # Booking = Faturamento Bruto
                faturamento=faturamento_bruto,  # Campo legado
                faturamento_bruto=faturamento_bruto,
                faturamento_liquido=faturamento_liquido
            )
            db.add(metrica)
            count += 1

    db.commit()

    print(f"✅ {count} registros de Closer Janeiro importados")

    # Verificar totais
    totais = db.query(
        func.sum(CloserMetrica.faturamento_bruto),
        func.sum(CloserMetrica.faturamento_liquido),
        func.sum(CloserMetrica.vendas)
    ).filter(
        CloserMetrica.mes == 1,
        CloserMetrica.ano == 2026
    ).first()

    print(f"\n📊 TOTAIS JANEIRO:")
    print(f"   ├─ Faturamento Bruto: R$ {totais[0]:,.2f}")
    print(f"   ├─ Faturamento Líquido: R$ {totais[1]:,.2f}")
    print(f"   └─ Vendas: {totais[2]}")

if __name__ == "__main__":
    db = SessionLocal()

    try:
        atualizar_closer_jan(db)

        print("\n" + "="*60)
        print("✅ ATUALIZAÇÃO CONCLUÍDA!")
        print("="*60)

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()
