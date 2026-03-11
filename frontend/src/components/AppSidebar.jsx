import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar moderna e responsiva para MedGM Analytics
 * Inspirada em design systems modernos, adaptada para identidade visual MedGM
 */
const AppSidebar = ({ variant = 'default' }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    {
      section: 'Comercial',
      icon: '📊',
      items: [
        { path: '/comercial/social-selling', label: 'Social Selling', icon: '👥' },
        { path: '/comercial/sdr', label: 'SDR', icon: '📞' },
        { path: '/comercial/closer', label: 'Closer', icon: '💰' }
      ]
    },
    {
      section: 'Configurações',
      icon: '⚙️',
      items: [
        { path: '/config/pessoas', label: 'Pessoas', icon: '👤' },
        { path: '/config/metas', label: 'Metas', icon: '🎯' },
        { path: '/config/produtos', label: 'Produtos', icon: '📦' }
      ]
    }
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${variant === 'inset' ? 'lg:relative' : ''}
          w-72 lg:w-72
        `}
      >
        {/* Header da Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link to="/comercial" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">
                MedGM
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">Analytics</p>
            </div>
          </Link>

          {/* Botão de toggle mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {menuItems.map((section, idx) => (
              <div key={idx}>
                {/* Título da seção */}
                <div className="flex items-center gap-2 px-3 mb-2">
                  <span className="text-lg">{section.icon}</span>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.section}
                  </h2>
                </div>

                {/* Items da seção */}
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-sm font-medium transition-all duration-200
                          ${isActive(item.path)
                            ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900 shadow-sm border-l-4 border-amber-500'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                        {isActive(item.path) && (
                          <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full"></span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer da Sidebar */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-600">DF</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Davi Feitosa</p>
              <p className="text-xs text-gray-500 truncate">CEO • MedGM</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Botão de toggle para mobile */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
};

export default AppSidebar;
