# 库存管理API文档

## 概述

本文档详细说明了库存管理相关的API接口，包括库存查询、调整、预警等功能。

## 1. 库存查询

### 1.1 获取库存列表

**接口地址**: `GET /inventory`

**请求参数**:

| 参数名      | 类型    | 必填 | 说明             |
| ----------- | ------- | ---- | ---------------- |
| productId   | string  | 否   | 商品ID           |
| warehouseId | string  | 否   | 仓库ID           |
| lowStock    | boolean | 否   | 只显示低库存商品 |
| page        | number  | 否   | 页码             |
| pageSize    | number  | 否   | 每页数量         |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": "inv_001",
      "productId": "prod_001",
      "productName": "iPhone 15 Pro",
      "warehouseId": "wh_001",
      "warehouseName": "主仓库",
      "quantity": 100,
      "availableQuantity": 95,
      "reservedQuantity": 5,
      "lowStockThreshold": 20,
      "lastUpdated": "2025-12-10T10:30:00.000Z"
    }
  ]
}
```

### 1.2 获取库存详情

**接口地址**: `GET /inventory/{id}`

## 2. 库存调整

### 2.1 库存入库

**接口地址**: `POST /inventory/inbound`

**请求体**:

```json
{
  "productId": "prod_001",
  "warehouseId": "wh_001",
  "quantity": 50,
  "reason": "采购入库",
  "batchNumber": "BATCH001",
  "expiryDate": "2025-12-31"
}
```

### 2.2 库存出库

**接口地址**: `POST /inventory/outbound`

**请求体**:

```json
{
  "productId": "prod_001",
  "warehouseId": "wh_001",
  "quantity": 10,
  "reason": "销售出库",
  "orderId": "order_001"
}
```

### 2.3 库存调整

**接口地址**: `POST /inventory/adjustment`

**请求体**:

```json
{
  "productId": "prod_001",
  "warehouseId": "wh_001",
  "adjustmentType": "increase",
  "quantity": 5,
  "reason": "盘点调整"
}
```

## 3. 库存预警

### 3.1 获取低库存商品

**接口地址**: `GET /inventory/low-stock`

### 3.2 设置库存预警阈值

**接口地址**: `PUT /inventory/threshold`

**请求体**:

```json
{
  "productId": "prod_001",
  "warehouseId": "wh_001",
  "lowStockThreshold": 20,
  "highStockThreshold": 500
}
```
