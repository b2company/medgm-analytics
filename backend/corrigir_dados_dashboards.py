#!/usr/bin/env python3
"""
Script para corrigir problemas identificados nos dados dos dashboards.
"""

import sqlite3
from datetime import datetime

db_path = "data/medgm_analytics.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 80)
print("CORREÇÃO DE DADOS DOS DASHBOARDS")
print("=" * 80)
print()

# ============================================================================
# 1. CORRIGIR TAXAS DE SOCIAL SELLING
# ============================================================================
print("1. Corrigindo taxas de Social Selling...")

cursor.execute("""
    UPDATE social_selling_metricas
    SET tx_ativ_conv = ROUND(CAST(conversoes AS REAL) / CAST(ativacoes AS REAL) * 100, 2)
    WHERE ativacoes > 0 AND (tx_ativ_conv = 0 OR tx_ativ_conv IS NULL)
""")
rows1 = cursor.rowcount

cursor.execute("""
    UPDATE social_selling_metricas
    SET tx_conv_lead = ROUND(CAST(leads_gerados AS REAL) / CAST(conversoes AS REAL) * 100, 2)
    WHERE conversoes > 0 AND (tx_conv_lead = 0 OR tx_conv_lead IS NULL)
""")
rows2 = cursor.rowcount

print(f"  ✓ Atualizadas {rows1} taxas de ativação-conversão")
print(f"  ✓ Atualizadas {rows2} taxas de conversão-lead")
print()

# ============================================================================
# 2. CORRIGIR BOOKING EM CLOSER_METRICAS
# ============================================================================
print("2. Corrigindo booking em closer_metricas...")

# Booking deve ser igual ao faturamento_bruto (ou faturamento_liquido se bruto for zero)
cursor.execute("""
    UPDATE closer_metricas
    SET booking = COALESCE(faturamento_bruto, faturamento_liquido, faturamento, 0)
    WHERE booking = 0 OR booking IS NULL
""")
rows_booking = cursor.rowcount
print(f"  ✓ Atualizados {rows_booking} registros de booking")
print()

# ============================================================================
# 3. SINCRONIZAR FATURAMENTO ENTRE VENDAS E CLOSER_METRICAS
# ============================================================================
print("3. Sincronizando faturamento entre vendas e closer_metricas...")

# Para cada closer/funil/dia, somar as vendas e atualizar as métricas
cursor.execute("""
    SELECT
        closer,
        funil,
        data,
        SUM(booking) as total_booking,
        SUM(valor_bruto) as total_bruto,
        SUM(valor_liquido) as total_liquido,
        COUNT(*) as qtd_vendas
    FROM vendas
    WHERE mes = 2 AND ano = 2026
      AND closer IS NOT NULL
      AND closer != ''
    GROUP BY closer, funil, data
""")
vendas_agregadas = cursor.fetchall()

print(f"  Processando {len(vendas_agregadas)} grupos de vendas...")

for venda in vendas_agregadas:
    closer, funil, data, booking, bruto, liquido, qtd = venda

    # Atualizar o registro correspondente em closer_metricas
    cursor.execute("""
        UPDATE closer_metricas
        SET booking = ?,
            faturamento_bruto = ?,
            faturamento_liquido = ?,
            vendas = ?
        WHERE closer = ?
          AND funil = ?
          AND data = ?
          AND mes = 2
          AND ano = 2026
    """, (booking or 0, bruto or 0, liquido or 0, qtd, closer, funil, data))

    if cursor.rowcount == 0:
        # Registro não existe, criar
        cursor.execute("""
            INSERT INTO closer_metricas (
                mes, ano, data, closer, funil,
                calls_agendadas, calls_realizadas,
                vendas, booking, faturamento_bruto, faturamento_liquido,
                faturamento, meta_vendas, meta_faturamento,
                tx_comparecimento, tx_conversao, ticket_medio
            ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0)
        """, (2, 2026, data, closer, funil, qtd, booking or 0, bruto or 0, liquido or 0))

print(f"  ✓ Sincronizados {len(vendas_agregadas)} grupos de vendas")
print()

# ============================================================================
# 4. ADICIONAR RECEITAS NO FINANCEIRO BASEADO NAS VENDAS
# ============================================================================
print("4. Adicionando receitas no financeiro baseado nas vendas...")

# Verificar se já existem receitas
cursor.execute("""
    SELECT COUNT(*)
    FROM financeiro
    WHERE mes = 2 AND ano = 2026 AND tipo = 'entrada'
""")
receitas_existentes = cursor.fetchone()[0]

