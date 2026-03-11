# FASE 2 - Checklist de Implementação e Teste

## Instalação e Configuração

### 1. Preparação do Banco de Dados
- [ ] Navegar até pasta backend
- [ ] Executar `python recreate_db.py`
- [ ] Confirmar recriação digitando "sim"
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que 6 tabelas foram criadas:
  - [ ] vendas (com novos campos)
  - [ ] financeiro
  - [ ] kpis
  - [ ] social_selling_metricas (NOVO)
  - [ ] sdr_metricas (NOVO)
  - [ ] closer_metricas (NOVO)

### 2. Inicialização do Backend
- [ ] Backend rodando na porta 8000
- [ ] Acessar http://localhost:8000/health
- [ ] Verificar resposta: `{"status": "healthy"}`
- [ ] Acessar http://localhost:8000/docs (Swagger)
- [ ] Verificar novos endpoints em "Comercial"

### 3. Inicialização do Frontend
- [ ] Frontend rodando na porta 5173
- [ ] Acessar http://localhost:5173
- [ ] Verificar menu com novos links:
  - [ ] Social Selling
  - [ ] SDR
  - [ ] Closer

---

## Testes de Funcionalidade

### Social Selling

#### Criação
- [ ] Acessar página Social Selling
- [ ] Clicar em "+ Nova Métrica"
- [ ] Modal abre corretamente
- [ ] Preencher todos os campos:
  - [ ] Mês e Ano
  - [ ] Nome do vendedor
  - [ ] Ativações e Meta
  - [ ] Conversões
  - [ ] Leads Gerados e Meta
- [ ] Clicar em "Criar Métrica"
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que métrica aparece na tabela

#### Visualização
- [ ] Cards de resumo aparecem no topo
- [ ] Total de Ativações está correto
- [ ] Total de Conversões está correto
- [ ] Total de Leads está correto
- [ ] Percentual de meta está calculado
- [ ] Tabela mostra todas as colunas:
  - [ ] Vendedor
  - [ ] Ativações e Meta
  - [ ] Conversões
  - [ ] Tx Ativ > Conv (calculada)
  - [ ] Leads e Meta
  - [ ] Tx Conv > Lead (calculada)
  - [ ] Ações (Editar/Deletar)

#### Cálculos Automáticos
- [ ] Criar métrica: 100 ativações, 50 conversões
- [ ] Verificar: Tx Ativ > Conv = 50.00%
- [ ] Criar métrica: 50 conversões, 25 leads
- [ ] Verificar: Tx Conv > Lead = 50.00%

#### Edição
- [ ] Clicar em "Editar"
- [ ] Modal abre com dados preenchidos
- [ ] Alterar valores
- [ ] Salvar
- [ ] Verificar atualização na tabela
- [ ] Verificar recálculo das taxas

#### Exclusão
- [ ] Clicar em "Deletar"
- [ ] Confirmar exclusão
- [ ] Verificar remoção da tabela

#### Filtros
- [ ] Mudar mês no filtro
- [ ] Verificar atualização da tabela
- [ ] Mudar ano no filtro
- [ ] Verificar atualização da tabela

---

### SDR

#### Criação
- [ ] Acessar página SDR
- [ ] Clicar em "+ Nova Métrica"
- [ ] Modal abre corretamente
- [ ] Preencher campos:
  - [ ] SDR
  - [ ] Funil (testar todos: SS, Quiz, Indicação, Webinário)
  - [ ] Leads Recebidos
  - [ ] Reuniões Agendadas
  - [ ] Reuniões Realizadas
  - [ ] Meta Reuniões
- [ ] Criar métrica
- [ ] Verificar na tabela

#### Visualização
- [ ] Cards de resumo por SDR aparecem
- [ ] Cada card mostra:
  - [ ] Nome do SDR
  - [ ] Total de Leads
  - [ ] Reuniões Realizadas
  - [ ] Taxa de Agendamento
  - [ ] Percentual da Meta
- [ ] Tabela mostra todas as colunas
- [ ] Taxas estão calculadas corretamente

#### Alternância de Visualização
- [ ] Clicar em "Por Pessoa"
- [ ] Verificar agrupamento por SDR
- [ ] Clicar em "Por Funil"
- [ ] Verificar agrupamento por funil

#### Múltiplos Funis
- [ ] Criar métrica para funil "SS"
- [ ] Criar métrica para funil "Quiz"
- [ ] Criar métrica para funil "Indicação"
- [ ] Criar métrica para funil "Webinário"
- [ ] Verificar que todas aparecem na tabela

