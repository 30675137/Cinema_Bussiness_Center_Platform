# Tasks: 小程序渠道商品订单适配

**Input**: Design documents from `/specs/O006-miniapp-channel-order/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

**Tests**: Tests are NOT explicitly requested in the specification - focus on implementation only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This project uses Taro multi-platform structure:
- **Implementation location**: `miniapp-ordering/` (NOT hall-reserve-taro/)
- **Prototype reference**: `miniapp-ordering/_prototype/` (preserved for UI reference)
- **Source code**: `miniapp-ordering/src/`
- **Configuration**: `miniapp-ordering/config/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Taro project initialization and prototype preservation

- [ ] T001 Preserve existing prototype: Move miniapp-ordering/ React web app code to miniapp-ordering/_prototype/ subdirectory
- [ ] T002 Create prototype screenshots: Save screenshots of key pages (product list/detail/cart/orders) to miniapp-ordering/_prototype/screenshots/ for UI validation
- [ ] T003 Initialize Taro 4.1.9 project in miniapp-ordering/ with TypeScript, React 18.3.1, Zustand 4.5.5, TanStack Query 5.90.12
- [ ] T004 [P] Configure Taro build for multi-platform (WeChat mini-program, Alipay mini-program, H5) in miniapp-ordering/config/index.ts
- [ ] T005 [P] Setup TypeScript strict mode configuration in miniapp-ordering/tsconfig.json
- [ ] T006 [P] Configure ESLint and Prettier for code quality in miniapp-ordering/.eslintrc.js and miniapp-ordering/.prettierrc
- [ ] T007 [P] Create project structure: src/components/, src/pages/, src/services/, src/stores/, src/types/, src/utils/, src/styles/, src/hooks/, src/constants/, src/assets/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Style System (from prototype extraction)

- [ ] T008 Extract style variables from prototype CSS: Create miniapp-ordering/src/styles/variables.scss with colors, fonts, spacing, border-radius, shadows (convert px to rpx: rpx = px * 2)
- [ ] T009 [P] Create SCSS mixins for reusable styles in miniapp-ordering/src/styles/mixins.scss (card, button, shadow effects)
- [ ] T010 [P] Create theme configuration in miniapp-ordering/src/styles/theme.scss

### Assets Migration

- [ ] T011 [P] Copy image resources from prototype to miniapp-ordering/src/assets/images/ (organize into icons/, placeholders/, categories/, orders/ subdirectories)
- [ ] T012 [P] Create default product placeholder image in miniapp-ordering/src/assets/images/placeholders/product.png

### Type Definitions (from data-model.md)

- [ ] T013 [P] Define channel product types in miniapp-ordering/src/types/channelProduct.ts (ChannelProductDTO, ChannelCategory enum, ProductStatus enum, StockStatus enum)
- [ ] T014 [P] Define product spec types in miniapp-ordering/src/types/channelProduct.ts (ChannelProductSpecDTO, SpecType enum with 7 types, SpecOptionDTO, SelectedSpec)
- [ ] T015 [P] Define cart types in miniapp-ordering/src/types/cart.ts (CartItem, CartStore interface)
- [ ] T016 [P] Define order types in miniapp-ordering/src/types/order.ts (ChannelProductOrderDTO, OrderStatus enum, PaymentStatus enum, OrderItemDTO, CreateChannelProductOrderRequest)

### Core Utilities

- [ ] T017 [P] Implement Taro.request wrapper with auth token injection in miniapp-ordering/src/utils/request.ts
- [ ] T018 [P] Implement price calculation utility in miniapp-ordering/src/utils/priceCalculator.ts (calculateUnitPrice function)
- [ ] T019 [P] Implement required specs validation utility in miniapp-ordering/src/utils/specValidator.ts (validateRequiredSpecs function)
- [ ] T020 [P] Create format utilities (price, date) in miniapp-ordering/src/utils/format.ts
- [ ] T021 [P] Create storage utilities (Taro.setStorageSync wrapper) in miniapp-ordering/src/utils/storage.ts

### API Services (base layer)

- [ ] T022 [P] Implement channel product API service in miniapp-ordering/src/services/channelProductService.ts (fetchChannelProducts, fetchChannelProductDetail, fetchChannelProductSpecs)
- [ ] T023 [P] Implement order API service in miniapp-ordering/src/services/orderService.ts (createChannelProductOrder, fetchMyOrders, fetchOrderDetail)

