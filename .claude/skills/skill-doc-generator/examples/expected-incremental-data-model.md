# 数据/领域模型说明

## 文档信息
- 功能标识：020-store-address, 021-order-management
- 生成时间：2025-12-22T10:00:00Z
- 基于规格：specs/020-store-address/spec.md, specs/021-order-management/spec.md

## 领域概述

本功能扩展门店实体（Store），添加地址信息相关字段。新增订单管理功能。

## 核心实体

### Store（门店）

**说明**：门店实体扩展，新增地址信息字段

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| province | String | 是 | 省份 | 中国大陆省份名称 |
| city | String | 是 | 城市 | 与原 014 规格中 region/city 字段对齐 |
| district | String | 是 | 区县 | 三级行政区划 |

**业务规则**：
- province、city、district 三级行政区划为必填项，确保地址信息完整性

**关系**：
- 与 User 的关系：多对一 - 一个门店属于一个用户（运营人员）

---

### Order（订单）

**说明**：订单实体（来源：021-order-management）

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| orderId | Long | 是 | 订单ID | 主键 （来源：021-order-management） |
| storeId | Long | 是 | 门店ID | 外键 （来源：021-order-management） |
| totalAmount | Integer | 是 | 总金额 | 单位分 （来源：021-order-management） |
| status | Enum | 是 | 订单状态 | PENDING, CONFIRMED, CANCELLED （来源：021-order-management） |
| createdAt | Timestamp | 是 | 创建时间 | （来源：021-order-management） |

**业务规则**：
- 订单创建后默认状态为 PENDING
- 订单总金额必须大于 0

**关系**：
- 与 Store 的关系：多对一 - 一个订单属于一个门店

---
