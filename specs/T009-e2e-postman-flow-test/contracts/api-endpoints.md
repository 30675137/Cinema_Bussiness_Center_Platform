# API Endpoints: E2E Postman 业务流程测试

**Date**: 2026-01-14  
**Branch**: T009-e2e-postman-flow-test  
**Phase**: 1 - Design & Contracts

## Overview

本文档列出 E2E Postman 测试涉及的所有 API 端点，包括请求格式、响应格式和错误码。

---

## SPU Management APIs

### POST /api/spu
**功能**: 创建 SPU

**请求**:
```http
POST {{api_base_url}}/api/spu
Content-Type: application/json

{
  "name": "测试饮品 SPU - Mojito",
  "categoryId": "550e8400-e29b-41d4-a716-446655440003",
  "description": "鸡尾酒分类",
  "status": "ACTIVE"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid-generated",
    "name": "测试饮品 SPU - Mojito",
    "categoryId": "550e8400-e29b-41d4-a716-446655440003",
    "status": "ACTIVE"
  }
}
```

---

## SKU Management APIs

### POST /api/sku
**功能**: 创建 SKU

**请求**:
```http
POST {{api_base_url}}/api/sku
Content-Type: application/json

{
  "spuId": "{{test_spu_id}}",
  "skuCode": "TEST_MAT_RUM_001",
  "skuName": "朗姆酒",
  "skuType": "RAW_MATERIAL",
  "primaryUnit": "ml",
  "standardCost": 0.15,
  "wasteRate": 0.0,
  "status": "ACTIVE"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid-generated",
    "skuCode": "TEST_MAT_RUM_001",
    "skuName": "朗姆酒",
    "skuType": "RAW_MATERIAL"
  }
}
```

---

## BOM Management APIs

### POST /api/bom
**功能**: 创建 BOM 配方

**请求**:
```http
POST {{api_base_url}}/api/bom
Content-Type: application/json

{
  "finishedProductId": "{{test_sku_id_1}}",
  "components": [
    {
      "componentType": "MATERIAL",
      "materialId": "{{test_material_rum_id}}",
      "quantity": 45,
      "unit": "ml"
    }
  ],
  "wasteRate": 5.0
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid-generated",
    "finishedProductId": "...",
    "components": [...]
  }
}
```

---

## Inventory APIs (Supabase REST API)

### POST {{supabase_url}}/rest/v1/store_inventory
**功能**: 初始化库存

**请求**:
```http
POST {{supabase_url}}/rest/v1/store_inventory
apikey: {{supabase_anon_key}}
Prefer: return=representation

{
  "store_id": "00000000-0000-0000-0000-000000000099",
  "sku_id": "{{test_material_rum_id}}",
  "on_hand_qty": 5000,
  "available_qty": 5000,
  "reserved_qty": 0,
  "safety_stock": 500
}
```

---

## Order APIs

### POST /api/orders
**功能**: 创建销售订单

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "status": "PENDING_PAYMENT",
    "reservationStatus": "RESERVED"
  }
}
```

**库存不足响应** (409):
```json
{
  "success": false,
  "error": "ORD_BIZ_002",
  "message": "库存不足",
  "shortageItems": [
    {
      "skuId": "...",
      "skuName": "薄荷叶",
      "required": 49995,
      "available": 500
    }
  ]
}
```

### POST /api/orders/{id}/cancel
**功能**: 取消订单

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "status": "CANCELLED",
    "reservationStatus": "CANCELLED"
  }
}
```

---

## Error Codes

| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| ORD_BIZ_002 | 409 | 库存不足 |
| SKU_VAL_001 | 400 | SKU 验证失败 |
| BOM_NTF_001 | 404 | BOM 不存在 |

**完整错误码列表**: 参考 `docs/api-error-codes.md`
