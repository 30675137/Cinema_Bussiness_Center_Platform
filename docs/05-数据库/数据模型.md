# 数据模型文档（整合版）

## 文档信息
- 生成时间: 2025-12-22 12:47:18
- 数据来源: specs/ 目录下所有规格
- 总实体数: 375
- 处理规格数: 24

## 核心实体

### 1 ScenarioPackageListItem

**说明**: 场景包列表项

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 1 ScenarioPackageListItemDTO

**说明**: DTO

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 1 scenario_packages 表结构

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 1 当前阶段

**说明**: 一对多

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### 1 必填字段

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 1 未来可能新增的字段

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 1 表结构

**说明**: Supabase / PostgreSQL

**来源规格**: 014-hall-store-backend

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK, 默认 `gen_random_uuid()` | 影厅主键 |  |
| store_id | UUID | NOT NULL, FK → `stores.id` | 所属门店主键 |  |
| code | TEXT | NOT NULL | 影厅编码（可选唯一，按门店范围约束） |  |
| name | TEXT | NOT NULL | 影厅名称 |  |
| type | TEXT | NOT NULL | 影厅类型：`VIP/CP/Party/Public` 等 |  |
| capacity | INTEGER | NOT NULL | 可容纳人数（> 0） |  |
| tags | TEXT[] | NULLABLE | 标签列表（如“真皮沙发”“KTV设备”） |  |
| status | TEXT | NOT NULL, 默认 `'active'` | 影厅状态：`active/inactive/maintenance` 等 |  |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 创建时间 |  |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新时间 |  |

---

### 1 门店列表响应

**说明**: TODO: 待补充说明

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### 2 ApiResponse

**说明**: 统一响应格式

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 2 业务规则与验证

**说明**: TODO: 待补充说明

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### 2 分页支持

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 2 可选字段

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 2 按门店查询影厅列表响应

**说明**: TODO: 待补充说明

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### 2 未来扩展

**说明**: 仅备注，不在本期实现

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### 2 查询示例

**说明**: Supabase REST API 或 SDK

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 3 Zod Schema

**说明**: 运行时验证

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 3 字段命名规范

**说明**: TODO: 待补充说明

**来源规格**: 014-hall-store-backend

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | `id` | `id` |  |  |
| store_id | `storeId` | `storeId` |  |  |
| created_at | `createdAt` | `createdAt` |  |  |
| updated_at | `updatedAt` | `updatedAt` |  |  |

---

### 3 过滤和排序

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 4 错误处理

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### <EntityName>

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| [field.name] | [field.type] | [field.required] | [field.description] | [field.constraints] |

---

### API 响应示例

**说明**: TODO: 待补充说明

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### API 接口类型定义

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### API 端点

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### API响应格式

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### Access Control

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### Action 类型定义

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### Attribute

**说明**: 属性

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### AttributeTemplate

**说明**: 属性模板

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### Barcode

**说明**: 条码

**来源规格**: 005-sku-management

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | `string` | 是 | 条码唯一标识符 | UUID格式 |
| barcode | `string` | 是 | 条码值 | 唯一，不能与其他SKU重复，格式校验 |
| remark | `string` | 否 | 备注 | 长度0-200字符 |

---

### Brand

**说明**: 品牌实体

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### BrandStatusTransition

**说明**: 品牌状态转换记录

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### BrandUsageStatistics

**说明**: 品牌使用统计

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### Business Rules

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### CLI 参数结构

**说明**: TODO: 待补充说明

**来源规格**: 012-set-config-enhancement

**字段定义**: TODO: 待从规格中提取

---

### Cascade Operations

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### Category

**说明**: 类目

**来源规格**: 007-category-management

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| level | 只读，由系统根据父类目自动计算 | - |  (来源: 007-category-management-by-claude) |  |
| parentId | 可为空（一级类目），如果存在则必须引用有效类目 | 上级类目不存在 |  (来源: 007-category-management-by-claude) |  |
| sortOrder | 可选，必须为非负整数，默认按创建时间排序 | 排序序号必须为非负整数 |  (来源: 007-category-management-by-claude) |  |
| status | 必填，默认为enabled | - |  (来源: 007-category-management-by-claude) |  |

---

### CategoryAttribute

**说明**: 类目属性

