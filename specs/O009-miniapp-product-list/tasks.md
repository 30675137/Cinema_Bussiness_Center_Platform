# Tasks: 小程序商品列表API加载与展示

**Feature**: O009-miniapp-product-list
**Input**: Design documents from `/specs/O009-miniapp-product-list/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml, quickstart.md

**Tests**: This feature uses TDD approach - tests are written first and must FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **C端 Taro 项目**: `hall-reserve-taro/src/`
- **组件**: `hall-reserve-taro/src/components/`
- **页面**: `hall-reserve-taro/src/pages/`
- **Hooks**: `hall-reserve-taro/src/hooks/`
- **Services**: `hall-reserve-taro/src/services/`
- **Types**: `hall-reserve-taro/src/types/`
- **测试**: `hall-reserve-taro/tests/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基础结构搭建

- [ ] T001 创建 hall-reserve-taro 项目目录结构（按 plan.md 定义）
- [ ] T002 初始化 Taro 4.1.9 项目并安装依赖（React 18.3.1, TypeScript 5.4.0）
- [ ] T003 [P] 配置 TanStack Query 5.90.12 和 Zustand 4.5.5
- [ ] T004 [P] 配置 ESLint, Prettier, TypeScript strict mode
- [ ] T005 [P] 配置 Vitest 测试框架和覆盖率工具
- [ ] T006 创建 `hall-reserve-taro/src/constants/api.ts` 定义 API 端点常量
- [ ] T007 [P] 创建 `hall-reserve-taro/src/assets/images/placeholder-product.png` 占位图

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 所有用户故事实现前必须完成的核心基础设施

**⚠️ CRITICAL**: 在此阶段完成前，不能开始任何用户故事的实现

- [ ] T008 创建 `hall-reserve-taro/src/types/product.ts` 定义 ChannelProductDTO 和 ProductCard 类型（包含 Zod 验证）
- [ ] T009 创建 `hall-reserve-taro/src/types/category.ts` 定义 MenuCategoryDTO 和 CategoryTab 类型（包含 Zod 验证）
- [ ] T010 [P] 创建 `hall-reserve-taro/src/utils/priceFormatter.ts` 实现价格格式化函数（formatPrice）
- [ ] T011 [P] 创建 `hall-reserve-taro/src/utils/imageLoader.ts` 实现图片加载工具（处理占位图逻辑）
- [ ] T012 创建 `hall-reserve-taro/src/services/request.ts` 封装 Taro.request 并实现 Token 刷新拦截器
- [ ] T013 创建 `hall-reserve-taro/src/services/productService.ts` 实现 fetchProducts API 调用
- [ ] T014 创建 `hall-reserve-taro/src/services/categoryService.ts` 实现 fetchCategories API 调用
- [ ] T015 [P] 创建 `hall-reserve-taro/src/hooks/useProducts.ts` 封装 TanStack Query 商品查询（staleTime 5分钟, refetchInterval 1分钟）
- [ ] T016 [P] 创建 `hall-reserve-taro/src/hooks/useCategories.ts` 封装 TanStack Query 分类查询（staleTime 30分钟）
- [ ] T017 创建 `hall-reserve-taro/src/stores/productMenuStore.ts` 使用 Zustand 管理分类选择状态
- [ ] T018 [P] 编写 `hall-reserve-taro/tests/utils/priceFormatter.test.ts` 测试价格格式化（null, 0, 正常值）
- [ ] T019 [P] 编写 `hall-reserve-taro/tests/services/request.test.ts` 测试 Token 刷新逻辑

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 加载并展示商品列表 (Priority: P1) 🎯 MVP

**Goal**: 用户打开商品列表页，能够看到所有可售商品的列表，每个商品卡片展示图片、名称、价格等关键信息，方便快速浏览和选择商品。

**Independent Test**: 用户打开商品列表页 → 查看页面显示商品卡片 → 验证每个卡片包含图片、名称、价格、推荐标签 → 滚动查看更多商品（推荐商品置顶显示）。

