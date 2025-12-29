# Research: 场景包场馆关联配置

**Feature**: 019-store-association
**Date**: 2025-12-21
**Status**: Completed

## 研究任务总览

| 编号 | 研究任务 | 状态 | 结论 |
|------|---------|------|------|
| R1 | 现有场景包编辑页面结构 | ✅ | 复用 edit.tsx 两列布局，新增门店关联区域 |
| R2 | stores 表数据模型和 API | ✅ | 复用 storeService.getStores()，返回 ListResponse |
| R3 | 多选 UI 组件最佳实践 | ✅ | 复用 Tag.CheckableTag 模式 |
| R4 | 关联表设计模式 | ✅ | 参考 package_hall_associations 设计 |
| R5 | 乐观锁并发控制 | ✅ | 复用 scenario_packages.version_lock 机制 |
| R6 | API 响应格式标准 | ✅ | 遵循 ListResponse 和 ApiResponse 规范 |
| R7 | 前端搜索筛选模式 | ✅ | 使用前端过滤（数据量<100） |

---

## R1: 现有场景包编辑页面结构

### 调研目标
了解 017-scenario-package 的编辑页面结构，确定门店关联配置的扩展点。

### 调研结果

**文件位置**: `/frontend/src/pages/scenario-packages/edit.tsx` (292 行)

**页面布局**: 两列布局
- 左列 (span=16): 主要表单内容
- 右列 (span=8): 预览和辅助信息

**现有配置区域**:
1. 基本信息（名称、描述、背景图片）
2. 适用影厅类型（hallTypeIds）- 使用 Tag.CheckableTag 多选
3. 规则配置（时长、人数）
4. 内容组合（硬权益、软权益、服务项目）
5. 定价设置

**扩展点**: 在"适用影厅类型"配置区域下方新增"门店关联"配置区域

### 决策
- **Decision**: 在 edit.tsx 的"适用影厅类型"区域下方新增"门店关联"配置区域
- **Rationale**: 保持与现有影厅类型选择的 UI 一致性，便于用户理解两者的配合关系
- **Alternatives Considered**:
  - 新建独立 Tab 页 → 拒绝：增加用户操作步骤
  - 弹窗选择器 → 拒绝：与现有 UI 风格不一致

---

## R2: stores 表数据模型和 API

### 调研目标
了解 014-hall-store-backend 提供的 stores 表结构和 API 接口。

### 调研结果

**数据库 Schema** (`/backend/src/main/resources/db/schema.sql`):
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    region VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**前端类型定义** (`/frontend/src/pages/stores/types/store.types.ts`):
```typescript
interface Store {
  id: string;
  code: string;
  name: string;
  region: string | null;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}
```

**API 服务** (`/frontend/src/pages/stores/services/storeService.ts`):
```typescript
getStores(params?: StoreQueryParams): Promise<Store[]>
// GET /api/stores
// 支持 status 筛选
```

**API 响应格式**:
```json
{
  "success": true,
  "data": [...],
  "total": 10,
  "message": "查询成功"
}
```

### 决策
- **Decision**: 直接复用 storeService.getStores() 获取门店列表
- **Rationale**: 避免重复实现，确保数据一致性
- **Alternatives Considered**:
  - 新建专用 API → 拒绝：功能重复，增加维护成本

---

## R3: 多选 UI 组件最佳实践

### 调研目标
确定门店多选 UI 的最佳实现方式。

### 调研结果

**现有模式** (hallTypeIds 实现):
```typescript
// 状态管理
const [selectedHallTypes, setSelectedHallTypes] = useState<string[]>([]);

// 切换函数
const handleHallTypeToggle = (hallId: string) => {
  setSelectedHallTypes((prev) =>
    prev.includes(hallId)
      ? prev.filter((id) => id !== hallId)
      : [...prev, hallId]
  );
};

// UI 渲染
{HALL_TYPE_OPTIONS.map((hall) => (
  <Tag.CheckableTag
    key={hall.id}
    checked={selectedHallTypes.includes(hall.id)}
    onChange={() => handleHallTypeToggle(hall.id)}
  >
    {hall.name}
  </Tag.CheckableTag>
))}
```

**Ant Design 可选组件**:
| 组件 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Tag.CheckableTag | 视觉直观、已有实现 | 数据量大时展示不友好 | <20 项 |
| Select (multiple) | 支持搜索、下拉收缩 | 选中项不够直观 | 20-100 项 |
| Checkbox.Group | 列表清晰、支持分组 | 占用空间大 | 需要分类展示 |
| Transfer | 双栏选择、操作明确 | 交互复杂 | 大量数据 |

