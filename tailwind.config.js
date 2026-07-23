/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Night scale - dark backgrounds (higher = darker)
        night: {
          50: '#eef2f8',
          100: '#c7d2e8',
          200: '#7c8db5',
          300: '#4a5a82',
          400: '#2e3a5c',
          500: '#1e2845',   // borders / elevated surface
          600: '#161e33',   // card background
          700: '#0f1525',   // main background
          800: '#0a0e1a',   // input / deep
          900: '#050810',   // void
        },
        // Glow - aurora teal (primary accent)
        glow: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',   // main accent
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        // Aurora - purple (secondary accent)
        aurora: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        display: ['Noto Serif SC', 'Songti SC', 'serif'],
        body: ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
