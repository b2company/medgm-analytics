-- ==========================================
-- MedGM Analytics - Supabase PostgreSQL Schema
-- ==========================================

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    cliente VARCHAR(255),
    valor_bruto FLOAT NOT NULL DEFAULT 0,
    valor_liquido FLOAT NOT NULL DEFAULT 0,
    valor FLOAT,
    funil VARCHAR(100),
    vendedor VARCHAR(100),
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    closer VARCHAR(100),
    tipo_receita VARCHAR(50),
    produto VARCHAR(200),
    booking FLOAT,
    previsto FLOAT,
    valor_pago FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendas_data ON vendas(data);
CREATE INDEX idx_vendas_funil ON vendas(funil);
CREATE INDEX idx_vendas_vendedor ON vendas(vendedor);
CREATE INDEX idx_vendas_mes ON vendas(mes);
CREATE INDEX idx_vendas_ano ON vendas(ano);
CREATE INDEX idx_vendas_closer ON vendas(closer);

-- Tabela Financeiro
CREATE TABLE IF NOT EXISTS financeiro (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    produto VARCHAR(100),
    plano VARCHAR(100),
    modelo VARCHAR(50),
    custo VARCHAR(100),
    tipo_custo VARCHAR(50),
    centro_custo VARCHAR(100),
    categoria VARCHAR(100),
    descricao VARCHAR(500),
    valor FLOAT NOT NULL,
    data DATE,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    previsto_realizado VARCHAR(20) DEFAULT 'realizado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financeiro_tipo ON financeiro(tipo);
CREATE INDEX idx_financeiro_categoria ON financeiro(categoria);
CREATE INDEX idx_financeiro_data ON financeiro(data);
CREATE INDEX idx_financeiro_mes ON financeiro(mes);
CREATE INDEX idx_financeiro_ano ON financeiro(ano);

-- Tabela KPIs
CREATE TABLE IF NOT EXISTS kpis (
    id SERIAL PRIMARY KEY,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    faturamento FLOAT DEFAULT 0.0,
    saldo FLOAT DEFAULT 0.0,
    vendas_total INTEGER DEFAULT 0,
    calls INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    cac FLOAT DEFAULT 0.0,
    ltv FLOAT DEFAULT 0.0,
    runway FLOAT DEFAULT 0.0,
    leads_mkt INTEGER DEFAULT 0,
    leads_sdr INTEGER DEFAULT 0,
    leads_closer INTEGER DEFAULT 0,
    conv_mkt_sdr FLOAT DEFAULT 0.0,
    conv_sdr_closer FLOAT DEFAULT 0.0,
    conv_closer_venda FLOAT DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kpis_mes ON kpis(mes);
CREATE INDEX idx_kpis_ano ON kpis(ano);

-- Tabela Social Selling Metricas
CREATE TABLE IF NOT EXISTS social_selling_metricas (
    id SERIAL PRIMARY KEY,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    data DATE,
    vendedor VARCHAR(100) NOT NULL,
    ativacoes INTEGER DEFAULT 0,
    conversoes INTEGER DEFAULT 0,
    leads_gerados INTEGER DEFAULT 0,
    tx_ativ_conv FLOAT DEFAULT 0.0,
    tx_conv_lead FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ss_mes ON social_selling_metricas(mes);
CREATE INDEX idx_ss_ano ON social_selling_metricas(ano);
CREATE INDEX idx_ss_data ON social_selling_metricas(data);
CREATE INDEX idx_ss_vendedor ON social_selling_metricas(vendedor);

-- Tabela SDR Metricas
CREATE TABLE IF NOT EXISTS sdr_metricas (
    id SERIAL PRIMARY KEY,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    data DATE,
    sdr VARCHAR(100) NOT NULL,
    funil VARCHAR(100) NOT NULL,
    leads_recebidos INTEGER DEFAULT 0,
    reunioes_agendadas INTEGER DEFAULT 0,
    reunioes_realizadas INTEGER DEFAULT 0,
    tx_agendamento FLOAT DEFAULT 0.0,
    tx_comparecimento FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sdr_mes ON sdr_metricas(mes);
CREATE INDEX idx_sdr_ano ON sdr_metricas(ano);
CREATE INDEX idx_sdr_data ON sdr_metricas(data);
CREATE INDEX idx_sdr_sdr ON sdr_metricas(sdr);
CREATE INDEX idx_sdr_funil ON sdr_metricas(funil);

-- Tabela Closer Metricas
CREATE TABLE IF NOT EXISTS closer_metricas (
    id SERIAL PRIMARY KEY,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    data DATE,
    closer VARCHAR(100) NOT NULL,
    funil VARCHAR(100) NOT NULL,
    calls_agendadas INTEGER DEFAULT 0,
    calls_realizadas INTEGER DEFAULT 0,
    vendas INTEGER DEFAULT 0,
    faturamento FLOAT DEFAULT 0.0,
    booking FLOAT DEFAULT 0.0,
    faturamento_bruto FLOAT DEFAULT 0.0,
    faturamento_liquido FLOAT DEFAULT 0.0,
    tx_comparecimento FLOAT DEFAULT 0.0,
    tx_conversao FLOAT DEFAULT 0.0,
    ticket_medio FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_closer_mes ON closer_metricas(mes);
CREATE INDEX idx_closer_ano ON closer_metricas(ano);
CREATE INDEX idx_closer_data ON closer_metricas(data);
CREATE INDEX idx_closer_closer ON closer_metricas(closer);
CREATE INDEX idx_closer_funil ON closer_metricas(funil);

-- Tabela Pessoas
CREATE TABLE IF NOT EXISTS pessoas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    funcao VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    nivel_senioridade INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Produtos Config
CREATE TABLE IF NOT EXISTS produtos_config (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(100),
    plano VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ativo',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Funis Config
CREATE TABLE IF NOT EXISTS funis_config (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Metas
CREATE TABLE IF NOT EXISTS metas (
    id SERIAL PRIMARY KEY,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'pessoa',
    pessoa_id INTEGER,
    meta_ativacoes INTEGER,
    meta_leads INTEGER,
    meta_reunioes_agendadas INTEGER,
    meta_reunioes INTEGER,
    meta_vendas INTEGER,
    meta_faturamento FLOAT,
    realizado_ativacoes INTEGER,
    realizado_leads INTEGER,
    realizado_reunioes_agendadas INTEGER,
    realizado_reunioes INTEGER,
    realizado_vendas INTEGER,
    realizado_faturamento FLOAT,
    delta_ativacoes INTEGER,
    delta_leads INTEGER,
    delta_reunioes_agendadas INTEGER,
    delta_reunioes INTEGER,
    delta_vendas INTEGER,
    delta_faturamento FLOAT,
    perc_atingimento FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metas_mes ON metas(mes);
CREATE INDEX idx_metas_ano ON metas(ano);
CREATE INDEX idx_metas_pessoa_id ON metas(pessoa_id);

-- Tabela Metas Empresa
CREATE TABLE IF NOT EXISTS metas_empresa (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL UNIQUE,
    meta_faturamento_anual FLOAT NOT NULL DEFAULT 5000000.0,
    meta_caixa_anual FLOAT NOT NULL DEFAULT 1000000.0,
    faturamento_acumulado FLOAT DEFAULT 0,
    caixa_atual FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metas_empresa_ano ON metas_empresa(ano);

-- Tabela Projecao Receita
CREATE TABLE IF NOT EXISTS projecao_receita (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    canal VARCHAR(100) NOT NULL,
    receita_projetada FLOAT NOT NULL DEFAULT 0,
    vendas_projetadas INTEGER NOT NULL DEFAULT 0,
    receita_realizada FLOAT,
    vendas_realizadas INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proj_receita_ano ON projecao_receita(ano);
CREATE INDEX idx_proj_receita_mes ON projecao_receita(mes);

-- Tabela Investimento Trafego
CREATE TABLE IF NOT EXISTS investimento_trafego (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    budget FLOAT NOT NULL DEFAULT 0,
    cpl_medio FLOAT NOT NULL DEFAULT 0,
    leads_projetados INTEGER NOT NULL DEFAULT 0,
    roi_projetado FLOAT NOT NULL DEFAULT 0,
    gasto_real FLOAT,
    leads_reais INTEGER,
    roi_real FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inv_trafego_ano ON investimento_trafego(ano);
CREATE INDEX idx_inv_trafego_mes ON investimento_trafego(mes);

-- ==========================================
-- Triggers para atualizar updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kpis_updated_at BEFORE UPDATE ON kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ss_updated_at BEFORE UPDATE ON social_selling_metricas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sdr_updated_at BEFORE UPDATE ON sdr_metricas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_closer_updated_at BEFORE UPDATE ON closer_metricas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON pessoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funis_updated_at BEFORE UPDATE ON funis_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metas_empresa_updated_at BEFORE UPDATE ON metas_empresa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proj_receita_updated_at BEFORE UPDATE ON projecao_receita FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inv_trafego_updated_at BEFORE UPDATE ON investimento_trafego FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
