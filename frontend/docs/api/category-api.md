# 分类管理API文档

## 概述

本文档详细说明了商品分类管理相关的API接口，包括分类的创建、查询、更新和删除等操作。

## 1. 分类基础CRUD操作

### 1.1 获取分类列表

**接口地址**: `GET /categories`

**功能描述**: 获取商品分类树形结构

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| level | number | 否 | 分类级别 | 1 |
| parentId | string | 否 | 父分类ID | "cat_001" |
| status | string | 否 | 分类状态 | "active" |
| includeChildren | boolean | 否 | 是否包含子分类 | true |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": "cat_001",
      "name": "电子产品",
      "code": "electronics",
      "level": 1,
      "parentId": null,
      "path": "/electronics",
      "sortOrder": 1,
      "status": "active",
      "children": [
        {
          "id": "cat_002",
          "name": "手机",
          "code": "mobile",
          "level": 2,
          "parentId": "cat_001",
          "path": "/electronics/mobile",
          "sortOrder": 1,
          "status": "active"
        }
      ]
    }
  ]
}
```

### 1.2 创建分类

**接口地址**: `POST /categories`

**功能描述**: 创建新的商品分类

**请求体**:

```json
{
  "name": "笔记本电脑",
  "code": "laptop",
  "parentId": "cat_001",
  "sortOrder": 2,
  "description": "各种品牌的笔记本电脑"
}
```

### 1.3 更新分类

**接口地址**: `PUT /categories/{id}`

### 1.4 删除分类

**接口地址**: `DELETE /categories/{id}`

## 2. 分类特殊操作

### 2.1 移动分类

**接口地址**: `POST /categories/{id}/move`

**功能描述**: 移动分类到新的父分类下

**请求体**:

```json
{
  "newParentId": "cat_003",
  "newSortOrder": 1
}
```

### 2.2 批量排序

**接口地址**: `POST /categories/batch/sort`

**请求体**:

```json
{
  "categories": [
    {
      "id": "cat_001",
      "sortOrder": 1
    },
    {
      "id": "cat_002",
      "sortOrder": 2
    }
  ]
}
```

## 3. 分类统计

### 3.1 获取分类统计

**接口地址**: `GET /categories/{id}/stats`

**功能描述**: 获取分类下的商品统计信息

**响应示例**:

```json
{
  "success": true,
  "data": {
    "categoryId": "cat_001",
    "totalProducts": 150,
    "activeProducts": 120,
    "draftProducts": 30,
    "subCategories": [
      {
        "id": "cat_002",
        "name": "手机",
        "productCount": 80
      }
    ]
  }
}
```