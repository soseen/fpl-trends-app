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
        magenta3: "var(--magenta-3)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        accent3: "var(--accent-3)",
        accent4: "var(--accent-4)",
        highlight: "var(--highlight)",
        text: "var(--text)",
        chart1: "var(--chart-1)",
        chart2: "var(--chart-2)",
        chart3: "var(--chart-3)",
        fixDif2: "var(--fixture-dif-2)",
        fixDif3: "var(--fixture-dif-3)",
        fixDif4: "var(--fixture-dif-4)",
        fixDif5: "var(--fixture-dif-5)",
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
        xs: "510px",
      },
    },
  },
  variants: {},
  plugins: [require("tailwindcss-radix")()],
};
