import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: ipfs://*",
              "media-src 'self' data: https: blob: ipfs://* https://*.ipfs.io https://gateway.pinata.cloud https://cloudflare-ipfs.com",
              "connect-src 'self' https: wss: https://*.thirdweb.com https://*.base.org https://*.ipfs.io https://gateway.pinata.cloud https://cloudflare-ipfs.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        ]
      }
    ];
  },

  // Security-focused configuration
  experimental: {
    // Enable strict mode for better security
    strictNextHead: true
  },

  // Disable server-side source maps in production for security
  productionBrowserSourceMaps: false,

  // Image optimization security
  images: {
    domains: [
      'degenplays.com',
      'gateway.pinata.cloud',
      'cloudflare-ipfs.com',
      'ipfs.io'
    ], // Allow images from trusted domains including IPFS gateways
    dangerouslyAllowSVG: false, // Disable SVG for security
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Turbopack configuration (replaces webpack config)
  turbopack: {
    // Turbopack has built-in optimizations and doesn't need manual webpack configuration
    // Console logs and debugger statements are automatically removed in production builds
  },
};

export default nextConfig;
