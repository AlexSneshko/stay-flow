import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        background:   "var(--background)",
        foreground:   "var(--foreground)",
        card:         "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover:      "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary:      "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary:    "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted:        "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent:       "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive:  "var(--destructive)",
        border:       "var(--border)",
        input:        "var(--input)",
        ring:         "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // StayFlow brand colors
        "sf-accent":  "#2d4dff",
        "sf-income":  "#0f8f5a",
        "sf-expense": "#c73e3e",
        "sf-pending": "#d97757",
        "sf-page":    "var(--bg-page)",
        "sf-surface": "var(--bg-surface)",
        "sf-surface-2": "var(--bg-surface-2)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};
export default config;
