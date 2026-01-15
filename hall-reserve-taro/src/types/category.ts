/**
 * @spec O009-miniapp-product-list
 * Category-related types and validation schemas
 */

import { z } from 'zod'

/**
 * Menu Category DTO Schema
 * Backend response format for menu categories API
 */
export const MenuCategoryDTOSchema = z.object({
  /** Category ID (UUID) */
  id: z.string().uuid(),
  /** Category code (unique, uppercase + underscores) */
  code: z.string().regex(/^[A-Z_]{2,50}$/),
  /** Category display name */
  displayName: z.string().min(1).max(50),
  /** Category icon URL (optional) */
  iconUrl: z.string().url().optional(),
  /** Product count in this category (optional) */
  productCount: z.number().int().nonnegative().optional(),
  /** Whether this category is visible */
  isVisible: z.boolean(),
  /** Sort order (ascending) */
  sortOrder: z.number().int().nonnegative(),
  /** Creation timestamp (ISO 8601) */
  createdAt: z.string().datetime().optional(),
  /** Update timestamp (ISO 8601) */
  updatedAt: z.string().datetime().optional(),
})

/**
 * Menu Category DTO Type
 */
export type MenuCategoryDTO = z.infer<typeof MenuCategoryDTOSchema>

/**
 * Category List Response Schema
 * Backend response wrapper for category list
 */
export const CategoryListResponseSchema = z.object({
  /** Request success status */
  success: z.boolean(),
  /** Category data array */
  data: z.array(MenuCategoryDTOSchema),
  /** Total category count */
  total: z.number().int().nonnegative(),
  /** Response timestamp (ISO 8601) */
  timestamp: z.string().datetime(),
})

/**
 * Category List Response Type
 */
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>

/**
 * Category Tab Component Props
 * Frontend display model for category tabs
 */
export interface CategoryTab {
  /** Category ID (null for "All" category) */
  id: string | null
  /** Category code ("ALL" for all categories) */
  code: string
  /** Category display name */
  displayName: string
  /** Whether this tab is selected */
  isSelected: boolean
  /** Product count (optional, for badge display) */
  productCount?: number
}

/**
 * Map MenuCategoryDTO to CategoryTab
 * @param dto - Backend DTO
 * @param selectedCategoryId - Currently selected category ID
 * @returns CategoryTab for component
 */
export const mapToCategoryTab = (
  dto: MenuCategoryDTO,
  selectedCategoryId: string | null
): CategoryTab => ({
  id: dto.id,
  code: dto.code,
  displayName: dto.displayName,
  isSelected: dto.id === selectedCategoryId,
  productCount: dto.productCount,
})

/**
 * Create "All" category tab
 * @param selectedCategoryId - Currently selected category ID
 * @returns CategoryTab for "All" option
 */
export const createAllCategoryTab = (selectedCategoryId: string | null): CategoryTab => ({
  id: null,
  code: 'ALL',
  displayName: '全部',
  isSelected: selectedCategoryId === null,
})
