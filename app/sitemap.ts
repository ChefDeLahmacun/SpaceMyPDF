import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.spacemypdf.com'
  const currentDate = new Date().toISOString()

  // Blog posts with their publication dates
  const blogPosts = [
    { slug: 'how-to-add-note-space-to-pdf', date: '2024-11-07T00:00:00.000Z' },
    { slug: 'pdf-note-taking-tips-for-students', date: '2024-11-06T00:00:00.000Z' },
    { slug: 'why-pdf-margins-improve-learning', date: '2024-11-05T00:00:00.000Z' },
    { slug: 'digital-vs-traditional-note-taking', date: '2024-11-04T00:00:00.000Z' },
    { slug: 'best-pdf-tools-for-students', date: '2024-11-03T00:00:00.000Z' },
    { slug: 'organize-digital-study-materials', date: '2024-11-02T00:00:00.000Z' },
  ]

  return [
    // Main pages
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // Blog posts
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    
    // NOTE: Dashboard pages are excluded from sitemap because they:
    // 1. Require authentication (login)
    // 2. Have no SEO value
    // 3. Are blocked in robots.txt
    // 4. Should not appear in search results
  ]
}

