"""
FastAPI router for Meta Marketing API integration.
Handles campaigns, ad sets, ads, and insights from Facebook/Instagram Ads.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import MetaAdsConfig
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.adsinsights import AdsInsights

router = APIRouter(prefix="/meta", tags=["Meta Ads"])

# ============ PYDANTIC SCHEMAS ============

class MetaConfigCreate(BaseModel):
    access_token: str
    ad_account_id: str  # Formato: act_XXXXX

class MetaConfigResponse(BaseModel):
    id: int
    ad_account_id: str
    ad_account_name: Optional[str]
    status: str
    last_sync: Optional[datetime]
    created_at: datetime

class CampaignResponse(BaseModel):
    id: str
    name: str
    status: str
    objective: Optional[str]
    daily_budget: Optional[float]
    lifetime_budget: Optional[float]
    start_time: Optional[str]
    stop_time: Optional[str]

class InsightsResponse(BaseModel):
    impressions: int
    clicks: int
    spend: float
    reach: int
    cpc: float
    cpm: float
    ctr: float
    conversions: Optional[int] = 0
    cost_per_conversion: Optional[float] = 0


# ============ HELPER FUNCTIONS ============

def get_meta_config(db: Session) -> MetaAdsConfig:
    """Get Meta Ads configuration from database"""
    config = db.query(MetaAdsConfig).filter(MetaAdsConfig.status == 'active').first()
    if not config:
        raise HTTPException(status_code=404, detail="Meta Ads não configurado. Configure em /meta/config")
    return config

def init_facebook_api(access_token: str):
    """Initialize Facebook Ads API"""
    try:
        FacebookAdsApi.init(access_token=access_token)
        return True
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao inicializar Meta API: {str(e)}")


# ============ CONFIGURATION ENDPOINTS ============

@router.post("/config")
async def create_meta_config(config: MetaConfigCreate, db: Session = Depends(get_db)):
    """
    Salva configuração do Meta Ads (token + conta de anúncios).
    Valida token ao salvar.
    """
    try:
        print(f"🔵 Tentando configurar Meta Ads com conta: {config.ad_account_id}")

        # Validar token fazendo uma chamada de teste
        init_facebook_api(config.access_token)
        print("✅ Token validado com sucesso")

        # Buscar informações da conta de anúncios
        account = AdAccount(config.ad_account_id)
        print(f"🔍 Buscando informações da conta: {config.ad_account_id}")
        account_info = account.api_get(fields=['name', 'account_status'])
        print(f"✅ Conta encontrada: {account_info.get('name')}")

        # Desativar configurações antigas
        db.query(MetaAdsConfig).update({"status": "inactive"})

        # Criar nova configuração
        new_config = MetaAdsConfig(
            access_token=config.access_token,
            ad_account_id=config.ad_account_id,
            ad_account_name=account_info.get('name'),
            status='active'
        )

        db.add(new_config)
        db.commit()
        db.refresh(new_config)

        return {
            "message": "Meta Ads configurado com sucesso",
            "account_name": account_info.get('name'),
            "account_id": config.ad_account_id
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ ERRO ao configurar Meta Ads: {type(e).__name__}")
        print(f"❌ Mensagem: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Erro ao configurar Meta Ads: {str(e)}")


@router.get("/config", response_model=MetaConfigResponse)
async def get_config(db: Session = Depends(get_db)):
    """Retorna configuração ativa do Meta Ads"""
    config = db.query(MetaAdsConfig).filter(MetaAdsConfig.status == 'active').first()
    if not config:
        raise HTTPException(status_code=404, detail="Meta Ads não configurado")
    return config


@router.delete("/config")
async def delete_config(db: Session = Depends(get_db)):
    """Desativa configuração do Meta Ads"""
    config = get_meta_config(db)
    config.status = 'inactive'
    db.commit()
    return {"message": "Configuração desativada com sucesso"}


# ============ CAMPAIGNS ENDPOINTS ============

@router.get("/campaigns", response_model=List[CampaignResponse])
async def list_campaigns(
    status: Optional[str] = Query(None, description="ACTIVE, PAUSED, ARCHIVED"),
    db: Session = Depends(get_db)
):
    """
    Lista todas as campanhas da conta de anúncios.
    Filtra por status se especificado.
    """
    try:
        config = get_meta_config(db)
        init_facebook_api(config.access_token)

        account = AdAccount(config.ad_account_id)

        # Campos para buscar
        fields = [
            'id', 'name', 'status', 'objective',
            'daily_budget', 'lifetime_budget',
            'start_time', 'stop_time'
        ]

        # Parâmetros de filtro
        params = {}
        if status:
            params['effective_status'] = [status]

        campaigns = account.get_campaigns(fields=fields, params=params)

        result = []
        for campaign in campaigns:
            result.append({
                "id": campaign.get('id'),
                "name": campaign.get('name'),
                "status": campaign.get('status'),
                "objective": campaign.get('objective'),
                "daily_budget": float(campaign.get('daily_budget', 0)) / 100 if campaign.get('daily_budget') else None,
                "lifetime_budget": float(campaign.get('lifetime_budget', 0)) / 100 if campaign.get('lifetime_budget') else None,
                "start_time": campaign.get('start_time'),
                "stop_time": campaign.get('stop_time')
            })

        # Atualizar última sincronização
        config.last_sync = datetime.now()
        db.commit()

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar campanhas: {str(e)}")


@router.get("/campaigns/{campaign_id}/insights", response_model=InsightsResponse)
async def get_campaign_insights(
    campaign_id: str,
    date_preset: str = Query("last_30d", description="today, yesterday, last_7d, last_30d, this_month"),
    db: Session = Depends(get_db)
):
    """
    Retorna métricas (insights) de uma campanha específica.
    """
    try:
        config = get_meta_config(db)
        init_facebook_api(config.access_token)

        campaign = Campaign(campaign_id)

        # Campos de métricas para buscar
        fields = [
            'impressions', 'clicks', 'spend', 'reach',
            'cpc', 'cpm', 'ctr', 'actions', 'cost_per_action_type'
        ]

        params = {
            'date_preset': date_preset,
            'level': 'campaign'
        }

        insights = campaign.get_insights(fields=fields, params=params)

        if not insights:
            raise HTTPException(status_code=404, detail="Nenhuma métrica encontrada para esta campanha")

        insight = insights[0]

        # Extrair conversões se disponível
        conversions = 0
        cost_per_conversion = 0
        if 'actions' in insight:
            for action in insight['actions']:
                if action['action_type'] in ['purchase', 'lead', 'complete_registration']:
                    conversions += int(action['value'])

        if conversions > 0 and 'spend' in insight:
            cost_per_conversion = float(insight['spend']) / conversions

        return {
            "impressions": int(insight.get('impressions', 0)),
            "clicks": int(insight.get('clicks', 0)),
            "spend": float(insight.get('spend', 0)),
            "reach": int(insight.get('reach', 0)),
            "cpc": float(insight.get('cpc', 0)),
            "cpm": float(insight.get('cpm', 0)),
            "ctr": float(insight.get('ctr', 0)),
            "conversions": conversions,
            "cost_per_conversion": cost_per_conversion
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")


@router.get("/insights/summary")
async def get_account_insights_summary(
    date_preset: str = Query("last_30d", description="today, yesterday, last_7d, last_30d, this_month"),
    db: Session = Depends(get_db)
):
    """
    Retorna resumo geral de métricas da conta (todas as campanhas agregadas).
    """
    try:
        config = get_meta_config(db)
        init_facebook_api(config.access_token)

        account = AdAccount(config.ad_account_id)

        fields = [
            'impressions', 'clicks', 'spend', 'reach',
            'cpc', 'cpm', 'ctr', 'actions', 'cost_per_action_type'
        ]

        params = {
            'date_preset': date_preset,
            'level': 'account'
        }

        insights = account.get_insights(fields=fields, params=params)

        if not insights:
            return {
                "impressions": 0,
                "clicks": 0,
                "spend": 0,
                "reach": 0,
                "cpc": 0,
                "cpm": 0,
                "ctr": 0,
                "conversions": 0,
                "roas": 0
            }

        insight = insights[0]

        # Calcular conversões
        conversions = 0
        if 'actions' in insight:
            for action in insight['actions']:
                if action['action_type'] in ['purchase', 'lead', 'complete_registration']:
                    conversions += int(action['value'])

        spend = float(insight.get('spend', 0))

        return {
            "impressions": int(insight.get('impressions', 0)),
            "clicks": int(insight.get('clicks', 0)),
            "spend": spend,
            "reach": int(insight.get('reach', 0)),
            "cpc": float(insight.get('cpc', 0)),
            "cpm": float(insight.get('cpm', 0)),
            "ctr": float(insight.get('ctr', 0)),
            "conversions": conversions,
            "cost_per_conversion": spend / conversions if conversions > 0 else 0,
            "date_preset": date_preset
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar resumo de métricas: {str(e)}")
