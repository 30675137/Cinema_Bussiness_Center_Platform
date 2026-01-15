# Development Quickstart: N004

**Feature**: 采购订单物料选择器改造
**Branch**: `N004-procurement-material-selector`
**Date**: 2026-01-11

---

## Prerequisites

### Dependencies

- **M001-material-unit-system** (CRITICAL): Must be deployed and functional
  - Material entity with `purchaseUnit`, `inventoryUnit`, `conversion_rate`
  - `CommonConversionService.convert()` implementation available
- **Existing Procurement Module**: `purchase_orders` and `purchase_order_items` tables exist
- Java 17 (NOT Java 21)
- PostgreSQL database (Supabase)
- Node.js 18+ (frontend)

### Verification Checklist

Before starting N004 development:

```bash
# 1. Verify M001 Material table exists
# Connect to Supabase PostgreSQL
psql -h <supabase-host> -U postgres -d postgres
SELECT table_name FROM information_schema.tables WHERE table_name = 'material';
# Expected: material table exists

# 2. Verify Material entity fields
\d material
# Expected columns: purchase_unit_id, inventory_unit_id, conversion_rate, use_global_conversion

# 3. Verify CommonConversionService class exists (backend)
find backend/src -name "*ConversionService*.java" | grep Common
# Expected: .../unitconversion/service/CommonConversionService.java

# 4. Check current purchase_order_items schema
\d purchase_order_items
# Expected: id, purchase_order_id, sku_id (NOT NULL), quantity, unit, unit_price, total_price

# 5. Verify git branch alignment
git branch --show-current
cat .specify/active_spec.txt
# Expected: Both show N004-procurement-material-selector
```

---

## Development Workflow

### Phase 1: Database Migration (Backend)

**Estimated Time**: 2 hours

**Steps**:

1. **Create migration script**:
   ```bash
   cd backend
   touch src/main/resources/db/migration/V2026_01_11_001__add_material_support_to_purchase_order_items.sql
   ```

2. **Copy migration SQL** from `data-model.md` (complete script with batch update logic)

3. **Test migration on local database**:
   ```bash
   # Create test data (optional, use existing purchase_order_items if available)
   # Run Flyway migration
   ./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/test_db

   # Verify migration results
   psql -h localhost -U postgres -d test_db
   \d purchase_order_items
   # Expected: material_id, item_type, material_name columns added, sku_id nullable

   SELECT * FROM purchase_order_items LIMIT 5;
   # Expected: All existing records have item_type = 'SKU'
   ```

4. **Performance test** (if >10,000 historical records exist):
   ```bash
   # Measure migration execution time
   time ./mvnw flyway:migrate
   # Expected: < 5 minutes for 100,000 records
   ```

**Test-Driven Development**:
- ✅ Write migration script FIRST (test via Flyway)
- ✅ Verify CHECK constraint blocks invalid inserts (test manually)
- ⏭️ Write JPA entity tests AFTER migration

---

### Phase 2: JPA Entity & Repository (Backend)

**Estimated Time**: 3 hours

**Test-First Approach**:

1. **Write entity tests FIRST** (`PurchaseOrderItemTest.java`):
   ```java
   /** @spec N004-procurement-material-selector */
   @DataJpaTest
   class PurchaseOrderItemTest {

       @Test
       void shouldAllowMaterialItem() {
           // Create Material item (item_type = MATERIAL, material_id set, sku_id null)
           // Assert: saves successfully
       }

       @Test
       void shouldAllowSkuItem() {
           // Create SKU item (item_type = SKU, sku_id set, material_id null)
           // Assert: saves successfully
       }

       @Test
       void shouldRejectBothMaterialAndSku() {
           // Try to create item with both material_id and sku_id
           // Assert: throws ConstraintViolationException
       }

       @Test
       void shouldRejectNeitherMaterialNorSku() {
           // Try to create item with neither material_id nor sku_id
           // Assert: throws ConstraintViolationException
       }

       @Test
       void shouldAutoPopulateMaterialName() {
           // Create Material item
           // Assert: material_name is auto-filled from Material.name
       }
   }
   ```

