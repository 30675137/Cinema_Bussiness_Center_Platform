# Feature Specification: 小程序渠道商品订单适配

**Feature Branch**: `O006-miniapp-channel-order`
**Created**: 2026-01-01
**Status**: Draft
**Input**: 根据spec O005的修改 以及之前的O003的功能,结合小程序的实现情况 调整小程序加载商品的API等逻辑

## Clarifications

### Session 2026-01-02 (Revision 1)

- Q: UI原型的实际技术栈和格式 → A: React 19 + Vite web应用（位于 miniapp-ordering/），使用 lucide-react 图标库，包含AI推荐功能(Gemini API)，Mock数据本地运行
- Q: 原型代码复用还是完全重写 → A: 完全用Taro+React重写，仅参考UI布局和交互逻辑，不复用web app代码
- Q: 原型中的页面结构和核心功能 → A: 单页应用，包含订单tab和会员tab，4个核心功能（商品列表+分类筛选、商品详情+规格选择、购物车抽屉、订单列表）
- Q: 原型特有功能的处理（如影厅选择、AI推荐） → A: 移除影厅选择（不适用），保留AI推荐功能但替换为后端API实现，移除优惠券/积分兑换（列入Out of Scope）
- Q: 原型中图片资源的处理方式 → A: 原型使用Unsplash外部图片，Taro实现改用默认占位图+后端API返回的真实商品图片

---

## 背景与问题

### 问题描述

O005-channel-product-config 引入了新的渠道商品配置架构,将饮品数据从独立的 `beverages` 表迁移到 `channel_product_config` 表。小程序端(hall-reserve-taro)当前基于 O003-beverage-order 实现了饮品订单功能,但需要适配新的渠道商品架构。

**UI原型来源**: React 19 + Vite web应用,位于 `miniapp-ordering/` 文件夹。这是一个Cinema Lounge点餐的演示原型,包含商品分类（经典特调/精品咖啡/清爽饮品/主厨小食/积分兑换）、商品列表、规格选择、购物车、会员系统（优惠券/积分）、影厅选择、AI推荐等功能。使用 lucide-react 图标库、Unsplash图片、Gemini API提供AI建议。

**迁移策略**: 参考原型的UI布局和交互逻辑,使用 Taro 4.1.9 + React + TypeScript 完全重写。具体要求:
- **保留**: 商品列表布局、分类标签栏设计、商品卡片样式、规格选择器UI、购物车抽屉交互、订单列表展示
- **调整**: 商品分类改为后端API定义的6种分类(ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER)，移除影厅选择，移除优惠券/积分兑换功能
- **替换**: AI推荐功能使用后端API实现（非Gemini），商品图片使用后端API返回的真实图片（非Unsplash）
- **重写**: 不复用web app代码，使用Taro组件和API重新实现所有功能
- 最终产出的代码库位于 `hall-reserve-taro/` 项目中

**样式参考方案**: 参考原型的视觉设计,手动提取关键样式变量到Taro项目:
- 创建 `hall-reserve-taro/src/styles/variables.scss` 定义颜色主题（参考原型配色）
- 定义字体变量（参考原型字号体系），使用 `rpx` 单位适配小程序
- 定义间距变量（参考原型布局间距）
- 定义圆角/阴影等通用样式（参考原型卡片设计）
- 所有页面组件引用这些变量,确保样式一致性

**图标与图片方案**:
- UI图标: 使用 lucide-react 图标库（Taro兼容）或转为SVG/图片资源
- 商品默认占位图: 自定义占位图存储在 `hall-reserve-taro/src/assets/images/placeholders/`
- 实际商品图片: 通过后端API动态获取,使用 O005 配置的商品主图和详情图

1. **商品数据源变更**: 从 `beverages` 表迁移到 `channel_product_config` 表
2. **商品分类扩展**: 从仅支持饮品分类扩展到酒/咖啡/饮料/小食/餐品/其他
3. **规格类型增加**: 从4种规格类型(SIZE/TEMPERATURE/SWEETNESS/TOPPING)扩展到7种(新增SPICINESS/SIDE/COOKING)
4. **订单实体关联**: 订单项需要关联 `channelProductId` 而非 `beverageId`

### 核心目标

在保持 O003 订单流程(浏览商品 → 选择规格 → 加入购物车 → 提交订单 → 支付 → 取餐)的基础上,将数据源从饮品表切换到渠道商品配置表,支持更广泛的商品类型和规格选项。

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 浏览渠道商品菜单 (Priority: P1)

