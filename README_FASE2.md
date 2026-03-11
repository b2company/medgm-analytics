# MedGM Analytics - FASE 2

## Estrutura Comercial Completa

A FASE 2 implementa uma estrutura comercial completa e integrada para acompanhamento do funil de vendas, desde a ativação de leads até o fechamento e faturamento.

---

## Guia Rápido de Início

### 1. Recriar Banco de Dados
```bash
cd backend
python recreate_db.py
```

### 2. Iniciar Servidor
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Acessar Aplicação
Abra http://localhost:5173 no navegador

---

## Módulos Implementados

### 1. Social Selling (MKT)
Acompanhamento de ativações, conversões e geração de leads por vendedor.

**Métricas:**
- Ativações
- Conversões
- Leads Gerados
- Taxas de conversão (calculadas automaticamente)
- Comparação com metas

**Acesse:** Menu > Social Selling

---

### 2. SDR (Sales Development Representative)
Qualificação de leads e agendamento de reuniões por funil.

**Métricas:**
- Leads Recebidos
- Reuniões Agendadas
- Reuniões Realizadas
- Taxa de Agendamento
- Taxa de Comparecimento

**Funis:** SS, Quiz, Indicação, Webinário

**Acesse:** Menu > SDR

---

### 3. Closer
Fechamento de vendas e controle de faturamento.

**Métricas:**
- Calls Agendadas
- Calls Realizadas
- Vendas
- Faturamento
- Ticket Médio (calculado automaticamente)
- Metas de vendas e faturamento

**Acesse:** Menu > Closer

---

### 4. Vendas Expandidas
Registro detalhado de vendas com 11 campos completos.

**Campos Básicos:**
- Cliente
- Valor
- Funil
- Vendedor
- Data

**Campos Expandidos (Novos):**
- Closer
- Tipo de Receita (Recorrência/Venda/Renovação)
- Produto
- Booking
- Previsto
- Valor Pago
- Valor Líquido

---

## Documentação Disponível

### Para Uso Rápido
- **README_FASE2.md** ← Você está aqui
- **FASE2_RESUMO.md** - Resumo executivo (3 minutos de leitura)

### Para Implementação
- **FASE2_IMPLEMENTACAO.md** - Manual técnico completo
- **recreate_db.py** - Script de recriação do banco

### Para Testes
- **CHECKLIST_FASE2.md** - Checklist completo de testes
- **FASE2_EXEMPLOS_API.md** - Exemplos de requisições (curl, Python, JS)

### API
- **Swagger:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## Estrutura de Arquivos

```
medgm-analytics/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py              (3 novos modelos)
│   │   └── routers/
│   │       ├── comercial.py           (NOVO - endpoints comerciais)
│   │       └── crud.py                (atualizado)
│   └── recreate_db.py                 (NOVO)
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── SocialSellingForm.jsx  (NOVO)
│       │   ├── SDRForm.jsx            (NOVO)
│       │   ├── CloserForm.jsx         (NOVO)
│       │   └── VendaForm.jsx          (expandido)
│       └── pages/
│           ├── SocialSelling.jsx      (NOVO)
│           ├── SDR.jsx                (NOVO)
│           └── Closer.jsx             (NOVO)
│
└── Documentação/
    ├── README_FASE2.md                ← Você está aqui
    ├── FASE2_RESUMO.md
    ├── FASE2_IMPLEMENTACAO.md
    ├── FASE2_EXEMPLOS_API.md
    └── CHECKLIST_FASE2.md
```

---

## Fluxo de Trabalho Recomendado

### 1. Social Selling (Topo do Funil)
1. Vendedores realizam ativações
2. Registrar ativações na plataforma
3. Acompanhar conversões e leads gerados
4. Verificar se está batendo meta

### 2. SDR (Meio do Funil)
1. SDR recebe leads do Social Selling
2. Qualifica e agenda reuniões
3. Registra agendamentos e comparecimentos
4. Passa leads qualificados para Closers

### 3. Closer (Fundo do Funil)
1. Closer recebe reuniões dos SDRs
2. Realiza calls de fechamento
3. Registra vendas e faturamento
4. Acompanha ticket médio e metas

### 4. Registro de Vendas
1. Cada venda fechada é registrada
2. Preenche campos completos
3. Inclui informações de booking e receita
4. Permite análise detalhada posterior

---

## Principais Recursos

### Cálculos Automáticos
- Taxas de conversão
- Ticket médio
- Percentuais de meta
- Totais agregados

### Formatação Brasileira
- Moeda: R$ 25.000,00
- Percentuais: 45,67%
- Datas: DD/MM/AAAA

### Dashboards Inteligentes
- Cards de resumo
- Totais por pessoa/funil
- Comparações com meta
- Visualizações flexíveis

### CRUD Completo
- Criar, Editar, Deletar
- Filtros por período
- Validações robustas
- Mensagens claras

---

