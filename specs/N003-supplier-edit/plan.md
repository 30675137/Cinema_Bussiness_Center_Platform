# Implementation Plan: 供应商编辑功能

**Branch**: `N003-supplier-edit` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/N003-supplier-edit/spec.md`

## Summary

实现供应商列表页面的新建和编辑功能。当前页面已有编辑模态框 UI，但后端缺少更新/创建 API，前端保存逻辑未实现。

**技术方案**:
- 后端: 新增 `PUT /api/suppliers/{id}` 和 `POST /api/suppliers` 接口
- 前端: 在 `supplierApi.ts` 添加 API 调用函数，在 `SupplierList.tsx` 实现保存逻辑

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 17 + Spring Boot 3.x (backend)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1
- 后端: Spring Boot Web, Spring Data JPA, PostgreSQL (Supabase)

**Storage**: Supabase (PostgreSQL) 作为主要后端数据源，使用 JPA 直接访问数据库

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests, optional)
- 后端: JUnit (unit tests)

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API

**Project Type**:
- Full-stack web application (Spring Boot backend + React frontend for B端 admin interface)

**Performance Goals**:
- B端: <3s app startup, <500ms page transitions, <2s API response time

**Constraints**:
- 供应商编码创建后不可修改
- 编辑模式下编码字段只读
- 必须验证编码唯一性

**Scale/Scope**:
- 单个页面功能增强
- 2 个新 API 端点

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `feat/N003-supplier-edit` 与 active_spec `specs/N003-supplier-edit` 匹配
- [x] **测试驱动开发**: 后端 API 需编写单元测试，前端组件需编写交互测试
- [x] **组件化架构**: 复用现有模态框和表单组件，无需新建组件
- [x] **前端技术栈分层**: 使用 React + Ant Design (B端)
- [x] **数据驱动状态管理**: 使用 supplierStore (Zustand) + TanStack Query 刷新
- [x] **代码质量工程化**: 所有代码必须包含 `@spec N003-supplier-edit` 标识
- [x] **后端技术栈约束**: 使用 Spring Boot + JPA + Supabase PostgreSQL

### 性能与标准检查：
- [x] **性能标准**: API 响应 <2s，表单提交有 loading 状态
- [x] **安全标准**: 使用 Zod/表单验证防止 XSS；B端暂不实现认证授权
- [x] **可访问性标准**: 表单元素有明确标签，支持键盘操作

## Project Structure

### Documentation (this feature)

```text
specs/N003-supplier-edit/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI specification
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code Changes

```text
backend/
├── src/main/java/com/cinema/procurement/
│   ├── controller/SupplierController.java   # 新增 PUT/POST 接口
│   ├── service/SupplierService.java         # 新增 create/update 方法
│   ├── dto/SupplierUpdateRequest.java       # 新增 DTO
│   └── dto/SupplierCreateRequest.java       # 新增 DTO

frontend/
├── src/
│   ├── services/supplierApi.ts              # 新增 createSupplier/updateSupplier
│   └── pages/procurement/SupplierList.tsx   # 修改 handleModalOk 逻辑
```

## Complexity Tracking

无需额外复杂性，功能在现有架构内实现。
