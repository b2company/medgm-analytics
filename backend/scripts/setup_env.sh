#!/bin/bash

# Script para configurar ambiente de produção
# Uso: ./scripts/setup_env.sh

echo "================================================"
echo "🚀 MedGM Analytics - Setup de Produção"
echo "================================================"
echo ""

# Verifica se .env já existe
if [ -f ".env" ]; then
    echo "⚠️  Arquivo .env já existe!"
    read -p "Deseja sobrescrever? (s/n): " resposta
    if [ "$resposta" != "s" ]; then
        echo "❌ Setup cancelado."
        exit 0
    fi
fi

# Solicita URL do Supabase
echo ""
echo "📋 Configuração do Banco de Dados (Supabase)"
echo "----------------------------------------"
echo "Acesse: https://app.supabase.com"
echo "Settings > Database > Connection string"
echo ""
read -p "Cole a DATABASE_URL do Supabase: " database_url

# Solicita URL do Frontend
echo ""
echo "🌐 Configuração do Frontend"
echo "----------------------------------------"
echo "Exemplo: https://seu-app.vercel.app"
read -p "URL do Frontend (ou Enter para localhost): " frontend_url

if [ -z "$frontend_url" ]; then
    frontend_url="http://localhost:5173"
fi

# Cria arquivo .env
echo ""
echo "📝 Criando arquivo .env..."

cat > .env << EOF
# ==========================================
# MedGM Analytics - Ambiente de Produção
# ==========================================

# DATABASE
DATABASE_URL=$database_url

# CORS ORIGINS
CORS_ORIGINS=$frontend_url,http://localhost:5173

# API CONFIGURATION
API_HOST=0.0.0.0
API_PORT=8000

# UPLOAD DIRECTORY
UPLOAD_DIR=./uploads
EOF

echo "✅ Arquivo .env criado com sucesso!"
echo ""

# Pergunta se quer migrar dados
read -p "Deseja migrar dados do SQLite para Supabase agora? (s/n): " migrar

if [ "$migrar" = "s" ]; then
    echo ""
    echo "🔄 Iniciando migração de dados..."
    python scripts/migrate_to_supabase.py
else
    echo ""
    echo "ℹ️  Para migrar dados depois, execute:"
    echo "   python scripts/migrate_to_supabase.py"
fi

echo ""
echo "================================================"
echo "✅ Setup concluído!"
echo "================================================"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique o arquivo .env criado"
echo "2. Se não migrou dados, execute: python scripts/migrate_to_supabase.py"
echo "3. Teste localmente: uvicorn app.main:app --reload"
echo "4. Deploy no Railway: siga DEPLOY.md"
echo ""
