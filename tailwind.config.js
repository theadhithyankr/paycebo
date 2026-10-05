/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0C", surface: "#181819", elevated: "#222223",
        foreground: "#F5F2EC", muted: "#B2AFA9", accent: "#EDB780",
        line: "#343332", positive: "#A9D6B2", danger: "#FFB1A5",
      },
      fontFamily: { display: ["Aleo_400Regular"], "display-bold": ["Aleo_700Bold"] },
    },
  },
  plugins: [],
};
