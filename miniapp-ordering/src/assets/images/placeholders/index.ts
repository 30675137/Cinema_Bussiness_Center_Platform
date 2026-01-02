/**
 * @spec O006-miniapp-channel-order
 * 占位图资源导出
 */

/**
 * 商品占位图 - Base64 编码的 1x1 灰色像素 PNG
 * 用于图片加载失败或商品无图片时的默认显示
 *
 * 尺寸: 1x1 像素（会被拉伸）
 * 颜色: #F5F5F5（浅灰色）
 */
export const PRODUCT_PLACEHOLDER_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

/**
 * 空状态占位图 - 购物车为空
 */
export const EMPTY_CART_PLACEHOLDER = '/assets/images/placeholders/empty-cart.png'

/**
 * 空状态占位图 - 订单为空
 */
export const EMPTY_ORDER_PLACEHOLDER = '/assets/images/placeholders/empty-order.png'

/**
 * 商品占位图 URL（用于 <Image> 组件的 src 属性）
 */
export const PRODUCT_PLACEHOLDER_URL = PRODUCT_PLACEHOLDER_BASE64

/**
 * 获取商品图片 URL，如果为空则返回占位图
 */
export const getProductImageUrl = (imageUrl?: string | null): string => {
  return imageUrl || PRODUCT_PLACEHOLDER_BASE64
}

export { ProductPlaceholder } from './ProductPlaceholder'
