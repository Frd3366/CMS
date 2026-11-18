/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFFBEA',
          100: '#FFF6C5',
          200: '#FFEE85',
          300: '#FFE346',
          400: '#FED712',
          500: '#F9C900', // GX Yellow
          600: '#D9AB00',
          700: '#B38800',
          800: '#8C6700',
          900: '#664900',
          DEFAULT: '#F9C900',
        },
        brand: {
          yellow: '#F9C900',
          dark: '#111111',
          light: '#F5F6F8',
          surface: '#E7F0FE',
          text: '#111111',
          textLight: '#F2F4F7',
          textSecondary: '#647084',
          border: '#E2E8F0',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          input: '#E7F0FE',
          subtle: '#F5F6F8',
          dark: '#141414',
          darkElevated: '#1C1C1E',
        },
        content: {
          heading: '#111111',
          body: '#111111',
          secondary: '#647084',
          light: '#F2F4F7',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#F1F4F9',
          input: '#CBD5E1',
          dark: '#262626',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'clean-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'clean-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
        'clean-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.03)',
        'topbar': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 4px 12px 0 rgba(0, 0, 0, 0.02)',
        'gx': '0 2px 8px -2px rgba(249, 201, 0, 0.4)',
      },
      borderRadius: {
        'xl': '0.75rem',  // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',  // 24px
      }
    },
  },
  plugins: [],
}
