import { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '../../components'
import { Member, Product } from '../../types'
import { PRODUCTS, MOCK_MEMBER } from '../../constants'
import './index.less'

export default function MemberPage() {
  const [member] = useState<Member>(MOCK_MEMBER)

  // 可兑换商品列表
  const redeemableProducts = PRODUCTS.filter(p => p.pointsPrice)

  return (
    <View className='member-page'>
      <ScrollView className='member-content' scrollY>
        {/* 会员卡片 */}
        <View className='member-card'>
          <View className='card-glow' />
          <View className='card-header'>
            <View className='card-info'>
              <Text className='member-name'>{member.name}</Text>
              <View className='member-meta'>
                <View className='level-badge'>{member.level}</View>
                <Text className='join-date'>自 2024 年加入</Text>
              </View>
            </View>
            <Icon name='award' size={32} color='#f59e0b' />
          </View>
          <View className='card-footer'>
            <View className='points-section'>
              <Text className='points-label'>积分余额</Text>
              <View className='points-value'>
                <Text className='points-num'>{member.points}</Text>
                <Text className='points-unit'>Pts</Text>
              </View>
            </View>
            <View className='spent-section'>
              <Text className='spent-label'>消费总计</Text>
              <Text className='spent-value'>¥{member.totalSpent}</Text>
            </View>
          </View>
        </View>

        {/* 功能入口 */}
        <View className='quick-actions'>
          <View className='action-item' onClick={() => Taro.showToast({ title: '暂无历史订单', icon: 'none' })}>
            <Icon name='list' size={20} color='#3b82f6' />
            <Text className='action-label'>我的订单</Text>
            <Text className='action-value'>查看全部</Text>
          </View>
          <View className='action-item' onClick={() => Taro.switchTab({ url: '/pages/order/index' })}>
            <Icon name='cart' size={20} color='#22c55e' />
            <Text className='action-label'>购物车</Text>
            <Text className='action-value'>去点餐</Text>
          </View>
          <View className='action-item'>
            <Icon name='ticket' size={20} color='#f59e0b' />
            <Text className='action-label'>优惠券</Text>
            <Text className='action-value'>{member.coupons.length} 张可用</Text>
          </View>
          <View className='action-item'>
            <Icon name='award' size={20} color='#a855f7' />
            <Text className='action-label'>等级晋升</Text>
            <Text className='action-value'>¥{2000 - member.totalSpent} 升级</Text>
          </View>
        </View>

        {/* 积分商城 */}
        <View className='points-mall'>
          <View className='mall-header'>
            <Icon name='star' size={16} color='#f59e0b' />
            <Text className='mall-title'>积分商城</Text>
          </View>
          <View className='mall-list'>
            {redeemableProducts.map(product => (
              <View key={product.id} className='mall-item'>
                <Image src={product.image} className='item-image' mode='aspectFill' />
                <View className='item-info'>
                  <Text className='item-name'>{product.name}</Text>
                  <Text className='item-points'>{product.pointsPrice} 积分</Text>
                </View>
                <View 
                  className='redeem-btn'
                  onClick={() => {
                    if (member.points >= (product.pointsPrice || 0)) {
                      Taro.showToast({ title: `已成功兑换 ${product.name}`, icon: 'success' })
                    } else {
                      Taro.showToast({ title: '积分余额不足', icon: 'none' })
                    }
                  }}
                >
                  <Text className='btn-text'>立即兑换</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
