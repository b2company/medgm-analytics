#!/usr/bin/env python3
"""
Importa dados reais de Janeiro e Fevereiro 2026
"""
import sqlite3
import csv
from datetime import datetime
import re

conn = sqlite3.connect('data/medgm_analytics.db')
cursor = conn.cursor()

def parse_currency(value):
    """Converte string de moeda brasileira para float"""
    if not value or value.strip() == '':
        return 0.0
    # Remove R$, espaços, e substitui vírgula por ponto
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
cursor.execute("DELETE FROM closer_metricas WHERE mes IN (1, 2) AND ano = 2026")
conn.commit()
print("✅ Dados limpos!\n")

# ========== IMPORTAR VENDAS FEVEREIRO ==========
print("💰 Importando Vendas de Fevereiro...")
vendas_count = 0

with open('/Users/odavi.feitosa/Downloads/MedGM_Controle_Comercial[02]_FEV_2026.xlsx - VENDAS.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    # Pular primeiras 2 linhas (título e linha vazia)
    header_line = lines[2].strip()
    data_lines = lines[3:]

    reader = csv.DictReader(data_lines, fieldnames=header_line.split(','))
    for row in reader:
        # Pular linhas vazias
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

        # Usar VALOR_LIQUIDO se disponível, senão VALOR_PAGO, senão PREVISTO, senão BOOKING
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

# ========== IMPORTAR SOCIAL SELLING JANEIRO ==========
print("📊 Importando Social Selling de Janeiro...")
ss_count = 0

with open('/Users/odavi.feitosa/Downloads/dados jan - Social Selling.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        mes = int(row['Mês'])
        ano = int(row['Ano'])
        dia = int(row['Dia'])
        vendedor = row['Vendedor']
        ativacoes = int(row['Ativações'])
        conversoes = int(row['Conversões'])
        leads = int(row['Leads Gerados'])

        data = parse_date(row['Data'])

        # Calcular taxas
        tx_ativ_conv = round((conversoes / ativacoes * 100) if ativacoes > 0 else 0, 2)
        tx_conv_lead = round((leads / conversoes * 100) if conversoes > 0 else 0, 2)

        cursor.execute("""
            INSERT INTO social_selling_metricas
            (vendedor, mes, ano, data, ativacoes, conversoes, leads_gerados, tx_ativ_conv, tx_conv_lead)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (vendedor, mes, ano, data, ativacoes, conversoes, leads, tx_ativ_conv, tx_conv_lead))
        ss_count += 1

conn.commit()
print(f"✅ {ss_count} registros de Social Selling (Janeiro) importados!\n")

# ========== IMPORTAR CLOSER JANEIRO ==========
print("📞 Importando Closer de Janeiro...")
closer_count = 0

with open('/Users/odavi.feitosa/Downloads/dados jan - Closer.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        mes = int(row['Mês'])
        ano = int(row['Ano'])
        dia = int(row['Dia'])
        closer = row['Closer']
        funil = row['Funil']

        data = parse_date(row['Data'])

        calls_agendadas = int(row['Calls Agendadas'])
        calls_realizadas = int(row['Calls Realizadas'])
        vendas = int(row['Vendas'])

        booking = parse_currency(row['Booking'])
        faturamento_bruto = parse_currency(row['Faturamento Bruto'])
        faturamento_liquido = parse_currency(row['Faturamento Líquido'])

        # Calcular taxas
        tx_comparecimento = round((calls_realizadas / calls_agendadas * 100) if calls_agendadas > 0 else 0, 2)
        tx_conversao = round((vendas / calls_realizadas * 100) if calls_realizadas > 0 else 0, 2)
        ticket_medio = round(faturamento_liquido / vendas if vendas > 0 else 0, 2)

        cursor.execute("""
            INSERT INTO closer_metricas
            (closer, mes, ano, data, funil, calls_agendadas, calls_realizadas, vendas,
             faturamento, tx_comparecimento, tx_conversao, ticket_medio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (closer, mes, ano, data, funil, calls_agendadas, calls_realizadas, vendas,
              faturamento_liquido, tx_comparecimento, tx_conversao, ticket_medio))
        closer_count += 1

conn.commit()
print(f"✅ {closer_count} registros de Closer (Janeiro) importados!\n")

# ========== VERIFICAR FATURAMENTO ==========
print("📈 Calculando faturamentos...")

# Fevereiro
cursor.execute("""
    SELECT
        COUNT(*) as vendas,
        COALESCE(SUM(valor_bruto), 0) as bruto,
        COALESCE(SUM(valor_liquido), 0) as liquido,
        COALESCE(SUM(valor), 0) as final
    FROM vendas
    WHERE mes = 2 AND ano = 2026
""")
fev = cursor.fetchone()

print(f"\n{'='*60}")
print(f"✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!")
print(f"{'='*60}")
print(f"\n📊 FEVEREIRO 2026 - VENDAS:")
print(f"   Vendas: {fev[0]}")
print(f"   Valor Bruto: R$ {fev[1]:,.2f}")
print(f"   Valor Líquido: R$ {fev[2]:,.2f}")
print(f"   Valor Final: R$ {fev[3]:,.2f}")

cursor.execute("""
    SELECT COUNT(*), COALESCE(SUM(ativacoes), 0), COALESCE(SUM(conversoes), 0), COALESCE(SUM(leads_gerados), 0)
    FROM social_selling_metricas
    WHERE mes = 1 AND ano = 2026
""")
jan_ss = cursor.fetchone()

print(f"\n📊 JANEIRO 2026 - SOCIAL SELLING:")
print(f"   Registros: {jan_ss[0]}")
print(f"   Ativações: {jan_ss[1]:,}")
print(f"   Conversões: {jan_ss[2]}")
print(f"   Leads: {jan_ss[3]}")

cursor.execute("""
    SELECT COUNT(*),
           COALESCE(SUM(calls_agendadas), 0),
           COALESCE(SUM(calls_realizadas), 0),
           COALESCE(SUM(vendas), 0),
           COALESCE(SUM(faturamento), 0)
    FROM closer_metricas
    WHERE mes = 1 AND ano = 2026
""")
jan_closer = cursor.fetchone()

print(f"\n📊 JANEIRO 2026 - CLOSER:")
print(f"   Registros: {jan_closer[0]}")
print(f"   Calls Agendadas: {jan_closer[1]}")
print(f"   Calls Realizadas: {jan_closer[2]}")
print(f"   Vendas: {jan_closer[3]}")
print(f"   Faturamento: R$ {jan_closer[4]:,.2f}")

print(f"\n🚀 Acesse: http://localhost:5176")
print(f"{'='*60}\n")

conn.close()
