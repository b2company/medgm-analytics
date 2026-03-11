import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/react';

/**
 * Sidebar Moderna - Design System 2026
 * - Glassmorphism effect
 * - Ícones SVG (Heroicons)
 * - Active state com highlight
 * - Hover states suaves
 * - Logo MedGM
 * - Clerk authentication with UserButton
 */
const SidebarModern = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const menuItems = [
    {
      id: 'comercial',
      label: 'Comercial',
      path: '/comercial',
      requireAdmin: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      path: '/financeiro',
      requireAdmin: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'marketing',
      label: 'Marketing',
      path: '/marketing',
      requireAdmin: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'config',
      label: 'Configurações',
      path: '/config',
      requireAdmin: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  // Get user role from Clerk
  const { orgRole } = useUser();
  const isAdmin = orgRole === 'org:admin' || user?.publicMetadata?.orgRole === 'admin';

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => !item.requireAdmin || isAdmin);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
            <span className="text-white font-heading font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-gray-900">MedGM</h1>
            <p className="text-xs text-gray-500">Analytics</p>
          </div>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 cursor-pointer
                ${
                  isActive(item.path)
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer - User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl border border-gray-200"
                }
              }}
            />
            {user && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName || user.username || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center">
          <p>v2.0.0 © 2026 MedGM</p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarModern;
