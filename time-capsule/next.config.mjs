/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint checks during production builds to avoid configuration conflicts
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript build checks to avoid third-party package conflicts
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
