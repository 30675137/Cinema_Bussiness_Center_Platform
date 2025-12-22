# Implementation Plan: 门店预约设置管理（已整合到门店管理）

**Branch**: `016-store-reservation-settings` | **Date**: 2025-12-22 | **Updated**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Status**: Integrated
**Input**: Feature specification from `/specs/016-store-reservation-settings/spec.md`

> **整合说明**: 本功能已整合到「门店管理」页面，不再作为独立菜单项。预约设置在门店管理列表的操作列中通过「预约」按钮入口访问。

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能为门店管理系统添加预约设置配置能力，允许运营人员在B端管理后台的「门店管理」页面中为每个门店配置：(1) 可预约时间段（按星期分组）、(2) 预约提前量规则（最小/最大提前时间）、(3) 预约单位时长、(4) 预约押金规则。

**整合方案设计**:
- 在 `StoreTable.tsx` 操作列添加「预约」按钮
- 在 `stores/index.tsx` 集成 `ReservationSettingsModal` 组件
- 移除独立的「门店预约设置」菜单项
- 保留独立页面路由但添加注释说明

技术实现基于014-hall-store-backend扩展Store实体，新增ReservationSettings实体（一对一关系），前端使用React + Ant Design构建配置界面，后端使用Spring Boot集成Supabase进行数据持久化和业务编排。

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
- 本功能仅涉及B端管理后台，不涉及C端开发

**Primary Dependencies**:
- Frontend: Ant Design 6.1.0 (Form/Table/TimePicker/InputNumber), Zustand 5.0.9 (状态管理), TanStack Query 5.90.12 (API数据获取), React Router 7.10.1 (路由), React Hook Form 7.68.0 + Zod 4.1.13 (表单验证), dayjs (时间处理)
- Backend: Spring Boot 3.x Web, Supabase Java Client SDK, Lombok (简化Java代码), Spring Data JPA (数据访问层), Spring Validation (输入校验)
- Testing: Vitest (单元测试), Playwright (E2E测试), MSW 2.12.4 (API Mock), Testing Library (组件测试)

**Storage**: Supabase PostgreSQL数据库作为主要数据源，包含以下表结构：
- stores 表（已存在，来自014-hall-store-backend）
- reservation_settings 表（新建，一对一关联stores表）
- reservation_time_slots 表（新建，或作为JSONB字段存储在reservation_settings表中）
- 审计日志可通过Supabase的自动时间戳字段（created_at, updated_at）+ 自定义审计表实现

**Testing**:
- 单元测试：Vitest测试工具函数、数据验证逻辑、组件渲染
- 集成测试：测试Spring Boot API端点与Supabase数据库交互
- E2E测试：Playwright测试完整的配置流程（从门店列表进入 → 配置预约设置 → 保存 → 验证前端预约页面生效）
- 覆盖率要求：关键业务流程100%，工具函数≥80%，组件≥70%

**Target Platform**:
- B端管理后台：现代Web浏览器（Chrome, Firefox, Safari, Edge）
- 后端API：Spring Boot应用部署在服务器，通过RESTful API暴露接口
- 数据库：Supabase托管的PostgreSQL实例

**Project Type**:
- B端管理功能增强（在现有门店管理模块中集成预约设置配置）
- 全栈开发：前端React组件 + 后端Spring Boot API + Supabase数据库

**Performance Goals**:
- 配置界面加载时间：<500ms
- 保存预约设置API响应时间：<1s（P95）
- 前端预约页面获取门店配置API响应时间：<500ms
- 配置修改后前端实时生效：<5s（通过TanStack Query缓存失效机制）

**Constraints**:
- 必须遵循功能分支绑定规则（当前分支016-store-reservation-settings）
- 必须遵循TDD开发模式（先写测试，再实现功能）
- 必须使用B端技术栈（React + Ant Design），禁止使用C端技术栈（Taro）
- 后端必须使用Spring Boot集成Supabase，禁止绕过Supabase直接连接其他数据库
- 必须遵循统一的API响应格式标准（ApiResponse包装）
- 必须集成到现有门店管理页面，不独立创建新页面

**Scale/Scope**:
- 门店数量预估：50-200家门店
- 并发配置操作：≤10个运营人员同时配置
- 数据量：每个门店1条ReservationSettings记录 + 7条ReservationTimeSlot记录（按星期）
- 功能范围：仅限预约设置配置管理，不包含实际的预约创建/取消等业务逻辑（由其他功能负责）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [X] **功能分支绑定**: ✅ 当前分支名 `016-store-reservation-settings` 与 active_spec 指向路径中的 specId（016）一致
- [X] **测试驱动开发**: ✅ 计划遵循TDD模式，先编写E2E测试（配置流程测试）、单元测试（表单验证、API交互），再实现功能代码。关键流程（配置时间段、提前量、时长单位、押金规则）测试覆盖率100%
- [X] **组件化架构**: ✅ 组件设计遵循原子设计：
  - Atoms: TimePicker, InputNumber, Switch (Ant Design组件)
  - Molecules: TimeSlotFormItem (单个时间段配置), DepositFormItem (押金配置)
  - Organisms: ReservationSettingsForm (完整配置表单), ReservationSettingsModal (配置弹窗)
  - Pages: StoreManagementPage (集成"预约设置"入口按钮)
