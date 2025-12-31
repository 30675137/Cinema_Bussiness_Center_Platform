# Quick Start: 饮品模块复用SKU管理能力

**@spec O004-beverage-sku-reuse**

**Date**: 2025-12-31 | **Target Audience**: Frontend & Backend Developers

## Overview

This quick start guide will help you get started with developing and testing the **Beverage SKU Reuse** feature. By the end of this guide, you'll have a working local environment with:

- ✅ Backend API running on http://localhost:8080
- ✅ Frontend B端 management dashboard on http://localhost:3000
- ✅ E2E tests ready to run with Playwright
- ✅ Test data fixtures loaded and available

**Estimated Time**: 15-20 minutes

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Check Command |
|------|---------|---------------|
| **Node.js** | 18.x+ | `node --version` |
| **npm** | 9.x+ | `npm --version` |
| **Java** | 17+ | `java --version` |
| **Maven** | 3.8+ | `mvn --version` |
| **Git** | 2.x+ | `git --version` |

**Required Environment Variables**:

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-key
```

Create a `.env.local` file in the `frontend/` directory:

```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_ENV=development
```

---

## Step 1: Clone and Setup Repository

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/your-org/Cinema_Bussiness_Center_Platform.git
cd Cinema_Bussiness_Center_Platform

# Checkout the feature branch
git checkout O004-beverage-sku-reuse

# Verify you're on the correct branch
git branch --show-current
# Output: O004-beverage-sku-reuse
```

---

## Step 2: Backend Setup (Spring Boot)

### 2.1 Install Dependencies

```bash
cd backend

# Install Maven dependencies
./mvnw clean install -DskipTests

# Verify installation
./mvnw dependency:tree | head -n 20
```

### 2.2 Run Database Migrations

**Important**: This feature includes data migration scripts to migrate old `beverage_config` data to the new `skus` table.

```bash
# Run Flyway migrations
./mvnw flyway:migrate

# Verify migrations
./mvnw flyway:info
```

**Expected Output**:
```
+----------+---------+------------------------------+------+---------------------+---------+
| Category | Version | Description                  | Type | Installed On        | State   |
+----------+---------+------------------------------+------+---------------------+---------+
| Versioned| 2025.12 | migrate beverages to skus    | SQL  | 2025-12-31 10:00:00 | Success |
+----------+---------+------------------------------+------+---------------------+---------+
```

### 2.3 Start Backend Server

```bash
# Start Spring Boot application
./mvnw spring-boot:run

# Or run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Verify Backend is Running**:

```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}

# Test SKU API endpoint
curl -H "Authorization: Bearer <your-token>" \
     http://localhost:8080/api/skus?type=finished_product

# Expected response:
# {"success":true,"data":[...],"total":10,"page":1,"pageSize":20}
```

**Common Issues**:

| Issue | Solution |
|-------|----------|
| Port 8080 already in use | Kill existing process: `lsof -ti:8080 \| xargs kill -9` |
| Supabase connection failed | Check `.env` file for correct `SUPABASE_URL` and `SUPABASE_ANON_KEY` |
| Table not found | Run migrations: `./mvnw flyway:migrate` |

---

## Step 3: Frontend Setup (React + Vite)

### 3.1 Install Dependencies

```bash
cd ../frontend

# Install npm packages
npm install

# Verify installation
npm list --depth=0
```

### 3.2 Initialize MSW (Mock Service Worker)

**Note**: MSW is used for API mocking during development and testing.

```bash
# Initialize MSW (first time only)
npm run mock:init

# Verify MSW setup
ls -la public/mockServiceWorker.js
```

### 3.3 Start Frontend Development Server

```bash
# Start Vite dev server
npm run dev
```

**Expected Output**:
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

  API Proxy: /api → http://localhost:8080
```

**Verify Frontend is Running**:

1. Open browser: http://localhost:3000
2. You should see the login page
3. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
4. Navigate to `/products/sku` to see the SKU management interface

**Common Issues**:

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Change port in `vite.config.ts` or kill process: `lsof -ti:3000 \| xargs kill -9` |
| API proxy errors | Ensure backend is running on http://localhost:8080 |
| 401 Unauthorized | Clear localStorage: `localStorage.clear()` and re-login |

---

## Step 4: Test Data Setup

### 4.1 Load Seed Data

**Seed data** is pre-configured test data stored in JSON files, used by E2E tests and development.

