import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Disable static export for dynamic routes with Edge Runtime
  // output: 'export', // Disabled due to Edge Runtime dynamic routes
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages compatibility
  assetPrefix: '',
  // distDir: 'out', // Only needed with static export
  
  // Webpack configuration for Cloudflare Pages
  webpack: (config, { isServer }) => {
    // Optimize for Cloudflare Pages file size limits
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Configure cache to avoid large files
    config.cache = {
      type: 'memory', // Use memory cache instead of filesystem
    };
    
    return config;
  },
  
  // For client-side routing compatibility
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/api/:path*',
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
