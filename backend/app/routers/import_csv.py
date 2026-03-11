"""
FastAPI router for CSV import functionality.
Imports financial, sales, and metrics data from CSV files.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io
from datetime import datetime
from typing import List, Dict, Any

from app.database import get_db
from app.models.models import (
    Financeiro, Venda, SocialSellingMetrica, SDRMetrica, CloserMetrica
)

router = APIRouter(prefix="/import", tags=["Importação"])


def parse_date(value):
    """Tenta converter uma string para data."""
    if pd.isna(value) or value == '':
        return None

    if isinstance(value, datetime):
        return value.date()

    date_formats = ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d', '%d.%m.%Y']

    for fmt in date_formats:
        try:
            return datetime.strptime(str(value).strip(), fmt).date()
        except ValueError:
            continue

    return None


def parse_float(value):
    """Converte valor para float, tratando formatos brasileiros."""
    if pd.isna(value) or value == '':
        return 0.0

    value_str = str(value).strip()

    # Remover R$ e espaços
    value_str = value_str.replace('R$', '').replace(' ', '')

    # Tratar formato brasileiro (1.234,56)
    if ',' in value_str and '.' in value_str:
        value_str = value_str.replace('.', '').replace(',', '.')
    elif ',' in value_str:
        value_str = value_str.replace(',', '.')

    try:
        return float(value_str)
    except ValueError:
        return 0.0


def parse_int(value):
    """Converte valor para inteiro."""
    if pd.isna(value) or value == '':
        return 0

    try:
        return int(float(str(value).strip()))
    except ValueError:
        return 0


@router.post("/financeiro/csv")
async def import_financeiro_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa dados financeiros de um arquivo CSV.

    Colunas esperadas:
    - tipo (obrigatório): entrada ou saida
    - valor (obrigatório): valor numérico
    - mes (obrigatório): 1-12
    - ano (obrigatório): ex: 2026
    - data (opcional): data da transação
    - categoria (opcional)
    - descricao (opcional)
    - produto (opcional)
    - plano (opcional)
    - modelo (opcional): MRR ou TCV
    - custo (opcional)
    - tipo_custo (opcional): Fixo, Variável, Pontual
    - centro_custo (opcional)
    - previsto_realizado (opcional): previsto ou realizado
    """
    try:
        # Verificar extensão
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser CSV")

        # Ler arquivo
        contents = await file.read()

        # Tentar diferentes encodings
        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                df = pd.read_csv(io.StringIO(contents.decode(encoding)), sep=None, engine='python')
                break
            except:
                continue
        else:
            raise HTTPException(status_code=400, detail="Não foi possível ler o arquivo CSV")

        # Normalizar nomes das colunas
        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')

        # Validar colunas obrigatórias
        required = ['tipo', 'valor', 'mes', 'ano']
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas obrigatórias faltando: {', '.join(missing)}"
            )

        # Processar registros
        count = 0
        errors = []

        for idx, row in df.iterrows():
            try:
                tipo = str(row['tipo']).strip().lower()
                if tipo not in ['entrada', 'saida', 'saída']:
                    errors.append(f"Linha {idx + 2}: tipo inválido '{tipo}'")
                    continue

                tipo = 'saida' if tipo in ['saida', 'saída'] else 'entrada'

                novo = Financeiro(
                    tipo=tipo,
                    valor=parse_float(row['valor']),
                    mes=parse_int(row['mes']),
                    ano=parse_int(row['ano']),
                    data=parse_date(row.get('data')),
                    categoria=str(row.get('categoria', '')).strip() or None,
                    descricao=str(row.get('descricao', '')).strip() or None,
                    produto=str(row.get('produto', '')).strip() or None,
                    plano=str(row.get('plano', '')).strip() or None,
                    modelo=str(row.get('modelo', '')).strip() or None,
                    custo=str(row.get('custo', '')).strip() or None,
                    tipo_custo=str(row.get('tipo_custo', '')).strip() or None,
                    centro_custo=str(row.get('centro_custo', '')).strip() or None,
                    previsto_realizado=str(row.get('previsto_realizado', 'realizado')).strip() or 'realizado'
                )
                db.add(novo)
                count += 1

            except Exception as e:
                errors.append(f"Linha {idx + 2}: {str(e)}")

        db.commit()

        return {
            "message": f"{count} registros financeiros importados com sucesso",
            "importados": count,
            "erros": len(errors),
            "detalhes_erros": errors[:10] if errors else []  # Limitar a 10 erros
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao importar CSV: {str(e)}")


@router.post("/vendas/csv")
async def import_vendas_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa vendas de um arquivo CSV.

    Colunas esperadas:
    - data (obrigatório): data da venda
    - valor ou valor_bruto (obrigatório): valor da venda
    - mes (obrigatório): 1-12
    - ano (obrigatório): ex: 2026
    - cliente (opcional)
    - valor_liquido (opcional)
    - funil (opcional)
    - vendedor (opcional)
    - closer (opcional)
    - tipo_receita (opcional)
    - produto (opcional)
    - booking (opcional)
    - previsto (opcional)
    - valor_pago (opcional)
    """
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser CSV")

        contents = await file.read()

        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                df = pd.read_csv(io.StringIO(contents.decode(encoding)), sep=None, engine='python')
                break
            except:
                continue
        else:
            raise HTTPException(status_code=400, detail="Não foi possível ler o arquivo CSV")

        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')

        # Verificar coluna de valor
        valor_col = 'valor_bruto' if 'valor_bruto' in df.columns else 'valor'
        required = ['data', valor_col, 'mes', 'ano']
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas obrigatórias faltando: {', '.join(missing)}"
            )

        count = 0
        errors = []

        for idx, row in df.iterrows():
            try:
                data = parse_date(row['data'])
                if not data:
                    errors.append(f"Linha {idx + 2}: data inválida")
                    continue

                valor_bruto = parse_float(row[valor_col])
                valor_liquido = parse_float(row.get('valor_liquido', valor_bruto))

                nova = Venda(
                    data=data,
                    valor_bruto=valor_bruto,
                    valor_liquido=valor_liquido,
                    valor=valor_bruto,  # Campo legado
                    mes=parse_int(row['mes']),
                    ano=parse_int(row['ano']),
                    cliente=str(row.get('cliente', '')).strip() or None,
                    funil=str(row.get('funil', '')).strip() or None,
                    vendedor=str(row.get('vendedor', '')).strip() or None,
                    closer=str(row.get('closer', '')).strip() or None,
                    tipo_receita=str(row.get('tipo_receita', '')).strip() or None,
                    produto=str(row.get('produto', '')).strip() or None,
                    booking=parse_float(row.get('booking')),
                    previsto=parse_float(row.get('previsto')),
                    valor_pago=parse_float(row.get('valor_pago'))
                )
                db.add(nova)
                count += 1

            except Exception as e:
                errors.append(f"Linha {idx + 2}: {str(e)}")

        db.commit()

        return {
            "message": f"{count} vendas importadas com sucesso",
            "importados": count,
            "erros": len(errors),
            "detalhes_erros": errors[:10] if errors else []
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao importar CSV: {str(e)}")


@router.post("/social-selling/csv")
async def import_social_selling_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa métricas de Social Selling de um arquivo CSV.

    Colunas esperadas:
    - vendedor (obrigatório)
    - mes (obrigatório)
    - ano (obrigatório)
    - ativacoes (obrigatório)
    - conversoes (obrigatório)
    - leads_gerados (obrigatório)
    - meta_ativacoes (opcional)
    - meta_leads (opcional)
    """
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser CSV")

        contents = await file.read()

        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                df = pd.read_csv(io.StringIO(contents.decode(encoding)), sep=None, engine='python')
                break
            except:
                continue
        else:
            raise HTTPException(status_code=400, detail="Não foi possível ler o arquivo CSV")

        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')

        required = ['vendedor', 'mes', 'ano', 'ativacoes', 'conversoes', 'leads_gerados']
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas obrigatórias faltando: {', '.join(missing)}"
            )

        count = 0
        errors = []

        for idx, row in df.iterrows():
            try:
                ativacoes = parse_int(row['ativacoes'])
                conversoes = parse_int(row['conversoes'])
                leads = parse_int(row['leads_gerados'])

                tx_ativ_conv = (conversoes / ativacoes * 100) if ativacoes > 0 else 0
                tx_conv_lead = (leads / conversoes * 100) if conversoes > 0 else 0

                novo = SocialSellingMetrica(
                    vendedor=str(row['vendedor']).strip(),
                    mes=parse_int(row['mes']),
                    ano=parse_int(row['ano']),
                    ativacoes=ativacoes,
                    conversoes=conversoes,
                    leads_gerados=leads,
                    tx_ativ_conv=round(tx_ativ_conv, 2),
                    tx_conv_lead=round(tx_conv_lead, 2)
                )
                db.add(novo)
                count += 1

            except Exception as e:
                errors.append(f"Linha {idx + 2}: {str(e)}")

        db.commit()

        return {
            "message": f"{count} métricas de Social Selling importadas",
            "importados": count,
            "erros": len(errors),
            "detalhes_erros": errors[:10] if errors else []
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao importar CSV: {str(e)}")


@router.post("/sdr/csv")
async def import_sdr_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa métricas de SDR de um arquivo CSV.

    Colunas esperadas:
    - sdr (obrigatório)
    - funil (obrigatório)
    - mes (obrigatório)
    - ano (obrigatório)
    - leads_recebidos (obrigatório)
    - reunioes_agendadas (obrigatório)
    - reunioes_realizadas (obrigatório)
    - meta_reunioes (opcional)
    """
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser CSV")

        contents = await file.read()

        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                df = pd.read_csv(io.StringIO(contents.decode(encoding)), sep=None, engine='python')
                break
            except:
                continue
        else:
            raise HTTPException(status_code=400, detail="Não foi possível ler o arquivo CSV")

        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')

        required = ['sdr', 'funil', 'mes', 'ano', 'leads_recebidos', 'reunioes_agendadas', 'reunioes_realizadas']
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas obrigatórias faltando: {', '.join(missing)}"
            )

        count = 0
        errors = []

        for idx, row in df.iterrows():
            try:
                leads = parse_int(row['leads_recebidos'])
                agendadas = parse_int(row['reunioes_agendadas'])
                realizadas = parse_int(row['reunioes_realizadas'])

                tx_agend = (agendadas / leads * 100) if leads > 0 else 0
                tx_comp = (realizadas / agendadas * 100) if agendadas > 0 else 0

                novo = SDRMetrica(
                    sdr=str(row['sdr']).strip(),
                    funil=str(row['funil']).strip(),
                    mes=parse_int(row['mes']),
                    ano=parse_int(row['ano']),
                    leads_recebidos=leads,
                    reunioes_agendadas=agendadas,
                    reunioes_realizadas=realizadas,
                    tx_agendamento=round(tx_agend, 2),
                    tx_comparecimento=round(tx_comp, 2)
                )
                db.add(novo)
                count += 1

            except Exception as e:
                errors.append(f"Linha {idx + 2}: {str(e)}")

        db.commit()

        return {
            "message": f"{count} métricas de SDR importadas",
            "importados": count,
            "erros": len(errors),
            "detalhes_erros": errors[:10] if errors else []
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao importar CSV: {str(e)}")


@router.post("/closer/csv")
async def import_closer_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa métricas de Closer de um arquivo CSV.

    Colunas esperadas:
    - closer (obrigatório)
    - funil (obrigatório)
    - mes (obrigatório)
    - ano (obrigatório)
    - calls_agendadas (obrigatório)
    - calls_realizadas (obrigatório)
    - vendas (obrigatório)
    - faturamento (obrigatório)
    - meta_vendas (opcional)
    - meta_faturamento (opcional)
    """
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser CSV")

        contents = await file.read()

        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                df = pd.read_csv(io.StringIO(contents.decode(encoding)), sep=None, engine='python')
                break
            except:
                continue
        else:
            raise HTTPException(status_code=400, detail="Não foi possível ler o arquivo CSV")

        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')

        required = ['closer', 'funil', 'mes', 'ano', 'calls_agendadas', 'calls_realizadas', 'vendas', 'faturamento']
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas obrigatórias faltando: {', '.join(missing)}"
            )

        count = 0
        errors = []

        for idx, row in df.iterrows():
            try:
                agendadas = parse_int(row['calls_agendadas'])
                realizadas = parse_int(row['calls_realizadas'])
                vendas = parse_int(row['vendas'])
                faturamento = parse_float(row['faturamento'])

                tx_comp = (realizadas / agendadas * 100) if agendadas > 0 else 0
                tx_conv = (vendas / realizadas * 100) if realizadas > 0 else 0
                ticket = (faturamento / vendas) if vendas > 0 else 0

                novo = CloserMetrica(
                    closer=str(row['closer']).strip(),
                    funil=str(row['funil']).strip(),
                    mes=parse_int(row['mes']),
                    ano=parse_int(row['ano']),
                    calls_agendadas=agendadas,
                    calls_realizadas=realizadas,
                    vendas=vendas,
                    faturamento=faturamento,
                    tx_comparecimento=round(tx_comp, 2),
                    tx_conversao=round(tx_conv, 2),
                    ticket_medio=round(ticket, 2)
                )
                db.add(novo)
                count += 1

            except Exception as e:
                errors.append(f"Linha {idx + 2}: {str(e)}")

        db.commit()

        return {
            "message": f"{count} métricas de Closer importadas",
            "importados": count,
            "erros": len(errors),
            "detalhes_erros": errors[:10] if errors else []
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao importar CSV: {str(e)}")


@router.get("/templates/{tipo}")
async def get_csv_template(tipo: str):
    """
    Retorna um template CSV para importação.
    """
    templates = {
        "financeiro": {
            "columns": ["tipo", "valor", "mes", "ano", "data", "categoria", "descricao",
                       "produto", "plano", "modelo", "custo", "tipo_custo", "centro_custo", "previsto_realizado"],
            "example": ["entrada", "1500.00", "2", "2026", "15/02/2026", "Vendas", "Venda consultoria",
                       "Consultoria", "Premium", "TCV", "", "", "", "realizado"]
        },
        "vendas": {
            "columns": ["data", "valor_bruto", "valor_liquido", "mes", "ano", "cliente", "funil",
                       "vendedor", "closer", "tipo_receita", "produto", "booking", "previsto", "valor_pago"],
            "example": ["15/02/2026", "5000.00", "4500.00", "2", "2026", "Dr. João Silva", "SS",
                       "Maria", "Carlos", "Venda", "Assessoria Premium", "5000.00", "5000.00", "4500.00"]
        },
        "social_selling": {
            "columns": ["vendedor", "mes", "ano", "ativacoes", "conversoes", "leads_gerados",
                       "meta_ativacoes", "meta_leads"],
            "example": ["João Silva", "2", "2026", "100", "45", "30", "100", "30"]
        },
        "sdr": {
            "columns": ["sdr", "funil", "mes", "ano", "leads_recebidos", "reunioes_agendadas",
                       "reunioes_realizadas", "meta_reunioes"],
            "example": ["Pedro Costa", "SS", "2", "2026", "50", "30", "25", "40"]
        },
        "closer": {
            "columns": ["closer", "funil", "mes", "ano", "calls_agendadas", "calls_realizadas",
                       "vendas", "faturamento", "meta_vendas", "meta_faturamento"],
            "example": ["Carlos Lima", "SS", "2", "2026", "25", "20", "5", "25000.00", "10", "50000.00"]
        }
    }

    if tipo not in templates:
        raise HTTPException(status_code=404, detail=f"Template não encontrado. Tipos válidos: {', '.join(templates.keys())}")

    template = templates[tipo]

    return {
        "tipo": tipo,
        "colunas": template["columns"],
        "exemplo": dict(zip(template["columns"], template["example"])),
        "csv_header": ",".join(template["columns"]),
        "csv_exemplo": ",".join(template["example"])
    }


@router.post("/preview")
async def preview_csv(
    file: UploadFile = File(...),
    linhas: int = 5
):
    """
    Mostra preview de um arquivo CSV antes de importar.
    """
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser CSV")

        contents = await file.read()

        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                df = pd.read_csv(io.StringIO(contents.decode(encoding)), sep=None, engine='python')
                break
            except:
                continue
        else:
            raise HTTPException(status_code=400, detail="Não foi possível ler o arquivo CSV")

        return {
            "arquivo": file.filename,
            "total_linhas": len(df),
            "colunas": list(df.columns),
            "preview": df.head(linhas).to_dict(orient='records')
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler CSV: {str(e)}")
