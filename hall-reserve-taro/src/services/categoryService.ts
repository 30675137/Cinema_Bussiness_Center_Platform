/**
 * @spec O009-miniapp-product-list
 * Category API service for fetching menu categories
 */

import { get } from './request'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  MenuCategoryDTO,
  CategoryListResponse,
} from '@/types/category'

/**
 * Fetch all visible menu categories
 * @returns Category list response with all visible categories sorted by sortOrder
 * @example
 * const response = await fetchCategories()
 * console.log(response.data) // MenuCategoryDTO[]
 */
export const fetchCategories = async (): Promise<CategoryListResponse> => {
  try {
    const response = await get<CategoryListResponse>(
      API_ENDPOINTS.MENU_CATEGORIES
    )

    return response
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    throw error
  }
}

/**
 * Fetch single category by ID
 * @param categoryId - Menu category ID (UUID)
 * @returns Menu category DTO
 */
export const fetchCategoryById = async (
  categoryId: string
): Promise<MenuCategoryDTO> => {
  try {
    const response = await get<MenuCategoryDTO>(
      `${API_ENDPOINTS.MENU_CATEGORIES}/${categoryId}`
    )

    return response
  } catch (error) {
    console.error(`Failed to fetch category ${categoryId}:`, error)
    throw error
  }
}

/**
 * Fetch category by code
 * @param code - Menu category code (e.g., "BEVERAGES", "SNACKS")
 * @returns Menu category DTO
 */
export const fetchCategoryByCode = async (
  code: string
): Promise<MenuCategoryDTO> => {
  if (!code || code.trim() === '') {
    throw new Error('Category code cannot be empty')
  }

  try {
    const response = await get<MenuCategoryDTO>(
      `${API_ENDPOINTS.MENU_CATEGORIES}/by-code/${code.trim().toUpperCase()}`
    )

    return response
  } catch (error) {
    console.error(`Failed to fetch category with code "${code}":`, error)
    throw error
  }
}

/**
 * Fetch visible categories (alias for fetchCategories)
 * This is a convenience method for better code readability
 * @returns Category list response with visible categories
 */
export const fetchVisibleCategories = fetchCategories