### Tests for User Story 1 (TDD - 先写测试)

> **NOTE: 先编写这些测试，确保测试失败后再实现功能**

- [ ] T020 [P] [US1] 编写 `hall-reserve-taro/tests/components/ProductCard.test.tsx` 测试商品卡片渲染
- [ ] T021 [P] [US1] 编写 `hall-reserve-taro/tests/components/ProductList.test.tsx` 测试商品列表渲染和排序逻辑
- [ ] T022 [P] [US1] 编写 `hall-reserve-taro/tests/pages/product-list.test.tsx` 测试页面加载状态和骨架屏

### Implementation for User Story 1

- [ ] T023 [P] [US1] 创建 `hall-reserve-taro/src/components/ProductCard/index.tsx` 商品卡片组件（展示图片、名称、价格、推荐标签）
- [ ] T024 [P] [US1] 创建 `hall-reserve-taro/src/components/ProductCard/index.module.scss` 商品卡片样式
- [ ] T025 [US1] 创建 `hall-reserve-taro/src/components/ProductList/index.tsx` 商品列表组件（使用 useProducts Hook，实现推荐商品置顶排序）
- [ ] T026 [US1] 创建 `hall-reserve-taro/src/components/ProductList/index.module.scss` 商品列表样式
- [ ] T027 [US1] 创建 `hall-reserve-taro/src/pages/product-list/index.tsx` 商品列表页面（集成 ProductList 组件，处理加载状态）
- [ ] T028 [US1] 创建 `hall-reserve-taro/src/pages/product-list/index.config.ts` 配置页面标题和下拉刷新
- [ ] T029 [US1] 创建 `hall-reserve-taro/src/pages/product-list/index.module.scss` 页面样式
- [ ] T030 [US1] 在 ProductCard 组件中实现图片懒加载（lazyLoad 属性）和加载失败处理（onError 回调）
- [ ] T031 [US1] 在 ProductList 组件中实现骨架屏加载动画（使用 Taro Loading 组件）
- [ ] T032 [US1] 在 ProductList 组件中实现商品排序逻辑（推荐商品按 sortOrder 升序，非推荐商品按 sortOrder 升序）

**Checkpoint**: 此时用户故事1应完全可用且可独立测试 - 用户能看到按推荐优先排序的商品列表

---

## Phase 4: User Story 2 - 按分类筛选商品 (Priority: P1)

**Goal**: 用户能够通过分类标签筛选商品，只查看感兴趣的类别，提高浏览效率。

**Independent Test**: 用户在商品列表页 → 点击分类标签 → 验证列表仅显示该分类商品 → 切换不同分类 → 验证筛选逻辑正确。

### Tests for User Story 2 (TDD - 先写测试)

- [ ] T033 [P] [US2] 编写 `hall-reserve-taro/tests/components/CategoryTabs.test.tsx` 测试分类标签渲染和选中状态
- [ ] T034 [P] [US2] 编写 `hall-reserve-taro/tests/hooks/useCategories.test.ts` 测试分类数据获取和缓存逻辑
- [ ] T035 [P] [US2] 编写 `hall-reserve-taro/tests/pages/product-list-filter.test.tsx` 测试分类筛选集成逻辑

### Implementation for User Story 2

- [ ] T036 [P] [US2] 创建 `hall-reserve-taro/src/components/CategoryTabs/index.tsx` 分类标签栏组件（使用 useCategories Hook）
- [ ] T037 [P] [US2] 创建 `hall-reserve-taro/src/components/CategoryTabs/index.module.scss` 分类标签栏样式
- [ ] T038 [US2] 在 productMenuStore 中添加 setSelectedCategory 和 getSelectedCategory 方法
- [ ] T039 [US2] 在 product-list 页面集成 CategoryTabs 组件（位于商品列表顶部）
- [ ] T040 [US2] 在 ProductList 组件中监听 selectedCategory 状态变化并触发商品数据重新加载
- [ ] T041 [US2] 实现分类切换防抖逻辑（300ms 延迟，使用 useDebouncedCallback）
- [ ] T042 [US2] 在 CategoryTabs 组件中实现"全部"分类选项（categoryId=null）
- [ ] T043 [US2] 在 CategoryTabs 组件中添加加载状态和错误处理（分类 API 失败时显示默认分类）
- [ ] T044 [US2] 在 ProductList 组件中处理空分类情况（显示"暂无该分类商品"提示）

