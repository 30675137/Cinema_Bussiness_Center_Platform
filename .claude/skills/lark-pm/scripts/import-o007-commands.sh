#!/bin/bash
# Auto-generated script to import O007 tasks
# Generated at: 2026-01-03T07:54:10.264Z

cd "$(dirname "$0")/.."

echo "🚀 Importing 93 tasks to Lark PM..."
echo ""

echo "[1/93] Creating T001..."
npx tsx src/index.ts task create --title "T001: 验证当前分支为 O007-miniapp-menu-api，确认 .specify/active_spec.txt 指向正确规格" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T001\n阶段: Phase 1: Setup & Infrastructure\n可并行: ✗\n完整描述: 验证当前分支为 O007-miniapp-menu-api，确认 .specify/active_spec.txt 指向正确规格"
sleep 0.5

echo "[2/93] Creating T002..."
npx tsx src/index.ts task create --title "T002: 进入 miniapp-ordering-taro/ 目录，执行 npm install 确保所有依赖安装完成" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T002\n阶段: Phase 1: Setup & Infrastructure\n可并行: ✗\n完整描述: 进入 miniapp-ordering-taro/ 目录，执行 npm install 确保所有依赖安装完成"
sleep 0.5

echo "[3/93] Creating T003..."
npx tsx src/index.ts task create --title "T003: 检查 package.json 确认依赖版本：Taro 4.1.9, Zustand 4.5.5, TanStack Query 5.90.12, Zod 4.1.13" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T003\n阶段: Phase 1: Setup & Infrastructure\n可并行: ✗\n完整描述: 检查 package.json 确认依赖版本：Taro 4.1.9, Zustand 4.5.5, TanStack Query 5.90.12, Zod 4.1.13"
sleep 0.5

echo "[4/93] Creating T004..."
npx tsx src/index.ts task create --title "T004: 创建占位图资源文件 miniapp-ordering-taro/src/assets/images/placeholder.png (200x200px 灰色占位图)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T004\n阶段: Phase 1: Setup & Infrastructure\n可并行: ✗\n完整描述: 创建占位图资源文件 miniapp-ordering-taro/src/assets/images/placeholder.png (200x200px 灰色占位图)"
sleep 0.5

echo "[5/93] Creating T005..."
npx tsx src/index.ts task create --title "T005: 创建 TypeScript 类型定义文件 miniapp-ordering-taro/src/types/product.ts" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T005\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 创建 TypeScript 类型定义文件 miniapp-ordering-taro/src/types/product.ts"
sleep 0.5

echo "[6/93] Creating T006..."
npx tsx src/index.ts task create --title "T006: 在 product.ts 中定义 ChannelCategory 枚举 (ALCOHOL, COFFEE, BEVERAGE, SNACK, MEAL, OTHER)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T006\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 product.ts 中定义 ChannelCategory 枚举 (ALCOHOL, COFFEE, BEVERAGE, SNACK, MEAL, OTHER)"
sleep 0.5

echo "[7/93] Creating T007..."
npx tsx src/index.ts task create --title "T007: 在 product.ts 中定义 ChannelProductDTO 接口 (id, productId, productName, mainImageUrl, category, salesChannel, status, priceInCents, sortOrder, ta..." --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T007\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 product.ts 中定义 ChannelProductDTO 接口 (id, productId, productName, mainImageUrl, category, salesChannel, status, priceInCents, sortOrder, tags, stockStatus)"
sleep 0.5

echo "[8/93] Creating T008..."
npx tsx src/index.ts task create --title "T008: 在 product.ts 中定义 ProductCard 接口 (id, name, imageUrl, priceText, tags, minSalesUnit, isAvailable, category)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T008\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 product.ts 中定义 ProductCard 接口 (id, name, imageUrl, priceText, tags, minSalesUnit, isAvailable, category)"
sleep 0.5

echo "[9/93] Creating T009..."
npx tsx src/index.ts task create --title "T009: 在 product.ts 中定义 ApiResponse<T> 泛型接口 (success, data, timestamp, message)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T009\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 product.ts 中定义 ApiResponse<T> 泛型接口 (success, data, timestamp, message)"
sleep 0.5

