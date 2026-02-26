-- Migration 003: Alterar tabelas de métricas
-- Remove campos meta_* das tabelas de métricas (centralizadas na tabela metas)
-- Adiciona novos campos em closer_metricas
-- Data: 2026-02-25

-- Backup recomendado antes de executar:
-- pg_dump -t social_selling_metricas -t sdr_metricas -t closer_metricas > backup_metricas_20260225.sql

-- ========== SOCIAL SELLING METRICAS ==========
ALTER TABLE social_selling_metricas DROP COLUMN IF EXISTS meta_ativacoes;
ALTER TABLE social_selling_metricas DROP COLUMN IF EXISTS meta_leads;

-- ========== SDR METRICAS ==========
ALTER TABLE sdr_metricas DROP COLUMN IF EXISTS meta_reunioes;

-- ========== CLOSER METRICAS ==========
ALTER TABLE closer_metricas DROP COLUMN IF EXISTS meta_vendas;
ALTER TABLE closer_metricas DROP COLUMN IF EXISTS meta_faturamento;

-- Adicionar novos campos financeiros para Closer
ALTER TABLE closer_metricas ADD COLUMN IF NOT EXISTS booking FLOAT DEFAULT 0;
ALTER TABLE closer_metricas ADD COLUMN IF NOT EXISTS faturamento_bruto FLOAT DEFAULT 0;
ALTER TABLE closer_metricas ADD COLUMN IF NOT EXISTS faturamento_liquido FLOAT DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN closer_metricas.booking IS 'Valor de booking (vendas comprometidas)';
COMMENT ON COLUMN closer_metricas.faturamento_bruto IS 'Faturamento bruto total';
COMMENT ON COLUMN closer_metricas.faturamento_liquido IS 'Faturamento líquido após descontos';
