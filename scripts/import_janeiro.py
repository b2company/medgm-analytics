import pandas as pd
import requests
from datetime import datetime
import re

API_URL = "http://localhost:8000"

def converter_valor_br(valor_str):
    """Converte valores no formato brasileiro ('3.000,00') para float"""
    if pd.isna(valor_str) or valor_str in ['', '0', 0]:
        return 0.0

    # Remove aspas se houver
    valor_str = str(valor_str).replace('"', '').strip()

    if valor_str in ['0,00', '0']:
        return 0.0

    # Remove pontos (separador de milhar) e substitui vírgula por ponto
    valor_str = valor_str.replace('.', '').replace(',', '.')

    try:
        return float(valor_str)
    except:
        return 0.0

def converter_data(data_str):
    """Converte data de dd/mm/yyyy para yyyy-mm-dd"""
    if pd.isna(data_str):
        return None

    # Se já estiver no formato correto, retorna
    if isinstance(data_str, str) and re.match(r'\d{4}-\d{2}-\d{2}', data_str):
        return data_str

    try:
        dt = pd.to_datetime(data_str, format='%d/%m/%Y')
        return dt.strftime('%Y-%m-%d')
    except:
        try:
            dt = pd.to_datetime(data_str)
            return dt.strftime('%Y-%m-%d')
        except:
            return None

def normalizar_nome(nome):
    """Normaliza nomes (Monã -> Mona)"""
    if pd.isna(nome):
        return nome
    nome = str(nome).strip()
    if nome == "Monã Garcia":
        return "Mona Garcia"
    return nome

def deletar_janeiro_2026():
    """Deleta todos os dados de Janeiro 2026"""
    print("\n🗑️  Deletando dados existentes de Janeiro 2026...")

    # Deletar Social Selling
    try:
        response = requests.delete(f"{API_URL}/comercial/metricas/social-selling?mes=1&ano=2026")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Social Selling: {data.get('deletados', 0)} registros deletados")
        else:
            print(f"⚠️  Social Selling: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erro ao deletar Social Selling: {e}")

    # Deletar SDR
    try:
        response = requests.delete(f"{API_URL}/comercial/metricas/sdr?mes=1&ano=2026")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SDR: {data.get('deletados', 0)} registros deletados")
        else:
            print(f"⚠️  SDR: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erro ao deletar SDR: {e}")

    # Deletar Closer
    try:
        response = requests.delete(f"{API_URL}/comercial/metricas/closer?mes=1&ano=2026")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Closer: {data.get('deletados', 0)} registros deletados")
        else:
            print(f"⚠️  Closer: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erro ao deletar Closer: {e}")

def importar_social_selling(csv_path):
    """Importa dados de Social Selling"""
    print("\n📊 Importando Social Selling...")

    df = pd.read_csv(csv_path)

    importados = 0
    erros = []

    for idx, row in df.iterrows():
        try:
            data = converter_data(row['Data'])
            if not data:
                erros.append(f"Linha {idx+2}: Data inválida")
                continue

            # Extrair mes e ano da data
            dt = pd.to_datetime(data)

            metrica = {
                "mes": dt.month,
                "ano": dt.year,
                "data": data,
                "vendedor": normalizar_nome(row['Vendedor']),
                "funil": str(row['Funil']),
                "ativacoes": int(row['Ativações']),
                "conversoes": int(row['Conversões']),
                "leads_gerados": int(row['Leads Gerados'])
            }

            response = requests.post(f"{API_URL}/comercial/social-selling", json=metrica)

            if response.status_code == 200:
                importados += 1
            else:
                erros.append(f"Linha {idx+2}: {response.status_code} - {response.text[:100]}")

        except Exception as e:
            erros.append(f"Linha {idx+2}: {str(e)}")

    print(f"✅ {importados} registros importados")
    if erros:
        print(f"❌ {len(erros)} erros:")
        for erro in erros[:5]:
            print(f"   - {erro}")

