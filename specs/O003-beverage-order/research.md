# 技术研究: 饮品订单创建与出品管理

**Feature**: O003-beverage-order
**Date**: 2025-12-27
**Status**: Complete

---

## 研究决策

### 1. Mock支付实现策略

**Decision**: 使用前端Mock模拟支付流程,点击支付按钮后延迟500ms自动标记订单为"支付成功"

**Rationale**:
- MVP阶段无需接入真实支付系统,节省开发成本和微信支付接入审核时间(需企业资质)
- Mock支付允许快速验证"下单→支付→出品→交付"的完整业务流程
- 延迟500ms模拟真实支付的异步特性,确保前端状态管理和加载状态处理正确
- 后续可平滑替换为真实微信支付API,无需大规模重构

**Alternatives Considered**:
- 方案A: 真实集成微信支付API - **被拒绝**,原因:增加开发复杂度,需要企业资质审核,MVP阶段不需要
- 方案B: 使用微信支付沙箱环境 - **被拒绝**,原因:沙箱环境依然需要配置和调试,MVP阶段不划算
- **方案C (Selected)**: 前端Mock支付 - 优势:简单快速,易于测试,后续可通过环境变量切换真实/Mock支付

**Implementation Notes**:

C端实现(Taro):
```typescript
// hall-reserve-taro/src/services/beverageOrderService.ts
export const mockPayment = async (orderId: string): Promise<void> => {
  // 模拟支付处理时间
  await new Promise(resolve => setTimeout(resolve, 500));

  // 调用后端API标记订单为已支付
  await request({
    url: `/api/client/beverage-orders/${orderId}/pay`,
    method: 'POST',
    data: {
      paymentMethod: 'MOCK_WECHAT_PAY',
      transactionId: `MOCK_${Date.now()}`
    }
  });
};

// 使用示例
const handlePayment = async () => {
  setLoading(true);
  try {
    await mockPayment(orderId);
    Taro.showToast({ title: '支付成功', icon: 'success' });
    // 跳转到订单详情页
    Taro.redirectTo({ url: `/pages/beverage-order-detail/index?id=${orderId}` });
  } catch (error) {
    Taro.showToast({ title: '支付失败', icon: 'error' });
  } finally {
    setLoading(false);
  }
};
```

后端API设计:
```java
// POST /api/client/beverage-orders/{orderId}/pay
@PostMapping("/{orderId}/pay")
public ResponseEntity<ApiResponse<BeverageOrder>> payOrder(
    @PathVariable String orderId,
    @RequestBody PaymentRequest request
) {
    // MVP阶段直接标记为支付成功,不调用真实支付API
    BeverageOrder order = orderService.markAsPaid(orderId, request);
    return ResponseEntity.ok(ApiResponse.success(order));
}
```

环境变量配置(方便后续切换):
```typescript
// config/index.ts
export const ENABLE_REAL_PAYMENT = process.env.TARO_APP_ENABLE_REAL_PAYMENT === 'true';
```

---

### 2. 轮询通知实现策略

**Decision**: 使用TanStack Query的`refetchInterval: 8000`(8秒)进行轮询查询新订单

**Rationale**:
- 8秒间隔在实时性(SC-003要求30秒内接收通知)和性能开销之间取得平衡
- TanStack Query内置轮询支持,无需额外WebSocket/SSE基础设施
- 移动端兼容性好,避免WebSocket连接不稳定导致的通知丢失
- 电量消耗可控:每小时仅450次请求,对移动端电量和流量影响小

**Alternatives Considered**:
- 方案A: WebSocket/SSE实时推送 - **被拒绝**,原因:MVP阶段复杂度过高,需要额外的WebSocket服务器、连接管理、断线重连逻辑
- 方案B: 5秒短轮询 - **被拒绝**,原因:频率过高,移动端电量消耗和网络流量消耗较大(每小时720次请求)
- 方案D: 10秒轮询 - **被拒绝**,原因:实时性略差,8秒是更好的平衡点
- **方案C (Selected)**: 8秒轮询 - 优势:实时性足够(满足30秒要求),性能开销可控,实现简单

