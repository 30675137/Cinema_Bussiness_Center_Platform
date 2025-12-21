import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useBookingStore } from '@/stores/bookingStore'
import { useCreateBooking } from '@/services/bookingService'
import { THEME_CONFIG, ADDONS, TIME_SLOTS } from '@/constants'
import './index.less'

const DATE_OPTIONS = ['今天', '明天', '周五 24', '周六 25']

export default function Detail() {
  const router = useRouter()
  const scenario = useAppStore((s) => s.activeScenario)
  const setSuccessData = useAppStore((s) => s.setSuccessData)

  const {
    selectedDate,
    selectedTime,
    selectedPkgId,
    addons,
    setSelectedDate,
    setSelectedTime,
    setSelectedPkgId,
    updateAddon,
    reset
  } = useBookingStore()

  const createBooking = useCreateBooking()

  // 初始化
  useEffect(() => {
    if (scenario && !selectedPkgId) {
      setSelectedPkgId(scenario.packages[0].id)
    }
    const firstAvailable = TIME_SLOTS.find((t) => t.status === 'Available')
    if (firstAvailable && !selectedTime) {
      setSelectedTime(firstAvailable.time)
    }
  }, [scenario])

  const theme = scenario ? THEME_CONFIG[scenario.category] : null

  const selectedPkg = useMemo(() => {
    return scenario?.packages.find((p) => p.id === selectedPkgId)
  }, [scenario, selectedPkgId])

  const totalAddonsCount = useMemo(() => {
    return Object.values(addons).reduce((a, b) => a + b, 0)
  }, [addons])

  const totalPrice = useMemo(() => {
    if (!selectedPkg) return 0
    const addonsPrice = ADDONS.reduce((sum, item) => {
      return sum + item.price * (addons[item.id] || 0)
    }, 0)
    return selectedPkg.price + addonsPrice
  }, [selectedPkg, addons])

  const handleBack = () => {
    reset()
    Taro.navigateBack()
  }

  const handlePayment = () => {
    if (!scenario || !selectedPkg || !selectedTime) return

    createBooking.mutate(
      {
        scenario,
        package: selectedPkg,
        addons,
        total: totalPrice,
        time: selectedTime,
        date: selectedDate
      },
      {
        onSuccess: () => {
          setSuccessData({
            scenario,
            package: selectedPkg,
            addons,
            total: totalPrice,
            time: selectedTime,
            date: selectedDate
          })
          reset()
          Taro.redirectTo({ url: '/pages/success/index' })
        }
      }
    )
  }

  if (!scenario) {
    return (
      <View className="loading-container">
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className="detail-page">
      {/* Hero Header */}
      <View className="hero-header">
        <Image src={scenario.image} mode="aspectFill" className="hero-image" />
        <View className="hero-overlay" />

        {/* Back Button */}
        <View className="back-btn" onClick={handleBack}>
          <Text>‹</Text>
        </View>

        {/* Hero Content */}
        <View className="hero-content">
          <View className={`category-badge ${theme?.badgeStyle}`}>
            <Text>{theme?.label}</Text>
          </View>
          <Text className="hero-title">{scenario.title}</Text>
          <View className="hero-location">
            <Text className="location-icon">📍</Text>
            <Text className="location-text">{scenario.location}</Text>
          </View>
          <View className="hero-tags">
            <View className="hero-tag">
              <Text>👥 {scenario.tags[0]}</Text>
            </View>
            <View className="hero-tag">
              <Text>⚡ {scenario.tags[1]}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className="content-scroll">
        {/* Date & Time Selection */}
        <View className="section">
          <View className="section-header">
            <Text className="section-title">选择场次</Text>
            <Text className="section-action">查看日历</Text>
          </View>

          {/* Date Strip */}
          <ScrollView scrollX className="date-strip">
            {DATE_OPTIONS.map((day) => (
              <View
                key={day}
                className={`date-item ${selectedDate === day ? 'active' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <Text>{day}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Time Grid */}
          <View className="time-grid">
            {TIME_SLOTS.map((slot) => {
              const isAvailable = slot.status === 'Available'
              const isSelected = selectedTime === slot.time
              return (
                <View
                  key={slot.time}
                  className={`time-item ${!isAvailable ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => isAvailable && setSelectedTime(slot.time)}
                >
                  <Text className="time-text">{slot.time}</Text>
                  {!isAvailable && <Text className="sold-out">售罄</Text>}
                </View>
              )
            })}
          </View>
        </View>

        {/* Package Selection */}
        <View className="section">
          <Text className="section-title">选择套餐</Text>
          <View className="package-list">
            {scenario.packages.map((pkg) => (
              <View
                key={pkg.id}
                className={`package-item ${selectedPkgId === pkg.id ? 'selected' : ''}`}
                onClick={() => setSelectedPkgId(pkg.id)}
              >
                <View className="package-info">
                  <View className="package-header">
                    <Text className="package-name">{pkg.name}</Text>
                    {pkg.tags.length > 0 && (
                      <View className="package-tag">
                        <Text>{pkg.tags[0]}</Text>
                      </View>
                    )}
                  </View>
                  <Text className="package-desc">{pkg.desc}</Text>
                </View>
                <View className="package-price">
                  <Text className="current-price">¥{pkg.price}</Text>
                  <Text className="original-price">¥{pkg.originalPrice}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Add-ons */}
        <View className="section">
          <Text className="section-title">超值加购</Text>
          <View className="addon-list">
            {ADDONS.map((item) => (
              <View key={item.id} className="addon-item">
                <View className="addon-info">
                  <Text className="addon-name">{item.name}</Text>
                  <Text className="addon-price">¥{item.price}</Text>
                </View>
                <View className="addon-controls">
                  <View
                    className={`control-btn minus ${(addons[item.id] || 0) > 0 ? 'active' : ''}`}
                    onClick={() => updateAddon(item.id, -1)}
                  >
                    <Text>−</Text>
                  </View>
                  <Text className="addon-count">{addons[item.id] || 0}</Text>
                  <View
                    className="control-btn plus"
                    onClick={() => updateAddon(item.id, 1)}
                  >
                    <Text>+</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer for bottom bar */}
        <View className="bottom-spacer" />
      </ScrollView>

      {/* Checkout Bar */}
      <View className="checkout-bar">
        {!selectedTime && (
          <View className="validation-msg">
            <Text>请先选择场次</Text>
          </View>
        )}
        <View className="checkout-content">
          <View className="price-info">
            <View className="total-row">
              <Text className="total-label">总计</Text>
              <Text className="total-price">¥{totalPrice}</Text>
            </View>
            <Text className="summary">
              {selectedPkg?.name} {totalAddonsCount > 0 ? `+ ${totalAddonsCount} 项加购` : ''}
            </Text>
          </View>
          <View
            className={`pay-btn ${!selectedTime || createBooking.isPending ? 'disabled' : ''}`}
            onClick={handlePayment}
          >
            <Text>{createBooking.isPending ? '处理中...' : '立即支付'}</Text>
            <Text>⚡</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