echo "[10/93] Creating T010..."
npx tsx src/index.ts task create --title "T010: 在 product.ts 中定义 ProductListParams 接口 (category, salesChannel, status, page, pageSize, sortBy, sortOrder)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T010\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 product.ts 中定义 ProductListParams 接口 (category, salesChannel, status, page, pageSize, sortBy, sortOrder)"
sleep 0.5

echo "[11/93] Creating T011..."
npx tsx src/index.ts task create --title "T011: 创建分类映射工具 miniapp-ordering-taro/src/utils/category.ts" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T011\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 创建分类映射工具 miniapp-ordering-taro/src/utils/category.ts"
sleep 0.5

echo "[12/93] Creating T012..."
npx tsx src/index.ts task create --title "T012: 在 category.ts 中实现 CATEGORY_DISPLAY_NAMES 映射对象 (ALCOHOL→经典特调, COFFEE→精品咖啡, BEVERAGE→经典饮品, SNACK→主厨小食)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T012\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 category.ts 中实现 CATEGORY_DISPLAY_NAMES 映射对象 (ALCOHOL→经典特调, COFFEE→精品咖啡, BEVERAGE→经典饮品, SNACK→主厨小食)"
sleep 0.5

echo "[13/93] Creating T013..."
npx tsx src/index.ts task create --title "T013: 在 category.ts 中实现 getCategoryDisplayName(category: ChannelCategory): string 函数" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T013\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 category.ts 中实现 getCategoryDisplayName(category: ChannelCategory): string 函数"
sleep 0.5

echo "[14/93] Creating T014..."
npx tsx src/index.ts task create --title "T014: 创建价格格式化工具 miniapp-ordering-taro/src/utils/price.ts" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T014\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 创建价格格式化工具 miniapp-ordering-taro/src/utils/price.ts"
sleep 0.5

echo "[15/93] Creating T015..."
npx tsx src/index.ts task create --title "T015: 在 price.ts 中定义 PriceFormatOptions 接口 (showDecimals, showCurrency, freeText)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T015\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 price.ts 中定义 PriceFormatOptions 接口 (showDecimals, showCurrency, freeText)"
sleep 0.5

echo "[16/93] Creating T016..."
npx tsx src/index.ts task create --title "T016: 在 price.ts 中实现 formatPrice(priceInCents: number, options?: PriceFormatOptions): string 函数 (分转元，支持配置项)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T016\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 price.ts 中实现 formatPrice(priceInCents: number, options?: PriceFormatOptions): string 函数 (分转元，支持配置项)"
sleep 0.5

echo "[17/93] Creating T017..."
npx tsx src/index.ts task create --title "T017: 创建 Zod 验证 Schema miniapp-ordering-taro/src/types/validation.ts" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T017\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 创建 Zod 验证 Schema miniapp-ordering-taro/src/types/validation.ts"
sleep 0.5

echo "[18/93] Creating T018..."
npx tsx src/index.ts task create --title "T018: 在 validation.ts 中实现 ChannelProductDTOSchema (使用 z.object 定义所有字段验证规则)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T018\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 validation.ts 中实现 ChannelProductDTOSchema (使用 z.object 定义所有字段验证规则)"
sleep 0.5

echo "[19/93] Creating T019..."
npx tsx src/index.ts task create --title "T019: 在 validation.ts 中实现 validateProductDTO(data: unknown): ChannelProductDTO 函数" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T019\n阶段: Phase 2: Foundational - Types & Utils\n可并行: ✓\n完整描述: 在 validation.ts 中实现 validateProductDTO(data: unknown): ChannelProductDTO 函数"
sleep 0.5

echo "[20/93] Creating T020..."
npx tsx src/index.ts task create --title "T020: 创建 Zustand 状态管理文件 miniapp-ordering-taro/src/stores/productListStore.ts" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T020\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✓\n完整描述: 创建 Zustand 状态管理文件 miniapp-ordering-taro/src/stores/productListStore.ts"
sleep 0.5

echo "[21/93] Creating T021..."
npx tsx src/index.ts task create --title "T021: 在 productListStore.ts 中定义 ProductListState 接口 (selectedCategory, setSelectedCategory, reset)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T021\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✗\n完整描述: 在 productListStore.ts 中定义 ProductListState 接口 (selectedCategory, setSelectedCategory, reset)"
sleep 0.5

