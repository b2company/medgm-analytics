"""
FastAPI router for metas dinamicas.
Sistema de metas mensais por pessoa/empresa com historico e replicacao.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import (
    Pessoa, SocialSellingMetrica, SDRMetrica, CloserMetrica,
    Meta, MetaEmpresa
)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/metas", tags=["Metas"])


# ==================== PYDANTIC SCHEMAS ====================

class MetaCreate(BaseModel):
    mes: int
    ano: int
    tipo: str = "pessoa"  # pessoa | empresa
    pessoa_id: Optional[int] = None
    meta_ativacoes: Optional[int] = None
    meta_leads: Optional[int] = None
    meta_reunioes_agendadas: Optional[int] = None
    meta_reunioes: Optional[int] = None
    meta_vendas: Optional[int] = None
    meta_faturamento: Optional[float] = None


class MetaUpdate(BaseModel):
    meta_ativacoes: Optional[int] = None
    meta_leads: Optional[int] = None
    meta_reunioes_agendadas: Optional[int] = None
    meta_reunioes: Optional[int] = None
    meta_vendas: Optional[int] = None
    meta_faturamento: Optional[float] = None


class MetaEmpresaCreate(BaseModel):
    ano: int
    meta_faturamento_anual: float = 5000000.0  # 5M
    meta_caixa_anual: float = 1000000.0  # 1M


# ==================== BUSCAR META POR PESSOA/MES ====================

@router.get("/pessoa-mes")
async def get_meta_pessoa_mes(
    pessoa_nome: str,
    mes: int,
    ano: int,
    db: Session = Depends(get_db)
):
    """Busca meta de uma pessoa em um mes especifico"""
    try:
        pessoa = db.query(Pessoa).filter(Pessoa.nome == pessoa_nome).first()
        if not pessoa:
            return {
                "meta_ativacoes": 0,
                "meta_leads": 0,
                "meta_reunioes": 0,
                "meta_vendas": 0,
                "meta_faturamento": 0
            }

        meta = db.query(Meta).filter(
            Meta.pessoa_id == pessoa.id,
            Meta.mes == mes,
            Meta.ano == ano
        ).first()

        if not meta:
            # Se não tem meta cadastrada no mês, retorna zeros
            # Metas devem ser criadas explicitamente via endpoint /metas/pessoa/{pessoa_id}
            return {
                "meta_ativacoes": 0,
                "meta_leads": 0,
                "meta_reunioes_agendadas": 0,
                "meta_reunioes": 0,
                "meta_vendas": 0,
                "meta_faturamento": 0
            }

        return {
            "meta_ativacoes": meta.meta_ativacoes or 0,
            "meta_leads": meta.meta_leads or 0,
            "meta_reunioes_agendadas": meta.meta_reunioes_agendadas or 0,
            "meta_reunioes": meta.meta_reunioes or 0,
            "meta_vendas": meta.meta_vendas or 0,
            "meta_faturamento": meta.meta_faturamento or 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar meta: {str(e)}")


# ==================== CRUD METAS PESSOAS ====================

@router.get("/")
@router.get("")  # Aceita ambas versões (com/sem trailing slash)
async def listar_metas(
    mes: Optional[int] = None,
    ano: Optional[int] = None,
    pessoa_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Lista todas as metas com filtros opcionais"""
    try:
        query = db.query(Meta)

        if mes:
            query = query.filter(Meta.mes == mes)
        if ano:
            query = query.filter(Meta.ano == ano)
        if pessoa_id:
            query = query.filter(Meta.pessoa_id == pessoa_id)

        metas = query.order_by(Meta.ano, Meta.mes, Meta.pessoa_id).all()

        resultado = []
        for m in metas:
            pessoa = None
            if m.pessoa_id:
                pessoa = db.query(Pessoa).filter(Pessoa.id == m.pessoa_id).first()

            resultado.append({
                "id": m.id,
                "mes": m.mes,
                "ano": m.ano,
                "tipo": m.tipo,
                "pessoa_id": m.pessoa_id,
                "pessoa": {
                    "id": pessoa.id,
                    "nome": pessoa.nome,
                    "funcao": pessoa.funcao
                } if pessoa else None,
                "meta_ativacoes": m.meta_ativacoes,
                "meta_leads": m.meta_leads,
                "meta_reunioes_agendadas": m.meta_reunioes_agendadas,
                "meta_reunioes": m.meta_reunioes,
                "meta_vendas": m.meta_vendas,
                "meta_faturamento": m.meta_faturamento,
                "realizado_ativacoes": m.realizado_ativacoes,
                "realizado_leads": m.realizado_leads,
                "realizado_reunioes_agendadas": m.realizado_reunioes_agendadas,
                "realizado_reunioes": m.realizado_reunioes,
                "realizado_vendas": m.realizado_vendas,
                "realizado_faturamento": m.realizado_faturamento,
                "delta_ativacoes": m.delta_ativacoes,
                "delta_leads": m.delta_leads,
                "delta_reunioes_agendadas": m.delta_reunioes_agendadas,
                "delta_reunioes": m.delta_reunioes,
                "delta_vendas": m.delta_vendas,
                "delta_faturamento": m.delta_faturamento,
                "perc_atingimento": m.perc_atingimento
            })

        return {
            "total": len(resultado),
            "metas": resultado
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar metas: {str(e)}")


@router.post("/")
@router.post("")  # Aceita ambas versões (com/sem trailing slash)
async def criar_meta(item: MetaCreate, db: Session = Depends(get_db)):
    """Cria uma nova meta"""
    try:
        # Verificar se ja existe meta para esta pessoa/mes/ano
        existente = db.query(Meta).filter(
            Meta.mes == item.mes,
            Meta.ano == item.ano,
            Meta.pessoa_id == item.pessoa_id
        ).first()

        if existente:
            raise HTTPException(
                status_code=400,
                detail="Ja existe uma meta para esta pessoa neste mes/ano"
            )

        nova = Meta(**item.dict())
        db.add(nova)
        db.commit()
        db.refresh(nova)

        return {
            "id": nova.id,
            "message": "Meta criada com sucesso"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar meta: {str(e)}")


@router.put("/calcular-realizado")
async def calcular_realizado(
    mes: int,
    ano: int,
    db: Session = Depends(get_db)
):
    """
    Calcula automaticamente o realizado vs meta para um mes/ano.
    Atualiza as metas com os valores realizados e deltas.
    """
    try:
        metas = db.query(Meta).filter(
            Meta.mes == mes,
            Meta.ano == ano,
            Meta.tipo == "individual"
        ).all()

        if not metas:
            raise HTTPException(
                status_code=404,
                detail=f"Nenhuma meta encontrada para {mes}/{ano}"
            )

        atualizadas = 0

        for meta in metas:
            if not meta.pessoa_id:
                continue

            pessoa = db.query(Pessoa).filter(Pessoa.id == meta.pessoa_id).first()
            if not pessoa:
                continue

            funcao_lower = pessoa.funcao.lower() if pessoa.funcao else ""

            if funcao_lower == "social selling" or funcao_lower == "social_selling":
                # Buscar metricas de SS
                ss = db.query(SocialSellingMetrica).filter(
                    SocialSellingMetrica.mes == mes,
                    SocialSellingMetrica.ano == ano,
                    SocialSellingMetrica.vendedor == pessoa.nome
                ).all()

                meta.realizado_ativacoes = sum(s.ativacoes or 0 for s in ss)
                meta.realizado_leads = sum(s.leads_gerados or 0 for s in ss)
                meta.delta_ativacoes = meta.realizado_ativacoes - (meta.meta_ativacoes or 0)
                meta.delta_leads = meta.realizado_leads - (meta.meta_leads or 0)

                # Calcular % atingimento (baseado em leads para SS)
                if meta.meta_leads and meta.meta_leads > 0:
                    meta.perc_atingimento = (meta.realizado_leads / meta.meta_leads) * 100
                elif meta.meta_ativacoes and meta.meta_ativacoes > 0:
                    meta.perc_atingimento = (meta.realizado_ativacoes / meta.meta_ativacoes) * 100

            elif funcao_lower == "sdr":
                # Buscar metricas de SDR
                sdr = db.query(SDRMetrica).filter(
                    SDRMetrica.mes == mes,
                    SDRMetrica.ano == ano,
                    SDRMetrica.sdr == pessoa.nome
                ).all()

                # Calcular realizados
                meta.realizado_reunioes_agendadas = sum(s.reunioes_agendadas or 0 for s in sdr)
                meta.realizado_reunioes = sum(s.reunioes_realizadas or 0 for s in sdr)

                # Calcular deltas
                meta.delta_reunioes_agendadas = meta.realizado_reunioes_agendadas - (meta.meta_reunioes_agendadas or 0)
                meta.delta_reunioes = meta.realizado_reunioes - (meta.meta_reunioes or 0)

                # Calcular % atingimento (priorizar realizadas, mas usar agendadas se não tiver meta de realizadas)
                if meta.meta_reunioes and meta.meta_reunioes > 0:
                    meta.perc_atingimento = (meta.realizado_reunioes / meta.meta_reunioes) * 100
                elif meta.meta_reunioes_agendadas and meta.meta_reunioes_agendadas > 0:
                    meta.perc_atingimento = (meta.realizado_reunioes_agendadas / meta.meta_reunioes_agendadas) * 100

            elif funcao_lower == "closer":
                # Buscar vendas (não closer_metricas, pois tem dados mais completos)
                from app.models.models import Venda

                vendas = db.query(Venda).filter(
                    Venda.mes == mes,
                    Venda.ano == ano,
                    Venda.closer == pessoa.nome
                ).all()

                meta.realizado_vendas = len(vendas)
                meta.realizado_faturamento = sum(v.valor_bruto or 0 for v in vendas)
                meta.delta_vendas = meta.realizado_vendas - (meta.meta_vendas or 0)
                meta.delta_faturamento = meta.realizado_faturamento - (meta.meta_faturamento or 0)

                # Calcular % atingimento (baseado em faturamento para closer)
                if meta.meta_faturamento and meta.meta_faturamento > 0:
                    meta.perc_atingimento = (meta.realizado_faturamento / meta.meta_faturamento) * 100
                elif meta.meta_vendas and meta.meta_vendas > 0:
                    meta.perc_atingimento = (meta.realizado_vendas / meta.meta_vendas) * 100

            atualizadas += 1

        db.commit()

        return {
            "message": f"Realizado calculado para {mes}/{ano}",
            "metas_atualizadas": atualizadas
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao calcular realizado: {str(e)}")


@router.put("/{id}")
async def atualizar_meta(id: int, item: MetaUpdate, db: Session = Depends(get_db)):
    """Atualiza uma meta existente"""
    try:
        meta = db.query(Meta).filter(Meta.id == id).first()
        if not meta:
            raise HTTPException(status_code=404, detail="Meta nao encontrada")

        update_data = item.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(meta, key, value)

        db.commit()
        db.refresh(meta)

        return {"message": "Meta atualizada com sucesso"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar meta: {str(e)}")


@router.delete("/{id}")
async def deletar_meta(id: int, db: Session = Depends(get_db)):
    """Deleta uma meta"""
    try:
        meta = db.query(Meta).filter(Meta.id == id).first()
        if not meta:
            raise HTTPException(status_code=404, detail="Meta nao encontrada")

        db.delete(meta)
        db.commit()

        return {"message": "Meta deletada com sucesso"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar meta: {str(e)}")


# ==================== REPLICACAO DE METAS ====================

@router.post("/replicar-mes")
async def replicar_metas_mes(
    mes_destino: int,
    ano_destino: int,
    mes_origem: Optional[int] = None,
    ano_origem: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Replica metas do mes anterior (ou mes especificado) para o mes destino.
    Se nao especificar origem, usa o mes anterior ao destino.
    """
    try:
        # Calcular mes origem se nao especificado
        if mes_origem is None or ano_origem is None:
            if mes_destino > 1:
                mes_origem = mes_destino - 1
                ano_origem = ano_destino
            else:
                mes_origem = 12
                ano_origem = ano_destino - 1

        # Buscar metas do mes origem
        metas_anteriores = db.query(Meta).filter(
            Meta.mes == mes_origem,
            Meta.ano == ano_origem,
            Meta.tipo == "pessoa"
        ).all()

        if not metas_anteriores:
            # Se nao tem metas, criar com base nas pessoas cadastradas
            pessoas = db.query(Pessoa).filter(Pessoa.ativo == True).all()

            if not pessoas:
                raise HTTPException(
                    status_code=400,
                    detail="Nenhuma pessoa cadastrada para criar metas"
                )

            criadas = 0
            for pessoa in pessoas:
                # Verificar se ja existe
                existente = db.query(Meta).filter(
                    Meta.mes == mes_destino,
                    Meta.ano == ano_destino,
                    Meta.pessoa_id == pessoa.id
                ).first()

                if not existente:
                    # Criar nova meta zerada ou copiando do mês anterior
                    meta_anterior = db.query(Meta).filter(
                        Meta.pessoa_id == pessoa.id,
                        Meta.mes == (mes_destino - 1) if mes_destino > 1 else 12,
                        Meta.ano == ano_destino if mes_destino > 1 else ano_destino - 1
                    ).first()

                    nova = Meta(
                        mes=mes_destino,
                        ano=ano_destino,
                        tipo="pessoa",
                        pessoa_id=pessoa.id,
                        meta_ativacoes=meta_anterior.meta_ativacoes if meta_anterior else 0,
                        meta_leads=meta_anterior.meta_leads if meta_anterior else 0,
                        meta_reunioes=meta_anterior.meta_reunioes if meta_anterior else 0,
                        meta_vendas=meta_anterior.meta_vendas if meta_anterior else 0,
                        meta_faturamento=meta_anterior.meta_faturamento if meta_anterior else 0
                    )
                    db.add(nova)
                    criadas += 1

            db.commit()
            return {
                "message": f"Metas criadas com base no cadastro de pessoas",
                "metas_criadas": criadas,
                "origem": "cadastro_pessoas"
            }

        # Replicar metas existentes
        criadas = 0
        for meta_ant in metas_anteriores:
            # Verificar se ja existe
            existente = db.query(Meta).filter(
                Meta.mes == mes_destino,
                Meta.ano == ano_destino,
                Meta.pessoa_id == meta_ant.pessoa_id
            ).first()

            if not existente:
                # Copia valores do mês anterior
                nova = Meta(
                    mes=mes_destino,
                    ano=ano_destino,
                    tipo=meta_ant.tipo,
                    pessoa_id=meta_ant.pessoa_id,
                    meta_ativacoes=meta_ant.meta_ativacoes or 0,
                    meta_leads=meta_ant.meta_leads or 0,
                    meta_reunioes=meta_ant.meta_reunioes or 0,
                    meta_vendas=meta_ant.meta_vendas or 0,
                    meta_faturamento=meta_ant.meta_faturamento or 0
                )
                db.add(nova)
                criadas += 1

        db.commit()

        return {
            "message": f"Metas replicadas para {mes_destino}/{ano_destino}",
            "metas_criadas": criadas,
            "origem": f"{mes_origem}/{ano_origem}"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao replicar metas: {str(e)}")

# ==================== HISTORICO ====================

@router.get("/historico/{pessoa_id}")
async def historico_pessoa(
    pessoa_id: int,
    db: Session = Depends(get_db)
):
    """Retorna historico de metas vs realizado de uma pessoa"""
    try:
        pessoa = db.query(Pessoa).filter(Pessoa.id == pessoa_id).first()
        if not pessoa:
            raise HTTPException(status_code=404, detail="Pessoa nao encontrada")

        metas = db.query(Meta).filter(
            Meta.pessoa_id == pessoa_id
        ).order_by(Meta.ano, Meta.mes).all()

        historico = []
        for m in metas:
            historico.append({
                "mes": m.mes,
                "ano": m.ano,
                "mes_nome": _get_mes_nome(m.mes),
                "meta_ativacoes": m.meta_ativacoes,
                "meta_leads": m.meta_leads,
                "meta_reunioes_agendadas": m.meta_reunioes_agendadas,
                "meta_reunioes": m.meta_reunioes,
                "meta_vendas": m.meta_vendas,
                "meta_faturamento": m.meta_faturamento,
                "realizado_ativacoes": m.realizado_ativacoes,
                "realizado_leads": m.realizado_leads,
                "realizado_reunioes_agendadas": m.realizado_reunioes_agendadas,
                "realizado_reunioes": m.realizado_reunioes,
                "realizado_vendas": m.realizado_vendas,
                "realizado_faturamento": m.realizado_faturamento,
                "delta_ativacoes": m.delta_ativacoes,
                "delta_leads": m.delta_leads,
                "delta_reunioes_agendadas": m.delta_reunioes_agendadas,
                "delta_reunioes": m.delta_reunioes,
                "delta_vendas": m.delta_vendas,
                "delta_faturamento": m.delta_faturamento,
                "perc_atingimento": m.perc_atingimento
            })

        return {
            "pessoa": {
                "id": pessoa.id,
                "nome": pessoa.nome,
                "funcao": pessoa.funcao
            },
            "historico": historico,
            "total_meses": len(historico)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar historico: {str(e)}")


# ==================== META EMPRESA ====================

@router.get("/empresa/{ano}")
async def get_meta_empresa(ano: int, db: Session = Depends(get_db)):
    """Retorna a meta anual da empresa"""
    try:
        meta = db.query(MetaEmpresa).filter(MetaEmpresa.ano == ano).first()

        if not meta:
            # Criar meta padrao se nao existir
            meta = MetaEmpresa(
                ano=ano,
                meta_faturamento_anual=5000000.0,
                meta_caixa_anual=1000000.0
            )
            db.add(meta)
            db.commit()
            db.refresh(meta)

        return {
            "id": meta.id,
            "ano": meta.ano,
            "meta_faturamento_anual": meta.meta_faturamento_anual,
            "meta_caixa_anual": meta.meta_caixa_anual,
            "faturamento_acumulado": meta.faturamento_acumulado,
            "caixa_atual": meta.caixa_atual,
            "perc_faturamento": ((meta.faturamento_acumulado or 0) / meta.meta_faturamento_anual * 100) if meta.meta_faturamento_anual > 0 else 0,
            "perc_caixa": ((meta.caixa_atual or 0) / meta.meta_caixa_anual * 100) if meta.meta_caixa_anual > 0 else 0
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar meta empresa: {str(e)}")


@router.put("/empresa/{ano}")
async def atualizar_meta_empresa(
    ano: int,
    item: MetaEmpresaCreate,
    db: Session = Depends(get_db)
):
    """Atualiza ou cria a meta anual da empresa"""
    try:
        meta = db.query(MetaEmpresa).filter(MetaEmpresa.ano == ano).first()

        if meta:
            meta.meta_faturamento_anual = item.meta_faturamento_anual
            meta.meta_caixa_anual = item.meta_caixa_anual
        else:
            meta = MetaEmpresa(
                ano=ano,
                meta_faturamento_anual=item.meta_faturamento_anual,
                meta_caixa_anual=item.meta_caixa_anual
            )
            db.add(meta)

        db.commit()
        db.refresh(meta)

        return {"message": f"Meta da empresa para {ano} atualizada com sucesso"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar meta empresa: {str(e)}")


@router.put("/empresa/{ano}/calcular-acumulado")
async def calcular_acumulado_empresa(ano: int, db: Session = Depends(get_db)):
    """Calcula o faturamento acumulado e caixa atual da empresa"""
    try:
        from app.models.models import Financeiro, Venda

        # Calcular faturamento acumulado (soma de todas as entradas do ano)
        faturamento = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.ano == ano,
            Financeiro.tipo == "entrada",
            Financeiro.previsto_realizado == "realizado"
        ).scalar() or 0

        # Calcular caixa atual (entradas - saidas do ano)
        entradas = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.ano == ano,
            Financeiro.tipo == "entrada",
            Financeiro.previsto_realizado == "realizado"
        ).scalar() or 0

        saidas = db.query(func.sum(Financeiro.valor)).filter(
            Financeiro.ano == ano,
            Financeiro.tipo == "saida",
            Financeiro.previsto_realizado == "realizado"
        ).scalar() or 0

        caixa = entradas - saidas

        # Atualizar meta empresa
        meta = db.query(MetaEmpresa).filter(MetaEmpresa.ano == ano).first()

        if not meta:
            meta = MetaEmpresa(
                ano=ano,
                meta_faturamento_anual=5000000.0,
                meta_caixa_anual=1000000.0
            )
            db.add(meta)

        meta.faturamento_acumulado = faturamento
        meta.caixa_atual = caixa

        db.commit()

        return {
            "message": f"Acumulado calculado para {ano}",
            "faturamento_acumulado": faturamento,
            "caixa_atual": caixa,
            "perc_faturamento": (faturamento / meta.meta_faturamento_anual * 100) if meta.meta_faturamento_anual > 0 else 0,
            "perc_caixa": (caixa / meta.meta_caixa_anual * 100) if meta.meta_caixa_anual > 0 else 0
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao calcular acumulado: {str(e)}")


def _get_mes_nome(mes: int) -> str:
    """Retorna o nome do mes"""
    nomes = {
        1: "Janeiro", 2: "Fevereiro", 3: "Marco", 4: "Abril",
        5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
        9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
    }
    return nomes.get(mes, "")
