/**
 * @spec O009-miniapp-product-list
 * Product-related types and validation schemas
 */

import { z } from 'zod'

/**
 * Channel Product DTO Schema
 * Backend response format for channel products API
 */
export const ChannelProductDTOSchema = z.object({
  /** Product configuration ID (UUID) */
  id: z.string().uuid(),
  /** Associated SKU ID (UUID) */
  skuId: z.string().uuid(),
  /** Associated menu category ID (UUID) */
  categoryId: z.string().uuid(),
  /** Product display name */
  displayName: z.string().min(1).max(100),
  /** Minimum selling unit price (in cents) */
  basePrice: z.number().int().nonnegative(),
  /** Product main image URL (Supabase Storage public URL) */
  mainImage: z.string().url().or(z.literal('')),
  /** Whether this is a recommended product */
  isRecommended: z.boolean(),
  /** Sort order (ascending) */
  sortOrder: z.number().int().nonnegative(),
  /** Product status */
  status: z.enum(['ACTIVE', 'INACTIVE']),
  /** Sales channel */
  channel: z.enum(['MINIAPP', 'POS']),
  /** Creation timestamp (ISO 8601) */
  createdAt: z.string().datetime().optional(),
  /** Update timestamp (ISO 8601) */
  updatedAt: z.string().datetime().optional(),
})

/**
 * Channel Product DTO Type
 */
export type ChannelProductDTO = z.infer<typeof ChannelProductDTOSchema>

/**
 * Product List Response Schema
 * Backend response wrapper with pagination
 */
export const ProductListResponseSchema = z.object({
  /** Request success status */
  success: z.boolean(),
  /** Product data array */
  data: z.array(ChannelProductDTOSchema),
  /** Total product count */
  total: z.number().int().nonnegative(),
  /** Current page number (1-based, optional) */
  page: z.number().int().positive().optional(),
  /** Page size (optional, default 20) */
  pageSize: z.number().int().positive().optional(),
  /** Whether there is a next page */
  hasNext: z.boolean(),
  /** Response timestamp (ISO 8601) */
  timestamp: z.string().datetime(),
})

/**
 * Product List Response Type
 */
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>

/**
 * Product Card Component Props
 * Frontend display model for product cards
 */
export interface ProductCard {
  /** Product ID (for navigation to detail page) */
  id: string
  /** Product name */
  name: string
  /** Formatted price (e.g., "¥28.00") */
  price: string
  /** Product image URL (with placeholder handling) */
  imageUrl: string
  /** Whether this is a recommended product */
  isRecommended: boolean
  /** Badge text (e.g., "推荐") */
  badge?: string
  /** Category name (optional, for display) */
  category?: string
}

/**
 * Map ChannelProductDTO to ProductCard
 * @param dto - Backend DTO
 * @param formatPrice - Price formatting function
 * @returns ProductCard for component
 */
export const mapToProductCard = (
  dto: ChannelProductDTO,
  formatPrice: (priceInCents: number | null) => string
): ProductCard => ({
  id: dto.id,
  name: dto.displayName,
  price: formatPrice(dto.basePrice),
  imageUrl: dto.mainImage || '/assets/images/placeholder-product.svg',
  isRecommended: dto.isRecommended,
  badge: dto.isRecommended ? '推荐' : undefined,
})
