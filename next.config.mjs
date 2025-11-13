/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'], 
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