**Checkpoint**: 此时用户故事1和2应都能独立工作 - 用户能按分类筛选商品

---

## Phase 5: User Story 3 - 分页加载与下拉刷新 (Priority: P2)

**Goal**: 用户在滚动到列表底部时自动加载更多商品，并且能够通过下拉刷新重新加载最新数据，避免一次性加载过多数据导致页面卡顿。

**Independent Test**: 用户滚动到列表底部 → 验证自动加载下一页 → 下拉页面 → 验证重新加载数据并重置列表。

### Tests for User Story 3 (TDD - 先写测试)

- [ ] T045 [P] [US3] 编写 `hall-reserve-taro/tests/hooks/useInfiniteProducts.test.ts` 测试无限滚动逻辑
- [ ] T046 [P] [US3] 编写 `hall-reserve-taro/tests/components/ProductList-pagination.test.tsx` 测试分页加载 UI

### Implementation for User Story 3

- [ ] T047 [US3] 修改 `hall-reserve-taro/src/hooks/useProducts.ts` 使用 TanStack Query 的 useInfiniteQuery 替代 useQuery
- [ ] T048 [US3] 在 ProductList 组件中添加 onScrollToLower 处理函数（距底部 50px 触发）
- [ ] T049 [US3] 在 ProductList 组件中添加"加载更多..."和"已加载全部商品"提示
- [ ] T050 [US3] 在 product-list 页面配置文件中启用下拉刷新（enablePullDownRefresh: true）
- [ ] T051 [US3] 在 product-list 页面中实现 onPullDownRefresh 处理函数（调用 refetchQueries 刷新商品数据）
- [ ] T052 [US3] 在下拉刷新时保持当前选中的分类不变（仅刷新商品列表）
- [ ] T053 [US3] 在下拉刷新完成后显示 Taro.showToast 提示"刷新成功"或"刷新失败"
- [ ] T054 [US3] 在下拉刷新完成后调用 Taro.stopPullDownRefresh() 停止动画

**Checkpoint**: 所有用户故事现在应独立功能完整 - 用户能分页加载和下拉刷新

---

## Phase 6: User Story 4 - 处理网络异常与错误 (Priority: P2)

**Goal**: 用户在网络异常或 API 调用失败时，能够看到清晰的错误提示和重试选项，而不是白屏或无响应，避免不知所措。

**Independent Test**: 断开网络 → 打开商品列表页 → 验证显示错误提示和重试按钮 → 恢复网络 → 点击重试 → 验证成功加载数据。

### Tests for User Story 4 (TDD - 先写测试)

- [ ] T055 [P] [US4] 编写 `hall-reserve-taro/tests/services/networkDetection.test.ts` 测试网络检测逻辑
- [ ] T056 [P] [US4] 编写 `hall-reserve-taro/tests/components/ErrorState.test.tsx` 测试错误状态组件

### Implementation for User Story 4

- [ ] T057 [P] [US4] 创建 `hall-reserve-taro/src/utils/networkDetection.ts` 实现网络状态检测（使用 Taro.getNetworkType）
- [ ] T058 [P] [US4] 创建 `hall-reserve-taro/src/components/ErrorState/index.tsx` 错误状态组件（显示错误信息和重试按钮）
- [ ] T059 [P] [US4] 创建 `hall-reserve-taro/src/components/ErrorState/index.module.scss` 错误状态样式
- [ ] T060 [US4] 在 ProductList 组件中集成 ErrorState 组件（isError 时显示）
- [ ] T061 [US4] 在 ErrorState 组件中区分错误类型（网络断开、API 超时、服务器错误）
- [ ] T062 [US4] 在 ErrorState 组件中实现重试按钮（调用 refetch 方法）
- [ ] T063 [US4] 在 productService 中添加 API 调用前的网络检测（调用 checkNetwork）
- [ ] T064 [US4] 在 request.ts 拦截器中处理 500 错误（显示"服务异常，请稍后重试"）
- [ ] T065 [US4] 在 ProductList 组件中处理空数据情况（显示"暂无商品"空状态提示）

