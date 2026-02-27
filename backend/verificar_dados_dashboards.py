#!/usr/bin/env python3
"""
Script para verificar a qualidade dos dados em cada dashboard.
Identifica dados vazios, incorretos ou faltantes.
"""

import sqlite3
from datetime import datetime
import json

# Conectar ao banco
db_path = "data/medgm_analytics.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 80)
print("VERIFICAÇÃO DE DADOS DOS DASHBOARDS")
print("=" * 80)
print()

# ============================================================================
# 1. DASHBOARD GERAL (COMERCIAL)
# ============================================================================
print("1. DASHBOARD GERAL (COMERCIAL)")
print("-" * 80)

# Verificar vendas de fevereiro/2026
cursor.execute("""
    SELECT COUNT(*),
           SUM(valor_bruto),
           SUM(valor_liquido),
           SUM(booking)
    FROM vendas
    WHERE mes = 2 AND ano = 2026
""")
vendas_fev = cursor.fetchone()
print(f"Vendas Feb/2026: {vendas_fev[0]} vendas")
print(f"  Valor Bruto: R$ {vendas_fev[1]:,.2f}")
print(f"  Valor Líquido: R$ {vendas_fev[2]:,.2f}")
print(f"  Booking: R$ {vendas_fev[3]:,.2f}")

# Verificar metas
cursor.execute("""
    SELECT COUNT(*), SUM(meta_faturamento), SUM(meta_vendas)
    FROM metas
    WHERE mes = 2 AND ano = 2026
""")
metas_fev = cursor.fetchone()
print(f"\nMetas Feb/2026: {metas_fev[0]} metas cadastradas")
print(f"  Meta Faturamento Total: R$ {metas_fev[1]:,.2f}")
print(f"  Meta Vendas Total: {metas_fev[2]}")

# Verificar pessoas
cursor.execute("SELECT COUNT(*), GROUP_CONCAT(DISTINCT funcao) FROM pessoas")
pessoas = cursor.fetchone()
print(f"\nPessoas cadastradas: {pessoas[0]}")
print(f"  Funções: {pessoas[1]}")

print()

# ============================================================================
# 2. SOCIAL SELLING
# ============================================================================
print("2. SOCIAL SELLING")
print("-" * 80)

cursor.execute("""
    SELECT
        vendedor,
        SUM(ativacoes) as total_ativacoes,
        SUM(conversoes) as total_conversoes,
        SUM(leads_gerados) as total_leads
    FROM social_selling_metricas
    WHERE mes = 2 AND ano = 2026
    GROUP BY vendedor
""")
ss_data = cursor.fetchall()

if ss_data:
    for row in ss_data:
        print(f"{row[0]}: {row[1]} ativações, {row[2]} conversões, {row[3]} leads")
else:
    print("❌ PROBLEMA: Nenhum dado de Social Selling encontrado!")

# Verificar dados diários
cursor.execute("""
    SELECT COUNT(DISTINCT data)
    FROM social_selling_metricas
    WHERE mes = 2 AND ano = 2026 AND data IS NOT NULL
""")
dias_ss = cursor.fetchone()[0]
print(f"\nDias com dados: {dias_ss}")

# Verificar metas de SS
cursor.execute("""
    SELECT p.nome, m.meta_ativacoes, m.meta_leads
    FROM metas m
    JOIN pessoas p ON m.pessoa_id = p.id
    WHERE m.mes = 2 AND m.ano = 2026 AND p.funcao = 'social_selling'
""")
metas_ss = cursor.fetchall()
print(f"Metas de Social Selling: {len(metas_ss)}")
for m in metas_ss:
    print(f"  {m[0]}: {m[1]} ativações, {m[2]} leads")

print()

# ============================================================================
# 3. SDR
# ============================================================================
print("3. SDR")
print("-" * 80)

cursor.execute("""
    SELECT
        sdr,
        funil,
        SUM(leads_recebidos) as total_leads,
        SUM(reunioes_agendadas) as total_agendadas,
        SUM(reunioes_realizadas) as total_realizadas
    FROM sdr_metricas
    WHERE mes = 2 AND ano = 2026
    GROUP BY sdr, funil
""")
sdr_data = cursor.fetchall()

if sdr_data:
    for row in sdr_data:
        print(f"{row[0]} ({row[1]}): {row[2]} leads, {row[3]} agendadas, {row[4]} realizadas")
