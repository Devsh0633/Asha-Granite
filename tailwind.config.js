/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f0f0f',
          surface: '#1a1a1a',
          elevated: '#242424',
        },
        accent: {
          primary: '#c8842a',
          secondary: '#e8b86d',
          success: '#4caf7d',
          warning: '#e8a020',
          danger: '#e85555',
          info: '#5b9bd5',
        },
        text: {
          primary: '#f0ece4',
          secondary: '#9a9488',
          disabled: '#4a4640',
        },
        border: {
          DEFAULT: '#2e2a26',
          strong: '#4a4540',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}
