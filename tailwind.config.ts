import type { Config } from "tailwindcss";
import withMT from "@material-tailwind/react/utils/withMT";

const config = withMT({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "350px",
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      sl: "1440px",
    },
    extend: {
      colors: {
        primary: "#09647d",
        secondary: "#242628",
        white: "#ffffff",
        "gray-light": "#CACCCE",
        gray: "#7d7e80",
        "gray-dark": "#3d3d3d",
        danger: "#E74C3C",
        success: "#2ECC71",
        warning: "#F1C40F",
        info: "#3498DB",
      },
      backgroundImage: {},
      keyframes: {
        pageLoaderFx: {
          "50%": { transform: "scale(1)", opacity: 1 },
          "100%": { opacity: 0 },
        },
        modalDownFx: {
          "0%": { top: "-100px", opacity: 0 },
          "100%": { top: "0", opacity: 1 },
        },
      },
      animation: {
        pageLoader: "pageLoaderFx 1.2s ease infinite",
        modalDown: "modalDownFx .25s ease",
      },
    },
  },
  plugins: [],
} as unknown as Config);
export default config;
