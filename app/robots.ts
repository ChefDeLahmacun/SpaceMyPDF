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
          '/*?s=*',  // Block search parameter URLs
          '/*?*s=*',  // Block any URL with s= query parameter
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/reset-password/',
          '/verify-email/',
          '/*?s=*',
          '/*?*s=*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

