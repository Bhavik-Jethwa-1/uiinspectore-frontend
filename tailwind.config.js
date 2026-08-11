/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        violet: {
          50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE',
          500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9', 800: '#5B21B6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
