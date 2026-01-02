import { View, Text } from '@tarojs/components'
import './icon.less'

export type IconName = 
  | 'wine' | 'coffee' | 'beverage' | 'food' | 'gift'
  | 'cart' | 'user' | 'search' | 'scan' | 'star'
  | 'plus' | 'minus' | 'close' | 'right' | 'info'
  | 'ticket' | 'award' | 'check' | 'list' | 'camera'

interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
  onClick?: () => void
}

/**
 * 图标映射表 - 使用 emoji 或文字作为简易图标
 * 在实际项目中可以替换为 iconfont 或 SVG 图标
 */
const ICON_MAP: Record<IconName, string> = {
  wine: '🍷',
  coffee: '☕',
  beverage: '🥤',
  food: '🍕',
  gift: '🎁',
  cart: '🛒',
  user: '👤',
  search: '🔍',
  scan: '📷',
  star: '⭐',
  plus: '+',
  minus: '-',
  close: '✕',
  right: '›',
  info: 'ℹ',
  ticket: '🎫',
  award: '🏆',
  check: '✓',
  list: '📋',
  camera: '📷'
}

export default function Icon({ name, size = 24, color, className = '', onClick }: IconProps) {
  const icon = ICON_MAP[name] || '?'
  
  return (
    <View 
      className={`icon ${className}`}
      style={{
        fontSize: `${size}px`,
        color: color,
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: `${size}px`
      }}
      onClick={onClick}
    >
      <Text>{icon}</Text>
    </View>
  )
}
