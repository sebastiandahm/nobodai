/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#06080C",
        midnight: "#0A0D12",
        card: "#111318",
        border: "#1A1D24",
        amber: "#F59E0B",
        "amber-dim": "#F59E0B20",
        whisper: "#E5E7EB",
        shadow: "#6B7280",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
