# Implementation Plan: 小程序商品列表API加载与展示

**Branch**: `O009-miniapp-product-list` | **Date**: 2026-01-05 | **Spec**: [specs/O009-miniapp-product-list/spec.md](./spec.md)
**Input**: Feature specification from `/specs/O009-miniapp-product-list/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现小程序 `miniapp-ordering-taro` 通过后端 API 加载商品列表的完整功能,包括动态分类导航、商品卡片展示、分页加载、下拉刷新、错误处理等核心特性。基于 O007 和 O008 规格,使用动态菜单分类系统(`menu_category` 表),通过 `GET /api/client/menu-categories` 获取分类列表,`GET /api/client/channel-products` 获取商品数据,使用 UUID 格式的 `categoryId` 进行筛选。前端使用 Taro 框架 + TanStack Query 进行数据管理和缓存,确保小程序和 H5 多端一致体验。

## Technical Context

**Language/Version**:
- C端小程序: TypeScript 5.4.0 + Taro 4.1.9 + React 18.3.1 (项目已使用此版本)
- 后端: Java 17 + Spring Boot 3.3.5 (已存在,无需修改)

**Primary Dependencies**:
- Taro Framework: Taro 4.1.9 (多端统一框架)
- UI 组件: @tarojs/components (Taro 基础组件)
- 状态管理: Zustand 4.5.5 (客户端状态), TanStack Query 5.90.12 (服务器状态)
- 数据验证: Zod (可选,用于 API 响应验证)
- 网络请求: Taro.request 封装 (已存在于项目中)

**Storage**:
- 后端数据源: Supabase (PostgreSQL) - 商品数据和菜单分类数据
- 前端缓存: TanStack Query (5分钟 staleTime, 1分钟后台轮询)
- 本地持久化: Taro.setStorageSync/getStorageSync (用户选择的分类状态)

**Testing**:
- 单元测试: Vitest (组件逻辑、工具函数)
- 集成测试: Taro 官方测试工具 + Mock API (TanStack Query 集成)
- E2E 测试: 微信开发者工具调试 + H5 浏览器测试 (可选,建议测试关键流程)

**Target Platform**:
- 微信小程序 (主要目标平台)
- H5 移动端 (辅助平台)
- 未来可扩展至支付宝小程序、App

**Project Type**:
- C端多平台小程序应用 (Taro 框架)
- 依赖后端 Spring Boot + Supabase 提供的 API

**Performance Goals**:
- 首屏加载时间 ≤ 2 秒 (20个商品含图片)
- 分类切换加载时间 ≤ 1 秒 (使用缓存后 ≤ 500ms)
- 列表滚动 FPS ≥ 50
- 商品列表支持至少 200 条商品流畅滚动
- 图片加载成功率 ≥ 95% (正常网络环境)

**Constraints**:
- 必须遵循 C端技术栈规范 (Taro 框架,禁用 Ant Design)
- 必须遵循功能分支绑定 (O009-miniapp-product-list)
- 必须使用动态分类系统 (依赖 O008 规格的 menu_category 表)
- 必须使用 TanStack Query 管理服务器状态 (强制要求)
- 必须支持微信小程序和 H5 多端 (最低要求)

**Scale/Scope**:
- 5 个用户故事 (P1-P3 优先级)
- 14 个功能需求 (FR-001 到 FR-014)
- 预计涉及文件: 6-8 个组件, 2-3 个 Hook, 1-2 个 Service, 1 个 Store
- API 依赖: 2 个后端接口 (已存在,无需修改)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `O009-miniapp-product-list`,specId 为 `O009`,符合 O 模块(订单管理)编码规范
- [x] **代码归属标识**: 所有新增文件将添加 `@spec O009-miniapp-product-list` 注释
- [x] **测试驱动开发**: 核心商品列表逻辑、分类筛选、数据格式化函数将先编写测试,覆盖率目标 ≥80%
- [x] **组件化架构**: 使用 Taro 组件体系,遵循单一职责原则,组件分层清晰(ProductCard, CategoryTabs, ProductList)
- [x] **前端技术栈分层**: C端功能使用 Taro 框架,禁用 Ant Design,使用 @tarojs/components
- [x] **数据驱动状态管理**: 使用 Zustand (客户端状态) + TanStack Query (服务器状态),状态变更可预测
- [x] **代码质量工程化**: 使用 TypeScript strict mode,ESLint 检查,提交前质量门禁
- [x] **后端技术栈约束**: 后端 API 已存在(O007 规格),本规格仅开发前端,无需修改后端

### 性能与标准检查：
- [x] **性能标准**: 首屏加载 ≤2s,分类切换 ≤1s,使用 TanStack Query 缓存优化,图片懒加载
- [x] **安全标准**: 使用 Zod 验证 API 响应格式,防止 XSS(避免 dangerouslySetInnerHTML),不存储敏感信息
- [ ] **可访问性标准**: Taro 小程序组件默认支持基础可访问性,WCAG 2.1 AA 级别在 H5 端需额外验证

### 特殊原则适配 (C端小程序特性):
- [x] **C端技术栈规范**: 强制使用 Taro 4.1.9,支持微信小程序 + H5 多端,使用 Taro.request 封装 API
- [x] **认证与权限分层**: C端按实际需求实现认证 - 根据 O007 规格,商品列表 API 需要 JWT Token 认证
- [x] **存储 API 规范**: 使用 Taro.setStorageSync/getStorageSync,不使用 localStorage

### Constitution Check 结果:

✅ **通过** - 所有强制性宪法原则已满足,可继续进入 Phase 0 研究阶段

**注意事项**:
1. WCAG 2.1 AA 级别在 H5 端需要在 Phase 1 设计时补充具体方案(色彩对比度、焦点指示)
2. 后端 API 已存在,前端实现需严格遵循 API 契约(参考 O007 规格的 contracts/api.yaml)
3. 认证逻辑需复用现有 Taro 项目的 Token 管理机制

## Project Structure

### Documentation (this feature)

```text
specs/O009-miniapp-product-list/
├── spec.md              # Feature specification (已完成)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (将创建)
├── data-model.md        # Phase 1 output (将创建)
├── quickstart.md        # Phase 1 output (将创建)
└── contracts/           # Phase 1 output (将创建)
    └── api.yaml         # API 契约文档