```bash
# Verify seed data files exist
ls -la testdata/seeds/

# Expected files:
# - beverage-skus.json (finished_product SKUs)
# - bom-filter-skus.json (mixed SKU types for filtering tests)
```

**Seed Data Contents**:

1. **beverage-skus.json**: 3 finished_product beverage SKUs
   - FIN-MOJITO-001 (薄荷威士忌鸡尾酒)
   - FIN-WHISKEY-COLA-001 (威士忌可乐鸡尾酒)
   - FIN-COLA-ICE-001 (冰镇可乐)

2. **bom-filter-skus.json**: Mixed SKU types for filtering tests
   - 3 finished_product SKUs
   - 5 packaging SKUs (should NOT appear in BOM selector)
   - 2 raw_material SKUs (should NOT appear in BOM selector)

### 4.2 Load Test Data into Database (Optional)

**Note**: For E2E tests, we use **seed strategy** (static JSON files) and do NOT load data into the database. However, for manual testing, you can load seed data:

```bash
cd backend

# Run seed data loader script (if available)
./mvnw exec:java -Dexec.mainClass="com.cinema.util.SeedDataLoader"

# Or manually insert via Supabase dashboard
# https://supabase.com/dashboard/project/<your-project>/editor
```

---

## Step 5: Run E2E Tests

### 5.1 Install Playwright

```bash
cd ../frontend

# Install Playwright browsers (first time only)
npx playwright install

# Verify installation
npx playwright --version
```

### 5.2 Run E2E Tests

**Option 1: Headless Mode (CI/CD)**

```bash
# Run all E2E tests
npm run test:e2e

# Run specific scenario
npx playwright test ../scenarios/product/E2E-PRODUCT-002.spec.ts
```

**Expected Output**:
```
Running 2 tests using 1 worker

  ✓ [chromium] › E2E-PRODUCT-002.spec.ts:14:3 › E2E-PRODUCT-002 (5.2s)
  ✓ [chromium] › E2E-PRODUCT-003.spec.ts:14:3 › E2E-PRODUCT-003 (3.8s)

  2 passed (9.0s)
```

**Option 2: UI Mode (Development)**

```bash
# Run tests in Playwright UI mode
npm run test:e2e:ui

# Or run specific scenario in UI mode
npx playwright test ../scenarios/product/E2E-PRODUCT-002.spec.ts --ui
```

**Playwright UI Mode Benefits**:
- ✅ Visual test execution
- ✅ Step-by-step debugging
- ✅ Screenshot and video playback
- ✅ Test report viewer

**Option 3: Headed Mode (Watch Browser)**

```bash
# Run tests with browser visible
npx playwright test ../scenarios/product/E2E-PRODUCT-002.spec.ts --headed
```

### 5.3 View Test Reports

```bash
# Generate and open HTML report
npx playwright show-report

# Report includes:
# - Test execution timeline
# - Screenshots on failure
# - Trace files for debugging
```

---

## Step 6: Common Development Workflows

### Workflow 1: Add a New SKU (Manual Testing)

1. **Start backend and frontend servers** (Steps 2-3)
2. **Navigate to SKU management page**: http://localhost:3000/products/sku
3. **Click "新增SKU" button**
4. **Fill in the form**:
   - SKU编码: `FIN-TEST-001`
   - SKU名称: `测试饮品`
   - SKU类型: `finished_product`
   - 分类: `饮品 > 鸡尾酒`
   - 价格: `3000` (30.00元)
   - 单位: `份`
5. **Click "确定"**
6. **Verify**:
   - Success toast message appears
   - New SKU appears in the SKU list table
   - Backend logs show `CREATE_SKU` operation

### Workflow 2: Test SKU Selector Filtering (Manual Testing)

1. **Ensure backend has mixed SKU types** (use seed data loader)
2. **Navigate to BOM configuration page**: http://localhost:3000/products/bom
3. **Select a finished product SKU** (e.g., FIN-MOJITO-001)
4. **Click "添加配方组件" button**
5. **Open SKU selector dropdown**
6. **Verify filtering**:
   - ✅ Only `finished_product` SKUs should appear
   - ❌ `packaging` SKUs should NOT appear
   - ❌ `raw_material` SKUs should NOT appear
7. **Test search**:
   - Enter "威士忌" in search box
   - Only finished products containing "威士忌" should appear

### Workflow 3: Run E2E Tests for a Specific User Story

