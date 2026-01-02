# Implementation Plan: Mini-program Channel Order Management

**Branch**: `O006-miniapp-channel-order` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O006-miniapp-channel-order/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the existing mini-program channel order management prototype (React 19 + Vite web app) into a production-ready Taro 4.1.9 multi-platform application. The implementation will:

- Transform web-based UI prototype to Taro framework supporting WeChat mini-program, Alipay mini-program, and H5 platforms
- Maintain 100% visual fidelity to the original prototype design (≥95% screenshot consistency)
- Integrate with existing O005 channel order API (Spring Boot backend with Supabase)
- Implement lightweight state management using Zustand
- Convert CSS styles to SCSS with px → rpx transformation (rpx = px * 2)
- Preserve prototype reference in `miniapp-ordering/_prototype/` subfolder
- Follow atomic design component architecture for maintainability

## Technical Context

**Language/Version**:
- TypeScript 5.9.3 + Taro 4.1.9 + React (multi-platform mini-program)
- Backend: Java 17 + Spring Boot 3.3.5 (existing O005 API, no changes required)

**Primary Dependencies**:
- Taro 4.1.9 (multi-platform framework)
- React 18.3.1 (UI library, compatible with Taro)
- Zustand 4.5.5 (lightweight state management, consistent with prototype)
- TanStack Query 5.90.12 (server state management, API integration)
- @tarojs/components (cross-platform UI components)
- Taro UI / NutUI (optional UI component library)
- SCSS (styling with rpx units for responsive design)
- Taro.request (network request wrapper)

**Storage**:
- Backend: Supabase (PostgreSQL) via existing O005 Spring Boot API
- Frontend: Taro.setStorageSync() for local persistence (token, cart state)
- Mock data: Not required (uses real O005 API endpoints)

**Testing**:
- Taro 官方测试工具 (unit tests)
- 微信开发者工具 (WeChat mini-program testing)
- H5 浏览器测试 (Chrome DevTools mobile mode)
- Screenshot comparison (UI validation against prototype, ≥95% consistency)

**Target Platform**:
- 微信小程序 (primary platform)
- 支付宝小程序 (secondary platform)
- H5 (mobile web fallback)

**Project Type**:
- Multi-platform C端 client application (Taro framework)
- Implementation location: `miniapp-ordering/` (NOT hall-reserve-taro/)
- Prototype preservation: `miniapp-ordering/_prototype/` (reference only)

**Performance Goals**:
- First screen render: <1.5s
- Main package size: <2MB (WeChat mini-program limit)
- List scrolling FPS: ≥50
- Page transition: <300ms
- Image lazy loading for product lists

**Constraints**:
- **UI Design Fidelity**: Must achieve ≥95% visual consistency with prototype (布局/配色/字体/间距/交互)
- **Implementation Path**: MUST implement in `miniapp-ordering/`, NOT `hall-reserve-taro/`
- **Style Conversion**: CSS → SCSS, px → rpx (formula: rpx = px * 2)
- **Animation Simplification**: Basic transitions only (performance priority)
- **Component Architecture**: Atomic design principles (atoms/molecules/organisms)
- **Code Quality**: @spec O006 annotation required in all files
- **API Integration**: Use existing O005 endpoints, no backend changes

**Scale/Scope**:
- 6 core pages: Product list, Product detail, Cart, Checkout, Order list, Order detail
- 15-20 reusable components (atoms/molecules)
- 3-5 page-level components (organisms)
- Style variable extraction from prototype CSS files
- Multi-platform build configuration (WeChat/Alipay/H5)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: Branch `O006-miniapp-channel-order` matches spec path `specs/O006-miniapp-channel-order/`
- [x] **测试驱动开发**: Unit tests for components, screenshot validation for UI consistency
- [x] **组件化架构**: Atomic design (atoms/molecules/organisms), clear component hierarchy
- [x] **前端技术栈分层**: C端 implementation using Taro 4.1.9 framework (compliant)
- [x] **数据驱动状态管理**: Zustand (client state) + TanStack Query (server state)
- [x] **代码质量工程化**: TypeScript strict mode, ESLint, @spec O006 annotations, screenshot validation
- [x] **后端技术栈约束**: Uses existing O005 Spring Boot + Supabase API, no backend changes required

