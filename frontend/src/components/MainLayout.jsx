import React from 'react';
import { ChevronRight } from 'lucide-react';
import AppSidebar from './AppSidebar';

/**
 * MainLayout - Layout principal MedGM 2026
 * Clean background (#F5F5F5), sidebar integrada, design premium
 */
const MainLayout = ({ children, showSidebar = true }) => {
  return (
    <div className="flex min-h-screen bg-medgm-clean">
      {/* Sidebar */}
      {showSidebar && <AppSidebar variant="inset" />}

      {/* Conteúdo Principal */}
      <main className={`flex-1 ${showSidebar ? 'lg:ml-0' : ''}`}>
        {children}
      </main>
    </div>
  );
};

/**
 * Breadcrumb - Navegação contextual premium
 */
export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <ChevronRight className="w-4 h-4 text-medgm-gray-400" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-medgm-gray-600 hover:text-medgm-gold transition-colors duration-200 cursor-pointer"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-medgm-black font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * PageHeader - Header premium com breadcrumb e ações
 */
export const PageHeader = ({ breadcrumb, title, subtitle, actions }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-medgm-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="px-6 lg:px-8 py-5">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}

        {/* Título e Ações */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-medgm-black tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-medgm-gray-600 mt-2 text-base">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-3 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * Container - Container responsivo com max-width
 */
export const Container = ({ children, size = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    lg: 'max-w-[1600px]',
    full: 'max-w-full'
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default MainLayout;
