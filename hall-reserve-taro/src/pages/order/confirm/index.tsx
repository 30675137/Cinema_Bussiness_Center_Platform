/**
 * @spec O003-beverage-order, P005-bom-inventory-deduction
 * 订单确认页面
 */
import React, { useState } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useOrderCartStore } from '../../../stores/orderCartStore'
import { useCreateOrder } from '../../../hooks'
import type { CreateBeverageOrderRequest } from '../../../types/order'
import { inventoryService } from '../../../services/inventoryService'
import { handleInventoryError } from '../../../utils/errorHandler'
import type { ReservationRequest } from '../../../types/inventory'
import './index.scss'

/**
 * 订单确认页面
 *
 * 功能：
 * - 显示订单商品列表
 * - 填写订单备注
 * - 选择门店（暂时mock固定门店）
 * - 提交订单
 */
const OrderConfirm: React.FC = () => {
  const { items, orderNote, setOrderNote, getTotalPrice, clearCart } = useOrderCartStore()
  const { mutateAsync: createOrder, isPending } = useCreateOrder()

  const [storeId] = useState('00000000-0000-0000-0000-000000000001') // Mock 门店ID

  const handleNoteChange = (e: any) => {
    setOrderNote(e.detail.value)
  }

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      Taro.showToast({
        title: '购物车是空的',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    try {
      // Step 1: Create order request
      const orderRequest: CreateBeverageOrderRequest = {
        storeId,
        items: items.map((item) => ({
          beverageId: item.beverageId,
          selectedSpecs: item.selectedSpecs,
          quantity: item.quantity,
          customerNote: item.customerNote,
        })),
        customerNote: orderNote || undefined,
      }

      // Step 2: Create order first (to get orderId)
      const order = await createOrder(orderRequest)

      // Step 3: Reserve inventory with the new orderId
      // Map beverage items to SKU items (beverage = finished product SKU)
      const reservationRequest: ReservationRequest = {
        orderId: order.id,
        storeId,
        items: items.map((item) => ({
          skuId: item.beverageId, // beverageId maps to finished product SKU
          quantity: item.quantity,
          unit: 'cup', // Default unit for beverages
        })),
      }

      try {
        const reservationResponse = await inventoryService.reserveInventory(reservationRequest)

        // Step 4: Show reservation success feedback
        Taro.showToast({
          title: '下单成功，库存已预占',
          icon: 'success',
          duration: 2000,
        })

        // Log reserved components for debugging
        console.log('Reserved components:', reservationResponse.data?.reservedComponents)

        // Step 5: Clear cart and navigate to payment
        clearCart()
        Taro.redirectTo({
          url: `/pages/order/payment/index?orderId=${order.id}`,
        })
      } catch (reservationError: any) {
        // Handle inventory reservation errors
        console.error('Inventory reservation failed:', reservationError)

        // Use centralized error handler for inventory errors
        if (reservationError.response?.data) {
          handleInventoryError(reservationError.response.data)
        } else {
          Taro.showToast({
            title: reservationError.message || '库存预占失败',
            icon: 'error',
            duration: 2000,
          })
        }

        // TODO: Rollback order creation if reservation fails
        // For MVP, we'll leave the order in PENDING_PAYMENT state
        // In production, should call order cancellation API here
      }
    } catch (error: any) {
      // Handle order creation errors
      console.error('Order creation failed:', error)
      Taro.showToast({
        title: error.message || '订单创建失败',
        icon: 'error',
        duration: 2000,
      })
    }
  }

  const formatSpecs = (specs: Record<string, string>) => {
    return Object.values(specs).filter(Boolean).join(' · ')
  }

  if (items.length === 0) {
    return (
      <View className="order-confirm empty">
        <Text className="order-confirm__empty-text">购物车是空的</Text>
        <View
          className="order-confirm__empty-btn"
          onClick={() => Taro.navigateBack()}
        >
          <Text>返回购物车</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="order-confirm">
      <ScrollView scrollY className="order-confirm__content">
        {/* 门店信息 */}
        <View className="order-confirm__section">
          <Text className="order-confirm__section-title">取餐门店</Text>
          <View className="order-confirm__store">
            <Text className="order-confirm__store-name">默认门店</Text>
            <Text className="order-confirm__store-address">（当前仅支持默认门店）</Text>
          </View>
        </View>

        {/* 商品列表 */}
        <View className="order-confirm__section">
          <Text className="order-confirm__section-title">商品清单</Text>
          {items.map((item, index) => (
            <View key={`${item.beverageId}-${index}`} className="order-confirm__item">
              <View className="order-confirm__item-info">
                <Text className="order-confirm__item-name">{item.beverageName}</Text>
                <Text className="order-confirm__item-specs">{formatSpecs(item.selectedSpecs)}</Text>
                {item.customerNote && (
                  <Text className="order-confirm__item-note">备注: {item.customerNote}</Text>
                )}
              </View>
              <View className="order-confirm__item-right">
                <Text className="order-confirm__item-price">
                  ¥{(item.unitPrice / 100).toFixed(2)}
                </Text>
                <Text className="order-confirm__item-quantity">× {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 订单备注 */}
        <View className="order-confirm__section">
          <Text className="order-confirm__section-title">订单备注</Text>
          <Input
            className="order-confirm__note-input"
            placeholder="选填，如有特殊要求请备注"
            value={orderNote}
            onInput={handleNoteChange}
            maxlength={200}
          />
        </View>

        {/* 价格明细 */}
        <View className="order-confirm__section">
          <View className="order-confirm__price-row">
            <Text className="order-confirm__price-label">商品总价</Text>
            <Text className="order-confirm__price-value">
              ¥{(getTotalPrice() / 100).toFixed(2)}
            </Text>
          </View>
          <View className="order-confirm__price-row total">
            <Text className="order-confirm__price-label">应付金额</Text>
            <Text className="order-confirm__price-value total">
              ¥{(getTotalPrice() / 100).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部提交按钮 */}
      <View className="order-confirm__footer">
        <View className="order-confirm__total">
          <Text className="order-confirm__total-label">合计：</Text>
          <View className="order-confirm__total-price">
            <Text className="order-confirm__total-symbol">¥</Text>
            <Text className="order-confirm__total-value">
              {(getTotalPrice() / 100).toFixed(2)}
            </Text>
          </View>
        </View>
        <View
          className={`order-confirm__submit-btn ${isPending ? 'loading' : ''}`}
          onClick={handleSubmitOrder}
        >
          <Text>{isPending ? '提交中...' : '提交订单'}</Text>
        </View>
      </View>
    </View>
  )
}

export default OrderConfirm
