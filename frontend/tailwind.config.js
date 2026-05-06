/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00236f",
        "secondary": "#0058be",
        "background": "#f8f9ff",
        "surface": "#f8f9ff",
        "on-surface": "#0d1c2e",
        "on-surface-variant": "#444651",
        "primary-container": "#1e3a8a",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e6eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d5e3fc",
        "outline": "#757682",
        "outline-variant": "#c5c5d3",
        "on-tertiary-container": "#ef9900",
        "on-tertiary-fixed-variant": "#653e00",
        "on-primary": "#ffffff",
      },
      fontFamily: {
        "headline": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}