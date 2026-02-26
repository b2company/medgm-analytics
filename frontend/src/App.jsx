import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarModern from './components/SidebarModern';
import Comercial from './pages/Comercial';
import Financeiro from './pages/Financeiro';
import Config from './pages/Config';
import Upload from './pages/Upload';
import SocialSelling from './pages/SocialSelling';
import SDR from './pages/SDR';
import Closer from './pages/Closer';
import Configuracoes from './pages/Configuracoes';
import Metas from './pages/Metas';
import Planejamento from './pages/Planejamento';
import DFC from './pages/DFC';
import DRE from './pages/DRE';

// Formulários públicos
import SocialSellingFormPublic from './pages/forms/SocialSellingFormPublic';
import SDRFormPublic from './pages/forms/SDRFormPublic';
import CloserFormPublic from './pages/forms/CloserFormPublic';
import VendasFormPublic from './pages/forms/VendasFormPublic';

function App() {
  return (
    <Router>
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
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
