"""
Script para popular o banco de dados com dados de teste
Gera dados realistas para Social Selling, SDR, Closer e Vendas
"""
import sys
import os
from datetime import datetime, timedelta
import random

# Adicionar o diretório app ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models.models import SocialSellingMetrica, SDRMetrica, CloserMetrica, Venda
from sqlalchemy.orm import Session

def limpar_dados_teste(db: Session):
    """Remove dados de teste existentes"""
    print("🗑️  Limpando dados de teste existentes...")

    db.query(SocialSellingMetrica).delete()
    db.query(SDRMetrica).delete()
    db.query(CloserMetrica).delete()
    db.query(Venda).delete()

    db.commit()
    print("✅ Dados antigos removidos!")

def gerar_social_selling(db: Session):
    """Gera dados de Social Selling"""
    print("\n📱 Gerando dados de Social Selling...")

    vendedores = ["Jessica Leopoldino", "Karina Carla", "Raphael Albuquerque"]
    funis = ["SS"]  # Social Selling só usa funil SS

    registros = []
    total = 0

    # Fevereiro 2026 (28 dias)
    for dia in range(1, 29):
        for vendedor in vendedores:
            # Valores realistas variando por vendedor
            if vendedor == "Jessica Leopoldino":
                ativacoes = random.randint(350, 450)
                conversoes = random.randint(2, 5)
                leads = random.randint(1, 4)
            elif vendedor == "Karina Carla":
                ativacoes = random.randint(180, 250)
                conversoes = random.randint(1, 4)
                leads = random.randint(0, 2)
            else:  # Raphael
                ativacoes = random.randint(100, 180)
                conversoes = random.randint(0, 3)
                leads = random.randint(0, 2)

            registro = SocialSellingMetrica(
                data=datetime(2026, 2, dia),
                mes=2,
                ano=2026,
                vendedor=vendedor,
                ativacoes=ativacoes,
                conversoes=conversoes,
                leads_gerados=leads
            )
            registros.append(registro)
            total += 1

    # Março 2026 (até dia 15)
    for dia in range(1, 16):
        for vendedor in vendedores:
            if vendedor == "Jessica Leopoldino":
                ativacoes = random.randint(350, 450)
                conversoes = random.randint(2, 5)
                leads = random.randint(1, 4)
            elif vendedor == "Karina Carla":
                ativacoes = random.randint(180, 250)
                conversoes = random.randint(1, 4)
                leads = random.randint(0, 2)
            else:
                ativacoes = random.randint(100, 180)
                conversoes = random.randint(0, 3)
                leads = random.randint(0, 2)

            registro = SocialSellingMetrica(
                data=datetime(2026, 3, dia),
                mes=3,
                ano=2026,
                vendedor=vendedor,
                ativacoes=ativacoes,
                conversoes=conversoes,
                leads_gerados=leads
            )
            registros.append(registro)
            total += 1

    db.bulk_save_objects(registros)
    db.commit()
    print(f"✅ {total} registros de Social Selling criados!")

def gerar_sdr(db: Session):
    """Gera dados de SDR"""
    print("\n📞 Gerando dados de SDR...")

    sdrs = ["Ana Silva", "Bruno Costa", "Carlos Mendes"]
    funis = ["SS", "Isca", "Quiz"]

    registros = []
    total = 0

    # Fevereiro 2026
    for dia in range(1, 29):
        for sdr in sdrs:
            for funil in funis:
                # Pesos diferentes por funil
                if funil == "SS":
                    peso_leads = 0.4
                elif funil == "Isca":
                    peso_leads = 0.35
                else:  # Quiz
                    peso_leads = 0.25

                # Gerar dados com base no peso
                if random.random() < 0.7:  # 70% chance de ter dados neste dia
                    leads_base = random.randint(3, 12)
                    leads = int(leads_base * peso_leads / 0.25)  # Ajustar pelo peso

                    if leads > 0:
                        agendadas = int(leads * random.uniform(0.3, 0.5))
                        realizadas = int(agendadas * random.uniform(0.6, 0.8))

                        registro = SDRMetrica(
                            data=datetime(2026, 2, dia),
                            mes=2,
                            ano=2026,
                            sdr=sdr,
                            funil=funil,
                            leads_recebidos=leads,
                            reunioes_agendadas=agendadas,
                            reunioes_realizadas=realizadas
                        )
                        registros.append(registro)
                        total += 1

    # Março 2026 (até dia 15)
    for dia in range(1, 16):
        for sdr in sdrs:
            for funil in funis:
                if funil == "SS":
                    peso_leads = 0.4
                elif funil == "Isca":
                    peso_leads = 0.35
                else:
                    peso_leads = 0.25

                if random.random() < 0.7:
                    leads_base = random.randint(3, 12)
                    leads = int(leads_base * peso_leads / 0.25)

                    if leads > 0:
                        agendadas = int(leads * random.uniform(0.3, 0.5))
                        realizadas = int(agendadas * random.uniform(0.6, 0.8))

                        registro = SDRMetrica(
                            data=datetime(2026, 3, dia),
                            mes=3,
                            ano=2026,
                            sdr=sdr,
                            funil=funil,
                            leads_recebidos=leads,
                            reunioes_agendadas=agendadas,
                            reunioes_realizadas=realizadas
                        )
                        registros.append(registro)
                        total += 1

    db.bulk_save_objects(registros)
    db.commit()
    print(f"✅ {total} registros de SDR criados!")