```

### Source Code (hall-reserve-taro project)

```text
hall-reserve-taro/
├── src/
│   ├── components/            # 通用组件
│   │   ├── ProductCard/       # 商品卡片组件 (新增)
│   │   │   ├── index.tsx
│   │   │   ├── index.module.scss
│   │   │   └── ProductCard.test.tsx
│   │   ├── CategoryTabs/      # 分类标签栏组件 (新增)
│   │   │   ├── index.tsx
│   │   │   ├── index.module.scss
│   │   │   └── CategoryTabs.test.tsx
│   │   └── ProductList/       # 商品列表组件 (新增)
│   │       ├── index.tsx
│   │       ├── index.module.scss
│   │       └── ProductList.test.tsx
│   ├── pages/
│   │   └── product-list/      # 商品列表页面 (新增或修改)
│   │       ├── index.tsx
│   │       ├── index.config.ts
│   │       └── index.module.scss
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useProducts.ts     # 商品查询 Hook (新增)
│   │   └── useCategories.ts   # 分类查询 Hook (新增)
│   ├── services/              # API 服务
│   │   ├── productService.ts  # 商品 API 服务 (新增)
│   │   └── categoryService.ts # 分类 API 服务 (新增)
│   ├── stores/                # Zustand 状态管理
│   │   └── productMenuStore.ts # 商品菜单状态 (新增)
│   ├── types/                 # TypeScript 类型定义
│   │   ├── product.ts         # 商品类型 (新增)
│   │   └── category.ts        # 分类类型 (新增)
│   ├── utils/                 # 工具函数
│   │   ├── priceFormatter.ts  # 价格格式化 (新增)
│   │   └── imageLoader.ts     # 图片加载工具 (新增)
│   └── constants/             # 常量定义
│       └── api.ts             # API 端点常量
└── tests/                     # 测试文件
    ├── __mocks__/
    │   └── products.ts        # 商品 Mock 数据 (新增)
    └── utils/
        └── testHelpers.ts     # 测试工具函数
