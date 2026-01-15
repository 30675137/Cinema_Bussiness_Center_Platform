# O010-shopping-cart - 任务分解

**功能**: 小程序购物车功能
**项目路径**: `miniapp-ordering-taro`
**生成时间**: 2026-01-06
**技术栈**: Taro 4.1.9 + React 18.3.1 + TypeScript 5.4.0 + Zustand 4.5.5

---

## 任务组织策略

- **按用户故事分组**: 每个 User Story 对应一个实施阶段
- **优先级排序**: P1 (US1-US3) → P2 (US4) → P3 (US5-US6)
- **依赖关系**: 基础设施 → 核心功能 → 增强功能
- **测试策略**: 每个阶段完成后进行手动测试验证

---

## 阶段 1: 准备工作 (Phase 1: Setup)

### T001: 确认项目结构和依赖
- **描述**: 确认 `miniapp-ordering-taro` 项目已初始化，依赖已安装
- **验收标准**:
  - 项目路径正确 (`miniapp-ordering-taro`，非 `hall-reserve-taro`)
  - Zustand 4.5.5 已安装
  - Taro 4.1.9 运行正常 (`npm run dev:h5`)
- **依赖**: 无
- **估时**: 0.5h

### T002: 创建功能目录结构
- **描述**: 在 `miniapp-ordering-taro/src/` 下创建购物车相关目录
- **交付**:
  - `src/stores/cartStore.ts` 文件骨架
  - `src/components/QuantityController/` 目录
  - `src/components/FloatingCartButton/` 目录
  - `src/components/CartDrawer/` 目录
  - `src/utils/cartStorage.ts` 文件骨架
- **验收标准**: 目录结构清晰，文件包含 `@spec O010-shopping-cart` 标识
- **依赖**: T001
- **估时**: 0.5h

---

## 阶段 2: 基础设施 (Phase 2: Foundational)

### T003: 定义 TypeScript 类型
- **描述**: 创建 `src/types/cart.ts`，定义 CartProduct, CartItem, Cart, CartState 接口
- **交付**:
  ```typescript
  /** @spec O010-shopping-cart */
  export interface CartProduct { id: string; name: string; price: number; image: string; }
  export interface CartItem { product: CartProduct; quantity: number; selectedOptions: Record<string, string>; }
  export interface Cart { items: CartItem[]; timestamp: number; }
  export interface CartState { cart: Cart; totalItems: () => number; cartTotal: () => number; /* ... */ }
  ```
- **验收标准**: 类型定义与 data-model.md 一致
- **依赖**: T002
- **估时**: 1h

### T004: 实现本地存储工具函数
- **描述**: 创建 `src/utils/cartStorage.ts`，实现 saveCart, loadCart, clearCart
- **交付**:
  - `saveCart(cart: Cart)`: 使用 `Taro.setStorageSync('cart', cart)` 保存，同时保存 timestamp
  - `loadCart()`: 使用 `Taro.getStorageSync('cart')`，检查 7 天过期逻辑
  - `clearCart()`: 清空购物车
- **验收标准**:
  - 单元测试覆盖 3 个函数
  - 7 天过期逻辑正确（`Date.now() - cart.timestamp > 7 * 24 * 60 * 60 * 1000`）
- **依赖**: T003
- **估时**: 2h

### T005: 实现价格格式化工具
- **描述**: 创建 `src/utils/formatPrice.ts`
- **交付**:
  ```typescript
  /** @spec O010-shopping-cart */
  export const formatPrice = (priceInCents: number): string => {
    const yuan = priceInCents / 100;
    return yuan % 1 === 0 ? `¥${yuan}` : `¥${yuan.toFixed(2)}`;
  }
  ```
- **验收标准**:
  - 单元测试验证 `100 → ¥1`, `1050 → ¥10.5`, `999 → ¥9.99`
- **依赖**: 无
- **估时**: 0.5h

