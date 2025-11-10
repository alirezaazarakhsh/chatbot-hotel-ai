/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--app-font)', 'sans-serif'],
        'yekan-bakh': ['"Yekan Bakh"', 'sans-serif'],
        'vazirmatn': ['"Vazirmatn"', 'sans-serif'],
        'samim': ['"Samim"', 'sans-serif'],
        'b-nazanin': ['"B Nazanin"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
