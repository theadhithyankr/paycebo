/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "background": "rgb(var(--color-background) / <alpha-value>)",
        "surface": "rgb(var(--color-surface) / <alpha-value>)",
        "elevated": "rgb(var(--color-elevated) / <alpha-value>)",
        "foreground": "rgb(var(--color-foreground) / <alpha-value>)",
        "muted": "rgb(var(--color-muted) / <alpha-value>)",
        "accent": "rgb(var(--color-accent) / <alpha-value>)",
        "line": "rgb(var(--color-line) / <alpha-value>)",
        "positive": "rgb(var(--color-positive) / <alpha-value>)",
        "danger": "rgb(var(--color-danger) / <alpha-value>)",
        "danger-surface": "rgb(var(--color-danger-surface) / <alpha-value>)",
        "contribution": "rgb(var(--color-contribution) / <alpha-value>)",
        "withdrawal": "rgb(var(--color-withdrawal) / <alpha-value>)",
      },
      fontFamily: { display: ["Manrope_400Regular"], "display-bold": ["Manrope_700Bold"] },
    },
  },
  plugins: [],
};
