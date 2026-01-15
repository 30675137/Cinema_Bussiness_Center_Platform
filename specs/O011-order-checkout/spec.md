# Feature Specification: 小程序订单确认与支付

**Feature Branch**: `O011-order-checkout`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "根据O010的spec，继续开发订单支付后续的UI 直到生成一笔完整的订单，其中支付环节用mock来实现，在miniapp-ordering-taro工程下"

**项目路径**: `miniapp-ordering-taro`
**依赖 Spec**: O010-shopping-cart (购物车功能)

## Clarifications

| 问题 | 用户回答 | 影响范围 |
|------|---------|---------|
| 取餐方式处理 | 不需要取餐方式选择（到店自取/送餐到座），需要给出**取餐编号** | US2移除，新增取餐编号生成逻辑，Order实体变更 |
| 数据模型复用 | 点单数据需要复用 B端订单管理的数据模型（`frontend/src/features/order-management/types/order.ts`） | Order实体结构对齐 ProductOrder，OrderItem 结构复用 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 从购物车跳转到订单确认页 (Priority: P1)

用户在购物车抽屉中点击"立即支付"按钮后，系统跳转到订单确认页面。订单确认页显示购物车中的商品列表（只读）、备注输入框，以及订单金额汇总（小计、优惠、实付金额）。用户可以在此页面最终确认订单信息，然后点击"确认支付"按钮发起支付。

**Why this priority**: 这是从购物车到支付的关键流程节点，没有订单确认页用户无法完成下单。必须优先实现，是整个支付流程的入口。

**Independent Test**: 可以独立测试 - 在购物车中添加商品后点击"立即支付"，验证是否正确跳转到订单确认页，页面是否正确显示购物车商品列表、金额汇总和支付按钮。

**Acceptance Scenarios**:

1. **Given** 购物车中有商品（至少1件）, **When** 用户在购物车抽屉中点击"立即支付"按钮, **Then** 系统使用 `Taro.navigateTo()` 跳转到订单确认页 `/pages/order-confirm/index`，购物车抽屉自动关闭
2. **Given** 用户进入订单确认页, **When** 页面加载完成, **Then** 页面显示顶部导航栏（返回按钮 + "确认订单"标题）、商品列表区域、备注输入框、金额汇总区域、底部"确认支付"按钮
3. **Given** 订单确认页已显示商品列表, **When** 用户查看商品列表, **Then** 每个商品显示商品图片（圆角）、商品名称、商品选项（如有）、单价、数量，列表为只读状态（不可调整数量）
4. **Given** 订单确认页显示金额汇总, **When** 用户查看金额区域, **Then** 显示小计金额（所有商品总价）、优惠金额（当前为0）、实付金额（大号橙色字体）
5. **Given** 购物车为空（0件商品）, **When** 用户尝试跳转到订单确认页, **Then** 系统显示"购物车为空"提示，阻止跳转

---

### User Story 2 - 填写订单备注 (Priority: P2)

用户可以在订单确认页输入订单备注（如"少冰"、"不要吸管"等特殊要求）。备注为可选项，不填写也可以提交订单。备注输入框有字数限制（最多100字）。

**Why this priority**: 备注功能是提升用户体验的辅助功能，不影响核心支付流程。

**Independent Test**: 可以独立测试 - 在订单确认页输入备注，验证输入框正常工作，字数限制生效。

**Acceptance Scenarios**:

1. **Given** 用户进入订单确认页, **When** 页面加载完成, **Then** 显示备注输入区域（标签"订单备注" + 输入框），输入框占位符显示"请输入特殊要求（选填）"
2. **Given** 备注输入框为空, **When** 用户输入备注内容, **Then** 输入内容实时显示，右下角显示已输入字数（如"15/100"）
3. **Given** 备注内容已达到100字, **When** 用户继续输入, **Then** 无法继续输入，字数显示"100/100"

---

### User Story 3 - Mock 支付流程 (Priority: P1)

用户点击"确认支付"按钮后，系统使用 Mock 方式模拟支付流程。显示支付方式选择弹窗（微信支付、支付宝、Apple Pay - 均为 Mock），用户选择后显示"支付中"加载动画，1.5秒后模拟支付成功，跳转到支付成功页面。

