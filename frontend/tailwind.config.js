/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#1d5bd8',
          700: '#1e40af',
          900: '#1e3a8a',
          title: '#1b365d',
        },
        surface: {
          bg: '#f0f4f9',
          card: '#ffffff',
          sidebar: '#ffffff',
          hover: '#f8fafc',
          border: '#e2e8f0',
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
