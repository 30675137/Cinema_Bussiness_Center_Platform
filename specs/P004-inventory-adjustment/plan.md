# Implementation Plan: 库存调整管理 (Inventory Adjustment Management)

**Branch**: `P004-inventory-adjustment` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/P004-inventory-adjustment/spec.md`

## Summary

实现库存调整管理功能，支持库存管理员进行盘盈/盘亏/报损操作，查看库存流水记录，以及管理安全库存阈值。大额调整需运营总监审批。

**核心功能**：
1. 库存调整录入（盘盈/盘亏/报损）+ 二次确认
2. 库存流水查看与筛选（入库绿色+/出库红色-）
3. 调整原因强制填写（预设字典）
4. 大额调整审批流程（阈值触发）
5. 安全库存阈值编辑

**技术方案**：前端扩展现有P003库存查询组件，新增调整表单、流水标签页、审批列表；后端新增调整API和审批API，数据存储于Supabase PostgreSQL。

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
- 本功能为B端管理后台功能，不涉及C端

**Primary Dependencies**:
- Frontend: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13, dayjs 1.11.19
- Backend: Spring Boot Web, Supabase Java/HTTP client

**Storage**: Supabase (PostgreSQL) - 扩展现有 `store_inventory` 表，新增 `inventory_adjustments`、`adjustment_reasons`、`approval_records` 表

**Testing**:
- Frontend: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
- Backend: Spring Boot Test + Supabase 集成测试

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API

**Project Type**: Full-stack web application (B端管理后台扩展)

**Performance Goals**:
- 调整录入完成时间 < 2分钟（用户操作）
- 流水查询响应时间 < 500ms（100条记录）
- 安全库存更新生效时间 < 1秒

**Constraints**:
- 本功能仅限B端管理后台
- 依赖P003-inventory-query现有组件和API
- 依赖P001-sku-master-data的SKU单价数据

**Scale/Scope**:
- 新增页面：调整录入弹窗、审批列表页
- 扩展组件：库存详情抽屉（增加流水标签页、安全库存编辑）
- 新增API：调整CRUD、审批、流水查询

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `P004-inventory-adjustment` 与 active_spec 一致
- [x] **测试驱动开发**: 将先编写调整录入、流水查询、审批流程的测试用例
- [x] **组件化架构**: 复用P003组件，新增组件遵循原子设计（AdjustmentForm、TransactionList、ApprovalList）
- [x] **前端技术栈分层**: 本功能为B端管理后台，使用React+Ant Design，符合规范
- [x] **数据驱动状态管理**: 使用Zustand管理调整表单状态，TanStack Query管理API数据
- [x] **代码质量工程化**: TypeScript严格模式，ESLint检查，Prettier格式化
- [x] **后端技术栈约束**: 使用Spring Boot + Supabase，符合规范

### 性能与标准检查：
- [x] **性能标准**: 流水查询<500ms，列表使用分页（非虚拟滚动，数据量可控）
- [x] **安全标准**: 使用Zod验证调整数据，权限控制调整/审批操作
- [x] **可访问性标准**: 表单支持键盘导航，错误提示可被屏幕阅读器读取

## Project Structure

### Documentation (this feature)

```text
specs/P004-inventory-adjustment/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI specification
├── checklists/          # Quality checklists
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/src/
├── features/
│   └── inventory/
│       ├── components/
│       │   ├── InventoryDetailDrawer.tsx  # 扩展：流水标签页、安全库存编辑
│       │   ├── AdjustmentModal.tsx        # 新增：调整录入弹窗
│       │   ├── AdjustmentForm.tsx         # 新增：调整表单组件
│       │   ├── TransactionList.tsx        # 新增：流水列表组件
│       │   ├── ApprovalList.tsx           # 新增：审批列表组件
│       │   └── ConfirmAdjustmentModal.tsx # 新增：二次确认弹窗
│       ├── hooks/
│       │   ├── useInventoryAdjustment.ts  # 新增：调整相关hooks
│       │   └── useApproval.ts             # 新增：审批相关hooks
│       ├── services/
│       │   ├── adjustmentService.ts       # 新增：调整API服务
│       │   └── approvalService.ts         # 新增：审批API服务
│       └── types/
│           └── index.ts                   # 扩展：调整、审批类型定义
├── pages/
│   └── inventory/
│       └── ApprovalPage.tsx               # 新增：审批列表页面
└── mocks/
    └── handlers/
        └── adjustmentHandlers.ts          # 新增：调整相关Mock handlers

backend/src/main/java/com/cinema/
├── controller/
│   ├── InventoryAdjustmentController.java # 新增：调整API
│   └── ApprovalController.java            # 新增：审批API
├── service/
│   ├── InventoryAdjustmentService.java    # 新增：调整业务逻辑
│   └── ApprovalService.java               # 新增：审批业务逻辑
├── dto/
│   ├── AdjustmentRequest.java             # 新增：调整请求DTO
│   ├── AdjustmentResponse.java            # 新增：调整响应DTO
│   └── ApprovalRequest.java               # 新增：审批请求DTO
└── repository/
    ├── AdjustmentRepository.java          # 新增：调整数据访问
    └── ApprovalRepository.java            # 新增：审批数据访问
```

**Structure Decision**: 扩展现有P003库存模块，新增调整和审批功能。前端采用弹窗式调整录入（复用库存列表入口），后端新增独立的调整和审批Controller。

## Complexity Tracking

> **No violations detected. Constitution Check passed.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
