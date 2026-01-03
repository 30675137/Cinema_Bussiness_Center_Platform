# Development Tasks: 小程序菜单与商品API集成（阶段一）

**@spec O007-miniapp-menu-api**

**Feature Branch**: `O007-miniapp-menu-api` | **Created**: 2026-01-03
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Overview

本文档包含完整的开发任务清单，用于实现小程序菜单与商品API集成功能。任务按用户故事组织，每个故事是独立可测试的增量。

**关键信息**:
- **总任务数**: 38个任务
- **用户故事**: 3个 (US1: P1, US2: P1, US3: P2)
- **并行机会**: 23个任务可并行执行
- **建议MVP**: User Story 1 (分类菜单) - 完成后即可交付基础导航功能

---

## Task Format

每个任务遵循以下格式：

```
- [ ] [TaskID] [P] [StoryLabel] Description with file path
```

- **[TaskID]**: 任务序号 (T001, T002...)
- **[P]**: 可并行执行标记（不同文件、无依赖）
- **[StoryLabel]**: 用户故事标签 ([US1], [US2], [US3])

---

## Phase 1: Setup & Infrastructure

**目标**: 初始化项目环境，配置依赖和构建工具

**持续时间**: ~2小时

### Tasks

- [x] T001 验证当前分支为 O007-miniapp-menu-api，确认 .specify/active_spec.txt 指向正确规格
- [x] T002 进入 miniapp-ordering-taro/ 目录，执行 npm install 确保所有依赖安装完成
- [x] T003 检查 package.json 确认依赖版本：Taro 4.1.9, Zustand 4.5.5, TanStack Query 5.90.12, Zod 3.24.1
- [x] T004 创建占位图资源文件 miniapp-ordering-taro/src/assets/images/placeholder.svg (200x200 SVG 占位图)

**验收标准**:
- ✅ Git分支正确，active_spec 指向 O007
- ✅ npm install 无错误，依赖版本正确
- ✅ 占位图文件存在且可访问

---

## Phase 2: Foundational - Types & Utils

**目标**: 建立类型定义和工具函数基础设施，供所有用户故事使用

**持续时间**: ~3小时

**依赖**: Phase 1 完成

### Tasks

- [x] T005 [P] 创建 TypeScript 类型定义文件 miniapp-ordering-taro/src/types/product.ts
- [x] T006 [P] 在 product.ts 中定义 ChannelCategory 枚举 (ALCOHOL, COFFEE, BEVERAGE, SNACK, MEAL, OTHER)
- [x] T007 [P] 在 product.ts 中定义 ChannelProductDTO 接口 (id, productId, productName, mainImageUrl, category, salesChannel, status, priceInCents, sortOrder, tags, stockStatus)
- [x] T008 [P] 在 product.ts 中定义 ProductCard 接口 (id, name, imageUrl, priceText, tags, minSalesUnit, isAvailable, category)
- [x] T009 [P] 在 product.ts 中定义 ApiResponse<T> 泛型接口 (success, data, timestamp, message)
- [x] T010 [P] 在 product.ts 中定义 ProductListParams 接口 (category, salesChannel, status, page, pageSize, sortBy, sortOrder)
- [x] T011 [P] 创建分类映射工具 miniapp-ordering-taro/src/utils/category.ts
- [x] T012 [P] 在 category.ts 中实现 CATEGORY_DISPLAY_NAMES 映射对象 (ALCOHOL→经典特调, COFFEE→精品咖啡, BEVERAGE→经典饮品, SNACK→主厨小食)
- [x] T013 [P] 在 category.ts 中实现 getCategoryDisplayName(category: ChannelCategory): string 函数
- [x] T014 [P] 创建价格格式化工具 miniapp-ordering-taro/src/utils/price.ts
- [x] T015 [P] 在 price.ts 中定义 PriceFormatOptions 接口 (showDecimals, showCurrency, freeText)
- [x] T016 [P] 在 price.ts 中实现 formatPrice(priceInCents: number, options?: PriceFormatOptions): string 函数 (分转元，支持配置项)
- [x] T017 [P] 创建 Zod 验证 Schema miniapp-ordering-taro/src/types/validation.ts
- [x] T018 [P] 在 validation.ts 中实现 ChannelProductDTOSchema (使用 z.object 定义所有字段验证规则)
- [x] T019 [P] 在 validation.ts 中实现 validateProductDTO(data: unknown): ChannelProductDTO 函数

