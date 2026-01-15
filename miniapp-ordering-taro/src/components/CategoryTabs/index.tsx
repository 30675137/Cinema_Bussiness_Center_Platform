/**
 * @spec O007-miniapp-menu-api
 * 分类侧边栏组件
 */

import { View, Text } from '@tarojs/components'
import { useRef, useCallback } from 'react'
import { MenuCategoryDTO } from '../../services/menuCategoryService'
import { getCategoryIcon } from '../../utils/category'
import Icon, { IconName } from '../Icon'
import './index.less'

/**
 * 分类 Tab 项
 */
interface CategoryTabItem {
  /** 分类 ID */
  id: string
  /** 分类编码 */
  code: string
  /** 显示文本 */
  label: string
  /** 图标名称 */
  icon: IconName
}

/**
 * @spec O007-miniapp-menu-api
 * 分类侧边栏组件属性
 */
export interface CategoryTabsProps {
  /** 分类列表（动态获取） */
  categories: MenuCategoryDTO[]
  /** 当前激活的分类 ID */
  activeCategoryId: string | null
  /** 分类切换回调 */
  onCategoryChange: (category: MenuCategoryDTO | null) => void
}

/**
 * @spec O007-miniapp-menu-api
 * 分类侧边栏组件
 */
export default function CategoryTabs({
  categories,
  activeCategoryId,
  onCategoryChange,
}: CategoryTabsProps) {
  // 防抖定时器
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 构建 Tab 列表
  const tabs: CategoryTabItem[] = categories.map((cat) => ({
    id: cat.id,
    code: cat.code,
    label: cat.displayName,
    icon: getCategoryIcon(cat.code) as IconName,
  }))

  /**
   * 处理 Tab 点击（带防抖）
   */
  const handleTabClick = useCallback(
    (categoryId: string) => {
      // 清除之前的定时器
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      // 设置防抖延迟（300ms）
      debounceTimer.current = setTimeout(() => {
        const category = categories.find((c) => c.id === categoryId) || null
        onCategoryChange(category)
      }, 300)
    },
    [categories, onCategoryChange]
  )

  return (
    <View className='category-sidebar'>
      <View className='tab-list'>
        {tabs.map((tab) => {
          const isActive = activeCategoryId === tab.id
          return (
            <View
              key={tab.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <View className={`icon-wrapper ${isActive ? 'active' : ''}`}>
                <Icon
                  name={tab.icon}
                  size={1}
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
