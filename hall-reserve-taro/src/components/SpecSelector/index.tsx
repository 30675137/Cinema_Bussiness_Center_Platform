/**
 * @spec O003-beverage-order
 * 规格选择器组件
 */
import React from 'react'
import { View, Text } from '@tarojs/components'
import type { BeverageSpec } from '../../types/beverage'
import './index.scss'

/**
 * 规格类型中文映射
 */
const SPEC_TYPE_LABEL: Record<string, string> = {
  SIZE: '规格',
  TEMPERATURE: '温度',
  SWEETNESS: '甜度',
  TOPPING: '小料',
}

/**
 * 规格选择器组件 Props
 */
export interface SpecSelectorProps {
  /**
   * 规格列表
   */
  specs: BeverageSpec[]

  /**
   * 当前选中的规格
   * 格式: { size: '大杯', temperature: '热', sweetness: '五分糖', topping: '珍珠' }
   */
  selectedSpecs: Record<string, string>

  /**
   * 规格变更回调
   */
  onChange: (selectedSpecs: Record<string, string>) => void
}

/**
 * 规格选择器组件
 *
 * 用于饮品详情页选择规格（规格、温度、甜度、小料）
 * 支持：
 * - 按规格类型分组展示
 * - 单选交互
 * - 显示价格调整
 */
export const SpecSelector: React.FC<SpecSelectorProps> = ({ specs, selectedSpecs, onChange }) => {
  // 按规格类型分组
  const groupedSpecs = specs.reduce((acc, spec) => {
    const type = spec.specType.toLowerCase()
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(spec)
    return acc
  }, {} as Record<string, BeverageSpec[]>)

  const handleSpecClick = (specType: string, specName: string) => {
    const type = specType.toLowerCase()
    onChange({
      ...selectedSpecs,
      [type]: specName,
    })
  }

  return (
    <View className="spec-selector">
      {Object.entries(groupedSpecs).map(([type, options]) => (
        <View key={type} className="spec-selector__group">
          {/* 规格类型标题 */}
          <Text className="spec-selector__label">
            {SPEC_TYPE_LABEL[type.toUpperCase()] || type}
          </Text>

          {/* 规格选项 */}
          <View className="spec-selector__options">
            {options.map((spec) => {
              const isSelected = selectedSpecs[type] === spec.specName
              const hasPriceAdjustment = spec.priceAdjustment !== 0

              return (
                <View
                  key={spec.id}
                  className={`spec-selector__option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSpecClick(spec.specType, spec.specName)}
                >
                  <Text className="spec-selector__option-name">{spec.specName}</Text>
                  {hasPriceAdjustment && (
                    <Text className="spec-selector__option-price">
                      {spec.priceAdjustment > 0 ? '+' : ''}
                      {(spec.priceAdjustment / 100).toFixed(2)}
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
