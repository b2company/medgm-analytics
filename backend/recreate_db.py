#!/usr/bin/env python3
"""
Script para recriar o banco de dados do MedGM Analytics.
Execute este script para aplicar todas as mudanças no schema.

Uso:
    python recreate_db.py          # Com confirmacao
    python recreate_db.py --force  # Sem confirmacao
    python recreate_db.py --seed   # Recriar e popular com dados iniciais
"""

import sys
from app.database import engine, Base, SessionLocal
from app.models.models import (
    Venda,
    Financeiro,
    KPI,
    SocialSellingMetrica,
    SDRMetrica,
    CloserMetrica,
    Pessoa,
    ProdutoConfig,
    FunilConfig,
    Meta,
    MetaEmpresa,
    ProjecaoReceita,
    InvestimentoTrafego
)


def seed_data(db):
    """Popula o banco com dados iniciais de configuracao."""

    # Pessoas da equipe
    pessoas = [
        # Social Selling
        {"nome": "Ana Silva", "funcao": "social_selling", "meta_ativacoes": 200, "meta_leads": 40},
        {"nome": "Bruno Santos", "funcao": "social_selling", "meta_ativacoes": 200, "meta_leads": 40},
        {"nome": "Carla Oliveira", "funcao": "social_selling", "meta_ativacoes": 200, "meta_leads": 40},
        # SDRs
        {"nome": "Diego Costa", "funcao": "sdr", "meta_reunioes": 40},
        {"nome": "Elena Pereira", "funcao": "sdr", "meta_reunioes": 40},
        # Closers
        {"nome": "Felipe Lima", "funcao": "closer", "meta_vendas": 15, "meta_faturamento": 150000},
        {"nome": "Gabriela Souza", "funcao": "closer", "meta_vendas": 15, "meta_faturamento": 150000},
    ]

    for p in pessoas:
        db.add(Pessoa(**p))

    # Produtos
    produtos = [
        {"nome": "Assessoria", "categoria": "Servico", "planos": '["Start", "Select", "Premium"]'},
        {"nome": "Programa de Ativacao", "categoria": "Programa", "planos": '["30 dias", "60 dias", "90 dias"]'},
        {"nome": "Consultoria", "categoria": "Servico", "planos": '["Hora", "Projeto", "Retainer"]'},
    ]

    for p in produtos:
        db.add(ProdutoConfig(**p))

    # Funis
    funis = [
        {"nome": "Social Selling", "descricao": "Leads vindos de ativacoes em redes sociais", "ordem": 1},
        {"nome": "Quiz", "descricao": "Leads vindos de quiz de qualificacao", "ordem": 2},
        {"nome": "Indicacao", "descricao": "Leads vindos de indicacoes de clientes", "ordem": 3},
        {"nome": "Webinario", "descricao": "Leads vindos de webinarios", "ordem": 4},
        {"nome": "Trafego Pago", "descricao": "Leads vindos de anuncios pagos", "ordem": 5},
    ]

    for f in funis:
        db.add(FunilConfig(**f))

    # Meta Empresa 2026
    meta_empresa = MetaEmpresa(
        ano=2026,
        meta_faturamento_anual=5000000.0,
        meta_caixa_anual=1000000.0,
        faturamento_acumulado=0,
        caixa_atual=0
    )
    db.add(meta_empresa)

    db.commit()
    print("   Dados iniciais inseridos com sucesso!")


def main():
    force = "--force" in sys.argv or "-f" in sys.argv
    seed = "--seed" in sys.argv or "-s" in sys.argv

    print("=" * 60)
    print("  MEDGM ANALYTICS - RECRIAR BANCO DE DADOS")
    print("=" * 60)
    print()
    print("ATENCAO: Todos os dados existentes serao PERDIDOS!")
    print()

    if not force:
        resposta = input("Deseja continuar? (sim/nao): ")
        if resposta.lower() not in ['sim', 's', 'yes', 'y']:
            print("Operacao cancelada.")
            return

    print()
    print("[1/3] Removendo tabelas antigas...")
    Base.metadata.drop_all(bind=engine)
    print("      Tabelas removidas.")

    print("[2/3] Criando novas tabelas...")
    Base.metadata.create_all(bind=engine)
    print("      Tabelas criadas.")

    if seed:
        print("[3/3] Populando dados iniciais...")
        db = SessionLocal()
        try:
            seed_data(db)
        finally:
            db.close()
    else:
        print("[3/3] Pulando populacao de dados (use --seed para popular)")

    print()
    print("=" * 60)
    print("  BANCO DE DADOS RECRIADO COM SUCESSO!")
    print("=" * 60)
    print()
    print("Tabelas criadas:")
    print("   - vendas (dados de vendas comerciais)")
    print("   - financeiro (entradas e saidas)")
    print("   - kpis (metricas consolidadas)")
    print("   - social_selling_metricas (metricas SS)")
    print("   - sdr_metricas (metricas SDR)")
    print("   - closer_metricas (metricas Closer)")
    print("   - pessoas (cadastro da equipe)")
    print("   - produtos_config (cadastro de produtos)")
    print("   - funis_config (cadastro de funis)")
    print("   - metas (metas mensais por pessoa)")
    print("   - metas_empresa (meta anual da empresa)")
    print("   - projecao_receita (business plan)")
    print("   - investimento_trafego (budget trafego)")
    print()


if __name__ == "__main__":
    main()
