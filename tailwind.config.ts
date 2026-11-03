import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#080A0F",
        abyss: "#0B0E15",
        surface: {
          DEFAULT: "#0E121B",
          2: "#121826",
          3: "#18202F",
        },
        midnight: "#0C1424",
        line: {
          DEFAULT: "rgba(148, 163, 184, 0.10)",
          strong: "rgba(148, 163, 184, 0.18)",
        },
        cyan: {
          DEFAULT: "#00E5FF",
          soft: "#5CEFFF",
          dim: "#0A7C8C",
        },
        violet: {
          DEFAULT: "#8B5CF6",
          soft: "#A78BFA",
          dim: "#4C2F94",
        },
        gold: {
          DEFAULT: "#CDB07A",
          soft: "#E4CFA2",
          dim: "#7A6642",
        },
        ink: {
          DEFAULT: "#E8ECF3",
          muted: "#8C96A8",
          faint: "#5A6476",
        },
        danger: "#F87171",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["'Oxanium Variable'", "var(--font-geist-sans)", "sans-serif"],
      },
      letterSpacing: {
        hud: "0.18em",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,229,255,0.25), 0 0 24px -6px rgba(0,229,255,0.35)",
        "glow-violet": "0 0 0 1px rgba(139,92,246,0.3), 0 0 24px -6px rgba(139,92,246,0.4)",
        "glow-gold": "0 0 0 1px rgba(205,176,122,0.35), 0 0 28px -8px rgba(205,176,122,0.45)",
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "dash": {
          to: { strokeDashoffset: "-24" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        scan: "scan 6s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        dash: "dash 1.2s linear infinite",
        "spin-slow": "spin-slow 40s linear infinite",
        shimmer: "shimmer 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
