# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cinema Business Center Platform** (影院商品管理中台) - A full-stack cinema business management system with:
- **B端 (Admin)**: React 19 + Ant Design management dashboard
- **C端 (User)**: Taro 4.1.9 multi-platform app (WeChat mini-program + H5)
- **Backend**: Spring Boot 3.3.5 + Supabase (PostgreSQL)

## Project Structure

```
Cinema_Bussiness_Center_Platform/
├── frontend/              # B端 React Admin Dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI components (32 directories)
│   │   ├── features/      # Feature modules (beverage-order-management, etc.)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── stores/        # Zustand state management
│   │   ├── types/         # TypeScript type definitions
│   │   └── mocks/         # MSW mock handlers and data
│   └── tests/e2e/         # Playwright E2E tests
│
├── hall-reserve-taro/     # C端 Taro Multi-platform App
│   ├── src/
│   │   ├── pages/         # 14 Taro pages
│   │   ├── components/    # 11 reusable components
│   │   ├── services/      # API calls
│   │   └── stores/        # Zustand state management
│   └── config/            # Taro build configuration
│
├── backend/               # Spring Boot Backend (Java 17)
│   ├── src/main/java/com/cinema/
│   │   ├── beverage/      # Beverage order module (@spec O003-beverage-order)
│   │   ├── inventory/     # Inventory management
│   │   ├── hallstore/     # Hall/Store management
│   │   ├── order/         # Order processing
│   │   └── common/        # Common utilities
│   └── src/main/resources/
│       └── application.yml
│
├── specs/                 # Feature specifications (49 specs)
│   └── <specId>-<slug>/
│       ├── spec.md        # Feature specification
│       ├── plan.md        # Implementation plan
│       ├── tasks.md       # Task breakdown
│       └── contracts/
│           └── api.yaml   # OpenAPI 3.0 spec
│
├── .claude/               # Claude Code configuration
│   ├── rules/             # 9 project rules (see below)
│   └── skills/            # 14 custom skills
│
└── scenarios/             # E2E test scenarios (YAML format)
```

## Development Commands

### Full Stack Development

```bash
# Terminal 1: Backend (Spring Boot)
cd backend
./mvnw spring-boot:run                # Starts on http://localhost:8080

# Terminal 2: Frontend B端 (React Admin)
cd frontend
npm install
npm run dev                           # Starts on http://localhost:3000
                                     # Proxies /api to http://localhost:8080

# Terminal 3: Frontend C端 (Taro App)
cd hall-reserve-taro
npm install
npm run dev:h5                       # H5 development on http://localhost:10086
npm run dev:weapp                    # WeChat mini-program development
```

### Backend Commands (Maven)

```bash
cd backend

# Build
./mvnw clean install                 # Clean build and install
./mvnw clean package                 # Package to JAR

# Run
./mvnw spring-boot:run              # Start development server

# Test
./mvnw test                         # Run all tests
./mvnw test -Dtest=ClassName        # Run specific test class

# Format & Lint
./mvnw spotless:apply               # Format Java code (if configured)

# Database Migrations (Flyway) - @spec T003-flyway-migration
./mvnw flyway:info                  # View migration status
./mvnw flyway:migrate               # Execute pending migrations
./mvnw flyway:validate              # Validate migration scripts
./mvnw flyway:repair                # Repair schema history table
```

### Frontend B端 Commands (React)

```bash
cd frontend

# Development
npm run dev                         # Vite dev server (port 3000)
npm run build                       # TypeScript compilation + Vite build
npm run preview                     # Preview production build

# Testing
npm run test:unit                   # Vitest unit tests
npm run test:unit:ui                # Vitest UI mode
npm run test:e2e                    # Playwright E2E tests
npm run test:e2e:ui                 # Playwright UI mode
npm run test:coverage               # Coverage report

# Code Quality
npm run lint                        # ESLint check
npm run lint:fix                    # Auto-fix ESLint issues
npm run format                      # Prettier format
npm run format:check                # Check formatting

# Mock Setup
npm run mock:init                   # Initialize MSW (first time only)
```

### Frontend C端 Commands (Taro)

```bash
cd hall-reserve-taro

# Development
npm run dev:h5                      # H5 mode (http://localhost:10086)
npm run dev:weapp                   # WeChat mini-program (use WeChat DevTools)

# Build
npm run build:h5                    # Build for H5
npm run build:weapp                 # Build for WeChat mini-program

# Testing
npm run test                        # Run Vitest tests
npm run test:ui                     # Vitest UI mode
npm run test:coverage               # Coverage report
```

### Root Level Commands

