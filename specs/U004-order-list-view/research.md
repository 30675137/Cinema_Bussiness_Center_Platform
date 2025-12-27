# Research Findings: 订单列表与状态查看 (Order List & Status View)

**Feature Branch**: `U004-order-list-view` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)

---

## Phase 0: Research & Technical Decisions

This document consolidates research findings to resolve technical unknowns and guide Phase 1 design decisions.

---

## 1. U001 API Integration Points

### 1.1 Order Confirmation API

**Endpoint**: `POST /api/admin/reservations/{id}/confirm`

**Request Body**:
```typescript
interface ConfirmReservationRequest {
  requiresPayment: boolean  // true: 要求客户支付, false: 直接完成(无需支付)
}
```

**Response Format**:
```typescript
interface ApiResponse<ReservationOrder> {
  success: true
  data: ReservationOrder  // Updated order with new status
  message?: string
}
```

**Status Transitions**:
- `requiresPayment: true` → PENDING → CONFIRMED (等待支付)
- `requiresPayment: false` → PENDING → COMPLETED (直接完成)

**Error Codes** (from GlobalExceptionHandler):
- `400` - Invalid request (order already confirmed/cancelled)
- `404` - Order not found
- `500` - Server error

**Implementation Location**: `frontend/src/pages/reservation-orders/services/reservationOrderService.ts:confirmReservation()`

---

### 1.2 Order Cancellation API

**Endpoint**: `POST /api/admin/reservations/{id}/cancel`

**Request Body**:
```typescript
interface CancelReservationRequest {
  cancelReasonType?: string  // Optional: 取消原因类型
  cancelReason: string       // Required: 取消原因描述
}
```

**Cancellation Reason Types** (from spec.md):
- 客户要求取消
- 场景包不可用
- 时段冲突
- 其他原因

**Response Format**:
```typescript
interface ApiResponse<ReservationOrder> {
  success: true
  data: ReservationOrder  // Updated order with status CANCELLED
  message?: string
}
```

**Error Codes**:
- `400` - Invalid request (order already cancelled/completed)
- `404` - Order not found
- `500` - Server error

**Implementation Location**: `frontend/src/pages/reservation-orders/services/reservationOrderService.ts:cancelReservation()`

---

### 1.3 Order List Endpoint with Filtering

**Finding**: ✅ **U001 already provides a comprehensive list endpoint with filtering**

**Endpoint**: `GET /api/admin/reservations`

**Query Parameters**:
```typescript
interface ReservationListQueryRequest {
  // Search filters
  orderNumber?: string           // 订单号搜索
  contactPhone?: string          // 客户手机号搜索
  statuses?: ReservationStatus[] // 状态筛选 (多选)
  scenarioPackageId?: string     // 场景包筛选

  // Time range filters
  reservationDateStart?: string  // 预订日期范围 (开始)
  reservationDateEnd?: string    // 预订日期范围 (结束)
  createdAtStart?: string        // 创建时间范围 (开始)
  createdAtEnd?: string          // 创建时间范围 (结束)

  // Pagination
  page?: number                  // 页码 (default: 1)
  size?: number                  // 每页数量 (default: 20)

  // Sorting
  sortBy?: string                // 排序字段 (default: 'createdAt')
  sortDirection?: 'asc' | 'desc' // 排序方向 (default: 'desc')
}
```

**Response Format**:
```typescript
interface ReservationListResponse {
  success: true
  data: ReservationOrder[]
  total: number      // 总记录数
  page: number       // 当前页码
  size: number       // 每页数量
  totalPages: number // 总页数
}
```

**Implementation Location**: `frontend/src/pages/reservation-orders/services/reservationOrderService.ts:getReservationList()`

**Decision**: U004 will **reuse this existing endpoint** without modification. No new backend APIs needed for list/filter functionality.

---

### 1.4 Authentication & Authorization Mechanism

