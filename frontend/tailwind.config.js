/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050b1a",
          900: "#0a0f1e",
          800: "#0d1526",
          700: "#111c30",
          600: "#162238",
        },
      },
      fontFamily: {
        mono: ['"Courier Prime"', '"Courier New"', "monospace"],
        sans: ['"Inter"', "ui-sans-serif"],
      },
    },
  },
  plugins: [],
};
