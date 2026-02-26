"""
FastAPI router for CRUD operations on Financeiro and Vendas.
Allows manual data entry, editing, and deletion through the interface.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Financeiro, Venda
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter(prefix="/crud", tags=["CRUD"])

# ==================== PYDANTIC SCHEMAS ====================

class FinanceiroCreate(BaseModel):
    tipo: str  # entrada ou saida
    categoria: str
    descricao: Optional[str] = None
    valor: float
    data: date
    mes: int
    ano: int
    previsto_realizado: str  # previsto ou realizado

class FinanceiroUpdate(BaseModel):
    tipo: Optional[str] = None
    categoria: Optional[str] = None
    descricao: Optional[str] = None
    valor: Optional[float] = None
    data: Optional[date] = None
    previsto_realizado: Optional[str] = None

class VendaCreate(BaseModel):
    data: date
    cliente: str
    valor: float
    funil: Optional[str] = None
    vendedor: Optional[str] = None
    mes: int
    ano: int
    # Novos campos FASE 2
    closer: Optional[str] = None
    tipo_receita: Optional[str] = None  # Recorrência, Venda, Renovação
    produto: Optional[str] = None
    booking: Optional[float] = None
    previsto: Optional[float] = None
    valor_pago: Optional[float] = None
    valor_liquido: Optional[float] = None

class VendaUpdate(BaseModel):
    data: Optional[date] = None
    cliente: Optional[str] = None
    valor: Optional[float] = None
    funil: Optional[str] = None
    vendedor: Optional[str] = None
    # Novos campos FASE 2
    closer: Optional[str] = None
    tipo_receita: Optional[str] = None
    produto: Optional[str] = None
    booking: Optional[float] = None
    previsto: Optional[float] = None
    valor_pago: Optional[float] = None
    valor_liquido: Optional[float] = None

# ==================== FINANCEIRO CRUD ====================

@router.post("/financeiro")
async def create_financeiro(item: FinanceiroCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova transação financeira (entrada ou saída).
    """
    try:
        novo = Financeiro(**item.dict())
        db.add(novo)
        db.commit()
        db.refresh(novo)
        return {
            "id": novo.id,
            "message": "Transação criada com sucesso",
            "data": {
                "id": novo.id,
                "tipo": novo.tipo,
                "categoria": novo.categoria,
                "valor": novo.valor,
                "data": str(novo.data)
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar transação: {str(e)}")


@router.put("/financeiro/{id}")
async def update_financeiro(id: int, item: FinanceiroUpdate, db: Session = Depends(get_db)):
    """
    Atualiza uma transação financeira existente.
    """
    try:
        registro = db.query(Financeiro).filter(Financeiro.id == id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="Registro não encontrado")

        # Atualizar apenas os campos fornecidos
        update_data = item.dict(exclude_unset=True)

        # Se a data foi atualizada, atualizar mes e ano também
        if 'data' in update_data and update_data['data']:
            update_data['mes'] = update_data['data'].month
            update_data['ano'] = update_data['data'].year

        for key, value in update_data.items():
            setattr(registro, key, value)

        db.commit()
        db.refresh(registro)
        return {
            "message": "Transação atualizada com sucesso",
            "data": {
                "id": registro.id,
                "tipo": registro.tipo,
                "categoria": registro.categoria,
                "valor": registro.valor,
                "data": str(registro.data)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar transação: {str(e)}")


@router.delete("/financeiro/{id}")
async def delete_financeiro(id: int, db: Session = Depends(get_db)):
    """
    Deleta uma transação financeira.
    """
    try:
        registro = db.query(Financeiro).filter(Financeiro.id == id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="Registro não encontrado")

        # Armazenar info antes de deletar
        info = {
            "id": registro.id,
            "tipo": registro.tipo,
            "categoria": registro.categoria,
            "valor": registro.valor
        }

        db.delete(registro)
        db.commit()
        return {
            "message": "Transação deletada com sucesso",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar transação: {str(e)}")


# ==================== VENDA CRUD ====================

@router.post("/venda")
async def create_venda(item: VendaCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova venda.
    """
    try:
        nova = Venda(**item.dict())
        db.add(nova)
        db.commit()
        db.refresh(nova)
        return {
            "id": nova.id,
            "message": "Venda criada com sucesso",
            "data": {
                "id": nova.id,
                "cliente": nova.cliente,
                "valor": nova.valor,
                "data": str(nova.data),
                "funil": nova.funil,
                "vendedor": nova.vendedor,
                "closer": nova.closer,
                "tipo_receita": nova.tipo_receita,
                "produto": nova.produto
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar venda: {str(e)}")


@router.put("/venda/{id}")
async def update_venda(id: int, item: VendaUpdate, db: Session = Depends(get_db)):
    """
    Atualiza uma venda existente.
    """
    try:
        venda = db.query(Venda).filter(Venda.id == id).first()
        if not venda:
            raise HTTPException(status_code=404, detail="Venda não encontrada")

        # Atualizar apenas os campos fornecidos
        update_data = item.dict(exclude_unset=True)

        # Se a data foi atualizada, atualizar mes e ano também
        if 'data' in update_data and update_data['data']:
            update_data['mes'] = update_data['data'].month
            update_data['ano'] = update_data['data'].year

        for key, value in update_data.items():
            setattr(venda, key, value)

        db.commit()
        db.refresh(venda)
        return {
            "message": "Venda atualizada com sucesso",
            "data": {
                "id": venda.id,
                "cliente": venda.cliente,
                "valor": venda.valor,
                "data": str(venda.data),
                "funil": venda.funil,
                "vendedor": venda.vendedor,
                "closer": venda.closer,
                "tipo_receita": venda.tipo_receita,
                "produto": venda.produto
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar venda: {str(e)}")


@router.delete("/venda/{id}")
async def delete_venda(id: int, db: Session = Depends(get_db)):
    """
    Deleta uma venda.
    """
    try:
        venda = db.query(Venda).filter(Venda.id == id).first()
        if not venda:
            raise HTTPException(status_code=404, detail="Venda não encontrada")

        # Armazenar info antes de deletar
        info = {
            "id": venda.id,
            "cliente": venda.cliente,
            "valor": venda.valor
        }

        db.delete(venda)
        db.commit()
        return {
            "message": "Venda deletada com sucesso",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar venda: {str(e)}")
