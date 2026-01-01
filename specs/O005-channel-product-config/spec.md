# Feature Specification: 渠道商品配置

**Feature Branch**: `O005-channel-product-config`
**Created**: 2026-01-01
**Status**: Draft
**Input**: 改进 P005-bom-inventory-deduction 和 O004-beverage-sku-reuse 的架构设计

## 背景与问题

### 问题描述

当前 O004-beverage-sku-reuse 将饮品配置迁移到统一 SKU 管理后，存在以下问题：

1. **编辑功能被禁用**：`/beverage/list` 页面的编辑、规格、配方按钮全部禁用
2. **渠道配置能力丢失**：同一 SKU 成品在不同销售渠道需要不同的展示配置（图片、分类、规格、价格）
3. **命名不准确**："饮品列表"无法涵盖小程序可销售的所有商品类型（酒、咖啡、饮料、小食、餐品）

### 核心矛盾

| SKU 主数据（需中心化） | 渠道配置（需差异化） |
|----------------------|-------------------|
| 商品基础名称 | 渠道展示名称 |
| 成本价/基础价 | 渠道销售价格 |
| BOM 配方 | 渠道展示图片 |
| 主库存单位 | 渠道分类（酒/咖啡/小食/餐品） |
| 基础属性 | 规格选项（温度/甜度/辣度） |

### 解决方案

采用**分层架构**：SKU 主数据 + 渠道商品配置

```
┌─────────────────────────────────────────────────────────┐
│  SKU 主数据层 (skus 表)                                  │
│  - 中心化管理：名称、成本、BOM、库存单位                   │
│  - 类型：finished_product (成品)                         │
└─────────────────────────────────────────────────────────┘
                           ↓
                    关联（1:N）
                           ↓
┌─────────────────────────────────────────────────────────┐
│  渠道商品配置层 (channel_product_config 表)              │
│  - 渠道差异化：展示名称、图片、价格、分类、规格            │
│  - 支持多渠道：小程序点餐、线下POS、外卖平台（未来）       │
└─────────────────────────────────────────────────────────┘
```

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 配置小程序销售商品 (Priority: P1)

作为商品管理员，我希望从 SKU 成品中选择商品并配置其在小程序点餐渠道的展示属性（名称、图片、分类、价格、规格），以便顾客在小程序中看到符合渠道特点的商品展示。

**Why this priority**: 这是核心功能，直接影响小程序点餐的商品展示和用户体验。

**Independent Test**: 可以独立测试——管理员选择 SKU 成品 → 配置渠道属性 → 保存 → 验证小程序端显示。

**Acceptance Scenarios**:

1. **Given** 管理员在渠道商品配置页面，**When** 点击"新增商品"，**Then** 弹出 SKU 选择器，仅显示 `finished_product` 类型的 SKU 列表

2. **Given** 管理员选择了一个 SKU 成品，**When** 进入配置表单，**Then** 可以配置：渠道分类（酒/咖啡/饮料/小食/餐品）、展示名称、渠道价格、主图、详情图、推荐标签、上下架状态

3. **Given** 管理员配置了商品的渠道属性，**When** 保存成功，**Then** 该商品出现在渠道商品列表中，状态为已配置

4. **Given** 商品已配置且状态为"已上架"，**When** 小程序用户浏览商品，**Then** 看到的是渠道配置的展示信息（名称、图片、价格）

5. **Given** 同一 SKU 已在小程序渠道配置，**When** 管理员尝试再次添加该 SKU，**Then** 系统提示"该商品已在此渠道配置，请直接编辑"

---

### User Story 2 - 配置渠道规格选项 (Priority: P1)

作为商品管理员，我希望为渠道商品配置规格选项（如温度、甜度、大小、辣度），这些规格是渠道特定的，不同渠道可以有不同的规格配置。

**Why this priority**: 规格选项直接影响顾客下单体验，是渠道配置的核心能力。

**Independent Test**: 可以独立测试——为商品添加规格 → 配置规格选项和价格调整 → 保存 → 验证小程序端规格选择器。

**Acceptance Scenarios**:

1. **Given** 管理员在商品配置详情页，**When** 点击"规格配置"，**Then** 可以添加多种规格类型：
   - SIZE（大小）：小杯/中杯/大杯
   - TEMPERATURE（温度）：冷/热/去冰
   - SWEETNESS（甜度）：无糖/半糖/标准/多糖
   - TOPPING（配料）：珍珠/椰果/布丁
   - SPICINESS（辣度）：不辣/微辣/中辣/特辣
   - SIDE（配菜）：薯条/沙拉/洋葱圈
   - COOKING（做法）：煎/烤/炸

