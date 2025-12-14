# Data Model: 品牌管理

**Date**: 2025-12-14
**Feature**: 品牌管理功能

## Entity Definitions

### Brand (品牌实体)

**Description**: 代表产品品牌的核心主数据实体，是商品中心统一品牌字典的基础。

**Attributes**:
```typescript
interface Brand {
  // 核心标识
  id: string;                    // 系统生成的唯一标识符
  brandCode: string;             // 品牌编码（系统生成或手动输入）

  // 基本信息
  name: string;                  // 品牌名称（中文，必填）
  englishName?: string;          // 品牌英文名（可选）
  brandType: BrandType;          // 品牌类型（必选）

  // 扩展信息
  primaryCategories: string[];   // 主营类目（多选）
  company?: string;              // 所属公司/供应商
  brandLevel?: string;           // 品牌等级（A/B/C等）
  tags: string[];                // 品牌标签（多选）
  description?: string;          // 品牌介绍

  // 展示信息
  logoUrl?: string;              // 品牌LOGO URL

  // 状态管理
  status: BrandStatus;           // 品牌状态

  // 审计字段
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  createdBy: string;             // 创建人
  updatedBy: string;             // 更新人
}
```

**Enums**:
```typescript
enum BrandType {
  OWN = 'own',           // 自有品牌
  AGENCY = 'agency',     // 代理品牌
  JOINT = 'joint',       // 联营品牌
  OTHER = 'other'        // 其他
}

enum BrandStatus {
  DRAFT = 'draft',       // 草稿
  ENABLED = 'enabled',   // 启用
  DISABLED = 'disabled'   // 停用
}
```

### BrandUsageStatistics (品牌使用统计)

**Description**: 跟踪品牌在系统中使用情况的统计实体。

**Attributes**:
```typescript
interface BrandUsageStatistics {
  brandId: string;              // 品牌ID（外键）
  spuCount: number;             // 关联SPU数量
  skuCount: number;             // 关联SKU数量
  lastUsedAt?: string;          // 最后使用时间
  calculatedAt: string;         // 统计计算时间
}
```

### BrandStatusTransition (品牌状态转换记录)

**Description**: 记录品牌状态变更历史，支持审计追踪。

**Attributes**:
```typescript
interface BrandStatusTransition {
  id: string;                   // 转换记录ID
  brandId: string;              // 品牌ID（外键）
  oldStatus: BrandStatus;       // 原状态
  newStatus: BrandStatus;       // 新状态
  changedBy: string;            // 操作人
  changedAt: string;            // 变更时间
  reason?: string;              // 变更原因
}
```

## Relationships

### 主要关系图
```
Brand (1) ---------> (N) SPU
Brand (1) ---------> (N) SKU
Brand (1) ---------> (N) BrandStatusTransition
Brand (1) ---------> (1) BrandUsageStatistics
Brand (N) <---------> (N) Category (多对多关系通过primaryCategories)
```

### 关系说明
- **Brand → SPU**: 一对多关系，一个品牌可以有多个SPU
- **Brand → SKU**: 一对多关系，通过SPU间接关联
- **Brand → BrandStatusTransition**: 一对多关系，记录状态变更历史
- **Brand → BrandUsageStatistics**: 一对一关系，实时使用统计

## Validation Rules

### 输入验证
```typescript
const brandValidationSchema = z.object({
  name: z.string().min(1, "品牌名称不能为空").max(100, "品牌名称不能超过100字符"),
  englishName: z.string().max(200, "英文名不能超过200字符").optional(),
  brandType: z.nativeEnum(BrandType, { required_error: "请选择品牌类型" }),
  primaryCategories: z.array(z.string()).min(1, "请选择至少一个主营类目"),
  company: z.string().max(200, "公司名称不能超过200字符").optional(),
  brandLevel: z.string().max(50, "品牌等级不能超过50字符").optional(),
  tags: z.array(z.string()).max(10, "标签不能超过10个"),
  description: z.string().max(1000, "品牌介绍不能超过1000字符").optional(),
  status: z.nativeEnum(BrandStatus).default(BrandStatus.DRAFT)
});
```

### 业务规则验证
1. **唯一性检查**: 品牌名称 + 品牌类型组合必须唯一
2. **状态转换规则**:
   - 草稿 → 启用：直接允许
   - 草稿 → 停用：不允许（应直接删除或保持草稿）
   - 启用 → 停用：需要确认（影响SPU/SKU使用）
   - 停用 → 启用：直接允许
3. **删除保护**: 已被SPU/SKU引用的品牌不允许删除，只能停用

## State Management

### Zustand Store Structure
```typescript
interface BrandStore {
  // 状态
  brands: Brand[];
  currentBrand: Brand | null;
  loading: boolean;
  error: string | null;

  // 查询状态
  filters: BrandFilters;
  pagination: PaginationState;

  // 操作方法
  fetchBrands: (params?: BrandQueryParams) => Promise<void>;
  createBrand: (brand: CreateBrandRequest) => Promise<Brand>;
  updateBrand: (id: string, brand: UpdateBrandRequest) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
  changeBrandStatus: (id: string, status: BrandStatus) => Promise<void>;
  setFilters: (filters: Partial<BrandFilters>) => void;
  setCurrentBrand: (brand: Brand | null) => void;
}
```

### TanStack Query Keys
```typescript
export const brandQueryKeys = {
  all: ['brands'] as const,
  lists: () => [...brandQueryKeys.all, 'list'] as const,
  list: (params: BrandQueryParams) => [...brandQueryKeys.lists(), params] as const,
  details: () => [...brandQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandQueryKeys.details(), id] as const,
};
```

## Performance Considerations

### 数据量处理
- **虚拟滚动**: 品牌列表支持1000+条数据的虚拟滚动渲染
- **分页加载**: 默认分页大小20条，支持用户自定义
- **搜索优化**: 关键字搜索支持防抖，避免频繁请求
- **缓存策略**: TanStack Query缓存5分钟，后台刷新策略

### 状态更新优化
- **乐观更新**: 状态变更立即反映UI，失败时回滚
- **批量操作**: 支持批量状态变更（如果有需要）
- **局部更新**: 只更新变更的品牌项，避免全量重渲染

## Security Considerations

### 输入安全
- **XSS防护**: 所有用户输入进行HTML转义
- **SQL注入防护**: 使用参数化查询（虽然是前端，但为后端集成考虑）
- **文件上传安全**: LOGO上传限制文件类型和大小

### 权限控制
- **角色权限**: 主数据管理员全权限，普通运营只读
- **操作权限**: 基于用户角色显示/隐藏操作按钮
- **API权限**: 后端必须验证用户权限，前端权限控制仅用于用户体验