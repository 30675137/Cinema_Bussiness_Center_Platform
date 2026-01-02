/**
 * @spec O006-miniapp-channel-order
 * 商品默认占位图组件 - SVG 实现
 */

import { View } from '@tarojs/components'

interface ProductPlaceholderProps {
  width?: number
  height?: number
  className?: string
}

/**
 * 商品占位图组件
 * 使用 SVG 实现，支持动态尺寸和主题颜色
 */
export const ProductPlaceholder = ({
  width = 340,
  height = 340,
  className = '',
}: ProductPlaceholderProps) => {
  return (
    <View className={`product-placeholder ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 340 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 背景 */}
        <rect width="340" height="340" fill="#F5F5F5" />

        {/* 图片图标 */}
        <g transform="translate(120, 120)">
          {/* 山形背景 */}
          <path
            d="M10 80 L40 40 L70 60 L100 20"
            stroke="#CCCCCC"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 太阳 */}
          <circle cx="75" cy="25" r="12" fill="#CCCCCC" />

          {/* 图片框架 */}
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            stroke="#CCCCCC"
            strokeWidth="3"
            fill="none"
            rx="8"
          />
        </g>

        {/* 文字提示 */}
        <text
          x="170"
          y="260"
          textAnchor="middle"
          fill="#999999"
          fontSize="24"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          暂无图片
        </text>
      </svg>
    </View>
  )
}

export default ProductPlaceholder
