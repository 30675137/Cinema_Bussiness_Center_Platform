# Quick Start Guide: 订单列表与状态查看 (Order List & Status View)

**Feature Branch**: `U004-order-list-view` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)

---

## Overview

This guide helps developers set up the development environment and start working on the U004 order list and status view feature. Follow these steps to get the feature running locally with mock data and live reload.

---

## Prerequisites

### System Requirements
- **Node.js**: >= 18.x (recommended: 20.x LTS)
- **npm**: >= 9.x (or pnpm >= 8.x, yarn >= 1.22)
- **Java**: 21 (for backend development, if needed)
- **Git**: >= 2.30

### Required Tools
```bash
# Check versions
node --version   # Should be >= 18
npm --version    # Should be >= 9
git --version    # Should be >= 2.30
```

### IDE Recommendations
- **VSCode** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

---

## Environment Setup

### Step 1: Clone Repository and Checkout Feature Branch

```bash
# Clone repository (if not already cloned)
git clone <repository-url>
cd Cinema_Bussiness_Center_Platform

# Checkout U004 feature branch
git checkout U004-order-list-view

# Verify branch
git branch --show-current
# Expected output: U004-order-list-view
```

### Step 2: Verify Active Spec Binding

```bash
# Check active spec
cat .specify/active_spec.txt
# Expected output: specs/U004-order-list-view
```

**Important**: The active spec **must** match the feature branch. If mismatched, run:
```bash
# Update active spec
echo "specs/U004-order-list-view" > .specify/active_spec.txt
```

---

## Frontend Setup (B端 React App)

### Step 1: Install Dependencies

```bash
cd frontend
npm install

# Or use pnpm for faster installs
pnpm install
```

**Expected Output**:
```
added 1523 packages in 45s
```

### Step 2: Environment Configuration

Create `.env.local` file (if not exists):

```bash
cd frontend
cp .env.example .env.local  # If example exists
```

Edit `.env.local`:

```bash
# API Base URL (for U001 integration)
VITE_API_BASE_URL=http://localhost:8080

# Mock Mode (for development without backend)
VITE_USE_MOCK=true

# Feature Flags (optional)
VITE_ENABLE_ORDER_LIST=true
```

### Step 3: Start Development Server

```bash
npm run dev

# Or with specific port
npm run dev -- --port 5173
```

**Expected Output**:
```
  VITE v6.0.7  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 4: Access Order List Page

Open browser and navigate to:
```
http://localhost:5173/orders/list
```

**Or** (depending on routing configuration):
```
http://localhost:5173/reservation-orders
```

---

## Mock Data Setup (MSW)

### Step 1: Verify MSW Handlers

Check that MSW handlers are configured:

```bash
# View MSW handlers for order endpoints
cat frontend/src/mocks/handlers/orderHandlers.ts
```

**Expected Content** (minimal):
```typescript
/**
 * @spec U004-order-list-view
 * MSW handlers for order list API mocking
 */
import { http, HttpResponse } from 'msw'
import type { ReservationListResponse } from '@/types/reservationOrder'

const API_BASE_URL = 'http://localhost:8080/api'

export const orderHandlers = [
  // GET /api/admin/reservations - Order list with filtering
  http.get(`${API_BASE_URL}/admin/reservations`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 20

    // TODO: Implement filtering logic
    const mockOrders = generateMockOrders(size)

    const response: ReservationListResponse = {
      success: true,
      data: mockOrders,
      total: 100,
      page,
      size,
      totalPages: Math.ceil(100 / size),
    }

    return HttpResponse.json(response)
  }),

  // POST /api/admin/reservations/:id/confirm
  http.post(`${API_BASE_URL}/admin/reservations/:id/confirm`, async ({ params }) => {
    // Mock confirmation logic
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'CONFIRMED' },
      message: '订单确认成功',
    })
  }),

  // POST /api/admin/reservations/:id/cancel
  http.post(`${API_BASE_URL}/admin/reservations/:id/cancel`, async ({ params }) => {
    // Mock cancellation logic
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'CANCELLED' },
      message: '订单取消成功',
    })
  }),
]

function generateMockOrders(count: number) {
  // TODO: Implement mock data generation
  return []
}
```

### Step 2: Enable MSW in Development

Check `frontend/src/main.tsx`:

```typescript
import { setupWorker } from 'msw/browser'
import { orderHandlers } from './mocks/handlers/orderHandlers'

// Enable MSW in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
  const worker = setupWorker(...orderHandlers)
  worker.start({
    onUnhandledRequest: 'bypass', // Don't warn for unhandled requests
  })
}
```

### Step 3: Test Mock API

Open browser DevTools Console, you should see:
```
[MSW] Mocking enabled.
[MSW] Intercepting requests with handlers...
```

Make a test request:
```javascript
fetch('http://localhost:8080/api/admin/reservations')
  .then(r => r.json())
  .then(console.log)