### T006: 创建 Zustand cartStore
- **描述**: 实现 `src/stores/cartStore.ts`，管理购物车状态
- **交付**:
  - 状态: `cart: Cart`, `isCartOpen: boolean`
  - Actions: `addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`, `toggleCartDrawer`
  - Selectors: `totalItems()`, `cartTotal()`, `subtotal()`
  - 集成 `cartStorage.ts`（初始化时 loadCart，变更时 saveCart）
- **验收标准**:
  - 单元测试覆盖所有 actions
  - 购物车数据变更自动持久化
  - useMemo 优化计算性能
- **依赖**: T003, T004, T005
- **估时**: 3h

### T007: 添加 CSS 动画样式
- **描述**: 创建 `src/styles/animations.scss`（或使用 Taro 内联样式）
- **交付**:
  ```scss
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up {
    animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  ```
- **验收标准**: 动画流畅度 60 FPS，时长精确 350ms
- **依赖**: 无
- **估时**: 1h

---

## 阶段 3: US1 - 添加商品到购物车 (Phase 3: US1)

### T008: 创建 QuantityController 组件骨架
- **描述**: 创建 `src/components/QuantityController/index.tsx`
- **交付**:
  - Props 接口: `{ productId: string; quantity: number; onIncrease: () => void; onDecrease: () => void; }`
  - 布局: 灰色圆形"-"按钮 + 橙色数字 + 橙色圆形"+"按钮
  - 样式: `styles.module.scss`
- **验收标准**: 组件渲染正常，按钮间距 8px
- **依赖**: T002
- **估时**: 1.5h

### T009: QuantityController - 实现点击事件
- **描述**: 实现 `+` 和 `-` 按钮点击逻辑
- **交付**:
  - 点击 `+` 调用 `onIncrease`
  - 点击 `-` 调用 `onDecrease`
  - 使用 `stopPropagation()` 阻止冒泡（防止触发商品详情跳转）
- **验收标准**:
  - 点击按钮不触发父组件 onClick
  - 单元测试验证 stopPropagation 调用
- **依赖**: T008
- **估时**: 1h

### T010: QuantityController - 样式实现
- **描述**: 实现 QuantityController 样式（参考 UI 原型）
- **交付**:
  - `-` 按钮: `bg-zinc-800`, `rounded-full`, `p-1.5`
  - 数字: `text-amber-500`, `font-bold`, `w-4`, `text-center`
  - `+` 按钮: `bg-amber-500`, `rounded-full`, `p-1.5`, `shadow-lg`
  - 按钮间距: `space-x-2`
- **验收标准**: 样式与 UI 原型一致，响应式适配
- **依赖**: T009
- **估时**: 1h

### T011: ProductCard - 集成数量控制器（条件渲染）
- **描述**: 修改 `src/components/ProductCard/index.tsx`，集成 QuantityController
- **交付**:
  - 使用 `useCartStore` 获取商品数量
  - 条件渲染: `quantity === 0` 显示橙色圆形 `+` 按钮，`quantity > 0` 显示 QuantityController
  - 布局: 卡片底部 `价格 + 控制器`
- **验收标准**:
  - 商品卡片样式不变
  - 控制器显示/隐藏逻辑正确
- **依赖**: T010, T006
- **估时**: 2h

### T012: ProductCard - 实现添加到购物车逻辑
- **描述**: 实现 `+` 按钮点击逻辑
- **交付**:
  - 点击 `+` 调用 `cartStore.addToCart(product)`
  - 传递 CartProduct 数据（id, name, price, image）
  - 默认 quantity = 1
- **验收标准**:
  - 点击后商品加入购物车
  - cartStore 状态更新
  - 本地存储同步更新
- **依赖**: T011
- **估时**: 1.5h

### T013: ProductCard - 实现增减数量逻辑
- **描述**: 实现 QuantityController 的 `onIncrease` 和 `onDecrease` 回调
- **交付**:
  - `onIncrease`: 调用 `cartStore.updateQuantity(productId, +1)`
  - `onDecrease`: 调用 `cartStore.updateQuantity(productId, -1)`
  - 数量减至 0 时自动隐藏控制器
