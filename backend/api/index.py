"""
Vercel serverless handler for FastAPI backend.
"""
from app.main import app

# Vercel handler
handler = app
