/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    compiler: {
        removeConsole: { exclude: ['error', 'warn'] },
    },
};

module.exports = nextConfig;