**Why this priority**: 支付功能是完成订单的必要步骤，没有支付无法生成订单。使用 Mock 实现可以在无后端的情况下完成完整流程演示。

**Independent Test**: 可以独立测试 - 在订单确认页点击"确认支付"，验证支付弹窗显示、选择支付方式、加载动画、跳转到成功页。

**Acceptance Scenarios**:

1. **Given** 用户在订单确认页查看金额, **When** 点击底部"确认支付 ¥XX"按钮, **Then** 从底部弹出支付方式选择抽屉（支付方式列表 + 取消按钮）
2. **Given** 支付方式抽屉已显示, **When** 用户选择"微信支付", **Then** 抽屉关闭，显示全屏加载遮罩（"支付中..."文字 + 加载动画）
3. **Given** 支付加载动画显示中, **When** 等待1.5秒（Mock延迟）, **Then** 加载动画消失，系统使用 `Taro.redirectTo()` 跳转到支付成功页 `/pages/order-success/index`
4. **Given** 支付方式抽屉已显示, **When** 用户点击"取消"或遮罩层, **Then** 支付抽屉关闭，返回订单确认页
5. **Given** 支付方式列表显示, **When** 用户查看列表, **Then** 显示三个支付方式（微信支付、支付宝、Apple Pay），每个选项显示图标和名称，当前均为 Mock 实现

---

### User Story 4 - 支付成功页面与取餐编号 (Priority: P1)

支付成功后用户进入支付成功页面。页面显示成功图标、"支付成功"文字、订单号、支付金额、**取餐编号**（醒目的大号数字）、预计等待时间。取餐编号用于用户到柜台取餐时报号。页面底部显示"查看订单"和"返回首页"两个按钮。

**Why this priority**: 支付成功页是订单流程的终点，给用户明确的成功反馈。取餐编号是用户取餐的唯一凭证，必须醒目显示。

**Independent Test**: 可以独立测试 - 直接访问支付成功页，验证页面布局、取餐编号显示、订单信息显示、按钮功能。

**Acceptance Scenarios**:

1. **Given** Mock 支付成功, **When** 跳转到支付成功页, **Then** 页面显示绿色圆形成功图标（勾选动画）、"支付成功"大标题、订单号（如"ORD20260106AB12CD"）、支付金额（如"¥128.00"）
2. **Given** 支付成功页已显示, **When** 用户查看取餐信息, **Then** 页面醒目显示取餐编号（大号橙色数字，如"A088"），并显示提示文字"请凭取餐编号到柜台取餐"、预计等待时间（如"预计10-15分钟"）
3. **Given** 支付成功页已显示, **When** 用户点击"查看订单"按钮, **Then** 系统显示"订单详情页开发中"提示（当前版本不跳转）
4. **Given** 支付成功页已显示, **When** 用户点击"返回首页"按钮, **Then** 系统使用 `Taro.reLaunch()` 返回菜单页 `/pages/menu/index`，同时清空购物车数据

---

### User Story 5 - 订单数据生成与本地持久化 (Priority: P2)

支付成功后，系统生成订单数据（订单号、取餐编号、商品列表、金额、备注、支付时间）并持久化到本地存储。订单数据用于后续"我的订单"功能（当前版本仅存储，不显示列表）。

**Why this priority**: 订单数据持久化是完整订单流程的一部分，为后续订单查询功能奠定基础。

**Independent Test**: 可以独立测试 - 完成支付后，检查本地存储中是否有订单数据，数据格式是否正确。

**Acceptance Scenarios**:

1. **Given** Mock 支付成功, **When** 系统生成订单, **Then** 订单数据复用 B端 ProductOrder 结构，包含：订单号（ORD + 日期 + 随机字符）、取餐编号（字母+3位数字）、商品列表（转换为 OrderItem 格式）、productTotal、discountAmount、totalAmount、备注、支付方式、paymentTime、订单状态（PAID）
2. **Given** 订单数据已生成, **When** 系统持久化订单, **Then** 使用 `Taro.setStorageSync('orders', orders)` 保存到本地存储，支持多订单数组存储
3. **Given** 本地已有历史订单, **When** 生成新订单, **Then** 新订单追加到订单数组头部（最新订单在前）
4. **Given** 订单存储成功, **When** 用户下次打开小程序, **Then** 可以从本地存储读取历史订单数据（为后续"我的订单"功能准备）

