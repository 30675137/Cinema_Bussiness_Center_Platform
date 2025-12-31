# Research: 饮品模块复用SKU管理能力

**@spec O004-beverage-sku-reuse**
**Phase 0 Output** | **Date**: 2025-12-31

## Research Questions & Findings

### Q1: How to implement SKU selector filter logic (only show finished_product type)?

**Decision**: Use query parameter-based filtering at API level + client-side type guard

**Rationale**:
- Backend API endpoint `/api/skus` should support query parameter `?type=finished_product` to filter SKUs by type
- Client-side SKU selector component wraps Ant Design `Select` component with default filter parameter
- Type guard ensures only `SkuType.FINISHED_PRODUCT` SKUs are rendered, even if API returns mixed types (defense in depth)
- Reusable pattern: other components can filter by `type=packaging` or `type=raw_material` using same mechanism

**Alternatives Considered**:
- **Client-side-only filtering** (load all SKUs, filter in browser) - Rejected because:
  - Poor performance with 1000+ SKU records (network bandwidth waste)
  - No server-side enforcement (relies entirely on UI code correctness)
- **Hard-coded beverage-specific API endpoint** (`/api/beverages/skus`) - Rejected because:
  - Creates duplicate logic (not reusable for future BOM/recipe use cases)
  - Violates DRY principle (SKU query logic should be generic)

**Implementation Pattern**:
```typescript
// Frontend: SKUSelectorModal.tsx
interface SKUSelectorModalProps {
  skuType?: SkuType; // 'finished_product' | 'packaging' | 'raw_material'
  onSelect: (sku: SKU) => void;
}

const SKUSelectorModal = ({ skuType = SkuType.FINISHED_PRODUCT, onSelect }: SKUSelectorModalProps) => {
  const { data: skus } = useQuery({
    queryKey: ['skus', { type: skuType }],
    queryFn: () => fetchSkus({ type: skuType }),
  });

  return (
    <Select
      options={skus?.filter(sku => sku.type === skuType)} // Type guard
      onChange={(skuId) => onSelect(skus.find(s => s.id === skuId)!)}
    />
  );
};
```

```java
// Backend: SKUController.java
@GetMapping("/api/skus")
public ResponseEntity<ApiResponse<List<SKU>>> getSkus(
    @RequestParam(required = false) String type,
    @RequestParam(required = false) String category
) {
    List<SKU> skus = skuService.findSkus(type, category);
    return ResponseEntity.ok(ApiResponse.success(skus));
}
```

---

### Q2: What is the best data migration strategy for beverage_config → skus table?

**Decision**: One-time SQL migration script + mapping table for backward compatibility

**Rationale**:
- **One-time migration**: Run SQL script once during deployment to convert existing `beverage_config` records to `skus` table
- **Mapping table**: Create `beverage_sku_mapping` table to record `old_beverage_id → new_sku_id` relationships
- **Idempotent script**: Support re-running migration script without duplicating data (use `INSERT ... ON CONFLICT DO NOTHING`)
- **Rollback plan**: Keep original `beverage_config` table as backup (mark as deprecated, do not delete)

**Alternatives Considered**:
- **Manual data entry** (运营人员手动重新创建所有饮品) - Rejected because:
  - Error-prone and time-consuming (10-100 records to manually re-enter)
  - Risk of data loss (historical price/status/category information may be lost)
- **Dual-write strategy** (write to both tables simultaneously) - Rejected because:
  - Adds complexity to application code (two write paths to maintain)
  - No clear timeline for deprecating old table (dual-write may persist indefinitely)
- **Soft migration** (redirect UI but keep old data) - Rejected because:
  - Data inconsistency risk (operators may edit in SKU UI, but old beverage data remains stale)
  - Does not solve the root problem (duplicate logic still exists)

