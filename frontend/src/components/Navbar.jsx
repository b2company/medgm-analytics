import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Settings } from 'lucide-react';

/**
 * Navbar - Header premium com identidade visual MedGM
 * Design System 2026: Clean, elegante, com logo MedGM
 */
const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const mainNavLinks = [
    { path: '/comercial', label: 'Comercial', icon: BarChart3 },
    { path: '/config', label: 'Configurações', icon: Settings }
  ];

  return (
    <nav className="bg-white border-b border-medgm-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo MedGM */}
          <div className="flex items-center">
            <Link
              to="/comercial"
              className="flex items-center gap-3 group transition-all duration-200 hover:opacity-80"
            >
              {/* Logo Icon */}
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-medgm-gold to-medgm-gold/80 rounded-lg flex items-center justify-center shadow-premium group-hover:shadow-gold-glow transition-all duration-200">
                  <span className="text-white font-bold text-xl tracking-tight">M</span>
                </div>
              </div>

              {/* Texto Logo */}
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold tracking-tight text-medgm-black">
                  MedGM <span className="text-medgm-gold">Analytics</span>
                </h1>
                <p className="text-xs text-medgm-gray-600 font-medium -mt-0.5">
                  Assessoria de Growth
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:ml-12 md:gap-2">
              {mainNavLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                    transition-all duration-200 cursor-pointer
                    ${isActive(path)
                      ? 'bg-medgm-gold text-white shadow-premium'
                      : 'text-medgm-dark hover:bg-medgm-gray-100 hover:text-medgm-black'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Future: User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Placeholder for user avatar or notifications */}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-lg text-medgm-dark hover:bg-medgm-gray-100 transition-colors duration-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-medgm-gray-200 bg-white shadow-lg animate-fade-in">
          <div className="p-4 space-y-2">
            {mainNavLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm
                  transition-all duration-200 cursor-pointer
                  ${isActive(path)
                    ? 'bg-medgm-gold text-white shadow-premium'
                    : 'text-medgm-dark hover:bg-medgm-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