作为小程序用户,我希望在小程序点餐页面浏览所有可售商品(酒/咖啡/饮料/小食/餐品),这些商品数据来自后台渠道商品配置,能够按新的分类筛选和查看。

**Why this priority**: 这是订单流程的起点,用户必须能浏览商品才能下单。与 O003 的饮品菜单功能等价,是核心 MVP 能力。

**Independent Test**: 用户打开小程序"点餐菜单"tab → 查看商品列表(按分类分组) → 点击分类标签筛选 → 验证显示正确的商品。

**Acceptance Scenarios**:

1. **Given** 用户打开小程序"点餐菜单"页,**When** 页面加载,**Then** 显示所有状态为 ACTIVE 的渠道商品,按分类分组(酒/咖啡/饮料/小食/餐品/其他)
2. **Given** 后台管理员配置了某个商品为"已上架",**When** 小程序用户刷新页面,**Then** 该商品出现在对应分类下
3. **Given** 用户在菜单页,**When** 点击"咖啡"分类标签,**Then** 仅显示分类为 COFFEE 的商品
4. **Given** 商品列表为空,**When** 页面加载,**Then** 显示"暂无商品"空状态提示
5. **Given** 某商品图片加载失败,**When** 页面渲染,**Then** 显示默认占位图

---

### User Story 2 - 查看商品详情并选择规格 (Priority: P1)

作为小程序用户,我希望点击商品查看详情,选择规格(大小/温度/甜度/配料/辣度/配菜/做法),系统自动计算包含规格调整的最终价格。

**Why this priority**: 规格选择是订单准确性的关键,用户需要看到实时价格计算。与 O003 的规格选择功能等价。

**Independent Test**: 用户点击商品 → 查看详情页 → 选择多个规格 → 验证价格计算正确 → 加入购物车。

**Acceptance Scenarios**:

1. **Given** 用户点击某个商品,**When** 进入详情页,**Then** 显示商品名称/主图/基础价格/详情图/描述/可用规格列表
2. **Given** 商品配置了 SIZE 规格(小杯-3元/中杯+0元/大杯+5元),**When** 用户选择"大杯",**Then** 显示价格 = 基础价格 + 5元
3. **Given** 用户选择多个规格(大杯+5元/热+0元/半糖+0元/加珍珠+3元),**When** 计算价格,**Then** 最终价格 = 基础价格 + 8元
4. **Given** 商品配置了新规格类型SPICINESS(不辣+0元/微辣+0元/中辣+1元/特辣+2元),**When** 用户选择"特辣",**Then** 价格增加2元
5. **Given** 用户未选择必选规格,**When** 点击"加入购物车",**Then** 提示"请选择[规格类型]"并阻止加入

---

### User Story 3 - 购物车管理与订单提交 (Priority: P1)

作为小程序用户,我希望将商品加入购物车,修改数量,提交订单并支付,完成整个下单流程。

**Why this priority**: 这是订单流程的核心,与 O003 的订单提交功能等价,是商业闭环的关键环节。

**Independent Test**: 用户选择商品 → 加入购物车 → 修改数量 → 提交订单 → Mock 支付 → 查看订单详情。

**Acceptance Scenarios**:

1. **Given** 用户在商品详情页选择规格,**When** 点击"加入购物车",**Then** 购物车图标显示数量角标(商品总数量),Toast 提示"已添加"
2. **Given** 购物车中已有商品,**When** 用户点击购物车图标,**Then** 弹出购物车抽屉,显示商品列表(名称/规格/单价/数量/小计/总价)
3. **Given** 用户在购物车中,**When** 修改某商品数量,**Then** 小计和总价实时更新
4. **Given** 用户在购物车中,**When** 点击"提交订单",**Then** 调用订单创建 API,提交数据包含 `channelProductId`/选择的规格/数量/单价/小计
5. **Given** 订单创建成功,**When** Mock 支付完成,**Then** 显示订单确认页(订单号/取餐号/预计制作时间/订单状态)
6. **Given** 订单提交失败,**When** 后端返回错误,**Then** 显示友好错误提示并保留购物车数据

---

### User Story 4 - 订单状态查询与取餐 (Priority: P1)

作为小程序用户,我希望查看订单状态(待制作/制作中/已完成),收到取餐通知,并能查看历史订单。

