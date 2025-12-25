# Implementation Plan: SKU主数据管理(支持BOM)

**Branch**: `P001-sku-master-data` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/P001-sku-master-data/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能扩展现有 SKU 管理系统,支持四种 SKU 类型(原料、包材、成品、套餐),实现成品 BOM(物料清单)配置和标准成本自动计算。技术方案采用:
1. **SKU 类型字段**: TypeScript 枚举 + Ant Design Select 组件
2. **门店范围配置**: PostgreSQL 数组字段 + 多选组件
3. **标准成本计算**: 前端实时计算 + 后端缓存策略
4. **BOM 管理**: 扩展现有 ProductForm/BomTab 组件模式到 SKU 层面

核心价值: 支持影院酒吧式多场景经营,通过 BOM 管理实现鸡尾酒/小吃等成品的配方标准化和成本透明化。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
- C端（客户端/小程序）: TypeScript 5.9.3 + Taro 3.x + React (multi-platform mini-program/H5)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, Spring Boot Web, Supabase Java/HTTP client
- C端: Taro 3.x, Taro UI / NutUI, Zustand / Redux, Taro.request wrapper, Supabase client SDK

**Storage**: Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage for B端 / Taro.setStorage for C端）进行开发模拟

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
- C端: Taro 官方测试工具 + 微信开发者工具 / H5 浏览器测试

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API
- C端: 微信小程序 + 支付宝小程序 + H5 + React Native (Taro 支持的多端平台)

**Project Type**:
- Full-stack web application (Spring Boot backend + React frontend for B端 admin interface)
- Multi-platform client application (Taro framework for C端 user-facing apps)

**Performance Goals**:
- B端: <3s app startup, <500ms page transitions, support 1000+ list items with virtual scrolling
- C端: <1.5s first screen render, <2MB main package size, FPS ≥ 50 for list scrolling

**Constraints**: Must comply with Feature Branch Binding (specId alignment), Test-Driven Development, Component-Based Architecture, Frontend Tech Stack Layering (B端 vs C端 separation), and Backend Architecture (Spring Boot + Supabase as unified backend stack)

**Scale/Scope**:
- B端: Enterprise admin interface, 50+ screens, complex data management workflows
- C端: User-facing mini-program/H5, booking flows, product browsing, user profile management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `P001-sku-master-data` 与 active_spec 路径一致 ✅
- [x] **测试驱动开发**: 已规划 BOM 配置、成本计算、门店范围验证的测试用例 ✅
- [x] **组件化架构**: 复用现有 BomTab 组件模式,新增 SkuTypeTag 原子组件 ✅
- [x] **前端技术栈分层**: 仅 B端 使用 React + Ant Design,无 C端 混用 ✅
- [x] **数据驱动状态管理**: SKU 数据使用 TanStack Query 管理,UI 状态使用 Zustand ✅
- [x] **代码质量工程化**: TypeScript 严格模式,Zod 验证,ESLint 配置已就绪 ✅
- [x] **后端技术栈约束**: 使用 Spring Boot + Supabase PostgreSQL,符合架构要求 ✅

### 性能与标准检查：
- [x] **性能标准**: SKU 列表使用虚拟滚动,成本计算前端缓存,符合性能目标 ✅
- [x] **安全标准**: Zod 验证 BOM 输入,防止 XSS,使用 Supabase Auth ✅
- [x] **可访问性标准**: Ant Design 组件原生支持 WCAG 2.1 AA,表单有明确标签 ✅

**宪法合规性**: ✅ 全部通过,无需复杂度豁免

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

**本功能无宪法违规项,无需复杂度追踪** ✅

---

## Phase 0: Research 完成总结

**研究文档**: [research.md](./research.md)

### 关键技术决策

1. **SKU 类型实现** (Decision 1)
   - 方案: TypeScript 枚举 + Ant Design Select
   - 类型: `raw_material | packaging | finished_product | combo`
   - UI: 使用 Tag 组件显示类型徽章,颜色编码区分
   - 验证: Zod 条件验证确保原料/包材必填标准成本

2. **门店范围配置** (Decision 2)
   - 数据模型: PostgreSQL `TEXT[]` 数组字段
   - UI: Ant Design Select 多选模式
   - 验证: 成品/套餐启用前验证组件在目标门店可用
   - 性能: GIN 索引优化数组查询

3. **标准成本计算** (Decision 3)
   - 前端: useEffect 实时计算,显示成本明细表格
   - 后端: 保存时计算并缓存到 `standard_cost` 字段
   - 公式: `Σ(组件数量 × 单位成本) × (1 + 损耗率%)`
   - 刷新: 提供 `/api/skus/{id}/recalculate-cost` 手动触发接口

4. **技术栈符合性** (Decision 4)
   - 前端: React 19.2.0 + TypeScript 5.9.3 + Ant Design 6.1.0 ✅
   - 状态: Zustand 5.0.9 + TanStack Query 5.90.12 ✅
   - 后端: Spring Boot 3.x + Supabase PostgreSQL ✅

### 识别风险

| 风险 | 缓解措施 |
|------|---------|
| **单位换算依赖** | 提供基础单位换算 Mock 数据,Phase 1 明确单位换算表设计 |
| **BOM 循环依赖** | 前端限制仅选原料/包材,后端 CHECK 约束强制执行 |
| **门店范围验证性能** | 使用 PostgreSQL 数组操作符,仅启用时验证 |

