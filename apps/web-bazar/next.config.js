const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@gadgetbazar/ui',
    '@gadgetbazar/design-tokens',
    '@gadgetbazar/shared',
    '@gadgetbazar/api-client',
  ],
};

module.exports = withNextIntl(nextConfig);
