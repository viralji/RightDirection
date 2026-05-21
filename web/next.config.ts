import type { NextConfig } from 'next';

const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:4000';

const nextConfig: NextConfig = {
  images: {
    domains: ['cdn.rightdirection.com', 'rightdirection-documents.s3.ap-south-1.amazonaws.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
    NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN || 'rightdirection.com',
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
