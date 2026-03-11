"""
Script de importação de dados iniciais das planilhas Excel para o banco de dados SQLite.

Importa dados de:
1. [MEDGM] FINANCEIRO 2026 (6).xlsx - abas JANEIRO e FEVEREIRO
2. MedGM_Controle_Comercial[01]_JAN_2026 (1).xlsx - todas as abas relevantes
3. MedGM_Controle_Comercial[02]_FEV_2026 (2).xlsx - todas as abas relevantes

Autor: MedGM Analytics Team
Data: 2026-02-24
"""

import sys
import os
from pathlib import Path

# Add parent directories to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db, engine
from app.models.models import Venda, Financeiro, KPI


# Configurações
DOWNLOADS_PATH = "/Users/odavi.feitosa/Downloads"
PLANILHAS = {
    'financeiro': f"{DOWNLOADS_PATH}/[MEDGM] FINANCEIRO 2026  (6).xlsx",
    'comercial_jan': f"{DOWNLOADS_PATH}/MedGM_Controle_Comercial[01]_JAN_2026 (1).xlsx",
    'comercial_fev': f"{DOWNLOADS_PATH}/MedGM_Controle_Comercial[02]_FEV_2026 (2).xlsx"
}

# Estatísticas de importação
stats = {
    'vendas': 0,
    'financeiro': 0,
    'kpis': 0,
    'erros': [],
    'avisos': []
}


