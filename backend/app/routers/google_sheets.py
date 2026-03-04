"""
Router para integração com Google Sheets
Puxa dados de métricas de tráfego automaticamente das planilhas do Google
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials
import os
from typing import Optional

router = APIRouter(prefix="/google-sheets", tags=["Google Sheets"])

# ID da planilha do Google Sheets
SPREADSHEET_ID = "1MCoJQ_sDEO4kFgsIGExDIsiI2l3gYT4MHvz8urGt9Aw"

# Scopes necessários para acessar Google Sheets
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
]


def get_google_sheets_client():
    """
    Cria e retorna um cliente autenticado para Google Sheets

    IMPORTANTE: Você precisa:
    1. Criar uma Service Account no Google Cloud Console
    2. Fazer download do JSON de credenciais
    3. Salvar como 'google-credentials.json' na pasta backend/
    4. Compartilhar a planilha com o email do service account
    """
    try:
        creds_path = os.path.join(os.path.dirname(__file__), '../../google-credentials.json')

        if not os.path.exists(creds_path):
            raise FileNotFoundError(
                "Arquivo google-credentials.json não encontrado. "
                "Por favor, adicione as credenciais do Google Service Account."
            )

        creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
        client = gspread.authorize(creds)
        return client
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao conectar com Google Sheets: {str(e)}"
        )


def parse_currency(value_str):
    """Converte string de moeda brasileira para float"""
    if not value_str or value_str.strip() == "":
        return 0.0
    # Remove R$, espaços e converte vírgula para ponto
    cleaned = value_str.replace("R$", "").replace(" ", "").replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except:
        return 0.0


def parse_percentage(value_str):
    """Converte string de percentual para float"""
    if not value_str or value_str.strip() == "":
        return 0.0
    cleaned = value_str.replace("%", "").replace(",", ".")
    try:
        return float(cleaned)
    except:
        return 0.0


def parse_date(date_str, year=None):
    """Converte string de data DD/M para objeto datetime"""
    if not date_str or date_str.strip() == "":
        return None
    try:
        parts = date_str.split("/")
        day = int(parts[0])
        month = int(parts[1])
        # Se o ano não for especificado, usa o ano atual
        if year is None:
            year = datetime.now().year
        return datetime(year, month, day)
    except:
        return None


@router.get("/sync-metrics")
async def sync_metrics_from_sheets():
    """
    Sincroniza métricas de tráfego das planilhas do Google Sheets

    Busca dados das 2 abas:
    - [QUIZ] [SE] Métricas de Trafego (Captura de Lead)
    - [ISCA] [SCRIPT] Métricas de Trafego (Venda Direta)

    Retorna os dados processados no formato esperado pelos dashboards
    """
    try:
        client = get_google_sheets_client()
        spreadsheet = client.open_by_key(SPREADSHEET_ID)

        # Buscar dados de ambas as abas
        quiz_data = sync_quiz_se_metrics(spreadsheet)
        script_data = sync_isca_script_metrics(spreadsheet)

        return {
            "success": True,
            "message": "Métricas sincronizadas com sucesso",
            "data": {
                "captura_lead": quiz_data,
                "venda_direta": script_data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar: {str(e)}")


def sync_quiz_se_metrics(spreadsheet):
    """Sincroniza métricas da aba QUIZ/SE (Captura de Lead)"""
    try:
        worksheet = spreadsheet.worksheet("[QUIZ] [SE] Métricas de Trafego")

        # Pegar todos os valores
        all_values = worksheet.get_all_values()

        # Encontrar onde começa a análise diária (linha com "Análise Diária")
        daily_start_row = None
        for idx, row in enumerate(all_values):
            if row and "Análise Diária" in str(row[0]):
                daily_start_row = idx + 2  # Pular header também
                break

        if not daily_start_row:
            return {"error": "Seção de Análise Diária não encontrada"}

        # Processar dados diários
        daily_data = []
        headers = all_values[daily_start_row - 1]  # Header row

        for row in all_values[daily_start_row:]:
            if not row or not row[0]:  # Linha vazia
                continue

            date_obj = parse_date(row[0])
            if not date_obj:
                continue

            daily_data.append({
                "data": date_obj.strftime("%Y-%m-%d"),
                "dia": date_obj.day,
                "mes": date_obj.month,
                "ano": date_obj.year,
                "valor_gasto": parse_currency(row[1]) if len(row) > 1 else 0,
                "leads": int(row[2]) if len(row) > 2 and row[2].strip() else 0,
                "cpl": parse_currency(row[3]) if len(row) > 3 else 0,
                "cliques": int(row[4]) if len(row) > 4 and row[4].strip() else 0,
                "cpc": parse_currency(row[5]) if len(row) > 5 else 0,
                "ctr": parse_percentage(row[6]) if len(row) > 6 else 0,
                "cpm": parse_currency(row[7]) if len(row) > 7 else 0,
                "connect_rate": parse_percentage(row[8]) if len(row) > 8 else 0,
                "conv_pg": parse_percentage(row[9]) if len(row) > 9 else 0,
                "opt_in": parse_percentage(row[10]) if len(row) > 10 else 0,
                "impressoes": int(row[11]) if len(row) > 11 and row[11].strip() else 0,
                "vis_pagina": int(row[12]) if len(row) > 12 and row[12].strip() else 0,
                "vv_3s": int(row[13]) if len(row) > 13 and row[13].strip() else 0,
                "vv_75": int(row[14]) if len(row) > 14 and row[14].strip() else 0,
                "hook_rate": parse_percentage(row[15]) if len(row) > 15 else 0,
                "view_75": parse_percentage(row[16]) if len(row) > 16 else 0,
            })

        # Calcular totais
        totais = {
            "valor_gasto": sum(d["valor_gasto"] for d in daily_data),
            "leads": sum(d["leads"] for d in daily_data),
            "cliques": sum(d["cliques"] for d in daily_data),
            "impressoes": sum(d["impressoes"] for d in daily_data),
        }

        # Calcular médias ponderadas
        if totais["leads"] > 0:
            totais["cpl"] = totais["valor_gasto"] / totais["leads"]
        else:
            totais["cpl"] = 0

        if totais["cliques"] > 0:
            totais["cpc"] = totais["valor_gasto"] / totais["cliques"]
        else:
            totais["cpc"] = 0

        if totais["impressoes"] > 0:
            totais["ctr"] = (totais["cliques"] / totais["impressoes"]) * 100
            totais["cpm"] = (totais["valor_gasto"] / totais["impressoes"]) * 1000
        else:
            totais["ctr"] = 0
            totais["cpm"] = 0

        return {
            "dados_diarios": daily_data,
            "totais": totais,
            "tipo": "captura_lead"
        }
    except Exception as e:
        return {"error": f"Erro ao processar aba Quiz/SE: {str(e)}"}


def sync_isca_script_metrics(spreadsheet):
    """Sincroniza métricas da aba ISCA/SCRIPT (Venda Direta)"""
    try:
        worksheet = spreadsheet.worksheet("[ISCA] [SCRIPT] Métricas de Trafego")

        # Pegar todos os valores
        all_values = worksheet.get_all_values()

        # Encontrar onde começa a análise diária
        daily_start_row = None
        for idx, row in enumerate(all_values):
            if row and "Análise Diária" in str(row[0]):
                daily_start_row = idx + 2
                break

        if not daily_start_row:
            return {"error": "Seção de Análise Diária não encontrada"}

        # Processar dados diários
        daily_data = []

        for row in all_values[daily_start_row:]:
            if not row or not row[0]:
                continue

            date_obj = parse_date(row[0])
            if not date_obj:
                continue

            daily_data.append({
                "data": date_obj.strftime("%Y-%m-%d"),
                "dia": date_obj.day,
                "mes": date_obj.month,
                "ano": date_obj.year,
                "valor_gasto": parse_currency(row[1]) if len(row) > 1 else 0,
                "vendas": int(row[2]) if len(row) > 2 and row[2].strip() else 0,
                "cpa": parse_currency(row[3]) if len(row) > 3 else 0,
                "cliques": int(row[4]) if len(row) > 4 and row[4].strip() else 0,
                "cpc": parse_currency(row[5]) if len(row) > 5 else 0,
                "ctr": parse_percentage(row[6]) if len(row) > 6 else 0,
                "cpm": parse_currency(row[7]) if len(row) > 7 else 0,
                "connect_rate": parse_percentage(row[8]) if len(row) > 8 else 0,
                "conv_pg": parse_percentage(row[9]) if len(row) > 9 else 0,
                "opt_in": parse_percentage(row[10]) if len(row) > 10 else 0,
                "impressoes": int(row[11]) if len(row) > 11 and row[11].strip() else 0,
                "vis_pagina": int(row[12]) if len(row) > 12 and row[12].strip() else 0,
                "vv_3s": int(row[13]) if len(row) > 13 and row[13].strip() else 0,
                "vv_75": int(row[14]) if len(row) > 14 and row[14].strip() else 0,
                "init_checkout": int(row[15]) if len(row) > 15 and row[15].strip() else 0,
                "hook_rate": parse_percentage(row[16]) if len(row) > 16 else 0,
                "view_75": parse_percentage(row[17]) if len(row) > 17 else 0,
            })

        # Calcular totais
        totais = {
            "valor_gasto": sum(d["valor_gasto"] for d in daily_data),
            "vendas": sum(d["vendas"] for d in daily_data),
            "cliques": sum(d["cliques"] for d in daily_data),
            "impressoes": sum(d["impressoes"] for d in daily_data),
            "init_checkout": sum(d["init_checkout"] for d in daily_data),
        }

        # Calcular médias
        if totais["vendas"] > 0:
            totais["cpa"] = totais["valor_gasto"] / totais["vendas"]
        else:
            totais["cpa"] = 0

        if totais["cliques"] > 0:
            totais["cpc"] = totais["valor_gasto"] / totais["cliques"]
        else:
            totais["cpc"] = 0

        if totais["impressoes"] > 0:
            totais["ctr"] = (totais["cliques"] / totais["impressoes"]) * 100
            totais["cpm"] = (totais["valor_gasto"] / totais["impressoes"]) * 1000
        else:
            totais["ctr"] = 0
            totais["cpm"] = 0

        # ROAS simulado (você pode adicionar faturamento na planilha depois)
        totais["roas"] = 0
        totais["faturamento"] = 0

        return {
            "dados_diarios": daily_data,
            "totais": totais,
            "tipo": "venda_direta"
        }
    except Exception as e:
        return {"error": f"Erro ao processar aba Isca/Script: {str(e)}"}


@router.get("/captura-lead")
async def get_captura_lead_metrics(mes: Optional[int] = None, ano: Optional[int] = None):
    """
    Retorna métricas de Captura de Lead (Quiz/SE) da planilha
    Pode filtrar por mês e ano
    """
    try:
        client = get_google_sheets_client()
        spreadsheet = client.open_by_key(SPREADSHEET_ID)
        data = sync_quiz_se_metrics(spreadsheet)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        # Filtrar por mês/ano se fornecido
        if mes and ano:
            data["dados_diarios"] = [
                d for d in data["dados_diarios"]
                if d["mes"] == mes and d["ano"] == ano
            ]
            # Recalcular totais
            data["totais"] = calcular_totais_captura(data["dados_diarios"])

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/venda-direta")
async def get_venda_direta_metrics(mes: Optional[int] = None, ano: Optional[int] = None):
    """
    Retorna métricas de Venda Direta (Isca/Script) da planilha
    Pode filtrar por mês e ano
    """
    try:
        client = get_google_sheets_client()
        spreadsheet = client.open_by_key(SPREADSHEET_ID)
        data = sync_isca_script_metrics(spreadsheet)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        # Filtrar por mês/ano se fornecido
        if mes and ano:
            data["dados_diarios"] = [
                d for d in data["dados_diarios"]
                if d["mes"] == mes and d["ano"] == ano
            ]
            # Recalcular totais
            data["totais"] = calcular_totais_venda(data["dados_diarios"])

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def calcular_totais_captura(daily_data):
    """Calcula totais para dados de captura de lead"""
    totais = {
        "valor_gasto": sum(d["valor_gasto"] for d in daily_data),
        "leads": sum(d["leads"] for d in daily_data),
        "cliques": sum(d["cliques"] for d in daily_data),
        "impressoes": sum(d["impressoes"] for d in daily_data),
    }

    if totais["leads"] > 0:
        totais["cpl"] = totais["valor_gasto"] / totais["leads"]
    else:
        totais["cpl"] = 0

    if totais["cliques"] > 0:
        totais["cpc"] = totais["valor_gasto"] / totais["cliques"]
    else:
        totais["cpc"] = 0

    if totais["impressoes"] > 0:
        totais["ctr"] = (totais["cliques"] / totais["impressoes"]) * 100
        totais["cpm"] = (totais["valor_gasto"] / totais["impressoes"]) * 1000
    else:
        totais["ctr"] = 0
        totais["cpm"] = 0

    return totais


def calcular_totais_venda(daily_data):
    """Calcula totais para dados de venda direta"""
    totais = {
        "valor_gasto": sum(d["valor_gasto"] for d in daily_data),
        "vendas": sum(d["vendas"] for d in daily_data),
        "cliques": sum(d["cliques"] for d in daily_data),
        "impressoes": sum(d["impressoes"] for d in daily_data),
        "init_checkout": sum(d["init_checkout"] for d in daily_data),
    }

    if totais["vendas"] > 0:
        totais["cpa"] = totais["valor_gasto"] / totais["vendas"]
    else:
        totais["cpa"] = 0

    if totais["cliques"] > 0:
        totais["cpc"] = totais["valor_gasto"] / totais["cliques"]
    else:
        totais["cpc"] = 0

    if totais["impressoes"] > 0:
        totais["ctr"] = (totais["cliques"] / totais["impressoes"]) * 100
        totais["cpm"] = (totais["valor_gasto"] / totais["impressoes"]) * 1000
    else:
        totais["ctr"] = 0
        totais["cpm"] = 0

    totais["roas"] = 0
    totais["faturamento"] = 0

    return totais
