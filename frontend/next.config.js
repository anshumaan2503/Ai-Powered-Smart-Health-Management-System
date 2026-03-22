/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-backend-domain.com'],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Flask backend
      },
    ]
  },
}

module.exports = nextConfig