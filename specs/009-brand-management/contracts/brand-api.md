# Brand API Contracts

**Version**: 1.0.0
**Date**: 2025-12-14

## API Overview

品牌管理API提供完整的品牌CRUD操作、状态管理和查询功能，遵循RESTful设计原则。

## Base URL
```
/api/v1/brands
```

## Authentication

所有API请求需要包含认证头：
```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. 获取品牌列表

**GET** `/api/v1/brands`

**Query Parameters**:
```typescript
interface BrandQueryParams {
  page?: number;           // 页码，默认1
  pageSize?: number;       // 每页大小，默认20
  keyword?: string;        // 关键字搜索（品牌名称/英文名/编码）
  brandType?: BrandType;   // 品牌类型筛选
  status?: BrandStatus;    // 状态筛选
  sortBy?: 'createdAt' | 'name' | 'updatedAt';  // 排序字段
  sortOrder?: 'asc' | 'desc';  // 排序方向
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "brand-001",
      "brandCode": "BRAND001",
      "name": "可口可乐",
      "englishName": "Coca-Cola",
      "brandType": "agency",
      "primaryCategories": ["饮料", "碳酸饮料"],
      "company": "可口可乐公司",
      "brandLevel": "A",
      "tags": ["国际品牌", "高端"],
      "description": "全球知名饮料品牌",
      "logoUrl": "https://example.com/logo/coca-cola.png",
      "status": "enabled",
      "createdAt": "2025-12-14T10:00:00Z",
      "updatedAt": "2025-12-14T10:00:00Z",
      "createdBy": "admin",
      "updatedBy": "admin"
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Success",
  "timestamp": "2025-12-14T10:00:00Z"
}
```

### 2. 获取品牌详情

**GET** `/api/v1/brands/{id}`

**Path Parameters**:
- `id`: 品牌ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "brand-001",
    "brandCode": "BRAND001",
    "name": "可口可乐",
    "englishName": "Coca-Cola",
    "brandType": "agency",
    "primaryCategories": ["饮料", "碳酸饮料"],
    "company": "可口可乐公司",
    "brandLevel": "A",
    "tags": ["国际品牌", "高端"],
    "description": "全球知名饮料品牌",
    "logoUrl": "https://example.com/logo/coca-cola.png",
    "status": "enabled",
    "createdAt": "2025-12-14T10:00:00Z",
    "updatedAt": "2025-12-14T10:00:00Z",
    "createdBy": "admin",
    "updatedBy": "admin",
    "usageStats": {
      "spuCount": 25,
      "skuCount": 156,
      "lastUsedAt": "2025-12-13T15:30:00Z"
    }
  },
  "message": "Success",
  "timestamp": "2025-12-14T10:00:00Z"
}
```

### 3. 创建品牌

**POST** `/api/v1/brands`

**Request Body**:
```json
{
  "name": "新品牌",
  "englishName": "New Brand",
  "brandType": "own",
  "primaryCategories": ["饮料"],
  "company": "某某公司",
  "brandLevel": "B",
  "tags": ["国产品牌"],
  "description": "品牌描述",
  "status": "draft"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "brand-002",
    "brandCode": "BRAND002",
    "name": "新品牌",
    "englishName": "New Brand",
    "brandType": "own",
    "primaryCategories": ["饮料"],
    "company": "某某公司",
    "brandLevel": "B",
    "tags": ["国产品牌"],
    "description": "品牌描述",
    "logoUrl": null,
    "status": "draft",
    "createdAt": "2025-12-14T10:30:00Z",
    "updatedAt": "2025-12-14T10:30:00Z",
    "createdBy": "admin",
    "updatedBy": "admin"
  },
  "message": "Brand created successfully",
  "timestamp": "2025-12-14T10:30:00Z"
}
```

### 4. 更新品牌

**PUT** `/api/v1/brands/{id}`

**Path Parameters**:
- `id`: 品牌ID