**Implementation Notes**:

B端订单轮询(React):
```typescript
// frontend/src/features/beverage-order/hooks/usePendingOrders.ts
import { useQuery } from '@tanstack/react-query';

export const usePendingOrders = (storeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['beverage-orders', 'pending', storeId],
    queryFn: () => fetchPendingOrders(storeId),
    refetchInterval: enabled ? 8000 : false, // 8秒轮询,仅在页面激活时启用
    refetchIntervalInBackground: false,      // 页面后台时停止轮询
    staleTime: 0,                            // 数据立即过期,强制每次轮询都请求后端
  });
};

// 使用示例
const OrderListPage = () => {
  const { data: orders, isLoading } = usePendingOrders(currentStoreId, true);

  // 监听新订单到达
  useEffect(() => {
    if (orders && orders.length > previousOrderCount.current) {
      // 播放提示音 + 震动
      playNotificationSound();
      showDesktopNotification('新订单到达');
    }
    previousOrderCount.current = orders?.length || 0;
  }, [orders]);

  return <OrderList orders={orders} />;
};
```

C端订单状态轮询(Taro):
```typescript
// hall-reserve-taro/src/pages/beverage-order-detail/index.tsx
import { useQuery } from '@tanstack/react-query';
import Taro from '@tarojs/taro';

const BeverageOrderDetail = () => {
  const { id } = Taro.getCurrentInstance().router.params;

  const { data: order } = useQuery({
    queryKey: ['beverage-order', id],
    queryFn: () => fetchOrderDetail(id),
    refetchInterval: 8000,  // 轮询订单状态
    enabled: order?.status !== 'DELIVERED' && order?.status !== 'CANCELLED', // 终态停止轮询
  });

  // 监听状态变化推送通知
  useEffect(() => {
    if (order?.status === 'COMPLETED') {
      Taro.showToast({ title: '您的订单已完成,请取餐', icon: 'success' });
      Taro.vibrateShort(); // 震动提醒
    }
  }, [order?.status]);

  return <View>{/* 订单详情UI */}</View>;
};
```

性能优化建议:
- 使用`refetchIntervalInBackground: false`避免页面后台时无效轮询
- 订单到达终态(DELIVERED/CANCELLED)时停止轮询
- 后端API应支持增量查询(如`?since=timestamp`)减少数据传输量

---

### 3. BOM扣料集成策略

**Decision**: 集成P003/P004库存管理API,实现真实库存查询和扣减,使用悲观锁保证库存一致性

**Rationale**:
- 规格明确要求集成真实库存数据,BOM扣料准确率100%(SC-004)
- P003已提供库存查询API(`GET /api/inventory/store/{storeId}/sku/{skuId}`)
- P004已提供库存调整API,可复用其原子性扣减逻辑
- 悲观锁(行锁)确保并发场景下库存不超卖

**Alternatives Considered**:
- 方案A: Mock库存数据 - **被拒绝**,原因:与规格要求不符(Clarifications明确"真实库存数据")
- 方案B: 乐观锁+重试 - **被拒绝**,原因:高并发场景下重试次数过多影响用户体验
- **方案C (Selected)**: 悲观锁(行锁) - 优势:库存一致性强,无需重试,实现简单

**Implementation Notes**:

数据依赖关系:
```
beverage_recipes (饮品配方表)
  └─> recipe_ingredients (配方原料关联表)
        └─> skus (关联SKU主数据,来自P001)
              └─> store_inventory (门店库存表,来自P003)
```

