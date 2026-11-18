/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rr: {
          pink: '#EA1A85',
          darkpink: '#C5116D',
          lightpink: '#FDF2F8',
          borderpink: '#F5B8D8',
          blue: '#071E54',
          darkblue: '#041030',
          lightblue: '#1E3A8A',
          gold: '#D4AF37',
          lightgold: '#FDF6E2',
          surface: '#FFFFFF',
          muted: '#64748B',
          subtle: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
