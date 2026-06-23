/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#07111F',
          800: '#0B1220',
          700: '#0F1A2E',
          600: '#111827',
        },
        glass: 'rgba(148, 163, 184, 0.08)',
        brand: {
          cyan: '#22d3ee',
          blue: '#3b82f6',
          violet: '#8b5cf6',
        },
        concern: '#a855f7',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#fb7185',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.18), 0 8px 40px -12px rgba(34,211,238,0.35)',
        'glow-violet': '0 0 0 1px rgba(168,85,247,0.22), 0 8px 40px -12px rgba(168,85,247,0.45)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -24px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(1200px 600px at 50% -10%, rgba(34,211,238,0.10), transparent 60%)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(168,85,247,0.45)' },
          '70%': { boxShadow: '0 0 0 16px rgba(168,85,247,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(168,85,247,0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
        shimmer: 'shimmer 2s infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
