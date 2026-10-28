const { colors, radii } = require('@gadgetbazar/design-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: colors.blue,
          'blue-hover': colors.blueHover,
          'blue-light': colors.blueLight,
          'blue-dark': colors.blueDark,
          ink: colors.ink,
          'ink-light': colors.inkLight,
          'ink-surface': colors.inkSurface,
          orange: colors.orange,
          'orange-hover': colors.orangeHover,
          'orange-light': colors.orangeLight,
          'orange-dark': colors.orangeDark,
        },
        surface: {
          ground: '#0A0B0E',
          card: '#12141A',
          elevated: '#1C1F27',
          border: '#262934',
          'border-light': '#363A48',
        },
        status: {
          success: colors.success,
          'success-light': colors.successLight,
          warning: colors.warning,
          'warning-light': colors.warningLight,
          error: colors.error,
          'error-light': colors.errorLight,
          info: colors.info,
          'info-light': colors.infoLight,
        },
      },
      fontFamily: {
        sora: ['var(--font-sora)', 'Sora', 'sans-serif'],
        bengali: ['var(--font-hind-siliguri)', '"Hind Siliguri"', 'sans-serif'],
      },
      borderRadius: radii.web,
      boxShadow: {
        glow: '0 0 20px -5px rgba(22, 82, 240, 0.35)',
        'glow-orange': '0 0 20px -5px rgba(255, 122, 41, 0.35)',
        card: '0 8px 30px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