2. **Implement `PurchaseOrderItem` entity** (copy from `data-model.md`)

3. **Run tests**:
   ```bash
   ./mvnw test -Dtest=PurchaseOrderItemTest
   # Expected: All tests pass (100% coverage on new validation logic)
   ```

4. **Create repository interface**:
   ```java
   /** @spec N004-procurement-material-selector */
   public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID> {

       @Query("SELECT i FROM PurchaseOrderItem i WHERE i.purchaseOrder.id = :orderId")
       List<PurchaseOrderItem> findByPurchaseOrderId(@Param("orderId") UUID orderId);

       @Query("SELECT i FROM PurchaseOrderItem i WHERE i.itemType = :itemType")
       List<PurchaseOrderItem> findByItemType(@Param("itemType") ItemType itemType);
   }
   ```

---

### Phase 3: Service Layer & Unit Conversion (Backend)

**Estimated Time**: 4 hours

**Test-First Approach**:

1. **Write service tests FIRST** (`ProcurementOrderServiceTest.java`):
   ```java
   /** @spec N004-procurement-material-selector */
   @SpringBootTest
   class ProcurementOrderServiceTest {

       @MockBean
       private CommonConversionService conversionService;

       @Autowired
       private ProcurementOrderService service;

       @Test
       void createOrderWithMaterialItem_shouldAutoFillPurchaseUnit() {
           // Given: CreatePurchaseOrderRequest with Material item
           // When: service.createOrder(request)
           // Then: item.unit = material.purchaseUnit.code
       }

       @Test
       void procurementInbound_shouldConvertPurchaseToInventoryUnit() {
           // Given: Order with Material item (quantity=10, purchaseUnit="瓶")
           // Mock: conversionService.convert("瓶", "ml", 10) returns 5000
           // When: service.executeInbound(orderId)
           // Then: Inventory record created with quantity=5000, unit="ml"
       }

       @Test
       void procurementInbound_shouldThrowIfConversionFails() {
           // Mock: conversionService.convert() throws IllegalArgumentException
           // When: service.executeInbound(orderId)
           // Then: Exception propagated, no inventory record created
       }
   }
   ```

2. **Implement `ProcurementOrderService`**:
   ```java
   /** @spec N004-procurement-material-selector */
   @Service
   public class ProcurementOrderService {

       @Autowired
       private CommonConversionService conversionService;

       @Autowired
       private MaterialRepository materialRepository;

       @Autowired
       private InventoryService inventoryService;

       public PurchaseOrder createOrder(CreatePurchaseOrderRequest request) {
           // Validate items
           // For each item with itemType = MATERIAL:
           //   - Fetch Material entity
           //   - Populate item.unit from material.purchaseUnit.code
           //   - Populate item.materialName from material.name
           // Save order
       }

       @Transactional
       public void executeInbound(UUID orderId) {
           PurchaseOrder order = findById(orderId);
           for (PurchaseOrderItem item : order.getItems()) {
               if (item.getItemType() == ItemType.MATERIAL) {
                   // Convert purchaseUnit to inventoryUnit
                   BigDecimal inventoryQty = conversionService.convert(
                       item.getMaterial().getPurchaseUnit().getCode(),
                       item.getMaterial().getInventoryUnit().getCode(),
                       item.getQuantity()
                   );
                   // Update inventory
                   inventoryService.updateOrCreate(
                       InventoryItemType.MATERIAL,
                       item.getMaterialId(),
                       inventoryQty,
                       item.getMaterial().getInventoryUnit().getCode()
                   );
               }
           }
       }
   }
   ```

3. **Run tests**:
   ```bash
   ./mvnw test -Dtest=ProcurementOrderServiceTest
   # Expected: All tests pass (100% coverage on conversion logic)
   ```

---

### Phase 4: REST API Endpoints (Backend)

**Estimated Time**: 2 hours

**Test-First Approach**:

