# Data Model: 微信小程序底部导航栏

**Feature**: F001-miniapp-tab-bar
**Date**: 2025-12-23
**Status**: Complete

## Overview

本功能为纯前端配置，不涉及后端数据存储。以下为配置相关的数据结构定义。

## Configuration Entities

### TabBarItem (导航项配置)

表示 TabBar 中的单个导航项配置。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pagePath | string | ✓ | 页面路径（相对于 pages 目录） |
| text | string | ✓ | 导航项文字标签 |
| iconPath | string | ✓ | 未选中状态图标路径 |
| selectedIconPath | string | ✓ | 选中状态图标路径 |

**实例数据**:

```typescript
const tabBarItems: TabBarItem[] = [
  {
    pagePath: 'pages/home/index',
    text: '场地预约',
    iconPath: 'assets/tabbar/reserve.png',
    selectedIconPath: 'assets/tabbar/reserve-active.png'
  },
  {
    pagePath: 'pages/mall/index',
    text: '商城',
    iconPath: 'assets/tabbar/mall.png',
    selectedIconPath: 'assets/tabbar/mall-active.png'
  },
  {
    pagePath: 'pages/member/index',
    text: '会员',
    iconPath: 'assets/tabbar/member.png',
    selectedIconPath: 'assets/tabbar/member-active.png'
  },
  {
    pagePath: 'pages/profile/index',
    text: '我的',
    iconPath: 'assets/tabbar/profile.png',
    selectedIconPath: 'assets/tabbar/profile-active.png'
  }
]
```

### TabBarConfig (导航栏配置)

表示整个 TabBar 的配置。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| color | string | ✓ | 未选中文字颜色（十六进制） |
| selectedColor | string | ✓ | 选中文字颜色（十六进制） |
| backgroundColor | string | ✓ | TabBar 背景色（十六进制） |
| borderStyle | 'black' \| 'white' | ✓ | TabBar 上边框颜色 |
| list | TabBarItem[] | ✓ | 导航项列表（2-5 项） |

**实例配置**:

```typescript
const tabBarConfig: TabBarConfig = {
  color: '#999999',           // 未选中：灰色
  selectedColor: '#1890ff',   // 选中：蓝色（Ant Design 主色）
  backgroundColor: '#ffffff', // 背景：白色
  borderStyle: 'black',       // 边框：黑色线
  list: tabBarItems           // 4 个导航项
}
```

## Page Structure

### 新建页面结构

每个新建的 Tab 页面需要包含以下文件：

```
pages/{pageName}/
├── index.tsx        # 页面组件
├── index.scss       # 页面样式
└── index.config.ts  # 页面配置（导航栏标题等）
```

### Page Placeholder Template

新建页面的基础模板：

```typescript
// pages/{pageName}/index.tsx
import { View, Text } from '@tarojs/components'
import './index.scss'

export default function PageName() {
  return (
    <View className='page-container'>
      <Text>页面内容</Text>
    </View>
  )
}
```

```typescript
// pages/{pageName}/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '页面标题'
})
```

## Asset Requirements

### 图标资源规格

| Property | Value |
|----------|-------|
| Format | PNG |
| Size | 81 × 81 px |
| Color Depth | 24-bit with alpha |
| File Size | < 40KB each |

### 图标文件列表

| File Name | Description | State |
|-----------|-------------|-------|
| reserve.png | 场地预约图标 | 未选中 |
| reserve-active.png | 场地预约图标 | 选中 |
| mall.png | 商城图标 | 未选中 |
| mall-active.png | 商城图标 | 选中 |
| member.png | 会员图标 | 未选中 |
| member-active.png | 会员图标 | 选中 |
| profile.png | 我的图标 | 未选中 |
| profile-active.png | 我的图标 | 选中 |

## No Backend Integration

本功能不涉及：
- 数据库表设计
- API 接口定义
- 后端服务调用

所有配置均在前端 `app.config.ts` 中完成。
