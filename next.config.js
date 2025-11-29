/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pdf-parse'],
  turbopack: {},
}

module.exports = nextConfig