**Checkpoint**: 错误处理完善 - 用户在网络异常时能获得清晰反馈

---

## Phase 7: User Story 5 - 商品卡片交互与详情跳转 (Priority: P3)

**Goal**: 用户点击商品卡片后能够跳转到商品详情页，查看更完整的商品信息（规格、描述、加购选项等）。

**Independent Test**: 用户在商品列表页 → 点击任一商品卡片 → 验证跳转到详情页 → 验证传递正确的商品ID参数。

### Tests for User Story 5 (TDD - 先写测试)

- [ ] T066 [P] [US5] 编写 `hall-reserve-taro/tests/components/ProductCard-interaction.test.tsx` 测试卡片点击交互

### Implementation for User Story 5

- [ ] T067 [US5] 在 ProductCard 组件中添加 onTap 点击事件处理
- [ ] T068 [US5] 在 ProductList 组件中实现卡片点击跳转逻辑（Taro.navigateTo）
- [ ] T069 [US5] 在跳转时传递 productId 参数到详情页路由（/pages/product-detail/index?id={productId}）
- [ ] T070 [US5] 在 ProductCard 组件中添加点击反馈效果（背景色变化）
- [ ] T071 [US5] 创建占位详情页 `hall-reserve-taro/src/pages/product-detail/index.tsx`（显示"商品详情功能开发中"）
- [ ] T072 [US5] 创建 `hall-reserve-taro/src/pages/product-detail/index.config.ts` 配置详情页标题

**Checkpoint**: 所有用户故事现在应独立功能完整 - 商品卡片可点击跳转详情页

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和优化

- [ ] T073 [P] 添加商品列表页面路由配置到 `hall-reserve-taro/src/app.config.ts`
- [ ] T074 [P] 添加商品详情页面路由配置到 `hall-reserve-taro/src/app.config.ts`
- [ ] T075 编写 `specs/O009-miniapp-product-list/README.md` 功能使用文档
- [ ] T076 [P] 代码清理和重构（移除未使用的导入、注释）
- [ ] T077 [P] 性能优化：使用 React.memo 优化 ProductCard 组件（避免不必要重渲染）
- [ ] T078 [P] 性能优化：使用 useMemo 缓存商品排序逻辑
- [ ] T079 [P] 性能优化：使用 useCallback 缓存回调函数
- [ ] T080 [P] 安全性检查：确保所有 API 响应使用 Zod 验证
- [ ] T081 [P] 安全性检查：确保不在 Taro.setStorageSync 中存储敏感信息
- [ ] T082 [P] 可访问性检查（H5端）：验证色彩对比度 ≥ 4.5:1
- [ ] T083 [P] 可访问性检查（H5端）：验证交互元素有明确焦点指示
- [ ] T084 运行 `specs/O009-miniapp-product-list/quickstart.md` 中的验证清单
- [ ] T085 [P] 运行单元测试并确保覆盖率 ≥ 80%（npm run test:coverage）
- [ ] T086 [P] 在微信开发者工具中测试小程序兼容性
- [ ] T087 [P] 在 H5 浏览器中测试响应式布局
- [ ] T088 提交代码并创建 Pull Request

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-7)**: 所有用户故事依赖 Foundational 完成
  - 用户故事可以并行实现（如果有足够人力）
  - 或按优先级顺序实现 (P1 → P2 → P3)
