# 零售系统常见问题和反模式

## 1. 商品管理常见问题

### ❌ 问题1: SPU/SKU 概念混淆
**表现**: 将商品和 SKU 混在一起，缺少规格管理

**影响**: 无法支持多规格商品（如不同颜色/尺寸）

**正确做法**:
```typescript
// SPU: Standard Product Unit（标准商品单元）
interface Product {
  id: string
  name: "iPhone 15 Pro"
  category: "手机"
  brand: "Apple"
  skus: SKU[]
}

// SKU: Stock Keeping Unit（库存单元）
interface SKU {
  id: string
  spuId: string
  specs: [
    { name: "颜色", value: "深空黑" },
    { name: "容量", value: "256GB" }
  ]
  price: 8999
  stock: 100
}
```

---

### ❌ 问题2: 硬编码规格类型
**表现**: 在代码中硬编码 `color`, `size` 等字段

**影响**: 无法灵活添加新规格类型

**正确做法**:
```typescript
// 可配置的规格类型
interface SpecType {
  id: string
  name: string  // "颜色", "尺寸", "口味"
  values: string[]  // ["红色", "蓝色", "黑色"]
}

// 商品使用规格类型
interface ProductSpec {
  specTypeId: string
  value: string
}
```

---

### ❌ 问题3: 缺少商品状态管理
**表现**: 商品只有"在售"和"下架"两种状态

**影响**: 无法支持复杂的商品生命周期

**正确做法**:
```typescript
enum ProductStatus {
  DRAFT = 'DRAFT',           // 草稿
  PENDING_REVIEW = 'PENDING_REVIEW',  // 待审核
  ACTIVE = 'ACTIVE',         // 在售
  INACTIVE = 'INACTIVE',     // 下架
  DISCONTINUED = 'DISCONTINUED'  // 停产
}
```

---

## 2. 库存管理常见问题

### ❌ 问题1: 直接修改库存数量
**表现**: 没有库存事务记录，直接 `UPDATE inventory SET qty = qty - 1`

**影响**: 无法追溯库存变化，审计困难

**正确做法**:
```typescript
// 库存事务记录
interface InventoryTransaction {
  id: string
  type: 'IN' | 'OUT' | 'ADJUST'  // 入库、出库、调整
  skuId: string
  quantity: number
  beforeQty: number
  afterQty: number
  reason: string
  operator: string
  createdAt: Date
}

// 库存变更通过事务记录
function adjustInventory(skuId, delta, reason) {
  const current = getInventory(skuId)
  const transaction = {
    skuId,
    quantity: delta,
    beforeQty: current.qty,
    afterQty: current.qty + delta,
    reason
  }
  saveTransaction(transaction)
  updateInventory(skuId, current.qty + delta)
}
```

---

### ❌ 问题2: 缺少库存锁定机制
**表现**: 下单后直接扣减库存，取消订单不释放

**影响**: 库存不准确，可能超卖或库存积压

**正确做法**:
```typescript
interface Inventory {
  available: number  // 可用库存
  locked: number     // 锁定库存（已下单未支付）
  damaged: number    // 损坏库存
  total: number      // 总库存
}

// 下单时锁定库存
function lockInventory(skuId, qty) {
  UPDATE inventory
  SET available = available - qty,
      locked = locked + qty
  WHERE sku_id = skuId AND available >= qty
}

// 支付后扣减库存
function deductInventory(skuId, qty) {
  UPDATE inventory
  SET locked = locked - qty,
      total = total - qty
  WHERE sku_id = skuId
}

// 取消订单释放库存
function releaseInventory(skuId, qty) {
  UPDATE inventory
  SET locked = locked - qty,
      available = available + qty
  WHERE sku_id = skuId
}
```

---

### ❌ 问题3: 库存扣减无并发控制
**表现**: 多个请求同时扣减库存，导致超卖

**影响**: 库存为负，客户体验差

**正确做法**:
```typescript
// 方案1: 乐观锁
UPDATE inventory
SET available = available - ?, version = version + 1
WHERE sku_id = ? AND available >= ? AND version = ?

// 方案2: 悲观锁
SELECT * FROM inventory WHERE sku_id = ? FOR UPDATE
UPDATE inventory SET available = available - ? WHERE sku_id = ?

// 方案3: Redis 分布式锁
const lock = await redis.lock(`inventory:${skuId}`)
try {
  await deductInventory(skuId, qty)
} finally {
  await lock.unlock()
}
```

