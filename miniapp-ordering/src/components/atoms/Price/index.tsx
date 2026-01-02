/**
 * @spec O006-miniapp-channel-order
 * Price 原子组件 - 价格显示
 */

import { View, Text } from '@tarojs/components'
import { formatPrice } from '@/utils/formatters'
import './index.scss'

export interface PriceProps {
  /** 价格(单位:分) */
  value: number

  /** 是否显示货币符号 */
  showSymbol?: boolean

  /** 价格大小 */
  size?: 'small' | 'medium' | 'large'

  /** 价格颜色类型 */
  type?: 'default' | 'primary' | 'accent'

  /** 是否显示删除线(原价) */
  strikethrough?: boolean

  /** 自定义类名 */
  className?: string
}

/**
 * Price 原子组件
 *
 * @example
 * ```typescript
 * // 普通价格
 * <Price value={2500} />  // ¥25.00
 *
 * // 强调色价格(大号)
 * <Price value={3500} type="accent" size="large" />
 *
 * // 原价(删除线)
 * <View>
 *   <Price value={5000} strikethrough size="small" />
 *   <Price value={3500} type="accent" />
 * </View>
 * ```
 */
export const Price = ({
  value,
  showSymbol = true,
  size = 'medium',
  type = 'default',
  strikethrough = false,
  className = '',
}: PriceProps) => {
  const formattedPrice = formatPrice(value, showSymbol)

  // 分离货币符号和金额
  const symbol = showSymbol ? '¥' : ''
  const amount = showSymbol ? formattedPrice.slice(1) : formattedPrice

  const classNames = [
    'app-price',
    `app-price--${size}`,
    `app-price--${type}`,
    strikethrough && 'app-price--strikethrough',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <View className={classNames}>
      {symbol && <Text className="app-price__symbol">{symbol}</Text>}
      <Text className="app-price__amount">{amount}</Text>
    </View>
  )
}

export default Price
