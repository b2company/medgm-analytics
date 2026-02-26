import React from 'react';

/**
 * Navbar Moderna - Design System 2026
 * - Sticky com glassmorphism
 * - Date range selector
 * - User profile
 * - Notifications
 */
const NavbarModern = ({ title, subtitle, actions }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-4">
            {/* Date Display */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">{currentDate}</span>
            </div>

            {/* Custom Actions */}
            {actions}

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Davi Feitosa</p>
                <p className="text-xs text-gray-500">CEO</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
                <span className="text-white font-semibold text-sm">DF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarModern;
