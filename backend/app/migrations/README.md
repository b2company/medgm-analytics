# Migrations - Reestruturação Módulo Comercial e Config

## Ordem de Execução

Execute os scripts nesta ordem:

1. **001_alter_pessoa.sql** - Remover campos meta e adicionar nivel_senioridade
2. **002_alter_produto.sql** - Migrar de planos (array) para plano (string)
3. **003_alter_metricas.sql** - Remover campos meta das métricas e adicionar novos campos no Closer

## Como Executar

### Opção 1: Via psql
```bash
psql -h localhost -U seu_usuario -d nome_banco -f 001_alter_pessoa.sql
psql -h localhost -U seu_usuario -d nome_banco -f 002_alter_produto.sql
psql -h localhost -U seu_usuario -d nome_banco -f 003_alter_metricas.sql
```

### Opção 2: Via Python (aplicação)
```python
from app.database import engine
from sqlalchemy import text

with open('app/migrations/001_alter_pessoa.sql', 'r') as f:
    sql = f.read()
    with engine.begin() as conn:
        conn.execute(text(sql))
```

## Importante

### Migration 002 (Produto)
- **CRÍTICO**: Antes de dropar a coluna `planos`, execute o script Python comentado no arquivo
- O script cria um registro para cada plano no array JSON
- Só remova a coluna antiga após confirmar que todos os dados foram migrados

### Backup
Antes de executar qualquer migration, faça backup:
```bash
pg_dump -h localhost -U seu_usuario -d nome_banco > backup_completo_20260225.sql
```

## Rollback

Se precisar reverter:

### 001_alter_pessoa.sql
```sql
ALTER TABLE pessoas ADD COLUMN meta_vendas INTEGER;
ALTER TABLE pessoas ADD COLUMN meta_faturamento FLOAT;
ALTER TABLE pessoas ADD COLUMN meta_ativacoes INTEGER;
ALTER TABLE pessoas ADD COLUMN meta_leads INTEGER;
ALTER TABLE pessoas ADD COLUMN meta_reunioes INTEGER;
ALTER TABLE pessoas DROP COLUMN nivel_senioridade;
```

### 002_alter_produto.sql
```sql
ALTER TABLE produtos_config DROP CONSTRAINT produtos_config_nome_plano_unique;
ALTER TABLE produtos_config ADD CONSTRAINT produtos_config_nome_key UNIQUE (nome);
ALTER TABLE produtos_config ADD COLUMN planos TEXT;
ALTER TABLE produtos_config DROP COLUMN plano;
ALTER TABLE produtos_config DROP COLUMN status;
-- Restaurar dados do backup
```

### 003_alter_metricas.sql
```sql
ALTER TABLE social_selling_metricas ADD COLUMN meta_ativacoes INTEGER DEFAULT 0;
ALTER TABLE social_selling_metricas ADD COLUMN meta_leads INTEGER DEFAULT 0;
ALTER TABLE sdr_metricas ADD COLUMN meta_reunioes INTEGER DEFAULT 0;
ALTER TABLE closer_metricas ADD COLUMN meta_vendas INTEGER DEFAULT 0;
ALTER TABLE closer_metricas ADD COLUMN meta_faturamento FLOAT DEFAULT 0;
ALTER TABLE closer_metricas DROP COLUMN booking;
ALTER TABLE closer_metricas DROP COLUMN faturamento_bruto;
ALTER TABLE closer_metricas DROP COLUMN faturamento_liquido;
```

## Verificação Pós-Migration

Execute estas queries para verificar:

```sql
-- Verificar estrutura Pessoa
\d pessoas

-- Verificar estrutura Produto
\d produtos_config

-- Verificar estrutura Métricas
\d social_selling_metricas
\d sdr_metricas
\d closer_metricas

-- Verificar dados migrados (Produtos)
SELECT nome, plano, status FROM produtos_config;

-- Verificar pessoas com nivel_senioridade
SELECT nome, funcao, nivel_senioridade FROM pessoas;
```
