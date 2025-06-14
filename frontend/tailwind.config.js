/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        priority: {
          p1: '#ef4444',
          p2: '#f97316',
          p3: '#3b82f6',
          p4: '#6b7280',
        }
      }
    },
  },
  plugins: [],
}