# 快速开始指南: 商品订单列表查看与管理

**Feature**: O001-product-order-list
**Last Updated**: 2025-12-27

本指南帮助开发者快速启动并验证商品订单管理功能。

---

## 前置条件

### 环境要求
- **Node.js**: >= 18.x
- **Java**: >= 21
- **Package Manager**: npm 或 pnpm
- **IDE**: VS Code (推荐) 或 IntelliJ IDEA

### 必要账号
- **Supabase 项目**: 需要已配置的 Supabase 项目
  - Project URL: `https://your-project.supabase.co`
  - Anon Key: 用于前端访问

### 依赖服务
- 用户管理模块（U模块）- 提供用户数据
- 商品管理模块（P模块）- 提供商品数据

---

## 一、数据库初始化

### 1.1 执行数据库迁移

登录 Supabase Dashboard → SQL Editor，执行以下脚本：

```sql
-- 从 data-model.md 复制完整的数据库迁移脚本
-- 创建 product_orders、order_items、order_logs 表

-- 1. 创建商品订单表
CREATE TABLE product_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    product_total DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    payment_method VARCHAR(20),
    payment_time TIMESTAMP,
    shipped_time TIMESTAMP,
    completed_time TIMESTAMP,
    cancelled_time TIMESTAMP,
    cancel_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,
    CHECK (total_amount = product_total + shipping_fee - discount_amount)
);

-- ... (完整脚本见 data-model.md)
```

### 1.2 插入测试数据

```sql
-- 插入测试订单
INSERT INTO product_orders (
    order_number, user_id, status, product_total, shipping_fee, discount_amount, total_amount
) VALUES
('ORD20251227AB12CD', (SELECT id FROM users LIMIT 1), 'PAID', 150.00, 10.00, 5.00, 155.00),
('ORD20251227EF34GH', (SELECT id FROM users LIMIT 1), 'SHIPPED', 200.00, 0.00, 20.00, 180.00),
('ORD20251226IJ56KL', (SELECT id FROM users LIMIT 1), 'COMPLETED', 80.00, 10.00, 0.00, 90.00);

-- 插入订单商品项
INSERT INTO order_items (
    order_id, product_id, product_name, product_spec, quantity, unit_price, subtotal
) VALUES
((SELECT id FROM product_orders WHERE order_number = 'ORD20251227AB12CD'),
 uuid_generate_v4(), '可口可乐', '500ml', 2, 5.00, 10.00);
```

### 1.3 验证表结构

```sql
-- 检查表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('product_orders', 'order_items', 'order_logs');

-- 检查索引
SELECT indexname FROM pg_indexes
WHERE tablename = 'product_orders';
```

---

## 二、后端服务启动

### 2.1 配置环境变量

创建 `backend/.env` 文件：

```env
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# 应用配置
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000
```

### 2.2 安装后端依赖

```bash
cd backend
./mvnw clean install
```

### 2.3 启动 Spring Boot 应用

```bash
./mvnw spring-boot:run
```

### 2.4 验证后端服务

```bash
# 健康检查
curl http://localhost:8080/actuator/health

# 测试订单列表接口
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/orders?page=1&pageSize=20
```

预期响应：
```json
{
  "success": true,
  "data": [...],
  "total": 3,
  "page": 1,
  "pageSize": 20
}
```

---

## 三、前端开发服务器

### 3.1 安装前端依赖

```bash
cd frontend
npm install
```

### 3.2 配置环境变量

创建 `frontend/.env.local` 文件：

