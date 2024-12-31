/** @type {import('next').NextConfig} */
const nextConfig = {
  target: 'serverless',
  output: 'export',
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig
