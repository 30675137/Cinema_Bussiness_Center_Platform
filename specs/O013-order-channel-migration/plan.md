# Implementation Plan: 订单模块迁移至渠道商品体系

**Branch**: `O013-order-channel-migration` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O013-order-channel-migration/spec.md`

## Summary

将订单模块从旧的 beverages 体系迁移到新的 channel_products/skus 体系。主要工作包括：

1. **数据模型改造**: 将 `beverage_order_items.beverage_id` 外键改为 `channel_product_id`
2. **API 改造**: 将下单接口从 `/api/client/beverage-orders` 重命名为 `/api/client/orders`，使用 `channelProductId`
3. **前端适配**: 修改 miniapp-ordering-taro 的购物车和下单逻辑
4. **O012 测试更新**: 更新 Postman 测试流程，使用 `channelProductId`
5. **历史表清理**: 删除 beverages、beverage_specs、beverage_recipes 等冗余表

## Technical Context

**Language/Version**: Java 17, TypeScript 5.x  
**Primary Dependencies**: Spring Boot 3.x, Taro 3.x, Spring Data JPA  
**Storage**: PostgreSQL (Supabase)  
**Testing**: JUnit 5, Vitest, Postman/Newman  
**Target Platform**: Web (B端管理后台), Mini Program (C端小程序)  
**Project Type**: Web application (frontend + backend + miniapp)  
**Performance Goals**: 订单创建成功率 99.9%，API 响应时间 < 500ms  
**Constraints**: 无历史数据迁移需求（系统未上线）  
**Scale/Scope**: 单门店，预计日订单量 < 1000

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 分支 `O013-order-channel-migration` 与规格目录 `specs/O013-order-channel-migration` 正确绑定
- [x] **代码归属标识**: 所有新增/修改的代码文件必须添加 `@spec O013-order-channel-migration` 标识
- [x] **测试驱动开发**: 关键业务逻辑需编写单元测试，O012 Postman 测试流程需同步更新
- [ ] **组件化架构**: 前端组件复用现有购物车/订单组件，仅修改数据结构
- [ ] **数据驱动状态管理**: 使用 TanStack Query 管理 API 状态

### 性能与标准检查：
- [ ] **性能标准**: API 响应时间 < 500ms
- [ ] **安全标准**: C端下单 API 需验证商品状态为 ACTIVE
- [ ] **API 响应格式**: 遵循统一的 `ApiResponse` 格式

## Project Structure

### Documentation (this feature)

```text
specs/O013-order-channel-migration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
# Backend Changes
backend/
├── src/main/java/com/cinema/
│   ├── beverage/
│   │   ├── controller/
│   │   │   └── BeverageOrderController.java  # 重命名为 ConsumerOrderController
│   │   ├── dto/
│   │   │   ├── CreateBeverageOrderRequest.java  # 修改：skuId → channelProductId
│   │   │   └── BeverageOrderDTO.java           # 修改：字段映射
│   │   ├── entity/
│   │   │   ├── BeverageOrderItem.java          # 修改：beverageId → channelProductId
│   │   │   └── Beverage.java                   # 删除
│   │   ├── repository/
│   │   │   ├── BeverageRepository.java         # 删除
│   │   │   └── BeverageSpecRepository.java     # 删除
│   │   └── service/
│   │       └── BeverageOrderService.java       # 修改：使用 ChannelProductConfig
│   └── channelproduct/
│       └── domain/
│           └── ChannelProductConfig.java       # 现有实体
└── src/main/resources/db/migration/
    └── V###__order_channel_migration.sql       # 数据库迁移脚本

# Frontend Changes (miniapp-ordering-taro)
miniapp-ordering-taro/
└── src/
    ├── services/
    │   └── orderService.ts                     # 修改：API 路径和参数
    ├── store/
    │   └── cartStore.ts                        # 修改：使用 channelProductId
    └── pages/
        ├── order/
        │   └── confirm/                        # 修改：下单请求参数
        └── order-detail/                       # 修改：订单详情数据结构

# O012 Postman Tests
specs/O012-order-inventory-reservation/postman/
├── O012-setup-teardown.postman_collection.json  # 新增：创建 channel_product_config 步骤
├── O012-order-reservation.postman_collection.json  # 修改：skuId → channelProductId
└── O012-test-data.csv                           # 修改：测试数据
```

**Structure Decision**: Web application structure (backend + frontend + miniapp). 后端使用现有的 beverage 模块，重构为支持 channel_product 体系。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 无 | - | - |

---

## Phase 0: Research

### 研究任务

1. **现有订单数据模型分析**
   - `beverage_order_items.beverage_id` 外键约束
   - `BeverageOrderService.createOrder()` 商品信息获取逻辑
   - O012 库存预占如何通过 BOM 展开

2. **渠道商品配置数据模型**
   - `channel_product_config` 与 `skus` 的关联关系
   - `channel_product_config.specs` JSON 规格结构
   - 如何从 `channel_product_id` 获取 SKU 和 BOM 信息

3. **前端数据流分析**
   - miniapp-ordering-taro 购物车数据结构
   - 下单请求参数和 API 调用路径
   - 订单详情页面数据源

### 研究结论

详见 [research.md](./research.md)

---

## Phase 1: Design & Contracts

### 数据模型变更

详见 [data-model.md](./data-model.md)

**核心变更**:

1. **beverage_order_items 表**:
   - 新增 `channel_product_id UUID` 字段（关联 `channel_product_config`）
   - 保留 `beverage_id` 暂存 SKU ID（过渡期兼容）
   - 新增 `product_snapshot JSONB` 存储商品快照

2. **外键约束迁移**:
   - 移除 `beverage_order_items → beverages` 外键
   - 新增 `beverage_order_items → channel_product_config` 外键

### API 契约

详见 [contracts/api.yaml](./contracts/api.yaml)

**核心变更**:

| 原 API | 新 API | 变更说明 |
|--------|--------|---------|
| `POST /api/client/beverage-orders` | `POST /api/client/orders` | 路径重命名 |
| `items[].skuId` | `items[].channelProductId` | 参数名变更 |

### 快速入门

详见 [quickstart.md](./quickstart.md)

---

## Phase 2: Implementation Tasks

**Note**: 任务清单将由 `/speckit.tasks` 命令生成，存储在 `tasks.md` 文件中。

### 预计任务分组

| Phase | 描述 | 预计任务数 |
|-------|------|-----------|
| P1 | 数据库迁移脚本 | 3 |
| P2 | 后端 API 改造 | 8 |
| P3 | 前端适配 (miniapp-ordering-taro) | 6 |
| P4 | O012 Postman 测试更新 | 4 |
| P5 | 历史表/代码清理 | 5 |
| P6 | 集成测试与验证 | 3 |

---

## Next Steps

1. 执行 `/speckit.tasks` 生成详细任务清单
2. 按 Phase 顺序执行任务
3. 每个 Phase 完成后更新 Lark PM 状态
