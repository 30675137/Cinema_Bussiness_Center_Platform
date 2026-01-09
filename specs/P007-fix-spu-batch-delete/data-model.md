# Data Model: SPU 批量删除功能修复

**Feature**: P007-fix-spu-batch-delete
**Date**: 2026-01-09
**Purpose**: 定义 SPU 批量删除功能涉及的数据模型和数据流

---

## 1. Core Entities

### 1.1 SPU (Standard Product Unit)

**描述**: 标准商品单元,表示一类商品的标准化定义(不涉及具体的库存和价格)

**属性**:

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `id` | string | ✅ | SPU 唯一标识符 | `"SPU001"` |
| `code` | string | ✅ | SPU 编码 | `"SPU20250109001"` |
| `name` | string | ✅ | SPU 名称 | `"可口可乐 500ml 瓶装"` |
| `description` | string | ❌ | 商品描述 | `"经典碳酸饮料..."` |
| `brandId` | string | ✅ | 品牌 ID | `"BRAND001"` |
| `categoryId` | string | ✅ | 分类 ID | `"CAT001"` |
| `status` | SPUStatus | ✅ | 状态 | `"enabled"` |
| `createdAt` | string (ISO 8601) | ✅ | 创建时间 | `"2026-01-09T10:00:00Z"` |
| `updatedAt` | string (ISO 8601) | ✅ | 更新时间 | `"2026-01-09T11:30:00Z"` |
| `creator` | string | ✅ | 创建人 | `"admin"` |
| `modifier` | string | ✅ | 修改人 | `"admin"` |

**SPUStatus 枚举**:

```typescript
type SPUStatus = "draft" | "enabled" | "disabled";
```

- `draft`: 草稿状态,未对外使用
- `enabled`: 启用状态,可被 SKU 使用
- `disabled`: 停用状态,保留历史数据但不可创建新 SKU

**关系**:

- 一个 SPU 关联一个 Brand (多对一)
- 一个 SPU 关联一个 Category (多对一)
- 一个 SPU 可被多个 SKU 引用 (一对多,本 bug 修复不涉及 SKU)

**验证规则**:

- `id`: 非空,唯一
- `code`: 非空,唯一,格式为 `SPU + 时间戳`
- `name`: 非空,长度 1-100 字符
- `brandId` 和 `categoryId`: 必须引用存在的 Brand 和 Category

**状态流转规则**:

```
draft → enabled (字段验证通过)
enabled → disabled (允许停用)
disabled → enabled (允许恢复)
```

---

### 1.2 BatchDeleteRequest

**描述**: 批量删除 SPU 的请求体

**属性**:

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `operation` | string | ✅ | 操作类型,固定为 `"delete"` | `"delete"` |
| `ids` | string[] | ✅ | 待删除的 SPU ID 列表 | `["SPU001", "SPU002"]` |

**TypeScript 类型定义**:

```typescript
interface BatchDeleteRequest {
  operation: "delete";
  ids: string[];
}
```

**验证规则**:

- `operation`: 必须等于 `"delete"` (未来可扩展为 `"updateStatus"`, `"copy"` 等)
- `ids`: 非空数组,长度 1-100,每个 ID 必须是有效的字符串

---

### 1.3 BatchDeleteResponse

**描述**: 批量删除 SPU 的响应体

**属性**:

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `success` | boolean | ✅ | 操作是否成功 | `true` |
| `data` | BatchDeleteData | ✅ | 删除结果数据 | `{ processedCount: 3, failedCount: 0 }` |
| `message` | string | ✅ | 提示消息 | `"成功删除 3 个 SPU"` |
| `code` | number | ✅ | HTTP 状态码 | `200` |
| `timestamp` | number | ✅ | 时间戳(毫秒) | `1736419200000` |

**BatchDeleteData 子结构**:

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `processedCount` | number | ✅ | 成功删除的数量 | `3` |
| `failedCount` | number | ✅ | 失败的数量 | `0` |
| `results` | BatchDeleteResult[] | ❌ | 详细结果列表(可选) | `[{id: "SPU001", success: true}]` |

**TypeScript 类型定义**:

```typescript
interface BatchDeleteResponse {
  success: boolean;
  data: {
    processedCount: number;
    failedCount: number;
    results?: Array<{
      id: string;
      success: boolean;
      error?: string;
    }>;
  };
  message: string;
  code: number;
  timestamp: number;
}
```

**验证规则**:

- `processedCount + failedCount` 应该等于请求中 `ids.length`
- `success` 通常为 `true` (即使部分失败,只要请求本身成功就返回 true)
- `failedCount > 0` 时,`results` 数组应包含失败的 ID 和错误原因

