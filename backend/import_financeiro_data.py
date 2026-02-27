"""
Script para importar dados do financeiro (Entradas e Saídas) dos CSVs MedGM.

Estrutura do CSV:
- ENTRADAS: linha 6+ (Descrição, Produto, Plano, Modelo, Data, Previsto, Realizado, Bruto)
- SAÍDAS: linha "SAÍDAS"+ (Descrição, Custo, Tipo, Centro de custo, Data, Previsto, Realizado)
"""

import csv
import sys
import re
from datetime import datetime
from app.database import SessionLocal
from app.models.models import Financeiro

def parse_currency(value):
    """Converte valor monetário brasileiro para float."""
    if not value or value.strip() == '':
        return 0.0
    # Remove R$, espaços e converte vírgulas para pontos
    value = value.replace('R$', '').replace('.', '').replace(',', '.').strip()
    try:
        return float(value)
    except ValueError:
        return 0.0

def parse_date(value, mes, ano):
    """Converte dia em data completa."""
    if not value or value.strip() == '':
        return None
    try:
        dia = int(value.strip())
        from datetime import date
        return date(ano, mes, dia)
    except (ValueError, AttributeError):
        return None

def importar_janeiro():
    """Importa dados do financeiro de Janeiro 2026."""
    csv_path = "/Users/odavi.feitosa/Downloads/[MEDGM] FINANCEIRO 2026 .xlsx - JANEIRO (2).csv"
    mes = 1
    ano = 2026

    db = SessionLocal()

    try:
        # Deletar dados existentes de Janeiro 2026
        db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano
        ).delete()
        db.commit()
        print(f"✓ Dados antigos de {mes}/{ano} deletados")

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            lines = list(reader)

            # Processar ENTRADAS (começam na linha 6, vão até "TOTAL DE ENTRADAS")
            entradas_count = 0
            for i in range(6, len(lines)):
                row = lines[i]

                # Parar quando encontrar linha de totais (está em row[1])
                if len(row) > 1 and 'TOTAL DE ENTRADAS' in row[1]:
                    break

                # Pular linhas vazias ou de totalizadores
                # Nota: row[0] é vazia, dados começam em row[1]
                if len(row) < 8 or not row[1] or row[1].strip() == '' or 'Produto' in row[1]:
                    continue

                descricao = row[1].strip()
                produto = row[2].strip() if len(row) > 2 else ''
                plano = row[3].strip() if len(row) > 3 else ''
                modelo = row[4].strip() if len(row) > 4 else ''
                data = parse_date(row[5] if len(row) > 5 else '', mes, ano)
                previsto = parse_currency(row[6] if len(row) > 6 else '')
                realizado = parse_currency(row[7] if len(row) > 7 else '')

                # Usar realizado como valor principal, se não tiver usar previsto
                valor = realizado if realizado > 0 else previsto

                if valor > 0:
                    entrada = Financeiro(
                        tipo='entrada',
                        produto=produto if produto else None,
                        plano=plano if plano else None,
                        modelo=modelo if modelo else None,
                        descricao=descricao,
                        valor=valor,
                        data=data,
                        mes=mes,
                        ano=ano,
                        previsto_realizado='realizado' if realizado > 0 else 'previsto'
                    )
                    db.add(entrada)
                    entradas_count += 1

            db.commit()
            print(f"✓ {entradas_count} entradas importadas")

            # Processar SAÍDAS (começam depois da linha "SAÍDAS")
            saidas_count = 0
            encontrou_saidas = False

            for i in range(len(lines)):
                row = lines[i]

                # Encontrar linha "SAÍDAS" (está em row[1] não row[0])
                if not encontrou_saidas and len(row) > 1 and 'SAÍDAS' in row[1]:
                    encontrou_saidas = True
                    continue

                if not encontrou_saidas:
                    continue

                # Parar quando encontrar linha de totais
                if len(row) > 1 and ('TOTAL DE SAÍDAS' in row[1] or 'Saldo Final' in row[1]):
                    break

                # Pular linhas vazias ou cabeçalhos
                # Nota: row[0] é vazia, dados começam em row[1]
                if len(row) < 7 or not row[1] or row[1].strip() == '' or 'Custo' in row[2]:
                    continue

                descricao = row[1].strip()
                custo = row[2].strip() if len(row) > 2 else ''
                tipo_custo = row[3].strip() if len(row) > 3 else ''
                centro_custo = row[4].strip() if len(row) > 4 else ''
                data = parse_date(row[5] if len(row) > 5 else '', mes, ano)
                previsto = parse_currency(row[6] if len(row) > 6 else '')
                realizado = parse_currency(row[7] if len(row) > 7 else '')

                # Usar realizado como valor principal, se não tiver usar previsto
                valor = realizado if realizado > 0 else previsto

                if valor > 0:
                    saida = Financeiro(
                        tipo='saida',
                        custo=custo if custo else None,
                        tipo_custo=tipo_custo if tipo_custo else None,
                        centro_custo=centro_custo if centro_custo else None,
                        descricao=descricao,
                        valor=valor,
                        data=data,
                        mes=mes,
                        ano=ano,
                        previsto_realizado='realizado' if realizado > 0 else 'previsto'
                    )
                    db.add(saida)
                    saidas_count += 1

            db.commit()
            print(f"✓ {saidas_count} saídas importadas")
            print(f"✅ Janeiro 2026: {entradas_count} entradas + {saidas_count} saídas = {entradas_count + saidas_count} registros")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao importar Janeiro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def importar_fevereiro():
    """Importa dados do financeiro de Fevereiro 2026."""
    csv_path = "/Users/odavi.feitosa/Downloads/[MEDGM] FINANCEIRO 2026 .xlsx - FEVEREIRO (2).csv"
    mes = 2
    ano = 2026

    db = SessionLocal()

    try:
        # Deletar dados existentes de Fevereiro 2026
        db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano
        ).delete()
        db.commit()
        print(f"✓ Dados antigos de {mes}/{ano} deletados")

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            lines = list(reader)

            # Processar ENTRADAS
            entradas_count = 0
            for i in range(6, len(lines)):
                row = lines[i]

                if len(row) > 0 and 'TOTAL DE ENTRADAS' in row[1]:
                    break

                if len(row) < 8 or not row[1] or row[1].strip() == '' or 'Produto' in row[1]:
                    continue

                descricao = row[1].strip()
                produto = row[2].strip() if len(row) > 2 else ''
                plano = row[3].strip() if len(row) > 3 else ''
                modelo = row[4].strip() if len(row) > 4 else ''
                data = parse_date(row[5] if len(row) > 5 else '', mes, ano)
                previsto = parse_currency(row[6] if len(row) > 6 else '')
                realizado = parse_currency(row[7] if len(row) > 7 else '')

                valor = realizado if realizado > 0 else previsto

                if valor > 0:
                    entrada = Financeiro(
                        tipo='entrada',
                        produto=produto if produto else None,
                        plano=plano if plano else None,
                        modelo=modelo if modelo else None,
                        descricao=descricao,
                        valor=valor,
                        data=data,
                        mes=mes,
                        ano=ano,
                        previsto_realizado='realizado' if realizado > 0 else 'previsto'
                    )
                    db.add(entrada)
                    entradas_count += 1

            db.commit()
            print(f"✓ {entradas_count} entradas importadas")

            # Processar SAÍDAS
            saidas_count = 0
            encontrou_saidas = False

            for i in range(len(lines)):
                row = lines[i]

                if not encontrou_saidas and len(row) > 0 and 'SAÍDAS' in row[1]:
                    encontrou_saidas = True
                    continue

                if not encontrou_saidas:
                    continue

                if len(row) > 0 and ('TOTAL DE SAÍDAS' in row[1] or 'Saldo Final' in row[0]):
                    break

                if len(row) < 7 or not row[1] or row[1].strip() == '' or 'Custo' in row[2]:
                    continue

                descricao = row[1].strip()
                custo = row[2].strip() if len(row) > 2 else ''
                tipo_custo = row[3].strip() if len(row) > 3 else ''
                centro_custo = row[4].strip() if len(row) > 4 else ''
                data = parse_date(row[5] if len(row) > 5 else '', mes, ano)
                previsto = parse_currency(row[6] if len(row) > 6 else '')
                realizado = parse_currency(row[7] if len(row) > 7 else '')

                valor = realizado if realizado > 0 else previsto

                if valor > 0:
                    saida = Financeiro(
                        tipo='saida',
                        custo=custo if custo else None,
                        tipo_custo=tipo_custo if tipo_custo else None,
                        centro_custo=centro_custo if centro_custo else None,
                        descricao=descricao,
                        valor=valor,
                        data=data,
                        mes=mes,
                        ano=ano,
                        previsto_realizado='realizado' if realizado > 0 else 'previsto'
                    )
                    db.add(saida)
                    saidas_count += 1

            db.commit()
            print(f"✓ {saidas_count} saídas importadas")
            print(f"✅ Fevereiro 2026: {entradas_count} entradas + {saidas_count} saídas = {entradas_count + saidas_count} registros")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao importar Fevereiro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("IMPORTAÇÃO DE DADOS FINANCEIROS - MEDGM 2026")
    print("=" * 60)

    print("\n[1/2] Importando Janeiro 2026...")
    importar_janeiro()

    print("\n[2/2] Importando Fevereiro 2026...")
    importar_fevereiro()

    print("\n" + "=" * 60)
    print("✅ IMPORTAÇÃO CONCLUÍDA!")
    print("=" * 60)