**Request Body**:
```json
{
  "name": "更新后的品牌名称",
  "englishName": "Updated Brand Name",
  "brandType": "agency",
  "primaryCategories": ["饮料", "功能饮料"],
  "company": "更新后的公司",
  "brandLevel": "A",
  "tags": ["国际品牌", "健康"],
  "description": "更新后的品牌描述"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "brand-002",
    "brandCode": "BRAND002",
    "name": "更新后的品牌名称",
    "englishName": "Updated Brand Name",
    "brandType": "agency",
    "primaryCategories": ["饮料", "功能饮料"],
    "company": "更新后的公司",
    "brandLevel": "A",
    "tags": ["国际品牌", "健康"],
    "description": "更新后的品牌描述",
    "logoUrl": null,
    "status": "draft",
    "createdAt": "2025-12-14T10:30:00Z",
    "updatedAt": "2025-12-14T11:00:00Z",
    "createdBy": "admin",
    "updatedBy": "admin"
  },
  "message": "Brand updated successfully",
  "timestamp": "2025-12-14T11:00:00Z"
}
```

### 5. 更改品牌状态

**PATCH** `/api/v1/brands/{id}/status`

**Path Parameters**:
- `id`: 品牌ID

**Request Body**:
```json
{
  "status": "enabled",
  "reason": "品牌信息完善，正式启用"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "brand-002",
    "status": "enabled",
    "updatedAt": "2025-12-14T11:15:00Z",
    "updatedBy": "admin"
  },
  "message": "Brand status updated successfully",
  "timestamp": "2025-12-14T11:15:00Z"
}
```

### 6. 上传品牌LOGO

**POST** `/api/v1/brands/{id}/logo`

**Path Parameters**:
- `id`: 品牌ID

**Request**: multipart/form-data
- `file`: 图片文件（支持jpg, png, gif格式，最大2MB）

**Response**:
```json
{
  "success": true,
  "data": {
    "logoUrl": "https://example.com/logo/brand-002-updated.png",
    "updatedAt": "2025-12-14T11:30:00Z"
  },
  "message": "Logo uploaded successfully",
  "timestamp": "2025-12-14T11:30:00Z"
}
```

### 7. 获取品牌使用统计

**GET** `/api/v1/brands/{id}/usage-stats`

**Path Parameters**:
- `id`: 品牌ID

**Response**:
```json
{
  "success": true,
  "data": {
    "brandId": "brand-001",
    "spuCount": 25,
    "skuCount": 156,
    "lastUsedAt": "2025-12-13T15:30:00Z",
    "calculatedAt": "2025-12-14T12:00:00Z"
  },
  "message": "Usage statistics retrieved successfully",
  "timestamp": "2025-12-14T12:00:00Z"
}
```

## Error Responses

所有API在出错时返回统一格式：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "品牌名称不能为空"
      }
    ]
  },
  "timestamp": "2025-12-14T10:00:00Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: 输入验证失败
- `DUPLICATE_BRAND`: 品牌名称重复
- `BRAND_NOT_FOUND`: 品牌不存在
- `UNAUTHORIZED`: 未授权访问
- `FORBIDDEN`: 权限不足
- `FILE_TOO_LARGE`: 文件过大
- `UNSUPPORTED_FILE_TYPE`: 不支持的文件类型
- `BRAND_IN_USE`: 品牌正在使用中，无法删除

## HTTP Status Codes

- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `413`: 文件过大
- `422`: 不可处理的实体
- `500`: 服务器内部错误

## Rate Limiting

- 查询接口：100 requests/minute
- 创建/更新接口：30 requests/minute
- 文件上传接口：10 requests/minute

## Pagination

所有列表接口支持分页，使用以下参数：
- `page`: 页码（从1开始）
- `pageSize`: 每页大小（1-100，默认20）

## Sorting

支持多字段排序，使用以下参数：
- `sortBy`: 排序字段
- `sortOrder`: 排序方向（asc/desc）