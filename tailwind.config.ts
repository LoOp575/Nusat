import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        panel: "#111827",
        muted: "#94a3b8",
        accent: "#22d3ee",
        danger: "#fb7185",
        success: "#34d399"
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
