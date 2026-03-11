"""
FastAPI router for Excel export functionality.
Exports financial, sales, and metrics data to Excel files.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
import os
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.models import (
    Financeiro, Venda, SocialSellingMetrica, SDRMetrica, CloserMetrica,
    Pessoa, Meta
)

router = APIRouter(prefix="/export", tags=["Exportação"])

# Diretório temporário para arquivos exportados
EXPORT_DIR = "/tmp/medgm_exports"
os.makedirs(EXPORT_DIR, exist_ok=True)


def format_currency(value):
    """Formata valor para moeda brasileira."""
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def get_mes_nome(mes):
    """Retorna nome do mês."""
    meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return meses[mes] if 1 <= mes <= 12 else ''


@router.get("/financeiro")
async def export_financeiro(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db)
):
    """
    Exporta dados financeiros para Excel.
    """
    try:
        dados = db.query(Financeiro).filter(
            Financeiro.mes == mes,
            Financeiro.ano == ano
        ).order_by(Financeiro.data.desc()).all()

        if not dados:
            raise HTTPException(status_code=404, detail="Nenhum dado financeiro encontrado para este período")

        # Converter para DataFrame
        df = pd.DataFrame([{
            'ID': d.id,
            'Tipo': 'Entrada' if d.tipo == 'entrada' else 'Saída',
            'Data': d.data.strftime('%d/%m/%Y') if d.data else '',
            'Produto': d.produto or '',
            'Plano': d.plano or '',
            'Modelo': d.modelo or '',
            'Custo': d.custo or '',
            'Tipo Custo': d.tipo_custo or '',
            'Centro de Custo': d.centro_custo or '',
            'Categoria': d.categoria or '',
            'Descrição': d.descricao or '',
            'Valor': d.valor,
            'Previsto/Realizado': d.previsto_realizado or 'realizado'
        } for d in dados])

        # Calcular totais
        total_entradas = sum(d.valor for d in dados if d.tipo == 'entrada')
        total_saidas = sum(d.valor for d in dados if d.tipo == 'saida')
        saldo = total_entradas - total_saidas

        # Adicionar linha de totais
        totais_df = pd.DataFrame([{
            'ID': '',
            'Tipo': 'TOTAL',
            'Data': '',
            'Produto': '',
            'Plano': '',
            'Modelo': '',
            'Custo': '',
            'Tipo Custo': '',
            'Centro de Custo': '',
            'Categoria': '',
            'Descrição': f'Entradas: {format_currency(total_entradas)} | Saídas: {format_currency(total_saidas)}',
            'Valor': saldo,
            'Previsto/Realizado': ''
        }])

        df = pd.concat([df, totais_df], ignore_index=True)

        # Salvar Excel
        filename = f"financeiro_{get_mes_nome(mes)}_{ano}.xlsx"
        filepath = os.path.join(EXPORT_DIR, filename)

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Financeiro', index=False)

            # Ajustar largura das colunas
            worksheet = writer.sheets['Financeiro']
            for idx, col in enumerate(df.columns):
                max_length = max(df[col].astype(str).apply(len).max(), len(col)) + 2
                worksheet.column_dimensions[chr(65 + idx)].width = min(max_length, 50)

        return FileResponse(
            filepath,
            filename=filename,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")


@router.get("/vendas")
async def export_vendas(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db)
):
    """
    Exporta vendas para Excel.
    """
    try:
        dados = db.query(Venda).filter(
            Venda.mes == mes,
            Venda.ano == ano
        ).order_by(Venda.data.desc()).all()

        if not dados:
            raise HTTPException(status_code=404, detail="Nenhuma venda encontrada para este período")

        df = pd.DataFrame([{
            'ID': d.id,
            'Data': d.data.strftime('%d/%m/%Y') if d.data else '',
            'Cliente': d.cliente or '',
            'Valor Bruto': d.valor_bruto or d.valor or 0,
            'Valor Líquido': d.valor_liquido or d.valor or 0,
            'Funil': d.funil or '',
            'Vendedor': d.vendedor or '',
            'Closer': d.closer or '',
            'Tipo Receita': d.tipo_receita or '',
            'Produto': d.produto or '',
            'Booking': d.booking or 0,
            'Previsto': d.previsto or 0,
            'Valor Pago': d.valor_pago or 0
        } for d in dados])

        # Calcular totais
        total_bruto = df['Valor Bruto'].sum()
        total_liquido = df['Valor Líquido'].sum()
        total_vendas = len(dados)

        # Adicionar linha de totais
        totais_df = pd.DataFrame([{
            'ID': '',
            'Data': 'TOTAL',
            'Cliente': f'{total_vendas} vendas',
            'Valor Bruto': total_bruto,
            'Valor Líquido': total_liquido,
            'Funil': '',
            'Vendedor': '',
            'Closer': '',
            'Tipo Receita': '',
            'Produto': '',
            'Booking': df['Booking'].sum(),
            'Previsto': df['Previsto'].sum(),
            'Valor Pago': df['Valor Pago'].sum()
        }])

        df = pd.concat([df, totais_df], ignore_index=True)

        filename = f"vendas_{get_mes_nome(mes)}_{ano}.xlsx"
        filepath = os.path.join(EXPORT_DIR, filename)

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Vendas', index=False)

            worksheet = writer.sheets['Vendas']
            for idx, col in enumerate(df.columns):
                max_length = max(df[col].astype(str).apply(len).max(), len(col)) + 2
                worksheet.column_dimensions[chr(65 + idx)].width = min(max_length, 50)

        return FileResponse(
            filepath,
            filename=filename,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")


@router.get("/social-selling")
async def export_social_selling(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db)
):
    """
    Exporta métricas de Social Selling para Excel.
    """
    try:
        dados = db.query(SocialSellingMetrica).filter(
            SocialSellingMetrica.mes == mes,
            SocialSellingMetrica.ano == ano
        ).order_by(SocialSellingMetrica.vendedor).all()

        if not dados:
            raise HTTPException(status_code=404, detail="Nenhuma métrica de Social Selling encontrada")

        # Buscar metas da tabela Meta
        metas_dict = {}
        for metrica in dados:
            pessoa = db.query(Pessoa).filter(Pessoa.nome == metrica.vendedor).first()
            if pessoa:
                meta = db.query(Meta).filter(
                    Meta.pessoa_id == pessoa.id,
                    Meta.mes == mes,
                    Meta.ano == ano
                ).first()
                if meta:
                    metas_dict[metrica.vendedor] = meta

        df = pd.DataFrame([{
            'Vendedor': d.vendedor,
            'Ativações': d.ativacoes,
            'Meta Ativações': metas_dict.get(d.vendedor).meta_ativacoes if d.vendedor in metas_dict else 0,
            '% Meta Ativ.': f"{(d.ativacoes / metas_dict.get(d.vendedor).meta_ativacoes * 100):.1f}%" if d.vendedor in metas_dict and metas_dict.get(d.vendedor).meta_ativacoes > 0 else "0%",
            'Conversões': d.conversoes,
            'Tx Ativ>Conv': f"{d.tx_ativ_conv:.1f}%",
            'Leads Gerados': d.leads_gerados,
            'Meta Leads': metas_dict.get(d.vendedor).meta_leads if d.vendedor in metas_dict else 0,
            '% Meta Leads': f"{(d.leads_gerados / metas_dict.get(d.vendedor).meta_leads * 100):.1f}%" if d.vendedor in metas_dict and metas_dict.get(d.vendedor).meta_leads > 0 else "0%",
            'Tx Conv>Lead': f"{d.tx_conv_lead:.1f}%"
        } for d in dados])

        # Totais
        total_ativ = sum(d.ativacoes for d in dados)
        total_conv = sum(d.conversoes for d in dados)
        total_leads = sum(d.leads_gerados for d in dados)
        total_meta_ativ = sum(metas_dict.get(d.vendedor).meta_ativacoes if d.vendedor in metas_dict else 0 for d in dados)
        total_meta_leads = sum(metas_dict.get(d.vendedor).meta_leads if d.vendedor in metas_dict else 0 for d in dados)

        totais_df = pd.DataFrame([{
            'Vendedor': 'TOTAL',
            'Ativações': total_ativ,
            'Meta Ativações': total_meta_ativ,
            '% Meta Ativ.': f"{(total_ativ / total_meta_ativ * 100):.1f}%" if total_meta_ativ > 0 else "0%",
            'Conversões': total_conv,
            'Tx Ativ>Conv': f"{(total_conv / total_ativ * 100):.1f}%" if total_ativ > 0 else "0%",
            'Leads Gerados': total_leads,
            'Meta Leads': total_meta_leads,
            '% Meta Leads': f"{(total_leads / total_meta_leads * 100):.1f}%" if total_meta_leads > 0 else "0%",
            'Tx Conv>Lead': f"{(total_leads / total_conv * 100):.1f}%" if total_conv > 0 else "0%"
        }])

        df = pd.concat([df, totais_df], ignore_index=True)

        filename = f"social_selling_{get_mes_nome(mes)}_{ano}.xlsx"
        filepath = os.path.join(EXPORT_DIR, filename)

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Social Selling', index=False)

        return FileResponse(filepath, filename=filename)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")


@router.get("/sdr")
async def export_sdr(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db)
):
    """
    Exporta métricas de SDR para Excel.
    """
    try:
        dados = db.query(SDRMetrica).filter(
            SDRMetrica.mes == mes,
            SDRMetrica.ano == ano
        ).order_by(SDRMetrica.sdr, SDRMetrica.funil).all()

        if not dados:
            raise HTTPException(status_code=404, detail="Nenhuma métrica de SDR encontrada")

        # Buscar metas da tabela Meta
        metas_dict = {}
        for metrica in dados:
            pessoa = db.query(Pessoa).filter(Pessoa.nome == metrica.sdr).first()
            if pessoa:
                meta = db.query(Meta).filter(
                    Meta.pessoa_id == pessoa.id,
                    Meta.mes == mes,
                    Meta.ano == ano
                ).first()
                if meta:
                    metas_dict[metrica.sdr] = meta

        df = pd.DataFrame([{
            'SDR': d.sdr,
            'Funil': d.funil,
            'Leads Recebidos': d.leads_recebidos,
            'Reuniões Agendadas': d.reunioes_agendadas,
            'Tx Agendamento': f"{d.tx_agendamento:.1f}%",
            'Reuniões Realizadas': d.reunioes_realizadas,
            'Tx Comparecimento': f"{d.tx_comparecimento:.1f}%",
            'Meta Reuniões': metas_dict.get(d.sdr).meta_reunioes if d.sdr in metas_dict else 0,
            '% Meta': f"{(d.reunioes_realizadas / metas_dict.get(d.sdr).meta_reunioes * 100):.1f}%" if d.sdr in metas_dict and metas_dict.get(d.sdr).meta_reunioes > 0 else "0%"
        } for d in dados])

        filename = f"sdr_{get_mes_nome(mes)}_{ano}.xlsx"
        filepath = os.path.join(EXPORT_DIR, filename)

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='SDR', index=False)

        return FileResponse(filepath, filename=filename)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")


@router.get("/closer")
async def export_closer(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db)
):
    """
    Exporta métricas de Closer para Excel.
    """
    try:
        dados = db.query(CloserMetrica).filter(
            CloserMetrica.mes == mes,
            CloserMetrica.ano == ano
        ).order_by(CloserMetrica.closer, CloserMetrica.funil).all()

        if not dados:
            raise HTTPException(status_code=404, detail="Nenhuma métrica de Closer encontrada")

        # Buscar metas da tabela Meta
        metas_dict = {}
        for metrica in dados:
            pessoa = db.query(Pessoa).filter(Pessoa.nome == metrica.closer).first()
            if pessoa:
                meta = db.query(Meta).filter(
                    Meta.pessoa_id == pessoa.id,
                    Meta.mes == mes,
                    Meta.ano == ano
                ).first()
                if meta:
                    metas_dict[metrica.closer] = meta

        df = pd.DataFrame([{
            'Closer': d.closer,
            'Funil': d.funil,
            'Calls Agendadas': d.calls_agendadas,
            'Calls Realizadas': d.calls_realizadas,
            'Tx Comparecimento': f"{d.tx_comparecimento:.1f}%",
            'Vendas': d.vendas,
            'Tx Conversão': f"{d.tx_conversao:.1f}%",
            'Faturamento': d.faturamento,
            'Ticket Médio': d.ticket_medio,
            'Meta Vendas': metas_dict.get(d.closer).meta_vendas if d.closer in metas_dict else 0,
            '% Meta Vendas': f"{(d.vendas / metas_dict.get(d.closer).meta_vendas * 100):.1f}%" if d.closer in metas_dict and metas_dict.get(d.closer).meta_vendas > 0 else "0%",
            'Meta Faturamento': metas_dict.get(d.closer).meta_faturamento if d.closer in metas_dict else 0,
            '% Meta Fatur.': f"{(d.faturamento / metas_dict.get(d.closer).meta_faturamento * 100):.1f}%" if d.closer in metas_dict and metas_dict.get(d.closer).meta_faturamento > 0 else "0%"
        } for d in dados])

        filename = f"closer_{get_mes_nome(mes)}_{ano}.xlsx"
        filepath = os.path.join(EXPORT_DIR, filename)

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Closer', index=False)

        return FileResponse(filepath, filename=filename)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")


@router.get("/completo")
async def export_completo(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db)
):
    """
    Exporta todos os dados em um único Excel com múltiplas abas.
    """
    try:
        filename = f"medgm_completo_{get_mes_nome(mes)}_{ano}.xlsx"
        filepath = os.path.join(EXPORT_DIR, filename)

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            # Aba Financeiro
            fin = db.query(Financeiro).filter(
                Financeiro.mes == mes,
                Financeiro.ano == ano
            ).order_by(Financeiro.data.desc()).all()

            if fin:
                df_fin = pd.DataFrame([{
                    'ID': d.id,
                    'Tipo': 'Entrada' if d.tipo == 'entrada' else 'Saída',
                    'Data': d.data.strftime('%d/%m/%Y') if d.data else '',
                    'Categoria': d.categoria or '',
                    'Descrição': d.descricao or '',
                    'Valor': d.valor,
                    'Previsto/Realizado': d.previsto_realizado or ''
                } for d in fin])
                df_fin.to_excel(writer, sheet_name='Financeiro', index=False)
            else:
                pd.DataFrame({'Info': ['Sem dados financeiros neste período']}).to_excel(
                    writer, sheet_name='Financeiro', index=False
                )

            # Aba Vendas
            vendas = db.query(Venda).filter(
                Venda.mes == mes,
                Venda.ano == ano
            ).order_by(Venda.data.desc()).all()

            if vendas:
                df_vendas = pd.DataFrame([{
                    'ID': d.id,
                    'Data': d.data.strftime('%d/%m/%Y') if d.data else '',
                    'Cliente': d.cliente or '',
                    'Valor Bruto': d.valor_bruto or d.valor or 0,
                    'Valor Líquido': d.valor_liquido or d.valor or 0,
                    'Funil': d.funil or '',
                    'Vendedor': d.vendedor or '',
                    'Closer': d.closer or '',
                    'Produto': d.produto or ''
                } for d in vendas])
                df_vendas.to_excel(writer, sheet_name='Vendas', index=False)
            else:
                pd.DataFrame({'Info': ['Sem vendas neste período']}).to_excel(
                    writer, sheet_name='Vendas', index=False
                )

            # Aba Social Selling
            ss = db.query(SocialSellingMetrica).filter(
                SocialSellingMetrica.mes == mes,
                SocialSellingMetrica.ano == ano
            ).all()

            if ss:
                df_ss = pd.DataFrame([{
                    'Vendedor': d.vendedor,
                    'Ativações': d.ativacoes,
                    'Meta Ativações': d.meta_ativacoes,
                    'Conversões': d.conversoes,
                    'Tx Ativ>Conv': f"{d.tx_ativ_conv:.1f}%",
                    'Leads': d.leads_gerados,
                    'Meta Leads': d.meta_leads,
                    'Tx Conv>Lead': f"{d.tx_conv_lead:.1f}%"
                } for d in ss])
                df_ss.to_excel(writer, sheet_name='Social Selling', index=False)
            else:
                pd.DataFrame({'Info': ['Sem métricas de Social Selling neste período']}).to_excel(
                    writer, sheet_name='Social Selling', index=False
                )

            # Aba SDR
            sdr = db.query(SDRMetrica).filter(
                SDRMetrica.mes == mes,
                SDRMetrica.ano == ano
            ).all()

            if sdr:
                df_sdr = pd.DataFrame([{
                    'SDR': d.sdr,
                    'Funil': d.funil,
                    'Leads': d.leads_recebidos,
                    'Agendadas': d.reunioes_agendadas,
                    'Tx Agend.': f"{d.tx_agendamento:.1f}%",
                    'Realizadas': d.reunioes_realizadas,
                    'Tx Comp.': f"{d.tx_comparecimento:.1f}%",
                    'Meta': d.meta_reunioes
                } for d in sdr])
                df_sdr.to_excel(writer, sheet_name='SDR', index=False)
            else:
                pd.DataFrame({'Info': ['Sem métricas de SDR neste período']}).to_excel(
                    writer, sheet_name='SDR', index=False
                )

            # Aba Closer
            closer = db.query(CloserMetrica).filter(
                CloserMetrica.mes == mes,
                CloserMetrica.ano == ano
            ).all()

            if closer:
                df_closer = pd.DataFrame([{
                    'Closer': d.closer,
                    'Funil': d.funil,
                    'Calls Agend.': d.calls_agendadas,
                    'Calls Real.': d.calls_realizadas,
                    'Tx Comp.': f"{d.tx_comparecimento:.1f}%",
                    'Vendas': d.vendas,
                    'Tx Conv.': f"{d.tx_conversao:.1f}%",
                    'Faturamento': d.faturamento,
                    'Ticket': d.ticket_medio
                } for d in closer])
                df_closer.to_excel(writer, sheet_name='Closer', index=False)
            else:
                pd.DataFrame({'Info': ['Sem métricas de Closer neste período']}).to_excel(
                    writer, sheet_name='Closer', index=False
                )

            # Aba Resumo
            total_entradas = sum(d.valor for d in fin if d.tipo == 'entrada') if fin else 0
            total_saidas = sum(d.valor for d in fin if d.tipo == 'saida') if fin else 0
            total_vendas = len(vendas) if vendas else 0
            total_faturamento = sum((d.valor_bruto or d.valor or 0) for d in vendas) if vendas else 0

            resumo_data = {
                'Métrica': [
                    'Período',
                    'Total Entradas',
                    'Total Saídas',
                    'Saldo',
                    'Total Vendas',
                    'Faturamento',
                    'Ticket Médio',
                    'Data Exportação'
                ],
                'Valor': [
                    f"{get_mes_nome(mes)} {ano}",
                    f"R$ {total_entradas:,.2f}",
                    f"R$ {total_saidas:,.2f}",
                    f"R$ {total_entradas - total_saidas:,.2f}",
                    total_vendas,
                    f"R$ {total_faturamento:,.2f}",
                    f"R$ {total_faturamento / total_vendas:,.2f}" if total_vendas > 0 else "R$ 0,00",
                    datetime.now().strftime('%d/%m/%Y %H:%M')
                ]
            }
            pd.DataFrame(resumo_data).to_excel(writer, sheet_name='Resumo', index=False)

        return FileResponse(
            filepath,
            filename=filename,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")


@router.get("/periodo")
async def export_periodo(
    mes_inicio: int = Query(..., ge=1, le=12),
    ano_inicio: int = Query(..., ge=2020, le=2030),
    mes_fim: int = Query(..., ge=1, le=12),
    ano_fim: int = Query(..., ge=2020, le=2030),
    tipo: str = Query("financeiro", description="financeiro, vendas, completo"),
    db: Session = Depends(get_db)
):
    """
    Exporta dados de um período customizado.
    """
    try:
        # Validar período
        inicio = ano_inicio * 100 + mes_inicio
        fim = ano_fim * 100 + mes_fim

        if inicio > fim:
            raise HTTPException(status_code=400, detail="Período inválido: data inicial maior que final")

        filename = f"medgm_{tipo}_{mes_inicio}_{ano_inicio}_a_{mes_fim}_{ano_fim}.xlsx"
        filepath = os.path.join(EXPORT_DIR, filename)

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            if tipo in ['financeiro', 'completo']:
                fin = db.query(Financeiro).filter(
                    (Financeiro.ano * 100 + Financeiro.mes) >= inicio,
                    (Financeiro.ano * 100 + Financeiro.mes) <= fim
                ).order_by(Financeiro.ano, Financeiro.mes, Financeiro.data).all()

                if fin:
                    df_fin = pd.DataFrame([{
                        'Mês': get_mes_nome(d.mes),
                        'Ano': d.ano,
                        'Tipo': 'Entrada' if d.tipo == 'entrada' else 'Saída',
                        'Data': d.data.strftime('%d/%m/%Y') if d.data else '',
                        'Categoria': d.categoria or '',
                        'Descrição': d.descricao or '',
                        'Valor': d.valor
                    } for d in fin])
                    df_fin.to_excel(writer, sheet_name='Financeiro', index=False)

            if tipo in ['vendas', 'completo']:
                vendas = db.query(Venda).filter(
                    (Venda.ano * 100 + Venda.mes) >= inicio,
                    (Venda.ano * 100 + Venda.mes) <= fim
                ).order_by(Venda.ano, Venda.mes, Venda.data).all()

                if vendas:
                    df_vendas = pd.DataFrame([{
                        'Mês': get_mes_nome(d.mes),
                        'Ano': d.ano,
                        'Data': d.data.strftime('%d/%m/%Y') if d.data else '',
                        'Cliente': d.cliente or '',
                        'Valor Bruto': d.valor_bruto or d.valor or 0,
                        'Valor Líquido': d.valor_liquido or d.valor or 0,
                        'Funil': d.funil or '',
                        'Vendedor': d.vendedor or '',
                        'Closer': d.closer or ''
                    } for d in vendas])
                    df_vendas.to_excel(writer, sheet_name='Vendas', index=False)

        return FileResponse(
            filepath,
            filename=filename,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")
