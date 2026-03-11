"""
Agendador de tarefas automáticas.
Sincroniza dados do Google Sheets automaticamente a cada hora.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Instância global do scheduler
scheduler = BackgroundScheduler()


def sync_google_sheets_task():
    """
    Tarefa agendada para sincronizar dados do Google Sheets.
    Roda a cada hora.
    """
    try:
        logger.info(f"[{datetime.now()}] Iniciando sincronização automática do Google Sheets...")

        # Fazer request interno para o endpoint de sync
        import requests
        response = requests.get("http://localhost:8000/google-sheets/sync-metrics")

        if response.status_code == 200:
            data = response.json()
            logger.info(f"[{datetime.now()}] ✅ Sincronização concluída com sucesso!")
            logger.info(f"  - Status: {data.get('message')}")
        else:
            logger.error(f"[{datetime.now()}] ❌ Erro na sincronização: Status {response.status_code}")

    except Exception as e:
        logger.error(f"[{datetime.now()}] ❌ Erro na sincronização automática: {str(e)}")


def start_scheduler():
    """
    Inicia o agendador de tarefas.
    """
    try:
        # Agendar sincronização do Google Sheets a cada 1 hora
        scheduler.add_job(
            func=sync_google_sheets_task,
            trigger=IntervalTrigger(hours=1),
            id='sync_google_sheets',
            name='Sincronizar Google Sheets',
            replace_existing=True
        )

        scheduler.start()
        logger.info("🕒 Agendador iniciado - Sincronização automática ativada (a cada 1 hora)")

        # Não executar sincronização inicial para não travar o startup
        # A primeira sync vai rodar depois de 1 hora
        logger.info("⏰ Primeira sincronização agendada para daqui a 1 hora")

    except Exception as e:
        logger.error(f"Erro ao iniciar agendador: {str(e)}")


def stop_scheduler():
    """
    Para o agendador de tarefas.
    """
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Agendador parado")
