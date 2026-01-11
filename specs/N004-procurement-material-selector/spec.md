# Feature Specification: 采购订单物料选择器改造

**Feature Branch**: `N004-procurement-material-selector`
**Created**: 2026-01-11
**Status**: Draft
**Input**: 基于M001 继续开发新的spec 按照当前数据模型设计：

```
采购场景          应该选择           单位来源
原料采购          Material（物料）    purchaseUnit（采购单位）
包材采购          Material（物料）    purchaseUnit（采购单位）
成品采购（罕见）   SKU                mainUnit
```

实际业务中，采购主要是原料和包材，成品是自己生产的不需要采购。

建议方案：
- 采购订单选择器替换为 Material 选择器
- 或者提供双选择器（Material + SKU 可选）

## Clarifications

### Session 2026-01-11

- **Q**: 在 `mode="dual"` 模式下，用户如何在"物料"和"成品 SKU"两个列表之间切换？ → **A**: 使用标签页导航（Tab-based navigation）- 顶部横向标签页（"物料" / "成品 SKU"），点击标签页切换内容面板，符合 Ant Design `<Tabs>` 组件的交互习惯

## User Scenarios & Testing

### User Story 1 - 原料/包材采购订单创建 (Priority: P1)

作为**采购管理员**，我需要在创建采购订单时直接选择物料（Material）而非 SKU，并且系统自动带出物料的采购单位（purchaseUnit），这样我就可以按照实际业务中的采购场景（如原料采购、包材采购）快速创建订单，无需关心 SKU 概念。

**Why this priority**: 原料和包材采购占据采购业务的 95%，是采购系统的核心场景。当前系统强制使用 SKU 选择器导致用户体验差，用户需要在 SKU 列表中查找对应的物料，效率低下且容易出错。直接使用 Material 选择器可以显著提升采购管理员的工作效率。

**Independent Test**: 可以通过创建一个原料采购订单（如采购"可乐糖浆"）独立测试。成功标准：用户可以从 Material 列表中选择物料，系统自动带出采购单位（如"瓶"），用户输入数量后成功创建采购订单明细。

**Acceptance Scenarios**:

1. **Given** 采购管理员进入采购订单创建页面，**When** 点击"添加明细行"并选择物料类型为"原料"，**Then** 商品选择器显示物料列表（按类别筛选：原料），并可搜索物料名称或编码（如"MAT-RAW-001"）
2. **Given** 用户选择物料"可乐糖浆（MAT-RAW-001）"，**When** 确认选择，**Then** 系统自动填充采购单位为该物料的 `purchaseUnit`（如"瓶"），并显示库存单位 `inventoryUnit`（如"ml"）供参考
3. **Given** 用户输入采购数量"10"（瓶），**When** 保存明细行，**Then** 系统创建采购订单明细，类型为 `MATERIAL`，`material_id` 指向该物料，`sku_id` 为空
4. **Given** 采购订单已创建，**When** 采购管理员查看订单详情，**Then** 系统显示物料名称、规格、采购单位、采购数量，以及自动计算的换算后库存数量（如 10 瓶 = 5000ml）

---

### User Story 2 - 成品采购订单创建（罕见场景） (Priority: P2)

作为**采购管理员**，在罕见的成品采购场景下（如外购成品用于促销活动），我需要能够选择 SKU 而非 Material，并且系统使用 SKU 的 `mainUnit` 作为采购单位，这样我就可以灵活应对少数非常规采购需求。

**典型成品采购场景**：
- 听装饮料（听装可乐、听装啤酒）- 无法自己罐装，直接采购成品
- 潮玩/周边商品（电影盲盒、品牌玩具）- 用于影院商品区销售
- 包装零食（薯片、巧克力）- 已包装成品，直接采购
- 其他无需再加工的成品（冰淇淋、图书、文创产品）

**Why this priority**: 成品采购仅占采购业务的 5%，是非核心场景。优先级低于原料/包材采购，但需要支持以保证系统的完整性。

**Independent Test**: 可以通过创建一个成品采购订单（如采购"可口可乐中杯"SKU）独立测试。成功标准：用户可以从 SKU 列表中选择商品，系统自动带出 SKU 的 `mainUnit`，用户输入数量后成功创建采购订单明细。

**Acceptance Scenarios**:

1. **Given** 采购管理员进入采购订单创建页面，**When** 点击"添加明细行"并选择物料类型为"成品"，**Then** 商品选择器显示 SKU 列表，并可搜索 SKU 名称或编码
2. **Given** 用户选择 SKU"可口可乐中杯"，**When** 确认选择，**Then** 系统自动填充采购单位为该 SKU 的 `mainUnit`（如"杯"）
3. **Given** 用户输入采购数量"100"（杯），**When** 保存明细行，**Then** 系统创建采购订单明细，类型为 `SKU`，`sku_id` 指向该商品，`material_id` 为空

