# Feature Specification: 订单模块迁移至渠道商品体系

**Feature Branch**: `O013-order-channel-migration`  
**Created**: 2026-01-14  
**Status**: Draft  
**Input**: 把订单模块从 beverages 迁移到 channel_products/skus 体系，前端只考虑 miniapp-ordering-taro，删除所有多余表结构，不需要数据迁移

## 背景与问题

### 问题描述

当前系统存在两套商品管理体系：

1. **旧体系（beverages）**：独立的饮品表，包含 `beverages`、`beverage_specs`、`beverage_recipes` 等表
2. **新体系（channel_products/skus）**：统一的 SKU 主数据 + 渠道商品配置

订单模块（`beverage_orders`、`beverage_order_items`）仍依赖旧的 `beverages` 表，导致：

- 小程序使用新体系展示商品（channel_products API）
- 下单时却需要旧体系的 beverage_id
- 外键约束冲突，无法正常下单

### 迁移目标

将订单模块完全迁移到新的 channel_products/skus 体系，并删除冗余的历史表结构。

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 小程序用户正常下单 (Priority: P1)

用户在小程序浏览商品菜单，选择商品加入购物车，完成下单流程。系统使用新的渠道商品体系处理订单，无需依赖旧的 beverages 表。

**Why this priority**: 这是核心业务流程，直接影响用户能否正常下单消费。

**Independent Test**: 可以通过在小程序中完成一次完整的下单流程来验证，包括浏览菜单、加入购物车、提交订单、查看订单详情。

**Acceptance Scenarios**:

1. **Given** 用户在小程序菜单页面浏览商品，**When** 用户点击商品并选择规格后加入购物车，**Then** 购物车正确记录商品信息（使用 channel_product_id）
2. **Given** 用户购物车中有商品，**When** 用户点击提交订单，**Then** 系统成功创建订单，订单项正确关联渠道商品
3. **Given** 用户已提交订单，**When** 用户查看订单详情，**Then** 系统正确显示商品名称、规格、价格等信息

---

### User Story 2 - 后台订单管理 (Priority: P2)

运营人员在后台管理系统查看和管理订单，系统正确展示订单商品信息，支持订单状态流转。

**Why this priority**: 后台管理是运营必需功能，但可以在用户下单功能完成后再实现。

**Independent Test**: 可以通过后台查看订单列表和订单详情来验证，确认商品信息正确显示。

**Acceptance Scenarios**:

1. **Given** 系统中有已创建的订单，**When** 运营人员在后台查看订单列表，**Then** 系统正确显示订单编号、商品信息、金额
2. **Given** 运营人员查看订单详情，**When** 查看订单商品项，**Then** 系统正确显示商品名称、规格、单价、数量

---

### User Story 3 - 清理历史表结构 (Priority: P3)

开发人员执行数据库迁移脚本，删除不再使用的历史表结构，简化系统架构。

**Why this priority**: 清理工作在功能迁移完成后进行，不影响业务功能。

**Independent Test**: 可以通过执行迁移脚本并验证数据库结构来测试。

**Acceptance Scenarios**:

1. **Given** 新订单体系已上线运行，**When** 执行清理迁移脚本，**Then** 系统删除 `beverages`、`beverage_specs`、`beverage_recipes`、`beverage_sku_mapping` 等历史表
2. **Given** 历史表已删除，**When** 系统运行，**Then** 所有订单功能正常工作，无外键约束错误

---

### Edge Cases

- 订单项商品被下架后，历史订单仍能正确显示商品快照信息（名称、价格、图片）
- 商品价格变更后，已创建订单的价格不受影响（订单记录下单时价格）
- 商品规格配置变更后，历史订单仍能正确显示原规格选择

---

## Requirements *(mandatory)*

### Functional Requirements

**订单数据模型改造**:

- **FR-001**: 系统必须将 `beverage_order_items.beverage_id` 外键改为 `channel_product_id`，关联 `channel_product_config` 表
- **FR-002**: 系统必须在订单项中保存商品快照信息（商品名称、图片URL、规格、单价），确保历史订单数据完整性
- **FR-003**: 系统必须支持通过 `channel_product_id` 查询关联的 SKU 和 BOM 信息（用于库存扣减）

**下单 API 改造**:

- **FR-004**: 系统必须将下单接口路径从 `/api/client/beverage-orders` 重命名为 `/api/client/orders`，接受 `channelProductId` 替代 `beverageId`
- **FR-005**: 系统必须在创建订单时从 `channel_product_config` 获取商品信息并保存快照
- **FR-006**: 系统必须验证下单商品的状态为 ACTIVE，否则拒绝下单