**来源规格**: 007-category-management-by-claude

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| type | 必填，为预定义的四种类型之一 | 属性类型无效 |  |  |
| optionalValues | 当type为select类型时必填，数组不能为空 | 单选/多选类型必须提供可选值 |  |  |
| sortOrder | 必填，必须为非负整数 | 排序序号必须为非负整数 |  |  |

---

### CategoryTree

**说明**: 类目树节点

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### Claude 配置文件

**说明**: `~/.claude/settings.json`

**来源规格**: 012-set-config-enhancement

**字段定义**: TODO: 待从规格中提取

---

### ComponentModernizationConfig

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### Configuration

**说明**: 配置根对象

**来源规格**: 008-env-preset-commands

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| version | string | 是 | 配置文件格式版本 | 格式: "主版本.次版本" |
| presets | object | 是 | 预设集合（键为预设名） | 至少0个预设 |
| settings | object | 否 | 全局设置 | - |

---

### Configuration Data Structures

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Core Entities

**说明**: from Spec

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### DTO 扩展

**说明**: backend/src/main/java/com/cinema/scenariopackage/dto/

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### DTO: `StoreReservationSettingsDTO`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Data Flow

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### Data Flow Summary

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Data Integrity Rules

**说明**: TODO: 待补充说明

**来源规格**: 017-scenario-package

**字段定义**: TODO: 待从规格中提取

---

### Default Values

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### DictionaryItem

**说明**: 字典项

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### DictionaryType

**说明**: 字典类型

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### Edge Cases

**说明**: TODO: 待补充说明

**来源规格**: 012-set-config-enhancement

**字段定义**: TODO: 待从规格中提取

---

### Entities

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### Entity: `StoreReservationSettings`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### EnvironmentVariables

**说明**: 环境变量集合

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### Error Handling

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### Error Handling Strategy

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Field Descriptions

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Frontend Type Definitions

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Frontmatter

**说明**: YAML 格式

**来源规格**: 001-skill-doc-generator

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| description | String | 是 | 触发条件说明 | 第三人称，包含具体触发短语 |
| version | String | 是 | 语义化版本号 | 格式：major.minor.patch |

---

### Future Extensions

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### GET /api/stores

**说明**: 列表

**来源规格**: 020-store-address

**字段定义**: TODO: 待从规格中提取

---

### GET /api/stores/{id}

**说明**: 详情

**来源规格**: 020-store-address

**字段定义**: TODO: 待从规格中提取

---

### Hall ↔ ScheduleEvent

**说明**: TODO: 待补充说明

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### Hall（影厅）

**说明**: TODO: 待补充说明

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### Initial Data Example

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### Initial Mock Data

**说明**: TODO: 待补充说明

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### Install Flow

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Installation Detection

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### JSON 解析错误

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### JSON 配置文件

**说明**: 用户提供的文件

**来源规格**: 012-set-config-enhancement

**字段定义**: TODO: 待从规格中提取

---

### Java 类型定义

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### LocalStorage Keys

**说明**: TODO: 待补充说明

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### LocalStorage数据版本

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### LocalStorage边缘情况

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### MSW Handlers

**说明**: TODO: 待补充说明

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### Metadata

**说明**: 元数据

**来源规格**: 008-env-preset-commands

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| created | string | 否 | 创建时间戳 | ISO 8601 格式 |
| modified | string | 否 | 最后修改时间戳 | ISO 8601 格式 |
| description | string | 否 | 预设描述 | 最多200字符 |

---

### Mock API响应示例

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### Mock Data Structure

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### Mock数据

**说明**: TODO: 待补充说明

**来源规格**: 001-ui-framework-upgrade

**字段定义**: TODO: 待从规格中提取

---

### Mock数据加载失败处理

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### Mock数据文件结构

**说明**: TODO: 待补充说明

**来源规格**: 001-ui-framework-upgrade

**字段定义**: TODO: 待从规格中提取

---

### Mock数据生成器使用

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### Mock数据生成器接口

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### Mock数据生成策略

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### Mock数据生成规则

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### Mock数据示例

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### Mock用户

**说明**: MockUser

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### Mock用户验证

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### ModernizationProgress

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### Next Steps

**说明**: TODO: 待补充说明

**来源规格**: 017-scenario-package