if receitas_existentes == 0:
    print("  Criando entradas de receita baseadas nas vendas...")

    # Buscar todas as vendas
    cursor.execute("""
        SELECT data, cliente, valor_liquido, produto, tipo_receita
        FROM vendas
        WHERE mes = 2 AND ano = 2026
    """)
    vendas = cursor.fetchall()

    for venda in vendas:
        data, cliente, valor, produto, tipo_receita = venda

        categoria = tipo_receita or "Receita"
        descricao = f"Venda - {cliente} - {produto or 'Assessoria'}"

        cursor.execute("""
            INSERT INTO financeiro (
                tipo, categoria, descricao, valor, data, mes, ano,
                previsto_realizado, produto
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ('entrada', categoria, descricao, valor, data, 2, 2026, 'realizado', produto))

    print(f"  ✓ Criadas {len(vendas)} entradas de receita")
else:
    print(f"  ✓ Já existem {receitas_existentes} entradas de receita")

print()

# ============================================================================
# 5. RECALCULAR TAXAS E TICKET MÉDIO
# ============================================================================
print("5. Recalculando taxas e ticket médio...")

# SDR
cursor.execute("""
    UPDATE sdr_metricas
    SET tx_agendamento = ROUND(CAST(reunioes_agendadas AS REAL) / NULLIF(CAST(leads_recebidos AS REAL), 0) * 100, 2),
        tx_comparecimento = ROUND(CAST(reunioes_realizadas AS REAL) / NULLIF(CAST(reunioes_agendadas AS REAL), 0) * 100, 2)
    WHERE mes = 2 AND ano = 2026
""")
print(f"  ✓ Recalculadas taxas de SDR ({cursor.rowcount} registros)")

# Closer
cursor.execute("""
    UPDATE closer_metricas
    SET tx_comparecimento = ROUND(CAST(calls_realizadas AS REAL) / NULLIF(CAST(calls_agendadas AS REAL), 0) * 100, 2),
        tx_conversao = ROUND(CAST(vendas AS REAL) / NULLIF(CAST(calls_realizadas AS REAL), 0) * 100, 2),
        ticket_medio = ROUND(CAST(faturamento_liquido AS REAL) / NULLIF(CAST(vendas AS REAL), 0), 2)
    WHERE mes = 2 AND ano = 2026
""")
print(f"  ✓ Recalculadas taxas e ticket médio de Closer ({cursor.rowcount} registros)")

print()

# ============================================================================
# 6. CRIAR METAS FALTANTES
# ============================================================================
print("6. Verificando metas...")

# Verificar se todas as pessoas têm meta
cursor.execute("""
    SELECT p.id, p.nome, p.funcao
    FROM pessoas p
    WHERE NOT EXISTS (
        SELECT 1 FROM metas m
        WHERE m.pessoa_id = p.id AND m.mes = 2 AND m.ano = 2026
    )
    AND p.funcao IN ('social_selling', 'sdr', 'closer')
""")
pessoas_sem_meta = cursor.fetchall()

if pessoas_sem_meta:
    print(f"  Criando metas para {len(pessoas_sem_meta)} pessoas...")

    for pessoa_id, nome, funcao in pessoas_sem_meta:
        # Definir metas padrão baseadas na função
        if funcao == 'social_selling':
            meta_ativacoes = 5000
            meta_leads = 20
            meta_reunioes = 0
            meta_vendas = 0
            meta_faturamento = 0
        elif funcao == 'sdr':
            meta_ativacoes = 0
            meta_leads = 0
            meta_reunioes = 15
            meta_vendas = 0
            meta_faturamento = 0
        elif funcao == 'closer':
            meta_ativacoes = 0
            meta_leads = 0
            meta_reunioes = 0
            meta_vendas = 5
            meta_faturamento = 30000

        cursor.execute("""
            INSERT INTO metas (
                pessoa_id, mes, ano, tipo,
                meta_ativacoes, meta_leads, meta_reunioes,
                meta_vendas, meta_faturamento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (pessoa_id, 2, 2026, 'mensal', meta_ativacoes, meta_leads, meta_reunioes,
              meta_vendas, meta_faturamento))

        print(f"    ✓ Meta criada para {nome} ({funcao})")
else:
    print("  ✓ Todas as pessoas têm metas cadastradas")

print()

# ============================================================================
# 7. COMMIT E VERIFICAÇÃO FINAL
# ============================================================================
conn.commit()
print("✓ Todas as alterações foram salvas no banco de dados")
print()

# Verificação final
print("VERIFICAÇÃO FINAL:")
print("-" * 80)

cursor.execute("SELECT SUM(valor) FROM financeiro WHERE mes = 2 AND ano = 2026 AND tipo = 'entrada'")
receitas = cursor.fetchone()[0] or 0
print(f"  Receitas: R$ {receitas:,.2f}")

cursor.execute("SELECT SUM(valor_liquido) FROM vendas WHERE mes = 2 AND ano = 2026")
vendas_total = cursor.fetchone()[0] or 0
print(f"  Vendas: R$ {vendas_total:,.2f}")

cursor.execute("SELECT SUM(faturamento_liquido) FROM closer_metricas WHERE mes = 2 AND ano = 2026")
closer_fat = cursor.fetchone()[0] or 0
print(f"  Faturamento em Closer: R$ {closer_fat:,.2f}")

cursor.execute("SELECT COUNT(*) FROM social_selling_metricas WHERE mes = 2 AND ano = 2026 AND (tx_ativ_conv = 0 OR tx_ativ_conv IS NULL) AND ativacoes > 0")
taxas_pendentes = cursor.fetchone()[0]
print(f"  Taxas pendentes em SS: {taxas_pendentes}")

cursor.execute("SELECT COUNT(*) FROM metas WHERE mes = 2 AND ano = 2026")
metas_total = cursor.fetchone()[0]
print(f"  Metas cadastradas: {metas_total}")

conn.close()

print()
print("=" * 80)
print("CORREÇÃO CONCLUÍDA COM SUCESSO!")
print("=" * 80)
