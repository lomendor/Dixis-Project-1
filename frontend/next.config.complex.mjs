// Load runtime fix before anything else
import './runtime-fix.js';

// Bundle analyzer configuration
import bundleAnalyzer from '@next/bundle-analyzer';
import webpack from 'webpack';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production output disabled - conflicts with webpack runtime
  // output: 'standalone', // Disabled due to webpack runtime compatibility issues
  
  // Gradual TypeScript and ESLint enforcement
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Advanced image optimization for production
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
        port: '8000', // Fixed port to match Laravel backend
      },
      {
        protocol: 'https',
        hostname: 'dixis.gr',
      },
    ],
    dangerouslyAllowSVG: true,
    // Production optimizations
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Production optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },

  // Development logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Webpack configuration to improve module resolution
  webpack: (config, { isServer }) => {
    // Server-side webpack runtime fix for Next.js 15.3.2
    if (isServer) {
      // Disable runtime chunk optimization that causes self reference issues
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false,
      };
      
      // Add global definitions for server-side compatibility
      config.plugins.push(new webpack.DefinePlugin({
        'self': 'typeof self !== "undefined" ? self : (typeof global !== "undefined" ? global : globalThis)',
      }));
    } else {
      // Client-side configuration (unchanged)
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
    
    // Advanced optimization for production
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          heroicons: {
            test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
            name: 'heroicons',
            chunks: 'all',
            priority: 15,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 15,
          },
        },
      },
    };
    
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
