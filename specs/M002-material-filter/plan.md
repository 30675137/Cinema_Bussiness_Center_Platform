# Implementation Plan: Material Management Filter & Actions

**Branch**: `M002-material-filter` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/M002-material-filter/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

为物料主数据管理页面添加筛选器区域（分类筛选、状态筛选、成本范围、关键词搜索）和操作按钮组（新建物料、批量导入、批量导出、批量操作）。技术实现采用 React + Ant Design 6.1.0 组件库，使用受控表单组件实现筛选功能，使用 ExcelJS 实现批量导入/导出，后端使用 Spring Boot + Supabase 提供 API 支持。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: 
- Frontend: TypeScript 5.9.3 + React 19.2.0
- Backend: Java 17 + Spring Boot 3.x

**Primary Dependencies**: 
- Frontend: Ant Design 6.1.0, TanStack Query 5.90.12, ExcelJS (批量导入/导出), MSW 2.12.4 (Mock)
- Backend: Spring Boot 3.x, Supabase Client SDK, Apache POI (Excel处理)

**Storage**: Supabase PostgreSQL (物料数据通过现有 materials 表)  

**Testing**: 
- Frontend: Vitest (单元测试), MSW (API Mock), Playwright (E2E可选)
- Backend: JUnit 5, MockMvc (集成测试)

**Target Platform**: Web浏览器 (Chrome, Firefox, Safari, Edge)  

**Project Type**: Web Application (B端管理后台)  

**Performance Goals**: 
- 筛选响应时间 < 5秒 (1000+条数据)
- 导出响应时间 < 10秒 (1000条以内)
- 批量导入预览 < 5秒 (100条数据)

**Constraints**: 
- 单次导出限制 ≤ 10000条
- 单次导入限制 ≤ 1000条
- Excel文件大小 ≤ 10MB
- 批量操作限制 ≤ 100项

**Scale/Scope**: 
- 预计物料数据量: 10,000+ 条
- 新增前端组件: 3个 (MaterialFilter, MaterialExportButton, MaterialImportModal)
- 新增后端接口: 4个 (筛选查询、导出、导入、批量操作)
- UI改动范围: MaterialManagementPage 页面重构

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `M002-material-filter` 符合 `X###-slug` 格式，specId 为 M002（物料模块）
- [x] **代码归属标识**: 所有新增代码文件将添加 `@spec M002-material-filter` 标识
- [x] **测试驱动开发**: 将编写单元测试覆盖筛选逻辑、导入/导出功能，E2E 测试为可选
- [x] **组件化架构**: 使用 React 19.2.0 + Ant Design 6.1.0，遵循原子设计理念
- [x] **数据驱动状态管理**: 使用 Zustand + TanStack Query 管理状态和服务器数据
- [x] **代码质量工程化**: 使用 TypeScript 5.9.3、ESLint、Prettier，遵循 Conventional Commits
- [x] **前端技术栈分层**: B端管理后台，使用 React + Ant Design 技术栈
- [x] **后端技术栈**: 使用 Java 17 + Spring Boot 3.x + Supabase
- [x] **认证与权限**: B端暂不实现认证授权逻辑，预留扩展点
- [x] **API 响应格式**: 遵循统一的 `ApiResponse<T>` 格式

### 性能与标准检查：
- [x] **性能标准**: 筛选响应 < 5秒，导出 < 10秒，符合要求
- [x] **安全标准**: 使用 Zod 数据验证，防止 XSS，B端暂不实现认证
- [x] **可访问性标准**: 遵循 WCAG 2.1 AA级别，支持键盘导航

✅ **所有宪法原则检查通过，可以进入 Phase 0 研究阶段**

## Project Structure

### Documentation (this feature)

```text
specs/M002-material-filter/
├── spec.md              # Feature specification (已完成)
├── plan.md              # This file (进行中)
├── research.md          # Phase 0 output (待生成)
├── data-model.md        # Phase 1 output (待生成)
├── quickstart.md        # Phase 1 output (待生成)
├── contracts/           # Phase 1 output (待生成)
│   └── api.yaml
├── checklists/          # Quality checklists (已完成)
│   └── requirements.md
└── tasks.md             # Phase 2 output (通过 /speckit.tasks 生成)
```

### Source Code (repository root)