---

### Edge Cases

- 用户在订单确认页按返回键的行为（返回菜单页，保留购物车数据）
- 支付过程中网络中断的处理（当前 Mock 实现不涉及网络，直接成功）
- 订单金额为0时的处理（免费订单也走正常支付流程，显示"确认订单"）
- 订单号重复的处理（使用时间戳+随机数确保唯一性）
- 取餐编号重复的处理（当天取餐编号循环使用，确保同一时段内不重复）
- 本地存储空间不足时的降级方案（仅显示警告，不阻断流程）
- 支付成功页用户刷新或返回的行为（支付成功页无返回按钮，只能点击底部按钮）
- 购物车商品在支付前价格变动的处理（当前版本不校验，以购物车价格为准）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须在购物车抽屉的"立即支付"按钮点击后，使用 `Taro.navigateTo({ url: '/pages/order-confirm/index' })` 跳转到订单确认页
- **FR-002**: 订单确认页必须显示商品列表（只读）、备注输入框、金额汇总、"确认支付"按钮
- **FR-003**: 订单确认页必须从 `cartStore` 读取购物车数据（items, totalItems, cartTotal, subtotal）
- **FR-004**: 备注输入框必须限制最大输入字符数为100，并显示实时字数统计
- **FR-005**: 点击"确认支付"按钮后，系统必须显示支付方式选择抽屉（微信支付、支付宝、Apple Pay）
- **FR-006**: 选择支付方式后，系统必须显示"支付中..."加载动画，并在1.5秒后模拟支付成功
- **FR-007**: Mock 支付成功后，系统必须使用 `Taro.redirectTo({ url: '/pages/order-success/index' })` 跳转到支付成功页
- **FR-008**: 支付成功页必须显示成功图标、订单号、支付金额、**取餐编号**（醒目显示）、"查看订单"和"返回首页"按钮
- **FR-009**: 订单号格式必须为 `ORD` + `YYYYMMDD` + `随机字符`（如 ORD20260106AB12CD），复用 B端订单号格式
- **FR-010**: **取餐编号格式必须为字母 + 3位数字**（如 A088、B123），字母循环使用 A-Z，数字当天自增
- **FR-011**: 支付成功页必须显示取餐提示文字："请凭取餐编号到柜台取餐"
- **FR-012**: 点击"返回首页"按钮后，系统必须清空购物车数据（调用 `cartStore.clearCart()`）并跳转到菜单页
- **FR-013**: 系统必须使用 `Taro.setStorageSync('orders', orders)` 将订单数据持久化到本地存储
- **FR-014**: 订单数据结构必须复用 B端 `ProductOrder` 接口，包含：id, orderNumber, userId, status, productTotal, shippingFee, discountAmount, totalAmount, paymentMethod, paymentTime, createdAt, updatedAt, version, items[]，以及 C端特有字段 pickupNumber, remark
- **FR-015**: 购物车为空时，系统必须阻止跳转到订单确认页，并显示"购物车为空"提示
- **FR-016**: 订单确认页顶部必须显示导航栏（返回按钮 + "确认订单"标题）
- **FR-017**: 支付方式抽屉必须支持点击遮罩层或"取消"按钮关闭
- **FR-018**: 支付成功页必须显示预计等待时间（Mock数据：10-15分钟）
- **FR-019**: 系统必须在 `miniapp-ordering-taro/src/pages/` 目录下创建 `order-confirm` 和 `order-success` 两个新页面
- **FR-020**: 新页面必须在 `app.config.ts` 中注册路由

### Key Entities

> **数据模型复用**: 以下实体结构复用 B端订单管理模型 `frontend/src/features/order-management/types/order.ts`