**前端适配 (miniapp-ordering-taro)**:

- **FR-007**: 系统必须修改购物车数据结构，使用 `channelProductId` 作为商品标识
- **FR-008**: 系统必须修改下单请求，传递 `channelProductId` 和已选规格
- **FR-009**: 系统必须修改订单详情展示，从新的订单数据结构获取商品信息

**历史表清理**:

- **FR-010**: 系统必须删除 `beverages` 表及其所有依赖（外键、索引）
- **FR-011**: 系统必须删除 `beverage_specs` 表
- **FR-012**: 系统必须删除 `beverage_recipes` 表（配方功能已迁移到 BOM）
- **FR-013**: 系统必须删除 `beverage_sku_mapping` 表（迁移已完成，映射不再需要）
- **FR-014**: 系统必须删除 `recipe_ingredients` 表（已迁移到 `bom_components`）

**后端代码清理**:

- **FR-015**: 系统必须删除 `com.cinema.beverage.entity.Beverage` 及相关实体类
- **FR-016**: 系统必须删除 `BeverageRepository`、`BeverageSpecRepository` 等相关 Repository
- **FR-017**: 系统必须更新 `BeverageOrderService` 使用新的数据模型
- **FR-018**: 系统必须保留 `beverage_orders`、`beverage_order_items` 表（重命名为 `consumer_orders`、`consumer_order_items` 可选）

---

### Key Entities

- **ConsumerOrder (消费订单)**: 原 `beverage_orders`，记录用户下单信息（订单号、用户、门店、总金额、状态）
- **ConsumerOrderItem (订单商品项)**: 原 `beverage_order_items`，记录订单中的商品（渠道商品ID、商品快照、规格、数量、单价、小计）
- **ChannelProductConfig (渠道商品配置)**: 关联 SKU 主数据，存储渠道特定的展示配置（名称、价格、图片、规格）
- **SKU (库存单位)**: 商品主数据，用于库存管理和 BOM 配方

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在小程序中完成完整的下单流程，从浏览商品到提交订单不超过 3 分钟
- **SC-002**: 订单创建成功率达到 99.9%，无外键约束错误
- **SC-003**: 历史订单详情页面正确显示商品快照信息（名称、价格、规格、图片）
- **SC-004**: 数据库清理后，删除不少于 5 个冗余表，减少数据库复杂度
- **SC-005**: 后端代码清理后，删除不少于 10 个冗余类文件，减少代码维护成本
- **SC-006**: 迁移完成后系统无编译错误、无运行时错误

---

## Dependencies

- **O005-channel-product-config**: 依赖渠道商品配置功能，提供商品数据源
- **O007-miniapp-menu-api**: 依赖小程序菜单 API，获取商品列表
- **O010-shopping-cart**: 依赖购物车功能，需要适配新数据模型
- **P001-sku-master-data**: 依赖 SKU 主数据，用于库存关联
- **O012-order-inventory-reservation**: 订单库存预占测试流程需同步更新，将 `skuId` 改为 `channelProductId`

---

## Assumptions

1. 系统尚未上线，无需迁移历史订单数据
2. `channel_product_config` 表已存在且有数据
3. 小程序菜单展示功能（O007、O009）已正常工作
4. 购物车功能（O010）需要同步适配，但可作为本次迁移的一部分
5. 订单统计报表功能需要适配新数据模型，但可以在后续版本迭代

---

## Out of Scope

1. 历史订单数据迁移（系统未上线）
2. hall-reserve-taro 工程的适配（仅关注 miniapp-ordering-taro）
3. 订单统计报表功能的完整适配（可后续迭代）
4. 表名重命名（如 beverage_orders → consumer_orders，可选，不强制）

---

## Clarifications

### Session 2026-01-14

- Q: O012 的 Postman 测试流程应该如何调整？ → A: 更新现有 O012 测试，将 `skuId` 改为 `channelProductId`，保留测试场景和断言逻辑
- Q: O012 Setup 流程是否需要增加 channel_product_config 记录创建步骤？ → A: 是，在 O012 Setup 中增加步骤：为已创建的 SKU 创建对应的 channel_product_config 记录
- Q: 下单 API 路径是否需要更改？ → A: 是，重命名为 `/api/client/orders`，同步更新前端调用路径