echo "[22/93] Creating T022..."
npx tsx src/index.ts task create --title "T022: 在 productListStore.ts 中实现 useProductListStore Hook (使用 create<ProductListState>)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T022\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✗\n完整描述: 在 productListStore.ts 中实现 useProductListStore Hook (使用 create<ProductListState>)"
sleep 0.5

echo "[23/93] Creating T023..."
npx tsx src/index.ts task create --title "T023: 创建分类导航组件 miniapp-ordering-taro/src/components/CategoryTabs/index.tsx" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T023\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✓\n完整描述: 创建分类导航组件 miniapp-ordering-taro/src/components/CategoryTabs/index.tsx"
sleep 0.5

echo "[24/93] Creating T024..."
npx tsx src/index.ts task create --title "T024: 创建分类导航样式 miniapp-ordering-taro/src/components/CategoryTabs/index.module.scss" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T024\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✓\n完整描述: 创建分类导航样式 miniapp-ordering-taro/src/components/CategoryTabs/index.module.scss"
sleep 0.5

echo "[25/93] Creating T025..."
npx tsx src/index.ts task create --title "T025: 在 CategoryTabs/index.tsx 中定义 CategoryTabsProps 接口 (categories, activeCategory, onCategoryChange)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T025\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✗\n完整描述: 在 CategoryTabs/index.tsx 中定义 CategoryTabsProps 接口 (categories, activeCategory, onCategoryChange)"
sleep 0.5

echo "[26/93] Creating T026..."
npx tsx src/index.ts task create --title "T026: 在 CategoryTabs/index.tsx 中实现 CategoryTabs 组件 (渲染5个Tab：全部+4个分类)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T026\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✗\n完整描述: 在 CategoryTabs/index.tsx 中实现 CategoryTabs 组件 (渲染5个Tab：全部+4个分类)"
sleep 0.5

echo "[27/93] Creating T027..."
npx tsx src/index.ts task create --title "T027: 在 CategoryTabs/index.tsx 中实现分类点击处理 (调用 onCategoryChange)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T027\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✗\n完整描述: 在 CategoryTabs/index.tsx 中实现分类点击处理 (调用 onCategoryChange)"
sleep 0.5

echo "[28/93] Creating T028..."
npx tsx src/index.ts task create --title "T028: 在 CategoryTabs/index.tsx 中实现激活状态高亮逻辑 (activeCategory === category 时添加 active 样式)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T028\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✗\n完整描述: 在 CategoryTabs/index.tsx 中实现激活状态高亮逻辑 (activeCategory === category 时添加 active 样式)"
sleep 0.5

echo "[29/93] Creating T029..."
npx tsx src/index.ts task create --title "T029: 在 CategoryTabs/index.module.scss 中实现 Tab 样式 (横向滚动布局, rpx 单位, active 高亮色)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T029\n阶段: Phase 3: User Story 1 - 查看商品分类菜单 (Priority: P1)\n用户故事: US1\n可并行: ✗\n完整描述: 在 CategoryTabs/index.module.scss 中实现 Tab 样式 (横向滚动布局, rpx 单位, active 高亮色)"
sleep 0.5

echo "[30/93] Creating T030..."
npx tsx src/index.ts task create --title "T030: 创建 API 服务文件 miniapp-ordering-taro/src/services/channelProductService.ts" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T030\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✓\n完整描述: 创建 API 服务文件 miniapp-ordering-taro/src/services/channelProductService.ts"
sleep 0.5

echo "[31/93] Creating T031..."
npx tsx src/index.ts task create --title "T031: 在 channelProductService.ts 中定义 BASE_URL 常量 (根据 TARO_ENV 判断环境)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T031\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 channelProductService.ts 中定义 BASE_URL 常量 (根据 TARO_ENV 判断环境)"
sleep 0.5

echo "[32/93] Creating T032..."
npx tsx src/index.ts task create --title "T032: 在 channelProductService.ts 中实现 fetchProducts(params: ProductListParams): Promise<ApiResponse<ChannelProductDTO[]>> 函数" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T032\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 channelProductService.ts 中实现 fetchProducts(params: ProductListParams): Promise<ApiResponse<ChannelProductDTO[]>> 函数"
sleep 0.5