### State Management Stores

- [ ] T024 [P] Implement cart store with Zustand in miniapp-ordering/src/stores/cartStore.ts (items, addItem, updateQuantity, removeItem, clearCart, totalQuantity, totalPrice)
- [ ] T025 [P] Implement product store (optional) in miniapp-ordering/src/stores/productStore.ts (selectedCategory, currentProduct)

### TanStack Query Hooks

- [ ] T026 [P] Create useChannelProducts hook in miniapp-ordering/src/hooks/useChannelProducts.ts
- [ ] T027 [P] Create useChannelProductDetail hook in miniapp-ordering/src/hooks/useChannelProductDetail.ts
- [ ] T028 [P] Create useChannelProductSpecs hook in miniapp-ordering/src/hooks/useChannelProductSpecs.ts
- [ ] T029 [P] Create useCreateOrder mutation hook in miniapp-ordering/src/hooks/useCreateOrder.ts
- [ ] T030 [P] Create useMyOrders hook in miniapp-ordering/src/hooks/useMyOrders.ts

### Atomic Design Components (Atoms)

- [ ] T031 [P] Create Button atom component in miniapp-ordering/src/components/atoms/Button/ (match prototype button styles)
- [ ] T032 [P] Create Image atom component with lazy loading in miniapp-ordering/src/components/atoms/Image/
- [ ] T033 [P] Create Price atom component in miniapp-ordering/src/components/atoms/Price/
- [ ] T034 [P] Create Loading atom component in miniapp-ordering/src/components/atoms/Loading/
- [ ] T035 [P] Create EmptyState atom component in miniapp-ordering/src/components/atoms/EmptyState/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 浏览渠道商品菜单 (Priority: P1) 🎯 MVP

**Goal**: User can browse all available products (alcohol/coffee/beverage/snack/meal) from channel product configuration, filter by category, and view product lists

**Why this priority**: This is the entry point of the order flow, users must be able to browse products to place orders. Equivalent to O003 beverage menu functionality, it's a core MVP capability.

**Independent Test**: User opens mini-program "Order Menu" tab → Views product list (grouped by category) → Clicks category tab to filter → Verifies correct products displayed

### Implementation for User Story 1

- [ ] T036 [P] [US1] Create CategoryTabs molecule component in miniapp-ordering/src/components/molecules/CategoryTabs/ (6 categories: ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER, match prototype tab design)
- [ ] T037 [P] [US1] Create ProductCard molecule component in miniapp-ordering/src/components/molecules/ProductCard/ (display image, name, price, recommended tag, match prototype card style)
- [ ] T038 [US1] Create ProductList organism component in miniapp-ordering/src/components/organisms/ProductList/ (grid/list layout, empty state handling)
- [ ] T039 [US1] Implement product menu page in miniapp-ordering/src/pages/index/index.tsx (integrate CategoryTabs, ProductList, useChannelProducts hook, handle loading/error states)
- [ ] T040 [US1] Style product menu page in miniapp-ordering/src/pages/index/index.scss (100% match prototype menu list page layout using extracted style variables)
- [ ] T041 [US1] Configure product menu page routing in miniapp-ordering/src/app.config.ts
- [ ] T042 [US1] Add image placeholder fallback for failed product images
- [ ] T043 [US1] Add pull-to-refresh functionality for product list

**Checkpoint**: At this point, User Story 1 should be fully functional - users can browse and filter products

---

## Phase 4: User Story 2 - 查看商品详情并选择规格 (Priority: P1)

**Goal**: User can click product to view details, select specs (size/temperature/sweetness/topping/spiciness/side/cooking), system auto-calculates final price including spec adjustments

**Why this priority**: Spec selection is critical for order accuracy, users need to see real-time price calculation. Equivalent to O003 spec selection functionality.

**Independent Test**: User clicks product → Views detail page → Selects multiple specs → Verifies price calculation correct → Adds to cart

### Implementation for User Story 2

