# 技术研究: 商品订单列表查看与管理

**Feature**: O001-product-order-list
**Created**: 2025-12-27

## 研究目标

为商品订单列表功能选择合适的技术方案，确保满足性能、可维护性和用户体验需求。

---

## 决策 1: 前端路由方案

**决策**: 使用 React Router 7.10.1 的嵌套路由模式

**理由**:
- 项目已采用 React Router 7.10.1 作为标准路由库
- 订单列表（`/orders/list`）和订单详情（`/orders/:id`）是典型的父子路由关系
- React Router 7 支持代码分割和懒加载，有利于性能优化
- 与 Ant Design 的 Pro-Layout 集成良好

**考虑的替代方案**:
- Next.js App Router - 过重，不适合纯 SPA 管理后台
- TanStack Router - 新兴方案，团队不熟悉

**实现要点**:
```typescript
// routes/orders.tsx
export const ordersRoutes = {
  path: '/orders',
  children: [
    { path: 'list', element: <OrderListPage /> },
    { path: ':id', element: <OrderDetailPage /> }
  ]
}
```

---

## 决策 2: 数据查询与缓存策略

**决策**: 使用 TanStack Query 5.90.12 + 分页查询 + 智能缓存

**理由**:
- 项目标准状态管理方案（constitution 规定）
- 内置分页支持、自动缓存、后台刷新
- 乐观更新机制适合订单状态变更场景
- 支持请求去重和并发控制

**核心策略**:
1. **订单列表查询**
   - `staleTime`: 30秒（避免频繁请求）
   - `cacheTime`: 5分钟（用户返回时快速加载）
   - 使用 `keepPreviousData: true` 保持翻页流畅

2. **订单详情查询**
   - `staleTime`: 1分钟
   - 从列表跳转时预填充缓存（减少等待）

3. **状态变更**
   - 乐观更新：立即更新 UI，失败后回滚
   - `onSuccess` 回调：刷新列表查询

**考虑的替代方案**:
- SWR - 功能类似但 TanStack Query 更成熟
- Redux Toolkit Query - 过于重量级

**实现示例**:
```typescript
// hooks/useOrders.ts
export const useOrders = (params: OrderQueryParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
    staleTime: 30 * 1000,
    keepPreviousData: true
  })
}
```

---

## 决策 3: 表格组件方案

**决策**: 使用 Ant Design Table 组件 + 虚拟滚动插件（超大数据量时）

**理由**:
- Ant Design 6.1.0 的 Table 组件功能完善（排序、筛选、分页）
- 内置支持 TanStack Query 的 loading/pagination 状态
- 提供 `rowSelection` 支持批量操作（未来扩展）
- 社区插件 `rc-virtual-list` 支持虚拟滚动（50000+ 条数据）

**性能优化**:
- 服务端分页：每页 20 条（避免客户端内存压力）
- 使用 `rowKey={record => record.id}` 优化 DOM diff
- 避免在 `render` 函数中创建新对象（使用 useMemo）

**考虑的替代方案**:
- TanStack Table - 更灵活但需要更多配置
- Ag-Grid - 功能强大但需商业授权

**列配置示例**:
```typescript
const columns: ColumnsType<Order> = [
  { title: '订单号', dataIndex: 'orderNumber', fixed: 'left' },
  { title: '用户', dataIndex: 'userName', width: 120 },
  { title: '商品', dataIndex: 'productSummary', ellipsis: true },
  { title: '金额', dataIndex: 'totalAmount', align: 'right', render: formatCurrency },
  { title: '状态', dataIndex: 'status', render: renderStatusTag },
  { title: '创建时间', dataIndex: 'createdAt', sorter: true }
]
```

---

## 决策 4: 筛选器实现方案

**决策**: 使用 Ant Design Form + URL 查询参数同步

**理由**:
- Form.useForm() 提供统一的表单状态管理
- 筛选条件持久化到 URL（刷新页面保持筛选状态）
- 使用 `react-router-dom` 的 `useSearchParams` 同步 URL
- 支持重置功能（一键清空筛选条件）

**URL 格式**:
```
/orders/list?status=paid&startDate=2025-12-01&endDate=2025-12-27&search=138
```

**实现要点**:
```typescript
const [searchParams, setSearchParams] = useSearchParams()
const [form] = Form.useForm()

// 初始化表单值从 URL
useEffect(() => {
  form.setFieldsValue({
    status: searchParams.get('status'),
    dateRange: [searchParams.get('startDate'), searchParams.get('endDate')],
    search: searchParams.get('search')
  })
}, [searchParams])

// 表单提交同步到 URL
const handleSubmit = (values) => {
  setSearchParams({
    status: values.status,
    startDate: values.dateRange?.[0],
    endDate: values.dateRange?.[1],
    search: values.search
  })
}
```

---

## 决策 5: 订单号生成算法

**决策**: 服务端生成 `ORD + YYYYMMDD + 6位随机字母数字`

**理由**:
- 避免客户端时间不准确问题
- 服务端可保证唯一性（通过数据库约束）
- 6位随机码空间：(26+26+10)^6 ≈ 568亿，单日唯一性充足
- 日期前缀便于人工查询和归档

**实现算法（Java后端）**:
```java
public String generateOrderNumber() {
    String datePrefix = "ORD" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    String randomSuffix = RandomStringUtils.randomAlphanumeric(6).toUpperCase();
    return datePrefix + randomSuffix;
}
```

**防冲突机制**:
- 数据库添加唯一索引：`CREATE UNIQUE INDEX idx_order_number ON product_orders(order_number)`
- 生成时捕获唯一性异常，重试最多 3 次