**字段定义**: TODO: 待从规格中提取

---

### Notes

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### PackageBenefit

**说明**: 场景包硬权益

**来源规格**: 017-scenario-package

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK | 硬权益 ID |  |
| package_id | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE | 场景包 ID |  |
| benefit_type | VARCHAR(50) | NOT NULL | 类型：DISCOUNT_TICKET/FREE_SCREENING |  |
| discount_rate | DECIMAL(5,2) | NULLABLE, CHECK (0 < discount_rate ≤ 1) | 折扣率（如 0.75 表示 75 折） |  |
| free_count | INTEGER | NULLABLE, CHECK (>= 0) | 免费场次数量 |  |
| description | TEXT | NULLABLE | 权益描述 |  |
| sort_order | INTEGER | DEFAULT 0 | 排序序号 |  |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |  |

---

### PackageHallAssociation

**说明**: 场景包-影厅关联

**来源规格**: 017-scenario-package

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK | 关联 ID |  |
| package_id | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE | 场景包 ID |  |
| hall_type_id | UUID | FK (`hall_types.id`) ON DELETE RESTRICT | 影厅类型 ID |  |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |  |

---

### PackageItem

**说明**: 场景包软权益 - 单品

**来源规格**: 017-scenario-package

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK | 单品项 ID |  |
| package_id | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE | 场景包 ID |  |
| item_id | UUID | FK (`items.id`) ON DELETE RESTRICT | 单品主数据 ID |  |
| quantity | INTEGER | NOT NULL, CHECK (> 0) | 数量 |  |
| item_name_snapshot | VARCHAR(255) | NOT NULL | 单品名称快照（添加时的名称） |  |
| item_price_snapshot | DECIMAL(10,2) | NOT NULL | 单品价格快照（添加时的价格） |  |
| sort_order | INTEGER | DEFAULT 0 | 排序序号 |  |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |  |

---

### PackagePricing

**说明**: 场景包定价

**来源规格**: 017-scenario-package

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK | 定价 ID |  |
| package_id | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE, UNIQUE | 场景包 ID（1:1 关系） |  |
| package_price | DECIMAL(10,2) | NOT NULL, CHECK (> 0) | 打包一口价 |  |
| reference_price_snapshot | DECIMAL(10,2) | NULLABLE | 参考总价快照（保存时计算） |  |
| discount_percentage | DECIMAL(5,2) | NULLABLE | 优惠比例（%），自动计算 |  |
| discount_amount | DECIMAL(10,2) | NULLABLE | 优惠金额，自动计算 |  |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |  |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |  |

---

### PackageRule

**说明**: 场景包规则

**来源规格**: 017-scenario-package

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK | 规则 ID |  |
| package_id | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE, UNIQUE | 关联的场景包 ID（1:1 关系） |  |
| duration_hours | DECIMAL(5,2) | NOT NULL, CHECK (> 0) | 时长（小时），支持小数（如 2.5 小时） |  |
| min_people | INTEGER | NULLABLE, CHECK (>= 0) | 最小人数，NULL 表示不限 |  |
| max_people | INTEGER | NULLABLE, CHECK (>= min_people OR NULL) | 最大人数，NULL 表示不限 |  |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |  |

---

### PackageService

**说明**: 场景包服务项目

**来源规格**: 017-scenario-package

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK | 服务项 ID |  |
| package_id | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE | 场景包 ID |  |
| service_id | UUID | FK (`services.id`) ON DELETE RESTRICT | 服务主数据 ID |  |
| service_name_snapshot | VARCHAR(255) | NOT NULL | 服务名称快照 |  |
| service_price_snapshot | DECIMAL(10,2) | NOT NULL | 服务价格快照 |  |
| sort_order | INTEGER | DEFAULT 0 | 排序序号 |  |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |  |

---

### Performance Considerations

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### PerformanceMetrics

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### Persistence Strategy

**说明**: TODO: 待补充说明

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### Preset

**说明**: 预设

**来源规格**: 008-env-preset-commands

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| env_vars | object | 是 | 环境变量键值对 | 至少1个变量 |
| metadata | object | 否 | 预设元数据 | - |

---

### Query Patterns

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### Redux Store 结构

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### Report Data Structures

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Request DTO: `BatchUpdateStoreReservationSettingsRequest`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Request DTO: `UpdateStoreReservationSettingsRequest`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Response DTO: `BatchUpdateResult`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### SKU