**验收标准**:
- ✅ 所有类型文件包含 `@spec O007-miniapp-menu-api` 注释
- ✅ TypeScript 编译无错误 (npm run build)
- ✅ 分类映射返回正确的中文名称
- ✅ 价格格式化: 2800分 → "¥28", 0分 → "免费"
- ✅ Zod验证能正确验证/拒绝DTO数据

---

## Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)

**用户故事**: 作为小程序用户，我希望在点餐页面看到商品分类标签栏，显示"经典特调"、"精品咖啡"、"经典饮品"、"主厨小食"四个核心分类，点击后可以筛选对应类别的商品。

**目标**: 实现分类导航组件和状态管理

**持续时间**: ~4小时

**依赖**: Phase 2 完成

**独立测试标准**:
- 用户打开小程序点餐页 → 查看顶部分类标签栏 → 验证显示5个分类（全部、经典特调、精品咖啡、经典饮品、主厨小食） → 点击任一分类 → 验证标签高亮 → 验证 selectedCategory 状态变更

### Tasks

#### 状态管理

- [x] T020 [P] [US1] 创建 Zustand 状态管理文件 miniapp-ordering-taro/src/stores/productListStore.ts
- [x] T021 [US1] 在 productListStore.ts 中定义 ProductListState 接口 (selectedCategory, setSelectedCategory, reset)
- [x] T022 [US1] 在 productListStore.ts 中实现 useProductListStore Hook (使用 create<ProductListState>)

#### 分类导航组件

- [x] T023 [P] [US1] 创建分类导航组件 miniapp-ordering-taro/src/components/CategoryTabs/index.tsx
- [x] T024 [P] [US1] 创建分类导航样式 miniapp-ordering-taro/src/components/CategoryTabs/index.module.scss
- [x] T025 [US1] 在 CategoryTabs/index.tsx 中定义 CategoryTabsProps 接口 (categories, activeCategory, onCategoryChange)
- [x] T026 [US1] 在 CategoryTabs/index.tsx 中实现 CategoryTabs 组件 (渲枓5个Tab：全部+4个分类)
- [x] T027 [US1] 在 CategoryTabs/index.tsx 中实现分类点击处理 (调用 onCategoryChange)
- [x] T028 [US1] 在 CategoryTabs/index.tsx 中实现激活状态高亮逻辑 (activeCategory === category 时添加 active 样式)
- [x] T029 [US1] 在 CategoryTabs/index.module.scss 中实现 Tab 样式 (横向滚动布局, rpx 单位, active 高亮色)

**验收标准**:
- ✅ CategoryTabs 组件渲染5个分类标签
- ✅ 点击分类标签触发 onCategoryChange 回调
- ✅ 当前选中分类显示高亮样式
- ✅ Zustand store 正确管理 selectedCategory 状态
- ✅ 所有文件包含 `@spec O007-miniapp-menu-api` 注释

---

## Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)

**用户故事**: 作为小程序用户，我希望在选择分类后，看到该分类下的所有商品以卡片形式展示，每个卡片显示商品图片、名称、价格、推荐标签等信息，方便我快速了解商品。

**目标**: 实现商品卡片、商品列表组件、API服务层和数据集成

**持续时间**: ~6小时

**依赖**: Phase 2 完成 (可与 Phase 3 并行)

**独立测试标准**:
- 用户选择任一分类 → 查看商品列表 → 验证每个商品卡片包含图片、名称、价格 → 验证推荐商品显示"推荐"角标 → 验证图片加载失败显示占位图 → 点击卡片触发事件

### Tasks

#### API 服务层

