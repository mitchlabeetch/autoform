/** @type {import('next').NextConfig} */

// Polyfill localStorage for SSR environments where it may be partially defined
if (typeof globalThis.localStorage === "undefined" || typeof globalThis.localStorage.getItem !== "function") {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
}

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