2. **Given** 管理员配置了 SIZE 规格，**When** 为每个选项设置价格调整，**Then** 大杯 +5 元、中杯 +0 元、小杯 -3 元 生效

3. **Given** 商品配置了多个规格，**When** 顾客在小程序下单，**Then** 可以组合选择规格（如：大杯 + 热 + 半糖 + 加珍珠）

4. **Given** 管理员修改了某个规格选项的价格，**When** 保存后，**Then** 新订单使用新价格，历史订单保留原价格快照

---

### User Story 3 - 管理渠道商品列表 (Priority: P1)

作为商品管理员，我希望查看、筛选、编辑渠道商品列表，以便高效管理小程序销售的所有商品。

**Why this priority**: 列表管理是日常运营的高频操作。

**Acceptance Scenarios**:

1. **Given** 管理员进入渠道商品配置页面，**When** 页面加载，**Then** 显示已配置商品列表，包含：图片、名称、分类、渠道价格、SKU编码、状态、操作按钮

2. **Given** 商品列表显示中，**When** 按分类筛选"咖啡"，**Then** 仅显示分类为咖啡的商品

3. **Given** 管理员点击某商品的"编辑"按钮，**When** 进入编辑表单，**Then** 可以修改所有渠道配置属性，SKU 关联不可修改

4. **Given** 管理员点击某商品的"下架"按钮，**When** 确认操作，**Then** 商品状态变为"已下架"，小程序端不再显示

5. **Given** 管理员点击某商品的"删除"按钮，**When** 确认操作，**Then** 渠道配置记录软删除，SKU 主数据不受影响

---

### User Story 4 - 清理历史饮品配置代码 (Priority: P2)

作为开发团队，我希望清理 `/beverage` 相关的历史代码和数据脚本，以便保持代码库整洁，避免历史代码污染项目。

**Why this priority**: 技术债务清理，在核心功能稳定后执行。

**Acceptance Scenarios**:

1. **Given** 渠道商品配置功能已上线，**When** 执行清理脚本，**Then** 删除以下文件/目录：
   - `frontend/src/features/beverage-config/`
   - `frontend/src/features/beverage-order-management/` 中的冗余组件
   - 相关路由配置
   - 数据库迁移脚本中的 `beverage_config` 相关表

2. **Given** 清理完成后，**When** 访问旧路径 `/beverage/list`，**Then** 重定向到新路径 `/channel-products/mini-program`

3. **Given** 清理完成后，**When** 运行 `npm run build`，**Then** 编译成功，无遗留引用错误

---

### Edge Cases

- **SKU 被删除**: 如果关联的 SKU 被禁用或删除，渠道配置自动标记为"无效"，不在小程序显示
- **价格冲突**: 渠道价格为空时，自动使用 SKU 基础价格
- **图片缺失**: 渠道图片为空时，自动使用 SKU 主图
- **规格类型扩展**: 支持自定义规格类型，满足不同商品需求

---

## Requirements *(mandatory)*

### Functional Requirements

**渠道商品配置模块**:

- **FR-001**: 系统必须提供 SKU 选择器，仅显示 `sku_type = 'finished_product'` 的 SKU 列表，支持按名称、编码搜索
- **FR-002**: 系统必须支持为 SKU 配置渠道属性：展示名称、渠道分类、渠道价格、主图、详情图、描述
- **FR-003**: 系统必须支持渠道分类：酒(ALCOHOL)、咖啡(COFFEE)、饮料(BEVERAGE)、小食(SNACK)、餐品(MEAL)、其他(OTHER)
- **FR-004**: 系统必须支持为商品配置多种规格类型，每种规格可有多个选项，每个选项可设置价格调整
- **FR-005**: 系统必须支持规格类型：SIZE、TEMPERATURE、SWEETNESS、TOPPING、SPICINESS、SIDE、COOKING
- **FR-006**: 系统必须支持商品状态管理：上架(ACTIVE)、下架(INACTIVE)、缺货(OUT_OF_STOCK)
- **FR-007**: 系统必须支持商品排序、推荐标签设置
- **FR-008**: 系统必须保证同一 SKU 在同一渠道只能配置一次（UNIQUE 约束）
- **FR-009**: 系统必须在渠道价格为空时自动使用 SKU 基础价格
- **FR-010**: 系统必须在渠道图片为空时自动使用 SKU 主图

