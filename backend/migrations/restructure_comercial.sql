-- ===================================================================
-- MIGRATION: REESTRUTURAÇÃO DO MÓDULO COMERCIAL
-- Data: 2026-02-25
-- Descrição: Remove campos de meta das tabelas de pessoas e métricas,
--            centraliza metas na tabela Meta.
--            Atualiza estrutura de ProdutoConfig.
-- ===================================================================

-- ===================================================================
-- 1. TABELA PESSOAS
-- ===================================================================
-- ANÁLISE: A tabela Pessoa JÁ ESTÁ CORRETA no modelo atual
-- ✓ Campo nivel_senioridade já existe
-- ✓ Não possui campos meta_* (já foram removidos ou nunca existiram)
-- ✓ Estrutura: id, nome, funcao, ativo, nivel_senioridade, created_at, updated_at

-- Garantir que nivel_senioridade existe (caso não exista em algum ambiente)
-- Nota: SQLite não suporta ALTER TABLE ADD COLUMN IF NOT EXISTS nativamente
-- Este comando só funcionará se a coluna não existir, caso contrário gerará erro
-- Em produção, verificar primeiro se a coluna existe antes de executar

-- ALTER TABLE pessoas ADD COLUMN nivel_senioridade INTEGER DEFAULT 1;
-- CHECK constraint será aplicado no modelo SQLAlchemy


-- ===================================================================
-- 2. TABELA PRODUTOS_CONFIG
-- ===================================================================
-- ANÁLISE: A tabela ProdutoConfig JÁ ESTÁ CORRETA no modelo atual
-- ✓ Campo 'plano' (String única) já existe
-- ✓ Campo 'status' já existe com default 'ativo'
-- ✓ Estrutura: id, nome, categoria, plano, status, ativo, created_at, updated_at

-- Caso em algum ambiente antigo ainda exista o campo 'planos' (JSON array),
-- será necessário um script Python separado para migração de dados.
-- Exemplo de conversão: ['Start', 'Select'] → criar 2 registros separados

-- Campos já existem no modelo atual, não há necessidade de ALTER TABLE


-- ===================================================================
-- 3. TABELA SOCIAL_SELLING_METRICAS
-- ===================================================================
-- ANÁLISE: A tabela SocialSellingMetrica JÁ ESTÁ CORRETA no modelo atual
-- ✓ NÃO possui campos meta_ativacoes ou meta_leads
-- ✓ Estrutura: id, mes, ano, data, vendedor, ativacoes, conversoes, leads_gerados,
--              tx_ativ_conv, tx_conv_lead, created_at, updated_at
-- ✓ Metas são buscadas da tabela Meta via pessoa_id

-- Nenhuma alteração necessária


-- ===================================================================
-- 4. TABELA SDR_METRICAS
-- ===================================================================
-- ANÁLISE: A tabela SDRMetrica JÁ ESTÁ CORRETA no modelo atual
-- ✓ NÃO possui campo meta_reunioes
-- ✓ Estrutura: id, mes, ano, data, sdr, funil, leads_recebidos, reunioes_agendadas,
--              reunioes_realizadas, tx_agendamento, tx_comparecimento, created_at, updated_at
-- ✓ Metas são buscadas da tabela Meta via pessoa_id

-- Nenhuma alteração necessária


-- ===================================================================
-- 5. TABELA CLOSER_METRICAS
-- ===================================================================
-- ANÁLISE: A tabela CloserMetrica JÁ ESTÁ CORRETA no modelo atual
-- ✓ NÃO possui campos meta_vendas ou meta_faturamento
-- ✓ JÁ POSSUI os campos booking, faturamento_bruto, faturamento_liquido
-- ✓ Estrutura: id, mes, ano, data, closer, funil, calls_agendadas, calls_realizadas,
--              vendas, faturamento (legado), booking, faturamento_bruto, faturamento_liquido,
--              tx_comparecimento, tx_conversao, ticket_medio, created_at, updated_at
-- ✓ Metas são buscadas da tabela Meta via pessoa_id

-- Nenhuma alteração necessária


-- ===================================================================
-- CONCLUSÃO DA MIGRATION
-- ===================================================================
--
-- STATUS: ✅ TODOS OS MODELOS JÁ ESTÃO CORRETOS
--
-- A estrutura atual dos modelos SQLAlchemy já reflete o design desejado:
--
-- 1. Pessoa: Sem campos de meta, com nivel_senioridade
-- 2. ProdutoConfig: Com 'plano' (string única) e 'status'
-- 3. SocialSellingMetrica: Sem campos de meta
-- 4. SDRMetrica: Sem campos de meta
-- 5. CloserMetrica: Sem campos de meta, com booking/faturamento_bruto/faturamento_liquido
-- 6. Meta: Tabela centralizada com todas as metas por pessoa/mês
--
-- AÇÃO RECOMENDADA:
-- - Não é necessário executar esta migration em ambientes que já usam o modelo atual
-- - Se houver ambientes legados com estruturas antigas, será necessário:
--   a) Script de análise do schema atual
--   b) Migration condicional baseada no schema detectado
--   c) Script Python para migração de dados (ex: planos JSON → registros separados)
--
-- PRÓXIMOS PASSOS:
-- 1. Verificar schemas de todos os routers estão sincronizados com os modelos
-- 2. Atualizar documentação da API
-- 3. Testar endpoints para garantir que não há referência a campos antigos
--
-- ===================================================================
