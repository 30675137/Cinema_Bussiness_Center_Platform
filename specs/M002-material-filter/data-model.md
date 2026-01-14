# Data Model: Material Management Filter & Actions

**Spec**: M002-material-filter | **Date**: 2026-01-14  
**Purpose**: Define data structures for filtering, export, import, and batch operations

## Core Entities

### 1. MaterialFilter (筛选条件)

**Description**: 筛选条件对象，用于构建数据库查询

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `category` | `MaterialCategory?` | No | 物料分类 | enum: RAW_MATERIAL, PACKAGING |
| `status` | `MaterialStatus?` | No | 物料状态 | enum: ACTIVE, INACTIVE |
| `minCost` | `number?` | No | 最小标准成本 | ≥ 0 |
| `maxCost` | `number?` | No | 最大标准成本 | ≥ minCost |
| `keyword` | `string?` | No | 关键词（搜索编码或名称） | max length: 100 |

**TypeScript Definition**:
```typescript
export interface MaterialFilter {
  category?: MaterialCategory;
  status?: MaterialStatus;
  minCost?: number;
  maxCost?: number;
  keyword?: string;
}
```

**Java DTO**:
```java
@Data
public class MaterialFilterDTO {
    private MaterialCategory category;
    private MaterialStatus status;
    private BigDecimal minCost;
    private BigDecimal maxCost;
    private String keyword;
    
    @AssertTrue(message = "最小成本不能大于最大成本")
    public boolean isCostRangeValid() {
        if (minCost != null && maxCost != null) {
            return minCost.compareTo(maxCost) <= 0;
        }
        return true;
    }
}
```

**Relationships**: None (value object)

---

### 2. MaterialExportData (导出数据)

**Description**: 导出到 Excel 的物料数据结构

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | Yes | 物料编码 |
| `name` | `string` | Yes | 物料名称 |
| `category` | `string` | Yes | 分类（中文标签） |
| `status` | `string` | Yes | 状态（中文标签） |
| `inventoryUnitName` | `string` | Yes | 库存单位名称 |
| `purchaseUnitName` | `string` | Yes | 采购单位名称 |
| `conversionRate` | `number?` | No | 换算率 |
| `standardCost` | `number?` | No | 标准成本 |
| `specification` | `string?` | No | 规格 |
| `description` | `string?` | No | 描述 |
| `createdAt` | `string` | Yes | 创建时间（格式化） |

**TypeScript Definition**:
```typescript
export interface MaterialExportData {
  code: string;
  name: string;
  category: string; // '原料' | '包材'
  status: string; // '在用' | '停用'
  inventoryUnitName: string;
  purchaseUnitName: string;
  conversionRate?: number;
  standardCost?: number;
  specification?: string;
  description?: string;
  createdAt: string; // 'YYYY-MM-DD HH:mm:ss'
}
```

**Java DTO**:
```java
@Data
@Builder
public class MaterialExportDTO {
    private String code;
    private String name;
    private String category; // 中文标签
    private String status; // 中文标签
    private String inventoryUnitName;
    private String purchaseUnitName;
    private BigDecimal conversionRate;
    private BigDecimal standardCost;
    private String specification;
    private String description;
    private String createdAt; // 格式化后的时间字符串
}
```

**Excel Column Mapping**:
| Column Index | Column Name | Field |
|--------------|-------------|-------|
| 0 | 物料编码 | code |
| 1 | 物料名称 | name |
| 2 | 分类 | category |
| 3 | 状态 | status |
| 4 | 库存单位 | inventoryUnitName |
| 5 | 采购单位 | purchaseUnitName |
| 6 | 换算率 | conversionRate |
| 7 | 标准成本 | standardCost |
| 8 | 规格 | specification |
| 9 | 描述 | description |
| 10 | 创建时间 | createdAt |

---

### 3. MaterialImportRecord (导入记录)

**Description**: 导入文件中的单条记录及其校验状态

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `rowIndex` | `number` | Yes | Excel 行号（从1开始） | > 0 |
| `data` | `MaterialImportData` | Yes | 导入的物料数据 | - |
| `valid` | `boolean` | Yes | 是否校验通过 | - |
| `errors` | `string[]` | No | 错误信息列表 | - |

