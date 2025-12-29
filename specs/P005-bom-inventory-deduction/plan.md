# Implementation Plan: BOM配方库存预占与扣料

**Branch**: `P005-bom-inventory-deduction` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/P005-bom-inventory-deduction/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a two-phase BOM-based inventory management system that prevents overselling through reservation locks and accurately tracks raw material consumption. When customers order finished products (e.g., cocktails), the system expands BOM formulas to calculate required raw materials, checks available inventory (现存库存 - 预占库存), locks inventory through reservation records, and upon fulfillment confirmation, deducts actual inventory while releasing locks and generating audit trails. The system supports multi-level BOM expansion for combo products, wastage rate calculations, concurrent order handling with pessimistic/optimistic locking, and comprehensive inventory transaction logging for cost accounting and reconciliation.

## Technical Context

**Language/Version**:
- Backend: Java 21 + Spring Boot 3.x
- Frontend (B端流水查询页面): TypeScript 5.9.3 + React 19.2.0
- Frontend (C端订单下单): TypeScript 5.9.3 + Taro 3.x + React

**Primary Dependencies**:
- Backend: Spring Boot Web, Spring Data JPA, Supabase PostgreSQL client, Transaction management (Spring @Transactional)
- B端: Ant Design 6.1.0 (Table, Drawer for inventory transaction logs), TanStack Query 5.90.12 (server state), Zustand 5.0.9 (client state), React Router 7.10.1
- C端: Taro 3.x, Taro UI (product ordering UI), Taro.request (API calls), Zustand (order state management)

**Storage**: Supabase PostgreSQL 作为主要数据源，扩展现有表结构:
- `inventory` 表: 增加 `reserved_quantity` (预占库存)字段
- 新增表: `inventory_reservations` (库存预占记录), `inventory_transactions` (库存变动流水), `bom_snapshots` (BOM配方版本快照)
- 依赖已有表: `skus` (P001-sku-master-data), `bom_components` (P001), `stores` (门店关联)

**Concurrency Control Strategy**: [NEEDS CLARIFICATION: 使用数据库行级锁(SELECT FOR UPDATE)还是乐观锁(version字段)?高并发场景下哪种方案更适合?]

**Transaction Scope**: [NEEDS CLARIFICATION: 预占和实扣操作是否需要分布式事务?如果订单服务和库存服务分离,如何保证事务一致性?]

**Testing**:
- Backend: JUnit 5 + Spring Boot Test (unit & integration tests for reservation/deduction logic)
- B端: Vitest (component tests), Playwright (e2e tests for inventory log viewing)
- C端: Taro 官方测试工具 (order placement flow testing)

**Target Platform**:
- Backend: Spring Boot REST API deployed on server infrastructure
- B端: Modern web browsers (admin users viewing inventory logs)
- C端: 微信小程序 + H5 (customers placing orders)

**Performance Goals**:
- Order reservation: Complete BOM expansion + inventory check + lock within 500ms
- Fulfillment deduction: Complete inventory deduction + lock release + transaction log generation within 1 second
- Support ≥100 concurrent orders per second without overselling
- Inventory transaction log query: Load within 2 seconds, support filtering ≤10,000 records with <3s response

**Constraints**:
- Must integrate with existing P001 (SKU master data & BOM formulas), P003 (inventory query), P004 (inventory adjustment transaction log structure)
- Must be called by O003 (beverage orders) and U001 (reservation orders with product add-ons)
- Must comply with Spring Boot + Supabase architecture, TDD requirements, and API response format standards
- Inventory data consistency ≥99.99% (daily auto-verification)