库存扣料流程:
```java
// BeverageOrderService.java
@Transactional
public void startProduction(String orderId) {
    BeverageOrder order = findById(orderId);

    // 1. 获取订单中所有饮品的配方
    List<BeverageOrderItem> items = order.getItems();

    // 2. 计算所需原料总量
    Map<String, BigDecimal> ingredientRequirements = calculateIngredients(items);

    // 3. 悲观锁查询库存(FOR UPDATE)
    List<StoreInventory> inventories = inventoryRepository.findByStoreAndSkusForUpdate(
        order.getStoreId(),
        ingredientRequirements.keySet()
    );

    // 4. 校验库存充足性
    for (Map.Entry<String, BigDecimal> entry : ingredientRequirements.entrySet()) {
        String skuId = entry.getKey();
        BigDecimal required = entry.getValue();

        StoreInventory inventory = inventories.stream()
            .filter(inv -> inv.getSkuId().equals(skuId))
            .findFirst()
            .orElseThrow(() -> new InsufficientInventoryException(skuId));

        if (inventory.getAvailableQuantity().compareTo(required) < 0) {
            throw new InsufficientInventoryException(skuId, required, inventory.getAvailableQuantity());
        }
    }

    // 5. 执行扣料(调用P004库存调整API)
    for (Map.Entry<String, BigDecimal> entry : ingredientRequirements.entrySet()) {
        inventoryAdjustmentService.deductInventory(
            order.getStoreId(),
            entry.getKey(),
            entry.getValue(),
            "BOM_DEDUCTION",
            orderId // 关联订单号,便于追溯
        );
    }

    // 6. 更新订单状态
    order.setStatus(OrderStatus.PRODUCING);
    order.setProductionStartTime(Instant.now());
    orderRepository.save(order);
}
```

配方数据查询:
```sql
-- 查询某饮品的BOM清单
SELECT
  ri.sku_id,
  s.name AS ingredient_name,
  ri.quantity,
  ri.unit,
  si.available_quantity AS current_stock
FROM beverage_recipes br
JOIN recipe_ingredients ri ON br.id = ri.recipe_id
JOIN skus s ON ri.sku_id = s.id
LEFT JOIN store_inventory si ON s.id = si.sku_id AND si.store_id = :storeId
WHERE br.beverage_id = :beverageId;
```

库存不足处理:
```java
// 前端显示缺料提示
if (error.code === 'INSUFFICIENT_INVENTORY') {
  Modal.error({
    title: '原料库存不足',
    content: `${error.details.ingredientName} 库存不足,当前库存:${error.details.currentStock},需要:${error.details.required}`,
    okText: '通知补货',
    onOk: () => {
      // 创建补货任务
      notifyRestocking(error.details.skuId);
    }
  });
}
```

集成API清单:
| API | 用途 | 提供方 |
|-----|------|--------|
| `GET /api/inventory/store/{storeId}/sku/{skuId}` | 查询单个原料库存 | P003 |
| `POST /api/inventory/adjustments/deduct` | 批量扣减库存 | P004 |
| `GET /api/inventory/batch` | 批量查询库存(校验) | P003 |

---

### 4. 取餐号生成策略

**Decision**: 采用"日期前缀+3位序号"格式(如`D001`),每日0点自动重置,支持单门店1000单/天

**Rationale**:
- 短编号便于语音播报("D001"比"202512270001"更清晰)
- 每日重置避免号码过大造成混淆
- 3位序号支持1000单/天,覆盖绝大多数门店需求
- 数据库序列+分布式锁保证唯一性

**Alternatives Considered**:
- 方案A: UUID - **被拒绝**,原因:太长不适合语音播报和顾客记忆
- 方案B: 全局递增序号 - **被拒绝**,原因:号码持续增长,后期会出现"9999"等不友好号码
- 方案C: 时间戳+随机数 - **被拒绝**,原因:无法保证顺序性,不便于工作人员管理
- **方案D (Selected)**: 日期前缀+序号 - 优势:简短易读,每日重置,有序可控

**Implementation Notes**:

