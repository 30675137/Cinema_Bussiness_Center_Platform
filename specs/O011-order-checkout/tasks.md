# Tasks: 小程序订单确认与支付

**Feature**: O011-order-checkout
**Branch**: `O011-order-checkout`
**Date**: 2026-01-06
**Status**: Ready for Implementation

## Task Summary

| Phase | Task Count | Priority | Description |
|-------|------------|----------|-------------|
| Phase 1: Setup | 4 | P0 | 路由注册、类型定义、基础配置 |
| Phase 2: Core Services | 4 | P0 | 订单服务核心函数 |
| Phase 3: US1 订单确认页 | 6 | P1 | 购物车到订单确认页跳转 |
| Phase 4: US2 备注输入 | 2 | P2 | 订单备注功能 |
| Phase 5: US3 Mock支付 | 5 | P1 | 支付方式选择与Mock流程 |
| Phase 6: US4 支付成功页 | 5 | P1 | 支付成功页与取餐编号 |
| Phase 7: US5 数据持久化 | 3 | P2 | 订单存储与购物车清空 |
| Phase 8: Polish | 3 | P3 | 样式优化、边界处理、测试 |
| **Total** | **32** | - | - |

---

## Phase 1: Setup (P0)

基础配置和类型定义，所有后续开发的前置条件。

- [ ] [T001] [P0] 更新 `app.config.ts` 注册新页面路由 (`miniapp-ordering-taro/src/app.config.ts`)
  - 添加 `pages/order-confirm/index`
  - 添加 `pages/order-success/index`

- [ ] [T002] [P0] 创建订单类型定义文件 (`miniapp-ordering-taro/src/types/order.ts`)
  - 定义 `OrderStatus` 枚举
  - 定义 `PaymentMethod` 类型
  - 定义 `OrderItem` 接口
  - 定义 `CinemaOrder` 接口（含 pickupNumber, remark 扩展）
  - 定义 `PickupNumberCounter` 接口
  - 定义 `PaymentOption` 接口和 `PAYMENT_OPTIONS` 常量

- [ ] [T003] [P0] 创建订单确认页目录和配置 (`miniapp-ordering-taro/src/pages/order-confirm/`)
  - 创建 `index.tsx` 空组件骨架
  - 创建 `index.less` 空样式文件
  - 创建 `index.config.ts` 页面配置（navigationBarTitleText: '确认订单'）

- [ ] [T004] [P0] 创建支付成功页目录和配置 (`miniapp-ordering-taro/src/pages/order-success/`)
  - 创建 `index.tsx` 空组件骨架
  - 创建 `index.less` 空样式文件
  - 创建 `index.config.ts` 页面配置（navigationBarTitleText: '支付成功'）

**验证**: 运行 `npm run dev:h5`，访问 `/pages/order-confirm/index` 和 `/pages/order-success/index` 页面无报错。

---

## Phase 2: Core Services (P0)

订单服务核心函数，支撑所有 User Story。

- [ ] [T005] [P0] 创建订单服务文件 (`miniapp-ordering-taro/src/services/orderService.ts`)
  - 添加 `@spec O011-order-checkout` 标识
  - 导入 Taro 和类型定义

- [ ] [T006] [P0] 实现 `generateUUID()` 函数 (`miniapp-ordering-taro/src/services/orderService.ts`)
  - UUID v4 格式生成

- [ ] [T007] [P0] 实现 `generateOrderNumber()` 函数 (`miniapp-ordering-taro/src/services/orderService.ts`)
  - 格式：ORD + YYYYMMDD + 6位随机字符
  - 示例：ORD20260106AB12CD

- [ ] [T008] [P0] 实现 `generatePickupNumber()` 函数 (`miniapp-ordering-taro/src/services/orderService.ts`)
  - 格式：字母 + 3位数字（A001-Z999）
  - 使用 `Taro.getStorageSync('pickupNumberCounter')` 管理计数器
  - 每日重置逻辑
  - 字母循环使用 A-Z

**验证**: 单元测试通过，`generateOrderNumber()` 返回正确格式，`generatePickupNumber()` 自增正确。

---

## Phase 3: US1 订单确认页 (P1)

**User Story**: 从购物车跳转到订单确认页

- [ ] [T009] [P1] [US1] 更新购物车抽屉"立即支付"按钮跳转逻辑 (`miniapp-ordering-taro/src/components/CartDrawer/index.tsx`)
  - 添加空购物车检查（cartTotal === 0 时显示 Toast 阻止跳转）
  - 使用 `Taro.navigateTo({ url: '/pages/order-confirm/index' })` 跳转
  - 跳转前关闭购物车抽屉