**Finding**: ✅ **U001 uses JWT Bearer Token authentication**

**Token Storage**: `localStorage.getItem('auth_token')`

**Request Headers**:
```typescript
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = localStorage.getItem('auth_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}
```

**Authorization Model**:
- B端 API path: `/api/admin/reservations` (requires admin role)
- C端 API path: `/api/client/reservations` (user-specific data)

**Token Handling**:
- Token stored in localStorage after login
- Automatically attached to all API requests via `Authorization` header
- Token expiration handled by backend (401 Unauthorized response)

**Decision**: U004 will follow the same authentication pattern. No changes needed.

---

## 2. Ant Design Component Best Practices

### 2.1 Table vs List Component for Order Display

**Research Question**: Should we use `<Table>` or `<List>` for displaying orders?

**Comparison**:

| Feature | Table | List |
|---------|-------|------|
| **Data density** | High (columnar layout) | Medium (row-based layout) |
| **Mobile responsive** | Poor (horizontal scroll) | Good (stacks naturally) |
| **Sorting** | Built-in column sorting | Manual implementation |
| **Filtering** | Built-in column filters | Manual implementation |
| **Expandable rows** | Built-in `expandable` prop | Manual drawer/modal |
| **Performance** | Virtual scrolling with `rc-virtual-list` | Simpler DOM structure |
| **Use case** | Data-heavy admin interfaces | Content-focused displays |

**Decision**: ✅ **Use `<Table>` component** for the following reasons:
1. B端 admin interface (desktop-only, no mobile requirement in spec)
2. Multiple columns needed (订单号, 客户, 场景包, 时段, 状态, 金额, 时间)
3. Built-in sorting and filtering capabilities
4. Ant Design 6.1.0 includes virtual scrolling for large datasets
5. Better user experience for operations staff (familiar data table UX)

**Implementation Pattern**:
```typescript
<Table<ReservationOrder>
  columns={columns}
  dataSource={orders}
  rowKey="id"
  loading={isLoading}
  pagination={{
    current: page,
    pageSize: size,
    total: total,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条记录`,
  }}
  onChange={handleTableChange}
/>
```

---

### 2.2 Drawer Component for Order Details

**Research Question**: What are the recommended settings for Ant Design Drawer?

**Best Practices** (from Ant Design docs and common patterns):

| Setting | Recommended Value | Reason |
|---------|------------------|--------|
| **width** | `720px` | Optimal for detailed content (not too wide, not cramped) |
| **placement** | `right` | Standard for detail panels in admin interfaces |
| **closable** | `true` | Show close button (X) in top-right |
| **maskClosable** | `true` | Allow clicking mask to close (intuitive UX) |
| **destroyOnClose** | `true` | Reset state when closed (avoid stale data) |
| **keyboard** | `true` | Allow ESC key to close |

**Implementation Pattern**:
```typescript
<Drawer
  title={`订单详情 - ${order.orderNumber}`}
  width={720}
  placement="right"
  closable={true}
  maskClosable={true}
  destroyOnClose={true}
  keyboard={true}
  open={drawerVisible}
  onClose={handleCloseDrawer}
  footer={
    order.status === 'PENDING' ? (
      <Space>
        <Button onClick={handleConfirm}>确认订单</Button>
        <Button onClick={handleCancel}>取消订单</Button>
        <Button onClick={handleCloseDrawer}>关闭</Button>
      </Space>
    ) : (
      <Button onClick={handleCloseDrawer}>关闭</Button>
    )
  }
>
  {/* Order detail content */}
