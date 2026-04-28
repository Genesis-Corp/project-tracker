/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f13',
        surface: '#1a1a24',
        'surface-2': '#242433',
        accent: {
          account: '#8b5cf6',
          project: '#f97316',
          idea: '#14b8a6',
          task: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