```bash
# Run E2E tests for User Story 1 (P1: SKU creation)
npx playwright test --grep "E2E-PRODUCT-002"

# Run E2E tests for User Story 2 (P2: SKU selector filtering)
npx playwright test --grep "E2E-PRODUCT-003"

# Run all tests tagged with priority:p1
npx playwright test --grep "@p1"
```

### Workflow 4: Debug a Failing E2E Test

```bash
# Run test in debug mode
npx playwright test ../scenarios/product/E2E-PRODUCT-002.spec.ts --debug

# Or use Playwright Inspector
PWDEBUG=1 npx playwright test ../scenarios/product/E2E-PRODUCT-002.spec.ts
```

**Debugging Tools**:
- **Playwright Inspector**: Step through test execution line by line
- **Screenshots**: Captured on failure (saved to `test-results/`)
- **Videos**: Recorded for failed tests (saved to `test-results/`)
- **Traces**: Full execution trace with network logs (`npx playwright show-trace <trace-file>`)

---

## Step 7: Code Style and Quality

### 7.1 Run Linters

```bash
cd frontend

# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check Prettier formatting
npm run format:check

# Auto-format code
npm run format
```

### 7.2 Run Unit Tests

```bash
# Run Vitest unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:unit -- --watch
```

**Expected Coverage Thresholds**:
- Branches: ≥60%
- Functions: ≥60%
- Lines: ≥60%
- Statements: ≥60%

### 7.3 TypeScript Type Checking

```bash
# Check TypeScript types
npx tsc --noEmit

# Expected output:
# (no errors)
```

---

## Step 8: Database Inspection (Supabase)

### 8.1 Access Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Select your project
3. Navigate to **Table Editor**

### 8.2 Verify Migrated Data

**Check `skus` table**:

```sql
SELECT sku_code, sku_name, sku_type, price, status
FROM skus
WHERE sku_type = 'finished_product'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Result**:
```
sku_code          | sku_name              | sku_type         | price | status
------------------|----------------------|------------------|-------|--------
FIN-MOJITO-001    | 薄荷威士忌鸡尾酒     | finished_product | 3500  | enabled
FIN-WHISKEY-COLA  | 威士忌可乐鸡尾酒     | finished_product | 3200  | enabled
```

**Check migration mapping**:

```sql
SELECT old_beverage_id, new_sku_id, migrated_at, status
FROM beverage_sku_mapping
ORDER BY migrated_at DESC
LIMIT 10;
```

**Check BOM relationships**:

```sql
SELECT
  fps.sku_name AS finished_product,
  cs.sku_name AS component,
  b.quantity,
  b.unit,
  cs.sku_type AS component_type
FROM boms b
JOIN skus fps ON b.finished_product_sku_id = fps.id
JOIN skus cs ON b.component_sku_id = cs.id
WHERE fps.sku_code = 'FIN-MOJITO-001'
ORDER BY b.sort_order;
```

**Expected Result** (薄荷威士忌鸡尾酒的配方):
```
finished_product      | component        | quantity | unit   | component_type
----------------------|------------------|----------|--------|---------------
薄荷威士忌鸡尾酒     | 威士忌原液       | 30.000   | 毫升   | raw_material
薄荷威士忌鸡尾酒     | 可乐浓缩液       | 200.000  | 毫升   | raw_material
薄荷威士忌鸡尾酒     | 杯子             | 1.000    | 个     | packaging
薄荷威士忌鸡尾酒     | 吸管             | 1.000    | 根     | packaging
```

---

## Step 9: API Testing (Postman/cURL)

### 9.1 Get JWT Token

```bash
# Login and get JWT token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "userId": "550e8400-e29b-41d4-a716-446655440099"
#   }
# }

# Save token to environment variable
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 9.2 Test SKU APIs

**List all finished_product SKUs**:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "http://localhost:8080/api/skus?type=finished_product"
```

**Get SKU by ID**:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "http://localhost:8080/api/skus/550e8400-e29b-41d4-a716-446655440000"
```

**Create a new SKU**:

```bash
curl -X POST http://localhost:8080/api/skus \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skuCode": "FIN-TEST-COCKTAIL-001",
    "skuName": "测试鸡尾酒",
    "skuType": "finished_product",
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "price": 3000,
    "unit": "份",
    "status": "enabled"
  }'
```

**Update SKU**:

