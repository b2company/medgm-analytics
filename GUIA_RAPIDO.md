# 🚀 MedGM Analytics - Guia Rápido

## ✅ Plataforma 100% Funcional

**Data:** 24/02/2026  
**Status:** MVP Completo e Rodando

---

## 📱 ACESSE AGORA

### Interface Web (Frontend)
```
http://localhost:5174
```

### API (Backend)
```
http://localhost:8000
http://localhost:8000/docs (Documentação interativa)
```

---

## 📊 Dados Já Disponíveis

### Janeiro 2026
- **33 vendas**
- **R$ 127.378,41** em faturamento
- **R$ 3.859,95** ticket médio

### Fevereiro 2026
- **31 vendas**
- **R$ 84.930,80** em faturamento
- **R$ 2.739,70** ticket médio

### TOTAL
- **64 vendas consolidadas**
- **R$ 212.309,21** em faturamento
- Dados financeiros completos (entradas/saídas)

---

## 🎯 O Que Você Pode Fazer Agora

### 1. Dashboard Financeiro
✓ Ver entradas e saídas mensais  
✓ Acompanhar saldo consolidado  
✓ Calcular runway (quantos meses você tem de caixa)  
✓ Comparar meses com gráficos

### 2. Dashboard Comercial
✓ Faturamento total e por período  
✓ Número de vendas e ticket médio  
✓ Funil de vendas visual  
✓ Performance por vendedor  
✓ Lista completa de vendas

### 3. Dashboard Inteligência
✓ CAC (Custo de Aquisição por Cliente)  
✓ LTV (Lifetime Value)  
✓ ROI (Retorno sobre Investimento)  
✓ Margem de lucro  
✓ Alertas automáticos

### 4. Upload de Planilhas
✓ Arrastar e soltar planilhas Excel  
✓ Validação automática  
✓ Importação com feedback em tempo real

---

## 🎨 Interface

A interface tem:
- **Navegação superior:** Dashboard | Upload
- **3 Abas no Dashboard:** Financeiro | Comercial | Inteligência
- **Filtro de período:** Mês e Ano (topo direito)
- **Gráficos interativos:** Hover para ver detalhes
- **Design limpo:** Cores azul (MedGM), verde (positivo), vermelho (atenção)

---

## 🔄 Comandos Rápidos

### Ver se está rodando
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:5174
```

### Reiniciar Backend
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Reiniciar Frontend
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/frontend
npm run dev
```

### Parar Tudo
```bash
# Matar backend
lsof -ti:8000 | xargs kill -9

# Matar frontend
lsof -ti:5173 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

---

## 📁 Estrutura de Arquivos

```
medgm-analytics/
├── backend/           ← API Python
│   ├── app/          ← Código da aplicação
│   └── data/         ← Banco SQLite
├── frontend/         ← Interface React
│   └── src/          ← Código React
├── README.md         ← Documentação completa
└── GUIA_RAPIDO.md   ← Este arquivo
```

---

## 🐛 Problemas Comuns

### "Porta já em uso"
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5174 | xargs kill -9  # Frontend
```

### "Módulo não encontrado"
```bash
# Backend
cd backend && pip3 install -r requirements.txt --user

# Frontend
cd frontend && npm install
```

### "Banco de dados vazio"
```bash
cd backend
python3 data/seed/import_initial_data.py
```

---

## 💡 Próximos Passos

Agora que o MVP está funcionando, você pode:

1. **Testar a plataforma** - Navegue pelas abas, teste filtros
2. **Fazer upload de nova planilha** - Teste com dados de Março
3. **Decidir próximas features** - Autenticação? Exportar PDF? Sync automático?
4. **Planejar deploy** - Quando estabilizar, posso fazer deploy em produção

---

## 📞 Feedback

Após testar a plataforma, me diga:
- O que achou da interface?
- Falta alguma métrica importante?
- Que feature você mais precisa?
- Pronto para adicionar mais dados?

---

**Desenvolvido em 24/02/2026 por Claude Code**  
**Versão MVP 1.0**
