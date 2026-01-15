# Implementation Plan: 渠道商品配置

**Branch**: `feat/O005-channel-product-config` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O005-channel-product-config/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: 解决 O004-beverage-sku-reuse 造成的饮品配置能力丢失问题，实现分层架构（SKU主数据 + 渠道商品配置），支持小程序销售商品的差异化配置（名称、图片、分类、规格）。

**Technical Approach**:
- **分层架构**: 保持 `skus` 表作为主数据源，新增 `channel_product_config` 表存储渠道特定配置
- **JSONB 规格存储**: 使用 JSONB 字段存储复杂多变的规格数据，避免过度标准化的多表关联
- **统一渠道管理**: 设计可扩展的渠道类型（MINI_PROGRAM, POS, DELIVERY），目前优先实现小程序渠道
- **增量迁移**: 新旧系统并行，通过路由重定向实现平滑过渡，最后清理历史代码

## Technical Context

**Language/Version**:
- **Frontend (B端)**: TypeScript 5.9.3 + React 19.2.0 + Ant Design 6.1.0
- **Backend**: Java 17 + Spring Boot 3.3.5
- **Database**: Supabase (PostgreSQL 14+)

**Primary Dependencies**:
- **Frontend**:
  - UI Library: Ant Design (Table, Form, Drawer, Upload)
  - State Management: Zustand (UI state), TanStack Query (Server state)
  - Validation: Zod + React Hook Form
  - SKU Selector: Reuse `SKUSelectorModal` from O004
- **Backend**:
  - Spring Boot Web / JPA
  - Supabase Java Client
  - Flyway (Database Migration)
  - TypeHandlers (MyBatis/JPA JSONB mapping)

**Storage**:
- **Primary**: Supabase PostgreSQL (`channel_product_config` table)
- **Secondary**: `skus` table (read-only reference)
- **JSON**: `specs` column for flexible specification structures

**Testing**:
- **Unit Tests**: Vitest for utility logic (price calculation, spec transformation)
- **Component Tests**: Interaction testing for `SpecEditor` and `ChannelSkuSelector`
- **Manual Verification**: Critical for visual configuration (WYSIWYG)

**Target Platform**:
- **B端**: Desktop Web (Chrome/Edge)
- **C端**: WeChat Mini Program (Data consumption mostly, handled by O003 feature update)

**Project Type**: B端管理功能 + 数据结构重构

**Performance Goals**:
- 列表页加载时间 < 1s (P95)
- 规格编辑器响应无延迟
- 小程序端数据同步延迟 < 5s

**Constraints**:
- 必须复用现有 SKU 主数据，不能创建重复的商品实体
- 必须保持与 O004 的 SKU 选择器兼容
- 同一 SKU 在同一渠道只能配置一次（Unique Key）

**Scale/Scope**:
- 预计管理 100-500 个渠道商品
- 规格组合复杂度中等（平均每个商品 3-5 个规格项）
- 并发编辑量低（运营后台）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: ✅ 当前分支名为 `feat/O005-channel-product-config`，specId为 `O005`，active_spec正确指向 `specs/O005-channel-product-config/spec.md`
- [ ] **代码归属标识**: ⏳ 待实现 (所有新文件需包含 `@spec O005-channel-product-config`)
- [ ] **测试驱动开发**: ⏳ 待实现 (需编写 Unit Test 和 Test Scenario)
- [x] **组件化架构**: ✅ 设计复用 `SKUSelectorModal`，新增 `SpecEditor` 独立组件
- [x] **前端技术栈分层**: ✅ B端使用 React 19 + Ant Design 6，数据层使用 TanStack Query
- [x] **数据驱动状态管理**: ✅ 复杂表单状态使用 React Hook Form 管理，规格编辑状态使用 Zustand/Immer
- [ ] **代码质量工程化**: ⏳ 待实现 (CI/CD 检查)
- [x] **后端技术栈约束**: ✅ 使用 Java 17 + Spring Boot 3 + Supabase

### 性能与标准检查：
- [x] **性能标准**: ✅ 列表分页加载，大型列表虚拟滚动
- [x] **安全标准**: ✅ Zod schema 验证 JSONB 结构完整性
- [x] **可访问性标准**: ✅ Ant Design 组件默认支持 a11y

### API 响应格式标准检查：
- [x] **统一响应格式**: ✅ 定义了 `ApiResponse<ChannelProductConfig>`
- [x] **错误编号规范**: ✅ 规划使用 `PRD_VAL_001` 等错误码

### Claude Code Skills 开发规范检查 (N/A):
- **N/A**: 本功能为业务功能，非 Skill 开发

## Project Structure

### Documentation (this feature)

```text
specs/O005-channel-product-config/
├── plan.md              # This file
├── spec.md              # Feature specification
├── data-model.md        # Data model design
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
frontend/src/features/channel-product-config/
├── components/          # Component library
│   ├── specs/           # Spec editor components
│   └── ChannelSkuSelector.tsx
├── pages/               # Page components
├── services/            # API services
├── stores/              # Zustand stores
├── types/               # TypeScript definitions
└── schemas/             # Zod validation schemas

backend/src/main/java/com/cinema/channelproduct/
├── controller/
├── service/
├── domain/
├── repository/
└── dto/
```

**Structure Decision**: 采用 Feature-based 目录结构，所有业务逻辑内聚在 `features/channel-product-config` 目录下，避免污染全局目录。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| JSONB for Specs | 规格结构多变（选项、价格调整、嵌套逻辑），关系型表设计会导致 3-4 层关联表（SpecGroup -> Spec -> Option），查询复杂且扩展性差 | 使用 EAV 模型或多表关联会导致查询性能下降和维护困难 |
| Separate Config Table | 需要将“物理商品”(SKU)与“销售商品”(Channel Product)解耦，支持未来多渠道差异化定价和包装 | 在 SKU 表增加字段会导致 SKU 表膨胀，且无法支持多渠道差异化 |

