#!/usr/bin/env python3
"""
Popula banco com dados de demonstração para fevereiro 2026
"""
import sqlite3
from datetime import date, timedelta
import random

conn = sqlite3.connect('medgm_analytics.db')
cursor = conn.cursor()

print("🗑️  Limpando dados existentes de FEV/2026...")
cursor.execute("DELETE FROM financeiro WHERE mes = 2 AND ano = 2026")
cursor.execute("DELETE FROM vendas WHERE strftime('%Y', data) = '2026' AND strftime('%m', data) = '02'")
conn.commit()

# ========== CRIAR VENDAS ==========
print("\n💰 Criando vendas...")

vendedores = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira']
produtos = ['Consultoria Premium', 'Mentoria Individual', 'Curso Online', 'Pacote VIP']
funis = ['Social Selling', 'SDR', 'Inbound', 'Closer']

vendas_criadas = 0
faturamento_total = 0

for dia in range(1, 29):  # Fevereiro 2026
    # 3-5 vendas por dia
    num_vendas = random.randint(3, 5)
    for _ in range(num_vendas):
        data_venda = date(2026, 2, dia)
        cliente = f"Cliente {vendas_criadas + 1}"
        valor = random.choice([2500, 3500, 5000, 7500, 10000, 15000])
        vendedor = random.choice(vendedores)
        funil = random.choice(funis)
        produto = random.choice(produtos)

        cursor.execute("""
            INSERT INTO vendas (cliente, valor_bruto, valor_liquido, valor, data, vendedor, funil, produto, mes, ano)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, 2026)
        """, (cliente, valor, valor * 0.92, valor, data_venda, vendedor, funil, produto))

        vendas_criadas += 1
        faturamento_total += valor

conn.commit()
print(f"✅ {vendas_criadas} vendas criadas - Faturamento: R$ {faturamento_total:,.2f}")

# ========== CRIAR FINANCEIRO ==========
print("\n💳 Criando transações financeiras...")

# ENTRADAS (baseadas nas vendas + recorrência)
print("  📈 Criando entradas...")
entradas = [
    # Vendas do mês
    ("entrada", "Venda Direta", "Faturamento vendas", faturamento_total, "2026-02-28", "realizado"),

    # Receitas recorrentes
    ("entrada", "Recorrência", "Assinaturas mensais", 45000, "2026-02-05", "realizado"),
    ("entrada", "Recorrência", "Contratos ativos", 28000, "2026-02-10", "realizado"),

    # Outras receitas
    ("entrada", "Consultoria", "Projetos especiais", 15000, "2026-02-15", "realizado"),
]

for tipo, categoria, descricao, valor, data_str, status in entradas:
    cursor.execute("""
        INSERT INTO financeiro (tipo, categoria, descricao, valor, data, mes, ano, previsto_realizado)
        VALUES (?, ?, ?, ?, ?, 2, 2026, ?)
    """, (tipo, categoria, descricao, valor, data_str, status))

# SAÍDAS
print("  📉 Criando saídas...")
saidas = [
    # Custos Diretos
    ("saida", "Custo Direto", "Freelancers e parceiros", 35000, "2026-02-25", "realizado"),
    ("saida", "Custo Direto", "Ferramentas e licenças", 8500, "2026-02-20", "realizado"),

    # Custos Fixos - Pessoal
    ("saida", "Pessoal", "Folha de pagamento", 45000, "2026-02-05", "realizado"),
    ("saida", "Pessoal", "Encargos", 12000, "2026-02-05", "realizado"),

    # Custos Fixos - Marketing
    ("saida", "Marketing", "Tráfego pago", 18000, "2026-02-15", "realizado"),
    ("saida", "Marketing", "Ferramentas de MKT", 3500, "2026-02-10", "realizado"),

    # Custos Fixos - Operacional
    ("saida", "Infraestrutura", "Servidor e hospedagem", 2500, "2026-02-08", "realizado"),
    ("saida", "Administrativo", "Contabilidade e jurídico", 3000, "2026-02-12", "realizado"),
    ("saida", "Administrativo", "Materiais de escritório", 800, "2026-02-18", "realizado"),

    # Investimentos
    ("saida", "Investimento", "Software novo CRM", 12000, "2026-02-22", "realizado"),
]

total_saidas = sum([s[3] for s in saidas])

for tipo, categoria, descricao, valor, data_str, status in saidas:
    cursor.execute("""
        INSERT INTO financeiro (tipo, categoria, descricao, valor, data, mes, ano, previsto_realizado)
        VALUES (?, ?, ?, ?, ?, 2, 2026, ?)
    """, (tipo, categoria, descricao, valor, data_str, status))

conn.commit()

total_entradas = faturamento_total + 45000 + 28000 + 15000
saldo = total_entradas - total_saidas

print(f"✅ Transações financeiras criadas")
print(f"   Total Entradas: R$ {total_entradas:,.2f}")
print(f"   Total Saídas: R$ {total_saidas:,.2f}")
print(f"   Saldo: R$ {saldo:,.2f}")

# ========== RESUMO ==========
print("\n" + "="*50)
print("✅ DADOS DE DEMONSTRAÇÃO CRIADOS COM SUCESSO!")
print("="*50)
print(f"📊 Vendas: {vendas_criadas}")
print(f"💰 Faturamento: R$ {faturamento_total:,.2f}")
print(f"📈 Entradas: R$ {total_entradas:,.2f}")
print(f"📉 Saídas: R$ {total_saidas:,.2f}")
print(f"💵 Saldo: R$ {saldo:,.2f}")
print("\n🚀 Acesse: http://localhost:5176")

conn.close()
