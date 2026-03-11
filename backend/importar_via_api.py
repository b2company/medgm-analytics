#!/usr/bin/env python3
"""
Script para limpar e importar dados via API
"""
import csv
import requests

API_URL = "http://localhost:8000"

print("🗑️  Limpando dados existentes via API...")

# Buscar e deletar Social Selling
response = requests.get(f"{API_URL}/comercial/social-selling?mes=2&ano=2026")
if response.ok:
    metricas = response.json()
    for m in metricas:
        requests.delete(f"{API_URL}/comercial/social-selling/{m['id']}")
    print(f"✅ {len(metricas)} registros de Social Selling deletados")

# Buscar e deletar SDR
response = requests.get(f"{API_URL}/comercial/sdr?mes=2&ano=2026")
if response.ok:
    metricas = response.json()
    for m in metricas:
        requests.delete(f"{API_URL}/comercial/sdr/{m['id']}")
    print(f"✅ {len(metricas)} registros de SDR deletados")

# Buscar e deletar Closer
response = requests.get(f"{API_URL}/comercial/closer?mes=2&ano=2026")
if response.ok:
    metricas = response.json()
    for m in metricas:
        requests.delete(f"{API_URL}/comercial/closer/{m['id']}")
    print(f"✅ {len(metricas)} registros de Closer deletados")

print("\n📊 Importando Social Selling...")
with open('/Users/odavi.feitosa/Downloads/dados - Socail Selling.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    count = 0
    for row in reader:
        data = {
            "vendedor": row['vendedor'],
            "mes": int(row['mes']),
            "ano": int(row['ano']),
            "data": f"{row['ano']}-{row['mes']:0>2}-{row['dia']:0>2}",
            "ativacoes": int(row['ativacoes']),
            "conversoes": int(row['conversoes']),
            "leads_gerados": int(row['leads_gerados'])
        }
        response = requests.post(f"{API_URL}/comercial/social-selling", json=data)
        if response.ok:
            count += 1

print(f"✅ {count} registros de Social Selling importados!")

print("\n📊 Importando SDR...")
with open('/Users/odavi.feitosa/Downloads/dados - SDR (1).csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    count = 0
    for row in reader:
        data = {
            "sdr": row['sdr'],
            "funil": row['Funil'],
            "mes": int(row['mes']),
            "ano": int(row['Ano']),
            "data": f"{row['Ano']}-{row['mes']:0>2}-{row['Dia']:0>2}",
            "leads_recebidos": int(row['Leads Recebidos']),
            "reunioes_agendadas": int(row['Reunioes Agendadas']),
            "reunioes_realizadas": int(row['Reunioes Realizadas'])
        }
        response = requests.post(f"{API_URL}/comercial/sdr", json=data)
        if response.ok:
            count += 1

print(f"✅ {count} registros de SDR importados!")

print("\n📊 Importando Closer...")
with open('/Users/odavi.feitosa/Downloads/dados - Closer (1).csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    count = 0
    for row in reader:
        faturamento_str = row['faturamento'].strip() if row['faturamento'] else '0'
        faturamento = float(faturamento_str) if faturamento_str else 0

        data = {
            "closer": row['closer'],
            "funil": row['Funil'],
            "mes": int(row['mes']),
            "ano": int(row['Ano']),
            "data": f"{row['Ano']}-{row['mes']:0>2}-{row['Dia']:0>2}",
            "calls_agendadas": int(row['Calls Agendadas']),
            "calls_realizadas": int(row['Calls Realizadas']),
            "vendas": int(row['Vendas']),
            "faturamento": faturamento,
            "booking": 0,
            "faturamento_bruto": 0,
            "faturamento_liquido": faturamento
        }
        response = requests.post(f"{API_URL}/comercial/closer", json=data)
        if response.ok:
            count += 1
        else:
            print(f"❌ Erro ao importar linha: {row}")
            print(f"   Response: {response.text}")

print(f"✅ {count} registros de Closer importados!")

print("\n🎉 Importação concluída com sucesso!")
print("\n📌 Próximo passo: Cadastre as metas na aba Metas do sistema")
