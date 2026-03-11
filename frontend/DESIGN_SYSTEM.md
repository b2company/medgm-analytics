# MedGM Analytics - Design System 2026

## 🎨 Brand Identity

### Cores Principais

| Nome | Hex | Uso | Tailwind Class |
|------|-----|-----|----------------|
| **Clean** | `#F5F5F5` | Background principal | `bg-medgm-clean` |
| **Gold** | `#D6B991` | Accent, CTAs, destaque | `bg-medgm-gold` |
| **Dark Gray** | `#2B2B2B` | Texto secundário, botões | `bg-medgm-dark` |
| **Black** | `#151515` | Texto principal, títulos | `bg-medgm-black` |

### Escala de Cinza

```css
medgm-gray-50  → #FAFAFA (mais claro)
medgm-gray-100 → #F5F5F5
medgm-gray-200 → #E5E5E5
medgm-gray-300 → #D4D4D4
medgm-gray-400 → #A3A3A3
medgm-gray-500 → #737373
medgm-gray-600 → #525252
medgm-gray-700 → #404040
medgm-gray-800 → #262626 (mais escuro)
```

### Cores Funcionais

| Propósito | Cor | Tailwind Class |
|-----------|-----|----------------|
| Sucesso | `#10B981` | `text-success` |
| Erro/Perigo | `#EF4444` | `text-danger` |
| Aviso | `#F59E0B` | `text-warning` |
| Info | `#3B82F6` | `text-info` |

---

## 📝 Tipografia

### Família: Gilroy

Todos os textos usam **Gilroy** com pesos variados:

| Peso | Valor | Tailwind Class | Uso |
|------|-------|----------------|-----|
| Light | 300 | `font-light` | Texto auxiliar |
| Regular | 400 | `font-normal` | Corpo de texto |
| Medium | 500 | `font-medium` | Ênfase leve |
| Semibold | 600 | `font-semibold` | Títulos, labels |
| Bold | 700 | `font-bold` | Destaque, h1/h2 |

### Hierarquia de Texto

```jsx
<h1>  → text-4xl md:text-5xl font-bold
<h2>  → text-3xl md:text-4xl font-bold
<h3>  → text-2xl md:text-3xl font-semibold
<h4>  → text-xl md:text-2xl font-semibold
<h5>  → text-lg md:text-xl font-semibold
<h6>  → text-base md:text-lg font-semibold
<p>   → text-base font-normal (default)
```

---

## 🃏 Componentes

### Cards

#### Card Premium (Padrão)
```jsx
<div className="card-premium p-6">
  {/* Conteúdo */}
</div>
```
- Fundo branco
- Borda sutil (`medgm-gray-200`)
- Shadow suave
- Hover: sombra maior + borda dourada

#### Card Gold (Destaque)
```jsx
<div className="card-gold p-6">
  {/* Conteúdo */}
</div>
```
- Gradiente sutil com dourado
- Borda dourada
- Shadow premium
- Hover: glow dourado

### Botões

#### Primário (Gold)
```jsx
<button className="btn-primary">
  Confirmar
</button>
```

#### Secundário (Dark)
```jsx
<button className="btn-secondary">
  Cancelar
</button>
```

#### Outline
```jsx
<button className="btn-outline">
  Ver mais
</button>
```

#### Ghost
```jsx
<button className="btn-ghost">
  Voltar
</button>
```

#### Loading State
```jsx
<button className="btn-primary btn-loading" disabled>
  Salvando...
</button>
```

### Inputs

```jsx
<div>
  <label className="label-medgm">
    Nome completo
  </label>
  <input
    type="text"
    className="input-medgm"
    placeholder="Digite seu nome"
  />
</div>

{/* Com erro */}
<input className="input-medgm input-error" />
```

### Badges

```jsx
<span className="badge-success">Ativo</span>
<span className="badge-warning">Pendente</span>
<span className="badge-danger">Inativo</span>
<span className="badge-gold">Premium</span>
```

---

## 📊 Componentes de Dados

### Metric Card (KPI)

```jsx
<div className="metric-card">
  <p className="metric-label">Faturamento Mensal</p>
  <p className="metric-value">R$ 125.430</p>
  <p className="metric-change-positive">+12,5%</p>
</div>
```

### Tabela Premium

```jsx
<table className="table-medgm">
  <thead>
    <tr>
      <th>Nome</th>
      <th>Função</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jessica Leopoldino</td>
      <td>Social Selling</td>
      <td><span className="badge-success">Ativo</span></td>
    </tr>
  </tbody>
</table>
```

---

## 🎭 Estados de Loading

### Skeleton

