# 商品管理API文档

## 概述

本文档详细说明了商品管理中台前端系统所使用的所有商品相关API接口，包括请求格式、响应格式、参数说明和错误处理。

## 基础信息

- **API基础URL**: `http://localhost:8080/api/v1`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 请求头说明

所有API请求都需要包含以下标准请求头：

```http
Content-Type: application/json
Authorization: Bearer <access_token>
X-Request-ID: <request_id>
X-Timestamp: <timestamp>
```

## 通用响应格式

### 成功响应格式

```json
{
  "success": true,
  "data": <响应数据>,
  "message": "操作成功",
  "timestamp": "2025-12-10T10:30:00.000Z"
}
```

### 分页响应格式

```json
{
  "success": true,
  "data": [<数据列表>],
  "message": "查询成功",
  "timestamp": "2025-12-10T10:30:00.000Z",
  "pagination": {
    "current": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": <详细错误信息>
  },
  "timestamp": "2025-12-10T10:30:00.000Z"
}
```

## 1. 商品基础CRUD操作

### 1.1 获取商品列表

**接口地址**: `GET /products`

**功能描述**: 分页获取商品列表，支持多种筛选和排序条件

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | number | 否 | 页码，默认1 | 1 |
| pageSize | number | 否 | 每页数量，默认20 | 20 |
| keyword | string | 否 | 搜索关键词 | "手机" |
| skuId | string | 否 | 商品SKU ID | "SKU001" |
| categoryId | string | 否 | 商品分类ID | "cat_001" |
| materialType | string | 否 | 物料类型 | "finished_goods" |
| status | string[] | 否 | 商品状态列表 | ["active", "draft"] |
| minPrice | number | 否 | 最低价格 | 100 |
| maxPrice | number | 否 | 最高价格 | 1000 |
| sortBy | string | 否 | 排序字段 | "createdAt" |
| sortOrder | string | 否 | 排序方向 | "desc" |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "skuId": "SKU001",
      "name": "iPhone 15 Pro",
      "shortName": "iPhone 15",
      "description": "最新款iPhone",
      "categoryId": "cat_001",
      "materialType": "finished_goods",
      "status": "active",
      "basePrice": 7999,
      "images": [
        {
          "id": "img_001",
          "url": "https://example.com/image.jpg",
          "alt": "iPhone 15 Pro",
          "sortOrder": 1,
          "type": "main"
        }
      ],
      "createdAt": "2025-12-10T10:00:00.000Z",
      "updatedAt": "2025-12-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 1.2 获取商品详情

**接口地址**: `GET /products/{id}`

**功能描述**: 根据商品ID获取详细信息

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 商品ID | "prod_001" |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "skuId": "SKU001",
    "name": "iPhone 15 Pro",
    "description": "最新款iPhone，配备A17 Pro芯片",
    "categoryId": "cat_001",
    "category": {
      "id": "cat_001",
      "name": "手机数码",
      "code": "mobile",
      "level": 1
    },
    "materialType": "finished_goods",
    "status": "active",
    "basePrice": 7999,
    "specifications": [
      {
        "id": "spec_001",
        "name": "颜色",
        "type": "select",
        "values": [
          {
            "id": "val_001",
            "value": "深空黑色",
            "label": "深空黑"
          }
        ],
        "required": true
      }
    ],
    "content": {
      "title": "iPhone 15 Pro",
      "subtitle": "钛金属设计",
      "description": "全新设计",
      "images": []
    },
    "bom": {
      "id": "bom_001",
      "components": [],
      "totalCost": 5000
    }
  }
}
```

### 1.3 创建商品

**接口地址**: `POST /products`

**功能描述**: 创建新商品

**请求体**:

```json
{
  "name": "iPhone 15 Pro",
  "shortTitle": "iPhone 15",
  "description": "最新款iPhone",
  "categoryId": "cat_001",
  "materialType": "finished_goods",
  "basePrice": 7999,
  "barcode": "1234567890123",
  "unit": "台",
  "brand": "Apple",
  "weight": 0.2,
  "volume": 0.001,
  "content": {
    "title": "iPhone 15 Pro",
    "subtitle": "钛金属设计",
    "description": "全新设计",
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "alt": "iPhone 15 Pro",
        "sortOrder": 1,
        "type": "main"
      }
    ]
  },
  "specifications": [
    {
      "name": "颜色",
      "type": "select",
      "values": ["深空黑色", "银色"],
      "required": true
    }
  ],
  "bom": {
    "components": [
      {
        "materialId": "mat_001",
        "quantity": 1,
        "unit": "个",
        "cost": 5000
      }
    ]
  },
  "status": "draft"
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "prod_002",
    "skuId": "SKU002",
    "name": "iPhone 15 Pro",
    "status": "draft",
    "createdAt": "2025-12-10T10:30:00.000Z"
  },
  "message": "商品创建成功"
}
```

### 1.4 更新商品

**接口地址**: `PUT /products/{id}`

**功能描述**: 更新商品信息

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 商品ID |

**请求体**: 与创建商品相同，支持部分字段更新

### 1.5 删除商品

**接口地址**: `DELETE /products/{id}`

**功能描述**: 删除指定商品

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 商品ID |

**响应示例**:

```json
{
  "success": true,
  "message": "商品删除成功"
}
```

## 2. 批量操作

### 2.1 批量删除商品

**接口地址**: `POST /products/batch/delete`

**功能描述**: 批量删除多个商品

**请求体**:

```json
{
  "ids": ["prod_001", "prod_002", "prod_003"]
}
```

### 2.2 批量更新商品

**接口地址**: `POST /products/batch/update`

**功能描述**: 批量更新商品信息

**请求体**:

```json
{
  "ids": ["prod_001", "prod_002"],
  "data": {
    "status": "inactive",
    "basePrice": 7500
  }
}
```

## 3. 搜索和筛选

### 3.1 搜索商品

**接口地址**: `GET /products/search`

**功能描述**: 根据关键词搜索商品

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

### 3.2 筛选商品

**接口地址**: `GET /products/filter`

**功能描述**: 根据条件筛选商品

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 否 | 分类ID |
| materialType | string | 否 | 物料类型 |
| status | string[] | 否 | 状态列表 |
| priceRange | number[] | 否 | 价格区间 [min, max] |

## 4. 导入导出

### 4.1 导出商品

**接口地址**: `GET /products/export`

**功能描述**: 导出商品数据为Excel文件

**请求参数**: 与列表查询相同的筛选参数

**响应示例**:

```json
{
  "success": true,
  "data": {
    "url": "https://example.com/exports/products_20251210.xlsx"
  }
}
```

### 4.2 导入商品

**接口地址**: `POST /products/import`

**功能描述**: 从Excel文件导入商品数据

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | Excel文件 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "totalCount": 100,
    "successCount": 95,
    "failureCount": 5,
    "errors": [
      {
        "row": 10,
        "field": "price",
        "message": "价格格式错误"
      }
    ]
  }
}
```

