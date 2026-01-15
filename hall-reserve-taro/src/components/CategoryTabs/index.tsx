/**
 * @spec O009-miniapp-product-list
 * CategoryTabs - 分类标签组件
 */

import { View, Text, ScrollView } from '@tarojs/components'
import type { MenuCategoryDTO } from '@/types/category'
import styles from './index.module.scss'

interface Props {
  /** 分类列表 */
  categories: MenuCategoryDTO[]
  /** 选中的分类ID (null = 全部) */
  selectedId: string | null
  /** 选择分类回调 */
  onSelect: (categoryId: string | null) => void
}

const CategoryTabs = ({ categories, selectedId, onSelect }: Props) => {
  return (
    <ScrollView
      className={styles.container}
      scrollX
      scrollWithAnimation
      data-testid="category-tabs"
    >
      <View className={styles.tabs}>
        {/* "全部" 选项 */}
        <View
          className={`${styles.tab} ${selectedId === null ? styles.active : ''}`}
          data-active={selectedId === null}
          data-category-id="all"
          onClick={() => onSelect(null)}
          role="button"
        >
          <Text className={styles.tabText}>全部</Text>
        </View>

        {/* 分类选项 */}
        {categories.map((category) => (
          <View
            key={category.id}
            className={`${styles.tab} ${
              selectedId === category.id ? styles.active : ''
            }`}
            data-active={selectedId === category.id}
            data-category-id={category.id}
            onClick={() => onSelect(category.id)}
            role="button"
          >
            <Text className={styles.tabText}>{category.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default CategoryTabs
