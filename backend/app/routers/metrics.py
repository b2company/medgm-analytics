"""
Routes for fetching metrics (financeiro, comercial, inteligencia).
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app.models.models import Venda, Financeiro, KPI, SocialSellingMetrica, SDRMetrica, CloserMetrica

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/vendas")
async def get_vendas(
    mes: Optional[int] = Query(None, ge=1, le=12, description="Mês (1-12) - opcional"),
    ano: Optional[int] = Query(None, ge=2020, le=2030, description="Ano - opcional"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retorna lista de vendas, opcionalmente filtrado por mês e ano.
    """
    query = db.query(Venda)

    if mes is not None:
        query = query.filter(Venda.mes == mes)
    if ano is not None:
        query = query.filter(Venda.ano == ano)

    vendas = query.order_by(Venda.data.desc()).all()

    return {
        "total": len(vendas),
        "vendas": [
            {
                "id": v.id,
                "data": v.data.isoformat(),
                "cliente": v.cliente,
                "valor": float(v.valor_bruto or v.valor or 0),
                "funil": v.funil,
                "vendedor": v.vendedor,
                "mes": v.mes,
                "ano": v.ano
            }
            for v in vendas
        ]
    }


@router.get("/all")
async def get_all_data(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Retorna resumo de todos os meses disponíveis no banco.
    """
    # Buscar meses únicos de vendas
    meses_vendas = db.query(
        Venda.mes,
        Venda.ano,
        func.count(Venda.id).label('vendas'),
        func.sum(Venda.valor).label('faturamento')
    ).group_by(Venda.mes, Venda.ano).all()

    # Buscar meses únicos de financeiro
    meses_financeiro = db.query(
        Financeiro.mes,
        Financeiro.ano
    ).distinct().all()

    # Buscar todos os KPIs
    kpis = db.query(KPI).all()

    # Consolidar meses disponíveis
    meses_disponiveis = {}

    for item in meses_vendas:
        key = (item.mes, item.ano)
        if key not in meses_disponiveis:
            meses_disponiveis[key] = {
                "mes": item.mes,
                "ano": item.ano,
                "vendas": item.vendas,
                "faturamento": float(item.faturamento or 0),
                "has_financeiro": False
            }

    for item in meses_financeiro:
        key = (item.mes, item.ano)
        if key in meses_disponiveis:
            meses_disponiveis[key]["has_financeiro"] = True
        else:
            meses_disponiveis[key] = {
                "mes": item.mes,
                "ano": item.ano,
                "vendas": 0,
                "faturamento": 0,
                "has_financeiro": True
            }

    # Adicionar dados dos KPIs
    for kpi in kpis:
        key = (kpi.mes, kpi.ano)
        if key not in meses_disponiveis:
            meses_disponiveis[key] = {
                "mes": kpi.mes,
                "ano": kpi.ano,
                "vendas": kpi.vendas_total,
                "faturamento": float(kpi.faturamento),
                "has_financeiro": False
            }

    # Ordenar por ano e mês
    resultado = sorted(meses_disponiveis.values(), key=lambda x: (x['ano'], x['mes']))

    return {
        "total_meses": len(resultado),
        "meses": resultado
    }


@router.get("/financeiro")
async def get_metrics_financeiro(
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., ge=2020, le=2030, description="Ano"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retorna métricas financeiras para um mês específico.
    
    Retorna:
        - entradas: Soma de todas as entradas
        - saidas: Soma de todas as saídas
        - saldo: entradas - saidas
        - runway: Meses de runway disponível
        - entradas_por_categoria: Dict
        - saidas_por_categoria: Dict
    """
    
    # Calcular entradas
    entradas_query = db.query(
        Financeiro.categoria,
        func.sum(Financeiro.valor).label('total')
    ).filter(
        Financeiro.mes == mes,
        Financeiro.ano == ano,
        Financeiro.tipo == 'entrada'
    ).group_by(Financeiro.categoria).all()
    
    entradas_por_categoria = {item.categoria: float(item.total) for item in entradas_query}
    total_entradas = sum(entradas_por_categoria.values())
    
    # Calcular saídas
    saidas_query = db.query(
        Financeiro.categoria,
        func.sum(Financeiro.valor).label('total')
    ).filter(
        Financeiro.mes == mes,
        Financeiro.ano == ano,
        Financeiro.tipo == 'saida'
    ).group_by(Financeiro.categoria).all()
    
    saidas_por_categoria = {item.categoria: float(item.total) for item in saidas_query}
    total_saidas = sum(saidas_por_categoria.values())
    
    # Calcular saldo
    saldo = total_entradas - total_saidas
    
    # Calcular runway (simplificado: saldo atual / saídas do mês atual)
    runway = round(saldo / total_saidas, 1) if total_saidas > 0 else 0
    
    return {
        "mes": mes,
        "ano": ano,
        "entradas": total_entradas,
        "saidas": total_saidas,
        "saldo": saldo,
        "runway": runway,
        "entradas_por_categoria": entradas_por_categoria,
        "saidas_por_categoria": saidas_por_categoria
    }


@router.get("/comercial")
async def get_metrics_comercial(
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., ge=2020, le=2030, description="Ano"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retorna métricas comerciais para um mês específico.
    
    Retorna:
        - faturamento_total: Soma de todas as vendas
        - vendas_total: Quantidade de vendas
        - ticket_medio: Faturamento / vendas
        - funil: Breakdown por funil
        - vendedores: Performance por vendedor
    """
    
    # Calcular métricas gerais
    vendas_query = db.query(
        func.count(Venda.id).label('total_vendas'),
        func.sum(Venda.valor).label('faturamento')
    ).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).first()
    
    total_vendas = vendas_query.total_vendas or 0
    faturamento_total = float(vendas_query.faturamento or 0)
    ticket_medio = round(faturamento_total / total_vendas, 2) if total_vendas > 0 else 0
    
    # Breakdown por funil
    funil_query = db.query(
        Venda.funil,
        func.count(Venda.id).label('vendas'),
        func.sum(Venda.valor).label('faturamento')
    ).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).group_by(Venda.funil).all()
    
    funil_breakdown = {
        item.funil: {
            "vendas": item.vendas,
            "faturamento": float(item.faturamento)
        } for item in funil_query
    }
    
    # Performance por vendedor
    vendedor_query = db.query(
        Venda.vendedor,
        func.count(Venda.id).label('vendas'),
        func.sum(Venda.valor).label('faturamento')
    ).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).group_by(Venda.vendedor).all()
    
    vendedores = {
        item.vendedor: {
            "vendas": item.vendas,
            "faturamento": float(item.faturamento)
        } for item in vendedor_query
    }
    
    return {
        "mes": mes,
        "ano": ano,
        "faturamento_total": faturamento_total,
        "vendas_total": total_vendas,
        "ticket_medio": ticket_medio,
        "funil": funil_breakdown,
        "vendedores": vendedores
    }


@router.get("/inteligencia")
async def get_metrics_inteligencia(
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., ge=2020, le=2030, description="Ano"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retorna métricas de inteligência (CAC, LTV, projeções).

    Retorna:
        - cac: Custo de Aquisição por Cliente
        - ltv: Lifetime Value (estimado)
        - roi: Retorno sobre Investimento
        - projecao_faturamento: Projeção para próximo mês
    """

    # Obter total de vendas
    vendas_count = db.query(func.count(Venda.id)).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).scalar() or 0

    # Obter custos de marketing/vendas
    custo_vendas = db.query(
        func.sum(Financeiro.valor)
    ).filter(
        Financeiro.mes == mes,
        Financeiro.ano == ano,
        Financeiro.tipo == 'saida',
        Financeiro.categoria.in_(['Marketing', 'Vendas', 'Comercial'])
    ).scalar() or 0

    # Calcular CAC
    cac = round(float(custo_vendas) / vendas_count, 2) if vendas_count > 0 else 0

    # Obter faturamento total
    faturamento = db.query(
        func.sum(Venda.valor)
    ).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).scalar() or 0

    # Calcular LTV (estimado: ticket médio * 12 meses)
    ticket_medio = float(faturamento) / vendas_count if vendas_count > 0 else 0
    ltv = round(ticket_medio * 12, 2)

    # Calcular ROI
    roi = round((float(faturamento) - float(custo_vendas)) / float(custo_vendas) * 100, 2) if custo_vendas > 0 else 0

    # Projeção simples: média dos últimos 3 meses
    meses_anteriores = []
    for i in range(1, 4):
        mes_anterior = mes - i
        ano_anterior = ano
        if mes_anterior <= 0:
            mes_anterior += 12
            ano_anterior -= 1

        fat_anterior = db.query(
            func.sum(Venda.valor)
        ).filter(
            Venda.mes == mes_anterior,
            Venda.ano == ano_anterior
        ).scalar() or 0

        meses_anteriores.append(float(fat_anterior))

    projecao_faturamento = round(sum(meses_anteriores) / len(meses_anteriores), 2) if meses_anteriores else 0

    return {
        "mes": mes,
        "ano": ano,
        "cac": cac,
        "ltv": ltv,
        "roi": roi,
        "ticket_medio": round(ticket_medio, 2),
        "projecao_faturamento": projecao_faturamento,
        "ltv_cac_ratio": round(ltv / cac, 2) if cac > 0 else 0
    }


