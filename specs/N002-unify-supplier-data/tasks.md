# Tasks: 统一供应商数据源 (N002)

**Input**: Design documents from `/specs/N002-unify-supplier-data/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅
**Status**: ✅ 全部完成 (2026-01-11)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: 项目初始化和基础结构确认

- [x] T001 确认后端 API 可用性 `GET /api/suppliers`
- [x] T002 [P] 确认现有类型定义 `frontend/src/types/supplier.ts`
- [x] T003 [P] 确认 store 基础结构 `frontend/src/stores/baseStore.ts`

---

## Phase 2: Foundational (API 服务层)

**Purpose**: 创建 API 服务层，为所有用户故事提供数据获取能力

**⚠️ CRITICAL**: 用户故事实现前必须完成此阶段

- [x] T004 创建 supplierApi.ts 服务层 `frontend/src/services/supplierApi.ts`
  - 定义 SupplierDTO 接口
  - 定义 ApiResponse 接口
  - 实现 mapStatusToEnum 状态映射
  - 实现 mapDTOToListItem 字段映射
  - 实现 mapDTOToSupplier 完整类型映射
- [x] T005 实现 fetchSuppliers 函数 `frontend/src/services/supplierApi.ts`
- [x] T006 实现 fetchSuppliersAsFull 函数 `frontend/src/services/supplierApi.ts`
- [x] T007 实现 fetchSupplierById 函数 `frontend/src/services/supplierApi.ts`
- [x] T008 添加 @spec N002-unify-supplier-data 标识 `frontend/src/services/supplierApi.ts`

**Checkpoint**: API 服务层就绪，可开始用户故事实现

---

## Phase 3: User Story 1 - 供应商列表查看 (Priority: P1) 🎯 MVP

**Goal**: 采购管理员进入供应商列表页面，查看后端真实数据

**Independent Test**: 进入供应商列表页面，验证显示的数据与数据库 suppliers 表一致

### Implementation for User Story 1

- [x] T009 [US1] 修改 supplierStore.ts 的 fetchSuppliers 方法 `frontend/src/stores/supplierStore.ts`
  - 导入 fetchSuppliersAsFull 函数
  - 调用真实后端 API 替代 mock 数据
  - 添加 @spec N002-unify-supplier-data 标识
- [x] T010 [US1] 移除 SupplierList.tsx 中的硬编码 mockData `frontend/src/pages/procurement/SupplierList.tsx`
  - 删除第 57-118 行的 mockSuppliers 数据
  - 使用 useSupplierStore 获取数据
  - 添加 loading 状态处理
  - 添加 error 状态处理
- [x] T011 [US1] 添加空状态提示 `frontend/src/pages/procurement/SupplierList.tsx`
  - 当数据为空时显示 "暂无供应商数据"
- [x] T012 [US1] 添加 @spec N002-unify-supplier-data 标识 `frontend/src/pages/procurement/SupplierList.tsx`

**Checkpoint**: 供应商列表页面显示后端真实数据 ✅

---

## Phase 4: User Story 2 - 供应商筛选 (Priority: P2)

**Goal**: 采购管理员通过状态筛选器筛选特定状态的供应商

**Independent Test**: 选择"启用"状态筛选，验证只显示 status='ACTIVE' 的供应商

### Implementation for User Story 2

- [x] T013 [US2] 确认筛选组件已存在 `frontend/src/pages/procurement/SupplierList.tsx`
  - 状态筛选 Select 组件已实现
  - 支持 ACTIVE、SUSPENDED、TERMINATED 状态
- [x] T014 [US2] 实现客户端筛选逻辑 `frontend/src/pages/procurement/SupplierList.tsx`
  - filteredSuppliers useMemo 实现状态过滤
  - 支持搜索文本过滤

**Checkpoint**: 筛选功能正常工作 ✅

---

## Phase 5: User Story 3 - 页面路由统一 (Priority: P1)

**Goal**: 两个供应商入口页面使用同一数据源

**Independent Test**: 分别从两个菜单入口进入，验证显示的数据完全一致

### Implementation for User Story 3

- [x] T015 [US3] 确认两个页面都使用 useSupplierStore `frontend/src/stores/supplierStore.ts`
  - `/purchase-management/suppliers` → SupplierList.tsx ✅
  - `/procurement/supplier` → SupplierManagePage.tsx (已使用 useSupplierStore)
- [x] T016 [US3] 验证数据一致性
  - 两个页面调用同一个 store
  - Store 调用同一个 API

**Checkpoint**: 两个页面数据完全一致 ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 代码质量和文档完善

- [x] T017 [P] 运行 Prettier 格式化 `frontend/src/services/supplierApi.ts`
- [x] T018 [P] 移除未使用的导入 `frontend/src/stores/supplierStore.ts`
  - 移除 createModalStore
  - 移除 SupplierBatchOperationParams
- [x] T019 验证 TypeScript 编译通过 `npm run build`
- [x] T020 [P] 更新 requirements.md 标记实现完成 `specs/N002-unify-supplier-data/checklists/requirements.md`
- [x] T021 [P] 更新 spec.md 状态为完成 `specs/N002-unify-supplier-data/spec.md`
- [x] T022 更新 Lark PM 记录状态为 Done

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 无依赖，可立即开始
- **Phase 2 (Foundational)**: 依赖 Phase 1 完成，阻塞所有用户故事
- **Phase 3 (US1)**: 依赖 Phase 2 完成
- **Phase 4 (US2)**: 依赖 Phase 3 完成（使用同一数据源）
- **Phase 5 (US3)**: 依赖 Phase 3 完成（验证数据一致性）
- **Phase 6 (Polish)**: 依赖所有用户故事完成

### User Story Dependencies

- **US1 (供应商列表查看)**: 核心功能，无依赖
- **US2 (供应商筛选)**: 依赖 US1（需要数据才能筛选）
- **US3 (页面路由统一)**: 依赖 US1（需要数据源统一）

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 22 |
| Phase 1 (Setup) | 3 tasks |
| Phase 2 (Foundational) | 5 tasks |
| Phase 3 (US1) | 4 tasks |
| Phase 4 (US2) | 2 tasks |
| Phase 5 (US3) | 2 tasks |
| Phase 6 (Polish) | 6 tasks |
| Parallel Opportunities | 8 tasks marked [P] |
| Status | ✅ 全部完成 |

### MVP Scope

**User Story 1** 是 MVP：用户可以看到后端真实的供应商数据。

### Files Changed

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/services/supplierApi.ts` | 新建 | API 服务层 |
| `frontend/src/stores/supplierStore.ts` | 修改 | 调用真实 API |
| `frontend/src/pages/procurement/SupplierList.tsx` | 修改 | 移除 mockData |

---

**Generated**: 2026-01-11
**Execution Status**: ✅ Complete
