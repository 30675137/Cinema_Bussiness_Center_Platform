import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useBookingStore } from '@/stores/bookingStore'
import { useReservationStore } from '@/stores/reservationStore'
import { THEME_CONFIG } from '@/constants'
import './index.less'

const API_BASE = 'http://192.168.10.71:8080'
const DATE_OPTIONS = ['今天', '明天', '周五 24', '周六 25']

export default function Detail() {
  const router = useRouter()
  const packageId = router.params.id
  
  // 直接使用 useState 管理数据
  const [scenarioData, setScenarioData] = useState<any>(null)
  const [tiersData, setTiersData] = useState<any[]>([])
  const [addonsData, setAddonsData] = useState<any[]>([])
  const [timeSlotsData, setTimeSlotsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 加载数据
  useEffect(() => {
    if (!packageId) return
    console.log('Detail: 开始加载, packageId=', packageId)
    
    Promise.all([
      Taro.request({ url: `${API_BASE}/api/scenario-packages/${packageId}` }),
      Taro.request({ url: `${API_BASE}/api/scenario-packages/${packageId}/tiers` }),
      Taro.request({ url: `${API_BASE}/api/addon-items` }),
      Taro.request({ url: `${API_BASE}/api/scenario-packages/${packageId}/time-slot-templates` }),
    ]).then(([scenarioRes, tiersRes, addonsRes, slotsRes]) => {
      console.log('Detail: API 响应', { scenarioRes, tiersRes, addonsRes, slotsRes })
      
      if (scenarioRes.statusCode === 200 && scenarioRes.data.success) {
        setScenarioData(scenarioRes.data.data)
      }
      if (tiersRes.statusCode === 200 && tiersRes.data.success) {
        setTiersData(tiersRes.data.data || [])
      }
      if (addonsRes.statusCode === 200 && addonsRes.data.success) {
        setAddonsData(addonsRes.data.data || [])
      }
      if (slotsRes.statusCode === 200 && slotsRes.data.success) {
        setTimeSlotsData(slotsRes.data.data || [])
      }
      setIsLoading(false)
    }).catch((err) => {
      console.error('Detail: 请求失败', err)
      setIsLoading(false)
    })
  }, [packageId])
  
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

  // 预约表单store
  const setScenarioPackage = useReservationStore((s) => s.setScenarioPackage)

  // 将后端数据转换为页面需要的格式
  const scenario = useMemo(() => {
    if (!scenarioData) return null
    return {
      id: scenarioData.id,
      title: scenarioData.name,
      category: scenarioData.category || 'MOVIE',
      image: scenarioData.image || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
      location: '北京·精选场馆',
      rating: scenarioData.rating || 5.0,
      tags: scenarioData.tags || ['浪漫', '惊喜'],
      packages: (tiersData || []).map(tier => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        originalPrice: tier.originalPrice || tier.price,
        desc: tier.serviceDescription || '',
        tags: tier.tags || []
      }))
    }
  }, [scenarioData, tiersData])

  // 根据选中的日期获取对应的时段列表
  const timeSlots = useMemo(() => {
    if (!timeSlotsData || timeSlotsData.length === 0) return []
    
    // 获取选中日期对应的星期几
    const today = new Date()
    let targetDate = today
    if (selectedDate === '明天') {
      targetDate = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    } else if (selectedDate.includes('周')) {
      // 解析“周五 24”这种格式
      const dayMatch = selectedDate.match(/(周[\u4e00-\u65e5])/)
      if (dayMatch) {
        const dayMap: Record<string, number> = {
          '周日': 0, '周一': 1, '周二': 2, '周三': 3, 
          '周四': 4, '周五': 5, '周六': 6
        }
        const targetDayOfWeek = dayMap[dayMatch[1]] ?? today.getDay()
        const todayDayOfWeek = today.getDay()
        const diff = (targetDayOfWeek - todayDayOfWeek + 7) % 7 || 7
        targetDate = new Date(today.getTime() + diff * 24 * 60 * 60 * 1000)
      }
    }
    const dayOfWeek = targetDate.getDay()
    
    // 过滤当天的时段
    const todaySlots = timeSlotsData
      .filter((slot: any) => slot.dayOfWeek === dayOfWeek && slot.isEnabled)
      .map((slot: any) => ({
        id: slot.id,
        time: slot.startTime.substring(0, 5), // "10:00:00" -> "10:00"
        endTime: slot.endTime.substring(0, 5),
        status: slot.capacity > 0 ? 'Available' : 'Sold Out',
        capacity: slot.capacity,
        priceAdjustment: slot.priceAdjustment
      }))
      .sort((a: any, b: any) => a.time.localeCompare(b.time))
    
    return todaySlots
  }, [timeSlotsData, selectedDate])

  // 初始化
  useEffect(() => {
    if (scenario && scenario.packages.length > 0 && !selectedPkgId) {
      setSelectedPkgId(scenario.packages[0].id)
    }
  }, [scenario, tiersData])

  // 时段初始化
  useEffect(() => {
    if (timeSlots.length > 0) {
      const firstAvailable = timeSlots.find((t: any) => t.status === 'Available')
      if (firstAvailable) {
        setSelectedTime(firstAvailable.time)
      }
    }
  }, [timeSlots])

  const theme = scenario ? THEME_CONFIG[scenario.category] : null

  const selectedPkg = useMemo(() => {
    return scenario?.packages.find((p) => p.id === selectedPkgId)
  }, [scenario, selectedPkgId])

  const totalAddonsCount = useMemo(() => {
    return Object.values(addons).reduce((a, b) => a + b, 0)
  }, [addons])

  const totalPrice = useMemo(() => {
    if (!selectedPkg) return 0
    const addonsPrice = (addonsData || []).reduce((sum, item) => {
      return sum + item.price * (addons[item.id] || 0)
    }, 0)
    return selectedPkg.price + addonsPrice
  }, [selectedPkg, addons, addonsData])

  const handleBack = () => {
    reset()
    Taro.navigateBack()
  }

  const handlePayment = () => {
    if (!scenario || !selectedPkg || !selectedTime) return

    // 设置场景包信息到预约Store
    setScenarioPackage(scenario.id, scenario.title, scenario.image)
    
    // 跳转到预约表单页面
    Taro.navigateTo({
      url: `/pages/reservation-form/index?id=${scenario.id}&tierId=${selectedPkg.id}&date=${selectedDate}&time=${selectedTime}`
    })
  }

  if (isLoading || !scenario) {
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
            {timeSlots.length === 0 ? (
              <View className="no-slots">
                <Text>当日无可用时段</Text>
              </View>
            ) : (
              timeSlots.map((slot: any) => {
                const isAvailable = slot.status === 'Available'
                const isSelected = selectedTime === slot.time
                return (
                  <View
                    key={slot.id || slot.time}
                    className={`time-item ${!isAvailable ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => isAvailable && setSelectedTime(slot.time)}
                  >
                    <Text className="time-text">{slot.time}</Text>
                    {!isAvailable && <Text className="sold-out">售罄</Text>}
                  </View>
                )
              })
            )}
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
                    {pkg.tags && pkg.tags.length > 0 && (
                      <View className="package-tag">
                        <Text>{pkg.tags[0]}</Text>
                      </View>
                    )}
                  </View>
                  <Text className="package-desc">{pkg.desc}</Text>
                </View>
                <View className="package-price">
                  <Text className="current-price">¥{pkg.price}</Text>
                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <Text className="original-price">¥{pkg.originalPrice}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Add-ons */}
        <View className="section">
          <Text className="section-title">超值加购</Text>
          <View className="addon-list">
            {(addonsData || []).map((item) => (
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
            className={`pay-btn ${!selectedTime ? 'disabled' : ''}`}
            onClick={handlePayment}
          >
            <Text>立即预约</Text>
            <Text>📅</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
