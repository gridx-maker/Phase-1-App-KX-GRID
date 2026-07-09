/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        unbounded: ['Unbounded', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        teko: ['Teko', 'sans-serif'],
      },
      colors: {
        background: '#050505',
        foreground: '#fafafa',
        surface: '#0F0F10',
        'surface-highlight': '#18181B',
        primary: {
          DEFAULT: '#00F0FF',
          hover: '#00C2CC',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#7000FF',
          hover: '#5A00CC',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FF003C',
          warning: '#FFD600',
          success: '#00FF94',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#0F0F10',
          foreground: '#fafafa',
        },
        popover: {
          DEFAULT: '#0F0F10',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#18181B',
          foreground: '#71717A',
        },
        destructive: {
          DEFAULT: '#FF003C',
          foreground: '#fafafa',
        },
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.1)',
        ring: '#00F0FF',
        chart: {
          '1': '#00F0FF',
          '2': '#7000FF',
          '3': '#FF003C',
          '4': '#FFD600',
          '5': '#00FF94',
        }
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.5)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
