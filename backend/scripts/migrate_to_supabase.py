"""
Script para migrar dados do SQLite para Supabase PostgreSQL.

Uso:
    python scripts/migrate_to_supabase.py

Requer:
    - .env com DATABASE_URL do Supabase
    - SQLite database em data/medgm_analytics.db
"""

import sqlite3
import os
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configurações
SQLITE_PATH = "data/medgm_analytics.db"
POSTGRES_URL = os.getenv("DATABASE_URL")

if not POSTGRES_URL:
    print("❌ Erro: DATABASE_URL não encontrado no .env")
    print("Configure a URL do Supabase no arquivo .env:")
    print("DATABASE_URL=postgresql://user:password@host:port/database")
    sys.exit(1)

# Tabelas a migrar (ordem importa por causa de relacionamentos)
TABLES = [
    "pessoas",
    "produtos_config",
    "funis_config",
    "metas_empresa",
    "metas",
    "kpis",
    "social_selling_metricas",
    "sdr_metricas",
    "closer_metricas",
    "vendas",
    "financeiro",
    "projecao_receita",
    "investimento_trafego"
]


def get_table_columns(sqlite_conn, table_name):
    """Obtém lista de colunas de uma tabela SQLite."""
    cursor = sqlite_conn.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return columns


def migrate_table(sqlite_conn, pg_engine, table_name):
    """Migra uma tabela do SQLite para PostgreSQL."""
    print(f"\n📊 Migrando tabela: {table_name}")

    # Verifica se tabela existe no SQLite
    cursor = sqlite_conn.execute(
        f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"
    )
    if not cursor.fetchone():
        print(f"   ⚠️  Tabela {table_name} não existe no SQLite, pulando...")
        return

    # Obtém colunas
    columns = get_table_columns(sqlite_conn, table_name)
    if not columns:
        print(f"   ⚠️  Tabela {table_name} não tem colunas, pulando...")
        return

    # Lê dados do SQLite (excluindo id para usar SERIAL do PostgreSQL)
    columns_no_id = [c for c in columns if c != 'id']
    columns_str = ', '.join(columns_no_id)

    cursor = sqlite_conn.execute(f"SELECT {columns_str} FROM {table_name}")
    rows = cursor.fetchall()

    if not rows:
        print(f"   ℹ️  Tabela {table_name} está vazia, pulando...")
        return

    print(f"   📝 {len(rows)} registros encontrados")

    # Insere no PostgreSQL
    with pg_engine.connect() as conn:
        # Limpa tabela de destino
        conn.execute(text(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE"))
        conn.commit()

        # Prepara placeholders
        placeholders = ', '.join([f':{col}' for col in columns_no_id])
        insert_sql = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"

        # Insere em lote
        for row in rows:
            row_dict = dict(zip(columns_no_id, row))
            conn.execute(text(insert_sql), row_dict)

        conn.commit()
        print(f"   ✅ {len(rows)} registros migrados com sucesso")


def main():
    print("=" * 60)
    print("🚀 Migração SQLite → Supabase PostgreSQL")
    print("=" * 60)

    # Conecta ao SQLite
    if not os.path.exists(SQLITE_PATH):
        print(f"❌ Erro: Database SQLite não encontrado em {SQLITE_PATH}")
        sys.exit(1)

    print(f"\n📂 Conectando ao SQLite: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)

    # Conecta ao PostgreSQL
    print(f"🐘 Conectando ao PostgreSQL: {POSTGRES_URL[:50]}...")
    pg_engine = create_engine(POSTGRES_URL)

    # Testa conexão
    try:
        with pg_engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Conexão PostgreSQL estabelecida")
    except Exception as e:
        print(f"❌ Erro ao conectar ao PostgreSQL: {e}")
        sys.exit(1)

    # Migra cada tabela
    print("\n" + "=" * 60)
    print("📦 Iniciando migração de dados")
    print("=" * 60)

    for table in TABLES:
        try:
            migrate_table(sqlite_conn, pg_engine, table)
        except Exception as e:
            print(f"   ❌ Erro ao migrar {table}: {e}")
            print(f"      Continuando com próxima tabela...")

    # Fecha conexões
    sqlite_conn.close()
    pg_engine.dispose()

    print("\n" + "=" * 60)
    print("✅ Migração concluída!")
    print("=" * 60)
    print("\n📋 Próximos passos:")
    print("1. Verifique os dados no Supabase Dashboard")
    print("2. Atualize o .env com DATABASE_URL do Supabase")
    print("3. Teste a aplicação com o novo banco")
    print("")


if __name__ == "__main__":
    main()
