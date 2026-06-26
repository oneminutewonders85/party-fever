/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Party Fever core palette (from the mockups)
        grape: { 900: '#1a0b2e', 800: '#2a1450', 700: '#3a1f8f', 600: '#4f2ed9', 500: '#7a2fd0' },
        ink: '#0e0618',
        cyan: { DEFAULT: '#06b6d4' },
        magenta: { DEFAULT: '#d61f9e' },
        // 12 player colours
        p: {
          red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', green: '#22c55e',
          purple: '#a855f7', orange: '#f97316', pink: '#ec4899', teal: '#14b8a6',
          indigo: '#6366f1', lime: '#84cc16', cyan: '#06b6d4', rose: '#f43f5e',
        },
      },
      borderRadius: { tile: '28px', card: '22px' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        popIn: { '0%': { transform: 'scale(.6)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        popIn: 'popIn .35s cubic-bezier(.2,1.3,.5,1) both',
        shimmer: 'shimmer 6s ease infinite',
      },
    },
  },
  plugins: [],
}
