import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow images from any HTTPS host (used for future uploads)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Env vars must be prefixed with NEXT_PUBLIC_ to be visible in the browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Midarafa Laundry Service',
  },
};

export default nextConfig;