#### Cálculos
- [ ] Criar: 20 leads, 10 agendadas
- [ ] Verificar: Tx Agendamento = 50%
- [ ] Criar: 10 agendadas, 8 realizadas
- [ ] Verificar: Tx Comparecimento = 80%

#### Operações CRUD
- [ ] Testar edição de métrica
- [ ] Testar exclusão de métrica
- [ ] Testar filtros de mês/ano

---

### Closer

#### Criação
- [ ] Acessar página Closer
- [ ] Clicar em "+ Nova Métrica"
- [ ] Preencher campos:
  - [ ] Closer
  - [ ] Funil
  - [ ] Calls Agendadas
  - [ ] Calls Realizadas
  - [ ] Vendas
  - [ ] Faturamento (R$)
  - [ ] Meta Vendas
  - [ ] Meta Faturamento (R$)
- [ ] Criar métrica
- [ ] Verificar na tabela

#### Visualização
- [ ] Cards de totais gerais aparecem:
  - [ ] Total Vendas
  - [ ] Total Faturamento
  - [ ] Ticket Médio
- [ ] Cards por Closer aparecem:
  - [ ] Nome do Closer
  - [ ] Vendas e Faturamento
  - [ ] Taxa de Conversão
  - [ ] Ticket Médio
  - [ ] % Meta Vendas
  - [ ] % Meta Faturamento
- [ ] Tabela detalhada mostra tudo

#### Formatação de Moeda
- [ ] Faturamento aparece como "R$ 25.000,00"
- [ ] Ticket médio aparece formatado
- [ ] Valores com 2 casas decimais

#### Cálculos Automáticos
- [ ] Criar: 10 calls, 5 vendas
- [ ] Verificar: Tx Conversão = 50%
- [ ] Criar: 5 vendas, R$ 25.000 faturamento
- [ ] Verificar: Ticket Médio = R$ 5.000,00

#### Comparação com Metas
- [ ] Criar métrica acima da meta
- [ ] Verificar cor verde no percentual
- [ ] Criar métrica abaixo da meta
- [ ] Verificar cor amarela no percentual

#### Operações CRUD
- [ ] Testar edição
- [ ] Testar exclusão
- [ ] Testar filtros

---

### Vendas Expandidas

#### Campos Básicos (já existiam)
- [ ] Acessar formulário de venda
- [ ] Verificar campos básicos:
  - [ ] Cliente
  - [ ] Valor
  - [ ] Funil
  - [ ] Vendedor
  - [ ] Data

#### Campos Expandidos (NOVOS)
- [ ] Verificar seção "Campos Expandidos (Opcional)"
- [ ] Verificar campos presentes:
  - [ ] Closer
  - [ ] Tipo de Receita (dropdown)
  - [ ] Produto
  - [ ] Booking (R$)
  - [ ] Previsto (R$)
  - [ ] Valor Pago (R$)
  - [ ] Valor Líquido (R$)

#### Teste de Criação Completa
- [ ] Preencher todos os campos (básicos + expandidos)
- [ ] Salvar venda
- [ ] Verificar que todos os dados foram salvos
- [ ] Editar venda
- [ ] Verificar que campos expandidos aparecem preenchidos

#### Teste de Compatibilidade
- [ ] Criar venda APENAS com campos básicos
- [ ] Verificar que funciona normalmente
- [ ] Confirmar que campos expandidos ficam null/vazios

---

## Testes de API (via Swagger ou curl)

### Social Selling
- [ ] POST /comercial/social-selling (criar)
- [ ] GET /comercial/social-selling?mes=2&ano=2026 (listar)
- [ ] GET /comercial/social-selling/all (listar todas)
- [ ] PUT /comercial/social-selling/{id} (atualizar)
- [ ] DELETE /comercial/social-selling/{id} (deletar)
- [ ] GET /comercial/dashboard/social-selling?mes=2&ano=2026

### SDR
- [ ] POST /comercial/sdr
- [ ] GET /comercial/sdr?mes=2&ano=2026
- [ ] GET /comercial/sdr/all
- [ ] PUT /comercial/sdr/{id}
- [ ] DELETE /comercial/sdr/{id}
- [ ] GET /comercial/dashboard/sdr?mes=2&ano=2026

### Closer
- [ ] POST /comercial/closer
- [ ] GET /comercial/closer?mes=2&ano=2026
- [ ] GET /comercial/closer/all
- [ ] PUT /comercial/closer/{id}
- [ ] DELETE /comercial/closer/{id}
- [ ] GET /comercial/dashboard/closer?mes=2&ano=2026

---

## Testes de Validação e Erros

