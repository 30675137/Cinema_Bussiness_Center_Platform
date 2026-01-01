# Research Findings: 小程序渠道商品订单适配

**Feature**: O006-miniapp-channel-order
**Date**: 2026-01-01
**Status**: Completed

## Overview

本文档记录在实施计划阶段(Phase 0)的技术研究成果,解决 Technical Context 中的所有未知项,为 Phase 1 设计阶段提供决策依据。

## Research Areas

### 1. Taro 状态管理最佳实践

**Research Question**: Taro 4.1.9 + Zustand 4.5.5 + TanStack Query 5.90.12 的最佳组合模式?

**Decision**: 使用 Zustand 管理客户端状态(购物车、选中商品),TanStack Query 管理服务器状态(商品列表、订单状态)

**Rationale**:
- Zustand 轻量级,适合 Taro 小程序环境(bundle size 敏感)
- TanStack Query 提供缓存、重试、后台刷新等开箱即用能力
- 两者配合清晰分离客户端/服务器状态,符合项目宪法要求

**Implementation Pattern**:
```typescript
// Zustand store for cart (client state)
interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

// TanStack Query for products (server state)
const useChannelProducts = () => {
  return useQuery({
    queryKey: ['channel-products', 'mini-program'],
    queryFn: () => fetchChannelProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}
```

**Alternatives Considered**:
- Redux: 过于重量级,小程序 bundle size 会增加
- 纯 Zustand 管理所有状态: 缺少 TanStack Query 的缓存和重试能力
- 原生 Taro.request 手动管理: 需要自行实现缓存、重试等逻辑,增加复杂度

**References**:
- Zustand 官方文档: https://zustand-demo.pmnd.rs/
- TanStack Query 官方文档: https://tanstack.com/query/latest
- Taro 状态管理指南: https://docs.taro.zone/docs/redux

---

### 2. O003 饮品订单代码模式分析

**Research Question**: O003 的代码组织模式和关键实现模式是什么?应该如何复用和调整?

**Decision**: 复用 O003 的服务层模式、状态管理模式、页面组件结构,仅调整数据类型和 API 端点

**Rationale**:
- O003 已验证的订单流程模式稳定可靠
- 保持一致的代码风格降低维护成本
- 用户体验一致性(浏览→购物车→订单流程与饮品订单相同)

**O003 Code Patterns to Reuse**:

1. **服务层模式** (`hall-reserve-taro/src/services/beverageService.ts`):
   ```typescript
   // O003 Pattern
   export const fetchBeverages = () => request.get('/api/client/beverages')
   export const fetchBeverageDetail = (id: string) => request.get(`/api/client/beverages/${id}`)
   export const fetchBeverageSpecs = (id: string) => request.get(`/api/client/beverages/${id}/specs`)

   // O006 Adaptation
   export const fetchChannelProducts = () => request.get('/api/client/channel-products/mini-program')
   export const fetchChannelProductDetail = (id: string) => request.get(`/api/client/channel-products/mini-program/${id}`)
   export const fetchChannelProductSpecs = (id: string) => request.get(`/api/client/channel-products/mini-program/${id}/specs`)
   ```

2. **购物车 Store 模式** (`hall-reserve-taro/src/stores/beverageCartStore.ts`):
   ```typescript
   // O003 Pattern
   interface BeverageCartItem {
     beverageId: string
     name: string
     specs: Record<string, SelectedSpec>
     quantity: number
     unitPrice: number
   }

   // O006 Adaptation - Change beverageId → channelProductId
   interface ChannelProductCartItem {
     channelProductId: string  // ← KEY CHANGE
     name: string
     specs: Record<string, SelectedSpec>
     quantity: number
     unitPrice: number
   }
   ```

3. **订单提交模式** (`hall-reserve-taro/src/services/orderService.ts`):
   ```typescript
   // O003 Pattern
   interface CreateBeverageOrderDTO {
     items: {
       beverageId: string
       specs: Record<string, SelectedSpec>
       quantity: number
       unitPrice: number
     }[]
   }

   // O006 Adaptation
   interface CreateChannelProductOrderDTO {
     items: {
       channelProductId: string  // ← KEY CHANGE
       specs: Record<string, SelectedSpec>
       quantity: number
       unitPrice: number
     }[]
   }
   ```

**Key Changes from O003**:
- API 端点: `/api/client/beverages` → `/api/client/channel-products/mini-program`
- 关联字段: `beverageId` → `channelProductId`
- 分类类型: `BeverageCategory` → `ChannelCategory` (扩展到 6 种)
- 规格类型: 4 种 → 7 种 (新增 SPICINESS/SIDE/COOKING)
- 类型定义命名: `Beverage*` → `ChannelProduct*`

