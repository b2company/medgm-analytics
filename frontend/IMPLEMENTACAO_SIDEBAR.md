# 🎨 Sidebar Moderna - Guia de Implementação

## Componentes Criados

### 1. AppSidebar.jsx
Sidebar responsiva com:
- ✅ Logo MedGM
- ✅ Navegação por seções (Comercial, Configurações)
- ✅ Ícones para cada item
- ✅ Estado ativo com destaque âmbar
- ✅ Mobile responsive (toggle)
- ✅ Footer com perfil do usuário

### 2. MainLayout.jsx
Layout wrapper com:
- ✅ Integração sidebar + conteúdo
- ✅ Breadcrumb component
- ✅ PageHeader com título e ações
- ✅ Suporte a layouts com/sem sidebar

## Como Implementar

### Opção 1: Layout com Sidebar (Recomendado)

Envolver os dashboards com MainLayout:

```jsx
// Em App.jsx
import MainLayout from './components/MainLayout';
import { PageHeader } from './components/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas (sem sidebar) */}
        <Route path="/form/*" element={<FormsPublicos />} />

        {/* Rotas com sidebar */}
        <Route path="/*" element={
          <MainLayout showSidebar={true}>
            <Routes>
              <Route path="/comercial/social-selling" element={<SocialSelling />} />
              <Route path="/comercial/sdr" element={<SDR />} />
              <Route path="/comercial/closer" element={<Closer />} />
              <Route path="/config/*" element={<Configuracoes />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}
```

### Opção 2: Dashboard com Breadcrumb

Adicionar breadcrumb aos dashboards modernos:

```jsx
// Em SocialSellingModern.jsx
import MainLayout, { PageHeader } from '../components/MainLayout';

const SocialSellingModern = () => {
  return (
    <MainLayout>
      <PageHeader
        breadcrumb={[
          { label: 'Comercial', href: '/comercial' },
          { label: 'Social Selling' }
        ]}
        title="Social Selling"
        subtitle="Acompanhamento de métricas de marketing e ativação"
        actions={
          <>
            <button className="...">Exportar</button>
            <button className="...">Nova Métrica</button>
          </>
        }
      />

      {/* Resto do conteúdo */}
      <div className="p-6">
        {/* ... */}
      </div>
    </MainLayout>
  );
};
```

### Opção 3: Integração Completa

Para integração total sidebar + dashboards modernos:

```jsx
// 1. Atualizar App.jsx
import MainLayout from './components/MainLayout';
import SocialSellingModern from './pages/SocialSellingModern';
import SDRModern from './pages/SDRModern';
import CloserModern from './pages/CloserModern';

function App() {
  return (
    <Router>
      <Routes>
        {/* Forms públicos sem sidebar */}
        <Route path="/form/*" element={<FormsPublicos />} />

        {/* Dashboards com sidebar */}
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/comercial/social-selling" element={<SocialSellingModern />} />
              <Route path="/comercial/sdr" element={<SDRModern />} />
              <Route path="/comercial/closer" element={<CloserModern />} />
              <Route path="/config/pessoas" element={<Pessoas />} />
              <Route path="/config/metas" element={<Metas />} />
              <Route path="/config/produtos" element={<Produtos />} />
              <Route path="/" element={<Navigate to="/comercial/social-selling" replace />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}
```

## Customização da Sidebar

### Adicionar Novo Item de Menu

```jsx
// Em AppSidebar.jsx, adicionar no array menuItems:
{
  section: 'Relatórios',
  icon: '📈',
  items: [
    { path: '/relatorios/vendas', label: 'Vendas', icon: '💰' },
    { path: '/relatorios/marketing', label: 'Marketing', icon: '📊' }
  ]
}
```

### Alterar Perfil do Usuário

```jsx
// Em AppSidebar.jsx, no footer:
<div className="flex items-center gap-3 px-3 py-2">
  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
    <span className="text-sm font-semibold text-gray-600">
      {usuario.iniciais}
    </span>
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-gray-900 truncate">
      {usuario.nome}
    </p>
    <p className="text-xs text-gray-500 truncate">
      {usuario.cargo}
    </p>
  </div>
</div>
```

## Recursos da Sidebar

### Mobile Responsive
- ✅ Toggle automático em telas pequenas
- ✅ Overlay escuro ao abrir
- ✅ Botão flutuante para abrir/fechar
- ✅ Transições suaves

### Estados Visuais
- ✅ Item ativo: fundo âmbar + borda esquerda + dot
- ✅ Hover: fundo cinza claro
- ✅ Transições: 200ms ease-in-out

### Acessibilidade
- ✅ Foco keyboard visível
- ✅ Labels semânticos
- ✅ Contraste WCAG AA

## Comparação com Exemplo Original

### Semelhanças
- ✅ Sidebar fixa/responsiva
- ✅ Header com breadcrumb
- ✅ Layout flexível
- ✅ Trigger para mobile

### Diferenças (Melhorias MedGM)
- ✅ Cores da identidade visual (âmbar/dourado)
- ✅ Logo customizado
- ✅ Ícones para cada item
- ✅ Perfil do usuário no footer
- ✅ Seções agrupadas logicamente

## Próximos Passos

1. ✅ Testar sidebar isolada
2. ⬜ Integrar com DashboardLayout
3. ⬜ Adicionar breadcrumbs aos dashboards
4. ⬜ Testar navegação completa
5. ⬜ Ajustar estilos conforme necessário
6. ⬜ Deploy em produção

## Atalhos de Teclado (Futuro)

- `Ctrl/Cmd + B`: Toggle sidebar
- `Ctrl/Cmd + K`: Busca rápida
- `1-9`: Navegar por itens numerados