- [ ] [T010] [P1] [US1] 实现订单确认页布局结构 (`miniapp-ordering-taro/src/pages/order-confirm/index.tsx`)
  - 顶部导航栏（使用页面配置）
  - 商品列表区域容器
  - 备注输入区域容器
  - 金额汇总区域容器
  - 底部"确认支付"按钮（固定底部）

- [ ] [T011] [P1] [US1] 实现商品列表只读展示 (`miniapp-ordering-taro/src/pages/order-confirm/index.tsx`)
  - 从 `useCartStore` 读取 `cart.items`
  - 每项显示：商品图片、名称、规格选项、单价、数量
  - 无数量调整控件（只读）

- [ ] [T012] [P1] [US1] 实现金额汇总展示 (`miniapp-ordering-taro/src/pages/order-confirm/index.tsx`)
  - 显示"商品小计"（使用 `cartStore.subtotal()`）
  - 显示"优惠金额"（当前固定为 ¥0.00）
  - 显示"实付金额"（大号橙色字体，使用 `cartStore.cartTotal()`）

- [ ] [T013] [P1] [US1] 实现订单确认页基础样式 (`miniapp-ordering-taro/src/pages/order-confirm/index.less`)
  - 页面容器（padding-bottom 为底部按钮预留空间）
  - 商品列表卡片样式
  - 金额行样式
  - 底部固定按钮样式

- [ ] [T014] [P1] [US1] 实现"确认支付"按钮 (`miniapp-ordering-taro/src/pages/order-confirm/index.tsx`)
  - 按钮文案显示"确认支付 ¥XX.XX"
  - 点击触发支付流程（Phase 5 实现具体逻辑）

**验证**: 在购物车添加商品后点击"立即支付"，成功跳转到订单确认页，商品列表和金额正确显示。

---

## Phase 4: US2 备注输入 (P2)

**User Story**: 填写订单备注

- [ ] [T015] [P2] [US2] 实现备注输入组件 (`miniapp-ordering-taro/src/pages/order-confirm/index.tsx`)
  - 标签："订单备注"
  - Textarea 组件（placeholder: "请输入特殊要求（选填）"）
  - maxLength 设置为 100
  - 右下角字数统计（如 "15/100"）
  - 使用 useState 管理备注内容

- [ ] [T016] [P2] [US2] 实现备注区域样式 (`miniapp-ordering-taro/src/pages/order-confirm/index.less`)
  - 备注区域卡片样式
  - Textarea 样式
  - 字数统计样式

**验证**: 输入备注，字数统计实时更新，超过 100 字无法继续输入。

---

## Phase 5: US3 Mock 支付 (P1)

**User Story**: Mock 支付流程

- [ ] [T017] [P1] [US3] 创建 PaymentSheet 组件目录 (`miniapp-ordering-taro/src/components/PaymentSheet/`)
  - 创建 `index.tsx`
  - 创建 `index.less`

- [ ] [T018] [P1] [US3] 实现 PaymentSheet 组件 (`miniapp-ordering-taro/src/components/PaymentSheet/index.tsx`)
  - Props: `visible`, `onClose`, `onSelect(method: PaymentMethod)`
  - 底部弹出抽屉布局
  - 半透明遮罩层（点击关闭）
  - 支付方式列表（微信支付、支付宝、Apple Pay）
  - 每项显示图标 + 名称
  - "取消"按钮

- [ ] [T019] [P1] [US3] 实现 PaymentSheet 样式 (`miniapp-ordering-taro/src/components/PaymentSheet/index.less`)
  - 遮罩层样式
  - 抽屉滑出动画
  - 支付方式列表样式
  - 支付图标样式

- [ ] [T020] [P1] [US3] 实现支付加载动画状态 (`miniapp-ordering-taro/src/pages/order-confirm/index.tsx`)
  - 新增 `isPaymentLoading` 状态
  - 显示全屏加载遮罩
  - "支付中..." 文字 + 旋转加载图标
  - CSS animation 实现旋转效果

