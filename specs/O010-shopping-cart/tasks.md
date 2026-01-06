# 开发任务清单: 小程序购物车功能

**功能**: O010-shopping-cart
**分支**: `O010-shopping-cart`
**创建时间**: 2026-01-06
**规格文档**: [spec.md](./spec.md)
**实施计划**: [plan.md](./plan.md)

---

## 任务组织

任务按**用户故事**组织,以实现独立开发和测试。每个阶段对应规格文档中的一个用户故事,按优先级顺序排列 (P1 → P2 → P3)。

**总任务数**: 63
**可并行任务数**: 25 (标记为 [P])

---

## 实施策略

### MVP 范围 (最小可行产品)

**推荐 MVP**: 仅用户故事 1 (任务 T001-T018)
- **目标**: 用户可以添加商品到购物车并查看数量控制器
- **原因**: 购物车核心入口,可独立测试
- **包含内容**: 类型定义、CartStore、QuantityController、ProductCard 集成

### 增量交付计划

1. **Sprint 1 (MVP)**: US1 - 添加到购物车 + 数量控制器 (P1) → 18 tasks
2. **Sprint 2**: US2 + US3 - 浮动按钮 + 抽屉 (P1) → 22 tasks
3. **Sprint 3**: US4 - 持久化 (P2) → 9 tasks
4. **Sprint 4**: US5 + US6 - 角标同步 + 会员中心入口 (P3) → 8 tasks
5. **Sprint 5**: 优化与完善 → 6 tasks

---

## 依赖关系与执行顺序

### 用户故事完成顺序

```
阶段 1 (准备工作)
  ↓
阶段 2 (基础设施)
  ↓
阶段 3 (US1: P1) ← 独立开发,完成阶段2后即可开始
  ↓
阶段 4 (US2: P1) ← 依赖 US1 (需要购物车状态)
  ↓
阶段 5 (US3: P1) ← 依赖 US2 (需要浮动按钮触发)
  ↓
阶段 6 (US4: P2) ← 依赖 US1-3 (需要完整购物车功能)
  ↓
阶段 7 (US5: P3) ← 依赖 US2 (增强浮动按钮角标)
  ↓
阶段 8 (US6: P3) ← 依赖 US3 (使用购物车抽屉组件)
  ↓
阶段 9 (优化) ← 依赖所有用户故事
```

### 并行执行机会

**阶段 3 (US1) 内部**:
- T003, T004, T005, T006 可并行执行 (不同文件)
- T008, T009 可在 T007 完成后并行执行

**阶段 4 (US2) 内部**:
- T019, T020 可并行执行

**阶段 5 (US3) 内部**:
- T026, T027, T028 可并行执行

**阶段 6 (US4) 内部**:
- T041, T042, T043 可并行执行

---

## 阶段 1: 准备工作

**目标**: 初始化项目结构和基础配置

**独立验收**: 项目编译无错误,所有依赖已安装

### 准备任务

- [ ] T001 验证 Taro 项目依赖 hall-reserve-taro/package.json (Taro 4.1.9, React 18.3.1, Zustand 4.5.5)
- [ ] T002 创建项目目录结构: hall-reserve-taro/src/types/, hall-reserve-taro/src/components/QuantityController/, hall-reserve-taro/src/components/FloatingCartButton/, hall-reserve-taro/src/components/CartDrawer/, hall-reserve-taro/src/stores/, hall-reserve-taro/src/assets/animations/

---

## 阶段 2: 基础设施任务

**目标**: 创建所有用户故事需要的共享类型和工具函数

**独立验收**: 类型编译无错误,工具函数通过单元测试

### 基础设施任务

- [ ] T003 [P] 创建 CartProduct 接口 hall-reserve-taro/src/types/cart.ts
- [ ] T004 [P] 创建 CartItem 接口 hall-reserve-taro/src/types/cart.ts
- [ ] T005 [P] 创建 Cart 接口 hall-reserve-taro/src/types/cart.ts
- [ ] T006 [P] 创建 CartState 接口 hall-reserve-taro/src/types/cart.ts
- [ ] T007 创建存储工具函数 (saveCart, loadCart, clearCart) hall-reserve-taro/src/utils/storage.ts