- **验收标准**:
  - 数量增减正确
  - 减至 0 时恢复显示 `+` 按钮
  - 购物车总金额实时更新
- **依赖**: T012
- **估时**: 1.5h

### T014: ProductCard - 防抖处理
- **描述**: 实现防抖逻辑，防止快速连续点击
- **交付**:
  - 使用 `lodash.debounce` 或自定义 hook
  - 防抖延迟: 300ms
- **验收标准**:
  - 快速点击 10 次只触发 1-2 次
  - 用户体验流畅
- **依赖**: T013
- **估时**: 1h

### T015: US1 - 单元测试
- **描述**: 为 QuantityController 和 ProductCard 编写单元测试
- **交付**:
  - `QuantityController.test.tsx`: 测试渲染、点击事件、stopPropagation
  - `ProductCard.test.tsx`: 测试条件渲染、购物车集成
- **验收标准**: 测试覆盖率 ≥ 80%
- **依赖**: T014
- **估时**: 2h

### T016: US1 - 集成测试
- **描述**: 在商品列表页测试完整流程
- **交付**:
  - 手动测试清单: 添加商品、增减数量、减至 0
  - 验证本地存储数据格式
- **验收标准**: 符合 US1 的 5 个 Acceptance Scenarios
- **依赖**: T015
- **估时**: 1h

### T017: US1 - 样式优化
- **描述**: 优化 ProductCard 和 QuantityController 的响应式样式
- **交付**:
  - 适配不同屏幕尺寸（iPhone SE, iPhone 12 Pro Max）
  - 按钮点击反馈动画（scale-[0.95]）
- **验收标准**: UI 原型对比无差异
- **依赖**: T016
- **估时**: 1h

### T018: US1 - 性能优化
- **描述**: 优化 ProductCard 列表渲染性能
- **交付**:
  - 使用 `React.memo` 优化 ProductCard
  - 使用 `useMemo` 缓存商品数量查询
- **验收标准**: 列表滚动流畅度 ≥ 50 FPS
- **依赖**: T017
- **估时**: 1h

---

## 阶段 4: US2 - 浮动购物车按钮 (Phase 4: US2)

### T019: 创建 FloatingCartButton 组件骨架
- **描述**: 创建 `src/components/FloatingCartButton/index.tsx`
- **交付**:
  - 固定定位: `position: fixed`, `bottom: 96px`, `left: 16px`, `right: 16px`
  - 布局: 角标 + "去结账"文字 + 总金额 + 右箭头
- **验收标准**: 组件渲染在底部导航栏上方
- **依赖**: T002
- **估时**: 1.5h

### T020: FloatingCartButton - 条件渲染逻辑
- **描述**: 实现按钮显示/隐藏逻辑
- **交付**:
  - 使用 `useCartStore` 获取 `cartTotal`
  - 条件: `cartTotal > 0 && 当前页面为商品列表页` → 显示
  - 使用 Taro 路由 API 检测当前页面
- **验收标准**:
  - 购物车为空时隐藏
  - 非商品列表页时隐藏
  - 商品列表页且有商品时显示
- **依赖**: T019, T006
- **估时**: 2h

### T021: FloatingCartButton - 角标实现
- **描述**: 实现黑色圆角矩形角标（显示商品总件数）
- **交付**:
  - 样式: `bg-zinc-950`, `text-amber-500`, `rounded-lg`, `font-bold`
  - 内容: `totalItems > 99 ? '99+' : totalItems`
- **验收标准**:
  - 角标数字实时更新
  - 超过 99 显示 "99+"
- **依赖**: T020
- **估时**: 1h

### T022: FloatingCartButton - 样式实现
- **描述**: 实现按钮样式（参考 UI 原型）
- **交付**:
  - 背景: `bg-amber-500`, `rounded-2xl`, `h-14`, `shadow-2xl`
  - 悬停: `hover:scale-[1.02]`（H5 端）
  - 点击: `active:scale-[0.98]`
  - 内容: "去结账"（小号半透明）+ 总金额（大号加粗）
