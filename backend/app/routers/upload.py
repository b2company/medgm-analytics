from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app.models.models import SocialSellingMetrica, SDRMetrica, CloserMetrica
from datetime import datetime
import pandas as pd
import io
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

router = APIRouter(prefix="/comercial", tags=["Upload"])


@router.get("/template/{tipo}")
async def download_template(tipo: str):
    """
    Gera e retorna uma planilha modelo Excel para importação em massa
    tipo: 'social-selling', 'sdr', ou 'closer'
    """
    wb = Workbook()
    ws = wb.active

    # Estilo do cabeçalho
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF")
    header_alignment = Alignment(horizontal="center", vertical="center")

    if tipo == "social-selling":
        ws.title = "Social Selling"
        headers = ["Data", "Vendedor", "Funil", "Ativações", "Conversões", "Leads Gerados"]
        example_data = [
            ["2026-02-01", "Jessica Leopoldino", "SS", 250, 3, 2],
            ["2026-02-01", "Artur Gabriel", "SS", 180, 2, 1],
            ["2026-02-01", "Karina Carla", "Quiz", 120, 1, 1]
        ]
    elif tipo == "sdr":
        ws.title = "SDR"
        headers = ["Data", "SDR", "Funil", "Leads Recebidos", "Reuniões Agendadas", "Reuniões Realizadas"]
        example_data = [
            ["2026-02-01", "Fernando Dutra", "SS", 3, 2, 2],
            ["2026-02-02", "Fernando Dutra", "Quiz", 1, 1, 1]
        ]
    elif tipo == "closer":
        ws.title = "Closer"
        headers = ["Data", "Closer", "Funil", "Calls Agendadas", "Calls Realizadas", "Vendas", "Booking", "Faturamento Bruto", "Faturamento Líquido"]
        example_data = [
            ["2026-02-01", "Fabio Lima", "SS", 2, 2, 1, 1, 8000, 6000],
            ["2026-02-02", "Mona Garcia", "SS", 1, 1, 0, 0, 0, 0]
        ]
    else:
        raise HTTPException(status_code=400, detail="Tipo inválido. Use: social-selling, sdr ou closer")

    # Adicionar cabeçalhos
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = header_alignment

    # Adicionar dados de exemplo
    for row_num, row_data in enumerate(example_data, 2):
        for col_num, cell_value in enumerate(row_data, 1):
            ws.cell(row=row_num, column=col_num, value=cell_value)

    # Ajustar largura das colunas
    for column in ws.columns:
        max_length = 0
        column = [cell for cell in column]
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        ws.column_dimensions[column[0].column_letter].width = adjusted_width

    # Salvar em buffer
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=template_{tipo}.xlsx"}
    )


@router.post("/upload/{tipo}")
async def upload_metrics(
    tipo: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Processa upload de planilha Excel com métricas em massa
    tipo: 'social-selling', 'sdr', ou 'closer'
    """
    try:
        # Ler arquivo Excel
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))

        importados = 0
        erros = []

        if tipo == "social-selling":
            # Validar colunas
            required_cols = ["Data", "Vendedor", "Funil", "Ativações", "Conversões", "Leads Gerados"]
            if not all(col in df.columns for col in required_cols):
                raise HTTPException(status_code=400, detail=f"Planilha deve ter as colunas: {', '.join(required_cols)}")

            for idx, row in df.iterrows():
                try:
                    data = pd.to_datetime(row["Data"]).date()
                    metrica = SocialSellingMetrica(
                        data=data,
                        mes=data.month,
                        ano=data.year,
                        vendedor=str(row["Vendedor"]),
                        funil=str(row["Funil"]),
                        ativacoes=int(row["Ativações"]),
                        conversoes=int(row["Conversões"]),
                        leads_gerados=int(row["Leads Gerados"])
                    )
                    db.add(metrica)
                    importados += 1
                except Exception as e:
                    erros.append(f"Linha {idx + 2}: {str(e)}")

        elif tipo == "sdr":
            required_cols = ["Data", "SDR", "Funil", "Leads Recebidos", "Reuniões Agendadas", "Reuniões Realizadas"]
            if not all(col in df.columns for col in required_cols):
                raise HTTPException(status_code=400, detail=f"Planilha deve ter as colunas: {', '.join(required_cols)}")

            for idx, row in df.iterrows():
                try:
                    data = pd.to_datetime(row["Data"]).date()
                    metrica = SDRMetrica(
                        data=data,
                        mes=data.month,
                        ano=data.year,
                        sdr=str(row["SDR"]),
                        funil=str(row["Funil"]),
                        leads_recebidos=int(row["Leads Recebidos"]),
                        reunioes_agendadas=int(row["Reuniões Agendadas"]),
                        reunioes_realizadas=int(row["Reuniões Realizadas"])
                    )
                    db.add(metrica)
                    importados += 1
                except Exception as e:
                    erros.append(f"Linha {idx + 2}: {str(e)}")

        elif tipo == "closer":
            required_cols = ["Data", "Closer", "Funil", "Calls Agendadas", "Calls Realizadas", "Vendas", "Booking", "Faturamento Bruto", "Faturamento Líquido"]
            if not all(col in df.columns for col in required_cols):
                raise HTTPException(status_code=400, detail=f"Planilha deve ter as colunas: {', '.join(required_cols)}")

            for idx, row in df.iterrows():
                try:
                    data = pd.to_datetime(row["Data"]).date()

                    # Ler valores
                    calls_agendadas = int(row["Calls Agendadas"]) if pd.notna(row["Calls Agendadas"]) else 0
                    calls_realizadas = int(row["Calls Realizadas"]) if pd.notna(row["Calls Realizadas"]) else 0
                    vendas = int(row["Vendas"]) if pd.notna(row["Vendas"]) else 0
                    booking = int(row["Booking"]) if pd.notna(row["Booking"]) else 0
                    faturamento_bruto = float(row["Faturamento Bruto"]) if pd.notna(row["Faturamento Bruto"]) else 0.0
                    faturamento_liquido = float(row["Faturamento Líquido"]) if pd.notna(row["Faturamento Líquido"]) else 0.0

                    # Calcular taxas
                    tx_comparecimento = (calls_realizadas / calls_agendadas * 100) if calls_agendadas > 0 else 0.0
                    tx_conversao = (vendas / calls_realizadas * 100) if calls_realizadas > 0 else 0.0
                    ticket_medio = (faturamento_liquido / vendas) if vendas > 0 else 0.0

                    metrica = CloserMetrica(
                        data=data,
                        mes=data.month,
                        ano=data.year,
                        closer=str(row["Closer"]),
                        funil=str(row["Funil"]),
                        calls_agendadas=calls_agendadas,
                        calls_realizadas=calls_realizadas,
                        vendas=vendas,
                        booking=booking,
                        faturamento_bruto=faturamento_bruto,
                        faturamento_liquido=faturamento_liquido,
                        tx_comparecimento=tx_comparecimento,
                        tx_conversao=tx_conversao,
                        ticket_medio=ticket_medio
                    )
                    db.add(metrica)
                    importados += 1
                except Exception as e:
                    erros.append(f"Linha {idx + 2}: {str(e)}")

        else:
            raise HTTPException(status_code=400, detail="Tipo inválido")

        db.commit()

        return {
            "message": "Upload processado com sucesso",
            "importados": importados,
            "erros": len(erros),
            "detalhes_erros": erros[:10]  # Limitar a 10 erros para não sobrecarregar
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar upload: {str(e)}")
