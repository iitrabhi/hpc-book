/** @type {import('next').NextConfig} */
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

const isProduction = process.env.NODE_ENV === "production";
// const assetPrefix = isProduction ? "https://abhigupta.io/hpc-book" : "";

const nextConfig = {
  images: {
    unoptimized: true,
  },
  // reactStrictMode: true,
  // swcMinify: true,
  // trailingSlash: true,
  assetPrefix : isProduction ? "https://abhigupta.io/hpc-book/" : undefined,
};

module.exports = {
  ...withNextra(),
  ...nextConfig,
};