---

## 3. 订单管理常见问题

### ❌ 问题1: 直接修改订单状态
**表现**: 没有状态机，随意修改订单状态

**影响**: 订单状态混乱，业务逻辑错误

**正确做法**:
```typescript
class OrderStateMachine {
  allowedTransitions = {
    PENDING_PAYMENT: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'REFUNDING'],
    PROCESSING: ['SHIPPED'],
    SHIPPED: ['COMPLETED'],
    COMPLETED: ['REFUNDING'],
    REFUNDING: ['REFUNDED']
  }

  transition(order, newStatus) {
    const allowed = this.allowedTransitions[order.status]
    if (!allowed?.includes(newStatus)) {
      throw new Error(`Invalid transition: ${order.status} -> ${newStatus}`)
    }
    order.status = newStatus
    order.logs.push({ from: order.status, to: newStatus, at: new Date() })
  }
}
```

---

### ❌ 问题2: 缺少订单快照
**表现**: 订单只保存 SKU ID，商品价格/名称变化后无法追溯

**影响**: 历史订单信息不准确

**正确做法**:
```typescript
interface OrderItem {
  skuId: string
  // 快照字段
  skuName: string     // 下单时的商品名称
  skuPrice: number    // 下单时的价格
  skuImage: string    // 下单时的图片
  quantity: number
  subtotal: number
}
```

---

### ❌ 问题3: 订单编号非唯一
**表现**: 使用自增 ID 或时间戳，容易重复

**影响**: 订单查询困难，幂等性无法保证

**正确做法**:
```typescript
// 订单号生成规则：时间 + 随机数 + 用户ID后缀
function generateOrderNo(userId) {
  const timestamp = Date.now().toString().slice(-10)
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  const userSuffix = userId.slice(-4)
  return `ORD${timestamp}${random}${userSuffix}`
}

// 示例: ORD1234567890ABC1234
```

---

## 4. 会员系统常见问题

### ❌ 问题1: 积分无过期机制
**表现**: 积分永久有效，无法清理

**影响**: 积分系统成本不可控

**正确做法**:
```typescript
interface PointsTransaction {
  memberId: string
  points: number
  expiresAt: Date  // 过期时间
  status: 'VALID' | 'EXPIRED' | 'USED'
}

// 积分过期策略：先进先出（FIFO）
function deductPoints(memberId, points) {
  const transactions = getValidTransactions(memberId)
    .sort((a, b) => a.createdAt - b.createdAt)  // 最早的优先

  let remaining = points
  for (const tx of transactions) {
    if (remaining <= 0) break
    const deduct = Math.min(tx.points, remaining)
    tx.points -= deduct
    remaining -= deduct
  }
}
```

---

### ❌ 问题2: 会员等级规则硬编码
**表现**: 在代码中写死升级条件

**影响**: 运营策略调整需要改代码

**正确做法**:
```typescript
// 可配置的等级规则
interface MemberTierRule {
  tier: string
  minGrowth: number   // 最低成长值
  benefits: Benefit[] // 权益列表
}

const tierRules = [
  { tier: 'BASIC', minGrowth: 0, benefits: [] },
  { tier: 'SILVER', minGrowth: 1000, benefits: ['95折优惠'] },
  { tier: 'GOLD', minGrowth: 5000, benefits: ['9折优惠', '生日礼包'] },
  { tier: 'DIAMOND', minGrowth: 10000, benefits: ['85折优惠', '专属客服'] }
]

// 自动升降级
function updateMemberTier(member) {
  const newTier = tierRules
    .filter(rule => member.growth >= rule.minGrowth)
    .sort((a, b) => b.minGrowth - a.minGrowth)[0]
  member.tier = newTier.tier
}
```

---

## 5. 促销系统常见问题

### ❌ 问题1: 促销规则硬编码
**表现**: 在代码中写死促销逻辑

**影响**: 每次促销都需要改代码

