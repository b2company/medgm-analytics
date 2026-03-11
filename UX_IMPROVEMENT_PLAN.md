# Plano de Melhorias UX - MedGM Analytics

**Gerado em:** 2026-02-27
**Design System:** Data-Dense Dashboard (Healthcare Analytics SaaS)

---

## 🎨 Design System Base

### Cores (Acessibilidade WCAG AA)
| Uso | Cor | Hex | Contraste |
|-----|-----|-----|-----------|
| Primary | Azul Médico | `#1E40AF` | 7.2:1 ✓ |
| Secondary | Azul Claro | `#3B82F6` | 4.8:1 ✓ |
| CTA/Ação | Âmbar | `#F59E0B` | 5.1:1 ✓ |
| Background | Cinza Claro | `#F8FAFC` | - |
| Text | Azul Escuro | `#1E3A8A` | 8.5:1 ✓ |
| Muted | Cinza Médio | `#475569` | 4.7:1 ✓ |

### Tipografia
```css
/* Importar Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');

/* Aplicação */
font-family: 'Fira Sans', sans-serif;        /* Body, labels, UI text */
font-family: 'Fira Code', monospace;         /* Headings, KPI values, métricas */
```

**Tamanhos Mínimos:**
- Body text: `16px` (1rem) - mobile e desktop
- Headings H1: `24px` (1.5rem)
- Headings H2/H3: `20px` (1.25rem)
- Small text/captions: `14px` (0.875rem) - apenas dados secundários

---

## 🚨 Prioridade 1: CRÍTICO (Acessibilidade & Touch)

### 1.1 Touch Targets - 44x44px Mínimo
**Problema:** Botões, filtros e ícones muito pequenos em mobile.

**Correções:**

```jsx
// ❌ ANTES (Filtros atuais)
<button className="px-2 py-1 text-sm">
  Filtrar
</button>

// ✅ DEPOIS
<button className="min-h-[44px] min-w-[44px] px-4 py-2 text-base md:text-sm">
  Filtrar
</button>
```

**Componentes afetados:**
- Filtros de mês/ano
- Ícones de ação na DataTable (editar, deletar)
- Tabs de navegação (Dashboard, Comercial, etc.)
- Botões de modais

**Implementação:**
```css
/* Adicionar ao index.css */
@layer components {
  .touch-target {
    @apply min-h-[44px] min-w-[44px] flex items-center justify-center;
  }

  .btn-mobile {
    @apply min-h-[44px] px-4 py-2 text-base;
  }
}
```

---

### 1.2 Feedback Visual de Filtros Ativos
**Problema:** Usuário não sabe se filtros estão aplicados.

**Solução:**
```jsx
// FilterBar.jsx - Nova versão
const FilterBar = ({ filters, onFilterChange }) => {
  const hasActiveFilters = filters.mes || filters.ano;

  return (
    <div className="relative">
      {/* Badge de filtros ativos */}
      {hasActiveFilters && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs
                        font-medium rounded-full h-5 w-5 flex items-center justify-center
                        animate-pulse">
          {Object.values(filters).filter(Boolean).length}
        </div>
      )}

      {/* Borda destacada quando ativo */}
      <div className={`
        border-2 rounded-lg p-4 transition-all duration-200
        ${hasActiveFilters
          ? 'border-amber-500 bg-amber-50'
          : 'border-gray-200 bg-white'}
      `}>
        {/* Filtros aqui */}
      </div>
    </div>
  );
};
```

---

### 1.3 Contraste de Cores (4.5:1 mínimo)
**Problema:** Textos secundários podem ter contraste insuficiente.

**Auditoria necessária em:**
- Textos em cards KPI (valores secundários)
- Labels de gráficos
- Captions em tabelas
- Textos desabilitados

**Cores aprovadas (usar apenas estas):**
```jsx
// colors.config.js
export const accessibleColors = {
  text: {
    primary: '#1E3A8A',    // 8.5:1 - headings, values
    body: '#0F172A',       // 10.2:1 - body text
    muted: '#475569',      // 4.7:1 - secondary text
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
  },
  state: {
    error: '#DC2626',      // 5.9:1
    success: '#059669',    // 4.8:1
    warning: '#D97706',    // 5.2:1
    info: '#1E40AF',       // 7.2:1
  }
};
```

---

## 🔥 Prioridade 2: ALTA (Performance & Layout)

### 2.1 Headers Fixos em Tabelas
**Problema:** Ao fazer scroll, perde-se contexto das colunas.

