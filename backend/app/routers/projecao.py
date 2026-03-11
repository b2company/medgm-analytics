"""
Router para projeções financeiras automáticas.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database import get_db
from app.models.models import Financeiro, Venda
from datetime import datetime, timedelta
from typing import List, Dict
from dateutil.relativedelta import relativedelta

router = APIRouter(prefix="/projecao", tags=["Projeção"])


def calcular_mrr_atual(db: Session, mes: int, ano: int) -> float:
    """
    Calcula o MRR (Monthly Recurring Revenue) atual baseado em vendas recorrentes.
    """
    # Buscar vendas com tipo_receita = 'Recorrência' nos últimos 3 meses
    tres_meses_atras = datetime(ano, mes, 1) - relativedelta(months=3)

    vendas_recorrentes = db.query(
        func.avg(Venda.valor_liquido).label('mrr')
    ).filter(
        Venda.tipo_receita == 'Recorrência',
        Venda.data >= tres_meses_atras
    ).first()

    return vendas_recorrentes.mrr if vendas_recorrentes and vendas_recorrentes.mrr else 0


def calcular_custos_fixos_mensais(db: Session, mes: int, ano: int) -> float:
    """
    Calcula a média de custos fixos mensais baseado nos últimos 3 meses.
    """
    tres_meses_atras = datetime(ano, mes, 1) - relativedelta(months=3)

    custos_fixos = db.query(
        func.avg(Financeiro.valor).label('media_custos')
    ).filter(
        Financeiro.tipo == 'saida',
        Financeiro.categoria.in_(['Salário', 'Operação', 'Fixo', 'Infraestrutura']),
        Financeiro.data >= tres_meses_atras
    ).first()

    return custos_fixos.media_custos if custos_fixos and custos_fixos.media_custos else 0


def calcular_custos_variaveis_mensais(db: Session, mes: int, ano: int) -> float:
    """
    Calcula a média de custos variáveis mensais baseado nos últimos 3 meses.
    """
    tres_meses_atras = datetime(ano, mes, 1) - relativedelta(months=3)

    custos_variaveis = db.query(
        func.avg(Financeiro.valor).label('media_custos')
    ).filter(
        Financeiro.tipo == 'saida',
        Financeiro.categoria.in_(['Marketing', 'Vendas', 'Variável']),
        Financeiro.data >= tres_meses_atras
    ).first()

    return custos_variaveis.media_custos if custos_variaveis and custos_variaveis.media_custos else 0


@router.get("/caixa")
async def projetar_fluxo_caixa(
    meses_futuro: int = Query(3, ge=1, le=12, description="Número de meses para projetar"),
    mes_ref: int = Query(None, ge=1, le=12),
    ano_ref: int = Query(None, ge=2020, le=2030),
    db: Session = Depends(get_db)
):
    """
    Projeta o fluxo de caixa para os próximos N meses baseado em:
    - MRR (receita recorrente)
    - Custos fixos médios
    - Custos variáveis médios
    - Saldo atual
    """
    # Usar mês/ano atual se não fornecido
    hoje = datetime.now()
    mes_atual = mes_ref or hoje.month
    ano_atual = ano_ref or hoje.year

    # Calcular saldo atual (até o mês de referência)
    entradas = db.query(func.sum(Financeiro.valor)).filter(
        Financeiro.tipo == 'entrada',
        Financeiro.previsto_realizado == 'realizado',
        extract('year', Financeiro.data) <= ano_atual,
        extract('month', Financeiro.data) <= mes_atual
    ).scalar() or 0

    saidas = db.query(func.sum(Financeiro.valor)).filter(
        Financeiro.tipo == 'saida',
        Financeiro.previsto_realizado == 'realizado',
        extract('year', Financeiro.data) <= ano_atual,
        extract('month', Financeiro.data) <= mes_atual
    ).scalar() or 0

    saldo_atual = entradas - saidas

    # Calcular MRR e custos médios
    mrr = calcular_mrr_atual(db, mes_atual, ano_atual)
    custos_fixos = calcular_custos_fixos_mensais(db, mes_atual, ano_atual)
    custos_variaveis = calcular_custos_variaveis_mensais(db, mes_atual, ano_atual)

    # Projetar próximos meses
    projecoes = []
    saldo_projetado = saldo_atual

    data_ref = datetime(ano_atual, mes_atual, 1)

    for i in range(meses_futuro):
        data_futura = data_ref + relativedelta(months=i+1)
        mes_futuro = data_futura.month
        ano_futuro = data_futura.year

        # Receita projetada = MRR (conservador)
        receita_projetada = mrr

        # Custos projetados = fixos + variáveis
        custos_projetados = custos_fixos + custos_variaveis

        # Resultado do mês
        resultado_mes = receita_projetada - custos_projetados

        # Saldo acumulado
        saldo_projetado += resultado_mes

        # Determinar status
        if saldo_projetado < 0:
            status = "critico"
            alerta = f"⚠️ CRÍTICO: Caixa negativo em {data_futura.strftime('%B/%Y')}"
        elif resultado_mes < 0:
            status = "atencao"
            alerta = f"⚠️ ATENÇÃO: Queimando R$ {abs(resultado_mes):,.2f} em {data_futura.strftime('%B/%Y')}"
        elif saldo_projetado < custos_fixos * 2:
            status = "alerta"
            alerta = f"⚡ Runway baixo em {data_futura.strftime('%B/%Y')}"
        else:
            status = "saudavel"
            alerta = None

        projecoes.append({
            "mes": mes_futuro,
            "ano": ano_futuro,
            "mes_nome": data_futura.strftime('%B'),
            "receita_projetada": round(receita_projetada, 2),
            "custos_projetados": round(custos_projetados, 2),
            "resultado_mes": round(resultado_mes, 2),
            "saldo_projetado": round(saldo_projetado, 2),
            "status": status,
            "alerta": alerta
        })

    # Identificar mês crítico (se houver)
    mes_critico = next((p for p in projecoes if p['status'] in ['critico', 'atencao']), None)

    return {
        "mes_referencia": mes_atual,
        "ano_referencia": ano_atual,
        "saldo_atual": round(saldo_atual, 2),
        "mrr": round(mrr, 2),
        "custos_fixos_mensais": round(custos_fixos, 2),
        "custos_variaveis_mensais": round(custos_variaveis, 2),
        "projecoes": projecoes,
        "mes_critico": mes_critico,
        "resumo": {
            "total_receita_projetada": round(sum(p['receita_projetada'] for p in projecoes), 2),
            "total_custos_projetados": round(sum(p['custos_projetados'] for p in projecoes), 2),
            "saldo_final_projetado": projecoes[-1]['saldo_projetado'] if projecoes else saldo_atual
        }
    }


@router.get("/ponto-equilibrio")
async def calcular_ponto_equilibrio(
    mes: int,
    ano: int,
    db: Session = Depends(get_db)
):
    """
    Calcula o ponto de equilíbrio do mês: quanto precisa faturar líquido para empatar.
    """
    from app.models.models import Financeiro, Venda
    from datetime import datetime
    from calendar import monthrange

    try:
        # Calcular custos totais do mês (fixos + variáveis)
        custos_mes = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.tipo == 'saida',
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.previsto_realizado == 'realizado'
        ).scalar() or 0

        # Calcular custos previstos restantes
        custos_previstos = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.tipo == 'saida',
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.previsto_realizado == 'previsto'
        ).scalar() or 0

        total_custos = custos_mes + custos_previstos

        # Calcular receita realizada
        receita_realizada = db.query(func.sum(Venda.valor_liquido)).filter(
            Venda.mes == mes,
            Venda.ano == ano
        ).scalar() or 0

        # Receita recorrente confirmada (MRR)
        mrr = calcular_mrr_atual(db, mes, ano)

        # Falta para empatar
        falta = max(0, total_custos - receita_realizada)

        # Descontar MRR da falta
        falta_apos_mrr = max(0, falta - mrr)

        # Calcular quantas vendas faltam (baseado no ticket médio)
        ticket_medio = db.query(func.avg(Venda.valor_liquido)).filter(
            Venda.ano == ano
        ).scalar() or 0

        vendas_necessarias = (falta_apos_mrr / ticket_medio) if ticket_medio > 0 else 0

        # Dias úteis restantes
        hoje = datetime.now()
        if hoje.month == mes and hoje.year == ano:
            dia_atual = hoje.day
        else:
            dia_atual = 1

        dias_totais = monthrange(ano, mes)[1]
        dias_restantes = max(0, dias_totais - dia_atual)

        # Meta diária para empatar
        meta_diaria = (falta_apos_mrr / dias_restantes) if dias_restantes > 0 else 0

        # Status
        if receita_realizada >= total_custos:
            status = "superavit"
            status_texto = "✓ Meta atingida"
            cor = "green"
        elif receita_realizada >= total_custos * 0.8:
            status = "no_caminho"
            status_texto = "→ No caminho"
            cor = "yellow"
        else:
            status = "critico"
            status_texto = "⚠️ Crítico"
            cor = "red"

        return {
            "mes": mes,
            "ano": ano,
            "ponto_equilibrio": round(total_custos, 2),
            "receita_realizada": round(receita_realizada, 2),
            "falta_para_equilibrio": round(falta, 2),
            "mrr_confirmado": round(mrr, 2),
            "falta_apos_mrr": round(falta_apos_mrr, 2),
            "vendas_necessarias": round(vendas_necessarias, 1),
            "ticket_medio": round(ticket_medio, 2),
            "dias_restantes": dias_restantes,
            "meta_diaria": round(meta_diaria, 2),
            "status": status,
            "status_texto": status_texto,
            "cor": cor,
            "perc_atingido": round((receita_realizada / total_custos * 100) if total_custos > 0 else 0, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular ponto de equilíbrio: {str(e)}")


@router.get("/runway")
async def calcular_runway(
    mes: int,
    ano: int,
    db: Session = Depends(get_db)
):
    """
    Calcula quantos meses a empresa sobrevive sem vendas novas.
    """
    from app.models.models import Financeiro

    try:
        # Calcular saldo atual
        entradas = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.tipo == 'entrada',
            Financeiro.previsto_realizado == 'realizado'
        ).scalar() or 0

        saidas = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.tipo == 'saida',
            Financeiro.previsto_realizado == 'realizado'
        ).scalar() or 0

        saldo_atual = entradas - saidas

        # Calcular média de custos mensais (últimos 3 meses)
        custos_fixos = calcular_custos_fixos_mensais(db, mes, ano)
        custos_variaveis = calcular_custos_variaveis_mensais(db, mes, ano)
        custos_mensais_medio = custos_fixos + custos_variaveis

        # Calcular runway
        if custos_mensais_medio > 0:
            runway_meses = saldo_atual / custos_mensais_medio
        else:
            runway_meses = 999  # Infinito

        # Calcular quando caixa zera
        from datetime import datetime
        from dateutil.relativedelta import relativedelta

        if runway_meses < 999:
            data_zero = datetime(ano, mes, 1) + relativedelta(months=int(runway_meses))
        else:
            data_zero = None

        # Status
        if runway_meses >= 6:
            status = "saudavel"
            status_texto = "✓ Runway saudável"
            cor = "green"
        elif runway_meses >= 3:
            status = "atencao"
            status_texto = "⚠️ Atenção"
            cor = "yellow"
        else:
            status = "critico"
            status_texto = "🚨 Crítico"
            cor = "red"

        return {
            "mes": mes,
            "ano": ano,
            "saldo_atual": round(saldo_atual, 2),
            "custos_mensais_medio": round(custos_mensais_medio, 2),
            "runway_meses": round(runway_meses, 1),
            "data_zero_caixa": data_zero.strftime("%B/%Y") if data_zero else None,
            "status": status,
            "status_texto": status_texto,
            "cor": cor
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular runway: {str(e)}")
