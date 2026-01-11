# Feature Specification: 统一供应商数据源

**Feature Branch**: `N002-unify-supplier-data`
**Created**: 2026-01-11
**Updated**: 2026-01-11
**Status**: ✅ Completed
**Input**: "统一供应商数据源：移除 SupplierList.tsx 中的硬编码数据，使用真实后端 API，让两个页面使用同一个数据源"

## 功能概述

当前系统中存在两套供应商列表实现，使用不同的数据源导致数据不一致：

| 页面 | 路由 | 数据来源 | 问题 |
|------|------|---------|------|
| 供应商列表 | `/purchase-management/suppliers` | 组件内硬编码 mockData | 4 条假数据 |
| 供应商管理 | `/procurement/supplier` | useSupplierStore | 返回空数组 |

本规格要求统一两套实现，移除所有硬编码数据，全部使用后端真实 API (`GET /api/suppliers`) 获取数据。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 供应商列表查看 (Priority: P1)

采购管理员进入供应商列表页面，查看系统中所有已维护的供应商信息，包括供应商编码、名称、联系人、状态等。

**Why this priority**: 这是供应商模块的基础功能，所有供应商相关操作都依赖于列表展示的准确性。

**Independent Test**: 进入供应商列表页面，验证显示的数据与数据库中 `suppliers` 表的记录一致。

**Acceptance Scenarios**:

1. **Given** 用户进入供应商列表页面, **When** 页面加载完成, **Then** 显示后端 API 返回的真实供应商数据
2. **Given** 数据库中有 10 条供应商记录, **When** 用户访问供应商列表, **Then** 列表显示 10 条记录
3. **Given** 数据库中供应商记录为空, **When** 用户访问供应商列表, **Then** 显示空状态提示"暂无供应商数据"

---

### User Story 2 - 供应商筛选 (Priority: P2)

采购管理员通过状态筛选器筛选特定状态的供应商，如只显示"启用"状态的供应商。

**Why this priority**: 筛选功能提高用户查找效率，但不影响核心的数据展示功能。

**Independent Test**: 选择"启用"状态筛选，验证只显示 status='ACTIVE' 的供应商。

**Acceptance Scenarios**:

1. **Given** 用户在供应商列表页, **When** 选择状态筛选"启用", **Then** 只显示 status='ACTIVE' 的供应商
2. **Given** 用户已筛选, **When** 清空筛选条件, **Then** 显示所有供应商

---

### User Story 3 - 页面路由统一 (Priority: P1)

无论用户从哪个菜单入口进入供应商管理，都应该访问同一个页面，展示相同的数据。

**Why this priority**: 数据一致性是本次改造的核心目标，用户不应该在不同入口看到不同数据。

**Independent Test**: 分别从两个菜单入口进入，验证显示的数据完全一致。

**Acceptance Scenarios**:

1. **Given** 用户从"采购入库 > 供应商管理"进入, **When** 页面加载完成, **Then** 显示后端真实数据
2. **Given** 用户从"采购管理 > 供应商列表"进入, **When** 页面加载完成, **Then** 显示与上述完全相同的数据
3. **Given** 两个页面同时打开, **When** 比较数据, **Then** 供应商列表内容完全一致

---

### Edge Cases

- 后端 API 返回错误时？显示错误提示，建议用户刷新重试
- 网络超时时？显示加载超时提示，提供重试按钮
- 供应商数据量很大时？支持分页加载，每页默认 10 条

## Requirements *(mandatory)*

### Functional Requirements

**数据源统一**
- **FR-001**: 系统必须移除 `SupplierList.tsx` 中的硬编码 mockData（第 57-118 行）
- **FR-002**: 系统必须修改 `supplierStore.ts` 的 `fetchSuppliers` 方法，调用后端 `GET /api/suppliers` API
- **FR-003**: 两个供应商页面必须使用同一个数据源（useSupplierStore）

**API 集成**
- **FR-004**: 前端必须调用后端 `GET /api/suppliers` 接口获取供应商列表
- **FR-005**: 前端必须正确处理 API 返回的数据格式：`{ success: true, data: SupplierDTO[], timestamp: string }`
- **FR-006**: 前端必须将后端 SupplierDTO 字段映射到前端类型：
  - `id` (UUID) → `id` (string)
  - `code` → `code`
  - `name` → `name`
  - `contactName` → `contactPerson`
  - `contactPhone` → `contactPhone`
  - `status` → `status`

**状态筛选**
- **FR-007**: 系统必须支持按状态筛选供应商（通过 API 参数 `?status=ACTIVE`）
- **FR-008**: 筛选状态包括：ACTIVE（启用）、SUSPENDED（暂停）、TERMINATED（终止）

**错误处理**
- **FR-009**: API 调用失败时必须显示友好的错误提示
- **FR-010**: 加载过程中必须显示 loading 状态

### Key Entities

- **供应商 (Supplier)**: 供应商主数据，包含编码、名称、联系人、状态等信息
- **SupplierDTO (后端)**: 后端返回的数据传输对象
- **Supplier (前端)**: 前端使用的供应商类型定义

### 字段映射表

| 后端 SupplierDTO | 前端 Supplier | 说明 |
|-----------------|---------------|------|
| id (UUID) | id (string) | 供应商唯一标识 |
| code | code | 供应商编码 |
| name | name | 供应商名称 |
| contactName | contactPerson | 联系人姓名 |
| contactPhone | contactPhone | 联系电话 |
| status | status | 状态 |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户从任意入口进入供应商列表，看到的数据必须与数据库 `suppliers` 表一致
- **SC-002**: 两个供应商页面显示的数据完全相同，无任何差异
- **SC-003**: 页面加载时间不超过 2 秒（网络正常情况下）
- **SC-004**: 代码中不再存在硬编码的供应商 mockData
- **SC-005**: supplierStore 的 fetchSuppliers 成功调用后端 API 并正确返回数据

## Assumptions

1. 后端 `GET /api/suppliers` API 已正常工作（基于 N001 已实现）
2. 数据库 `suppliers` 表已有测试数据
3. 前端与后端网络通信正常
4. 不涉及供应商的创建、编辑、删除功能改造

## Out of Scope

- 供应商创建/编辑/删除功能
- 供应商详情页面
- 供应商导入/导出功能
- 供应商表单验证逻辑

## 技术改造清单

### 需要修改的文件

| 文件 | 改造内容 |
|------|---------|
| `frontend/src/pages/procurement/SupplierList.tsx` | 移除硬编码 mockData，使用 useSupplierStore |
| `frontend/src/stores/supplierStore.ts` | fetchSuppliers 调用真实 API |
| `frontend/src/types/supplier.ts` | 确认类型定义与后端 DTO 一致 |

### 后端 API 确认

- **端点**: `GET /api/suppliers`
- **参数**: `status` (可选)
- **响应**: `{ success: true, data: SupplierDTO[], timestamp: string }`

---

**文档维护人**: Claude Code
**最后更新**: 2026-01-11