```

**Expected Output**:
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "size": 20,
  "totalPages": 5
}
```

---

## Backend Setup (Optional - for U001 API Integration)

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Configure Supabase Connection

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://your-project.supabase.co:5432/postgres
    username: postgres
    password: ${SUPABASE_PASSWORD}  # Set via environment variable

supabase:
  url: https://your-project.supabase.co
  key: ${SUPABASE_ANON_KEY}
```

**Set Environment Variables**:
```bash
export SUPABASE_PASSWORD=your-password
export SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Run Backend Server

```bash
# Using Maven
./mvnw spring-boot:run

# Or using Gradle
./gradlew bootRun
```

**Expected Output**:
```
2025-12-27 10:00:00.123  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http)
2025-12-27 10:00:00.456  INFO 12345 --- [main] c.c.CinemaApplication                   : Started CinemaApplication in 3.456 seconds
```

### Step 4: Verify Backend APIs

```bash
# Test order list endpoint
curl http://localhost:8080/api/admin/reservations

# Expected: JSON response with orders
```

### Step 5: Connect Frontend to Backend

Edit `frontend/.env.local`:
```bash
# Disable mock mode
VITE_USE_MOCK=false

# Use real backend
VITE_API_BASE_URL=http://localhost:8080
```

Restart frontend dev server:
```bash
cd frontend
npm run dev
```

---

## Running Tests

### Unit Tests (Vitest)

```bash
cd frontend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Expected Output**:
```
 ✓ src/features/orders/components/OrderList.test.tsx (3 tests) 234ms
 ✓ src/features/orders/hooks/useOrderFilters.test.ts (5 tests) 89ms

Test Files  2 passed (2)
     Tests  8 passed (8)
  Start at  10:00:00
  Duration  1.23s (transform 456ms, setup 123ms, collect 234ms, tests 345ms)
```

### E2E Tests (Playwright)

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests for specific spec
npx playwright test order-list.spec.ts
```

**Expected Output**:
```
Running 6 tests using 3 workers

  ✓  [chromium] › order-list.spec.ts:3:1 › Order list page loads successfully (1.2s)
  ✓  [chromium] › order-list.spec.ts:10:1 › Can filter orders by status (2.3s)
  ✓  [chromium] › order-list.spec.ts:20:1 › Can search orders by phone (1.8s)

  6 passed (5.6s)
```

---

## Development Workflow

### Test-Driven Development (TDD) Process

1. **Red**: Write failing test
   ```bash
   # Create test file
   touch frontend/src/features/orders/components/OrderList.test.tsx

   # Write test (it will fail)
   npm run test OrderList.test.tsx
   ```

2. **Green**: Implement minimal code to pass test
   ```bash
   # Create component
   touch frontend/src/features/orders/components/OrderList.tsx

   # Implement component
   # Run test again
   npm run test OrderList.test.tsx
   ```

3. **Refactor**: Improve code quality
   ```bash
   # Run lint
   npm run lint

   # Run formatter
   npm run format

   # Run tests again
   npm run test
   ```

### Code Attribution

**All new files must include `@spec` attribution**:

```typescript
/**
 * @spec U004-order-list-view
 * Order list page component
 */
import React from 'react'

export const OrderListPage = () => {
  // ...
}
```

### Git Workflow

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(U004): implement order list table component

- Add OrderList component with Ant Design Table
- Add status filter and phone search
- Add TanStack Query integration for data fetching

@spec U004-order-list-view"

# Push to feature branch
git push origin U004-order-list-view
```

---

## Project Structure

```
frontend/src/
├── features/
│   └── orders/                      # U004 feature module
│       ├── components/              # Feature components
│       │   ├── OrderList.tsx       # Main list table
│       │   ├── OrderListItem.tsx   # Table row (if needed)
│       │   ├── OrderDetailDrawer.tsx # Detail slide-out
│       │   ├── FilterBar.tsx       # Status/time filters
│       │   ├── SearchBar.tsx       # Phone search
│       │   └── OrderStatusTag.tsx  # Status badge
│       ├── hooks/                   # Custom hooks
│       │   ├── useOrders.ts        # TanStack Query
│       │   ├── useOrderFilters.ts  # Zustand filters
│       │   └── useOrderActions.ts  # Confirm/cancel
│       ├── services/                # API services
│       │   ├── orderService.ts     # API calls
│       │   └── orderActionService.ts # Reuse U001
│       ├── types/                   # TypeScript types
│       │   ├── index.ts            # Re-export from contracts
│       │   └── api.ts              # API types
│       ├── utils/                   # Utility functions
│       │   ├── orderHelpers.ts     # Status formatting
│       │   └── validation.ts       # Zod schemas
│       └── __tests__/               # Feature tests
│           ├── OrderList.test.tsx
│           ├── OrderDetailDrawer.test.tsx
│           └── useOrderFilters.test.ts
├── pages/
│   └── OrderListPage.tsx            # Route-level page
├── stores/
│   └── orderFiltersStore.ts         # Zustand store
└── mocks/
    └── handlers/
        └── orderHandlers.ts         # MSW handlers

