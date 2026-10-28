/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@gadgetbazar/ui/tailwind.preset')],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};