---

### User Story 3 - 采购入库自动单位换算 (Priority: P1)

作为**仓库管理员**，当我执行采购入库操作时，系统需要自动将采购数量（按采购单位）换算为库存数量（按库存单位），并记录到库存表中，这样我就无需手动计算换算率，减少人工错误。

**Why this priority**: 单位换算是采购入库的核心功能，直接影响库存数据的准确性。如果换算错误，会导致库存数据不准确，进而影响销售、生产等下游业务。

**Independent Test**: 可以通过创建一个包含物料明细的采购订单，执行入库操作独立测试。成功标准：系统调用 M001 的 `CommonConversionService` 进行单位换算，将采购数量（如 10 瓶）换算为库存数量（如 5000ml），并正确记录到库存表。

**Acceptance Scenarios**:

1. **Given** 仓库管理员对一个原料采购订单执行入库操作，订单包含明细"可乐糖浆 10 瓶"（物料的 `purchaseUnit` 为"瓶"，`inventoryUnit` 为"ml"，`conversion_rate` 为 500），**When** 点击"确认入库"，**Then** 系统调用 `CommonConversionService.convert("瓶", "ml", 10)` 得到 5000ml，并在库存表中新增或更新记录（`inventory_item_type` = `MATERIAL`，`material_id` = 该物料 ID，`quantity` = 5000，`unit` = "ml"）
2. **Given** 物料设置了 `use_global_conversion = true`（使用全局换算规则），全局换算规则中"1L = 1000ml"，**When** 仓库管理员对该物料执行入库操作（采购单位"L"，库存单位"ml"），**Then** 系统使用全局换算规则进行转换（如 2L → 2000ml）
3. **Given** 物料设置了 `use_global_conversion = false`（使用物料级换算率），物料的 `conversion_rate` 为 500（1 瓶 = 500ml），**When** 仓库管理员对该物料执行入库操作，**Then** 系统优先使用物料级换算率而非全局规则
4. **Given** 换算过程中发生错误（如单位不兼容："kg" 无法换算为"ml"），**When** 系统调用 `CommonConversionService.convert()`，**Then** 系统抛出异常并阻止入库，向用户提示"单位换算失败：kg 无法换算为 ml，请检查物料配置"

---

### User Story 4 - 前端物料/SKU 双选择器组件 (Priority: P2)

作为**前端开发人员**，我需要一个可复用的物料/SKU 选择器组件，支持根据业务场景动态切换选择模式（Material Only / SKU Only / Material + SKU Dual），这样我就可以在采购订单、BOM 配方、库存调整等多个模块中复用该组件，减少重复开发。

**Why this priority**: 前端组件的复用性是长期收益，但不影响核心业务流程。优先级低于后端数据模型改造和单位换算功能。

**Independent Test**: 可以通过在 Storybook 中独立展示该组件的不同模式进行测试。成功标准：组件支持三种模式切换，数据加载正常，搜索筛选功能正常，选择回调正确返回选中的 Material 或 SKU 对象。

**Acceptance Scenarios**:

1. **Given** 开发人员在采购订单页面使用 `<MaterialSkuSelector mode="material-only" />` 组件，**When** 用户点击选择器，**Then** 弹出物料列表，仅显示 Material 数据，不显示 SKU
2. **Given** 开发人员在 BOM 配方页面使用 `<MaterialSkuSelector mode="dual" />` 组件，**When** 用户点击选择器，**Then** 弹出选择器，顶部显示横向标签页导航（使用 Ant Design `<Tabs>`），包含"物料"和"成品 SKU"两个标签页，默认激活"物料"标签页
3. **Given** 用户在 dual 模式选择器中点击"成品 SKU"标签页，**When** 标签页切换完成，**Then** 内容面板切换为 SKU 列表，搜索框保持可用，筛选条件重置
4. **Given** 用户在选择器中输入搜索关键词"可乐"，**When** 按下回车，**Then** 系统在当前激活的标签页（物料或 SKU）中搜索名称、编码、规格字段，返回匹配结果（如"可乐糖浆 MAT-RAW-001"或"可口可乐中杯"SKU）
5. **Given** 用户选择一个物料或 SKU，**When** 点击确认，**Then** 组件触发 `onChange` 回调，返回包含 `type`（MATERIAL/SKU）和 `data`（完整对象）的结果

---

### Edge Cases

