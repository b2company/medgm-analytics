"""
SQLAlchemy models for MedGM Analytics database.
"""

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base


class Venda(Base):
    """
    Tabela de vendas do comercial.
    Contém dados de todas as vendas realizadas.
    """
    __tablename__ = "vendas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    data = Column(Date, nullable=False, index=True)
    cliente = Column(String(255), nullable=True)

    # VALORES (CORRIGIDO)
    valor_bruto = Column(Float, nullable=False, default=0)  # Valor bruto da venda
    valor_liquido = Column(Float, nullable=False, default=0)  # Valor líquido após descontos
    valor = Column(Float, nullable=True)  # Campo legado - manter compatibilidade

    funil = Column(String(100), nullable=True, index=True)  # Nome do funil de vendas
    vendedor = Column(String(100), nullable=True, index=True)
    mes = Column(Integer, nullable=False, index=True)  # 1-12
    ano = Column(Integer, nullable=False, index=True)  # 2025, 2026, etc

    # Campos adicionais
    closer = Column(String(100), nullable=True, index=True)  # Nome do closer responsável
    tipo_receita = Column(String(50), nullable=True)  # Recorrência, Venda, Renovação
    produto = Column(String(200), nullable=True)  # Nome do produto
    booking = Column(Float, nullable=True)  # Valor booking
    previsto = Column(Float, nullable=True)  # Valor previsto
    valor_pago = Column(Float, nullable=True)  # Valor efetivamente pago

    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Venda(id={self.id}, cliente='{self.cliente}', valor_bruto={self.valor_bruto}, funil='{self.funil}')>"


class Financeiro(Base):
    """
    Tabela de movimentações financeiras (entradas e saídas).
    Modelo expandido com campos detalhados.
    """
    __tablename__ = "financeiro"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo = Column(String(50), nullable=False, index=True)  # 'entrada' ou 'saida'

    # ENTRADAS
    produto = Column(String(100), nullable=True)  # Assessoria, Programa de Atv, Consultoria, Outros
    plano = Column(String(100), nullable=True)  # Start, Select, Anual, Atv, Outros
    modelo = Column(String(50), nullable=True)  # MRR, TCV

    # SAÍDAS
    custo = Column(String(100), nullable=True)  # Equipe, Aluguel, Ferramenta, etc
    tipo_custo = Column(String(50), nullable=True)  # Fixo, Variável, Pontual
    centro_custo = Column(String(100), nullable=True)  # Operação, Comercial, Administrativo, Diretoria, Societário

    # COMUM
    categoria = Column(String(100), nullable=True, index=True)  # Categoria da movimentação (legado)
    descricao = Column(String(500), nullable=True)  # Descrição opcional da movimentação
    valor = Column(Float, nullable=False)
    data = Column(Date, nullable=True, index=True)
    mes = Column(Integer, nullable=False, index=True)  # 1-12
    ano = Column(Integer, nullable=False, index=True)  # 2025, 2026, etc
    previsto_realizado = Column(String(20), nullable=True, default='realizado')  # 'previsto' ou 'realizado'

    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Financeiro(id={self.id}, tipo='{self.tipo}', categoria='{self.categoria}', valor={self.valor})>"


class KPI(Base):
    """
    Tabela de KPIs consolidados por mês.
    Armazena métricas calculadas mensalmente.
    """
    __tablename__ = "kpis"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mes = Column(Integer, nullable=False, index=True)  # 1-12
    ano = Column(Integer, nullable=False, index=True)  # 2025, 2026, etc

    # Métricas financeiras
    faturamento = Column(Float, default=0.0)  # Faturamento total do mês
    saldo = Column(Float, default=0.0)  # Saldo (entradas - saídas)

    # Métricas comerciais
    vendas_total = Column(Integer, default=0)  # Quantidade de vendas
    calls = Column(Integer, default=0)  # Calls realizados
    leads = Column(Integer, default=0)  # Leads gerados

    # Métricas de inteligência
    cac = Column(Float, default=0.0)  # Custo de Aquisição de Cliente
    ltv = Column(Float, default=0.0)  # Lifetime Value
    runway = Column(Float, default=0.0)  # Runway em meses

    # Funil de conversão
    leads_mkt = Column(Integer, default=0)  # Leads vindos de marketing
    leads_sdr = Column(Integer, default=0)  # Leads qualificados por SDR
    leads_closer = Column(Integer, default=0)  # Leads passados para closer

    # Conversões (%)
    conv_mkt_sdr = Column(Float, default=0.0)  # % conversão MKT -> SDR
    conv_sdr_closer = Column(Float, default=0.0)  # % conversão SDR -> Closer
    conv_closer_venda = Column(Float, default=0.0)  # % conversão Closer -> Venda

    # Metadados
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<KPI(mes={self.mes}, ano={self.ano}, faturamento={self.faturamento}, vendas={self.vendas_total})>"