**正确做法**:
```typescript
// 可配置的促销规则引擎
interface PromotionRule {
  type: 'FULL_REDUCTION' | 'DISCOUNT' | 'GIFT'
  conditions: Condition[]
  actions: Action[]
}

interface Condition {
  type: 'MIN_AMOUNT' | 'PRODUCT_IN' | 'MEMBER_TIER'
  value: any
}

interface Action {
  type: 'REDUCE_AMOUNT' | 'MULTIPLY_PRICE' | 'ADD_GIFT'
  value: any
}

// 示例：满200减30
const promotion = {
  type: 'FULL_REDUCTION',
  conditions: [{ type: 'MIN_AMOUNT', value: 200 }],
  actions: [{ type: 'REDUCE_AMOUNT', value: 30 }]
}
```

---

### ❌ 问题2: 优惠券无防刷机制
**表现**: 优惠券可以无限领取

**影响**: 羊毛党薅羊毛，成本失控

**正确做法**:
```typescript
interface Coupon {
  code: string
  maxTotalUse: number     // 总领取上限
  maxUserUse: number      // 单用户领取上限
  userCooldown: number    // 领取冷却时间（秒）
}

// 领取时校验
function claimCoupon(userId, couponId) {
  // 检查总领取量
  if (getTotalClaimed(couponId) >= coupon.maxTotalUse) {
    throw new Error('优惠券已抢光')
  }

  // 检查用户领取次数
  if (getUserClaimed(userId, couponId) >= coupon.maxUserUse) {
    throw new Error('超过领取上限')
  }

  // 检查冷却时间
  const lastClaim = getLastClaimTime(userId, couponId)
  if (Date.now() - lastClaim < coupon.userCooldown * 1000) {
    throw new Error('领取过于频繁')
  }

  // 分布式锁防止并发
  const lock = await redis.lock(`coupon:${couponId}:${userId}`)
  try {
    saveCouponClaim(userId, couponId)
  } finally {
    await lock.unlock()
  }
}
```

---

## 6. API 设计常见问题

### ❌ 问题1: 响应格式不统一
**表现**: 有的接口返回 `{ data: {...} }`,有的直接返回对象

**影响**: 前端处理复杂，容易出错

**正确做法**:
```typescript
// 统一响应格式
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

// 成功响应
{
  "success": true,
  "data": { "id": 1, "name": "商品A" },
  "timestamp": "2025-12-28T10:00:00Z"
}

// 错误响应
{
  "success": false,
  "error": "PRODUCT_NOT_FOUND",
  "message": "商品不存在",
  "timestamp": "2025-12-28T10:00:00Z"
}
```

---

### ❌ 问题2: 缺少分页参数
**表现**: 列表接口不支持分页，返回全部数据

**影响**: 大数据量时性能差，前端卡顿

**正确做法**:
```typescript
// 分页请求
GET /api/products?page=1&pageSize=20&sort=price:desc

// 分页响应
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

---

## 7. 数据库设计常见问题

### ❌ 问题1: 金额使用 FLOAT/DOUBLE
**表现**: 金额字段使用浮点数类型

**影响**: 精度丢失，计算错误

**正确做法**:
```sql
-- ❌ 错误
price FLOAT

-- ✅ 正确
price DECIMAL(10, 2)  -- 最大 99999999.99
```

---

### ❌ 问题2: 缺少审计字段
**表现**: 表中没有 created_at, updated_at, created_by 等字段

**影响**: 无法追溯数据变更历史

**正确做法**:
```sql
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  -- 审计字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  updated_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,  -- 软删除
  version INT DEFAULT 1       -- 乐观锁
)
```

---

## 8. 前端常见问题

### ❌ 问题1: 状态管理混乱
**表现**: 使用 useState 管理复杂的服务器数据

**影响**: 缓存、加载、错误处理逻辑重复

**正确做法**:
```typescript
// ❌ 错误：手动管理加载状态
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  fetchProducts()
    .then(setProducts)
    .catch(setError)
    .finally(() => setLoading(false))
}, [])

// ✅ 正确：使用 TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts
})
```

---

### ❌ 问题2: 缺少 TypeScript 类型
**表现**: 大量使用 `any` 类型

**影响**: 类型安全性差，IDE 提示不准确

**正确做法**:
```typescript
// ❌ 错误
function getProduct(id: any): any {
  return fetch(`/api/products/${id}`).then(res => res.json())
}

// ✅ 正确
interface Product {
  id: string
  name: string
  price: number
}

async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`)
  return res.json()
}
```