- **What happens when** 用户在采购订单中同时选择了 Material 和 SKU 明细行？
  - 系统允许同一订单包含多种类型的明细行，后端通过 `item_type` 字段区分

- **How does system handle** 物料的 `purchaseUnit` 和 `inventoryUnit` 相同的情况（如都是"kg"）？
  - 系统调用 `CommonConversionService.convert("kg", "kg", 10)` 返回原值 10，无需换算

- **What happens when** 物料的 `purchaseUnit` 或 `inventoryUnit` 未设置（为空）？
  - 系统在创建采购订单时进行前端验证，要求物料必须设置采购单位和库存单位，否则不允许选择该物料

- **How does system handle** 采购订单明细的 `material_id` 和 `sku_id` 同时为空的情况？
  - 数据库层面通过 CHECK 约束阻止插入（`CHECK (material_id IS NOT NULL OR sku_id IS NOT NULL)`），如果违反约束，抛出异常

- **What happens when** 用户修改已存在的采购订单明细，将 Material 改为 SKU 或反之？
  - 系统视为删除旧明细 + 新增新明细，后端更新时同步更新 `item_type`、`material_id`、`sku_id` 三个字段，确保互斥性

- **How does system handle** Material 被删除后，历史采购订单仍引用该 Material 的情况？
  - 使用软删除策略（`deleted_at` 字段），Material 标记为删除后，前端选择器不显示该物料，但历史订单仍可查看物料名称（通过冗余字段 `material_name`）

- **What happens when** 采购入库时，`CommonConversionService` 无法找到对应的换算规则？
  - 系统抛出 `IllegalArgumentException("No conversion rule found from 瓶 to ml")`，前端捕获异常并提示用户"单位换算规则缺失，请联系管理员配置"

## Requirements

### Functional Requirements

#### 数据模型改造

- **FR-001**: 采购订单明细表（`purchase_order_items`）MUST 增加 `material_id` 字段（UUID，外键引用 `material.id`，可为空）
- **FR-002**: 采购订单明细表 MUST 增加 `item_type` 字段（枚举：`MATERIAL` / `SKU`），用于区分明细行类型
- **FR-003**: 采购订单明细表 MUST 确保 `material_id` 和 `sku_id` 互斥（有且仅有一个非空），通过数据库 CHECK 约束实现：`CHECK ((material_id IS NOT NULL AND sku_id IS NULL) OR (material_id IS NULL AND sku_id IS NOT NULL))`
- **FR-004**: 采购订单明细表 MUST 将原 `sku_id` 的 `NOT NULL` 约束改为允许为空（`nullable = true`）
- **FR-005**: 采购订单明细表 MUST 增加 `material_name` 冗余字段（VARCHAR(200)），用于历史数据展示（防止物料删除后无法查看订单）

#### 后端 API 改造

- **FR-006**: 采购订单创建 API（`POST /api/procurement/orders`）MUST 支持明细行包含 `itemType` 字段（枚举："MATERIAL" / "SKU"）
- **FR-007**: 当 `itemType = "MATERIAL"` 时，请求体 MUST 包含 `materialId` 字段（UUID），`skuId` 字段 MUST 为空或不传
- **FR-008**: 当 `itemType = "SKU"` 时，请求体 MUST 包含 `skuId` 字段（UUID），`materialId` 字段 MUST 为空或不传
- **FR-009**: 后端 MUST 在保存采购订单明细前进行验证：如果 `itemType = "MATERIAL"` 但 `materialId` 为空，或 `itemType = "SKU"` 但 `skuId` 为空，抛出 `ValidationException("Item type and ID mismatch")`

#### 单位换算集成

- **FR-010**: 采购入库 MUST 调用 M001 的 `CommonConversionService.convert(fromUnit, toUnit, value)` 进行单位换算
- **FR-011**: 当明细行类型为 `MATERIAL` 时，系统 MUST 将采购数量（`purchaseUnit`）换算为库存数量（`inventoryUnit`），换算规则优先级为：物料级换算率（`material.conversion_rate`）> 全局换算规则（`unit_conversions` 表）
- **FR-012**: 当明细行类型为 `SKU` 时，系统 MUST 使用 SKU 的 `mainUnit` 作为库存单位，无需换算（采购单位 = 库存单位）
- **FR-013**: 如果换算失败（如单位不兼容），系统 MUST 抛出异常并阻止入库，记录错误日志：`"Unit conversion failed: cannot convert {fromUnit} to {toUnit} for material {materialId}"`

#### 前端选择器

