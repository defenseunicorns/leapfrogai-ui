/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{svelte,html,js}", "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"],
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
      }
    }
  },
  plugins: [require("daisyui"), require('flowbite/plugin')],
}

