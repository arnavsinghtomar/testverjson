import type { NextConfig } from 'next';

/**
 * Roundhouse runs on the Next.js App Router. Images come from venue-supplied
 * URLs, so the remote patterns are deliberately narrow.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.roundhouse.live' },
      { protocol: 'https', hostname: 'cdn.venue-media.net' },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
