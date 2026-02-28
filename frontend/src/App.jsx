import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarModern from './components/SidebarModern';
import { ConfigProvider } from './context/ConfigContext';

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
          {/* Rotas públicas (sem sidebar) */}
          <Route path="/form/social-selling" element={<SocialSellingFormPublic />} />
          <Route path="/form/sdr" element={<SDRFormPublic />} />
          <Route path="/form/closer" element={<CloserFormPublic />} />
          <Route path="/form/vendas" element={<VendasFormPublic />} />

          {/* Rotas protegidas (com sidebar moderna) */}
          <Route path="/*" element={
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
                    <Route path="/comercial" element={<Comercial />} />
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="/config" element={<Config />} />

                    {/* Rotas antigas mantidas para compatibilidade */}
                    <Route path="/social-selling" element={<SocialSelling />} />
                    <Route path="/sdr" element={<SDR />} />
                    <Route path="/closer" element={<Closer />} />
                    <Route path="/metas" element={<Metas />} />
                    <Route path="/planejamento" element={<Planejamento />} />
                    <Route path="/dfc" element={<DFC />} />
                    <Route path="/dre" element={<DRE />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                  </Routes>
                </Suspense>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
    </ConfigProvider>
  );
}

export default App;
