/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  reactStrictMode: true,
  basePath: "/karteikarten",
  assetPrefix: "/karteikarten",
};

module.exports = nextConfig;
