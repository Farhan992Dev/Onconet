import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_URL || 'https://api-core.chbkn.run';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/#admin', destination: '/admin', permanent: false },
      { source: '/#user', destination: '/user', permanent: false },
      { source: '/#/:path*', destination: '/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
