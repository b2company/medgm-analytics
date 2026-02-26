import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const mainNavLinks = [
    { path: '/comercial', label: 'Comercial' },
    { path: '/config', label: 'Config' }
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/comercial" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#2B2B2B' }}>
                    MedGM <span className="text-amber-600">Analytics</span>
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Growth & Marketing</p>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-12 sm:flex sm:space-x-2">
              {mainNavLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'border-amber-500 text-gray-900 bg-amber-50 rounded-t-lg'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-900 hover:text-amber-600 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 transition-colors"
            >
              <span className="sr-only">Abrir menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {mainNavLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block pl-4 pr-4 py-3 border-l-4 text-base font-medium transition-all rounded-r-lg ${
                  isActive(link.path)
                    ? 'bg-amber-50 border-amber-500 text-gray-900'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
