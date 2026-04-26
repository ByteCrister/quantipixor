import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
    }],
    sitemap: 'https://quantipixor.vercel.app/sitemap.xml',
  }
}