</Drawer>
```

**Animation**: Default slide-in animation (300ms) is appropriate, no customization needed.

---

### 2.3 Tag Component for Status Display

**Research Question**: How to configure Tag component for order status?

**Best Practices** (from U001 implementation):

```typescript
export const RESERVATION_STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; color: string; badgeStatus: 'default' | 'processing' | 'success' | 'error' | 'warning' }
> = {
  PENDING: { label: '待确认', color: 'gold', badgeStatus: 'warning' },      // 橙色
  CONFIRMED: { label: '已确认', color: 'blue', badgeStatus: 'processing' },  // 蓝色
  COMPLETED: { label: '已完成', color: 'green', badgeStatus: 'success' },    // 绿色
  CANCELLED: { label: '已取消', color: 'default', badgeStatus: 'default' },  // 灰色
}
```

**Implementation Pattern**:
```typescript
const OrderStatusTag: React.FC<{ status: ReservationStatus }> = ({ status }) => {
  const config = RESERVATION_STATUS_CONFIG[status]
  return <Tag color={config.color}>{config.label}</Tag>
}
```

**Decision**: ✅ **Reuse existing `RESERVATION_STATUS_CONFIG`** from U001 for consistency.

---

## 3. TanStack Query Pagination Patterns

### 3.1 Cursor-Based vs Offset-Based Pagination

**Research Question**: Which pagination strategy should U004 use?

**Comparison**:

| Strategy | Pros | Cons | Use Case |
|----------|------|------|----------|
| **Offset-Based** | - Simple implementation<br>- Easy page jumping<br>- Total count available | - Performance degrades with large offsets<br>- Inconsistent results if data changes | Admin interfaces with stable datasets |
| **Cursor-Based** | - Consistent performance<br>- Real-time data safe | - No total count<br>- No page jumping<br>- More complex implementation | Real-time feeds, infinite scroll |

**Decision**: ✅ **Use Offset-Based Pagination** for the following reasons:
1. Admin interface requires page jumping (e.g., "go to page 5")
2. Total count needed for pagination controls (`共 100 条记录`)
3. Order data is relatively stable (not real-time feed)
4. U001 backend already implements offset-based pagination
5. Performance acceptable with proper database indexing (see section 4.1)

**Implementation Pattern**:
```typescript
export const useOrders = (params: OrderListParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
    staleTime: 30 * 1000,  // 30 seconds
    keepPreviousData: true, // Keep old data while fetching new page
  })
}
```

---

### 3.2 Caching Strategies for Filtered Lists

**Best Practices**:

1. **Query Key Structure**: Include all filter params in query key
   ```typescript
   queryKey: ['orders', { status, dateRange, phone, page, size }]
   ```

2. **Stale Time**: 30 seconds for order list (balance freshness vs performance)
   ```typescript
   staleTime: 30 * 1000
   ```

3. **Cache Time**: 5 minutes (keep in cache even if component unmounts)
   ```typescript
   cacheTime: 5 * 60 * 1000
   ```

4. **Keep Previous Data**: Show old data while fetching new page
   ```typescript
   keepPreviousData: true
   ```

**Decision**: Use TanStack Query's built-in caching with the settings above.

---

### 3.3 Invalidation Patterns After Status Change

**Research Question**: How to refresh order list after confirm/cancel operations?

**Best Practice**: Use `queryClient.invalidateQueries()` pattern

```typescript
export const useConfirmOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, requiresPayment }: ConfirmOrderParams) =>
      confirmReservation(id, { requiresPayment }),
    onSuccess: () => {
      // Invalidate all order list queries (all filter combinations)
      queryClient.invalidateQueries({ queryKey: ['orders'] })

      // Show success message
      message.success('订单确认成功')
    },
    onError: (error) => {
      message.error('订单确认失败，请重试')
    }
  })
}
```

**Alternative**: Optimistic Update (more complex, better UX)
```typescript
onMutate: async (params) => {
  await queryClient.cancelQueries({ queryKey: ['orders'] })
  const previousOrders = queryClient.getQueryData(['orders', currentParams])

  queryClient.setQueryData(['orders', currentParams], (old) => {
    // Update order status optimistically
  })

  return { previousOrders }
},
onError: (err, params, context) => {
  // Rollback on error
  queryClient.setQueryData(['orders', currentParams], context.previousOrders)
}
```

**Decision**: ✅ **Use simple invalidation pattern** (not optimistic update) for MVP. Optimistic update can be added later if needed.

---

## 4. Supabase PostgreSQL Query Optimization

### 4.1 Indexing Strategies for `reservation_orders` Table

**Research Question**: What indexes are needed for efficient filtering?

**Current Indexes** (assumed from U001 implementation):
- Primary key: `id` (UUID)
- Unique key: `order_number`

**Recommended Additional Indexes** for U004 filtering:

```sql
-- Status filtering (most common filter)
CREATE INDEX idx_reservation_orders_status ON reservation_orders(status);