---

## 阶段 3: 用户故事 1 - 添加商品到购物车并显示数量控制器 (P1)

**故事目标**: 用户可以通过商品卡片的"+"按钮添加商品到购物车,查看数量控制器,调整数量。

**独立验收标准**:
- ✅ 点击任意商品卡片的"+"按钮 → 商品加入购物车
- ✅ 显示数量控制器 ("-"按钮 + 数字 + "+"按钮)
- ✅ 点击"+"增加数量,点击"-"减少数量
- ✅ 数量减至 0 → 数量控制器隐藏,"+"按钮重新显示
- ✅ 页面底部显示浮动购物车按钮,显示总件数和总金额
- ✅ 点击数量控制器按钮**不会**触发商品详情导航 (stopPropagation 生效)

### US1 任务

- [ ] T008 [P] [US1] 创建 Zustand cartStore 状态管理 hall-reserve-taro/src/stores/cartStore.ts
- [ ] T009 [P] [US1] 实现 cartStore actions (addToCart, updateQuantity, removeFromCart, clearCart) hall-reserve-taro/src/stores/cartStore.ts
- [ ] T010 [US1] 实现 cartStore selectors (totalItems, subtotal, cartTotal, getProductQuantity) hall-reserve-taro/src/stores/cartStore.ts
- [ ] T011 [US1] 集成 Taro.setStorageSync 到 cartStore actions 实现持久化 hall-reserve-taro/src/stores/cartStore.ts
- [ ] T012 [P] [US1] 创建 QuantityController 组件 (包含 +/- 按钮) hall-reserve-taro/src/components/QuantityController/index.tsx
- [ ] T013 [P] [US1] 添加 QuantityController 样式 (amber-500 用于"+", zinc-800 用于"-", 间距 8px) hall-reserve-taro/src/components/QuantityController/index.module.scss
- [ ] T014 [US1] 在 QuantityController 点击处理器中添加 stopPropagation() hall-reserve-taro/src/components/QuantityController/index.tsx
- [ ] T015 [US1] 修改 ProductCard 组件集成 QuantityController hall-reserve-taro/src/components/ProductCard/index.tsx
- [ ] T016 [US1] 添加条件渲染逻辑 (根据数量显示"+"按钮或 QuantityController) hall-reserve-taro/src/components/ProductCard/index.tsx
- [ ] T017 [US1] 连接 ProductCard 到 cartStore (getProductQuantity, addToCart, updateQuantity) hall-reserve-taro/src/components/ProductCard/index.tsx
- [ ] T018 [US1] 更新 ProductCard 样式以适配 QuantityController hall-reserve-taro/src/components/ProductCard/index.module.scss

---

## 阶段 4: 用户故事 2 - 页面底部浮动购物车按钮 (P1)

**故事目标**: 购物车有商品时,页面底部显示浮动购物车按钮,显示总件数和总金额。

**独立验收标准**:
- ✅ 购物车有商品 (总件数 > 0) → 底部显示浮动按钮 (距离底部导航 96px)
- ✅ 按钮显示角标 (商品件数)、"去结账"文字、总金额、右箭头图标
- ✅ 点击按钮触发缩放动画 (active:scale-0.98) 并打开购物车抽屉
- ✅ 购物车为空 → 浮动按钮隐藏
- ✅ H5 端: 悬停按钮触发 scale-1.02 动画

### US2 任务

