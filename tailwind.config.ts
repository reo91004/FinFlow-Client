import type { Config } from "tailwindcss";
import animations from '@midudev/tailwind-animations';

export default {
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
      },
      boxShadow: {
        xl: "rgba(82, 63, 165, 0.15) 0px 0px 40px 0px",
      },
    },
  },
  plugins: [animations],
} satisfies Config;
