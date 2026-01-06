# Feature Specification: 小程序购物车功能

**Feature Branch**: `O010-shopping-cart`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "miniapp-ordering-taro 商品卡需要实现购物车功能,可以参考 http://192.168.10.71:4100/ 点击购物的变化 实现，UX的实现逻辑必须保持与UI原型一致"

**UI 原型参考**: `/Users/lining/qoder/ui_demo/Cinema_Bussiness_Cente_UI_DEMO/wechat-multi-entertainment-ordering`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 添加商品到购物车并显示数量控制器 (Priority: P1)

用户在商品列表页浏览商品时，可以通过点击商品卡片右下角的橙色圆形"+"按钮快速将商品加入购物车。添加成功后，商品卡片上显示数量控制器（灰色"-"按钮 + 橙色数字 + 橙色"+"按钮），用户可以直接调整数量。点击"-"按钮减少数量，当数量减至 0 时，数量控制器隐藏，恢复显示"+"按钮。

**Why this priority**: 这是购物车的核心入口功能，没有这个功能用户无法选购商品。必须优先实现，是整个购物流程的起点。与 UI 原型完全一致的交互体验是关键需求。

**Independent Test**: 可以独立测试 - 在商品列表页点击任意商品的"+"按钮，验证商品是否成功加入购物车，数量控制器是否正确显示（"-" 数字 "+"布局），页面底部浮动购物车按钮是否显示总金额和商品数量角标。

**Acceptance Scenarios**:

1. **Given** 用户在商品列表页查看商品（购物车为空）, **When** 点击商品卡片右下角的橙色圆形"+"按钮, **Then** 商品卡片上显示数量控制器（灰色圆形"-"按钮 + 橙色加粗数字"1" + 橙色圆形"+"按钮），页面底部显示浮动购物车按钮（黑色角标显示"1"，总金额显示该商品价格）
2. **Given** 商品已在购物车中（数量为 1）, **When** 点击商品卡片上的橙色"+"按钮, **Then** 数量增加到 2，数字颜色保持橙色（amber-500），浮动购物车按钮的角标和总金额同步更新
3. **Given** 商品在购物车中（数量为 2）, **When** 点击商品卡片上的灰色"-"按钮, **Then** 数量减少到 1，浮动购物车按钮的角标和总金额同步更新
4. **Given** 商品在购物车中（数量为 1）, **When** 点击商品卡片上的"-"按钮, **Then** 数量控制器完全隐藏，商品卡片恢复显示橙色圆形"+"按钮，浮动购物车按钮隐藏（购物车总金额为 0）
5. **Given** 用户点击数量控制器的"+"或"-"按钮, **When** 点击事件触发, **Then** 点击事件不触发商品卡片的详情跳转（使用 stopPropagation 阻止冒泡）

---

### User Story 2 - 页面底部浮动购物车按钮 (Priority: P1)

当购物车中有商品时（总金额 > 0），页面底部距离底部导航栏上方显示一个固定的橙色浮动按钮。按钮左侧显示黑色圆角矩形角标（显示商品总件数），中间显示"去结账"文字和总金额（大号橙色字体），右侧显示右箭头图标。点击该按钮打开购物车抽屉。当购物车为空时，该按钮隐藏。

**Why this priority**: 提供购物车的快速入口，用户可以随时查看购物车状态和总金额。与 US1 组合形成核心购物流程。

**Independent Test**: 可以独立测试 - 在购物车中添加商品后，验证页面底部是否显示浮动购物车按钮，按钮样式、位置、内容是否符合 UI 原型，点击按钮是否触发购物车抽屉打开。

**Acceptance Scenarios**:

