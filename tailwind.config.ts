import type { Config } from "tailwindcss";

// M9.1 design system. Tokens map to CSS variables defined in globals.css so
// the editorial "telemetry / observatory" identity stays in one place. No
// runtime/chart/animation libraries — Tailwind + CSS only.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          sunk: "var(--surface-sunk)",
        },
        line: "var(--line)",
        signal: {
          risk: "rgb(var(--signal-risk) / <alpha-value>)",
          high: "rgb(var(--signal-high) / <alpha-value>)",
          warn: "rgb(var(--signal-warn) / <alpha-value>)",
          good: "rgb(var(--signal-good) / <alpha-value>)",
          cool: "rgb(var(--signal-cool) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: "var(--font-display)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      borderRadius: {
        card: "1.15rem",
      },
      boxShadow: {
        panel:
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -36px rgba(0,0,0,0.9)",
        glow: "0 0 0 1px var(--line), 0 0 48px -12px var(--glow)",
      },
      letterSpacing: {
        kicker: "0.22em",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gaugeDraw: {
          from: { strokeDashoffset: "var(--dash-start)" },
          to: { strokeDashoffset: "var(--dash-end)" },
        },
        grow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.22,1,0.36,1) both",
        gauge: "gaugeDraw 1.4s cubic-bezier(0.22,1,0.36,1) 0.15s both",
        grow: "grow 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s both",
      },
    },
  },
  plugins: [],
};

export default config;
