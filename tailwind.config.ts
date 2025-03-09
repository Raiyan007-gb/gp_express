import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1536",
        primary: "#19aaf8",
        secondary: "#0fdafd",
        accent: "#4fbdf9",
        "primary-foreground": "#ffffff",
        "secondary-foreground": "#ffffff",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;