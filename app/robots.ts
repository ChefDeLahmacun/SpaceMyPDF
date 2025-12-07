import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.spacemypdf.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',  // Block entire dashboard section
          '/reset-password/',
          '/verify-email/',  // Block verification pages
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

