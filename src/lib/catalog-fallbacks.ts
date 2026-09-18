/**
 * Shared Fallback Product Catalog & Seed Assets
 * Multi-Category Lifestyle Showcase (Tech, Sports, Sustainable, Luxury, Home)
 * 
 * @agent engineering-frontend-developer
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent testing-performance-benchmarker
 */

export interface FallbackProduct {
  id: string;
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  price?: number;
  compareAtPrice?: number;
  stock: number;
  status: string;
  images: string[];
  category: { id: string; name: string; slug: string };
  categoryId?: { id: string; name: string; slug: string };
  categoryName?: string;
  seller: { id: string; name: string; email: string };
  sellerId?: { id: string; name: string };
  storeName?: string;
  store?: { id: string; name: string; slug?: string };
  rating: number;
  averageRating?: number;
  numReviews: number;
  reviewCount?: number;
  variants: any[];
}

export const FALLBACK_PRODUCTS_LIST: FallbackProduct[] = [
  {
    id: 'prod-fallback-1',
    _id: 'prod-fallback-1',
    name: 'Artisan Mechanical Keyboard',
    description: 'Custom CNC aluminum chassis with hot-swappable tactile switches and double-shot PBT keycaps.',
    basePrice: 189.00,
    stock: 42,
    status: 'published',
    images: ['/products/keyboard.svg'],
    category: { id: 'cat-tech', name: 'Tech Gear', slug: 'tech-gear' },
    categoryId: { id: 'cat-tech', name: 'Tech Gear', slug: 'tech-gear' },
    categoryName: 'Tech Gear',
    seller: { id: 'seller-1', name: 'TechGear Pro', email: 'techgear@nexus.com' },
    sellerId: { id: 'seller-1', name: 'TechGear Pro' },
    storeName: 'TechGear Pro',
    rating: 4.9,
    numReviews: 42,
    variants: [],
  },
  {
    id: 'prod-fallback-2',
    _id: 'prod-fallback-2',
    name: 'Studio Spatial Audio Headphones',
    description: 'Planar magnetic acoustic drivers with beryllium diaphragms and noise-isolating lambskin pads.',
    basePrice: 349.00,
    stock: 28,
    status: 'published',
    images: ['/products/headphones.svg'],
    category: { id: 'cat-tech', name: 'Tech Gear', slug: 'tech-gear' },
    categoryId: { id: 'cat-tech', name: 'Tech Gear', slug: 'tech-gear' },
    categoryName: 'Tech Gear',
    seller: { id: 'seller-1', name: 'TechGear Pro', email: 'techgear@nexus.com' },
    sellerId: { id: 'seller-1', name: 'TechGear Pro' },
    storeName: 'TechGear Pro',
    rating: 5.0,
    numReviews: 38,
    variants: [],
  },
  {
    id: 'prod-fallback-3',
    _id: 'prod-fallback-3',
    name: 'AeroPro Carbon-Fiber Road Frame',
    description: 'Ultra-lightweight Toray T1100 carbon monocoque road frame optimized for aero wind tunnel velocity.',
    basePrice: 1250.00,
    stock: 12,
    status: 'published',
    images: ['/products/road-frame.svg'],
    category: { id: 'cat-fitness', name: 'Sports & Fitness', slug: 'sports-fitness' },
    categoryId: { id: 'cat-fitness', name: 'Sports & Fitness', slug: 'sports-fitness' },
    categoryName: 'Sports & Fitness',
    seller: { id: 'seller-4', name: 'Apex Velocity Lab', email: 'apex@nexus.com' },
    sellerId: { id: 'seller-4', name: 'Apex Velocity Lab' },
    storeName: 'Apex Velocity Lab',
    rating: 4.95,
    numReviews: 22,
    variants: [],
  },
  {
    id: 'prod-fallback-4',
    _id: 'prod-fallback-4',
    name: 'Hydroponic Smart Indoor Nursery',
    description: 'Automated full-spectrum LED microgreen greenhouse with silent irrigation and soil-free pods.',
    basePrice: 220.00,
    stock: 35,
    status: 'published',
    images: ['/products/smart-nursery.svg'],
    category: { id: 'cat-sustainable', name: 'Sustainable Living', slug: 'sustainable-living' },
    categoryId: { id: 'cat-sustainable', name: 'Sustainable Living', slug: 'sustainable-living' },
    categoryName: 'Sustainable Living',
    seller: { id: 'seller-5', name: 'Verdant Eco Living', email: 'verdant@nexus.com' },
    sellerId: { id: 'seller-5', name: 'Verdant Eco Living' },
    storeName: 'Verdant Eco Living',
    rating: 4.88,
    numReviews: 46,
    variants: [],
  },
  {
    id: 'prod-fallback-5',
    _id: 'prod-fallback-5',
    name: 'Handcrafted Italian Leather Weekender',
    description: 'Full-grain vegetable-tanned Tuscan leather duffle with solid antiqued brass hardware and passport sleeve.',
    basePrice: 420.00,
    stock: 16,
    status: 'published',
    images: ['/products/leather-weekender.svg'],
    category: { id: 'cat-luxury', name: 'Luxury Goods', slug: 'luxury-goods' },
    categoryId: { id: 'cat-luxury', name: 'Luxury Goods', slug: 'luxury-goods' },
    categoryName: 'Luxury Goods',
    seller: { id: 'seller-6', name: 'Atelier Veloce', email: 'atelier@nexus.com' },
    sellerId: { id: 'seller-6', name: 'Atelier Veloce' },
    storeName: 'Atelier Veloce',
    rating: 4.92,
    numReviews: 29,
    variants: [],
  },
  {
    id: 'prod-fallback-6',
    _id: 'prod-fallback-6',
    name: 'Handcrafted Ceramic Studio Mug',
    description: 'Artisanal stoneware ceramic mug thrown by hand with a volcanic mineral matte glaze.',
    basePrice: 34.00,
    stock: 25,
    status: 'published',
    images: ['/products/ceramic-mug.svg'],
    category: { id: 'cat-lifestyle', name: 'Lifestyle', slug: 'lifestyle' },
    categoryId: { id: 'cat-lifestyle', name: 'Lifestyle', slug: 'lifestyle' },
    categoryName: 'Lifestyle',
    seller: { id: 'seller-3', name: 'Lumina Studio', email: 'lumina@nexus.com' },
    sellerId: { id: 'seller-3', name: 'Lumina Studio' },
    storeName: 'Lumina Studio',
    rating: 5.0,
    numReviews: 18,
    variants: [],
  },
  {
    id: 'prod-fallback-7',
    _id: 'prod-fallback-7',
    name: 'Solid Walnut Monitor Riser',
    description: 'Ergonomic solid American walnut desktop shelf with integrated cable channels and matte aluminum feet.',
    basePrice: 125.00,
    stock: 15,
    status: 'published',
    images: ['/products/monitor-riser.svg'],
    category: { id: 'cat-workspace', name: 'Workspace', slug: 'workspace' },
    categoryId: { id: 'cat-workspace', name: 'Workspace', slug: 'workspace' },
    categoryName: 'Workspace',
    seller: { id: 'seller-2', name: 'Minimalist Creators', email: 'creators@nexus.com' },
    sellerId: { id: 'seller-2', name: 'Minimalist Creators' },
    storeName: 'Minimalist Creators',
    rating: 4.7,
    numReviews: 29,
    variants: [],
  },
  {
    id: 'prod-fallback-8',
    _id: 'prod-fallback-8',
    name: 'Tactile Macro Pad (6-Key)',
    description: 'Programmable rotary encoder knob and OLED screen for creative workflows, CAD, and hotkeys.',
    basePrice: 79.00,
    stock: 30,
    status: 'published',
    images: ['/products/macro-pad.svg'],
    category: { id: 'cat-tech', name: 'Tech Gear', slug: 'tech-gear' },
    categoryId: { id: 'cat-tech', name: 'Tech Gear', slug: 'tech-gear' },
    categoryName: 'Tech Gear',
    seller: { id: 'seller-1', name: 'TechGear Pro', email: 'techgear@nexus.com' },
    sellerId: { id: 'seller-1', name: 'TechGear Pro' },
    storeName: 'TechGear Pro',
    rating: 4.9,
    numReviews: 64,
    variants: [],
  },
  {
    id: 'prod-fallback-9',
    _id: 'prod-fallback-9',
    name: 'Architectural Spun Brass Table Lamp',
    description: 'Diffused ambient light fixture crafted from solid spun brass with dimmable warm LED filament.',
    basePrice: 165.00,
    stock: 20,
    status: 'published',
    images: ['/products/table-lamp.svg'],
    category: { id: 'cat-luxury', name: 'Luxury Goods', slug: 'luxury-goods' },
    categoryId: { id: 'cat-luxury', name: 'Luxury Goods', slug: 'luxury-goods' },
    categoryName: 'Luxury Goods',
    seller: { id: 'seller-3', name: 'Lumina Studio', email: 'lumina@nexus.com' },
    sellerId: { id: 'seller-3', name: 'Lumina Studio' },
    storeName: 'Lumina Studio',
    rating: 4.8,
    numReviews: 15,
    variants: [],
  },
  {
    id: 'prod-fallback-10',
    _id: 'prod-fallback-10',
    name: 'Minimalist Desk Mat (Merino Wool)',
    description: 'Hand-cut dual-sided felt workspace mat with natural organic cork anti-slip backing.',
    basePrice: 48.00,
    stock: 50,
    status: 'published',
    images: ['/products/desk-mat.svg'],
    category: { id: 'cat-workspace', name: 'Workspace', slug: 'workspace' },
    categoryId: { id: 'cat-workspace', name: 'Workspace', slug: 'workspace' },
    categoryName: 'Workspace',
    seller: { id: 'seller-2', name: 'Minimalist Creators', email: 'creators@nexus.com' },
    sellerId: { id: 'seller-2', name: 'Minimalist Creators' },
    storeName: 'Minimalist Creators',
    rating: 4.8,
    numReviews: 31,
    variants: [],
  },
];

export const FALLBACK_CATALOG_MAP: Record<string, FallbackProduct> = Object.fromEntries(
  FALLBACK_PRODUCTS_LIST.map((p) => [p.id, p])
);
