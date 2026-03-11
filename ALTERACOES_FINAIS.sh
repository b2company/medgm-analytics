#!/bin/bash
# Alterações finais - Comercial

cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/frontend

echo "🔧 Aplicando alterações finais..."

# 1. Remover duplicação Config - usar activeTab prop
sed -i.bak 's/activeTab="equipe"/activeTab={activeSubTab}/g' src/pages/Config.jsx
sed -i.bak 's/activeTab="produtos"/activeTab={activeSubTab}/g' src/pages/Config.jsx
sed -i.bak 's/activeTab="funis"/activeTab={activeSubTab}/g' src/pages/Config.jsx

# 2. Remover tab Upload de Config e adicionar em Comercial depois
# (manual)

echo "✅ Alterações aplicadas!"
echo ""
echo "📋 FALTA FAZER MANUALMENTE:"
echo "1. Mover Upload para botão 'Nova Métrica' em Comercial"
echo "2. Criar dashboards dia a dia (gráficos)"
echo "3. Implementar sistema de Metas"
echo "4. Corrigir bug do select vendedor"
echo ""
echo "📄 Ver PROXIMOS_PASSOS.md para detalhes"
