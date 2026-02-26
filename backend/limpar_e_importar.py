#!/usr/bin/env python3
"""
Script para limpar dados atuais e importar novos CSVs
"""
import csv
import sqlite3
from datetime import date

# Conectar ao banco
conn = sqlite3.connect('medgm_analytics.db')
cursor = conn.cursor()

print("🗑️  Limpando dados existentes...")

# Limpar métricas de fevereiro 2026
cursor.execute("DELETE FROM social_selling_metricas WHERE mes = 2 AND ano = 2026")
cursor.execute("DELETE FROM sdr_metricas WHERE mes = 2 AND ano = 2026")
cursor.execute("DELETE FROM closer_metricas WHERE mes = 2 AND ano = 2026")

conn.commit()
print(f"✅ Dados limpos!")

# ============ IMPORTAR SOCIAL SELLING ============
print("\n📊 Importando Social Selling...")
with open('/Users/odavi.feitosa/Downloads/dados - Socail Selling.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    count = 0
    for row in reader:
        dia = int(row['dia'])
        mes = int(row['mes'])
        ano = int(row['ano'])
        data = date(ano, mes, dia)

        ativacoes = int(row['ativacoes'])
        conversoes = int(row['conversoes'])
        leads = int(row['leads_gerados'])

        # Calcular taxas
        tx_ativ_conv = round((conversoes / ativacoes * 100) if ativacoes > 0 else 0, 2)
        tx_conv_lead = round((leads / conversoes * 100) if conversoes > 0 else 0, 2)

        cursor.execute("""
            INSERT INTO social_selling_metricas
            (vendedor, mes, ano, data, ativacoes, conversoes, leads_gerados, tx_ativ_conv, tx_conv_lead)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (row['vendedor'], mes, ano, data, ativacoes, conversoes, leads, tx_ativ_conv, tx_conv_lead))
        count += 1

conn.commit()
print(f"✅ {count} registros de Social Selling importados!")

# ============ IMPORTAR SDR ============
print("\n📊 Importando SDR...")
with open('/Users/odavi.feitosa/Downloads/dados - SDR (1).csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    count = 0
    for row in reader:
        dia = int(row['Dia'])
        mes = int(row['mes'])
        ano = int(row['Ano'])
        data = date(ano, mes, dia)

        leads = int(row['Leads Recebidos'])
        agendadas = int(row['Reunioes Agendadas'])
        realizadas = int(row['Reunioes Realizadas'])

        # Calcular taxas
        tx_agendamento = round((agendadas / leads * 100) if leads > 0 else 0, 2)
        tx_comparecimento = round((realizadas / agendadas * 100) if agendadas > 0 else 0, 2)

        cursor.execute("""
            INSERT INTO sdr_metricas
            (sdr, funil, mes, ano, data, leads_recebidos, reunioes_agendadas, reunioes_realizadas, tx_agendamento, tx_comparecimento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (row['sdr'], row['Funil'], mes, ano, data, leads, agendadas, realizadas, tx_agendamento, tx_comparecimento))
        count += 1

conn.commit()
print(f"✅ {count} registros de SDR importados!")

# ============ IMPORTAR CLOSER ============
print("\n📊 Importando Closer...")
with open('/Users/odavi.feitosa/Downloads/dados - Closer (1).csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    count = 0
    for row in reader:
        dia = int(row['Dia'])
        mes = int(row['mes'])
        ano = int(row['Ano'])
        data = date(ano, mes, dia)

        calls_agendadas = int(row['Calls Agendadas'])
        calls_realizadas = int(row['Calls Realizadas'])
        vendas = int(row['Vendas'])

        # Faturamento pode estar vazio
        faturamento_str = row['faturamento'].strip() if row['faturamento'] else '0'
        faturamento = float(faturamento_str) if faturamento_str else 0

        # Calcular taxas
        tx_comparecimento = round((calls_realizadas / calls_agendadas * 100) if calls_agendadas > 0 else 0, 2)
        tx_conversao = round((vendas / calls_realizadas * 100) if calls_realizadas > 0 else 0, 2)
        ticket_medio = round((faturamento / vendas) if vendas > 0 else 0, 2)

        cursor.execute("""
            INSERT INTO closer_metricas
            (closer, funil, mes, ano, data, calls_agendadas, calls_realizadas, vendas,
             faturamento, tx_comparecimento, tx_conversao, ticket_medio,
             booking, faturamento_bruto, faturamento_liquido)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
        """, (row['closer'], row['Funil'], mes, ano, data, calls_agendadas, calls_realizadas,
              vendas, faturamento, tx_comparecimento, tx_conversao, ticket_medio, faturamento))
        count += 1

conn.commit()
print(f"✅ {count} registros de Closer importados!")

conn.close()

print("\n🎉 Importação concluída com sucesso!")
print("\n📌 Próximo passo: Cadastre as metas na aba Metas do sistema")
