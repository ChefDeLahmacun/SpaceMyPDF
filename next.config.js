/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib'],
  },
  optimizeFonts: true,
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.google-analytics.com https://*.googletagmanager.com; connect-src 'self' https://www.paypal.com https://*.paypal.com https://www.google-analytics.com https://*.googletagmanager.com https://formsubmit.co https://*.formsubmit.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; frame-src https://www.paypal.com https://*.paypal.com blob: https://formsubmit.co https://*.formsubmit.co; object-src blob: 'self'; form-action 'self' https://formsubmit.co https://*.formsubmit.co;"
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
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  // SSL configuration for development
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      try {
        const https = require('https');
        const rootCas = require('ssl-root-cas').create();
        
        https.globalAgent.options.ca = rootCas;
      } catch (error) {
        console.warn('SSL certificate setup failed:', error.message);
      }
    }
    
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    return config;
  },
}

module.exports = nextConfig 