- [ ] T044 [P] [US2] Create SpecSelector molecule component in miniapp-ordering/src/components/molecules/SpecSelector/ (support 7 spec types, single/multi-select, required/optional, match prototype spec selector UI)
- [ ] T045 [P] [US2] Create PriceDisplay molecule component in miniapp-ordering/src/components/molecules/PriceDisplay/ (show base price, spec adjustments, final price with real-time update)
- [ ] T046 [P] [US2] Create ProductImageGallery molecule component in miniapp-ordering/src/components/molecules/ProductImageGallery/ (main image + detail images carousel)
- [ ] T047 [US2] Implement product detail page in miniapp-ordering/src/pages/detail/index.tsx (load product detail, load specs, manage selected specs state, validate required specs, integrate with cart store)
- [ ] T048 [US2] Style product detail page in miniapp-ordering/src/pages/detail/index.scss (100% match prototype product detail page layout)
- [ ] T049 [US2] Configure product detail page routing with id parameter in miniapp-ordering/src/app.config.ts
- [ ] T050 [US2] Implement "Add to Cart" button with required spec validation (disable if required specs not selected, show toast on successful add)
- [ ] T051 [US2] Add real-time price calculation when specs change (use calculateUnitPrice utility)
- [ ] T052 [US2] Handle stock status display (IN_STOCK, LOW_STOCK, OUT_OF_STOCK) with visual indicators

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can browse products and select specs

---

## Phase 5: User Story 3 - 购物车管理与订单提交 (Priority: P1)

**Goal**: User can add products to cart, modify quantity, submit order and pay, complete the entire order flow

**Why this priority**: This is the core of the order flow, equivalent to O003 order submission functionality, it's the key to business closure

**Independent Test**: User selects product → Adds to cart → Modifies quantity → Submits order → Mock payment → Views order confirmation

### Implementation for User Story 3

- [ ] T053 [P] [US3] Create CartItem molecule component in miniapp-ordering/src/components/molecules/CartItem/ (display product name/specs/price/quantity, quantity stepper, delete button)
- [ ] T054 [P] [US3] Create CartSummary organism component in miniapp-ordering/src/components/organisms/CartSummary/ (items list, total quantity, total price, submit button)
- [ ] T055 [P] [US3] Create CartButton molecule component in miniapp-ordering/src/components/molecules/CartButton/ (floating button with quantity badge, match prototype cart icon)
- [ ] T056 [US3] Implement cart drawer/page in miniapp-ordering/src/pages/cart/index.tsx (display CartSummary, handle empty cart state, submit order flow)
- [ ] T057 [US3] Style cart page in miniapp-ordering/src/pages/cart/index.scss (100% match prototype cart drawer layout)
- [ ] T058 [US3] Configure cart page routing in miniapp-ordering/src/app.config.ts
- [ ] T059 [US3] Implement quantity update logic (increment, decrement, remove when quantity = 0)
- [ ] T060 [US3] Implement cart total calculation (sum of all item subtotals)
- [ ] T061 [US3] Implement order submission: Create CreateChannelProductOrderRequest from cart items, call createChannelProductOrder API, handle loading state
- [ ] T062 [US3] Implement Mock payment flow (auto-success on click, show toast "Payment Successful")
- [ ] T063 [US3] Implement order confirmation page in miniapp-ordering/src/pages/order-confirmation/index.tsx (display order number, queue number, estimated time, order status)
- [ ] T064 [US3] Style order confirmation page in miniapp-ordering/src/pages/order-confirmation/index.scss
- [ ] T065 [US3] Clear cart after successful order submission
- [ ] T066 [US3] Handle order submission errors (show error message, preserve cart data)
- [ ] T067 [US3] Add duplicate order prevention (button debounce, disable after first click)

**Checkpoint**: All core order flow should now be functional - users can complete end-to-end ordering

---

## Phase 6: User Story 4 - 订单状态查询与取餐 (Priority: P1)

**Goal**: User can view order status (pending/preparing/completed), receive pickup notification, and view order history

**Why this priority**: Users need to know order progress in real-time and pickup timely, equivalent to O003 order status query functionality

**Independent Test**: User submits order → Views "My Orders" page → Verifies status updates → Receives pickup notification → Views order history

### Implementation for User Story 4

