module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        magenta: "var(--magenta)",
        magenta2: "var(--magenta-2)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        accent3: "var(--accent-3)",
        highlight: "var(--highlight)",
        text: "var(--text)",
        chart1: "var(--chart-1)",
      },
      boxShadow: {
        large: "0 4px 6px -1px rgb(0 0 0 / 84%), 0 2px 4px 3px rgb(0 0 0 / 12%)",
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
      screens: {
        xs: "510px"
      }
    },
  },
  variants: {},
  plugins: [require("tailwindcss-radix")()],
};