- [X] **前端技术栈分层**: ✅ 本功能仅涉及B端管理后台，使用React 19.2.0 + Ant Design 6.1.0，不涉及C端（无Taro框架使用）
- [X] **数据驱动状态管理**: ✅ 使用Zustand管理UI状态（Modal开关、表单草稿），使用TanStack Query管理服务器状态（获取/更新预约设置），状态变更通过明确的actions触发
- [X] **代码质量工程化**: ✅ 前端使用TypeScript严格模式 + ESLint + Prettier，后端使用Java 21 + Spring Boot代码规范 + Lombok，所有代码通过质量门禁（类型检查、Lint检查、单元测试）
- [X] **后端技术栈约束**: ✅ 后端使用Spring Boot 3.x集成Supabase Java Client SDK，Supabase PostgreSQL作为唯一数据源，不引入其他数据库

### 性能与标准检查：
- [X] **性能标准**: ✅ 配置界面加载<500ms，保存API响应<1s，符合页面切换<500ms标准。门店列表<200条，无需虚拟滚动（若未来扩展到1000+门店，则使用Ant Design Table虚拟滚动）
- [X] **安全标准**: ✅ 使用Zod + React Hook Form进行前端表单数据验证，Spring Validation进行后端输入校验，防止无效数据提交。API请求包含Token认证（继承现有门店管理认证机制），防止XSS（避免dangerouslySetInnerHTML，使用Ant Design组件渲染）
- [X] **可访问性标准**: ✅ 使用Ant Design组件（内置WCAG 2.1 AA支持），确保表单元素有正确的label和aria属性，支持键盘导航（Tab切换、Enter提交），色彩对比度符合标准

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
| N/A | N/A | 无宪法原则违反，所有设计决策符合项目宪章要求 |

---

## Post-Design Constitution Check Re-evaluation

*已完成Phase 0 (research.md)和Phase 1 (data-model.md, contracts/, quickstart.md)，重新评估设计是否符合宪法原则*

### 设计决策符合性验证

#### 1. 数据库设计（data-model.md）

**验证项**: 后端技术栈约束 - Supabase为主要数据源

- ✅ **符合**: 使用Supabase PostgreSQL作为唯一数据源
- ✅ **符合**: 通过Spring Data JPA直接连接Supabase PostgreSQL（JDBC），未引入其他数据库
- ✅ **符合**: 表结构设计（reservation_settings表 + JSONB存储time_slots）充分利用PostgreSQL特性
- ✅ **符合**: 使用Supabase自动时间戳字段（created_at, updated_at）+ 自定义审计字段（created_by, updated_by）

**设计亮点**:
- JSONB字段存储时间段数组，符合PostgreSQL最佳实践
- GIN索引加速JSONB查询，性能优化到位
- 数据库CHECK约束保证数据完整性

#### 2. API设计（contracts/api.yaml）

**验证项**: API响应格式标准化 - 统一ApiResponse包装

- ✅ **符合**: 所有成功响应使用`ApiResponse<T>`包装，包含success、data、timestamp字段
- ✅ **符合**: 所有错误响应使用`ApiErrorResponse`，包含success、error、message、details、timestamp字段
- ✅ **符合**: HTTP状态码使用标准（200/201/204/400/401/404/500）
- ✅ **符合**: OpenAPI 3.0.3规范定义，前后端契约明确

**设计亮点**:
- GET /stores/{storeId}/reservation-settings - 查询接口
- PUT /stores/{storeId}/reservation-settings - 创建或更新接口（幂等性）
- DELETE /stores/{storeId}/reservation-settings - 删除接口（恢复默认值）
- 完整的错误码定义（STORE_NOT_FOUND, SETTINGS_NOT_FOUND, INVALID_TIME_RANGE等）

#### 3. 技术栈选型（research.md + quickstart.md）

**验证项**: 前端技术栈分层 - B端使用React+Ant Design

- ✅ **符合**: 前端使用React 19.2.0 + TypeScript 5.9.3
- ✅ **符合**: UI组件库使用Ant Design 6.1.0（Form, Table, TimePicker, Modal等）
- ✅ **符合**: 状态管理使用Zustand 5.0.9 + TanStack Query 5.90.12
- ✅ **符合**: 表单处理使用React Hook Form 7.68.0 + Zod 4.1.13
- ✅ **符合**: 本功能仅涉及B端，未使用C端技术栈（Taro）

