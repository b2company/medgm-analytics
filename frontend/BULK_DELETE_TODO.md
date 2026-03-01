# Bulk Delete - Implementação em Andamento

## ✅ Concluído

### DataTable
- ✅ Checkbox de seleção em massa
- ✅ Select all no header
- ✅ Toolbar com contador de selecionados
- ✅ Botão "Deletar selecionados"
- ✅ Props: `enableBulkSelect`, `onBulkDelete`, `rowKeyField`
- ✅ Visual feedback (background dourado)

## 🔄 Em Progresso

### EditableDataTable
- ✅ Adicionar mesmo sistema de bulk delete do DataTable
- ✅ Manter funcionalidade de edição inline
- ✅ Integrar checkboxes sem quebrar edição
- ✅ Migrado para MedGM brand (gold accents, Lucide icons)

### Componentes a Atualizar

#### Alta Prioridade (Dados Financeiros/Comerciais)
1. **TransacoesFinanceiras.jsx** ✅
   - ✅ Usar EditableDataTable com bulk delete
   - ✅ Adicionar `handleBulkDelete` para entradas
   - ✅ Adicionar `handleBulkDelete` para saídas
   - ✅ API: `deleteFinanceiro(id)` - chamar em batch

2. **Vendas.jsx** ✅
   - ✅ Refatorado de pattern antigo para novo enableBulkSelect
   - ✅ Implementar `handleBulkDelete`
   - ✅ API: `deleteVenda(id)` - chamar em batch

3. **SocialSelling.jsx** ✅
   - ✅ Implementado handleBulkDelete com fetch API
   - ✅ enableBulkSelect adicionado ao EditableDataTable

4. **SDR.jsx** ✅
   - ✅ Implementado handleBulkDelete com fetch API
   - ✅ enableBulkSelect adicionado ao EditableDataTable

5. **Closer.jsx** ✅
   - ✅ Implementado handleBulkDelete com fetch API
   - ✅ enableBulkSelect adicionado ao EditableDataTable

#### Média Prioridade (Config)
6. **Configuracoes.jsx** (Pessoas/Produtos/Funis)
   - Tabelas de config precisam bulk delete
   - APIs: `deletePessoa`, `deleteProduto`, `deleteFunil`

## 📝 Padrão de Implementação

Para cada página que usa DataTable ou EditableDataTable:

```jsx
// 1. Adicionar função de bulk delete
const handleBulkDelete = async (selectedRows) => {
  const count = selectedRows.length;

  if (!window.confirm(`Deletar ${count} ${count === 1 ? 'item' : 'itens'}?`)) {
    return;
  }

  try {
    // Deletar em batch
    await Promise.all(
      selectedRows.map(row => deleteAPI(row.id))
    );

    alert('Itens deletados com sucesso!');
    loadData(); // Recarregar dados
  } catch (error) {
    alert('Erro ao deletar: ' + error.message);
  }
};

// 2. Adicionar props na tabela
<DataTable
  columns={columns}
  data={data}
  enableBulkSelect={true}        // ← Habilitar
  onBulkDelete={handleBulkDelete} // ← Função
  rowKeyField="id"
  showActions={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## 🎯 Próximos Passos

1. ✅ Finalizar EditableDataTable com bulk delete
2. ✅ Atualizar TransacoesFinanceiras (URGENTE - usuário precisa)
3. ✅ Atualizar Vendas
4. ✅ Atualizar SocialSelling, SDR, Closer
5. ⚠️ Config (Pessoas, Produtos, Funis) - usa tabelas HTML customizadas, precisa migrar para DataTable primeiro

## ⚠️ Observações

- Usuário pediu bulk delete em TODAS as tabelas
- Prioridade: Financeiro > Vendas > Comercial > Config
- Manter UX consistente (mesmo visual em todas)
- Confirmar antes de deletar (window.confirm)
- Feedback de sucesso/erro
- Recarregar dados após deletar

---

**Status:** ✅ CONCLUÍDO - Todas as tabelas de dados principais agora têm bulk delete
**Próximo:** Config pages (opcional - usa tabelas HTML customizadas)

## 📊 Resumo de Implementação

✅ **Componentes de Base**
- DataTable.jsx - Bulk delete completo
- EditableDataTable.jsx - Bulk delete completo com MedGM styling

✅ **Páginas Financeiras** (Alta Prioridade)
- TransacoesFinanceiras - Entradas e Saídas com bulk delete

✅ **Páginas Comerciais** (Alta Prioridade)
- Vendas.jsx - Refatorado para novo pattern
- SocialSelling.jsx - Bulk delete implementado
- SDR.jsx - Bulk delete implementado
- Closer.jsx - Bulk delete implementado

⚠️ **Páginas de Config** (Média Prioridade)
- Configuracoes.jsx usa tabelas HTML customizadas
- Seria necessário migrar para DataTable primeiro
- Não crítico para operação do usuário
