import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      inherit: "inherit",
      current: "currentColor",
      transparent: "transparent",
      white: "#FFFFFF",
      black: "#000000",
      primary: "var(--primary)",
      gray: {
        1: "var(--gray-1)",
        2: "var(--gray-2)",
        3: "var(--gray-3)",
        4: "var(--gray-4)",
        5: "var(--gray-5)",
        6: "var(--gray-6)",
        7: "var(--gray-7)",
        8: "var(--gray-8)",
        9: "var(--gray-9)",
      },
      red: {
        1: "var(--red-1)",
        2: "var(--red-2)",
      },
    },
    extend: {
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      fontSize: {
        h1: "var(--h1)",
        h2: "var(--h2)",
        h3: "var(--h3)",
        h4: "var(--h4)",
        h5: "var(--h5)",

        lg: "var(--text-lg)",
        md: "var(--text-md)",
        sm: "var(--text-sm)",
        xs: "var(--text-xs)",
      },
    },
    borderRadius: {
      none: "0",
      full: "9999px",
    },
    translate: {
      "1/2": "50%",
      "-1/2": "-50%",
    },
  },
  plugins: [],
} satisfies Config;