-- Created time range filtering + sorting
CREATE INDEX idx_reservation_orders_created_at ON reservation_orders(created_at DESC);

-- Customer phone search
CREATE INDEX idx_reservation_orders_contact_phone ON reservation_orders(contact_phone);

-- Composite index for status + time filtering (common combination)
CREATE INDEX idx_reservation_orders_status_created_at
ON reservation_orders(status, created_at DESC);
```

**Decision**: Add these indexes in Phase 1 design (data-model.md).

---

### 4.2 Full-Text Search for Phone Number

**Research Question**: Should we use PostgreSQL full-text search or simple LIKE query?

**Comparison**:

| Approach | Pros | Cons |
|----------|------|------|
| **LIKE query** | - Simple implementation<br>- Works with B-tree index | - No fuzzy matching<br>- Exact substring only |
| **Full-text search** | - Fuzzy matching<br>- Tokenization | - Overkill for 11-digit phone numbers<br>- More complex indexing |

**Decision**: ✅ **Use simple LIKE query** for phone number search:
```sql
WHERE contact_phone LIKE '%' || :searchTerm || '%'
```

**Reason**: Phone numbers are standardized 11-digit strings. LIKE with index is sufficient. No need for full-text search complexity.

---

### 4.3 Supabase RLS (Row-Level Security) Policies

**Research Question**: Are RLS policies needed for order access control?

**Finding**: U001 likely uses **application-level authorization** (not RLS) based on:
- B端 API path: `/api/admin/reservations` (Spring Boot checks admin role)
- C端 API path: `/api/client/reservations` (Spring Boot checks userId)

**Decision**: ✅ **No RLS policies needed**. Authorization handled by Spring Boot middleware.

---

## 5. Phone Number Search Implementation

### 5.1 Real-Time vs Debounced Search

**Research Question**: Should search trigger on every keystroke or after user stops typing?

**Comparison**:

| Approach | UX | Performance | Implementation |
|----------|----|-----------|--------------|-|
| **Real-time** | Instant feedback | High API load (every keystroke) | Simple |
| **Debounced** | Slight delay (300-500ms) | Reduced API load | Need debounce logic |

**Decision**: ✅ **Use Debounced Search (500ms delay)**

**Implementation Pattern**:
```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const [phoneSearch, setPhoneSearch] = useState('')
const debouncedPhone = useDebouncedValue(phoneSearch, 500) // 500ms delay

const { data } = useOrders({
  contactPhone: debouncedPhone,
  // ... other params
})
```

**Reason**: Balance UX (no excessive delay) and performance (reduce API calls).

---

### 5.2 Partial Match vs Exact Match

**Research Question**: Should search match partial phone numbers or exact only?

**Decision**: ✅ **Partial Match (Contains)**

**SQL Implementation**:
```sql
WHERE contact_phone LIKE '%' || :searchTerm || '%'
```

**Examples**:
- Search "1380" → matches "13800138000", "13801234567", etc.
- Search "8000" → matches "13800138000", "15812348000", etc.

**Reason**: Users may only remember part of the phone number. Partial match improves findability.

---

### 5.3 Input Sanitization for Phone Numbers

**Research Question**: How to handle phone number format variations?

**Common Variations**:
- With spaces: "138 0013 8000"
- With dashes: "138-0013-8000"
- With country code: "+86 138 0013 8000"

**Decision**: ✅ **Strip non-digit characters on frontend before sending to API**

**Implementation Pattern**:
```typescript
const sanitizePhone = (input: string): string => {
  return input.replace(/\D/g, '') // Remove all non-digit characters
}