def gerar_closer(db: Session):
    """Gera dados de Closer"""
    print("\n🎯 Gerando dados de Closer...")

    closers = ["João Vendedor", "Maria Fechadora", "Pedro Closer"]
    funis = ["SS", "Isca", "Quiz"]

    registros = []
    total = 0

    # Fevereiro 2026
    for dia in range(1, 29):
        for closer in closers:
            for funil in funis:
                # Peso por funil (Quiz tem mais conversão)
                if funil == "Quiz":
                    peso = 0.45
                elif funil == "SS":
                    peso = 0.35
                else:  # Isca
                    peso = 0.20

                if random.random() < 0.6:  # 60% chance de ter dados
                    calls_base = random.randint(2, 8)
                    calls_agendadas = int(calls_base * peso / 0.3)

                    if calls_agendadas > 0:
                        calls_realizadas = int(calls_agendadas * random.uniform(0.6, 0.85))
                        vendas = int(calls_realizadas * random.uniform(0.2, 0.4))

                        # Ticket médio varia por funil
                        if funil == "Quiz":
                            ticket_medio = random.uniform(3500, 6000)
                        elif funil == "SS":
                            ticket_medio = random.uniform(4000, 7000)
                        else:
                            ticket_medio = random.uniform(3000, 5500)

                        faturamento = vendas * ticket_medio

                        registro = CloserMetrica(
                            data=datetime(2026, 2, dia),
                            mes=2,
                            ano=2026,
                            closer=closer,
                            funil=funil,
                            calls_agendadas=calls_agendadas,
                            calls_realizadas=calls_realizadas,
                            vendas=vendas,
                            faturamento_bruto=round(faturamento, 2)
                        )
                        registros.append(registro)
                        total += 1

    # Março 2026 (até dia 15)
    for dia in range(1, 16):
        for closer in closers:
            for funil in funis:
                if funil == "Quiz":
                    peso = 0.45
                elif funil == "SS":
                    peso = 0.35
                else:
                    peso = 0.20

                if random.random() < 0.6:
                    calls_base = random.randint(2, 8)
                    calls_agendadas = int(calls_base * peso / 0.3)

                    if calls_agendadas > 0:
                        calls_realizadas = int(calls_agendadas * random.uniform(0.6, 0.85))
                        vendas = int(calls_realizadas * random.uniform(0.2, 0.4))

                        if funil == "Quiz":
                            ticket_medio = random.uniform(3500, 6000)
                        elif funil == "SS":
                            ticket_medio = random.uniform(4000, 7000)
                        else:
                            ticket_medio = random.uniform(3000, 5500)

                        faturamento = vendas * ticket_medio

                        registro = CloserMetrica(
                            data=datetime(2026, 3, dia),
                            mes=3,
                            ano=2026,
                            closer=closer,
                            funil=funil,
                            calls_agendadas=calls_agendadas,
                            calls_realizadas=calls_realizadas,
                            vendas=vendas,
                            faturamento_bruto=round(faturamento, 2)
                        )
                        registros.append(registro)
                        total += 1

    db.bulk_save_objects(registros)
    db.commit()
    print(f"✅ {total} registros de Closer criados!")

