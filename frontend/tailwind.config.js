/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Remise-inspired blue for accents
        secondary: '#1e40af', // Darker variant for buttons
      },
    },
  },
  darkMode: 'class', // Enable dark mode like Remise's potential
  plugins: [],
};
