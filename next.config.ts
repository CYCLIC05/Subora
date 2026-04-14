import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        // Allow any https image URL entered in the Create form
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
