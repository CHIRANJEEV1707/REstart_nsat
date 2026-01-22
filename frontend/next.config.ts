import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://restart-backend-unfucked.vercel.app/api/:path*' // Updated to likely production URL
          : 'http://127.0.0.1:5001/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/nsat-prep/:path*',
        destination: '/prep/nsat/:path*',
        permanent: true,
      },
      {
        source: '/nsat-prep',
        destination: '/prep/nsat',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