**验证项**: 代码质量工程化 - TypeScript严格模式 + ESLint + Prettier

- ✅ **符合**: TypeScript类型定义完整（见data-model.md中的TypeScript Type Definitions）
- ✅ **符合**: Zod验证schema与后端验证规则一致
- ✅ **符合**: 后端使用Java 21 + Spring Boot 3.x + Lombok
- ✅ **符合**: 后端使用Spring Validation进行输入校验

#### 4. 组件化架构（quickstart.md）

**验证项**: 组件化架构 - 遵循原子设计理念

- ✅ **符合**: 组件清晰分层：
  - Atoms: TimePicker, InputNumber, Switch (Ant Design组件)
  - Molecules: TimeSlotFormItem (单个时间段配置), DepositFormItem (押金配置)
  - Organisms: ReservationSettingsForm (完整配置表单), ReservationSettingsModal (配置弹窗)
  - Pages: StoreManagementPage (集成"预约设置"入口按钮)
- ✅ **符合**: 文件结构遵循feature-based模块化（features/store-management/）

#### 5. 测试驱动开发（quickstart.md）

**验证项**: TDD - 关键业务流程测试覆盖率100%

- ✅ **符合**: E2E测试覆盖完整配置流程（Playwright测试：登录 → 打开配置 → 修改设置 → 保存 → 验证）
- ✅ **符合**: 单元测试覆盖数据验证逻辑（Vitest测试：Zod schema验证、TanStack Query Hooks）
- ✅ **符合**: 后端单元测试覆盖Service层（JUnit 5测试：createOrUpdate、findByStoreId）
- ✅ **符合**: 测试覆盖率要求明确（关键流程100%，工具函数≥80%，组件≥70%）

#### 6. 性能与安全标准

**验证项**: 性能标准 - <500ms页面切换，<1s API响应

- ✅ **符合**: 配置界面加载时间目标<500ms
- ✅ **符合**: 保存API响应时间目标<1s（P95）
- ✅ **符合**: TanStack Query缓存策略（staleTime: 5分钟）优化性能
- ✅ **符合**: JSONB + GIN索引优化数据库查询性能

**验证项**: 安全标准 - Zod验证 + Spring Validation双重校验

- ✅ **符合**: 前端使用Zod schema验证表单输入（时间格式、范围、押金配置）
- ✅ **符合**: 后端使用Spring Validation注解（@Valid, @Min, @Max, @Pattern）
- ✅ **符合**: API使用Bearer Token (JWT)认证
- ✅ **符合**: 防止XSS攻击（使用Ant Design组件渲染，避免dangerouslySetInnerHTML）

### 最终评估结果

**✅ 所有宪法原则通过验证，无违规项**

| 宪法原则 | 符合性 | 证据 |
|---------|-------|------|
| 功能分支绑定 | ✅ 通过 | 分支名016-store-reservation-settings与specId一致 |
| 测试驱动开发 | ✅ 通过 | E2E+单元测试覆盖完整，TDD流程明确 |
| 组件化架构 | ✅ 通过 | 遵循原子设计，组件清晰分层 |
| 前端技术栈分层 | ✅ 通过 | B端使用React+Ant Design，无C端技术栈混用 |
| 数据驱动状态管理 | ✅ 通过 | Zustand+TanStack Query，状态变更可预测 |
| 代码质量工程化 | ✅ 通过 | TypeScript严格模式+ESLint+Prettier+Spring规范 |
| 后端技术栈约束 | ✅ 通过 | Spring Boot+Supabase PostgreSQL，无其他数据库 |
| API响应格式标准 | ✅ 通过 | 所有API使用ApiResponse包装，契约明确 |
| 性能标准 | ✅ 通过 | <500ms页面切换，<1s API响应，性能优化到位 |
| 安全标准 | ✅ 通过 | Zod+Spring Validation双重校验，JWT认证 |
| 可访问性标准 | ✅ 通过 | Ant Design内置WCAG 2.1 AA支持 |

### 设计完整性确认

- ✅ **research.md**: 所有技术决策已明确，无遗留问题
- ✅ **data-model.md**: 实体设计完整，包含DDL、Entity定义、TypeScript类型
- ✅ **contracts/api.yaml**: API规范完整，包含所有端点、请求/响应示例、错误码
- ✅ **quickstart.md**: 开发指南详细，包含环境搭建、调试、测试、常见问题

**准备就绪，可进入Phase 2 (任务分解) - 运行 `/speckit.tasks` 生成tasks.md**
