/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@autoform/shadcn", "@autoform/chakra"],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(tsx|jsx)$/,
      enforce: "pre",
      use: "@dyad-sh/nextjs-webpack-component-tagger",
    });
    return config;
  },
};

export default nextConfig;
