/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Cores para funis - garantir que sejam incluídas no bundle
    'bg-purple-500',
    'bg-purple-600',
    'bg-pink-500',
    'bg-pink-600',
    'bg-indigo-500',
    'bg-indigo-600',
    'bg-gray-500',
    'bg-blue-500',
    'bg-blue-600',
    'bg-green-500',
    'bg-green-600',
  ],
  theme: {
    extend: {
      colors: {
        // Design System 2026 - Analytics Dashboard
        primary: '#1E40AF', // Blue data
        'primary-light': '#3B82F6',
        'primary-dark': '#1E3A8A',
        secondary: '#3B82F6',
        accent: '#F59E0B', // Amber CTA

        // MedGM Brand Colors (legacy)
        'brand-gold': '#D6B991',
        'brand-clean': '#F8FAFC',
        'brand-dark': '#2B2B2B',
        'brand-black': '#151515',

        // Functional colors
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',

        // Backgrounds
        'bg-main': '#F8FAFC',
        'bg-card': '#FFFFFF',
        'bg-hover': '#F1F5F9',
      },
      fontFamily: {
        'heading': ['Fira Code', 'monospace'],
        'body': ['Fira Sans', 'sans-serif'],
        'gilroy': ['Gilroy', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
