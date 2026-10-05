/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@gadgetbazar/ui',
    '@gadgetbazar/design-tokens',
    '@gadgetbazar/shared',
    '@gadgetbazar/api-client',
  ],
};

module.exports = nextConfig;
