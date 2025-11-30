/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#00C4CC',
        'accent-hover': '#00B0B8',
      },
    },
  },
  plugins: [],
}

