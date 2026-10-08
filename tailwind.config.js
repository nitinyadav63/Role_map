/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: {
          DEFAULT: '#12121c',
          card: '#161626',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: '#1e1e32',
        },
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          hover: '#4f46e5',
          light: '#818cf8',
          glow: 'rgba(99, 102, 241, 0.35)',
        },
        accent: {
          purple: '#a855f7',
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99, 102, 241, 0.25)',
        'glow-md': '0 0 25px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 45px rgba(168, 85, 247, 0.3)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