- [x] T030 [P] [US2] 创建 API 服务文件 miniapp-ordering-taro/src/services/channelProductService.ts
- [x] T031 [US2] 在 channelProductService.ts 中定义 BASE_URL 常量 (根据 TARO_ENV 判断环境)
- [x] T032 [US2] 在 channelProductService.ts 中实现 fetchProducts(params: ProductListParams): Promise<ApiResponse<ChannelProductDTO[]>> 函数
- [x] T033 [US2] 在 fetchProducts 中封装 Taro.request，添加 Authorization 认证头，处理401错误（静默登录重试）
- [x] T034 [US2] 在 channelProductService.ts 中实现 toProductCard(dto: ChannelProductDTO): ProductCard 数据转换函数

#### 商品卡片组件

- [x] T035 [P] [US2] 创建商品卡片组件 miniapp-ordering-taro/src/components/ProductCard/index.tsx
- [x] T036 [P] [US2] 创建商品卡片样式 miniapp-ordering-taro/src/components/ProductCard/index.module.scss
- [x] T037 [US2] 在 ProductCard/index.tsx 中定义 ProductCardProps 接口 (product: ProductCard, onClick)
- [x] T038 [US2] 在 ProductCard/index.tsx 中实现 ProductCard 组件 (显示图片、名称、价格、标签)
- [x] T039 [US2] 在 ProductCard/index.tsx 中实现图片懒加载 (Image 组件 lazyLoad 属性)
- [x] T040 [US2] 在 ProductCard/index.tsx 中实现图片加载失败处理 (onError 事件，替换为 placeholder.png)
- [x] T041 [US2] 在 ProductCard/index.tsx 中实现推荐角标显示逻辑 (product.tags.includes('推荐'))
- [x] T042 [US2] 在 ProductCard/index.tsx 中实现商品名称超长截断 (CSS line-clamp: 2)
- [x] T043 [US2] 在 ProductCard/index.module.scss 中实现卡片样式 (网格布局, rpx 单位, 阴影, 圆角)

#### 商品列表组件

- [x] T044 [P] [US2] 创建商品列表组件 miniapp-ordering-taro/src/components/ProductList/index.tsx
- [x] T045 [P] [US2] 创建商品列表样式 miniapp-ordering-taro/src/components/ProductList/index.module.scss
- [x] T046 [US2] 在 ProductList/index.tsx 中定义 ProductListProps 接口 (products: ProductCard[], onProductClick, loading, error)
- [x] T047 [US2] 在 ProductList/index.tsx 中实现 ProductList 组件 (渲染 ProductCard 列表, 2列网格布局)
- [x] T048 [US2] 在 ProductList/index.tsx 中实现加载状态骨架屏 (loading=true 时显示)
- [x] T049 [US2] 在 ProductList/index.tsx 中实现空状态提示 (products.length=0 且 loading=false)
- [x] T050 [US2] 在 ProductList/index.tsx 中实现错误状态提示和重试按钮 (error 存在时显示)
- [x] T051 [US2] 在 ProductList/index.module.scss 中实现列表样式 (Grid 布局, 2列, gap, rpx 单位)

#### TanStack Query 集成

- [x] T052 [US2] 在 productListStore.ts 中添加 TanStack Query 配置 (或创建 hooks/useProducts.ts)
- [x] T053 [US2] 创建自定义 Hook miniapp-ordering-taro/src/hooks/useProducts.ts
- [x] T054 [US2] 在 useProducts.ts 中实现 useProducts(category: ChannelCategory | null) Hook
- [x] T055 [US2] 在 useProducts Hook 中配置 TanStack Query useQuery (queryKey, queryFn, staleTime=5分钟, refetchInterval=1分钟)
- [x] T056 [US2] 在 useProducts Hook 中实现数据转换逻辑 (ChannelProductDTO[] → ProductCard[])

**验收标准**:
- ✅ ProductCard 组件正确显示商品图片、名称、价格
- ✅ 推荐商品显示"推荐"角标
- ✅ 图片加载失败显示占位图
- ✅ 商品名称超过2行显示省略号
- ✅ ProductList 组件正确渲染商品列表（2列网格）
- ✅ 加载状态显示骨架屏
- ✅ 空状态显示"暂无商品"提示
- ✅ TanStack Query 正确缓存数据（5分钟staleTime）
- ✅ 每1分钟后台刷新数据（refetchInterval）
- ✅ 所有文件包含 `@spec O007-miniapp-menu-api` 注释

