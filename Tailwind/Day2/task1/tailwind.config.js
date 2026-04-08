/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // or 'media'
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1f2937',
        accent: '#f43f5e',
        muted: '#6b7280',
        background: '#f1f5f9',
        violet: '#8b5cf6',
        indigo: '#6366f1',
        purple: '#7e22ce',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        xs: '320px',
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1440px',
      },
    },
  },
  plugins: [],
}