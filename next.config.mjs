/** @type {import('next').NextConfig} */
const isCapacitor = process.env.BUILD_TARGET === 'capacitor'

const nextConfig = {
  // Static export for Capacitor (Android/iOS), SSR for web
  ...(isCapacitor && { output: 'export', trailingSlash: true }),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // reactCompiler disabled — causes Turbopack crash on Windows
  // reactCompiler: true,
  headers: async () => {
    if (isCapacitor) return []
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
}

export default nextConfig