数据库表设计:
```sql
-- queue_numbers 表
CREATE TABLE queue_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_number VARCHAR(10) NOT NULL,        -- 取餐号(如 D001, D002)
  order_id UUID NOT NULL REFERENCES beverage_orders(id),
  store_id UUID NOT NULL,
  date DATE NOT NULL,                       -- 生成日期
  sequence INTEGER NOT NULL,                -- 当日序号(1-999)
  status VARCHAR(20) DEFAULT 'PENDING',     -- PENDING(待叫号)/CALLED(已叫号)/PICKED(已取餐)
  called_at TIMESTAMP,                      -- 叫号时间
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(store_id, date, sequence),         -- 保证门店+日期+序号唯一
  UNIQUE(order_id)                          -- 一个订单只有一个取餐号
);

CREATE INDEX idx_queue_number ON queue_numbers(store_id, date, status);
```

生成算法:
```java
// QueueNumberGenerator.java
@Service
public class QueueNumberGenerator {

    @Autowired
    private QueueNumberRepository queueNumberRepository;

    public String generate(String storeId, String orderId) {
        LocalDate today = LocalDate.now();

        // 获取当日最大序号(使用分布式锁避免并发冲突)
        Integer maxSequence = queueNumberRepository.findMaxSequenceByStoreAndDate(storeId, today);
        Integer nextSequence = (maxSequence == null ? 0 : maxSequence) + 1;

        if (nextSequence > 999) {
            throw new QueueNumberExhaustedException("当日取餐号已用尽(最大999)");
        }

        // 格式: D + 三位序号
        String queueNumber = String.format("D%03d", nextSequence);

        // 插入数据库
        QueueNumber qn = new QueueNumber();
        qn.setQueueNumber(queueNumber);
        qn.setOrderId(orderId);
        qn.setStoreId(storeId);
        qn.setDate(today);
        qn.setSequence(nextSequence);
        queueNumberRepository.save(qn);

        return queueNumber;
    }
}
```

分布式锁实现(防止并发):
```java
// 使用Supabase Advisory Lock
@Query(value = "SELECT pg_advisory_xact_lock(:lockKey)", nativeQuery = true)
void acquireLock(@Param("lockKey") long lockKey);

public String generateWithLock(String storeId, String orderId) {
    // lockKey = hash(storeId + date)
    long lockKey = (storeId + LocalDate.now().toString()).hashCode();
    acquireLock(lockKey); // 事务结束自动释放

    return generate(storeId, orderId);
}
```

定时任务清理历史数据(可选):
```java
// 每日凌晨1点清理30天前的取餐号记录
@Scheduled(cron = "0 0 1 * * ?")
public void cleanupOldQueueNumbers() {
    LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
    queueNumberRepository.deleteByDateBefore(thirtyDaysAgo);
}
```

前端显示:
```tsx
// 订单确认页显示取餐号
<View className="queue-number">
  <Text className="label">取餐号</Text>
  <Text className="number">{order.queueNumber}</Text> {/* D001 */}
  <Text className="tip">请留意叫号提醒</Text>
</View>
```

---

### 5. Taro多端开发策略

**Decision**: 使用官方Taro UI组件库 + 自定义业务组件,优先保证微信小程序和H5兼容性

**Rationale**:
- Taro UI是官方组件库,跨端兼容性最好,维护更新及时
- NutUI虽然UI更现代,但非官方组件,可能存在兼容性风险
- 自定义业务组件(如饮品卡片、订单状态标签)可更好满足设计需求
- 规格要求至少支持微信小程序和H5两端

**Alternatives Considered**:
- 方案A: NutUI组件库 - **被拒绝**,原因:非官方库,长期维护风险,团队学习成本高
- 方案B: 完全自定义组件 - **被拒绝**,原因:开发成本过高,基础组件(如Button/Input)无需重复造轮子
- **方案C (Selected)**: Taro UI + 自定义业务组件 - 优势:官方支持,跨端兼容,开发效率高

**Implementation Notes**:

依赖安装:
```bash
cd hall-reserve-taro
npm install taro-ui@3.1.0 --save
```

