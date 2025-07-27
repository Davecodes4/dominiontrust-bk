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
  // Temporarily disable static export due to dynamic routes
  // Enable static export for Cloudflare Pages when dynamic routes are handled
  // output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages compatibility
  assetPrefix: '',
  // distDir: 'out', // Only needed with static export
  
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