echo "[33/93] Creating T033..."
npx tsx src/index.ts task create --title "T033: 在 fetchProducts 中封装 Taro.request，添加 Authorization 认证头，处理401错误（静默登录重试）" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T033\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 fetchProducts 中封装 Taro.request，添加 Authorization 认证头，处理401错误（静默登录重试）"
sleep 0.5

echo "[34/93] Creating T034..."
npx tsx src/index.ts task create --title "T034: 在 channelProductService.ts 中实现 toProductCard(dto: ChannelProductDTO): ProductCard 数据转换函数" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T034\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 channelProductService.ts 中实现 toProductCard(dto: ChannelProductDTO): ProductCard 数据转换函数"
sleep 0.5

echo "[35/93] Creating T035..."
npx tsx src/index.ts task create --title "T035: 创建商品卡片组件 miniapp-ordering-taro/src/components/ProductCard/index.tsx" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T035\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✓\n完整描述: 创建商品卡片组件 miniapp-ordering-taro/src/components/ProductCard/index.tsx"
sleep 0.5

echo "[36/93] Creating T036..."
npx tsx src/index.ts task create --title "T036: 创建商品卡片样式 miniapp-ordering-taro/src/components/ProductCard/index.module.scss" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T036\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✓\n完整描述: 创建商品卡片样式 miniapp-ordering-taro/src/components/ProductCard/index.module.scss"
sleep 0.5

echo "[37/93] Creating T037..."
npx tsx src/index.ts task create --title "T037: 在 ProductCard/index.tsx 中定义 ProductCardProps 接口 (product: ProductCard, onClick)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T037\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductCard/index.tsx 中定义 ProductCardProps 接口 (product: ProductCard, onClick)"
sleep 0.5

echo "[38/93] Creating T038..."
npx tsx src/index.ts task create --title "T038: 在 ProductCard/index.tsx 中实现 ProductCard 组件 (显示图片、名称、价格、标签)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T038\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductCard/index.tsx 中实现 ProductCard 组件 (显示图片、名称、价格、标签)"
sleep 0.5

echo "[39/93] Creating T039..."
npx tsx src/index.ts task create --title "T039: 在 ProductCard/index.tsx 中实现图片懒加载 (Image 组件 lazyLoad 属性)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T039\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductCard/index.tsx 中实现图片懒加载 (Image 组件 lazyLoad 属性)"
sleep 0.5

echo "[40/93] Creating T040..."
npx tsx src/index.ts task create --title "T040: 在 ProductCard/index.tsx 中实现图片加载失败处理 (onError 事件，替换为 placeholder.png)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T040\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductCard/index.tsx 中实现图片加载失败处理 (onError 事件，替换为 placeholder.png)"
sleep 0.5

