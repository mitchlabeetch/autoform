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
      if (process.env.NODE_ENV === "development") {
        config.module.rules.push({
          test: /\.(jsx|tsx)$/,
          exclude: /node_modules/,
          enforce: "pre",
          use: "@dyad-sh/nextjs-webpack-component-tagger",
        });
      }
      return config;
    },
};

export default nextConfig;