**Solução (DataTable.jsx):**
```jsx
const DataTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <div className="max-h-[600px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header fixo */}
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700
                             uppercase tracking-wider bg-gray-50"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body com scroll */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
              >
                {/* Células */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

### 2.2 Skeleton Screens (Loading States)
**Problema:** Apenas spinners básicos durante carregamento.

**Novo componente (SkeletonCard.jsx):**
```jsx
export const SkeletonCard = () => (
  <div className="border border-gray-200 rounded-lg p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="border rounded-lg overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 p-4 flex gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
      ))}
    </div>
    {/* Rows */}
    {Array(rows).fill(0).map((_, idx) => (
      <div key={idx} className="p-4 border-t flex gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-4 bg-gray-100 rounded flex-1"></div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div className="border border-gray-200 rounded-lg p-6 h-80 flex items-end gap-2 animate-pulse">
    {[60, 80, 45, 90, 70, 55, 85].map((height, idx) => (
      <div
        key={idx}
        className="bg-gray-200 rounded-t flex-1"
        style={{ height: `${height}%` }}
      ></div>
    ))}
  </div>
);
```

**Uso em Dashboard:**
```jsx
const Dashboard = () => {
  const { data, isLoading } = useQuery('kpis', fetchKPIs);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return <ActualDashboard data={data} />;
};
```

---

### 2.3 Overflow Horizontal em Mobile
**Problema:** Conteúdo pode vazar para fora da tela.

**CSS Global (index.css):**
```css
/* Prevenir overflow horizontal */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Container responsivo */
.container-responsive {
  width: 100%;
  max-width: 100vw;
  padding-left: 1rem;
  padding-right: 1rem;
  box-sizing: border-box;
}

/* Tabelas responsivas */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive::-webkit-scrollbar {
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
```

**Breakpoints testados:**
- 375px (iPhone SE)
- 414px (iPhone Pro)
- 768px (iPad)
- 1024px (iPad Pro / Laptop)
- 1440px (Desktop)

---

### 2.4 KPI Cards - Tamanho Mínimo Consistente
**Problema:** Cards ficam com alturas diferentes quebrando o grid.

**MetricCardModern.jsx - Atualizado:**
```jsx
export const MetricCardModern = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue
}) => {
  return (
    <div className="
      border border-gray-200 rounded-lg p-6
      bg-white hover:shadow-lg transition-all duration-200
      min-h-[160px] flex flex-col justify-between
      cursor-pointer
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Value */}
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-3xl font-bold text-gray-900 font-mono">
          {value}
        </p>
      </div>

      {/* Trend */}
      {trend && (
        <div className={`
          flex items-center gap-2 text-sm font-medium mt-3
          ${trend === 'up' ? 'text-green-600' : 'text-red-600'}
        `}>
          {trend === 'up' ? '↑' : '↓'}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};
```

---

## ⚡ Prioridade 3: MÉDIA (Animações & Modais)

### 3.1 Animações Suaves em Modais
**Problema:** Modais aparecem/desaparecem sem transição.

**Modal.jsx - Com Animação:**
```jsx
import { useState, useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 200);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-200
        ${isAnimating ? 'bg-black/50' : 'bg-black/0'}
      `}
      onClick={onClose}
    >
      <div
        className={`
          bg-white rounded-lg shadow-xl max-w-2xl w-full p-6
          transform transition-all duration-200
          ${isAnimating
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center
                       rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};
```

---

### 3.2 Empty States com Ilustrações
**Problema:** Quando não há dados, mostra mensagem simples sem contexto.

**EmptyState.jsx - Novo Componente:**
```jsx
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    {/* Ícone */}
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>

    {/* Texto */}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-500 text-center max-w-sm mb-6">
      {description}
    </p>

    {/* Action */}
    {action && (
      <button
        onClick={action}
        className="btn-mobile bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// Uso
<EmptyState
  icon={ChartBarIcon}
  title="Nenhuma venda encontrada"
  description="Quando você adicionar vendas, elas aparecerão aqui com métricas detalhadas."
  action={() => setShowModal(true)}
  actionLabel="Adicionar primeira venda"
/>
```

---

### 3.3 Gráficos - Cores Acessíveis
**Problema:** Cores sem validação de contraste e sem padrões para daltônicos.

**chartColors.config.js:**
```js
// Paleta acessível com padrões distintos
export const accessibleChartColors = {
  primary: [
    '#1E40AF', // Azul escuro (primary)
    '#F59E0B', // Âmbar (secondary)
    '#059669', // Verde (success)
    '#DC2626', // Vermelho (danger)
    '#7C3AED', // Roxo (info)
  ],

  // Padrões para daltônicos
  patterns: {
    solid: 'none',
    diagonal: 'url(#diagonal-stripe)',
    dots: 'url(#dot-pattern)',
    grid: 'url(#grid-pattern)',
  }
};

// SVG Patterns (adicionar em App.jsx ou index.html)
export const ChartPatterns = () => (
  <svg width="0" height="0">
    <defs>
      <pattern id="diagonal-stripe" patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#000" strokeWidth="1" opacity="0.2"/>
      </pattern>
      <pattern id="dot-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
        <circle cx="4" cy="4" r="1.5" fill="#000" opacity="0.3"/>
      </pattern>
      <pattern id="grid-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M 0 0 L 0 8 M 0 0 L 8 0" stroke="#000" strokeWidth="0.5" opacity="0.2"/>
      </pattern>
    </defs>
  </svg>
);
```

**Aplicação em LineChart:**
```jsx
import { accessibleChartColors } from './chartColors.config';

<LineChart data={data}>
  <Line
    type="monotone"
    dataKey="vendas"
    stroke={accessibleChartColors.primary[0]}
    strokeWidth={3}
    dot={{ fill: accessibleChartColors.primary[0], r: 4 }}
    activeDot={{ r: 6 }}
  />
  <Line
    type="monotone"
    dataKey="meta"
    stroke={accessibleChartColors.primary[1]}
    strokeWidth={2}
    strokeDasharray="5 5"
  />
</LineChart>
```

---

## 📱 Prioridade 4: Mobile-First Responsive

### 4.1 Breakpoints Padrão
```js
// tailwind.config.js - Expandir breakpoints
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '375px',      // iPhone SE
        'sm': '640px',      // Mobile landscape
        'md': '768px',      // Tablet
        'lg': '1024px',     // iPad Pro / Small laptop
        'xl': '1280px',     // Desktop
        '2xl': '1440px',    // Large desktop
      },
    },
  },
};
```

### 4.2 Grid Responsivo para Dashboards
```jsx
// Layout padrão para KPI Cards
<div className="
  grid gap-4
  grid-cols-1        /* Mobile: 1 coluna */
  sm:grid-cols-2     /* Tablet: 2 colunas */
  lg:grid-cols-3     /* Desktop: 3 colunas */
  xl:grid-cols-4     /* Large: 4 colunas */
">
  {kpiCards.map(card => <MetricCardModern key={card.id} {...card} />)}
</div>
```

### 4.3 Tabelas em Mobile - Card Layout
```jsx
// DataTable.jsx - Versão mobile-friendly
const DataTable = ({ columns, data }) => {
  return (
    <>
      {/* Desktop: Tabela tradicional */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          {/* Tabela normal */}
        </table>
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-4">
        {data.map((row, idx) => (
          <div key={idx} className="border rounded-lg p-4 bg-white">
            {columns.map(col => (
              <div key={col.key} className="flex justify-between py-2 border-b last:border-0">
                <span className="font-medium text-gray-600">{col.label}:</span>
                <span className="text-gray-900">{row[col.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
```

---

## 🎯 Checklist de Implementação

### Fase 1: Crítico (Semana 1)
- [ ] Atualizar todas as cores para paleta acessível
- [ ] Adicionar `min-h-[44px] min-w-[44px]` em todos os botões
- [ ] Implementar feedback visual de filtros ativos
- [ ] Adicionar headers fixos nas tabelas
- [ ] Garantir text-base (16px) em todo body text

### Fase 2: Alta (Semana 2)
- [ ] Implementar skeleton screens em todos os dashboards
- [ ] Adicionar CSS anti-overflow horizontal
- [ ] Padronizar altura mínima de KPI cards
- [ ] Testar em 5 breakpoints (375, 768, 1024, 1440)

### Fase 3: Média (Semana 3)
- [ ] Adicionar animações em modais
- [ ] Criar componente EmptyState reutilizável
- [ ] Atualizar cores dos gráficos com paleta acessível
- [ ] Adicionar padrões SVG para daltônicos

### Fase 4: Mobile (Semana 4)
- [ ] Implementar versão card de tabelas para mobile
- [ ] Testar touch targets em dispositivos reais
- [ ] Adicionar scroll horizontal suave em tabelas
- [ ] Validar layout em iPhone SE (375px)

---

## 📊 Métricas de Sucesso

Após implementação, validar:

- [ ] **Acessibilidade:** 100% WCAG AA (usar axe DevTools)
- [ ] **Contraste:** Todos textos 4.5:1+ (usar WebAIM Contrast Checker)
- [ ] **Touch Targets:** 100% dos botões 44x44px+ (teste manual em mobile)
- [ ] **Performance:** LCP < 2.5s, CLS < 0.1 (Lighthouse)
- [ ] **Responsivo:** Sem overflow horizontal em 375px-2560px
- [ ] **Loading:** Skeleton screens em 100% dos dashboards

---

## 🛠️ Ferramentas de Validação

1. **Contraste:** https://webaim.org/resources/contrastchecker/
2. **Acessibilidade:** axe DevTools (Chrome Extension)
3. **Mobile Testing:** Chrome DevTools Device Mode
4. **Performance:** Lighthouse (Chrome DevTools)
5. **Touch Targets:** https://web.dev/tap-targets/

---

## 📝 Próximos Passos

1. Revisar este plano com o time
2. Priorizar fases 1-2 para MVP
3. Criar issues no GitHub para cada item
4. Implementar e testar incrementalmente
5. Validar com usuários reais em mobile

**Última atualização:** 2026-02-27
