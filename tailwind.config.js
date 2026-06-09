/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#0b0c10',
        sidebarAlt: '#111218',
        surface: '#151720',
        surfaceAlt: '#1d1f2a',
        accent: '#4f46e5',
        accentSoft: '#3730a3',
        borderSubtle: '#272935',
        textMuted: '#9ca3af',
      },
      boxShadow: {
        soft: '0 10px 40px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}