**说明**: Stock Keeping Unit

**来源规格**: 005-sku-management

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | `string` | 是 | SKU唯一标识符 | UUID格式，系统自动生成 |
| code | `string` | 是 | SKU编码 | 系统自动生成，唯一 |
| name | `string` | 是 | SKU名称 | 长度1-200字符 |
| spuId | `string` | 是 | 所属SPU ID | 必须关联到已存在的SPU |
| spuName | `string` | 是 | 所属SPU名称 | 继承自SPU |
| brand | `string` | 否 | 品牌 | 继承自SPU，只读 |
| category | `string` | 否 | 类目 | 继承自SPU，只读 |
| spec | `string` | 否 | 规格/型号 | 长度0-200字符 |
| mainUnit | `string` | 是 | 主库存单位 | 从单位管理模块选择 |
| mainBarcode | `string` | 是 | 主条码 | 唯一，不能与其他SKU重复，格式校验（长度、字符类型） |
| otherBarcodes | `Barcode[]` | 否 | 其他条码列表 | 每个条码必须唯一 |
| salesUnits | `SalesUnit[]` | 否 | 销售单位配置 | 每个销售单位需配置换算关系 |
| manageInventory | `boolean` | 是 | 是否管理库存 | 默认值：true |
| allowNegativeStock | `boolean` | 是 | 是否允许负库存 | 默认值：false |
| minOrderQty | `number` | 否 | 最小起订量 | 必须 > 0（如果提供） |
| minSaleQty | `number` | 否 | 最小销售量 | 必须 > 0（如果提供） |
| status | `'draft' \ | 'enabled' \ | 'disabled'` | 是 |
| createdAt | `string` | 是 | 创建时间 | ISO 8601格式 |
| updatedAt | `string` | 是 | 更新时间 | ISO 8601格式 |
| createdBy | `string` | 是 | 创建人 | Mock用户ID |
| updatedBy | `string` | 是 | 更新人 | Mock用户ID |

---

### SKUAttributeValue

**说明**: SKU属性值

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### SKU创建/更新验证

**说明**: TODO: 待补充说明

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### SPU

**说明**: Standard Product Unit

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### SPU 相关类型

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### SPUAttributeValue

**说明**: SPU属性值

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### SPU专用数据生成器

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### SPU管理模块

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### SalesUnit

**说明**: 销售单位

**来源规格**: 005-sku-management

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | `string` | 是 | 销售单位配置唯一标识符 | UUID格式 |
| unit | `string` | 是 | 销售单位名称 | 从单位管理模块选择 |
| conversionRate | `number` | 是 | 换算关系 | 1 销售单位 = X 主库存单位，必须 > 0 |
| enabled | `boolean` | 是 | 是否启用 | 默认值：true |

---

### ScenarioPackage

**说明**: 场景包主表

**来源规格**: 017-scenario-package

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK | 场景包唯一标识（每个版本独立 ID） |  |
| base_package_id | UUID | FK (self), NULLABLE | 指向基础包 ID（所有版本共享），首版本为 NULL |  |
| version | INTEGER | NOT NULL, DEFAULT 1 | 版本号，从 1 开始递增 |  |
| name | VARCHAR(255) | NOT NULL | 场景包名称 |  |
| description | TEXT | NULLABLE | 描述信息 |  |
| background_image_url | TEXT | NULLABLE | 背景图片 URL（Supabase Storage 公开链接） |  |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | 状态：DRAFT/PUBLISHED/UNPUBLISHED |  |
| is_latest | BOOLEAN | NOT NULL, DEFAULT true | 是否为最新版本（查询优化） |  |
| version_lock | INTEGER | NOT NULL, DEFAULT 0 | 乐观锁版本号（防并发冲突） |  |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |  |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |  |
| deleted_at | TIMESTAMPTZ | NULLABLE | 软删除时间戳 |  |
| created_by | VARCHAR(100) | NULLABLE | 创建人（用户 ID 或名称） |  |

---

### Schema 验证失败

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### Security Considerations

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### Set API Key Flow

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Settings

**说明**: 全局设置

