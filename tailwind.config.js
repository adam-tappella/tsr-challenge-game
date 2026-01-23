/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        // Magna Brand Colors (Official from Brand Center)
        magna: {
          // Primary Colors
          'ignition-red': '#DA291C',      // Primary accent - use sparingly (4%)
          'red-dark': '#B71C1C',          // Darker variant for hover states
          'carbon-black': '#000000',      // Primary dark color (54%)
          'chrome-white': '#FFFFFF',      // Primary light color
          'cool-gray': '#8B8B8D',         // Secondary gray (14%)
          
          // Secondary Colors
          'electric-blue': '#4299B4',     // Secondary accent for highlights
          
          // Extended Palette
          'gray-dark': '#666666',
          'gray-light': '#D4D4D4',
          'gray-100': '#F5F5F5',
          
          // Legacy aliases (for backwards compatibility)
          red: '#DA291C',
          black: '#000000',
          gray: '#555555',                // Darker for contrast on light bg
          dark: '#E8ECF0',                // NOW LIGHT GREY for readability
          darker: '#DFE4E9',              // NOW LIGHT GREY for readability
        },
        // Large display text colors for accessibility
        'display': {
          'text': '#1a1a1a',              // High contrast text on light bg
          'muted': '#4a4a4a',             // Muted but readable
          'accent': '#DA291C',            // Brand red
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        // Magna Typography: Helvetica Neue LT Pro (primary), Arial (digital fallback)
        sans: ['Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
        // Headlines use bold weight
        display: ['Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
}
