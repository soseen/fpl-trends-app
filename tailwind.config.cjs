module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./public/index.html"],
  theme: {
    extend: {
      // Custom palette is wired through the RGB-channel CSS vars defined
      // in `src/index.css` (e.g. `--accent-4-rgb: 33 36 59`). Using
      // `rgb(var(...) / <alpha-value>)` here is what makes alpha modifiers
      // (`bg-accent4/20`, `border-magenta/40`, …) actually compose with
      // theme tokens. Plain `var(--accent-4)` (no channels) made those
      // utilities silently fall through to Tailwind's preflight default
      // border colour (#e5e7eb), which is what was rendering as white-ish
      // 1px outlines on tables, cards, and accordion rows.
      //
      // The chart and fixture-difficulty palettes don't see alpha usage
      // (Recharts SVG consumes `var(--chart-1)` directly) so they stay on
      // the simpler hex-var form.
      colors: {
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
        secondary: "rgb(var(--secondary-rgb) / <alpha-value>)",
        magenta: "rgb(var(--magenta-rgb) / <alpha-value>)",
        magenta2: "rgb(var(--magenta-2-rgb) / <alpha-value>)",
        magenta3: "rgb(var(--magenta-3-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        accent2: "rgb(var(--accent-2-rgb) / <alpha-value>)",
        accent3: "rgb(var(--accent-3-rgb) / <alpha-value>)",
        accent4: "rgb(var(--accent-4-rgb) / <alpha-value>)",
        accent5: "rgb(var(--accent-5-rgb) / <alpha-value>)",
        highlight: "rgb(var(--highlight-rgb) / <alpha-value>)",
        text: "rgb(var(--text-rgb) / <alpha-value>)",
        chart1: "var(--chart-1)",
        chart2: "var(--chart-2)",
        chart3: "var(--chart-3)",
        fixDif1: "var(--fixture-dif-1)",
        fixDif2: "var(--fixture-dif-2)",
        fixDif3: "var(--fixture-dif-3)",
        fixDif4: "var(--fixture-dif-4)",
        fixDif5: "var(--fixture-dif-5)",
      },
      // Preflight defaults `*, ::before, ::after { border-color: gray-200 }`,
      // which leaks through to every element that uses `border` /
      // `border-b` / etc. without an explicit colour class. On a dark
      // theme that reads as a phantom white 1px outline. Forcing the
      // theme-wide default to `transparent` makes uncoloured borders
      // invisible — components that want a visible divider now have to
      // opt in with an explicit `border-accent4` / `border-secondary` /
      // etc., which is the right discipline anyway.
      borderColor: {
        DEFAULT: "transparent",
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
