/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
      },
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        pelorous: {
          50: '#eefdfd',
          100: '#d3f9fa',
          200: '#adf0f4',
          300: '#74e4ec',
          400: '#34cedc',
          500: '#18aebe',
          600: '#178fa3',
          700: '#1a7284',
          800: '#1e5e6c',
          900: '#1d4e5c',
          950: '#0d333f',
        },

      }
    },
  },
  plugins: [],
}