---

## Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)

**用户故事**: 作为小程序用户，我希望在网络较差或API调用失败时，看到友好的提示信息，而不是白屏或无响应，并且能够手动重试加载。

**目标**: 完善错误处理、加载状态、Token刷新逻辑

**持续时间**: ~3小时

**依赖**: Phase 4 完成

**独立测试标准**:
- 断开网络 → 打开小程序 → 验证显示"网络已断开"提示和重试按钮 → 恢复网络 → 点击重试 → 验证成功加载数据 → 模拟Token过期(401) → 验证自动触发静默登录重试

### Tasks

#### 错误处理增强

- [ ] T057 [P] [US3] 创建错误处理工具 miniapp-ordering-taro/src/utils/error.ts
- [ ] T058 [US3] 在 error.ts 中实现 ApiError 类 (code, message, statusCode, details, isNetworkError, isAuthError, getUserMessage)
- [ ] T059 [US3] 在 channelProductService.ts 中增强错误处理 (捕获网络异常、超时、401、500等场景，抛出 ApiError)
- [ ] T060 [US3] 在 channelProductService.ts 中实现 Token 过期自动重试逻辑 (401 → 调用 wx.login → 换取Token → 重试请求)

#### 加载状态组件

- [ ] T061 [P] [US3] 创建骨架屏组件 miniapp-ordering-taro/src/components/ProductListSkeleton/index.tsx
- [ ] T062 [P] [US3] 创建骨架屏样式 miniapp-ordering-taro/src/components/ProductListSkeleton/index.module.scss
- [ ] T063 [US3] 在 ProductListSkeleton/index.tsx 中实现骨架屏组件 (模拟2列商品卡片布局, 灰色占位矩形)
- [ ] T064 [US3] 在 ProductListSkeleton/index.module.scss 中实现骨架屏动画 (shimmer 闪烁效果)

#### 错误状态组件

- [ ] T065 [P] [US3] 创建错误提示组件 miniapp-ordering-taro/src/components/ErrorState/index.tsx
- [ ] T066 [P] [US3] 创建错误提示样式 miniapp-ordering-taro/src/components/ErrorState/index.module.scss
- [ ] T067 [US3] 在 ErrorState/index.tsx 中定义 ErrorStateProps 接口 (error: ApiError, onRetry)
- [ ] T068 [US3] 在 ErrorState/index.tsx 中实现 ErrorState 组件 (显示错误图标、错误消息、重试按钮)
- [ ] T069 [US3] 在 ErrorState/index.tsx 中实现不同错误类型的提示文案 (网络错误、认证错误、服务器错误)

#### 集成到列表组件

- [ ] T070 [US3] 更新 ProductList 组件，集成 ProductListSkeleton (loading=true 时渲染)
- [ ] T071 [US3] 更新 ProductList 组件，集成 ErrorState (error 存在时渲染，传递 onRetry 回调)
- [ ] T072 [US3] 在 useProducts Hook 中添加重试逻辑 (refetch 方法)

**验收标准**:
- ✅ 网络断开时显示"网络已断开"提示和重试按钮
- ✅ API超时(>10秒)显示"网络超时"提示
- ✅ 服务器500错误显示"服务异常"提示
- ✅ Token过期(401)自动触发静默登录重试，用户无感知
- ✅ 静默登录失败显示授权提示
- ✅ 点击重试按钮重新加载数据
- ✅ 加载中显示骨架屏动画
- ✅ 所有文件包含 `@spec O007-miniapp-menu-api` 注释

---

## Phase 6: Page Integration & Polish

**目标**: 集成所有组件到菜单页面，实现完整功能流程和性能优化

**持续时间**: ~4小时

**依赖**: Phase 3, Phase 4, Phase 5 完成

### Tasks

#### 页面集成

