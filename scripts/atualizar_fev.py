import requests

API_URL = "http://localhost:8000"

# Mapeamento: ID → (faturamento_bruto, faturamento_liquido)
atualizacoes = {
    68: {  # 03/02 - Fabio - Mariana Almeida
        "faturamento_bruto": 3000.0,
        "faturamento_liquido": 2862.81
    },
    70: {  # 05/02 - Fabio - Camila Nogueira
        "faturamento_bruto": 3000.0,
        "faturamento_liquido": 2862.81
    },
    101: {  # 12/02 - Mona - Mariana Batista (1 venda)
        "faturamento_bruto": 6000.0,
        "faturamento_liquido": 5728.11
    },
    102: {  # 13/02 - Mona - Mariana Silveira + Giovanna Macedo (2 vendas)
        "faturamento_bruto": 12000.0,
        "faturamento_liquido": 11456.22  # 2 x 5728.11
    },
    84: {  # 19/02 - Fabio - Maria Carolina
        "faturamento_bruto": 9000.0,
        "faturamento_liquido": 9000.0
    },
    88: {  # 23/02 - Fabio - Thalia Maia
        "faturamento_bruto": 9000.0,
        "faturamento_liquido": 8593.41
    },
    112: {  # 24/02 - Mona - Gabriela Mello
        "faturamento_bruto": 6000.0,
        "faturamento_liquido": 5728.11
    }
}

print("=" * 80)
print("ATUALIZANDO FATURAMENTOS DE FEVEREIRO 2026")
print("=" * 80)
print()

# Buscar todos os registros de Fevereiro primeiro
response = requests.get(f"{API_URL}/comercial/closer?mes=2&ano=2026")
if response.status_code != 200:
    print(f"❌ Erro ao buscar registros: {response.status_code}")
    exit(1)

registros = response.json()
registros_dict = {r["id"]: r for r in registros}

print(f"📊 Total de registros em Fevereiro: {len(registros)}")
print(f"🎯 Registros a atualizar: {len(atualizacoes)}")
print()

sucesso = 0
erros = []

for id_registro, valores in atualizacoes.items():
    try:
        if id_registro not in registros_dict:
            erros.append(f"ID {id_registro}: Não encontrado")
            continue

        registro = registros_dict[id_registro]

        # Atualizar com novos valores
        registro_atualizado = {
            "mes": registro["mes"],
            "ano": registro["ano"],
            "data": registro["data"],
            "closer": registro["closer"],
            "funil": registro["funil"],
            "calls_agendadas": registro["calls_agendadas"],
            "calls_realizadas": registro["calls_realizadas"],
            "vendas": registro["vendas"],
            "booking": registro["booking"],
            "faturamento_bruto": valores["faturamento_bruto"],
            "faturamento_liquido": valores["faturamento_liquido"]
        }

        # Atualizar via PUT
        response = requests.put(
            f"{API_URL}/comercial/closer/{id_registro}",
            json=registro_atualizado
        )

        if response.status_code == 200:
            print(f"✅ ID {id_registro}: Bruto R$ {valores['faturamento_bruto']:,.2f} | Líq. R$ {valores['faturamento_liquido']:,.2f}")
            sucesso += 1
        else:
            erros.append(f"ID {id_registro}: {response.status_code} - {response.text[:100]}")

    except Exception as e:
        erros.append(f"ID {id_registro}: {str(e)}")

print()
print("=" * 80)
print(f"✅ {sucesso} registros atualizados com sucesso")
if erros:
    print(f"❌ {len(erros)} erros:")
    for erro in erros:
        print(f"   - {erro}")
print("=" * 80)
