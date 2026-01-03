/**
 * @spec O007-miniapp-menu-api
 * 分类侧边栏组件
 */

import { View, Text } from '@tarojs/components'
import { ChannelCategory } from '../../types/product'
import { getCategoryDisplayName, getCategoryIcon } from '../../utils/category'
import Icon, { IconName } from '../Icon'
import './index.less'

/**
 * 分类 Tab 项
 */
interface CategoryTabItem {
  /** 分类值（null 表示"全部"） */
  value: ChannelCategory | null
  /** 显示文本 */
  label: string
  /** 图标名称 */
  icon: IconName
}

/**
 * 分类侧边栏组件属性
 */
export interface CategoryTabsProps {
  /** 可选的分类列表 */
  categories: ChannelCategory[]
  /** 当前激活的分类 */
  activeCategory: ChannelCategory | null
  /** 分类切换回调 */
  onCategoryChange: (category: ChannelCategory | null) => void
}

/**
 * 分类侧边栏组件
 */
export default function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  // 构建 Tab 列表：分类列表（不再需要"全部"选项）
  const tabs: CategoryTabItem[] = categories.map((cat) => ({
    value: cat,
    label: getCategoryDisplayName(cat),
    icon: getCategoryIcon(cat) as IconName,
  }))

  /**
   * 处理 Tab 点击
   */
  const handleTabClick = (category: ChannelCategory | null) => {
    onCategoryChange(category)
  }

  return (
    <View className='category-sidebar'>
      <View className='tab-list'>
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.value
          return (
            <View
              key={tab.value || 'all'}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.value)}
            >
              <View className={`icon-wrapper ${isActive ? 'active' : ''}`}>
                <Icon
                  name={tab.icon}
                  size={24}
                  color={isActive ? '#f5a623' : '#666666'}
                />
              </View>
              <Text className={`tab-text ${isActive ? 'active' : ''}`}>{tab.label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