- [x] T073 创建或修改菜单页面 miniapp-ordering-taro/src/pages/menu/index.tsx
- [x] T074 创建或修改菜单页面样式 miniapp-ordering-taro/src/pages/menu/index.module.scss
- [x] T075 在 menu/index.tsx 中导入所有组件 (CategoryTabs, ProductList, ProductCard)
- [x] T076 在 menu/index.tsx 中集成 useProductListStore (获取 selectedCategory, setSelectedCategory)
- [x] T077 在 menu/index.tsx 中集成 useProducts Hook (传递 selectedCategory)
- [x] T078 在 menu/index.tsx 中实现分类切换逻辑 (CategoryTabs onCategoryChange → setSelectedCategory)
- [x] T079 在 menu/index.tsx 中实现商品卡片点击逻辑 (ProductList onProductClick → 跳转详情页占位)
- [x] T080 在 menu/index.tsx 中实现页面初始化逻辑 (默认选中“全部”分类)
- [x] T081 在 menu/index.module.scss 中实现页面布局样式 (固定顶部分类栏, 可滚动商品列表)

#### 性能优化

- [ ] T082 [P] 在 CategoryTabs 组件中实现防抖处理 (使用 useDebouncedCallback, 300ms 延迟)
- [ ] T083 [P] 在 useProducts Hook 中验证 TanStack Query 缓存配置 (staleTime=5分钟, refetchInterval=1分钟)
- [ ] T084 [P] 在 ProductCard 组件中验证图片懒加载配置 (Image lazyLoad=true)
- [ ] T085 [P] 优化 ProductList 组件渲染性能 (使用 React.memo 包装 ProductCard)

#### 配置文件更新

- [x] T086 更新 Taro 路由配置 miniapp-ordering-taro/src/app.config.ts (添加 pages/menu/index 路径)
- [x] T087 更新微信小程序配置 miniapp-ordering-taro/project.config.json (添加必要的网络请求域名白名单)

#### 最终验证

- [x] T088 执行 TypeScript 类型检查 (npm run build，确保无类型错误)
- [ ] T089 执行 ESLint 检查 (npm run lint，确保代码规范)
- [ ] T090 在微信开发者工具中测试 H5 模式 (npm run dev:h5，验证所有功能正常)
- [ ] T091 在微信开发者工具中测试小程序模式 (npm run dev:weapp，验证所有功能正常)
- [ ] T092 验证性能指标：首屏加载 ≤ 1.5秒，分类切换 ≤ 1秒
- [x] T093 验证所有代码文件包含 `@spec O007-miniapp-menu-api` 注释

**验收标准**:
- ✅ 菜单页面成功集成所有组件
- ✅ 分类切换功能正常，商品列表正确过滤
- ✅ 商品卡片点击触发导航（占位逻辑）
- ✅ 防抖处理生效（快速切换分类仅触发最后一次请求）
- ✅ 图片懒加载生效（滚动到可视区域才加载）
- ✅ TypeScript 编译无错误
- ✅ ESLint 检查通过
- ✅ H5 和小程序模式均可正常运行
- ✅ 性能目标达成（首屏 ≤ 1.5秒，切换 ≤ 1秒）

---

## Dependencies & Execution Order

### 依赖关系图

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational: Types & Utils)
    ↓
    ├──→ Phase 3 (US1: 分类菜单) ────┐
    │                              ↓
    └──→ Phase 4 (US2: 商品卡片) ────┤
                                   ↓
                              Phase 5 (US3: 错误处理)
                                   ↓
                              Phase 6 (集成 & 优化)
