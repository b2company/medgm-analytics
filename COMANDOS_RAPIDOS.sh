#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════╗
# ║           COMANDOS RÁPIDOS - MedGM Analytics CRUD                    ║
# ╚══════════════════════════════════════════════════════════════════════╝

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║           INICIAR APLICAÇÃO - MedGM Analytics                        ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Escolha uma opção:${NC}"
echo ""
echo "1) Iniciar Backend"
echo "2) Iniciar Frontend"
echo "3) Executar Testes CRUD"
echo "4) Iniciar Tudo (Backend + Frontend em tabs separadas)"
echo "5) Ver Documentação"
echo "6) Sair"
echo ""

read -p "Opção: " opcao

case $opcao in
    1)
        echo -e "${GREEN}Iniciando Backend...${NC}"
        cd backend
        uvicorn app.main:app --reload
        ;;
    2)
        echo -e "${GREEN}Iniciando Frontend...${NC}"
        cd frontend
        npm run dev
        ;;
    3)
        echo -e "${GREEN}Executando Testes CRUD...${NC}"
        python3 test_crud.py
        ;;
    4)
        echo -e "${GREEN}Iniciando Backend e Frontend...${NC}"
        echo -e "${YELLOW}Abrindo em novas abas do terminal...${NC}"
        
        # Detectar tipo de terminal
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && uvicorn app.main:app --reload"'
            osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/frontend && npm run dev"'
            echo -e "${GREEN}Backend e Frontend iniciados em novas abas!${NC}"
        else
            # Linux
            echo -e "${YELLOW}Execute manualmente em terminais separados:${NC}"
            echo ""
            echo "Terminal 1:"
            echo "cd backend && uvicorn app.main:app --reload"
            echo ""
            echo "Terminal 2:"
            echo "cd frontend && npm run dev"
        fi
        ;;
    5)
        echo -e "${GREEN}Abrindo documentação...${NC}"
        echo ""
        echo "📄 Documentos disponíveis:"
        echo ""
        echo "1. RESUMO_EXECUTIVO.md       - Visão geral executiva"
        echo "2. TESTE_RAPIDO.md           - Guia de teste passo a passo"
        echo "3. CRUD_IMPLEMENTATION.md    - Documentação técnica"
        echo "4. ESTRUTURA_CRUD.txt        - Estrutura visual do projeto"
        echo ""
        read -p "Abrir qual? (1-4): " doc
        case $doc in
            1) cat RESUMO_EXECUTIVO.md | less ;;
            2) cat TESTE_RAPIDO.md | less ;;
            3) cat CRUD_IMPLEMENTATION.md | less ;;
            4) cat ESTRUTURA_CRUD.txt | less ;;
            *) echo "Opção inválida" ;;
        esac
        ;;
    6)
        echo -e "${BLUE}Até logo!${NC}"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Opção inválida${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}Concluído!${NC}"
