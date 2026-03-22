import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Increased to support screenshot & GLB uploads
    },
  },
  async headers() {
    return [
      {
        source: '/uploads/models/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'model/gltf-binary',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  // Silence the Turbopack warning
  turbopack: {},
  // serverExternalPackages: [],
};

export default nextConfig;
