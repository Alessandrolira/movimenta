import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://192.168.9.2:8089/:path*",
      },
    ];
  },
};

export default nextConfig;
