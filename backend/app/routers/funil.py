"""
FastAPI router for funil completo de conversao.
Ativacoes -> Conversoes -> Leads -> Reuniao Agendada -> Reuniao Realizada -> Venda -> Faturamento
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import SocialSellingMetrica, SDRMetrica, CloserMetrica, Venda
from typing import Optional

router = APIRouter(prefix="/funil", tags=["Funil de Conversao"])


@router.get("/completo")
async def funil_completo(
    mes: int,
    ano: int,
    agrupamento: str = "geral",
    db: Session = Depends(get_db)
):
    """
    Retorna funil completo de conversao:
    Ativacoes -> Conversoes -> Leads -> Reuniao Agendada -> Reuniao Realizada -> Venda -> Faturamento

    agrupamento: geral | por_closer | por_canal
    """
    try:
        # Buscar dados de Social Selling
        ss_query = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        )
        ss_data = ss_query.all()

        # Buscar dados de SDR
        sdr_query = db.query(SDRMetrica).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        )
        sdr_data = sdr_query.all()

        # Buscar dados de Closer
        closer_query = db.query(CloserMetrica).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        )
        closer_data = closer_query.all()

        # Buscar vendas
        vendas_query = db.query(Venda).filter(
            Venda.mes == mes,
            Venda.ano == ano
        )
        vendas_data = vendas_query.all()

        if agrupamento == "geral":
            return _calcular_funil_geral(ss_data, sdr_data, closer_data, vendas_data)

        elif agrupamento == "por_closer":
            return _calcular_funil_por_closer(ss_data, sdr_data, closer_data, vendas_data)

        elif agrupamento == "por_canal":
            return _calcular_funil_por_canal(ss_data, sdr_data, closer_data, vendas_data)

        else:
            raise HTTPException(status_code=400, detail="Agrupamento invalido. Use: geral, por_closer ou por_canal")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular funil: {str(e)}")


def _calcular_funil_geral(ss_data, sdr_data, closer_data, vendas_data):
    """Calcula o funil agregado geral"""
    # Totais
    ativacoes = sum(s.ativacoes or 0 for s in ss_data)
    conversoes = sum(s.conversoes or 0 for s in ss_data)
    leads = sum(s.leads_gerados or 0 for s in ss_data)

    # SDR - somar leads recebidos como input e reunioes como output
    leads_sdr = sum(r.leads_recebidos or 0 for r in sdr_data)
    reunioes_agendadas = sum(r.reunioes_agendadas or 0 for r in sdr_data)
    reunioes_realizadas = sum(r.reunioes_realizadas or 0 for r in sdr_data)

    # Closer
    calls_closer = sum(c.calls_realizadas or 0 for c in closer_data)
    vendas = sum(c.vendas or 0 for c in closer_data)
    faturamento = sum(c.faturamento or 0 for c in closer_data)

    # Se nao temos dados de closer, pegar das vendas
    if vendas == 0 and vendas_data:
        vendas = len(vendas_data)
        faturamento = sum(v.valor_bruto or v.valor or 0 for v in vendas_data)

    # Calcular taxas
    taxas = {
        "ativ_conv": (conversoes / ativacoes * 100) if ativacoes > 0 else 0,
        "conv_lead": (leads / conversoes * 100) if conversoes > 0 else 0,
        "lead_reuniao": (reunioes_agendadas / leads * 100) if leads > 0 else 0,
        "agendada_realizada": (reunioes_realizadas / reunioes_agendadas * 100) if reunioes_agendadas > 0 else 0,
        "reuniao_venda": (vendas / reunioes_realizadas * 100) if reunioes_realizadas > 0 else 0
    }

    return {
        "tipo": "geral",
        "ativacoes": ativacoes,
        "conversoes": conversoes,
        "leads": leads,
        "leads_sdr": leads_sdr,
        "reunioes_agendadas": reunioes_agendadas,
        "reunioes_realizadas": reunioes_realizadas,
        "vendas": vendas,
        "faturamento": faturamento,
        "taxas": taxas,
        "ticket_medio": (faturamento / vendas) if vendas > 0 else 0
    }


def _calcular_funil_por_closer(ss_data, sdr_data, closer_data, vendas_data):
    """Calcula o funil agrupado por closer"""
    # Pegar closers unicos
    closers_closer = set(c.closer for c in closer_data if c.closer)
    closers_venda = set(v.closer or v.vendedor for v in vendas_data if v.closer or v.vendedor)
    closers = closers_closer | closers_venda

    resultado = {}

    for closer_nome in closers:
        # Filtrar dados deste closer
        closer_metricas = [c for c in closer_data if c.closer == closer_nome]
        vendas_closer = [v for v in vendas_data if (v.closer or v.vendedor) == closer_nome]

        calls_agendadas = sum(c.calls_agendadas or 0 for c in closer_metricas)
        calls_realizadas = sum(c.calls_realizadas or 0 for c in closer_metricas)
        vendas_total = sum(c.vendas or 0 for c in closer_metricas)
        faturamento = sum(c.faturamento or 0 for c in closer_metricas)

        # Se nao temos metricas, pegar das vendas
        if vendas_total == 0 and vendas_closer:
            vendas_total = len(vendas_closer)
            faturamento = sum(v.valor_bruto or v.valor or 0 for v in vendas_closer)

        resultado[closer_nome] = {
            "closer": closer_nome,
            "calls_agendadas": calls_agendadas,
            "calls_realizadas": calls_realizadas,
            "vendas": vendas_total,
            "faturamento": faturamento,
            "ticket_medio": (faturamento / vendas_total) if vendas_total > 0 else 0,
            "tx_comparecimento": (calls_realizadas / calls_agendadas * 100) if calls_agendadas > 0 else 0,
            "tx_conversao": (vendas_total / calls_realizadas * 100) if calls_realizadas > 0 else 0
        }

    # Ordenar por faturamento
    resultado_ordenado = dict(sorted(resultado.items(), key=lambda x: x[1]['faturamento'], reverse=True))

    return {
        "tipo": "por_closer",
        "closers": resultado_ordenado,
        "total_closers": len(resultado)
    }


def _calcular_funil_por_canal(ss_data, sdr_data, closer_data, vendas_data):
    """Calcula o funil agrupado por canal/funil"""
    # Pegar canais unicos
    canais_sdr = set(r.funil for r in sdr_data if r.funil)
    canais_closer = set(c.funil for c in closer_data if c.funil)
    canais_venda = set(v.funil for v in vendas_data if v.funil)
    canais = canais_sdr | canais_closer | canais_venda

    resultado = {}

    for canal in canais:
        # Filtrar dados deste canal
        sdr_canal = [r for r in sdr_data if r.funil == canal]
        closer_canal = [c for c in closer_data if c.funil == canal]
        vendas_canal = [v for v in vendas_data if v.funil == canal]

        leads_recebidos = sum(r.leads_recebidos or 0 for r in sdr_canal)
        reunioes_agendadas = sum(r.reunioes_agendadas or 0 for r in sdr_canal)
        reunioes_realizadas = sum(r.reunioes_realizadas or 0 for r in sdr_canal)

        calls_closer = sum(c.calls_realizadas or 0 for c in closer_canal)
        vendas_total = sum(c.vendas or 0 for c in closer_canal)
        faturamento = sum(c.faturamento or 0 for c in closer_canal)

        # Se nao temos metricas de closer, pegar das vendas
        if vendas_total == 0 and vendas_canal:
            vendas_total = len(vendas_canal)
            faturamento = sum(v.valor_bruto or v.valor or 0 for v in vendas_canal)

        resultado[canal] = {
            "canal": canal,
            "leads_recebidos": leads_recebidos,
            "reunioes_agendadas": reunioes_agendadas,
            "reunioes_realizadas": reunioes_realizadas,
            "calls_closer": calls_closer,
            "vendas": vendas_total,
            "faturamento": faturamento,
            "ticket_medio": (faturamento / vendas_total) if vendas_total > 0 else 0,
            "tx_agendamento": (reunioes_agendadas / leads_recebidos * 100) if leads_recebidos > 0 else 0,
            "tx_comparecimento": (reunioes_realizadas / reunioes_agendadas * 100) if reunioes_agendadas > 0 else 0,
            "tx_conversao": (vendas_total / reunioes_realizadas * 100) if reunioes_realizadas > 0 else 0
        }

    # Ordenar por faturamento
    resultado_ordenado = dict(sorted(resultado.items(), key=lambda x: x[1]['faturamento'], reverse=True))

    return {
        "tipo": "por_canal",
        "canais": resultado_ordenado,
        "total_canais": len(resultado)
    }


@router.get("/historico")
async def funil_historico(
    ano: int,
    db: Session = Depends(get_db)
):
    """
    Retorna o historico do funil mes a mes para um ano.
    """
    try:
        historico = []

        for mes in range(1, 13):
            # Social Selling
            ss_data = db.query(SocialSellingMetrica).filter(
                SocialSellingMetrica.mes == mes,
                SocialSellingMetrica.ano == ano
            ).all()

            # SDR
            sdr_data = db.query(SDRMetrica).filter(
                SDRMetrica.mes == mes,
                SDRMetrica.ano == ano
            ).all()

            # Closer
            closer_data = db.query(CloserMetrica).filter(
                CloserMetrica.mes == mes,
                CloserMetrica.ano == ano
            ).all()

            # Vendas
            vendas_data = db.query(Venda).filter(
                Venda.mes == mes,
                Venda.ano == ano
            ).all()

            if ss_data or sdr_data or closer_data or vendas_data:
                funil = _calcular_funil_geral(ss_data, sdr_data, closer_data, vendas_data)
                funil['mes'] = mes
                funil['ano'] = ano
                funil['mes_nome'] = _get_mes_nome(mes)
                historico.append(funil)

        return {
            "ano": ano,
            "historico": historico,
            "total_meses": len(historico)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar historico: {str(e)}")


def _get_mes_nome(mes: int) -> str:
    """Retorna o nome do mes"""
    nomes = {
        1: "Janeiro", 2: "Fevereiro", 3: "Marco", 4: "Abril",
        5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
        9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
    }
    return nomes.get(mes, "")