- **FR-014**: 前端 MUST 提供可复用组件 `<MaterialSkuSelector />`，支持三种模式：
  - `mode="material-only"`: 仅显示物料列表
  - `mode="sku-only"`: 仅显示 SKU 列表
  - `mode="dual"`: 双选择器，使用 Ant Design `<Tabs>` 组件实现横向标签页导航，提供"物料"和"成品 SKU"两个标签页，默认激活"物料"标签页，点击标签页切换内容面板
- **FR-014.1**: 在 `mode="dual"` 模式下，切换标签页时 MUST 重置筛选条件（类别筛选、搜索关键词），避免跨类型筛选混淆
- **FR-015**: 物料选择器 MUST 支持按类别筛选（原料 / 包材 / 半成品），通过下拉菜单或 Tag 筛选
- **FR-016**: 选择器 MUST 支持模糊搜索，匹配物料/SKU 的名称、编码、规格字段（不区分大小写）
- **FR-017**: 选择器 MUST 在选择物料后，显示以下信息供用户参考：
  - 物料名称
  - 物料编码（如 `MAT-RAW-001`）
  - 规格（如"5L 装"）
  - 采购单位（如"瓶"）
  - 库存单位（如"ml"）
  - 换算率（如"1 瓶 = 500ml"）

#### 数据验证

- **FR-018**: 系统 MUST 在前端和后端双重验证：选择的物料必须已配置 `purchaseUnit` 和 `inventoryUnit`，否则提示"该物料尚未配置采购单位或库存单位，无法采购"
- **FR-019**: 系统 MUST 在保存采购订单前验证：如果物料的 `use_global_conversion = true`，全局换算规则表（`unit_conversions`）中必须存在对应的换算规则，否则提示"缺少单位换算规则：{purchaseUnit} → {inventoryUnit}，请先配置"
- **FR-020**: 系统 MUST 在采购入库时验证：库存数量必须为正数，否则阻止入库并提示"换算后库存数量为 {value}，不允许为负数或零"

#### 历史数据兼容

- **FR-021**: 对于历史采购订单（已存在的记录，仅有 `sku_id`），系统 MUST 在数据迁移脚本中自动设置 `item_type = "SKU"`，`material_id = NULL`
- **FR-022**: 历史订单查询 API MUST 兼容旧数据格式，当 `item_type = "SKU"` 时，仅返回 SKU 相关信息，不返回物料信息
- **FR-023**: 前端订单详情页 MUST 根据 `item_type` 动态显示物料信息或 SKU 信息（使用条件渲染：`if (itemType === 'MATERIAL') { show Material Info } else { show SKU Info }`）

### Key Entities

#### PurchaseOrderItem（采购订单明细）

**修改后的实体**，支持 Material 和 SKU 双引用：

- **id** (UUID, PK): 主键
- **purchase_order_id** (UUID, FK): 外键，引用采购订单表
- **item_type** (ENUM): 明细类型，枚举值 `MATERIAL` / `SKU`（新增）
- **material_id** (UUID, FK, nullable): 外键，引用物料表（新增）
- **sku_id** (UUID, FK, nullable): 外键，引用 SKU 表（修改为可为空）
- **material_name** (VARCHAR(200), nullable): 物料名称冗余字段（新增，用于历史数据展示）
- **quantity** (DECIMAL(12,3)): 采购数量
- **unit** (VARCHAR(20)): 采购单位（从 Material 的 `purchaseUnit` 或 SKU 的 `mainUnit` 获取）
- **unit_price** (DECIMAL(12,2)): 单价
- **total_price** (DECIMAL(12,2)): 总价

**约束条件**:
- `CHECK ((material_id IS NOT NULL AND sku_id IS NULL) OR (material_id IS NULL AND sku_id IS NOT NULL))`: 确保 `material_id` 和 `sku_id` 互斥
- `item_type` 必须与 `material_id` / `sku_id` 的填充情况一致（通过应用层验证）

#### Material（物料）

引用 M001 的物料实体，关键字段：

- **id** (UUID, PK): 主键
- **code** (VARCHAR(50)): 物料编码（如 `MAT-RAW-001`）
- **name** (VARCHAR(200)): 物料名称
- **category** (ENUM): 类别（`RAW_MATERIAL` / `PACKAGING` / `SEMI_FINISHED`）
- **specification** (VARCHAR(500)): 规格
- **purchase_unit_id** (UUID, FK): 采购单位 ID
- **inventory_unit_id** (UUID, FK): 库存单位 ID
- **conversion_rate** (DECIMAL(12,6)): 物料级换算率（采购单位 → 库存单位）
- **use_global_conversion** (BOOLEAN): 是否使用全局换算规则

