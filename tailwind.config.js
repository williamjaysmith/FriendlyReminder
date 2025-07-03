/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  corePlugins: {
    preflight: true, // Ensure Tailwind's CSS reset is enabled
  },
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {
        // Brand colors from your globals.css
        brand: {
          coal: "#0f0d0e",
          charcoal: "#231f20",
          gray: "#262522",
          lightgray: "#4a453f",
          yellow: "#fcba28",
          pink: "#f38ba3",
          green: "#0ba95b",
          purple: "#7b5ea7",
          beige: "#f9f4da",
          blue: "#12b5e5",
          orange: "#fc7428",
          red: "#E4405F",
          white: "#ffffff",
        },
        // Semantic color system for light/dark mode
        background: {
          DEFAULT: "#fefbf0", // Light mode
          dark: "#231f20", // Dark mode
        },
        surface: {
          DEFAULT: "#f9f4da", // Light mode
          dark: "#231f20", // Dark mode
        },
        text: {
          primary: {
            DEFAULT: "#231f20", // Light mode
            dark: "#f9f4da", // Dark mode
          },
          secondary: {
            DEFAULT: "#262522", // Light mode
            dark: "#f9f4da", // Dark mode
          },
        },
        input: {
          DEFAULT: "#fefaf0", // Always light beige for inputs
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: [
          "var(--font-jetbrains-mono)",
          "SF Mono",
          "Monaco",
          "Cascadia Code",
          "monospace",
        ],
        logo: ["var(--font-leckerli-one)", "cursive"],
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
