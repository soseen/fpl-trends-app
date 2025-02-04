module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        magenta: "var(--magenta)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        text: "var(--text)",
        chart1: "var(--chart-1)",
      },
      boxShadow: {
        large: "4px 3px 8px 4px #00000030",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  variants: {},
  plugins: [require("tailwindcss-radix")()],
};