class SocialSellingMetrica(Base):
    """
    Tabela de métricas de Social Selling (MKT).
    Acompanha ativações, conversões e leads gerados por vendedor.
    Metas são centralizadas na tabela Meta.
    """
    __tablename__ = "social_selling_metricas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mes = Column(Integer, nullable=False, index=True)
    ano = Column(Integer, nullable=False, index=True)
    data = Column(Date, nullable=True, index=True)  # Data específica da métrica
    vendedor = Column(String(100), nullable=False, index=True)  # Nome do vendedor SS

    # Métricas principais
    ativacoes = Column(Integer, default=0)
    conversoes = Column(Integer, default=0)
    leads_gerados = Column(Integer, default=0)

    # Taxas calculadas automaticamente
    tx_ativ_conv = Column(Float, default=0.0)  # conversoes / ativacoes * 100
    tx_conv_lead = Column(Float, default=0.0)  # leads / conversoes * 100

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<SocialSellingMetrica(id={self.id}, vendedor='{self.vendedor}', mes={self.mes}, ano={self.ano})>"


class SDRMetrica(Base):
    """
    Tabela de métricas de SDR.
    Acompanha leads recebidos, reuniões agendadas e realizadas por SDR e funil.
    Metas são centralizadas na tabela Meta.
    """
    __tablename__ = "sdr_metricas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mes = Column(Integer, nullable=False, index=True)
    ano = Column(Integer, nullable=False, index=True)
    data = Column(Date, nullable=True, index=True)  # Data específica da métrica
    sdr = Column(String(100), nullable=False, index=True)  # Nome do SDR
    funil = Column(String(100), nullable=False, index=True)  # SS, Quiz, Indicacao, Webinario

    # Métricas principais
    leads_recebidos = Column(Integer, default=0)
    reunioes_agendadas = Column(Integer, default=0)
    reunioes_realizadas = Column(Integer, default=0)

    # Taxas calculadas
    tx_agendamento = Column(Float, default=0.0)  # agendadas / recebidos * 100
    tx_comparecimento = Column(Float, default=0.0)  # realizadas / agendadas * 100

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<SDRMetrica(id={self.id}, sdr='{self.sdr}', funil='{self.funil}', mes={self.mes}, ano={self.ano})>"


class CloserMetrica(Base):
    """
    Tabela de métricas de Closer.
    Acompanha calls agendadas, realizadas, vendas e faturamento por closer e funil.
    Metas são centralizadas na tabela Meta.
    """
    __tablename__ = "closer_metricas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mes = Column(Integer, nullable=False, index=True)
    ano = Column(Integer, nullable=False, index=True)
    data = Column(Date, nullable=True, index=True)  # Data específica da métrica
    closer = Column(String(100), nullable=False, index=True)  # Nome do Closer
    funil = Column(String(100), nullable=False, index=True)  # SS, Quiz, Indicacao, Webinario

    # Métricas principais
    calls_agendadas = Column(Integer, default=0)
    calls_realizadas = Column(Integer, default=0)
    vendas = Column(Integer, default=0)
    faturamento = Column(Float, default=0.0)  # Campo legado - manter compatibilidade

    # Novos campos financeiros detalhados
    booking = Column(Float, default=0.0)  # Valor booking (vendas comprometidas)
    faturamento_bruto = Column(Float, default=0.0)  # Faturamento bruto total
    faturamento_liquido = Column(Float, default=0.0)  # Faturamento líquido após descontos

    # Taxas calculadas
    tx_comparecimento = Column(Float, default=0.0)  # realizadas / agendadas * 100
    tx_conversao = Column(Float, default=0.0)  # vendas / realizadas * 100
    ticket_medio = Column(Float, default=0.0)  # faturamento / vendas

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<CloserMetrica(id={self.id}, closer='{self.closer}', funil='{self.funil}', mes={self.mes}, ano={self.ano})>"


# ==================== NOVOS MODELOS DE CONFIGURAÇÃO ====================

class Pessoa(Base):
    """
    Cadastro de pessoas do time.
    Usado para configuração de equipe e metas.
    """
    __tablename__ = "pessoas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False, unique=True)
    funcao = Column(String(50), nullable=False)  # social_selling, sdr, closer
    ativo = Column(Boolean, default=True)
    nivel_senioridade = Column(Integer, default=1)  # 1 (Júnior) a 7 (C-Level)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Pessoa(id={self.id}, nome='{self.nome}', funcao='{self.funcao}')>"


