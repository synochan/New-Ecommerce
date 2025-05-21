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
        cursor: {
          primary: '#0E0E0E',    // Main dark color
          secondary: '#1A1A1A',   // Secondary dark color
          accent: '#4D4D4D',     // Accent gray
          highlight: '#2563EB',   // Blue highlight
          'highlight-hover': '#1D4ED8', // Darker blue for hover
          text: {
            primary: '#FFFFFF',   // Primary text color
            secondary: '#A3A3A3', // Secondary text color
            accent: '#6B7280',    // Accent text color
          },
          border: '#2D2D2D',     // Border color
          input: '#1F1F1F',      // Input background
          success: '#22C55E',     // Success color
          error: '#EF4444',      // Error color
          warning: '#F59E0B',     // Warning color
        },
        mono: {
          DEFAULT: '#171717',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        accent: {
          DEFAULT: '#ffffff',
          dark: '#e5e5e5',
          darker: '#a3a3a3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'cursor': '0 0 0 1px rgba(255, 255, 255, 0.1)',
        'cursor-hover': '0 0 0 2px rgba(255, 255, 255, 0.2)',
      },
      backgroundImage: {
        'gradient-cursor': 'linear-gradient(to bottom right, #1A1A1A, #0E0E0E)',
      }
    },
  },
  plugins: [],
} 