```text
# Web Application Structure (B端管理后台)

backend/
├── src/main/java/com/cinema/
│   ├── material/
│   │   ├── controller/
│   │   │   └── MaterialController.java    # 新增筛选、导出、导入、批量操作接口
│   │   ├── service/
│   │   │   ├── MaterialService.java        # 扩展筛选逻辑
│   │   │   ├── MaterialExportService.java  # 新增导出服务
│   │   │   └── MaterialImportService.java  # 新增导入服务
│   │   ├── dto/
│   │   │   ├── MaterialFilterDTO.java      # 新增筛选条件 DTO
│   │   │   ├── MaterialExportDTO.java      # 新增导出 DTO
│   │   │   └── MaterialImportDTO.java      # 新增导入 DTO
│   │   └── repository/
│   │       └── MaterialRepository.java     # 扩展筛选查询方法
│   └── common/
│       └── util/
│           └── ExcelUtil.java              # Excel 工具类
└── src/test/java/com/cinema/material/
    ├── service/
    │   ├── MaterialServiceTest.java
    │   ├── MaterialExportServiceTest.java
    │   └── MaterialImportServiceTest.java
    └── controller/
        └── MaterialControllerTest.java

frontend/
├── src/
│   ├── components/material/
│   │   ├── MaterialFilter.tsx              # 新增筛选器组件
│   │   ├── MaterialExportButton.tsx        # 新增导出按钮
│   │   ├── MaterialImportModal.tsx         # 新增导入弹窗
│   │   ├── MaterialBatchActions.tsx        # 新增批量操作组件
│   │   ├── MaterialTable.tsx               # 扩展（支持批量选择）
│   │   └── index.ts
│   ├── features/material-management/
│   │   └── MaterialManagementPage.tsx      # 重构（集成新组件）
│   ├── hooks/
│   │   ├── useMaterials.ts                 # 扩展（支持筛选参数）
│   │   ├── useExportMaterials.ts           # 新增导出 hook
│   │   ├── useImportMaterials.ts           # 新增导入 hook
│   │   └── useBatchMaterials.ts            # 新增批量操作 hook
│   ├── services/
│   │   └── materialService.ts              # 扩展（新增筛选、导出、导入接口）
│   └── types/
│       └── material.ts                     # 扩展（新增筛选、导出、导入类型）
└── tests/
    ├── components/material/
    │   ├── MaterialFilter.test.tsx
    │   ├── MaterialExportButton.test.tsx
    │   └── MaterialImportModal.test.tsx
    └── features/
        └── MaterialManagementPage.test.tsx
```

**Structure Decision**: 选择 Web Application 结构（Option 2），因为功能涉及前后端协作：
- 后端扩展 Material 模块的 Controller、Service、DTO 层，新增 Excel 处理工具
- 前端新增 3 个组件（Filter、Export、Import），重构 MaterialManagementPage
- 使用现有的 materials 表，无需数据库迁移

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**无违规项** - 所有宪法原则检查通过，无需复杂度跟踪。

---

## Phase 0: Research & Clarification

**Status**: ✅ Complete  
**Output**: [research.md](./research.md)  
**Date**: 2026-01-14

### Key Decisions Made

1. **Excel 处理库**: ExcelJS (前端) + Apache POI (后端)
   - Rationale: 成熟稳定，团队熟悉，支持流式处理

2. **筛选状态管理**: 受控表单 + URL Query Parameters
   - Rationale: 支持链接分享、浏览器历史、刷新保留

3. **导入校验策略**: 前端预校验 + 后端完整校验
   - Rationale: 即时反馈用户体验 + 安全防护

4. **批量操作事务**: 单事务批量处理 + 详细结果反馈
   - Rationale: 保证一致性 + 提供详细失败原因

5. **导出优化**: 分页查询 + 流式写入 + 数量限制（≤10000）
   - Rationale: 降低内存占用 + 防止服务器资源耗尽

### Unknowns Resolved

所有技术选型和实现策略已明确，无遗留问题。详细内容见 [research.md](./research.md)。

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete  
**Date**: 2026-01-14

### Deliverables

1. **Data Model** ([data-model.md](./data-model.md)):
   - ✅ 5 个核心实体定义（Filter, ExportData, ImportRecord, ImportResult, BatchOperation）
   - ✅ TypeScript 和 Java DTO 完整定义
   - ✅ 数据验证规则（Zod + Bean Validation）
   - ✅ 数据库索引优化方案
   - ✅ API 响应格式和错误编码

2. **API Contracts** ([contracts/api.yaml](./contracts/api.yaml)):
   - ✅ 4 个核心接口：筛选查询、导出、导入、批量操作
   - ✅ OpenAPI 3.0 规范
   - ✅ 完整的请求/响应 schema
   - ✅ 错误场景和示例

3. **Quickstart Guide** ([quickstart.md](./quickstart.md)):
   - ✅ 开发环境设置
   - ✅ 快速启动指南（< 5 分钟）
   - ✅ 开发工作流示例代码
   - ✅ 测试策略和调试技巧
   - ✅ 常见问题解决方案

4. **Agent Context Update**:
   - ✅ 运行 `update-agent-context.sh qoder`
   - ✅ 更新 QODER.md（添加 Supabase PostgreSQL 信息）

### Re-evaluated Constitution Check

所有宪法原则检查通过，无新增违规项。设计阶段的技术选型完全符合项目规范：

- ✅ 使用现有技术栈（React 19.2.0, Java 17, Spring Boot 3.x）
- ✅ 遵循组件化架构和数据驱动状态管理
- ✅ 使用统一的 API 响应格式
- ✅ 测试覆盖（单元测试 + 集成测试）
- ✅ 代码质量工程化（TypeScript, ESLint, Checkstyle）

---

## Phase 2: Tasks Breakdown

**Status**: ⏸️ Pending  
**Command**: `/speckit.tasks`  
**Note**: Phase 2 需要单独执行 `/speckit.tasks` 命令生成详细任务清单（tasks.md）

任务清单将包括：
- [ ] Frontend 组件开发任务（MaterialFilter, MaterialExportButton, MaterialImportModal, MaterialBatchActions）
- [ ] Backend 服务开发任务（MaterialExportService, MaterialImportService, 批量操作）
- [ ] API 接口开发任务（4 个新接口）
- [ ] 单元测试任务（前端 + 后端）
- [ ] 集成测试任务
- [ ] 文档更新任务

---
