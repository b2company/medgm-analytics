#!/usr/bin/env python3
"""
Importa TODOS os dados de Janeiro e Fevereiro 2026
"""
import sqlite3
import csv
from datetime import datetime
import re
import os

conn = sqlite3.connect('data/medgm_analytics.db')
cursor = conn.cursor()

def parse_currency(value):
    """Converte string de moeda brasileira para float"""
    if not value or value.strip() == '':
        return 0.0
    cleaned = re.sub(r'[R$\s]', '', value)
    cleaned = cleaned.replace('.', '').replace(',', '.')
    try:
        return float(cleaned)
    except:
        return 0.0

def parse_date(date_str):
    """Converte DD/MM/YYYY para YYYY-MM-DD"""
    try:
        dt = datetime.strptime(date_str.strip(), '%d/%m/%Y')
        return dt.strftime('%Y-%m-%d')
    except:
        return None

print("🗑️  Limpando dados existentes...")
cursor.execute("DELETE FROM vendas WHERE mes IN (1, 2) AND ano = 2026")
cursor.execute("DELETE FROM social_selling_metricas WHERE mes IN (1, 2) AND ano = 2026")
cursor.execute("DELETE FROM sdr_metricas WHERE mes IN (1, 2) AND ano = 2026")
cursor.execute("DELETE FROM closer_metricas WHERE mes IN (1, 2) AND ano = 2026")
conn.commit()
print("✅ Dados limpos!\n")

# ========== IMPORTAR VENDAS FEVEREIRO ==========
print("💰 Importando Vendas de Fevereiro...")
vendas_count = 0

