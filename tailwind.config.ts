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
        // Colors from your logo
        'brand': {
          primary: '#FF3B30',    // Red from logo
          secondary: '#1E2530',  // Dark navy
          accent: '#FFFFFF',     // White details
        }
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#FF3B30",          // Red from logo
          "secondary": "#1E2530",        // Dark navy
          "accent": "#FFFFFF",           // White
          "neutral": "#1E2530",          // Dark background
          "base-100": "#1E2530",         // Dark background
          "info": "#3ABFF8",            
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
    base: true,
    darkTheme: "mytheme",
    logs: false,
  },
};

export default config;