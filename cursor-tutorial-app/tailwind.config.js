/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cursor: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          activity: '#333333',
          border: '#3c3c3c',
          text: '#cccccc',
          muted: '#8b8b8b',
          accent: '#007acc',
          purple: '#6366f1',
        },
      },
      fontFamily: {
        mono: ["'SF Mono'", "'Menlo'", "'Monaco'", "'Consolas'", "'Liberation Mono'", "'Courier New'", 'monospace'],
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'pulse-border': 'pulse-border 2s infinite',
      },
    },
  },
  plugins: [],
};
