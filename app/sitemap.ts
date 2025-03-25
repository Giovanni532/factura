import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    // Base URL for your site
    const baseUrl = 'https://yourdomain.com'

    return [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        // Add more routes as needed
    ]
} 