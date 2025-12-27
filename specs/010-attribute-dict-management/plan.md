# Implementation Plan: 属性模板与数据字典管理

**Branch**: `010-attribute-dict-management` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-attribute-dict-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

统一管理商品的基础字典(容量单位、口味、包装形式等)与类目属性模板，为 SPU/SKU 提供标准化字段和选项。技术实现采用 Zustand + TanStack Query + MSW 的前端 Mock 架构，复用项目现有的品牌管理和类目管理的组件化模式，实现字典类型管理、字典项管理、类目属性模板配置和动态表单生成四大核心功能。

## Technical Context

**Language/Version**: TypeScript 5.9.3 + React 19.2.0
**Primary Dependencies**: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13, pinyin-pro 3.27.0
**Storage**: Mock data (in-memory state + MSW handlers + localStorage for persistence)
**Testing**: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend-only with mock backend)
**Performance Goals**: <3s app startup, <500ms page transitions, <1s form dynamic loading, support 200+ dictionary items per type
**Constraints**: Must comply with Feature Branch Binding (specId alignment), Test-Driven Development, Component-Based Architecture
**Scale/Scope**: Enterprise admin interface, dictionary management + attribute template + dynamic form generation

### Existing Patterns to Follow

**State Management**:
- Server state via TanStack Query (list queries, detail queries, mutations with cache invalidation)
- UI state via Zustand (selection state, expanded keys, filters) - already implemented in `attribute-dictionary/stores/`
- Persistence with localStorage using custom Map serialization

**Service Layer**:
- Class-based service pattern (like `brandService.ts`)
- MSW handlers for mock API endpoints (like `brandHandlers.ts`, `categoryHandlers.ts`)
- Query key factory pattern (like `categoryKeys`)

**Component Structure**:
- Atomic Design: atoms (StatusTag, TypeTag), molecules (Form, Table, Filters), organisms (List, Drawer)
- Feature-scoped components in `pages/mdm-pim/<feature>/components/`
- Reusable hooks in `hooks/` subfolder

**Form Validation**:
- Zod schemas with `.refine()` for cross-field validation - already implemented in `attribute-dictionary/utils/validators.ts`
- React Hook Form integration with zodResolver

**Code Generation**:
- Pinyin-based code generation utility - already implemented in `attribute-dictionary/utils/codeGenerator.ts`

### Dependencies on Existing Features

1. **Category Management (007)**: AttributeTemplate is bound to category (level 3). Category tree/list queries must be available.
2. **SPU Management**: Dynamic form generation integrates with SPU creation/edit workflow. SPU must store attribute values.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `010-attribute-dict-management` = active_spec `010-attribute-dict-management` ✓
- [ ] **测试驱动开发**: 关键业务流程必须先编写测试，确保测试覆盖率100%（Phase 2 tasks.md 中定义测试任务）
- [x] **组件化架构**: 遵循原子设计理念（atoms/molecules/organisms），组件分层于 `pages/mdm-pim/attribute/components/`
- [x] **数据驱动状态管理**: 使用 Zustand (dictionary/template stores) + TanStack Query (API queries)，状态变更可预测
- [ ] **代码质量工程化**: 通过 TypeScript 类型检查、ESLint 规范、所有质量门禁（实现阶段验证）

### 性能与标准检查：
- [x] **性能标准**: 应用启动<3秒，页面切换<500ms（现有架构保证），字典项列表支持虚拟滚动（200项以内无需）
- [x] **安全标准**: 使用 Zod 数据验证（已实现 validators.ts），前端 Mock 不涉及敏感数据
- [x] **可访问性标准**: Ant Design 组件原生支持 WCAG 2.1 AA，键盘导航和屏幕阅读器兼容

