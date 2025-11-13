/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
   domains: ['localhost', 'invoicing-backend-oct6.onrender.com','invoicing-frontend-4h8w.onrender.com'],
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