- **Polish (Phase 8)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 在 Foundational (Phase 2) 完成后可开始 - 无其他用户故事依赖
- **User Story 2 (P1)**: 在 Foundational (Phase 2) 完成后可开始 - 依赖 US1 的 ProductList 组件但应独立可测
- **User Story 3 (P2)**: 在 Foundational (Phase 2) 完成后可开始 - 依赖 US1/US2 但应独立可测
- **User Story 4 (P2)**: 在 Foundational (Phase 2) 完成后可开始 - 可与其他故事并行
- **User Story 5 (P3)**: 在 Foundational (Phase 2) 完成后可开始 - 依赖 US1 的 ProductCard 组件

### Within Each User Story

- 测试必须先编写并确保失败，然后再实现功能
- 组件/工具函数在服务之前
- 服务在 Hooks 之前
- Hooks 在页面集成之前
- 核心实现在集成之前
- 故事完成后再移动到下一个优先级

### Parallel Opportunities

- 所有 Setup 任务标记 [P] 可并行运行
- 所有 Foundational 任务标记 [P] 可并行运行（在 Phase 2 内）
- 一旦 Foundational 阶段完成，所有用户故事可并行开始（如果团队能力允许）
- 用户故事内的所有测试标记 [P] 可并行运行
- 用户故事内的组件标记 [P] 可并行运行
- 不同用户故事可由不同团队成员并行处理

---

## Parallel Example: User Story 1

```bash
# 同时启动用户故事1的所有测试:
Task: "[US1] 编写 ProductCard.test.tsx 测试商品卡片渲染"
Task: "[US1] 编写 ProductList.test.tsx 测试商品列表渲染和排序逻辑"
Task: "[US1] 编写 product-list.test.tsx 测试页面加载状态和骨架屏"

# 同时启动用户故事1的所有组件:
Task: "[US1] 创建 ProductCard/index.tsx 商品卡片组件"
Task: "[US1] 创建 ProductCard/index.module.scss 商品卡片样式"
```

---

## Implementation Strategy

### MVP First (仅用户故事1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1
4. **停止并验证**: 独立测试用户故事1
5. 如果准备好则部署/演示

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 添加 User Story 4 → 独立测试 → 部署/演示
6. 添加 User Story 5 → 独立测试 → 部署/演示
7. 每个故事增加价值且不破坏之前的故事

### Parallel Team Strategy

使用多个开发者:

1. 团队一起完成 Setup + Foundational
2. 一旦 Foundational 完成:
   - Developer A: User Story 1 (商品列表展示)
   - Developer B: User Story 2 (分类筛选)
   - Developer C: User Story 3 (分页加载)
   - Developer D: User Story 4 (错误处理)
3. 故事独立完成并集成

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应独立可完成和可测试
- 实现前验证测试失败
- 每个任务或逻辑组后提交
- 在任何检查点停止以独立验证故事
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖

---

## Summary

**Total Tasks**: 88
**User Stories**: 5 (US1-P1: 13 tasks, US2-P1: 12 tasks, US3-P2: 10 tasks, US4-P2: 11 tasks, US5-P3: 7 tasks)
**Setup**: 7 tasks
**Foundational**: 12 tasks (blocks all stories)
**Polish**: 16 tasks

**Parallel Opportunities**:
- Setup: 3 parallel tasks
- Foundational: 8 parallel tasks
- US1: 6 parallel tasks (tests + components)
- US2: 6 parallel tasks (tests + components)
- US3: 2 parallel tasks (tests)
- US4: 4 parallel tasks (tests + components)
- US5: 1 parallel task (test)

**Independent Test Criteria**:
- US1: 用户能看到按推荐优先排序的商品列表
- US2: 用户能按分类筛选商品
- US3: 用户能分页加载和下拉刷新
- US4: 用户在网络异常时能获得清晰反馈
- US5: 用户能点击商品卡片跳转详情页

**Suggested MVP Scope**: User Story 1 (加载并展示商品列表) - 13 tasks after Foundational

**Format Validation**: ✅ All tasks follow the checklist format (checkbox + ID + optional [P] + optional [Story] + description with file path)
