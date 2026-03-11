"""
Script de migration para SQLite.
SQLite não suporta DROP COLUMN diretamente, então vamos:
1. Fazer backup do banco
2. Recriar as tabelas com a nova estrutura
3. Migrar os dados
"""

import sys
import shutil
from pathlib import Path
from datetime import datetime

# Adicionar diretório raiz ao path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.database import engine, SessionLocal, DATABASE_DIR
from sqlalchemy import text, inspect
import json

def backup_database():
    """Criar backup do banco de dados"""
    db_path = Path(DATABASE_DIR) / "medgm_analytics.db"
    if not db_path.exists():
        print("⚠️  Banco de dados não encontrado. Será criado novo.")
        return None

    backup_path = Path(DATABASE_DIR) / f"medgm_analytics_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    shutil.copy2(db_path, backup_path)
    print(f"✅ Backup criado: {backup_path}")
    return backup_path


def check_column_exists(table_name, column_name):
    """Verificar se uma coluna existe em uma tabela"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def migrate_pessoas():
    """Migrar tabela pessoas"""
    print("\n=== MIGRAÇÃO: Pessoas ===")

    if not check_column_exists('pessoas', 'meta_vendas'):
        print("⏭️  Tabela pessoas já está migrada")
        return

    with engine.begin() as conn:
        # 1. Buscar dados existentes
        result = conn.execute(text("SELECT * FROM pessoas"))
        pessoas_antigas = [dict(row._mapping) for row in result]

        print(f"📊 Encontradas {len(pessoas_antigas)} pessoas")

        # 2. Renomear tabela antiga
        conn.execute(text("ALTER TABLE pessoas RENAME TO pessoas_old"))

        # 3. Criar nova tabela
        conn.execute(text("""
            CREATE TABLE pessoas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome VARCHAR(100) NOT NULL UNIQUE,
                funcao VARCHAR(50) NOT NULL,
                ativo BOOLEAN DEFAULT 1,
                nivel_senioridade INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # 4. Migrar dados
        for pessoa in pessoas_antigas:
            conn.execute(text("""
                INSERT INTO pessoas (id, nome, funcao, ativo, nivel_senioridade, created_at, updated_at)
                VALUES (:id, :nome, :funcao, :ativo, 1, :created_at, :updated_at)
            """), {
                'id': pessoa['id'],
                'nome': pessoa['nome'],
                'funcao': pessoa['funcao'],
                'ativo': pessoa['ativo'],
                'created_at': pessoa.get('created_at'),
                'updated_at': pessoa.get('updated_at')
            })

        # 5. Dropar tabela antiga
        conn.execute(text("DROP TABLE pessoas_old"))

        print(f"✅ {len(pessoas_antigas)} pessoas migradas com sucesso")