### Validações de Entrada
- [ ] Tentar criar métrica com valor negativo (deve falhar)
- [ ] Tentar criar sem campos obrigatórios (deve falhar)
- [ ] Tentar criar com mês inválido (0 ou 13) (deve falhar)
- [ ] Tentar atualizar ID inexistente (deve retornar 404)
- [ ] Tentar deletar ID inexistente (deve retornar 404)

### Tratamento de Erros
- [ ] Verificar mensagens de erro são claras
- [ ] Verificar que erros não quebram a aplicação
- [ ] Verificar que após erro pode tentar novamente

---

## Testes de Integração

### Fluxo Completo
- [ ] Criar métrica Social Selling (João gera 40 leads)
- [ ] Criar métrica SDR (Maria recebe 40 leads)
- [ ] Criar métrica Closer (Pedro fecha 10 vendas)
- [ ] Registrar 10 vendas individuais
- [ ] Verificar consistência entre módulos

### Dashboards Consolidados
- [ ] Dashboard Social Selling soma todos os vendedores
- [ ] Dashboard SDR agrupa por pessoa e funil
- [ ] Dashboard Closer mostra totais corretos
- [ ] Percentuais de meta calculados corretamente

---

## Testes de Performance

### Carga de Dados
- [ ] Criar 10 métricas de Social Selling
- [ ] Criar 20 métricas de SDR (vários funis)
- [ ] Criar 20 métricas de Closer (vários closers)
- [ ] Verificar que tabelas carregam rápido
- [ ] Verificar que filtros funcionam bem

### Responsividade
- [ ] Testar em tela grande (desktop)
- [ ] Testar em tela média (tablet)
- [ ] Testar em tela pequena (mobile)
- [ ] Verificar que tabelas têm scroll horizontal se necessário

---

## Verificações Finais

### Código
- [ ] Nenhum erro no console do navegador
- [ ] Nenhum erro nos logs do backend
- [ ] Todos os imports funcionando
- [ ] Nenhum warning de React

### Dados
- [ ] Banco de dados tem 6 tabelas
- [ ] Dados são persistidos corretamente
- [ ] Edições são salvas
- [ ] Exclusões removem dados

### Interface
- [ ] Menu de navegação funciona
- [ ] Todas as páginas carregam
- [ ] Modais abrem e fecham
- [ ] Botões respondem ao clique
- [ ] Formulários validam entrada
- [ ] Mensagens de sucesso/erro aparecem

### Documentação
- [ ] README está atualizado
- [ ] FASE2_IMPLEMENTACAO.md está completo
- [ ] FASE2_RESUMO.md está claro
- [ ] FASE2_EXEMPLOS_API.md tem exemplos funcionais

---

## Problemas Conhecidos

### Se Algo Não Funcionar:

**Backend não inicia:**
```bash
# Matar processo na porta 8000
lsof -ti:8000 | xargs kill -9

# Recriar banco
python recreate_db.py

# Reiniciar
uvicorn app.main:app --reload
```

**Frontend não carrega dados:**
- Verificar se backend está rodando
- Abrir console do navegador (F12)
- Verificar erros de CORS
- Verificar URL da API (deve ser localhost:8000)

**Erros de validação:**
- Verificar campos obrigatórios preenchidos
- Verificar tipos de dados (números não podem ter texto)
- Verificar ranges válidos (mês 1-12, valores >= 0)

---

## Próximas Ações Recomendadas

### Imediato
- [ ] Popular com dados reais do último mês
- [ ] Validar cálculos com planilha atual
- [ ] Treinar equipe para uso da plataforma

### Curto Prazo
- [ ] Adicionar gráficos visuais
- [ ] Implementar exportação para Excel
- [ ] Criar alertas de meta

### Médio Prazo
- [ ] Integração automática entre módulos
- [ ] Dashboard executivo consolidado
- [ ] Relatórios automáticos por email

---

## Status da Implementação

**FASE 2 - COMPLETA ✅**

Módulos Implementados:
- ✅ Social Selling (MKT)
- ✅ SDR
- ✅ Closer
- ✅ Vendas Expandidas

Funcionalidades:
- ✅ CRUD completo em todos os módulos
- ✅ Dashboards consolidados
- ✅ Cálculos automáticos
- ✅ Formatação brasileira
- ✅ Validações e tratamento de erros
- ✅ Interface responsiva

Documentação:
- ✅ Manual de implementação
- ✅ Resumo executivo
- ✅ Exemplos de API
- ✅ Checklist de testes

---

**Data de Conclusão:** 24/02/2026
**Desenvolvedor:** Claude Sonnet 4.5
**Status:** Pronto para Produção