#### Inventory（库存）

引用 M001 的库存实体，关键字段：

- **inventory_item_type** (ENUM): 库存类型（`MATERIAL` / `SKU`）
- **material_id** (UUID, FK, nullable): 物料 ID
- **sku_id** (UUID, FK, nullable): SKU ID
- **quantity** (DECIMAL(12,3)): 库存数量（按库存单位计量）
- **unit** (VARCHAR(20)): 库存单位

## Success Criteria

### Measurable Outcomes

- **SC-001**: 采购管理员可以在 5 分钟内创建一个包含 10 个物料明细的采购订单，无需手动计算换算率（相比当前使用 SKU 选择器，操作时间减少 50%）
- **SC-002**: 95% 的采购订单明细使用 Material 类型（原料 + 包材），仅 5% 使用 SKU 类型（成品），符合实际业务场景
- **SC-003**: 采购入库自动换算准确率达到 100%（无换算错误或单位不匹配错误）
- **SC-004**: 前端 `<MaterialSkuSelector />` 组件在采购订单、BOM 配方、库存调整三个模块中成功复用，减少重复代码 60%
- **SC-005**: 历史采购订单（已有的 SKU 类型订单）在系统升级后仍可正常查询和展示，数据兼容性达到 100%
- **SC-006**: 用户在采购订单创建过程中通过选择器找到目标物料的时间从平均 30 秒降低到 10 秒（通过模糊搜索和类别筛选功能）

### Non-Functional Requirements

- **NFR-001**: 物料选择器 API（`GET /api/materials?category=RAW_MATERIAL&search=可乐`）响应时间 P95 ≤ 500ms（在 10000 条物料数据下）
- **NFR-002**: 采购入库单位换算调用 `CommonConversionService` 的性能开销 ≤ 10ms（单次换算）
- **NFR-003**: 数据库迁移脚本（新增 `material_id`、`item_type` 字段）在 100000 条历史订单明细数据下执行时间 ≤ 5 分钟

## Assumptions & Dependencies

### Assumptions

- M001 的物料主数据模型已完成开发并上线，`material` 表包含 `purchase_unit_id`、`inventory_unit_id`、`conversion_rate` 字段
- M001 的 `CommonConversionService` 已实现并可用，支持物料级换算和全局换算
- 当前采购订单表（`purchase_orders`）和明细表（`purchase_order_items`）已存在，仅需修改明细表 schema
- 前端使用 React + Ant Design + TanStack Query 技术栈，可开发可复用组件
- 用户已熟悉物料主数据管理功能（C002 或 M001），知道如何创建和配置物料

### Dependencies

- **M001-material-unit-system**: 依赖物料实体、单位字段、`CommonConversionService`
- **C002-unit-management**（如存在）: 依赖全局单位和换算规则配置功能
- **N001-purchase-order**（如存在）: 依赖当前采购订单的基础功能（订单创建、查询、入库流程）
- **Flyway Database Migration**: 依赖 Flyway 工具执行 schema 变更脚本
- **Backend Spring Boot**: 依赖 Spring Data JPA 进行实体映射和数据库操作

### Risks

- **风险 1**: 如果历史订单数据量巨大（> 500000 条），数据迁移脚本可能执行时间过长，需要考虑分批迁移
  - 缓解措施：使用批量更新（batch update）分批次迁移，每批次 10000 条
- **风险 2**: 如果物料的 `purchaseUnit` 和 `inventoryUnit` 配置不完整，可能导致大量物料无法采购
  - 缓解措施：提供数据完整性检查脚本，在功能上线前扫描所有物料，确保 95% 以上的物料配置了采购单位和库存单位
- **风险 3**: 如果 `CommonConversionService` 性能不佳，可能影响采购入库速度
  - 缓解措施：对换算服务进行性能测试，确保 P95 响应时间 ≤ 10ms；如有必要，增加缓存层（如 Redis 缓存换算规则）

## Open Questions

- **Q1**: 是否需要支持批量导入采购订单（如 Excel 导入）？如果需要，导入文件中应该使用物料编码（`material_code`）还是物料 ID（`material_id`）？
  - 建议：支持物料编码导入，更符合用户习惯
- **Q2**: 前端选择器是否需要支持"最近使用"功能（显示用户最近选择的 10 个物料/SKU）以提升效率？
  - 建议：作为 P3 优先级功能，可在后续迭代中实现
- **Q3**: 如果物料被软删除（`deleted_at` 不为空），历史采购订单是否仍应显示该物料的完整信息（名称、规格、编码）？
  - 建议：通过 `material_name` 冗余字段保留历史信息，即使物料已删除
