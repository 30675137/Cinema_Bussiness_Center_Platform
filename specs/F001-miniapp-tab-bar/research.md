# Research: 微信小程序底部导航栏

**Feature**: F001-miniapp-tab-bar
**Date**: 2025-12-23
**Status**: Complete

## Research Tasks

### 1. Taro TabBar 配置最佳实践

**Decision**: 使用 Taro 原生 TabBar 配置（app.config.ts 中的 tabBar 字段）

**Rationale**:
- Taro 原生 TabBar 直接编译为微信小程序原生 TabBar，性能最优
- 配置简单，无需额外组件开发
- 自动处理多端适配（微信小程序、H5 等）
- 符合微信小程序设计规范

**Alternatives Considered**:
1. **自定义 TabBar 组件**: 灵活性高但性能较差，需要额外开发维护
2. **Taro UI TabBar 组件**: 适用于页面内 Tab 切换，不适合全局底部导航

### 2. 微信小程序 TabBar 规范研究

**Decision**: 配置 4 个 Tab 项（场地预约、商城、会员、我的）

**Rationale**:
- 微信小程序规定 TabBar 必须包含 2-5 个 tab 项
- 4 个项在视觉上平衡，符合常见小程序布局
- 每个 Tab 对应独立的功能模块

**Key Constraints**:
- TabBar 图标必须为本地路径，大小推荐 81px × 81px
- TabBar 只能配置一次，在 app.config.ts 中全局定义
- TabBar 页面必须在 pages 配置的最前面

### 3. 图标资源规范

**Decision**: 使用 PNG 格式图标，提供选中/未选中两种状态

**Rationale**:
- PNG 格式兼容性最好
- 81×81px 尺寸在各种屏幕上显示清晰
- 双状态图标提供清晰的视觉反馈

**Icon Naming Convention**:
```
tabbar/
├── reserve.png          # 场地预约 - 未选中
├── reserve-active.png   # 场地预约 - 选中
├── mall.png             # 商城 - 未选中
├── mall-active.png      # 商城 - 选中
├── member.png           # 会员 - 未选中
├── member-active.png    # 会员 - 选中
├── profile.png          # 我的 - 未选中
└── profile-active.png   # 我的 - 选中
```

### 4. 现有项目结构分析

**Decision**: 重用现有 home 页面作为"场地预约" Tab，新建 mall、member、profile 页面

**Rationale**:
- 现有 home 页面已实现场地预约功能
- 新建页面保持独立，便于后续扩展
- 遵循 Taro 项目标准目录结构

**Current Structure Analysis**:
```
hall-reserve-taro/src/pages/
├── home/              # 现有 - 可作为"场地预约" Tab
├── detail/            # 现有 - 非 Tab 页面
├── store-detail/      # 现有 - 非 Tab 页面
├── reservation-form/  # 现有 - 非 Tab 页面
├── my-reservations/   # 现有 - 非 Tab 页面
├── success/           # 现有 - 非 Tab 页面
└── admin/             # 现有 - 非 Tab 页面
```

### 5. H5 端 TabBar 兼容性

**Decision**: 使用 Taro 内置 H5 TabBar 实现

**Rationale**:
- Taro 会自动将 TabBar 配置编译为 H5 端对应实现
- 无需额外适配代码
- 保持多端体验一致性

**Note**: H5 端 TabBar 为模拟实现，可能与小程序端略有差异，但基本功能一致。

## Implementation Approach

### 配置文件更新 (app.config.ts)

```typescript
export default defineAppConfig({
  pages: [
    'pages/home/index',      // 场地预约 (Tab)
    'pages/mall/index',      // 商城 (Tab) - 新建
    'pages/member/index',    // 会员 (Tab) - 新建
    'pages/profile/index',   // 我的 (Tab) - 新建
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

## Unknowns Resolved

| Unknown | Resolution |
|---------|------------|
| TabBar 实现方式 | 使用 Taro 原生配置 |
| 图标规格 | 81×81px PNG 格式 |
| 页面结构调整 | 新建 3 个 Tab 页面 |
| H5 兼容性 | Taro 自动处理 |

## Next Steps

1. 创建图标资源目录和占位图标
2. 创建 mall、member、profile 三个新页面
3. 更新 app.config.ts 配置
4. 验证微信小程序和 H5 端显示效果