### 技术债务

1. 现有 `sku.ts` 缺少 `skuType` 字段定义
2. BomTab 组件位于 product 模块,需评估重构为通用组件
3. SKU 模块测试覆盖率需补充

---

## Phase 1: Design & Contracts 完成总结

### 数据模型 ([data-model.md](./data-model.md))

**核心实体**:
1. **skus 表扩展**
   - 新增字段: `sku_type`, `store_scope`, `waste_rate`
   - 约束: CHECK 枚举验证,标准成本业务规则
   - 索引: `idx_skus_type`, GIN 索引门店范围

2. **bom_components 表** (新建)
   - 字段: finished_product_id, component_id, quantity, unit, unit_cost
   - 约束: 组件必须是原料/包材,唯一性约束防止重复
   - 级联: ON DELETE CASCADE (成品删除时清理 BOM)

3. **combo_items 表** (新建)
   - 字段: combo_id, sub_item_id, quantity, unit, unit_cost
   - 约束: 子项不能是套餐类型,避免嵌套套餐
   - 级联: ON DELETE CASCADE

4. **unit_conversions 表** (依赖 FR-02)
   - 字段: from_unit, to_unit, conversion_rate, category
   - 初始数据: ml/l, g/kg, 个/打等常用换算

**业务规则**:
- BR-001: SKU 类型与成本计算规则映射
- BR-002: 成品成本公式 = Σ(组件成本) × (1 + 损耗率)
- BR-003: 套餐成本公式 = Σ(子项成本)
- BR-004: 门店范围验证逻辑
- BR-005: BOM 循环依赖检测

**数据迁移**:
- 阶段1: 扩展 skus 表
- 阶段2: 创建 BOM 和套餐表
- 阶段3: 导入测试数据 (21 个 SKU)

### API 契约 ([contracts/api.yaml](./contracts/api.yaml))

**核心接口**:
1. `GET /api/skus` - 查询 SKU 列表 (支持类型/状态/门店筛选)
2. `POST /api/skus` - 创建 SKU (含 BOM/套餐子项)
3. `PUT /api/skus/{id}` - 更新 SKU
4. `DELETE /api/skus/{id}` - 删除 SKU (检查依赖)
5. `GET /api/skus/{id}/bom` - 获取 BOM 配置
6. `PUT /api/skus/{id}/bom` - 更新 BOM (自动重新计算成本)
7. `GET /api/skus/{id}/combo-items` - 获取套餐子项
8. `PUT /api/skus/{id}/combo-items` - 更新套餐子项
9. `POST /api/skus/{id}/recalculate-cost` - 手动重新计算成本
10. `POST /api/skus/{id}/validate-store-scope` - 验证门店范围

**响应格式**: 统一使用 `ApiResponse<T>` 包装,符合 R8 规范

### 前端类型定义 ([contracts/frontend-types.ts](./contracts/frontend-types.ts))

**枚举类型**:
- `SkuType`: RAW_MATERIAL | PACKAGING | FINISHED_PRODUCT | COMBO
- `SkuStatus`: DRAFT | ENABLED | DISABLED
- `UnitCategory`: VOLUME | WEIGHT | QUANTITY

**核心接口**:
- `SKU`: 主数据实体 (14 个字段)
- `SKUDetail`: 包含 BOM 和套餐子项的详情
- `BomComponent`: BOM 组件实体
- `ComboItem`: 套餐子项实体
- `SKUCreateRequest`: 创建请求 DTO
- `UpdateBomRequest`: 更新 BOM 请求

**工具类型**:
- `SKU_TYPE_CONFIG`: 类型显示配置 (颜色/文本)
- `SKU_STATUS_CONFIG`: 状态显示配置
- `ListQueryParams`: 列表查询参数

### 快速开始指南 ([quickstart.md](./quickstart.md))

**环境准备**:
- Node.js 18+, Java 21, Supabase CLI
- 数据库初始化 SQL 脚本
- 测试数据导入脚本 (21 个 SKU)

**前端开发**:
- 扩展 `BasicInfoTab.tsx` 添加 SKU 类型选择器
- 创建 `BomTab.tsx` 实现 BOM 配置
- 创建 `SkuTypeTag.tsx` 显示类型徽章

**后端开发**:
- 扩展 `Sku` 实体添加 `skuType`, `storeScope`, `wasteRate`
- 创建 `BomComponent`, `ComboItem` 实体
- 实现 `CostCalculationService` 成本计算逻辑

**测试覆盖**:
- 前端: SKU 类型选择、BOM 配置、成本计算
- 后端: CRUD API、成本计算、循环依赖检测

---

## 下一步行动

运行 `/speckit.tasks` 命令生成任务清单 (`tasks.md`),将设计转化为可执行的开发任务。

**预期任务类别**:
1. 数据库迁移 (3 个表扩展/创建)
2. 后端 API 实现 (10 个接口)
3. 前端组件开发 (5 个组件)
4. 测试编写 (单元测试 + E2E 测试)
5. 文档更新 (API 文档 + 用户手册)

**估算工作量**: 约 5-7 个开发日 (基于中等规模 15-25 SKU 测试数据)