```

### 并行执行机会

**Phase 2 内部并行**:
- T005-T019 (所有 Foundational 任务可并行)

**Phase 3 与 Phase 4 可并行**:
- US1 (分类菜单) 和 US2 (商品卡片) 是独立功能，可同时开发

**Phase 3 内部并行**:
- T020-T022 (状态管理) 与 T023-T024 (组件文件创建) 可并行

**Phase 4 内部并行**:
- T030 (API服务), T035-T036 (ProductCard), T044-T045 (ProductList) 可并行创建

**Phase 5 内部并行**:
- T057-T058 (错误工具), T061-T062 (骨架屏), T065-T066 (错误组件) 可并行

**Phase 6 内部并行**:
- T082-T085 (所有性能优化任务) 可并行

---

## Parallel Execution Examples

### 并行组 1: Foundational Types & Utils (Phase 2)

可同时执行以下任务：
- T005-T010 (所有类型定义)
- T011-T013 (分类映射工具)
- T014-T016 (价格格式化工具)
- T017-T019 (Zod验证)

**理由**: 不同文件，无依赖关系

### 并行组 2: 用户故事并行开发 (Phase 3 & 4)

可同时执行：
- **开发者 A**: Phase 3 (US1 分类菜单) - T020-T029
- **开发者 B**: Phase 4 (US2 商品卡片) - T030-T056

**理由**: 两个独立用户故事，依赖相同的 Foundational 层，但实现互不依赖

### 并行组 3: 组件创建 (Phase 4 内部)

可同时执行：
- T035-T036 (ProductCard 组件创建)
- T044-T045 (ProductList 组件创建)
- T030 (API 服务层创建)

**理由**: 不同组件文件，初始创建阶段无依赖

---

## Implementation Strategy

### MVP 定义 (最小可行产品)

**建议 MVP 范围**: User Story 1 (Phase 1 + Phase 2 + Phase 3)

**包含功能**:
- ✅ 分类导航Tab显示
- ✅ 点击分类切换状态
- ✅ 状态高亮显示
- ✅ 基础类型和工具函数

**可交付价值**: 用户能看到商品分类导航，点击切换分类，为后续商品展示做准备

**完成后独立可测**: 分类Tab显示和交互完整，状态管理正常

### 增量交付顺序

1. **Sprint 1**: Phase 1 + Phase 2 (基础设施) - 1天
2. **Sprint 2**: Phase 3 (US1 分类菜单) - 0.5天
3. **Sprint 3**: Phase 4 (US2 商品卡片) - 1天
4. **Sprint 4**: Phase 5 (US3 错误处理) - 0.5天
5. **Sprint 5**: Phase 6 (集成优化) - 0.5天

**总估时**: ~3.5天

### 独立测试里程碑

| Milestone | 验证方式 | 预期结果 |
|-----------|---------|---------|
| **M1: Foundational** | 运行 TypeScript 编译，测试工具函数 | 类型检查通过，formatPrice(2800)="¥28" |
| **M2: US1 完成** | 打开菜单页，点击分类Tab | 5个Tab显示，点击切换高亮，状态正确 |
| **M3: US2 完成** | 选择分类，查看商品列表 | 商品卡片正确显示，推荐角标存在，图片懒加载 |
| **M4: US3 完成** | 断网测试，模拟401错误 | 显示友好错误提示，自动重试Token刷新 |
| **M5: 集成完成** | 完整用户流程测试 | 分类切换→商品展示→错误处理，性能达标 |

---

## Task Summary

| Phase | 任务数 | 可并行任务 | 估时 |
|-------|-------|-----------|------|
| Phase 1: Setup | 4 | 0 | 2h |
| Phase 2: Foundational | 15 | 15 | 3h |
| Phase 3: US1 | 10 | 5 | 4h |
| Phase 4: US2 | 27 | 12 | 6h |
| Phase 5: US3 | 16 | 6 | 3h |
| Phase 6: Integration | 21 | 4 | 4h |
| **总计** | **93** | **42** | **~22h (~3天)** |

---

## Notes

- **代码归属**: 所有代码文件必须包含 `@spec O007-miniapp-menu-api` 注释
- **TypeScript 严格模式**: 所有文件必须通过 TypeScript strict 模式检查
- **样式单位**: 所有样式使用 rpx 单位（750 设计稿基准）
- **图片资源**: 使用 Supabase Storage 公开 URL（安全优化已记录为技术债）
- **Token刷新**: 401错误自动触发 wx.login 静默登录重试
- **数据轮询**: TanStack Query refetchInterval 配置为 60000ms (1分钟)
- **测试**: 本功能不要求编写自动化测试，仅手动测试验收

---

**下一步**: 开始执行 Phase 1: Setup & Infrastructure 任务
