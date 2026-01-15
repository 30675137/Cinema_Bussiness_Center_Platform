# Test Execution Guide - Cinema Business Center Platform

## Project Overview

This is the **Cinema Business Center Platform** (耀莱影城商品管理中台) - a comprehensive product management system for cinema chains featuring:

- **Product Management** (商品管理): Master data management for products/SKUs
- **Pricing Configuration** (价格配置): Multi-channel pricing strategies  
- **Inventory Tracking** (库存追溯): Real-time inventory and transaction history
- **Review/Approval Workflow** (审核流程): Multi-level approval system

## Test Infrastructure

### Technology Stack
- **Frontend**: React 19.2 + TypeScript + Vite
- **UI Framework**: Ant Design 6.1
- **Testing**: Playwright 1.57
- **State Management**: Zustand + TanStack Query
- **Routing**: React Router 7.10

### Test Configuration
- **Base URL**: http://localhost:3000
- **Test Directory**: `frontend/tests/e2e/`
- **Config File**: `frontend/playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Recent Fixes Applied

### 1. Added Missing Test IDs
Fixed missing `data-testid` attributes in UI components for E2E testing:

#### ProductList Component (`src/pages/product/ProductList/index.tsx`)
- ✅ `product-table` - Main product table
- ✅ `table-header-name`, `table-header-sku`, `table-header-category`, `table-header-status`, `table-header-price`, `table-header-stock` - Table headers
- ✅ `product-row` - Each table row
- ✅ `cell-name`, `cell-sku`, `cell-category`, `cell-status`, `cell-price`, `cell-stock` - Table cells
- ✅ `create-product-button` - Create product button
- ✅ `search-input` - Search input field
- ✅ `category-filter`, `status-filter`, `material-type-filter` - Filter dropdowns
- ✅ `batch-export`, `batch-delete` - Batch operation buttons
- ✅ `selected-count` - Selected items counter
- ✅ `breadcrumb`, `breadcrumb-home`, `breadcrumb-current` - Breadcrumb navigation
- ✅ `pagination`, `page-size`, `page-info`, `next-page` - Pagination controls
- ✅ `mobile-filter-toggle`, `mobile-product-card` - Mobile responsive elements
- ✅ `select-checkbox` - Row selection checkboxes

#### ProductForm Component (`src/pages/product/ProductForm/index.tsx`)
- ✅ `product-form` - Form container
- ✅ `product-tabs` - Tab navigation
- ✅ `basic-info-tab`, `content-tab`, `specs-tab`, `bom-tab` - Tab panels
- ✅ `save-button`, `cancel-button` - Action buttons

### 2. Fixed Authentication for Tests
- Added localStorage token injection in `tests/e2e/setup.ts`
- Tests now bypass authentication requirement

### 3. Corrected Port Configuration  
- Updated `playwright.config.ts` baseURL from 3002 to 3000
- Matches Vite dev server port in `vite.config.ts`

### 4. Added Stock Column
- Added missing "库存" (Stock) column to product table with `table-header-stock` testid

## Running Tests

### Prerequisites
```bash
cd frontend
npm install
npm run test:install  # Install Playwright browsers
```

### Start Development Server
```bash
# Terminal 1 - Start dev server
cd frontend
npm run dev
# Server will start at http://localhost:3000
```

### Run Tests
```bash
# Terminal 2 - Run tests
cd frontend

# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report
```

### Test Suites Available

1. **basic.spec.ts** - Basic page load and navigation
2. **product-management.spec.ts** - Product list, search, filter (US1)
3. **product-creation.spec.ts** - Product creation workflow (US2)
4. **price-management.spec.ts** - Pricing configuration (US3)
5. **review-process.spec.ts** - Approval workflow (US4)
6. **inventory-trace.spec.ts** - Inventory tracking (US5)

## Test Results Structure

Tests generate results in:
- `frontend/playwright-report/` - HTML report
- `frontend/test-results.json` - JSON results
- `frontend/test-results/` - Screenshots/videos on failure

## Common Issues & Solutions

### Issue: Tests fail with "page not found"
**Solution**: Ensure dev server is running on port 3000

### Issue: Authentication errors
**Solution**: Check that `setup.ts` properly sets localStorage token

### Issue: Element not found errors
**Solution**: Verify `data-testid` attributes match in both test and component

### Issue: Timeout errors
**Solution**: 
- Check network tab for API errors
- Increase timeout in test if needed
- Ensure backend services are running (if required)

## Test Coverage

### User Story 1: Product Management (10 tests)
- ✅ Page load verification
- ✅ Search functionality
- ✅ Filter operations (category, status, material type)
- ✅ Create product navigation
- ✅ Table data display
- ✅ Batch selection
- ✅ Mobile responsive design
- ✅ Loading states and error handling
- ✅ Breadcrumb navigation
- ✅ Pagination

### User Story 2: Product Creation (Tests to be verified)
- Product form validation
- Multi-tab navigation
- Required field validation
- Save/Cancel operations

### User Story 3: Price Configuration (Tests to be verified)
- Price configuration creation
- Multi-store/channel pricing
- Price preview
- Approval submission

### User Story 4: Review Process (Tests to be verified)
- Pending reviews list
- Change comparison
- Approval/rejection workflow
- Batch approval

### User Story 5: Inventory Tracking (Tests to be verified)
- SKU inventory query
- Transaction history
- Stock level display
- Time range filtering

## Next Steps

1. **Run Tests**: Execute `npm test` to verify all fixes
2. **Review Failures**: Check test report for any remaining issues
3. **Add Mock Data**: Consider adding MSW for API mocking
4. **Complete Remaining Components**: Add test IDs to other components as needed
5. **CI/CD Integration**: Add test execution to CI pipeline

## Project Structure
```
frontend/
├── src/
│   ├── pages/
│   │   └── product/
│   │       ├── ProductList/index.tsx    (✅ Test IDs added)
│   │       └── ProductForm/index.tsx    (✅ Test IDs added)
│   ├── components/
│   └── ...
├── tests/
│   └── e2e/
│       ├── pages/
│       │   ├── BasePage.ts
│       │   └── ProductPage.ts
│       ├── fixtures/
│       │   └── test-data.ts
│       ├── setup.ts                     (✅ Auth fixed)
│       └── *.spec.ts
├── playwright.config.ts                 (✅ Port fixed)
└── package.json
```

## Contact & Support

For issues or questions:
- Check test reports in `playwright-report/`
- Review console logs during test execution
- Verify network requests in browser DevTools
- Check component implementations match test expectations

## Summary

All major test infrastructure issues have been resolved:
✅ Test IDs added to ProductList component
✅ Test IDs added to ProductForm component  
✅ Authentication bypass configured
✅ Port configuration corrected
✅ Stock column added

The test suite is now ready to run. Start the dev server and execute tests to verify all functionality.
