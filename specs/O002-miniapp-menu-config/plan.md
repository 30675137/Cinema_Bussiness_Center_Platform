# Implementation Plan: 小程序菜单分类动态配置

**Branch**: `O002-miniapp-menu-config` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O002-miniapp-menu-config/spec.md`

## Summary

将硬编码的 `ChannelCategory` 枚举迁移到 `menu_category` 数据库表，实现完全动态的商品分类管理。核心变更包括：新建 `menu_category` 表、修改 `channel_product_config` 表外键关联、提供 B端管理 API 和 C端查询 API、数据迁移脚本，并保持向后兼容。

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 17 + Spring Boot 3.x (backend)
- C端（客户端/小程序）: TypeScript 5.9.3 + Taro 4.x + React (multi-platform mini-program/H5)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1
- C端: Taro 4.x, Zustand, TanStack Query
- 后端: Spring Boot Web, Spring Data JPA, Supabase PostgreSQL

**Storage**: Supabase (PostgreSQL) 作为主要后端数据源

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests)
- C端: Taro 官方测试工具
- 后端: JUnit 5 + Spring Boot Test

**Target Platform**:
- B端: Web browser + Spring Boot backend API
- C端: 微信小程序 + H5

**Performance Goals**:
- 分类列表 API 响应时间 < 200ms
- 小程序菜单加载 < 1s（含分类和商品）
- 批量排序操作 < 500ms

**Constraints**:
- 必须保持向后兼容（`?category=COFFEE` 参数继续有效）
- 迁移过程零停机
- 默认分类不可删除

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `O002-miniapp-menu-config` = active_spec `specs/O002-miniapp-menu-config/spec.md` ✅
- [x] **测试驱动开发**: 需要为分类 CRUD、迁移脚本、API 兼容性编写测试 ✅
- [x] **组件化架构**: B端分类管理页面遵循原子设计 ✅
- [x] **前端技术栈分层**: B端 React+Ant Design，C端 Taro ✅
- [x] **数据驱动状态管理**: 使用 TanStack Query 管理分类数据 ✅
- [x] **代码质量工程化**: TypeScript strict mode，ESLint，Prettier ✅
- [x] **后端技术栈约束**: Spring Boot + Supabase PostgreSQL ✅

### 性能与标准检查：

- [x] **性能标准**: API < 1s，页面切换 < 500ms ✅
- [x] **安全标准**: Zod 数据验证，B端暂不实现认证 ✅
- [x] **可访问性标准**: 遵循 WCAG 2.1 AA ✅

## Project Structure

### Documentation (this feature)

```text
specs/O002-miniapp-menu-config/
├── spec.md              # Feature specification ✅
├── plan.md              # This file ✅
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI 3.0 specification ✅
├── checklists/
│   └── requirements.md  # Quality checklist ✅
└── tasks.md             # Phase 2 output (pending /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/cinema/
│   ├── category/                    # 新增：分类模块
│   │   ├── controller/
│   │   │   ├── MenuCategoryAdminController.java
│   │   │   └── MenuCategoryClientController.java
│   │   ├── service/
│   │   │   └── MenuCategoryService.java
│   │   ├── repository/
│   │   │   └── MenuCategoryRepository.java
│   │   ├── entity/
│   │   │   ├── MenuCategory.java
│   │   │   └── CategoryAuditLog.java
│   │   └── dto/
│   │       ├── MenuCategoryDTO.java
│   │       ├── CreateMenuCategoryRequest.java
│   │       └── UpdateMenuCategoryRequest.java
│   └── product/                     # 修改：商品模块
│       └── entity/
│           └── ChannelProductConfig.java  # 添加 category_id FK
└── src/main/resources/
    └── db/migration/
        └── V202601030001__add_menu_category.sql

frontend/
├── src/
│   ├── pages/
│   │   └── menu-category/           # 新增：分类管理页面
│   │       └── MenuCategoryPage.tsx
│   ├── features/
│   │   └── menu-category/           # 新增：分类功能模块
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   └── services/
│       └── menuCategoryService.ts   # API 调用

hall-reserve-taro/
└── src/
    ├── services/
    │   └── menuCategoryService.ts   # C端分类 API
    └── stores/
        └── menuCategoryStore.ts     # 分类状态管理
```

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |

---

## Phase 0: Research (Completed)

详见 [research.md](./research.md)

### Key Decisions

1. **方案选择**: 完全动态分类整合（方案二）
2. **数据库设计**: `menu_category` 表 + `category_audit_log` 表
3. **迁移策略**: 渐进式迁移，保留旧字段
4. **API 兼容**: 同时支持 `categoryId` 和 `category` 参数
5. **删除策略**: 自动迁移商品到默认分类
6. **缓存策略**: TanStack Query 5分钟 staleTime + 1分钟轮询

---

## Phase 1: Design (Completed)

### Data Model

详见 [data-model.md](./data-model.md)

**核心表结构**:

```sql
-- menu_category 表
CREATE TABLE menu_category (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    icon_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- channel_product_config 修改
ALTER TABLE channel_product_config
ADD COLUMN category_id UUID REFERENCES menu_category(id);
```

### API Contracts

详见 [contracts/api.yaml](./contracts/api.yaml)

**端点总览**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/menu-categories` | 获取分类列表（管理端） |
| POST | `/api/admin/menu-categories` | 创建分类 |
| GET | `/api/admin/menu-categories/{id}` | 获取分类详情 |
| PUT | `/api/admin/menu-categories/{id}` | 更新分类 |
| DELETE | `/api/admin/menu-categories/{id}` | 删除分类 |
| PUT | `/api/admin/menu-categories/batch-sort` | 批量排序 |
| PATCH | `/api/admin/menu-categories/{id}/visibility` | 切换可见性 |
| GET | `/api/client/menu-categories` | 获取分类列表（小程序端） |

---

## Phase 2: Tasks

待执行 `/speckit.tasks` 生成具体任务列表。

---

## Next Steps

1. ✅ Phase 0: Research - 完成
2. ✅ Phase 1: Design - 完成
3. ⏳ Phase 2: Tasks - 执行 `/speckit.tasks` 生成任务
4. ⏳ Phase 3: Implementation - 按任务顺序开发

---

**Author**: Claude Code
**Last Updated**: 2026-01-03