```jsx
{/* Texto */}
<div className="skeleton-text w-48" />

{/* Card completo */}
<div className="skeleton-medgm h-32 w-full rounded-lg" />

{/* Avatar */}
<div className="skeleton-circle w-12 h-12" />
```

### Spinner

```jsx
<div className="flex items-center justify-center p-8">
  <div className="spinner-medgm" />
</div>
```

---

## 🎨 Sombras

| Classe | Uso |
|--------|-----|
| `shadow-card` | Cards padrão |
| `shadow-card-hover` | Cards no hover |
| `shadow-premium` | Cards dourados |
| `shadow-gold-glow` | Efeito glow dourado |

---

## ✨ Animações

### Durações (UX Best Practices)

- Micro-interações: **150-200ms** (hover, focus)
- Transições: **200-300ms** (modais, dropdowns)
- Page transitions: **300-400ms**

### Classes Prontas

```jsx
{/* Fade in */}
<div className="animate-fade-in">

{/* Slide in from right */}
<div className="animate-slide-in-right">

{/* Scale in */}
<div className="animate-scale-in">

{/* Spin (loading) */}
<div className="animate-spin">

{/* Pulse (skeleton) */}
<div className="animate-pulse">
```

### Prefers Reduced Motion

O design system respeita automaticamente `prefers-reduced-motion` - animações são desabilitadas para usuários com sensibilidade.

---

## 📱 Breakpoints Responsivos

| Breakpoint | Largura | Tailwind |
|-----------|---------|----------|
| Mobile | < 640px | `sm:` |
| Tablet | ≥ 768px | `md:` |
| Desktop | ≥ 1024px | `lg:` |
| Wide | ≥ 1280px | `xl:` |

---

## ♿ Acessibilidade

### Contraste de Cores

- Texto normal: **4.5:1** mínimo
- Texto grande: **3:1** mínimo
- ✅ Todas as combinações do MedGM passam WCAG AA

### Focus States

- Todos os elementos interativos têm `focus-visible` com ring dourado
- Ordem de tab respeita ordem visual
- Skip links disponíveis

### Imagens & Icons

- Sempre use `alt` em imagens
- Use SVG icons (Heroicons/Lucide), **nunca emojis**
- Icon-only buttons precisam `aria-label`

---

## 📏 Espaçamento

Use escala consistente do Tailwind:

```
p-2  → 8px
p-4  → 16px
p-6  → 24px
p-8  → 32px
p-12 → 48px
```

**Padrão de Cards**: `p-6` (24px)
**Padrão de Modais**: `p-8` (32px)
**Padrão de Containers**: `max-w-7xl mx-auto px-4`

---

## 🎯 Boas Práticas

### ✅ DO

- Use `cursor-pointer` em elementos clicáveis
- Adicione hover states suaves (200ms)
- Use skeleton loading para async data
- Mantenha contraste de texto > 4.5:1
- Use classes do design system ao invés de criar custom

### ❌ DON'T

- Não use emojis como ícones
- Não crie animações > 500ms
- Não use `scale` em hover (causa layout shift)
- Não misture fonts além da Gilroy
- Não ignore estados de loading

---

## 🚀 Exemplo Completo: Dashboard Card

```jsx
import { TrendingUp, Users, DollarSign } from 'lucide-react'

function DashboardMetrics() {
  const metrics = [
    {
      label: 'Faturamento',
      value: 'R$ 125.430',
      change: '+12,5%',
      positive: true,
      Icon: DollarSign
    },
    {
      label: 'Clientes Ativos',
      value: '243',
      change: '+8,2%',
      positive: true,
      Icon: Users
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <div key={metric.label} className="metric-card group">
          <div className="flex items-center justify-between mb-4">
            <p className="metric-label">{metric.label}</p>
            <metric.Icon className="w-5 h-5 text-medgm-gold group-hover:scale-110 transition-transform" />
          </div>

          <p className="metric-value mb-2">{metric.value}</p>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className={metric.positive ? 'metric-change-positive' : 'metric-change-negative'}>
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 📦 Instalação de Ícones

```bash
npm install lucide-react
```

Ícones recomendados: **Lucide** (limpo, moderno, consistente com MedGM)

---

## 🎓 Checklist de Implementação

Antes de fazer deploy:

- [ ] Gilroy carregando corretamente
- [ ] Cores MedGM aplicadas
- [ ] Todos botões têm `cursor-pointer`
- [ ] Hover states suaves (200ms)
- [ ] Loading states implementados
- [ ] Focus states visíveis
- [ ] Contraste de texto OK
- [ ] Responsive em 375px, 768px, 1024px
- [ ] `prefers-reduced-motion` respeitado
- [ ] Zero emojis como ícones

---

**Desenvolvido para MedGM Analytics 2026**
*Design System v1.0 - Premium, Clean, Elegant*
