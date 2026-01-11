# Implementation Plan: 采购订单物料选择器改造

**Branch**: `N004-procurement-material-selector` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/N004-procurement-material-selector/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Transform procurement order selector to support Material entities (95% of business) instead of forcing SKU selection. Support dual selector mode for rare finished product procurement (5%).

**Technical Approach**:
- Modify `purchase_order_items` table schema: add `material_id` (nullable UUID FK), `item_type` (ENUM: MATERIAL/SKU), `material_name` (redundancy for soft-delete), and CHECK constraint for mutual exclusivity
- Integrate M001's `CommonConversionService` for automatic unit conversion (purchaseUnit → inventoryUnit) during procurement inbound operations
- Implement reusable frontend component `<MaterialSkuSelector />` with three modes: `material-only`, `sku-only`, `dual` (Ant Design Tabs-based navigation)
- Data migration script for historical orders (auto-set `item_type = "SKU"` for existing SKU-only records)

## Technical Context

**Language/Version**:
- Backend: Java 17 (mandatory, not Java 21) + Spring Boot 3.3.5
- Frontend (B端): TypeScript 5.9.3 + React 19.2.0
- C端: NOT applicable for this feature (N004 is B端 procurement management only)

**Primary Dependencies**:
- Backend: Spring Data JPA, Spring Boot Web, Flyway (database migrations), Supabase PostgreSQL Driver
- Frontend: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Hook Form 7.68.0 + Zod 4.1.13 (form validation), MSW 2.12.4 (API mocking)
- **Critical Dependency**: M001-material-unit-system (requires Material entity, `CommonConversionService`, `purchaseUnit`/`inventoryUnit` fields)

**Storage**: Supabase PostgreSQL (direct JPA access), no PostgREST API usage (per rule 11)

**Testing**:
- Backend: JUnit 5 (unit tests), Spring Boot Test (integration tests)
- Frontend: Vitest (unit tests) + Testing Library + MSW (integration tests), Playwright (E2E tests, optional for critical flows)
- **Coverage Requirements**: Critical business logic (unit conversion, order creation) = 100%, utilities ≥ 80%, components ≥ 70%

**Target Platform**:
- Web browser (Chrome, Firefox, Safari, Edge) - B端 admin interface only
- Backend API: RESTful endpoints (`POST /api/procurement/orders`, `GET /api/materials`, etc.)

**Project Type**:
- Full-stack feature for existing B端 admin system (procurement module extension)
- **NOT** a new project, extends existing procurement order functionality

**Performance Goals**:
- Material selector API: P95 ≤ 500ms with 10,000 material records (NFR-001)
- Unit conversion service call: ≤ 10ms per conversion (NFR-002)
- Database migration execution: ≤ 5 minutes for 100,000 historical order items (NFR-003)
- Page transitions: ≤ 500ms (general B端 standard)

**Constraints**:
- Must use Java 17 (NOT Java 21 or higher, per backend architecture rule)
- Must use Material entity from M001, cannot create duplicate material model
- Must use Ant Design `<Tabs>` component for dual selector (per clarification session 2026-01-11)
- Must maintain backward compatibility with historical SKU-only orders (FR-021, FR-022)
- Must implement CHECK constraint at database level for `material_id` XOR `sku_id` mutual exclusivity (FR-003)

**Scale/Scope**:
- Estimated data volume: 10,000 materials, 100,000 historical order items, 1,000 new orders per month
- Single feature affecting 3 modules: Procurement Order Management, BOM Configuration (future), Inventory Adjustment (future)
- No cross-system integration beyond M001 dependency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名中的specId必须等于active_spec指向路径中的specId
  - ✅ Branch: `N004-procurement-material-selector`, Spec path: `specs/N004-procurement-material-selector/`, specId: `N004` (aligned)

- [x] **测试驱动开发**: 关键业务流程必须先编写测试，确保测试覆盖率100%
  - ✅ Will enforce TDD for critical flows:
    - Unit tests for `CommonConversionService` integration (100% coverage required)
    - Integration tests for procurement order creation with Material vs SKU (100% coverage required)
    - Frontend component tests for `<MaterialSkuSelector />` three modes (≥70% coverage)

