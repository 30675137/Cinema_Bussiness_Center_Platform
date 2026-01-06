/**
 * @spec O010-shopping-cart
 * 数量控制器组件
 */
import { View, Text } from '@tarojs/components'
import { memo } from 'react'
import './index.less'

interface QuantityControllerProps {
  productId: string
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}

/**
 * 数量控制器组件
 * 显示灰色圆形"-"按钮 + 橙色数字 + 橙色圆形"+"按钮
 */
export const QuantityController = memo<QuantityControllerProps>(
  ({ productId, quantity, onIncrease, onDecrease }) => {
    /**
     * 处理减少按钮点击
     * 使用 stopPropagation 阻止冒泡（防止触发商品详情跳转）
     */
    const handleDecrease = (e: any) => {
      e.stopPropagation()
      onDecrease()
    }

    /**
     * 处理增加按钮点击
     * 使用 stopPropagation 阻止冒泡（防止触发商品详情跳转）
     */
    const handleIncrease = (e: any) => {
      e.stopPropagation()
      onIncrease()
    }

    return (
      <View className='quantity-controller'>
        {/* 减少按钮 */}
        <View className='btn btn-decrease' onClick={handleDecrease}>
          <Text className='icon'>-</Text>
        </View>

        {/* 数量显示 */}
        <Text className='quantity'>{quantity}</Text>

        {/* 增加按钮 */}
        <View className='btn btn-increase' onClick={handleIncrease}>
          <Text className='icon'>+</Text>
        </View>
      </View>
    )
  }
)

QuantityController.displayName = 'QuantityController'