@router.get("/financeiro/detalhado")
async def get_financeiro_detalhado(
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., ge=2020, le=2030, description="Ano"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retorna dados financeiros detalhados para dashboard REAL e ACIONÁVEL.

    Inclui:
    - Tabela completa de entradas e saídas
    - Subtotais por categoria
    - DRE Simplificado
    - Comparação com mês anterior
    """

    # 1. BUSCAR TODAS AS ENTRADAS COM DETALHES (apenas realizado)
    entradas = db.query(Financeiro).filter(
        Financeiro.mes == mes,
        Financeiro.ano == ano,
        Financeiro.tipo == 'entrada',
        Financeiro.previsto_realizado == 'realizado'
    ).order_by(Financeiro.data.desc()).all()

    entradas_lista = [
        {
            "id": e.id,
            "data": e.data.isoformat() if e.data else None,
            "categoria": e.categoria,
            "descricao": e.descricao or "",
            "valor": float(e.valor),
            "previsto_realizado": e.previsto_realizado
        }
        for e in entradas
    ]

    # 2. BUSCAR TODAS AS SAÍDAS COM DETALHES (apenas realizado)
    saidas = db.query(Financeiro).filter(
        Financeiro.mes == mes,
        Financeiro.ano == ano,
        Financeiro.tipo == 'saida',
        Financeiro.previsto_realizado == 'realizado'
    ).order_by(Financeiro.data.desc()).all()

    saidas_lista = [
        {
            "id": s.id,
            "data": s.data.isoformat() if s.data else None,
            "categoria": s.categoria,
            "descricao": s.descricao or "",
            "valor": float(s.valor),
            "previsto_realizado": s.previsto_realizado
        }
        for s in saidas
    ]

    # 3. SUBTOTAIS POR CATEGORIA (apenas realizado)
    entradas_por_categoria = db.query(
        Financeiro.categoria,
        func.sum(Financeiro.valor).label('total')
    ).filter(
        Financeiro.mes == mes,
        Financeiro.ano == ano,
        Financeiro.tipo == 'entrada',
        Financeiro.previsto_realizado == 'realizado'
    ).group_by(Financeiro.categoria).all()

    saidas_por_categoria = db.query(
        Financeiro.categoria,
        func.sum(Financeiro.valor).label('total')
    ).filter(
        Financeiro.mes == mes,
        Financeiro.ano == ano,
        Financeiro.tipo == 'saida',
        Financeiro.previsto_realizado == 'realizado'
    ).group_by(Financeiro.categoria).all()

    entradas_subtotais = {cat: float(total) for cat, total in entradas_por_categoria}
    saidas_subtotais = {cat: float(total) for cat, total in saidas_por_categoria}

    # 4. TOTAIS E SALDO COM SALDO_INICIAL
    total_entradas = sum(entradas_subtotais.values())
    total_saidas = sum(saidas_subtotais.values())

    # Buscar saldo_inicial (= saldo_final do mês anterior)
    mes_anterior = mes - 1
    ano_anterior = ano
    if mes_anterior <= 0:
        mes_anterior = 12
        ano_anterior -= 1

    # Buscar KPI do mês anterior para obter saldo_final (que vira saldo_inicial deste mês)
    kpi_anterior = db.query(KPI).filter(
        KPI.mes == mes_anterior,
        KPI.ano == ano_anterior
    ).first()

    saldo_inicial = float(kpi_anterior.saldo) if kpi_anterior and kpi_anterior.saldo else 0.0

    # Calcular saldo_final: saldo_inicial + entradas - saídas
    saldo = saldo_inicial + total_entradas - total_saidas

    # 5. DRE SIMPLIFICADO
    # Identificar receitas (vendas/serviços)
    receita_categorias = ['Vendas', 'Serviços', 'Receita', 'Faturamento']
    receita_total = sum(v for k, v in entradas_subtotais.items() if any(cat.lower() in k.lower() for cat in receita_categorias))

    # Identificar custos diretos (variáveis)
    custo_direto_categorias = ['Custo Direto', 'Variável', 'Produção']
    custos_diretos = sum(v for k, v in saidas_subtotais.items() if any(cat.lower() in k.lower() for cat in custo_direto_categorias))

    # Margem bruta
    margem_bruta = receita_total - custos_diretos
    margem_bruta_pct = (margem_bruta / receita_total * 100) if receita_total > 0 else 0

    # Custos fixos (operacionais)
    custos_fixos = total_saidas - custos_diretos

    # Lucro líquido
    lucro_liquido = margem_bruta - custos_fixos
    margem_liquida_pct = (lucro_liquido / receita_total * 100) if receita_total > 0 else 0

    dre = {
        "receita_total": round(receita_total, 2),
        "custos_diretos": round(custos_diretos, 2),
        "margem_bruta": round(margem_bruta, 2),
        "margem_bruta_pct": round(margem_bruta_pct, 2),
        "custos_fixos": round(custos_fixos, 2),
        "lucro_liquido": round(lucro_liquido, 2),
        "margem_liquida_pct": round(margem_liquida_pct, 2)
    }

    # 6. COMPARAÇÃO COM MÊS ANTERIOR
    # (mes_anterior e ano_anterior já foram calculados acima para saldo_inicial)

    # Totais mês anterior (apenas realizado)
    entradas_anterior = db.query(func.sum(Financeiro.valor)).filter(
        Financeiro.mes == mes_anterior,
        Financeiro.ano == ano_anterior,
        Financeiro.tipo == 'entrada',
        Financeiro.previsto_realizado == 'realizado'
    ).scalar() or 0

    saidas_anterior = db.query(func.sum(Financeiro.valor)).filter(
        Financeiro.mes == mes_anterior,
        Financeiro.ano == ano_anterior,
        Financeiro.tipo == 'saida',
        Financeiro.previsto_realizado == 'realizado'
    ).scalar() or 0

    # Saldo anterior = KPI.saldo do mês anterior (já temos em kpi_anterior)
    saldo_anterior = float(kpi_anterior.saldo) if kpi_anterior and kpi_anterior.saldo else 0.0

    # Calcular variações percentuais
    variacao_entradas = ((total_entradas - float(entradas_anterior)) / float(entradas_anterior) * 100) if entradas_anterior > 0 else 0
    variacao_saidas = ((total_saidas - float(saidas_anterior)) / float(saidas_anterior) * 100) if saidas_anterior > 0 else 0
    variacao_saldo = ((saldo - saldo_anterior) / abs(saldo_anterior) * 100) if saldo_anterior != 0 else 0

    comparacao_mes_anterior = {
        "mes_anterior": mes_anterior,
        "ano_anterior": ano_anterior,
        "entradas_anterior": round(float(entradas_anterior), 2),
        "saidas_anterior": round(float(saidas_anterior), 2),
        "saldo_anterior": round(saldo_anterior, 2),
        "variacao_entradas_pct": round(variacao_entradas, 2),
        "variacao_saidas_pct": round(variacao_saidas, 2),
        "variacao_saldo_pct": round(variacao_saldo, 2)
    }

    # 7. RECEITA RECORRENTE (MRR)
    # Assumir que entradas com categoria contendo "recorrente" ou "mensalidade" são MRR
    mrr_categorias = ['Recorrente', 'Mensalidade', 'Assinatura', 'Subscription']
    mrr = sum(v for k, v in entradas_subtotais.items() if any(cat.lower() in k.lower() for cat in mrr_categorias))
    receita_nova = total_entradas - mrr
    pct_recorrente = (mrr / total_entradas * 100) if total_entradas > 0 else 0

    receita_recorrente = {
        "mrr": round(mrr, 2),
        "receita_nova": round(receita_nova, 2),
        "pct_recorrente": round(pct_recorrente, 2)
    }

    return {
        "mes": mes,
        "ano": ano,
        "entradas": entradas_lista,
        "saidas": saidas_lista,
        "entradas_por_categoria": entradas_subtotais,
        "saidas_por_categoria": saidas_subtotais,
        "saldo_inicial": round(saldo_inicial, 2),
        "total_entradas": round(total_entradas, 2),
        "total_saidas": round(total_saidas, 2),
        "saldo": round(saldo, 2),
        "lucro_operacional": round(total_entradas - total_saidas, 2),
        "dre": dre,
        "comparacao_mes_anterior": comparacao_mes_anterior,
        "receita_recorrente": receita_recorrente
    }


@router.get("/comercial/detalhado")
async def get_comercial_detalhado(
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., ge=2020, le=2030, description="Ano"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retorna dados comerciais detalhados para dashboard REAL e ACIONÁVEL.

    Inclui:
    - Tabela completa de vendas
    - Performance por vendedor
    - Performance por canal/funil
    - Comparação com mês anterior
    """

    # 1. BUSCAR TODAS AS VENDAS DO MÊS
    vendas = db.query(Venda).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).order_by(Venda.data.desc()).all()

    vendas_lista = [
        {
            "id": v.id,
            "data": v.data.isoformat(),
            "cliente": v.cliente,
            "valor": float(v.valor_bruto or v.valor or 0),
            "funil": v.funil,
            "vendedor": v.vendedor
        }
        for v in vendas
    ]

    # 2. TOTAIS GERAIS
    total_vendas = len(vendas)
    faturamento_total = sum(float(v.valor_bruto or v.valor or 0) for v in vendas)
    ticket_medio = (faturamento_total / total_vendas) if total_vendas > 0 else 0

    # 3. PERFORMANCE POR VENDEDOR
    vendedores_query = db.query(
        Venda.vendedor,
        func.count(Venda.id).label('qtd_vendas'),
        func.sum(Venda.valor).label('valor_total')
    ).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).group_by(Venda.vendedor).all()

    vendedores_lista = []
    for vend, qtd, valor in vendedores_query:
        valor_float = float(valor or 0)
        ticket = (valor_float / qtd) if qtd > 0 else 0
        pct_total = (valor_float / faturamento_total * 100) if faturamento_total > 0 else 0

        vendedores_lista.append({
            "vendedor": vend,
            "qtd_vendas": qtd,
            "valor_total": round(valor_float, 2),
            "ticket_medio": round(ticket, 2),
            "pct_total": round(pct_total, 2)
        })

    # Ordenar por valor (maior primeiro)
    vendedores_lista.sort(key=lambda x: x['valor_total'], reverse=True)

    # Identificar melhor vendedor
    melhor_vendedor = vendedores_lista[0] if vendedores_lista else None

    # 4. PERFORMANCE POR CANAL/FUNIL
    canais_query = db.query(
        Venda.funil,
        func.count(Venda.id).label('qtd_vendas'),
        func.sum(Venda.valor).label('valor_total')
    ).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).group_by(Venda.funil).all()

    canais_lista = []
    for canal, qtd, valor in canais_query:
        valor_float = float(valor or 0)
        ticket = (valor_float / qtd) if qtd > 0 else 0
        pct_total = (valor_float / faturamento_total * 100) if faturamento_total > 0 else 0

        canais_lista.append({
            "canal": canal,
            "qtd_vendas": qtd,
            "valor_total": round(valor_float, 2),
            "ticket_medio": round(ticket, 2),
            "pct_total": round(pct_total, 2)
        })

    # Ordenar por valor (maior primeiro)
    canais_lista.sort(key=lambda x: x['valor_total'], reverse=True)

    # 5. COMPARAÇÃO COM MÊS ANTERIOR
    mes_anterior = mes - 1
    ano_anterior = ano
    if mes_anterior <= 0:
        mes_anterior = 12
        ano_anterior -= 1

    vendas_anterior = db.query(
        func.count(Venda.id).label('qtd'),
        func.sum(Venda.valor).label('faturamento')
    ).filter(
        Venda.mes == mes_anterior,
        Venda.ano == ano_anterior
    ).first()

    qtd_anterior = vendas_anterior.qtd or 0
    faturamento_anterior = float(vendas_anterior.faturamento or 0)
    ticket_anterior = (faturamento_anterior / qtd_anterior) if qtd_anterior > 0 else 0

    # Calcular variações
    variacao_vendas = ((total_vendas - qtd_anterior) / qtd_anterior * 100) if qtd_anterior > 0 else 0
    variacao_faturamento = ((faturamento_total - faturamento_anterior) / faturamento_anterior * 100) if faturamento_anterior > 0 else 0
    variacao_ticket = ((ticket_medio - ticket_anterior) / ticket_anterior * 100) if ticket_anterior > 0 else 0

    comparacao_mes_anterior = {
        "mes_anterior": mes_anterior,
        "ano_anterior": ano_anterior,
        "qtd_vendas_anterior": qtd_anterior,
        "faturamento_anterior": round(faturamento_anterior, 2),
        "ticket_medio_anterior": round(ticket_anterior, 2),
        "variacao_vendas_pct": round(variacao_vendas, 2),
        "variacao_faturamento_pct": round(variacao_faturamento, 2),
        "variacao_ticket_pct": round(variacao_ticket, 2)
    }

    # 6. MÉTRICAS DAS 3 ABAS COMERCIAIS (Social Selling, SDR, Closer)
    # Social Selling
    social_selling = db.query(
        func.sum(SocialSellingMetrica.ativacoes).label('ativacoes'),
        func.sum(SocialSellingMetrica.conversoes).label('conversoes'),
        func.sum(SocialSellingMetrica.leads_gerados).label('leads')
    ).filter(
        SocialSellingMetrica.mes == mes,
        SocialSellingMetrica.ano == ano
    ).first()

    # SDR
    sdr = db.query(
        func.sum(SDRMetrica.leads_recebidos).label('leads_recebidos'),
        func.sum(SDRMetrica.reunioes_agendadas).label('reunioes_agendadas'),
        func.sum(SDRMetrica.reunioes_realizadas).label('reunioes_realizadas')
    ).filter(
        SDRMetrica.mes == mes,
        SDRMetrica.ano == ano
    ).first()

    # Closer
    closer = db.query(
        func.sum(CloserMetrica.calls_agendadas).label('calls_agendadas'),
        func.sum(CloserMetrica.calls_realizadas).label('calls_realizadas'),
        func.sum(CloserMetrica.vendas).label('vendas'),
        func.sum(CloserMetrica.faturamento_bruto).label('faturamento_bruto')
    ).filter(
        CloserMetrica.mes == mes,
        CloserMetrica.ano == ano
    ).first()

    metricas_comerciais = {
        "social_selling": {
            "ativacoes": int(social_selling.ativacoes or 0),
            "conversoes": int(social_selling.conversoes or 0),
            "leads": int(social_selling.leads or 0)
        },
        "sdr": {
            "leads_recebidos": int(sdr.leads_recebidos or 0),
            "reunioes_agendadas": int(sdr.reunioes_agendadas or 0),
            "reunioes_realizadas": int(sdr.reunioes_realizadas or 0)
        },
        "closer": {
            "calls_agendadas": int(closer.calls_agendadas or 0),
            "calls_realizadas": int(closer.calls_realizadas or 0),
            "vendas": int(closer.vendas or 0),
            "faturamento_bruto": round(float(closer.faturamento_bruto or 0), 2)
        }
    }

    return {
        "mes": mes,
        "ano": ano,
        "vendas": vendas_lista,
        "total_vendas": total_vendas,
        "faturamento_total": round(faturamento_total, 2),
        "ticket_medio": round(ticket_medio, 2),
        "por_vendedor": vendedores_lista,
        "por_canal": canais_lista,
        "melhor_vendedor": melhor_vendedor,
        "comparacao_mes_anterior": comparacao_mes_anterior,
        "metricas_comerciais": metricas_comerciais
    }


