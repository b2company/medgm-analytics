"""
FastAPI router for commercial operations (FASE 2).
Handles Social Selling, SDR, and Closer metrics.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import SocialSellingMetrica, SDRMetrica, CloserMetrica, Meta, Pessoa
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date

router = APIRouter(prefix="/comercial", tags=["Comercial"])

# ============ PYDANTIC SCHEMAS ============

class SocialSellingCreate(BaseModel):
    mes: int
    ano: int
    data: Optional[date] = None
    vendedor: str
    ativacoes: int
    conversoes: int
    leads_gerados: int
    # Metas agora vêm da tabela Meta

class SDRCreate(BaseModel):
    mes: int
    ano: int
    data: Optional[date] = None
    sdr: str
    funil: str
    leads_recebidos: int
    reunioes_agendadas: int
    reunioes_realizadas: int
    # Metas agora vêm da tabela Meta

class CloserCreate(BaseModel):
    mes: int
    ano: int
    data: Optional[date] = None
    closer: str
    funil: str
    calls_agendadas: int
    calls_realizadas: int
    vendas: int
    faturamento: float = 0.0  # Campo legado - manter compatibilidade
    # Novos campos financeiros detalhados
    booking: float = 0.0
    faturamento_bruto: float = 0.0
    faturamento_liquido: float = 0.0
    # Metas agora vêm da tabela Meta


# ============ SOCIAL SELLING ============

@router.post("/social-selling")
async def create_social_selling(item: SocialSellingCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova métrica de Social Selling.
    Calcula automaticamente as taxas de conversão.
    """
    try:
        # Calcular taxas
        tx_ativ_conv = (item.conversoes / item.ativacoes * 100) if item.ativacoes > 0 else 0
        tx_conv_lead = (item.leads_gerados / item.conversoes * 100) if item.conversoes > 0 else 0

        novo = SocialSellingMetrica(
            **item.dict(),
            tx_ativ_conv=round(tx_ativ_conv, 2),
            tx_conv_lead=round(tx_conv_lead, 2)
        )
        db.add(novo)
        db.commit()
        db.refresh(novo)
        return {
            "id": novo.id,
            "message": "Métrica de Social Selling criada com sucesso",
            "data": {
                "id": novo.id,
                "vendedor": novo.vendedor,
                "tx_ativ_conv": novo.tx_ativ_conv,
                "tx_conv_lead": novo.tx_conv_lead
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar métrica: {str(e)}")


@router.get("/social-selling")
async def get_social_selling(mes: int, ano: int, db: Session = Depends(get_db)):
    """
    Busca todas as métricas de Social Selling para um mês/ano específico.
    """
    try:
        metricas = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).all()
        return metricas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")


@router.get("/social-selling/all")
async def get_all_social_selling(db: Session = Depends(get_db)):
    """
    Busca todas as métricas de Social Selling (todos os períodos).
    """
    try:
        metricas = db.query(SocialSellingMetrica).order_by(
            SocialSellingMetrica.ano.desc(),
            SocialSellingMetrica.mes.desc(),
            SocialSellingMetrica.vendedor
        ).all()
        return metricas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")


@router.put("/social-selling/{id}")
async def update_social_selling(id: int, item: SocialSellingCreate, db: Session = Depends(get_db)):
    """
    Atualiza uma métrica de Social Selling existente.
    Recalcula as taxas automaticamente.
    """
    try:
        registro = db.query(SocialSellingMetrica).filter(SocialSellingMetrica.id == id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")

        # Recalcular taxas
        tx_ativ_conv = (item.conversoes / item.ativacoes * 100) if item.ativacoes > 0 else 0
        tx_conv_lead = (item.leads_gerados / item.conversoes * 100) if item.conversoes > 0 else 0

        for key, value in item.dict().items():
            setattr(registro, key, value)
        registro.tx_ativ_conv = round(tx_ativ_conv, 2)
        registro.tx_conv_lead = round(tx_conv_lead, 2)

        db.commit()
        db.refresh(registro)
        return {
            "message": "Métrica atualizada com sucesso",
            "data": {
                "id": registro.id,
                "tx_ativ_conv": registro.tx_ativ_conv,
                "tx_conv_lead": registro.tx_conv_lead
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar métrica: {str(e)}")


@router.delete("/social-selling/{id}")
async def delete_social_selling(id: int, db: Session = Depends(get_db)):
    """
    Deleta uma métrica de Social Selling.
    """
    try:
        registro = db.query(SocialSellingMetrica).filter(SocialSellingMetrica.id == id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")

        info = {
            "id": registro.id,
            "vendedor": registro.vendedor,
            "mes": registro.mes,
            "ano": registro.ano
        }

        db.delete(registro)
        db.commit()
        return {
            "message": "Métrica deletada com sucesso",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar métrica: {str(e)}")


# ============ SDR ============

@router.post("/sdr")
async def create_sdr(item: SDRCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova métrica de SDR.
    Calcula automaticamente as taxas de agendamento e comparecimento.
    """
    try:
        tx_agend = (item.reunioes_agendadas / item.leads_recebidos * 100) if item.leads_recebidos > 0 else 0
        tx_comp = (item.reunioes_realizadas / item.reunioes_agendadas * 100) if item.reunioes_agendadas > 0 else 0

        novo = SDRMetrica(
            **item.dict(),
            tx_agendamento=round(tx_agend, 2),
            tx_comparecimento=round(tx_comp, 2)
        )
        db.add(novo)
        db.commit()
        db.refresh(novo)
        return {
            "id": novo.id,
            "message": "Métrica de SDR criada com sucesso",
            "data": {
                "id": novo.id,
                "sdr": novo.sdr,
                "funil": novo.funil,
                "tx_agendamento": novo.tx_agendamento,
                "tx_comparecimento": novo.tx_comparecimento
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar métrica: {str(e)}")


@router.get("/sdr")
async def get_sdr(mes: int, ano: int, db: Session = Depends(get_db)):
    """
    Busca todas as métricas de SDR para um mês/ano específico.
    """
    try:
        metricas = db.query(SDRMetrica).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        ).all()
        return metricas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")


@router.get("/sdr/all")
async def get_all_sdr(db: Session = Depends(get_db)):
    """
    Busca todas as métricas de SDR (todos os períodos).
    """
    try:
        metricas = db.query(SDRMetrica).order_by(
            SDRMetrica.ano.desc(),
            SDRMetrica.mes.desc(),
            SDRMetrica.sdr,
            SDRMetrica.funil
        ).all()
        return metricas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")


@router.put("/sdr/{id}")
async def update_sdr(id: int, item: SDRCreate, db: Session = Depends(get_db)):
    """
    Atualiza uma métrica de SDR existente.
    Recalcula as taxas automaticamente.
    """
    try:
        registro = db.query(SDRMetrica).filter(SDRMetrica.id == id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")

        tx_agend = (item.reunioes_agendadas / item.leads_recebidos * 100) if item.leads_recebidos > 0 else 0
        tx_comp = (item.reunioes_realizadas / item.reunioes_agendadas * 100) if item.reunioes_agendadas > 0 else 0

        for key, value in item.dict().items():
            setattr(registro, key, value)
        registro.tx_agendamento = round(tx_agend, 2)
        registro.tx_comparecimento = round(tx_comp, 2)

        db.commit()
        db.refresh(registro)
        return {
            "message": "Métrica atualizada com sucesso",
            "data": {
                "id": registro.id,
                "tx_agendamento": registro.tx_agendamento,
                "tx_comparecimento": registro.tx_comparecimento
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar métrica: {str(e)}")


@router.delete("/sdr/{id}")
async def delete_sdr(id: int, db: Session = Depends(get_db)):
    """
    Deleta uma métrica de SDR.
    """
    try:
        registro = db.query(SDRMetrica).filter(SDRMetrica.id == id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")

        info = {
            "id": registro.id,
            "sdr": registro.sdr,
            "funil": registro.funil,
            "mes": registro.mes,
            "ano": registro.ano
        }

        db.delete(registro)
        db.commit()
        return {
            "message": "Métrica deletada com sucesso",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar métrica: {str(e)}")


# ============ CLOSER ============

@router.post("/closer")
async def create_closer(item: CloserCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova métrica de Closer.
    Calcula automaticamente as taxas e ticket médio.
    """
    try:
        tx_comp = (item.calls_realizadas / item.calls_agendadas * 100) if item.calls_agendadas > 0 else 0
        tx_conv = (item.vendas / item.calls_realizadas * 100) if item.calls_realizadas > 0 else 0
        ticket = (item.faturamento_bruto / item.vendas) if item.vendas > 0 else 0

        novo = CloserMetrica(
            **item.dict(),
            tx_comparecimento=round(tx_comp, 2),
            tx_conversao=round(tx_conv, 2),
            ticket_medio=round(ticket, 2)
        )
        db.add(novo)
        db.commit()
        db.refresh(novo)
        return {
            "id": novo.id,
            "message": "Métrica de Closer criada com sucesso",
            "data": {
                "id": novo.id,
                "closer": novo.closer,
                "funil": novo.funil,
                "tx_comparecimento": novo.tx_comparecimento,
                "tx_conversao": novo.tx_conversao,
                "ticket_medio": novo.ticket_medio
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar métrica: {str(e)}")


@router.get("/closer")
async def get_closer(mes: int, ano: int, db: Session = Depends(get_db)):
    """
    Busca todas as métricas de Closer para um mês/ano específico.
    """
    try:
        metricas = db.query(CloserMetrica).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        ).all()
        return metricas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")


@router.get("/closer/all")
async def get_all_closer(db: Session = Depends(get_db)):
    """
    Busca todas as métricas de Closer (todos os períodos).
    """
    try:
        metricas = db.query(CloserMetrica).order_by(
            CloserMetrica.ano.desc(),
            CloserMetrica.mes.desc(),
            CloserMetrica.closer,
            CloserMetrica.funil
        ).all()
        return metricas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")


@router.put("/closer/{id}")
async def update_closer(id: int, item: CloserCreate, db: Session = Depends(get_db)):
    """
    Atualiza uma métrica de Closer existente.
    Recalcula as taxas e ticket médio automaticamente.
    """
    try:
        registro = db.query(CloserMetrica).filter(CloserMetrica.id == id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")

        tx_comp = (item.calls_realizadas / item.calls_agendadas * 100) if item.calls_agendadas > 0 else 0
        tx_conv = (item.vendas / item.calls_realizadas * 100) if item.calls_realizadas > 0 else 0
        ticket = (item.faturamento_bruto / item.vendas) if item.vendas > 0 else 0

        for key, value in item.dict().items():
            setattr(registro, key, value)
        registro.tx_comparecimento = round(tx_comp, 2)
        registro.tx_conversao = round(tx_conv, 2)
        registro.ticket_medio = round(ticket, 2)

        db.commit()
        db.refresh(registro)
        return {
            "message": "Métrica atualizada com sucesso",
            "data": {
                "id": registro.id,
                "tx_comparecimento": registro.tx_comparecimento,
                "tx_conversao": registro.tx_conversao,
                "ticket_medio": registro.ticket_medio
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar métrica: {str(e)}")


@router.delete("/closer/{id}")
async def delete_closer(id: int, db: Session = Depends(get_db)):
    """
    Deleta uma métrica de Closer.
    """
    try:
        registro = db.query(CloserMetrica).filter(CloserMetrica.id == id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")

        info = {
            "id": registro.id,
            "closer": registro.closer,
            "funil": registro.funil,
            "mes": registro.mes,
            "ano": registro.ano
        }

        db.delete(registro)
        db.commit()
        return {
            "message": "Métrica deletada com sucesso",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar métrica: {str(e)}")


# ============ DELETE POR MÊS/ANO (MASSA) ============

@router.delete("/metricas/social-selling")
async def delete_social_selling_por_mes(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020),
    db: Session = Depends(get_db)
):
    """
    Deleta TODAS as métricas de Social Selling de um mês/ano específico.
    """
    try:
        registros = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).all()

        count = len(registros)

        for registro in registros:
            db.delete(registro)

        db.commit()
        return {
            "message": f"Métricas de Social Selling deletadas: {mes}/{ano}",
            "deletados": count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar métricas: {str(e)}")


@router.delete("/metricas/sdr")
async def delete_sdr_por_mes(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020),
    db: Session = Depends(get_db)
):
    """
    Deleta TODAS as métricas de SDR de um mês/ano específico.
    """
    try:
        registros = db.query(SDRMetrica).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        ).all()

        count = len(registros)

        for registro in registros:
            db.delete(registro)

        db.commit()
        return {
            "message": f"Métricas de SDR deletadas: {mes}/{ano}",
            "deletados": count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar métricas: {str(e)}")


@router.delete("/metricas/closer")
async def delete_closer_por_mes(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020),
    db: Session = Depends(get_db)
):
    """
    Deleta TODAS as métricas de Closer de um mês/ano específico.
    """
    try:
        registros = db.query(CloserMetrica).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        ).all()

        count = len(registros)

        for registro in registros:
            db.delete(registro)

        db.commit()
        return {
            "message": f"Métricas de Closer deletadas: {mes}/{ano}",
            "deletados": count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar métricas: {str(e)}")


# ============ DASHBOARDS CONSOLIDADOS ============

@router.get("/dashboard/social-selling")
async def dashboard_social_selling(mes: int, ano: int, db: Session = Depends(get_db)):
    """
    Dashboard consolidado de Social Selling com totais e métricas agregadas.
    """
    try:
        metricas = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).all()

        if not metricas:
            return {
                "metricas_por_vendedor": [],
                "totais": {
                    "ativacoes": 0,
                    "conversoes": 0,
                    "leads": 0,
                    "tx_ativ_conv": 0,
                    "tx_conv_lead": 0,
                    "meta_ativacoes": 0,
                    "meta_leads": 0,
                    "perc_meta_ativacoes": 0,
                    "perc_meta_leads": 0
                }
            }

        # Calcular totais
        total_ativacoes = sum(m.ativacoes for m in metricas)
        total_conversoes = sum(m.conversoes for m in metricas)
        total_leads = sum(m.leads_gerados for m in metricas)

        # Buscar metas da tabela Meta
        metas_query = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Pessoa.funcao == 'social_selling'
        ).all()

        total_meta_ativacoes = sum(m.meta_ativacoes or 0 for m in metas_query)
        total_meta_leads = sum(m.meta_leads or 0 for m in metas_query)

        return {
            "metricas_por_vendedor": metricas,
            "totais": {
                "ativacoes": total_ativacoes,
                "conversoes": total_conversoes,
                "leads": total_leads,
                "tx_ativ_conv": round((total_conversoes / total_ativacoes * 100) if total_ativacoes > 0 else 0, 2),
                "tx_conv_lead": round((total_leads / total_conversoes * 100) if total_conversoes > 0 else 0, 2),
                "meta_ativacoes": total_meta_ativacoes,
                "meta_leads": total_meta_leads,
                "perc_meta_ativacoes": round((total_ativacoes / total_meta_ativacoes * 100) if total_meta_ativacoes > 0 else 0, 2),
                "perc_meta_leads": round((total_leads / total_meta_leads * 100) if total_meta_leads > 0 else 0, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar dashboard: {str(e)}")


@router.get("/dashboard/social-selling-diario")
async def dashboard_social_selling_diario(
    mes: int,
    ano: int,
    vendedor: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Dashboard dia a dia de Social Selling com metas da tabela Meta.
    Retorna dados por dia com meta diária e realizado.
    """
    try:
        from calendar import monthrange
        from datetime import datetime
        from collections import defaultdict
        from math import ceil

        # Buscar métricas do mês
        query = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        )

        if vendedor:
            query = query.filter(SocialSellingMetrica.vendedor == vendedor)

        metricas = query.all()

        # Buscar metas mensais da tabela Meta
        meta_query = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Pessoa.funcao == 'social_selling'
        )

        if vendedor:
            meta_query = meta_query.filter(Pessoa.nome == vendedor)

        metas = meta_query.all()

        # Calcular metas mensais totais
        meta_ativacoes_mensal = sum(m.meta_ativacoes or 0 for m in metas)
        meta_leads_mensal = sum(m.meta_leads or 0 for m in metas)

        # Calcular número de dias do mês
        dias_no_mes = monthrange(ano, mes)[1]

        # Meta diária (meta mensal / dias do mês)
        meta_ativacoes_diaria = meta_ativacoes_mensal / dias_no_mes if dias_no_mes > 0 else 0
        meta_leads_diaria = meta_leads_mensal / dias_no_mes if dias_no_mes > 0 else 0

        # Agrupar métricas por dia
        metricas_por_dia = defaultdict(lambda: {'ativacoes': 0, 'conversoes': 0, 'leads': 0})

        for m in metricas:
            if m.data:
                dia = m.data.day
                metricas_por_dia[dia]['ativacoes'] += m.ativacoes
                metricas_por_dia[dia]['conversoes'] += m.conversoes
                metricas_por_dia[dia]['leads'] += m.leads_gerados

        # Criar array de dados dia a dia
        dados_diarios = []
        for dia in range(1, dias_no_mes + 1):
            realizado = metricas_por_dia[dia]
            dados_diarios.append({
                'dia': dia,
                'data': f"{ano}-{mes:02d}-{dia:02d}",
                'ativacoes_realizado': realizado['ativacoes'],
                'ativacoes_meta': ceil(meta_ativacoes_diaria),
                'conversoes': realizado['conversoes'],
                'leads_realizado': realizado['leads'],
                'leads_meta': ceil(meta_leads_diaria),
                'tx_ativ_conv': round((realizado['conversoes'] / realizado['ativacoes'] * 100) if realizado['ativacoes'] > 0 else 0, 2),
                'tx_conv_lead': round((realizado['leads'] / realizado['conversoes'] * 100) if realizado['conversoes'] > 0 else 0, 2)
            })

        # Calcular totais do mês
        total_ativacoes = sum(m.ativacoes for m in metricas)
        total_conversoes = sum(m.conversoes for m in metricas)
        total_leads = sum(m.leads_gerados for m in metricas)

        return {
            'dados_diarios': dados_diarios,
            'totais': {
                'ativacoes': total_ativacoes,
                'ativacoes_meta': meta_ativacoes_mensal,
                'ativacoes_perc': round((total_ativacoes / meta_ativacoes_mensal * 100) if meta_ativacoes_mensal > 0 else 0, 2),
                'conversoes': total_conversoes,
                'leads': total_leads,
                'leads_meta': meta_leads_mensal,
                'leads_perc': round((total_leads / meta_leads_mensal * 100) if meta_leads_mensal > 0 else 0, 2),
                'tx_ativ_conv': round((total_conversoes / total_ativacoes * 100) if total_ativacoes > 0 else 0, 2),
                'tx_conv_lead': round((total_leads / total_conversoes * 100) if total_conversoes > 0 else 0, 2)
            },
            'vendedores': list(set(m.vendedor for m in metricas)) if not vendedor else [vendedor]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar dashboard diário: {str(e)}")


@router.get("/dashboard/social-selling-comparativo")
async def dashboard_social_selling_comparativo(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020),
    db: Session = Depends(get_db)
):
    """
    Dashboard comparativo de Social Selling - Totais por vendedor.
    Retorna array com métricas consolidadas e taxas de cada vendedor.
    """
    try:
        from collections import defaultdict

        # Buscar todas as métricas do mês
        metricas = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).all()

        # Agrupar por vendedor
        dados_por_vendedor = defaultdict(lambda: {
            'ativacoes': 0,
            'conversoes': 0,
            'leads': 0
        })

        for metrica in metricas:
            dados_por_vendedor[metrica.vendedor]['ativacoes'] += metrica.ativacoes
            dados_por_vendedor[metrica.vendedor]['conversoes'] += metrica.conversoes
            dados_por_vendedor[metrica.vendedor]['leads'] += metrica.leads_gerados

        # Buscar metas para cada vendedor
        resultado = []
        for vendedor, totais in dados_por_vendedor.items():
            # Buscar pessoa
            pessoa = db.query(Pessoa).filter(Pessoa.nome == vendedor).first()

            # Buscar meta
            meta = None
            if pessoa:
                meta = db.query(Meta).filter(
                    Meta.pessoa_id == pessoa.id,
                    Meta.mes == mes,
                    Meta.ano == ano
                ).first()

            # Calcular taxas
            tx_ativ_conv = (totais['conversoes'] / totais['ativacoes'] * 100) if totais['ativacoes'] > 0 else 0
            tx_conv_lead = (totais['leads'] / totais['conversoes'] * 100) if totais['conversoes'] > 0 else 0

            # Calcular % de atingimento
            ativacoes_meta = meta.meta_ativacoes if meta else 0
            leads_meta = meta.meta_leads if meta else 0
            ativacoes_perc = (totais['ativacoes'] / ativacoes_meta * 100) if ativacoes_meta > 0 else 0
            leads_perc = (totais['leads'] / leads_meta * 100) if leads_meta > 0 else 0

            resultado.append({
                'vendedor': vendedor,
                'ativacoes': totais['ativacoes'],
                'ativacoes_meta': ativacoes_meta,
                'ativacoes_perc': round(ativacoes_perc, 1),
                'conversoes': totais['conversoes'],
                'tx_ativ_conv': round(tx_ativ_conv, 2),
                'leads': totais['leads'],
                'leads_meta': leads_meta,
                'leads_perc': round(leads_perc, 1),
                'tx_conv_lead': round(tx_conv_lead, 1)
            })

        # Ordenar por ativações (maior primeiro)
        resultado.sort(key=lambda x: x['ativacoes'], reverse=True)

        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar dashboard comparativo: {str(e)}")


@router.get("/dashboard/sdr-diario")
async def dashboard_sdr_diario(
    mes: int,
    ano: int,
    sdr: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Dashboard dia a dia de SDR com metas da tabela Meta.
    Retorna dados por dia com meta diária e realizado.
    """
    try:
        from calendar import monthrange
        from collections import defaultdict
        from math import ceil

        # Buscar métricas do mês
        query = db.query(SDRMetrica).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        )

        if sdr:
            query = query.filter(SDRMetrica.sdr == sdr)

        metricas = query.all()

        # Buscar metas mensais da tabela Meta
        meta_query = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Pessoa.funcao == 'sdr'
        )

        if sdr:
            meta_query = meta_query.filter(Pessoa.nome == sdr)

        metas = meta_query.all()

        # Calcular metas mensais totais
        meta_reunioes_mensal = sum(m.meta_reunioes or 0 for m in metas)

        # Calcular número de dias do mês
        dias_no_mes = monthrange(ano, mes)[1]

        # Meta diária
        meta_reunioes_diaria = meta_reunioes_mensal / dias_no_mes if dias_no_mes > 0 else 0

        # Agrupar métricas por dia
        metricas_por_dia = defaultdict(lambda: {'leads': 0, 'agendadas': 0, 'realizadas': 0})
        metricas_por_funil = defaultdict(lambda: {'leads': 0, 'agendadas': 0, 'realizadas': 0})

        for m in metricas:
            if m.data:
                dia = m.data.day
                metricas_por_dia[dia]['leads'] += m.leads_recebidos
                metricas_por_dia[dia]['agendadas'] += m.reunioes_agendadas
                metricas_por_dia[dia]['realizadas'] += m.reunioes_realizadas

            metricas_por_funil[m.funil]['leads'] += m.leads_recebidos
            metricas_por_funil[m.funil]['agendadas'] += m.reunioes_agendadas
            metricas_por_funil[m.funil]['realizadas'] += m.reunioes_realizadas

        # Criar array de dados dia a dia
        dados_diarios = []
        for dia in range(1, dias_no_mes + 1):
            realizado = metricas_por_dia[dia]
            dados_diarios.append({
                'dia': dia,
                'data': f"{ano}-{mes:02d}-{dia:02d}",
                'leads_recebidos': realizado['leads'],
                'reunioes_agendadas': realizado['agendadas'],
                'reunioes_agendadas_meta': ceil(meta_reunioes_diaria),
                'reunioes_realizadas': realizado['realizadas'],
                'reunioes_realizadas_meta': ceil(meta_reunioes_diaria),
                'tx_agendamento': round((realizado['agendadas'] / realizado['leads'] * 100) if realizado['leads'] > 0 else 0, 2),
                'tx_comparecimento': round((realizado['realizadas'] / realizado['agendadas'] * 100) if realizado['agendadas'] > 0 else 0, 2)
            })

        # Calcular totais do mês
        total_leads = sum(m.leads_recebidos for m in metricas)
        total_agendadas = sum(m.reunioes_agendadas for m in metricas)
        total_realizadas = sum(m.reunioes_realizadas for m in metricas)

        # Breakdown por funil
        breakdown_funil = []
        for funil, dados in metricas_por_funil.items():
            breakdown_funil.append({
                'funil': funil,
                'leads_recebidos': dados['leads'],
                'reunioes_agendadas': dados['agendadas'],
                'reunioes_realizadas': dados['realizadas'],
                'tx_agendamento': round((dados['agendadas'] / dados['leads'] * 100) if dados['leads'] > 0 else 0, 2),
                'tx_comparecimento': round((dados['realizadas'] / dados['agendadas'] * 100) if dados['agendadas'] > 0 else 0, 2)
            })

        return {
            'dados_diarios': dados_diarios,
            'breakdown_funil': breakdown_funil,
            'totais': {
                'leads_recebidos': total_leads,
                'reunioes_agendadas': total_agendadas,
                'reunioes_agendadas_meta': meta_reunioes_mensal,
                'reunioes_agendadas_perc': round((total_agendadas / meta_reunioes_mensal * 100) if meta_reunioes_mensal > 0 else 0, 2),
                'reunioes_realizadas': total_realizadas,
                'reunioes_realizadas_meta': meta_reunioes_mensal,
                'reunioes_realizadas_perc': round((total_realizadas / meta_reunioes_mensal * 100) if meta_reunioes_mensal > 0 else 0, 2),
                'tx_agendamento': round((total_agendadas / total_leads * 100) if total_leads > 0 else 0, 2),
                'tx_comparecimento': round((total_realizadas / total_agendadas * 100) if total_agendadas > 0 else 0, 2)
            },
            'sdrs': list(set(m.sdr for m in metricas)) if not sdr else [sdr]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar dashboard diário SDR: {str(e)}")


@router.get("/dashboard/sdr")
async def dashboard_sdr(mes: int, ano: int, db: Session = Depends(get_db)):
    """
    Dashboard consolidado de SDR agrupado por pessoa e por funil.
    """
    try:
        metricas = db.query(SDRMetrica).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        ).all()

        # Agrupar por SDR e por funil
        por_sdr: Dict[str, List[Any]] = {}
        por_funil: Dict[str, List[Any]] = {}

        for m in metricas:
            if m.sdr not in por_sdr:
                por_sdr[m.sdr] = []
            por_sdr[m.sdr].append(m)

            if m.funil not in por_funil:
                por_funil[m.funil] = []
            por_funil[m.funil].append(m)

        # Buscar metas da tabela Meta por SDR
        metas_por_sdr = {}
        for sdr in por_sdr.keys():
            pessoa = db.query(Pessoa).filter(Pessoa.nome == sdr).first()
            if pessoa:
                meta = db.query(Meta).filter(
                    Meta.pessoa_id == pessoa.id,
                    Meta.mes == mes,
                    Meta.ano == ano
                ).first()
                metas_por_sdr[sdr] = meta.meta_reunioes if meta else 0
            else:
                metas_por_sdr[sdr] = 0

        # Calcular totais por SDR
        totais_por_sdr = {}
        for sdr, lista_metricas in por_sdr.items():
            total_leads = sum(m.leads_recebidos for m in lista_metricas)
            total_agendadas = sum(m.reunioes_agendadas for m in lista_metricas)
            total_realizadas = sum(m.reunioes_realizadas for m in lista_metricas)
            total_meta = metas_por_sdr.get(sdr, 0)

            totais_por_sdr[sdr] = {
                "leads_recebidos": total_leads,
                "reunioes_agendadas": total_agendadas,
                "reunioes_realizadas": total_realizadas,
                "meta_reunioes": total_meta,
                "tx_agendamento": round((total_agendadas / total_leads * 100) if total_leads > 0 else 0, 2),
                "tx_comparecimento": round((total_realizadas / total_agendadas * 100) if total_agendadas > 0 else 0, 2),
                "perc_meta": round((total_realizadas / total_meta * 100) if total_meta > 0 else 0, 2)
            }

        return {
            "metricas_por_sdr": por_sdr,
            "metricas_por_funil": por_funil,
            "totais_por_sdr": totais_por_sdr,
            "todas_metricas": metricas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar dashboard: {str(e)}")


@router.get("/dashboard/closer-diario")
async def dashboard_closer_diario(
    mes: int,
    ano: int,
    closer: Optional[str] = None,
    funil: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Dashboard dia a dia de Closer com metas da tabela Meta.
    Retorna dados por dia com meta diária e realizado.
    """
    try:
        from calendar import monthrange
        from collections import defaultdict
        from math import ceil

        # Buscar métricas do mês
        query = db.query(CloserMetrica).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        )

        if closer:
            query = query.filter(CloserMetrica.closer == closer)
        if funil:
            query = query.filter(CloserMetrica.funil == funil)

        metricas = query.all()

        # Buscar metas mensais da tabela Meta
        meta_query = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Pessoa.funcao == 'closer'
        )

        if closer:
            meta_query = meta_query.filter(Pessoa.nome == closer)

        metas = meta_query.all()

        # Calcular metas mensais totais
        meta_vendas_mensal = sum(m.meta_vendas or 0 for m in metas)
        meta_faturamento_mensal = sum(m.meta_faturamento or 0 for m in metas)

        # Calcular número de dias do mês
        dias_no_mes = monthrange(ano, mes)[1]

        # Metas diárias
        meta_vendas_diaria = meta_vendas_mensal / dias_no_mes if dias_no_mes > 0 else 0
        meta_faturamento_diario = meta_faturamento_mensal / dias_no_mes if dias_no_mes > 0 else 0

        # Agrupar métricas por dia
        metricas_por_dia = defaultdict(lambda: {
            'calls_agendadas': 0, 'calls_realizadas': 0, 'vendas': 0,
            'booking': 0, 'faturamento_bruto': 0, 'faturamento_liquido': 0
        })
        metricas_por_funil = defaultdict(lambda: {
            'calls_agendadas': 0, 'calls_realizadas': 0, 'vendas': 0,
            'booking': 0, 'faturamento_bruto': 0, 'faturamento_liquido': 0
        })
        metricas_por_closer = defaultdict(lambda: {
            'calls_agendadas': 0, 'calls_realizadas': 0, 'vendas': 0,
            'booking': 0, 'faturamento_bruto': 0, 'faturamento_liquido': 0
        })

        for m in metricas:
            if m.data:
                dia = m.data.day
                metricas_por_dia[dia]['calls_agendadas'] += m.calls_agendadas
                metricas_por_dia[dia]['calls_realizadas'] += m.calls_realizadas
                metricas_por_dia[dia]['vendas'] += m.vendas
                metricas_por_dia[dia]['booking'] += m.booking or 0
                metricas_por_dia[dia]['faturamento_bruto'] += m.faturamento_bruto or 0
                metricas_por_dia[dia]['faturamento_liquido'] += m.faturamento_liquido or 0

            metricas_por_funil[m.funil]['calls_agendadas'] += m.calls_agendadas
            metricas_por_funil[m.funil]['calls_realizadas'] += m.calls_realizadas
            metricas_por_funil[m.funil]['vendas'] += m.vendas
            metricas_por_funil[m.funil]['booking'] += m.booking or 0
            metricas_por_funil[m.funil]['faturamento_bruto'] += m.faturamento_bruto or 0
            metricas_por_funil[m.funil]['faturamento_liquido'] += m.faturamento_liquido or 0

            metricas_por_closer[m.closer]['calls_agendadas'] += m.calls_agendadas
            metricas_por_closer[m.closer]['calls_realizadas'] += m.calls_realizadas
            metricas_por_closer[m.closer]['vendas'] += m.vendas
            metricas_por_closer[m.closer]['booking'] += m.booking or 0
            metricas_por_closer[m.closer]['faturamento_bruto'] += m.faturamento_bruto or 0
            metricas_por_closer[m.closer]['faturamento_liquido'] += m.faturamento_liquido or 0

        # Criar array de dados dia a dia
        dados_diarios = []
        for dia in range(1, dias_no_mes + 1):
            realizado = metricas_por_dia[dia]
            dados_diarios.append({
                'dia': dia,
                'data': f"{ano}-{mes:02d}-{dia:02d}",
                'calls_agendadas': realizado['calls_agendadas'],
                'calls_realizadas': realizado['calls_realizadas'],
                'vendas': realizado['vendas'],
                'vendas_meta': ceil(meta_vendas_diaria),
                'booking': ceil(realizado['booking']),
                'faturamento_bruto': ceil(realizado['faturamento_bruto']),
                'faturamento_liquido': ceil(realizado['faturamento_liquido']),
                'faturamento_meta': ceil(meta_faturamento_diario),
                'tx_conversao': round((realizado['vendas'] / realizado['calls_realizadas'] * 100) if realizado['calls_realizadas'] > 0 else 0, 2)
            })

        # Calcular totais
        total_calls_agendadas = sum(m.calls_agendadas for m in metricas)
        total_calls_realizadas = sum(m.calls_realizadas for m in metricas)
        total_vendas = sum(m.vendas for m in metricas)
        total_booking = sum(m.booking or 0 for m in metricas)
        total_faturamento_bruto = sum(m.faturamento_bruto or 0 for m in metricas)
        total_faturamento_liquido = sum(m.faturamento_liquido or 0 for m in metricas)

        # Breakdown por funil
        breakdown_funil = []
        for f, dados in metricas_por_funil.items():
            breakdown_funil.append({
                'funil': f,
                'calls_agendadas': dados['calls_agendadas'],
                'calls_realizadas': dados['calls_realizadas'],
                'vendas': dados['vendas'],
                'booking': round(dados['booking'], 2),
                'faturamento_bruto': round(dados['faturamento_bruto'], 2),
                'faturamento_liquido': round(dados['faturamento_liquido'], 2)
            })

        # Breakdown por closer
        breakdown_closer = []
        for c, dados in metricas_por_closer.items():
            breakdown_closer.append({
                'closer': c,
                'calls_agendadas': dados['calls_agendadas'],
                'calls_realizadas': dados['calls_realizadas'],
                'vendas': dados['vendas'],
                'booking': round(dados['booking'], 2),
                'faturamento_bruto': round(dados['faturamento_bruto'], 2),
                'faturamento_liquido': round(dados['faturamento_liquido'], 2)
            })

        return {
            'dados_diarios': dados_diarios,
            'breakdown_funil': breakdown_funil,
            'breakdown_closer': breakdown_closer,
            'totais': {
                'calls_agendadas': total_calls_agendadas,
                'calls_realizadas': total_calls_realizadas,
                'vendas': total_vendas,
                'vendas_meta': meta_vendas_mensal,
                'vendas_perc': round((total_vendas / meta_vendas_mensal * 100) if meta_vendas_mensal > 0 else 0, 2),
                'booking': round(total_booking, 2),
                'faturamento_bruto': round(total_faturamento_bruto, 2),
                'faturamento_liquido': round(total_faturamento_liquido, 2),
                'faturamento_meta': meta_faturamento_mensal,
                'faturamento_perc': round((total_faturamento_liquido / meta_faturamento_mensal * 100) if meta_faturamento_mensal > 0 else 0, 2),
                'tx_conversao': round((total_vendas / total_calls_realizadas * 100) if total_calls_realizadas > 0 else 0, 2),
                'ticket_medio': round((total_faturamento_liquido / total_vendas) if total_vendas > 0 else 0, 2)
            },
            'closers': list(set(m.closer for m in metricas)) if not closer else [closer],
            'funis': list(set(m.funil for m in metricas))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar dashboard diário Closer: {str(e)}")


@router.get("/dashboard/closer")
async def dashboard_closer(mes: int, ano: int, db: Session = Depends(get_db)):
    """
    Dashboard consolidado de Closer agrupado por pessoa e por funil.
    """
    try:
        metricas = db.query(CloserMetrica).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        ).all()

        # Agrupar por closer e por funil
        por_closer: Dict[str, Dict[str, Any]] = {}
        por_funil: Dict[str, List[Any]] = {}

        # Buscar metas da tabela Meta por Closer
        metas_por_closer = {}
        closers_unicos = set(m.closer for m in metricas)
        for closer in closers_unicos:
            pessoa = db.query(Pessoa).filter(Pessoa.nome == closer).first()
            if pessoa:
                meta = db.query(Meta).filter(
                    Meta.pessoa_id == pessoa.id,
                    Meta.mes == mes,
                    Meta.ano == ano
                ).first()
                if meta:
                    metas_por_closer[closer] = {
                        "meta_vendas": meta.meta_vendas or 0,
                        "meta_faturamento": meta.meta_faturamento or 0
                    }
            if closer not in metas_por_closer:
                metas_por_closer[closer] = {"meta_vendas": 0, "meta_faturamento": 0}

        for m in metricas:
            if m.closer not in por_closer:
                por_closer[m.closer] = {
                    "metricas": [],
                    "total_calls_agendadas": 0,
                    "total_calls_realizadas": 0,
                    "total_vendas": 0,
                    "total_faturamento": 0,
                    "meta_vendas": metas_por_closer[m.closer]["meta_vendas"],
                    "meta_faturamento": metas_por_closer[m.closer]["meta_faturamento"]
                }
            por_closer[m.closer]["metricas"].append(m)
            por_closer[m.closer]["total_calls_agendadas"] += m.calls_agendadas
            por_closer[m.closer]["total_calls_realizadas"] += m.calls_realizadas
            por_closer[m.closer]["total_vendas"] += m.vendas
            por_closer[m.closer]["total_faturamento"] += m.faturamento_bruto

            if m.funil not in por_funil:
                por_funil[m.funil] = []
            por_funil[m.funil].append(m)

        # Calcular métricas consolidadas por closer
        for closer, dados in por_closer.items():
            dados["tx_comparecimento"] = round(
                (dados["total_calls_realizadas"] / dados["total_calls_agendadas"] * 100)
                if dados["total_calls_agendadas"] > 0 else 0, 2
            )
            dados["tx_conversao"] = round(
                (dados["total_vendas"] / dados["total_calls_realizadas"] * 100)
                if dados["total_calls_realizadas"] > 0 else 0, 2
            )
            dados["ticket_medio"] = round(
                (dados["total_faturamento"] / dados["total_vendas"])
                if dados["total_vendas"] > 0 else 0, 2
            )
            dados["perc_meta_vendas"] = round(
                (dados["total_vendas"] / dados["meta_vendas"] * 100)
                if dados["meta_vendas"] > 0 else 0, 2
            )
            dados["perc_meta_faturamento"] = round(
                (dados["total_faturamento"] / dados["meta_faturamento"] * 100)
                if dados["meta_faturamento"] > 0 else 0, 2
            )

        return {
            "metricas_por_closer": por_closer,
            "metricas_por_funil": por_funil,
            "todas_metricas": metricas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar dashboard: {str(e)}")


# ============ CONSOLIDAR METRICAS DO MES ============

@router.put("/consolidar-mes")
async def consolidar_metricas_mes(mes: int, ano: int, db: Session = Depends(get_db)):
    """Consolida todas as metricas diarias do mes em totais por pessoa"""
    try:
        # Buscar metas uma única vez no início da função
        metas_ss = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Pessoa.funcao == 'social_selling'
        ).all()

        metas_sdr = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Pessoa.funcao == 'sdr'
        ).all()

        metas_closer = db.query(Meta).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Pessoa.funcao == 'closer'
        ).all()

        # Criar dicionários de metas por nome
        metas_por_nome = {}
        for meta in metas_ss + metas_sdr + metas_closer:
            pessoa = db.query(Pessoa).filter(Pessoa.id == meta.pessoa_id).first()
            if pessoa:
                metas_por_nome[pessoa.nome] = meta

        # Social Selling - Agrupar por vendedor
        ss_metricas = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).all()

        por_vendedor_ss = {}
        for metrica in ss_metricas:
            if metrica.vendedor not in por_vendedor_ss:
                meta = metas_por_nome.get(metrica.vendedor)
                por_vendedor_ss[metrica.vendedor] = {
                    "ativacoes": 0,
                    "conversoes": 0,
                    "leads_gerados": 0,
                    "meta_ativacoes": meta.meta_ativacoes if meta else 0,
                    "meta_leads": meta.meta_leads if meta else 0
                }
            por_vendedor_ss[metrica.vendedor]["ativacoes"] += metrica.ativacoes or 0
            por_vendedor_ss[metrica.vendedor]["conversoes"] += metrica.conversoes or 0
            por_vendedor_ss[metrica.vendedor]["leads_gerados"] += metrica.leads_gerados or 0

        # Calcular taxas de SS
        for vendedor, totais in por_vendedor_ss.items():
            totais["tx_ativ_conv"] = round(
                (totais["conversoes"] / totais["ativacoes"] * 100) if totais["ativacoes"] > 0 else 0, 2
            )
            totais["tx_conv_lead"] = round(
                (totais["leads_gerados"] / totais["conversoes"] * 100) if totais["conversoes"] > 0 else 0, 2
            )
            totais["perc_meta_ativacoes"] = round(
                (totais["ativacoes"] / totais["meta_ativacoes"] * 100) if totais["meta_ativacoes"] > 0 else 0, 2
            )
            totais["perc_meta_leads"] = round(
                (totais["leads_gerados"] / totais["meta_leads"] * 100) if totais["meta_leads"] > 0 else 0, 2
            )

        # SDR - Agrupar por sdr
        sdr_metricas = db.query(SDRMetrica).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        ).all()

        por_sdr = {}
        for metrica in sdr_metricas:
            if metrica.sdr not in por_sdr:
                meta = metas_por_nome.get(metrica.sdr)
                por_sdr[metrica.sdr] = {
                    "leads_recebidos": 0,
                    "reunioes_agendadas": 0,
                    "reunioes_realizadas": 0,
                    "meta_reunioes": meta.meta_reunioes if meta else 0
                }
            por_sdr[metrica.sdr]["leads_recebidos"] += metrica.leads_recebidos or 0
            por_sdr[metrica.sdr]["reunioes_agendadas"] += metrica.reunioes_agendadas or 0
            por_sdr[metrica.sdr]["reunioes_realizadas"] += metrica.reunioes_realizadas or 0

        # Calcular taxas de SDR
        for sdr, totais in por_sdr.items():
            totais["tx_agendamento"] = round(
                (totais["reunioes_agendadas"] / totais["leads_recebidos"] * 100) if totais["leads_recebidos"] > 0 else 0, 2
            )
            totais["tx_comparecimento"] = round(
                (totais["reunioes_realizadas"] / totais["reunioes_agendadas"] * 100) if totais["reunioes_agendadas"] > 0 else 0, 2
            )
            totais["perc_meta_reunioes"] = round(
                (totais["reunioes_realizadas"] / totais["meta_reunioes"] * 100) if totais["meta_reunioes"] > 0 else 0, 2
            )

        # Closer - Agrupar por closer
        closer_metricas = db.query(CloserMetrica).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        ).all()

        por_closer = {}
        for metrica in closer_metricas:
            if metrica.closer not in por_closer:
                meta = metas_por_nome.get(metrica.closer)
                por_closer[metrica.closer] = {
                    "calls_agendadas": 0,
                    "calls_realizadas": 0,
                    "vendas": 0,
                    "faturamento": 0,
                    "meta_vendas": meta.meta_vendas if meta else 0,
                    "meta_faturamento": meta.meta_faturamento if meta else 0
                }
            por_closer[metrica.closer]["calls_agendadas"] += metrica.calls_agendadas or 0
            por_closer[metrica.closer]["calls_realizadas"] += metrica.calls_realizadas or 0
            por_closer[metrica.closer]["vendas"] += metrica.vendas or 0
            por_closer[metrica.closer]["faturamento"] += metrica.faturamento_bruto or 0

        # Calcular taxas de Closer
        for closer, totais in por_closer.items():
            totais["tx_comparecimento"] = round(
                (totais["calls_realizadas"] / totais["calls_agendadas"] * 100) if totais["calls_agendadas"] > 0 else 0, 2
            )
            totais["tx_conversao"] = round(
                (totais["vendas"] / totais["calls_realizadas"] * 100) if totais["calls_realizadas"] > 0 else 0, 2
            )
            totais["ticket_medio"] = round(
                (totais["faturamento"] / totais["vendas"]) if totais["vendas"] > 0 else 0, 2
            )
            totais["perc_meta_vendas"] = round(
                (totais["vendas"] / totais["meta_vendas"] * 100) if totais["meta_vendas"] > 0 else 0, 2
            )
            totais["perc_meta_faturamento"] = round(
                (totais["faturamento"] / totais["meta_faturamento"] * 100) if totais["meta_faturamento"] > 0 else 0, 2
            )

        # Totais gerais
        totais_gerais = {
            "ativacoes": sum(v["ativacoes"] for v in por_vendedor_ss.values()),
            "leads_gerados": sum(v["leads_gerados"] for v in por_vendedor_ss.values()),
            "leads_recebidos_sdr": sum(v["leads_recebidos"] for v in por_sdr.values()),
            "reunioes_realizadas": sum(v["reunioes_realizadas"] for v in por_sdr.values()),
            "calls_realizadas": sum(v["calls_realizadas"] for v in por_closer.values()),
            "vendas": sum(v["vendas"] for v in por_closer.values()),
            "faturamento": sum(v["faturamento"] for v in por_closer.values())
        }

        return {
            "mes": mes,
            "ano": ano,
            "social_selling": por_vendedor_ss,
            "sdr": por_sdr,
            "closer": por_closer,
            "totais_gerais": totais_gerais
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consolidar metricas: {str(e)}")


@router.get("/scorecard-individual")
async def get_scorecard_individual(
    mes: int,
    ano: int,
    db: Session = Depends(get_db)
):
    """
    Retorna scorecard individual de cada pessoa da equipe com tendência.
    Mostra: meta, realizado, %, status (vai bater ou não).
    """
    from app.models.models import Meta, Pessoa, Venda
    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    try:
        # Buscar todas as metas do mês
        metas = db.query(Meta).filter(
            Meta.mes == mes,
            Meta.ano == ano
        ).all()

        scorecards = []

        for meta in metas:
            if not meta.pessoa:
                continue

            pessoa_nome = meta.pessoa.nome
            area = meta.pessoa.cargo or "Indefinido"

            # Buscar realizado do mês atual
            vendas_mes = db.query(func.sum(Venda.valor_liquido)).filter(
                Venda.closer == pessoa_nome,
                Venda.mes == mes,
                Venda.ano == ano
            ).scalar() or 0

            # Calcular % da meta
            perc_meta = (vendas_mes / meta.meta_faturamento * 100) if meta.meta_faturamento > 0 else 0

            # Calcular dias úteis do mês
            primeiro_dia = datetime(ano, mes, 1)
            if mes == 12:
                ultimo_dia = datetime(ano + 1, 1, 1) - relativedelta(days=1)
            else:
                ultimo_dia = datetime(ano, mes + 1, 1) - relativedelta(days=1)

            dias_totais = ultimo_dia.day
            dia_atual = min(datetime.now().day, dias_totais) if datetime.now().month == mes and datetime.now().year == ano else dias_totais

            # Projeção baseada no ritmo atual
            if dia_atual > 0:
                ritmo_diario = vendas_mes / dia_atual
                projecao_fim_mes = ritmo_diario * dias_totais
                perc_projecao = (projecao_fim_mes / meta.meta_faturamento * 100) if meta.meta_faturamento > 0 else 0
            else:
                projecao_fim_mes = 0
                perc_projecao = 0

            # Determinar tendência
            if perc_projecao >= 100:
                tendencia = "vai_bater"
                tendencia_texto = "✓ Vai bater a meta"
                cor = "green"
            elif perc_projecao >= 80:
                tendencia = "no_caminho"
                tendencia_texto = "→ No caminho certo"
                cor = "yellow"
            else:
                tendencia = "risco"
                tendencia_texto = "⚠ Em risco"
                cor = "red"

            # Histórico (últimos 3 meses)
            historico = []
            for i in range(1, 4):
                data_hist = datetime(ano, mes, 1) - relativedelta(months=i)
                mes_hist = data_hist.month
                ano_hist = data_hist.year

                meta_hist = db.query(Meta).filter(
                    Meta.pessoa_id == meta.pessoa_id,
                    Meta.mes == mes_hist,
                    Meta.ano == ano_hist
                ).first()

                if meta_hist:
                    vendas_hist = db.query(func.sum(Venda.valor_liquido)).filter(
                        Venda.closer == pessoa_nome,
                        Venda.mes == mes_hist,
                        Venda.ano == ano_hist
                    ).scalar() or 0

                    perc_hist = (vendas_hist / meta_hist.meta_faturamento * 100) if meta_hist.meta_faturamento > 0 else 0

                    historico.append({
                        "mes": mes_hist,
                        "ano": ano_hist,
                        "mes_nome": data_hist.strftime("%B"),
                        "meta": round(meta_hist.meta_faturamento, 2),
                        "realizado": round(vendas_hist, 2),
                        "perc": round(perc_hist, 2)
                    })

            scorecards.append({
                "pessoa": pessoa_nome,
                "area": area,
                "meta_mes": round(meta.meta_faturamento, 2),
                "realizado_mes": round(vendas_mes, 2),
                "perc_meta": round(perc_meta, 2),
                "projecao_fim_mes": round(projecao_fim_mes, 2),
                "perc_projecao": round(perc_projecao, 2),
                "tendencia": tendencia,
                "tendencia_texto": tendencia_texto,
                "cor": cor,
                "dias_decorridos": dia_atual,
                "dias_totais": dias_totais,
                "ritmo_diario": round(ritmo_diario, 2) if dia_atual > 0 else 0,
                "falta_para_meta": round(max(0, meta.meta_faturamento - vendas_mes), 2),
                "historico": historico
            })

        # Ordenar por % da meta (decrescente)
        scorecards.sort(key=lambda x: x["perc_meta"], reverse=True)

        return {
            "mes": mes,
            "ano": ano,
            "scorecards": scorecards,
            "total_pessoas": len(scorecards)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar scorecards: {str(e)}")


@router.get("/social-selling/tracking-diario")
async def tracking_diario_social_selling(
    mes: int,
    ano: int,
    vendedor: str = Query(None, description="Filtrar por vendedor específico"),
    db: Session = Depends(get_db)
):
    """
    Retorna tracking diário de ativações de Social Selling.
    Mostra linha do tempo diária para identificar padrões, quedas e picos.
    """
    try:
        # Buscar métricas do mês com data específica
        query = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano,
            SocialSellingMetrica.data != None  # Apenas registros com data específica
        )

        if vendedor:
            query = query.filter(SocialSellingMetrica.vendedor == vendedor)

        metricas = query.order_by(SocialSellingMetrica.data).all()

        if not metricas:
            return {
                "mes": mes,
                "ano": ano,
                "vendedor_filtro": vendedor,
                "dados_diarios": [],
                "vendedores": [],
                "insights": []
            }

        # Agrupar por data e vendedor
        dados_por_dia = {}
        vendedores_set = set()

        for m in metricas:
            data_str = m.data.strftime("%Y-%m-%d")
            if data_str not in dados_por_dia:
                dados_por_dia[data_str] = {
                    "data": data_str,
                    "data_formatada": m.data.strftime("%d/%m"),
                    "dia_semana": m.data.strftime("%A"),
                    "total_ativacoes": 0,
                    "por_vendedor": {}
                }

            dados_por_dia[data_str]["total_ativacoes"] += m.ativacoes
            dados_por_dia[data_str]["por_vendedor"][m.vendedor] = m.ativacoes
            vendedores_set.add(m.vendedor)

        # Converter para lista ordenada
        dados_diarios = sorted(dados_por_dia.values(), key=lambda x: x["data"])
        vendedores = sorted(list(vendedores_set))

        # Gerar insights
        insights = []

        # Identificar dias com zero ativações
        dias_zero = [d for d in dados_diarios if d["total_ativacoes"] == 0]
        if dias_zero:
            insights.append({
                "tipo": "alerta",
                "titulo": f"🚨 {len(dias_zero)} dias sem ativações",
                "descricao": f"Datas: {', '.join([d['data_formatada'] for d in dias_zero[:3]])}" +
                            (f" e mais {len(dias_zero) - 3}" if len(dias_zero) > 3 else "")
            })

        # Identificar melhor dia
        if dados_diarios:
            melhor_dia = max(dados_diarios, key=lambda x: x["total_ativacoes"])
            if melhor_dia["total_ativacoes"] > 0:
                insights.append({
                    "tipo": "sucesso",
                    "titulo": f"🏆 Melhor dia: {melhor_dia['data_formatada']}",
                    "descricao": f"{melhor_dia['total_ativacoes']} ativações ({melhor_dia['dia_semana']})"
                })

        # Calcular média e identificar dias abaixo da média
        if dados_diarios:
            media_ativacoes = sum(d["total_ativacoes"] for d in dados_diarios) / len(dados_diarios)
            dias_abaixo = [d for d in dados_diarios if d["total_ativacoes"] < media_ativacoes * 0.5 and d["total_ativacoes"] > 0]

            insights.append({
                "tipo": "info",
                "titulo": f"📊 Média diária: {media_ativacoes:.1f} ativações",
                "descricao": f"{len(dias_abaixo)} dias abaixo de 50% da média"
            })

        # Identificar padrão de dia da semana
        ativacoes_por_dia_semana = {}
        for d in dados_diarios:
            dia = d["dia_semana"]
            if dia not in ativacoes_por_dia_semana:
                ativacoes_por_dia_semana[dia] = []
            ativacoes_por_dia_semana[dia].append(d["total_ativacoes"])

        medias_dia_semana = {
            dia: sum(valores) / len(valores)
            for dia, valores in ativacoes_por_dia_semana.items()
        }

        if medias_dia_semana:
            melhor_dia_semana = max(medias_dia_semana, key=medias_dia_semana.get)
            pior_dia_semana = min(medias_dia_semana, key=medias_dia_semana.get)

            insights.append({
                "tipo": "padrao",
                "titulo": f"📅 Padrão semanal identificado",
                "descricao": f"Melhor: {melhor_dia_semana} ({medias_dia_semana[melhor_dia_semana]:.1f}), " +
                            f"Pior: {pior_dia_semana} ({medias_dia_semana[pior_dia_semana]:.1f})"
            })

        return {
            "mes": mes,
            "ano": ano,
            "vendedor_filtro": vendedor,
            "dados_diarios": dados_diarios,
            "vendedores": vendedores,
            "insights": insights,
            "resumo": {
                "total_dias_com_dados": len(dados_diarios),
                "total_ativacoes": sum(d["total_ativacoes"] for d in dados_diarios),
                "media_diaria": round(sum(d["total_ativacoes"] for d in dados_diarios) / len(dados_diarios), 1) if dados_diarios else 0,
                "melhor_dia": melhor_dia if dados_diarios else None
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar tracking diário: {str(e)}")


# ==================== DASHBOARD GERAL ====================

@router.get("/dashboard/geral")
async def dashboard_geral(
    mes: int,
    ano: int,
    funil: str = Query("todos", description="Filtro: todos, SS, Quiz, Indicacao, Webinario"),
    db: Session = Depends(get_db)
):
    """
    Dashboard Geral - Visão executiva centralizada.
    Retorna Social Selling (esquerda) + Comercial filtrado por funil (direita) + Projeções.
    """
    try:
        from datetime import datetime
        import calendar
        
        # ========== SOCIAL SELLING ==========
        
        # KPIs Social Selling
        ss_kpis = db.query(
            func.sum(SocialSellingMetrica.ativacoes).label('ativacoes'),
            func.sum(SocialSellingMetrica.conversoes).label('conversoes'),
            func.sum(SocialSellingMetrica.leads_gerados).label('leads')
        ).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).first()
        
        # Metas Social Selling
        metas_ss_raw = db.query(Meta, Pessoa).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            func.lower(Pessoa.funcao).like('%social%')
        ).all()

        # Convert to list of Meta objects with pessoa attribute attached
        metas_ss = []
        for meta, pessoa in metas_ss_raw:
            meta.pessoa = pessoa
            metas_ss.append(meta)
        
        meta_ativacoes = sum(m.meta_ativacoes or 0 for m in metas_ss)
        meta_leads = sum(m.meta_leads or 0 for m in metas_ss)
        
        ativacoes = int(ss_kpis.ativacoes or 0)
        conversoes = int(ss_kpis.conversoes or 0)
        leads = int(ss_kpis.leads or 0)
        
        perc_ativacoes = (ativacoes / meta_ativacoes * 100) if meta_ativacoes > 0 else 0
        perc_leads = (leads / meta_leads * 100) if meta_leads > 0 else 0
        tx_ativ_conv = (conversoes / ativacoes * 100) if ativacoes > 0 else 0
        tx_conv_lead = (leads / conversoes * 100) if conversoes > 0 else 0
        
        # Por vendedor (Social Selling)
        vendedores_ss = db.query(
            SocialSellingMetrica.vendedor,
            func.sum(SocialSellingMetrica.leads_gerados).label('leads')
        ).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).group_by(SocialSellingMetrica.vendedor).all()
        
        por_vendedor = []
        for v in vendedores_ss:
            meta_vendedor = next((m for m in metas_ss if m.pessoa and m.pessoa.nome == v.vendedor), None)
            meta_v = meta_vendedor.meta_leads or 0 if meta_vendedor else 0
            perc_v = (v.leads / meta_v * 100) if meta_v > 0 else 0
            
            por_vendedor.append({
                "vendedor": v.vendedor,
                "leads": int(v.leads or 0),
                "meta": meta_v,
                "perc": round(perc_v, 1),
                "status": "verde" if perc_v >= 80 else "amarelo" if perc_v >= 40 else "vermelho"
            })
        
        # Acumulado diário de ativações
        ativacoes_diarias = db.query(
            func.extract('day', SocialSellingMetrica.data).label('dia'),
            func.sum(SocialSellingMetrica.ativacoes).label('ativacoes')
        ).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano,
            SocialSellingMetrica.data.isnot(None)
        ).group_by(func.extract('day', SocialSellingMetrica.data)).order_by('dia').all()
        
        acumulado_ativacoes = []
        acumulado = 0
        dias_no_mes = calendar.monthrange(ano, mes)[1]
        meta_diaria_ativ = meta_ativacoes / dias_no_mes if dias_no_mes > 0 else 0
        
        for dia_num, ativ in ativacoes_diarias:
            acumulado += int(ativ or 0)
            meta_acum = meta_diaria_ativ * int(dia_num)
            acumulado_ativacoes.append({
                "dia": int(dia_num),
                "acumulado": acumulado,
                "meta_acumulada": round(meta_acum, 0)
            })
        
        # ========== COMERCIAL (com filtro por funil) ==========
        
        # Aplicar filtro de funil
        funil_filter = None
        if funil and funil.lower() != "todos":
            funil_filter = funil
        
        # SDR (filtrável por funil)
        sdr_query = db.query(
            func.sum(SDRMetrica.leads_recebidos).label('leads'),
            func.sum(SDRMetrica.reunioes_agendadas).label('agendadas'),
            func.sum(SDRMetrica.reunioes_realizadas).label('realizadas')
        ).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        )
        if funil_filter:
            sdr_query = sdr_query.filter(SDRMetrica.funil == funil_filter)
        
        sdr_kpis = sdr_query.first()
        
        # Closer (filtrável por funil)
        closer_query = db.query(
            func.sum(CloserMetrica.calls_agendadas).label('calls_agendadas'),
            func.sum(CloserMetrica.calls_realizadas).label('calls_realizadas'),
            func.sum(CloserMetrica.vendas).label('vendas'),
            func.sum(CloserMetrica.faturamento_bruto).label('faturamento')
        ).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        )
        if funil_filter:
            closer_query = closer_query.filter(CloserMetrica.funil == funil_filter)
        
        closer_kpis = closer_query.first()
        
        # Metas Comercial
        metas_sdr_raw = db.query(Meta, Pessoa).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            func.lower(Pessoa.funcao).like('%sdr%')
        ).all()

        metas_sdr = []
        for meta, pessoa in metas_sdr_raw:
            meta.pessoa = pessoa
            metas_sdr.append(meta)

        metas_closer_raw = db.query(Meta, Pessoa).join(Pessoa, Meta.pessoa_id == Pessoa.id).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            func.lower(Pessoa.funcao).like('%closer%')
        ).all()

        metas_closer = []
        for meta, pessoa in metas_closer_raw:
            meta.pessoa = pessoa
            metas_closer.append(meta)
        
        meta_leads_sdr = sum(m.meta_leads or 0 for m in metas_sdr)
        meta_reunioes_agend = sum(m.meta_reunioes_agendadas or 0 for m in metas_sdr)
        meta_reunioes_real = sum(m.meta_reunioes or 0 for m in metas_sdr)
        meta_vendas = sum(m.meta_vendas or 0 for m in metas_closer)
        meta_faturamento = sum(m.meta_faturamento or 0 for m in metas_closer)
        
        leads_com = int(sdr_kpis.leads or 0)
        agendadas = int(sdr_kpis.agendadas or 0)
        realizadas = int(sdr_kpis.realizadas or 0)
        calls_agend = int(closer_kpis.calls_agendadas or 0)
        calls_real = int(closer_kpis.calls_realizadas or 0)
        vendas = int(closer_kpis.vendas or 0)
        faturamento = float(closer_kpis.faturamento or 0)
        
        ticket_medio = (faturamento / vendas) if vendas > 0 else 0
        
        # Percentuais
        perc_leads = (leads_com / meta_leads_sdr * 100) if meta_leads_sdr > 0 else 0
        perc_agendadas = (agendadas / meta_reunioes_agend * 100) if meta_reunioes_agend > 0 else 0
        perc_realizadas = (realizadas / meta_reunioes_real * 100) if meta_reunioes_real > 0 else 0
        perc_vendas = (vendas / meta_vendas * 100) if meta_vendas > 0 else 0
        perc_faturamento = (faturamento / meta_faturamento * 100) if meta_faturamento > 0 else 0
        
        # Taxas de conversão do funil
        tx_agendamento = (agendadas / leads_com * 100) if leads_com > 0 else 0
        tx_comparecimento_sdr = (realizadas / agendadas * 100) if agendadas > 0 else 0
        tx_comparecimento_closer = (calls_real / calls_agend * 100) if calls_agend > 0 else 0
        tx_conversao = (vendas / calls_real * 100) if calls_real > 0 else 0
        
        # Por pessoa (SDR + Closer)
        por_pessoa = []
        
        # SDRs individuais
        sdrs = db.query(
            SDRMetrica.sdr,
            func.sum(SDRMetrica.reunioes_realizadas).label('realizadas')
        ).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        )
        if funil_filter:
            sdrs = sdrs.filter(SDRMetrica.funil == funil_filter)
        sdrs = sdrs.group_by(SDRMetrica.sdr).all()
        
        for s in sdrs:
            meta_sdr = next((m for m in metas_sdr if m.pessoa and m.pessoa.nome == s.sdr), None)
            meta_s = meta_sdr.meta_reunioes or 0 if meta_sdr else 0
            perc_s = (s.realizadas / meta_s * 100) if meta_s > 0 else 0
            
            por_pessoa.append({
                "pessoa": s.sdr,
                "area": "SDR",
                "metrica": "Reuniões Realizadas",
                "realizado": int(s.realizadas or 0),
                "meta": meta_s,
                "perc": round(perc_s, 1),
                "status": "verde" if perc_s >= 80 else "amarelo" if perc_s >= 40 else "vermelho"
            })
        
        # Closers individuais
        closers = db.query(
            CloserMetrica.closer,
            func.sum(CloserMetrica.vendas).label('vendas'),
            func.sum(CloserMetrica.faturamento_bruto).label('faturamento')
        ).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        )
        if funil_filter:
            closers = closers.filter(CloserMetrica.funil == funil_filter)
        closers = closers.group_by(CloserMetrica.closer).all()

        for c in closers:
            meta_closer = next((m for m in metas_closer if m.pessoa and m.pessoa.nome == c.closer), None)
            meta_fat = meta_closer.meta_faturamento or 0 if meta_closer else 0
            perc_c = (c.faturamento / meta_fat * 100) if meta_fat > 0 else 0

            por_pessoa.append({
                "pessoa": c.closer,
                "area": "Closer",
                "metrica": "Faturamento",
                "realizado": int(c.faturamento or 0),
                "meta": int(meta_fat),
                "perc": round(perc_c, 1),
                "status": "verde" if perc_c >= 80 else "amarelo" if perc_c >= 40 else "vermelho"
            })
        
        # Acumulados diários (vendas e faturamento) - USANDO APENAS CLOSER_METRICAS
        closer_query = db.query(
            func.extract('day', CloserMetrica.data).label('dia'),
            func.sum(CloserMetrica.vendas).label('vendas'),
            func.sum(CloserMetrica.faturamento_bruto).label('faturamento')
        ).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano,
            CloserMetrica.data.isnot(None)
        )
        if funil_filter:
            closer_query = closer_query.filter(CloserMetrica.funil == funil_filter)

        closer_diario = closer_query.group_by(func.extract('day', CloserMetrica.data)).order_by('dia').all()

        acumulado_vendas_arr = []
        acumulado_fat_arr = []
        vendas_acum = 0
        fat_acum = 0.0
        meta_diaria_vendas = meta_vendas / dias_no_mes if dias_no_mes > 0 else 0
        meta_diaria_fat = meta_faturamento / dias_no_mes if dias_no_mes > 0 else 0

        for dia_num, v_dia, fat_dia in closer_diario:
            vendas_acum += int(v_dia or 0)
            fat_acum += float(fat_dia or 0)
            meta_vendas_acum = meta_diaria_vendas * int(dia_num)
            meta_fat_acum = meta_diaria_fat * int(dia_num)

            acumulado_vendas_arr.append({
                "dia": int(dia_num),
                "acumulado": vendas_acum,
                "meta_acumulada": round(meta_vendas_acum, 0)
            })
            acumulado_fat_arr.append({
                "dia": int(dia_num),
                "acumulado": round(fat_acum, 2),
                "meta_acumulada": round(meta_fat_acum, 2)
            })
        
        # ========== PROJEÇÕES E ALERTAS ==========
        
        # Calcular dias úteis
        hoje = datetime.now()
        dia_atual = hoje.day if hoje.month == mes and hoje.year == ano else dias_no_mes
        dias_uteis_passados = dia_atual  # Simplificação: considerar todos os dias como úteis
        dias_uteis_restantes = max(0, dias_no_mes - dia_atual)
        dias_uteis_totais = dias_no_mes
        
        # Projeções
        ritmo_vendas = vendas / dias_uteis_passados if dias_uteis_passados > 0 else 0
        projecao_vendas = round(ritmo_vendas * dias_uteis_totais, 0)
        ritmo_faturamento = faturamento / dias_uteis_passados if dias_uteis_passados > 0 else 0
        projecao_faturamento = round(ritmo_faturamento * dias_uteis_totais, 2)
        
        # Ritmo necessário
        vendas_faltam = max(0, meta_vendas - vendas)
        fat_falta = max(0, meta_faturamento - faturamento)
        ritmo_necessario_vendas = vendas_faltam / dias_uteis_restantes if dias_uteis_restantes > 0 else 0
        ritmo_necessario_fat = fat_falta / dias_uteis_restantes if dias_uteis_restantes > 0 else 0
        
        # Identificar maior gargalo
        gargalos = [
            ("Social Selling", perc_leads, f"Social Selling entregou {perc_leads:.0f}% dos leads"),
            ("SDR", perc_realizadas, f"SDR realizou {perc_realizadas:.0f}% das reuniões"),
            ("Closer", perc_vendas, f"Closer atingiu {perc_vendas:.0f}% das vendas")
        ]
        gargalo_principal = min(gargalos, key=lambda x: x[1])

        # ========== DADOS DO MÊS ANTERIOR (para comparativo) ==========

        # Calcular mês anterior
        mes_anterior = 12 if mes == 1 else mes - 1
        ano_anterior = ano - 1 if mes == 1 else ano

        # Social Selling mês anterior
        ss_anterior = db.query(
            func.sum(SocialSellingMetrica.ativacoes).label('ativacoes'),
            func.sum(SocialSellingMetrica.conversoes).label('conversoes'),
            func.sum(SocialSellingMetrica.leads_gerados).label('leads')
        ).filter(
            SocialSellingMetrica.mes == mes_anterior,
            SocialSellingMetrica.ano == ano_anterior
        ).first()

        # Comercial mês anterior (com filtro de funil se aplicável)
        leads_query_ant = db.query(func.sum(SDRMetrica.leads_recebidos).label('total')).filter(
            SDRMetrica.mes == mes_anterior,
            SDRMetrica.ano == ano_anterior
        )
        agend_query_ant = db.query(func.sum(SDRMetrica.reunioes_agendadas).label('total')).filter(
            SDRMetrica.mes == mes_anterior,
            SDRMetrica.ano == ano_anterior
        )
        real_query_ant = db.query(func.sum(SDRMetrica.reunioes_realizadas).label('total')).filter(
            SDRMetrica.mes == mes_anterior,
            SDRMetrica.ano == ano_anterior
        )

        if funil_filter:
            leads_query_ant = leads_query_ant.filter(SDRMetrica.funil == funil_filter)
            agend_query_ant = agend_query_ant.filter(SDRMetrica.funil == funil_filter)
            real_query_ant = real_query_ant.filter(SDRMetrica.funil == funil_filter)

        leads_com_ant = int(leads_query_ant.scalar() or 0)
        agendadas_ant = int(agend_query_ant.scalar() or 0)
        realizadas_ant = int(real_query_ant.scalar() or 0)

        # Closer mês anterior (com filtro de funil se aplicável)
        closer_query_ant = db.query(
            func.sum(CloserMetrica.calls_agendadas).label('calls_agend'),
            func.sum(CloserMetrica.calls_realizadas).label('calls_real'),
            func.sum(CloserMetrica.vendas).label('vendas'),
            func.sum(CloserMetrica.faturamento_bruto).label('faturamento')
        ).filter(
            CloserMetrica.mes == mes_anterior,
            CloserMetrica.ano == ano_anterior
        )

        if funil_filter:
            closer_query_ant = closer_query_ant.filter(CloserMetrica.funil == funil_filter)

        closer_ant = closer_query_ant.first()

        vendas_ant = int(closer_ant.vendas or 0) if closer_ant else 0
        faturamento_ant = float(closer_ant.faturamento or 0) if closer_ant else 0
        ticket_medio_ant = (faturamento_ant / vendas_ant) if vendas_ant > 0 else 0

        mes_anterior_data = {
            "social_selling": {
                "ativacoes": int(ss_anterior.ativacoes or 0) if ss_anterior else 0,
                "conversoes": int(ss_anterior.conversoes or 0) if ss_anterior else 0,
                "leads": int(ss_anterior.leads or 0) if ss_anterior else 0
            },
            "comercial": {
                "leads": leads_com_ant,
                "reunioes_agendadas": agendadas_ant,
                "reunioes_realizadas": realizadas_ant,
                "vendas": vendas_ant,
                "faturamento": faturamento_ant,
                "ticket_medio": round(ticket_medio_ant, 2)
            }
        }

        return {
            "mes": mes,
            "ano": ano,
            "funil_filtro": funil,
            "social_selling": {
                "kpis": {
                    "ativacoes": {"valor": ativacoes, "meta": meta_ativacoes, "perc": round(perc_ativacoes, 1)},
                    "conversoes": {"valor": conversoes, "taxa": round(tx_ativ_conv, 2)},
                    "leads": {"valor": leads, "meta": meta_leads, "perc": round(perc_leads, 1), "faltam": max(0, meta_leads - leads)}
                },
                "funil": {
                    "ativacoes": ativacoes,
                    "conversoes": conversoes,
                    "leads": leads,
                    "tx_ativ_conv": round(tx_ativ_conv, 1),
                    "tx_conv_lead": round(tx_conv_lead, 1)
                },
                "por_vendedor": por_vendedor,
                "acumulado_ativacoes": acumulado_ativacoes
            },
            "comercial": {
                "kpis": {
                    "leads": {"valor": leads_com, "meta": meta_leads_sdr, "perc": round(perc_leads, 1)},
                    "reunioes_agendadas": {"valor": agendadas, "meta": meta_reunioes_agend, "perc": round(perc_agendadas, 1), "faltam": max(0, meta_reunioes_agend - agendadas)},
                    "reunioes_realizadas": {"valor": realizadas, "meta": meta_reunioes_real, "perc": round(perc_realizadas, 1), "faltam": max(0, meta_reunioes_real - realizadas)},
                    "calls_agendadas": {"valor": calls_agend},
                    "calls_realizadas": {"valor": calls_real},
                    "vendas": {"valor": vendas, "meta": meta_vendas, "perc": round(perc_vendas, 1), "faltam": max(0, meta_vendas - vendas)},
                    "faturamento": {"valor": round(faturamento, 2), "meta": round(meta_faturamento, 2), "perc": round(perc_faturamento, 1), "faltam": round(max(0, meta_faturamento - faturamento), 2)},
                    "ticket_medio": round(ticket_medio, 2)
                },
                "funil": {
                    "leads": leads_com,
                    "reunioes_agendadas": agendadas,
                    "reunioes_realizadas": realizadas,
                    "calls_agendadas": calls_agend,
                    "calls_realizadas": calls_real,
                    "vendas": vendas,
                    "faturamento": round(faturamento, 2),
                    "tx_agendamento": round(tx_agendamento, 1),
                    "tx_comparecimento_sdr": round(tx_comparecimento_sdr, 1),
                    "tx_comparecimento_closer": round(tx_comparecimento_closer, 1),
                    "tx_conversao": round(tx_conversao, 1)
                },
                "por_pessoa": por_pessoa,
                "acumulado_vendas": acumulado_vendas_arr,
                "acumulado_faturamento": acumulado_fat_arr
            },
            "projecoes": {
                "vendas": {
                    "projecao": int(projecao_vendas),
                    "meta": meta_vendas,
                    "realizado": vendas
                },
                "faturamento": {
                    "projecao": round(projecao_faturamento, 2),
                    "meta": round(meta_faturamento, 2),
                    "realizado": round(faturamento, 2)
                },
                "dias_uteis_restantes": dias_uteis_restantes,
                "ritmo_atual": {
                    "vendas_dia": round(ritmo_vendas, 2),
                    "faturamento_dia": round(ritmo_faturamento, 2)
                },
                "ritmo_necessario": {
                    "vendas_dia": round(ritmo_necessario_vendas, 2),
                    "faturamento_dia": round(ritmo_necessario_fat, 2)
                },
                "alerta_principal": gargalo_principal[2]
            },
            "mes_anterior": mes_anterior_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dashboard geral: {str(e)}")
