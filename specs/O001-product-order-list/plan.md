# Implementation Plan: 商品订单列表查看与管理

**Branch**: `O001-product-order-list` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O001-product-order-list/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能为影院商品管理中台提供完整的商品订单管理能力，面向运营人员的 B端 管理后台。核心需求包括：订单列表查看、多维度筛选（状态/时间/用户）、订单详情查看、订单状态管理（发货/完成/取消）。技术架构采用 React 19.2.0 + Ant Design 6.1.0（前端）+ Spring Boot 3.x + Supabase（后端），状态管理使用 Zustand + TanStack Query，遵循测试驱动开发（TDD）和分支规格绑定原则。

**关键技术决策**（详见 research.md）：
- 前端路由使用 React Router 7.10.1 嵌套路由模式（`/orders/list` 和 `/orders/:id`）
- 数据查询使用 TanStack Query 5.90.12 + 分页查询 + 智能缓存（订单列表 30 秒 stale time）
- 订单号格式：`ORD + YYYYMMDD + 6位随机字母数字`（服务端生成，确保唯一性）
- 手机号脱敏：`138****8000`（前端工具函数 + 后端权限控制）
- 默认时间窗口：近 30 天（平衡性能和实用性）
- 订单导出：支持 Excel（Apache POI）和 CSV（OpenCSV）两种格式
- 乐观锁机制：使用 `version` 字段防止并发更新冲突

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, React Hook Form 7.68.0, Zod 4.1.13, MSW 2.12.4, dayjs 1.11.19
- 后端: Spring Boot 3.x, Supabase Java/HTTP client, Apache POI 5.x (Excel 导出), OpenCSV 5.x (CSV 导出)

**Storage**: Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage for B端 / Taro.setStorage for C端）进行开发模拟

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
- 后端: JUnit 5 + Spring Boot Test + Testcontainers (PostgreSQL)

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API

**Project Type**:
- Full-stack web application (Spring Boot backend + React frontend for B端 admin interface)

**Performance Goals**:
- 订单列表首屏加载时间 < 3 秒（包含 20 条订单）
- 订单筛选操作响应时间 < 1 秒
- 订单详情页加载时间 < 2 秒
- 订单状态变更响应时间 < 1 秒
- 支持 50000+ 条订单数据集，分页翻页 ≤ 2 秒
- 并发支持 100 个运营人员同时操作

**Constraints**:
- 必须遵循功能分支绑定（specId 对齐）
- 必须遵循测试驱动开发（关键业务流程测试覆盖率 100%）
- 必须使用 B端 技术栈（React + Ant Design，禁止使用 Taro）
- 必须使用 Spring Boot + Supabase 作为后端技术栈
- 订单状态转换必须遵循状态机规则（待支付 → 已支付 → 已发货 → 已完成）
- 手机号必须脱敏显示（`138****8000`）
- 订单一旦完成不可再变更状态

**Scale/Scope**:
- B端: 企业管理后台，订单管理模块（包含 4 个页面：列表页、详情页、状态管理、数据导出）
- 数据规模：预计 50000+ 条订单，支持分页加载
- 用户规模：100+ 运营人员并发操作

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `O001-product-order-list` 与 active_spec 指向路径 `specs/O001-product-order-list` 中的 specId 一致
- [x] **测试驱动开发**: 关键业务流程（订单列表查询、订单筛选、订单详情查看、订单状态变更）必须先编写测试，已规划在 quickstart.md 中包含验证清单
- [x] **组件化架构**: 遵循原子设计理念，组件分层为 Atoms（Button, Input）/ Molecules（SearchBar, FormField）/ Organisms（Table, FilterForm）/ Templates（PageLayout）/ Pages
- [x] **前端技术栈分层**: B端 使用 React 19.2.0 + Ant Design 6.1.0，未使用 Taro 框架（Taro 仅用于 C端）
- [x] **数据驱动状态管理**: 使用 Zustand 5.0.9（客户端状态如 UI 状态）+ TanStack Query 5.90.12（服务器状态如订单数据），状态变更可追踪
- [x] **代码质量工程化**: 启用 TypeScript 5.9.3 strict 模式，配置 ESLint + Prettier，使用 Husky + lint-staged 自动检查
- [x] **后端技术栈约束**: 后端使用 Spring Boot 3.x 集成 Supabase，Supabase 为主要数据源（PostgreSQL）与认证/存储提供方

### 性能与标准检查：
- [x] **性能标准**: 应用启动<3秒，页面切换<500ms，订单列表使用分页加载（每页 20 条）+ 复合索引优化
- [x] **安全标准**: 使用 Zod 4.1.13 数据验证，防止 XSS（避免 dangerouslySetInnerHTML），JWT Token 认证授权
- [x] **可访问性标准**: 遵循 WCAG 2.1 AA 级别，所有交互元素支持键盘导航，色彩对比度 ≥ 4.5:1

