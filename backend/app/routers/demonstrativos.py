"""
FastAPI router for demonstrativos financeiros.
DFC (Demonstracao de Fluxo de Caixa) e DRE (Demonstracao de Resultado do Exercicio).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Financeiro, Venda
from typing import Optional

router = APIRouter(prefix="/demonstrativos", tags=["Demonstrativos Financeiros"])


@router.get("/dfc")
async def demonstracao_fluxo_caixa(
    mes: int,
    ano: int,
    db: Session = Depends(get_db)
):
    """
    Demonstracao de Fluxo de Caixa (DFC) - Metodo Direto

    Estrutura:
    - Atividades Operacionais
    - Atividades de Investimento
    - Atividades de Financiamento
    - Variacao de Caixa
    """
    try:
        # Buscar todas as movimentacoes do periodo
        entradas = db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.tipo == "entrada",
            Financeiro.previsto_realizado == "realizado"
        ).all()

        saidas = db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.tipo == "saida",
            Financeiro.previsto_realizado == "realizado"
        ).all()

        # ==================== ATIVIDADES OPERACIONAIS ====================

        # Recebimentos de clientes (vendas, recorrencia, mensalidades)
        categorias_receita = ['Venda', 'Recorrencia', 'Mensalidade', 'MRR', 'TCV', 'Assessoria', 'Consultoria']
        recebimento_clientes = sum(
            e.valor for e in entradas
            if any(cat.lower() in (e.categoria or '').lower() or cat.lower() in (e.produto or '').lower()
                   for cat in categorias_receita)
        )

        # Se nao encontrou por categoria, somar todas as entradas
        if recebimento_clientes == 0:
            recebimento_clientes = sum(e.valor for e in entradas)

        # Pagamento a fornecedores (operacao, ferramentas)
        categorias_fornecedor = ['Ferramenta', 'Software', 'Fornecedor', 'Servico', 'Operacao']
        pagamento_fornecedores = sum(
            s.valor for s in saidas
            if any(cat.lower() in (s.categoria or '').lower() or
                   cat.lower() in (s.custo or '').lower() or
                   cat.lower() in (s.centro_custo or '').lower()
                   for cat in categorias_fornecedor)
        )

        # Pagamento de salarios
        categorias_salario = ['Equipe', 'Salario', 'Folha', 'Funcionario', 'CLT', 'PJ']
        pagamento_salarios = sum(
            s.valor for s in saidas
            if any(cat.lower() in (s.categoria or '').lower() or
                   cat.lower() in (s.custo or '').lower()
                   for cat in categorias_salario)
        )

        # Impostos pagos
        categorias_imposto = ['Imposto', 'IRPF', 'IRPJ', 'PIS', 'COFINS', 'ISS', 'Tributo']
        impostos_pagos = sum(
            s.valor for s in saidas
            if any(cat.lower() in (s.categoria or '').lower() or
                   cat.lower() in (s.custo or '').lower()
                   for cat in categorias_imposto)
        )

        # Outras despesas operacionais
        outras_operacionais = sum(
            s.valor for s in saidas
            if s.centro_custo and 'operac' in s.centro_custo.lower()
        ) - pagamento_fornecedores - pagamento_salarios - impostos_pagos

        if outras_operacionais < 0:
            outras_operacionais = 0

        subtotal_operacional = recebimento_clientes - pagamento_fornecedores - pagamento_salarios - impostos_pagos - outras_operacionais

        # ==================== ATIVIDADES DE INVESTIMENTO ====================

        categorias_investimento = ['Investimento', 'Ativo', 'Equipamento', 'Expansao']
        compra_ativos = sum(
            s.valor for s in saidas
            if s.tipo_custo == 'Investimento' or
            any(cat.lower() in (s.categoria or '').lower() or
                cat.lower() in (s.custo or '').lower()
                for cat in categorias_investimento)
        )

        subtotal_investimento = -compra_ativos

        # ==================== ATIVIDADES DE FINANCIAMENTO ====================

        # Distribuicao de lucros / pro-labore
        categorias_financiamento = ['Pro-labore', 'Distribuicao', 'Dividendo', 'Lucro', 'Societario', 'Socio']
        distribuicao_lucros = sum(
            s.valor for s in saidas
            if s.centro_custo == 'Societario' or
            any(cat.lower() in (s.categoria or '').lower() or
                cat.lower() in (s.custo or '').lower()
                for cat in categorias_financiamento)
        )

        # Emprestimos
        categorias_emprestimo = ['Emprestimo', 'Financiamento', 'Juros']
        emprestimos = sum(
            s.valor for s in saidas
            if any(cat.lower() in (s.categoria or '').lower() for cat in categorias_emprestimo)
        )

        subtotal_financiamento = -distribuicao_lucros - emprestimos

        # ==================== CALCULO FINAL ====================

        variacao_caixa = subtotal_operacional + subtotal_investimento + subtotal_financiamento

        # Calcular saldo inicial (somando meses anteriores do ano)
        saldo_inicial = 0
        for m in range(1, mes):
            entradas_ant = db.query(func.sum(Financeiro.valor)).filter(
                Financeiro.mes == m,
                Financeiro.ano == ano,
                Financeiro.tipo == "entrada",
                Financeiro.previsto_realizado == "realizado"
            ).scalar() or 0

            saidas_ant = db.query(func.sum(Financeiro.valor)).filter(
                Financeiro.mes == m,
                Financeiro.ano == ano,
                Financeiro.tipo == "saida",
                Financeiro.previsto_realizado == "realizado"
            ).scalar() or 0

            saldo_inicial += (entradas_ant - saidas_ant)

        saldo_final = saldo_inicial + variacao_caixa

        return {
            "mes": mes,
            "ano": ano,
            "mes_nome": _get_mes_nome(mes),
            "atividades_operacionais": {
                "recebimento_clientes": recebimento_clientes,
                "pagamento_fornecedores": pagamento_fornecedores,
                "pagamento_salarios": pagamento_salarios,
                "impostos_pagos": impostos_pagos,
                "outras_despesas": outras_operacionais,
                "subtotal": subtotal_operacional
            },
            "atividades_investimento": {
                "compra_ativos": compra_ativos,
                "subtotal": subtotal_investimento
            },
            "atividades_financiamento": {
                "distribuicao_lucros": distribuicao_lucros,
                "emprestimos": emprestimos,
                "subtotal": subtotal_financiamento
            },
            "variacao_caixa": variacao_caixa,
            "saldo_inicial": saldo_inicial,
            "saldo_final": saldo_final
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar DFC: {str(e)}")


@router.get("/dre")
async def demonstracao_resultado(
    mes: int,
    ano: int,
    db: Session = Depends(get_db)
):
    """
    Demonstracao de Resultado do Exercicio (DRE)

    Estrutura:
    - Receita Bruta
    - (-) Deducoes
    - (=) Receita Liquida
    - (-) CMV / Custos Diretos
    - (=) Lucro Bruto
    - (-) Despesas Operacionais
    - (=) EBITDA
    - (-) Despesas Financeiras
    - (=) Lucro Liquido
    """
    try:
        # Buscar receitas
        receitas = db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.tipo == "entrada",
            Financeiro.previsto_realizado == "realizado"
        ).all()

        # Buscar custos
        custos = db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.tipo == "saida",
            Financeiro.previsto_realizado == "realizado"
        ).all()

        # ==================== RECEITA ====================

        receita_bruta = sum(r.valor for r in receitas)

        # Deducoes (impostos sobre receita, devoluções)
        categorias_deducao = ['Imposto', 'Devolucao', 'Cancelamento', 'Estorno']
        deducoes = sum(
            c.valor for c in custos
            if any(cat.lower() in (c.categoria or '').lower() for cat in categorias_deducao)
        )

        # Limitar deducoes a no maximo 20% da receita
        deducoes = min(deducoes, receita_bruta * 0.2)

        receita_liquida = receita_bruta - deducoes

        # ==================== CUSTOS ====================

        # CMV / Custos Diretos (variaveis, relacionados a entrega)
        cmv = sum(
            c.valor for c in custos
            if c.tipo_custo == 'Variavel' or
            c.centro_custo == 'Operacao' and c.tipo_custo != 'Fixo'
        )

        lucro_bruto = receita_liquida - cmv
        margem_bruta_pct = (lucro_bruto / receita_liquida * 100) if receita_liquida > 0 else 0

        # Despesas Operacionais (fixas: comercial, administrativo, operacao fixa)
        despesas_comerciais = sum(
            c.valor for c in custos
            if c.centro_custo == 'Comercial'
        )

        despesas_administrativas = sum(
            c.valor for c in custos
            if c.centro_custo == 'Administrativo'
        )

        despesas_operacionais = sum(
            c.valor for c in custos
            if c.centro_custo == 'Operacao' and c.tipo_custo == 'Fixo'
        )

        # Se nao temos categorias, calcular baseado em tipo
        if despesas_comerciais + despesas_administrativas + despesas_operacionais == 0:
            # Salarios e equipe
            categorias_equipe = ['Equipe', 'Salario', 'Folha']
            despesas_equipe = sum(
                c.valor for c in custos
                if any(cat.lower() in (c.categoria or '').lower() or
                       cat.lower() in (c.custo or '').lower()
                       for cat in categorias_equipe)
            )
            despesas_operacionais = despesas_equipe

        total_despesas_operacionais = despesas_comerciais + despesas_administrativas + despesas_operacionais

        ebitda = lucro_bruto - total_despesas_operacionais
        margem_ebitda_pct = (ebitda / receita_liquida * 100) if receita_liquida > 0 else 0

        # Despesas Financeiras
        categorias_financeiras = ['Juros', 'Taxa', 'Multa', 'IOF', 'Financeiro']
        despesas_financeiras = sum(
            c.valor for c in custos
            if c.centro_custo == 'Financeiro' or
            any(cat.lower() in (c.categoria or '').lower() for cat in categorias_financeiras)
        )

        lucro_liquido = ebitda - despesas_financeiras
        margem_liquida_pct = (lucro_liquido / receita_liquida * 100) if receita_liquida > 0 else 0

        # Detalhamento das despesas nao categorizadas
        despesas_nao_categorizadas = sum(c.valor for c in custos) - cmv - total_despesas_operacionais - despesas_financeiras - deducoes
        if despesas_nao_categorizadas < 0:
            despesas_nao_categorizadas = 0

        return {
            "mes": mes,
            "ano": ano,
            "mes_nome": _get_mes_nome(mes),
            "receita_bruta": receita_bruta,
            "deducoes": deducoes,
            "receita_liquida": receita_liquida,
            "cmv": cmv,
            "lucro_bruto": lucro_bruto,
            "margem_bruta_pct": margem_bruta_pct,
            "despesas": {
                "comerciais": despesas_comerciais,
                "administrativas": despesas_administrativas,
                "operacionais": despesas_operacionais,
                "outras": despesas_nao_categorizadas,
                "total": total_despesas_operacionais + despesas_nao_categorizadas
            },
            "ebitda": ebitda,
            "margem_ebitda_pct": margem_ebitda_pct,
            "despesas_financeiras": despesas_financeiras,
            "lucro_liquido": lucro_liquido,
            "margem_liquida_pct": margem_liquida_pct,
            "composicao": {
                "receita_pct": 100,
                "cmv_pct": (cmv / receita_liquida * 100) if receita_liquida > 0 else 0,
                "despesas_pct": ((total_despesas_operacionais + despesas_nao_categorizadas) / receita_liquida * 100) if receita_liquida > 0 else 0,
                "lucro_pct": margem_liquida_pct
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar DRE: {str(e)}")


@router.get("/dfc/anual")
async def dfc_anual(ano: int, db: Session = Depends(get_db)):
    """Retorna o DFC acumulado do ano mes a mes"""
    try:
        historico = []
        saldo_acumulado = 0

        for mes in range(1, 13):
            entradas = db.query(func.sum(Financeiro.valor)).filter(
                Financeiro.mes == mes,
                Financeiro.ano == ano,
                Financeiro.tipo == "entrada",
                Financeiro.previsto_realizado == "realizado"
            ).scalar() or 0

            saidas = db.query(func.sum(Financeiro.valor)).filter(
                Financeiro.mes == mes,
                Financeiro.ano == ano,
                Financeiro.tipo == "saida",
                Financeiro.previsto_realizado == "realizado"
            ).scalar() or 0

            variacao = entradas - saidas
            saldo_acumulado += variacao

            if entradas > 0 or saidas > 0:
                historico.append({
                    "mes": mes,
                    "mes_nome": _get_mes_nome(mes),
                    "entradas": entradas,
                    "saidas": saidas,
                    "variacao": variacao,
                    "saldo_acumulado": saldo_acumulado
                })

        return {
            "ano": ano,
            "historico": historico,
            "total_entradas": sum(h['entradas'] for h in historico),
            "total_saidas": sum(h['saidas'] for h in historico),
            "saldo_final": saldo_acumulado
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar DFC anual: {str(e)}")


@router.get("/dre/anual")
async def dre_anual(ano: int, db: Session = Depends(get_db)):
    """Retorna o DRE acumulado do ano mes a mes"""
    try:
        historico = []
        acumulado = {
            "receita_bruta": 0,
            "deducoes": 0,
            "cmv": 0,
            "despesas_operacionais": 0,
            "despesas_financeiras": 0
        }

        for mes in range(1, 13):
            receitas = db.query(func.sum(Financeiro.valor)).filter(
                Financeiro.mes == mes,
                Financeiro.ano == ano,
                Financeiro.tipo == "entrada",
                Financeiro.previsto_realizado == "realizado"
            ).scalar() or 0

            custos = db.query(func.sum(Financeiro.valor)).filter(
                Financeiro.mes == mes,
                Financeiro.ano == ano,
                Financeiro.tipo == "saida",
                Financeiro.previsto_realizado == "realizado"
            ).scalar() or 0

            if receitas > 0 or custos > 0:
                lucro = receitas - custos
                margem = (lucro / receitas * 100) if receitas > 0 else 0

                acumulado["receita_bruta"] += receitas
                receita_liquida_acum = acumulado["receita_bruta"] - acumulado["deducoes"]
                lucro_acum = acumulado["receita_bruta"] - (acumulado["cmv"] + acumulado["despesas_operacionais"] + acumulado["despesas_financeiras"] + acumulado["deducoes"])

                historico.append({
                    "mes": mes,
                    "mes_nome": _get_mes_nome(mes),
                    "receita": receitas,
                    "custos": custos,
                    "lucro": lucro,
                    "margem_pct": margem,
                    "receita_acumulada": acumulado["receita_bruta"],
                    "lucro_acumulado": acumulado["receita_bruta"] - (custos + sum(h.get('custos', 0) for h in historico[:-1]) if historico else custos)
                })

        total_receitas = sum(h['receita'] for h in historico)
        total_custos = sum(h['custos'] for h in historico)
        lucro_total = total_receitas - total_custos

        return {
            "ano": ano,
            "historico": historico,
            "totais": {
                "receita_total": total_receitas,
                "custos_total": total_custos,
                "lucro_total": lucro_total,
                "margem_media_pct": (lucro_total / total_receitas * 100) if total_receitas > 0 else 0
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar DRE anual: {str(e)}")


def _get_mes_nome(mes: int) -> str:
    """Retorna o nome do mes"""
    nomes = {
        1: "Janeiro", 2: "Fevereiro", 3: "Marco", 4: "Abril",
        5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
        9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
    }
    return nomes.get(mes, "")
