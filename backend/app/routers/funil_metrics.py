"""
FastAPI router for Funil Metrics (Quiz SE e Venda Direta).
Handles metrics tracking and automatic KPI calculations.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import QuizMetrics, VendaDiretaMetrics
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date, datetime

router = APIRouter(prefix="/funil", tags=["Funil Metrics"])

# ============ PYDANTIC SCHEMAS ============

class QuizMetricsCreate(BaseModel):
    data: date
    campanha_nome: str
    campanha_id: Optional[str] = None
    verba: float
    impressoes: int
    cliques: int
    pageviews: int = 0
    quiz_inicio: int = 0
    quiz_end: int = 0
    leads: int = 0

    @field_validator('data', mode='before')
    @classmethod
    def parse_date(cls, value):
        if isinstance(value, str):
            return datetime.strptime(value, '%Y-%m-%d').date()
        return value

class QuizMetricsUpdate(BaseModel):
    data: Optional[date] = None
    campanha_nome: Optional[str] = None
    campanha_id: Optional[str] = None
    verba: Optional[float] = None
    impressoes: Optional[int] = None
    cliques: Optional[int] = None
    pageviews: Optional[int] = None
    quiz_inicio: Optional[int] = None
    quiz_end: Optional[int] = None
    leads: Optional[int] = None

    @field_validator('data', mode='before')
    @classmethod
    def parse_date(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            return datetime.strptime(value, '%Y-%m-%d').date()
        return value

class VendaDiretaMetricsCreate(BaseModel):
    data: date
    campanha_nome: str
    campanha_id: Optional[str] = None
    verba: float
    impressoes: int
    cliques: int
    pageviews: int = 0
    leads: int = 0
    checkout_inicio: int = 0
    vendas: int = 0
    receita: float = 0

    @field_validator('data', mode='before')
    @classmethod
    def parse_date(cls, value):
        if isinstance(value, str):
            return datetime.strptime(value, '%Y-%m-%d').date()
        return value

class VendaDiretaMetricsUpdate(BaseModel):
    data: Optional[date] = None
    campanha_nome: Optional[str] = None
    campanha_id: Optional[str] = None
    verba: Optional[float] = None
    impressoes: Optional[int] = None
    cliques: Optional[int] = None
    pageviews: Optional[int] = None
    leads: Optional[int] = None
    checkout_inicio: Optional[int] = None
    vendas: Optional[int] = None
    receita: Optional[float] = None

    @field_validator('data', mode='before')
    @classmethod
    def parse_date(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            return datetime.strptime(value, '%Y-%m-%d').date()
        return value

# ============ HELPER FUNCTIONS ============

def calculate_quiz_kpis(metric):
    """Calcula KPIs automaticamente para Quiz SE"""
    kpis = {
        "id": metric.id,
        "data": metric.data.isoformat() if metric.data else None,
        "campanha_nome": metric.campanha_nome,
        "campanha_id": metric.campanha_id,
        # Métricas brutas
        "verba": metric.verba,
        "impressoes": metric.impressoes,
        "cliques": metric.cliques,
        "pageviews": metric.pageviews,
        "quiz_inicio": metric.quiz_inicio,
        "quiz_end": metric.quiz_end,
        "leads": metric.leads,
    }

    # Cálculos
    kpis["hook_rate"] = (metric.cliques / metric.impressoes * 100) if metric.impressoes > 0 else 0
    kpis["body_rate"] = (metric.pageviews / metric.cliques * 100) if metric.cliques > 0 else 0
    kpis["ctr"] = (metric.cliques / metric.impressoes * 100) if metric.impressoes > 0 else 0
    kpis["cpc"] = (metric.verba / metric.cliques) if metric.cliques > 0 else 0
    kpis["taxa_conclusao_quiz"] = (metric.quiz_end / metric.quiz_inicio * 100) if metric.quiz_inicio > 0 else 0
    kpis["taxa_conversao"] = (metric.leads / metric.pageviews * 100) if metric.pageviews > 0 else 0
    kpis["cpl"] = (metric.verba / metric.leads) if metric.leads > 0 else 0

    return kpis

def calculate_venda_direta_kpis(metric):
    """Calcula KPIs automaticamente para Venda Direta"""
    kpis = {
        "id": metric.id,
        "data": metric.data.isoformat() if metric.data else None,
        "campanha_nome": metric.campanha_nome,
        "campanha_id": metric.campanha_id,
        # Métricas brutas
        "verba": metric.verba,
        "impressoes": metric.impressoes,
        "cliques": metric.cliques,
        "pageviews": metric.pageviews,
        "leads": metric.leads,
        "checkout_inicio": metric.checkout_inicio,
        "vendas": metric.vendas,
        "receita": metric.receita,
    }

    # Cálculos
    kpis["hook_rate"] = (metric.cliques / metric.impressoes * 100) if metric.impressoes > 0 else 0
    kpis["body_rate"] = (metric.pageviews / metric.cliques * 100) if metric.cliques > 0 else 0
    kpis["ctr"] = (metric.cliques / metric.impressoes * 100) if metric.impressoes > 0 else 0
    kpis["cpc"] = (metric.verba / metric.cliques) if metric.cliques > 0 else 0
    kpis["taxa_conversao"] = (metric.leads / metric.pageviews * 100) if metric.pageviews > 0 else 0
    kpis["cvr_checkout"] = (metric.vendas / metric.checkout_inicio * 100) if metric.checkout_inicio > 0 else 0
    kpis["cvr_geral_funil"] = (metric.vendas / metric.pageviews * 100) if metric.pageviews > 0 else 0
    kpis["aov"] = (metric.receita / metric.vendas) if metric.vendas > 0 else 0
    kpis["cpa"] = (metric.verba / metric.vendas) if metric.vendas > 0 else 0
    kpis["roas"] = (metric.receita / metric.verba) if metric.verba > 0 else 0

    return kpis

# ============ QUIZ SE ENDPOINTS ============

@router.post("/quiz")
async def create_quiz_metrics(item: QuizMetricsCreate, db: Session = Depends(get_db)):
    """Cria nova entrada de métricas Quiz SE"""
    try:
        metric = QuizMetrics(
            data=item.data,
            mes=item.data.month,
            ano=item.data.year,
            campanha_nome=item.campanha_nome,
            campanha_id=item.campanha_id,
            verba=item.verba,
            impressoes=item.impressoes,
            cliques=item.cliques,
            pageviews=item.pageviews,
            quiz_inicio=item.quiz_inicio,
            quiz_end=item.quiz_end,
            leads=item.leads
        )
        db.add(metric)
        db.commit()
        db.refresh(metric)
        return {"message": "Métricas criadas com sucesso", "data": calculate_quiz_kpis(metric)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar métricas: {str(e)}")

@router.get("/quiz")
async def list_quiz_metrics(
    mes: Optional[int] = Query(None, ge=1, le=12),
    ano: Optional[int] = Query(None, ge=2020),
    campanha: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Lista métricas Quiz SE com KPIs calculados"""
    try:
        query = db.query(QuizMetrics)
        if mes:
            query = query.filter(QuizMetrics.mes == mes)
        if ano:
            query = query.filter(QuizMetrics.ano == ano)
        if campanha:
            query = query.filter(QuizMetrics.campanha_nome.ilike(f"%{campanha}%"))

        metrics = query.order_by(QuizMetrics.data.desc()).all()
        return [calculate_quiz_kpis(m) for m in metrics]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar métricas: {str(e)}")

