/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta z designu Leśny Quiz - pastelowa, dziecięca
        sky:    '#8FCFE5',
        grass:  '#B8E0A8',
        cream:  '#FFFDF6',
        ink:    '#3F6B2B',
        'ink-muted': '#6B8A56',

        forest: {
          50:   '#FFFDF6',  // cream (alias)
          100:  '#DDEFC9',  // green-soft
          200:  '#C9E4B0',  // green-soft-2
          300:  '#A6D690',
          400:  '#82C778',
          500:  '#5BA84C',  // green - PRIMARY
          600:  '#4D9540',
          700:  '#3F6B2B',  // green-deep / ink
          800:  '#2F5320',
          900:  '#1F3815',
        },
        wood: {
          400:  '#E8A661',  // orange (warm secondary)
          500:  '#D38845',
          600:  '#8B5A2A',
          800:  '#5C3A1A',
        },
        sun:    '#F5C143',
        coral:  '#D96A5C',
        'coral-soft': '#F8D7D2',
        'orange-soft': '#F5D9B8',
      },
      fontFamily: {
        kid:  ['Fredoka', 'system-ui', 'sans-serif'],
        body: ['Fredoka', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft:    '0 8px 24px rgba(63, 107, 43, 0.12)',
        card:    '0 12px 40px rgba(63, 107, 43, 0.18)',
        'btn-primary': '0 6px 16px rgba(91, 168, 76, 0.35)',
        'btn-primary-hover': '0 10px 22px rgba(91, 168, 76, 0.45)',
      },
      borderRadius: {
        card: '24px',
        pill: '999px',
        input: '14px',
      },
      animation: {
        'pop-in':       'pop-in 0.3s ease-out',
        'slide-down':   'slide-down 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-in':    'bounce-in 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-correct':'pulse-correct 0.5s',
        'shake':        'shake 0.4s ease-in-out',
      },
      keyframes: {
        'pop-in': {
          '0%':   { transform: 'scale(0.85)', opacity: 0 },
          '100%': { transform: 'scale(1)',    opacity: 1 },
        },
        'slide-down': {
          'from': { opacity: 0, transform: 'translateY(-12px)' },
          'to':   { opacity: 1, transform: 'translateY(0)' },
        },
        'bounce-in': {
          '0%':   { transform: 'scale(0.3)', opacity: 0 },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'pulse-correct': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%':      { transform: 'translateX(-6px)' },
          '75%':      { transform: 'translateX(6px)' },
        },
      },
    },
  },
  plugins: [],
}