## 5. 业务操作

### 5.1 复制商品

**接口地址**: `POST /products/{id}/duplicate`

**功能描述**: 复制指定商品

### 5.2 发布商品

**接口地址**: `POST /products/{id}/publish`

**功能描述**: 将商品状态从草稿改为已发布

### 5.3 下架商品

**接口地址**: `POST /products/{id}/unpublish`

**功能描述**: 下架已发布的商品

### 5.4 归档商品

**接口地址**: `POST /products/{id}/archive`

**功能描述**: 归档商品（不可恢复）

### 5.5 恢复商品

**接口地址**: `POST /products/{id}/restore`

**功能描述**: 恢复已归档的商品

## 6. 错误码说明

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|------------|------|----------|
| PRODUCT_NOT_FOUND | 404 | 商品不存在 | 检查商品ID是否正确 |
| PRODUCT_ALREADY_EXISTS | 409 | 商品已存在 | 使用不同的SKU或名称 |
| INVALID_PRICE | 400 | 价格格式错误 | 检查价格数值和格式 |
| CATEGORY_NOT_FOUND | 400 | 分类不存在 | 选择有效的商品分类 |
| INSUFFICIENT_PERMISSION | 403 | 权限不足 | 联系管理员分配权限 |
| VALIDATION_ERROR | 422 | 数据验证失败 | 检查必填字段和数据格式 |
| INTERNAL_ERROR | 500 | 服务器内部错误 | 联系技术支持 |

## 7. 使用示例

### JavaScript/TypeScript示例

```typescript
// 获取商品列表
import { productService } from '@/services/productService';

const fetchProducts = async () => {
  try {
    const response = await productService.getProducts({
      page: 1,
      pageSize: 20,
      keyword: 'iPhone',
      status: ['active']
    });

    console.log('商品列表:', response.data);
  } catch (error) {
    console.error('获取商品失败:', error);
  }
};

// 创建商品
const createProduct = async () => {
  const productData = {
    name: '新商品',
    categoryId: 'cat_001',
    basePrice: 100,
    materialType: 'finished_goods',
    status: 'draft'
  };

  try {
    const response = await productService.createProduct(productData);
    console.log('商品创建成功:', response.data);
  } catch (error) {
    console.error('创建商品失败:', error);
  }
};
```

### React Query使用示例

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';

// 获取商品列表
export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

// 创建商品
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

## 8. 性能考虑

- **分页查询**: 建议每页不超过100条记录
- **批量操作**: 单次批量操作不超过1000个商品
- **文件上传**: 导入文件大小不超过10MB
- **请求频率**: 建议API请求频率不超过100次/分钟

## 9. 版本更新记录

| 版本 | 更新日期 | 更新内容 |
|------|----------|----------|
| v1.0.0 | 2025-12-10 | 初始版本，包含基础CRUD操作 |