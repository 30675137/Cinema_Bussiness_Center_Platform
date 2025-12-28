/**
 * 套餐选择器组件
 * 单选模式展示套餐列表
 */
import { View, Text } from '@tarojs/components'
import { useReservationStore } from '@/stores/reservationStore'
import type { PackageTier } from '@/services/types/reservation.types'

interface PackageTierSelectorProps {
  tiers: PackageTier[]
}

export default function PackageTierSelector({ tiers }: PackageTierSelectorProps) {
  const { selectedTier, setTier } = useReservationStore()

  const handleSelect = (tier: PackageTier) => {
    setTier(tier)
  }

  if (tiers.length === 0) {
    return (
      <View className="tier-list">
        <Text className="no-data">暂无可选套餐</Text>
      </View>
    )
  }

  return (
    <View className="tier-list">
      {tiers.map((tier) => {
        const isSelected = selectedTier?.id === tier.id
        return (
          <View
            key={tier.id}
            className={`tier-item ${isSelected ? 'selected' : ''}`}
            onClick={() => handleSelect(tier)}
          >
            <View className="tier-info">
              <View className="tier-header">
                <Text className="tier-name">{tier.name}</Text>
                {tier.tags && tier.tags.length > 0 && (
                  <View className="tier-tag">
                    <Text>{tier.tags[0]}</Text>
                  </View>
                )}
              </View>
              {tier.description && (
                <Text className="tier-desc">{tier.description}</Text>
              )}
              {tier.includes && tier.includes.length > 0 && (
                <View className="tier-includes">
                  <Text className="includes-label">包含：</Text>
                  <Text className="includes-content">{tier.includes.join('、')}</Text>
                </View>
              )}
            </View>
            <View className="tier-price">
              <Text className="tier-current-price">¥{tier.price}</Text>
              {tier.originalPrice && tier.originalPrice > tier.price && (
                <Text className="tier-original-price">¥{tier.originalPrice}</Text>
              )}
            </View>
            {isSelected && (
              <View className="selected-check">
                <Text>✓</Text>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}