组件使用示例:
```tsx
// 使用Taro UI基础组件
import { AtButton, AtCard, AtTag, AtTabs, AtTabsPane } from 'taro-ui';
import 'taro-ui/dist/style/index.scss';

// 饮品菜单页
const BeverageMenu = () => {
  return (
    <View>
      <AtTabs current={currentTab} tabList={categories} onClick={handleTabChange}>
        <AtTabsPane current={currentTab} index={0}>
          {beverages.map(item => (
            <BeverageCard key={item.id} beverage={item} /> {/* 自定义组件 */}
          ))}
        </AtTabsPane>
      </AtTabs>
    </View>
  );
};

// 自定义饮品卡片组件
const BeverageCard = ({ beverage }) => {
  return (
    <AtCard
      title={beverage.name}
      extra={`¥${beverage.price}`}
      thumb={beverage.image}
      onClick={() => navigateToBeverageDetail(beverage.id)}
    >
      <Text>{beverage.description}</Text>
      {beverage.stock === 0 && <AtTag type="primary">暂时缺货</AtTag>}
    </AtCard>
  );
};
```

平台适配策略(条件编译):
```tsx
// 微信小程序专属逻辑
if (process.env.TARO_ENV === 'weapp') {
  // 使用微信支付API(后续真实支付时)
  Taro.requestPayment({
    timeStamp: paymentData.timeStamp,
    nonceStr: paymentData.nonceStr,
    package: paymentData.package,
    signType: 'MD5',
    paySign: paymentData.paySign,
  });
}

// H5专属逻辑
if (process.env.TARO_ENV === 'h5') {
  // 使用JSAPI支付或跳转到支付页面
  window.location.href = paymentData.redirectUrl;
}
```

性能优化:
```tsx
// 图片懒加载(微信小程序)
<Image
  src={beverage.image}
  mode="aspectFill"
  lazyLoad
  className="beverage-image"
/>

// 长列表虚拟滚动(使用Taro VirtualList)
import { VirtualList } from '@tarojs/components';

<VirtualList
  height={Taro.getSystemInfoSync().windowHeight}
  itemData={beverages}
  itemCount={beverages.length}
  itemSize={120}
  width="100%"
>
  {({ index, style, data }) => (
    <View style={style}>
      <BeverageCard beverage={data[index]} />
    </View>
  )}
</VirtualList>
```

样式规范:
```less
// 使用rpx单位(750设计稿基准)
.beverage-card {
  width: 690rpx;
  margin: 30rpx auto;
  padding: 30rpx;
  border-radius: 16rpx;

  .title {
    font-size: 32rpx;
    font-weight: bold;
  }

  .price {
    color: #ff6600;
    font-size: 36rpx;
  }
}
```

---

### 6. 后端饮品管理模块设计

**Decision**: MVP阶段实现后端饮品CRUD API(不含B端管理UI),数据通过Supabase直接操作或API调试工具录入

**Rationale**:
- C端下单依赖真实饮品数据(Clarifications明确"真实后端API")
- MVP阶段优先保证C端用户体验,B端管理UI可后续实现
- Supabase Studio提供数据表直接编辑功能,可用于初期数据维护
- 提供完整的RESTful API便于后续开发B端管理界面

**Alternatives Considered**:
- 方案A: 前端Mock饮品数据 - **被拒绝**,原因:与规格要求不符(Clarifications明确"真实后端API")
- 方案B: 同时实现B端管理UI - **被拒绝**,原因:增加MVP开发周期,不是核心需求
- **方案C (Selected)**: API-only + Supabase Studio手动维护 - 优势:满足C端需求,开发成本低,可扩展性强

**Implementation Notes**:

