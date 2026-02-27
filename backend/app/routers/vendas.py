from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Venda, Financeiro
from pydantic import BaseModel
from typing import Optional
from datetime import date

router = APIRouter(prefix="/vendas", tags=["Vendas"])

# Schemas
class VendaCreate(BaseModel):
    data: date
    cliente: Optional[str] = None
    closer: Optional[str] = None
    funil: Optional[str] = None
    tipo_receita: Optional[str] = None
    produto: Optional[str] = None
    booking: Optional[float] = 0.0
    previsto: Optional[float] = 0.0
    valor_bruto: Optional[float] = 0.0
    valor_liquido: Optional[float] = 0.0

class VendaUpdate(BaseModel):
    data: Optional[date] = None
    cliente: Optional[str] = None
    closer: Optional[str] = None
    funil: Optional[str] = None
    tipo_receita: Optional[str] = None
    produto: Optional[str] = None
    booking: Optional[float] = None
    previsto: Optional[float] = None
    valor_bruto: Optional[float] = None
    valor_liquido: Optional[float] = None


# ============ CRUD ENDPOINTS ============

@router.post("")
async def create_venda(item: VendaCreate, db: Session = Depends(get_db)):
    """Cria uma nova venda e registra automaticamente no Financeiro"""
    try:
        # Extrair mes e ano da data
        mes = item.data.month
        ano = item.data.year

        nova_venda = Venda(
            data=item.data,
            mes=mes,
            ano=ano,
            cliente=item.cliente,
            closer=item.closer,
            funil=item.funil,
            tipo_receita=item.tipo_receita,
            produto=item.produto,
            booking=item.booking or 0.0,
            previsto=item.previsto or 0.0,
            valor_bruto=item.valor_bruto or item.booking or item.previsto or 0.0,
            valor_liquido=item.valor_liquido or 0.0
        )

        db.add(nova_venda)
        db.commit()
        db.refresh(nova_venda)

        # 🔄 INTEGRAÇÃO: Criar entrada automática no Financeiro
        entrada_financeiro = Financeiro(
            tipo='entrada',
            produto=nova_venda.produto,
            valor=nova_venda.valor_liquido or nova_venda.valor_bruto,
            data=nova_venda.data,
            mes=mes,
            ano=ano,
            descricao=f"VENDA-{nova_venda.id} - {nova_venda.cliente or 'Cliente'}",
            previsto_realizado='realizado'
        )

        db.add(entrada_financeiro)
        db.commit()

        return {
            "id": nova_venda.id,
            "message": "Venda criada com sucesso e registrada no Financeiro",
            "data": {
                "id": nova_venda.id,
                "cliente": nova_venda.cliente,
                "valor_liquido": nova_venda.valor_liquido,
                "financeiro_id": entrada_financeiro.id
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar venda: {str(e)}")


@router.get("")
async def list_vendas(
    mes: Optional[int] = Query(None, ge=1, le=12),
    ano: Optional[int] = Query(None, ge=2020),
    closer: Optional[str] = Query(None),
    funil: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Lista vendas com filtros opcionais"""
    try:
        query = db.query(Venda)

        if mes:
            query = query.filter(Venda.mes == mes)
        if ano:
            query = query.filter(Venda.ano == ano)
        if closer:
            query = query.filter(Venda.closer == closer)
        if funil:
            query = query.filter(Venda.funil == funil)

        vendas = query.order_by(Venda.data.desc()).all()

        return [{
            "id": v.id,
            "data": v.data.isoformat() if v.data else None,
            "cliente": v.cliente,
            "closer": v.closer,
            "funil": v.funil,
            "tipo_receita": v.tipo_receita,
            "produto": v.produto,
            "booking": v.booking or 0.0,
            "previsto": v.previsto or 0.0,
            "valor_bruto": v.valor_bruto or 0.0,
            "valor_liquido": v.valor_liquido or 0.0,
            "mes": v.mes,
            "ano": v.ano
        } for v in vendas]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar vendas: {str(e)}")


@router.get("/{id}")
async def get_venda(id: int, db: Session = Depends(get_db)):
    """Busca uma venda por ID"""
    venda = db.query(Venda).filter(Venda.id == id).first()
    if not venda:
        raise HTTPException(status_code=404, detail="Venda não encontrada")

    return {
        "id": venda.id,
        "data": venda.data.isoformat() if venda.data else None,
        "cliente": venda.cliente,
        "closer": venda.closer,
        "funil": venda.funil,
        "tipo_receita": venda.tipo_receita,
        "produto": venda.produto,
        "booking": venda.booking or 0.0,
        "previsto": venda.previsto or 0.0,
        "valor_bruto": venda.valor_bruto or 0.0,
        "valor_liquido": venda.valor_liquido or 0.0,
        "mes": venda.mes,
        "ano": venda.ano
    }


@router.put("/{id}")
async def update_venda(id: int, item: VendaUpdate, db: Session = Depends(get_db)):
    """Atualiza uma venda existente e sincroniza com o Financeiro"""
    try:
        venda = db.query(Venda).filter(Venda.id == id).first()
        if not venda:
            raise HTTPException(status_code=404, detail="Venda não encontrada")

        # Atualizar campos fornecidos
        if item.data is not None:
            venda.data = item.data
            venda.mes = item.data.month
            venda.ano = item.data.year
        if item.cliente is not None:
            venda.cliente = item.cliente
        if item.closer is not None:
            venda.closer = item.closer
        if item.funil is not None:
            venda.funil = item.funil
        if item.tipo_receita is not None:
            venda.tipo_receita = item.tipo_receita
        if item.produto is not None:
            venda.produto = item.produto
        if item.booking is not None:
            venda.booking = item.booking
        if item.previsto is not None:
            venda.previsto = item.previsto
        if item.valor_bruto is not None:
            venda.valor_bruto = item.valor_bruto
        if item.valor_liquido is not None:
            venda.valor_liquido = item.valor_liquido

        # Recalcular valor_bruto apenas se não foi fornecido explicitamente
        if item.valor_bruto is None:
            venda.valor_bruto = venda.booking or venda.previsto or 0.0

        db.commit()
        db.refresh(venda)

        # 🔄 INTEGRAÇÃO: Atualizar entrada correspondente no Financeiro
        entrada_financeiro = db.query(Financeiro).filter(
            Financeiro.descricao.like(f"VENDA-{venda.id} - %")
        ).first()

        if entrada_financeiro:
            # Atualizar entrada existente
            entrada_financeiro.produto = venda.produto
            entrada_financeiro.valor = venda.valor_liquido or venda.valor_bruto
            entrada_financeiro.data = venda.data
            entrada_financeiro.mes = venda.mes
            entrada_financeiro.ano = venda.ano
            entrada_financeiro.descricao = f"VENDA-{venda.id} - {venda.cliente or 'Cliente'}"
            db.commit()

        return {
            "message": "Venda atualizada com sucesso e sincronizada com o Financeiro",
            "data": {
                "id": venda.id,
                "cliente": venda.cliente,
                "valor_liquido": venda.valor_liquido
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar venda: {str(e)}")


@router.delete("/{id}")
async def delete_venda(id: int, db: Session = Depends(get_db)):
    """Deleta uma venda e remove do Financeiro"""
    try:
        venda = db.query(Venda).filter(Venda.id == id).first()
        if not venda:
            raise HTTPException(status_code=404, detail="Venda não encontrada")

        info = {
            "id": venda.id,
            "cliente": venda.cliente,
            "valor_liquido": venda.valor_liquido
        }

        # 🔄 INTEGRAÇÃO: Deletar entrada correspondente no Financeiro
        entrada_financeiro = db.query(Financeiro).filter(
            Financeiro.descricao.like(f"VENDA-{venda.id} - %")
        ).first()

        if entrada_financeiro:
            db.delete(entrada_financeiro)

        db.delete(venda)
        db.commit()

        return {
            "message": "Venda deletada com sucesso e removida do Financeiro",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar venda: {str(e)}")
