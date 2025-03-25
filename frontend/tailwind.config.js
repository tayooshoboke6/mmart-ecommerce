/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Main Brand Blue (Tailwind's blue-500)
          dark: '#2563EB',    // Darker Blue (Tailwind's blue-600)
          light: '#60A5FA',   // Lighter Blue
        },
        secondary: {
          DEFAULT: '#FFB200', // Warm Yellow-Orange for CTAs and price tags
          dark: '#F59E0B',    // Darker Orange
          light: '#FCD34D',   // Lighter Yellow
        },
        neutral: {
          DEFAULT: '#2E2E2E', // Text (Dark Gray)
          light: '#F5F5F5',   // Light Gray for backgrounds
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
