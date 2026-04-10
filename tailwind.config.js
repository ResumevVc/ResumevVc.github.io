/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'retro-white': '#f8f8f8',
        'retro-black': '#1a1a1a',
        'retro-red': '#e63946',
        'retro-gray': '#d3d3d3',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace', 'ui-monospace', 'SFMono-Regular'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
