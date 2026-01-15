/**
 * @spec O007-miniapp-menu-api
 * 顶部导航栏组件 - 深色主题
 */

import { View, Text } from '@tarojs/components'
import Icon from '../Icon'
import './index.less'

/**
 * Header 组件属性
 */
export interface HeaderProps {
  /** 区域/位置名称 */
  zoneName?: string
  /** 搜索按钮点击回调 */
  onSearchClick?: () => void
  /** 扫码按钮点击回调 */
  onScanClick?: () => void
  /** 区域信息点击回调 */
  onZoneClick?: () => void
}

/**
 * 顶部导航栏组件
 */
export default function Header({
  zoneName = '3号厅 VIP区',
  onSearchClick,
  onScanClick,
  onZoneClick,
}: HeaderProps) {
  return (
    <View className='header'>
      <View className='header-content'>
        {/* 左侧：品牌 + 区域信息 */}
        <View className='header-left'>
          <Text className='brand'>CINELounge</Text>
          <View className='zone-info' onClick={onZoneClick}>
            <Icon name='location' size={20} color='#71717a' />
            <Text className='zone-name'>{zoneName}</Text>
            <Icon name='chevron-right' size={20} color='#71717a' />
          </View>
        </View>

        {/* 右侧：操作按钮 */}
        <View className='header-actions'>
          <View className='action-btn' onClick={onSearchClick}>
            <Icon name='search' size={28} color='#d4d4d8' />
          </View>
          <View className='action-btn primary' onClick={onScanClick}>
            <Icon name='scan' size={28} color='#18181b' />
          </View>
        </View>
      </View>
    </View>
  )
}
