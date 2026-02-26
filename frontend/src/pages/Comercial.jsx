import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavbarModern from '../components/NavbarModern';
import DashboardGeralModerno from './DashboardGeralModerno';
import SocialSelling from './SocialSelling';
import SDR from './SDR';
import Closer from './Closer';
import Vendas from './Vendas';
import Metas from './Metas';

const Comercial = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar sub-aba da URL via hash
  const getSubTabFromURL = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'geral';
  };

  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromURL());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    setActiveSubTab(getSubTabFromURL());
  }, [location.hash]);

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    navigate(`/comercial#${tab}`);
  };

  const getMesNome = (mesNum) => {
    return new Date(2000, mesNum - 1).toLocaleString('pt-BR', { month: 'long' })
      .charAt(0).toUpperCase() + new Date(2000, mesNum - 1).toLocaleString('pt-BR', { month: 'long' }).slice(1);
  };

  // Filtros como actions da navbar
  const navActions = (
    <div className="flex gap-3">
      <select
        value={mes}
        onChange={(e) => setMes(parseInt(e.target.value))}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm font-medium"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {getMesNome(i + 1)}
          </option>
        ))}
      </select>
      <select
        value={ano}
        onChange={(e) => setAno(parseInt(e.target.value))}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm font-medium"
      >
        <option value={2025}>2025</option>
        <option value={2026}>2026</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <NavbarModern
        title="Comercial"
        subtitle={`Dashboard de vendas e performance - ${getMesNome(mes)} ${ano}`}
        actions={navActions}
      />

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Sub-tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'geral', label: 'Visão Geral', icon: '📊' },
              { id: 'ss', label: 'Social Selling', icon: '📱' },
              { id: 'sdr', label: 'SDR', icon: '📞' },
              { id: 'closer', label: 'Closer', icon: '🎯' },
              { id: 'vendas', label: 'Vendas', icon: '💰' },
              { id: 'metas', label: 'Metas', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleSubTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeSubTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das sub-abas */}
        <div className="animate-fade-in">
          {activeSubTab === 'geral' && <DashboardGeralModerno mes={mes} ano={ano} />}
          {activeSubTab === 'ss' && <SocialSelling mes={mes} ano={ano} />}
          {activeSubTab === 'sdr' && <SDR mes={mes} ano={ano} />}
          {activeSubTab === 'closer' && <Closer mes={mes} ano={ano} />}
          {activeSubTab === 'vendas' && <Vendas mes={mes} ano={ano} />}
          {activeSubTab === 'metas' && <Metas mes={mes} ano={ano} />}
        </div>
      </div>
    </div>
  );
};

export default Comercial;