```bash
# From repository root
npm run dev                         # Vite dev server (legacy, same as frontend)
npm run test                        # Run all Vitest tests
npm run test:e2e                    # Run Playwright E2E tests
npm run lint                        # ESLint check
npm run lint:fix                    # Auto-fix linting
```

## Technology Stack

### Frontend B端 (Admin Dashboard)
- **React** 19.2.0 - UI framework
- **TypeScript** 5.9.3 - Type safety
- **Vite** 7.2.4 - Build tool
- **Ant Design** 6.1.0 - UI component library
- **Zustand** 5.0.9 - Client state management
- **TanStack Query** 5.90.12 - Server state management
- **React Router** 7.10.1 - Routing
- **React Hook Form** 7.68.0 + Zod 4.1.13 - Form handling & validation
- **MSW** 2.12.4 - API mocking
- **Vitest** 4.0.15 - Unit testing
- **Playwright** 1.57.0 - E2E testing

### Frontend C端 (User App)
- **Taro** 4.1.9 - Multi-platform framework
- **React** 18.3.1 - UI framework
- **TypeScript** 5.4.0 - Type safety
- **Zustand** 4.5.5 - State management
- **TanStack Query** 5.90.12 - Data fetching

### Backend
- **Java** 17 - Runtime
- **Spring Boot** 3.3.5 - Application framework
- **Supabase** - Database/Auth/Storage (PostgreSQL 14+)
- **Maven** - Build tool
- **Spring Data JPA** - ORM
- **Spring Security** - Authentication
- **Caffeine** - Caching
- **Apache POI** 5.2.5 - Excel reports

## Architecture Patterns

### State Management Strategy
- **Client State** (UI, modals, drafts): Zustand
- **Server State** (API data, caching): TanStack Query
- **Persistence**:
  - B端: `localStorage`
  - C端: `Taro.setStorageSync()`

### API Proxy Configuration
Frontend dev server proxies `/api` to backend:
```typescript
// frontend/vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

### Component Architecture (B端)
Follows atomic design:
- **Atoms**: Button, Input, Icon
- **Molecules**: SearchBar, FormField
- **Organisms**: Header, Sidebar, Table
- **Templates**: PageLayout
- **Pages**: Feature pages

### Backend Architecture
- **Controller Layer**: REST API endpoints
- **Service Layer**: Business logic
- **Repository Layer**: Data access (JPA)
- **DTO Layer**: Data transfer objects
- **Entity Layer**: JPA entities

## Project Rules & Standards

The project follows 9 strict rules defined in `.claude/rules/`:

1. **Branch-Spec Binding** (`01-branch-spec-binding.md`):
   - Branch format: `feat/<specId>-<slug>` (e.g., `feat/O003-beverage-order`)
   - Spec location: `specs/<specId>-<slug>/spec.md`
   - Active spec: `.specify/active_spec.txt`
   - **Module prefixes**: S (Store), P (Product), B (Brand), A (Activity), U (User), O (Order), T (Tool), F (Frontend)

2. **Test-Driven Development** (`02-test-driven-development.md`):
   - **Red-Green-Refactor** cycle is mandatory
   - Coverage requirements:
     - Critical business logic: **100%**
     - Utilities: ≥80%
     - Components: ≥70%
   - E2E tests (Playwright): Optional, use for critical flows

3. **Frontend B端 Tech Stack** (`03-frontend-b-tech-stack.md`):
   - Must use: React 19 + Ant Design 6 + Zustand + TanStack Query
   - Prohibited: Non-Ant Design UI libraries, direct DOM manipulation

4. **Frontend C端 Tech Stack** (`04-frontend-c-tech-stack.md`):
   - **All C端 features must use Taro framework**
   - Multi-platform support: WeChat mini-program + H5 (minimum)
   - Prohibited: Ant Design, browser APIs without platform checks

5. **State Management** (`05-state-management.md`):
   - Client state: Zustand stores
   - Server state: TanStack Query (mandatory for API calls)
   - Prohibited: Direct API calls in components, Redux (unless complex C端)

6. **Code Quality** (`06-code-quality.md`):
   - **@spec annotation required** in all business logic files:
     ```typescript
     /** @spec O003-beverage-order */
     export const OrderList = () => { ... }
     ```
   - TypeScript strict mode: `"strict": true`
   - No `any` types (document exceptions)
   - ESLint + Prettier enforcement
   - Git commit format: Conventional Commits

7. **Backend Architecture** (`07-backend-architecture.md`):
   - **Supabase is the single source of truth** for all data
   - Java 21 features preferred (currently Java 17)
   - Timeout control: 30 seconds for Supabase calls
   - Prohibited: Additional database access bypassing Supabase

8. **API Standards** (`08-api-standards.md`):
   - **Unified response format**:
     ```json
     {
       "success": true,
       "data": { ... },
       "timestamp": "2025-12-30T10:00:00Z"
     }
     ```
   - **Error numbering**: `<MODULE>_<CATEGORY>_<SEQUENCE>` (e.g., `INV_NTF_001`)
   - HTTP status codes: 200 (success), 201 (created), 400 (validation), 404 (not found), 500 (error)

9. **Quality Standards** (`09-quality-standards.md`):
   - Performance: API P95 ≤ 1s, page switch ≤ 500ms
   - Security: Zod validation, JWT auth, HTTPS (production)
   - Accessibility: WCAG 2.1 AA level

## Spec-Driven Development Workflow

Every feature has a unique `specId` (e.g., `O003-beverage-order`):

```
specs/O003-beverage-order/
├── spec.md                 # Functional requirements
├── plan.md                 # Implementation plan
├── tasks.md                # Task breakdown
└── contracts/
    └── api.yaml            # OpenAPI 3.0 specification
