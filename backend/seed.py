"""
Seed script for initializing database with sample data.
Run this after importing real data from Excel files.
"""

from app.database import SessionLocal, init_db, reset_db
from app.models.models import Venda, Financeiro, KPI
from datetime import date

def seed_sample_data():
    """
    Seeds sample data for testing (optional).
    This will be replaced by real data from task #4.
    """
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_vendas = db.query(Venda).count()
        if existing_vendas > 0:
            print(f"Database already contains {existing_vendas} vendas. Skipping seed.")
            return
        
        print("Database is empty. Ready for data import from Excel files.")
        print("Use POST /upload/comercial and POST /upload/financeiro to import data.")
        
    except Exception as e:
        print(f"Error during seed: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_data()
