import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FinanceiroDashboard from './FinanceiroDashboard';
import DFC from './DFC';
import DRE from './DRE';
import Planejamento from './Planejamento';
import TransacoesFinanceiras from '../components/TransacoesFinanceiras';

const Financeiro = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSubTabFromURL = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'dashboard';
  };

  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromURL());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    setActiveSubTab(getSubTabFromURL());
  }, [location.hash]);

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    navigate(`/financeiro#${tab}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>

        <div className="flex gap-4">
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(2000, i).toLocaleString('pt-BR', { month: 'long' }).slice(1)}
              </option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'transacoes', label: 'Transações' },
            { id: 'dfc', label: 'DFC' },
            { id: 'dre', label: 'DRE' },
            { id: 'planejamento', label: 'Planejamento' }
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
      {activeSubTab === 'dashboard' && <FinanceiroDashboard mes={mes} ano={ano} />}
      {activeSubTab === 'transacoes' && <TransacoesFinanceiras mes={mes} ano={ano} />}
      {activeSubTab === 'dfc' && <DFC mes={mes} ano={ano} />}
      {activeSubTab === 'dre' && <DRE mes={mes} ano={ano} />}
      {activeSubTab === 'planejamento' && <Planejamento ano={ano} />}
    </div>
  );
};

export default Financeiro;