### Gate 结果：**PASS** - 可进入 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/010-attribute-dict-management/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.yaml         # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/src/
├── features/
│   └── attribute-dictionary/           # Feature module (partially implemented)
│       ├── stores/
│       │   ├── dictionaryStore.ts      # Zustand store for DictionaryType & DictionaryItem
│       │   └── attributeTemplateStore.ts # Zustand store for AttributeTemplate & Attribute
│       ├── types/
│       │   └── index.ts                # Complete type definitions
│       └── utils/
│           ├── validators.ts            # Zod validation schemas
│           └── codeGenerator.ts         # Pinyin-based code generation
├── pages/
│   └── mdm-pim/
│       └── attribute/                   # New page folder for this feature
│           ├── index.tsx               # Main page entry (tab layout)
│           ├── types/
│           │   └── attribute.types.ts  # Page-level types, query keys
│           ├── services/
│           │   └── attributeService.ts # Class-based service
│           ├── hooks/
│           │   ├── useDictionaryQueries.ts
│           │   ├── useDictionaryMutations.ts
│           │   ├── useTemplateQueries.ts
│           │   └── useTemplateMutations.ts
│           └── components/
│               ├── atoms/
│               │   ├── AttributeStatusTag.tsx
│               │   └── AttributeTypeTag.tsx
│               ├── molecules/
│               │   ├── DictionaryTypeForm.tsx
│               │   ├── DictionaryItemForm.tsx
│               │   ├── DictionaryItemTable.tsx
│               │   ├── AttributeTemplateForm.tsx
│               │   ├── AttributeForm.tsx
│               │   ├── AttributeTable.tsx
│               │   ├── CategorySelector.tsx    # Tree selector for category
│               │   └── DynamicFormField.tsx    # Dynamic field renderer
│               └── organisms/
│                   ├── DictionaryTypeList.tsx
│                   ├── DictionaryItemDrawer.tsx
│                   ├── TemplateList.tsx
│                   ├── AttributeDrawer.tsx
│                   └── DynamicAttributeForm.tsx # SPU/SKU integration
├── mocks/
│   ├── handlers/
│   │   ├── attributeHandlers.ts        # New MSW handlers
│   │   └── index.ts                    # Export all handlers
│   └── data/
│       └── attributeMockData.ts        # Mock data generators
└── components/
    └── DynamicForm/                    # Shared dynamic form components
        └── DynamicFormRenderer.tsx     # Category-aware form generator
```

**Structure Decision**: Feature module at `features/attribute-dictionary/` for stores/types/utils (data layer), page module at `pages/mdm-pim/attribute/` for UI components/services/hooks (presentation layer). This follows the existing brand/category management pattern.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |

## Constitution Check - Post Design Re-evaluation

*Re-check after Phase 1 design completion*

### 设计产出物验证：

- [x] **research.md**: 技术研究完成，所有 NEEDS CLARIFICATION 已解决
  - 拼音编码生成: 使用 pinyin-pro 库 ✓
  - 动态表单生成: React Hook Form + Ant Design ✓
  - Mock 数据持久化: Zustand + localStorage + MSW ✓
- [x] **data-model.md**: 数据模型定义完整
  - 7 个核心实体: DictionaryType, DictionaryItem, Category, AttributeTemplate, Attribute, SPUAttributeValue, SKUAttributeValue ✓
  - 实体关系和约束规则已定义 ✓
  - 索引策略和查询模式已规划 ✓
- [x] **contracts/api.yaml**: OpenAPI 3.0 规范完整
  - Dictionary Types API (CRUD + 列表) ✓
  - Dictionary Items API (CRUD + 批量排序) ✓
  - Attribute Templates API (CRUD + 复制) ✓
  - Attributes API (CRUD) ✓
- [x] **quickstart.md**: 实现指南完整
  - 目录结构规划 ✓
  - 类型定义示例 ✓
  - Store 实现示例 ✓
  - API 服务示例 ✓
  - 动态表单组件示例 ✓

### 宪法原则再验证：

- [x] **功能分支绑定**: 设计产出物均在 `specs/010-attribute-dict-management/` 下 ✓
- [x] **组件化架构**: 设计遵循 atoms/molecules/organisms 分层，Project Structure 中已规划 ✓
- [x] **数据驱动状态管理**: 设计使用 TanStack Query (server state) + Zustand (UI state)，符合宪法要求 ✓
- [x] **代码质量工程化**: API 契约、类型定义、验证规则均已规范化 ✓

### 性能设计验证：

- [x] **查询优化**: Query key factory 模式支持精确缓存失效 ✓
- [x] **虚拟滚动**: Ant Design Table `virtual` prop 支持大列表（200+ items） ✓
- [x] **防抖搜索**: 设计包含 300ms debounce 搜索优化 ✓

### Gate 结果：**PASS** - 设计阶段完成，可进入 Phase 2 (tasks.md)

---

## Generated Artifacts Summary

| Artifact | Path | Status |
|----------|------|--------|
| Feature Spec | `specs/010-attribute-dict-management/spec.md` | ✅ Complete |
| Implementation Plan | `specs/010-attribute-dict-management/plan.md` | ✅ Complete |
| Research | `specs/010-attribute-dict-management/research.md` | ✅ Complete |
| Data Model | `specs/010-attribute-dict-management/data-model.md` | ✅ Complete |
| API Contracts | `specs/010-attribute-dict-management/contracts/api.yaml` | ✅ Complete |
| Quickstart Guide | `specs/010-attribute-dict-management/quickstart.md` | ✅ Complete |
| Tasks | `specs/010-attribute-dict-management/tasks.md` | ⏳ Pending (`/speckit.tasks`) |

## Next Steps

1. Run `/speckit.tasks` to generate actionable implementation tasks
2. Follow TDD workflow: write tests first, then implement features
3. Components implementation order:
   - Phase 1: Dictionary Type/Item CRUD (P1 user story)
   - Phase 2: Attribute Template CRUD (P2 user story)
   - Phase 3: Dynamic Form Integration (P2 user story)
   - Phase 4: Sort/Display Controls (P3 user story)
