/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // Type-checking runs via `npm run typecheck` — skip during dev/build for speed
    ignoreBuildErrors: false,
  },
  experimental: {
    // Tree-shake heavy barrel-exported packages — only bundles used exports
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      'react-icons',
      '@tanstack/react-query',
    ],
  },
};

export default nextConfig;