- [ ] T019 [P] [US2] 创建 FloatingCartButton 组件结构 hall-reserve-taro/src/components/FloatingCartButton/index.tsx
- [ ] T020 [P] [US2] 添加 FloatingCartButton 样式 (固定定位, bottom-24, amber-500 背景, rounded-2xl) hall-reserve-taro/src/components/FloatingCartButton/index.module.scss
- [ ] T021 [US2] 连接 FloatingCartButton 到 cartStore (totalItems, cartTotal, toggleCartDrawer) hall-reserve-taro/src/components/FloatingCartButton/index.tsx
- [ ] T022 [US2] 实现角标显示 (zinc-950 背景, amber-500 文字, rounded-lg) hall-reserve-taro/src/components/FloatingCartButton/index.tsx
- [ ] T023 [US2] 添加价格格式化 (使用 formatPrice 工具函数) hall-reserve-taro/src/components/FloatingCartButton/index.tsx
- [ ] T024 [US2] 添加点击动画样式 (active:scale-0.98, hover:scale-1.02) hall-reserve-taro/src/components/FloatingCartButton/index.module.scss
- [ ] T025 [US2] 添加条件渲染 (购物车总金额为 0 时隐藏) hall-reserve-taro/src/components/FloatingCartButton/index.tsx

---

## 阶段 5: 用户故事 3 - 查看和管理购物车抽屉 (P1)

**故事目标**: 用户可以查看购物车抽屉,包含商品列表、调整数量、实时查看总金额计算。

**独立验收标准**:
- ✅ 点击浮动购物车按钮 → 抽屉从底部滑入 (350ms 动画, 高度 90vh)
- ✅ 抽屉后方显示黑色半透明模糊遮罩
- ✅ 抽屉显示 3 个区域: 标题栏 ("订单汇总" + 关闭按钮)、可滚动商品列表、固定结算区域
- ✅ 每个商品显示: 图片 (14x14)、名称、价格、数量控制器
- ✅ 调整数量 → 小计和总金额实时更新
- ✅ 数量减至 0 → 商品从列表移除
- ✅ 点击遮罩层或关闭按钮 → 抽屉关闭 (滑出动画)
- ✅ 商品列表可滚动,标题栏和结算区域固定

### US3 任务

- [ ] T026 [P] [US3] 创建购物车滑入动画 hall-reserve-taro/src/assets/animations/cart.scss
- [ ] T027 [P] [US3] 创建 CartDrawer 组件结构 (遮罩层, 蒙版, 抽屉) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T028 [P] [US3] 添加 CartDrawer 基础样式 (高度 90vh, 顶部圆角 rounded-t-3xl, z-index 70) hall-reserve-taro/src/components/CartDrawer/index.module.scss
- [ ] T029 [US3] 添加滑入动画样式 (350ms, cubic-bezier(0.16, 1, 0.3, 1)) hall-reserve-taro/src/components/CartDrawer/index.module.scss
- [ ] T030 [US3] 实现遮罩层样式 (bg-black/80, backdrop-blur-md) hall-reserve-taro/src/components/CartDrawer/index.module.scss
- [ ] T031 [US3] 创建 CartDrawer 标题栏 ("订单汇总" + 关闭按钮) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T032 [US3] 创建可滚动商品列表区域 (使用 ScrollView) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T033 [US3] 实现商品项布局 (图片 14x14, 名称, 价格, QuantityController) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T034 [US3] 创建固定结算区域 (小计、优惠、总金额、支付按钮) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T035 [US3] 连接 CartDrawer 到 cartStore (cart, isCartOpen, updateQuantity, subtotal, cartTotal) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T036 [US3] 添加实时总金额计算 (使用 useMemo) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T037 [US3] 实现抽屉关闭处理器 (遮罩层点击, 关闭按钮点击) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T038 [US3] 添加页面滚动阻止 (抽屉打开时 CSS overflow:hidden) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T039 [US3] 添加空购物车状态 ("空空如也"提示) hall-reserve-taro/src/components/CartDrawer/index.tsx
- [ ] T040 [US3] 将 CartDrawer 集成到菜单页面 hall-reserve-taro/src/pages/menu/index.tsx

---

## 阶段 6: 用户故事 4 - 购物车状态持久化 (P2)

**故事目标**: 购物车数据使用 Taro 本地存储跨应用会话持久化。

**独立验收标准**:
- ✅ 添加商品到购物车 → 关闭应用 → 重新打开应用 → 购物车数据保留 (商品、数量、总金额)
- ✅ 调整数量 → 切换到其他页面 → 返回 → 购物车状态不变
- ✅ 购物车包含无效商品 (如已下架) → 应用启动 → 无效商品自动移除
- ✅ 存储读写错误优雅处理 (回退到空购物车)