```

**Current Active Spec**: Check `.specify/active_spec.txt`

**Spec ID Prefixes**:
- **S###**: Store/Hall management
- **P###**: Product/Inventory
- **B###**: Brand/Category
- **A###**: Activity/Scenario package
- **U###**: User/Reservation
- **O###**: Order (beverage orders)
- **T###**: Tools/Infrastructure
- **F###**: Frontend infrastructure

## Testing Strategy

### Unit Tests (Vitest)
```bash
# Frontend B端
cd frontend && npm run test:unit

# Frontend C端
cd hall-reserve-taro && npm run test

# Backend
cd backend && ./mvnw test
```

Coverage thresholds defined in `vitest.config.ts`:
- Branches: 60-80%
- Functions: 60-80%
- Lines: 60-80%
- Statements: 60-80%

### E2E Tests (Playwright)
```bash
cd frontend

npm run test:e2e              # Headless mode
npm run test:e2e:ui           # UI mode
npm run test:headed           # Headed browser
npm run test:debug            # Debug mode
```

Test browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

### Integration Tests (MSW)
Mock Service Worker provides realistic API mocking:
```bash
cd frontend
npm run mock:init             # First-time setup
npm run dev                   # MSW auto-enabled in dev mode
```

## Common Development Patterns

### API Service Pattern (B端)
```typescript
// frontend/src/services/orderService.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useOrders = (storeId: string) => {
  return useQuery({
    queryKey: ['orders', storeId],
    queryFn: () => fetchOrders(storeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
```

### Storage Pattern (C端 Taro)
```typescript
import Taro from '@tarojs/taro'

// Never use localStorage in C端
Taro.setStorageSync('token', value)  // ✅ Correct
const token = Taro.getStorageSync('token')
```

### Error Handling (Backend)
```java
/**
 * @spec O003-beverage-order
 */
@RestController
public class OrderController {

  @GetMapping("/api/orders/{id}")
  public ResponseEntity<ApiResponse<Order>> getOrder(@PathVariable String id) {
    try {
      Order order = orderService.findById(id);
      return ResponseEntity.ok(ApiResponse.success(order));
    } catch (NotFoundException e) {
      return ResponseEntity.status(404)
        .body(ApiResponse.failure("ORD_NTF_001", e.getMessage()));
    }
  }
}
```

## Troubleshooting

### Backend Issues
- **Supabase connection failed**: Check `application.yml` for `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- **Table not found**: Run migrations in `specs/<specId>/migrations/`
- **Logs**: Use structured logging filters: `grep "operation=CREATE_ORDER" logs/application.log`

### Frontend B端 Issues
- **401 Unauthorized**: Clear localStorage token, re-login
- **State not updating**: Check TanStack Query polling config (default: 8s)
- **Proxy errors**: Ensure backend is running on http://localhost:8080

### Frontend C端 Issues
- **Image loading failed**: Add domain to WeChat mini-program whitelist, use HTTPS
- **Compilation errors**: `rm -rf node_modules dist && npm install && npm run dev:weapp`
- **Platform API errors**: Check `process.env.TARO_ENV` for conditional logic

## Git Commit Convention

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:
```
feat(O003-beverage-order): add order history pagination

- Implement TanStack Query infinite scroll
- Add order status filter
- Support order number search

Closes #123
```

## Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (P95) | ≤ 1 second |
| Page Switch | ≤ 500ms |
| App Startup | ≤ 3 seconds |
| Taro Mini-program Main Bundle | < 2MB |
| First Screen Render (C端) | < 1.5s |

## Key Ports

| Service | Port | URL |
|---------|------|-----|
| Backend (Spring Boot) | 8080 | http://localhost:8080 |
| Frontend B端 (Vite) | 3000 | http://localhost:3000 |
| Frontend C端 (Taro H5) | 10086 | http://localhost:10086 |

## Important Files

- `.claude/rules/` - 9 project rules (mandatory reading)
- `specs/<specId>/` - Feature specifications
- `.specify/active_spec.txt` - Current active spec
- `frontend/vite.config.ts` - Vite configuration (includes API proxy)
- `backend/src/main/resources/application.yml` - Backend configuration
- `hall-reserve-taro/config/index.ts` - Taro build configuration

## Code Attribution

**All business logic files must include @spec annotation**:

```typescript
/** @spec O003-beverage-order */
export const OrderList = () => { ... }
```

```java
/**
 * @spec O003-beverage-order
 */
@Service
public class OrderService { ... }
```

Shared code can reference multiple specs: `@spec P003,P004`

## Claude Code Skills

14 custom skills available in `.claude/skills/`:
- `doc-writer` - Design documentation generation
- `ops-expert` - Operations management (门店/场景包/预约查询)
- `retail-audit` - Code/architecture audit
- `test-scenario-author` - E2E scenario creation
- `speckit.*` - Spec-driven workflow tools (specify, plan, tasks, implement, etc.)

Invoke with: `/skill-name` (e.g., `/doc-writer`)

---

**Last Updated**: 2026-01-11
**Main Branch**: `001-ui-implementation`
**Active Branch**: `feat/N004-procurement-material-selector`

## Active Technologies
- Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage for B端 / Taro.setStorage for C端）进行开发模拟 (O007-miniapp-menu-api)
- Supabase (PostgreSQL) 作为主要后端数据源 (O002-miniapp-menu-config)
- Mock data (MSW handlers + localStorage)，后端使用 Supabase (PostgreSQL) (O008-channel-product-category-migration)
- MSW mock data (in-memory state + MSW handlers + localStorage) 进行开发模拟 (feat/B001-fix-brand-creation)
- Supabase PostgreSQL (aws-1-us-east-2.pooler.supabase.com:6543) (T003-flyway-migration)
- Supabase PostgreSQL 作为主要后端数据源，使用 JPA 直接访问数据库 (feat/N001-purchase-inbound)
- Supabase PostgreSQL (direct JPA access), no PostgREST API usage (per rule 11) (N004-procurement-material-selector)

## Supabase REST API (PostgREST) 使用规则

**重要限制**：`supabase-rest` (PostgREST) 服务仅供 Supabase 内部组件使用（如 supabase-studio），**后端和前端项目禁止直接调用此服务**。

### 规则说明

1. **后端数据访问**：必须使用 **Spring Data JPA** 直接访问 PostgreSQL，不得使用 WebClient 调用 PostgREST API
2. **前端数据访问**：必须通过后端 API (`/api/*`) 获取数据，不得直接调用 PostgREST
3. **已完成迁移的模块**：
   - ✅ SKU (SkuRepository → SkuJpaRepository)
   - ✅ SPU (SpuRepository → SpuJpaRepository)
   - ✅ Store (StoreRepository → StoreJpaRepository)
   - ✅ StoreOperationLog (StoreOperationLogRepository → StoreOperationLogJpaRepository)

4. **如需使用 supabase-rest**：必须先与项目负责人确认，并记录使用原因

### 技术原因

- JPA 直连 PostgreSQL 性能更好，避免额外的 HTTP 调用
- 减少服务依赖，简化部署架构
- 避免 PostgREST 的认证/权限配置复杂性
- 更好的事务管理和错误处理

### Docker Compose 配置

`supabase-rest` 服务使用 profile 控制，默认不启动：
```yaml
profiles: ["rest", "full"]  # 需要时使用 --profile rest 启动
```

### 修改后需重新构建

如果修改了 Repository 层代码，必须重新构建 backend：
```bash
cd backend && mvn clean package -DskipTests
docker compose -f docker-compose.test.yml --env-file .env.test build backend
docker compose -f docker-compose.test.yml --env-file .env.test up -d backend
```

---

## Recent Changes
- N004-procurement-material-selector: COMPLETE - 采购订单支持 Material（物料，卓95%业务）和 SKU（成品，協5%业务）双选择器
  - Phase 1-4 (MVP): 完成
  - Phase 5-7 (P2): 完成
  - 后端: PurchaseOrderService 支持 itemType, GoodsReceiptService 支持 Material 入库换算
  - 前端: MaterialSkuSelectorModal 组件, PurchaseOrders 页面集成
- feat/N001-purchase-inbound: Added Supabase PostgreSQL 作为主要后端数据源，使用 JPA 直接访问数据库
- T003-flyway-migration: Added Supabase PostgreSQL (aws-1-us-east-2.pooler.supabase.com:6543)
