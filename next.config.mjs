/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone', // Helps Vercel deploy server functions
  experimental: {
    serverActions: true, // Safe to keep even if not using
  },
  webpack(config) {
    config.externals = config.externals || []
    config.externals.push({
      "@woocommerce/woocommerce-rest-api": "commonjs @woocommerce/woocommerce-rest-api",
    })
    return config
  },
}

export default nextConfig