specs/U004-order-list-view/
├── spec.md                          # Feature specification
├── plan.md                          # Implementation plan
├── research.md                      # Technical research
├── data-model.md                    # Data model definitions
├── contracts/                       # API contracts
│   ├── api.yaml                    # OpenAPI spec
│   └── types.ts                    # Shared TypeScript types
├── checklists/                      # Quality validation
│   └── requirements.md             # Requirements checklist
└── quickstart.md                    # This file
```

---

## Common Issues & Solutions

### Issue 1: "Permission denied" when running scripts

**Error**:
```
zsh:1: permission denied: /var/folders/.../...
```

**Solution**:
```bash
# Make script executable
chmod +x .specify/scripts/bash/setup-plan.sh

# Or run with bash directly
bash .specify/scripts/bash/setup-plan.sh
```

---

### Issue 2: MSW not intercepting requests

**Symptoms**:
- Requests go to real backend instead of mock handlers
- Console shows "404 Not Found" errors

**Solution**:
```bash
# Check VITE_USE_MOCK is set to true
cat frontend/.env.local | grep VITE_USE_MOCK

# Restart dev server
cd frontend
npm run dev
```

---

### Issue 3: Type errors after installing dependencies

**Error**:
```
Cannot find module '@/types/reservationOrder'
```

**Solution**:
```bash
# Ensure U001 types exist
ls frontend/src/types/reservationOrder.ts

# If missing, check out from U001 branch
git checkout origin/U001-reservation-order-management -- frontend/src/types/reservationOrder.ts

# Or create minimal type definitions
```

---

### Issue 4: Port already in use

**Error**:
```
Port 5173 is already in use
```

**Solution**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

---

### Issue 5: Backend connection refused

**Error**:
```
fetch failed: ECONNREFUSED 127.0.0.1:8080
```

**Solution**:
```bash
# Check backend is running
curl http://localhost:8080/actuator/health

# If not running, start backend
cd backend
./mvnw spring-boot:run

# Or use mock mode
# Edit frontend/.env.local: VITE_USE_MOCK=true
```

---

## Next Steps

After completing the setup:

1. **Read Design Documents**:
   - [research.md](./research.md) - Technical decisions
   - [data-model.md](./data-model.md) - Entity definitions
   - [contracts/api.yaml](./contracts/api.yaml) - API specification

2. **Generate Tasks**:
   ```bash
   # Generate implementation tasks (via Spec-Kit)
   /speckit.tasks
   ```

3. **Start Implementation**:
   - Follow TDD workflow (Red → Green → Refactor)
   - Implement components bottom-up (atoms → molecules → organisms → pages)
   - Write tests **before** implementation

4. **Integrate with U001**:
   - Reuse existing types from `@/types/reservationOrder`
   - Call existing APIs from `reservationOrderService.ts`
   - Test integration with real backend (disable mock mode)

---

## Useful Commands Reference

```bash
# Development
npm run dev                  # Start dev server
npm run build                # Build for production
npm run preview              # Preview production build

# Testing
npm run test                 # Run unit tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage
npm run test:e2e             # Run E2E tests
npm run test:e2e:ui          # Run E2E tests in UI mode

# Code Quality
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint errors
npm run format               # Run Prettier
npm run type-check           # Run TypeScript type check

# Backend
./mvnw spring-boot:run       # Run Spring Boot server (Maven)
./mvnw test                  # Run backend tests
./gradlew bootRun            # Run Spring Boot server (Gradle)

# Git
git status                   # Check current status
git branch --show-current    # Show current branch
git log -5 --oneline         # Show last 5 commits
```

---

## Documentation

- **Feature Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Technical Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/api.yaml](./contracts/api.yaml)
- **TypeScript Types**: [contracts/types.ts](./contracts/types.ts)
- **Requirements Checklist**: [checklists/requirements.md](./checklists/requirements.md)

---

## Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Ask in team Slack channel
- **Pull Requests**: Follow [CONTRIBUTING.md](../../../CONTRIBUTING.md) guidelines

---

**Quick Start Version**: 1.0.0
**Last Updated**: 2025-12-27
**Next Step**: Run `/speckit.tasks` to generate implementation tasks