**Why this priority**: 用户需要实时了解订单进度并及时取餐,与 O003 的订单状态查询功能等价。

**Independent Test**: 用户提交订单后 → 查看"我的订单"页 → 验证状态更新 → 收到取餐通知 → 查看历史订单。

**Acceptance Scenarios**:

1. **Given** 用户已下单,**When** 进入"我的订单"页,**Then** 显示订单列表(按时间倒序),显示订单号/下单时间/商品/总价/状态
2. **Given** B端工作人员标记订单为"制作中",**When** 小程序轮询状态,**Then** 订单状态从"待制作"更新为"制作中"(延迟≤5秒)
3. **Given** B端工作人员标记订单为"已完成",**When** 触发叫号,**Then** 小程序推送通知"您的订单已完成,取餐号[XXX],请取餐"
4. **Given** 用户点击某个历史订单,**When** 查看详情,**Then** 显示完整信息(商品/规格/价格/支付时间/取餐号/订单状态)
5. **Given** 用户在订单详情页,**When** 点击"再来一单",**Then** 自动填充相同商品和规格到购物车

---

### Edge Cases

- **商品 SKU 被禁用**: 关联的 SKU 被禁用时,渠道配置标记为无效,小程序端不显示该商品
- **商品价格/规格变更**: 用户下单后商品价格或规格变更,历史订单保留下单时的快照数据,新订单使用新价格
- **网络离线**: 用户离线时显示缓存的商品列表,提示"网络已断开",订单提交阻止并提示"请检查网络"
- **API 超时**: 请求超时自动重试3次,重试失败后显示"加载失败,请重试"
- **购物车为空**: 购物车为空时禁用"提交订单"按钮(置灰),点击提示"购物车为空"
- **重复提交订单**: 快速连续点击"提交订单",系统防抖处理,仅创建一个订单
- **支付中断**: 用户支付过程中退出或网络中断,订单标记为"待支付",可在订单列表重新支付
- **规格冲突**: 相同商品不同规格作为独立购物车项(如:大杯热拿铁x2和小杯冰拿铁x1分两行显示)

---

## Requirements *(mandatory)*

### Functional Requirements

**商品数据源迁移**:

- **FR-001**: 小程序必须调用新的 API 端点 `/api/client/channel-products/mini-program`,不再调用 `/api/client/beverages`
- **FR-002**: 小程序必须调用新的商品详情端点 `/api/client/channel-products/mini-program/:id`
- **FR-003**: 小程序必须调用新的商品规格端点 `/api/client/channel-products/mini-program/:id/specs`

**商品分类与筛选**:

- **FR-004**: 系统必须支持新的渠道分类类型显示:`ChannelCategory = ALCOHOL | COFFEE | BEVERAGE | SNACK | MEAL | OTHER`
- **FR-005**: 系统必须提供分类标签栏,用户点击标签仅显示对应分类的商品
- **FR-006**: 系统必须在商品列表中显示:商品图片/名称/基础价格/推荐标签/库存状态

**规格选择与价格计算**:

- **FR-007**: 系统必须支持新的规格类型:`SpecType = SIZE | TEMPERATURE | SWEETNESS | TOPPING | SPICINESS | SIDE | COOKING`
- **FR-008**: 系统必须支持多规格组合选择(如:大杯+热+半糖+加珍珠+特辣)
- **FR-009**: 系统必须正确计算价格:最终价格 = 基础价格 + 所有选中规格的价格调整之和
- **FR-010**: 系统必须在用户选择规格时实时更新显示的价格
- **FR-011**: 系统必须标识必选规格,未选择时阻止加入购物车并提示

**购物车管理**:

- **FR-012**: 系统必须提供购物车入口(菜单页右上角固定按钮),显示商品总数量角标
- **FR-013**: 系统必须在购物车中显示:商品名称/选中规格/单价/数量/小计/总价
- **FR-014**: 系统必须支持修改购物车中商品数量(增加/减少/删除)
- **FR-015**: 系统必须将相同商品不同规格作为独立购物车项处理
- **FR-016**: 购物车为空时必须禁用"提交订单"按钮

**订单提交与支付**:

