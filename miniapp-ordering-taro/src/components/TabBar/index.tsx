/**
 * @spec O007-miniapp-menu-api
 * 底部导航栏组件 - 深色主题
 */

import { View, Text } from '@tarojs/components'
import Icon, { IconName } from '../Icon'
import './index.less'

/**
 * Tab 项配置
 */
export interface TabItem {
  /** Tab 键值 */
  key: string
  /** Tab 标签文本 */
  label: string
  /** 图标名称 */
  icon: IconName
}

/**
 * TabBar 组件属性
 */
export interface TabBarProps {
  /** Tab 列表 */
  tabs: TabItem[]
  /** 当前激活的 Tab */
  activeTab: string
  /** Tab 切换回调 */
  onTabChange: (key: string) => void
}

/**
 * 底部导航栏组件
 */
export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <View className='tab-bar'>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <View
            key={tab.key}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={40}
              color={isActive ? '#f5a623' : '#71717a'}
            />
            <Text className={`tab-text ${isActive ? 'active' : ''}`}>
              {tab.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
