#!/usr/bin/env python3
"""
Cadastrar metas para Fevereiro/2026
"""
import requests

API_URL = "http://localhost:8000"

print("📊 Cadastrando metas para Fevereiro/2026...\n")

metas = [
    {
        "pessoa_id": 1,  # Jessica Leopoldino
        "nome": "Jessica Leopoldino (Social Selling)",
        "mes": 2,
        "ano": 2026,
        "tipo": "pessoa",
        "meta_ativacoes": 10000,
        "meta_leads": 50,
        "meta_reunioes": 0,
        "meta_vendas": 0,
        "meta_faturamento": 0
    },
    {
        "pessoa_id": 2,  # Karina Carla
        "nome": "Karina Carla (Social Selling)",
        "mes": 2,
        "ano": 2026,
        "tipo": "pessoa",
        "meta_ativacoes": 2500,
        "meta_leads": 15,
        "meta_reunioes": 0,
        "meta_vendas": 0,
        "meta_faturamento": 0
    },
    {
        "pessoa_id": 6,  # Artur Gabriel
        "nome": "Artur Gabriel (Social Selling)",
        "mes": 2,
        "ano": 2026,
        "tipo": "pessoa",
        "meta_ativacoes": 4000,
        "meta_leads": 20,
        "meta_reunioes": 0,
        "meta_vendas": 0,
        "meta_faturamento": 0
    },
    {
        "pessoa_id": 3,  # Fernando Dutra
        "nome": "Fernando Dutra (SDR)",
        "mes": 2,
        "ano": 2026,
        "tipo": "pessoa",
        "meta_ativacoes": 0,
        "meta_leads": 0,
        "meta_reunioes": 50,
        "meta_vendas": 0,
        "meta_faturamento": 0
    },
    {
        "pessoa_id": 4,  # Fabio Lima
        "nome": "Fabio Lima (Closer)",
        "mes": 2,
        "ano": 2026,
        "tipo": "pessoa",
        "meta_ativacoes": 0,
        "meta_leads": 0,
        "meta_reunioes": 0,
        "meta_vendas": 6,
        "meta_faturamento": 30000
    },
    {
        "pessoa_id": 5,  # Mona Garcia
        "nome": "Mona Garcia (Closer)",
        "mes": 2,
        "ano": 2026,
        "tipo": "pessoa",
        "meta_ativacoes": 0,
        "meta_leads": 0,
        "meta_reunioes": 0,
        "meta_vendas": 6,
        "meta_faturamento": 30000
    }
]

for meta in metas:
    print(f"Cadastrando: {meta['nome']}")

    # Verificar se já existe
    response = requests.get(f"{API_URL}/metas/pessoa/{meta['pessoa_id']}?mes={meta['mes']}&ano={meta['ano']}")

    if response.ok and response.json():
        # Já existe, atualizar
        meta_id = response.json()['id']
        response = requests.put(f"{API_URL}/metas/{meta_id}", json=meta)
        if response.ok:
            print(f"  ✅ Meta atualizada")
        else:
            print(f"  ❌ Erro ao atualizar: {response.text}")
    else:
        # Não existe, criar
        response = requests.post(f"{API_URL}/metas", json=meta)
        if response.ok:
            print(f"  ✅ Meta cadastrada")
        else:
            print(f"  ❌ Erro ao cadastrar: {response.text}")

    print()

print("\n🎉 Metas cadastradas com sucesso!")
print("\n📊 Metas definidas:")
print("  • Jessica: 10.000 ativações, 50 leads")
print("  • Karina: 2.500 ativações, 15 leads")
print("  • Artur: 4.000 ativações, 20 leads")
print("  • Fernando: 50 reuniões")
print("  • Fabio: 6 vendas, R$ 30.000")
print("  • Mona: 6 vendas, R$ 30.000")
print("\n✨ Recarregue os dashboards para ver as linhas de meta nos gráficos!")
