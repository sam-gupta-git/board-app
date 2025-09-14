/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'sticky-yellow': '#fef3c7',
        'sticky-pink': '#fce7f3',
        'sticky-blue': '#dbeafe',
        'sticky-green': '#dcfce7',
        'sticky-purple': '#e9d5ff'
      }
    },
  },
  plugins: [],
}