**TypeScript Definition**:
```typescript
export interface MaterialImportRecord {
  rowIndex: number;
  data: MaterialImportData;
  valid: boolean;
  errors?: string[];
}

export interface MaterialImportData {
  code?: string; // 可选，留空自动生成
  name: string; // 必填
  category: string; // 必填，'RAW_MATERIAL' | 'PACKAGING'
  inventoryUnitId: string; // 必填
  purchaseUnitId: string; // 必填
  conversionRate?: number; // 可选
  useGlobalConversion?: boolean; // 可选，默认 false
  standardCost?: number; // 可选
  specification?: string; // 可选
  description?: string; // 可选
}
```

**Java DTO**:
```java
@Data
public class MaterialImportRecordDTO {
    private Integer rowIndex;
    private MaterialImportDataDTO data;
    private Boolean valid;
    private List<String> errors;
}

@Data
public class MaterialImportDataDTO {
    private String code; // 可选
    
    @NotBlank(message = "物料名称不能为空")
    @Size(max = 100, message = "物料名称长度不能超过100字符")
    private String name;
    
    @NotNull(message = "分类不能为空")
    private MaterialCategory category;
    
    @NotBlank(message = "库存单位ID不能为空")
    private String inventoryUnitId;
    
    @NotBlank(message = "采购单位ID不能为空")
    private String purchaseUnitId;
    
    @Min(value = 0, message = "换算率必须大于0")
    private BigDecimal conversionRate;
    
    private Boolean useGlobalConversion;
    
    @Min(value = 0, message = "标准成本不能为负数")
    private BigDecimal standardCost;
    
    @Size(max = 500, message = "规格长度不能超过500字符")
    private String specification;
    
    @Size(max = 1000, message = "描述长度不能超过1000字符")
    private String description;
}
```

**Validation Rules**:
1. 物料名称：必填，长度 ≤ 100 字符
2. 分类：必填，只能为 RAW_MATERIAL 或 PACKAGING
3. 库存单位ID：必填，必须存在于系统中
4. 采购单位ID：必填，必须存在于系统中
5. 物料编码：如果填写，必须唯一（不与已有物料重复）
6. 换算率：如果填写，必须 > 0
7. 标准成本：如果填写，必须 ≥ 0

---

### 4. MaterialImportResult (导入结果)

**Description**: 导入操作的汇总结果

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalCount` | `number` | Yes | 总行数 |
| `successCount` | `number` | Yes | 成功行数 |
| `failureCount` | `number` | Yes | 失败行数 |
| `records` | `MaterialImportRecord[]` | Yes | 详细记录列表 |

**TypeScript Definition**:
```typescript
export interface MaterialImportResult {
  totalCount: number;
  successCount: number;
  failureCount: number;
  records: MaterialImportRecord[];
}
```

**Java DTO**:
```java
@Data
@Builder
public class MaterialImportResultDTO {
    private Integer totalCount;
    private Integer successCount;
    private Integer failureCount;
    private List<MaterialImportRecordDTO> records;
}
```

---

### 5. MaterialBatchOperation (批量操作)

**Description**: 批量操作的请求和结果

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `materialIds` | `string[]` | Yes | 物料ID列表 | length ≤ 100 |
| `operation` | `BatchOperationType` | Yes | 操作类型 | enum: DELETE, UPDATE_STATUS |
| `targetStatus` | `MaterialStatus?` | Conditional | 目标状态（UPDATE_STATUS时必填） | - |

**TypeScript Definition**:
```typescript
export enum BatchOperationType {
  DELETE = 'DELETE',
  UPDATE_STATUS = 'UPDATE_STATUS',
}

export interface MaterialBatchOperationRequest {
  materialIds: string[];
  operation: BatchOperationType;
  targetStatus?: MaterialStatus; // UPDATE_STATUS 时必填
}

export interface MaterialBatchOperationResult {
  successCount: number;
  failureCount: number;
  items: MaterialBatchOperationItem[];
}

export interface MaterialBatchOperationItem {
  materialId: string;
  materialCode: string;
  success: boolean;
  error?: string;
}
```

**Java DTO**:
```java
@Data
public class MaterialBatchOperationRequestDTO {
    @NotEmpty(message = "物料ID列表不能为空")
    @Size(max = 100, message = "单次批量操作不能超过100项")
    private List<String> materialIds;
    
    @NotNull(message = "操作类型不能为空")
    private BatchOperationType operation;
    
    private MaterialStatus targetStatus; // UPDATE_STATUS 时必填
    
    @AssertTrue(message = "修改状态操作必须指定目标状态")
    public boolean isTargetStatusValid() {
        if (operation == BatchOperationType.UPDATE_STATUS) {
            return targetStatus != null;
        }
        return true;
    }
}