- [x] **组件化架构**: 必须遵循原子设计理念，组件必须清晰分层和可复用
  - ✅ `<MaterialSkuSelector />` designed as reusable Organism component
  - ✅ Will decompose into Molecules: `<MaterialList />`, `<SkuList />`, `<SelectorTabs />`
  - ✅ Will use Ant Design Atoms: `<Tabs>`, `<Input>`, `<Select>`, `<Table>`

- [x] **前端技术栈分层**: B端必须使用React+Ant Design，C端必须使用Taro框架，不得混用
  - ✅ This is B端-only feature (procurement management), uses React 19 + Ant Design 6.1.0
  - ✅ No C端 involvement, no Taro usage

- [x] **数据驱动状态管理**: 必须使用Zustand + TanStack Query，状态变更可预测
  - ✅ Material/SKU data fetching via TanStack Query (`useQuery` for list, `useMutation` for order creation)
  - ✅ Selector UI state (tab index, search term) via local state or lightweight Zustand store if shared

- [x] **代码质量工程化**: 必须通过TypeScript/Java类型检查、ESLint/后端静态检查、所有质量门禁
  - ✅ All business logic files will include `@spec N004-procurement-material-selector` annotation
  - ✅ TypeScript strict mode enabled, no `any` types except documented exceptions
  - ✅ Java 17 source/target compliance, Spring Boot static analysis

- [x] **后端技术栈约束**: 后端必须使用Spring Boot集成Supabase，Supabase为主要数据源与认证/存储提供方
  - ✅ Uses Spring Data JPA with Supabase PostgreSQL (direct connection)
  - ✅ No PostgREST API usage (per rule 11 prohibition)

### 性能与标准检查：
- [x] **性能标准**: 应用启动<3秒，页面切换<500ms，大数据列表使用虚拟滚动
  - ✅ Material selector API: P95 ≤ 500ms with 10,000 records (NFR-001)
  - ✅ Page transition: ≤ 500ms (standard B端 requirement)
  - ⚠️ Virtual scrolling: NOT required for initial implementation (material list expected <10,000 items, pagination sufficient)

- [x] **安全标准**: 使用Zod数据验证，防止XSS；B端暂不实现认证授权，C端按实际需求实现
  - ✅ Frontend: Zod schema validation for order creation form (validate `itemType`, `materialId`, `skuId`, `quantity`)
  - ✅ Backend: Spring Validation annotations (`@Valid`, `@NotNull`) + custom validation for Material/SKU mutual exclusivity
  - ✅ XSS prevention: Ant Design components auto-escape, no `dangerouslySetInnerHTML` usage

- [x] **可访问性标准**: 遵循WCAG 2.1 AA级别，支持键盘导航和屏幕阅读器
  - ✅ Ant Design `<Tabs>` component provides keyboard navigation out-of-box
  - ✅ Will add `aria-label` to selector inputs and buttons
  - ⚠️ Color contrast: Verify Ant Design default theme meets 4.5:1 ratio (usually compliant)

### ✅ Constitution Check Result: **PASS** (Re-validated after Phase 1 Design)

All mandatory principles satisfied. Updated notes after Phase 1:
1. ✅ Virtual scrolling confirmed NOT required (pagination via TanStack Query sufficient for <10K materials)
2. ✅ Color contrast verified: Ant Design default theme meets WCAG 2.1 AA 4.5:1 ratio (documented in quickstart.md)
3. ✅ API response format aligned with ApiResponse standard (see contracts/api.yaml)
4. ✅ Database schema CHECK constraint designed (see data-model.md migration script)
5. ✅ M001 CommonConversionService integration verified (see research.md findings)

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

**Structure Decision**: Full-stack feature extending existing B端 procurement module. Backend uses Spring Boot 3.3.5 (Java 17) with Spring Data JPA for Supabase PostgreSQL access. Frontend uses React 19 + Ant Design 6 with Atomic Design principles. Components organized by feature modules with TanStack Query for server state and Zustand for client state.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. This section is intentionally left empty.

---

## Implementation Phases Summary

### ✅ Phase 0: Research & Decision Documentation

**Completed**: 2026-01-11

**Deliverables**:
- ✅ `research.md` - Research findings on M001 integration, CommonConversionService API, historical data migration strategy, error handling approach, and business case validation (7 research areas, all resolved)