1. **Given** 购物车中已有商品（总金额 > 0）, **When** 查看商品列表页, **Then** 页面底部显示橙色圆角矩形浮动按钮（距离底部导航 96px），左侧显示黑色圆角矩形角标（内容为商品总件数，如"3"），中间显示"去结账"文字（小号半透明字体）和总金额（大号加粗字体"¥128"），右侧显示右箭头图标
2. **Given** 浮动购物车按钮已显示, **When** 用户点击按钮, **Then** 按钮缩放至 98%（active:scale-[0.98]），购物车抽屉从底部滑入（动画 350ms）
3. **Given** 购物车为空（总金额 = 0）, **When** 查看商品列表页, **Then** 浮动购物车按钮隐藏
4. **Given** 用户在浮动购物车按钮上悬停（H5 端）, **When** 鼠标悬停, **Then** 按钮放大至 102%（hover:scale-[1.02]）

---

### User Story 3 - 查看和管理购物车抽屉 (Priority: P1)

用户点击页面底部的浮动购物车按钮或会员中心的购物车入口后，从页面底部弹出购物车抽屉（高度占屏幕 90%，圆角顶部）。抽屉顶部显示标题栏（"订单汇总" + 关闭按钮），中间区域显示可滚动的商品列表（每个商品显示图片、名称、价格、数量控制器），底部固定显示小计、优惠金额、实付金额和支付按钮。用户可以在抽屉中调整商品数量或删除商品（数量减至 0）。

**Why this priority**: 用户需要查看已选商品和总价才能决定是否下单，这是购物流程的必要环节。与 P1-US1, US2 组合形成最小可用功能。

**Independent Test**: 可以独立测试 - 在购物车中添加多个商品后，点击浮动购物车按钮，验证购物车抽屉是否正确弹出（从底部滑入动画 350ms），商品列表、数量控制器、总金额计算、支付按钮是否正确显示。

**Acceptance Scenarios**:

1. **Given** 购物车中已有商品, **When** 点击浮动购物车按钮, **Then** 页面显示黑色半透明模糊遮罩（bg-black/80 backdrop-blur-md），购物车抽屉从底部滑入（高度 90vh，圆角 2.5rem），动画时长 350ms，使用贝塞尔曲线缓动（cubic-bezier(0.16, 1, 0.3, 1)）
2. **Given** 购物车抽屉已打开, **When** 查看抽屉内容, **Then** 顶部显示标题栏（"订单汇总" + 圆形关闭按钮），中间显示商品列表（每个商品包含：圆角商品图片 14x14 + 商品名称 + 橙色价格 + 数量控制器），底部固定区域显示小计、优惠金额、实付金额（大号橙色字体）和支付按钮
3. **Given** 购物车抽屉已打开, **When** 调整某个商品的数量（点击"+"或"-"按钮）, **Then** 该商品数量实时更新，小计和实付金额实时重新计算
4. **Given** 购物车抽屉已打开, **When** 将某个商品数量减至 0, **Then** 该商品从购物车列表中移除，小计和实付金额更新，如果购物车变空则显示"空空如也"提示
5. **Given** 购物车抽屉已打开, **When** 点击遮罩层或顶部关闭按钮, **Then** 购物车抽屉关闭（滑出动画），遮罩层消失
6. **Given** 购物车抽屉已打开且商品列表较长, **When** 滚动商品列表区域, **Then** 仅商品列表区域可滚动，标题栏和底部结算区域保持固定

---

### User Story 4 - 购物车状态持久化 (Priority: P2)

用户的购物车数据在应用关闭后能够保留，下次打开应用时购物车中的商品仍然存在。购物车数据使用 Taro.setStorageSync() 存储到本地缓存，应用启动时自动恢复。用户可以继续编辑购物车或直接结算。

**Why this priority**: 提升用户体验，避免用户重复选购商品。不是核心流程的必要功能，但对用户体验有较大提升。

**Independent Test**: 可以独立测试 - 添加商品到购物车后，关闭并重新打开小程序，验证购物车数据是否保留（商品列表、数量、总金额）。

**Acceptance Scenarios**:

