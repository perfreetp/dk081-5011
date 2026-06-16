/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        walnut: {
          DEFAULT: '#8B6914',
          light: '#A8842A',
          dark: '#6E5410',
          50: '#F5EDD4',
          100: '#EBDCA9',
          200: '#D7C273',
          300: '#C4A84D',
          400: '#A8842A',
          500: '#8B6914',
          600: '#6E5410',
          700: '#513F0C',
          800: '#342A08',
          900: '#171504',
        },
        cream: {
          DEFAULT: '#FAF7F0',
          dark: '#F0EBE0',
          50: '#FDFCF9',
          100: '#FAF7F0',
          200: '#F5F0E5',
          300: '#F0EBE0',
          400: '#E5DDD0',
          500: '#D4C9B8',
        },
        charcoal: {
          DEFAULT: '#2D2D2D',
          light: '#4A4A4A',
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#B0B0B0',
          300: '#808080',
          400: '#5A5A5A',
          500: '#4A4A4A',
          600: '#2D2D2D',
          700: '#1A1A1A',
        },
        sage: {
          DEFAULT: '#7C9A6E',
          light: '#9DB890',
          50: '#EFF5ED',
          100: '#D5E6D0',
          200: '#B8D4AF',
          300: '#9DB890',
          400: '#8AA87A',
          500: '#7C9A6E',
          600: '#5F7A54',
          700: '#435A3A',
        },
        risk: {
          low: '#7C9A6E',
          medium: '#E6A23C',
          high: '#E25C5C',
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        'xl': '8px',
        '2xl': '12px',
        '3xl': '16px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(139, 105, 20, 0.08)',
        'card-hover': '0 8px 24px rgba(139, 105, 20, 0.15)',
        'warm': '0 4px 16px rgba(139, 105, 20, 0.12)',
      },
    },
  },
  plugins: [],
};
