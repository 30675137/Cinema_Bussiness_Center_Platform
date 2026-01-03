/**
 * @spec O007-miniapp-menu-api
 * 图标组件 - 使用 SVG 实现的分类图标 (lucide-react 风格)
 */

import { View } from '@tarojs/components'
import './index.less'

/**
 * 图标名称类型
 */
export type IconName = 'cocktail' | 'coffee' | 'beverage' | 'snack' | 'meal' | 'other' | 'search' | 'user'

/**
 * 图标组件属性
 */
export interface IconProps {
  /** 图标名称 */
  name: IconName
  /** 图标大小（rpx） */
  size?: number
  /** 图标颜色 */
  color?: string
  /** 自定义类名 */
  className?: string
}

/**
 * SVG 路径数据 (lucide-react 风格 stroke icons)
 */
const SVG_DATA: Record<IconName, { path: string; fill?: boolean }> = {
  // Wine 酒杯 - 经典特调
  cocktail: {
    path: 'M8 22h8 M12 18v4 M12 18a8 8 0 0 0 8-8V4H4v6a8 8 0 0 0 8 8Z M4 10h16',
  },
  // Coffee 咖啡杯 - 精品咖啡
  coffee: {
    path: 'M10 2v2 M14 2v2 M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a2 2 0 1 1 0 4h-1 M6 2v2',
  },
  // Beer 啤酒杯 - 清爽饮品
  beverage: {
    path: 'M17 11h1a3 3 0 0 1 0 6h-1 M9 12v6 M13 12v6 M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8',
  },
  // Pizza 披萨 - 主厨小食
  snack: {
    path: 'M12 2a10 10 0 0 0-6.88 17.23l6.18-14.47a1 1 0 0 1 1.4-.3l6.18 14.47A10 10 0 0 0 12 2Z M12 6l-5.24 12.27A10 10 0 0 0 12 22a10 10 0 0 0 5.24-3.73L12 6Z M9 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z M13.5 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  },
  // 餐盘 - 主厨正餐
  meal: {
    path: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
  },
  // 更多 - 其他
  other: {
    path: 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    fill: true,
  },
  // 搜索
  search: {
    path: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.35-4.35',
  },
  // 用户
  user: {
    path: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  },
}

/**
 * 图标组件
 */
export default function Icon({ name, size = 48, color = 'currentColor', className = '' }: IconProps) {
  const iconData = SVG_DATA[name] || SVG_DATA.other

  return (
    <View
      className={`icon ${className}`}
      style={{
        width: `${size}rpx`,
        height: `${size}rpx`,
      }}
      dangerouslySetInnerHTML={{
        __html: `<svg
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
          fill="${iconData.fill ? color : 'none'}"
          stroke="${color}"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="display: block;"
        >
          <path d="${iconData.path}" />
        </svg>`
      }}
    />
  )
}
