/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  images: {
    domains: ['competence.umurava.africa'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  // Custom chunk splitting ONLY in production — overriding it in dev breaks HMR
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            redux: {
              name: 'redux',
              test: /[\\/]node_modules[\\/](@reduxjs|redux|react-redux)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 20,
              minChunks: 2,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  experimental: {
    optimizePackageImports: ['recharts', '@reduxjs/toolkit', 'react-hot-toast'],
  },
};

module.exports = nextConfig;
