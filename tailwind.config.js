/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        bg: {
          primary: '#0A1628',
          secondary: '#0F1F38',
          tertiary: '#152A48',
          elevated: '#1A3152',
        },
        border: {
          DEFAULT: '#1E3A5F',
          light: '#2A4A70',
          dark: '#142640',
        },
        text: {
          primary: '#E8F1FF',
          secondary: '#8AA0C0',
          muted: '#5A7090',
          inverse: '#0A1628',
        },
        accent: {
          DEFAULT: '#00D4FF',
          light: '#4DE2FF',
          dark: '#00A8CC',
          50: '#E6FCFF',
          100: '#BFF5FF',
          200: '#80E9FF',
          300: '#4DDFFF',
          400: '#00D4FF',
          500: '#00B8E0',
          600: '#0094B3',
          700: '#007187',
          800: '#004D5C',
          900: '#002A33',
        },
        status: {
          success: '#00C853',
          warning: '#FF6B35',
          danger: '#FF1744',
          info: '#448AFF',
          pending: '#FFAB00',
        },
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 212, 255, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        'gradient-glow': 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0) 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