const handlePhoneSearch = (value: string) => {
  setPhoneSearch(sanitizePhone(value))
}
```

**Reason**: Simplify backend query logic. Store phone numbers as pure digits in database.

---

## 6. Unknowns Resolution Summary

| Unknown | Answer |
|---------|--------|
| **U001 order confirmation API structure** | ✅ `POST /api/admin/reservations/{id}/confirm` with `{ requiresPayment: boolean }` |
| **U001 order cancellation API structure** | ✅ `POST /api/admin/reservations/{id}/cancel` with `{ cancelReasonType?, cancelReason }` |
| **U001 list endpoint with filtering** | ✅ Exists: `GET /api/admin/reservations` with comprehensive query params |
| **Existing database indexes** | ⚠️ Assumed primary key + unique order_number. Need to add status, created_at, contact_phone indexes |
| **Expected order volume per cinema** | ⚠️ Unknown (need to ask product team). **Assumption**: ~1000 orders/month per cinema → pagination size 20-50 is appropriate |
| **Existing Ant Design customizations** | ✅ No custom theme. Use default Ant Design 6.1.0 theme |
| **Authentication mechanism** | ✅ JWT Bearer token stored in localStorage, attached via `Authorization` header |

**Action Items**:
- [ ] Confirm expected order volume with product team (affects pagination size, virtual scrolling decision)
- [ ] Add database indexes in Phase 1 design
- [ ] Document API integration points in contracts/api.yaml

---

## 7. Design Decisions Summary

### 7.1 API Strategy
- ✅ **Reuse U001 endpoints**: No new backend APIs needed
- ✅ **Authentication**: JWT Bearer token (existing pattern)
- ✅ **Pagination**: Offset-based (page + size)

### 7.2 Frontend Architecture
- ✅ **Component Choice**: Ant Design `<Table>` for order list
- ✅ **Detail View**: Ant Design `<Drawer>` (720px width, right placement)
- ✅ **Status Display**: Reuse `RESERVATION_STATUS_CONFIG` from U001
- ✅ **State Management**: Zustand for UI state, TanStack Query for server state

### 7.3 Performance Optimizations
- ✅ **Caching**: TanStack Query (30s stale time, 5min cache time)
- ✅ **Search Debounce**: 500ms delay
- ✅ **Pagination**: Default 20 items per page, support 10/20/50/100
- ✅ **Database Indexes**: Add status, created_at, contact_phone indexes

### 7.4 UX Patterns
- ✅ **Search**: Partial match with debounce
- ✅ **Phone Sanitization**: Strip non-digits on frontend
- ✅ **Status Change**: Simple invalidation (not optimistic update)

---

## 8. Next Steps

**Phase 1 Deliverables**:
1. **data-model.md**: Entity definitions for Order, OrderStatus, FilterState, PaginationState
2. **contracts/api.yaml**: OpenAPI spec documenting U001 integration points
3. **contracts/types.ts**: Shared TypeScript types (reuse from U001 where possible)
4. **quickstart.md**: Development setup guide (environment, running dev server, mock data)

**Phase 2 Tasks** (via `/speckit.tasks`):
- Implement components (OrderList, OrderDetailDrawer, FilterBar, SearchBar, OrderStatusTag)
- Implement hooks (useOrders, useOrderFilters, useOrderActions)
- Implement services (reuse U001 APIs)
- Write tests (Vitest unit tests, Playwright e2e tests)

---

**Research Version**: 1.0.0
**Last Updated**: 2025-12-27
**Next Command**: Continue to Phase 1 design artifact generation
