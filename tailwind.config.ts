import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1817",
        "ink-soft": "#4a4641",
        "ink-faint": "#8a8378",
        paper: "#faf8f3",
        "paper-deep": "#f1ede4",
        hairline: "#dcd6c9",
        navy: "#1b2a4a",
        "navy-deep": "#13203a",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        page: "0 1px 2px rgba(26,24,23,0.10), 0 8px 28px rgba(26,24,23,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
