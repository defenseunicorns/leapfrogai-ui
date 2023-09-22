/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{svelte,html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}