### US4 任务

- [ ] T041 [P] [US4] 实现 loadCart 数据验证 hall-reserve-taro/src/utils/storage.ts
- [ ] T042 [P] [US4] 添加购物车项验证过滤器 (检查 product.id, price, quantity > 0) hall-reserve-taro/src/utils/storage.ts
- [ ] T043 [P] [US4] 添加存储读取失败错误处理 hall-reserve-taro/src/utils/storage.ts
- [ ] T044 [US4] 应用启动时使用 loadCart() 初始化 cartStore hall-reserve-taro/src/stores/cartStore.ts
- [ ] T045 [US4] 添加边界情况数据验证测试 (空数组、无效项、损坏数据) hall-reserve-taro/src/utils/__tests__/storage.test.ts
- [ ] T046 [US4] 测试应用重启后购物车恢复 (手动测试清单)
- [ ] T047 [US4] 测试页面导航后购物车状态持久化 (手动测试清单)
- [ ] T048 [US4] 测试启动时无效商品移除 (手动测试清单)
- [ ] T049 [US4] 测试存储失败优雅降级 (手动测试清单)

---

## 阶段 7: 用户故事 5 - 购物车商品数量角标实时同步 (P3)

**故事目标**: 浮动购物车按钮角标随购物车商品变化实时更新。

**独立验收标准**:
- ✅ 购物车为空 → 添加第一个商品 → 角标显示"1"
- ✅ 购物车有 3 件商品 → 删除 1 件 → 角标显示"2"
- ✅ 删除所有商品 → 浮动按钮隐藏
- ✅ 总件数 > 99 → 角标显示"99+"

### US5 任务

- [ ] T050 [P] [US5] 在 FloatingCartButton 中添加 totalItems 计算逻辑 hall-reserve-taro/src/components/FloatingCartButton/index.tsx
- [ ] T051 [P] [US5] 添加角标溢出逻辑 (totalItems > 99 时显示"99+") hall-reserve-taro/src/components/FloatingCartButton/index.tsx
- [ ] T052 [US5] 测试添加/删除/调整操作时角标同步 (手动测试清单)

---

## 阶段 8: 用户故事 6 - 会员中心购物车入口 (P3)

**故事目标**: 会员中心页面显示购物车入口卡片,显示商品件数,点击打开抽屉。

**独立验收标准**:
- ✅ 购物车有商品 → 会员中心显示购物车卡片,红色角标 (商品件数) 和"N件商品"
- ✅ 购物车为空 → 会员中心显示购物车卡片无角标,显示"空空如也"
- ✅ 点击购物车卡片 → 购物车抽屉打开

### US6 任务

- [ ] T053 [P] [US6] 创建购物车入口卡片组件 hall-reserve-taro/src/pages/member/index.tsx
- [ ] T054 [P] [US6] 添加购物车卡片样式 (购物袋图标、角标、商品件数文字) hall-reserve-taro/src/pages/member/index.module.scss
- [ ] T055 [US6] 连接购物车卡片到 cartStore (totalItems, toggleCartDrawer) hall-reserve-taro/src/pages/member/index.tsx
- [ ] T056 [US6] 添加条件渲染 (角标 + "N件商品" vs "空空如也") hall-reserve-taro/src/pages/member/index.tsx
- [ ] T057 [US6] 测试购物车卡片显示和从会员中心打开抽屉

---

## 阶段 9: 优化与横切关注点

**目标**: 性能优化,处理边界情况,确保质量标准

**独立验收**: 所有验收场景通过,性能指标达标,无控制台错误

### 优化任务

