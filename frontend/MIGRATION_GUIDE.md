# Guia de Migração - Design System MedGM 2026

## 🎯 Objetivo

Migrar todos os componentes do dashboard para o novo Design System MedGM, aplicando a identidade visual premium com Gilroy, cores da marca e UX moderno.

---

## ✅ Componentes Já Migrados

- [x] `tailwind.config.js` - Configuração completa do design system
- [x] `index.css` - Estilos globais e classes utilitárias
- [x] `MetricCard.jsx` - Card de métricas premium
- [x] `Navbar.jsx` - Header com logo MedGM
- [x] `Button.jsx` - Botão reutilizável (novo)

---

## 📋 Próximos Componentes a Migrar

### Prioridade Alta (Layout & Core)

- [ ] `MainLayout.jsx` - Layout principal da aplicação
- [ ] `DashboardLayout.jsx` - Wrapper de dashboards
- [ ] `Modal.jsx` - Modais
- [ ] `SkeletonLoader.jsx` - Loading states
- [ ] `EmptyState.jsx` - Estados vazios

### Prioridade Média (Formulários & Inputs)

- [ ] `FinanceiroForm.jsx`
- [ ] `SocialSellingForm.jsx`
- [ ] `SDRForm.jsx`
- [ ] `CloserForm.jsx`
- [ ] `VendaForm.jsx`
- [ ] `FilterInput.jsx`
- [ ] `FilterPanel.jsx`

### Prioridade Média (Tabelas & Dados)

- [ ] `DataTable.jsx`
- [ ] `EditableDataTable.jsx`
- [ ] `FunnelTable.jsx`
- [ ] `TableComparative.jsx`
- [ ] `TransacoesFinanceiras.jsx`

### Prioridade Baixa (Gráficos - Mantêm estilos dos charts)

- [ ] `LineChart.jsx` - Atualizar cores MedGM
- [ ] `BarChart.jsx` - Atualizar cores MedGM
- [ ] `PieChart.jsx` - Atualizar cores MedGM
- [ ] `FunnelChart.jsx` - Atualizar cores MedGM
- [ ] `ComboChart.jsx` - Atualizar cores MedGM
- [ ] `GaugeChart.jsx` - Atualizar cores MedGM

---

## 🔄 Padrões de Migração

### 1. Cores

**Antes:**
```jsx
<div className="bg-blue-500 text-white">
<div className="bg-gray-100 border-gray-300">
```

**Depois:**
```jsx
<div className="bg-medgm-gold text-white">
<div className="bg-medgm-gray-100 border-medgm-gray-300">
```

### 2. Cards

**Antes:**
```jsx
<div className="bg-white rounded-lg shadow-md p-6 border">
```

**Depois:**
```jsx
<div className="card-premium p-6">
{/* ou */}
<div className="card-gold p-6">
```

### 3. Botões

**Antes:**
```jsx
<button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
  Confirmar
</button>
```

**Depois:**
```jsx
import Button from '../components/Button'

<Button variant="primary">
  Confirmar
</Button>

<Button variant="secondary" leftIcon={Save} loading={isSubmitting}>
  Salvar
</Button>
```

### 4. Inputs

**Antes:**
```jsx
<input className="border rounded px-3 py-2 w-full" />
```

**Depois:**
```jsx
<input className="input-medgm" />
```

**Com label:**
```jsx
<div>
  <label className="label-medgm">Nome</label>
  <input className="input-medgm" placeholder="Digite o nome" />
</div>
```

### 5. Badges

**Antes:**
```jsx
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
  Ativo
</span>
```

**Depois:**
```jsx
<span className="badge-success">Ativo</span>
<span className="badge-warning">Pendente</span>
<span className="badge-danger">Inativo</span>
<span className="badge-gold">Premium</span>
```

### 6. Tabelas

**Antes:**
```jsx
<table className="min-w-full divide-y">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3">Nome</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">...</td>
    </tr>
  </tbody>
</table>
```

**Depois:**
```jsx
<table className="table-medgm">
  <thead>
    <tr>
      <th>Nome</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>...</td>
    </tr>
  </tbody>
</table>
```

### 7. Loading States

**Antes:**
```jsx
{loading && <div>Carregando...</div>}
```