**来源规格**: 008-env-preset-commands

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| active_preset | string or null | 否 | null | 当前激活的预设名 |
| mask_sensitive | boolean | 否 | true | 是否掩码敏感值 |

---

### Shell 配置文件

**说明**: Shell Configuration File

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### Shell 配置检测结果

**说明**: ShellConfig

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Skill 元数据结构

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### SkuQueryParams

**说明**: SKU查询参数

**来源规格**: 005-sku-management

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| keyword | `string` | 否 | 关键字搜索（匹配SKU编码、名称、主条码） |  |
| spuId | `string` | 否 | 所属SPU筛选 |  |
| brand | `string` | 否 | 品牌筛选 |  |
| category | `string` | 否 | 类目筛选 |  |
| status | `'draft' \ | 'enabled' \ | 'disabled'` | 否 |
| manageInventory | `boolean` | 否 | 是否管理库存筛选 |  |
| page | `number` | 否 | 页码（从1开始） |  |
| pageSize | `number` | 否 | 每页数量（默认20） |  |
| sortField | `string` | 否 | 排序字段（如：createdAt, status） |  |
| sortOrder | `'asc' \ | 'desc'` | 否 | 排序方向 |

---

### State Management

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Store

**说明**: 扩展

**来源规格**: 020-store-address

**字段定义**: TODO: 待从规格中提取

---

### StoreReservationSettings ↔ Store

**说明**: One-to-One

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Store（门店）

**说明**: TODO: 待补充说明

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### Summary

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### TanStack Query Keys

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### TimelineConfig

**说明**: Global

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### Type Safety

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Type: `BatchUpdateResult`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Type: `BatchUpdateStoreReservationSettingsRequest`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Type: `StoreReservationSettings`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### Type: `UpdateStoreReservationSettingsRequest`

**说明**: TODO: 待补充说明

**来源规格**: 015-store-reservation-settings

**字段定义**: TODO: 待从规格中提取

---

### TypeScript 类型定义

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### TypeScript 配置

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### TypeScriptConfig

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### Uninstall Flow

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Unit

**说明**: 单位

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### Verification Flow

**说明**: TODO: 待补充说明

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### Version 1.0 Schema

**说明**: TODO: 待补充说明

**来源规格**: 010-attribute-dict-management

**字段定义**: TODO: 待从规格中提取

---

### Workflow Steps

**说明**: 工作流程步骤

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### Zod Schema

**说明**: 可选，用于运行时验证

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### Zod Schemas

**说明**: TODO: 待补充说明

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### Zustand Store Structure

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### Zustand Store设计

**说明**: TODO: 待补充说明

**来源规格**: 001-ui-framework-upgrade

**字段定义**: TODO: 待从规格中提取

---

### [endpoint.name]

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| [param.name] | [param.type] | [param.required] | [param.description] | [param.example] |

---

### api_spec.md

**说明**: API 接口文档

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 与其他模块的集成

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 业务约束

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 业务规则

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 业务规则验证

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### 仓库

**说明**: Warehouse

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 仓库门店位置

**说明**: Location

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 使用示例

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 供应商

**说明**: Supplier

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 信息缺口标记规则

**说明**: Missing Info Marking Rules

**来源规格**: 001-skill-doc-generator

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| 枚举值未定义 | `TODO: 待定义枚举值` | `constraints: TODO: 待定义枚举值` |  |  |
| 错误响应缺失 | `TODO: 待定义错误响应` | `**错误响应**：TODO: 待定义错误响应` |  |  |
| 业务规则缺失 | `TODO: 待规格明确业务规则` | `**业务规则**：TODO: 待规格明确业务规则` |  |  |

---

### 信息缺口验证

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 内存管理

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 写入性能

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 冲突处理策略

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 冲突检测规则

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 冲突解决优先级

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 冲突解决策略

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 分类和品牌类型

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 列表组件接口

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 创建新版本

**说明**: 快照复制

**来源规格**: 017-scenario-package

**字段定义**: TODO: 待从规格中提取

---

### 创建预设

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 删除预设

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 前端类型

**说明**: frontend/src/features/scenario-package-management/types/index.ts

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 功能完整性验证

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 单个预设

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 单元测试 fixtures

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 卸载报告

**说明**: UninstallReport

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### 原子写入模式

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 参考

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 变更历史

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 变量匹配验证

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 合并前结构

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 合并后结构

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 响应类型

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 商品

