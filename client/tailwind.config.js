/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Pulse: NCS Signature NOC Palette
        charcoal: "#080D1A",
        card: "#0F172A",
        elevated: "#1E293B",

        // Primary Accents (Matching NCS Badge)
        "neon-cyan": "#06B6D4",
        "cyan-bright": "#00F2FE",
        "electric-purple": "#8B5CF6",
        "vibrant-violet": "#A78BFA",
        "deep-amethyst": "#4C1D95",
        "cyber-blue": "#3B82F6",

        // Functional & Security Visualization Accents
        "cyber-rose": "#F43F5E",
        "neon-orange": "#F59E0B",
        "cyber-emerald": "#10B981",
        "muted-border": "#94A3B8",

        // Semantic / Theme mappings
        background: "#080D1A",
        surface: "#0F172A",
        "surface-dim": "#080D1A",
        "surface-bright": "#1E293B",
        "surface-container-lowest": "#060913",
        "surface-container-low": "#0A1020",
        "surface-container": "#0F172A",
        "surface-container-high": "#1E293B",
        "surface-container-highest": "#283548",
        "on-surface": "#F8FAFC",
        "on-surface-variant": "#94A3B8",
        "outline": "#94A3B8",
        "outline-variant": "#1E293B",
        "surface-tint": "#06B6D4",
        "primary": "#8B5CF6",
        "on-primary": "#FFFFFF",
        "primary-container": "#8B5CF6",
        "on-primary-container": "#FFFFFF",
        "secondary": "#06B6D4",
        "on-secondary": "#080D1A",
        "secondary-container": "#4C1D95",
        "on-secondary-container": "#A78BFA",
        "tertiary": "#00F2FE",
        "error": "#F43F5E",
        "error-container": "#4C1D95",
        "on-error-container": "#F43F5E",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      }
    },
  },
  plugins: [],
}
