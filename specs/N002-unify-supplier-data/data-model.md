# Data Model: 统一供应商数据源

**Spec**: N002-unify-supplier-data
**Date**: 2026-01-11

## 1. 实体定义

### 1.1 后端 SupplierDTO

**位置**: `backend/src/main/java/com/cinema/procurement/dto/SupplierDTO.java`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 供应商唯一标识 |
| code | String | 是 | 供应商编码 |
| name | String | 是 | 供应商名称 |
| contactName | String | 否 | 联系人姓名 |
| contactPhone | String | 否 | 联系电话 |
| status | String | 是 | 状态 (ACTIVE/SUSPENDED/TERMINATED) |

### 1.2 前端 Supplier 类型

**位置**: `frontend/src/types/supplier.ts`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 供应商唯一标识 |
| code | string | 是 | 供应商编码 |
| name | string | 是 | 供应商名称 |
| contactPerson | string | 否 | 联系人姓名 |
| contactPhone | string | 否 | 联系电话 |
| status | string | 是 | 状态 |

## 2. 字段映射

### 2.1 后端 → 前端映射

| 后端 SupplierDTO | 前端 Supplier | 映射类型 | 说明 |
|-----------------|---------------|---------|------|
| id (UUID) | id (string) | 直接 | UUID 转字符串 |
| code | code | 直接 | - |
| name | name | 直接 | - |
| **contactName** | **contactPerson** | **重命名** | 字段名不同 |
| contactPhone | contactPhone | 直接 | - |
| status | status | 直接 | - |

### 2.2 映射函数

```typescript
// frontend/src/services/supplierApi.ts

interface SupplierDTO {
  id: string;
  code: string;
  name: string;
  contactName: string | null;
  contactPhone: string | null;
  status: string;
}

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  contactPhone: string;
  status: string;
}

export const mapDTOToSupplier = (dto: SupplierDTO): Supplier => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  contactPerson: dto.contactName || '',
  contactPhone: dto.contactPhone || '',
  status: dto.status,
});
```

## 3. API 响应格式

### 3.1 成功响应

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "SUP001",
      "name": "北京食品供应商",
      "contactName": "张三",
      "contactPhone": "13800138000",
      "status": "ACTIVE"
    }
  ],
  "timestamp": "2026-01-11T10:00:00Z"
}
```

### 3.2 错误响应

```json
{
  "success": false,
  "error": "SUP_NTF_001",
  "message": "供应商不存在",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

## 4. 状态枚举

| 值 | 中文 | 说明 |
|----|------|------|
| ACTIVE | 启用 | 正常可用状态 |
| SUSPENDED | 暂停 | 临时停用 |
| TERMINATED | 终止 | 永久停用 |

## 5. 验证规则

### 5.1 前端验证

- `id`: 必须为有效 UUID 格式字符串
- `code`: 非空字符串
- `name`: 非空字符串
- `status`: 必须为 ACTIVE/SUSPENDED/TERMINATED 之一

### 5.2 后端验证

后端 API 已有验证，前端无需重复验证请求参数。