- **订单 (ProductOrder)**: 表示用户提交的订单（复用 B端 ProductOrder 结构）
  - id: 字符串，UUID 格式唯一标识符
  - orderNumber: 字符串，订单号（格式：ORD + YYYYMMDD + 随机字符，如"ORD20260106AB12CD"）
  - userId: 字符串，用户ID
  - status: OrderStatus 枚举，订单状态
  - productTotal: 数字，商品总价（分）
  - shippingFee: 数字，配送费（影院场景为0）
  - discountAmount: 数字，折扣金额（分），当前版本为0
  - totalAmount: 数字，实付金额（分）
  - paymentMethod: 字符串，'WECHAT_PAY' | 'ALIPAY' | 'APPLE_PAY' | null
  - paymentTime: 字符串 | null，支付完成时间（ISO 8601 格式）
  - createdAt: 字符串，订单创建时间
  - updatedAt: 字符串，订单更新时间
  - version: 数字，乐观锁版本号
  - items: OrderItem[]，订单商品明细
  - **pickupNumber**: 字符串，取餐编号（C端特有，格式：字母+3位数字，如"A088"）
  - **remark**: 字符串，订单备注（C端特有，最多100字）

- **订单商品明细 (OrderItem)**: 表示订单中的单个商品（复用 B端 OrderItem 结构）
  - id: 字符串，UUID 格式唯一标识符
  - orderId: 字符串，关联订单ID
  - productId: 字符串，商品ID
  - productName: 字符串，商品名称
  - productSpec: 字符串 | null，商品规格（如"大杯"、"500ml"）
  - productImage: 字符串 | null，商品图片URL
  - quantity: 数字，购买数量
  - unitPrice: 数字，单价（分）
  - subtotal: 数字，小计（分）= unitPrice × quantity
  - createdAt: 字符串，创建时间

- **订单状态 (OrderStatus)**: 订单生命周期状态（复用 B端枚举）
  - PENDING_PAYMENT: 待支付
  - PAID: 已支付（Mock 支付后直接进入此状态）
  - SHIPPED: 已发货（影院场景对应"制作中"）
  - COMPLETED: 已完成
  - CANCELLED: 已取消

- **支付方式 (PaymentMethod)**: 表示用户选择的支付渠道（复用 B端命名）
  - WECHAT_PAY: 微信支付
  - ALIPAY: 支付宝
  - APPLE_PAY: Apple Pay

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在3个点击内完成"购物车 → 订单确认 → 发起支付"流程
- **SC-002**: 订单确认页加载时间不超过500ms（页面渲染完成）
- **SC-003**: Mock 支付流程从选择支付方式到跳转成功页不超过2秒
- **SC-004**: 订单数据生成和本地存储操作响应时间不超过100ms
- **SC-005**: 支付成功页的成功图标动画流畅度达到60 FPS
- **SC-006**: 100%的订单号保证唯一（使用时间戳+随机数）
- **SC-007**: 用户点击"返回首页"后，购物车数据100%清空
- **SC-008**: 订单数据持久化成功率100%（除存储空间不足外）

## Assumptions *(Optional)*

- 假设购物车数据由 O010-shopping-cart 的 `cartStore` 提供，订单确认页直接读取 Zustand store
- 假设 Mock 支付无需真实调用支付 SDK，仅模拟支付流程 UI
- 假设订单号流水号在单个设备上通过本地存储自增（不考虑跨设备同步）
- **假设取餐编号格式为"字母+3位数字"（如 A088），字母 A-Z 循环使用，数字当天自增**
- **假设取餐编号存储在本地，通过 `Taro.getStorageSync('pickupNumberCounter')` 管理计数器**
- 假设支付方式图标使用本地 SVG 或 Taro Icon 组件
- 假设订单存储键名为 'orders'，数据结构为 `Order[]`
- 假设支付成功后清空购物车，但订单确认页不修改购物车数据（允许用户返回继续购物）
- 假设"查看订单"功能在当前版本仅显示提示，不实现订单详情页

## Dependencies *(Optional)*

- **前端模块**:
  - O010-shopping-cart: 购物车状态管理（cartStore）、购物车抽屉组件
  - **O001-product-order-list**: 订单数据模型（ProductOrder, OrderItem, OrderStatus 类型定义）
  - Taro 官方组件：View, Text, Image, Input, ScrollView
  - Taro API：Taro.navigateTo(), Taro.redirectTo(), Taro.reLaunch(), Taro.setStorageSync(), Taro.getStorageSync()

