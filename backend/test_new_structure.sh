#!/bin/bash

# Script de teste para validar a nova estrutura do backend
# Execute este script APÓS rodar as migrations

BASE_URL="http://localhost:8000"

echo "========================================"
echo "TESTES DE VALIDAÇÃO - NOVA ESTRUTURA"
echo "========================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "⚠️  IMPORTANTE: Execute as migrations antes de rodar este script!"
echo ""
read -p "Você já executou as migrations? (s/n): " resp
if [ "$resp" != "s" ] && [ "$resp" != "S" ]; then
    echo "❌ Por favor, execute as migrations primeiro!"
    exit 1
fi

echo ""
echo "================================"
echo "TESTE 1: Config - Pessoas"
echo "================================"

echo -e "${YELLOW}📋 Listando pessoas...${NC}"
curl -s $BASE_URL/config/pessoas | jq '.' > /tmp/test_pessoas.json
if grep -q "nivel_senioridade" /tmp/test_pessoas.json && ! grep -q "meta_vendas" /tmp/test_pessoas.json; then
    echo -e "${GREEN}✅ Estrutura correta: nivel_senioridade presente, meta_* ausentes${NC}"
else
    echo -e "${RED}❌ Estrutura incorreta${NC}"
    cat /tmp/test_pessoas.json
fi

echo ""
echo -e "${YELLOW}➕ Criando nova pessoa...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/config/pessoas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Automático Backend",
    "funcao": "closer",
    "nivel_senioridade": 5
  }')

if echo $RESPONSE | grep -q "Pessoa criada com sucesso"; then
    echo -e "${GREEN}✅ Pessoa criada com sucesso${NC}"
    PESSOA_ID=$(echo $RESPONSE | jq -r '.id')
    echo "   ID: $PESSOA_ID"
else
    echo -e "${RED}❌ Erro ao criar pessoa${NC}"
    echo $RESPONSE | jq '.'
fi

echo ""
echo "================================"
echo "TESTE 2: Config - Produtos"
echo "================================"

echo -e "${YELLOW}📋 Listando produtos...${NC}"
curl -s $BASE_URL/config/produtos | jq '.' > /tmp/test_produtos.json
if grep -q '"plano"' /tmp/test_produtos.json && grep -q '"status"' /tmp/test_produtos.json && ! grep -q '"planos"' /tmp/test_produtos.json; then
    echo -e "${GREEN}✅ Estrutura correta: plano (string) e status presentes, planos (array) ausente${NC}"
else
    echo -e "${RED}❌ Estrutura incorreta${NC}"
    cat /tmp/test_produtos.json
fi

echo ""
echo -e "${YELLOW}➕ Criando novo produto...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/config/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Produto Teste Backend",
    "categoria": "Assessoria",
    "plano": "Premium",
    "status": "ativo"
  }')

if echo $RESPONSE | grep -q "Produto criado com sucesso"; then
    echo -e "${GREEN}✅ Produto criado com sucesso${NC}"
    PRODUTO_ID=$(echo $RESPONSE | jq -r '.id')
    echo "   ID: $PRODUTO_ID"
else
    echo -e "${RED}❌ Erro ao criar produto${NC}"
    echo $RESPONSE | jq '.'
fi

echo ""
echo "================================"
echo "TESTE 3: Comercial - Social Selling"
echo "================================"

echo -e "${YELLOW}➕ Criando métrica de Social Selling (sem campos meta)...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/comercial/social-selling \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "vendedor": "Teste Automático Backend",
    "ativacoes": 100,
    "conversoes": 20,
    "leads_gerados": 10
  }')

if echo $RESPONSE | grep -q "Métrica de Social Selling criada com sucesso"; then
    echo -e "${GREEN}✅ Social Selling criado sem campos meta${NC}"
    SS_ID=$(echo $RESPONSE | jq -r '.id')
    echo "   ID: $SS_ID"
else
    echo -e "${RED}❌ Erro ao criar Social Selling${NC}"
    echo $RESPONSE | jq '.'
fi

echo ""
echo "================================"
echo "TESTE 4: Comercial - Closer"
echo "================================"

echo -e "${YELLOW}➕ Criando métrica de Closer (com novos campos financeiros)...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/comercial/closer \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "closer": "Teste Automático Backend",
    "funil": "SS",
    "calls_agendadas": 20,
    "calls_realizadas": 15,
    "vendas": 5,
    "faturamento": 250000,
    "booking": 300000,
    "faturamento_bruto": 280000,
    "faturamento_liquido": 250000
  }')

if echo $RESPONSE | grep -q "Métrica de Closer criada com sucesso"; then
    echo -e "${GREEN}✅ Closer criado com novos campos financeiros${NC}"
    CLOSER_ID=$(echo $RESPONSE | jq -r '.id')
    echo "   ID: $CLOSER_ID"
else
    echo -e "${RED}❌ Erro ao criar Closer${NC}"
    echo $RESPONSE | jq '.'
fi

echo ""
echo "================================"
echo "TESTE 5: Limpeza"
echo "================================"

if [ ! -z "$PESSOA_ID" ]; then
    echo -e "${YELLOW}🗑️  Deletando pessoa de teste...${NC}"
    curl -s -X DELETE $BASE_URL/config/pessoas/$PESSOA_ID | jq '.'
fi

if [ ! -z "$PRODUTO_ID" ]; then
    echo -e "${YELLOW}🗑️  Deletando produto de teste...${NC}"
    curl -s -X DELETE $BASE_URL/config/produtos/$PRODUTO_ID | jq '.'
fi

if [ ! -z "$SS_ID" ]; then
    echo -e "${YELLOW}🗑️  Deletando Social Selling de teste...${NC}"
    curl -s -X DELETE $BASE_URL/comercial/social-selling/$SS_ID | jq '.'
fi

if [ ! -z "$CLOSER_ID" ]; then
    echo -e "${YELLOW}🗑️  Deletando Closer de teste...${NC}"
    curl -s -X DELETE $BASE_URL/comercial/closer/$CLOSER_ID | jq '.'
fi

echo ""
echo "========================================"
echo "TESTES CONCLUÍDOS"
echo "========================================"
echo ""
echo "Próximos passos:"
echo "1. Revisar os resultados acima"
echo "2. Se tudo estiver OK, continuar para o frontend"
echo "3. Se houver erros, revisar as migrations e os models"
echo ""