数据库表设计:
```sql
-- 饮品主表
CREATE TABLE beverages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,          -- 分类: COFFEE/TEA/JUICE/SMOOTHIE
  image_url TEXT,                         -- 主图URL(Supabase Storage)
  base_price DECIMAL(10,2) NOT NULL,      -- 基础价格
  status VARCHAR(20) DEFAULT 'ACTIVE',    -- ACTIVE/INACTIVE
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 饮品规格表
CREATE TABLE beverage_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
  spec_type VARCHAR(50) NOT NULL,         -- SIZE/TEMPERATURE/SWEETNESS/TOPPING
  spec_name VARCHAR(50) NOT NULL,         -- 小杯/中杯/大杯
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- 价格调整(如大杯+5元)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 饮品配方表(BOM)
CREATE TABLE beverage_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
  spec_combination JSONB,                 -- 规格组合(如{"size":"large","temperature":"hot"})
  created_at TIMESTAMP DEFAULT NOW()
);

-- 配方原料关联表
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES beverage_recipes(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id), -- 关联SKU主数据(P001)
  quantity DECIMAL(10,3) NOT NULL,        -- 用量
  unit VARCHAR(20) NOT NULL,              -- 单位(g/ml/个)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_beverage_category ON beverages(category, status);
CREATE INDEX idx_spec_beverage ON beverage_specs(beverage_id, spec_type);
CREATE INDEX idx_recipe_beverage ON beverage_recipes(beverage_id);
```

饮品CRUD API:
```java
// BeverageController.java (C端查询API)
@RestController
@RequestMapping("/api/client/beverages")
public class BeverageController {

    // 获取所有启用的饮品(按分类)
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, List<BeverageDTO>>>> getAllBeverages() {
        Map<String, List<BeverageDTO>> groupedBeverages = beverageService.findAllActiveGroupedByCategory();
        return ResponseEntity.ok(ApiResponse.success(groupedBeverages));
    }

    // 获取饮品详情(含规格)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BeverageDetailDTO>> getBeverageDetail(@PathVariable String id) {
        BeverageDetailDTO detail = beverageService.findDetailById(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    // 获取饮品可选规格
    @GetMapping("/{id}/specs")
    public ResponseEntity<ApiResponse<Map<String, List<BeverageSpecDTO>>>> getBeverageSpecs(
        @PathVariable String id
    ) {
        Map<String, List<BeverageSpecDTO>> specs = beverageService.findSpecsById(id);
        return ResponseEntity.ok(ApiResponse.success(specs));
    }
}

// BeverageAdminController.java (B端管理API,仅实现API不含UI)
@RestController
@RequestMapping("/api/admin/beverages")
@PreAuthorize("hasRole('ADMIN')")
public class BeverageAdminController {

    // 创建饮品
    @PostMapping
    public ResponseEntity<ApiResponse<Beverage>> createBeverage(@RequestBody CreateBeverageRequest request) {
        Beverage beverage = beverageService.create(request);
        return ResponseEntity.status(201).body(ApiResponse.success(beverage));
    }

    // 更新饮品
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Beverage>> updateBeverage(
        @PathVariable String id,
        @RequestBody UpdateBeverageRequest request
    ) {
        Beverage beverage = beverageService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(beverage));
    }

    // 删除饮品(软删除)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBeverage(@PathVariable String id) {
        beverageService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    // 管理饮品规格
    @PostMapping("/{id}/specs")
    public ResponseEntity<ApiResponse<BeverageSpec>> addSpec(
        @PathVariable String id,
        @RequestBody BeverageSpecRequest request
    ) {
        BeverageSpec spec = beverageService.addSpec(id, request);
        return ResponseEntity.status(201).body(ApiResponse.success(spec));
    }

    // 管理饮品配方
    @PostMapping("/{id}/recipes")
    public ResponseEntity<ApiResponse<BeverageRecipe>> addRecipe(
        @PathVariable String id,
        @RequestBody RecipeRequest request
    ) {
        BeverageRecipe recipe = beverageService.addRecipe(id, request);
        return ResponseEntity.status(201).body(ApiResponse.success(recipe));
    }
}
```