---

## 决策 6: 手机号脱敏方案

**决策**: 前端脱敏 + 后端权限控制

**理由**:
- 前端脱敏（`138****8000`）保护用户隐私
- 后端根据用户权限返回完整或脱敏手机号
- 避免敏感数据泄露到前端缓存

**实现层次**:
1. **后端策略**:
   ```java
   if (!user.hasRole("ADMIN")) {
       order.setUserPhone(maskPhone(order.getUserPhone()));
   }
   ```

2. **前端工具函数**:
   ```typescript
   export const maskPhone = (phone: string): string => {
       return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
   }
   ```

---

## 决策 7: 订单导出实现方案

**决策**: 后端流式生成 + 前端下载链接

**理由**:
- 大数据量导出（10000+ 条）不适合一次性加载到内存
- 使用 Apache POI（Excel）或 CSV Writer 流式写入
- 前端接收下载 URL，触发浏览器下载

**Excel 导出（推荐）**:
- 库：Apache POI 5.x（支持 .xlsx 格式）
- 样式：标题行加粗、金额列右对齐、日期列格式化
- 性能：SXSSFWorkbook 流式写入（内存占用低）

**CSV 导出（轻量级）**:
- 库：OpenCSV 或手动拼接
- 编码：UTF-8 with BOM（Excel 兼容中文）

**API 设计**:
```
POST /api/orders/export
Request: { format: 'xlsx' | 'csv', filters: OrderQueryParams }
Response: { downloadUrl: '/downloads/orders-20251227.xlsx' }
```

---

## 决策 8: 乐观锁实现方案

**决策**: 使用 Supabase 的 `version` 字段 + 条件更新

**理由**:
- Supabase/PostgreSQL 支持乐观锁模式
- 通过 `version` 字段防止并发更新冲突
- 更新失败时返回 409 Conflict，前端提示用户刷新

**数据库设计**:
```sql
ALTER TABLE product_orders ADD COLUMN version INTEGER DEFAULT 1;
```

**更新逻辑**:
```java
public void updateOrderStatus(UUID id, int version, OrderStatus newStatus) {
    int updated = orderRepository.updateWithVersion(id, version, newStatus);
    if (updated == 0) {
        throw new OptimisticLockException("订单已被他人修改，请刷新后重试");
    }
}
```

**前端处理**:
```typescript
try {
  await updateOrderStatus({ id, version, status })
} catch (error) {
  if (error.status === 409) {
    message.warning('订单已被他人修改，请刷新后重试')
    refetch() // 重新获取最新数据
  }
}
```

---

## 决策 9: 时间筛选默认值策略

**决策**: 默认显示近 30 天订单 + 提示超期数据需手动筛选

**理由**:
- 平衡性能和实用性（大部分订单处理发生在近期）
- 减少数据库查询压力（加快首屏加载）
- 历史订单需求通过时间筛选满足（不影响功能完整性）

**实现**:
```typescript
const defaultDateRange = useMemo(() => {
  const end = dayjs()
  const start = dayjs().subtract(30, 'days')
  return [start, end]
}, [])
```

**用户提示**:
- 列表顶部显示：「当前显示近 30 天订单，查看更多请使用时间筛选」

---

## 决策 10: API 响应格式标准

**决策**: 遵循项目统一的 API 响应格式（constitution 规定）

**成功响应**:
```json
{
  "success": true,
  "data": [...],
  "total": 1250,
  "page": 1,
  "pageSize": 20,
  "message": "查询成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "ORD_NTF_001",
  "message": "订单不存在",
  "details": { "orderId": "xxx" },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**错误编号规范**:
- `ORD_NTF_001` - 订单未找到
- `ORD_VAL_001` - 订单参数验证失败
- `ORD_BIZ_001` - 订单状态不允许此操作
- `ORD_DUP_001` - 订单号重复冲突

---

## 技术选型总结

| 技术领域 | 选择方案 | 版本 |
|---------|---------|------|
| 前端框架 | React | 19.2.0 |
| UI 组件库 | Ant Design | 6.1.0 |
| 路由 | React Router | 7.10.1 |
| 状态管理 | Zustand + TanStack Query | 5.0.9 + 5.90.12 |
| 表单验证 | React Hook Form + Zod | 7.68.0 + 4.1.13 |
| Mock 数据 | MSW | 2.12.4 |
| 日期处理 | dayjs | 1.11.19 |
| 后端框架 | Spring Boot | 3.x |
| 数据库 | Supabase (PostgreSQL) | - |
| Excel 导出 | Apache POI | 5.x |
| CSV 导出 | OpenCSV | 5.x |

---

## 风险与缓解策略

### 风险 1: 大数据量性能问题

**缓解措施**:
- 服务端分页（每页 20 条）
- 数据库索引优化（订单号、状态、创建时间）
- 前端虚拟滚动（仅在必要时）
- 默认 30 天时间窗口

### 风险 2: 并发更新冲突

**缓解措施**:
- 乐观锁机制（version 字段）
- 清晰的冲突提示
- 自动刷新最新数据

### 风险 3: 导出功能超时

**缓解措施**:
- 流式生成（避免内存溢出）
- 异步导出（大数据量时）
- 限制单次导出上限（10000 条）

---

## 后续待确认事项

1. **订单详情页布局** - 使用 Ant Design Descriptions 还是自定义卡片布局？
2. **批量操作优先级** - 是否在 MVP 阶段实现批量发货？
3. **实时通知** - 订单状态变更是否需要 WebSocket 推送？

（这些可在 `/speckit.plan` 阶段进一步明确）
