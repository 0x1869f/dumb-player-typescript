/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width',
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