echo "[41/93] Creating T041..."
npx tsx src/index.ts task create --title "T041: 在 ProductCard/index.tsx 中实现推荐角标显示逻辑 (product.tags.includes(\'推荐\'))" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T041\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductCard/index.tsx 中实现推荐角标显示逻辑 (product.tags.includes(\'推荐\'))"
sleep 0.5

echo "[42/93] Creating T042..."
npx tsx src/index.ts task create --title "T042: 在 ProductCard/index.tsx 中实现商品名称超长截断 (CSS line-clamp: 2)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T042\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductCard/index.tsx 中实现商品名称超长截断 (CSS line-clamp: 2)"
sleep 0.5

echo "[43/93] Creating T043..."
npx tsx src/index.ts task create --title "T043: 在 ProductCard/index.module.scss 中实现卡片样式 (网格布局, rpx 单位, 阴影, 圆角)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T043\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductCard/index.module.scss 中实现卡片样式 (网格布局, rpx 单位, 阴影, 圆角)"
sleep 0.5

echo "[44/93] Creating T044..."
npx tsx src/index.ts task create --title "T044: 创建商品列表组件 miniapp-ordering-taro/src/components/ProductList/index.tsx" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T044\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✓\n完整描述: 创建商品列表组件 miniapp-ordering-taro/src/components/ProductList/index.tsx"
sleep 0.5

echo "[45/93] Creating T045..."
npx tsx src/index.ts task create --title "T045: 创建商品列表样式 miniapp-ordering-taro/src/components/ProductList/index.module.scss" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T045\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✓\n完整描述: 创建商品列表样式 miniapp-ordering-taro/src/components/ProductList/index.module.scss"
sleep 0.5

echo "[46/93] Creating T046..."
npx tsx src/index.ts task create --title "T046: 在 ProductList/index.tsx 中定义 ProductListProps 接口 (products: ProductCard[], onProductClick, loading, error)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T046\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductList/index.tsx 中定义 ProductListProps 接口 (products: ProductCard[], onProductClick, loading, error)"
sleep 0.5

echo "[47/93] Creating T047..."
npx tsx src/index.ts task create --title "T047: 在 ProductList/index.tsx 中实现 ProductList 组件 (渲染 ProductCard 列表, 2列网格布局)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T047\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductList/index.tsx 中实现 ProductList 组件 (渲染 ProductCard 列表, 2列网格布局)"
sleep 0.5

echo "[48/93] Creating T048..."
npx tsx src/index.ts task create --title "T048: 在 ProductList/index.tsx 中实现加载状态骨架屏 (loading=true 时显示)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T048\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductList/index.tsx 中实现加载状态骨架屏 (loading=true 时显示)"
sleep 0.5

echo "[49/93] Creating T049..."
npx tsx src/index.ts task create --title "T049: 在 ProductList/index.tsx 中实现空状态提示 (products.length=0 且 loading=false)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T049\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductList/index.tsx 中实现空状态提示 (products.length=0 且 loading=false)"
sleep 0.5

echo "[50/93] Creating T050..."
npx tsx src/index.ts task create --title "T050: 在 ProductList/index.tsx 中实现错误状态提示和重试按钮 (error 存在时显示)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T050\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductList/index.tsx 中实现错误状态提示和重试按钮 (error 存在时显示)"
sleep 0.5

echo "[51/93] Creating T051..."
npx tsx src/index.ts task create --title "T051: 在 ProductList/index.module.scss 中实现列表样式 (Grid 布局, 2列, gap, rpx 单位)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T051\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 ProductList/index.module.scss 中实现列表样式 (Grid 布局, 2列, gap, rpx 单位)"
sleep 0.5

echo "[52/93] Creating T052..."
npx tsx src/index.ts task create --title "T052: 在 productListStore.ts 中添加 TanStack Query 配置 (或创建 hooks/useProducts.ts)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T052\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 productListStore.ts 中添加 TanStack Query 配置 (或创建 hooks/useProducts.ts)"
sleep 0.5

echo "[53/93] Creating T053..."
npx tsx src/index.ts task create --title "T053: 创建自定义 Hook miniapp-ordering-taro/src/hooks/useProducts.ts" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T053\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 创建自定义 Hook miniapp-ordering-taro/src/hooks/useProducts.ts"
sleep 0.5

echo "[54/93] Creating T054..."
npx tsx src/index.ts task create --title "T054: 在 useProducts.ts 中实现 useProducts(category: ChannelCategory | null) Hook" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T054\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 useProducts.ts 中实现 useProducts(category: ChannelCategory | null) Hook"
sleep 0.5

echo "[55/93] Creating T055..."
npx tsx src/index.ts task create --title "T055: 在 useProducts Hook 中配置 TanStack Query useQuery (queryKey, queryFn, staleTime=5分钟, refetchInterval=1分钟)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T055\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 useProducts Hook 中配置 TanStack Query useQuery (queryKey, queryFn, staleTime=5分钟, refetchInterval=1分钟)"
sleep 0.5

echo "[56/93] Creating T056..."
npx tsx src/index.ts task create --title "T056: 在 useProducts Hook 中实现数据转换逻辑 (ChannelProductDTO[] → ProductCard[])" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T056\n阶段: Phase 4: User Story 2 - 浏览商品列表卡片 (Priority: P1)\n用户故事: US2\n可并行: ✗\n完整描述: 在 useProducts Hook 中实现数据转换逻辑 (ChannelProductDTO[] → ProductCard[])"
sleep 0.5

echo "[57/93] Creating T057..."
npx tsx src/index.ts task create --title "T057: 创建错误处理工具 miniapp-ordering-taro/src/utils/error.ts" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T057\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✓\n完整描述: 创建错误处理工具 miniapp-ordering-taro/src/utils/error.ts"
sleep 0.5

echo "[58/93] Creating T058..."
npx tsx src/index.ts task create --title "T058: 在 error.ts 中实现 ApiError 类 (code, message, statusCode, details, isNetworkError, isAuthError, getUserMessage)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T058\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 error.ts 中实现 ApiError 类 (code, message, statusCode, details, isNetworkError, isAuthError, getUserMessage)"
sleep 0.5

echo "[59/93] Creating T059..."
npx tsx src/index.ts task create --title "T059: 在 channelProductService.ts 中增强错误处理 (捕获网络异常、超时、401、500等场景，抛出 ApiError)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T059\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 channelProductService.ts 中增强错误处理 (捕获网络异常、超时、401、500等场景，抛出 ApiError)"
sleep 0.5

echo "[60/93] Creating T060..."
npx tsx src/index.ts task create --title "T060: 在 channelProductService.ts 中实现 Token 过期自动重试逻辑 (401 → 调用 wx.login → 换取Token → 重试请求)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T060\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 channelProductService.ts 中实现 Token 过期自动重试逻辑 (401 → 调用 wx.login → 换取Token → 重试请求)"
sleep 0.5

echo "[61/93] Creating T061..."
npx tsx src/index.ts task create --title "T061: 创建骨架屏组件 miniapp-ordering-taro/src/components/ProductListSkeleton/index.tsx" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T061\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✓\n完整描述: 创建骨架屏组件 miniapp-ordering-taro/src/components/ProductListSkeleton/index.tsx"
sleep 0.5

echo "[62/93] Creating T062..."
npx tsx src/index.ts task create --title "T062: 创建骨架屏样式 miniapp-ordering-taro/src/components/ProductListSkeleton/index.module.scss" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T062\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✓\n完整描述: 创建骨架屏样式 miniapp-ordering-taro/src/components/ProductListSkeleton/index.module.scss"
sleep 0.5

echo "[63/93] Creating T063..."
npx tsx src/index.ts task create --title "T063: 在 ProductListSkeleton/index.tsx 中实现骨架屏组件 (模拟2列商品卡片布局, 灰色占位矩形)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T063\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 ProductListSkeleton/index.tsx 中实现骨架屏组件 (模拟2列商品卡片布局, 灰色占位矩形)"
sleep 0.5

echo "[64/93] Creating T064..."
npx tsx src/index.ts task create --title "T064: 在 ProductListSkeleton/index.module.scss 中实现骨架屏动画 (shimmer 闪烁效果)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T064\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 ProductListSkeleton/index.module.scss 中实现骨架屏动画 (shimmer 闪烁效果)"
sleep 0.5

echo "[65/93] Creating T065..."
npx tsx src/index.ts task create --title "T065: 创建错误提示组件 miniapp-ordering-taro/src/components/ErrorState/index.tsx" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T065\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✓\n完整描述: 创建错误提示组件 miniapp-ordering-taro/src/components/ErrorState/index.tsx"
sleep 0.5

echo "[66/93] Creating T066..."
npx tsx src/index.ts task create --title "T066: 创建错误提示样式 miniapp-ordering-taro/src/components/ErrorState/index.module.scss" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T066\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✓\n完整描述: 创建错误提示样式 miniapp-ordering-taro/src/components/ErrorState/index.module.scss"
sleep 0.5

echo "[67/93] Creating T067..."
npx tsx src/index.ts task create --title "T067: 在 ErrorState/index.tsx 中定义 ErrorStateProps 接口 (error: ApiError, onRetry)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T067\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 ErrorState/index.tsx 中定义 ErrorStateProps 接口 (error: ApiError, onRetry)"
sleep 0.5

echo "[68/93] Creating T068..."
npx tsx src/index.ts task create --title "T068: 在 ErrorState/index.tsx 中实现 ErrorState 组件 (显示错误图标、错误消息、重试按钮)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T068\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 ErrorState/index.tsx 中实现 ErrorState 组件 (显示错误图标、错误消息、重试按钮)"
sleep 0.5

echo "[69/93] Creating T069..."
npx tsx src/index.ts task create --title "T069: 在 ErrorState/index.tsx 中实现不同错误类型的提示文案 (网络错误、认证错误、服务器错误)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T069\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 ErrorState/index.tsx 中实现不同错误类型的提示文案 (网络错误、认证错误、服务器错误)"
sleep 0.5

echo "[70/93] Creating T070..."
npx tsx src/index.ts task create --title "T070: 更新 ProductList 组件，集成 ProductListSkeleton (loading=true 时渲染)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T070\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 更新 ProductList 组件，集成 ProductListSkeleton (loading=true 时渲染)"
sleep 0.5

echo "[71/93] Creating T071..."
npx tsx src/index.ts task create --title "T071: 更新 ProductList 组件，集成 ErrorState (error 存在时渲染，传递 onRetry 回调)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T071\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 更新 ProductList 组件，集成 ErrorState (error 存在时渲染，传递 onRetry 回调)"
sleep 0.5

echo "[72/93] Creating T072..."
npx tsx src/index.ts task create --title "T072: 在 useProducts Hook 中添加重试逻辑 (refetch 方法)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T072\n阶段: Phase 5: User Story 3 - 处理网络异常与加载状态 (Priority: P2)\n用户故事: US3\n可并行: ✗\n完整描述: 在 useProducts Hook 中添加重试逻辑 (refetch 方法)"
sleep 0.5

echo "[73/93] Creating T073..."
npx tsx src/index.ts task create --title "T073: 创建或修改菜单页面 miniapp-ordering-taro/src/pages/menu/index.tsx" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T073\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 创建或修改菜单页面 miniapp-ordering-taro/src/pages/menu/index.tsx"
sleep 0.5

echo "[74/93] Creating T074..."
npx tsx src/index.ts task create --title "T074: 创建或修改菜单页面样式 miniapp-ordering-taro/src/pages/menu/index.module.scss" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T074\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 创建或修改菜单页面样式 miniapp-ordering-taro/src/pages/menu/index.module.scss"
sleep 0.5

echo "[75/93] Creating T075..."
npx tsx src/index.ts task create --title "T075: 在 menu/index.tsx 中导入所有组件 (CategoryTabs, ProductList, ProductCard)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T075\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在 menu/index.tsx 中导入所有组件 (CategoryTabs, ProductList, ProductCard)"
sleep 0.5

echo "[76/93] Creating T076..."
npx tsx src/index.ts task create --title "T076: 在 menu/index.tsx 中集成 useProductListStore (获取 selectedCategory, setSelectedCategory)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T076\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在 menu/index.tsx 中集成 useProductListStore (获取 selectedCategory, setSelectedCategory)"
sleep 0.5

echo "[77/93] Creating T077..."
npx tsx src/index.ts task create --title "T077: 在 menu/index.tsx 中集成 useProducts Hook (传递 selectedCategory)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T077\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在 menu/index.tsx 中集成 useProducts Hook (传递 selectedCategory)"
sleep 0.5

echo "[78/93] Creating T078..."
npx tsx src/index.ts task create --title "T078: 在 menu/index.tsx 中实现分类切换逻辑 (CategoryTabs onCategoryChange → setSelectedCategory)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T078\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在 menu/index.tsx 中实现分类切换逻辑 (CategoryTabs onCategoryChange → setSelectedCategory)"
sleep 0.5

echo "[79/93] Creating T079..."
npx tsx src/index.ts task create --title "T079: 在 menu/index.tsx 中实现商品卡片点击逻辑 (ProductList onProductClick → 跳转详情页占位)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T079\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在 menu/index.tsx 中实现商品卡片点击逻辑 (ProductList onProductClick → 跳转详情页占位)"
sleep 0.5

echo "[80/93] Creating T080..."
npx tsx src/index.ts task create --title "T080: 在 menu/index.tsx 中实现页面初始化逻辑 (默认选中\"全部\"分类)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T080\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在 menu/index.tsx 中实现页面初始化逻辑 (默认选中\"全部\"分类)"
sleep 0.5

echo "[81/93] Creating T081..."
npx tsx src/index.ts task create --title "T081: 在 menu/index.module.scss 中实现页面布局样式 (固定顶部分类栏, 可滚动商品列表)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T081\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在 menu/index.module.scss 中实现页面布局样式 (固定顶部分类栏, 可滚动商品列表)"
sleep 0.5

echo "[82/93] Creating T082..."
npx tsx src/index.ts task create --title "T082: 在 CategoryTabs 组件中实现防抖处理 (使用 useDebouncedCallback, 300ms 延迟)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T082\n阶段: Phase 6: Page Integration & Polish\n可并行: ✓\n完整描述: 在 CategoryTabs 组件中实现防抖处理 (使用 useDebouncedCallback, 300ms 延迟)"
sleep 0.5

echo "[83/93] Creating T083..."
npx tsx src/index.ts task create --title "T083: 在 useProducts Hook 中验证 TanStack Query 缓存配置 (staleTime=5分钟, refetchInterval=1分钟)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T083\n阶段: Phase 6: Page Integration & Polish\n可并行: ✓\n完整描述: 在 useProducts Hook 中验证 TanStack Query 缓存配置 (staleTime=5分钟, refetchInterval=1分钟)"
sleep 0.5

echo "[84/93] Creating T084..."
npx tsx src/index.ts task create --title "T084: 在 ProductCard 组件中验证图片懒加载配置 (Image lazyLoad=true)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T084\n阶段: Phase 6: Page Integration & Polish\n可并行: ✓\n完整描述: 在 ProductCard 组件中验证图片懒加载配置 (Image lazyLoad=true)"
sleep 0.5

echo "[85/93] Creating T085..."
npx tsx src/index.ts task create --title "T085: 优化 ProductList 组件渲染性能 (使用 React.memo 包装 ProductCard)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T085\n阶段: Phase 6: Page Integration & Polish\n可并行: ✓\n完整描述: 优化 ProductList 组件渲染性能 (使用 React.memo 包装 ProductCard)"
sleep 0.5

echo "[86/93] Creating T086..."
npx tsx src/index.ts task create --title "T086: 更新 Taro 路由配置 miniapp-ordering-taro/src/app.config.ts (添加 pages/menu/index 路径)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T086\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 更新 Taro 路由配置 miniapp-ordering-taro/src/app.config.ts (添加 pages/menu/index 路径)"
sleep 0.5

echo "[87/93] Creating T087..."
npx tsx src/index.ts task create --title "T087: 更新微信小程序配置 miniapp-ordering-taro/project.config.json (添加必要的网络请求域名白名单)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T087\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 更新微信小程序配置 miniapp-ordering-taro/project.config.json (添加必要的网络请求域名白名单)"
sleep 0.5

echo "[88/93] Creating T088..."
npx tsx src/index.ts task create --title "T088: 执行 TypeScript 类型检查 (npm run build，确保无类型错误)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T088\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 执行 TypeScript 类型检查 (npm run build，确保无类型错误)"
sleep 0.5

echo "[89/93] Creating T089..."
npx tsx src/index.ts task create --title "T089: 执行 ESLint 检查 (npm run lint，确保代码规范)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T089\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 执行 ESLint 检查 (npm run lint，确保代码规范)"
sleep 0.5

echo "[90/93] Creating T090..."
npx tsx src/index.ts task create --title "T090: 在微信开发者工具中测试 H5 模式 (npm run dev:h5，验证所有功能正常)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T090\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在微信开发者工具中测试 H5 模式 (npm run dev:h5，验证所有功能正常)"
sleep 0.5

echo "[91/93] Creating T091..."
npx tsx src/index.ts task create --title "T091: 在微信开发者工具中测试小程序模式 (npm run dev:weapp，验证所有功能正常)" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T091\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 在微信开发者工具中测试小程序模式 (npm run dev:weapp，验证所有功能正常)"
sleep 0.5

echo "[92/93] Creating T092..."
npx tsx src/index.ts task create --title "T092: 验证性能指标：首屏加载 ≤ 1.5秒，分类切换 ≤ 1秒" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T092\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 验证性能指标：首屏加载 ≤ 1.5秒，分类切换 ≤ 1秒"
sleep 0.5

echo "[93/93] Creating T093..."
npx tsx src/index.ts task create --title "T093: 验证所有代码文件包含 `@spec O007-miniapp-menu-api` 注释" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "任务标识: T093\n阶段: Phase 6: Page Integration & Polish\n可并行: ✗\n完整描述: 验证所有代码文件包含 `@spec O007-miniapp-menu-api` 注释"
sleep 0.5