class ProdutoConfig(Base):
    """
    Cadastro de produtos e serviços.
    """
    __tablename__ = "produtos_config"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    categoria = Column(String(100), nullable=True)  # Assessoria, Consultoria, Programa
    plano = Column(String(100), nullable=True)  # String única: Start, Select, Anual, etc
    status = Column(String(20), default='ativo')  # ativo ou inativo
    ativo = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ProdutoConfig(id={self.id}, nome='{self.nome}', plano='{self.plano}')>"


class FunilConfig(Base):
    """
    Cadastro de funis de venda.
    """
    __tablename__ = "funis_config"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(String(255), nullable=True)
    ativo = Column(Boolean, default=True)
    ordem = Column(Integer, default=0)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<FunilConfig(id={self.id}, nome='{self.nome}')>"


# ==================== NOVOS MODELOS DE METAS ====================

class Meta(Base):
    """
    Metas mensais por pessoa.
    Permite acompanhar metas vs realizado por mes.
    """
    __tablename__ = "metas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mes = Column(Integer, nullable=False, index=True)
    ano = Column(Integer, nullable=False, index=True)
    tipo = Column(String(20), nullable=False, default="pessoa")  # pessoa | empresa
    pessoa_id = Column(Integer, nullable=True, index=True)

    # Metas possiveis
    meta_ativacoes = Column(Integer, nullable=True)
    meta_leads = Column(Integer, nullable=True)
    meta_reunioes_agendadas = Column(Integer, nullable=True)  # SDR: meta de reuniões agendadas
    meta_reunioes = Column(Integer, nullable=True)  # SDR: meta de reuniões realizadas (legado)
    meta_vendas = Column(Integer, nullable=True)
    meta_faturamento = Column(Float, nullable=True)

    # Realizado (calculado automaticamente)
    realizado_ativacoes = Column(Integer, nullable=True)
    realizado_leads = Column(Integer, nullable=True)
    realizado_reunioes_agendadas = Column(Integer, nullable=True)
    realizado_reunioes = Column(Integer, nullable=True)
    realizado_vendas = Column(Integer, nullable=True)
    realizado_faturamento = Column(Float, nullable=True)

    # Delta (realizado - meta)
    delta_ativacoes = Column(Integer, nullable=True)
    delta_leads = Column(Integer, nullable=True)
    delta_reunioes_agendadas = Column(Integer, nullable=True)
    delta_reunioes = Column(Integer, nullable=True)
    delta_vendas = Column(Integer, nullable=True)
    delta_faturamento = Column(Float, nullable=True)

    # % Atingimento
    perc_atingimento = Column(Float, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Meta(id={self.id}, mes={self.mes}, ano={self.ano}, pessoa_id={self.pessoa_id})>"


class MetaEmpresa(Base):
    """
    Meta anual da empresa.
    Meta de faturamento (5M) e caixa (1M).
    """
    __tablename__ = "metas_empresa"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ano = Column(Integer, nullable=False, unique=True, index=True)

    # Metas anuais
    meta_faturamento_anual = Column(Float, nullable=False, default=5000000.0)  # 5M
    meta_caixa_anual = Column(Float, nullable=False, default=1000000.0)  # 1M

    # Valores realizados (calculados)
    faturamento_acumulado = Column(Float, nullable=True, default=0)
    caixa_atual = Column(Float, nullable=True, default=0)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<MetaEmpresa(id={self.id}, ano={self.ano}, meta_fat={self.meta_faturamento_anual})>"


# ==================== MODELOS PARA BUSINESS PLAN ====================

class ProjecaoReceita(Base):
    """
    Projecao de receita por canal e mes para o Business Plan.
    """
    __tablename__ = "projecao_receita"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ano = Column(Integer, nullable=False, index=True)
    mes = Column(Integer, nullable=False, index=True)
    canal = Column(String(100), nullable=False)  # Social Selling, Trafego Pago, etc
    receita_projetada = Column(Float, nullable=False, default=0)
    vendas_projetadas = Column(Integer, nullable=False, default=0)
    receita_realizada = Column(Float, nullable=True)
    vendas_realizadas = Column(Integer, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ProjecaoReceita(id={self.id}, ano={self.ano}, mes={self.mes}, canal='{self.canal}')>"


class InvestimentoTrafego(Base):
    """
    Investimento em trafego pago por mes.
    """
    __tablename__ = "investimento_trafego"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ano = Column(Integer, nullable=False, index=True)
    mes = Column(Integer, nullable=False, index=True)
    budget = Column(Float, nullable=False, default=0)
    cpl_medio = Column(Float, nullable=False, default=0)  # Custo por Lead
    leads_projetados = Column(Integer, nullable=False, default=0)
    roi_projetado = Column(Float, nullable=False, default=0)
    gasto_real = Column(Float, nullable=True)
    leads_reais = Column(Integer, nullable=True)
    roi_real = Column(Float, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<InvestimentoTrafego(id={self.id}, ano={self.ano}, mes={self.mes}, budget={self.budget})>"