**Files to Reference**:
- `hall-reserve-taro/src/services/beverageService.ts` (服务层模式)
- `hall-reserve-taro/src/stores/beverageCartStore.ts` (购物车状态管理)
- `hall-reserve-taro/src/pages/beverage-menu/` (商品菜单页)
- `hall-reserve-taro/src/pages/beverage-detail/` (商品详情页)
- `hall-reserve-taro/src/pages/order-cart/` (购物车页,需复用)
- `hall-reserve-taro/src/pages/my-orders/` (订单列表页,需复用)

**Alternatives Considered**:
- 从零重写: 浪费时间,且可能引入新的 bug
- 完全复用不调整: 无法支持新的分类和规格类型
- 共享代码抽象: 过度工程化,当前两个功能场景差异不大

---

### 3. API 数据格式与 O005 对接

**Research Question**: O005 提供的 `/api/client/channel-products/mini-program` 端点的数据格式是什么?

**Decision**: 参考 O005 规格定义的 DTO 结构,前端类型定义与后端保持一致

**Rationale**:
- O005 规格明确定义了 API 契约
- 前后端类型定义一致性避免数据转换错误
- TypeScript 类型安全确保编译时发现问题

**Expected API Response Format** (from O005 spec):

1. **商品列表端点** `GET /api/client/channel-products/mini-program`:
   ```typescript
   interface ChannelProductListResponse {
     success: true
     data: ChannelProductDTO[]
     total: number
   }

   interface ChannelProductDTO {
     id: string
     skuId: string
     channelType: 'MINI_PROGRAM'
     channelCategory: 'ALCOHOL' | 'COFFEE' | 'BEVERAGE' | 'SNACK' | 'MEAL' | 'OTHER'
     displayName: string
     basePrice: number
     mainImage: string
     detailImages: string[]
     status: 'ACTIVE' | 'INACTIVE'
     isRecommended: boolean
     sortOrder: number
   }
   ```

2. **商品详情端点** `GET /api/client/channel-products/mini-program/:id`:
   ```typescript
   interface ChannelProductDetailResponse {
     success: true
     data: ChannelProductDetailDTO
   }

   interface ChannelProductDetailDTO extends ChannelProductDTO {
     description: string
     stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
   }
   ```

3. **商品规格端点** `GET /api/client/channel-products/mini-program/:id/specs`:
   ```typescript
   interface ChannelProductSpecsResponse {
     success: true
     data: ChannelProductSpecDTO[]
   }

   interface ChannelProductSpecDTO {
     id: string
     channelProductId: string
     specType: 'SIZE' | 'TEMPERATURE' | 'SWEETNESS' | 'TOPPING' | 'SPICINESS' | 'SIDE' | 'COOKING'
     specName: string
     options: SpecOptionDTO[]
     isRequired: boolean
     allowMultiple: boolean
   }

   interface SpecOptionDTO {
     id: string
     optionName: string
     priceAdjustment: number
     isDefault: boolean
   }
   ```

**Validation Strategy**:
- 使用 Zod schema 验证 API 响应格式
- 在开发环境使用 MSW mock 数据进行前端独立开发
- 在集成测试阶段验证真实 API 响应是否符合预期

**Error Handling**:
- API 返回 `success: false` 时显示友好错误提示
- 网络异常时自动重试 3 次(TanStack Query 配置)
- Token 过期时自动刷新并重试请求

**Alternatives Considered**:
- 不验证 API 响应格式: 运行时错误难以调试
- 手动类型转换: 容易出错,且增加代码复杂度
- 完全依赖后端文档: 文档可能过时,不如类型定义可靠

---

### 4. Taro 多端适配策略

**Research Question**: 如何确保微信小程序和 H5 两端的兼容性?

**Decision**: 使用 Taro 统一 API,通过条件编译处理平台差异

**Rationale**:
- Taro 提供统一的 API 抽象(Taro.request, Taro.setStorageSync 等)
- 条件编译(`process.env.TARO_ENV`)处理少量平台特定逻辑
- 大部分代码无需修改即可跨平台运行

**Implementation Strategy**:

1. **统一 API 使用**:
   ```typescript
   // ✅ 正确 - 使用 Taro API
   import Taro from '@tarojs/taro'

   Taro.request({ url: '/api/products', method: 'GET' })
   Taro.setStorageSync('token', token)
   Taro.showToast({ title: '添加成功' })

   // ❌ 错误 - 直接使用浏览器 API
   fetch('/api/products')
   localStorage.setItem('token', token)
   alert('添加成功')
   ```

2. **条件编译处理平台差异**:
   ```typescript
   // 支付逻辑 - 小程序使用 Mock,H5 显示提示
   const handlePayment = () => {
     if (process.env.TARO_ENV === 'weapp') {
       // 微信小程序 Mock 支付
       Taro.showToast({ title: '支付成功(Mock)', icon: 'success' })
     } else if (process.env.TARO_ENV === 'h5') {
       // H5 显示提示
       Taro.showModal({
         title: '提示',
         content: 'H5 暂不支持支付,请使用小程序'
       })
     }
   }
   ```

