/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'Cambria', 'serif'],
        sans:  ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        /* ── Backgrounds ── */
        page:      '#000000',
        base:      '#000000',
        'bg-base': '#000000',
        surface: {
          DEFAULT: '#111111',
          raised:  '#1A1A1A',
          inset:   '#0A0A0A',
          subtle:  'rgba(255, 255, 255, 0.03)',
          nav:     '#000000',
        },
        'bg-surface':        '#111111',
        'bg-surface-raised': '#1A1A1A',
        'bg-surface-subtle': 'rgba(255, 255, 255, 0.03)',
        'bg-nav':            '#000000',

        /* ── Borders ── */
        border: {
          DEFAULT: '#222222',
          subtle:  'rgba(255, 255, 255, 0.06)',
          strong:  'rgba(255, 255, 255, 0.16)',
        },
        'theme-border':        '#222222',
        'theme-border-subtle': 'rgba(255, 255, 255, 0.06)',
        'theme-border-strong': 'rgba(255, 255, 255, 0.16)',

        /* ── Typography ── */
        ink: {
          DEFAULT: '#E0E0E0',
          heading: '#FFFFFF',
          body:    '#E0E0E0',
          muted:   '#888888',
          faint:   '#555555',
          dark:    '#000000',
        },
        primary:         '#E0E0E0',
        secondary:       '#888888',
        muted:           '#555555',
        'text-primary':  '#E0E0E0',
        'text-secondary':'#888888',
        'text-muted':    '#555555',

        /* ── Dark shorthands ── */
        obsidian: {
          DEFAULT: '#000000',
          deep:    '#000000',
          base:    '#000000',
          light:   '#0A0A0A',
        },
        charcoal: {
          DEFAULT: '#111111',
          raised:  '#1A1A1A',
          card:    '#1A1A1A',
          border:  '#222222',
        },

        /* ── Accent: Strict Monochrome White ── */
        accent: {
          DEFAULT: '#FFFFFF',
          hover:   '#E0E0E0',
          dim:     'rgba(255, 255, 255, 0.08)',
          border:  'rgba(255, 255, 255, 0.20)',
        },
        'theme-accent':        '#FFFFFF',
        'theme-accent-hover':  '#E0E0E0',
        'theme-accent-dim':    'rgba(255, 255, 255, 0.08)',
        'theme-accent-border': 'rgba(255, 255, 255, 0.20)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      backdropBlur: { xs: '2px', xl: '20px' },
      boxShadow: {
        'luxury':     '0 20px 40px -15px rgba(0, 0, 0, 0.95)',
        'mono-lift':  '0 0 24px -4px rgba(255, 255, 255, 0.06)',
        'book-spine': '2px 4px 18px rgba(0,0,0,0.9), -2px 0 4px rgba(255,255,255,0.04) inset',
        'card':       '0 4px 6px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-up':  'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':  'fadeIn 0.25s ease forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      transitionTimingFunction: {
        'ease-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};