else:
    print("❌ PROBLEMA: Nenhum dado de SDR encontrado!")

# Verificar metas de SDR
cursor.execute("""
    SELECT p.nome, m.meta_reunioes
    FROM metas m
    JOIN pessoas p ON m.pessoa_id = p.id
    WHERE m.mes = 2 AND m.ano = 2026 AND p.funcao = 'sdr'
""")
metas_sdr = cursor.fetchall()
print(f"\nMetas de SDR: {len(metas_sdr)}")
for m in metas_sdr:
    print(f"  {m[0]}: {m[1]} reuniões")

print()

# ============================================================================
# 4. CLOSER
# ============================================================================
print("4. CLOSER")
print("-" * 80)

cursor.execute("""
    SELECT
        closer,
        funil,
        SUM(calls_agendadas) as total_calls_agendadas,
        SUM(calls_realizadas) as total_calls_realizadas,
        SUM(vendas) as total_vendas,
        SUM(booking) as total_booking,
        SUM(faturamento_bruto) as total_fat_bruto,
        SUM(faturamento_liquido) as total_fat_liquido
    FROM closer_metricas
    WHERE mes = 2 AND ano = 2026
    GROUP BY closer, funil
""")
closer_data = cursor.fetchall()

if closer_data:
    for row in closer_data:
        print(f"{row[0]} ({row[1]}):")
        print(f"  Calls: {row[2]} agendadas, {row[3]} realizadas")
        print(f"  Vendas: {row[4]}")
        print(f"  Booking: R$ {row[5]:,.2f}")
        print(f"  Faturamento Bruto: R$ {row[6]:,.2f}")
        print(f"  Faturamento Líquido: R$ {row[7]:,.2f}")
        print()
else:
    print("❌ PROBLEMA: Nenhum dado de Closer encontrado!")

# Verificar se faturamento está zerado
cursor.execute("""
    SELECT COUNT(*)
    FROM closer_metricas
    WHERE mes = 2 AND ano = 2026
      AND (faturamento_bruto = 0 OR faturamento_bruto IS NULL)
      AND vendas > 0
""")
vendas_sem_fat = cursor.fetchone()[0]
if vendas_sem_fat > 0:
    print(f"⚠️  ALERTA: {vendas_sem_fat} registros com vendas mas sem faturamento!")

# Verificar metas de Closer
cursor.execute("""
    SELECT p.nome, m.meta_vendas, m.meta_faturamento
    FROM metas m
    JOIN pessoas p ON m.pessoa_id = p.id
    WHERE m.mes = 2 AND m.ano = 2026 AND p.funcao = 'closer'
""")
metas_closer = cursor.fetchall()
print(f"\nMetas de Closer: {len(metas_closer)}")
for m in metas_closer:
    print(f"  {m[0]}: {m[1]} vendas, R$ {m[2]:,.2f} faturamento")

print()

# ============================================================================
# 5. FINANCEIRO
# ============================================================================
print("5. FINANCEIRO")
print("-" * 80)

# Entradas
cursor.execute("""
    SELECT
        categoria,
        COUNT(*) as qtd,
        SUM(valor) as total
    FROM financeiro
    WHERE mes = 2 AND ano = 2026 AND tipo = 'entrada'
    GROUP BY categoria
    ORDER BY total DESC
""")
entradas = cursor.fetchall()
print("ENTRADAS:")
total_entradas = 0
for e in entradas:
    print(f"  {e[0]}: {e[1]} registros, R$ {e[2]:,.2f}")
    total_entradas += e[2]
print(f"  TOTAL ENTRADAS: R$ {total_entradas:,.2f}")

print()

# Saídas
cursor.execute("""
    SELECT
        categoria,
        COUNT(*) as qtd,
        SUM(valor) as total
    FROM financeiro
    WHERE mes = 2 AND ano = 2026 AND tipo = 'saida'
    GROUP BY categoria
    ORDER BY total DESC
    LIMIT 10
""")
saidas = cursor.fetchall()
print("SAÍDAS (top 10):")
total_saidas = 0
for s in saidas:
    print(f"  {s[0]}: {s[1]} registros, R$ {s[2]:,.2f}")
    total_saidas += s[2]

