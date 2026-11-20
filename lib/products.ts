import data from '../data/products.json';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  tag: string;
  description: string;
  keywords: string[];
  added: string;
};

export const products: Product[] = data as Product[];
export const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
export type Size = (typeof SIZES)[number];

// Printful charges more for plus sizes; pass the upcharge through.
export const SIZE_UPCHARGE: Record<Size, number> = {S: 0, M: 0, L: 0, XL: 0, '2XL': 2, '3XL': 4};

// Free shipping threshold drives AOV: two shirts clears it.
export const SHIPPING = {flatCents: 599, freeOverCents: 6000};

// Estimated Printful base cost per tee (Bella+Canvas 3001, black, DTG front) + first-item shipping.
// Used ONLY for margin estimates in the Command Center. Real costs come from Printful invoices.
export const EST_COST = {teeCents: 1350, plusSizeExtraCents: 250, shipFirstCents: 475, shipAddlCents: 250};

export const categories = ['ALL INVENTORY', ...Array.from(new Set(products.map(p => p.category)))];

export const getProduct = (id: string) => products.find(p => p.id === id);
export const isSize = (s: string): s is Size => (SIZES as readonly string[]).includes(s);
export const unitPrice = (p: Product, size: Size) => p.price + SIZE_UPCHARGE[size];
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://ts-hurt.com').replace(/\/$/, '');
