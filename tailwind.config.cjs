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
        accent5: "var(--accent-5)",
        highlight: "var(--highlight)",
        text: "var(--text)",
        chart1: "var(--chart-1)",
        chart2: "var(--chart-2)",
        chart3: "var(--chart-3)",
        fixDif1: "var(--fixture-dif-1)",
        fixDif2: "var(--fixture-dif-2)",
        fixDif3: "var(--fixture-dif-3)",
        fixDif4: "var(--fixture-dif-4)",
        fixDif5: "var(--fixture-dif-5)",
      },
      boxShadow: {
        large: "0 4px 6px -1px rgb(0 0 0 / 84%), 0 2px 4px 3px rgb(0 0 0 / 12%)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        // Radix Accordion exposes its content height via the
        // --radix-accordion-content-height CSS variable on data-state changes.
        // These animate it for a smooth open/close.
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: { roboto: ["Roboto", "sans-serif"] },
      screens: { xs: "510px" },
    },
  },
  variants: {},
  plugins: [import("tailwindcss-radix")],
};
