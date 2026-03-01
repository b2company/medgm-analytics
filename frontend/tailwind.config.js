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
        // MedGM Brand Identity 2026
        'medgm': {
          'clean': '#F5F5F5',    // Primary Clean (background)
          'gold': '#D6B991',      // Primary Gold (accent/CTA)
          'dark': '#2B2B2B',      // Primary Dark Gray
          'black': '#151515',     // Primary Black

          // Grayscale Palette
          'gray-50': '#FAFAFA',
          'gray-100': '#F5F5F5',
          'gray-200': '#E5E5E5',
          'gray-300': '#D4D4D4',
          'gray-400': '#A3A3A3',
          'gray-500': '#737373',
          'gray-600': '#525252',
          'gray-700': '#404040',
          'gray-800': '#262626',
        },

        // Primary/Secondary mapped to MedGM brand
        primary: '#D6B991',        // Gold for CTAs
        secondary: '#2B2B2B',      // Dark for secondary actions

        // Functional colors (analytics)
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',

        // Backgrounds
        'bg-main': '#F5F5F5',      // MedGM Clean
        'bg-card': '#FFFFFF',
        'bg-hover': '#FAFAFA',
      },
      fontFamily: {
        'sans': ['Gilroy', 'system-ui', 'sans-serif'],
        'gilroy': ['Gilroy', 'sans-serif'],
        'heading': ['Gilroy', 'sans-serif'],
        'body': ['Gilroy', 'sans-serif'],
      },
      fontWeight: {
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(21, 21, 21, 0.04), 0 1px 2px 0 rgba(21, 21, 21, 0.02)',
        'card-hover': '0 8px 16px -4px rgba(21, 21, 21, 0.08), 0 4px 6px -2px rgba(21, 21, 21, 0.04)',
        'premium': '0 4px 20px -2px rgba(214, 185, 145, 0.15)',
        'gold-glow': '0 0 20px rgba(214, 185, 145, 0.3)',
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