def mostrar_resumo(db: Session):
    """Mostra resumo dos dados criados"""
    print("\n" + "="*60)
    print("📊 RESUMO DOS DADOS CRIADOS")
    print("="*60)

    # Social Selling
    ss_count = db.query(SocialSellingMetrica).count()
    ss_fev = db.query(SocialSellingMetrica).filter(SocialSellingMetrica.mes == 2, SocialSellingMetrica.ano == 2026).count()
    ss_mar = db.query(SocialSellingMetrica).filter(SocialSellingMetrica.mes == 3, SocialSellingMetrica.ano == 2026).count()

    print(f"\n📱 Social Selling: {ss_count} registros")
    print(f"   └─ Fevereiro 2026: {ss_fev}")
    print(f"   └─ Março 2026: {ss_mar}")

    # SDR
    sdr_count = db.query(SDRMetrica).count()
    sdr_fev = db.query(SDRMetrica).filter(SDRMetrica.mes == 2, SDRMetrica.ano == 2026).count()
    sdr_mar = db.query(SDRMetrica).filter(SDRMetrica.mes == 3, SDRMetrica.ano == 2026).count()

    print(f"\n📞 SDR: {sdr_count} registros")
    print(f"   └─ Fevereiro 2026: {sdr_fev}")
    print(f"   └─ Março 2026: {sdr_mar}")

    # Por funil (SDR)
    from sqlalchemy import func
    funis_sdr = db.query(SDRMetrica.funil, func.count(SDRMetrica.id)).group_by(SDRMetrica.funil).all()
    print(f"   Por Funil:")
    for funil, count in funis_sdr:
        print(f"      └─ {funil}: {count} registros")

    # Closer
    closer_count = db.query(CloserMetrica).count()
    closer_fev = db.query(CloserMetrica).filter(CloserMetrica.mes == 2, CloserMetrica.ano == 2026).count()
    closer_mar = db.query(CloserMetrica).filter(CloserMetrica.mes == 3, CloserMetrica.ano == 2026).count()

    print(f"\n🎯 Closer: {closer_count} registros")
    print(f"   └─ Fevereiro 2026: {closer_fev}")
    print(f"   └─ Março 2026: {closer_mar}")

    # Por funil (Closer)
    funis_closer = db.query(CloserMetrica.funil, func.count(CloserMetrica.id)).group_by(CloserMetrica.funil).all()
    print(f"   Por Funil:")
    for funil, count in funis_closer:
        print(f"      └─ {funil}: {count} registros")

    # Totais por funil (leads + vendas)
    print(f"\n🎯 TOTAIS POR ORIGEM (Março 2026):")
    for funil_nome in ["SS", "Isca", "Quiz"]:
        from sqlalchemy import func
        sdr_totals = db.query(
            func.sum(SDRMetrica.leads_recebidos).label('leads'),
            func.sum(SDRMetrica.reunioes_realizadas).label('realizadas')
        ).filter(
            SDRMetrica.mes == 3,
            SDRMetrica.ano == 2026,
            SDRMetrica.funil == funil_nome
        ).first()

        closer_totals = db.query(
            func.sum(CloserMetrica.vendas).label('vendas')
        ).filter(
            CloserMetrica.mes == 3,
            CloserMetrica.ano == 2026,
            CloserMetrica.funil == funil_nome
        ).first()

        leads = sdr_totals.leads or 0 if sdr_totals else 0
        realizadas = sdr_totals.realizadas or 0 if sdr_totals else 0
        vendas = closer_totals.vendas or 0 if closer_totals else 0

        print(f"   {funil_nome}:")
        print(f"      └─ Leads: {leads}")
        print(f"      └─ Realizadas: {realizadas}")
        print(f"      └─ Vendas: {vendas}")

    print("\n" + "="*60)
    print("✅ Dados de teste criados com sucesso!")
    print("="*60)
    print("\n💡 Agora você pode:")
    print("   1. Acessar o dashboard e ver os dados")
    print("   2. Filtrar por mês (Fevereiro ou Março 2026)")
    print("   3. Ver a seção 'Por Origem' populada")
    print("   4. Testar os gráficos e KPIs")
    print()

def main():
    print("="*60)
    print("🚀 SCRIPT DE POPULAÇÃO DE DADOS DE TESTE")
    print("="*60)

    db = SessionLocal()

    try:
        # Perguntar se quer limpar dados existentes
        resposta = input("\n⚠️  Deseja limpar dados existentes? (s/n): ").lower()
        if resposta == 's':
            limpar_dados_teste(db)

        # Gerar dados
        gerar_social_selling(db)
        gerar_sdr(db)
        gerar_closer(db)

        # Mostrar resumo
        mostrar_resumo(db)

    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
