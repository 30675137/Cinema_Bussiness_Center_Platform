/**
 * @spec O006-miniapp-channel-order
 * Image 原子组件 - 支持懒加载和占位图
 */

import { Image as TaroImage } from '@tarojs/components'
import { useState } from 'react'
import { PRODUCT_PLACEHOLDER_BASE64 } from '@/assets/images/placeholders'
import './index.scss'

export interface ImageProps {
  /** 图片 URL */
  src: string

  /** 图片填充模式 */
  mode?:
    | 'scaleToFill'
    | 'aspectFit'
    | 'aspectFill'
    | 'widthFix'
    | 'heightFix'

  /** 是否懒加载 */
  lazyLoad?: boolean

  /** 占位图 URL */
  placeholder?: string

  /** 图片加载错误时的回退图 */
  fallback?: string

  /** 自定义类名 */
  className?: string

  /** 加载成功回调 */
  onLoad?: () => void

  /** 加载失败回调 */
  onError?: () => void
}

/**
 * Image 原子组件
 *
 * @example
 * ```typescript
 * // 商品主图
 * <Image
 *   src={product.mainImage}
 *   mode="aspectFill"
 *   lazyLoad
 * />
 *
 * // 自定义占位图
 * <Image
 *   src={product.image}
 *   placeholder="/custom-placeholder.png"
 *   fallback="/error-image.png"
 * />
 * ```
 */
export const Image = ({
  src,
  mode = 'aspectFill',
  lazyLoad = true,
  placeholder = PRODUCT_PLACEHOLDER_BASE64,
  fallback = PRODUCT_PLACEHOLDER_BASE64,
  className = '',
  onLoad,
  onError,
}: ImageProps) => {
  const [imageUrl, setImageUrl] = useState(src || placeholder)
  const [isLoading, setIsLoading] = useState(true)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setImageUrl(fallback)
    onError?.()
  }

  const classNames = [
    'app-image',
    isLoading && 'app-image--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <TaroImage
      src={imageUrl}
      mode={mode}
      lazyLoad={lazyLoad}
      className={classNames}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}

export default Image
