import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        plum: "#5B1A5D",
        plumdark: "#2a003a",
        ink: "#0d0010",
        gold: "#C9A227",
        blush: "#F6E8F0",
        charcoal: "#121212",
      },
    },
  },
  plugins: [],
};

export default config;
