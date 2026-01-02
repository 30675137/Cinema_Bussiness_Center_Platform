/**
 * @spec O006-miniapp-channel-order
 * CategoryTabs 分子组件 - 商品分类标签栏
 */

import { View, Text, ScrollView } from '@tarojs/components'
import { ChannelCategory } from '@/types/channelProduct'
import './index.scss'

export interface CategoryTabsProps {
  /** 当前选中的分类 */
  activeCategory: ChannelCategory | null

  /** 分类切换回调 */
  onChange: (category: ChannelCategory | null) => void

  /** 自定义类名 */
  className?: string
}

/**
 * 分类显示名称映射
 */
const CATEGORY_LABELS: Record<ChannelCategory, string> = {
  [ChannelCategory.ALCOHOL]: '酒水',
  [ChannelCategory.COFFEE]: '咖啡',
  [ChannelCategory.BEVERAGE]: '饮料',
  [ChannelCategory.SNACK]: '小食',
  [ChannelCategory.MEAL]: '餐品',
  [ChannelCategory.OTHER]: '其他',
}

/**
 * 所有分类列表
 */
const ALL_CATEGORIES: ChannelCategory[] = [
  ChannelCategory.ALCOHOL,
  ChannelCategory.COFFEE,
  ChannelCategory.BEVERAGE,
  ChannelCategory.SNACK,
  ChannelCategory.MEAL,
  ChannelCategory.OTHER,
]

/**
 * CategoryTabs 分类标签栏组件
 *
 * @example
 * ```typescript
 * function ProductMenu() {
 *   const [category, setCategory] = useState<ChannelCategory | null>(null)
 *
 *   return (
 *     <View>
 *       <CategoryTabs
 *         activeCategory={category}
 *         onChange={setCategory}
 *       />
 *       <ProductList category={category} />
 *     </View>
 *   )
 * }
 * ```
 */
export const CategoryTabs = ({
  activeCategory,
  onChange,
  className = '',
}: CategoryTabsProps) => {
  const handleTabClick = (category: ChannelCategory) => {
    // 点击已选中的分类则取消筛选
    if (activeCategory === category) {
      onChange(null)
    } else {
      onChange(category)
    }
  }

  const classNames = ['category-tabs', className].filter(Boolean).join(' ')

  return (
    <View className={classNames}>
      <ScrollView
        scrollX
        scrollWithAnimation
        className="category-tabs__scroll"
        showScrollbar={false}
      >
        <View className="category-tabs__list">
          {/* "全部" Tab */}
          <View
            className={`category-tabs__item ${activeCategory === null ? 'category-tabs__item--active' : ''}`}
            onClick={() => onChange(null)}
          >
            <Text className="category-tabs__label">全部</Text>
          </View>

          {/* 分类 Tabs */}
          {ALL_CATEGORIES.map((category) => (
            <View
              key={category}
              className={`category-tabs__item ${activeCategory === category ? 'category-tabs__item--active' : ''}`}
              onClick={() => handleTabClick(category)}
            >
              <Text className="category-tabs__label">
                {CATEGORY_LABELS[category]}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default CategoryTabs