- [ ] T058 [P] 添加防抖以防止快速点击"+"按钮 hall-reserve-taro/src/components/QuantityController/index.tsx
- [ ] T059 [P] 添加异步操作加载状态 (如适用) hall-reserve-taro/src/stores/cartStore.ts
- [ ] T060 [P] 验证 z-index 层级 (浮动按钮: 50, 抽屉: 70) hall-reserve-taro/src/components/FloatingCartButton/index.module.scss 和 hall-reserve-taro/src/components/CartDrawer/index.module.scss
- [ ] T061 添加 TypeScript 严格模式验证 (禁止 `any` 类型) 通过 npm run type-check
- [ ] T062 添加 ESLint 验证 通过 npm run lint
- [ ] T063 运行完整手动测试清单 (参考 quickstart.md) 并验证所有 6 个用户故事通过

---

## 测试执行总结

### 单元测试 (可选 - 默认不生成)

**说明**: 本功能遵循 TDD 原则,但单元测试任务**未包含**在此任务分解中。如果需要添加单元测试,请在每个阶段的实现任务前添加测试任务:
- `T0XX [P] [US1] 编写 cartStore 单元测试` (在 T008 之前)
- `T0XX [P] [US1] 编写 QuantityController 单元测试` (在 T012 之前)
- 等等

### 手动测试清单

所有手动测试记录在 `quickstart.md` 的"手动测试清单"章节。每个阶段完成后执行:
- 阶段 3 完成 → 测试 US1 场景
- 阶段 4 完成 → 测试 US2 场景
- 阶段 5 完成 → 测试 US3 场景
- 阶段 6 完成 → 测试 US4 场景
- 阶段 7 完成 → 测试 US5 场景
- 阶段 8 完成 → 测试 US6 场景
- 阶段 9 完成 → 完整回归测试

---

## 验收标准

功能完成的标志:

- [ ] 所有 63 个任务标记为完成
- [ ] 所有 6 个用户故事通过独立验收标准
- [ ] 手动测试清单 100% 通过率 (来自 quickstart.md)
- [ ] TypeScript 编译无错误 (npm run type-check)
- [ ] ESLint 通过 (npm run lint)
- [ ] 购物车在微信小程序和 H5 两端均正常工作
- [ ] 性能指标达标:
  - 添加到购物车响应 < 500ms
  - 抽屉动画 60 FPS (持续时间 350ms)
  - 角标更新 < 100ms
  - 启动时购物车数据恢复 < 50ms
- [ ] 所有代码文件包含 `@spec O010-shopping-cart` 注解

---

## 并行执行示例

### 示例 1: 阶段 3 (US1) 并行化

```bash
# 开发者 A
git checkout O010-shopping-cart
# 负责 T008, T009, T010, T011 (cartStore)

# 开发者 B (并行)
git checkout O010-shopping-cart-quantity-controller
# 负责 T012, T013, T014 (QuantityController 组件)

# 开发者 C (并行)
git checkout O010-shopping-cart-product-card
# 负责 T015, T016, T017, T018 (ProductCard 集成)

# 合并顺序: A → B → C (两个组件都需要 cartStore)
```

### 示例 2: 阶段 5 (US3) 并行化

```bash
# 开发者 A
# 负责 T026 (动画 CSS)

# 开发者 B (并行)
# 负责 T027, T028 (CartDrawer 结构 + 基础样式)

# 开发者 C (并行)
# 负责 T029, T030 (动画样式 + 遮罩层)

# 合并顺序: A → B → C (抽屉样式需要动画 CSS)
```

---

## 任务验证

✅ **格式检查**: 所有任务遵循必需格式:
- [x] 所有任务有复选框 (`- [ ]`)
- [x] 所有任务有任务 ID (T001-T063)
- [x] 可并行任务标记 [P]
- [x] 用户故事任务标记 [US1]-[US6]
- [x] 所有任务包含文件路径
- [x] 描述清晰且可执行

✅ **完整性检查**:
- [x] 每个用户故事包含所有必需任务 (类型、组件、集成、测试)
- [x] 每个用户故事可独立测试
- [x] 依赖关系明确记录
- [x] MVP 范围已定义 (仅 US1)

---

**生成工具**: Claude Code
**日期**: 2026-01-06
**分支**: O010-shopping-cart
**总任务数**: 63 (T001-T063)
**可并行任务**: 25 个任务标记 [P]
**预估 MVP**: 18 个任务 (仅 US1)