**列表与筛选**:

- **FR-011**: 系统必须提供渠道商品列表页，支持分页显示（每页 20 条）
- **FR-012**: 系统必须支持按渠道分类、状态、名称筛选商品
- **FR-013**: 系统必须在列表中显示：图片、名称、分类、渠道价格、SKU编码、状态、规格数量

**小程序端集成**:

- **FR-014**: 小程序端必须从 `channel_product_config` 获取商品数据，不再从 `beverages` 表获取
- **FR-015**: 小程序端必须只显示状态为 ACTIVE 的商品
- **FR-016**: 小程序端必须支持规格选择，并正确计算价格

**历史代码清理**:

- **FR-017**: 系统必须删除 `frontend/src/features/beverage-config/` 目录
- **FR-018**: 系统必须删除 `beverages`、`beverage_specs`、`beverage_recipes` 等历史表
- **FR-019**: 系统必须将 `/beverage/*` 路由重定向到新路径
- **FR-020**: 系统必须更新菜单配置，移除"饮品管理"入口，添加"渠道商品配置"入口

### Key Entities

- **ChannelProductConfig（渠道商品配置）**: 核心实体，关联 SKU 与渠道配置
- **ChannelProductSpec（渠道商品规格）**: 规格配置，包含规格类型和选项列表
- **ChannelCategory（渠道分类）**: 渠道内的商品分类（酒、咖啡、饮料、小食、餐品）
- **ChannelType（渠道类型）**: 销售渠道标识（MINI_PROGRAM、POS、DELIVERY）

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 管理员可以在 3 分钟内完成一个新商品的渠道配置（选择SKU → 配置属性 → 配置规格 → 保存）
- **SC-002**: 渠道商品列表加载时间 ≤ 1 秒（分页 20 条）
- **SC-003**: 小程序端商品数据与后台配置同步延迟 ≤ 5 秒
- **SC-004**: 规格组合计算准确率 100%（基础价 + 规格调整 = 最终价格）
- **SC-005**: 历史代码清理后，前端打包体积减少 ≥ 50KB
- **SC-006**: 清理后零编译错误、零运行时错误

---

## Dependencies

- **P001-sku-master-data**: 依赖 SKU 主数据的 `finished_product` 类型
- **O003-beverage-order**: 小程序点餐功能需要适配新的数据源
- **O004-beverage-sku-reuse**: 本规格是 O004 的改进版本，替代其部分设计

---

## Assumptions

- SKU 主数据管理功能已正常运行
- 小程序点餐功能可以适配新的数据源
- 历史饮品数据可以清理，无需迁移

---

## Out of Scope

- 线下 POS 渠道配置（未来扩展）
- 外卖平台渠道配置（未来扩展）
- 渠道商品库存管理（使用 SKU 库存）
- 渠道商品成本核算（使用 SKU BOM 成本）

---

## 页面路径设计

| 功能 | 路径 | 说明 |
|------|------|------|
| 渠道商品列表 | `/channel-products/mini-program` | 小程序点餐渠道商品配置 |
| 新增商品 | `/channel-products/mini-program/create` | 选择 SKU 并配置渠道属性 |
| 编辑商品 | `/channel-products/mini-program/:id/edit` | 编辑渠道配置 |
| 规格配置 | 抽屉/弹窗 | 配置商品规格选项 |

---

## 菜单配置

```typescript
// 新增菜单项
{
  key: '/channel-products',
  label: '渠道商品配置',
  icon: <ShoppingOutlined />,
  children: [
    {
      key: '/channel-products/mini-program',
      label: '小程序商品',
    },
    // 未来扩展
    // { key: '/channel-products/pos', label: 'POS商品' },
    // { key: '/channel-products/delivery', label: '外卖平台商品' },
  ],
}

// 移除旧菜单项
// { key: '/beverage/list', label: '饮品管理' }  // 删除
```

---

**总结**: 本规格定义了渠道商品配置功能，采用 SKU 主数据 + 渠道配置的分层架构，解决了 O004 设计中编辑功能被禁用、渠道配置能力丢失的问题。同时包含历史代码清理任务，确保代码库整洁。
