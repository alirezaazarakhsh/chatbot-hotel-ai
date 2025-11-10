/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // This configures Tailwind to use our CSS variable `--app-font` as the default sans-serif font.
        // The `App.tsx` component dynamically sets this variable based on user settings.
        sans: ['var(--app-font)', 'Vazirmatn', 'sans-serif'],
      },
    },
  },
  plugins: [],
}