- [ ] T068 [P] [US4] Create OrderItem molecule component in miniapp-ordering/src/components/molecules/OrderItem/ (display order number, time, products, total price, status badge)
- [ ] T069 [P] [US4] Create OrderStatusBadge atom component in miniapp-ordering/src/components/atoms/OrderStatusBadge/ (different colors for different statuses)
- [ ] T070 [P] [US4] Create OrderTimeline organism component in miniapp-ordering/src/components/organisms/OrderTimeline/ (visual timeline for order status flow)
- [ ] T071 [US4] Implement order list page in miniapp-ordering/src/pages/orders/index.tsx (load my orders with useMyOrders hook, display order list sorted by time, support pull-to-refresh)
- [ ] T072 [US4] Style order list page in miniapp-ordering/src/pages/orders/index.scss (100% match prototype order list layout)
- [ ] T073 [US4] Configure order list page routing in miniapp-ordering/src/app.config.ts
- [ ] T074 [US4] Implement order detail page in miniapp-ordering/src/pages/order-detail/index.tsx (load order detail, display full order info with OrderTimeline)
- [ ] T075 [US4] Style order detail page in miniapp-ordering/src/pages/order-detail/index.scss
- [ ] T076 [US4] Configure order detail page routing with id parameter in miniapp-ordering/src/app.config.ts
- [ ] T077 [US4] Implement order status polling (every 5-10 seconds, update UI when status changes, delay ≤5 seconds)
- [ ] T078 [US4] Implement pickup notification (mini-program push notification when order status changes to COMPLETED)
- [ ] T079 [US4] Implement "Order Again" feature (click to auto-fill same products and specs into cart)
- [ ] T080 [US4] Add empty state for order list (show "No orders yet" when list is empty)
- [ ] T081 [US4] Add order status filter (optional: filter by PENDING_PREPARE, PREPARING, COMPLETED)

**Checkpoint**: All user stories should now be independently functional - complete ordering system is operational

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, edge case handling, production readiness

### Edge Case Handling

- [ ] T082 [P] Handle disabled SKU scenario (hide products when associated SKU is disabled)
- [ ] T083 [P] Handle price/spec changes (historical orders preserve snapshot data, new orders use new prices)
- [ ] T084 [P] Implement offline mode (show cached product list, display "Network disconnected" toast, block order submission)
- [ ] T085 [P] Implement API timeout retry (auto-retry 3 times on timeout, show "Load failed, please retry" after final failure)
- [ ] T086 [P] Handle empty cart submission (disable submit button when cart is empty, show toast on click)
- [ ] T087 [P] Handle payment interruption (mark order as PENDING_PAYMENT if user exits, allow re-payment from order list)
- [ ] T088 [P] Handle spec conflicts (same product with different specs as separate cart items)

### Error Handling & Logging

- [ ] T089 [P] Add error boundary components for page-level error catching
- [ ] T090 [P] Implement global error handler for API failures
- [ ] T091 [P] Add operation logging (cart operations, order submission, payment, status changes)

### Performance Optimization

- [ ] T092 [P] Implement image lazy loading for product lists
- [ ] T093 [P] Add product list virtual scrolling if needed (for long lists)
- [ ] T094 [P] Optimize bundle size (analyze with Taro build analyzer, code splitting if needed)
- [ ] T095 [P] Add loading skeletons for better perceived performance

### Platform-Specific Features

- [ ] T096 [P] Configure WeChat mini-program project settings in miniapp-ordering/project.config.json
- [ ] T097 [P] Configure Alipay mini-program project settings in miniapp-ordering/project.alipay.json
- [ ] T098 [P] Add platform-specific conditional logic (payment, sharing, etc.) using process.env.TARO_ENV
- [ ] T099 [P] Test WeChat mini-program in WeChat DevTools
- [ ] T100 [P] Test H5 version in browsers (Chrome, Safari mobile)

### UI Validation

- [ ] T101 Compare product list page screenshot with prototype (≥95% visual consistency)
- [ ] T102 Compare product detail page screenshot with prototype (≥95% visual consistency)
- [ ] T103 Compare cart page screenshot with prototype (≥95% visual consistency)
- [ ] T104 Compare order list page screenshot with prototype (≥95% visual consistency)

### Documentation & Build

