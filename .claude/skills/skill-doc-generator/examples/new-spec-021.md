# Feature Specification: 订单管理

**Feature Branch**: `021-order-management`
**Created**: 2025-12-22

## Requirements

### Key Entities

- **Order（订单）**:
  - orderId（订单ID，长整型，主键）
  - storeId（门店ID，长整型，外键）
  - totalAmount（总金额，整型，单位分）
  - status（订单状态，枚举：PENDING, CONFIRMED, CANCELLED）
  - createdAt（创建时间，时间戳）

**业务规则**：
- 订单创建后默认状态为 PENDING
- 订单总金额必须大于 0

**关系**：
- 与 Store 的关系：多对一 - 一个订单属于一个门店