1. **Write integration tests FIRST** (`ProcurementOrderControllerTest.java`):
   ```java
   /** @spec N004-procurement-material-selector */
   @SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
   class ProcurementOrderControllerTest extends BaseIntegrationTest {

       @Test
       void postProcurementOrders_withMaterialItem_shouldReturn201() {
           // POST /api/procurement/orders
           // Body: { items: [{ itemType: 'MATERIAL', materialId: '...', quantity: 10, unitPrice: 50 }] }
           // Assert: status = 201, response.data.items[0].unit = material.purchaseUnit
       }

       @Test
       void postProcurementOrders_withBothMaterialAndSku_shouldReturn400() {
           // POST /api/procurement/orders
           // Body: { items: [{ itemType: 'MATERIAL', materialId: '...', skuId: '...' }] }
           // Assert: status = 400, error = 'PROC_VAL_001'
       }
   }
   ```

2. **Implement controller**:
   ```java
   /** @spec N004-procurement-material-selector */
   @RestController
   @RequestMapping("/api/procurement/orders")
   public class ProcurementOrderController {

       @PostMapping
       public ResponseEntity<ApiResponse<PurchaseOrderDTO>> createOrder(
           @Valid @RequestBody CreatePurchaseOrderRequest request
       ) {
           // Validate request (item type and ID consistency)
           // Call service.createOrder()
           // Return ApiResponse.success(dto)
       }

       @PostMapping("/{orderId}/inbound")
       public ResponseEntity<ApiResponse<InboundResultDTO>> executeInbound(
           @PathVariable UUID orderId
       ) {
           // Call service.executeInbound()
           // Return ApiResponse.success(result)
       }
   }
   ```

3. **Run integration tests**:
   ```bash
   ./mvnw test -Dtest=ProcurementOrderControllerTest
   # Expected: All tests pass
   ```

---

### Phase 5: Frontend Component (React)

**Estimated Time**: 6 hours

**Test-First Approach**:

1. **Write component tests FIRST** (`MaterialSkuSelector.test.tsx`):
   ```typescript
   /** @spec N004-procurement-material-selector */
   import { render, screen, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { MaterialSkuSelector } from './MaterialSkuSelector';

   describe('MaterialSkuSelector', () => {
     it('should show only Material list when mode="material-only"', () => {
       render(<MaterialSkuSelector mode="material-only" onChange={jest.fn()} />);
       expect(screen.queryByText('成品 SKU')).not.toBeInTheDocument();
       expect(screen.getByText('物料')).toBeInTheDocument();
     });

     it('should show tabs when mode="dual"', () => {
       render(<MaterialSkuSelector mode="dual" onChange={jest.fn()} />);
       expect(screen.getByRole('tab', { name: '物料' })).toBeInTheDocument();
       expect(screen.getByRole('tab', { name: '成品 SKU' })).toBeInTheDocument();
     });

     it('should reset filters when switching tabs', async () => {
       const user = userEvent.setup();
       render(<MaterialSkuSelector mode="dual" onChange={jest.fn()} />);

       // Search in Material tab
       const searchInput = screen.getByPlaceholderText('搜索物料');
       await user.type(searchInput, '可乐');

       // Switch to SKU tab
       await user.click(screen.getByRole('tab', { name: '成品 SKU' }));

       // Assert: search input cleared
       expect(searchInput).toHaveValue('');
     });

     it('should call onChange with correct Material selection', async () => {
       const onChange = jest.fn();
       const user = userEvent.setup();
       render(<MaterialSkuSelector mode="material-only" onChange={onChange} />);

       // Mock API response with materials
       // Click on a material row
       await user.click(screen.getByText('可乐糖浆'));

       // Assert: onChange called with { type: 'MATERIAL', data: Material }
       expect(onChange).toHaveBeenCalledWith({
         type: 'MATERIAL',
         data: expect.objectContaining({ name: '可乐糖浆' })
       });
     });
   });
   ```