- [ ] T105 [P] Update quickstart.md with final setup instructions
- [ ] T106 [P] Create build scripts for production in package.json (build:weapp, build:h5, build:alipay)
- [ ] T107 [P] Run ESLint and fix all warnings
- [ ] T108 [P] Run code formatter (Prettier) on all files
- [ ] T109 Verify all files have @spec O006 annotations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1: Can start after Foundational - No dependencies on other stories
  - User Story 2: Can start after Foundational - No dependencies on other stories (can run parallel with US1)
  - User Story 3: Can start after Foundational - No dependencies on other stories (can run parallel with US1/US2)
  - User Story 4: Can start after Foundational - No dependencies on other stories (can run parallel with US1/US2/US3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Browse and filter products
- **User Story 2 (P1)**: Independent - View details and select specs
- **User Story 3 (P1)**: Uses cart store from Foundational, but independently testable
- **User Story 4 (P1)**: Uses order API from Foundational, but independently testable

### Within Each User Story

- Components before pages
- Molecules/atoms can be built in parallel
- Pages depend on components
- Styling after page structure
- Error handling after core implementation
- Story complete before moving to next priority

### Parallel Opportunities

#### Phase 1 - All tasks can run in parallel except T001-T002 (sequential)

#### Phase 2 - Major parallel groups:
- **Style System** (T008-T010): 3 tasks in parallel
- **Assets Migration** (T011-T012): 2 tasks in parallel
- **Type Definitions** (T013-T016): 4 tasks in parallel
- **Core Utilities** (T017-T021): 5 tasks in parallel
- **API Services** (T022-T023): 2 tasks in parallel
- **State Stores** (T024-T025): 2 tasks in parallel
- **TanStack Hooks** (T026-T030): 5 tasks in parallel
- **Atomic Components** (T031-T035): 5 tasks in parallel

#### Phase 3 (User Story 1) - Parallel groups:
- **Components** (T036-T038): CategoryTabs and ProductCard in parallel
- **Page Implementation** (T039-T043): After components

#### Phase 4 (User Story 2) - Parallel groups:
- **Components** (T044-T046): SpecSelector, PriceDisplay, ProductImageGallery in parallel
- **Page Implementation** (T047-T052): After components

#### Phase 5 (User Story 3) - Parallel groups:
- **Components** (T053-T055): CartItem, CartSummary, CartButton in parallel
- **Page Implementation** (T056-T067): After components

#### Phase 6 (User Story 4) - Parallel groups:
- **Components** (T068-T070): OrderItem, OrderStatusBadge, OrderTimeline in parallel
- **Page Implementation** (T071-T081): After components

#### Phase 7 - All tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all molecule components for User Story 1 together:
Task T036: "Create CategoryTabs molecule component"
Task T037: "Create ProductCard molecule component"

# After components ready, implement page:
Task T039: "Implement product menu page in miniapp-ordering/src/pages/index/index.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T035) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T036-T043)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational (T001-T035) → Foundation ready
2. Add User Story 1 (T036-T043) → Test independently → Deploy/Demo (MVP: Browse products!)
3. Add User Story 2 (T044-T052) → Test independently → Deploy/Demo (Can select specs!)
4. Add User Story 3 (T053-T067) → Test independently → Deploy/Demo (Can place orders!)
5. Add User Story 4 (T068-T081) → Test independently → Deploy/Demo (Can track orders!)
6. Add Polish (T082-T109) → Production ready
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T035)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (T036-T043) - Product browsing
   - Developer B: User Story 2 (T044-T052) - Product details and specs
   - Developer C: User Story 3 (T053-T067) - Cart and order submission
   - Developer D: User Story 4 (T068-T081) - Order tracking
3. Stories complete and integrate independently
4. **Team completes Polish together** (T082-T109)

---

## Task Summary

**Total Tasks**: 109 tasks

**Task Count by Phase**:
- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundational): 28 tasks (CRITICAL PATH)
- Phase 3 (User Story 1): 8 tasks
- Phase 4 (User Story 2): 9 tasks
- Phase 5 (User Story 3): 15 tasks
- Phase 6 (User Story 4): 14 tasks
- Phase 7 (Polish): 28 tasks

**Parallel Opportunities Identified**: 50+ tasks can run in parallel within their phases

**Independent Test Criteria**:
- **US1**: Browse and filter products by category
- **US2**: View product details, select specs, see price calculation
- **US3**: Add to cart, modify quantity, submit order, mock payment
- **US4**: View order list, track order status, receive notifications

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 43 tasks

**UI Validation**: Screenshot comparison for 4 key pages (≥95% consistency with prototype)

---

## Notes

- **[P]** tasks = different files, no dependencies, can run in parallel
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **CRITICAL**: All business logic files MUST include `@spec O006-miniapp-channel-order` annotation
- **UI Fidelity**: Every page must achieve ≥95% visual consistency with prototype screenshots
- **Multi-platform**: Test on WeChat mini-program, Alipay mini-program, and H5
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
