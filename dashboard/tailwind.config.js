/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb'
        },
        danger: {
          DEFAULT: '#ef4444',
          dark: '#dc2626'
        },
        success: {
          DEFAULT: '#22c55e',
          dark: '#16a34a'
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#d97706'
        },
        dark: {
          DEFAULT: '#0f172a',
          lighter: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