def importar_sdr(csv_path):
    """Importa dados de SDR"""
    print("\n📊 Importando SDR...")

    df = pd.read_csv(csv_path)

    importados = 0
    erros = []

    for idx, row in df.iterrows():
        try:
            data = converter_data(row['Data'])
            if not data:
                erros.append(f"Linha {idx+2}: Data inválida")
                continue

            # Extrair mes e ano da data
            dt = pd.to_datetime(data)

            metrica = {
                "mes": dt.month,
                "ano": dt.year,
                "data": data,
                "sdr": normalizar_nome(row['SDR']),
                "funil": str(row['Funil']),
                "leads_recebidos": int(row['Leads Recebidos']),
                "reunioes_agendadas": int(row['Reuniões Agendadas']),
                "reunioes_realizadas": int(row['Reuniões Realizadas'])
            }

            response = requests.post(f"{API_URL}/comercial/sdr", json=metrica)

            if response.status_code == 200:
                importados += 1
            else:
                erros.append(f"Linha {idx+2}: {response.status_code} - {response.text[:100]}")

        except Exception as e:
            erros.append(f"Linha {idx+2}: {str(e)}")

    print(f"✅ {importados} registros importados")
    if erros:
        print(f"❌ {len(erros)} erros:")
        for erro in erros[:5]:
            print(f"   - {erro}")

def importar_closer(csv_path):
    """Importa dados de Closer"""
    print("\n📊 Importando Closer...")

    df = pd.read_csv(csv_path)

    importados = 0
    erros = []

    for idx, row in df.iterrows():
        try:
            data = converter_data(row['Data'])
            if not data:
                erros.append(f"Linha {idx+2}: Data inválida")
                continue

            # Extrair mes e ano da data
            dt = pd.to_datetime(data)

            # Converter valores monetários
            faturamento_bruto = converter_valor_br(row['Faturamento Bruto'])
            faturamento_liquido = converter_valor_br(row['Faturamento Líquido'])
            booking = converter_valor_br(row['Booking'])

            # Valores numéricos
            calls_agendadas = int(row['Calls Agendadas']) if pd.notna(row['Calls Agendadas']) else 0
            calls_realizadas = int(row['Calls Realizadas']) if pd.notna(row['Calls Realizadas']) else 0
            vendas = int(row['Vendas']) if pd.notna(row['Vendas']) else 0

            metrica = {
                "mes": dt.month,
                "ano": dt.year,
                "data": data,
                "closer": normalizar_nome(row['Closer']),
                "funil": str(row['Funil']),
                "calls_agendadas": calls_agendadas,
                "calls_realizadas": calls_realizadas,
                "vendas": vendas,
                "booking": booking,
                "faturamento_bruto": faturamento_bruto,
                "faturamento_liquido": faturamento_liquido
            }

            response = requests.post(f"{API_URL}/comercial/closer", json=metrica)

            if response.status_code == 200:
                importados += 1
            else:
                erros.append(f"Linha {idx+2}: {response.status_code} - {response.text[:100]}")

        except Exception as e:
            erros.append(f"Linha {idx+2}: {str(e)}")

    print(f"✅ {importados} registros importados")
    if erros:
        print(f"❌ {len(erros)} erros:")
        for erro in erros[:5]:
            print(f"   - {erro}")

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 IMPORTAÇÃO DE DADOS - JANEIRO 2026")
    print("=" * 60)

    # Deletar dados existentes
    deletar_janeiro_2026()

    # Importar novos dados
    importar_social_selling("/Users/odavi.feitosa/Downloads/dados ss Jan - Página1.csv")
    importar_sdr("/Users/odavi.feitosa/Downloads/dados jan SDR - Página1.csv")
    importar_closer("/Users/odavi.feitosa/Downloads/Closer - Página1.csv")

    print("\n" + "=" * 60)
    print("✅ IMPORTAÇÃO CONCLUÍDA!")
    print("=" * 60)