```env
# API 基础URL
VITE_API_BASE_URL=http://localhost:8080/api

# Supabase 配置（前端直连）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3.3 启动开发服务器

```bash
npm run dev
```

默认地址：http://localhost:5173

### 3.4 访问订单列表页

浏览器访问：http://localhost:5173/orders/list

---

## 四、功能验证清单

### 4.1 订单列表查看（US1 - P1 MVP）

**测试步骤**:
1. ✅ 访问 `/orders/list` 页面
2. ✅ 看到订单列表表格，显示：订单号、用户、商品、金额、状态、创建时间
3. ✅ 订单按创建时间倒序排列
4. ✅ 分页控件正常工作（翻页、跳页）

**预期结果**:
- 列表加载时间 < 3 秒
- 表格显示正确数据
- 分页切换流畅

---

### 4.2 订单筛选（US2 - P1 MVP）

**测试步骤**:
1. ✅ 筛选器：选择状态 = "已支付"
2. ✅ 筛选器：选择时间范围（近7天）
3. ✅ 筛选器：输入手机号搜索
4. ✅ 组合筛选（状态 + 时间范围）
5. ✅ 点击"重置"按钮清空筛选

**预期结果**:
- 筛选响应时间 < 1 秒
- 筛选结果准确
- URL 同步筛选参数（刷新页面保持筛选状态）

---

### 4.3 订单详情查看（US3 - P1 MVP）

**测试步骤**:
1. ✅ 从订单列表点击某订单
2. ✅ 跳转到 `/orders/:id` 详情页
3. ✅ 查看订单基本信息
4. ✅ 查看用户信息（手机号已脱敏：`138****8000`）
5. ✅ 查看商品列表
6. ✅ 查看订单日志

**预期结果**:
- 详情页加载时间 < 2 秒
- 所有信息显示完整
- 手机号正确脱敏

---

### 4.4 订单状态管理（US4 - P2）

**测试步骤**:
1. ✅ 对"已支付"订单点击"标记发货"
2. ✅ 对"已发货"订单点击"标记完成"
3. ✅ 对"待支付"订单点击"取消订单"并填写原因
4. ✅ 尝试取消"已完成"订单（应被阻止）
5. ✅ 并发更新测试（乐观锁机制）

**预期结果**:
- 状态更新响应时间 < 1 秒
- 非法状态转换被阻止并提示错误
- 并发冲突时显示提示并刷新数据

---

### 4.5 边界情况测试

**测试步骤**:
1. ✅ 访问空订单列表（显示"暂无订单"）
2. ✅ 筛选条件无匹配结果（显示"未找到符合条件的订单"）
3. ✅ 访问不存在的订单ID（显示 404 错误）
4. ✅ 大数据量测试（10000+ 条订单，翻页流畅）

---

## 五、Mock 数据开发（可选）

如果后端尚未就绪，可以使用 MSW 进行前端独立开发。

### 5.1 启动 MSW Mock Server

```bash
cd frontend
npm run dev
```

MSW 会自动拦截 API 请求并返回 Mock 数据。

### 5.2 Mock 数据位置

- `frontend/src/mocks/handlers/orderHandlers.ts` - 订单相关 Mock 数据
- `frontend/src/mocks/data/orders.ts` - 订单测试数据

### 5.3 自定义 Mock 数据

编辑 `frontend/src/mocks/data/orders.ts`：

```typescript
export const mockOrders: ProductOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD20251227AB12CD',
    userId: 'user-1',
    status: 'PAID',
    productTotal: 150.00,
    totalAmount: 155.00,
    createdAt: '2025-12-27T10:00:00Z',
    // ...
  },
  // 添加更多测试数据
]
```

---

## 六、常见问题

### Q1: 后端启动失败 - 数据库连接错误

**解决方案**:
1. 检查 `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_KEY` 是否正确
2. 确认 Supabase 项目已启用 Row Level Security (RLS)
3. 验证 Service Role Key 权限

### Q2: 前端无法访问订单列表 - CORS 错误

**解决方案**:
在 `backend` 中配置 CORS：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

### Q3: 订单列表加载缓慢

**排查步骤**:
1. 检查数据库索引是否创建成功
2. 查看后端日志中的 SQL 执行时间
3. 确认默认时间范围（30天）是否合理

**优化方案**:
- 确保 `idx_orders_status_created_at` 复合索引已创建
- 减少默认时间范围（如改为7天）

### Q4: 手机号未脱敏

**检查**:
- 前端工具函数 `maskPhone()` 是否正确调用
- 后端是否根据用户权限返回脱敏数据

---

## 七、下一步

功能验证通过后，可以进入以下阶段：

1. **运行完整测试套件**: `npm run test && npm run test:e2e`
2. **生成实现任务**: `/speckit.tasks`
3. **开始 TDD 开发**: 先写测试，再实现功能

---

## 八、有用的命令

```bash
# 前端开发
npm run dev                  # 启动开发服务器
npm run test                 # 运行单元测试
npm run test:e2e             # 运行 E2E 测试
npm run build                # 构建生产版本

# 后端开发
./mvnw spring-boot:run       # 启动后端服务
./mvnw test                  # 运行后端测试
./mvnw clean package         # 打包应用

# 数据库
# 在 Supabase Dashboard → SQL Editor 中执行查询
```

---

## 相关文档

- [功能规格](./spec.md) - 完整功能需求
- [数据模型](./data-model.md) - 数据库表结构
- [API 契约](./contracts/api.yaml) - API 接口定义
- [技术研究](./research.md) - 技术选型决策

---

**祝开发顺利！** 🚀