**说明**: Product

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 商品SKU信息

**说明**: ProductSKU

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 地址信息

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 基础类型使用

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 基础路径

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 备份文件

**说明**: Backup File

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 备份流程

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 备份策略

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 备份错误

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 备份验证

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 外键策略

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 多租户支持

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 字段说明

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | UUID | PK, NOT NULL | 关联记录唯一标识 |  |
| package_id | UUID | FK, NOT NULL | 场景包ID，级联删除 |  |
| store_id | UUID | FK, NOT NULL | 门店ID，限制删除 |  |
| created_at | TIMESTAMPTZ | NOT NULL | 创建时间 |  |
| created_by | VARCHAR(100) | NULL | 创建人 |  |

---

### 存储位置

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 存储实现

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 存储策略

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 安全考虑

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 安装方式检测结果

**说明**: InstallationDetection

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### 完整菜单结构示例

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 完整配置

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 实体类

**说明**: backend/src/main/java/com/cinema/scenariopackage/model/

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 实施注意事项

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 实现参考

**说明**: TODO: 待补充说明

**来源规格**: 014-hall-store-backend

**字段定义**: TODO: 待从规格中提取

---

### 审批记录

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 审计日志模块

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 导入语句模式

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 导入路径转换规则

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 导航日志

**说明**: NavigationLog

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 属性模板操作

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### 属性模板类型

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 属性模板规则

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 属性类型扩展

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 工作流程定义

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 工具类型

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 工具类型和常量

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 常量定义

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 并发控制

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 库存台账

**说明**: InventoryLedger

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 库存台账数据生成

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 库存台账验证

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 库存流水

**说明**: InventoryMovement

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 库存流水数据生成

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 库存流水验证

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 库存调整记录

**说明**: InventoryAdjustment

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 影厅资源

**说明**: Hall

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### 性能优化设计

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 性能监控

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 性能考虑

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 总结

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 扩展性考虑

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 扩展性设计

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 批量更新场景包门店关联

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 技术栈

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 排序规则

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 排期事件

**说明**: ScheduleEvent

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### 收货入库单

**说明**: GoodsReceipt

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 敏感数据处理

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 数据

**说明**: DataEntity

**来源规格**: 001-skill-doc-generator

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| description | String | 否 | 实体业务含义 | 从规格描述提取 |
| fields | Field[] | 是 | 字段列表 | 至少包含 1 个字段 |
| businessRules | String[] | 否 | 业务规则列表 | 从规格提取 |
| relationships | Relationship[] | 否 | 与其他实体的关系 | 如 "一对多"、"多对多" |
| sourceSpec | String | 是 | 来源规格文件路径 | 用于冲突检测 |
| type | String | 是 | 数据类型 | 如 "String", "Integer", "Enum" |
| required | Boolean | 是 | 是否必填 | true/false |
| description | String | 否 | 字段说明 | 业务含义 |
| constraints | String | 否 | 约束条件 | 如 "长度 ≤ 100", "唯一" |
| targetEntity | String | 是 | 关联的实体名 | 如 "User", "Store" |
| type | String | 是 | 关系类型 | "一对一", "一对多", "多对多" |
| description | String | 否 | 关系说明 | 如 "一个门店有多个影厅" |

---

### 数据一致性要求

**说明**: TODO: 待补充说明

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### 数据关联

**说明**: TODO: 待补充说明

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### 数据分布

**说明**: TODO: 待补充说明

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### 数据完整性约束

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 数据库 Schema

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 数据持久化

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 数据操作

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### 数据查询

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### 数据流向

**说明**: TODO: 待补充说明

**来源规格**: 018-hall-reserve-homepage

**字段定义**: TODO: 待从规格中提取

---

### 数据流转

**说明**: TODO: 待补充说明

**来源规格**: 001-ui-framework-upgrade

**字段定义**: TODO: 待从规格中提取

---

### 数据生成器核心接口

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 数据生成规则

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 数据示例

**说明**: TODO: 待补充说明

**来源规格**: 001-ui-framework-upgrade

**字段定义**: TODO: 待从规格中提取

---

### 数据结构

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### 数据规模

