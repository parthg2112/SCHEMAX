import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    /* config options here */
    reactCompiler: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.INTERNAL_BACKEND_URL || 'http://localhost:3001'}/api/:path*`,
            },
        ]
    },
};

export default nextConfig;