**Scale/Scope**:
- Backend service handling BOM expansion, reservation, deduction, and transaction logging
- B端: Inventory transaction log viewing page (filtering by transaction type "BOM扣料", SKU, date range, order number)
- C端: Order placement integration (calling reservation API before order creation, calling deduction API on fulfillment confirmation)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `P005-bom-inventory-deduction` 与 specId `P005` 一致，active_spec 已绑定 ✅
- [x] **代码归属标识**: 所有新增代码文件将标注 `@spec P005-bom-inventory-deduction` ✅
- [x] **测试驱动开发**: 预占/实扣/流水查询等关键业务流程将先编写测试(JUnit + Vitest + Playwright)，目标覆盖率100% ✅
- [x] **组件化架构**: B端流水查询页面遵循Atomic Design(organisms/molecules)，C端订单组件复用Taro组件库 ✅
- [x] **前端技术栈分层**: B端使用React 19.2.0+Ant Design 6.1.0，C端使用Taro 3.x，严格分离 ✅
- [x] **数据驱动状态管理**: B端使用Zustand(客户端状态)+TanStack Query(服务器状态)，C端使用Zustand/Redux ✅
- [x] **代码质量工程化**: TypeScript strict mode, ESLint, Prettier, Java静态检查, Husky pre-commit hooks ✅
- [x] **后端技术栈约束**: Spring Boot 3.x + Supabase PostgreSQL，Supabase为主要数据源，扩展现有表结构 ✅
- [x] **API响应格式标准化**: 统一使用 `ApiResponse<T>` 格式，错误响应包含 `error`/`message`/`details` ✅
- [x] **API异常编号规范**: 定义 `INV_*` 前缀异常编号(如 `INV_VAL_001`, `INV_NTF_001`), 集中声明在枚举中 ✅

### 性能与标准检查：
- [x] **性能标准**: 预占<500ms, 实扣<1s, 流水查询<2s, 支持100并发/秒 ✅ (见Success Criteria SC-001~SC-004)
- [x] **安全标准**: 后端使用Spring Validation + 业务层校验，前端使用Zod验证订单数据，API需Token认证 ✅
- [x] **可访问性标准**: B端流水查询页面遵循WCAG 2.1 AA(键盘导航、屏幕阅读器、色彩对比度)，C端遵循小程序无障碍规范 ✅

### 检查结果
✅ **全部通过** - 无宪法原则违反，无需在Complexity Tracking中说明例外情况

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/          # Reusable UI components (Atomic Design)
│   │   ├── atoms/          # Basic UI elements (Button, Input, etc.)
│   │   ├── molecules/      # Component combinations (SearchForm, etc.)
│   │   ├── organisms/      # Complex components (ProductList, etc.)
│   │   └── templates/      # Layout templates (MainLayout, etc.)
│   ├── features/           # Feature-specific modules
│   │   ├── product-management/
│   │   │   ├── components/ # Feature-specific components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── services/   # API services
│   │   │   ├── types/      # TypeScript types
│   │   │   └── utils/      # Utility functions
│   │   └── [other-features]/
│   ├── pages/              # Page components (route-level)
│   ├── hooks/              # Global custom hooks
│   ├── services/           # Global API services
│   ├── stores/             # Zustand stores
│   ├── types/              # Global TypeScript types
│   ├── utils/              # Global utility functions
│   ├── constants/          # Application constants
│   └── assets/             # Static assets
├── public/                 # Public assets and MSW worker
├── tests/                  # Test files
│   ├── __mocks__/         # Mock files
│   ├── fixtures/          # Test data
│   └── utils/             # Test utilities
└── docs/                  # Feature documentation

specs/                      # Feature specifications
├── [###-feature-name]/
│   ├── spec.md           # Feature specification
│   ├── plan.md           # Implementation plan (this file)
│   ├── research.md       # Research findings
│   ├── data-model.md     # Data model design
│   ├── quickstart.md     # Development quickstart
│   └── tasks.md          # Development tasks
└── [other-features]/
```

**Structure Decision**: Frontend-only web application using React with feature-based modular architecture. Components follow Atomic Design principles, business logic is organized by feature modules, and comprehensive testing is maintained at all levels.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
