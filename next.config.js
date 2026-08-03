/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
    async redirects() {
        return [
            { source: '/', destination: '/signin', permanent: true },
            { source: '/auth', destination: '/signin', permanent: true },
            { source: '/program360', destination: '/home', permanent: true },
            { source: '/dashboard', destination: '/home', permanent: true },
        ];
    },
    experimental: {
        serverActions: {
            // 50 MB is generous; tighten this when file uploads are scoped
            bodySizeLimit: '50mb',
        },
    },
    compiler: {
        removeConsole: { exclude: ['error', 'warn'] },
    },
};

module.exports = nextConfig;
