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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        cardIn: {
          '0%': { 
            transform: 'scale(0.96)',
            opacity: '0',
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        emojiPop: {
          '0%': {
            transform: 'scale(0.8)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        numberBreathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        slideDown: {
          '0%': {
            transform: 'translateY(-8px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 280ms ease-out',
        cardIn: 'cardIn 280ms ease-out',
        emojiPop: 'emojiPop 260ms ease-out',
        numberBreathe: 'numberBreathe 400ms ease-in-out',
        slideDown: 'slideDown 200ms ease-out',
      },
    },
  },
  plugins: [],
}

