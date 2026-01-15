/**
 * @spec O009-miniapp-product-list
 * Image utility functions and constants
 */

/**
 * Default product placeholder image
 * Used when product.mainImage is empty or fails to load
 */
export const DEFAULT_PRODUCT_IMAGE = '/assets/images/placeholder-product.svg'

/**
 * Image loading error handler
 * @param fallbackSrc - Fallback image source (default: placeholder)
 * @returns Error handler function for Taro Image component
 */
export const createImageErrorHandler =
  (fallbackSrc: string = DEFAULT_PRODUCT_IMAGE) =>
  (onError?: (src: string) => void) =>
  () => {
    if (onError) {
      onError(fallbackSrc)
    }
  }

/**
 * Get image source with fallback
 * @param src - Original image source
 * @param fallback - Fallback image source
 * @returns Valid image source (original or fallback)
 */
export const getImageSrc = (
  src: string | null | undefined,
  fallback: string = DEFAULT_PRODUCT_IMAGE
): string => {
  return src && src.trim() !== '' ? src : fallback
}

/**
 * Validate image URL format
 * - Must be HTTPS in production (for WeChat mini-program)
 * - Can be HTTP in development
 * @param url - Image URL to validate
 * @returns true if valid, false otherwise
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false

  // Allow data URIs and relative paths
  if (url.startsWith('data:') || url.startsWith('/')) return true

  try {
    const urlObj = new URL(url)
    // In production, require HTTPS for WeChat mini-program compatibility
    if (process.env.NODE_ENV === 'production') {
      return urlObj.protocol === 'https:'
    }
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}
