"""
Reimportação COMPLETA de Vendas + Closer (Janeiro + Fevereiro 2026)
Remove dados antigos e importa novamente com dados corretos
"""

import csv
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.models import Venda, CloserMetrica
from sqlalchemy import func

DATA_DIR = Path("/Users/odavi.feitosa/Downloads")

def parse_float(value):
    if not value or value.strip() == '':
        return 0.0
    try:
        clean_value = value.strip().replace('R$', '').replace('.', '').replace(',', '.').replace(' ', '')
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
    if not value or value.strip() == '':
        return None
    try:
        return datetime.strptime(value.strip(), '%d/%m/%Y').date()
    except ValueError:
        print(f"⚠️  Data inválida: {value}")
        return None

def limpar_moeda(valor_str):
    if not valor_str or valor_str.strip() in ['', '-', '--']:
        return 0.0
    limpo = valor_str.replace('R$', '').replace('.', '').replace(' ', '').strip()
    limpo = limpo.replace(',', '.')
    try:
        return float(limpo)
    except ValueError:
        return 0.0

def normalizar_closer(closer_str):
    if not closer_str or closer_str.strip() in ['-', '--', '']:
        return None
    closer = closer_str.strip()
    if closer == "Mona Garcia":
        return "Monã Garcia"
    return closer

def reimport_vendas(db):
    print("="*70)
    print("REIMPORTANDO VENDAS - JANEIRO + FEVEREIRO 2026")
    print("="*70)

    # Limpar vendas antigas
    count_old = db.query(Venda).count()
    db.query(Venda).delete()
    db.commit()
    print(f"✓ {count_old} vendas antigas deletadas\n")

    csv_path = DATA_DIR / "Entradas consolidado Jan e Fev - vendas_jan2026.csv"

    count_jan = 0
    count_fev = 0
    count_2025 = 0
    count_zero = 0
    errors = 0

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        for row in reader:
            data_obj = parse_date(row['DATA'])
            if not data_obj:
                errors += 1
                continue

            # Filtrar apenas 2026
            if data_obj.year != 2026:
                count_2025 += 1
                continue

            # Parse valores
            previsto = limpar_moeda(row.get('PREVISTO', '0'))
            valor_pago = limpar_moeda(row.get('VALOR_PAGO', '0'))
            valor_liquido = limpar_moeda(row.get('VALOR_LIQUIDO', '0'))

            # IGNORAR VENDAS COM VALOR 0
            if valor_pago == 0 and valor_liquido == 0:
                count_zero += 1
                continue

            booking = valor_pago
            valor_bruto = valor_pago
            valor = valor_liquido if valor_liquido > 0 else valor_pago

            closer = normalizar_closer(row.get('CLOSER', ''))
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
    print(f"   ├─ Vendas com valor R$ 0: {count_zero}")
    print(f"   └─ Erros de data: {errors}")
    print(f"\n✓ Total válido: {count_jan + count_fev}\n")

    # Totais
    totais_jan = db.query(
        func.count(Venda.id),
        func.sum(Venda.valor_bruto),
        func.sum(Venda.valor_liquido)
    ).filter(Venda.mes == 1, Venda.ano == 2026).first()

    totais_fev = db.query(
        func.count(Venda.id),
        func.sum(Venda.valor_bruto),
        func.sum(Venda.valor_liquido)
    ).filter(Venda.mes == 2, Venda.ano == 2026).first()

    print(f"📊 TOTAIS JANEIRO:")
    print(f"   Vendas: {totais_jan[0]} | Bruto: R$ {totais_jan[1]:,.2f} | Líquido: R$ {totais_jan[2]:,.2f}")
    print(f"\n📊 TOTAIS FEVEREIRO:")
    print(f"   Vendas: {totais_fev[0]} | Bruto: R$ {totais_fev[1]:,.2f} | Líquido: R$ {totais_fev[2]:,.2f}\n")

def reimport_closer(db):
    print("="*70)
    print("REIMPORTANDO CLOSER - JANEIRO + FEVEREIRO 2026")
    print("="*70)

    # Deletar Closer de 2026
    count_old = db.query(CloserMetrica).filter(
        CloserMetrica.ano == 2026
    ).count()

    db.query(CloserMetrica).filter(
        CloserMetrica.ano == 2026
    ).delete()
    db.commit()

    print(f"✓ {count_old} registros de 2026 deletados\n")

    csv_path = DATA_DIR / "Closer Jan + Fev - closer_diario (1).csv"
    count_jan = 0
    count_fev = 0

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        for row in reader:
            data_obj = parse_date(row['data'])
            if not data_obj:
                continue

            faturamento_bruto = parse_float(row.get('faturamento_bruto', 0))
            faturamento_liquido = parse_float(row.get('faturamento_liquido', 0))

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
                booking=faturamento_bruto,
                faturamento=faturamento_bruto,
                faturamento_bruto=faturamento_bruto,
                faturamento_liquido=faturamento_liquido
            )
            db.add(metrica)

            if data_obj.month == 1:
                count_jan += 1
            elif data_obj.month == 2:
                count_fev += 1

    db.commit()

    print(f"✅ CLOSER IMPORTADO:")
    print(f"   ├─ Janeiro 2026: {count_jan} registros")
    print(f"   └─ Fevereiro 2026: {count_fev} registros\n")

    # Totais
    totais_jan = db.query(
        func.sum(CloserMetrica.faturamento_bruto),
        func.sum(CloserMetrica.faturamento_liquido),
        func.sum(CloserMetrica.vendas)
    ).filter(CloserMetrica.mes == 1, CloserMetrica.ano == 2026).first()

    totais_fev = db.query(
        func.sum(CloserMetrica.faturamento_bruto),
        func.sum(CloserMetrica.faturamento_liquido),
        func.sum(CloserMetrica.vendas)
    ).filter(CloserMetrica.mes == 2, CloserMetrica.ano == 2026).first()

    print(f"📊 TOTAIS CLOSER JANEIRO:")
    print(f"   Bruto: R$ {totais_jan[0]:,.2f} | Líquido: R$ {totais_jan[1]:,.2f} | Vendas: {totais_jan[2]}")
    print(f"\n📊 TOTAIS CLOSER FEVEREIRO:")
    print(f"   Bruto: R$ {totais_fev[0]:,.2f} | Líquido: R$ {totais_fev[1]:,.2f} | Vendas: {totais_fev[2]}\n")

if __name__ == "__main__":
    db = SessionLocal()

    try:
        reimport_vendas(db)
        reimport_closer(db)

        print("="*70)
        print("✅ REIMPORTAÇÃO COMPLETA CONCLUÍDA!")
        print("="*70)

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()
