"""
FastAPI main application for MedGM Analytics.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import upload, metrics, crud, comercial, config, export, import_csv, funil, metas, demonstrativos, projecao, vendas

# Initialize FastAPI app
app = FastAPI(
    title="MedGM Analytics API",
    description="Backend API for MedGM Analytics Platform - Sistema completo de gestao financeira e comercial",
    version="2.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(metrics.router)
app.include_router(crud.router)
app.include_router(comercial.router)
app.include_router(config.router)
app.include_router(export.router)
app.include_router(import_csv.router)
app.include_router(funil.router)
app.include_router(metas.router)
app.include_router(demonstrativos.router)
app.include_router(projecao.router)
app.include_router(vendas.router)


@app.on_event("startup")
async def startup_event():
    """
    Initialize database on startup.
    """
    print("Starting MedGM Analytics API...")
    init_db()
    print("API ready!")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "service": "MedGM Analytics API",
        "version": "2.0.0"
    }


@app.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "MedGM Analytics API",
        "version": "2.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc",
            "upload": {
                "comercial": "/upload/comercial",
                "financeiro": "/upload/financeiro"
            },
            "metrics": {
                "financeiro": "/metrics/financeiro?mes=1&ano=2026",
                "financeiro_detalhado": "/metrics/financeiro/detalhado?mes=1&ano=2026",
                "comercial": "/metrics/comercial?mes=1&ano=2026",
                "comercial_detalhado": "/metrics/comercial/detalhado?mes=1&ano=2026",
                "inteligencia": "/metrics/inteligencia?mes=1&ano=2026",
                "fluxo_caixa": "/metrics/financeiro/fluxo-caixa?meses=6&mes_ref=2&ano_ref=2026"
            },
            "crud": {
                "financeiro": "/crud/financeiro",
                "venda": "/crud/venda"
            },
            "comercial": {
                "social_selling": "/comercial/social-selling",
                "sdr": "/comercial/sdr",
                "closer": "/comercial/closer",
                "dashboards": {
                    "social_selling": "/comercial/dashboard/social-selling?mes=1&ano=2026",
                    "sdr": "/comercial/dashboard/sdr?mes=1&ano=2026",
                    "closer": "/comercial/dashboard/closer?mes=1&ano=2026"
                }
            },
            "config": {
                "pessoas": "/config/pessoas",
                "produtos": "/config/produtos",
                "funis": "/config/funis",
                "resumo": "/config/resumo",
                "seed": "/config/seed"
            },
            "export": {
                "financeiro": "/export/financeiro?mes=1&ano=2026",
                "vendas": "/export/vendas?mes=1&ano=2026",
                "social_selling": "/export/social-selling?mes=1&ano=2026",
                "sdr": "/export/sdr?mes=1&ano=2026",
                "closer": "/export/closer?mes=1&ano=2026",
                "completo": "/export/completo?mes=1&ano=2026",
                "periodo": "/export/periodo?mes_inicio=1&ano_inicio=2026&mes_fim=3&ano_fim=2026&tipo=completo"
            },
            "import": {
                "financeiro_csv": "/import/financeiro/csv",
                "vendas_csv": "/import/vendas/csv",
                "social_selling_csv": "/import/social-selling/csv",
                "sdr_csv": "/import/sdr/csv",
                "closer_csv": "/import/closer/csv",
                "templates": "/import/templates/{tipo}",
                "preview": "/import/preview"
            },
            "funil": {
                "completo": "/funil/completo?mes=1&ano=2026&agrupamento=geral",
                "por_closer": "/funil/completo?mes=1&ano=2026&agrupamento=por_closer",
                "por_canal": "/funil/completo?mes=1&ano=2026&agrupamento=por_canal",
                "historico": "/funil/historico?ano=2026"
            },
            "metas": {
                "listar": "/metas?mes=1&ano=2026",
                "criar": "/metas",
                "replicar_mes": "/metas/replicar-mes?mes_destino=2&ano_destino=2026",
                "calcular_realizado": "/metas/calcular-realizado?mes=1&ano=2026",
                "historico_pessoa": "/metas/historico/{pessoa_id}",
                "empresa": "/metas/empresa/{ano}",
                "calcular_acumulado": "/metas/empresa/{ano}/calcular-acumulado"
            },
            "demonstrativos": {
                "dfc": "/demonstrativos/dfc?mes=1&ano=2026",
                "dre": "/demonstrativos/dre?mes=1&ano=2026",
                "dfc_anual": "/demonstrativos/dfc/anual?ano=2026",
                "dre_anual": "/demonstrativos/dre/anual?ano=2026"
            }
        }
    }
