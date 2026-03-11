#!/bin/bash

# Script de Teste - Dashboard Executivo V2
# Testa os novos campos adicionados ao backend

echo "🧪 Testando Dashboard Executivo V2"
echo "=================================="
echo ""

API_URL="http://localhost:8000"
MES=3
ANO=2026

# Verificar se backend está rodando
echo "1️⃣ Verificando se backend está ativo..."
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend está rodando"
else
    echo "❌ Backend NÃO está rodando!"
    echo "   Execute: cd backend && python3 -m uvicorn app.main:app --reload"
    exit 1
fi

echo ""
echo "2️⃣ Testando endpoint /comercial/dashboard/geral..."
RESPONSE=$(curl -s "$API_URL/comercial/dashboard/geral?mes=$MES&ano=$ANO")

if [ -z "$RESPONSE" ]; then
    echo "❌ Endpoint não retornou resposta"
    exit 1
fi

echo "✅ Endpoint respondeu"
echo ""

# Verificar Correção 1: Ativações e Conversões por Vendedor
echo "3️⃣ Verificando Correção 1: Ativações/Conversões por Vendedor"
ATIVACOES=$(echo "$RESPONSE" | jq -r '.social_selling.por_vendedor[0].ativacoes')
CONVERSOES=$(echo "$RESPONSE" | jq -r '.social_selling.por_vendedor[0].conversoes')

if [ "$ATIVACOES" != "null" ] && [ "$CONVERSOES" != "null" ]; then
    echo "✅ Campos 'ativacoes' e 'conversoes' encontrados"
    echo "   Vendedor 1: ativacoes=$ATIVACOES, conversoes=$CONVERSOES"
else
    echo "❌ Campos 'ativacoes' ou 'conversoes' não encontrados"
fi

echo ""

# Verificar Correção 2: Calls, Vendas, TX nos Closers
echo "4️⃣ Verificando Correção 2: Calls/Vendas/TX nos Closers"
CLOSER=$(echo "$RESPONSE" | jq -r '.comercial.por_pessoa[] | select(.area=="Closer") | .pessoa' | head -1)
CALLS=$(echo "$RESPONSE" | jq -r ".comercial.por_pessoa[] | select(.area==\"Closer\" and .pessoa==\"$CLOSER\") | .calls")
VENDAS=$(echo "$RESPONSE" | jq -r ".comercial.por_pessoa[] | select(.area==\"Closer\" and .pessoa==\"$CLOSER\") | .vendas")
TX_CONV=$(echo "$RESPONSE" | jq -r ".comercial.por_pessoa[] | select(.area==\"Closer\" and .pessoa==\"$CLOSER\") | .tx_conversao")

if [ "$CALLS" != "null" ] && [ "$VENDAS" != "null" ] && [ "$TX_CONV" != "null" ]; then
    echo "✅ Campos 'calls', 'vendas', 'tx_conversao' encontrados"
    echo "   Closer: $CLOSER | calls=$CALLS, vendas=$VENDAS, tx=$TX_CONV%"
else
    echo "❌ Campos dos Closers não encontrados"
fi

echo ""

# Verificar Correção 3: Pipeline Ativo
echo "5️⃣ Verificando Correção 3: Pipeline Ativo"
PIPELINE=$(echo "$RESPONSE" | jq -r ".comercial.por_pessoa[] | select(.area==\"Closer\") | .pipeline_ativo" | head -1)

if [ "$PIPELINE" != "null" ]; then
    echo "✅ Campo 'pipeline_ativo' encontrado (valor: $PIPELINE)"
    if [ "$PIPELINE" = "0" ]; then
        echo "   ⚠️ Atualmente em 0 (placeholder - implementar futuramente)"
    fi
else
    echo "❌ Campo 'pipeline_ativo' não encontrado"
fi

echo ""

# Verificar Correção 4: Funil por Origem (CRÍTICA)
echo "6️⃣ Verificando Correção 4: Funil por Origem (CRÍTICA)"
FUNIL_ORIGEM=$(echo "$RESPONSE" | jq -r '.funil_origem')

if [ "$FUNIL_ORIGEM" != "null" ]; then
    echo "✅ Campo 'funil_origem' encontrado"

    # Verificar cada funil
    SS_LEADS=$(echo "$RESPONSE" | jq -r '.funil_origem.ss.leads')
    ISCA_LEADS=$(echo "$RESPONSE" | jq -r '.funil_origem.isca.leads')
    QUIZ_LEADS=$(echo "$RESPONSE" | jq -r '.funil_origem.quiz.leads')

    echo ""
    echo "   📊 Breakdown por Funil:"
    echo "   ├─ SS:   $SS_LEADS leads"
    echo "   ├─ Isca: $ISCA_LEADS leads"
    echo "   └─ Quiz: $QUIZ_LEADS leads"

    if [ "$SS_LEADS" != "null" ] && [ "$ISCA_LEADS" != "null" ] && [ "$QUIZ_LEADS" != "null" ]; then
        echo ""
        echo "   ✅ Todos os funis têm dados"
    fi
else
    echo "❌ Campo 'funil_origem' não encontrado"
    echo "   Este é o campo mais CRÍTICO - rodapé do dashboard não funcionará"
fi

echo ""
echo "=================================="
echo "📊 RESUMO DOS TESTES"
echo "=================================="
echo ""

# Contar quantas correções estão OK
CORRETO=0
if [ "$ATIVACOES" != "null" ] && [ "$CONVERSOES" != "null" ]; then
    ((CORRETO++))
fi
if [ "$CALLS" != "null" ] && [ "$VENDAS" != "null" ]; then
    ((CORRETO++))
fi
if [ "$PIPELINE" != "null" ]; then
    ((CORRETO++))
fi
if [ "$FUNIL_ORIGEM" != "null" ]; then
    ((CORRETO++))
fi

echo "✅ Correções OK: $CORRETO/4"
echo ""

if [ $CORRETO -eq 4 ]; then
    echo "🎉 SUCESSO! Todas as correções estão implementadas!"
    echo ""
    echo "Próximos passos:"
    echo "1. Testar frontend: cd frontend && npm run dev"
    echo "2. Acessar: http://localhost:5174/comercial#geral"
    echo "3. Validar visualmente todos os componentes"
else
    echo "⚠️ ATENÇÃO! Algumas correções não foram detectadas."
    echo ""
    echo "Possíveis causas:"
    echo "- Backend não foi reiniciado após as mudanças"
    echo "- Dados não estão populados no banco"
    echo "- Erro na implementação"
fi

echo ""
echo "📄 Resposta completa salva em: /tmp/dashboard_v2_response.json"
echo "$RESPONSE" | jq . > /tmp/dashboard_v2_response.json

echo ""
echo "Para ver a resposta completa:"
echo "cat /tmp/dashboard_v2_response.json | jq ."
