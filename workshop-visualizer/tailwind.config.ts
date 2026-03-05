import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          900: '#0a0a1a',
          800: '#0f0f2a',
          700: '#14143a',
        },
        accent: {
          blue: '#4a9eff',
          green: '#4ade80',
          purple: '#a78bfa',
          gold: '#fbbf24',
          red: '#f87171',
          pink: '#f472b6',
          cyan: '#22d3ee',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
        sans: ['Inter', 'Geist Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(74, 158, 255, 0.3)',
        'glow-green': '0 0 20px rgba(74, 222, 128, 0.3)',
        'glow-purple': '0 0 20px rgba(167, 139, 250, 0.3)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