初始数据录入方式:
```typescript
// scripts/seed-beverages.ts (使用Supabase Client录入初始数据)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const seedBeverages = async () => {
  // 创建饮品
  const { data: beverage } = await supabase
    .from('beverages')
    .insert({
      name: '美式咖啡',
      description: '经典美式咖啡,浓郁香醇',
      category: 'COFFEE',
      base_price: 15.00,
      image_url: 'https://.../americano.jpg',
      status: 'ACTIVE'
    })
    .select()
    .single();

  // 添加规格
  await supabase.from('beverage_specs').insert([
    { beverage_id: beverage.id, spec_type: 'SIZE', spec_name: '小杯', price_adjustment: 0 },
    { beverage_id: beverage.id, spec_type: 'SIZE', spec_name: '大杯', price_adjustment: 5 },
    { beverage_id: beverage.id, spec_type: 'TEMPERATURE', spec_name: '热', price_adjustment: 0 },
    { beverage_id: beverage.id, spec_type: 'TEMPERATURE', spec_name: '冰', price_adjustment: 0 },
  ]);

  // 添加配方(BOM)
  const { data: recipe } = await supabase
    .from('beverage_recipes')
    .insert({
      beverage_id: beverage.id,
      spec_combination: { size: 'large', temperature: 'hot' }
    })
    .select()
    .single();

  await supabase.from('recipe_ingredients').insert([
    { recipe_id: recipe.id, sku_id: 'sku-coffee-beans', quantity: 20, unit: 'g' },
    { recipe_id: recipe.id, sku_id: 'sku-water', quantity: 300, unit: 'ml' },
  ]);
};

seedBeverages();
```

MVP范围:
| 功能 | 是否实现 | 实现方式 |
|------|----------|----------|
| C端查询饮品API | ✅ 实现 | RESTful API |
| C端查询规格API | ✅ 实现 | RESTful API |
| B端CRUD API | ✅ 实现 | RESTful API(仅后端) |
| B端管理UI | ❌ 不实现 | 后续版本 |
| 数据录入 | ✅ 实现 | Supabase Studio手动操作 + Seed脚本 |
| 图片上传 | ✅ 实现 | Supabase Storage |

---

## 技术选型总结

### 前端技术栈

| 需求 | C端(Taro) | B端(React) |
|------|-----------|------------|
| 核心框架 | Taro 4.1.9 + React 18.3.1 | React 19.2.0 |
| UI组件库 | Taro UI 3.1.0 | Ant Design 6.1.0 |
| 状态管理 | Zustand 4.5.5 (订单/菜单状态) | Zustand 5.0.9 (表单草稿) |
| 服务器状态 | TanStack Query 5.90.12 (轮询) | TanStack Query 5.90.12 (轮询) |
| 表单验证 | Zod 3.25.76 | React Hook Form 7.68.0 + Zod 4.1.13 |
| 路由管理 | Taro Router | React Router 7.10.1 |
| 样式方案 | Less + rpx单位 | TailwindCSS + Ant Design |

### 后端技术栈

| 需求 | 技术选择 | 说明 |
|------|----------|------|
| 运行时 | Java 21 | 与项目宪章一致 |
| 应用框架 | Spring Boot 3.x | 标准后端框架 |
| 数据库 | Supabase PostgreSQL | 项目统一数据源 |
| 认证 | JWT Token | 复用现有认证体系 |
| 事务管理 | Spring @Transactional | BOM扣料保证原子性 |
| 锁机制 | PostgreSQL Advisory Lock | 取餐号生成防并发 |
| API文档 | OpenAPI 3.0 (Springdoc) | 自动生成API文档 |

---

## 开放问题 (Open Questions)

### 已解决

| 问题 | 答案 | 来源 |
|------|------|------|
| 支付如何实现？ | Mock支付(点击自动成功) | Clarifications |
| 叫号系统如何实现？ | Mock语音(B端显示状态)+小程序推送 | Clarifications |
| 实时通知如何实现？ | 轮询(8秒间隔) | Clarifications + 研究决策2 |
| 饮品数据来源？ | 真实后端API | Clarifications |
| BOM库存数据来源？ | 集成P003/P004真实库存API | Clarifications + 研究决策3 |
| 取餐号格式？ | D001-D999(每日重置) | 研究决策4 |
| UI组件库选择？ | Taro UI(官方) | 研究决策5 |
| B端管理UI是否实现？ | MVP不实现,仅提供API | 研究决策6 |

