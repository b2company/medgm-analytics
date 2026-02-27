"""
Database configuration and session management for MedGM Analytics.
Supports both SQLite (development) and PostgreSQL (production via Supabase).
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Carrega variáveis de ambiente
load_dotenv()

# Database configuration
# Se DATABASE_URL está definido (produção), usa PostgreSQL
# Caso contrário, usa SQLite local (desenvolvimento)
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Produção: PostgreSQL (Supabase)
    print(f"🐘 Usando PostgreSQL: {DATABASE_URL[:50]}...")
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verifica conexões antes de usar
        pool_size=10,
        max_overflow=20,
        echo=False  # Set to True for SQL debugging
    )
else:
    # Desenvolvimento: SQLite local
    DATABASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(DATABASE_DIR, exist_ok=True)
    DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'medgm_analytics.db')}"
    print(f"📂 Usando SQLite: {DATABASE_URL}")
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL debugging
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency for getting database session.
    Usage: db = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Called on application startup.
    """
    from app.models.models import (
        Venda, Financeiro, KPI,
        SocialSellingMetrica, SDRMetrica, CloserMetrica,
        Pessoa, ProdutoConfig, FunilConfig
    )

    print(f"Initializing database at {DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")


def reset_db():
    """
    Drop all tables and recreate them.
    WARNING: This will delete all data!
    """
    from app.models.models import (
        Venda, Financeiro, KPI,
        SocialSellingMetrica, SDRMetrica, CloserMetrica,
        Pessoa, ProdutoConfig, FunilConfig
    )

    print("Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database reset complete")
