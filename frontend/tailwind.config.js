/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00A651', // Green color for primary actions
          dark: '#008C44',
          light: '#4CD98D',
        },
        secondary: {
          DEFAULT: '#FF9500', // Orange color for secondary actions
          dark: '#E68600',
          light: '#FFAD33',
        },
        accent: {
          DEFAULT: '#0066FF', // Blue color for accents
          dark: '#0052CC',
          light: '#4D94FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
