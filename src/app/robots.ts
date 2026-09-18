import { MetadataRoute } from 'next';

/**
 * Dynamic Robots.txt Handler
 * 
 * @agent marketing-seo-specialist
 * @agent engineering-devops-automator
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-ecommerce.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/api/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
