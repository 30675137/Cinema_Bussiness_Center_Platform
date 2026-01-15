# Implementation Plan: SPU 批量删除功能修复

**Branch**: `P007-fix-spu-batch-delete` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/P007-fix-spu-batch-delete/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

修复 SPU 批量删除功能的数据不一致 bug。当前问题:用户在列表页选中多个 SPU 并执行批量删除操作后,系统显示成功提示,但刷新页面后数据仍然存在。根本原因是前端 `spuService.ts` 未调用真实 HTTP API,MSW handlers 未实际删除 mock 数据。技术方案:修改 service 层调用 `/api/spu/batch` 接口,实现 MSW handler 的真实删除逻辑,并引入持久化 mock 数据管理机制(localStorage 或全局变量),确保删除后的数据一致性。

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 17 + Spring Boot 3.3.5 (backend)
- C端（客户端/小程序）: N/A (本功能仅涉及 B端管理后台)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4
- Backend: Spring Boot 3.3.5, Supabase Java/HTTP client (当前使用 Mock 数据,后续可迁移)

**Storage**:
- 开发环境: Mock data (in-memory state + MSW handlers + localStorage for persistence)
- 生产环境: Supabase (PostgreSQL) 作为主要后端数据源

**Testing**:
- B端: Vitest (unit tests for service layer) + Playwright (e2e tests for batch delete flow) + Testing Library (component tests)

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge)

**Project Type**:
- Frontend-only bug fix (修复前端 service 层和 MSW handlers,暂不涉及真实后端开发)

**Performance Goals**:
- 批量删除操作响应时间 < 3 秒 (包含 loading 状态显示)
- 列表刷新时间 < 2 秒
- 支持同时删除最多 100 个 SPU (批量操作上限)

**Constraints**:
- 必须遵循测试驱动开发(TDD),先编写测试用例
- 必须保持与现有代码结构一致(不重构无关部分)
- 必须使用 TypeScript strict 模式,禁止 any 类型
- 必须通过 ESLint 和 Prettier 检查

**Scale/Scope**:
- 影响范围: `frontend/src/services/spuService.ts`, `frontend/src/mocks/handlers/index.ts`, `frontend/src/mocks/data/` (新增持久化逻辑)
- 代码变更量: 约 100-150 行代码修改
- 测试用例: 新增 5-8 个单元测试 + 1 个 E2E 测试

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `P007-fix-spu-batch-delete`,active_spec 指向 `specs/P007-fix-spu-batch-delete/spec.md`,specId 完全匹配 ✅
- [x] **测试驱动开发**: 将先编写单元测试验证批量删除逻辑,再实现修复代码 ✅
- [x] **组件化架构**: 本 bug 修复仅涉及 service 层和 mock handlers,不涉及组件修改,现有组件架构保持不变 ✅
- [x] **前端技术栈分层**: 仅修改 B端代码(`frontend/`),不涉及 C端 Taro 代码 ✅
- [x] **数据驱动状态管理**: 使用现有 TanStack Query 的 `refetchSPUList()` 重新加载数据,无需修改状态管理架构 ✅
- [x] **代码质量工程化**: 所有修改将通过 TypeScript strict 模式、ESLint、Prettier 检查,禁止使用 any 类型 ✅
- [x] **后端技术栈约束**: 当前使用 Mock 数据开发,未来可无缝迁移到 Supabase 后端,符合架构约束 ✅

### 性能与标准检查：
- [x] **性能标准**: 批量删除响应时间 < 3 秒,列表刷新 < 2 秒,满足性能要求 ✅
- [x] **安全标准**: Mock 数据无需额外安全验证,真实后端接口将使用 Zod 验证 ✅
- [x] **可访问性标准**: 批量删除功能已有 loading 状态和确认弹窗,符合可访问性要求 ✅

**Constitution Check 结论**: ✅ 通过所有检查,无需填写 Complexity Tracking 表格

## Project Structure

### Documentation (this feature)