**Migration Script Pattern**:
```sql
-- Migration: beverage_config → skus table
-- File: backend/src/main/resources/db/migration/V2025_12_31_001__migrate_beverages_to_skus.sql

-- Step 1: Create mapping table
CREATE TABLE IF NOT EXISTS beverage_sku_mapping (
    old_beverage_id UUID PRIMARY KEY,
    new_sku_id UUID NOT NULL REFERENCES skus(id),
    migrated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Migrate beverage_config data to skus table
INSERT INTO skus (id, sku_code, sku_name, sku_type, category_id, price, unit, status, created_at, updated_at)
SELECT
    gen_random_uuid() AS id,
    CONCAT('FIN-', UPPER(REPLACE(name, ' ', '-')), '-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')) AS sku_code,
    name AS sku_name,
    'finished_product' AS sku_type,
    category_id,
    price,
    '份' AS unit,
    CASE WHEN enabled THEN 'enabled' ELSE 'disabled' END AS status,
    created_at,
    updated_at
FROM beverage_config
WHERE NOT EXISTS (
    SELECT 1 FROM beverage_sku_mapping WHERE old_beverage_id = beverage_config.id
)
ON CONFLICT (sku_code) DO NOTHING
RETURNING id INTO beverage_sku_mapping (new_sku_id);

-- Step 3: Record mapping
INSERT INTO beverage_sku_mapping (old_beverage_id, new_sku_id)
SELECT b.id AS old_beverage_id, s.id AS new_sku_id
FROM beverage_config b
JOIN skus s ON s.sku_name = b.name AND s.sku_type = 'finished_product'
WHERE NOT EXISTS (SELECT 1 FROM beverage_sku_mapping WHERE old_beverage_id = b.id)
ON CONFLICT (old_beverage_id) DO NOTHING;

-- Step 4: Mark beverage_config as deprecated (add comment)
COMMENT ON TABLE beverage_config IS 'DEPRECATED: Migrated to skus table. See beverage_sku_mapping for id mapping.';
```

**Rollback Plan**:
```sql
-- Rollback: Delete migrated SKUs and mapping
DELETE FROM skus WHERE id IN (SELECT new_sku_id FROM beverage_sku_mapping);
DELETE FROM beverage_sku_mapping;
```

---

### Q3: How to integrate React Hook Form + Ant Design Select for SKU creation form?

**Decision**: Use `Controller` component from React Hook Form to wrap Ant Design Form components

**Rationale**:
- React Hook Form's `Controller` provides seamless integration with controlled components (Ant Design Form)
- Ant Design Form.Item + Controller pattern maintains validation consistency (Zod schema + Ant Design UI feedback)
- Performance benefits: React Hook Form uses uncontrolled components internally, reduces re-renders

**Alternatives Considered**:
- **Ant Design Form only** (without React Hook Form) - Rejected because:
  - Less type-safe (no Zod integration out-of-the-box)
  - More verbose validation code (manual validation logic in Ant Design)
- **React Hook Form only** (replace Ant Design Form with native inputs) - Rejected because:
  - Loses Ant Design's consistent UI styling and layout utilities
  - Requires custom styling to match existing B端 design system

**Implementation Pattern**:
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Select } from 'antd';
import { z } from 'zod';

const skuSchema = z.object({
  skuCode: z.string().min(1, 'SKU编码不能为空').regex(/^FIN-[A-Z]+-\d{3}$/, 'SKU编码格式不正确'),
  skuName: z.string().min(1, 'SKU名称不能为空').max(50, 'SKU名称最多50字符'),
  skuType: z.enum(['finished_product', 'packaging', 'raw_material']),
  categoryId: z.string().uuid('请选择分类'),
  price: z.number().positive('价格必须大于0'),
  unit: z.string().min(1, '单位不能为空'),
});

type SKUFormData = z.infer<typeof skuSchema>;

const SKUCreateForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<SKUFormData>({
    resolver: zodResolver(skuSchema),
    defaultValues: {
      skuType: 'finished_product',
      unit: '份',
    },
  });

  const onSubmit = (data: SKUFormData) => {
    createSKU(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Controller
        name="skuName"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="SKU名称"
            validateStatus={errors.skuName ? 'error' : ''}
            help={errors.skuName?.message}
          >
            <Input {...field} placeholder="薄荷威士忌鸡尾酒" />
          </Form.Item>
        )}
      />

      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="分类"
            validateStatus={errors.categoryId ? 'error' : ''}
            help={errors.categoryId?.message}
          >
            <Select {...field} placeholder="请选择分类">
              <Select.Option value="cat-cocktail">饮品 > 鸡尾酒</Select.Option>
              <Select.Option value="cat-juice">饮品 > 果汁</Select.Option>
            </Select>
          </Form.Item>
        )}
      />

      {/* Other form fields... */}
    </Form>
  );
};
```

**Best Practices**:
- Use Zod schema as single source of truth for validation rules
- Map Zod errors to Ant Design Form.Item `validateStatus` and `help` props
- Prefer `Controller` over `register` for Ant Design components (controlled components)
- Extract form schema to separate file (`skuFormSchema.ts`) for reusability in edit forms

---

### Q4: What is the optimal TanStack Query caching strategy for SKU data?

**Decision**: Aggressive caching with smart invalidation + background refetching

**Rationale**:
- SKU data changes infrequently (created/updated by operators, not user-facing rapid changes)
- Long `staleTime` (5 minutes) reduces unnecessary refetches during operator workflows
- Background refetching ensures data freshness when tab regains focus or network reconnects
- Query key structure enables fine-grained invalidation (by SKU type, category, or specific SKU ID)

**Alternatives Considered**:
- **Short staleTime (30 seconds)** - Rejected because:
  - Unnecessary network traffic (SKU data doesn't change every 30 seconds)
  - Poor user experience (spinner/loading state interrupts operator workflows)
- **No caching (staleTime: 0)** - Rejected because:
  - Defeats the purpose of TanStack Query (constant refetches)
  - Poor performance (every modal open triggers API call)
- **Infinite staleTime** (never refetch automatically) - Rejected because:
  - Data staleness risk (operator A creates SKU, operator B doesn't see it until manual refresh)
  - Requires complex manual invalidation logic throughout the app

**Caching Strategy**:
```typescript
// frontend/src/services/skuService.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query key factory (enables fine-grained invalidation)
export const skuKeys = {
  all: ['skus'] as const,
  lists: () => [...skuKeys.all, 'list'] as const,
  list: (filters: { type?: string; category?: string }) =>
    [...skuKeys.lists(), filters] as const,
  details: () => [...skuKeys.all, 'detail'] as const,
  detail: (id: string) => [...skuKeys.details(), id] as const,
};

// SKU list query (with filters)
export const useSkus = (filters: { type?: string; category?: string }) => {
  return useQuery({
    queryKey: skuKeys.list(filters),
    queryFn: () => fetchSkus(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (SKU data changes infrequently)
    gcTime: 10 * 60 * 1000, // 10 minutes (keep in cache even when unused)
    refetchOnWindowFocus: true, // Refresh when tab regains focus
    refetchOnReconnect: true, // Refresh when network reconnects
  });
};

// SKU detail query
export const useSku = (id: string) => {
  return useQuery({
    queryKey: skuKeys.detail(id),
    queryFn: () => fetchSku(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id, // Only fetch if id is provided
  });
};

// SKU creation mutation (with smart invalidation)
export const useCreateSKU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSKU,
    onSuccess: (newSKU) => {
      // Invalidate all SKU lists (including filtered lists)
      queryClient.invalidateQueries({ queryKey: skuKeys.lists() });

      // Optimistically set the new SKU in detail cache
      queryClient.setQueryData(skuKeys.detail(newSKU.id), newSKU);
    },
  });
};

// SKU update mutation
export const useUpdateSKU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SKU> }) =>
      updateSKU(id, data),
    onSuccess: (updatedSKU) => {
      // Invalidate SKU lists (in case type/category changed)
      queryClient.invalidateQueries({ queryKey: skuKeys.lists() });

      // Update detail cache
      queryClient.setQueryData(skuKeys.detail(updatedSKU.id), updatedSKU);
    },
  });
};
```

**Cache Invalidation Rules**:
- **Create SKU**: Invalidate all lists (new SKU should appear in filtered lists)
- **Update SKU**: Invalidate all lists (type/category may have changed, affecting filter results) + update detail cache
- **Delete SKU**: Invalidate all lists + remove from detail cache
- **Batch operations**: Invalidate all lists after batch completes

**Performance Optimization**:
- Use `refetchOnMount: false` for detail queries (rely on cache if data is fresh)
- Prefetch SKU list when hovering over "新增SKU" button (instant modal open)
- Use `keepPreviousData: true` for paginated lists (smooth page transitions)

---

## Summary

All research questions have been resolved with clear decisions, implementation patterns, and trade-off analysis. Key takeaways:

1. **SKU Selector**: API-level filtering + client-side type guard (defense in depth)
2. **Data Migration**: One-time SQL script + mapping table (idempotent, rollback-safe)
3. **Form Handling**: React Hook Form + Ant Design via `Controller` pattern (type-safe, consistent UI)
4. **Caching Strategy**: Aggressive caching (5min staleTime) + smart invalidation (fine-grained query keys)

**Next Phase**: Generate `data-model.md` (Phase 1) to define entities and relationships based on these research findings.
