"""
Script para importar JANEIRO + FEVEREIRO 2026 do MedGM Analytics.
- Janeiro: arquivos com "(1)" (formato DD/MM/YYYY)
- Fevereiro: arquivos originais (formato YYYY-MM-DD)
"""

import csv
import sys
from datetime import datetime
from pathlib import Path

# Adicionar o diretório backend ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.models import (
    Venda,
    SocialSellingMetrica, SDRMetrica, CloserMetrica,
    Pessoa, Meta, Financeiro, KPI
)

# Diretório dos CSVs
DATA_DIR = Path("/Users/odavi.feitosa/Desktop/Dados MedGM")

def parse_float(value):
    if not value or value.strip() == '':
        return 0.0
    try:
        clean_value = value.strip().replace(',', '.')
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
    """Parse date in multiple formats"""
    if not value or value.strip() == '':
        return None

    value = value.strip()

    # Try DD/MM/YYYY format (Janeiro CSVs)
    try:
        return datetime.strptime(value, '%d/%m/%Y').date()
    except ValueError:
        pass

    # Try YYYY-MM-DD format (Fevereiro CSVs)
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except ValueError:
        pass

    print(f"⚠️  Data inválida: {value}")
    return None

def limpar_dados_antigos(db):
    print("\n" + "="*60)
    print("LIMPANDO DADOS ANTIGOS")
    print("="*60)

    tables = [
        (SocialSellingMetrica, "Social Selling Métricas"),
        (SDRMetrica, "SDR Métricas"),
        (CloserMetrica, "Closer Métricas"),
        (Venda, "Vendas"),
        (Meta, "Metas"),
        (Financeiro, "Financeiro"),
        (KPI, "KPIs"),
    ]

    for model, nome in tables:
        count = db.query(model).count()
        db.query(model).delete()
        print(f"✓ {nome}: {count} registros deletados")

    db.commit()
    print("✓ Limpeza concluída\n")

