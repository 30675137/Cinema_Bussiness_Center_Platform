# Research: P003-inventory-query

**Date**: 2025-12-26
**Status**: Complete

## Research Questions

### Q1: 现有数据库表结构

**Decision**: 需要新建 `store_inventory` 表存储门店SKU库存

**Rationale**:
- 现有 `skus` 表仅存储SKU主数据（编码、名称、单位等），不包含库存数量
- 现有 `stores` 表仅存储门店基本信息
- 现有 `slot_inventory_snapshots` 表用于预约时段容量，非商品库存
- 前端已有完整的库存类型定义 (`frontend/src/types/inventory.ts`)

**Alternatives Considered**:
- 复用 `slot_inventory_snapshots` 表：❌ 用途不同，字段不匹配
- 在 `skus` 表添加库存字段：❌ 库存是门店维度，需要多对多关系

### Q2: 现有前端实现

**Decision**: 复用现有的类型定义和状态管理架构

**Findings**:
- `frontend/src/types/inventory.ts` - 完整的库存类型定义
  - `CurrentInventory`: 包含 onHandQty, availableQty, reservedQty, safetyStock
  - `InventoryTransaction`: 库存流水类型
- `frontend/src/stores/inventoryStore.ts` - Zustand store 已就绪
  - useCurrentInventoryQuery() hook 已定义
  - 支持筛选、分页、导出等功能

**Rationale**: 前端架构已为库存功能做好准备，只需实现后端API和前端页面组件

### Q3: 分类数据来源

**Decision**: 使用现有 `categories` 表（如已存在）或新建

**Findings**:
- `frontend/src/types/sku.ts` 定义了 Category 接口
- Mock 数据包含分类如 "饮料"、"零食" 等
- 后端未找到 Category 实体类

**Action**: 在 data-model.md 中定义 categories 表结构

### Q4: 库存状态计算逻辑

**Decision**: 在后端API计算库存状态，前端仅负责展示

**Rationale**:
- 规格 FR-013 定义的五级状态需要可用库存和安全库存计算
- 计算公式：
  - 充足: available >= safetyStock × 2
  - 正常: safetyStock <= available < safetyStock × 2
  - 偏低: safetyStock × 0.5 <= available < safetyStock
  - 不足: 0 < available < safetyStock × 0.5
  - 缺货: available = 0
- 后端计算保证一致性，减少前端逻辑复杂度

### Q5: 权限控制机制

**Decision**: 后端通过用户门店权限过滤可查询的门店列表

**Findings**:
- 规格 FR-012 要求根据用户权限控制可查看的门店范围
- 现有认证系统应包含用户-门店权限关联
- API 需要支持 `storeIds` 参数或根据登录用户自动过滤

**Action**: API 设计时包含权限校验逻辑

## Technology Decisions

### 后端 API 设计

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/inventory` | GET | 查询库存列表（支持分页/搜索/筛选） |
| `/api/inventory/{id}` | GET | 获取单条库存详情 |
| `/api/stores/accessible` | GET | 获取用户可访问的门店列表 |
| `/api/categories` | GET | 获取商品分类列表 |

### 前端组件架构

```
pages/
└── inventory/
    └── InventoryPage.tsx          # 页面入口

features/inventory/
├── components/
│   ├── InventoryFilterBar.tsx     # 筛选栏（门店/状态/分类）
│   ├── InventoryTable.tsx         # 库存列表表格
│   ├── InventoryStatusTag.tsx     # 库存状态标签
│   └── InventoryDetailDrawer.tsx  # 详情抽屉
├── hooks/
│   └── useInventory.ts            # 查询 hooks
├── services/
│   └── inventoryService.ts        # API 服务
└── types/
    └── index.ts                   # 类型定义（复用现有）
```

### 数据库迁移

需要新建以下表：
1. `store_inventory` - 门店SKU库存表
2. `categories` - 商品分类表（如不存在）

## Dependencies

### 已存在
- ✅ `skus` 表 - SKU主数据
- ✅ `stores` 表 - 门店数据
- ✅ 前端类型定义 - `frontend/src/types/inventory.ts`
- ✅ 前端状态管理 - `frontend/src/stores/inventoryStore.ts`
- ✅ Spring Boot 后端框架
- ✅ Supabase 数据库连接

### 需要新建
- 🆕 `store_inventory` 数据库表
- 🆕 `categories` 数据库表
- 🆕 后端 InventoryController + Service
- 🆕 前端库存查询页面组件