cursor.execute("""
    SELECT SUM(valor)
    FROM financeiro
    WHERE mes = 2 AND ano = 2026 AND tipo = 'saida'
""")
total_saidas_real = cursor.fetchone()[0]
print(f"  TOTAL SAÍDAS: R$ {total_saidas_real:,.2f}")

saldo = total_entradas - total_saidas_real
print(f"\nSALDO: R$ {saldo:,.2f}")

# Verificar dados sem categoria
cursor.execute("""
    SELECT COUNT(*)
    FROM financeiro
    WHERE mes = 2 AND ano = 2026 AND (categoria IS NULL OR categoria = '')
""")
sem_categoria = cursor.fetchone()[0]
if sem_categoria > 0:
    print(f"⚠️  ALERTA: {sem_categoria} registros financeiros sem categoria!")

print()

# ============================================================================
# 6. ANÁLISE DE INCONSISTÊNCIAS
# ============================================================================
print("6. ANÁLISE DE INCONSISTÊNCIAS")
print("-" * 80)

inconsistencias = []

# Comparar faturamento entre vendas e closer_metricas
cursor.execute("""
    SELECT SUM(valor_liquido) FROM vendas WHERE mes = 2 AND ano = 2026
""")
fat_vendas = cursor.fetchone()[0] or 0

cursor.execute("""
    SELECT SUM(faturamento_liquido) FROM closer_metricas WHERE mes = 2 AND ano = 2026
""")
fat_closer = cursor.fetchone()[0] or 0

if abs(fat_vendas - fat_closer) > 100:
    inconsistencias.append(f"Divergência entre vendas (R$ {fat_vendas:,.2f}) e closer_metricas (R$ {fat_closer:,.2f})")

# Verificar se há dados de janeiro também
cursor.execute("SELECT COUNT(*) FROM vendas WHERE mes = 1 AND ano = 2026")
vendas_jan = cursor.fetchone()[0]
if vendas_jan > 0:
    print(f"✓ Dados de Janeiro/2026 disponíveis: {vendas_jan} vendas")

# Verificar integridade das taxas calculadas
cursor.execute("""
    SELECT COUNT(*)
    FROM social_selling_metricas
    WHERE mes = 2 AND ano = 2026
      AND ativacoes > 0
      AND (tx_ativ_conv = 0 OR tx_ativ_conv IS NULL)
""")
taxas_erradas_ss = cursor.fetchone()[0]
if taxas_erradas_ss > 0:
    inconsistencias.append(f"{taxas_erradas_ss} registros de SS com taxas não calculadas")

if inconsistencias:
    print("⚠️  INCONSISTÊNCIAS ENCONTRADAS:")
    for inc in inconsistencias:
        print(f"  - {inc}")
else:
    print("✓ Nenhuma inconsistência grave detectada")

print()

# ============================================================================
# 7. RESUMO E RECOMENDAÇÕES
# ============================================================================
print("7. RESUMO E RECOMENDAÇÕES")
print("-" * 80)

problemas = []
ok = []

if vendas_fev[0] > 0:
    ok.append(f"Vendas: {vendas_fev[0]} vendas em Feb/2026")
else:
    problemas.append("Sem vendas em Feb/2026")

if ss_data:
    ok.append(f"Social Selling: {len(ss_data)} vendedor(es) com dados")
else:
    problemas.append("Social Selling sem dados")

if sdr_data:
    ok.append(f"SDR: {len(sdr_data)} combinações SDR/Funil com dados")
else:
    problemas.append("SDR sem dados")

if closer_data:
    ok.append(f"Closer: {len(closer_data)} combinações Closer/Funil com dados")
else:
    problemas.append("Closer sem dados")

if total_entradas > 0 and total_saidas_real > 0:
    ok.append(f"Financeiro: R$ {total_entradas:,.2f} entradas, R$ {total_saidas_real:,.2f} saídas")
else:
    problemas.append("Financeiro com dados vazios")

if metas_fev[0] > 0:
    ok.append(f"Metas: {metas_fev[0]} metas cadastradas")
else:
    problemas.append("Sem metas cadastradas")

print("✓ FUNCIONANDO:")
for item in ok:
    print(f"  - {item}")

print()

if problemas:
    print("❌ PROBLEMAS DETECTADOS:")
    for item in problemas:
        print(f"  - {item}")
else:
    print("✓ Todos os dashboards têm dados!")

conn.close()

print()
print("=" * 80)
print("FIM DA VERIFICAÇÃO")
print("=" * 80)