- **验收标准**: 样式与 UI 原型一致
- **依赖**: T021
- **估时**: 1.5h

### T023: FloatingCartButton - 点击事件
- **描述**: 实现点击打开购物车抽屉
- **交付**:
  - 点击调用 `cartStore.toggleCartDrawer()`
  - 点击反馈动画流畅
- **验收标准**: 点击响应时间 < 100ms
- **依赖**: T022
- **估时**: 0.5h

### T024: US2 - 单元测试
- **描述**: 为 FloatingCartButton 编写单元测试
- **交付**:
  - 测试条件渲染
  - 测试角标数字显示
  - 测试点击事件
- **验收标准**: 测试覆盖率 ≥ 80%
- **依赖**: T023
- **估时**: 1.5h

### T025: US2 - 集成测试
- **描述**: 在商品列表页测试浮动按钮
- **交付**:
  - 手动测试清单: 添加商品 → 按钮显示 → 点击按钮
  - 验证角标和总金额显示
- **验收标准**: 符合 US2 的 4 个 Acceptance Scenarios
- **依赖**: T024
- **估时**: 0.5h

---

## 阶段 5: US3 - 购物车抽屉 (Phase 5: US3)

### T026: 创建 CartDrawer 组件骨架
- **描述**: 创建 `src/components/CartDrawer/index.tsx`
- **交付**:
  - 遮罩层: `bg-black/80`, `backdrop-blur-md`
  - 抽屉: `h-[90vh]`, `rounded-t-[2.5rem]`, `bg-zinc-900`
  - 三个区域: 标题栏、商品列表、结算区域
- **验收标准**: 组件结构清晰，布局正确
- **依赖**: T002
- **估时**: 2h

### T027: CartDrawer - 条件渲染逻辑
- **描述**: 根据 `isCartOpen` 状态显示/隐藏抽屉
- **交付**:
  - 使用 `useCartStore` 获取 `isCartOpen`
  - 条件渲染: `isCartOpen ? <Drawer /> : null`
- **验收标准**: 状态变化时正确显示/隐藏
- **依赖**: T026, T006
- **估时**: 0.5h

### T028: CartDrawer - 标题栏实现
- **描述**: 实现抽屉顶部标题栏
- **交付**:
  - 标题: "订单汇总"（`text-2xl`, `font-black`）
  - 关闭按钮: 圆形 X 图标（`bg-zinc-800`, `p-2`, `rounded-full`）
  - 点击关闭按钮调用 `cartStore.toggleCartDrawer()`
- **验收标准**: 标题和关闭按钮样式正确
- **依赖**: T027
- **估时**: 1h

### T029: CartDrawer - 商品列表区域（可滚动）
- **描述**: 实现中间商品列表区域
- **交付**:
  - 使用 Taro `<ScrollView>`
  - 渲染购物车中的所有商品
  - 每个商品显示: 图片 + 名称 + 价格 + 选项 + 数量控制器
- **验收标准**:
  - 列表可滚动
  - 标题栏和结算区域固定
  - 商品数量 > 5 时滚动流畅
- **依赖**: T028
- **估时**: 2h

### T030: CartDrawer - 商品选项显示
- **描述**: 在商品名称下方显示选项（如"少冰 · 半糖"）
- **交付**:
  - 读取 `CartItem.selectedOptions`
  - 格式化为 "少冰 · 半糖" 格式（用 ` · ` 分隔）
  - 样式: `text-zinc-500`, `text-xs`
- **验收标准**:
  - 有选项时显示在名称下方
  - 无选项时不显示
  - 格式正确
- **依赖**: T029
- **估时**: 1h

### T031: CartDrawer - 商品数量控制器集成
- **描述**: 在购物车抽屉中集成 QuantityController
- **交付**:
  - 复用 QuantityController 组件
  - 样式: `bg-zinc-800/50`, `p-1`, `rounded-xl`
  - 点击调用 `cartStore.updateQuantity`