## Project Structure

### Documentation (this feature)

```text
specs/O001-product-order-list/
├── spec.md              # 功能规格说明（已完成）
├── plan.md              # 实现计划（本文件）
├── research.md          # 技术研究文档（Phase 0 输出，已完成）
├── data-model.md        # 数据模型设计（Phase 1 输出，已完成）
├── quickstart.md        # 快速开始指南（Phase 1 输出，已完成）
├── contracts/           # API 契约（Phase 1 输出，已完成）
│   └── api.yaml        # OpenAPI 3.0.3 规范
├── checklists/          # 质量检查清单
│   └── requirements.md  # 规格质量检查清单（已完成）
└── tasks.md             # 开发任务拆解（待通过 /speckit.tasks 生成）
```

### Source Code (repository root)

```text
frontend/src/
├── features/
│   └── order-management/          # 订单管理功能模块
│       ├── components/             # 功能专属组件
│       │   ├── OrderList.tsx      # 订单列表组件
│       │   ├── OrderFilter.tsx    # 订单筛选器组件
│       │   ├── OrderDetail.tsx    # 订单详情组件
│       │   ├── OrderStatusBadge.tsx # 订单状态标签
│       │   └── OrderActions.tsx   # 订单操作按钮
│       ├── hooks/                  # 自定义 Hooks
│       │   ├── useOrders.ts       # 订单列表查询 Hook
│       │   ├── useOrderDetail.ts  # 订单详情查询 Hook
│       │   └── useUpdateOrderStatus.ts # 订单状态更新 Hook
│       ├── services/               # API 服务
│       │   └── orderService.ts    # 订单相关 API 调用
│       ├── types/                  # TypeScript 类型定义
│       │   └── order.ts           # 订单类型定义
│       └── utils/                  # 工具函数
│           ├── maskPhone.ts       # 手机号脱敏
│           └── formatOrderStatus.ts # 订单状态格式化
├── pages/
│   └── orders/
│       ├── OrderListPage.tsx      # 订单列表页（/orders/list）
│       └── OrderDetailPage.tsx    # 订单详情页（/orders/:id）
├── mocks/
│   ├── handlers/
│   │   └── orderHandlers.ts       # MSW Mock 处理器
│   └── data/
│       └── orders.ts              # Mock 订单数据
└── tests/
    └── e2e/
        └── order-management.spec.ts # E2E 测试

backend/src/main/java/com/cinema/
├── controller/
│   └── OrderController.java       # 订单 API 控制器
├── service/
│   └── OrderService.java          # 订单业务逻辑层
├── repository/
│   └── OrderRepository.java       # 订单数据访问层
├── domain/
│   ├── ProductOrder.java          # 订单领域模型
│   ├── OrderItem.java             # 订单商品项
│   └── OrderLog.java              # 订单日志
├── dto/
│   ├── ProductOrderDTO.java       # 订单 DTO
│   ├── OrderQueryParams.java      # 订单查询参数
│   └── UpdateStatusRequest.java   # 状态更新请求
└── exception/
    └── OrderNotFoundException.java # 订单未找到异常
```

**Structure Decision**: 采用 Feature-Based 模块化架构，订单管理功能作为独立模块 `order-management`，包含组件、Hooks、服务、类型、工具函数。前端页面遵循 React Router 路由结构（`/orders/list` 和 `/orders/:id`），后端遵循 Spring Boot 分层架构（Controller → Service → Repository）。所有新增文件必须在文件头部添加 `@spec O001-product-order-list` 标识。

## Complexity Tracking

**本功能无宪法违规项**，所有设计决策均符合项目宪章规定：

- ✅ 使用 B端 标准技术栈（React + Ant Design），未引入新框架
- ✅ 使用 Spring Boot + Supabase 作为后端技术栈，无额外数据库
- ✅ 状态管理使用 Zustand + TanStack Query，符合宪章规定
- ✅ 测试框架使用 Vitest + Playwright，符合宪章规定
- ✅ 分支命名和规格绑定遵循 `O001-product-order-list` 规范

**技术复杂度**：
- 订单状态机管理（5 个状态 + 转换规则）通过 Service 层业务逻辑实现
- 乐观锁并发控制通过 Supabase `version` 字段 + 条件更新实现
- 订单导出大数据量处理通过流式生成（Apache POI SXSSFWorkbook）实现
- 性能优化通过数据库复合索引（`idx_orders_status_created_at`）+ 前端分页查询实现

所有复杂度均通过标准技术手段解决，无需引入额外抽象层或设计模式。