1. **Given** 用户已添加商品到购物车, **When** 关闭小程序后重新打开, **Then** 购物车中的商品数据保留（商品列表、数量、总金额），浮动购物车按钮显示正确的角标和金额
2. **Given** 用户在购物车中调整了商品数量, **When** 切换到其他页面（如会员中心）后返回商品列表, **Then** 购物车数据保持最新状态，商品卡片上的数量控制器显示正确数量
3. **Given** 购物车数据已持久化, **When** 用户打开小程序但存储的商品已下架或不存在, **Then** 系统自动从购物车中移除无效商品，仅保留有效商品

---

### User Story 5 - 购物车商品数量角标实时同步 (Priority: P3)

用户在商品列表页操作购物车（添加、删除、调整数量）时，页面底部浮动购物车按钮上的黑色圆角矩形角标实时更新，显示购物车中的商品总件数（所有商品数量之和）。角标样式为黑色背景、橙色文字、圆角矩形、加粗字体。

**Why this priority**: 辅助功能，提升用户体验，让用户随时知道购物车状态。不影响核心流程。

**Independent Test**: 可以独立测试 - 在商品列表页添加/删除商品，验证浮动购物车按钮的角标数字是否实时更新。

**Acceptance Scenarios**:

1. **Given** 购物车为空, **When** 添加第一个商品（数量 1）, **Then** 浮动购物车按钮显示，黑色圆角矩形角标显示橙色数字"1"
2. **Given** 购物车中有 3 件商品, **When** 删除 1 件商品（数量减至 0）, **Then** 角标数字更新为"2"
3. **Given** 购物车中有商品, **When** 将所有商品删除（购物车为空）, **Then** 浮动购物车按钮隐藏
4. **Given** 购物车中有多个商品（总件数超过 99）, **When** 查看浮动购物车按钮角标, **Then** 显示"99+"

---

### User Story 6 - 会员中心购物车入口 (Priority: P3)

会员中心页面显示购物车卡片（购物袋图标 + "购物车"文字 + 商品件数/空空如也提示）。卡片右上角显示红色圆形角标（商品总件数）。点击卡片打开购物车抽屉。

**Why this priority**: 提供额外的购物车入口，方便用户从会员中心访问购物车。非核心功能。

**Independent Test**: 可以独立测试 - 在会员中心页面查看购物车卡片，点击卡片验证是否打开购物车抽屉。

**Acceptance Scenarios**:

1. **Given** 购物车中有商品, **When** 查看会员中心页面, **Then** 购物车卡片右上角显示红色圆形角标（商品总件数），卡片显示"N件商品"
2. **Given** 购物车为空, **When** 查看会员中心页面, **Then** 购物车卡片不显示红色角标，卡片显示"空空如也"
3. **Given** 会员中心购物车卡片已显示, **When** 点击卡片, **Then** 打开购物车抽屉

---

### Edge Cases