@router.get("/quiz/{id}")
async def get_quiz_metrics(id: int, db: Session = Depends(get_db)):
    """Busca métrica Quiz SE por ID"""
    metric = db.query(QuizMetrics).filter(QuizMetrics.id == id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Métrica não encontrada")
    return calculate_quiz_kpis(metric)

@router.put("/quiz/{id}")
async def update_quiz_metrics(id: int, item: QuizMetricsUpdate, db: Session = Depends(get_db)):
    """Atualiza métrica Quiz SE"""
    try:
        metric = db.query(QuizMetrics).filter(QuizMetrics.id == id).first()
        if not metric:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")

        if item.data:
            metric.data = item.data
            metric.mes = item.data.month
            metric.ano = item.data.year
        if item.campanha_nome:
            metric.campanha_nome = item.campanha_nome
        if item.campanha_id:
            metric.campanha_id = item.campanha_id
        if item.verba is not None:
            metric.verba = item.verba
        if item.impressoes is not None:
            metric.impressoes = item.impressoes
        if item.cliques is not None:
            metric.cliques = item.cliques
        if item.pageviews is not None:
            metric.pageviews = item.pageviews
        if item.quiz_inicio is not None:
            metric.quiz_inicio = item.quiz_inicio
        if item.quiz_end is not None:
            metric.quiz_end = item.quiz_end
        if item.leads is not None:
            metric.leads = item.leads

        db.commit()
        db.refresh(metric)
        return {"message": "Métrica atualizada com sucesso", "data": calculate_quiz_kpis(metric)}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar métrica: {str(e)}")

@router.delete("/quiz/{id}")
async def delete_quiz_metrics(id: int, db: Session = Depends(get_db)):
    """Deleta métrica Quiz SE"""
    try:
        metric = db.query(QuizMetrics).filter(QuizMetrics.id == id).first()
        if not metric:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")
        db.delete(metric)
        db.commit()
        return {"message": "Métrica deletada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar métrica: {str(e)}")

# ============ VENDA DIRETA ENDPOINTS ============

@router.post("/venda-direta")
async def create_venda_direta_metrics(item: VendaDiretaMetricsCreate, db: Session = Depends(get_db)):
    """Cria nova entrada de métricas Venda Direta"""
    try:
        metric = VendaDiretaMetrics(
            data=item.data,
            mes=item.data.month,
            ano=item.data.year,
            campanha_nome=item.campanha_nome,
            campanha_id=item.campanha_id,
            verba=item.verba,
            impressoes=item.impressoes,
            cliques=item.cliques,
            pageviews=item.pageviews,
            leads=item.leads,
            checkout_inicio=item.checkout_inicio,
            vendas=item.vendas,
            receita=item.receita
        )
        db.add(metric)
        db.commit()
        db.refresh(metric)
        return {"message": "Métricas criadas com sucesso", "data": calculate_venda_direta_kpis(metric)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar métricas: {str(e)}")

@router.get("/venda-direta")
async def list_venda_direta_metrics(
    mes: Optional[int] = Query(None, ge=1, le=12),
    ano: Optional[int] = Query(None, ge=2020),
    campanha: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Lista métricas Venda Direta com KPIs calculados"""
    try:
        query = db.query(VendaDiretaMetrics)
        if mes:
            query = query.filter(VendaDiretaMetrics.mes == mes)
        if ano:
            query = query.filter(VendaDiretaMetrics.ano == ano)
        if campanha:
            query = query.filter(VendaDiretaMetrics.campanha_nome.ilike(f"%{campanha}%"))

        metrics = query.order_by(VendaDiretaMetrics.data.desc()).all()
        return [calculate_venda_direta_kpis(m) for m in metrics]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar métricas: {str(e)}")

@router.get("/venda-direta/{id}")
async def get_venda_direta_metrics(id: int, db: Session = Depends(get_db)):
    """Busca métrica Venda Direta por ID"""
    metric = db.query(VendaDiretaMetrics).filter(VendaDiretaMetrics.id == id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Métrica não encontrada")
    return calculate_venda_direta_kpis(metric)

@router.put("/venda-direta/{id}")
async def update_venda_direta_metrics(id: int, item: VendaDiretaMetricsUpdate, db: Session = Depends(get_db)):
    """Atualiza métrica Venda Direta"""
    try:
        metric = db.query(VendaDiretaMetrics).filter(VendaDiretaMetrics.id == id).first()
        if not metric:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")

        if item.data:
            metric.data = item.data
            metric.mes = item.data.month
            metric.ano = item.data.year
        if item.campanha_nome:
            metric.campanha_nome = item.campanha_nome
        if item.campanha_id:
            metric.campanha_id = item.campanha_id
        if item.verba is not None:
            metric.verba = item.verba
        if item.impressoes is not None:
            metric.impressoes = item.impressoes
        if item.cliques is not None:
            metric.cliques = item.cliques
        if item.pageviews is not None:
            metric.pageviews = item.pageviews
        if item.leads is not None:
            metric.leads = item.leads
        if item.checkout_inicio is not None:
            metric.checkout_inicio = item.checkout_inicio
        if item.vendas is not None:
            metric.vendas = item.vendas
        if item.receita is not None:
            metric.receita = item.receita

        db.commit()
        db.refresh(metric)
        return {"message": "Métrica atualizada com sucesso", "data": calculate_venda_direta_kpis(metric)}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar métrica: {str(e)}")

@router.delete("/venda-direta/{id}")
async def delete_venda_direta_metrics(id: int, db: Session = Depends(get_db)):
    """Deleta métrica Venda Direta"""
    try:
        metric = db.query(VendaDiretaMetrics).filter(VendaDiretaMetrics.id == id).first()
        if not metric:
            raise HTTPException(status_code=404, detail="Métrica não encontrada")
        db.delete(metric)
        db.commit()
        return {"message": "Métrica deletada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar métrica: {str(e)}")
