/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F4F5F1", surface: "#FFFFFF", elevated: "#E9EDE5",
        foreground: "#17221A", muted: "#5D675F", accent: "#86DB6E",
        line: "#D8DFD3", positive: "#257338", danger: "#A42E38",
      },
      fontFamily: { display: ["Manrope_400Regular"], "display-bold": ["Manrope_700Bold"] },
    },
  },
  plugins: [],
};
