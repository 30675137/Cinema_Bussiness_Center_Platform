# API Contracts: O011-order-checkout

**Feature**: O011-order-checkout (小程序订单确认与支付)
**Date**: 2026-01-06
**Status**: N/A - Mock Implementation

## Overview

本 spec 为**纯前端 Mock 实现**，不涉及后端 API 调用，因此没有 OpenAPI/API 契约定义。

## Reason

根据 spec.md 的 "Out of Scope" 章节：

> - 后端订单 API 集成
> - 真实支付 SDK 集成（微信支付、支付宝等）

所有订单数据通过以下方式处理：

| 数据操作 | 实现方式 | 说明 |
|---------|---------|------|
| 订单创建 | 本地生成 + Taro.setStorageSync | 无后端 API |
| 订单号生成 | 前端 Mock 函数 | ORD + 日期 + 随机字符 |
| 取餐编号生成 | 前端 Mock 函数 + 本地计数器 | 字母 + 3 位数字 |
| 订单存储 | Taro.setStorageSync('orders') | 本地存储 |
| 支付流程 | setTimeout 模拟 | 1.5 秒延迟，100% 成功 |

## Future API Considerations

后续版本如需集成后端 API，建议参考以下接口设计：

### POST /api/client/orders (创建订单)

```yaml
# 未来 API 设计参考
paths:
  /api/client/orders:
    post:
      summary: 创建订单
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                items:
                  type: array
                  items:
                    $ref: '#/components/schemas/OrderItemRequest'
                remark:
                  type: string
                  maxLength: 100
      responses:
        '201':
          description: 订单创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderResponse'
```

### POST /api/client/orders/{orderId}/pay (发起支付)

```yaml
# 未来 API 设计参考
paths:
  /api/client/orders/{orderId}/pay:
    post:
      summary: 发起支付
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                paymentMethod:
                  type: string
                  enum: [WECHAT_PAY, ALIPAY, APPLE_PAY]
      responses:
        '200':
          description: 支付发起成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaymentResponse'
```

## Related Specs

- **O001-product-order-list**: B端订单管理 API（已有）
- **O010-shopping-cart**: 购物车功能（纯前端 Mock）
- **O011-order-checkout**: 订单确认与支付（纯前端 Mock - 本 spec）

---

**结论**: 当前版本无需 API 契约，contracts 目录保留用于后续扩展。