- **验收标准**:
  - 数量增减正确
  - 减至 0 时商品从列表移除
- **依赖**: T030, T010
- **估时**: 1.5h

### T032: CartDrawer - 空购物车状态
- **描述**: 实现购物车为空时的提示
- **交付**:
  - 条件: `cart.items.length === 0`
  - 显示: "空空如也" 提示（居中，`text-zinc-500`）
  - 图标: 空购物车图标（可选）
- **验收标准**: 购物车为空时显示提示
- **依赖**: T027
- **估时**: 0.5h

### T033: CartDrawer - 结算区域实现
- **描述**: 实现底部固定结算区域
- **交付**:
  - 小计: `text-zinc-500`, `text-xs`
  - 实付金额: `text-amber-500`, `text-3xl`, `font-black`
  - 支付按钮: `bg-amber-500`, `rounded-[1.5rem]`, `py-5`, `font-black`
- **验收标准**:
  - 金额实时计算（使用 useMemo）
  - 结算区域固定在底部
- **依赖**: T029
- **估时**: 2h

### T034: CartDrawer - 支付按钮导航
- **描述**: 实现"立即支付"按钮点击逻辑
- **交付**:
  - 点击调用 `Taro.navigateTo({ url: '/pages/order-confirm/index' })`
  - 传递购物车数据到订单确认页
- **验收标准**: 点击后跳转到订单确认页
- **依赖**: T033
- **估时**: 1h

### T035: CartDrawer - 滑入动画
- **描述**: 实现抽屉从底部滑入动画
- **交付**:
  - 使用 `animate-slide-up` 类（350ms）
  - 贝塞尔曲线: `cubic-bezier(0.16, 1, 0.3, 1)`
  - 遮罩层淡入动画
- **验收标准**:
  - 动画流畅度 60 FPS
  - 动画时长精确 350ms
- **依赖**: T007, T026
- **估时**: 1.5h

### T036: CartDrawer - 关闭动画
- **描述**: 实现抽屉关闭时的滑出动画
- **交付**:
  - 抽屉滑出动画（350ms）
  - 遮罩层淡出动画
  - 动画结束后移除 DOM
- **验收标准**: 关闭动画与打开动画一致
- **依赖**: T035
- **估时**: 1h

### T037: CartDrawer - 遮罩层点击关闭
- **描述**: 点击遮罩层关闭购物车抽屉
- **交付**:
  - 遮罩层 `onClick` 调用 `cartStore.toggleCartDrawer()`
  - 阻止事件冒泡到抽屉内容区域
- **验收标准**: 点击遮罩层关闭，点击抽屉内容不关闭
- **依赖**: T027
- **估时**: 0.5h

### T038: CartDrawer - 阻止底层滚动穿透
- **描述**: 抽屉打开时阻止底层页面滚动
- **交付**:
  - 使用 CSS `overflow: hidden` 或事件拦截
  - Taro 兼容性处理
- **验收标准**:
  - 抽屉打开时底层页面不可滚动
  - 抽屉关闭后恢复滚动
- **依赖**: T027
- **估时**: 1h

### T039: US3 - 单元测试
- **描述**: 为 CartDrawer 编写单元测试
- **交付**:
  - 测试条件渲染
  - 测试商品列表渲染
  - 测试数量调整
  - 测试关闭逻辑
- **验收标准**: 测试覆盖率 ≥ 70%
- **依赖**: T038
- **估时**: 2h

### T040: US3 - 集成测试
- **描述**: 测试购物车抽屉完整流程
- **交付**:
  - 手动测试清单: 打开抽屉、调整数量、删除商品、结算
  - 验证动画流畅度
  - 验证金额计算准确性
- **验收标准**: 符合 US3 的 6 个 Acceptance Scenarios
- **依赖**: T039
- **估时**: 1h

---

## 阶段 6: US4 - 状态持久化 (Phase 6: US4)