def migrate_produtos():
    """Migrar tabela produtos_config"""
    print("\n=== MIGRAÇÃO: Produtos ===")

    if not check_column_exists('produtos_config', 'planos'):
        print("⏭️  Tabela produtos_config já está migrada")
        return

    with engine.begin() as conn:
        # 1. Buscar dados existentes
        result = conn.execute(text("SELECT * FROM produtos_config"))
        produtos_antigos = [dict(row._mapping) for row in result]

        print(f"📊 Encontrados {len(produtos_antigos)} produtos")

        # 2. Renomear tabela antiga
        conn.execute(text("ALTER TABLE produtos_config RENAME TO produtos_config_old"))

        # 3. Criar nova tabela
        conn.execute(text("""
            CREATE TABLE produtos_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome VARCHAR(100) NOT NULL,
                categoria VARCHAR(100),
                plano VARCHAR(100),
                status VARCHAR(20) DEFAULT 'ativo',
                ativo BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (nome, plano)
            )
        """))

        # 4. Migrar dados - expandir produtos com múltiplos planos
        novos_registros = 0
        for produto in produtos_antigos:
            planos_str = produto.get('planos')

            if planos_str:
                try:
                    planos_list = json.loads(planos_str)
                    if isinstance(planos_list, list) and planos_list:
                        # Criar um registro para cada plano
                        for plano in planos_list:
                            conn.execute(text("""
                                INSERT INTO produtos_config (nome, categoria, plano, status, ativo, created_at, updated_at)
                                VALUES (:nome, :categoria, :plano, 'ativo', :ativo, :created_at, :updated_at)
                            """), {
                                'nome': produto['nome'],
                                'categoria': produto.get('categoria'),
                                'plano': plano,
                                'ativo': produto.get('ativo', True),
                                'created_at': produto.get('created_at'),
                                'updated_at': produto.get('updated_at')
                            })
                            novos_registros += 1
                    else:
                        # Array vazio ou inválido
                        conn.execute(text("""
                            INSERT INTO produtos_config (nome, categoria, plano, status, ativo, created_at, updated_at)
                            VALUES (:nome, :categoria, NULL, 'ativo', :ativo, :created_at, :updated_at)
                        """), {
                            'nome': produto['nome'],
                            'categoria': produto.get('categoria'),
                            'ativo': produto.get('ativo', True),
                            'created_at': produto.get('created_at'),
                            'updated_at': produto.get('updated_at')
                        })
                        novos_registros += 1
                except json.JSONDecodeError:
                    # Se não for JSON válido, usar como string única
                    conn.execute(text("""
                        INSERT INTO produtos_config (nome, categoria, plano, status, ativo, created_at, updated_at)
                        VALUES (:nome, :categoria, :plano, 'ativo', :ativo, :created_at, :updated_at)
                    """), {
                        'nome': produto['nome'],
                        'categoria': produto.get('categoria'),
                        'plano': planos_str,
                        'ativo': produto.get('ativo', True),
                        'created_at': produto.get('created_at'),
                        'updated_at': produto.get('updated_at')
                    })
                    novos_registros += 1
            else:
                # Sem planos
                conn.execute(text("""
                    INSERT INTO produtos_config (nome, categoria, plano, status, ativo, created_at, updated_at)
                    VALUES (:nome, :categoria, NULL, 'ativo', :ativo, :created_at, :updated_at)
                """), {
                    'nome': produto['nome'],
                    'categoria': produto.get('categoria'),
                    'ativo': produto.get('ativo', True),
                    'created_at': produto.get('created_at'),
                    'updated_at': produto.get('updated_at')
                })
                novos_registros += 1

        # 5. Dropar tabela antiga
        conn.execute(text("DROP TABLE produtos_config_old"))

        print(f"✅ {len(produtos_antigos)} produtos expandidos para {novos_registros} registros")


