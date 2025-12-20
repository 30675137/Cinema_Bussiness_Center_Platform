import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useScenarios } from '@/services/scenarioService'
import { useAppStore } from '@/stores/appStore'
import { THEME_CONFIG } from '@/constants'
import type { Scenario } from '@/types'
import './index.less'

export default function Home() {
  const { data: scenarios, isLoading } = useScenarios()
  const setActiveScenario = useAppStore((s) => s.setActiveScenario)

  const handleSelectScenario = (scenario: Scenario) => {
    setActiveScenario(scenario)
    Taro.navigateTo({ url: `/pages/detail/index?id=${scenario.id}` })
  }

  const handleOpenAdmin = () => {
    Taro.navigateTo({ url: '/pages/admin/index' })
  }

  if (isLoading) {
    return (
      <View className="loading-container">
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className="home-page">
      {/* Header */}
      <View className="header">
        <View className="location">
          <Text className="icon-location">📍</Text>
          <Text className="city">北京</Text>
          <Text className="dot">·</Text>
          <Text className="sub">严选场馆</Text>
        </View>
        <View className="settings" onClick={handleOpenAdmin}>
          <Text>⚙️</Text>
        </View>
      </View>

      {/* Hero */}
      <View className="hero">
        <Text className="title">
          不仅仅是 <Text className="highlight">电影</Text>
        </Text>
        <Text className="subtitle">会议路演 · 求婚策划 · 粉丝应援</Text>
      </View>

      {/* Scenario List */}
      <View className="scenario-list">
        {scenarios?.map((scenario) => {
          const theme = THEME_CONFIG[scenario.category]
          return (
            <View
              key={scenario.id}
              className="scenario-card"
              onClick={() => handleSelectScenario(scenario)}
            >
              {/* Image */}
              <View className="card-image">
                <Image
                  src={scenario.image}
                  mode="aspectFill"
                  className="image"
                />
                {/* Rating Badge */}
                <View className="rating-badge">
                  <Text>⭐</Text>
                  <Text className="rating-text">{scenario.rating}</Text>
                </View>
                {/* Category Badge */}
                <View className={`category-badge ${theme.badgeStyle}`}>
                  <Text className="category-text">{theme.label}</Text>
                </View>
                {/* Title Overlay */}
                <View className="title-overlay">
                  <Text className="card-title">{scenario.title}</Text>
                  <View className="tags">
                    {scenario.tags.map((tag, i) => (
                      <Text key={i} className="tag">{tag}</Text>
                    ))}
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View className="card-footer">
                <View className="footer-left">
                  <View className="location-row">
                    <Text className="location-icon">📍</Text>
                    <Text className="location-text">{scenario.location}</Text>
                  </View>
                  <View className="price-row">
                    <Text className="price-label">起价 </Text>
                    <Text className="price">¥{scenario.packages[0].price}</Text>
                  </View>
                </View>
                <View className="arrow">
                  <Text>›</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      {/* Quick Rebook */}
      <View className="quick-rebook">
        <Text className="section-title">猜你喜欢</Text>
        <View className="rebook-card">
          <Image
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&q=80"
            className="rebook-image"
          />
          <View className="rebook-info">
            <Text className="rebook-title">电竞对战团建包</Text>
            <Text className="rebook-location">耀莱成龙影城（五棵松店）</Text>
          </View>
          <View className="rebook-btn">
            <Text>去看看</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