### T041: 实现购物车数据保存逻辑
- **描述**: 在 cartStore 变更时自动调用 saveCart
- **交付**:
  - 监听 `cart` 状态变化
  - 调用 `saveCart({ items: cart.items, timestamp: Date.now() })`
- **验收标准**:
  - 每次购物车变更自动保存
  - 包含 timestamp 字段
- **依赖**: T004, T006
- **估时**: 1h

### T042: 实现购物车数据恢复逻辑
- **描述**: 应用启动时从本地存储恢复购物车
- **交付**:
  - 在 cartStore 初始化时调用 `loadCart()`
  - 检查 timestamp 是否超过 7 天
  - 超过 7 天自动清空
- **验收标准**:
  - 应用重启后购物车数据保留
  - 超过 7 天自动清空
- **依赖**: T041
- **估时**: 1.5h

### T043: 实现商品有效性验证
- **描述**: 恢复购物车时验证商品是否仍然有效
- **交付**:
  - 调用商品 API 验证商品 ID 是否存在
  - 移除无效商品
  - 提示用户无效商品已移除
- **验收标准**:
  - 无效商品自动移除
  - 仅保留有效商品
- **依赖**: T042
- **估时**: 2h

### T044: 实现存储异常降级方案
- **描述**: 处理本地存储失败的情况
- **交付**:
  - 捕获 `Taro.setStorageSync` 异常
  - 降级为仅使用内存存储
  - 显示警告提示用户
- **验收标准**:
  - 存储失败不影响购物车功能
  - 用户收到警告提示
- **依赖**: T041
- **估时**: 1h

### T045: US4 - 单元测试
- **描述**: 为持久化逻辑编写单元测试
- **交付**:
  - 测试 saveCart 调用
  - 测试 loadCart 恢复
  - 测试 7 天过期逻辑
  - 测试商品有效性验证
- **验收标准**: 测试覆盖率 ≥ 80%
- **依赖**: T044
- **估时**: 2h

### T046: US4 - 集成测试（7 天过期）
- **描述**: 测试购物车 7 天过期逻辑
- **交付**:
  - 手动修改 timestamp 为 8 天前
  - 重新打开小程序
  - 验证购物车自动清空
- **验收标准**: 符合 US4 的 4 个 Acceptance Scenarios
- **依赖**: T045
- **估时**: 0.5h

### T047: US4 - 集成测试（商品失效）
- **描述**: 测试商品下架后的处理
- **交付**:
  - Mock 商品 API 返回 404
  - 验证商品从购物车移除
  - 验证提示显示
- **验收标准**: 无效商品正确移除
- **依赖**: T046
- **估时**: 1h

### T048: US4 - 性能优化
- **描述**: 优化持久化性能
- **交付**:
  - 使用防抖减少 saveCart 调用频率
  - 异步验证商品有效性
- **验收标准**: 持久化操作响应时间 < 50ms
- **依赖**: T047
- **估时**: 1h

### T049: US4 - 用户提示优化
- **描述**: 优化用户提示体验
- **交付**:
  - 商品失效提示: "部分商品已下架，已从购物车移除"
  - 购物车过期提示: "购物车已过期，已自动清空"
  - 使用 Taro.showToast 显示
- **验收标准**: 提示文案清晰，显示时机正确
- **依赖**: T048
- **估时**: 0.5h

---

## 阶段 7: US5 - 角标同步 (Phase 7: US5)

### T050: 实现角标实时更新
- **描述**: 确保浮动按钮角标实时同步
- **交付**:
  - 使用 `useCartStore` 订阅 `totalItems`
  - 每次购物车变更自动更新角标
- **验收标准**:
  - 添加/删除商品后角标立即更新
  - 更新延迟 < 100ms
- **依赖**: T006, T021
- **估时**: 0.5h

### T051: US5 - 单元测试
- **描述**: 测试角标同步逻辑
- **交付**:
  - 测试角标数字计算
  - 测试 "99+" 显示
  - 测试购物车为空时隐藏
- **验收标准**: 测试覆盖率 ≥ 80%
- **依赖**: T050
- **估时**: 1h

