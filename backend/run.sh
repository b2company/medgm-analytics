#!/bin/bash

echo "Starting MedGM Analytics Backend..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run seed script to initialize database
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
