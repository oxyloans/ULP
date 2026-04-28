export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontSize: {
        'xs':   ['0.8rem',  { lineHeight: '1.2rem'  }],
        'sm':   ['0.925rem',{ lineHeight: '1.4rem'  }],
        'base': ['1.05rem', { lineHeight: '1.6rem'  }],
        'lg':   ['1.15rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.3rem',  { lineHeight: '1.85rem' }],
        '2xl':  ['1.55rem', { lineHeight: '2rem'    }],
        '3xl':  ['1.9rem',  { lineHeight: '2.3rem'  }],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
        surface: {
          DEFAULT: '#0f1117',
          card: '#161b27',
          elevated: '#1c2333',
          border: 'rgba(255,255,255,0.07)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.3), transparent)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(99,102,241,0.6)' },
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 30px rgba(99,102,241,0.4)',
        'glow-emerald': '0 0 30px rgba(16,185,129,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