### T052: US5 - 集成测试
- **描述**: 测试角标完整流程
- **交付**:
  - 手动测试清单: 添加商品、删除商品、超过 99 件
  - 验证角标实时更新
- **验收标准**: 符合 US5 的 4 个 Acceptance Scenarios
- **依赖**: T051
- **估时**: 0.5h

---

## 阶段 8: US6 - 会员中心入口 (Phase 8: US6)

### T053: 创建会员中心购物车卡片
- **描述**: 在会员中心页面添加购物车卡片
- **交付**:
  - 卡片布局: 购物袋图标 + "购物车"文字 + 商品件数
  - 右上角红色圆形角标
  - 点击打开购物车抽屉
- **验收标准**: 卡片样式符合设计
- **依赖**: T006
- **估时**: 2h

### T054: 会员中心卡片 - 角标实现
- **描述**: 实现卡片右上角红色角标
- **交付**:
  - 样式: `bg-red-500`, `rounded-full`, `absolute`, `top-0`, `right-0`
  - 内容: `totalItems > 0 ? totalItems : null`（为空时不显示）
- **验收标准**:
  - 有商品时显示角标
  - 无商品时不显示角标
- **依赖**: T053
- **估时**: 1h

### T055: 会员中心卡片 - 商品件数显示
- **描述**: 卡片显示商品总件数或"空空如也"
- **交付**:
  - 条件: `totalItems > 0 ? `${totalItems}件商品` : '空空如也'`
- **验收标准**: 文案显示正确
- **依赖**: T054
- **估时**: 0.5h

### T056: US6 - 单元测试
- **描述**: 测试会员中心购物车卡片
- **交付**:
  - 测试条件渲染
  - 测试角标显示
  - 测试点击事件
- **验收标准**: 测试覆盖率 ≥ 70%
- **依赖**: T055
- **估时**: 1h

### T057: US6 - 集成测试
- **描述**: 测试会员中心购物车入口
- **交付**:
  - 手动测试清单: 查看卡片、点击卡片、验证角标
  - 验证购物车抽屉打开
- **验收标准**: 符合 US6 的 3 个 Acceptance Scenarios
- **依赖**: T056
- **估时**: 0.5h

---

## 阶段 9: 优化与完善 (Phase 9: Polish)

### T058: 性能优化 - 组件 memo 化
- **描述**: 优化组件渲染性能
- **交付**:
  - 使用 `React.memo` 优化 ProductCard, QuantityController, CartDrawer
  - 使用 `useMemo` 缓存计算值
  - 使用 `useCallback` 缓存回调函数
- **验收标准**:
  - 列表滚动流畅度 ≥ 50 FPS
  - 减少不必要的重渲染
- **依赖**: T040, T052, T057
- **估时**: 2h

### T059: 性能优化 - 懒加载
- **描述**: 实现购物车抽屉懒加载
- **交付**:
  - 使用 `React.lazy` 懒加载 CartDrawer
  - 首次打开时加载组件
- **验收标准**: 减少初始包体积
- **依赖**: T058
- **估时**: 1h

### T060: 边界情况处理
- **描述**: 处理各种边界情况
- **交付**:
  - 商品价格为 0 时显示 "¥0"
  - 购物车总金额超大时使用精度控制
  - 浮动按钮与底部导航重叠时 z-index 控制
- **验收标准**: 所有边界情况正确处理
- **依赖**: T059
- **估时**: 1.5h

### T061: 无障碍优化
- **描述**: 添加无障碍属性
- **交付**:
  - 按钮添加 `aria-label`
  - 数量控制器添加 `role="spinbutton"`
  - 购物车抽屉添加 `role="dialog"`
- **验收标准**: 通过无障碍检查工具验证
- **依赖**: T060
- **估时**: 1h

### T062: 完整功能测试
- **描述**: 执行完整的功能回归测试
- **交付**:
  - 测试所有 User Stories（US1-US6）
  - 测试所有 Edge Cases
  - 生成测试报告
