/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Remove the default "X-Powered-By: Next.js" header
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Expose a couple of environment variables safely
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Laundry App',
  },

  // Basic security headers. Tailor CSP once you know exactly what you load.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;