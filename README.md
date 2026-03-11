# MedGM Analytics Platform

Plataforma unificada de análise financeira e comercial para MedGM.

## Status do Projeto

✅ **Dashboards Refatorados - Versão 2.0**

- ✅ Backend FastAPI com endpoints detalhados
- ✅ Frontend React com dashboards ACIONÁVEIS
- ✅ Dados de Janeiro e Fevereiro 2026 importados
- ✅ 64 vendas cadastradas
- ✅ **NOVO**: Dashboards mostram TODOS OS DADOS (não só métricas abstratas)
- ✅ **NOVO**: Comparações mês anterior em todos os cards
- ✅ **NOVO**: Tabelas detalhadas com todas as transações
- ✅ **NOVO**: Performance por vendedor e canal
- ✅ **NOVO**: Alertas acionáveis
- ✅ **NOVO**: Tendências de 6 meses

## Documentação Completa

📖 **[RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md)** - Visão geral das mudanças (LEIA PRIMEIRO)
📖 **[REFATORACAO_DASHBOARD.md](./REFATORACAO_DASHBOARD.md)** - Detalhes técnicos completos
📖 **[VISUAL_MUDANCAS.md](./VISUAL_MUDANCAS.md)** - Antes vs Depois (visual)
✅ **[CHECKLIST_TESTE.md](./CHECKLIST_TESTE.md)** - Checklist de validação

## Acesso Rápido

### Frontend (Interface Web)
**URL:** http://localhost:5174

### Backend API
**URL:** http://localhost:8000
**Documentação:** http://localhost:8000/docs

## Funcionalidades Implementadas

### 1. Dashboard Financeiro
- Visualização de Entradas, Saídas e Saldo
- Cálculo automático de Runway (meses disponíveis)
- Gráfico de evolução mensal
- Dados de Janeiro e Fevereiro 2026

### 2. Dashboard Comercial
- Faturamento total e por mês
- Número de vendas
- Ticket médio
- Funil de vendas visual (MKT → SDR → Closer → Vendas)
- Tabela de vendas recentes
- Gráfico de faturamento mensal

### 3. Dashboard Inteligência
- CAC (Custo de Aquisição por Cliente)
- LTV (Lifetime Value)
- ROI (Retorno sobre Investimento)
- Margem de Lucro
- Alertas automáticos configuráveis

### 4. Upload de Planilhas
- Upload manual de planilhas Excel
- Suporte para Comercial e Financeiro
- Validação automática de dados
- Feedback em tempo real

## Como Usar

### Iniciar os Servidores

**Terminal 1 - Backend:**
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/frontend
npm run dev
```

### Acessar a Plataforma

1. Abra o navegador
2. Acesse: http://localhost:5174
3. Navegue entre as abas: Financeiro, Comercial, Inteligência
4. Use o filtro de mês/ano no topo para alternar entre períodos

### Fazer Upload de Nova Planilha

1. Clique em "Upload" no menu superior
2. Selecione o tipo (Comercial ou Financeiro)
3. Arraste ou selecione o arquivo Excel (.xlsx)
4. Clique em "Fazer Upload"
5. Aguarde confirmação

## Estrutura de Dados

### Vendas Importadas
- **Janeiro 2026:** 33 vendas, R$ 127.378,41
- **Fevereiro 2026:** 31 vendas, R$ 84.930,80
- **Total:** 64 vendas, R$ 212.309,21

### Ticket Médio
R$ 3.317,33 por venda

### Dados Financeiros
- Entradas e saídas mensais
- Saldo consolidado
- Previsão vs Realizado

## Tecnologias

**Backend:**
- Python 3.9+
- FastAPI (API REST)
- SQLAlchemy (ORM)
- SQLite (Banco de dados)
- Pandas (Processamento Excel)

**Frontend:**
- React 18
- Vite (Build tool)
- TailwindCSS (Estilo)
- Recharts (Gráficos)
- Axios (HTTP client)

## Arquitetura

```
medgm-analytics/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app principal
│   │   ├── database.py          # Config SQLAlchemy
│   │   ├── models/models.py     # Modelos de dados
│   │   ├── parsers/             # Parsers de Excel
│   │   └── routers/             # Endpoints da API
│   └── data/
│       ├── medgm_analytics.db   # Banco SQLite
│       └── seed/                # Scripts de importação
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── pages/               # Páginas principais
│   │   ├── services/api.js      # Cliente HTTP
│   │   └── App.jsx              # App principal
│   └── package.json
└── README.md
```

## API Endpoints

### Métricas
- `GET /metrics/financeiro?mes=X&ano=Y` - Métricas financeiras
- `GET /metrics/comercial?mes=X&ano=Y` - Métricas comerciais
- `GET /metrics/inteligencia?mes=X&ano=Y` - CAC, LTV, ROI
- `GET /metrics/vendas?mes=X&ano=Y` - Lista de vendas
- `GET /metrics/all` - Resumo geral

### Upload
- `POST /upload/comercial` - Upload planilha comercial
- `POST /upload/financeiro` - Upload planilha financeiro

### Utilitários
- `GET /health` - Health check

## Próximos Passos Sugeridos

### Curto Prazo (1-2 semanas)
- [ ] Adicionar autenticação (login/senha)
- [ ] Implementar filtros avançados (por vendedor, funil, etc)
- [ ] Exportação de relatórios em PDF
- [ ] Notificações por email para alertas

### Médio Prazo (1 mês)
- [ ] Integração com Google Sheets (sync automático)
- [ ] Dashboard mobile responsivo
- [ ] Comparativo ano sobre ano
- [ ] Metas configuráveis por mês

### Longo Prazo (3+ meses)
- [ ] Deploy em produção (Vercel + Railway)
- [ ] Integração com CRM (RD Station, HubSpot)
- [ ] Previsões com Machine Learning
- [ ] Relatórios personalizáveis por usuário

## Troubleshooting

### Backend não inicia
```bash
# Reinstalar dependências
cd backend
pip3 install -r requirements.txt --user
```

### Frontend não carrega
```bash
# Limpar cache e reinstalar
cd frontend
rm -rf node_modules
npm install
```

### Porta já em uso
```bash
# Matar processo na porta 8000
lsof -ti:8000 | xargs kill -9

# Matar processo na porta 5173
lsof -ti:5173 | xargs kill -9
```

## Suporte

Para dúvidas ou problemas:
1. Verificar logs em `/tmp/backend-new.log` e `/tmp/frontend-new.log`
2. Consultar documentação da API: http://localhost:8000/docs
3. Revisar este README

---

**Desenvolvido para MedGM por Claude Code**
**Data:** 24/02/2026
**Versão:** 1.0.0 (MVP)