2. **Implement component** (use Ant Design `<Tabs>` and `<Table>`):
   ```tsx
   /** @spec N004-procurement-material-selector */
   import { Tabs, Input, Table } from 'antd';
   import { useMaterials, useSkus } from '@/services/procurement';

   export const MaterialSkuSelector: React.FC<MaterialSkuSelectorProps> = ({
     mode,
     onChange,
     materialCategory,
   }) => {
     const [activeTab, setActiveTab] = useState<'material' | 'sku'>('material');
     const [search, setSearch] = useState('');

     const { data: materials } = useMaterials({ category: materialCategory, search });
     const { data: skus } = useSkus({ search });

     const handleTabChange = (key: string) => {
       setActiveTab(key as 'material' | 'sku');
       setSearch('');  // Reset search on tab switch (FR-014.1)
     };

     const handleSelectMaterial = (material: Material) => {
       onChange({ type: 'MATERIAL', data: material });
     };

     if (mode === 'material-only') {
       return <MaterialList materials={materials} onSelect={handleSelectMaterial} />;
     }

     if (mode === 'sku-only') {
       return <SkuList skus={skus} onSelect={handleSelectSku} />;
     }

     // mode === 'dual'
     return (
       <Tabs activeKey={activeTab} onChange={handleTabChange}>
         <Tabs.TabPane tab="物料" key="material">
           <MaterialList materials={materials} onSelect={handleSelectMaterial} />
         </Tabs.TabPane>
         <Tabs.TabPane tab="成品 SKU" key="sku">
           <SkuList skus={skus} onSelect={handleSelectSku} />
         </Tabs.TabPane>
       </Tabs>
     );
   };
   ```

3. **Run frontend tests**:
   ```bash
   cd frontend
   npm run test -- MaterialSkuSelector.test.tsx
   # Expected: All tests pass (≥70% coverage)
   ```

---

### Phase 6: API Integration (Frontend)

**Estimated Time**: 3 hours

**Test-First Approach (MSW Mocks)**:

1. **Setup MSW handlers FIRST**:
   ```typescript
   /** @spec N004-procurement-material-selector */
   // frontend/src/mocks/handlers/procurement.ts
   import { http, HttpResponse } from 'msw';

   export const procurementHandlers = [
     http.get('/api/materials', ({ request }) => {
       const url = new URL(request.url);
       const category = url.searchParams.get('category');
       const search = url.searchParams.get('search');

       // Mock material data
       const materials = mockMaterials.filter(m =>
         (!category || m.category === category) &&
         (!search || m.name.includes(search))
       );

       return HttpResponse.json({
         success: true,
         data: materials,
         total: materials.length,
         page: 0,
         pageSize: 20
       });
     }),

     http.post('/api/procurement/orders', async ({ request }) => {
       const body = await request.json();
       // Validate item type and ID consistency
       // Return mocked order DTO
     }),
   ];
   ```

2. **Implement TanStack Query hooks**:
   ```typescript
   /** @spec N004-procurement-material-selector */
   // frontend/src/services/procurement.ts
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

   export const useMaterials = (params: { category?: string; search?: string }) => {
     return useQuery({
       queryKey: ['materials', params],
       queryFn: () => fetchMaterials(params),
       staleTime: 5 * 60 * 1000,  // 5 minutes
     });
   };

   export const useCreatePurchaseOrder = () => {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: createPurchaseOrder,
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
       },
     });
   };
   ```

3. **Test in Storybook** (optional but recommended):
   ```bash
   npm run storybook
   # Navigate to MaterialSkuSelector story
   # Test all three modes: material-only, sku-only, dual
   # Verify tab navigation and search functionality
   ```

---

## Common Issues & Troubleshooting

### Issue 1: M001 Dependency Not Found

**Symptom**: Compilation error "cannot find symbol: class CommonConversionService"

**Solution**:
```bash
# Verify M001 is compiled
cd backend
./mvnw clean install -DskipTests

# Check if CommonConversionService.class exists
find target/classes -name "*CommonConversionService.class"
# Expected: .../com/cinema/unitconversion/service/CommonConversionService.class
```

