# Implementation Plan: B端商品配置 - 动态菜单分类集成

**Branch**: `O008-channel-product-category-migration` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O008-channel-product-category-migration/spec.md`

## Summary

将 B端商品配置页面从硬编码的 `ChannelCategory` 枚举改为使用动态的 `MenuCategory` 数据。核心变更包括：

1. **前端变更**：商品表单的分类选择下拉框从枚举改为 API 动态获取
2. **数据模型变更**：`ChannelProductConfig` 使用 `category_id` (UUID) 替代 `channelCategory` (枚举)
3. **删除旧代码**：清理 `ChannelCategory` 枚举及相关代码

## Technical Context

**Language/Version**:
- 前端: TypeScript 5.9.3 + React 19.2.0
- 后端: 本功能仅涉及前端变更，复用 O002 已有的后端 API

**Primary Dependencies**:
- Ant Design 6.1.0 (Select 组件)
- TanStack Query 5.90.12 (数据获取和缓存)
- Zustand 5.0.9 (客户端状态管理)
- Zod 4.1.13 (数据验证)

**Existing Codebase**:
- 商品配置模块: `frontend/src/features/channel-product-config/`
- 菜单分类模块: `frontend/src/features/menu-category/`
- 分类 Hook: `useMenuCategories` (来自 O002)
- 分类类型: `MenuCategoryDTO` (来自 O002)

**Storage**: Mock data (MSW handlers + localStorage)，后端使用 Supabase (PostgreSQL)

**Testing**: Vitest (unit tests) + Playwright (e2e tests，可选)

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)

**Performance Goals**:
- 分类下拉框渲染时间 < 100ms
- 分类列表 API 响应时间 < 500ms (已由 O002 实现)
- 5 分钟缓存策略减少 80% API 调用

**Constraints**:
- 系统处于开发阶段，无需兼容旧数据
- 直接删除 `channel_category` 字段，仅保留 `category_id`
- 复用 O002 的 `/api/admin/menu-categories` API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `O008-channel-product-category-migration` 与 spec 路径匹配
- [x] **测试驱动开发**: 将为分类选择组件和表单验证编写单元测试
- [x] **组件化架构**: 复用现有组件，新增 `CategorySelect` 封装分类选择逻辑
- [x] **前端技术栈分层**: 仅涉及 B端 React + Ant Design，符合规范
- [x] **数据驱动状态管理**: 使用 TanStack Query 缓存分类数据，复用 `useMenuCategories`
- [x] **代码质量工程化**: 所有代码将通过 TypeScript 检查和 ESLint
- [x] **后端技术栈约束**: N/A - 本功能不涉及后端变更，复用 O002 API

### 性能与标准检查：
- [x] **性能标准**: 分类下拉框支持 100+ 分类快速渲染，使用虚拟滚动（如需要）
- [x] **安全标准**: 使用 Zod 验证 categoryId 格式；B端暂不实现认证授权
- [x] **可访问性标准**: 使用 Ant Design Select 组件，已内置键盘导航和 ARIA 支持

## Project Structure

### Documentation (this feature)

```text
specs/O008-channel-product-category-migration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (API changes)
```

### Source Code Changes

```text
frontend/src/features/channel-product-config/
├── types/
│   └── index.ts                    # 删除 ChannelCategory 枚举，改用 category_id
├── components/
│   ├── ChannelProductBasicForm.tsx # 修改分类选择逻辑
│   ├── ChannelProductFilter.tsx    # 修改分类筛选逻辑
│   ├── ChannelProductTable.tsx     # 修改分类显示逻辑
│   └── CategorySelect.tsx          # [新增] 封装动态分类选择组件
├── hooks/
│   └── useChannelProductCategories.ts  # [新增] 商品分类选择专用 Hook
├── schemas/
│   └── channelProductSchema.ts     # 更新验证 schema，使用 categoryId
└── services/
    └── channelProductService.ts    # 更新 API 调用，使用 categoryId

frontend/src/features/menu-category/
├── hooks/
│   └── useMenuCategories.ts        # [复用] 分类列表查询 Hook
└── types/
    └── index.ts                    # [复用] MenuCategoryDTO 类型
```

## Complexity Tracking

> 本功能变更范围较小，无宪法违规需要说明

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 无 | - | - |

## Phase 0: Research Summary

### Key Decisions

1. **分类数据获取方式**
   - 决定：复用 O002 的 `useMenuCategories` Hook
   - 理由：避免重复代码，保持一致的缓存策略

2. **数据模型变更策略**
   - 决定：直接删除 `channelCategory` 枚举，使用 `categoryId` (UUID)
   - 理由：系统处于开发阶段，无需兼容旧数据

3. **隐藏分类的处理**
   - 决定：编辑时显示隐藏分类并标记 "(已隐藏)"，创建时不显示
   - 理由：避免编辑商品时丢失分类关联

4. **组件复用策略**
   - 决定：新增 `CategorySelect` 组件封装分类选择逻辑
   - 理由：统一创建和编辑页面的分类选择行为

## Phase 1: Design Artifacts

### Data Model Changes

详见 [data-model.md](./data-model.md)

### API Contract Changes

详见 [contracts/api.yaml](./contracts/api.yaml)

### Implementation Quickstart

详见 [quickstart.md](./quickstart.md)
