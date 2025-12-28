# Data Model: 预约卡片紧凑布局优化

**Feature**: U002-reservation-card-ui-compact
**Date**: 2025-12-24
**Type**: UI-Only Optimization (No Data Model Changes)

---

## Overview

本功能为纯UI样式优化,不涉及数据库表结构变更、API契约变更或数据模型新增。仅影响预约卡片组件在C端小程序中的视觉呈现方式。

本文档列出受影响的现有数据实体及其在UI中的展示方式。

---

## Affected Existing Entities

### 1. Reservation Order (预约单)

**数据来源**: U001-reservation-order-management功能定义的`reservation_orders`表

**在UI中的展示字段**:

| 字段名 | 类型 | UI显示位置 | 字体大小(优化前→优化后) | 说明 |
|--------|------|------------|------------------------|------|
| `scenarioPackageName` | String | 卡片标题 | 36rpx → 30rpx | 场景包名称,限制2行显示 |
| `reservationDate` | Date | 卡片副标题 | 30rpx → 26rpx | 预订日期,格式: "2025-12-25" |
| `timeSlot` | String | 卡片副标题 | 30rpx → 26rpx | 时段,格式: "10:00-14:00" |
| `packageTierName` | String | 卡片内容 | 28rpx → 26rpx | 套餐名称 |
| `totalAmount` | Number | 卡片金额 | 36rpx加粗 → 32rpx加粗 | 总金额,强调显示 |
| `status` | Enum | 状态标签 | 26rpx → 24rpx | 状态:PENDING/CONFIRMED/CANCELLED/COMPLETED |
| `remarks` | String | 卡片备注(可选) | 26rpx → 24rpx | 用户备注,限制1行显示 |
| `createdAt` | Timestamp | 卡片底部(可选) | 24rpx → 22rpx | 创建时间,次要信息 |

**UI展示约束**:
- 场景包名称最多显示2行,超出使用省略号(`...`)
- 备注信息最多显示1行,点击卡片查看详情时展开完整内容
- 金额使用橙色(`#ff6600`)强调,字体加粗(`font-weight: 600`)
- 状态标签使用颜色区分(绿色=已确认,灰色=待确认,红色=已取消,蓝色=已完成)

---

### 2. Scenario Package (场景包)

**数据来源**: 场景包管理模块定义的`scenario_packages`表

**在UI中的展示字段**:

| 字段名 | 类型 | UI显示位置 | 尺寸(优化前→优化后) | 说明 |
|--------|------|------------|---------------------|------|
| `name` | String | 卡片标题 | 见上方Reservation Order | 场景包名称(冗余字段) |
| `imageUrl` | String | 卡片缩略图(可选) | 80rpx x 80rpx → 64rpx x 64rpx | 场景包封面图(圆角4rpx) |

**UI展示约束**:
- 缩略图为可选项,如果无图片则不显示占位符
- 图片使用圆角矩形(`border-radius: 4rpx`),避免过于尖锐

---

### 3. Reservation Status (预约单状态)

**数据来源**: 预约单状态枚举(U001定义)

**状态映射与UI样式**:

| 状态值 | 显示文本 | 标签颜色 | 背景色 | 字体大小 |
|--------|---------|---------|--------|---------|
| `PENDING` | 待确认 | `#999` | `#f5f5f5` | 24rpx |
| `CONFIRMED` | 已确认 | `#52c41a` | `#f6ffed` | 24rpx |
| `CANCELLED` | 已取消 | `#ff4d4f` | `#fff1f0` | 24rpx |
| `COMPLETED` | 已完成 | `#1890ff` | `#e6f7ff` | 24rpx |

**UI展示约束**:
- 状态标签使用圆角矩形(`border-radius: 2rpx`)
- 内边距: `padding: 2rpx 8rpx`
- 如果同时显示多个状态(如"已确认"+"待支付"),水平排列,间距8rpx

---

## UI Components Affected

### ReservationCard Component

**文件路径**: `hall-reserve-taro/src/components/ReservationCard/index.tsx`(假设路径)

**组件Props接口(无变更)**:

```typescript
interface ReservationCardProps {
  reservation: {
    id: string;
    orderNumber: string;
    scenarioPackageName: string;
    reservationDate: string;
    timeSlot: string;
    packageTierName: string;
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    remarks?: string;
    scenarioPackageImage?: string;
    createdAt: string;
  };
  onPress?: () => void; // 点击卡片事件
}
```

**样式文件**: `ReservationCard.module.scss`

**样式变量变更对照表**:

| 样式变量 | 优化前 | 优化后 | 变更说明 |
|---------|--------|--------|---------|
| `--card-height` | `400rpx` | `280rpx` | 卡片高度减少30% |
| `--card-padding-vertical` | `32rpx` | `20rpx` | 垂直内边距减少 |
| `--card-padding-horizontal` | `24rpx` | `24rpx` | 水平内边距保持不变 |
| `--card-margin-bottom` | `32rpx` | `20rpx` | 卡片间距减少 |
| `--title-font-size` | `36rpx` | `30rpx` | 标题字体缩小 |
| `--subtitle-font-size` | `30rpx` | `26rpx` | 副标题字体缩小 |
| `--content-font-size` | `28rpx` | `26rpx` | 内容字体缩小 |
| `--remarks-font-size` | `26rpx` | `24rpx` | 备注字体缩小 |
| `--price-font-size` | `36rpx` | `32rpx` | 金额字体缩小 |
| `--status-font-size` | `26rpx` | `24rpx` | 状态标签字体缩小 |
| `--line-height` | `1.5` | `1.4` | 行高微调(避免过紧) |
| `--button-height` | `80rpx` | `64rpx` | 按钮高度减少 |
| `--button-min-touch-area` | `88rpx` | `88rpx` | 最小触控区保持不变 |

---

## No New Data Entities

本功能不创建新的数据库表、字段或枚举类型。所有数据模型继承自U001-reservation-order-management功能,仅调整UI呈现方式。

---

## Data Flow (Unchanged)

**数据流程**(与U001保持一致):

1. **数据获取**: C端通过`GET /api/client/reservations`获取预约单列表数据
2. **状态管理**: 使用Zustand或TanStack Query缓存预约单数据
3. **组件渲染**: ReservationCard组件接收预约单数据props,根据样式变量渲染UI
4. **用户交互**: 点击卡片跳转到预约单详情页(路由不变)

**无API契约变更**: 本功能不修改任何后端API的请求/响应格式,仅调整前端UI展示。

---

## Migration Notes

**数据迁移**: 无需数据迁移

**向后兼容性**: 完全兼容现有数据,不影响已创建的预约单

**回滚策略**: 如需回滚UI优化,恢复样式变量到优化前的值即可,无需数据回滚

---

**Data Model Status**: ✅ NO CHANGES REQUIRED (UI-Only Feature)
