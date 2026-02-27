#!/bin/bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
export PYTHONPATH=/Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
uvicorn app.main:app --host 0.0.0.0 --port 5001 --reload
