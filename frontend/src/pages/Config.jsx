import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Configuracoes from './Configuracoes';

const Config = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSubTabFromURL = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'equipe';
  };

  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromURL());

  useEffect(() => {
    setActiveSubTab(getSubTabFromURL());
  }, [location.hash]);

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    navigate(`/config#${tab}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'equipe', label: 'Equipe' },
            { id: 'produtos', label: 'Produtos' },
            { id: 'funis', label: 'Funis' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSubTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das sub-abas */}
      {activeSubTab === 'equipe' && <Configuracoes activeTab="equipe" />}
      {activeSubTab === 'produtos' && <Configuracoes activeTab="produtos" />}
      {activeSubTab === 'funis' && <Configuracoes activeTab="funis" />}
    </div>
  );
};

export default Config;