- **验收标准**:
  - 所有 Acceptance Scenarios 通过
  - 无阻塞性 Bug
- **依赖**: T061
- **估时**: 2h

### T063: 文档更新
- **描述**: 更新项目文档
- **交付**:
  - 更新 README.md（使用说明）
  - 更新 CHANGELOG.md（变更记录）
  - 更新 API 文档（如有）
- **验收标准**: 文档清晰完整
- **依赖**: T062
- **估时**: 1h

---

## 任务统计

| 阶段 | 任务数 | 估时（小时） |
|------|-------|-------------|
| Phase 1: 准备工作 | 2 | 1 |
| Phase 2: 基础设施 | 5 | 7.5 |
| Phase 3: US1 添加到购物车 | 11 | 15.5 |
| Phase 4: US2 浮动购物车按钮 | 7 | 8.5 |
| Phase 5: US3 购物车抽屉 | 15 | 18.5 |
| Phase 6: US4 状态持久化 | 9 | 11 |
| Phase 7: US5 角标同步 | 3 | 2 |
| Phase 8: US6 会员中心入口 | 5 | 5 |
| Phase 9: 优化与完善 | 6 | 8.5 |
| **总计** | **63** | **77** |

---

## 依赖关系图

```
Phase 1 (T001-T002) → Phase 2 (T003-T007)
                    ↓
Phase 3 (T008-T018) → Phase 4 (T019-T025)
                    ↓
Phase 5 (T026-T040) → Phase 6 (T041-T049)
                    ↓
Phase 7 (T050-T052) → Phase 8 (T053-T057)
                    ↓
                Phase 9 (T058-T063)
```

---

## 关键里程碑

1. **Milestone 1**: 基础设施完成（T007 完成）
   - 类型定义、存储工具、cartStore、动画样式
   - 时间: 第 2 天

2. **Milestone 2**: US1-US2 核心功能完成（T025 完成）
   - 添加到购物车、浮动按钮
   - 时间: 第 5 天

3. **Milestone 3**: US3 购物车抽屉完成（T040 完成）
   - 购物车抽屉、商品列表、结算区域
   - 时间: 第 8 天

4. **Milestone 4**: 全功能完成（T063 完成）
   - 所有 User Stories 实现
   - 时间: 第 10 天

---

## 验收标准

### 功能验收
- [ ] 所有 User Stories（US1-US6）的 Acceptance Scenarios 通过
- [ ] 所有 Edge Cases 处理正确
- [ ] 单元测试覆盖率 ≥ 70%

### 性能验收
- [ ] 购物车操作响应时间 < 500ms（SC-001）
- [ ] 抽屉动画流畅度 60 FPS（SC-002）
- [ ] 角标更新延迟 < 100ms（SC-003）
- [ ] 购物车数据恢复 100% 成功（SC-004）
- [ ] 总金额计算准确率 100%（SC-005）

### 用户体验验收
- [ ] UI 与原型一致（像素级对比）
- [ ] 动画流畅自然
- [ ] 提示文案清晰友好
- [ ] 边界情况有合理提示

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Taro 平台兼容性问题 | 中 | 高 | 在微信小程序和 H5 两端同步测试 |
| 本地存储空间不足 | 低 | 中 | 实现降级方案（T044） |
| 动画性能不佳 | 低 | 中 | 使用 CSS 动画而非 JS 动画 |
| 商品数据结构变更 | 中 | 中 | 定义清晰的 TypeScript 接口 |

---

## 相关文档

- **规格文档**: `specs/O010-shopping-cart/spec.md`
- **数据模型**: `specs/O010-shopping-cart/data-model.md`
- **快速上手**: `specs/O010-shopping-cart/quickstart.md`
- **UI 原型**: `/Users/lining/qoder/ui_demo/Cinema_Bussiness_Cente_UI_DEMO/wechat-multi-entertainment-ordering`

---

**文档版本**: 1.0.0
**最后更新**: 2026-01-06
**维护者**: Claude Code
