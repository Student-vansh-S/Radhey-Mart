/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0f1115',
          dark: '#141823',
          card: '#1a2033',
          border: '#2a3045',
          muted: '#6b7280',
          light: '#9ca3af',
        }
      }
    }
  },
  plugins: [],
}
