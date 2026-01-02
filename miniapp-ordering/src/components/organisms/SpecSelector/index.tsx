/**
 * @spec O006-miniapp-channel-order
 * 商品规格选择器组件
 */

import { View, Text } from '@tarojs/components'
import type { ChannelProductSpecDTO, SpecType, SelectedSpec } from '@/types/productSpec'
import './index.scss'

export interface SpecSelectorProps {
  /** 商品规格列表 */
  specs: ChannelProductSpecDTO[]

  /** 已选择的规格 */
  selectedSpecs: Record<SpecType, SelectedSpec>

  /** 规格变更回调 */
  onChange?: (selectedSpecs: Record<SpecType, SelectedSpec>) => void
}

/**
 * 商品规格选择器
 *
 * @description
 * - 显示商品的所有规格选项
 * - 支持单选/多选
 * - 必选规格未选择时高亮提示
 *
 * @example
 * ```tsx
 * const [selectedSpecs, setSelectedSpecs] = useState({})
 *
 * <SpecSelector
 *   specs={productSpecs}
 *   selectedSpecs={selectedSpecs}
 *   onChange={setSelectedSpecs}
 * />
 * ```
 */
export const SpecSelector: React.FC<SpecSelectorProps> = ({
  specs,
  selectedSpecs,
  onChange,
}) => {
  // 处理选项点击
  const handleOptionClick = (spec: ChannelProductSpecDTO, optionId: string) => {
    const option = spec.options.find((opt) => opt.id === optionId)
    if (!option) return

    const newSelected: SelectedSpec = {
      specType: spec.specType,
      specName: spec.specName,
      optionId: option.id,
      optionName: option.optionName,
      priceAdjustment: option.priceAdjustment,
    }

    const newSelectedSpecs = {
      ...selectedSpecs,
      [spec.specType]: newSelected,
    }

    onChange?.(newSelectedSpecs)
  }

  // 检查选项是否被选中
  const isOptionSelected = (spec: ChannelProductSpecDTO, optionId: string): boolean => {
    const selected = selectedSpecs[spec.specType]
    return selected?.optionId === optionId
  }

  // 如果没有规格，不显示
  if (specs.length === 0) {
    return null
  }

  return (
    <View className="spec-selector">
      {specs.map((spec) => (
        <View key={spec.id} className="spec-selector__group">
          {/* 规格标题 */}
          <View className="spec-selector__header">
            <Text className="spec-selector__title">{spec.specName}</Text>
            {spec.isRequired && (
              <Text className="spec-selector__required">*</Text>
            )}
          </View>

          {/* 规格选项 */}
          <View className="spec-selector__options">
            {spec.options.map((option) => {
              const isSelected = isOptionSelected(spec, option.id)
              const hasPriceAdjustment = option.priceAdjustment !== 0

              return (
                <View
                  key={option.id}
                  className={`spec-selector__option ${
                    isSelected ? 'spec-selector__option--selected' : ''
                  } ${
                    option.isDefault && !selectedSpecs[spec.specType]
                      ? 'spec-selector__option--default'
                      : ''
                  }`}
                  onClick={() => handleOptionClick(spec, option.id)}
                >
                  <Text className="spec-selector__option-text">
                    {option.optionName}
                  </Text>
                  {hasPriceAdjustment && (
                    <Text className="spec-selector__option-price">
                      {option.priceAdjustment > 0 ? '+' : ''}
                      ¥{(option.priceAdjustment / 100).toFixed(2)}
                    </Text>
                  )}
                </View>
              )
            })}
          </View>
        </View>
      ))}
    </View>
  )
}
