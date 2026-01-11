# Implementation Plan: 统一供应商数据源

**Branch**: `feat/N002-unify-supplier-data` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/N002-unify-supplier-data/spec.md`

## Summary

统一两套供应商列表实现的数据源，移除硬编码 mockData，让所有供应商页面通过 `useSupplierStore` 调用后端真实 API (`GET /api/suppliers`) 获取数据，确保数据一致性。

**技术方案**：
1. 修改 `supplierStore.ts` 的 `fetchSuppliers` 调用真实后端 API
2. 修改 `SupplierList.tsx` 使用 store 而非硬编码数据
3. 统一类型定义，确保前后端字段映射正确

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.9.3 + React 19.2.0

**Primary Dependencies**:
- Zustand 5.0.9 (状态管理)
- Ant Design 6.1.0 (UI 组件)

**Storage**: 后端 Supabase PostgreSQL（通过 Spring Boot API 访问）

**Testing**: Vitest (单元测试)

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)

**Project Type**: 前端改造（仅修改前端代码，后端 API 已存在）

**Performance Goals**: API 响应 < 2s，页面加载 < 500ms

**Constraints**:
- 后端 API `GET /api/suppliers` 已在 N001 中实现
- 不涉及后端代码修改
- 不涉及供应商增删改功能

**Scale/Scope**: 小型改造，影响 3 个文件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `feat/N002-unify-supplier-data` 与 spec 目录 `N002-unify-supplier-data` 一致
- [x] **测试驱动开发**: 需为 supplierStore 的 fetchSuppliers 编写单元测试
- [x] **组件化架构**: 复用现有 SupplierList 组件，仅修改数据源
- [x] **前端技术栈分层**: 使用 React + Ant Design (B端)，符合规范
- [x] **数据驱动状态管理**: 使用 Zustand + API 调用，符合规范
- [x] **代码质量工程化**: 需添加 `@spec N002-unify-supplier-data` 标识
- [ ] **后端技术栈约束**: N/A - 本次仅前端改造

### 性能与标准检查：
- [x] **性能标准**: API 调用 < 2s，符合要求
- [x] **安全标准**: B端暂不实现认证，符合当前策略
- [ ] **可访问性标准**: N/A - 不涉及 UI 变更

## Project Structure

### Documentation (this feature)

```text
specs/N002-unify-supplier-data/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code Changes

```text
frontend/src/
├── stores/
│   └── supplierStore.ts      # 修改: fetchSuppliers 调用真实 API
├── pages/procurement/
│   └── SupplierList.tsx      # 修改: 使用 store 替代硬编码数据
├── types/
│   └── supplier.ts           # 检查: 确认类型定义与后端一致
└── services/
    └── supplierApi.ts        # 新增: 供应商 API 服务
```

## Complexity Tracking

> 本次改造较为简单，无需记录复杂性违规

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 无 | - | - |

---

## Phase 0: Research

### 0.1 后端 API 分析

**已确认的后端 API**：
- **端点**: `GET /api/suppliers`
- **参数**: `status` (可选，枚举值: ACTIVE, SUSPENDED, TERMINATED)
- **响应格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "code": "SUP001",
      "name": "供应商名称",
      "contactName": "联系人",
      "contactPhone": "13800138000",
      "status": "ACTIVE"
    }
  ],
  "timestamp": "2026-01-11T10:00:00Z"
}
```

### 0.2 前端类型定义分析

**现有前端 Supplier 类型** (`frontend/src/types/supplier.ts`):
- 需要确认是否与后端 DTO 字段对齐
- 特别关注 `contactName` vs `contactPerson` 字段映射

### 0.3 研究结论

| 决策 | 理由 | 备选方案 |
|------|------|---------|
| 使用 fetch API 调用后端 | 简单直接，无需额外依赖 | 使用 axios (过度设计) |
| 在 supplierStore 中直接调用 API | 符合现有架构，最小改动 | 使用 TanStack Query (可后续迁移) |
| 创建 supplierApi.ts 服务层 | 分离关注点，便于测试和复用 | 直接在 store 中写 fetch (耦合) |

---

## Phase 1: Design

### 1.1 Data Model

详见 [data-model.md](./data-model.md)

**核心映射**：

| 后端 SupplierDTO | 前端 Supplier | 说明 |
|-----------------|---------------|------|
| id (UUID) | id (string) | 直接映射 |
| code | code | 直接映射 |
| name | name | 直接映射 |
| contactName | contactPerson | 字段重命名 |
| contactPhone | contactPhone | 直接映射 |
| status | status | 直接映射 |

### 1.2 API Contract

后端 API 已存在，无需设计新接口。

详见 [contracts/](./contracts/) 目录（如需要）。

### 1.3 Implementation Tasks

| 任务 | 优先级 | 估计改动 |
|------|--------|---------|
| T1: 创建 supplierApi.ts | P0 | 新建文件 |
| T2: 修改 supplierStore.ts | P0 | ~50 行 |
| T3: 修改 SupplierList.tsx | P0 | ~100 行 |
| T4: 添加单元测试 | P1 | ~30 行 |
| T5: 更新类型定义 (如需) | P1 | ~10 行 |

---

## Next Steps

1. 运行 `/speckit.tasks` 生成详细任务清单
2. 或直接开始实现（改造量较小）

**预计完成时间**: 1-2 小时