- **数据模型复用**:
  - `frontend/src/features/order-management/types/order.ts` - ProductOrder, OrderItem, OrderStatus 接口定义
  - C端扩展字段：pickupNumber（取餐编号）、remark（订单备注）

- **状态管理**:
  - Zustand cartStore（购物车数据读取、清空）
  - 新建 orderStore（订单数据管理，可选）

- **UI 资源**:
  - 支付方式图标（微信支付、支付宝、Apple Pay）
  - 成功图标（绿色勾选）

## Out of Scope *(Optional)*

- 真实支付 SDK 集成（微信支付、支付宝等）
- 订单详情页
- 我的订单列表页
- 订单状态追踪/推送通知
- 优惠券/积分抵扣功能（在订单确认页显示但不可编辑）
- 发票开具功能
- 订单取消/退款功能
- 后端订单 API 集成
- 取餐编号的后端同步（当前仅本地生成）

## Mock 实现方案

### 支付流程 Mock

支付环节使用纯前端 Mock 实现，无需后端 API：

1. **支付方式选择**：使用 Taro 底部弹出抽屉（自定义组件）
2. **支付加载动画**：使用 `View` + CSS animation 实现旋转加载图标
3. **支付延迟模拟**：使用 `setTimeout` 模拟1.5秒支付处理时间
4. **支付结果**：100%成功（当前版本不模拟失败场景）

### 订单号生成 Mock

```typescript
/**
 * 生成订单号（复用 B端格式）
 * 格式：ORD + YYYYMMDD + 随机字符（6位）
 * 示例：ORD20260106AB12CD
 */
const generateOrderNumber = (): string => {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomStr = ''
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `ORD${dateStr}${randomStr}`
}
```

### 取餐编号生成 Mock

```typescript
/**
 * 生成取餐编号
 * 格式：字母 + 3位数字（如 A088、B123）
 * 字母：A-Z 循环使用
 * 数字：当天自增，每天重置
 */
interface PickupNumberCounter {
  date: string    // 日期，格式 YYYYMMDD
  letter: string  // 当前字母 A-Z
  number: number  // 当前数字 1-999
}

const generatePickupNumber = (): string => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let counter: PickupNumberCounter = Taro.getStorageSync('pickupNumberCounter') || {
    date: today,
    letter: 'A',
    number: 0
  }

  // 如果是新的一天，重置计数器
  if (counter.date !== today) {
    counter = { date: today, letter: 'A', number: 0 }
  }

  // 数字自增
  counter.number += 1

  // 如果数字超过999，切换到下一个字母
  if (counter.number > 999) {
    counter.number = 1
    counter.letter = String.fromCharCode(counter.letter.charCodeAt(0) + 1)
    if (counter.letter > 'Z') {
      counter.letter = 'A' // 循环回 A
    }
  }

  // 保存计数器
  Taro.setStorageSync('pickupNumberCounter', counter)

  // 返回格式化的取餐编号
  return `${counter.letter}${counter.number.toString().padStart(3, '0')}`
}

// 示例输出：A001, A002, ..., A999, B001, B002, ...
```

## 技术实现参考

### 页面文件结构

```
miniapp-ordering-taro/src/
├── pages/
│   ├── order-confirm/           # 订单确认页（新增）
│   │   ├── index.tsx
│   │   ├── index.less
│   │   └── index.config.ts
│   └── order-success/           # 支付成功页（新增）
│       ├── index.tsx
│       ├── index.less
│       └── index.config.ts
├── components/
│   └── PaymentSheet/            # 支付方式选择抽屉（新增）
│       ├── index.tsx
│       └── index.less
├── services/
│   └── orderService.ts          # 订单服务（新增）
├── stores/
│   └── orderStore.ts            # 订单状态管理（可选，新增）
├── types/
│   └── order.ts                 # 订单类型定义（新增）
└── app.config.ts                # 路由配置（更新）
```

### app.config.ts 路由配置更新

```typescript
export default defineAppConfig({
  pages: [
    'pages/menu/index',
    'pages/member/index',
    'pages/order/index',
    'pages/order-confirm/index',  // 新增
    'pages/order-success/index',  // 新增
  ],
  // ...
})
```