```text
specs/P007-fix-spu-batch-delete/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.yaml         # OpenAPI 3.0 spec for batch delete endpoint
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── services/
│   │   └── spuService.ts          # 修改: 添加真实 HTTP 请求调用
│   ├── mocks/
│   │   ├── handlers/
│   │   │   └── index.ts           # 修改: 实现真实的删除逻辑
│   │   └── data/
│   │       ├── mockSPUStore.ts    # 新增: 持久化 mock SPU 数据管理
│   │       └── generators.ts      # 修改: 使用持久化数据源
│   ├── components/SPU/
│   │   ├── SPUList/
│   │   │   └── index.tsx          # 保持不变 (已正确调用 service)
│   │   └── BatchOperations.tsx    # 保持不变 (已正确触发删除)
│   └── __tests__/
│       ├── services/
│       │   └── spuService.test.ts # 新增: service 层单元测试
│       └── e2e/
│           └── spu-batch-delete.spec.ts # 新增: E2E 测试
└── docs/
    └── bug-fixes/
        └── P007-spu-batch-delete.md # 新增: bug 修复文档
```

**Structure Decision**: 采用最小侵入式修复策略,仅修改 service 层和 MSW handlers,保持现有组件和状态管理架构不变。新增持久化 mock 数据管理模块,确保数据在多次请求间保持一致。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

本 bug 修复无 Constitution Check 违规项,此表格留空。

---

## Phase 0: Research & Design Decisions

### Research Topics

1. **Mock 数据持久化方案选择**
   - localStorage vs 全局变量 vs IndexedDB
   - 决策依据: 开发便利性、性能、浏览器兼容性

2. **MSW handler 数据变更最佳实践**
   - 如何在 MSW handler 中安全地修改共享状态
   - 如何避免数据竞争和不一致

3. **批量操作 API 设计模式**
   - RESTful 批量删除端点设计 (POST /api/spu/batch vs DELETE /api/spu?ids=xxx)
   - 错误处理策略 (部分成功场景)

### Design Decisions (填写在 research.md)

- **Mock 数据持久化方案**: localStorage (开发环境) + 全局变量 (运行时缓存)
- **MSW handler 实现策略**: 使用单例 mockSPUStore 管理数据,支持 CRUD 操作
- **API 端点设计**: POST /api/spu/batch,body 携带 { operation: "delete", ids: [...] }

---

## Phase 1: Data Model & Contracts

### Data Model

详见 `data-model.md`,核心实体:

- **SPU**: 标准商品单元 (id, name, code, status, brandId, categoryId, ...)
- **BatchDeleteRequest**: { operation: "delete", ids: string[] }
- **BatchDeleteResponse**: { success: boolean, processedCount: number, failedCount: number, message: string }

### API Contracts

详见 `contracts/api.yaml`,核心接口:

- **POST /api/spu/batch**: 批量操作端点 (支持 delete, update status, copy 等操作)
- **Request Body**: { operation: string, ids: string[], [additionalParams] }
- **Response**: { success: boolean, data: { processedCount, failedCount }, message: string }

### Quickstart

详见 `quickstart.md`,包含:

1. 本地开发环境搭建
2. Mock 数据初始化
3. 运行测试验证修复效果
4. 调试技巧

---

## Phase 2: Implementation Plan

**注意**: Phase 2 的详细任务分解由 `/speckit.tasks` 命令生成,存放于 `tasks.md` 文件。

本计划文件仅提供高层次的实现方向:

1. **修改 spuService.ts**: 将 `batchDeleteSPU()` 方法从纯 mock 改为调用 HTTP API
2. **实现 mockSPUStore**: 创建持久化的 mock 数据管理模块
3. **修改 MSW handlers**: 实现真实的批量删除逻辑
4. **编写测试用例**: 单元测试 + E2E 测试验证修复效果
5. **验证数据一致性**: 确保删除后刷新页面数据正确更新

---

**版本历史**:
- v1.0 - 初始实现计划创建
- 创建日期: 2026-01-09
- 创建者: Claude AI
