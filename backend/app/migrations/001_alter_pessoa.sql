-- Migration 001: Alterar tabela Pessoa
-- Remove campos de meta e adiciona nivel_senioridade
-- Data: 2026-02-25

-- Backup recomendado antes de executar:
-- pg_dump -t pessoas > backup_pessoas_20260225.sql

-- Remover campos de meta
ALTER TABLE pessoas DROP COLUMN IF EXISTS meta_vendas;
ALTER TABLE pessoas DROP COLUMN IF EXISTS meta_faturamento;
ALTER TABLE pessoas DROP COLUMN IF EXISTS meta_ativacoes;
ALTER TABLE pessoas DROP COLUMN IF EXISTS meta_leads;
ALTER TABLE pessoas DROP COLUMN IF EXISTS meta_reunioes;

-- Adicionar nível senioridade (1-7)
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS nivel_senioridade INTEGER DEFAULT 1
  CHECK (nivel_senioridade BETWEEN 1 AND 7);

-- Comentários para documentação
COMMENT ON COLUMN pessoas.nivel_senioridade IS 'Nível de senioridade da pessoa: 1 (Júnior) a 7 (C-Level)';