- 用户快速连续点击"+"按钮（防抖处理，避免重复添加）
- 商品价格为 0 时的显示逻辑（显示"¥0"或特殊提示）
- 购物车数据与后端不同步时的处理策略（本地存储优先，结算时校验）
- 购物车抽屉打开时用户滚动底层页面的行为（遮罩层阻止滚动穿透）
- 购物车抽屉打开时用户点击物理返回键（Android）的行为（关闭抽屉而非退出应用）
- 购物车数据持久化失败时的降级方案（仅使用内存存储，显示警告）
- 购物车中商品价格变动时的用户提示（结算时后端校验价格差异）
- 同一商品添加多次但选项不同时的购物车处理（按商品ID+选项组合分组）
- 购物车总金额超过整数范围时的处理（使用 BigInt 或精度控制）
- 浮动购物车按钮与底部导航栏重叠时的层级控制（z-index 50）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须在商品卡片右下角提供橙色圆形"添加到购物车"按钮（背景色 amber-500，圆角 rounded-full，阴影 shadow-lg）
- **FR-002**: 商品加入购物车后，商品卡片必须显示数量控制器（灰色圆形"-"按钮 + 橙色加粗数字 + 橙色圆形"+"按钮），按钮间距 8px
- **FR-003**: 数量控制器的点击事件必须使用 stopPropagation() 阻止事件冒泡，防止触发商品详情跳转
- **FR-004**: 系统必须在购物车总金额 > 0 时，在页面底部距离底部导航 96px 位置显示固定浮动购物车按钮
- **FR-005**: 浮动购物车按钮必须显示黑色圆角矩形角标（商品总件数，背景色 zinc-950，文字颜色 amber-500，圆角 lg）、"去结账"文字、总金额（大号加粗字体）、右箭头图标
- **FR-006**: 浮动购物车按钮必须支持点击缩放反馈（active:scale-[0.98]），H5 端支持悬停放大（hover:scale-[1.02]）
- **FR-007**: 点击浮动购物车按钮时，系统必须显示黑色半透明模糊遮罩（bg-black/80 backdrop-blur-md）和购物车抽屉
- **FR-008**: 购物车抽屉必须从底部滑入（动画时长 350ms，贝塞尔曲线 cubic-bezier(0.16, 1, 0.3, 1)），高度占屏幕 90%（90vh），顶部圆角 2.5rem
- **FR-009**: 购物车抽屉必须显示三个区域：顶部标题栏（"订单汇总" + 圆形关闭按钮）、中间可滚动商品列表、底部固定结算区域
- **FR-010**: 购物车抽屉商品列表中每个商品必须显示圆角商品图片（14x14）、商品名称、橙色价格、数量控制器（灰色圆角背景）
- **FR-011**: 购物车抽屉底部结算区域必须显示小计（文字颜色 zinc-500）、优惠金额（橙色加粗）、实付金额（大号橙色加粗，字号 3xl）、支付按钮（橙色圆角矩形，圆角 1.5rem）
- **FR-012**: 系统必须支持在购物车抽屉中调整商品数量（+/- 按钮），实时更新小计和实付金额（useMemo 优化计算性能）
- **FR-013**: 当商品数量减至 0 时，系统必须自动从购物车列表中移除该商品（filter 过滤 quantity > 0）
- **FR-014**: 系统必须使用 Taro.setStorageSync('cart', cart) 将购物车数据持久化到本地存储，存储键名为 'cart'
- **FR-015**: 系统必须在应用启动时使用 Taro.getStorageSync('cart') 从本地存储恢复购物车数据，并验证商品是否仍然有效
- **FR-016**: 购物车角标数字必须在商品添加/删除/数量变化时实时更新（计算所有商品数量之和）
- **FR-017**: 点击遮罩层或购物车抽屉顶部关闭按钮时，系统必须关闭购物车抽屉（移除遮罩层和抽屉）
- **FR-018**: 购物车为空时，购物车抽屉必须显示"空空如也"提示，浮动购物车按钮必须隐藏
- **FR-019**: 商品价格必须以"分"为单位存储，显示时转换为"元"（格式：¥XX.XX 或 ¥XX）
- **FR-020**: 系统必须防止用户快速连续点击导致的重复添加（使用防抖处理或禁用按钮状态）
- **FR-021**: 系统必须在会员中心页面显示购物车卡片（购物袋图标 + "购物车"文字 + 商品件数），卡片右上角显示红色圆形角标（商品总件数）
- **FR-022**: 购物车抽屉打开时，系统必须阻止底层页面滚动（防止滚动穿透）

### Key Entities

- **购物车项 (CartItem)**: 表示购物车中的一个商品条目
  - 商品 (product): Product 类型，包含商品完整信息（id, name, price, image 等）
  - 数量 (quantity): 整数，用户选购的数量
  - 选项 (selectedOptions): Record<string, string>，商品选项（如"冰量: 少冰"，"糖度: 半糖"）
  - 是否积分兑换 (isRedemption): 布尔值，标识是否为积分兑换商品（可选功能）

