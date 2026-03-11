-- Migration 002: Alterar tabela ProdutoConfig
-- Migra de array JSON planos para plano único (string)
-- Data: 2026-02-25

-- Backup recomendado antes de executar:
-- pg_dump -t produtos_config > backup_produtos_config_20260225.sql

-- PASSO 1: Adicionar novos campos
ALTER TABLE produtos_config ADD COLUMN IF NOT EXISTS plano VARCHAR(100);
ALTER TABLE produtos_config ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';

-- PASSO 2: Migrar dados - criar registro para cada plano no array JSON
-- Este script deve ser executado manualmente após revisar os dados
-- Exemplo de script Python para fazer a migração de dados:
/*
from app.database import SessionLocal
from app.models.models import ProdutoConfig
import json

db = SessionLocal()
produtos = db.query(ProdutoConfig).all()

for produto in produtos:
    if produto.planos:
        planos_list = json.loads(produto.planos)
        # Manter o primeiro registro com o primeiro plano
        if planos_list:
            produto.plano = planos_list[0]
            db.commit()

            # Criar novos registros para os demais planos
            for plano in planos_list[1:]:
                novo_produto = ProdutoConfig(
                    nome=produto.nome,
                    categoria=produto.categoria,
                    plano=plano,
                    status='ativo',
                    ativo=produto.ativo
                )
                db.add(novo_produto)
            db.commit()

db.close()
*/

-- PASSO 3: Remover constraint unique do nome (se existir)
ALTER TABLE produtos_config DROP CONSTRAINT IF EXISTS produtos_config_nome_key;

-- PASSO 4: Adicionar constraint unique composta (nome + plano)
ALTER TABLE produtos_config ADD CONSTRAINT produtos_config_nome_plano_unique
  UNIQUE (nome, plano);

-- PASSO 5: Remover coluna antiga (SOMENTE após confirmar que a migração de dados foi bem-sucedida)
-- ALTER TABLE produtos_config DROP COLUMN planos;

-- Comentários para documentação
COMMENT ON COLUMN produtos_config.plano IS 'Plano do produto (ex: Start, Select, Anual)';
COMMENT ON COLUMN produtos_config.status IS 'Status do produto: ativo ou inativo';