**说明**: TODO: 待补充说明

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### 数据量处理

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### 数据量规划

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 数据量限制

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 文件操作错误

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 文件权限

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 文件结构

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 文件路径

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 文档信息

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 新增表: scenario_package_store_associations

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 时间轴配置

**说明**: TimelineConfig

**来源规格**: 013-schedule-management

**字段定义**: TODO: 待从规格中提取

---

### 最小配置

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 术语表

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 权限控制

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### 权限错误

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 查询优化

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**: TODO: 待从规格中提取

---

### 查询单个场景包完整信息

**说明**: 含所有关联

**来源规格**: 017-scenario-package

**字段定义**: TODO: 待从规格中提取

---

### 查询参数

**说明**: TODO: 待补充说明

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### 查询场景

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 查询最新版本场景包列表

**说明**: 带筛选

**来源规格**: 017-scenario-package

**字段定义**: TODO: 待从规格中提取

---

### 标准响应格式

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 样式系统配置

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 核心

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 核心实体定义

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 核心技术

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 核心数据

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 核心数据类型定义

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 核心概念

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 格式一致性验证

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 检查门店是否被关联

**说明**: 删除前校验

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 正则表达式错误

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 注入防护

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 测试数据

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 测试文件

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 清理步骤

**说明**: CleanupStep

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### 清理流程

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 源代码文件

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 激活预设

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 版本 1.0 → 2.0

**说明**: 示例

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 环境变量定义

**说明**: Environment Variable Definition

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 现代化进度跟踪

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 用户信息

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 用户偏好设置

**说明**: UserPreferences

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 用户偏好验证

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 用户权限模块

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 电话格式正则

**说明**: TODO: 待补充说明

**来源规格**: 020-store-address

**字段定义**: TODO: 待从规格中提取

---

### 目录结构

**说明**: TODO: 待补充说明

**来源规格**: 001-ui-framework-upgrade

**字段定义**: TODO: 待从规格中提取

---

### 目录结构层次

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 相关文档

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 示例配置文件

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 示例配置文件结构

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 章节匹配规则

**说明**: Section Matching Rules

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 类型守卫和工具函数

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 类型定义

**说明**: TypeScript

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### 类型导出

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### 类目名称规则

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 类目层级规则

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 类目操作

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### 类目查询

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management

**字段定义**: TODO: 待从规格中提取

---

### 类目等级扩展

**说明**: TODO: 待补充说明

**来源规格**: 007-category-management-by-claude

**字段定义**: TODO: 待从规格中提取

---

### 索引策略

**说明**: TODO: 待补充说明

**来源规格**: 003-inventory-management

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| PRIMARY KEY | id | B-tree | 主键查询 (来源: 019-store-association) |  |
| idx_pkg_store_package | package_id | B-tree | 按场景包查询关联 (来源: 019-store-association) |  |
| idx_pkg_store_store | store_id | B-tree | 按门店查询关联 (来源: 019-store-association) |  |
| unique_package_store | (package_id, store_id) | Unique | 防止重复关联 (来源: 019-store-association) |  |

---

### 组件接口定义

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 组件现代化配置

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 结构完整性验证

**说明**: TODO: 待补充说明

**来源规格**: 006-frontend-structure-refactor

**字段定义**: TODO: 待从规格中提取

---

### 结论

**说明**: TODO: 待补充说明

**来源规格**: 001-ui-framework-upgrade

**字段定义**: TODO: 待从规格中提取

---

### 缓存策略

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 编辑预设

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 联系信息

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 获取场景包详情

**说明**: 含门店列表

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 菜单结构验证

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 菜单项

**说明**: MenuItem

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 菜单项验证

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 表单组件接口

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 表单验证使用

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 表单验证规则类型

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 覆盖率验证

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 规格文件

**说明**: SpecificationFile

**来源规格**: 001-skill-doc-generator

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| path | String | 是 | 文件路径 | 格式：`specs/<specId>-<slug>/spec.md` |
| specId | String | 是 | 功能标识符 | 从路径提取 |
| content | String | 是 | Markdown 文本内容 | 通过 Read 工具获取 |
| hasDataModel | Boolean | 是 | 是否包含数据模型章节 | 通过章节匹配判断 |
| hasAPI | Boolean | 是 | 是否包含 API 定义章节 | 通过章节匹配判断 |

---

