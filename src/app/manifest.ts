import { MetadataRoute } from 'next';

/**
 * Web Application Manifest for Nexus E-Commerce
 * 
 * @agent engineering-devops-automator
 * @agent marketing-seo-specialist
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nexus Multi-Vendor E-Commerce Platform',
    short_name: 'Nexus',
    description: 'Premier marketplace for independent creators with Stripe Connect split payments and PostgreSQL ACID transaction reliability.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
