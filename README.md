# 影院商品管理中台 (Cinema Business Center Platform)

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Taro](https://img.shields.io/badge/Taro-4.1.9-blue.svg)](https://taro.zone/)

影院商品管理中台系统，支持 B端管理后台（React + Ant Design）和 C端用户应用（Taro 多端），提供商品管理、库存管理、订单管理等核心功能。

## 📋 目录

- [项目概览](#项目概览)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [API 文档](#api-文档)
- [故障排查](#故障排查)
- [贡献指南](#贡献指南)

## 项目概览

影院商品管理中台是一个全栈系统，采用前后端分离架构：

- **B端 (管理后台)**: React + Ant Design，提供商品、库存、订单、门店管理
- **C端 (用户端/小程序)**: Taro 框架，支持微信小程序、H5 等多端
- **后端**: Spring Boot + Supabase，提供 RESTful API 和数据存储

## 核心功能

### 📦 商品与库存管理
- SKU 管理 (规格、库存、分类)
- 品牌管理
- 库存查询与调整
- 多门店库存管理

### 🍹 饮品订单管理 (O003-beverage-order)

#### US1: C端饮品下单
- 浏览饮品菜单（分类、图片、价格、描述、库存状态）
- 选择饮品及规格（大小、温度、甜度、配料等）
- 添加到订单并提交
- 支付完成后生成订单号和取餐号
- 查看订单状态（待制作/制作中/已完成/已交付）

#### US2: B端订单接收与出品
- 实时接收新订单通知（语音/震动提醒）
- 查看订单详情（饮品、规格、数量、备注）
- **自动BOM扣料**（根据配方扣减原料库存）
- 更新订单状态（待制作 → 制作中 → 已完成 → 已交付）
- 叫号通知顾客取餐

#### US3: 订单历史与统计
- C端订单历史查询（支持状态筛选、分页加载）
- 订单号搜索
- 一键复购
- B端销售统计（今日/本周/本月/自定义时间范围）
- 热销饮品排行榜
- 导出 Excel 销售报表

### 🏪 门店与影厅管理
- 门店信息管理
- 影厅配置
- 场景包预约

## 技术栈

### 前端 (B端 - React)
| 技术 | 版本 | 用途 |
|-----|------|------|
| React | 19.2.0 | UI 框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Ant Design | 6.1.0 | UI 组件库 |
| Zustand | 5.0.9 | 客户端状态管理 |
| TanStack Query | 5.90.12 | 服务器状态管理 |
| React Router | 7.10.1 | 路由管理 |
| Vite | 6.0.7 | 构建工具 |
| Recharts | 3.5.1 | 数据可视化 |

### 前端 (C端 - Taro)
| 技术 | 版本 | 用途 |
|-----|------|------|
| Taro | 4.1.9 | 多端统一开发框架 |
| React | 19.2.0 | UI 框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Zustand | 5.0.9 | 状态管理 |
| TanStack Query | 5.90.12 | 数据查询 |

### 后端
| 技术 | 版本 | 用途 |
|-----|------|------|
| Java | 21 | 运行时 |
| Spring Boot | 3.x | 应用框架 |
| Supabase | - | 数据库/认证/存储 |
| Apache POI | 5.2.5 | Excel 报表生成 |
| SLF4J + Logback | - | 结构化日志 |

## 项目结构

```
Cinema_Bussiness_Center_Platform/
├── backend/                        # Spring Boot 后端
│   ├── src/main/java/com/cinema/
│   │   ├── beverage/               # 饮品订单模块 (@spec O003-beverage-order)
│   │   │   ├── controller/         # REST API 控制器
│   │   │   ├── service/            # 业务逻辑层
│   │   │   ├── repository/         # 数据访问层
│   │   │   ├── entity/             # JPA 实体
│   │   │   ├── dto/                # 数据传输对象
│   │   │   └── exception/          # 异常处理
│   │   ├── inventory/              # 库存管理模块
│   │   └── order/                  # 预约订单模块
│   └── src/main/resources/
│       └── application.yml         # 配置文件
├── frontend/                       # B端 React 前端
│   ├── src/
│   │   ├── components/             # 通用组件
│   │   ├── features/               # 功能模块
│   │   │   └── beverage-order-management/  # 饮品订单管理 (@spec O003-beverage-order)
│   │   │       ├── pages/          # 页面组件
│   │   │       ├── components/     # 业务组件
│   │   │       ├── hooks/          # 自定义 Hooks
│   │   │       ├── services/       # API 服务
│   │   │       └── types/          # 类型定义
│   │   ├── hooks/                  # 全局 Hooks
│   │   └── services/               # API 服务
│   └── package.json
├── hall-reserve-taro/              # C端 Taro 小程序/H5
│   ├── src/
│   │   ├── pages/                  # 页面
│   │   │   ├── beverage/           # 饮品菜单 (@spec O003-beverage-order)
│   │   │   └── order/              # 订单管理 (@spec O003-beverage-order)
│   │   ├── hooks/                  # 自定义 Hooks
│   │   ├── services/               # API 服务
│   │   └── stores/                 # 状态管理
│   └── package.json
├── specs/                          # 功能规格文档
│   └── O003-beverage-order/        # 饮品订单规格
│       ├── spec.md                 # 需求规格
│       ├── plan.md                 # 实施计划
│       ├── tasks.md                # 任务列表
│       └── contracts/
│           └── api.yaml            # OpenAPI 3.0 规范
└── README.md                       # 本文件
```

## 快速开始

### 前置要求

- **Java**: JDK 21+
- **Node.js**: 18.x+
- **npm**: 9.x+
- **PostgreSQL**: 14+ (通过 Supabase)

### 1. 克隆仓库

```bash
git clone <repository-url>
cd Cinema_Bussiness_Center_Platform
```

### 2. 配置 Supabase

1. 在 [Supabase](https://supabase.com/) 创建项目
2. 获取项目 URL 和 anon key
3. 配置后端环境变量：

```bash
# backend/src/main/resources/application.yml
supabase:
  url: ${SUPABASE_URL}
  anon-key: ${SUPABASE_ANON_KEY}
```

4. 运行数据库迁移脚本（位于 `specs/O003-beverage-order/migrations/`）

### 3. 启动后端

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

后端将在 `http://localhost:8080` 启动。

### 4. 启动 B端前端

```bash
cd frontend
npm install
npm run dev
```

B端管理后台将在 `http://localhost:5173` 启动。

### 5. 启动 C端小程序/H5

**H5 开发模式:**
```bash
cd hall-reserve-taro
npm install
npm run dev:h5
```

**微信小程序开发模式:**
```bash
npm run dev:weapp
```

使用微信开发者工具打开 `hall-reserve-taro/dist` 目录。

## 开发指南

### 分支管理

项目遵循功能分支绑定规则（详见 `.claude/rules/01-branch-spec-binding.md`）：

- 分支命名：`feat/<specId>-<slug>`
- 示例：`feat/O003-beverage-order`
- 每个功能对应唯一的规格标识符 (specId)

### 代码规范

#### Java 后端
- 使用 Java 21 特性
- 遵循 Spring Boot 最佳实践
- 关键方法必须编写 JavaDoc 注释
- 所有业务逻辑文件添加 `@spec` 标识

```java
/**
 * @spec O003-beverage-order
 * 饮品订单服务类
 */
@Service
public class BeverageOrderService {
    // ...
}
```

#### TypeScript 前端
- 严格模式 `"strict": true`
- 禁止使用 `any` 类型
- 所有函数参数和返回值必须有类型注解
- 使用 ESLint + Prettier 格式化代码

```typescript
/**
 * @spec O003-beverage-order
 * 饮品订单管理页面
 */
export const OrderListPage: React.FC = () => {
  // ...
}
```

### 测试驱动开发 (TDD)

遵循 Red-Green-Refactor 循环（详见 `.claude/rules/02-test-driven-development.md`）：

1. **Red**: 先写测试，确保测试失败
2. **Green**: 实现最小可行代码使测试通过
3. **Refactor**: 重构优化代码

**测试命令:**
```bash
# 后端单元测试
cd backend && ./mvnw test

# 前端单元测试
cd frontend && npm run test

# 前端 E2E 测试
cd frontend && npm run test:e2e

# C端单元测试
cd hall-reserve-taro && npm run test
```

### Git 提交规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型:**
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例:**
```
feat(O003-beverage-order): 添加订单历史查询功能

- 支持按状态筛选订单
- 支持分页加载
- 集成 TanStack Query 进行缓存管理

Closes #123
```

## API 文档

### 饮品订单 API (O003-beverage-order)

完整的 OpenAPI 3.0 规范见 `specs/O003-beverage-order/contracts/api.yaml`。

#### C端 API

**1. 获取饮品列表**
```http
GET /api/beverages?storeId={storeId}&categoryId={categoryId}
```

**2. 创建订单**
```http
POST /api/beverage-orders
Content-Type: application/json

{
  "storeId": "uuid",
  "items": [
    {
      "beverageId": "uuid",
      "quantity": 2,
      "selectedSpecs": {
        "size": "large",
        "temperature": "hot"
      }
    }
  ]
}
```

**3. 支付订单 (Mock)**
```http
POST /api/beverage-orders/{orderId}/pay
```

**4. 查询订单历史**
```http
GET /api/beverage-orders/history?userId={userId}&status={status}&page=0&pageSize=10
```

**5. 订单号搜索**
```http
GET /api/beverage-orders/by-number/{orderNumber}
```

#### B端 API

**1. 查询待处理订单**
```http
GET /api/admin/beverage-orders/pending?storeId={storeId}
```

**2. 更新订单状态**
```http
PATCH /api/admin/beverage-orders/{orderId}/status
Content-Type: application/json

{
  "status": "PRODUCING"
}
```

**3. 订单统计数据**
```http
GET /api/admin/beverage-orders/statistics?rangeType=TODAY&storeId={storeId}
```

**4. 导出 Excel 报表**
```http
GET /api/admin/beverage-orders/export?startDate=2025-12-20&endDate=2025-12-27
```

### API 响应格式

所有 API 遵循统一响应格式（详见 `.claude/rules/08-api-standards.md`）：

**成功响应:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**错误响应:**
```json
{
  "success": false,
  "error": "ORD_VAL_001",
  "message": "订单验证失败",
  "details": { ... },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

## 故障排查

### 后端问题

#### 1. Supabase 连接失败

**症状:** 后端启动时报错 `Connection refused` 或 `401 Unauthorized`

**解决方案:**
- 检查 `application.yml` 中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 配置
- 确认 Supabase 项目状态正常
- 检查网络连接和防火墙设置

#### 2. 数据库表不存在

**症状:** 运行时报错 `relation "beverage_orders" does not exist`

**解决方案:**
```bash
# 运行数据库迁移脚本
psql -h <supabase-host> -U postgres -d postgres -f specs/O003-beverage-order/migrations/001_create_tables.sql
```

#### 3. BOM 扣料失败

**症状:** 日志显示 `BomDeduction - ITEM_FAILED` 或 `InventoryDeduction - FAILED`

**解决方案:**
- 检查库存调整 API 是否正常运行 (`http://localhost:8080/api/adjustments`)
- 确认饮品配方已正确配置（`beverage_recipes` 表）
- 查看结构化日志中的详细错误信息（包含 skuId, quantity 等信息）

#### 4. 查看结构化日志

后端使用 SLF4J 记录结构化日志，关键操作日志格式：

```
OrderCreation - SUCCESS: orderNumber=BORDT20251227143025, totalPrice=45.50, operation=CREATE_ORDER
Payment - SUCCESS: orderId=uuid, queueNumber=D042, operation=PAY_ORDER
BomDeduction - SUCCESS: orderNumber=BORDT20251227143025, totalMaterials=5, operation=BOM_DEDUCT
StatusUpdate - COMPLETED: orderId=uuid, oldStatus=PRODUCING, newStatus=COMPLETED, operation=UPDATE_ORDER_STATUS
```

使用 grep 过滤关键操作：
```bash
# 查看所有订单创建日志
grep "operation=CREATE_ORDER" logs/application.log

# 查看 BOM 扣料失败日志
grep "BomDeduction - FAILED" logs/application.log

# 查看支付失败日志
grep "Payment - FAILED" logs/application.log
```

### 前端问题

#### 1. API 请求 401 Unauthorized

**症状:** 浏览器控制台显示 401 错误

**解决方案:**
- 检查 localStorage 中的 token 是否有效
- 重新登录获取新的 token
- 确认后端 JWT 配置正确

#### 2. 状态更新不及时

**症状:** 订单状态变更后前端未刷新

**解决方案:**
- 检查 TanStack Query 的轮询配置（默认 8 秒）
- 手动调用 `refetch()` 强制刷新
- 检查浏览器控制台是否有错误

#### 3. 导出报表下载失败

**症状:** 点击"导出报表"按钮无响应或下载的文件损坏

**解决方案:**
- 检查浏览器控制台网络面板，确认 API 返回 200 状态
- 确认响应 Content-Type 为 `application/octet-stream`
- 检查后端日志是否有 Excel 生成错误

### C端小程序问题

#### 1. 图片加载失败

**症状:** 饮品图片不显示或报错 `download fail`

**解决方案:**
- 确认图片 URL 在微信小程序后台的合法域名列表中
- 使用 HTTPS 协议
- 检查图片 URL 是否正确

#### 2. 支付失败

**症状:** 点击支付无响应或报错

**解决方案:**
- 当前为 Mock 支付模式，检查后端 `/api/beverage-orders/{orderId}/pay` 接口是否正常
- 真实微信支付集成需配置微信商户号（后续版本）

#### 3. Taro 编译错误

**症状:** `npm run dev:weapp` 失败

**解决方案:**
```bash
# 清理缓存
rm -rf node_modules dist
npm cache clean --force
npm install
npm run dev:weapp
```

## 性能优化

### 后端优化
- 使用 JPA 查询优化（避免 N+1 问题）
- 数据库索引优化（见 `specs/O003-beverage-order/migrations/002_create_indexes.sql`）
- API 响应时间目标：P95 ≤ 1 秒

### 前端优化
- 使用 `React.memo` 避免不必要渲染
- TanStack Query 缓存策略（staleTime: 2 分钟）
- 虚拟滚动/分页加载大型列表
- 图片懒加载

### 性能测试

```bash
# 前端性能测试（Lighthouse）
npm run test:perf

# 后端负载测试（JMeter/k6）
# 目标：100 并发订单，系统稳定
k6 run specs/O003-beverage-order/tests/load-test.js
```

## 安全规范

### 前端安全
- 使用 Zod 进行输入数据验证
- 防止 XSS 攻击（避免 `dangerouslySetInnerHTML`）
- Token 存储在 localStorage，自动刷新机制

### 后端安全
- JWT Token 认证
- 敏感操作审计日志（FR-027）
- HTTPS 强制（生产环境）

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/O004-new-feature`)
3. 提交代码 (`git commit -m 'feat(O004): 新增功能'`)
4. 推送到分支 (`git push origin feat/O004-new-feature`)
5. 创建 Pull Request

详细规范见 `.claude/rules/` 目录。

## 许可证

[MIT License](LICENSE)

---

**项目维护:** Cinema Platform Team
**最后更新:** 2025-12-27
**版本:** 1.0.0