### 计算实时参考总价

**说明**: TODO: 待补充说明

**来源规格**: 017-scenario-package

**字段定义**: TODO: 待从规格中提取

---

### 认证方式

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 设置级别

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 详情组件接口

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 请求和响应类型

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 读取性能

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 质检相关

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 路由信息

**说明**: RouteInfo

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 输入安全

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### 输入验证

**说明**: TODO: 待补充说明

**来源规格**: 009-brand-management

**字段定义**: TODO: 待从规格中提取

---

### 输出文档结构

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 边缘情况处理

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 通用响应格式

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 通用实体定义

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 通用规范

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 配置合并策略

**说明**: TODO: 待补充说明

**来源规格**: 012-set-config-enhancement

**字段定义**: TODO: 待从规格中提取

---

### 配置文件

**说明**: ClaudeSettings

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### 配置文件不存在

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 配置文件级别

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 配置文件验证

**说明**: TODO: 待补充说明

**来源规格**: 011-uninstall-env-cleanup

**字段定义**: TODO: 待从规格中提取

---

### 配置读取流程

**说明**: TODO: 待补充说明

**来源规格**: 012-set-config-enhancement

**字段定义**: TODO: 待从规格中提取

---

### 采购订单

**说明**: PurchaseOrder

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 银行账户

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 错误处理

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 错误处理策略

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 错误码表

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 错误类型定义

**说明**: TODO: 待补充说明

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 阶段 1: 添加字段

**说明**: TODO: 待补充说明

**来源规格**: 020-store-address

**字段定义**: TODO: 待从规格中提取

---

### 阶段 1: 配置准备

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 阶段 2: 渐进式应用

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 阶段 3: 优化完善

**说明**: TODO: 待补充说明

**来源规格**: 002-upgrade-ant6

**字段定义**: TODO: 待从规格中提取

---

### 阶段 3: 添加索引

**说明**: TODO: 待补充说明

**来源规格**: 020-store-address

**字段定义**: TODO: 待从规格中提取

---

### 附件信息

**说明**: TODO: 待补充说明

**来源规格**: claude-1-purchase-management

**字段定义**: TODO: 待从规格中提取

---

### 面包屑项

**说明**: BreadcrumbItem

**来源规格**: 001-menu-navigation

**字段定义**: TODO: 待从规格中提取

---

### 预设级别

**说明**: TODO: 待补充说明

**来源规格**: 008-env-preset-commands

**字段定义**: TODO: 待从规格中提取

---

### 验证检查项

**说明**: ValidationCheck

**来源规格**: 001-claude-cleanup-script

**字段定义**: TODO: 待从规格中提取

---

### 验证流程

**说明**: TODO: 待补充说明

**来源规格**: 019-store-association

**字段定义**: TODO: 待从规格中提取

---

### 验证规则

**说明**: TODO: 待补充说明

**来源规格**: 001-skill-doc-generator

**字段定义**: TODO: 待从规格中提取

---

### 验证规则定义

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---

### 验证规则汇总

**说明**: TODO: 待补充说明

**来源规格**: 005-sku-management

**字段定义**: TODO: 待从规格中提取

---

### 高级验证功能

**说明**: TODO: 待补充说明

**来源规格**: 004-spu-management

**字段定义**: TODO: 待从规格中提取

---


## 附录

### 处理的规格文件

- 001-claude-cleanup-script
- 001-menu-navigation
- 001-skill-doc-generator
- 001-ui-framework-upgrade
- 002-upgrade-ant6
- 003-inventory-management
- 004-spu-management
- 005-sku-management
- 006-frontend-structure-refactor
- 007-category-management
- 007-category-management-by-claude
- 008-env-preset-commands
- 009-brand-management
- 010-attribute-dict-management
- 011-uninstall-env-cleanup
- 012-set-config-enhancement
- 013-schedule-management
- 014-hall-store-backend
- 015-store-reservation-settings
- 017-scenario-package
- 018-hall-reserve-homepage
- 019-store-association
- 020-store-address
- claude-1-purchase-management

---

**生成说明**:
- 本文档由 generate_api_docs.py 自动生成
- 标记为 `TODO: 待规格明确` 的项需要在规格文档中补充后重新生成
- 如发现信息缺失或不准确，请参考原始规格文档
