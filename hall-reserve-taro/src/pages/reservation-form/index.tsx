/**
 * 预约表单页面
 * 填写预约信息并提交预约
 */
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { useReservationStore, useTotalAmount, useIsFormValid } from '@/stores/reservationStore'
import { useAppStore } from '@/stores/appStore'
import { useScenarioDetail, usePackageTiers, useAddonItems, useTimeSlotTemplates } from '@/services/scenarioService'
import { createReservation } from '@/services/reservationService'
import TimeSlotPicker from './components/TimeSlotPicker'
import PackageTierSelector from './components/PackageTierSelector'
import AddonSelector from './components/AddonSelector'
import ContactForm from './components/ContactForm'
import './index.less'

export default function ReservationForm() {
  const router = useRouter()
  const { id: packageId, tierId, date, time } = router.params

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Store状态和Actions
  const {
    scenarioPackageId,
    scenarioPackageName,
    scenarioPackageImage,
    selectedDate,
    reservationDateApi,
    selectedSlot,
    selectedTier,
    selectedAddons,
    contactInfo,
    remark,
    setScenarioPackage,
    setDate,
    setTier,
    setRemark,
    resetForm,
  } = useReservationStore()

  const totalAmount = useTotalAmount()
  const isFormValid = useIsFormValid()

  // API数据获取
  const { data: scenarioData, isLoading: isLoadingScenario } = useScenarioDetail(packageId)
  const { data: tiersData, isLoading: isLoadingTiers } = usePackageTiers(packageId)
  const { data: addonsData, isLoading: isLoadingAddons } = useAddonItems()
  const { data: timeSlotsData, isLoading: isLoadingTimeSlots } = useTimeSlotTemplates(packageId)

  // 初始化场景包信息
  useEffect(() => {
    if (scenarioData && packageId) {
      setScenarioPackage(
        packageId,
        scenarioData.name || '场景包',
        scenarioData.image || ''
      )
    }
  }, [scenarioData, packageId])

  // 初始化套餐选择（从URL参数）
  useEffect(() => {
    if (tierId && tiersData) {
      const tier = tiersData.find((t: any) => t.id === tierId)
      if (tier) {
        setTier({
          id: tier.id,
          name: tier.name,
          price: tier.price,
          originalPrice: tier.originalPrice,
          description: tier.serviceDescription,
          includes: tier.includes || [],
          tags: tier.tags || [],
        })
      }
    }
  }, [tierId, tiersData])

  // 转换时段数据格式
  const timeSlots = useMemo(() => {
    if (!timeSlotsData) return []
    return timeSlotsData
      .filter((slot: any) => slot.isEnabled)
      .map((slot: any) => ({
        id: slot.id,
        name: `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`,
        startTime: slot.startTime.substring(0, 5),
        endTime: slot.endTime.substring(0, 5),
        capacity: slot.capacity,
        bookedCount: slot.bookedCount || 0,
        available: slot.capacity > (slot.bookedCount || 0),
      }))
  }, [timeSlotsData])

  // 转换套餐数据格式
  const packageTiers = useMemo(() => {
    if (!tiersData) return []
    return tiersData.map((tier: any) => ({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      originalPrice: tier.originalPrice,
      description: tier.serviceDescription,
      includes: tier.includes || [],
      tags: tier.tags || [],
    }))
  }, [tiersData])

  // 转换加购项数据格式
  const addonItems = useMemo(() => {
    if (!addonsData) return []
    return addonsData.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category || 'Other',
      image: item.image,
      description: item.description,
      maxQuantity: item.maxQuantity || 10,
    }))
  }, [addonsData])

  // 返回上一页
  const handleBack = () => {
    resetForm()
    Taro.navigateBack()
  }

  // 提交预约
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)

    try {
      // 构建加购项数组
      const addonItemsList: Array<{ addonId: string; quantity: number }> = []
      selectedAddons.forEach((value, key) => {
        if (value.quantity > 0) {
          addonItemsList.push({
            addonId: key,
            quantity: value.quantity,
          })
        }
      })

      const requestData = {
        scenarioPackageId: scenarioPackageId || packageId || '',
        packageTierId: selectedTier?.id || '',
        timeSlotTemplateId: selectedSlot?.id || '',
        reservationDate: reservationDateApi,
        contactName: contactInfo.name,
        contactPhone: contactInfo.phone,
        remark: remark || undefined,
        addonItems: addonItemsList.length > 0 ? addonItemsList : undefined,
      }

      const result = await createReservation(requestData)

      // 设置成功页面数据
      const setSuccessData = useAppStore.getState().setSuccessData
      setSuccessData({
        scenario: {
          id: scenarioPackageId || packageId || '',
          title: scenarioPackageName || '预约成功',
          image: scenarioPackageImage || '',
          location: scenarioData?.storeName || '',
          category: 'PARTY' as const,
          rating: 5,
          tags: [],
          packages: [],
        },
        package: {
          id: selectedTier?.id || '',
          name: selectedTier?.name || '',
          price: selectedTier?.price || 0,
        },
        addons: Object.fromEntries(
          Array.from(selectedAddons.entries()).map(([key, value]) => [key, value.quantity])
        ),
        total: totalAmount,
        time: selectedSlot?.name || '',
        date: selectedDate,
      })

      // 成功后跳转到成功页面
      Taro.showToast({ title: '预约提交成功', icon: 'success' })
      resetForm()
      Taro.redirectTo({
        url: `/pages/success/index?orderNumber=${result.orderNumber}`,
      })
    } catch (error) {
      console.error('预约提交失败:', error)
      Taro.showToast({ title: '预约失败，请重试', icon: 'none' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 加载状态
  if (isLoadingScenario || isLoadingTiers) {
    return (
      <View className="loading-container">
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className="reservation-form-page">
      {/* 顶部场景包信息 */}
      <View className="header">
        <View className="back-btn" onClick={handleBack}>
          <Text>‹</Text>
        </View>
        <View className="header-content">
          {scenarioPackageImage && (
            <Image
              src={scenarioPackageImage}
              mode="aspectFill"
              className="header-image"
            />
          )}
          <View className="header-info">
            <Text className="header-title">{scenarioPackageName || '填写预约信息'}</Text>
            <Text className="header-subtitle">请填写以下信息完成预约</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className="content-scroll">
        {/* Section 1: 预约信息摘要（只读展示，从详情页传入） */}
        <View className="section">
          <Text className="section-title">预约信息</Text>
          <View className="summary-card">
            <View className="summary-row">
              <Text className="summary-label">预约日期</Text>
              <Text className="summary-value">{selectedDate || '未选择'}</Text>
            </View>
            <View className="summary-row">
              <Text className="summary-label">预约时段</Text>
              <Text className="summary-value">{selectedSlot?.name || '未选择'}</Text>
            </View>
            <View className="summary-row">
              <Text className="summary-label">选择套餐</Text>
              <Text className="summary-value">{selectedTier?.name || '未选择'}</Text>
            </View>
            {selectedTier && (
              <View className="summary-row">
                <Text className="summary-label">套餐价格</Text>
                <Text className="summary-value price">¥{selectedTier.price}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 2: 加购项选择 */}
        {addonItems.length > 0 && (
          <View className="section">
            <Text className="section-title">超值加购</Text>
            <AddonSelector addons={addonItems} />
          </View>
        )}

        {/* Section 3: 联系人信息 */}
        <View className="section">
          <Text className="section-title">联系人信息</Text>
          <ContactForm />
        </View>

        {/* 备注 */}
        <View className="section">
          <Text className="section-title">备注（选填）</Text>
          <View className="remark-input">
            <Textarea
              className="remark-textarea"
              placeholder="请输入备注信息..."
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
              maxlength={200}
            />
            <Text className="remark-count">{remark.length}/200</Text>
          </View>
        </View>

        {/* 底部占位 */}
        <View className="bottom-spacer" />
      </ScrollView>

      {/* 底部提交栏 */}
      <View className="submit-bar">
        <View className="price-info">
          <Text className="price-label">合计</Text>
          <Text className="price-value">¥{totalAmount}</Text>
        </View>
        <View
          className={`submit-btn ${!isFormValid || isSubmitting ? 'disabled' : ''}`}
          onClick={handleSubmit}
        >
          <Text>{isSubmitting ? '提交中...' : '提交预约'}</Text>
        </View>
      </View>
    </View>
  )
}
