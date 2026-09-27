/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#0d3b66',
          dark: '#08233e',
          light: '#f4f7fb',
          accent: '#0284c7',
          gold: '#d97706',
          green: '#15803d',
          danger: '#b91c1c'
        }
      }
    },
  },
  plugins: [],
}
