/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // important so Tailwind scans your JSX files
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#1e293b", // <--- defines bg-secondary
        silver: "#dcdcdc", // <— soft silver-gray
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"], // custom font
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