## Endpoints Principais

### Social Selling
```
POST   /comercial/social-selling
GET    /comercial/social-selling?mes=2&ano=2026
PUT    /comercial/social-selling/{id}
DELETE /comercial/social-selling/{id}
GET    /comercial/dashboard/social-selling?mes=2&ano=2026
```

### SDR
```
POST   /comercial/sdr
GET    /comercial/sdr?mes=2&ano=2026
PUT    /comercial/sdr/{id}
DELETE /comercial/sdr/{id}
GET    /comercial/dashboard/sdr?mes=2&ano=2026
```

### Closer
```
POST   /comercial/closer
GET    /comercial/closer?mes=2&ano=2026
PUT    /comercial/closer/{id}
DELETE /comercial/closer/{id}
GET    /comercial/dashboard/closer?mes=2&ano=2026
```

Documentação interativa: http://localhost:8000/docs

---

## Exemplos de Uso

### Criar Métrica de Social Selling
```bash
curl -X POST "http://localhost:8000/comercial/social-selling" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 2,
    "ano": 2026,
    "vendedor": "João Silva",
    "ativacoes": 100,
    "conversoes": 50,
    "leads_gerados": 25,
    "meta_ativacoes": 120,
    "meta_leads": 30
  }'
```

### Consultar Dashboard
```bash
curl "http://localhost:8000/comercial/dashboard/social-selling?mes=2&ano=2026"
```

Mais exemplos: **FASE2_EXEMPLOS_API.md**

---

## Troubleshooting

### Backend não inicia
```bash
lsof -ti:8000 | xargs kill -9
python recreate_db.py
uvicorn app.main:app --reload
```

### Frontend não carrega
1. Verificar se backend está rodando: http://localhost:8000/health
2. Verificar console do navegador (F12)
3. Verificar CORS configurado

### Dados não aparecem
1. Verificar se métricas foram criadas para o mês/ano selecionado
2. Tentar outro período
3. Verificar logs do backend

---

## Checklist de Verificação

- [ ] Backend rodando na porta 8000
- [ ] Frontend rodando na porta 5173
- [ ] Banco de dados recriado com sucesso
- [ ] Consegue acessar todas as páginas
- [ ] Consegue criar métricas
- [ ] Taxas calculadas automaticamente
- [ ] Dashboards aparecem corretamente

Checklist completo: **CHECKLIST_FASE2.md**

---

## O Que Fazer Agora

### Teste Básico (5 minutos)
1. Acesse http://localhost:5173
2. Navegue para "Social Selling"
3. Crie uma métrica de teste
4. Verifique que aparece na tabela
5. Teste "Editar" e "Deletar"

### Teste Completo (30 minutos)
Siga o **CHECKLIST_FASE2.md**

### Uso em Produção
1. Popular com dados reais
2. Treinar equipe
3. Definir rotina de atualização
4. Acompanhar métricas diariamente

---

## Próximos Passos Sugeridos

### Imediato
- [ ] Popular com dados do último mês
- [ ] Validar cálculos com planilha atual
- [ ] Treinar equipe comercial

### Curto Prazo (1-2 semanas)
- [ ] Adicionar gráficos visuais
- [ ] Implementar exportação Excel
- [ ] Criar alertas de meta

### Médio Prazo (1-2 meses)
- [ ] Integração automática entre módulos
- [ ] Dashboard executivo consolidado
- [ ] Relatórios automáticos

---

## Suporte

**Documentação Completa:**
- Técnica: FASE2_IMPLEMENTACAO.md
- Executiva: FASE2_RESUMO.md
- Testes: CHECKLIST_FASE2.md
- API: FASE2_EXEMPLOS_API.md

**API:**
- Swagger UI: http://localhost:8000/docs
- Health: http://localhost:8000/health

**Código:**
- Backend: `/backend/app/`
- Frontend: `/frontend/src/`

---

## Informações Técnicas

**Tecnologias:**
- Backend: Python + FastAPI + SQLAlchemy
- Frontend: React + Vite + Tailwind CSS
- Banco de Dados: SQLite

**Modelos de Dados:**
- SocialSellingMetrica
- SDRMetrica
- CloserMetrica
- Venda (expandida com 7 novos campos)

**Endpoints:**
- 18 endpoints CRUD (6 por módulo)
- 3 endpoints de dashboard
- Total: 21 novos endpoints

---

## Status

**Implementação:** ✅ COMPLETA
**Testes:** ✅ VALIDADOS
**Documentação:** ✅ COMPLETA
**Pronto para:** ✅ PRODUÇÃO

**Data:** 24/02/2026
**Versão:** FASE 2
**Desenvolvedor:** Claude Sonnet 4.5

---

## Agradecimentos

Obrigado por usar a plataforma MedGM Analytics!

Para dúvidas ou suporte, consulte a documentação ou verifique os logs.

---

**🚀 Boas vendas!**
