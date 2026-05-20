/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  async rewrites() {
    const backendBase = process.env.BACKEND_URL || 'http://127.0.0.1:5001';
    return [
      {
        source: '/api/code/execute',
        destination: `${backendBase}/api/code/execute`,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/nsat-prep/:path*', destination: '/prep/nsat/:path*', permanent: true },
      { source: '/nsat-prep', destination: '/prep/nsat', permanent: true },
    ];
  },
};

module.exports = nextConfig;