- **购物车 (Cart)**: 表示用户的购物车状态（数组）
  - 商品列表 (items): CartItem[]，购物车中的所有商品
  - 总件数 (totalItems): 计算值，所有商品数量之和（用于显示角标）
  - 小计 (subtotal): 计算值，所有商品价格 * 数量之和（分）
  - 总金额 (cartTotal): 计算值，小计 - 优惠金额（分）

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在商品列表页在 500ms 内完成"添加商品到购物车"操作（点击"+"按钮到显示数量控制器）
- **SC-002**: 购物车抽屉打开动画流畅度达到 60 FPS，从底部滑入动画时长精确控制在 350ms
- **SC-003**: 购物车数量角标在商品添加/删除后 100ms 内完成更新（同步计算）
- **SC-004**: 购物车数据在应用关闭后重新打开时 100% 恢复（本地存储成功率，除非存储空间不足）
- **SC-005**: 购物车总金额计算准确率达到 100%（精确到分，使用整数运算避免浮点数误差）
- **SC-006**: 用户可以在购物车抽屉中完成"调整商品数量"操作，总金额实时更新（延迟 < 50ms，useMemo 优化）
- **SC-007**: 购物车浮动按钮点击反馈响应时间 < 100ms（缩放动画即时触发）
- **SC-008**: 购物车支持至少 100 个商品项而不影响性能（滚动流畅度不低于 50 FPS）
- **SC-009**: 购物车抽屉的遮罩层透明度和模糊效果渲染时间 < 200ms（使用 backdrop-blur-md）
- **SC-010**: 购物车数据持久化操作响应时间 < 50ms（Taro.setStorageSync 同步写入）

## Assumptions *(Optional)*

- 假设所有商品价格以"分"为单位存储在后端，前端负责格式化显示（¥XX.XX 或 ¥XX）
- 假设购物车数据仅存储在本地（Taro.setStorageSync），不需要与后端实时同步
- 假设商品库存验证在订单提交时进行，购物车阶段不校验库存
- 假设购物车数据持久化使用 'cart' 作为存储键名，数据结构为 CartItem[]
- 假设购物车抽屉使用原生 Taro View 组件实现，不依赖第三方 UI 库（如 Taro UI Popup）
- 假设购物车浮动按钮的 z-index 为 50，高于商品列表（z-index 1）但低于购物车抽屉（z-index 70）
- 假设购物车角标最大显示 "99+"，超过 99 件商品显示省略
- 假设购物车抽屉打开时阻止底层页面滚动（使用 CSS overflow: hidden 或事件拦截）
- 假设同一商品在不同选项（如大/小杯）下被视为不同的购物车项（按 productId + selectedOptions 组合分组）
- 假设购物车数据持久化时间无限制（除非用户主动清空或应用卸载）
- 假设购物车抽屉的关闭动画与打开动画时长一致（350ms）
- 假设购物车浮动按钮的宽度为左右各留 16px 边距（left-4 right-4）

## Dependencies *(Optional)*

- **后端 API**:
  - 获取商品详情 API（已有：`GET /api/client/channel-products/mini-program`）
  - 订单创建 API（依赖订单模块实现，用于"去结账"跳转后的下单流程）

- **前端模块**:
  - ProductCard 组件（O009-miniapp-product-list 已实现，需新增数量控制器集成）
  - Taro 官方组件：View, Text, Image, ScrollView
  - Taro API：Taro.setStorageSync(), Taro.getStorageSync(), Taro.navigateTo()

- **状态管理**:
  - Zustand 购物车状态管理（需新建 cartStore，管理 cart, isCartOpen, totalItems, cartTotal）

- **UI 图标**:
  - Plus, Minus, ShoppingBag, X, ChevronRight 图标（使用 lucide-react 或 Taro Icon 组件）

- **CSS 动画**:
  - 滑入动画 @keyframes slide-up（贝塞尔曲线 cubic-bezier(0.16, 1, 0.3, 1)）
  - 缩放动画 scale-[0.98], scale-[1.02]（使用 Taro 内联样式或 Tailwind CSS）

## Out of Scope *(Optional)*

