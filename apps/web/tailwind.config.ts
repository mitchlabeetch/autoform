import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/shadcn/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-bierstadt)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        alecia: {
          midnight: "var(--alecia-blue-midnight)",
          corporate: "var(--alecia-blue-corporate)",
          "mid-blue": "var(--alecia-blue-mid)",
          light: "var(--alecia-blue-light)",
          pale: "var(--alecia-blue-pale)",
          ice: "var(--alecia-blue-ice)",
          red: "var(--alecia-red-accent)",
          titanium: "var(--alecia-grey-titanium)",
          steel: "var(--alecia-grey-steel)",
          chrome: "var(--alecia-grey-chrome)",
          cloud: "var(--alecia-grey-cloud)",
          "off-white": "var(--alecia-off-white)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "navy-sm": "0 1px 2px 0 rgba(6, 26, 64, 0.05)",
        "navy-md": "0 4px 6px -1px rgba(6, 26, 64, 0.1), 0 2px 4px -1px rgba(6, 26, 64, 0.06)",
        "navy-lg": "0 10px 15px -3px rgba(6, 26, 64, 0.1), 0 4px 6px -2px rgba(6, 26, 64, 0.05)",
        "navy-xl": "0 20px 25px -5px rgba(6, 26, 64, 0.1), 0 10px 10px -5px rgba(6, 26, 64, 0.04)",
        "navy-2xl": "0 25px 50px -12px rgba(6, 26, 64, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
