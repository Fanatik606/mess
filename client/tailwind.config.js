/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#0a0b0f',
          900: '#111318',
          850: '#16181f',
          800: '#1b1e27',
          700: '#232733',
          600: '#2e3342',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          soft: '#22243f',
        },
        online: '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        shimmer: 'shimmer 1.3s linear infinite',
      },
    },
  },
  plugins: [],
};