with open('/Users/odavi.feitosa/Downloads/MedGM_Controle_Comercial[02]_FEV_2026.xlsx - VENDAS.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    header_line = lines[2].strip()
    data_lines = lines[3:]

    reader = csv.DictReader(data_lines, fieldnames=header_line.split(','))
    for row in reader:
        if not row.get('DATA') or not row['DATA'].strip():
            continue

        data = parse_date(row['DATA'])
        if not data:
            continue

        cliente = row.get('CLIENTE', '').strip()
        if not cliente:
            continue

        closer = row.get('CLOSER', '--').strip()
        funil = row.get('FUNIL', '').strip()
        tipo_receita = row.get('TIPO_RECEITA', '').strip()
        produto = row.get('PRODUTO', '').strip()

        valor_liquido = parse_currency(row.get('VALOR_LIQUIDO', ''))
        valor_pago = parse_currency(row.get('VALOR_PAGO', ''))
        previsto = parse_currency(row.get('PREVISTO', ''))
        booking = parse_currency(row.get('BOOKING', ''))

        valor_bruto = booking if booking > 0 else previsto
        valor_final = valor_liquido if valor_liquido > 0 else valor_pago if valor_pago > 0 else previsto if previsto > 0 else booking

        if valor_final <= 0:
            continue

        cursor.execute("""
            INSERT INTO vendas (
                data, cliente, valor_bruto, valor_liquido, valor,
                funil, vendedor, mes, ano, closer, tipo_receita, produto,
                booking, previsto, valor_pago
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 2, 2026, ?, ?, ?, ?, ?, ?)
        """, (
            data, cliente, valor_bruto, valor_final, valor_final,
            funil, closer, closer, tipo_receita, produto,
            booking, previsto, valor_pago
        ))
        vendas_count += 1

conn.commit()
print(f"✅ {vendas_count} vendas de Fevereiro importadas!\n")

# ========== IMPORTAR SOCIAL SELLING (JAN + FEV) ==========
ss_files = [
    ('/Users/odavi.feitosa/Downloads/dados jan - Social Selling.csv', 'Janeiro'),
    ('/Users/odavi.feitosa/Downloads/dados fev - Socail Selling.csv', 'Fevereiro')
]

for file_path, mes_nome in ss_files:
    if not os.path.exists(file_path):
        print(f"⚠️  Arquivo não encontrado: {file_path}")
        continue

    print(f"📊 Importando Social Selling de {mes_nome}...")
    ss_count = 0

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Detectar formato (Jan tem "Mês", Fev tem "mes")
            mes = int(row.get('Mês') or row.get('mes'))
            ano = int(row.get('Ano') or row.get('ano'))
            vendedor = row.get('Vendedor') or row.get('vendedor')
            ativacoes = int(row.get('Ativações') or row.get('ativacoes'))
            conversoes = int(row.get('Conversões') or row.get('conversoes'))
            leads = int(row.get('Leads Gerados') or row.get('leads_gerados'))

            # Calcular data
            dia = int(row.get('Dia') or row.get('dia'))
            data = f"{ano}-{mes:02d}-{dia:02d}"

            tx_ativ_conv = round((conversoes / ativacoes * 100) if ativacoes > 0 else 0, 2)
            tx_conv_lead = round((leads / conversoes * 100) if conversoes > 0 else 0, 2)

            cursor.execute("""
                INSERT INTO social_selling_metricas
                (vendedor, mes, ano, data, ativacoes, conversoes, leads_gerados, tx_ativ_conv, tx_conv_lead)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (vendedor, mes, ano, data, ativacoes, conversoes, leads, tx_ativ_conv, tx_conv_lead))
            ss_count += 1

    conn.commit()
    print(f"✅ {ss_count} registros de Social Selling ({mes_nome}) importados!")

print()

# ========== IMPORTAR SDR (JAN + FEV) ==========
sdr_files = [
    ('/Users/odavi.feitosa/Downloads/dados jan - SDR.csv', 'Janeiro'),
    ('/Users/odavi.feitosa/Downloads/dados fev - SDR.csv', 'Fevereiro')
]

for file_path, mes_nome in sdr_files:
    if not os.path.exists(file_path):
        print(f"⚠️  Arquivo não encontrado: {file_path}")
        continue

    print(f"📞 Importando SDR de {mes_nome}...")
    sdr_count = 0

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            mes = int(row.get('Mês') or row.get('mes'))
            ano = int(row.get('Ano') or row.get('Ano'))
            sdr = row.get('SDR') or row.get('sdr')
            funil = row.get('Funil') or row.get('Funil')

            dia = int(row.get('Dia') or row.get('Dia'))
            data = f"{ano}-{mes:02d}-{dia:02d}"

            # Jan: Leads, Tentativas, Conexões, Calls Agendadas
            # Fev: Leads Recebidos, Reunioes Agendadas, Reunioes Realizadas
            leads_recebidos = int(row.get('Leads') or row.get('Leads Recebidos') or 0)
            reunioes_agendadas = int(row.get('Calls Agendadas') or row.get('Reunioes Agendadas') or 0)
            reunioes_realizadas = int(row.get('Reunioes Realizadas') or 0)

            tx_agendamento = round((reunioes_agendadas / leads_recebidos * 100) if leads_recebidos > 0 else 0, 2)
            tx_comparecimento = round((reunioes_realizadas / reunioes_agendadas * 100) if reunioes_agendadas > 0 else 0, 2)

            cursor.execute("""
                INSERT INTO sdr_metricas
                (sdr, mes, ano, data, funil, leads_recebidos, reunioes_agendadas, reunioes_realizadas,
                 tx_agendamento, tx_comparecimento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (sdr, mes, ano, data, funil, leads_recebidos, reunioes_agendadas, reunioes_realizadas,
                  tx_agendamento, tx_comparecimento))
            sdr_count += 1

    conn.commit()
    print(f"✅ {sdr_count} registros de SDR ({mes_nome}) importados!")

print()

# ========== IMPORTAR CLOSER (JAN + FEV) ==========
closer_files = [
    ('/Users/odavi.feitosa/Downloads/dados jan - Closer.csv', 'Janeiro'),
    ('/Users/odavi.feitosa/Downloads/dados fev - Closer.csv', 'Fevereiro')
]

for file_path, mes_nome in closer_files:
    if not os.path.exists(file_path):
        print(f"⚠️  Arquivo não encontrado: {file_path}")
        continue

    print(f"🎯 Importando Closer de {mes_nome}...")
    closer_count = 0

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            mes = int(row.get('Mês') or row.get('mes'))
            ano = int(row.get('Ano') or row.get('ano'))
            closer = row.get('Closer') or row.get('closer')
            funil = row.get('Funil') or row.get('funil')

            dia = int(row.get('Dia') or row.get('dia'))
            data = f"{ano}-{mes:02d}-{dia:02d}"

            calls_agendadas = int(row.get('Calls Agendadas') or row.get('calls_agendadas') or 0)
            calls_realizadas = int(row.get('Calls Realizadas') or row.get('calls_realizadas') or 0)
            vendas = int(row.get('Vendas') or row.get('vendas') or 0)

            # Usar Faturamento Líquido
            faturamento = parse_currency(row.get('Faturamento Líquido', '0'))

            tx_comparecimento = round((calls_realizadas / calls_agendadas * 100) if calls_agendadas > 0 else 0, 2)
            tx_conversao = round((vendas / calls_realizadas * 100) if calls_realizadas > 0 else 0, 2)
            ticket_medio = round(faturamento / vendas if vendas > 0 else 0, 2)

            cursor.execute("""
                INSERT INTO closer_metricas
                (closer, mes, ano, data, funil, calls_agendadas, calls_realizadas, vendas,
                 faturamento, tx_comparecimento, tx_conversao, ticket_medio)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (closer, mes, ano, data, funil, calls_agendadas, calls_realizadas, vendas,
                  faturamento, tx_comparecimento, tx_conversao, ticket_medio))
            closer_count += 1

    conn.commit()
    print(f"✅ {closer_count} registros de Closer ({mes_nome}) importados!")

print()

# ========== RESUMO FINAL ==========
print("="*70)
print("✅ IMPORTAÇÃO COMPLETA - TODOS OS DADOS")
print("="*70)

for mes_num, mes_nome in [(1, 'JANEIRO'), (2, 'FEVEREIRO')]:
    print(f"\n📊 {mes_nome} 2026:")

    # Vendas
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(valor_liquido), 0)
        FROM vendas WHERE mes = ? AND ano = 2026
    """, (mes_num,))
    v = cursor.fetchone()
    print(f"   💰 Vendas: {v[0]} | Faturamento Líquido: R$ {v[1]:,.2f}")

    # Social Selling
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(ativacoes), 0), COALESCE(SUM(conversoes), 0), COALESCE(SUM(leads_gerados), 0)
        FROM social_selling_metricas WHERE mes = ? AND ano = 2026
    """, (mes_num,))
    ss = cursor.fetchone()
    print(f"   📱 Social Selling: {ss[0]} dias | {ss[1]:,} ativações | {ss[2]} conversões | {ss[3]} leads")

    # SDR
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(leads_recebidos), 0), COALESCE(SUM(reunioes_agendadas), 0)
        FROM sdr_metricas WHERE mes = ? AND ano = 2026
    """, (mes_num,))
    sdr = cursor.fetchone()
    print(f"   📞 SDR: {sdr[0]} dias | {sdr[1]} leads | {sdr[2]} reuniões agendadas")

    # Closer
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(calls_realizadas), 0), COALESCE(SUM(vendas), 0), COALESCE(SUM(faturamento), 0)
        FROM closer_metricas WHERE mes = ? AND ano = 2026
    """, (mes_num,))
    c = cursor.fetchone()
    print(f"   🎯 Closer: {c[0]} dias | {c[1]} calls | {c[2]} vendas | R$ {c[3]:,.2f}")

print(f"\n{'='*70}")
print(f"🚀 Acesse: http://localhost:5176")
print(f"{'='*70}\n")

conn.close()
