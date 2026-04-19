import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        soil: "#3D2C24",
        moss: "#5A7D4D",
        leaf: "#7FA36B",
        mist: "#EDE9E3",
        water: "#7BA7B6",
        sunrise: "#D98E5F",
        ink: "#201A17"
      },
      fontFamily: {
        heading: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 40px rgba(61, 44, 36, 0.12)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        rise: "rise 520ms ease forwards"
      }
    }
  },
  plugins: []
} satisfies Config;
