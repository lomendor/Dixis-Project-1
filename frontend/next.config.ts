import type { NextConfig } from "next";

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Production output for Docker
  output: 'standalone',
  
  // Disable linting temporarily for debugging
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Basic image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
      },
    ],
    dangerouslyAllowSVG: true,
  },

  // Minimal configuration to prevent webpack issues
  experimental: {
    // Disable experimental features temporarily
  },

  // Development logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Webpack configuration to improve module resolution
  webpack: (config: any, { isServer }: any) => {
    // Improve module resolution for client-side bundles
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        },
      };
      
      // Ensure proper handling of ESM modules
      config.module.rules.push({
        test: /\.(js|mjs|jsx)$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });
    }
    
    // Optimize chunk splitting
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    };
    
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
