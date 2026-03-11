import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarModern from './components/SidebarModern';
import { ConfigProvider } from './context/ConfigContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';

// Lazy loading de páginas principais
const Comercial = lazy(() => import('./pages/Comercial'));
const Financeiro = lazy(() => import('./pages/Financeiro'));
const Config = lazy(() => import('./pages/Config'));

// Lazy loading de páginas secundárias (compatibilidade)
const Upload = lazy(() => import('./pages/Upload'));
const SocialSelling = lazy(() => import('./pages/SocialSelling'));
const SDR = lazy(() => import('./pages/SDR'));
const Closer = lazy(() => import('./pages/Closer'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const Metas = lazy(() => import('./pages/Metas'));
const Planejamento = lazy(() => import('./pages/Planejamento'));
const DFC = lazy(() => import('./pages/DFC'));
const DRE = lazy(() => import('./pages/DRE'));
const Marketing = lazy(() => import('./pages/Marketing'));

// Formulários públicos com lazy loading
const SocialSellingFormPublic = lazy(() => import('./pages/forms/SocialSellingFormPublic'));
const SDRFormPublic = lazy(() => import('./pages/forms/SDRFormPublic'));
const CloserFormPublic = lazy(() => import('./pages/forms/CloserFormPublic'));
const VendasFormPublic = lazy(() => import('./pages/forms/VendasFormPublic'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-bg-main">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-text-secondary">Carregando...</p>
    </div>
  </div>
);

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Rotas de autenticação (sem sidebar) */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />

          {/* Rotas públicas (sem sidebar) */}
          <Route path="/form/social-selling" element={<SocialSellingFormPublic />} />
          <Route path="/form/sdr" element={<SDRFormPublic />} />
          <Route path="/form/closer" element={<CloserFormPublic />} />
          <Route path="/form/vendas" element={<VendasFormPublic />} />

          {/* Rotas protegidas (com sidebar moderna) */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-bg-main">
                {/* Sidebar Fixa */}
                <SidebarModern />

                {/* Conteúdo Principal com margem para sidebar */}
                <div className="flex-1 ml-64">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-screen">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">Carregando página...</p>
                      </div>
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<Navigate to="/comercial" replace />} />

                      {/* Rotas acessíveis a todos (usuários e admins) */}
                      <Route path="/comercial" element={<Comercial />} />
                      <Route path="/social-selling" element={<SocialSelling />} />
                      <Route path="/sdr" element={<SDR />} />
                      <Route path="/closer" element={<Closer />} />

                      {/* Rotas apenas para ADMINS */}
                      <Route path="/financeiro" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Financeiro />
                        </ProtectedRoute>
                      } />
                      <Route path="/marketing" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Marketing />
                        </ProtectedRoute>
                      } />
                      <Route path="/config" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Config />
                        </ProtectedRoute>
                      } />
                      <Route path="/metas" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Metas />
                        </ProtectedRoute>
                      } />
                      <Route path="/planejamento" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Planejamento />
                        </ProtectedRoute>
                      } />
                      <Route path="/dfc" element={
                        <ProtectedRoute requireAdmin={true}>
                          <DFC />
                        </ProtectedRoute>
                      } />
                      <Route path="/dre" element={
                        <ProtectedRoute requireAdmin={true}>
                          <DRE />
                        </ProtectedRoute>
                      } />
                      <Route path="/upload" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Upload />
                        </ProtectedRoute>
                      } />
                      <Route path="/configuracoes" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Configuracoes />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </Suspense>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
    </ConfigProvider>
  );
}

export default App;