```

**Structure Decision**:
- C端 Taro 小程序应用,使用功能模块化组织(按页面和组件)
- 组件遵循单一职责原则,分离展示组件(ProductCard)和容器组件(ProductList)
- Hooks 层封装 TanStack Query 逻辑,Service 层封装 API 调用
- Zustand Store 管理客户端状态(选中的分类、UI 状态)
- 工具函数独立封装,便于单元测试

## Complexity Tracking

> **No violations detected - Constitution Check passed**

所有宪法原则已满足,无需特殊说明。

---

## Phase 0: Research & Architecture Decisions

### Research Tasks

根据 Technical Context 和 spec.md 中的需求,需要研究以下技术决策:

1. **TanStack Query 配置策略**
   - 商品列表数据的缓存策略(staleTime, cacheTime, refetchInterval)
   - 分类列表数据的缓存策略(分类数据变化频率低)
   - 乐观更新策略(如用户下拉刷新时的 UI 反馈)

2. **Taro 多端兼容性方案**
   - 图片懒加载在微信小程序和 H5 的实现差异
   - 下拉刷新组件在不同平台的 API 差异(Taro.startPullDownRefresh vs ScrollView)
   - 虚拟列表在 Taro 中的实现方案(是否需要第三方库)

3. **动态分类系统集成**
   - 如何从 `GET /api/client/menu-categories` 获取分类数据
   - 如何将分类的 `id` 字段(UUID)映射到商品列表 API 的 `categoryId` 参数
   - 如何处理分类数据加载失败的降级方案(显示默认分类)

4. **商品数据映射与转换**
   - 后端 `ChannelProductDTO` 与前端 `ProductCard` 组件的数据映射
   - 价格格式化(分→元)的实现方式和边界情况(0元、null)
   - 图片 URL 的处理(Supabase Storage URL,懒加载,占位图)

5. **性能优化策略**
   - 图片懒加载的实现(Taro Image 组件的 lazy-load 属性)
   - 列表分页加载的触发时机(距底部多少像素触发)
   - 防抖处理(分类切换频繁点击)

6. **错误处理与降级方案**
   - Token 过期自动刷新的实现(静默登录 wx.login + 后端换 Token)
   - 网络异常的检测与提示(Taro.getNetworkType)
   - API 调用失败的重试策略(TanStack Query retry 配置)

### Research Output

将在 `research.md` 文件中记录以下内容:
- 每个技术决策的选择(Decision)
- 选择理由(Rationale)
- 考虑的备选方案(Alternatives)
- 代码示例(Code Samples)

---

## Phase 1: Design & Contracts

### Data Model Design

将在 `data-model.md` 中定义以下实体:

1. **ChannelProductDTO (后端响应)**
   - 字段: id, skuId, categoryId, displayName, basePrice, mainImage, isRecommended, sortOrder, status
   - 验证规则: categoryId 必须为有效 UUID, basePrice 必须为非负整数

2. **ProductCard (前端展示模型)**
   - 从 ChannelProductDTO 映射而来
   - 字段: id, name, formattedPrice, imageUrl, isRecommended, category

3. **MenuCategoryDTO (分类响应)**
   - 字段: id, code, displayName, iconUrl, productCount, isVisible
   - 验证规则: isVisible 必须为 true 才在前端显示

4. **CategoryTab (前端分类标签)**
   - 字段: id, code, displayName, isSelected

### API Contracts

将在 `contracts/api.yaml` 中定义以下接口契约:

1. `GET /api/client/menu-categories`
   - Query Parameters: 无
   - Response: `{ success: boolean, data: MenuCategoryDTO[], total: number }`

2. `GET /api/client/channel-products`
   - Query Parameters: `categoryId` (UUID, 可选), `page` (number, 可选), `pageSize` (number, 可选)
   - Response: `{ success: boolean, data: ChannelProductDTO[], total: number, hasNext: boolean }`

### Quickstart Guide

将在 `quickstart.md` 中提供以下内容:
- 本地开发环境搭建(Taro CLI, 微信开发者工具)
- API Mock 数据配置(TanStack Query devtools)
- 组件开发示例(ProductCard 组件的快速上手)
- 调试技巧(Chrome DevTools, Taro 日志工具)

---

## Phase 2: Task Breakdown (Not included in /speckit.plan)

任务分解将在后续使用 `/speckit.tasks` 命令生成 `tasks.md` 文件。

---

## Next Steps

1. ✅ Constitution Check 已通过
2. 🔄 执行 Phase 0: 生成 `research.md` 文件
3. 🔄 执行 Phase 1: 生成 `data-model.md`, `contracts/api.yaml`, `quickstart.md`
4. 🔄 更新 Agent Context (Claude Code)
5. 🔄 Re-check Constitution Check (Post-Design)
6. ⏭️ 后续使用 `/speckit.tasks` 生成任务分解
