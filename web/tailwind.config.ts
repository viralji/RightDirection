import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff5ff',
          100: '#dbe6ff',
          400: '#7aa8ff',
          500: '#2b7cff',
          600: '#1a6aee',
          700: '#0f3d8a',
          900: '#08204d',
        },
        surface: {
          DEFAULT: '#0f1221',
          card: '#151936',
          card2: '#1b2147',
          border: '#1f2759',
        },
        text: {
          primary: '#eef3ff',
          secondary: '#c8d0e8',
          muted: '#7a8499',
        },
        status: {
          success: '#32c671',
          warning: '#ffb020',
          error: '#ef5350',
          info: '#38b2fc',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
