# Implementation Plan: 小程序订单确认与支付

**Branch**: `O011-order-checkout` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O011-order-checkout/spec.md`

## Summary

实现小程序订单确认与支付功能，完成从购物车到订单生成的完整流程。主要包括：
1. **订单确认页**：展示购物车商品、备注输入、金额汇总、发起支付
2. **Mock 支付流程**：支付方式选择抽屉、支付加载动画、模拟 1.5 秒延迟
3. **支付成功页**：显示订单号、取餐编号、支付金额、返回首页按钮
4. **订单数据持久化**：复用 B端 ProductOrder 模型，本地存储订单数据

技术方案：
- 使用 Taro 框架开发，支持微信小程序和 H5
- 状态管理复用 O010 的 cartStore（Zustand）
- 订单数据模型对齐 B端 `ProductOrder` 接口，扩展 `pickupNumber` 和 `remark` 字段
- Mock 支付使用 setTimeout 模拟 1.5 秒延迟

## Technical Context

**Language/Version**:
- C端（客户端/小程序）: TypeScript 5.x + Taro 4.1.9 + React 18.x

**Primary Dependencies**:
- Taro 4.1.9（多端框架）
- Zustand 4.5.5（状态管理，复用 O010 cartStore）
- @tarojs/components（Taro 基础组件）

**Storage**:
- 购物车数据：`Taro.setStorageSync('cart', cart)` - 已由 O010 实现
- 订单数据：`Taro.setStorageSync('orders', orders)` - 本 spec 新增
- 取餐编号计数器：`Taro.setStorageSync('pickupNumberCounter', counter)` - 本 spec 新增

**Testing**:
- Vitest 单元测试（订单服务、工具函数）
- 微信开发者工具 / H5 浏览器测试

**Target Platform**:
- 微信小程序（主要）
- H5（辅助）

**Project Type**:
- C端 Taro 多端应用，纯前端 Mock 实现

**Performance Goals**:
- 订单确认页加载 < 500ms
- Mock 支付流程 < 2s
- 订单数据存储 < 100ms

**Constraints**:
- 必须使用 Taro 框架
- 订单数据模型必须复用 B端 ProductOrder 结构
- 支付为 Mock 实现，100% 成功
- 不涉及后端 API 调用

**Scale/Scope**:
- 2 个新页面（order-confirm, order-success）
- 1 个新组件（PaymentSheet）
- 1 个新服务（orderService）
- 1 个新类型定义文件（types/order.ts）

**Data Model Alignment**:
- 复用 B端订单模型：`frontend/src/features/order-management/types/order.ts`
- ProductOrder 接口 + C端扩展字段（pickupNumber, remark）
- OrderItem 结构复用
- OrderStatus 枚举复用

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `O011-order-checkout` 与 active_spec 指向 `specs/O011-order-checkout/spec.md` 一致
- [x] **测试驱动开发**: 计划为订单服务、取餐编号生成、订单号生成编写单元测试
- [x] **组件化架构**: PaymentSheet 作为独立组件，页面遵循 Taro 组件规范
- [x] **前端技术栈分层**: C端使用 Taro 框架，与 B端 React+Ant Design 分离
- [x] **数据驱动状态管理**: 复用 Zustand cartStore，可选新建 orderStore
- [x] **代码质量工程化**: TypeScript 类型检查，所有文件包含 `@spec O011-order-checkout` 标识
- [x] **后端技术栈约束**: N/A（本 spec 为纯前端 Mock 实现，不涉及后端）

### 性能与标准检查：
- [x] **性能标准**: 订单确认页加载 < 500ms，支付流程 < 2s
- [x] **安全标准**: C端按实际需求实现，当前 Mock 无敏感数据处理
- [x] **可访问性标准**: 遵循 WCAG 2.1 AA 级别，支持键盘导航

## Project Structure

### Documentation (this feature)

```text
specs/O011-order-checkout/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for this spec - Mock only)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (miniapp-ordering-taro)

```text
miniapp-ordering-taro/src/
├── pages/
│   ├── order-confirm/           # 订单确认页（新增）
│   │   ├── index.tsx
│   │   ├── index.less
│   │   └── index.config.ts
│   └── order-success/           # 支付成功页（新增）
│       ├── index.tsx
│       ├── index.less
│       └── index.config.ts
├── components/
│   └── PaymentSheet/            # 支付方式选择抽屉（新增）
│       ├── index.tsx
│       └── index.less
├── services/
│   └── orderService.ts          # 订单服务（新增）
├── stores/
│   └── cartStore.ts             # 购物车状态管理（已有，O010）
├── types/
│   ├── cart.ts                  # 购物车类型（已有，O010）
│   └── order.ts                 # 订单类型定义（新增）
├── utils/
│   └── formatPrice.ts           # 价格格式化（已有）
└── app.config.ts                # 路由配置（更新）
```

**Structure Decision**: C端 Taro 多端应用，订单数据模型复用 B端结构，组件遵循 Taro 规范，状态管理使用 Zustand。

## Complexity Tracking

> **无需填写** - 本 spec 不违反任何宪法原则

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