def migrate_social_selling():
    """Migrar tabela social_selling_metricas"""
    print("\n=== MIGRAÇÃO: Social Selling Métricas ===")

    if not check_column_exists('social_selling_metricas', 'meta_ativacoes'):
        print("⏭️  Tabela social_selling_metricas já está migrada")
        return

    with engine.begin() as conn:
        # 1. Buscar dados existentes
        result = conn.execute(text("SELECT * FROM social_selling_metricas"))
        metricas_antigas = [dict(row._mapping) for row in result]

        print(f"📊 Encontradas {len(metricas_antigas)} métricas de Social Selling")

        # 2. Renomear tabela antiga
        conn.execute(text("ALTER TABLE social_selling_metricas RENAME TO social_selling_metricas_old"))

        # 3. Criar nova tabela
        conn.execute(text("""
            CREATE TABLE social_selling_metricas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mes INTEGER NOT NULL,
                ano INTEGER NOT NULL,
                data DATE,
                vendedor VARCHAR(100) NOT NULL,
                ativacoes INTEGER DEFAULT 0,
                conversoes INTEGER DEFAULT 0,
                leads_gerados INTEGER DEFAULT 0,
                tx_ativ_conv FLOAT DEFAULT 0.0,
                tx_conv_lead FLOAT DEFAULT 0.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # 4. Criar índices
        conn.execute(text("CREATE INDEX idx_ss_mes_ano ON social_selling_metricas (mes, ano)"))
        conn.execute(text("CREATE INDEX idx_ss_vendedor ON social_selling_metricas (vendedor)"))
        conn.execute(text("CREATE INDEX idx_ss_data ON social_selling_metricas (data)"))

        # 5. Migrar dados
        for metrica in metricas_antigas:
            conn.execute(text("""
                INSERT INTO social_selling_metricas
                (id, mes, ano, data, vendedor, ativacoes, conversoes, leads_gerados,
                 tx_ativ_conv, tx_conv_lead, created_at, updated_at)
                VALUES (:id, :mes, :ano, :data, :vendedor, :ativacoes, :conversoes,
                        :leads_gerados, :tx_ativ_conv, :tx_conv_lead, :created_at, :updated_at)
            """), {
                'id': metrica['id'],
                'mes': metrica['mes'],
                'ano': metrica['ano'],
                'data': metrica.get('data'),
                'vendedor': metrica['vendedor'],
                'ativacoes': metrica.get('ativacoes', 0),
                'conversoes': metrica.get('conversoes', 0),
                'leads_gerados': metrica.get('leads_gerados', 0),
                'tx_ativ_conv': metrica.get('tx_ativ_conv', 0.0),
                'tx_conv_lead': metrica.get('tx_conv_lead', 0.0),
                'created_at': metrica.get('created_at'),
                'updated_at': metrica.get('updated_at')
            })

        # 6. Dropar tabela antiga
        conn.execute(text("DROP TABLE social_selling_metricas_old"))

        print(f"✅ {len(metricas_antigas)} métricas de Social Selling migradas")


def migrate_sdr():
    """Migrar tabela sdr_metricas"""
    print("\n=== MIGRAÇÃO: SDR Métricas ===")

    if not check_column_exists('sdr_metricas', 'meta_reunioes'):
        print("⏭️  Tabela sdr_metricas já está migrada")
        return

    with engine.begin() as conn:
        # 1. Buscar dados existentes
        result = conn.execute(text("SELECT * FROM sdr_metricas"))
        metricas_antigas = [dict(row._mapping) for row in result]

        print(f"📊 Encontradas {len(metricas_antigas)} métricas de SDR")

        # 2. Renomear tabela antiga
        conn.execute(text("ALTER TABLE sdr_metricas RENAME TO sdr_metricas_old"))

        # 3. Criar nova tabela
        conn.execute(text("""
            CREATE TABLE sdr_metricas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # 4. Criar índices
        conn.execute(text("CREATE INDEX idx_sdr_mes_ano ON sdr_metricas (mes, ano)"))
        conn.execute(text("CREATE INDEX idx_sdr_sdr ON sdr_metricas (sdr)"))
        conn.execute(text("CREATE INDEX idx_sdr_funil ON sdr_metricas (funil)"))

        # 5. Migrar dados
        for metrica in metricas_antigas:
            conn.execute(text("""
                INSERT INTO sdr_metricas
                (id, mes, ano, data, sdr, funil, leads_recebidos, reunioes_agendadas,
                 reunioes_realizadas, tx_agendamento, tx_comparecimento, created_at, updated_at)
                VALUES (:id, :mes, :ano, :data, :sdr, :funil, :leads_recebidos,
                        :reunioes_agendadas, :reunioes_realizadas, :tx_agendamento,
                        :tx_comparecimento, :created_at, :updated_at)
            """), {
                'id': metrica['id'],
                'mes': metrica['mes'],
                'ano': metrica['ano'],
                'data': metrica.get('data'),
                'sdr': metrica['sdr'],
                'funil': metrica['funil'],
                'leads_recebidos': metrica.get('leads_recebidos', 0),
                'reunioes_agendadas': metrica.get('reunioes_agendadas', 0),
                'reunioes_realizadas': metrica.get('reunioes_realizadas', 0),
                'tx_agendamento': metrica.get('tx_agendamento', 0.0),
                'tx_comparecimento': metrica.get('tx_comparecimento', 0.0),
                'created_at': metrica.get('created_at'),
                'updated_at': metrica.get('updated_at')
            })

        # 6. Dropar tabela antiga
        conn.execute(text("DROP TABLE sdr_metricas_old"))

        print(f"✅ {len(metricas_antigas)} métricas de SDR migradas")


def migrate_closer():
    """Migrar tabela closer_metricas"""
    print("\n=== MIGRAÇÃO: Closer Métricas ===")

    if not check_column_exists('closer_metricas', 'meta_vendas'):
        print("⏭️  Tabela closer_metricas já está migrada")
        return

    with engine.begin() as conn:
        # 1. Buscar dados existentes
        result = conn.execute(text("SELECT * FROM closer_metricas"))
        metricas_antigas = [dict(row._mapping) for row in result]

        print(f"📊 Encontradas {len(metricas_antigas)} métricas de Closer")

        # 2. Renomear tabela antiga
        conn.execute(text("ALTER TABLE closer_metricas RENAME TO closer_metricas_old"))

        # 3. Criar nova tabela
        conn.execute(text("""
            CREATE TABLE closer_metricas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # 4. Criar índices
        conn.execute(text("CREATE INDEX idx_closer_mes_ano ON closer_metricas (mes, ano)"))
        conn.execute(text("CREATE INDEX idx_closer_closer ON closer_metricas (closer)"))
        conn.execute(text("CREATE INDEX idx_closer_funil ON closer_metricas (funil)"))

        # 5. Migrar dados
        for metrica in metricas_antigas:
            conn.execute(text("""
                INSERT INTO closer_metricas
                (id, mes, ano, data, closer, funil, calls_agendadas, calls_realizadas,
                 vendas, faturamento, booking, faturamento_bruto, faturamento_liquido,
                 tx_comparecimento, tx_conversao, ticket_medio, created_at, updated_at)
                VALUES (:id, :mes, :ano, :data, :closer, :funil, :calls_agendadas,
                        :calls_realizadas, :vendas, :faturamento, 0.0, 0.0, 0.0,
                        :tx_comparecimento, :tx_conversao, :ticket_medio, :created_at, :updated_at)
            """), {
                'id': metrica['id'],
                'mes': metrica['mes'],
                'ano': metrica['ano'],
                'data': metrica.get('data'),
                'closer': metrica['closer'],
                'funil': metrica['funil'],
                'calls_agendadas': metrica.get('calls_agendadas', 0),
                'calls_realizadas': metrica.get('calls_realizadas', 0),
                'vendas': metrica.get('vendas', 0),
                'faturamento': metrica.get('faturamento', 0.0),
                'tx_comparecimento': metrica.get('tx_comparecimento', 0.0),
                'tx_conversao': metrica.get('tx_conversao', 0.0),
                'ticket_medio': metrica.get('ticket_medio', 0.0),
                'created_at': metrica.get('created_at'),
                'updated_at': metrica.get('updated_at')
            })

        # 6. Dropar tabela antiga
        conn.execute(text("DROP TABLE closer_metricas_old"))

        print(f"✅ {len(metricas_antigas)} métricas de Closer migradas")


def main():
    print("=" * 60)
    print("EXECUÇÃO DE MIGRATIONS - SQLITE")
    print("=" * 60)

    # 1. Fazer backup
    backup_path = backup_database()

    if backup_path:
        print(f"\n⚠️  Backup salvo em: {backup_path}")
        print("   Se algo der errado, você pode restaurar o banco de dados.\n")

    # 2. Executar migrations
    try:
        migrate_pessoas()
        migrate_produtos()
        migrate_social_selling()
        migrate_sdr()
        migrate_closer()

        print("\n" + "=" * 60)
        print("✅ TODAS AS MIGRATIONS CONCLUÍDAS COM SUCESSO!")
        print("=" * 60)
        print("\nPróximos passos:")
        print("1. Reiniciar o servidor backend")
        print("2. Executar o script de testes: ./test_new_structure.sh")
        print("3. Verificar se todos os endpoints estão funcionando")

    except Exception as e:
        print(f"\n❌ ERRO durante migration: {e}")
        print(f"\n⚠️  Você pode restaurar o backup em: {backup_path}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