- 购物车商品库存实时校验（在订单提交时校验）
- 购物车数据与后端同步（仅本地存储）
- 购物车商品推荐功能（"猜你喜欢"）
- 购物车优惠券/折扣计算（UI 原型包含该功能，但不在本规格范围内）
- 购物车积分抵扣功能（UI 原型包含该功能，但不在本规格范围内）
- 购物车商品收藏功能
- 购物车商品失效提示（如商品下架）
- 购物车分享功能（分享购物车链接给好友）
- 购物车历史记录（查看之前的购物车快照）
- 购物车批量操作（全选、删除全部）
- 购物车商品规格切换（如大杯→小杯，需在商品详情页操作）

## UI 原型实现参考 *(Optional)*

基于 `/Users/lining/qoder/ui_demo/Cinema_Bussiness_Cente_UI_DEMO/wechat-multi-entertainment-ordering` 的关键实现细节：

### 商品卡片数量控制器（App.tsx:180-204）

```typescript
const qty = getProductQuantity(product.id);

<div className="flex items-center space-x-2">
  {qty > 0 && (
    <>
      <button
        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full p-1.5 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          updateCartQuantity(product.id, -1);
        }}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-sm font-bold text-amber-500 w-4 text-center">{qty}</span>
    </>
  )}
  <button
    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-full p-1.5 shadow-lg shadow-amber-500/10 transition-colors"
    onClick={(e) => {
      e.stopPropagation();
      updateCartQuantity(product.id, 1);
    }}
  >
    <Plus className="w-3.5 h-3.5" />
  </button>
</div>
```

### 浮动购物车按钮（App.tsx:409-425）

```typescript
{cartTotal > 0 && activeTab === 'order' && (
  <div className="absolute bottom-24 left-4 right-4 z-50">
    <div
      onClick={() => setIsCartOpen(true)}
      className="bg-amber-500 text-zinc-950 h-14 rounded-2xl flex items-center px-6 shadow-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
    >
      <div className="bg-zinc-950 text-amber-500 text-xs font-bold rounded-lg w-7 h-7 flex items-center justify-center">
        {totalItems}
      </div>
      <div className="flex-1 ml-4">
        <p className="text-xs opacity-80 font-bold uppercase tracking-tight leading-none">去结账</p>
        <p className="text-lg font-black">¥{cartTotal}</p>
      </div>
      <ChevronRight className="w-6 h-6" />
    </div>
  </div>
)}
```

### 购物车抽屉（App.tsx:455-566）

```typescript
{isCartOpen && (
  <div className="absolute inset-0 z-[70] flex items-end">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
    <div className="relative w-full h-[90vh] bg-zinc-900 rounded-t-[2.5rem] flex flex-col border-t border-zinc-800 overflow-hidden animate-slide-up">
      {/* 标题栏 */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black">订单汇总</h2>
        <button onClick={() => setIsCartOpen(false)} className="bg-zinc-800 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 商品列表（可滚动） */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
        {cart.map((item, idx) => (
          <div key={`${item.product.id}-${idx}`} className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={item.product.image} className="w-14 h-14 rounded-xl object-cover" />
              <div className="ml-4">
                <h4 className="font-bold text-sm">{item.product.name}</h4>
                <p className="text-amber-500 text-xs font-bold">¥{item.product.price}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-zinc-800/50 p-1 rounded-xl">
              <button onClick={() => updateCartQuantity(item.product.id, -1)}>
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
              <button onClick={() => updateCartQuantity(item.product.id, 1)}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 底部结算区域 */}
      <div className="p-8 bg-zinc-950 border-t border-zinc-800">
        <div className="space-y-1 mb-6">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>小计</span>
            <span>¥{subtotal}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-zinc-400 font-bold">实付金额</span>
            <span className="text-3xl font-black text-amber-500">¥{cartTotal}</span>
          </div>
        </div>
        <button className="w-full bg-amber-500 py-5 rounded-[1.5rem] text-zinc-950 font-black text-lg transition-all shadow-xl shadow-amber-500/10 active:scale-95">
          立即支付
        </button>
      </div>
    </div>
  </div>
)}
```

### CSS 动画（App.tsx:568-592）

```css
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-slide-up {
  animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
```
