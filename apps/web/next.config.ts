import type { NextConfig } from "next";

// Determine backend URL based on environment
// In development: use localhost:3001
// In Docker/production: use the internal Docker service name
const getBackendUrl = () => {
    // If explicitly set (Docker), use that
    if (process.env.INTERNAL_BACKEND_URL) {
        return process.env.INTERNAL_BACKEND_URL;
    }

    // Development mode: use localhost
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3001';
    }

    // Production fallback (shouldn't normally hit this in Docker)
    return process.env.BACKEND_URL || 'http://localhost:3001';
};

const nextConfig: NextConfig = {
    output: 'standalone',
    reactCompiler: true,
    async rewrites() {
        const backendUrl = getBackendUrl();
        console.log(`[Next.js Rewrites] Using backend URL: ${backendUrl}`);

        return [
            // Auth routes - keep /api prefix (API mounts at /api/auth/*)
            {
                source: '/api/auth/:path*',
                destination: `${backendUrl}/api/auth/:path*`,
            },
            // All other API routes - strip /api prefix
            {
                source: '/api/:path*',
                destination: `${backendUrl}/:path*`,
            },
        ]
    },
};

export default nextConfig;