public enum BatchOperationType {
    DELETE,
    UPDATE_STATUS
}

@Data
@Builder
public class MaterialBatchOperationResultDTO {
    private Integer successCount;
    private Integer failureCount;
    private List<MaterialBatchOperationItemDTO> items;
}

@Data
@Builder
public class MaterialBatchOperationItemDTO {
    private String materialId;
    private String materialCode;
    private Boolean success;
    private String error;
}
```

---

## State Transitions

### Material Status Flow

```
ACTIVE (在用)
  ↓ (用户停用)
INACTIVE (停用)
  ↓ (用户启用)
ACTIVE (在用)
```

**Rules**:
- 状态可在 ACTIVE 和 INACTIVE 之间切换
- 被 BOM 引用的物料不能删除，但可以停用
- 停用状态的物料不能被新的 BOM 引用

---

## Indexes & Performance

### Database Indexes

```sql
-- 筛选查询索引
CREATE INDEX idx_materials_filter 
ON materials(category, status, created_at DESC);

-- 关键词搜索索引
CREATE INDEX idx_materials_search 
ON materials USING GIN(to_tsvector('simple', code || ' ' || name));

-- 批量查询索引
CREATE INDEX idx_materials_ids 
ON materials(id);
```

### Query Performance Targets

| Query Type | Target Time | Notes |
|------------|-------------|-------|
| 筛选查询（1000条） | < 2s | 使用复合索引 |
| 关键词搜索 | < 1s | 使用全文索引 |
| 批量查询（100项） | < 500ms | 使用 IN 查询 + 索引 |

---

## Data Validation Summary

### Frontend Validation (Zod Schema)

```typescript
import { z } from 'zod';

export const MaterialFilterSchema = z.object({
  category: z.nativeEnum(MaterialCategory).optional(),
  status: z.nativeEnum(MaterialStatus).optional(),
  minCost: z.number().min(0).optional(),
  maxCost: z.number().min(0).optional(),
  keyword: z.string().max(100).optional(),
}).refine(
  data => {
    if (data.minCost !== undefined && data.maxCost !== undefined) {
      return data.minCost <= data.maxCost;
    }
    return true;
  },
  { message: '最小成本不能大于最大成本' }
);

export const MaterialImportDataSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, '物料名称不能为空').max(100),
  category: z.nativeEnum(MaterialCategory),
  inventoryUnitId: z.string().uuid(),
  purchaseUnitId: z.string().uuid(),
  conversionRate: z.number().positive().optional(),
  useGlobalConversion: z.boolean().optional(),
  standardCost: z.number().nonnegative().optional(),
  specification: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
});
```

### Backend Validation (Bean Validation)

所有 DTO 类使用 JSR-380 Bean Validation 注解进行校验，由 Spring Boot `@Validated` 自动触发。

---

## API Response Format

所有 API 响应必须遵循统一格式：

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-14T10:30:00Z"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "MAT_VAL_001",
  "message": "筛选条件不合法：最小成本不能大于最大成本",
  "details": {
    "minCost": 100,
    "maxCost": 50
  },
  "timestamp": "2026-01-14T10:30:00Z"
}
```

---

## Error Codes

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| MAT_VAL_001 | 400 | 筛选条件验证失败 | 成本范围无效 |
| MAT_VAL_002 | 400 | 导入数据格式错误 | 必填字段缺失 |
| MAT_VAL_003 | 400 | 批量操作参数错误 | 物料ID列表为空 |
| MAT_NTF_001 | 404 | 物料不存在 | 批量操作中的物料ID无效 |
| MAT_DUP_001 | 409 | 物料编码重复 | 导入时编码冲突 |
| MAT_BIZ_001 | 422 | 物料已被引用无法删除 | 被BOM引用 |
| MAT_SYS_001 | 500 | 导出失败 | Excel生成异常 |
| MAT_SYS_002 | 500 | 导入失败 | 数据库写入异常 |

---

## Conclusion

数据模型已完整定义，包括：
- ✅ 5 个核心实体（Filter, ExportData, ImportRecord, ImportResult, BatchOperation）
- ✅ TypeScript 和 Java DTO 定义
- ✅ 数据验证规则（前端 Zod + 后端 Bean Validation）
- ✅ 数据库索引优化
- ✅ API 响应格式和错误编码

可以进入 API 契约设计阶段。