### Issue 2: Database Migration Fails with CHECK Constraint Error

**Symptom**: Flyway migration fails with "violates check constraint \"check_material_sku_exclusive\""

**Solution**:
```bash
# Check if historical data has both material_id and sku_id populated
psql -h <supabase-host> -U postgres -d postgres
SELECT id, material_id, sku_id FROM purchase_order_items WHERE material_id IS NOT NULL AND sku_id IS NOT NULL;
# Expected: No rows (if found, investigate data corruption)

# If found, manually fix data before re-running migration
UPDATE purchase_order_items SET material_id = NULL WHERE sku_id IS NOT NULL;
./mvnw flyway:migrate
```

### Issue 3: Unit Conversion Returns Null

**Symptom**: Inbound operation fails with NPE when calling `conversionService.convert()`

**Solution**:
```bash
# Verify Material has conversion rate configured
psql -h <supabase-host> -U postgres -d postgres
SELECT id, code, name, purchase_unit_id, inventory_unit_id, conversion_rate, use_global_conversion
FROM material WHERE id = 'uuid-123';
# Expected: All unit fields non-null, conversion_rate > 0 if use_global_conversion = false

# Verify global conversion rule exists (if use_global_conversion = true)
SELECT * FROM unit_conversions WHERE from_unit_id = '...' AND to_unit_id = '...';
# Expected: At least one row
```

### Issue 4: Frontend Component Not Rendering Tabs

**Symptom**: `<MaterialSkuSelector mode="dual" />` shows only one list, no tabs visible

**Solution**:
```bash
# Check Ant Design Tabs import
grep "import.*Tabs" frontend/src/components/organisms/MaterialSkuSelector/index.tsx
# Expected: import { Tabs } from 'antd';

# Check activeTab state management
# Ensure setActiveTab is wired to Tabs.onChange prop
```

---

## Performance Optimization Tips

### Backend

1. **Batch fetch units in Material query**:
   ```java
   @Query("SELECT m FROM Material m LEFT JOIN FETCH m.purchaseUnit LEFT JOIN FETCH m.inventoryUnit WHERE ...")
   List<Material> findAllWithUnits(...);
   ```

2. **Use Hibernate second-level cache** for Material entities (read-heavy data)

3. **Index purchase_order_items.item_type** (already in migration script)

### Frontend

1. **Use TanStack Query pagination** for large material lists (>10,000 items)
2. **Debounce search input** (300ms delay):
   ```typescript
   const debouncedSearch = useDebounce(search, 300);
   const { data } = useMaterials({ search: debouncedSearch });
   ```

3. **Memoize table columns** to avoid re-renders:
   ```typescript
   const columns = useMemo(() => [...], []);
   ```

---

## Testing Strategy Summary

### Backend (100% coverage for critical paths)

- ✅ Unit tests: `PurchaseOrderItemTest`, `ProcurementOrderServiceTest`
- ✅ Integration tests: `ProcurementOrderControllerTest`
- ⚠️ E2E tests: Optional (Playwright test for full order creation flow)

### Frontend (≥70% coverage)

- ✅ Component tests: `MaterialSkuSelector.test.tsx`
- ✅ Hook tests: `useMaterials.test.ts`, `useCreatePurchaseOrder.test.ts`
- ⚠️ E2E tests: Optional (Playwright test for selector interaction)

---

## Deployment Checklist

Before merging to `main`:

- [ ] All unit tests pass (backend + frontend)
- [ ] Integration tests pass (backend)
- [ ] Database migration tested on staging database
- [ ] M001 dependency verified in production
- [ ] API response format validated against `contracts/api.yaml`
- [ ] Frontend component tested in Storybook
- [ ] Performance benchmarks met (NFR-001, NFR-002, NFR-003)
- [ ] Code review completed (check `@spec` annotations)
- [ ] Lark PM tasks updated (mark N004 phases complete)

---

**Quickstart Completed**: 2026-01-11
**Estimated Total Development Time**: 20 hours
**Next Step**: Begin Phase 1 (Database Migration) following TDD workflow
