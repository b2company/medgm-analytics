"""
Script de teste para validar os endpoints CRUD.
Execute com: python3 test_crud.py
Certifique-se de que o backend está rodando em http://localhost:8000
"""

import requests
import json
from datetime import date, datetime

BASE_URL = "http://localhost:8000"

def test_financeiro_crud():
    print("\n" + "="*60)
    print("TESTANDO CRUD FINANCEIRO")
    print("="*60)

    # 1. CREATE - Criar nova transação
    print("\n1. Criando nova transação financeira...")
    nova_transacao = {
        "tipo": "entrada",
        "categoria": "Mensalidade Teste",
        "descricao": "Cliente teste CRUD",
        "valor": 5000.00,
        "data": str(date.today()),
        "mes": date.today().month,
        "ano": date.today().year,
        "previsto_realizado": "realizado"
    }

    response = requests.post(f"{BASE_URL}/crud/financeiro", json=nova_transacao)
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Transação criada com sucesso! ID: {result['id']}")
        transacao_id = result['id']
    else:
        print(f"✗ Erro ao criar transação: {response.status_code}")
        print(response.text)
        return

    # 2. UPDATE - Atualizar transação
    print(f"\n2. Atualizando transação ID {transacao_id}...")
    update_data = {
        "valor": 5500.00,
        "descricao": "Cliente teste CRUD - ATUALIZADO"
    }

    response = requests.put(f"{BASE_URL}/crud/financeiro/{transacao_id}", json=update_data)
    if response.status_code == 200:
        print("✓ Transação atualizada com sucesso!")
        print(f"  Novo valor: R$ {update_data['valor']}")
    else:
        print(f"✗ Erro ao atualizar transação: {response.status_code}")
        print(response.text)

    # 3. DELETE - Deletar transação
    print(f"\n3. Deletando transação ID {transacao_id}...")
    response = requests.delete(f"{BASE_URL}/crud/financeiro/{transacao_id}")
    if response.status_code == 200:
        result = response.json()
        print("✓ Transação deletada com sucesso!")
        print(f"  Registro deletado: {result['deleted']}")
    else:
        print(f"✗ Erro ao deletar transação: {response.status_code}")
        print(response.text)


def test_venda_crud():
    print("\n" + "="*60)
    print("TESTANDO CRUD VENDAS")
    print("="*60)

    # 1. CREATE - Criar nova venda
    print("\n1. Criando nova venda...")
    nova_venda = {
        "data": str(date.today()),
        "cliente": "Dr. João Silva - Teste CRUD",
        "valor": 12000.00,
        "funil": "SS",
        "vendedor": "Teste Vendedor",
        "mes": date.today().month,
        "ano": date.today().year
    }

    response = requests.post(f"{BASE_URL}/crud/venda", json=nova_venda)
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Venda criada com sucesso! ID: {result['id']}")
        venda_id = result['id']
    else:
        print(f"✗ Erro ao criar venda: {response.status_code}")
        print(response.text)
        return

    # 2. UPDATE - Atualizar venda
    print(f"\n2. Atualizando venda ID {venda_id}...")
    update_data = {
        "valor": 15000.00,
        "funil": "Quiz"
    }

    response = requests.put(f"{BASE_URL}/crud/venda/{venda_id}", json=update_data)
    if response.status_code == 200:
        print("✓ Venda atualizada com sucesso!")
        print(f"  Novo valor: R$ {update_data['valor']}")
        print(f"  Novo funil: {update_data['funil']}")
    else:
        print(f"✗ Erro ao atualizar venda: {response.status_code}")
        print(response.text)

    # 3. DELETE - Deletar venda
    print(f"\n3. Deletando venda ID {venda_id}...")
    response = requests.delete(f"{BASE_URL}/crud/venda/{venda_id}")
    if response.status_code == 200:
        result = response.json()
        print("✓ Venda deletada com sucesso!")
        print(f"  Registro deletado: {result['deleted']}")
    else:
        print(f"✗ Erro ao deletar venda: {response.status_code}")
        print(response.text)


def main():
    print("\n" + "="*60)
    print("TESTE COMPLETO DE CRUD - MedGM Analytics")
    print("="*60)
    print(f"\nVerificando conexão com {BASE_URL}...")

    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend conectado e funcionando!")
        else:
            print(f"✗ Backend retornou status {response.status_code}")
            return
    except requests.exceptions.RequestException as e:
        print(f"✗ Erro ao conectar com o backend: {e}")
        print("\nCertifique-se de que o backend está rodando:")
        print("  cd backend && uvicorn app.main:app --reload")
        return

    # Executar testes
    try:
        test_financeiro_crud()
        test_venda_crud()

        print("\n" + "="*60)
        print("TODOS OS TESTES CONCLUÍDOS!")
        print("="*60)
        print("\nPróximos passos:")
        print("1. Acesse http://localhost:5173 no navegador")
        print("2. Vá para a aba 'Financeiro' e clique em '+ Nova Transação'")
        print("3. Vá para a aba 'Comercial' e clique em '+ Nova Venda'")
        print("4. Teste editar e deletar registros existentes")

    except Exception as e:
        print(f"\n✗ Erro durante os testes: {e}")


if __name__ == "__main__":
    main()