def log(message, level='INFO'):
    """Log formatado com timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [{level}] {message}")


def validar_numero(valor, campo_nome, linha=None):
    """
    Valida e converte valores numéricos.
    Retorna 0.0 se inválido, mas registra aviso.
    """
    if pd.isna(valor) or valor is None or valor == '':
        return 0.0

    try:
        numero = float(valor)
        if np.isnan(numero) or np.isinf(numero):
            msg = f"Valor NaN/Inf em '{campo_nome}'"
            if linha:
                msg += f" (linha {linha})"
            stats['avisos'].append(msg)
            return 0.0
        return numero
    except (ValueError, TypeError) as e:
        msg = f"Valor inválido em '{campo_nome}': {valor}"
        if linha:
            msg += f" (linha {linha})"
        stats['avisos'].append(msg)
        return 0.0


def validar_data(valor, campo_nome, linha=None):
    """
    Valida e converte datas.
    Retorna None se inválida.
    """
    if pd.isna(valor) or valor is None or valor == '':
        return None

    try:
        if isinstance(valor, datetime):
            return valor.date()
        elif isinstance(valor, str):
            # Tentar parsear string
            dt = pd.to_datetime(valor)
            return dt.date()
        else:
            # Tentar converter timestamp do pandas
            dt = pd.to_datetime(valor)
            return dt.date()
    except Exception as e:
        msg = f"Data inválida em '{campo_nome}': {valor}"
        if linha:
            msg += f" (linha {linha})"
        stats['avisos'].append(msg)
        return None


def importar_vendas_comercial(db: Session, planilha_path: str, mes: int, ano: int):
    """
    Importa dados da aba VENDAS do controle comercial.

    Estrutura esperada (após linha de headers):
    - ID, DATA, CLIENTE, CLOSER, FUNIL, TIPO_RECEITA, PRODUTO, VALOR_CONTRATO,
      PREVISTO, VALOR_PAGO, VALOR_LIQUIDO
    """
    log(f"Importando vendas de {planilha_path} (mês {mes}/{ano})")

    try:
        # Ler planilha pulando primeira linha (título)
        df = pd.read_excel(planilha_path, sheet_name='VENDAS', skiprows=1)

        # Renomear colunas (as primeiras 11 colunas são os dados relevantes)
        if len(df.columns) >= 11:
            df.columns = ['ID', 'DATA', 'CLIENTE', 'CLOSER', 'FUNIL',
                         'TIPO_RECEITA', 'PRODUTO', 'VALOR_CONTRATO',
                         'PREVISTO', 'VALOR_PAGO', 'VALOR_LIQUIDO'] + list(df.columns[11:])
        else:
            log(f"AVISO: Planilha {planilha_path} tem menos colunas que o esperado", 'WARNING')
            return 0

        # Filtrar linhas válidas (tem ID e CLIENTE)
        df = df[df['ID'].notna() & df['CLIENTE'].notna()]

        # Remover linha de headers duplicada (onde ID == 'ID')
        df = df[df['ID'] != 'ID']

        vendas_count = 0

        for idx, row in df.iterrows():
            try:
                # Validar dados obrigatórios
                cliente = str(row['CLIENTE']).strip()
                if not cliente or cliente == 'nan':
                    continue

                data = validar_data(row['DATA'], 'DATA', idx)
                if not data:
                    stats['avisos'].append(f"Venda sem data válida (linha {idx}): {cliente}")
                    # Usar data padrão do mês/ano
                    data = datetime(ano, mes, 1).date()

                # Extrair valores
                valor_liquido = validar_numero(row.get('VALOR_LIQUIDO', 0), 'VALOR_LIQUIDO', idx)
                valor_pago = validar_numero(row.get('VALOR_PAGO', 0), 'VALOR_PAGO', idx)

                # Se valor líquido é 0, usar valor pago
                valor = valor_liquido if valor_liquido > 0 else valor_pago

                # Se ainda é 0, tentar valor contrato
                if valor == 0:
                    valor = validar_numero(row.get('VALOR_CONTRATO', 0), 'VALOR_CONTRATO', idx)

                # Extrair funil e vendedor
                funil = str(row.get('FUNIL', 'Não Informado')).strip()
                if funil == 'nan' or funil == '-' or not funil:
                    funil = 'Não Informado'

                vendedor = str(row.get('CLOSER', 'Não Informado')).strip()
                if vendedor == 'nan' or vendedor == '-' or not vendedor:
                    vendedor = 'Não Informado'

                # Criar registro de venda
                venda = Venda(
                    data=data,
                    cliente=cliente,
                    valor=valor,
                    funil=funil,
                    vendedor=vendedor,
                    mes=mes,
                    ano=ano
                )

                db.add(venda)
                vendas_count += 1

            except Exception as e:
                erro_msg = f"Erro ao processar venda linha {idx}: {str(e)}"
                log(erro_msg, 'ERROR')
                stats['erros'].append(erro_msg)

        db.commit()
        log(f"✓ Importadas {vendas_count} vendas do mês {mes}/{ano}")
        return vendas_count

    except Exception as e:
        erro_msg = f"Erro ao importar vendas de {planilha_path}: {str(e)}"
        log(erro_msg, 'ERROR')
        stats['erros'].append(erro_msg)
        db.rollback()
        return 0


def importar_financeiro(db: Session, planilha_path: str, aba: str, mes: int, ano: int):
    """
    Importa dados financeiros da planilha FINANCEIRO 2026.

    Estrutura esperada:
    - Linha 0: Título "FINANCEIRO JANEIRO" + "Saldo Inicial" + valor
    - Linha 4: Headers (ignorar)
    - Linhas seguintes: dados de Entradas (Produto, Plano, Modelo, DATA, Previsto, Realizado)
    """
    log(f"Importando dados financeiros de {aba} ({mes}/{ano})")

    try:
        # Ler planilha
        df = pd.read_excel(planilha_path, sheet_name=aba)

        # Extrair saldo inicial da linha 0
        saldo_inicial = 0.0
        try:
            if len(df.columns) >= 8:
                saldo_inicial = validar_numero(df.iloc[0, 7], 'Saldo Inicial')
        except:
            pass

        # Encontrar linha de início dos dados (após "Entradas")
        start_row = None
        for idx, row in df.iterrows():
            if 'Entradas' in str(row.values):
                start_row = idx + 1
                break

        if start_row is None:
            log(f"AVISO: Não encontrada seção 'Entradas' em {aba}", 'WARNING')
            return 0

        # Processar dados a partir da linha encontrada
        financeiro_count = 0

        for idx in range(start_row, len(df)):
            try:
                row = df.iloc[idx]

                # Parar quando encontrar seção "Produto" (resumo)
                if 'Produto' in str(row.iloc[1]):
                    break

                # Pular linhas completamente vazias
                if pd.isna(row.iloc[1]):
                    continue

                descricao = str(row.iloc[1]).strip()
                if not descricao or descricao == 'nan':
                    continue

                produto = str(row.iloc[2]) if len(row) > 2 else ''
                plano = str(row.iloc[3]) if len(row) > 3 else ''

                # Categoria = combinação de produto e plano
                categoria = f"{produto} - {plano}".strip(' -')
                if not categoria:
                    categoria = descricao

                # Data
                data_valor = row.iloc[5] if len(row) > 5 else None
                data = validar_data(data_valor, 'DATA', idx)
                if not data:
                    # Usar primeiro dia do mês se não tiver data
                    data = datetime(ano, mes, 1).date()

                # Valores previsto e realizado
                previsto = validar_numero(row.iloc[6], 'Previsto', idx) if len(row) > 6 else 0.0
                realizado = validar_numero(row.iloc[7], 'Realizado', idx) if len(row) > 7 else 0.0

                # Criar entrada prevista (se > 0)
                if previsto > 0:
                    fin_prev = Financeiro(
                        tipo='entrada',
                        categoria=categoria,
                        valor=previsto,
                        data=data,
                        mes=mes,
                        ano=ano,
                        previsto_realizado='previsto',
                        descricao=descricao
                    )
                    db.add(fin_prev)
                    financeiro_count += 1

                # Criar entrada realizada (se > 0)
                if realizado > 0:
                    fin_real = Financeiro(
                        tipo='entrada',
                        categoria=categoria,
                        valor=realizado,
                        data=data,
                        mes=mes,
                        ano=ano,
                        previsto_realizado='realizado',
                        descricao=descricao
                    )
                    db.add(fin_real)
                    financeiro_count += 1

            except Exception as e:
                erro_msg = f"Erro ao processar linha financeira {idx} de {aba}: {str(e)}"
                stats['avisos'].append(erro_msg)

        db.commit()
        log(f"✓ Importados {financeiro_count} registros financeiros de {aba}")
        return financeiro_count

    except Exception as e:
        erro_msg = f"Erro ao importar financeiro de {aba}: {str(e)}"
        log(erro_msg, 'ERROR')
        stats['erros'].append(erro_msg)
        db.rollback()
        return 0


def calcular_kpis(db: Session, mes: int, ano: int):
    """
    Calcula e salva KPIs consolidados para o mês.
    """
    log(f"Calculando KPIs para {mes}/{ano}")

    try:
        # Buscar vendas do mês
        vendas = db.query(Venda).filter(
            Venda.mes == mes,
            Venda.ano == ano
        ).all()

        # Buscar financeiro do mês (realizado)
        financeiro_entradas = db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.tipo == 'entrada',
            Financeiro.previsto_realizado == 'realizado'
        ).all()

        financeiro_saidas = db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.tipo == 'saida',
            Financeiro.previsto_realizado == 'realizado'
        ).all()

        # Calcular métricas
        vendas_total = len(vendas)
        faturamento = sum(v.valor for v in vendas)

        entradas_total = sum(f.valor for f in financeiro_entradas)
        saidas_total = sum(f.valor for f in financeiro_saidas)
        saldo = entradas_total - saidas_total

        # Verificar se já existe KPI para este mês
        kpi = db.query(KPI).filter(
            KPI.mes == mes,
            KPI.ano == ano
        ).first()

        if kpi:
            # Atualizar existente
            kpi.vendas_total = vendas_total
            kpi.faturamento = faturamento
            kpi.saldo = saldo
        else:
            # Criar novo
            kpi = KPI(
                mes=mes,
                ano=ano,
                vendas_total=vendas_total,
                faturamento=faturamento,
                saldo=saldo
            )
            db.add(kpi)

        db.commit()
        log(f"✓ KPIs calculados: {vendas_total} vendas, R$ {faturamento:,.2f} faturamento")
        return 1

    except Exception as e:
        erro_msg = f"Erro ao calcular KPIs: {str(e)}"
        log(erro_msg, 'ERROR')
        stats['erros'].append(erro_msg)
        db.rollback()
        return 0


def gerar_relatorio():
    """
    Gera relatório de importação.
    """
    log("\n" + "="*80)
    log("RELATÓRIO DE IMPORTAÇÃO")
    log("="*80)

    log(f"\n📊 REGISTROS IMPORTADOS:")
    log(f"  • Vendas: {stats['vendas']}")
    log(f"  • Transações Financeiras: {stats['financeiro']}")
    log(f"  • KPIs Calculados: {stats['kpis']}")

    if stats['avisos']:
        log(f"\n⚠️  AVISOS ({len(stats['avisos'])}):")
        for aviso in stats['avisos'][:10]:  # Mostrar apenas primeiros 10
            log(f"  • {aviso}", 'WARNING')
        if len(stats['avisos']) > 10:
            log(f"  ... e mais {len(stats['avisos']) - 10} avisos")

    if stats['erros']:
        log(f"\n❌ ERROS ({len(stats['erros'])}):")
        for erro in stats['erros']:
            log(f"  • {erro}", 'ERROR')

    log("\n" + "="*80)

    # Verificar status geral
    if stats['erros']:
        log("Status: CONCLUÍDO COM ERROS ⚠️", 'WARNING')
    elif stats['avisos']:
        log("Status: CONCLUÍDO COM AVISOS ✓", 'INFO')
    else:
        log("Status: CONCLUÍDO COM SUCESSO ✓✓✓", 'INFO')

    log("="*80 + "\n")


def main():
    """
    Função principal de importação.
    """
    log("Iniciando importação de dados iniciais...")
    log(f"Banco de dados: {engine.url}")

    # Verificar se planilhas existem
    for nome, path in PLANILHAS.items():
        if not os.path.exists(path):
            log(f"ERRO: Planilha não encontrada: {path}", 'ERROR')
            stats['erros'].append(f"Planilha {nome} não encontrada: {path}")
            return

    log("✓ Todas as planilhas encontradas")

    # Inicializar banco de dados
    log("Inicializando banco de dados...")
    init_db()

    # Criar sessão
    db = SessionLocal()

    try:
        # 1. Importar vendas de Janeiro
        log("\n--- JANEIRO 2026 ---")
        vendas_jan = importar_vendas_comercial(
            db, PLANILHAS['comercial_jan'], mes=1, ano=2026
        )
        stats['vendas'] += vendas_jan

        # 2. Importar vendas de Fevereiro
        log("\n--- FEVEREIRO 2026 ---")
        vendas_fev = importar_vendas_comercial(
            db, PLANILHAS['comercial_fev'], mes=2, ano=2026
        )
        stats['vendas'] += vendas_fev

        # 3. Importar financeiro de Janeiro
        fin_jan = importar_financeiro(
            db, PLANILHAS['financeiro'], 'JANEIRO', mes=1, ano=2026
        )
        stats['financeiro'] += fin_jan

        # 4. Importar financeiro de Fevereiro
        fin_fev = importar_financeiro(
            db, PLANILHAS['financeiro'], 'FEVEREIRO', mes=2, ano=2026
        )
        stats['financeiro'] += fin_fev

        # 5. Calcular KPIs
        log("\n--- CÁLCULO DE KPIs ---")
        kpis_jan = calcular_kpis(db, mes=1, ano=2026)
        kpis_fev = calcular_kpis(db, mes=2, ano=2026)
        stats['kpis'] = kpis_jan + kpis_fev

        # Gerar relatório
        gerar_relatorio()

    except Exception as e:
        log(f"ERRO FATAL: {str(e)}", 'ERROR')
        stats['erros'].append(f"Erro fatal: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