### 决策
- **Decision**: 主要使用 Tag.CheckableTag，搭配搜索输入框进行筛选
- **Rationale**:
  - 与现有 hallTypeIds 实现保持一致
  - 预期门店数量 10-100，Tag 方式可接受
  - 搜索功能可快速定位目标门店
- **Alternatives Considered**:
  - Select multiple → 备选方案，如门店>50 可考虑
  - Transfer → 拒绝：交互复杂，不符合现有风格

---

## R4: 关联表设计模式

### 调研目标
确定场景包-门店关联表的设计方案。

### 调研结果

**现有关联表参考** (`package_hall_associations`):
```sql
CREATE TABLE package_hall_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    hall_type_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(package_id, hall_type_id)
);
```

**关键设计要素**:
1. UUID 主键
2. 外键约束 + CASCADE 删除
3. 联合唯一索引防止重复
4. 创建时间戳

### 决策
- **Decision**: 新增 `scenario_package_store_associations` 表，结构参考 `package_hall_associations`
- **Rationale**: 保持与现有关联表设计一致，便于维护
- **Schema**:
```sql
CREATE TABLE scenario_package_store_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    UNIQUE(package_id, store_id)
);
```

**注意**: store_id 使用 RESTRICT 而非 CASCADE，防止误删门店导致关联丢失（规格要求保留历史记录）

---

## R5: 乐观锁并发控制

### 调研目标
了解现有乐观锁机制，确定是否需要为关联操作添加并发控制。

### 调研结果

**现有机制** (`scenario_packages` 表):
```sql
version_lock INTEGER NOT NULL DEFAULT 0
```

**工作流程**:
1. 读取时获取当前 version_lock
2. 更新时在 WHERE 条件中包含 version_lock
3. 更新成功后 version_lock++
4. 若更新影响行数为 0，表示并发冲突

### 决策
- **Decision**: 门店关联更新复用场景包的 version_lock 机制
- **Rationale**:
  - 门店关联作为场景包的一部分，应与场景包整体一起更新
  - 无需为关联表单独设计版本控制
  - 符合规格 FR-008 要求
- **实现方式**:
  - 更新门店关联时，同时更新 scenario_packages.version_lock
  - 在事务中完成：检查版本 → 删除旧关联 → 插入新关联 → 更新版本

---

## R6: API 响应格式标准

### 调研目标
确认 API 响应格式，确保前后端契约一致。

### 调研结果

**标准格式** (来自 08-api-standards.md):

**单个资源**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
```

**列表查询**:
```typescript
interface ListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  message?: string;
}
```

**错误响应**:
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: object;
}
```

### 决策
- **Decision**: 严格遵循现有 API 响应格式规范
- **Rationale**:
  - 保持前后端契约一致性
  - 复用现有前端类型定义和错误处理逻辑
- **Alternatives Considered**: 无（规范是强制性的）

---

## R7: 前端搜索筛选模式

### 调研目标
确定门店搜索筛选的实现方式。

### 调研结果

**前端筛选** (现有 stores 页面):
- 数据量较小（<100）时使用前端筛选
- 使用 `Array.filter()` 实现
- 响应即时，无需 API 请求

**后端筛选**:
- 数据量大（>1000）时需要后端分页和搜索
- 需要修改 API 添加搜索参数
- 增加复杂度

### 决策
- **Decision**: 采用前端筛选，在组件内实现搜索逻辑
- **Rationale**:
  - 预期门店数量 10-100，前端筛选性能足够
  - 实现简单，无需修改后端 API
  - 响应即时，用户体验好
- **实现方式**:
```typescript
const [searchText, setSearchText] = useState('');

const filteredStores = useMemo(() => {
  if (!searchText) return stores;
  const lowerSearch = searchText.toLowerCase();
  return stores.filter(
    store =>
      store.name.toLowerCase().includes(lowerSearch) ||
      store.region?.toLowerCase().includes(lowerSearch)
  );
}, [stores, searchText]);
```

---

## 总结

所有研究任务已完成，无遗留 NEEDS CLARIFICATION 项。主要技术决策：

1. **UI 实现**: 复用 Tag.CheckableTag + 前端搜索
2. **数据获取**: 复用 storeService.getStores()
3. **数据模型**: 新增 scenario_package_store_associations 关联表
4. **并发控制**: 复用 scenario_packages.version_lock
5. **API 格式**: 遵循 ListResponse/ApiResponse 规范

可进入 Phase 1 设计阶段。
