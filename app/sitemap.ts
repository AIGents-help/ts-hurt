import type {MetadataRoute} from 'next';
import {products, siteUrl} from '../lib/products';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {url: siteUrl(), changeFrequency: 'weekly', priority: 1},
    ...products.map(p => ({url: `${siteUrl()}/shirts/${p.id}`, lastModified: p.added, changeFrequency: 'monthly' as const, priority: 0.8})),
    {url: `${siteUrl()}/policies`, changeFrequency: 'yearly', priority: 0.2},
  ];
}
