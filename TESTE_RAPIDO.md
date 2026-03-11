# Guia de Teste Rápido - CRUD MedGM Analytics

## Passo 1: Iniciar Backend

Abra um terminal e execute:

```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/backend
uvicorn app.main:app --reload
```

Aguarde até ver:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## Passo 2: Iniciar Frontend

Abra OUTRO terminal e execute:

```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics/frontend
npm run dev
```

Aguarde até ver:
```
  VITE ready in XXXms
  ➜  Local:   http://localhost:5173/
```

## Passo 3: Testar Endpoints (Opcional)

Em um TERCEIRO terminal:

```bash
cd /Users/odavi.feitosa/Desktop/gerador-ads/medgm-analytics
python3 test_crud.py
```

Você deve ver:
```
✓ Backend conectado e funcionando!
✓ Transação criada com sucesso!
✓ Transação atualizada com sucesso!
✓ Transação deletada com sucesso!
✓ Venda criada com sucesso!
✓ Venda atualizada com sucesso!
✓ Venda deletada com sucesso!
TODOS OS TESTES CONCLUÍDOS!
```

## Passo 4: Testar Interface

Abra o navegador em: **http://localhost:5173**

### Teste 1: Adicionar Transação Financeira

1. Clique na aba **"Financeiro"**
2. Clique no botão **"+ Nova Transação"** (canto superior direito)
3. Preencha o formulário:
   - Tipo: **Entrada**
   - Categoria: **Teste Manual**
   - Descrição: **Testando CRUD**
   - Valor: **1000**
   - Data: **Hoje**
   - Status: **Realizado**
4. Clique em **"Salvar"**
5. Verifique que aparece o alerta: "Transação criada com sucesso!"
6. Role a página e veja a nova transação na tabela "Entradas Detalhadas"

### Teste 2: Editar Transação

1. Na tabela "Entradas Detalhadas", encontre a transação que você acabou de criar
2. Clique em **"Editar"** na mesma linha
3. Altere o valor para **1500**
4. Clique em **"Salvar"**
5. Verifique que o valor foi atualizado na tabela

### Teste 3: Deletar Transação

1. Na mesma transação, clique em **"Deletar"**
2. Confirme a exclusão no popup
3. Verifique que a transação foi removida da tabela

### Teste 4: Adicionar Venda

1. Clique na aba **"Comercial"**
2. Clique no botão **"+ Nova Venda"** (canto superior direito)
3. Preencha o formulário:
   - Cliente: **Dr. Teste Silva**
   - Valor: **5000**
   - Funil: **Social Selling**
   - Vendedor: **João**
   - Data: **Hoje**
4. Clique em **"Salvar"**
5. Verifique que aparece o alerta: "Venda criada com sucesso!"
6. Role a página e veja a nova venda na tabela "Todas as Vendas"

### Teste 5: Editar Venda

1. Na tabela "Todas as Vendas", encontre a venda que você criou
2. Clique em **"Editar"**
3. Altere o funil para **Quiz**
4. Altere o valor para **6000**
5. Clique em **"Salvar"**
6. Verifique que os dados foram atualizados

### Teste 6: Deletar Venda

1. Na mesma venda, clique em **"Deletar"**
2. Confirme a exclusão
3. Verifique que a venda foi removida

## Checklist Final

✅ Backend iniciado sem erros
✅ Frontend iniciado sem erros
✅ Script de teste executado com sucesso
✅ Consegui adicionar transação financeira
✅ Consegui editar transação financeira
✅ Consegui deletar transação financeira
✅ Consegui adicionar venda
✅ Consegui editar venda
✅ Consegui deletar venda
✅ Dashboard atualiza automaticamente após operações
✅ Alertas de confirmação aparecem

## Problemas Comuns

### "Backend não conecta"
- Verifique se o backend está rodando na porta 8000
- Execute: `lsof -ti:8000` e mate o processo se necessário

### "Frontend não abre"
- Verifique se a porta 5173 está livre
- Execute: `lsof -ti:5173` e mate o processo se necessário

### "Erro ao salvar dados"
- Verifique os logs do backend no terminal
- Certifique-se de que o banco de dados existe

### "Botões não aparecem"
- Limpe o cache do navegador (Cmd+Shift+R no Mac)
- Verifique se você está na aba correta

## Sucesso!

Se todos os testes passaram, o CRUD está funcionando perfeitamente! 🎉

Agora você pode:
- Adicionar dados manualmente sem depender de planilhas
- Corrigir erros rapidamente
- Gerenciar vendas e transações em tempo real