- [ ] [T021] [P1] [US3] 实现 Mock 支付流程逻辑 (`miniapp-ordering-taro/src/pages/order-confirm/index.tsx`)
  - "确认支付"按钮点击显示 PaymentSheet
  - 选择支付方式后关闭 PaymentSheet，显示加载动画
  - `setTimeout` 1.5 秒后执行：
    - 调用 `createOrder()` 生成订单
    - 调用 `saveOrder()` 保存订单
    - 使用 `Taro.redirectTo()` 跳转到支付成功页
    - 传递订单号和取餐编号参数

**验证**: 点击"确认支付"弹出支付方式抽屉，选择后显示加载动画，1.5 秒后跳转到成功页。

---

## Phase 6: US4 支付成功页 (P1)

**User Story**: 支付成功页面与取餐编号

- [ ] [T022] [P1] [US4] 实现支付成功页布局 (`miniapp-ordering-taro/src/pages/order-success/index.tsx`)
  - 从 URL 参数读取订单号、取餐编号、支付金额
  - 成功图标区域
  - "支付成功"标题
  - 订单信息区域
  - 取餐信息区域（醒目显示）
  - 底部按钮区域

- [ ] [T023] [P1] [US4] 实现成功图标和动画 (`miniapp-ordering-taro/src/pages/order-success/index.tsx`)
  - 绿色圆形背景 + 白色勾选图标
  - 勾选图标绘制动画（CSS animation）

- [ ] [T024] [P1] [US4] 实现取餐编号醒目展示 (`miniapp-ordering-taro/src/pages/order-success/index.tsx`)
  - 大号橙色数字显示取餐编号
  - 提示文字："请凭取餐编号到柜台取餐"
  - 预计等待时间："预计 10-15 分钟"

- [ ] [T025] [P1] [US4] 实现底部按钮功能 (`miniapp-ordering-taro/src/pages/order-success/index.tsx`)
  - "查看订单"按钮（点击显示 Toast："订单详情页开发中"）
  - "返回首页"按钮（点击执行 Phase 7 逻辑）

- [ ] [T026] [P1] [US4] 实现支付成功页样式 (`miniapp-ordering-taro/src/pages/order-success/index.less`)
  - 居中布局
  - 成功图标样式
  - 取餐编号大号字体样式
  - 按钮样式

**验证**: 支付成功后跳转到成功页，显示订单号、取餐编号，点击"返回首页"跳转正确。

---

## Phase 7: US5 数据持久化 (P2)

**User Story**: 订单数据生成与本地持久化

- [ ] [T027] [P2] [US5] 实现 `convertCartToOrderItems()` 函数 (`miniapp-ordering-taro/src/services/orderService.ts`)
  - 将 CartItem[] 转换为 OrderItem[]
  - 映射：productId, productName, productSpec, productImage, quantity, unitPrice, subtotal
  - selectedOptions 格式化为 productSpec 字符串

- [ ] [T028] [P2] [US5] 实现 `createOrder()` 函数 (`miniapp-ordering-taro/src/services/orderService.ts`)
  - 参数：cartItems, totalAmount, paymentMethod, remark
  - 生成 CinemaOrder 对象
  - 调用 generateOrderNumber(), generatePickupNumber()
  - 设置 status 为 PAID
  - 设置 paymentTime 为当前时间

- [ ] [T029] [P2] [US5] 实现 `saveOrder()` 和 `getOrders()` 函数 (`miniapp-ordering-taro/src/services/orderService.ts`)
  - `saveOrder(order)`: 读取现有订单数组，将新订单添加到头部，保存到 `Taro.setStorageSync('orders')`
  - `getOrders()`: 从本地存储读取订单数组

**验证**: 完成支付后检查本地存储，订单数据正确保存，包含所有字段。

---

## Phase 8: Polish (P3)

样式优化、边界处理、测试。

- [ ] [T030] [P3] 实现"返回首页"完整逻辑 (`miniapp-ordering-taro/src/pages/order-success/index.tsx`)
  - 调用 `cartStore.clearCart()` 清空购物车
  - 使用 `Taro.reLaunch({ url: '/pages/menu/index' })` 跳转首页

- [ ] [T031] [P3] 添加边界处理和错误提示
  - 购物车为空时阻止跳转并显示 Toast
  - 本地存储失败时显示警告（不阻断流程）
  - 支付过程中禁用按钮防止重复点击

- [ ] [T032] [P3] 编写单元测试 (`miniapp-ordering-taro/__tests__/services/orderService.test.ts`)
  - 测试 `generateOrderNumber()` 格式正确
  - 测试 `generatePickupNumber()` 自增和日期重置
  - 测试 `createOrder()` 返回完整订单对象
  - 测试 `convertCartToOrderItems()` 转换正确

