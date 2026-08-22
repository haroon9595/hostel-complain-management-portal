/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
