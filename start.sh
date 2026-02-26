#!/bin/bash

# Script para iniciar frontend e backend do MedGM Analytics
# Uso: ./start.sh

echo "=========================================="
echo "  MedGM Analytics - Dashboard Refatorado"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto medgm-analytics"
    exit 1
fi

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Encerrando servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar se backend está rodando
BACKEND_RUNNING=$(lsof -ti:8000)
if [ ! -z "$BACKEND_RUNNING" ]; then
    echo "⚠️  Backend já está rodando na porta 8000 (PID: $BACKEND_RUNNING)"
    echo "   Usando instância existente..."
else
    echo "🚀 Iniciando Backend..."
    cd backend
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    echo "   ✓ Backend iniciado (PID: $BACKEND_PID)"
    echo "   📝 Logs: backend/backend.log"
    sleep 3
fi

# Verificar se frontend está rodando
FRONTEND_RUNNING=$(lsof -ti:3000)
if [ ! -z "$FRONTEND_RUNNING" ]; then
    echo "⚠️  Frontend já está rodando na porta 3000 (PID: $FRONTEND_RUNNING)"
    echo "   Usando instância existente..."
else
    echo "🚀 Iniciando Frontend..."
    cd frontend
    npm start > frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    echo "   ✓ Frontend iniciado (PID: $FRONTEND_PID)"
    echo "   📝 Logs: frontend/frontend.log"
    sleep 5
fi

echo ""
echo "=========================================="
echo "  ✓ Aplicação iniciada com sucesso!"
echo "=========================================="
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "Para encerrar: Ctrl+C"
echo ""

# Testar endpoints
echo "🧪 Testando endpoints..."
sleep 2

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo "   ✓ Backend respondendo"
else
    echo "   ⚠️  Backend pode não estar pronto. Aguarde alguns segundos."
fi

FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_CHECK" = "200" ] || [ "$FRONTEND_CHECK" = "301" ]; then
    echo "   ✓ Frontend respondendo"
else
    echo "   ⚠️  Frontend pode não estar pronto. Aguarde alguns segundos."
fi

echo ""
echo "📖 Documentação:"
echo "   - RESUMO_EXECUTIVO.md - Visão geral das mudanças"
echo "   - REFATORACAO_DASHBOARD.md - Detalhes técnicos"
echo "   - CHECKLIST_TESTE.md - Checklist de validação"
echo ""

# Manter script rodando
if [ ! -z "$BACKEND_PID" ] || [ ! -z "$FRONTEND_PID" ]; then
    echo "Pressione Ctrl+C para encerrar..."
    wait
fi
