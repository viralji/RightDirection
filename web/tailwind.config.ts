import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#dce9fd',
          200: '#b9d4fc',
          300: '#8bb8f8',
          400: '#6ba3f5',
          500: '#5b8def',
          600: '#4578d4',
          700: '#3560b0',
          800: '#2a4d8f',
          900: '#1e3a6e',
        },
        surface: {
          DEFAULT: '#f4f6fb',
          bg: '#f4f6fb',
          card: '#ffffff',
          card2: '#eef2f8',
          border: '#e2e8f2',
          hover: '#f8fafc',
        },
        text: {
          primary: '#1a2332',
          secondary: '#4a5568',
          muted: '#8b95a8',
        },
        pastel: {
          blue: '#e8f1ff',
          mint: '#e6faf3',
          peach: '#fff0e8',
          lilac: '#f3ecff',
          rose: '#ffe8ee',
          sand: '#faf6ef',
        },
        status: {
          success: '#22c55e',
          'success-bg': '#dcfce7',
          warning: '#d97706',
          'warning-bg': '#fef3c7',
          error: '#ef4444',
          'error-bg': '#fee2e2',
          info: '#3b82f6',
          'info-bg': '#dbeafe',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(26 35 50 / 0.06), 0 1px 2px -1px rgb(26 35 50 / 0.04)',
        soft: '0 4px 20px -4px rgb(91 141 239 / 0.12)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