---

## 2. Data Flow

### 2.1 批量删除流程

```
┌─────────────┐
│  用户选中   │
│  多个 SPU   │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│ 点击"批量删除"按钮 │
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│  确认弹窗提示       │
│  "确定删除 3 个?"   │
└──────┬──────────────┘
       │
       v
┌──────────────────────────────────┐
│ 前端调用 spuService.batchDeleteSPU()│
│ 构造 BatchDeleteRequest          │
│ { operation: "delete", ids: [...] }│
└──────┬───────────────────────────┘
       │
       v
┌──────────────────────────────────┐
│ 发送 POST /api/spu/batch 请求    │
│ Content-Type: application/json   │
└──────┬───────────────────────────┘
       │
       v (MSW 拦截)
┌──────────────────────────────────┐
│ MSW Handler 处理请求             │
│ 1. 解析 request body             │
│ 2. 调用 mockSPUStore.deleteMany()│
│ 3. 从内存/localStorage 删除数据  │
│ 4. 返回 BatchDeleteResponse      │
└──────┬───────────────────────────┘
       │
       v
┌──────────────────────────────────┐
│ 前端接收响应                     │
│ 1. 显示成功/失败提示             │
│ 2. 调用 refetchSPUList() 刷新列表│
│ 3. 清空选中状态 setSelectedRowKeys([])│
└──────────────────────────────────┘
```

### 2.2 数据变更时序图

```
用户      SPUList组件    spuService    MSW Handler    mockSPUStore    localStorage
 │            │              │              │                │                │
 │ 选中 SPU   │              │              │                │                │
 ├────────────>              │              │                │                │
 │            │              │              │                │                │
 │ 点击删除   │              │              │                │                │
 ├────────────>              │              │                │                │
 │            │              │              │                │                │
 │            │ batchDeleteSPU(ids)         │                │                │
 │            ├──────────────>              │                │                │
 │            │              │              │                │                │
 │            │              │ POST /api/spu/batch           │                │
 │            │              ├──────────────>                │                │
 │            │              │              │                │                │
 │            │              │              │ deleteMany(ids)│                │
 │            │              │              ├────────────────>                │
 │            │              │              │                │                │
 │            │              │              │                │ save data      │
 │            │              │              │                ├────────────────>
 │            │              │              │                │                │
 │            │              │              │ { success: 3, failed: 0 }       │
 │            │              │              <────────────────┤                │
 │            │              │              │                │                │
 │            │              │ BatchDeleteResponse           │                │
 │            │              <──────────────┤                │                │
 │            │              │              │                │                │
 │            │ { success: true, data: {...} }               │                │
 │            <──────────────┤              │                │                │
 │            │              │              │                │                │
 │            │ refetchSPUList()            │                │                │
 │            ├──────────────>              │                │                │
 │            │              │              │                │                │
 │            │              │ GET /api/spu/list             │                │
 │            │              ├──────────────>                │                │
 │            │              │              │                │                │
 │            │              │              │ getAll()       │                │
 │            │              │              ├────────────────>                │
 │            │              │              │                │                │
 │            │              │              │ SPU[]          │                │
 │            │              │              <────────────────┤                │
 │            │              │              │                │                │
 │            │              │ { data: { list: SPU[] } }     │                │
 │            │              <──────────────┤                │                │
 │            │              │              │                │                │
 │            │ SPU[]        │              │                │                │
 │            <──────────────┤              │                │                │
 │            │              │              │                │                │
 │ 显示更新后 │              │              │                │                │
 │ 的列表     │              │              │                │                │
 <────────────┤              │              │                │                │
```

---

## 3. Mock Data Store Schema

### 3.1 MockSPUStore 类结构

```typescript
class MockSPUStore {
  private data: SPUItem[];
  private persistenceEnabled: boolean;

  constructor();
  initialize(): void;
  enablePersistence(enabled: boolean): void;
  saveToPersistence(): void;

  // CRUD Operations
  getAll(): SPUItem[];
  getById(id: string): SPUItem | undefined;
  create(spu: Omit<SPUItem, 'id' | 'code' | 'createdAt'>): SPUItem;
  update(id: string, updates: Partial<SPUItem>): SPUItem | undefined;
  deleteMany(ids: string[]): { success: number; failed: number };

  // Query Operations
  filter(predicate: (spu: SPUItem) => boolean): SPUItem[];
  search(keyword: string): SPUItem[];
}
```

### 3.2 localStorage Schema

**Key**: `mockSPUData`

