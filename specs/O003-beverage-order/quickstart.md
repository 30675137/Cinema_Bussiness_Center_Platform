# Quickstart Guide: 饮品订单创建与出品管理

**Feature**: O003-beverage-order (Beverage Order & Production Management)
**Version**: 1.0.0
**Last Updated**: 2025-12-27
**Estimated Setup Time**: 30-60 分钟

---

## 目录

1. [前提条件](#前提条件)
2. [仓库设置](#仓库设置)
3. [环境配置](#环境配置)
4. [数据库初始化](#数据库初始化)
5. [后端启动 (Spring Boot)](#后端启动-spring-boot)
6. [前端启动 - B端 (React Admin)](#前端启动---b端-react-admin)
7. [前端启动 - C端 (Taro Mini-program/H5)](#前端启动---c端-taro-mini-programh5)
8. [测试完整工作流程](#测试完整工作流程)
9. [关键文件与目录](#关键文件与目录)
10. [常见问题排查](#常见问题排查)
11. [开发工作流](#开发工作流)
12. [下一步](#下一步)
13. [有用资源](#有用资源)

---

## 前提条件

### 必需软件

| 软件 | 版本要求 | 下载地址 | 验证命令 |
|------|---------|---------|---------|
| **Node.js** | >= 18.0.0 | https://nodejs.org/ | `node --version` |
| **npm** | >= 9.0.0 | (Node.js 自带) | `npm --version` |
| **Java JDK** | 21 | https://adoptium.net/ | `java -version` |
| **Maven** | >= 3.8.0 | https://maven.apache.org/ | `mvn -version` |
| **Git** | >= 2.30.0 | https://git-scm.com/ | `git --version` |

### Supabase 账号设置

1. 访问 https://supabase.com/ 并注册账号
2. 创建新项目 (Project Name: `cinema-business-center`)
3. 记录以下凭证（在 Project Settings > API）：
   - `SUPABASE_URL`: https://xxxxx.supabase.co
   - `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - `SUPABASE_SERVICE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (在 Service Role Key)

### 推荐 IDE 与扩展

**Visual Studio Code** (推荐用于前端):
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

**IntelliJ IDEA** (推荐用于后端):
- Spring Boot Assistant
- Database Navigator
- Lombok Plugin

---

## 仓库设置

### 1. 克隆仓库

```bash
# 克隆项目仓库
git clone https://github.com/your-org/Cinema_Bussiness_Center_Platform.git
cd Cinema_Bussiness_Center_Platform

# 切换到功能分支
git checkout O003-beverage-order

# 验证 active spec
cat .specify/active_spec.txt
# 输出应为: specs/O003-beverage-order
```

### 2. 安装项目依赖

```bash
# 根目录依赖（如果有）
npm install

# 安装后端依赖
cd backend
./mvnw clean install -DskipTests
cd ..

# 安装 B端前端依赖
cd frontend
npm install
cd ..

# 安装 C端前端依赖 (Taro)
cd hall-reserve-taro
npm install
cd ..
```

**验证安装成功**:
```bash
# 检查后端依赖
cd backend && ./mvnw dependency:tree | head -20

# 检查前端依赖
cd frontend && npm list --depth=0 | grep -E "react|antd|tanstack"

# 检查 Taro 依赖
cd hall-reserve-taro && npm list --depth=0 | grep -E "@tarojs|taro-ui"
```

---

## 环境配置

### 1. 后端环境配置

创建 `backend/src/main/resources/application-dev.yml`:

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
    username: postgres
    password: your-database-password
  jpa:
    hibernate:
      ddl-auto: validate  # 不自动修改表结构
    show-sql: true

supabase:
  url: https://xxxxx.supabase.co
  anon-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  service-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

logging:
  level:
    com.cinema: DEBUG
    org.springframework.web: INFO
```

**重要**: 将 `application-dev.yml` 添加到 `.gitignore`，避免泄露密钥。

### 2. B端前端环境配置

创建 `frontend/.env.local`:

```bash
# .env.local (B端前端)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:8080
```

### 3. C端前端环境配置 (Taro)

创建 `hall-reserve-taro/.env.development`:

```bash
# .env.development (C端 Taro)
TARO_APP_SUPABASE_URL=https://xxxxx.supabase.co
TARO_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TARO_APP_API_BASE_URL=http://localhost:8080
TARO_APP_ENABLE_REAL_PAYMENT=false  # MVP 阶段使用 Mock 支付
```

**验证环境变量**:
```bash
# 后端
cd backend && grep -E "supabase.url|supabase.anon-key" src/main/resources/application-dev.yml

# 前端 B端
cd frontend && cat .env.local | grep VITE_

# 前端 C端
cd hall-reserve-taro && cat .env.development | grep TARO_APP_
```

---

## 数据库初始化

### 1. 执行 SQL 迁移脚本

在 Supabase Dashboard (SQL Editor) 中依次执行以下 SQL 脚本：

**步骤 1: 创建饮品相关表**

```sql
-- 1. 饮品主表
CREATE TABLE IF NOT EXISTS beverages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  detail_images JSONB DEFAULT '[]'::jsonb,
  base_price DECIMAL(10,2) NOT NULL,
  nutrition_info JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  is_recommended BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,

  CONSTRAINT check_category CHECK (category IN ('COFFEE', 'TEA', 'JUICE', 'SMOOTHIE', 'MILK_TEA', 'OTHER')),
  CONSTRAINT check_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
  CONSTRAINT check_base_price CHECK (base_price >= 0)
);

CREATE INDEX idx_beverage_category_status ON beverages(category, status) WHERE status = 'ACTIVE';
CREATE INDEX idx_beverage_sort ON beverages(sort_order DESC, created_at DESC);

-- 2. 饮品规格表
CREATE TABLE IF NOT EXISTS beverage_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
  spec_type VARCHAR(50) NOT NULL,
  spec_name VARCHAR(50) NOT NULL,
  spec_code VARCHAR(50),
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT check_spec_type CHECK (spec_type IN ('SIZE', 'TEMPERATURE', 'SWEETNESS', 'TOPPING')),
  CONSTRAINT unique_beverage_spec UNIQUE (beverage_id, spec_type, spec_name)
);

CREATE INDEX idx_spec_beverage ON beverage_specs(beverage_id, spec_type);

-- 3. 饮品配方表
CREATE TABLE IF NOT EXISTS beverage_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
  spec_combination JSONB,
  instructions TEXT,
  preparation_time INTEGER DEFAULT 120,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_beverage_recipe UNIQUE (beverage_id, spec_combination)
);

CREATE INDEX idx_recipe_beverage ON beverage_recipes(beverage_id);

-- 4. 配方原料关联表 (依赖 P001 的 skus 表)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES beverage_recipes(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT check_quantity CHECK (quantity > 0),
  CONSTRAINT unique_recipe_sku UNIQUE (recipe_id, sku_id)
);

CREATE INDEX idx_recipe_ingredient ON recipe_ingredients(recipe_id);
CREATE INDEX idx_ingredient_sku ON recipe_ingredients(sku_id);
```

**步骤 2: 创建订单相关表**

```sql
-- 5. 饮品订单主表
CREATE TABLE IF NOT EXISTS beverage_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  store_id UUID NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  paid_at TIMESTAMP,
  production_start_time TIMESTAMP,
  completed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  customer_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT check_status CHECK (status IN (
    'PENDING_PAYMENT', 'PENDING_PRODUCTION', 'PRODUCING',
    'COMPLETED', 'DELIVERED', 'CANCELLED'
  )),
  CONSTRAINT check_total_price CHECK (total_price >= 0)
);

CREATE INDEX idx_order_user ON beverage_orders(user_id, created_at DESC);
CREATE INDEX idx_order_store_status ON beverage_orders(store_id, status, created_at DESC);
CREATE INDEX idx_order_number ON beverage_orders(order_number);
CREATE INDEX idx_order_created_at ON beverage_orders(created_at DESC);

-- 6. 订单商品项表
CREATE TABLE IF NOT EXISTS beverage_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
  beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE RESTRICT,
  beverage_name VARCHAR(100) NOT NULL,
  beverage_image_url TEXT,
  selected_specs JSONB NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT check_quantity CHECK (quantity > 0),
  CONSTRAINT check_unit_price CHECK (unit_price >= 0),
  CONSTRAINT check_subtotal CHECK (subtotal >= 0),
  CONSTRAINT check_subtotal_calculation CHECK (subtotal = unit_price * quantity)
);

CREATE INDEX idx_order_item_order ON beverage_order_items(order_id);
CREATE INDEX idx_order_item_beverage ON beverage_order_items(beverage_id);

-- 7. 取餐号表
CREATE TABLE IF NOT EXISTS queue_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_number VARCHAR(10) NOT NULL,
  order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL,
  date DATE NOT NULL,
  sequence INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  called_at TIMESTAMP,
  picked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT check_status CHECK (status IN ('PENDING', 'CALLED', 'PICKED')),
  CONSTRAINT check_sequence CHECK (sequence >= 1 AND sequence <= 999),
  CONSTRAINT unique_store_date_sequence UNIQUE (store_id, date, sequence),
  CONSTRAINT unique_order UNIQUE (order_id)
);

CREATE INDEX idx_queue_number ON queue_numbers(store_id, date, status);
CREATE INDEX idx_queue_order ON queue_numbers(order_id);

-- 8. 订单状态变更日志表 (审计用)
CREATE TABLE IF NOT EXISTS beverage_order_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
  from_status VARCHAR(20),
  to_status VARCHAR(20) NOT NULL,
  changed_by UUID,
  change_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT check_from_status CHECK (from_status IN (
    'PENDING_PAYMENT', 'PENDING_PRODUCTION', 'PRODUCING',
    'COMPLETED', 'DELIVERED', 'CANCELLED'
  )),
  CONSTRAINT check_to_status CHECK (to_status IN (
    'PENDING_PAYMENT', 'PENDING_PRODUCTION', 'PRODUCING',
    'COMPLETED', 'DELIVERED', 'CANCELLED'
  ))
);

CREATE INDEX idx_status_log_order ON beverage_order_status_logs(order_id, created_at DESC);
```

**步骤 3: 插入测试数据**

```sql
-- 插入测试饮品数据

-- 美式咖啡
INSERT INTO beverages (id, name, description, category, base_price, status, image_url, is_recommended)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '美式咖啡',
  '经典美式咖啡，浓郁香醇，选用优质咖啡豆现磨',
  'COFFEE',
  15.00,
  'ACTIVE',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  true
) ON CONFLICT (id) DO NOTHING;

-- 美式咖啡规格
INSERT INTO beverage_specs (beverage_id, spec_type, spec_name, spec_code, price_adjustment, is_default)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'SIZE', '小杯', 'small', 0, true),
  ('550e8400-e29b-41d4-a716-446655440000', 'SIZE', '中杯', 'medium', 3.00, false),
  ('550e8400-e29b-41d4-a716-446655440000', 'SIZE', '大杯', 'large', 5.00, false),
  ('550e8400-e29b-41d4-a716-446655440000', 'TEMPERATURE', '热', 'hot', 0, true),
  ('550e8400-e29b-41d4-a716-446655440000', 'TEMPERATURE', '冰', 'cold', 0, false)
ON CONFLICT (beverage_id, spec_type, spec_name) DO NOTHING;

-- 珍珠奶茶
INSERT INTO beverages (id, name, description, category, base_price, status, image_url, is_recommended)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '珍珠奶茶',
  '经典珍珠奶茶，Q弹珍珠，香浓奶香',
  'MILK_TEA',
  18.00,
  'ACTIVE',
  'https://images.unsplash.com/photo-1525385133512-2f3bdd039054',
  true
) ON CONFLICT (id) DO NOTHING;

-- 珍珠奶茶规格
INSERT INTO beverage_specs (beverage_id, spec_type, spec_name, spec_code, price_adjustment, is_default)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'SIZE', '小杯', 'small', 0, true),
  ('660e8400-e29b-41d4-a716-446655440001', 'SIZE', '大杯', 'large', 5.00, false),
  ('660e8400-e29b-41d4-a716-446655440001', 'TEMPERATURE', '热', 'hot', 0, false),
  ('660e8400-e29b-41d4-a716-446655440001', 'TEMPERATURE', '冰', 'cold', 0, true),
  ('660e8400-e29b-41d4-a716-446655440001', 'SWEETNESS', '无糖', 'none', 0, false),
  ('660e8400-e29b-41d4-a716-446655440001', 'SWEETNESS', '半糖', 'half', 0, false),
  ('660e8400-e29b-41d4-a716-446655440001', 'SWEETNESS', '标准', 'normal', 0, true),
  ('660e8400-e29b-41d4-a716-446655440001', 'SWEETNESS', '多糖', 'extra', 0, false),
  ('660e8400-e29b-41d4-a716-446655440001', 'TOPPING', '珍珠', 'pearl', 3.00, false),
  ('660e8400-e29b-41d4-a716-446655440001', 'TOPPING', '椰果', 'coconut', 3.00, false),
  ('660e8400-e29b-41d4-a716-446655440001', 'TOPPING', '布丁', 'pudding', 4.00, false)
ON CONFLICT (beverage_id, spec_type, spec_name) DO NOTHING;
```

**验证数据库初始化**:

```sql
-- 检查饮品数据
SELECT id, name, category, base_price, status FROM beverages;
-- 预期结果: 2 行 (美式咖啡, 珍珠奶茶)

-- 检查规格数据
SELECT b.name, bs.spec_type, bs.spec_name, bs.price_adjustment
FROM beverage_specs bs
JOIN beverages b ON bs.beverage_id = b.id
ORDER BY b.name, bs.spec_type, bs.sort_order;
-- 预期结果: 16 行 (美式 5 行 + 珍珠奶茶 11 行)

-- 检查表结构
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'beverage%'
ORDER BY table_name;
-- 预期结果: 5 行 (beverages, beverage_specs, beverage_recipes, beverage_orders, beverage_order_items)
```

---

## 后端启动 (Spring Boot)

### 1. 启动后端服务

```bash
cd backend

# 方式 1: 使用 Maven Wrapper (推荐)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 方式 2: 使用本地 Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 方式 3: 直接运行 JAR (需先编译)
./mvnw clean package -DskipTests
java -jar target/cinema-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

**预期输出**:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

2025-12-27 10:00:00.000  INFO 12345 --- [main] c.c.CinemaBackendApplication : Starting CinemaBackendApplication
2025-12-27 10:00:05.000  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http)
2025-12-27 10:00:05.100  INFO 12345 --- [main] c.c.CinemaBackendApplication : Started CinemaBackendApplication in 5.234 seconds
```

### 2. 验证后端服务

```bash
# 健康检查
curl http://localhost:8080/actuator/health
# 预期输出: {"status":"UP"}

# 测试饮品列表 API
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/client/beverages
# 预期输出: JSON 响应包含 2 个饮品

# 查看 API 文档 (如果配置了 Springdoc)
open http://localhost:8080/swagger-ui.html
```

**常见问题**:
- **端口 8080 被占用**: 修改 `application-dev.yml` 中的 `server.port`
- **数据库连接失败**: 检查 Supabase 凭证是否正确
- **JDK 版本不匹配**: 确保使用 Java 21

---

## 前端启动 - B端 (React Admin)

### 1. 启动 B端开发服务器

```bash
cd frontend

# 启动开发服务器
npm run dev

# 或使用 Vite 指定端口
npm run dev -- --port 5173
```

**预期输出**:
```
VITE v6.0.7  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

### 2. 访问 B端管理界面

1. 打开浏览器访问: http://localhost:5173
2. 使用测试账号登录 (如果已配置认证):
   - 用户名: `admin@cinema.com`
   - 密码: `admin123`
3. 导航到 "饮品订单管理" 页面

**验证功能**:
- [ ] 登录成功，进入管理后台首页
- [ ] 左侧菜单显示 "饮品订单管理"
- [ ] 点击进入订单管理页面，显示待处理订单列表（8秒轮询）
- [ ] 订单状态标签正确显示（待制作/制作中/已完成）

---

## 前端启动 - C端 (Taro Mini-program/H5)

### 1. 启动 H5 开发模式

```bash
cd hall-reserve-taro

# H5 开发模式
npm run dev:h5

# 预期输出:
# ℹ Taro v4.1.9
#
# 编译  H5  开发模式
#
#   Local:   http://localhost:10086/
#   Network: http://192.168.1.100:10086/
```

访问 http://localhost:10086，查看移动端 H5 页面。

### 2. 启动微信小程序开发模式

```bash
cd hall-reserve-taro

# 微信小程序开发模式
npm run dev:weapp

# 预期输出:
# ℹ Taro v4.1.9
#
# 编译  微信小程序  开发模式
#
# watch mode ready!
```

**步骤**:
1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 导入项目，选择 `hall-reserve-taro/dist/weapp` 目录
4. 点击 "预览" 查看小程序效果

**验证功能**:
- [ ] H5 页面正常加载，显示 Tab Bar (首页/订单/我的)
- [ ] 导航到 "饮品菜单" 页面，显示饮品列表（咖啡、茶饮分类）
- [ ] 点击饮品卡片，进入饮品详情页，显示规格选择器
- [ ] 微信小程序可在开发者工具中正常预览

---

## 测试完整工作流程

### Test Scenario 1: C端下单流程

**目标**: 验证顾客从浏览菜单到完成支付的完整下单流程

**步骤**:

1. **打开 H5 应用**
   ```
   访问: http://localhost:10086
   登录测试账号 (如果需要)
   ```

2. **浏览饮品菜单**
   - 进入 "饮品菜单" 页面
   - 验证: 显示 2 个饮品分类（咖啡、奶茶）
   - 验证: 每个饮品显示名称、价格、图片、推荐标签

3. **选择饮品 - 美式咖啡**
   - 点击 "美式咖啡" 卡片
   - 进入饮品详情页
   - 验证: 显示饮品大图、描述、营养信息
   - 验证: 规格选择器显示 SIZE (小杯/中杯/大杯) 和 TEMPERATURE (热/冰)

4. **选择规格并加入订单**
   - 选择: 大杯 (base_price 15 + price_adjustment 5 = 20元)
   - 选择: 冰
   - 设置数量: 2
   - 点击 "加入订单"
   - 验证: 显示成功提示 "已添加到订单"

5. **选择第二个饮品 - 珍珠奶茶**
   - 返回菜单，点击 "珍珠奶茶"
   - 选择: 小杯, 冰, 半糖, 珍珠 (18 + 3 = 21元)
   - 数量: 1
   - 点击 "加入订单"

6. **查看订单并提交**
   - 点击 "查看订单" 或 "结算" 按钮
   - 进入订单确认页
   - 验证: 订单项显示正确
     - 美式咖啡 (大杯/冰) x2 = 40元
     - 珍珠奶茶 (小杯/冰/半糖/珍珠) x1 = 21元
   - 验证: 总价 = 61元
   - 输入备注: "少冰，谢谢"
   - 点击 "提交订单"

7. **Mock 支付**
   - 验证: 跳转到支付页面，显示订单号 (BORDT202512271430251234)
   - 验证: 显示支付金额 61元
   - 点击 "确认支付" (Mock 支付)
   - 验证: 延迟 500ms 后显示 "支付成功"
   - 验证: 显示订单号和取餐号 (如 D042)
   - 验证: 显示预计制作时间

**预期结果**:
- ✅ 订单创建成功，订单状态: PENDING_PRODUCTION
- ✅ 生成订单号: BORDT + yyyyMMddHHmmss + 4位随机数
- ✅ 生成取餐号: D001-D999
- ✅ 订单总价计算正确: 61元
- ✅ 订单项快照保存正确（饮品名称、规格、价格）

---

### Test Scenario 2: B端出品流程

**目标**: 验证 B端工作人员接收订单并完成出品的完整流程

**步骤**:

1. **打开 B端管理后台**
   ```
   访问: http://localhost:5173
   登录管理员账号
   ```

2. **导航到订单管理页面**
   - 点击左侧菜单 "饮品订单管理"
   - 验证: 显示待处理订单列表
   - 验证: 订单列表每 8 秒自动刷新（观察网络请求）
   - 验证: 新订单显示在列表顶部（按创建时间正序）

3. **查看订单详情**
   - 点击订单号 "BORDT202512271430251234"
   - 进入订单详情页
   - 验证: 显示完整订单信息
     - 订单号、取餐号 D042
     - 订单项列表（美式咖啡 x2, 珍珠奶茶 x1）
     - 顾客备注: "少冰，谢谢"
     - BOM 清单（所需原料及库存）
   - 验证: 显示制作步骤

4. **开始制作 (触发 BOM 扣料)**
   - 点击 "开始制作" 按钮
   - 验证: 显示加载状态
   - 验证: 后端执行 BOM 扣料
     - 调用 P003 库存查询 API 校验库存
     - 调用 P004 库存扣减 API 执行扣料
     - 扣减数量: 咖啡豆 40g (20g x2), 水 600ml (300ml x2), 珍珠 1份, 奶茶粉 1份
   - 验证: 订单状态更新为 PRODUCING
   - 验证: 显示 "开始制作时间": 2025-12-27T14:31:00Z
   - 验证: C端订单详情页状态同步更新为 "制作中" (8秒内)

5. **完成制作 (触发叫号)**
   - 等待模拟制作时间（或直接点击）
   - 点击 "制作完成" 按钮
   - 验证: 订单状态更新为 COMPLETED
   - 验证: 显示 "完成时间": 2025-12-27T14:35:00Z
   - 验证: B端显示 "已叫号" 状态（Mock 语音播报提示）
   - 验证: C端小程序收到取餐通知（模拟推送）
   - 验证: 取餐号状态从 PENDING 变为 CALLED

6. **叫号通知**
   - 点击 "叫号通知" 按钮
   - 验证: B端显示 "正在叫号: D042"
   - 验证: Mock 语音播报文案: "D042 号，您的订单已完成，请取餐"
   - 验证: C端用户收到小程序推送通知

7. **确认交付**
   - 顾客取餐后，工作人员点击 "已交付" 按钮
   - 验证: 订单状态更新为 DELIVERED
   - 验证: 显示 "交付时间": 2025-12-27T14:36:00Z
   - 验证: 订单从待处理列表中移除
   - 验证: 订单归档到历史记录
   - 验证: 取餐号状态更新为 PICKED

**预期结果**:
- ✅ 订单状态流转正确: PENDING_PRODUCTION → PRODUCING → COMPLETED → DELIVERED
- ✅ BOM 扣料成功，库存数量正确减少
- ✅ 叫号系统触发成功（Mock 语音 + 小程序推送）
- ✅ 订单状态变更延迟 < 3 秒（SC-005）
- ✅ 状态变更记录到审计日志表 `beverage_order_status_logs`

---

### Test Scenario 3: 订单历史查询

**目标**: 验证 C端用户查看历史订单和 B端管理员查看营业统计

**步骤 (C端)**:

1. **打开 H5 应用**
   - 访问: http://localhost:10086
   - 登录测试账号

2. **导航到"我的订单"**
   - 点击底部 Tab Bar "订单"
   - 验证: 显示历史订单列表（按创建时间倒序）
   - 验证: 每个订单显示订单号、下单时间、饮品数量、总价、订单状态

3. **筛选订单状态**
   - 点击状态筛选器: "已完成"
   - 验证: 仅显示 status = COMPLETED 的订单
   - 点击 "已交付"
   - 验证: 仅显示 status = DELIVERED 的订单

4. **查看订单详情**
   - 点击某个历史订单
   - 验证: 显示完整订单信息（饮品、规格、价格、支付时间、取餐号）

5. **一键复购**
   - 在订单详情页点击 "再来一单"
   - 验证: 系统自动填充相同的饮品和规格到当前订单
   - 验证: 可以直接提交新订单

**步骤 (B端)**:

1. **导航到营业统计页面**
   - 登录 B端管理后台
   - 点击 "营业统计"

2. **查看统计数据**
   - 验证: 显示今日订单数量、销售额
   - 验证: 显示热销饮品排行（Top 5）
   - 验证: 支持时间范围筛选（今日/本周/本月）

3. **导出报表**
   - 选择时间范围: 本周
   - 点击 "导出报表"
   - 验证: 生成 Excel 文件
   - 验证: 包含订单明细、销售汇总、原料消耗统计

**预期结果**:
- ✅ 历史订单查询响应时间 < 1 秒（SC-009）
- ✅ 订单详情显示正确（快照数据不受菜单变更影响）
- ✅ 一键复购功能正常工作
- ✅ 营业统计数据准确（订单数量、销售额、热销排行）
- ✅ 报表导出成功，数据格式正确

---

### Edge Case Testing (边界情况测试)

**库存不足场景**:
1. 模拟原料库存不足（通过 Supabase 直接修改 `store_inventory` 表）
2. C端下单包含该饮品
3. B端点击 "开始制作"
4. 验证: BOM 扣料失败，显示错误提示 "原料库存不足: 咖啡豆 (需要 40g, 库存 15g)"
5. 验证: 订单状态保持 PENDING_PRODUCTION，不变更为 PRODUCING

**支付失败场景**:
1. C端提交订单后，模拟支付接口返回错误
2. 验证: 订单状态保持 PENDING_PAYMENT
3. 验证: 显示友好错误提示 "支付失败，请重试"
4. 验证: 订单未生成取餐号

**重复提交订单**:
1. C端快速连续点击 "提交订单" 按钮 3 次
2. 验证: 按钮防抖处理，仅创建 1 个订单
3. 验证: 后续点击被忽略或显示加载状态

**并发订单场景**:
1. 模拟 3 个用户同时下单
2. 验证: 取餐号生成唯一（D001, D002, D003）
3. 验证: 无重复取餐号（通过数据库唯一约束保证）
4. 验证: BOM 扣料正确，库存数量准确

---

## 关键文件与目录

### 后端 (Spring Boot)

```
backend/src/main/java/com/cinema/
├── controller/
│   ├── client/
│   │   ├── BeverageController.java                  # C端饮品菜单 API
│   │   ├── BeverageOrderController.java             # C端订单 API
│   │   └── QueueNumberController.java               # C端取餐号查询 API
│   └── admin/
│       ├── AdminBeverageOrderController.java        # B端订单管理 API
│       ├── AdminBeverageController.java             # B端饮品管理 API (仅 API)
│       └── BeverageRecipeController.java            # B端配方管理 API
├── service/
│   ├── BeverageService.java                         # 饮品业务逻辑
│   ├── BeverageOrderService.java                    # 订单业务逻辑
│   ├── QueueNumberService.java                      # 取餐号生成逻辑
│   ├── BeverageOrderStateMachine.java               # 订单状态机
│   └── InventoryIntegrationService.java             # P003/P004 集成服务
├── repository/
│   ├── BeverageRepository.java                      # 饮品数据访问
│   ├── BeverageOrderRepository.java                 # 订单数据访问
│   ├── QueueNumberRepository.java                   # 取餐号数据访问
│   └── RecipeIngredientRepository.java              # 配方原料数据访问
├── dto/
│   ├── BeverageDTO.java                             # 饮品 DTO
│   ├── BeverageDetailDTO.java                       # 饮品详情 DTO
│   ├── BeverageOrderDTO.java                        # 订单 DTO
│   ├── CreateBeverageOrderRequest.java              # 创建订单请求
│   └── QueueNumberDTO.java                          # 取餐号 DTO
├── domain/
│   ├── Beverage.java                                # 饮品实体
│   ├── BeverageSpec.java                            # 饮品规格实体
│   ├── BeverageRecipe.java                          # 饮品配方实体
│   ├── BeverageOrder.java                           # 订单实体
│   ├── BeverageOrderItem.java                       # 订单项实体
│   └── QueueNumber.java                             # 取餐号实体
├── exception/
│   ├── BeverageNotFoundException.java               # 饮品未找到异常
│   ├── OrderNotFoundException.java                  # 订单未找到异常
│   ├── InsufficientInventoryException.java          # 库存不足异常
│   ├── InvalidOrderStateTransitionException.java    # 非法状态变更异常
│   └── QueueNumberExhaustedException.java           # 取餐号用尽异常
└── config/
    ├── SecurityConfig.java                          # 安全配置
    ├── SupabaseConfig.java                          # Supabase 配置
    └── ApiResponseConfig.java                       # 统一响应格式配置

backend/src/main/resources/
├── application.yml                                  # 主配置文件
├── application-dev.yml                              # 开发环境配置
└── application-prod.yml                             # 生产环境配置
```

---

### 前端 - B端 (React Admin)

```
frontend/src/
├── features/beverage-order-management/
│   ├── components/
│   │   ├── OrderList.tsx                            # 订单列表组件
│   │   ├── OrderDetail.tsx                          # 订单详情组件
│   │   ├── PendingOrders.tsx                        # 待处理订单（轮询）
│   │   ├── OrderStatusTag.tsx                       # 订单状态标签
│   │   ├── BOMList.tsx                              # BOM 清单组件
│   │   └── CallNumberButton.tsx                     # 叫号按钮
│   ├── hooks/
│   │   ├── useBeverageOrders.ts                     # 订单查询 Hook (TanStack Query)
│   │   ├── usePendingOrders.ts                      # 待处理订单轮询 Hook
│   │   ├── useOrderStatusUpdate.ts                  # 订单状态更新 Hook
│   │   ├── useStartProduction.ts                    # 开始制作 Hook (含 BOM 扣料)
│   │   └── useCallNumber.ts                         # 叫号通知 Hook
│   ├── services/
│   │   └── beverageOrderApi.ts                      # API 调用封装
│   └── types/
│       └── beverageOrder.types.ts                   # 类型定义
├── pages/
│   └── BeverageOrderManagement.tsx                  # 订单管理页面入口
└── stores/
    └── orderStore.ts                                # 订单状态管理 (Zustand)
```

---

### 前端 - C端 (Taro)

```
hall-reserve-taro/src/
├── pages/
│   ├── beverage-menu/                               # 饮品菜单页
│   │   ├── index.tsx                                # 菜单页面主文件
│   │   ├── index.config.ts                          # 页面配置
│   │   └── index.module.less                        # 样式文件
│   ├── beverage-detail/                             # 饮品详情页
│   │   ├── index.tsx
│   │   ├── components/
│   │   │   ├── SpecSelector.tsx                     # 规格选择器组件
│   │   │   └── NutritionInfo.tsx                    # 营养信息组件
│   │   └── index.module.less
│   ├── beverage-order-confirm/                      # 订单确认页
│   │   ├── index.tsx
│   │   └── index.module.less
│   ├── beverage-order-payment/                      # Mock 支付页
│   │   ├── index.tsx
│   │   └── index.module.less
│   ├── beverage-order-detail/                       # 订单详情页
│   │   ├── index.tsx
│   │   ├── components/
│   │   │   ├── OrderStatusTimeline.tsx              # 订单状态时间轴
│   │   │   └── QueueNumberDisplay.tsx               # 取餐号展示
│   │   └── index.module.less
│   └── my-beverage-orders/                          # 我的订单页
│       ├── index.tsx
│       ├── components/
│       │   ├── OrderCard.tsx                        # 订单卡片
│       │   └── OrderFilter.tsx                      # 订单筛选器
│       └── index.module.less
├── components/
│   ├── BeverageCard/                                # 饮品卡片组件
│   │   ├── index.tsx
│   │   └── index.module.less
│   ├── SpecSelector/                                # 规格选择组件
│   │   ├── index.tsx
│   │   └── index.module.less
│   └── OrderStatusBadge/                            # 订单状态徽章
│       ├── index.tsx
│       └── index.module.less
├── services/
│   ├── beverageApi.ts                               # 饮品 API (Taro.request 封装)
│   ├── beverageOrderApi.ts                          # 订单 API
│   └── queueNumberApi.ts                            # 取餐号 API
├── stores/
│   ├── beverageStore.ts                             # 饮品菜单状态 (Zustand)
│   ├── orderStore.ts                                # 订单状态
│   └── userStore.ts                                 # 用户状态 (复用现有)
├── utils/
│   ├── request.ts                                   # 统一请求封装 (复用现有)
│   └── priceCalculator.ts                           # 价格计算工具
└── types/
    ├── beverage.types.ts                            # 饮品类型定义
    ├── order.types.ts                               # 订单类型定义
    └── spec.types.ts                                # 规格类型定义
```

---

## 常见问题排查

### Issue 1: Supabase 连接失败

**症状**:
```
ERROR: Connection to database failed: FATAL: password authentication failed for user "postgres"
```

**解决方案**:
1. 验证 `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确
2. 检查 Supabase 项目是否处于活跃状态（非暂停）
3. 确认数据库密码是否正确（在 Supabase Dashboard > Database Settings 中重置密码）
4. 检查网络防火墙是否阻止了 Supabase 连接

**验证命令**:
```bash
# 测试 Supabase 连接
curl https://YOUR_PROJECT_ID.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"
# 预期输出: JSON 响应
```

---

### Issue 2: BOM 扣料失败

**症状**:
```
Error: BOM扣料失败 - 原料库存不足: 咖啡豆 (需要 40g, 库存 15g)
```

**解决方案**:
1. **确保 P003/P004 模块已启动并可访问**
   ```bash
   # 测试 P003 库存查询 API
   curl http://localhost:8080/api/inventory/store/{storeId}/sku/{skuId}

   # 预期输出: {"success":true,"data":{"availableQuantity":100, ...}}
   ```

2. **检查原料库存数据是否存在**
   ```sql
   -- 查询门店库存
   SELECT si.*, s.name AS sku_name
   FROM store_inventory si
   JOIN skus s ON si.sku_id = s.id
   WHERE si.store_id = '你的门店ID';
   ```

3. **检查饮品配方是否正确配置**
   ```sql
   -- 查询饮品配方
   SELECT br.*, ri.sku_id, s.name AS ingredient_name, ri.quantity, ri.unit
   FROM beverage_recipes br
   JOIN recipe_ingredients ri ON br.id = ri.recipe_id
   JOIN skus s ON ri.sku_id = s.id
   WHERE br.beverage_id = '550e8400-e29b-41d4-a716-446655440000';
   ```

4. **增加原料库存（临时解决）**
   ```sql
   -- 增加咖啡豆库存到 1000g
   UPDATE store_inventory
   SET available_quantity = 1000, total_quantity = 1000
   WHERE sku_id = (SELECT id FROM skus WHERE name = '咖啡豆')
     AND store_id = '你的门店ID';
   ```

---

### Issue 3: 取餐号未生成

**症状**:
```
订单支付成功，但订单详情页未显示取餐号
```

**解决方案**:
1. **检查数据库 `queue_numbers` 表**
   ```sql
   -- 查询订单的取餐号
   SELECT * FROM queue_numbers
   WHERE order_id = '你的订单ID';
   ```

2. **检查当日取餐号是否用尽**
   ```sql
   -- 查询当日取餐号使用情况
   SELECT COUNT(*), MAX(sequence)
   FROM queue_numbers
   WHERE store_id = '你的门店ID'
     AND date = CURRENT_DATE;
   -- 如果 MAX(sequence) = 999，说明已用尽
   ```

3. **手动生成取餐号（测试用）**
   ```sql
   -- 手动插入取餐号
   INSERT INTO queue_numbers (queue_number, order_id, store_id, date, sequence, status)
   VALUES ('D042', '你的订单ID', '你的门店ID', CURRENT_DATE, 42, 'PENDING');
   ```

4. **检查后端日志**
   ```bash
   # 查看后端日志
   tail -f backend/backend.log | grep "QueueNumber"

   # 预期输出:
   # 2025-12-27 14:30:30 INFO  QueueNumberService - Generated queue number: D042 for order: xxx
   ```

---

### Issue 4: B端轮询未工作

**症状**:
```
B端订单列表不自动刷新，新订单未显示
```

**解决方案**:
1. **检查 TanStack Query 配置**
   ```typescript
   // frontend/src/features/beverage-order/hooks/usePendingOrders.ts
   export const usePendingOrders = (storeId: string) => {
     return useQuery({
       queryKey: ['beverage-orders', 'pending', storeId],
       queryFn: () => fetchPendingOrders(storeId),
       refetchInterval: 8000, // 确保设置为 8000 毫秒
       enabled: true,          // 确保启用轮询
     });
   };
   ```

2. **检查浏览器网络请求**
   - 打开 Chrome DevTools > Network
   - 验证是否每 8 秒发送一次 GET 请求到 `/api/admin/beverage-orders/pending`

3. **验证后端 API 响应**
   ```bash
   # 手动测试 API
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:8080/api/admin/beverage-orders/pending?storeId=YOUR_STORE_ID"
   ```

4. **检查浏览器 Tab 是否后台运行**
   - TanStack Query 默认在 Tab 后台时停止轮询
   - 切换到前台验证是否恢复轮询

---

### Issue 5: Taro H5/WeApp 构建失败

**症状**:
```
Error: Module not found: Can't resolve '@tarojs/components'
```

**解决方案**:
1. **清除缓存并重新安装依赖**
   ```bash
   cd hall-reserve-taro
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **验证 Taro 版本**
   ```bash
   npm list @tarojs/cli
   # 预期输出: @tarojs/cli@4.1.9 或更高版本
   ```

3. **检查 `config/index.ts` 配置**
   ```typescript
   // hall-reserve-taro/config/index.ts
   import { defineConfig } from '@tarojs/cli';

   export default defineConfig({
     designWidth: 750,
     deviceRatio: {
       640: 2.34 / 2,
       750: 1,
       828: 1.81 / 2
     },
     sourceRoot: 'src',
     outputRoot: 'dist',
     // ... 其他配置
   });
   ```

4. **重新构建**
   ```bash
   npm run build:h5
   npm run build:weapp
   ```

---

### Issue 6: Mock 支付未触发

**症状**:
```
点击支付按钮后，订单状态未变更为 PENDING_PRODUCTION
```

**解决方案**:
1. **检查前端支付 API 调用**
   ```typescript
   // hall-reserve-taro/src/services/beverageOrderApi.ts
   export const mockPayment = async (orderId: string) => {
     await new Promise(resolve => setTimeout(resolve, 500));

     const response = await request({
       url: `/api/client/beverage-orders/${orderId}/pay`,
       method: 'POST',
       data: {
         paymentMethod: 'MOCK_WECHAT_PAY',
         transactionId: `MOCK_${Date.now()}`
       }
     });

     return response.data;
   };
   ```

2. **检查后端支付 API**
   ```bash
   # 手动测试支付 API
   curl -X POST http://localhost:8080/api/client/beverage-orders/{orderId}/pay \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"paymentMethod":"MOCK_WECHAT_PAY"}'
   ```

3. **检查订单状态是否允许支付**
   ```sql
   -- 查询订单状态
   SELECT id, order_number, status FROM beverage_orders
   WHERE id = '你的订单ID';
   -- 确保 status = 'PENDING_PAYMENT'
   ```

---

## 开发工作流

### Feature Development Workflow (功能开发流程)

1. **创建功能分支**
   ```bash
   git checkout O003-beverage-order
   git pull origin O003-beverage-order
   git checkout -b feature/beverage-order-detail-enhancement
   ```

2. **添加 @spec 标识到新文件**
   ```typescript
   /**
    * @spec O003-beverage-order
    * 饮品订单详情页面增强
    */
   import React from 'react';

   export const BeverageOrderDetail = () => {
     // ...
   };
   ```

3. **测试驱动开发 (TDD)**
   ```bash
   # 先写测试
   cd frontend
   npm run test -- BeverageOrderDetail.test.tsx

   # 运行测试（预期失败 - Red）
   npm run test

   # 实现功能（使测试通过 - Green）
   # ...编写代码...

   # 重构优化 (Refactor)
   npm run test
   ```

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat(O003): 增强饮品订单详情页展示

   - 新增订单状态时间轴组件
   - 优化取餐号显示样式
   - 支持订单状态实时轮询更新

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

5. **运行测试**
   ```bash
   # 前端单元测试
   cd frontend && npm run test

   # 后端单元测试
   cd backend && ./mvnw test

   # E2E 测试 (Playwright)
   cd frontend && npm run test:e2e
   ```

6. **提交 Pull Request**
   ```bash
   git push origin feature/beverage-order-detail-enhancement

   # 创建 PR (使用 gh CLI)
   gh pr create --title "feat(O003): 增强饮品订单详情页展示" \
     --body "$(cat <<'EOF'
   ## Summary
   - 新增订单状态时间轴组件
   - 优化取餐号显示样式
   - 支持订单状态实时轮询更新

   ## Test plan
   - [x] 单元测试通过 (npm run test)
   - [x] E2E 测试通过 (npm run test:e2e)
   - [x] 手动测试订单详情页功能
   - [x] 验证轮询机制正常工作

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

---

### Testing Commands (测试命令)

```bash
# ========== 后端测试 ==========

# 运行所有后端测试
cd backend && ./mvnw test

# 运行单个测试类
./mvnw test -Dtest=BeverageOrderServiceTest

# 运行测试并生成覆盖率报告
./mvnw test jacoco:report
# 查看报告: backend/target/site/jacoco/index.html

# ========== B端前端测试 ==========

# 运行所有单元测试 (Vitest)
cd frontend && npm run test

# 运行测试并监听文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试 (Playwright)
npm run test:e2e

# 运行 E2E 测试（可视化模式）
npm run test:e2e:ui

# ========== C端前端测试 ==========

# 运行 Taro 测试
cd hall-reserve-taro && npm run test

# 运行测试并监听文件变化
npm run test:watch
```

---

## 下一步

完成本 quickstart 指南后，建议按以下顺序学习：

### 1. 阅读核心文档

- **`spec.md`**: 完整的功能需求规格说明
- **`data-model.md`**: 数据库表结构详细定义
- **`contracts/api.yaml`**: OpenAPI 3.0 API 规范
- **`research.md`**: 技术决策与替代方案分析

### 2. 学习项目规则

- **`.claude/rules/00-project-overview.md`**: 项目概述
- **`.claude/rules/01-branch-spec-binding.md`**: 分支与规格绑定规则
- **`.claude/rules/02-test-driven-development.md`**: TDD 开发流程
- **`.claude/rules/03-frontend-b-tech-stack.md`**: B端技术栈规范
- **`.claude/rules/04-frontend-c-tech-stack.md`**: C端技术栈规范（Taro）
- **`.claude/rules/08-api-standards.md`**: API 响应格式标准

### 3. 实践开发任务

**推荐顺序**:
1. **后端饮品管理 API** (优先级 P0)
   - 实现 `BeverageController` (C端查询 API)
   - 实现 `BeverageAdminController` (B端管理 API)
   - 编写单元测试和集成测试

2. **C端饮品菜单页** (优先级 P0)
   - 实现饮品列表页面（分类展示）
   - 实现饮品详情页面（规格选择器）
   - 集成 TanStack Query 进行数据获取

3. **C端下单流程** (优先级 P0)
   - 实现订单确认页面
   - 实现 Mock 支付流程
   - 实现订单详情页（状态轮询）

4. **B端订单接收页** (优先级 P0)
   - 实现待处理订单列表（8秒轮询）
   - 实现订单详情页（BOM 清单）
   - 实现订单状态管理（开始制作/完成/交付）

5. **BOM 扣料集成** (优先级 P0)
   - 集成 P003 库存查询 API
   - 集成 P004 库存扣减 API
   - 实现库存校验和扣料逻辑

6. **叫号系统 (Mock)** (优先级 P1)
   - 实现取餐号生成逻辑
   - 实现 Mock 语音播报（B端显示状态）
   - 实现小程序推送通知（模拟）

7. **订单历史查询** (优先级 P2)
   - 实现 C端历史订单列表
   - 实现一键复购功能
   - 实现 B端营业统计页面

---

## 有用资源

### 项目文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 功能规格 | `/specs/O003-beverage-order/spec.md` | 完整需求说明 |
| 数据模型 | `/specs/O003-beverage-order/data-model.md` | 数据库表设计 |
| API 契约 | `/specs/O003-beverage-order/contracts/api.yaml` | OpenAPI 规范 |
| 技术研究 | `/specs/O003-beverage-order/research.md` | 技术决策文档 |
| 项目规则 | `/.claude/rules/` | 编码规范与最佳实践 |

### 外部文档

| 技术 | 文档地址 |
|------|---------|
| **Supabase** | https://supabase.com/docs |
| **Taro Framework** | https://taro-docs.jd.com/ |
| **Ant Design** | https://ant.design/components/overview |
| **TanStack Query** | https://tanstack.com/query/latest/docs/framework/react/overview |
| **Zustand** | https://zustand.docs.pmnd.rs/ |
| **Spring Boot** | https://spring.io/projects/spring-boot |
| **Playwright** | https://playwright.dev/ |

### API 调试工具

- **Postman Collection**: `/postman/O003-beverage-order.json`
- **Swagger UI** (本地): http://localhost:8080/swagger-ui.html
- **Supabase Studio**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

### 社区支持

- **项目 Issue Tracker**: https://github.com/your-org/Cinema_Bussiness_Center_Platform/issues
- **内部 Wiki**: (如果有内部文档系统)
- **Slack Channel**: #cinema-beverage-order (如果有团队沟通工具)

---

## 附录: 快速命令参考

```bash
# ========== 仓库管理 ==========
git checkout O003-beverage-order                # 切换到功能分支
cat .specify/active_spec.txt                   # 查看 active spec

# ========== 后端 ==========
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev  # 启动后端
./mvnw test                                     # 运行测试
curl http://localhost:8080/actuator/health     # 健康检查

# ========== 前端 B端 ==========
cd frontend
npm run dev                                     # 启动开发服务器
npm run test                                    # 运行单元测试
npm run test:e2e                                # 运行 E2E 测试

# ========== 前端 C端 (Taro) ==========
cd hall-reserve-taro
npm run dev:h5                                  # H5 开发模式
npm run dev:weapp                               # 微信小程序开发模式
npm run build:h5                                # 构建 H5
npm run build:weapp                             # 构建微信小程序

# ========== 数据库 ==========
# 通过 Supabase Dashboard SQL Editor 执行 SQL

# ========== 日志查看 ==========
tail -f backend/backend.log                     # 查看后端日志
tail -f frontend/frontend.log                   # 查看前端日志
```

---

**文档版本**: 1.0.0
**最后更新**: 2025-12-27
**维护者**: Cinema Development Team
**反馈**: 如有问题或建议，请提交 Issue 到项目仓库

---

**Happy Coding!** 🎉
