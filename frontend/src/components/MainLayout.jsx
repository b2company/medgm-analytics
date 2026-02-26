import React from 'react';
import AppSidebar from './AppSidebar';

/**
 * Layout principal da aplicação com sidebar integrada
 * Inspirado em design systems modernos
 */
const MainLayout = ({ children, showSidebar = true }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
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
 * Breadcrumb simples para navegação contextual
 */
export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <span className="text-gray-400">/</span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * Header com breadcrumb e ações
 */
export const PageHeader = ({ breadcrumb, title, subtitle, actions }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="mb-3">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}

        {/* Título e Ações */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 mt-1 text-base">{subtitle}</p>
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

export default MainLayout;
