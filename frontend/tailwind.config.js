/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 42px -24px rgba(0, 0, 0, 0.24)",
        card: "0 12px 30px -18px rgba(0, 0, 0, 0.22)"
      },
      colors: {
        ink: "#000000",
        mist: "#f7f5f4",
        suu: {
          red: "#DB0000",
          redAlt: "#C41425",
          black: "#000000",
          darkGray: "#575351",
          gray: "#E7E7E7",
          white: "#FFFFFF"
        }
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(219, 0, 0, 0.1), transparent 28%), radial-gradient(circle at top right, rgba(0, 0, 0, 0.06), transparent 22%), linear-gradient(180deg, #f6f3f2 0%, #f4f4f4 44%, #ffffff 100%)"
      }
    }
  },
  plugins: []
};