- **FR-017**: 系统必须在订单提交时包含渠道商品ID(`channelProductId`),不再使用 `beverageId`
- **FR-018**: 系统必须在订单提交时包含选择的规格组合(`selectedSpecs: Record<string, SelectedSpec>`)
- **FR-019**: 系统必须在订单提交时包含价格快照(基础价格/规格调整/单价/小计/总价)
- **FR-020**: 系统必须使用 Mock 支付(点击支付按钮自动标记为支付成功),生成订单号和取餐号
- **FR-021**: 系统必须防止重复提交订单(按钮防抖,提交后禁用按钮直到成功或失败)

**订单状态查询**:

- **FR-022**: 系统必须提供"我的订单"页,显示历史订单列表(按时间倒序)
- **FR-023**: 系统必须使用轮询(每5-10秒)查询订单状态更新
- **FR-024**: 系统必须在订单状态变更时更新UI(待制作→制作中→已完成→已交付)
- **FR-025**: 系统必须在订单标记为"已完成"时推送小程序通知"您的订单已完成,请取餐"

**数据同步与错误处理**:

- **FR-026**: 系统必须在网络异常时显示友好错误提示,保留用户已选商品数据
- **FR-027**: 系统必须在 API 请求失败时自动重试3次
- **FR-028**: 所有 API 请求必须包含用户认证 Token,Token 过期时自动刷新
- **FR-029**: 系统必须记录关键操作日志(加入购物车/提交订单/支付/状态变更)

### Key Entities

- **ChannelProduct(渠道商品)**: 代表菜单中的可售商品,包含商品ID/名称/分类(ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER)/基础价格/主图/详情图/状态/推荐标签。关联 SKU 主数据的 `finished_product` 类型。
- **ChannelProductSpec(渠道商品规格)**: 代表商品的可选规格,包含规格类型(SIZE/TEMPERATURE/SWEETNESS/TOPPING/SPICINESS/SIDE/COOKING)/规格选项/价格调整。
- **ChannelProductOrder(渠道商品订单)**: 代表一笔渠道商品订单,包含订单ID/订单号/取餐号/用户ID/订单状态(待支付/待制作/制作中/已完成/已交付/已取消)/总价/支付时间/创建时间。
- **ChannelProductOrderItem(订单项)**: 代表订单中的一个商品项,包含订单项ID/订单ID/渠道商品ID(`channelProductId`)/商品名称快照/选中规格快照/数量/单价快照/小计。
- **QueueNumber(取餐号)**: 代表叫号系统的取餐号,包含取餐号ID/取餐号码/订单ID/生成时间/叫号状态(待叫号/已叫号/已取餐)。

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户能够在2分钟内完成从浏览商品到提交订单的完整流程
- **SC-002**: 商品列表页首屏加载时间≤2秒(20条商品含图片)
- **SC-003**: 商品详情页加载时间≤1秒
- **SC-004**: 规格选择后价格计算准确率100%(基础价 + 规格调整 = 最终价格)
- **SC-005**: 订单提交成功率≥95%(排除库存不足/用户取消等正常场景)
- **SC-006**: 订单状态更新延迟≤5秒(B端标记状态后,C端查询到更新)
- **SC-007**: 取餐通知到达率≥95%(订单完成后,用户收到推送通知)
- **SC-008**: 系统支持高峰期100个并发订单无性能下降
- **SC-009**: 90%的用户能在首次使用时成功完成下单流程(无需客服协助)

---

## Dependencies

- **O005-channel-product-config**: 依赖后端渠道商品配置功能和新的 API 端点
- **O003-beverage-order**: 参考饮品订单的订单流程实现(购物车/订单提交/状态查询/取餐通知)
- **后端 API 实现**: 需要后端提供 `/api/client/channel-products/mini-program` 相关端点
- **SKU 主数据**: 渠道商品配置依赖 SKU 主数据的 `finished_product` 类型
- **现有认证系统**: 依赖 `hall-reserve-taro/src/services/authService.ts` 的静默登录和 Token 管理
- **现有请求封装**: 依赖 `hall-reserve-taro/src/utils/request.ts` 的统一请求处理

---

## Assumptions

- 后端已完成 O005 的实现,新的 API 端点(`/api/client/channel-products/mini-program`)正常可用
- 后端 API 返回的数据格式与 O005 规格定义一致
- 小程序用户主要使用微信小程序和 H5 访问,Taro 框架兼容性良好
- 用户已通过静默登录完成微信授权,所有订单操作需要登录状态
- 支付功能使用 Mock 实现(点击支付按钮自动成功),无需接入真实微信支付
- 叫号系统使用 Mock 语音播报(B端显示"已叫号"状态),小程序推送通知正常实现
- B端订单通知使用轮询(每5-10秒查询新订单),后续可升级为 WebSocket
- 购物车数据存储在内存中(Zustand),刷新页面后清空
- 历史订单数据保留下单时的商品/规格/价格快照,菜单变更不影响历史订单

