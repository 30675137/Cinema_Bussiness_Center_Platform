# Implementation Plan: 饮品模块复用SKU管理能力

**Branch**: `O004-beverage-sku-reuse` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O004-beverage-sku-reuse/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: 消除饮品模块与SKU管理功能的重叠逻辑，通过复用现有SKU管理能力，确保运营人员在配置饮品配方时只能选择finished_product类型的SKU，避免误选packaging类SKU。

**Technical Approach**:
- 复用现有SKU管理界面（`/products/sku`）创建finished_product类型的饮品SKU
- 在饮品配方配置界面的SKU选择器中增加类型过滤逻辑，仅显示finished_product类型
- 迁移旧饮品管理界面（`/beverage/list`）数据到SKU管理系统，并显示迁移提示
- B端React组件实现（无C端小程序验证），使用TanStack Query管理服务器状态
- E2E测试使用seed策略（静态测试数据），无需后端服务依赖

## Technical Context

**Language/Version**:
- **Frontend (B端 only)**: TypeScript 5.9.3 + React 19.2.0
- **Backend**: Java 17 + Spring Boot 3.3.5
- **Database**: Supabase (PostgreSQL 14+)
- **Note**: This feature is B端-only (admin panel), no C端 implementation required

**Primary Dependencies**:
- **Frontend**:
  - UI Library: Ant Design 6.1.0 (SKU list, form components, modal)
  - State Management: Zustand 5.0.9 (client state), TanStack Query 5.90.12 (server state)
  - Routing: React Router 7.10.1
  - Form Handling: React Hook Form 7.68.0 + Zod 4.1.13 (validation)
  - Testing: Vitest 4.0.15 (unit), Playwright 1.57.0 (E2E), MSW 2.12.4 (mock)
- **Backend**:
  - Spring Boot Web (REST APIs)
  - Spring Data JPA (ORM)
  - Supabase Java Client (database access)
  - Apache POI 5.2.5 (Excel import, if batch import implemented)

**Storage**:
- **Primary**: Supabase PostgreSQL (skus table, categories table, beverage_config table for migration data)
- **Secondary**: localStorage (B端 user preferences, filter settings)
- **Mock**: MSW handlers + in-memory state for frontend development

**Testing**:
- **Unit Tests**: Vitest + Testing Library (components, hooks, services)
  - Target coverage: 100% for business logic, ≥70% for components
- **E2E Tests**: Playwright (B端 only, no cross-system testing)
  - Test data strategy: Seed fixtures (TD-SKU-BEVERAGE-001, TD-BOM-COCKTAIL-001)
  - Coverage: P1 + P2 user stories (SKU creation + SKU selector filtering)
- **Integration Tests**: Supertest (backend API endpoints)

**Target Platform**:
- **B端**: Web browsers (Chrome, Firefox, Safari, Edge) - desktop only
- **Backend**: Spring Boot API (http://localhost:8080)
- **Frontend Dev**: Vite dev server (http://localhost:3000) with API proxy to backend

**Project Type**: B端 管理后台功能增强 - 消除重复逻辑，统一SKU管理流程

**Performance Goals**:
- SKU列表加载时间 < 2秒（假设1000+ SKU记录）
- SKU选择器弹窗打开时间 ≤ 1秒
- SKU创建表单提交响应时间 ≤ 2秒
- SKU选择器过滤准确率 100%（无packaging/raw_material误显示）
- 数据迁移脚本执行成功率 ≥ 95%

**Constraints**:
- Must reuse existing SKU management UI components (no duplication)
- SKU selector filter logic must be generic and reusable (not beverage-specific hard-coding)
- Old beverage management interface (`/beverage/list`) must gracefully redirect, not break existing user bookmarks
- Data migration must preserve all historical beverage attributes (name, price, status, category)
- No C端小程序端到端测试（假设后台数据正确则小程序自动正确）

**Scale/Scope**:
- Estimated SKU count: 100-500 finished_product beverages (cocktails, juices, coffees)
- Estimated historical beverage data: 10-100 records to migrate
- Estimated concurrent operators: 5-20 (运营人员同时使用SKU管理界面)
- Feature complexity: Medium (reuse existing components + filter logic + data migration script)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: ✅ 当前分支名为 `O004-beverage-sku-reuse`，specId为 `O004`，active_spec正确指向 `specs/O004-beverage-sku-reuse/spec.md`
- [x] **代码归属标识**: ✅ 所有新增/修改的代码文件将包含 `@spec O004-beverage-sku-reuse` 标识
- [x] **测试驱动开发**: ✅ 已创建E2E测试场景(E2E-PRODUCT-002, E2E-PRODUCT-003)和测试脚本，单元测试将遵循TDD红绿重构循环
- [x] **组件化架构**: ✅ 复用现有SKU管理组件(SKUListPage, SKUEditPage)，遵循原子设计理念，新增SKU选择器组件将遵循单一职责
- [x] **前端技术栈分层**: ✅ B端使用React 19.2.0 + Ant Design 6.1.0，无C端实现，不存在混用风险
- [x] **数据驱动状态管理**: ✅ 使用TanStack Query管理服务器状态(SKU列表、分类数据)，Zustand管理客户端状态(过滤器状态、UI交互状态)
- [x] **代码质量工程化**: ✅ 必须通过TypeScript 5.9.3严格模式类型检查、ESLint检查、Prettier格式化、Husky pre-commit hooks
- [x] **后端技术栈约束**: ✅ 使用Spring Boot 3.3.5 + Supabase作为主要数据源，所有SKU/分类数据来自Supabase PostgreSQL

### 性能与标准检查：
- [x] **性能标准**: ✅ SKU列表加载<2秒，SKU选择器打开≤1秒，页面切换<500ms，使用虚拟滚动支持1000+ SKU列表
- [x] **安全标准**: ✅ 使用Zod进行SKU创建表单数据验证，React Hook Form处理表单输入，避免XSS攻击，API调用包含JWT认证
- [x] **可访问性标准**: ✅ Ant Design组件库原生支持WCAG 2.1 AA，支持键盘导航(Tab/Enter)，屏幕阅读器友好(ARIA属性)

### API 响应格式标准检查：
- [x] **统一响应格式**: ✅ 所有SKU相关API将使用统一的 `ApiResponse<T>` 格式，包含 `{ success, data, timestamp, error, message }`
- [x] **错误编号规范**: ✅ 业务异常使用标准化编号（如 `SKU_VAL_001` 验证错误，`SKU_NTF_001` 未找到，`SKU_DUP_001` 重复冲突）
- [x] **前后端契约对齐**: ✅ 将在 `contracts/api.yaml` 中明确定义所有端点的请求/响应格式，前端TypeScript类型定义与后端DTO完全一致

### Claude Code Skills 开发规范检查 (N/A):
- **N/A**: 本功能为业务功能(订单管理模块 O###)，非Claude Code skill开发，无需遵循skill开发规范（YAML frontmatter、skill.md等要求不适用）

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
