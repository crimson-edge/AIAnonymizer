/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://aianonymizer.com'
      : 'http://localhost:3010',
  }
};

// Update NEXTAUTH_URL if in development
if (process.env.NODE_ENV !== 'production') {
  process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_BASE_URL;
}

module.exports = nextConfig;