**Depois:**
```jsx
{loading && (
  <div className="flex items-center justify-center p-8">
    <div className="spinner-medgm" />
  </div>
)}

{/* Ou skeleton */}
<div className="space-y-4">
  <div className="skeleton-text w-48" />
  <div className="skeleton-text w-32" />
  <div className="skeleton-medgm h-32 w-full rounded-lg" />
</div>
```

### 8. Tipografia

**Antes:**
```jsx
<h1 className="text-3xl font-bold">Título</h1>
<p className="text-gray-600">Texto</p>
```

**Depois:**
```jsx
<h1 className="text-4xl md:text-5xl font-bold text-medgm-black">Título</h1>
<p className="text-medgm-gray-600">Texto</p>

{/* Ou apenas confiar nos defaults */}
<h1>Título</h1> {/* Já vem estilizado */}
<p>Texto</p>
```

---

## 🎨 Referência Rápida de Cores

### Backgrounds
```css
bg-medgm-clean      → #F5F5F5 (fundo principal)
bg-white            → Cartões
bg-medgm-gray-50    → Hover states suaves
```

### Textos
```css
text-medgm-black    → #151515 (títulos, destaques)
text-medgm-dark     → #2B2B2B (texto principal)
text-medgm-gray-600 → #525252 (texto secundário)
text-medgm-gray-400 → #A3A3A3 (placeholders)
```

### Accents & CTAs
```css
bg-medgm-gold       → #D6B991 (botões primários, destaques)
border-medgm-gold   → Bordas de destaque
text-medgm-gold     → Links, ícones especiais
```

### Status
```css
text-success        → #10B981 (positivo)
text-danger         → #EF4444 (negativo)
text-warning        → #F59E0B (aviso)
text-info           → #3B82F6 (informação)
```

---

## 📦 Dependências Necessárias

```bash
npm install lucide-react
```

**Ícones recomendados (Lucide):**
- `TrendingUp`, `TrendingDown` - Variações
- `DollarSign`, `Users`, `BarChart3` - Métricas
- `Save`, `Trash2`, `Edit`, `X`, `Check` - Ações
- `Menu`, `Settings`, `Upload`, `Download` - UI
- `AlertCircle`, `CheckCircle`, `Info` - Status

---

## ✅ Checklist de Migração por Componente

Ao migrar cada componente, verificar:

- [ ] Substituir cores hardcoded por classes MedGM
- [ ] Usar classes de componentes (`card-premium`, `btn-primary`, etc)
- [ ] Adicionar `cursor-pointer` em elementos clicáveis
- [ ] Implementar estados de loading com skeleton/spinner
- [ ] Adicionar hover states suaves (200ms)
- [ ] Garantir focus states visíveis
- [ ] Trocar emojis por ícones Lucide (se houver)
- [ ] Verificar responsividade (mobile, tablet, desktop)
- [ ] Testar com `prefers-reduced-motion`
- [ ] Verificar contraste de texto (min 4.5:1)

---

## 🚀 Exemplo Completo: Migração de Form

**Antes:**
```jsx
function MeuForm() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Cadastro</h2>

      <div className="mb-4">
        <label className="block text-sm mb-1">Nome</label>
        <input className="border rounded px-3 py-2 w-full" />
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Salvar
      </button>
    </div>
  )
}
```

**Depois:**
```jsx
import { Save } from 'lucide-react'
import Button from '../components/Button'

function MeuForm() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="card-premium p-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-medgm-black mb-6">
        Cadastro
      </h2>

      <div className="space-y-4">
        <div>
          <label className="label-medgm">Nome completo</label>
          <input
            className="input-medgm"
            placeholder="Digite seu nome"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="primary" leftIcon={Save} loading={loading}>
          Salvar
        </Button>
        <Button variant="ghost">
          Cancelar
        </Button>
      </div>
    </div>
  )
}
```

---

## 📖 Documentação Completa

Ver `DESIGN_SYSTEM.md` para:
- Paleta completa de cores
- Todos os componentes disponíveis
- Exemplos de uso
- Boas práticas de UX
- Guidelines de acessibilidade

---

**Última atualização:** 2026-03-01
**Versão do Design System:** 1.0