---

## Out of Scope

- 后端 API 的实现(由 O005 负责)
- B端管理后台的订单接收与出品流程(由 O003 负责)
- BOM 扣料逻辑(由 O003 负责)
- 小程序支付功能的真实对接(使用 Mock 实现)
- 外卖配送功能(当前只支持堂食取餐)
- 会员积分/优惠券功能
- 商品评价功能
- 商品搜索与高级筛选(关键词搜索/价格排序)
- 桌号/座位号管理(扫码点单)
- 多门店支持(当前只支持单门店)

---

## 技术实现概要

### 与 O003 的差异对比

| 维度 | O003-beverage-order | O006-miniapp-channel-order |
|------|-------------------|--------------------------|
| 数据源 | `beverages` 表 | `channel_product_config` 表 |
| 商品分类 | COFFEE/TEA/JUICE/SMOOTHIE/MILK_TEA/OTHER | ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER |
| 规格类型 | SIZE/TEMPERATURE/SWEETNESS/TOPPING (4种) | SIZE/TEMPERATURE/SWEETNESS/TOPPING/SPICINESS/SIDE/COOKING (7种) |
| API 端点 | `/api/client/beverages` | `/api/client/channel-products/mini-program` |
| 订单关联字段 | `beverageId` | `channelProductId` |
| 类型定义 | `BeverageDTO`, `BeverageSpecDTO` | `ChannelProductDTO`, `ChannelProductSpecDTO` |
| 命名约定 | `beverage*` | `channelProduct*` |

### 文件变更清单

**类型定义** (新增或修改):
- `hall-reserve-taro/src/types/channelProduct.ts`:定义 `ChannelProductDTO`/`ChannelProductSpecDTO`/`ChannelCategory`
- `hall-reserve-taro/src/types/order.ts`:修改订单项类型,使用 `channelProductId` 替代 `beverageId`

**服务层** (新增或修改):
- `hall-reserve-taro/src/services/channelProductService.ts`:新增渠道商品 API 调用(列表/详情/规格)
- `hall-reserve-taro/src/services/orderService.ts`:修改订单创建接口,提交 `channelProductId`

**状态管理** (新增或修改):
- `hall-reserve-taro/src/stores/channelProductStore.ts`:新增渠道商品状态管理(选中分类/当前商品)
- `hall-reserve-taro/src/stores/orderCartStore.ts`:修改购物车 store,使用 `channelProductId`

**页面组件** (新增或修改):
- `hall-reserve-taro/src/pages/channel-product-menu/`:新增渠道商品菜单页（对应原型菜单列表页）
- `hall-reserve-taro/src/pages/channel-product-detail/`:新增渠道商品详情页（对应原型商品详情页）
- `hall-reserve-taro/src/pages/order-cart/`:修改购物车页,适配新的商品类型（对应原型购物车页）
- `hall-reserve-taro/src/pages/member/my-orders/`:订单列表页集成在会员模块下（对应原型会员-订单列表）

### API 映射表

| 功能 | O003 端点 | O006 端点 |
|------|---------|---------|
| 获取商品列表 | `GET /api/client/beverages` | `GET /api/client/channel-products/mini-program` |
| 获取商品详情 | `GET /api/client/beverages/:id` | `GET /api/client/channel-products/mini-program/:id` |
| 获取商品规格 | `GET /api/client/beverages/:id/specs` | `GET /api/client/channel-products/mini-program/:id/specs` |
| 创建订单 | `POST /api/client/beverage-orders` | `POST /api/client/channel-product-orders` |
| 查询订单 | `GET /api/client/beverage-orders/my` | `GET /api/client/channel-product-orders/my` |

---

**总结**: 本规格定义了小程序渠道商品订单适配方案,在保持 O003 订单流程的基础上,将数据源从饮品表切换到渠道商品配置表,支持更广泛的商品类型(酒/咖啡/饮料/小食/餐品)和规格选项(7种规格类型)。核心业务流程保持不变:浏览商品 → 选择规格 → 加入购物车 → 提交订单 → Mock 支付 → 查看状态 → 取餐。