@router.get("/financeiro/fluxo-caixa")
async def get_fluxo_caixa(
    meses: int = Query(6, ge=1, le=12, description="Quantidade de meses anteriores"),
    mes_ref: int = Query(..., ge=1, le=12, description="Mês de referência"),
    ano_ref: int = Query(..., ge=2020, le=2030, description="Ano de referência"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retorna dados de fluxo de caixa dos últimos N meses.

    Inclui:
    - Entradas, saídas e saldo por mês
    - Saldo acumulado
    """

    fluxo = []
    saldo_acumulado = 0

    meses_nomes = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    for i in range(meses - 1, -1, -1):
        mes_calc = mes_ref - i
        ano_calc = ano_ref
        while mes_calc <= 0:
            mes_calc += 12
            ano_calc -= 1

        # Calcular entradas
        entradas = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.mes == mes_calc,
            Financeiro.ano == ano_calc,
            Financeiro.tipo == 'entrada'
        ).scalar() or 0

        # Calcular saídas
        saidas = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.mes == mes_calc,
            Financeiro.ano == ano_calc,
            Financeiro.tipo == 'saida'
        ).scalar() or 0

        saldo_mes = float(entradas) - float(saidas)
        saldo_acumulado += saldo_mes

        fluxo.append({
            "mes": mes_calc,
            "ano": ano_calc,
            "mes_nome": f"{meses_nomes[mes_calc]}/{ano_calc}",
            "entradas": round(float(entradas), 2),
            "saidas": round(float(saidas), 2),
            "saldo": round(saldo_mes, 2),
            "saldo_acumulado": round(saldo_acumulado, 2)
        })

    return {
        "meses": meses,
        "mes_ref": mes_ref,
        "ano_ref": ano_ref,
        "fluxo": fluxo
    }


@router.get("/inteligencia/detalhado")
async def get_inteligencia_detalhado(
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., ge=2020, le=2030, description="Ano"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retorna análises de inteligência ACIONÁVEIS.

    Inclui:
    - CAC por canal
    - Análise de margem por produto/serviço
    - Tendências (últimos 6 meses)
    - Alertas acionáveis
    """

    # 1. CAC POR CANAL
    # Buscar investimento em marketing por canal (se houver descrição identificando)
    canais = db.query(Venda.funil).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).distinct().all()

    cac_por_canal = []
    for (canal,) in canais:
        # Buscar custos de marketing relacionados ao canal
        # Por simplicidade, distribuir custo total de marketing proporcionalmente
        qtd_vendas = db.query(func.count(Venda.id)).filter(
            Venda.mes == mes,
            Venda.ano == ano,
            Venda.funil == canal
        ).scalar() or 0

        # Custo total de marketing
        custo_mkt_total = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano,
            Financeiro.tipo == 'saida',
            Financeiro.categoria.like('%Marketing%')
        ).scalar() or 0

        # Total de vendas do mês
        total_vendas_mes = db.query(func.count(Venda.id)).filter(
            Venda.mes == mes,
            Venda.ano == ano
        ).scalar() or 1

        # Proporção do custo
        custo_canal = float(custo_mkt_total) * (qtd_vendas / total_vendas_mes)
        cac = (custo_canal / qtd_vendas) if qtd_vendas > 0 else 0

        receita_canal = db.query(func.sum(Venda.valor)).filter(
            Venda.mes == mes,
            Venda.ano == ano,
            Venda.funil == canal
        ).scalar() or 0

        cac_por_canal.append({
            "canal": canal,
            "investimento": round(custo_canal, 2),
            "vendas": qtd_vendas,
            "receita": round(float(receita_canal), 2),
            "cac": round(cac, 2),
            "roi": round((float(receita_canal) - custo_canal) / custo_canal, 2) if custo_canal > 0 else 0
        })

    cac_por_canal.sort(key=lambda x: x['cac'])

    # 2. TENDÊNCIAS - Últimos 6 meses
    tendencias = []
    for i in range(5, -1, -1):
        mes_calc = mes - i
        ano_calc = ano
        while mes_calc <= 0:
            mes_calc += 12
            ano_calc -= 1

        vendas_query = db.query(
            func.count(Venda.id).label('qtd'),
            func.sum(Venda.valor).label('faturamento')
        ).filter(
            Venda.mes == mes_calc,
            Venda.ano == ano_calc
        ).first()

        qtd = vendas_query.qtd or 0
        faturamento = float(vendas_query.faturamento or 0)
        ticket = (faturamento / qtd) if qtd > 0 else 0

        meses_nomes = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

        tendencias.append({
            "mes": mes_calc,
            "ano": ano_calc,
            "mes_nome": f"{meses_nomes[mes_calc]}/{ano_calc}",
            "qtd_vendas": qtd,
            "faturamento": round(faturamento, 2),
            "ticket_medio": round(ticket, 2)
        })

    # 3. ALERTAS ACIONÁVEIS
    alertas = []

    # Alerta: Queda de vendas
    if len(tendencias) >= 2:
        vendas_atual = tendencias[-1]['qtd_vendas']
        vendas_mes_anterior = tendencias[-2]['qtd_vendas']

        if vendas_mes_anterior > 0:
            variacao = ((vendas_atual - vendas_mes_anterior) / vendas_mes_anterior * 100)

            if variacao < -20:
                alertas.append({
                    "tipo": "warning",
                    "titulo": "Queda significativa nas vendas",
                    "mensagem": f"Vendas caíram {abs(variacao):.1f}% vs mês anterior. Investigar causas e ajustar estratégia."
                })
            elif variacao > 20:
                alertas.append({
                    "tipo": "success",
                    "titulo": "Crescimento acelerado",
                    "mensagem": f"Vendas cresceram {variacao:.1f}% vs mês anterior. Identificar o que funcionou e escalar."
                })

    # Alerta: Vendedor sem vendas
    vendedores_ativos = db.query(Venda.vendedor).filter(
        Venda.mes == mes,
        Venda.ano == ano
    ).distinct().all()

    vendedores_ativos_set = {v[0] for v in vendedores_ativos}

    # Buscar vendedores do mês anterior
    mes_ant = mes - 1
    ano_ant = ano
    if mes_ant <= 0:
        mes_ant = 12
        ano_ant -= 1

    vendedores_mes_anterior = db.query(Venda.vendedor).filter(
        Venda.mes == mes_ant,
        Venda.ano == ano_ant
    ).distinct().all()

    vendedores_inativos = [v[0] for v in vendedores_mes_anterior if v[0] not in vendedores_ativos_set]

    if vendedores_inativos:
        alertas.append({
            "tipo": "warning",
            "titulo": "Vendedores inativos",
            "mensagem": f"Vendedores sem vendas neste mês: {', '.join(vendedores_inativos[:3])}. Verificar pipeline."
        })

    # Alerta: Melhor canal
    if cac_por_canal:
        melhor_canal = min(cac_por_canal, key=lambda x: x['cac'])
        alertas.append({
            "tipo": "info",
            "titulo": "Canal mais eficiente",
            "mensagem": f"{melhor_canal['canal']} tem o menor CAC (R$ {melhor_canal['cac']:.2f}). Considere aumentar investimento."
        })

    return {
        "mes": mes,
        "ano": ano,
        "cac_por_canal": cac_por_canal,
        "tendencias": tendencias,
        "alertas": alertas
    }
