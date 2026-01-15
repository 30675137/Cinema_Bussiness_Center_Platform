/**
 * @spec O009-miniapp-product-list
 * 商品详情页面 - 占位页面
 * 显示商品详情功能开发中提示
 */

import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'

const ProductDetailPage = () => {
  const router = useRouter()
  const { id } = router.params

  return (
    <View className={styles.page} data-testid="product-detail-page">
      <View className={styles.container}>
        <Text className={styles.title}>商品详情</Text>
        <Text className={styles.subtitle}>功能开发中...</Text>
        {id && (
          <View className={styles.info}>
            <Text className={styles.label}>商品ID:</Text>
            <Text className={styles.value}>{id}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default ProductDetailPage
