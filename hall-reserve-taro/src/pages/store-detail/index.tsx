/**
 * StoreDetail Page
 * C端门店详情页 - 展示门店地址信息，支持复制地址和拨打电话
 *
 * @since 020-store-address
 */

import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState, useCallback } from 'react'
import { Store, formatFullAddress, hasCompleteAddress, hasPhone } from '@/types/store'
import { copyToClipboard } from '@/utils/clipboard'
import { makePhoneCall, formatPhone } from '@/utils/phone'
import { storeService } from '@/services/storeService'
import './index.scss'

export default function StoreDetail() {
  const router = useRouter()
  const storeId = router.params.id

  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载门店数据
  const loadStore = useCallback(async () => {
    if (!storeId) {
      setError('门店ID不存在')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await storeService.getStoreById(storeId)
      setStore(data)
    } catch (err) {
      console.error('加载门店信息失败:', err)
      setError('加载门店信息失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    loadStore()
  }, [loadStore])

  // 复制地址
  const handleCopyAddress = useCallback(() => {
    if (!store) return
    const fullAddress = formatFullAddress(store)
    if (fullAddress) {
      copyToClipboard(fullAddress)
    }
  }, [store])

  // 拨打电话
  const handleCallPhone = useCallback(() => {
    if (!store?.phone) return
    makePhoneCall(store.phone)
  }, [store])

  // 返回上一页
  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  // 加载状态
  if (loading) {
    return (
      <View className="loading-container">
        <View className="loading-spinner" />
        <Text className="loading-text">加载中...</Text>
      </View>
    )
  }

  // 错误状态
  if (error || !store) {
    return (
      <View className="error-container">
        <Text className="error-icon">😕</Text>
        <Text className="error-title">出错了</Text>
        <Text className="error-message">{error || '门店信息不存在'}</Text>
        <View className="error-btn" onClick={handleBack}>
          <Text>返回</Text>
        </View>
      </View>
    )
  }

  const fullAddress = formatFullAddress(store)
  const isActive = store.status === 'active'

  return (
    <View className="store-detail-page">
      {/* 门店头部 */}
      <View className="store-header">
        <Text className="store-name">{store.name}</Text>
        <Text className="store-code">门店编码: {store.code}</Text>
        <View className={`store-status ${isActive ? 'active' : 'inactive'}`}>
          <View className="status-dot" />
          <Text>{isActive ? '营业中' : '暂停营业'}</Text>
        </View>
      </View>

      <View className="store-content">
        {/* 非活跃门店提示 */}
        {!isActive && (
          <View className="inactive-notice">
            <Text className="notice-icon">⚠️</Text>
            <Text className="notice-text">该门店当前暂停营业，无法进行预约</Text>
          </View>
        )}

        {/* 地址信息卡片 */}
        <View className="info-card">
          <View className="card-title">
            <Text className="card-icon">📍</Text>
            <Text>门店地址</Text>
          </View>

          {hasCompleteAddress(store) ? (
            <View className="address-section">
              <View className="address-row">
                <Text className="address-label">省份</Text>
                <Text className="address-value">{store.province}</Text>
              </View>
              <View className="address-row">
                <Text className="address-label">城市</Text>
                <Text className="address-value">{store.city}</Text>
              </View>
              <View className="address-row">
                <Text className="address-label">区县</Text>
                <Text className="address-value">{store.district}</Text>
              </View>
              <View className="address-row">
                <Text className="address-label">详细地址</Text>
                {store.address ? (
                  <Text className="address-value">{store.address}</Text>
                ) : (
                  <Text className="address-empty">未填写</Text>
                )}
              </View>

              {/* 完整地址 + 复制按钮 */}
              {fullAddress && (
                <View className="full-address">
                  <Text className="full-address-label">完整地址</Text>
                  <Text className="full-address-text">{fullAddress}</Text>
                  <View className="copy-btn" onClick={handleCopyAddress}>
                    <Text className="copy-icon">📋</Text>
                    <Text>复制地址</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View className="no-address">
              <Text className="no-address-icon">🏠</Text>
              <Text className="no-address-text">暂无地址信息</Text>
            </View>
          )}
        </View>

        {/* 联系方式卡片 */}
        <View className="info-card">
          <View className="card-title">
            <Text className="card-icon">📞</Text>
            <Text>联系方式</Text>
          </View>

          {hasPhone(store) ? (
            <View className="contact-section">
              <View className="phone-item">
                <View className="phone-info">
                  <Text className="phone-icon">☎️</Text>
                  <Text className="phone-number">{formatPhone(store.phone!)}</Text>
                </View>
                <View className="call-btn" onClick={handleCallPhone}>
                  <Text className="call-icon">📱</Text>
                  <Text>拨打电话</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="contact-section">
              <View className="no-phone">暂无联系电话</View>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