**Value**: JSON 序列化的 SPU 数组

```json
[
  {
    "id": "SPU001",
    "code": "SPU20250109001",
    "name": "可口可乐 500ml 瓶装",
    "brandId": "BRAND001",
    "categoryId": "CAT001",
    "status": "enabled",
    "createdAt": "2026-01-09T10:00:00Z",
    "updatedAt": "2026-01-09T10:00:00Z",
    "creator": "admin",
    "modifier": "admin"
  },
  ...
]
```

**容量估算**:

- 单个 SPU 对象约 200-300 字节
- 100 个 SPU 约 20-30 KB
- localStorage 限制通常为 5-10 MB,足够存储数万条 mock 数据

---

## 4. Error Scenarios

### 4.1 部分成功场景

**场景**: 用户选中 5 个 SPU,其中 2 个 ID 无效

**Request**:

```json
{
  "operation": "delete",
  "ids": ["SPU001", "SPU002", "INVALID_ID_1", "SPU003", "INVALID_ID_2"]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "processedCount": 3,
    "failedCount": 2,
    "results": [
      { "id": "SPU001", "success": true },
      { "id": "SPU002", "success": true },
      { "id": "INVALID_ID_1", "success": false, "error": "SPU 不存在" },
      { "id": "SPU003", "success": true },
      { "id": "INVALID_ID_2", "success": false, "error": "SPU 不存在" }
    ]
  },
  "message": "成功删除 3 个 SPU,失败 2 个"
}
```

**前端处理**:

```typescript
if (result.data.failedCount > 0) {
  message.warning(
    `成功删除 ${result.data.processedCount} 个 SPU,失败 ${result.data.failedCount} 个`
  );
} else {
  message.success(`成功删除 ${result.data.processedCount} 个 SPU`);
}
```

### 4.2 全部失败场景

**场景**: 所有 ID 都无效

**Request**:

```json
{
  "operation": "delete",
  "ids": ["INVALID_1", "INVALID_2"]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "processedCount": 0,
    "failedCount": 2
  },
  "message": "未能删除任何 SPU,所有 ID 无效"
}
```

### 4.3 网络错误场景

**场景**: 网络中断或服务器错误

**前端处理**:

```typescript
try {
  const response = await fetch('/api/spu/batch', { ... });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
} catch (error) {
  return {
    success: false,
    data: { success: 0, failed: ids.length },
    message: '网络错误,请稍后重试',
    code: 500,
    timestamp: Date.now(),
  };
}
```

---

## 5. Type Definitions (TypeScript)

```typescript
// 核心实体
interface SPUItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  brandId: string;
  categoryId: string;
  status: SPUStatus;
  createdAt: string;
  updatedAt: string;
  creator: string;
  modifier: string;
}

type SPUStatus = "draft" | "enabled" | "disabled";

// API 请求/响应
interface BatchDeleteRequest {
  operation: "delete";
  ids: string[];
}

interface BatchDeleteResponse {
  success: boolean;
  data: {
    processedCount: number;
    failedCount: number;
    results?: Array<{
      id: string;
      success: boolean;
      error?: string;
    }>;
  };
  message: string;
  code: number;
  timestamp: number;
}

// 通用 API 响应包装
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
  timestamp: number;
}

// Mock Store 接口
interface IMockSPUStore {
  getAll(): SPUItem[];
  getById(id: string): SPUItem | undefined;
  create(spu: Omit<SPUItem, 'id' | 'code' | 'createdAt'>): SPUItem;
  update(id: string, updates: Partial<SPUItem>): SPUItem | undefined;
  deleteMany(ids: string[]): { success: number; failed: number };
  enablePersistence(enabled: boolean): void;
}
```

---

## Summary

本数据模型定义了 SPU 批量删除功能涉及的所有核心实体、数据流和错误场景。关键点包括:

1. **SPU 实体**: 标准商品单元,包含 id, name, status 等核心字段
2. **批量删除请求/响应**: 使用 `operation: "delete"` + `ids` 数组的统一格式
3. **Mock 数据持久化**: 使用 `MockSPUStore` 单例管理数据,支持 localStorage 持久化
4. **错误处理**: 支持部分成功场景,返回详细的 `processedCount` 和 `failedCount`
5. **数据一致性**: 通过 MSW handler 真实修改 mock 数据,确保列表刷新后数据正确

所有类型定义使用 TypeScript strict 模式,确保类型安全。

---

**版本历史**:
- v1.0 - 初始数据模型文档创建
- 创建日期: 2026-01-09
- 创建者: Claude AI