**Key Decisions**:
1. M001 Material entity schema verified and ready for integration
2. `CommonConversionService.convert(fromUnit, toUnit, value)` API contract confirmed
3. Batch migration strategy (10,000 records per batch) designed for >100,000 historical records
4. Frontend component reusability scope defined (procurement, BOM, inventory adjustment)
5. Finished product procurement business cases validated (5% edge case, justified dual selector)

**No blockers** - All research questions resolved.

---

### ✅ Phase 1: Design & Contracts

**Completed**: 2026-01-11

**Deliverables**:
- ✅ `data-model.md` - Database schema changes (ERD, migration script with batch update, JPA entity, TypeScript types, validation rules, data flow diagrams)
- ✅ `contracts/api.yaml` - OpenAPI 3.0 specification (4 endpoints: GET /materials, POST /procurement/orders, GET /procurement/orders/{id}, POST /procurement/orders/{id}/inbound)
- ✅ `quickstart.md` - Development workflow guide (6 phases with TDD approach, 20h estimated time, troubleshooting tips, performance optimization)
- ✅ Agent context updated via `.specify/scripts/bash/update-agent-context.sh claude`

**Key Design Artifacts**:
1. **Database Schema**:
   - `purchase_order_items` table: added `material_id`, `item_type`, `material_name`; made `sku_id` nullable; added CHECK constraint for mutual exclusivity
   - Batch migration script for historical data (auto-set `item_type = "SKU"`)
   - Indexes on `material_id` and `item_type` for query optimization

2. **API Contracts**:
   - `GET /api/materials` - Material selector list with pagination and search
   - `POST /api/procurement/orders` - Create order with Material/SKU items
   - `POST /api/procurement/orders/{orderId}/inbound` - Execute inbound with unit conversion
   - Unified `ApiResponse<T>` format, error codes (PROC_VAL_001, PROC_CONV_001, etc.)

3. **Frontend Component Design**:
   - `<MaterialSkuSelector />` with three modes: `material-only`, `sku-only`, `dual`
   - Ant Design `<Tabs>` for dual mode (default "物料" tab, reset filters on switch per FR-014.1)
   - TanStack Query hooks: `useMaterials()`, `useCreatePurchaseOrder()`

4. **Validation Strategy**:
   - Triple-layer validation: Database CHECK constraint + JPA @PrePersist validation + Zod schema validation
   - Custom validators for `itemType` and `materialId`/`skuId` mutual exclusivity

**Re-Validated Constitution Check**: ✅ PASS (all principles satisfied, see updated notes above)

---

### ⏭️ Phase 2: Task Breakdown (Not Part of /speckit.plan)

**Note**: Task breakdown is performed by separate `/speckit.tasks` command. This plan stops after Phase 1 design completion.

**Expected tasks.md structure** (to be generated by `/speckit.tasks`):
- Database migration tasks (write migration script, test migration, verify constraints)
- Backend development tasks (JPA entity, repository, service layer, REST controller, integration tests)
- Frontend development tasks (component implementation, hooks, integration with MSW, E2E tests)
- Documentation tasks (update CLAUDE.md, API documentation)
- Testing tasks (unit tests, integration tests, E2E tests)
- Deployment tasks (deploy migration, update production environment)

---

## Plan Completion Summary

**Plan Status**: ✅ **COMPLETE**

**Generated Artifacts**:
1. ✅ `specs/N004-procurement-material-selector/plan.md` (this file)
2. ✅ `specs/N004-procurement-material-selector/research.md` (Phase 0)
3. ✅ `specs/N004-procurement-material-selector/data-model.md` (Phase 1)
4. ✅ `specs/N004-procurement-material-selector/contracts/api.yaml` (Phase 1)
5. ✅ `specs/N004-procurement-material-selector/quickstart.md` (Phase 1)
6. ✅ Agent context updated (`CLAUDE.md` modified)

**Next Steps**:
1. Run `/speckit.tasks` to generate `tasks.md` (dependency-ordered task breakdown)
2. Begin implementation following TDD workflow in `quickstart.md`
3. Track progress in Lark PM (use `/lark-pm` skill to update task status)

**Branch**: `N004-procurement-material-selector`
**Ready for Implementation**: ✅ YES

---

**Plan Completed**: 2026-01-11 by Claude Code
**Constitution Check**: ✅ PASS
**All Gates**: ✅ PASSED
