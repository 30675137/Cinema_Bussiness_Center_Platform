# Quickstart: 微信小程序底部导航栏

**Feature**: F001-miniapp-tab-bar
**Date**: 2025-12-23

## Prerequisites

- Node.js 18+
- pnpm 8+
- 微信开发者工具（用于小程序调试）

## Quick Setup

### 1. 进入 Taro 项目目录

```bash
cd hall-reserve-taro
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

**微信小程序**:
```bash
pnpm dev:weapp
```

**H5**:
```bash
pnpm dev:h5
```

## Implementation Steps

### Step 1: 创建图标资源目录

```bash
mkdir -p src/assets/tabbar
```

将 8 个图标文件（4 个选中 + 4 个未选中）放入 `src/assets/tabbar/` 目录。

### Step 2: 创建新的 Tab 页面

**商城页面**:
```bash
mkdir -p src/pages/mall
```

创建以下文件：
- `src/pages/mall/index.tsx`
- `src/pages/mall/index.scss`
- `src/pages/mall/index.config.ts`

**会员页面**:
```bash
mkdir -p src/pages/member
```

**我的页面**:
```bash
mkdir -p src/pages/profile
```

### Step 3: 更新 app.config.ts

编辑 `src/app.config.ts`，添加 TabBar 配置：

```typescript
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/mall/index',
    'pages/member/index',
    'pages/profile/index',
    // 其他非 Tab 页面...
    'pages/detail/index',
    'pages/store-detail/index',
    'pages/reservation-form/index',
    'pages/my-reservations/index',
    'pages/my-reservations/detail/index',
    'pages/success/index',
    'pages/admin/index'
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
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
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '影院多元经营',
    navigationBarTextStyle: 'black'
  }
})
```

## Verification

### 微信小程序验证

1. 打开微信开发者工具
2. 导入项目 `hall-reserve-taro` 目录
3. 编译后检查底部导航栏是否显示
4. 点击各导航项，验证页面切换

### H5 验证

1. 运行 `pnpm dev:h5`
2. 打开浏览器访问 `http://localhost:10086`
3. 检查底部导航栏显示效果

## Acceptance Checklist

- [ ] 底部导航栏显示 4 个图标和文字
- [ ] 点击导航项可切换到对应页面
- [ ] 当前页面的导航项显示选中状态
- [ ] 其他导航项显示未选中状态
- [ ] 页面切换流畅（< 300ms）
- [ ] 在微信小程序和 H5 端均正常工作

## Common Issues

### 图标不显示

- 确保图标路径正确（相对于 `src/` 目录）
- 确保图标为 PNG 格式
- 检查图标文件是否存在

### TabBar 不显示

- 确保 Tab 页面在 `pages` 数组的前面
- 确保 `tabBar.list` 中的 `pagePath` 与 `pages` 中的路径一致
- 确保至少有 2 个 tab 项

### 页面跳转失败

- 使用 `Taro.switchTab()` 切换 Tab 页面
- 非 Tab 页面使用 `Taro.navigateTo()`