**验证**: 所有单元测试通过，边界情况处理正确。

---

## Dependencies

```
Phase 1 (Setup) ─┬─▶ Phase 2 (Core Services) ─┬─▶ Phase 3 (US1)
                 │                              │
                 │                              ├─▶ Phase 4 (US2)
                 │                              │
                 │                              └─▶ Phase 5 (US3) ─▶ Phase 6 (US4)
                 │                                       │
                 └─────────────────────────────────────▶ Phase 7 (US5)
                                                         │
                                                         ▼
                                                   Phase 8 (Polish)
```

**关键依赖**:
- T001 (路由配置) 必须在所有页面开发前完成
- T002 (类型定义) 必须在 T005-T008 (服务函数) 前完成
- T005-T008 (核心服务) 必须在 T021 (支付逻辑) 和 T027-T029 (持久化) 前完成
- T021 (支付流程) 必须在 T022-T026 (成功页) 前完成

---

## Parallel Execution Examples

### Phase 1 内部并行

```bash
# 可同时执行
T001 (路由配置)
T002 (类型定义)
T003 (订单确认页目录)
T004 (支付成功页目录)
```

### Phase 3-4 并行

```bash
# US1 和 US2 可并行开发
Phase 3 (US1 订单确认页主体) || Phase 4 (US2 备注输入)
```

### Phase 5-7 部分并行

```bash
# 服务函数可并行
T027 (convertCartToOrderItems) || T028 (createOrder) || T029 (saveOrder)

# 页面开发依赖支付流程完成
T021 (Mock支付逻辑) → T022-T026 (成功页)
```

---

## Implementation Strategy

### 推荐开发顺序

1. **Day 1: 基础搭建**
   - Phase 1 全部任务（路由、类型、目录）
   - Phase 2 核心服务函数

2. **Day 2: 订单确认页**
   - Phase 3 订单确认页主体
   - Phase 4 备注输入
   - Phase 5 PaymentSheet 组件

3. **Day 3: 支付流程**
   - Phase 5 支付逻辑
   - Phase 6 支付成功页
   - Phase 7 数据持久化

4. **Day 4: 收尾**
   - Phase 8 边界处理和测试
   - 样式微调
   - 手动测试完整流程

### 测试检查清单

- [ ] 购物车添加商品 → 点击"立即支付" → 跳转订单确认页
- [ ] 订单确认页显示商品列表、金额、备注输入
- [ ] 备注输入 100 字限制生效
- [ ] 点击"确认支付" → 支付方式抽屉弹出
- [ ] 选择支付方式 → 加载动画 → 1.5s 后跳转成功页
- [ ] 成功页显示订单号、取餐编号（格式正确）
- [ ] 点击"返回首页" → 购物车清空 → 跳转菜单页
- [ ] 检查本地存储订单数据完整

---

## Files to Create/Modify

### New Files (12)

| File | Phase | Description |
|------|-------|-------------|
| `src/types/order.ts` | 1 | 订单类型定义 |
| `src/pages/order-confirm/index.tsx` | 1 | 订单确认页组件 |
| `src/pages/order-confirm/index.less` | 1 | 订单确认页样式 |
| `src/pages/order-confirm/index.config.ts` | 1 | 订单确认页配置 |
| `src/pages/order-success/index.tsx` | 1 | 支付成功页组件 |
| `src/pages/order-success/index.less` | 1 | 支付成功页样式 |
| `src/pages/order-success/index.config.ts` | 1 | 支付成功页配置 |
| `src/components/PaymentSheet/index.tsx` | 5 | 支付方式选择抽屉 |
| `src/components/PaymentSheet/index.less` | 5 | 支付方式抽屉样式 |
| `src/services/orderService.ts` | 2 | 订单服务 |
| `__tests__/services/orderService.test.ts` | 8 | 订单服务单元测试 |

### Modified Files (2)

| File | Phase | Changes |
|------|-------|---------|
| `src/app.config.ts` | 1 | 添加新页面路由 |
| `src/components/CartDrawer/index.tsx` | 3 | 添加"立即支付"跳转逻辑 |

---

## Related Documents

- [spec.md](./spec.md) - 功能规格
- [plan.md](./plan.md) - 实施计划
- [research.md](./research.md) - 研究决策
- [data-model.md](./data-model.md) - 数据模型
- [quickstart.md](./quickstart.md) - 快速开始指南