### 待确认

| 问题 | 建议方案 | 优先级 |
|------|----------|--------|
| 真实支付何时接入？ | MVP验证后,Phase 2接入微信支付 | P2 |
| 真实语音叫号何时接入？ | MVP验证后,集成阿里云/腾讯云TTS | P2 |
| WebSocket实时推送何时升级？ | 高峰期测试轮询性能,必要时升级 | P3 |
| B端管理UI何时开发？ | 数据录入需求增加后再开发 | P3 |
| 是否支持多门店？ | 当前仅支持单门店,后续扩展 | P3 |
| 订单超时取消策略？ | Spring @Scheduled每小时扫描一次 | P2 |

---

## 依赖清单

### 内部依赖

| 模块 | 依赖内容 | 状态 |
|------|----------|------|
| P001-sku-master-data | SKU主数据(原料信息) | ✅ 已实现 |
| P003-inventory-query | 库存查询API | ✅ 已实现 |
| P004-inventory-adjustment | 库存扣减API | ✅ 已实现 |
| U003-wechat-miniapp-login | 微信登录/Token管理 | ✅ 已实现 |
| hall-reserve-taro/utils/request.ts | 统一请求封装 | ✅ 已实现 |
| hall-reserve-taro/stores/userStore.ts | 用户状态管理 | ✅ 已实现 |

### 外部依赖

| 服务 | 用途 | MVP状态 |
|------|------|---------|
| Supabase PostgreSQL | 数据存储 | ✅ 必需 |
| Supabase Storage | 饮品图片存储 | ✅ 必需 |
| Supabase Auth | 用户认证(JWT) | ✅ 必需 |
| 微信支付API | 支付功能 | ❌ Mock替代 |
| TTS服务(阿里云/腾讯云) | 语音叫号 | ❌ Mock替代 |
| WebSocket服务 | 实时推送 | ❌ 轮询替代 |

---

## 风险与缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 轮询性能不足(高并发) | B端订单延迟,用户体验差 | 监控API响应时间,必要时升级WebSocket |
| BOM扣料失败(库存不足) | 订单无法制作,顾客退款 | 实时校验库存,提前预警补货 |
| 取餐号冲突(并发生成) | 订单混乱,取餐错误 | 使用Advisory Lock+数据库唯一约束 |
| 饮品数据录入错误 | 价格/配方错误,经营损失 | 提供数据校验API,后续开发B端管理UI |
| 图片加载慢(小程序首屏) | 用户流失,体验差 | 图片压缩+CDN加速+懒加载 |
| Mock支付被绕过 | 无法验证真实支付流程 | 环境变量隔离,生产环境禁用Mock |

---

## 下一步行动

1. ✅ **生成数据模型文档** (`data-model.md`) - 定义完整数据库表结构
2. ✅ **生成API契约文档** (`contracts/api.yaml`) - OpenAPI规范
3. ✅ **生成开发指南** (`quickstart.md`) - 前后端开发快速入门
4. ⬜ **实现后端饮品管理API** - 优先级P0(C端依赖)
5. ⬜ **实现C端饮品菜单页** - 优先级P0(MVP核心)
6. ⬜ **实现C端下单流程** - 优先级P0(MVP核心)
7. ⬜ **实现B端订单接收页** - 优先级P0(MVP核心)
8. ⬜ **集成BOM扣料逻辑** - 优先级P0(业务必需)
9. ⬜ **实现叫号系统(Mock)** - 优先级P1
10. ⬜ **实现订单历史查询** - 优先级P2

---

**Research Complete**: 2025-12-27
**Ready for Implementation**: Yes
**Estimated MVP Development Time**: 2-3 weeks