### 性能与标准检查：
- [x] **性能标准**: First screen <1.5s, page transition <300ms, lazy loading for lists
- [x] **安全标准**: Input validation via Zod, XSS prevention, token-based auth (if needed)
- [x] **可访问性标准**: WeChat/Alipay mini-program accessibility guidelines (native platform support)

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
miniapp-ordering/                    # ⚠️ IMPLEMENTATION LOCATION (NOT hall-reserve-taro/)
├── _prototype/                      # Reference prototype (moved from root)
│   ├── src/                        # Original React web app code
│   ├── index.html
│   └── package.json
├── src/                            # Taro application source
│   ├── components/                 # Reusable UI components (Atomic Design)
│   │   ├── atoms/                 # Basic UI elements
│   │   │   ├── Button/            # Custom button component
│   │   │   ├── Input/             # Form input component
│   │   │   ├── Image/             # Lazy-loaded image
│   │   │   └── Price/             # Price display component
│   │   ├── molecules/             # Component combinations
│   │   │   ├── ProductCard/       # Product card for lists
│   │   │   ├── CartItem/          # Shopping cart item
│   │   │   └── OrderItem/         # Order history item
│   │   └── organisms/             # Complex components
│   │       ├── ProductList/       # Product grid/list view
│   │       ├── CartSummary/       # Cart total calculation
│   │       └── OrderTimeline/     # Order status flow
│   ├── pages/                     # Page-level components (Taro routes)
│   │   ├── index/                 # Product list page
│   │   ├── detail/                # Product detail page
│   │   ├── cart/                  # Shopping cart page
│   │   ├── checkout/              # Checkout page
│   │   ├── orders/                # Order list page
│   │   └── order-detail/          # Order detail page
│   ├── services/                  # API integration
│   │   ├── api.ts                # Taro.request wrapper
│   │   ├── product.ts            # Product API calls
│   │   ├── cart.ts               # Cart API calls
│   │   └── order.ts              # Order API calls
│   ├── stores/                    # Zustand stores
│   │   ├── cart.ts               # Cart state management
│   │   ├── user.ts               # User session state
│   │   └── ui.ts                 # UI state (loading, modals)
│   ├── hooks/                     # Custom React hooks
│   │   ├── useProducts.ts        # Product data queries
│   │   ├── useCart.ts            # Cart operations
│   │   └── useOrders.ts          # Order queries
│   ├── styles/                    # Global styles
│   │   ├── variables.scss        # Extracted from prototype CSS
│   │   ├── mixins.scss           # Reusable SCSS mixins
│   │   └── theme.scss            # Color/typography theme
│   ├── types/                     # TypeScript type definitions
│   │   ├── product.ts            # Product data types
│   │   ├── cart.ts               # Cart data types
│   │   └── order.ts              # Order data types
│   ├── utils/                     # Utility functions
│   │   ├── format.ts             # Price/date formatting
│   │   ├── validator.ts          # Form validation (Zod)
│   │   └── storage.ts            # Taro.setStorage wrapper
│   ├── constants/                 # Application constants
│   │   ├── api.ts                # API endpoints
│   │   └── config.ts             # App configuration
│   ├── assets/                    # Static assets
│   │   ├── images/               # Image resources
│   │   └── icons/                # Icon resources
│   └── app.config.ts             # Taro app configuration
├── config/                        # Build configuration
│   ├── index.ts                  # Main Taro config
│   ├── dev.ts                    # Development config
│   └── prod.ts                   # Production config
├── project.config.json            # WeChat mini-program config
├── project.alipay.json            # Alipay mini-program config
├── package.json
└── tsconfig.json

specs/O006-miniapp-channel-order/   # Feature specifications
├── spec.md                         # Feature specification
├── plan.md                         # Implementation plan (this file)
├── research.md                     # Research findings (Phase 0 output)
├── data-model.md                   # Data model design (Phase 1 output)
├── quickstart.md                   # Development quickstart (Phase 1 output)
└── contracts/                      # API contracts (Phase 1 output)
    └── api.yaml                    # OpenAPI spec (reuses O005 endpoints)
```

**Structure Decision**: Multi-platform mini-program using Taro 4.1.9 framework with atomic design component architecture. Implementation location is `miniapp-ordering/` directory with prototype preserved in `_prototype/` subfolder. All styling extracted from prototype CSS and converted to SCSS with rpx units for responsive design.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All constitution checks passed. This implementation:
- Uses standard Taro 4.1.9 framework (C端 requirement)
- Follows atomic design component architecture
- Reuses existing O005 API without backend changes
- Maintains UI design fidelity as core requirement (not complexity)
- Employs Zustand + TanStack Query for state management (standard pattern)
