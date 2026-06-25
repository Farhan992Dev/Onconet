/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f7f9fb',
        'surface-white': '#ffffff',
        'on-surface': '#191c1e',
        'on-surface-variant': '#43474f',
        outline: '#737780',
        'outline-variant': '#c3c6d0',

        primary: '#001836',
        secondary: '#006971',
        tertiary: '#001b28',

        'navy-deep': '#002D5B',
        'teal-vibrant': '#00A9B5',
        'cyan-bright': '#38BDF8',
        'slate-text': '#1E293B',

        'border-soft-teal': 'rgba(0, 169, 181, 0.15)',
      },
      fontFamily: {
        display: ['Hanken Grotesk', 'Vazirmatn', 'sans-serif'],
        sans: ['Inter', 'Vazirmatn', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        'card-l1': 'none',
        'card-l2': '0 8px 24px rgba(0, 169, 181, 0.08)',
        'card-l3': '0 20px 40px rgba(0, 45, 91, 0.25)',
      },
    },
  },
  plugins: [],
};