def importar_social_selling(db):
    print("[1/7] Importando Social Selling (Janeiro + Fevereiro)...")

    # JANEIRO - arquivo com (1)
    csv_jan = DATA_DIR / "social_selling_diario (1).csv"
    count_jan = 0

    if csv_jan.exists():
        with open(csv_jan, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data_obj = parse_date(row['data'])
                if not data_obj:
                    continue

                metrica = SocialSellingMetrica(
                    data=data_obj,
                    mes=data_obj.month,
                    ano=data_obj.year,
                    vendedor=row['vendedor'].strip(),
                    ativacoes=parse_int(row['ativacoes']),
                    conversoes=parse_int(row['conversoes']),
                    leads_gerados=parse_int(row['leads_gerados'])
                )
                db.add(metrica)
                count_jan += 1
        db.commit()
        print(f"  ✓ Janeiro: {count_jan} registros")

    # FEVEREIRO - arquivo original
    csv_fev = DATA_DIR / "social_selling_diario.csv"
    count_fev = 0

    if csv_fev.exists():
        with open(csv_fev, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data_obj = parse_date(row['data'])
                if not data_obj:
                    continue

                metrica = SocialSellingMetrica(
                    data=data_obj,
                    mes=data_obj.month,
                    ano=data_obj.year,
                    vendedor=row['vendedor'].strip(),
                    ativacoes=parse_int(row['ativacoes']),
                    conversoes=parse_int(row['conversoes']),
                    leads_gerados=parse_int(row['leads_gerados'])
                )
                db.add(metrica)
                count_fev += 1
        db.commit()
        print(f"  ✓ Fevereiro: {count_fev} registros")

    print(f"✓ Total Social Selling: {count_jan + count_fev} registros\n")

def importar_sdr(db):
    print("[2/7] Importando SDR (Janeiro + Fevereiro)...")

    # JANEIRO - arquivo com (1)
    csv_jan = DATA_DIR / "sdr_diario (1).csv"
    count_jan = 0

    if csv_jan.exists():
        with open(csv_jan, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data_obj = parse_date(row['data'])
                if not data_obj:
                    continue

                metrica = SDRMetrica(
                    data=data_obj,
                    mes=data_obj.month,
                    ano=data_obj.year,
                    sdr=row['sdr'].strip(),
                    funil=row['funil'].strip(),
                    leads_recebidos=parse_int(row['leads_recebidos']),
                    reunioes_agendadas=parse_int(row['reunioes_agendadas']),
                    reunioes_realizadas=parse_int(row['reunioes_realizadas'])
                )
                db.add(metrica)
                count_jan += 1
        db.commit()
        print(f"  ✓ Janeiro: {count_jan} registros")

    # FEVEREIRO - arquivo original
    csv_fev = DATA_DIR / "sdr_diario.csv"
    count_fev = 0

    if csv_fev.exists():
        with open(csv_fev, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data_obj = parse_date(row['data'])
                if not data_obj:
                    continue

                metrica = SDRMetrica(
                    data=data_obj,
                    mes=data_obj.month,
                    ano=data_obj.year,
                    sdr=row['sdr'].strip(),
                    funil=row['funil'].strip(),
                    leads_recebidos=parse_int(row['leads_recebidos']),
                    reunioes_agendadas=parse_int(row['reunioes_agendadas']),
                    reunioes_realizadas=parse_int(row['reunioes_realizadas'])
                )
                db.add(metrica)
                count_fev += 1
        db.commit()
        print(f"  ✓ Fevereiro: {count_fev} registros")

    print(f"✓ Total SDR: {count_jan + count_fev} registros\n")

def importar_closer(db):
    print("[3/7] Importando Closer (Janeiro + Fevereiro)...")

    # JANEIRO - arquivo com (1)
    csv_jan = DATA_DIR / "closer_diario (1).csv"
    count_jan = 0

    if csv_jan.exists():
        with open(csv_jan, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data_obj = parse_date(row['data'])
                if not data_obj:
                    continue

                booking = parse_float(row.get('booking', 0))
                faturamento_bruto = parse_float(row.get('faturamento_bruto', 0))
                faturamento_liquido = parse_float(row.get('faturamento_liquido', 0))

                metrica = CloserMetrica(
                    data=data_obj,
                    mes=data_obj.month,
                    ano=data_obj.year,
                    closer=row['closer'].strip(),
                    funil=row['funil'].strip(),
                    calls_agendadas=parse_int(row['calls_agendadas']),
                    calls_realizadas=parse_int(row['calls_realizadas']),
                    vendas=parse_int(row['vendas']),
                    booking=booking,
                    faturamento=faturamento_bruto,
                    faturamento_bruto=faturamento_bruto,
                    faturamento_liquido=faturamento_liquido
                )
                db.add(metrica)
                count_jan += 1
        db.commit()
        print(f"  ✓ Janeiro: {count_jan} registros")

    # FEVEREIRO - arquivo original
    csv_fev = DATA_DIR / "closer_diario.csv"
    count_fev = 0

    if csv_fev.exists():
        with open(csv_fev, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data_obj = parse_date(row['data'])
                if not data_obj:
                    continue

                booking = parse_float(row.get('booking', 0))
                faturamento_bruto = parse_float(row.get('faturamento_bruto', 0))
                faturamento_liquido = parse_float(row.get('faturamento_liquido', 0))

                metrica = CloserMetrica(
                    data=data_obj,
                    mes=data_obj.month,
                    ano=data_obj.year,
                    closer=row['closer'].strip(),
                    funil=row['funil'].strip(),
                    calls_agendadas=parse_int(row['calls_agendadas']),
                    calls_realizadas=parse_int(row['calls_realizadas']),
                    vendas=parse_int(row['vendas']),
                    booking=booking,
                    faturamento=faturamento_bruto,
                    faturamento_bruto=faturamento_bruto,
                    faturamento_liquido=faturamento_liquido
                )
                db.add(metrica)
                count_fev += 1
        db.commit()
        print(f"  ✓ Fevereiro: {count_fev} registros")

    print(f"✓ Total Closer: {count_jan + count_fev} registros\n")

def importar_vendas(db):
    print("[4/7] Importando Vendas...")
    csv_path = DATA_DIR / "vendas.csv"
    count = 0

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data_obj = parse_date(row['data'])
            if not data_obj:
                continue

            booking = parse_float(row.get('booking', 0))
            valor_previsto = parse_float(row.get('valor_previsto', 0))
            valor_pago = parse_float(row.get('valor_pago', 0))
            valor_liquido = parse_float(row.get('valor_liquido', 0))

            valor_bruto = booking if booking > 0 else valor_pago
            valor = valor_liquido if valor_liquido > 0 else valor_pago

            venda = Venda(
                data=data_obj,
                mes=data_obj.month,
                ano=data_obj.year,
                cliente=row['cliente'].strip(),
                closer=row['closer'].strip() if row['closer'].strip() != '--' else None,
                funil=row['funil'].strip(),
                tipo_receita=row.get('tipo_receita', '').strip(),
                produto=row.get('produto', '').strip(),
                booking=booking,
                valor_bruto=valor_bruto,
                valor_pago=valor_pago,
                valor_liquido=valor_liquido,
                previsto=valor_previsto,
                valor=valor
            )
            db.add(venda)
            count += 1

    db.commit()
    print(f"✓ {count} vendas importadas\n")

def importar_metas(db):
    print("[5/7] Importando Metas...")
    pessoas_map = {}

    # Ler equipe_metas.csv para fevereiro
    csv_path = DATA_DIR / "equipe_metas.csv"
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            nome = row['nome'].strip()
            cargo = row['cargo'].strip()

            pessoa = db.query(Pessoa).filter(Pessoa.nome == nome).first()
            if not pessoa:
                pessoa = Pessoa(nome=nome, funcao=cargo, ativo=True)
                db.add(pessoa)
                db.flush()

            pessoas_map[nome] = pessoa.id

    # Ler metas_jan2026.csv para janeiro
    csv_path_jan = DATA_DIR / "metas_jan2026.csv"
    with open(csv_path_jan, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            nome = row['nome'].strip()

            pessoa = db.query(Pessoa).filter(Pessoa.nome == nome).first()
            if not pessoa:
                membro_id = row.get('membro_id', '')
                if 'EQ1' in membro_id or 'EQ2' in membro_id:
                    cargo = 'Social Selling'
                elif 'EQ3' in membro_id:
                    cargo = 'SDR'
                elif 'EQ4' in membro_id or 'EQ5' in membro_id:
                    cargo = 'Closer'
                else:
                    cargo = 'Indefinido'

                pessoa = Pessoa(nome=nome, funcao=cargo, ativo=True)
                db.add(pessoa)
                db.flush()

            pessoas_map[nome] = pessoa.id

    db.commit()
    print(f"✓ {len(pessoas_map)} pessoas garantidas no banco")

    # Importar metas de janeiro
    count_jan = 0
    with open(csv_path_jan, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            nome = row['nome'].strip()
            pessoa_id = pessoas_map.get(nome)

            meta = Meta(
                mes=1,
                ano=2026,
                tipo='individual',
                pessoa_id=pessoa_id,
                meta_ativacoes=parse_int(row.get('meta_ativacoes', 0)),
                meta_leads=parse_int(row.get('meta_leads', 0)),
                meta_reunioes=parse_int(row.get('meta_reunioes', 0)),
                meta_vendas=parse_int(row.get('meta_vendas', 0)),
                meta_faturamento=parse_float(row.get('meta_faturamento', 0))
            )
            db.add(meta)
            count_jan += 1

    # Importar metas de fevereiro
    count_fev = 0
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            nome = row['nome'].strip()
            pessoa_id = pessoas_map.get(nome)

            meta = Meta(
                mes=2,
                ano=2026,
                tipo='individual',
                pessoa_id=pessoa_id,
                meta_ativacoes=parse_int(row.get('meta_ativacoes', 0)),
                meta_leads=parse_int(row.get('meta_leads', 0)),
                meta_reunioes=parse_int(row.get('meta_reunioes', 0)),
                meta_vendas=parse_int(row.get('meta_vendas', 0)),
                meta_faturamento=parse_float(row.get('meta_faturamento', 0))
            )
            db.add(meta)
            count_fev += 1

    db.commit()
    print(f"✓ {count_jan} metas de Janeiro importadas")
    print(f"✓ {count_fev} metas de Fevereiro importadas\n")

def importar_saidas(db):
    print("[6/7] Importando Saídas (Financeiro)...")
    csv_path = DATA_DIR / "saidas.csv"
    count_realizado = 0
    count_previsto = 0

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            mes_ref = row['mes_ref'].strip()
            ano, mes = mes_ref.split('-')
            ano = int(ano)
            mes = int(mes)

            data_obj = parse_date(row['data']) if row['data'].strip() else None

            previsto = parse_float(row['previsto'])
            realizado = parse_float(row['realizado'])

            # PRIORIZAR REALIZADO
            if realizado > 0:
                saida_real = Financeiro(
                    tipo='saida',
                    descricao=row['descricao'].strip(),
                    custo=row['categoria_custo'].strip() if row['categoria_custo'].strip() else None,
                    tipo_custo=row['tipo'].strip() if row['tipo'].strip() else None,
                    centro_custo=row['centro_custo'].strip() if row['centro_custo'].strip() else None,
                    categoria=row['categoria'].strip(),
                    valor=realizado,
                    data=data_obj,
                    mes=mes,
                    ano=ano,
                    previsto_realizado='realizado'
                )
                db.add(saida_real)
                count_realizado += 1
            elif previsto > 0:
                saida_prev = Financeiro(
                    tipo='saida',
                    descricao=row['descricao'].strip(),
                    custo=row['categoria_custo'].strip() if row['categoria_custo'].strip() else None,
                    tipo_custo=row['tipo'].strip() if row['tipo'].strip() else None,
                    centro_custo=row['centro_custo'].strip() if row['centro_custo'].strip() else None,
                    categoria=row['categoria'].strip(),
                    valor=previsto,
                    data=data_obj,
                    mes=mes,
                    ano=ano,
                    previsto_realizado='previsto'
                )
                db.add(saida_prev)
                count_previsto += 1

    db.commit()
    print(f"✓ {count_realizado} saídas realizadas")
    print(f"✓ {count_previsto} saídas previstas")
    print(f"✓ Total: {count_realizado + count_previsto} registros\n")

def importar_entradas_do_resumo_mensal(db):
    print("[7/8] Criando Entradas Financeiras consolidadas...")
    csv_path = DATA_DIR / "resumo_mensal.csv"
    count = 0

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            mes_ref = row['mes_ref'].strip()
            ano, mes = mes_ref.split('-')
            ano = int(ano)
            mes = int(mes)

            total_entradas_realizado = parse_float(row.get('total_entradas_realizado', 0))

            if total_entradas_realizado > 0:
                entrada = Financeiro(
                    tipo='entrada',
                    produto='Consolidado',
                    descricao=f'Receita Consolidada {mes}/{ano}',
                    categoria='Receita',
                    valor=total_entradas_realizado,
                    data=None,
                    mes=mes,
                    ano=ano,
                    previsto_realizado='realizado'
                )
                db.add(entrada)
                count += 1
                print(f"  {mes}/{ano}: R$ {total_entradas_realizado:,.2f}")

    db.commit()
    print(f"✓ {count} entradas consolidadas criadas\n")

def importar_resumo_mensal(db):
    print("[8/8] Importando Resumo Mensal (KPIs)...")
    csv_path = DATA_DIR / "resumo_mensal.csv"
    count = 0

    primeiro_saldo_inicial = None
    primeiro_mes = None
    primeiro_ano = None

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            mes_ref = row['mes_ref'].strip()
            ano, mes = mes_ref.split('-')
            ano = int(ano)
            mes = int(mes)

            saldo_inicial = parse_float(row.get('saldo_inicial', 0))
            total_entradas = parse_float(row.get('total_entradas_realizado', 0))
            total_saidas_op = parse_float(row.get('total_saidas_op_realizado', 0))
            total_saidas_soc = parse_float(row.get('total_saidas_soc_realizado', 0))

            if primeiro_saldo_inicial is None:
                primeiro_saldo_inicial = saldo_inicial
                primeiro_mes = mes
                primeiro_ano = ano

            total_saidas = total_saidas_op + total_saidas_soc
            saldo_final = saldo_inicial + total_entradas - total_saidas

            kpi = KPI(
                mes=mes,
                ano=ano,
                faturamento=total_entradas,
                saldo=saldo_final
            )
            db.add(kpi)
            count += 1

            print(f"  {mes}/{ano}: inicial={saldo_inicial:.2f}, "
                  f"entradas={total_entradas:.2f}, saídas={total_saidas:.2f}, "
                  f"final={saldo_final:.2f}")

    # Criar KPI do mês anterior para saldo_inicial
    if primeiro_saldo_inicial and primeiro_saldo_inicial > 0:
        mes_anterior = primeiro_mes - 1
        ano_anterior = primeiro_ano
        if mes_anterior <= 0:
            mes_anterior = 12
            ano_anterior -= 1

        kpi_anterior = KPI(
            mes=mes_anterior,
            ano=ano_anterior,
            faturamento=0,
            saldo=primeiro_saldo_inicial
        )
        db.add(kpi_anterior)
        count += 1
        print(f"  {mes_anterior}/{ano_anterior}: final={primeiro_saldo_inicial:.2f} (criado para saldo_inicial)")

    db.commit()
    print(f"✓ {count} KPIs criados\n")

if __name__ == "__main__":
    print("="*60)
    print("IMPORTAÇÃO JANEIRO + FEVEREIRO 2026")
    print("="*60)

    db = SessionLocal()

    try:
        limpar_dados_antigos(db)
        importar_social_selling(db)
        importar_sdr(db)
        importar_closer(db)
        importar_vendas(db)
        importar_metas(db)
        importar_saidas(db)
        importar_entradas_do_resumo_mensal(db)
        importar_resumo_mensal(db)

        print("="*60)
        print("✅ IMPORTAÇÃO CONCLUÍDA - JANEIRO + FEVEREIRO!")
        print("="*60)

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()
