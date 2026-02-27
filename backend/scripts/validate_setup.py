"""
Script de validação pré-deploy.
Verifica se tudo está configurado corretamente antes de fazer deploy.

Uso:
    python scripts/validate_setup.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{text.center(60)}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text):
    print(f"ℹ️  {text}")

def check_file_exists(filepath, required=True):
    """Verifica se arquivo existe."""
    if os.path.exists(filepath):
        print_success(f"Arquivo encontrado: {filepath}")
        return True
    else:
        if required:
            print_error(f"Arquivo não encontrado: {filepath}")
        else:
            print_warning(f"Arquivo opcional não encontrado: {filepath}")
        return False

def check_env_var(var_name, required=True):
    """Verifica se variável de ambiente está configurada."""
    value = os.getenv(var_name)
    if value:
        # Oculta parte da senha/token
        display_value = value if len(value) < 20 else f"{value[:20]}..."
        print_success(f"{var_name} = {display_value}")
        return True
    else:
        if required:
            print_error(f"{var_name} não configurada")
        else:
            print_warning(f"{var_name} não configurada (opcional)")
        return False

def check_database_connection():
    """Verifica conexão com banco de dados."""
    print_info("Testando conexão com banco de dados...")

    try:
        from sqlalchemy import create_engine, text

        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print_warning("DATABASE_URL não configurada. Usando SQLite local.")
            # Verifica SQLite local
            sqlite_path = "data/medgm_analytics.db"
            if os.path.exists(sqlite_path):
                print_success(f"SQLite encontrado: {sqlite_path}")
                return True
            else:
                print_error(f"SQLite não encontrado: {sqlite_path}")
                return False

        # Testa PostgreSQL
        engine = create_engine(database_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print_success("Conexão PostgreSQL estabelecida com sucesso")

            # Verifica se tabelas existem
            result = conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in result]

            if tables:
                print_success(f"Tabelas encontradas: {len(tables)}")
                print_info(f"  {', '.join(tables[:5])}{'...' if len(tables) > 5 else ''}")
            else:
                print_warning("Nenhuma tabela encontrada. Execute o script de criação de schema.")

            return True

    except Exception as e:
        print_error(f"Erro ao conectar ao banco: {e}")
        return False

def check_python_version():
    """Verifica versão do Python."""
    version = sys.version_info
    if version.major == 3 and version.minor >= 9:
        print_success(f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_error(f"Python {version.major}.{version.minor} (requer 3.9+)")
        return False

def check_dependencies():
    """Verifica se dependências estão instaladas."""
    print_info("Verificando dependências...")

    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'psycopg2',
        'pandas',
        'python-dotenv'
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print_success(f"{package} instalado")
        except ImportError:
            print_error(f"{package} NÃO instalado")
            missing.append(package)

    if missing:
        print_error(f"\nInstale as dependências faltantes:")
        print(f"pip install {' '.join(missing)}")
        return False

    return True

def main():
    print_header("🔍 Validação Pré-Deploy - MedGM Analytics")

    # Carrega .env
    load_dotenv()

    results = []

    # 1. Verifica Python
    print_header("1. Versão do Python")
    results.append(check_python_version())

    # 2. Verifica arquivos essenciais
    print_header("2. Arquivos Essenciais")
    results.append(check_file_exists("requirements.txt"))
    results.append(check_file_exists("app/main.py"))
    results.append(check_file_exists("app/database.py"))
    results.append(check_file_exists("app/models/models.py"))
    results.append(check_file_exists("Procfile"))
    results.append(check_file_exists("railway.json"))

    # 3. Verifica arquivos de deploy
    print_header("3. Scripts de Deploy")
    results.append(check_file_exists("scripts/create_supabase_schema.sql"))
    results.append(check_file_exists("scripts/migrate_to_supabase.py"))
    results.append(check_file_exists(".env.example"))
    check_file_exists(".env", required=False)

    # 4. Verifica dependências
    print_header("4. Dependências Python")
    results.append(check_dependencies())

    # 5. Verifica variáveis de ambiente
    print_header("5. Variáveis de Ambiente")

    # DATABASE_URL é opcional (usa SQLite se não configurado)
    has_database_url = check_env_var("DATABASE_URL", required=False)

    if has_database_url:
        print_info("Modo: PRODUÇÃO (PostgreSQL)")
    else:
        print_info("Modo: DESENVOLVIMENTO (SQLite)")

    # CORS é importante
    check_env_var("CORS_ORIGINS", required=False)

    # 6. Verifica conexão com banco
    print_header("6. Conexão com Banco de Dados")
    results.append(check_database_connection())

    # Resumo final
    print_header("📊 Resumo da Validação")

    total = len(results)
    passed = sum(results)
    failed = total - passed

    print(f"\nTotal de verificações: {total}")
    print_success(f"Passou: {passed}")
    if failed > 0:
        print_error(f"Falhou: {failed}")

    print("\n" + "="*60)

    if failed == 0:
        print(f"{GREEN}🎉 Tudo pronto para deploy!{RESET}\n")
        print("Próximos passos:")
        print("1. Se ainda não migrou dados: python scripts/migrate_to_supabase.py")
        print("2. Deploy backend no Railway")
        print("3. Deploy frontend no Vercel")
        print("4. Atualizar CORS_ORIGINS com URL do Vercel")
        return 0
    else:
        print(f"{RED}⚠️  Corrija os erros acima antes de fazer deploy{RESET}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