3. **样式适配**:
   ```less
   // 使用 rpx 单位自动适配
   .product-card {
     width: 345rpx;
     height: 480rpx;
     padding: 24rpx;
     font-size: 28rpx;
   }
   ```

**Testing Strategy**:
- 开发阶段: 主要在微信开发者工具测试小程序
- 集成阶段: 在浏览器测试 H5 版本
- 关键流程: 两端都进行手动测试验证

**Platform-Specific Features**:
- 小程序: 支持静默登录、推送通知、分享功能
- H5: 支持网页分享、URL 路由、浏览器缓存

**Alternatives Considered**:
- 分别开发小程序和 H5: 维护成本翻倍
- 只支持小程序: 用户无法通过 H5 访问
- 使用原生小程序开发: 无法复用到 H5

---

### 5. 购物车数据持久化策略

**Research Question**: 购物车数据应该存储在内存中还是本地存储?

**Decision**: 购物车数据仅存储在 Zustand 内存状态中,刷新页面后清空

**Rationale**:
- 用户下单流程通常在一个会话内完成(2分钟内)
- 避免过期商品价格/规格导致的问题(商品配置可能变更)
- 简化状态管理逻辑,避免本地存储的读写开销

**Implementation**:
```typescript
// 购物车 Store - 纯内存状态
export const useCartStore = create<CartStore>((set) => ({
  items: [], // 仅存在内存中,页面刷新后清空
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clearCart: () => set({ items: [] }),
}))
```

**Edge Case Handling**:
- 用户刷新页面: 购物车清空,需要重新添加商品
- 小程序切换后台: 内存状态保留,不受影响
- 用户主动清空购物车: 调用 `clearCart()` 方法

**Alternatives Considered**:
- 使用 Taro.setStorageSync 持久化: 可能导致价格/规格过期问题
- 使用服务器端购物车: 增加后端复杂度,且 O003 未实现
- 两者结合: 过度工程化,当前场景不需要

**References**:
- O003 实现: 同样使用内存状态
- Zustand persist middleware: https://docs.pmnd.rs/zustand/integrations/persisting-store-data

---

### 6. 规格价格计算逻辑

**Research Question**: 如何正确计算包含多规格的商品最终价格?

**Decision**: 最终价格 = 基础价格 + 所有选中规格的价格调整之和

**Rationale**:
- 符合用户直觉(基础价 + 加料费)
- 与 O003 计算逻辑一致
- 简单明了,易于测试和验证

**Implementation**:
```typescript
// 价格计算函数
function calculateFinalPrice(
  basePrice: number,
  selectedSpecs: Record<string, SelectedSpec>
): number {
  const totalAdjustment = Object.values(selectedSpecs).reduce(
    (sum, spec) => sum + spec.priceAdjustment,
    0
  )
  return basePrice + totalAdjustment
}

// 示例:
// 基础价: 28元
// 大杯: +5元
// 热: +0元
// 半糖: +0元
// 加珍珠: +3元
// 特辣: +2元
// 最终价格: 28 + 5 + 0 + 0 + 3 + 2 = 38元
```

**Validation**:
- 单元测试覆盖各种规格组合
- 验收测试确认 UI 显示价格与计算结果一致
- 订单提交时后端重新计算价格(避免前端篡改)

**Edge Cases**:
- 价格调整为负数: 允许(如折扣规格)
- 未选择必选规格: 阻止加入购物车
- 规格价格为 0: 正常处理(不额外收费的规格)

**Alternatives Considered**:
- 后端计算价格: 增加 API 调用次数,用户体验差
- 使用复杂定价规则: 当前场景不需要

---

## Summary of Key Decisions

| Research Area | Decision | Impact |
|--------------|----------|--------|
| 状态管理 | Zustand + TanStack Query | 清晰分离客户端/服务器状态,符合宪法要求 |
| 代码复用 | 参考 O003 模式,调整类型和端点 | 降低开发成本,保持用户体验一致性 |
| API 对接 | 遵循 O005 契约,使用 Zod 验证 | 前后端类型一致,编译时发现问题 |
| 多端适配 | Taro 统一 API + 条件编译 | 支持小程序和 H5,代码共享率高 |
| 购物车持久化 | 内存状态,刷新清空 | 避免价格/规格过期问题,简化逻辑 |
| 价格计算 | 基础价 + 规格调整之和 | 符合用户直觉,易于测试 |

## Next Steps

Phase 1 设计阶段需要:
1. 根据 API 格式生成 `data-model.md`
2. 定义 API contracts (OpenAPI/JSON schema)
3. 编写 `quickstart.md` 快速上手指南
4. 更新 agent context (添加 Taro 4.1.9 技术栈)

所有 Technical Context 中的未知项已解决,可以进入 Phase 1 ✅
