import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#dae1f0',
          200: '#bcc9e5',
          300: '#96a8d3',
          400: '#7587c0',
          500: '#5466ad',
          600: '#1a2b4b',
          700: '#162339',
          800: '#111a2b',
          900: '#0d141f',
        },
        coral: {
          50: '#fff3f0',
          500: '#ff6b4a',
          600: '#e85a3a',
        },
        mint: {
          50: '#f0fff9',
          500: '#34d399',
          600: '#28a87a',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn var(--transition-normal)',
        'slide-up': 'slideUp var(--transition-normal)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config; 