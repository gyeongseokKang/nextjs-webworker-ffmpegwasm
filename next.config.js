/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.output.publicPath = "/_next/";
    return config;
  },
};

module.exports = nextConfig;
