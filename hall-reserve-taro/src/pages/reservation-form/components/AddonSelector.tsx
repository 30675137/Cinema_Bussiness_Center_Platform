/**
 * 加购项选择器组件
 * 多选模式展示加购项列表
 */
import { View, Text } from '@tarojs/components'
import { useReservationStore } from '@/stores/reservationStore'
import type { AddonItem } from '@/services/types/reservation.types'

interface AddonSelectorProps {
  addons: AddonItem[]
}

export default function AddonSelector({ addons }: AddonSelectorProps) {
  const { selectedAddons, addAddon, removeAddon, updateAddonQuantity } = useReservationStore()

  const handleMinus = (item: AddonItem) => {
    const current = selectedAddons.get(item.id)
    if (current) {
      if (current.quantity <= 1) {
        removeAddon(item.id)
      } else {
        updateAddonQuantity(item.id, current.quantity - 1)
      }
    }
  }

  const handlePlus = (item: AddonItem) => {
    const current = selectedAddons.get(item.id)
    if (current) {
      const maxQty = item.maxQuantity || 10
      if (current.quantity < maxQty) {
        updateAddonQuantity(item.id, current.quantity + 1)
      }
    } else {
      addAddon(item, 1)
    }
  }

  if (addons.length === 0) {
    return null
  }

  return (
    <View className="addon-list">
      {addons.map((item) => {
        const selected = selectedAddons.get(item.id)
        const quantity = selected?.quantity || 0
        const maxQty = item.maxQuantity || 10

        return (
          <View key={item.id} className="addon-item">
            <View className="addon-info">
              <Text className="addon-name">{item.name}</Text>
              <Text className="addon-price">¥{item.price}</Text>
              {item.description && (
                <Text className="addon-desc">{item.description}</Text>
              )}
            </View>
            <View className="addon-controls">
              <View
                className={`control-btn minus ${quantity > 0 ? 'active' : ''}`}
                onClick={() => handleMinus(item)}
              >
                <Text>−</Text>
              </View>
              <Text className="addon-count">{quantity}</Text>
              <View
                className={`control-btn plus ${quantity >= maxQty ? 'disabled' : ''}`}
                onClick={() => handlePlus(item)}
              >
                <Text>+</Text>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}