```bash
curl -X PUT http://localhost:8080/api/skus/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 3800,
    "status": "enabled"
  }'
```

**Delete SKU**:

```bash
curl -X DELETE http://localhost:8080/api/skus/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 9.3 Test BOM APIs

**List BOM entries for a finished product**:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "http://localhost:8080/api/boms?finishedProductSkuId=550e8400-e29b-41d4-a716-446655440000"
```

**Create BOM entry**:

```bash
curl -X POST http://localhost:8080/api/boms \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "finishedProductSkuId": "550e8400-e29b-41d4-a716-446655440000",
    "componentSkuId": "550e8400-e29b-41d4-a716-446655440010",
    "quantity": 30.0,
    "unit": "毫升",
    "sortOrder": 1,
    "isOptional": false
  }'
```

---

## Step 10: Troubleshooting

### Problem 1: Backend fails to start

**Symptom**: `Application run failed` error

**Solutions**:

1. Check Java version: `java --version` (must be 17+)
2. Verify Supabase credentials in `backend/.env`
3. Check port 8080 is available: `lsof -ti:8080`
4. Review logs: `tail -f backend/logs/application.log`

### Problem 2: Frontend API calls return 401

**Symptom**: All API requests return `{"success":false,"error":"AUT_UNA_001","message":"未认证或Token无效"}`

**Solutions**:

1. Clear localStorage: Open DevTools → Console → Run `localStorage.clear()`
2. Re-login at http://localhost:3000/login
3. Check JWT token expiration (default: 24 hours)
4. Verify backend is running: `curl http://localhost:8080/actuator/health`

### Problem 3: E2E tests fail with "timeout exceeded"

**Symptom**: `Test timeout of 30000ms exceeded`

**Solutions**:

1. Ensure backend and frontend are running
2. Increase timeout in `playwright.config.ts`: `timeout: 60000`
3. Check test data fixtures are loaded correctly
4. Run test in headed mode to see what's happening: `--headed`
5. Check browser console for JavaScript errors

### Problem 4: SKU selector shows packaging/raw_material SKUs

**Symptom**: SKU selector in BOM configuration page shows non-finished_product SKUs

**Root Cause**: API filtering not working or client-side type guard missing

**Solutions**:

1. Check API request URL includes `?type=finished_product`
2. Verify backend filtering logic in `SKUController.java`
3. Check frontend SKU selector component has type guard:
   ```typescript
   const { data: skus } = useQuery({
     queryKey: ['skus', { type: 'finished_product' }],
     queryFn: () => fetchSkus({ type: 'finished_product' }),
   });

   return (
     <Select options={skus?.filter(sku => sku.type === 'finished_product')} />
   );
   ```

### Problem 5: Data migration failed

**Symptom**: `beverage_sku_mapping` table is empty after migration

**Solutions**:

1. Check migration script logs: `./mvnw flyway:info`
2. Manually run migration: `./mvnw flyway:migrate`
3. Verify `beverage_config` table has data:
   ```sql
   SELECT COUNT(*) FROM beverage_config;
   ```
4. Check migration script idempotency (should be safe to re-run):
   ```sql
   SELECT COUNT(*) FROM beverage_sku_mapping;
   ```

---

## Next Steps

After completing this quick start guide, you should:

1. ✅ **Review the feature specification**: `specs/O004-beverage-sku-reuse/spec.md`
2. ✅ **Understand the data model**: `specs/O004-beverage-sku-reuse/data-model.md`
3. ✅ **Review API contracts**: `specs/O004-beverage-sku-reuse/contracts/api.yaml`
4. ✅ **Read the implementation plan**: `specs/O004-beverage-sku-reuse/plan.md`
5. ✅ **Check the research decisions**: `specs/O004-beverage-sku-reuse/research.md`

**Ready to start coding?**

- Follow TDD approach (Red-Green-Refactor cycle)
- Write unit tests first (Vitest)
- Run E2E tests after implementation
- Follow code quality standards (ESLint, Prettier, TypeScript strict mode)
- Add `@spec O004-beverage-sku-reuse` to all new files

**Need Help?**

- 📖 Documentation: `specs/O004-beverage-sku-reuse/`
- 🐛 Issues: https://github.com/your-org/Cinema_Bussiness_Center_Platform/issues
- 💬 Team Chat: Slack #cinema-platform-dev

---

**Happy Coding! 🚀**

**Last Updated**: 2025-12-31 | **Version**: 1.0.0
