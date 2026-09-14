/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        page: '#121216',
        surface: {
          DEFAULT: '#1C1C22',
          raised: '#24242C',
          inset: '#1A1A20',
        },
        border: {
          DEFAULT: '#2A2A36',
          subtle: '#22222C',
          hairline: 'rgba(255, 255, 255, 0.08)',
        },
        ink: {
          DEFAULT: '#F4F4F5',
          body: '#D4D4D8',
          muted: '#A1A1AA',
          faint: '#71717A',
        },
        obsidian: {
          DEFAULT: '#121216',
          50:  '#F4F4F5',
          100: '#E4E4E7',
          200: '#D4D4D8',
          300: '#A1A1AA',
          400: '#71717A',
          500: '#52525B',
          600: '#3F3F46',
          700: '#27272A',
          800: '#1C1C22',
          900: '#18181D',
          950: '#121216',
        },
        ember: {
          DEFAULT: '#E8553D',
          vibrant: '#F87171',
          50:  '#FEF2EF',
          100: '#FDE0D9',
          200: '#FABCB0',
          300: '#F59079',
          400: '#EE6B52',
          500: '#E8553D',
          600: '#D43C23',
          700: '#B22E1A',
          800: '#8F2716',
          900: '#6B1F11',
        },
        gold: {
          DEFAULT: '#D4AF37',
          bright: '#FBBF24',
          muted: '#8C7A52',
        },
      },
      backgroundImage: {
        'radial-warm': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(248,113,113,0.05) 0%, transparent 70%)',
        'radial-subtle': 'radial-gradient(ellipse 60% 40% at 80% 110%, rgba(251,191,36,0.04) 0%, transparent 60%)',
        'radial-ambient': 'radial-gradient(ellipse at top, rgba(251,191,36,0.035) 0%, transparent 70%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-up': 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.2s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
      },
      transitionTimingFunction: {
        'ease-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
