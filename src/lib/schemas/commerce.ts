import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Reusable fields
const objectIdField = z.string().regex(objectIdRegex, 'Invalid ID format').optional();
const requiredObjectIdField = z.string().regex(objectIdRegex, 'Invalid ID format');

// ---------------------------------------------------------
// Products
// ---------------------------------------------------------

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200, 'Name cannot exceed 200 characters'),
  description: z.string().trim().max(5000, 'Description cannot exceed 5000 characters').optional(),
  categoryId: objectIdField,
  brandId: objectIdField,
  basePrice: z.number().min(0, 'Price must be greater than or equal to 0'),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  tags: z.array(z.string().trim()).optional(),
  options: z.array(z.any()).optional(), // Can be tightened if options schema is strict
});

export const updateProductSchema = createProductSchema.partial();

export const productStatusUpdateSchema = z.object({
  status: z.enum(['draft', 'pending_review', 'approved', 'published', 'rejected', 'archived'] as const),
});

// ---------------------------------------------------------
// Orders
// ---------------------------------------------------------

const orderItemSchema = z.object({
  productId: requiredObjectIdField,
  variantId: objectIdField,
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  shippingAddressId: requiredObjectIdField,
  paymentMethod: z.enum(['card', 'cod']),
  couponCode: z.string().trim().optional(),
});

export const orderItemStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const),
});

// ---------------------------------------------------------
// Seller Store
// ---------------------------------------------------------

export const createStoreSchema = z.object({
  storeName: z.string().trim().min(2, 'Store name must be at least 2 characters').max(100, 'Store name cannot exceed 100 characters'),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
});

// ---------------------------------------------------------
// Categories
// ---------------------------------------------------------

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100, 'Category name cannot exceed 100 characters'),
  parentId: objectIdField,
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

// ---------------------------------------------------------
// Addresses
// ---------------------------------------------------------

export const createAddressSchema = z.object({
  type: z.enum(['billing', 'shipping']),
  street: z.string().trim().min(2, 'Street is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  zip: z.string().trim().min(2, 'Zip code is required'),
  country: z.string().trim().min(2, 'Country is required'),
  isDefault: z.boolean().optional(),
});

// ---------------------------------------------------------
// Reviews
// ---------------------------------------------------------

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(200).optional(),
  comment: z.string().trim().min(1, 'Comment is required').max(5000),
  images: z.array(z.string().url('Invalid image URL')).max(5).optional(),
  recommendation: z.boolean().optional(),
  pros: z.array(z.string().trim()).max(10).optional(),
  cons: z.array(z.string().trim()).max(10).optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

