# Implementation Plan: 预约单管理系统

**Branch**: `U001-reservation-order-management` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)

## Summary

预约单管理系统是影院场景包预订流程的核心功能,将原有的"立即支付"模式升级为"立即预约"模式,为B端运营人员提供完整的预约单管理能力,同时为C端用户提供透明的预约查询功能。

**核心价值**:
- 降低用户决策压力,提升预订转化率(目标提升20%)
- 为运营人员提供灵活的确认和支付控制(支持可选支付)
- 建立完整的预约生命周期管理和审计追踪体系

**技术方案**:
- B端管理后台: React 19.2.0 + Ant Design 6.1.0 + TanStack Query + Zustand
- C端用户界面: Taro 3.x 多端框架(微信小程序 + H5)
- 后端服务: Spring Boot 3.x + Java 21 + Supabase PostgreSQL
- 数据存储: Supabase作为单一数据源,包含预约单、操作日志、库存快照等核心表

## Technical Context

**Language/Version**:
- B端(管理后台): TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
- C端(客户端/小程序): TypeScript 5.9.3 + Taro 3.x + React (multi-platform mini-program/H5)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13, dayjs 1.11.19
- C端: Taro 3.x, Taro UI / NutUI, Zustand, Taro.request wrapper, Supabase client SDK
- 后端: Spring Boot Web, Supabase Java Client, Jakarta Validation, Jackson (JSON)

**Storage**: Supabase PostgreSQL作为主要后端数据源,核心表包括:
- `reservation_orders`: 预约单主表
- `reservation_items`: 预约单加购项明细
- `reservation_operation_logs`: 操作日志审计
- `slot_inventory_snapshots`: 时段库存快照
- 依赖现有表: `scenario_packages`, `package_tiers`, `addon_items`, `time_slot_templates`, `users`

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
- C端: Taro官方测试工具 + 微信开发者工具 / H5浏览器测试
- 后端: JUnit 5 + MockMvc + Testcontainers (Supabase PostgreSQL)

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API
- C端: 微信小程序 + H5 (Taro多端编译)

**Project Type**:
- Full-stack feature spanning B端管理后台, C端用户界面, 和 Spring Boot后端服务

**Performance Goals**:
- B端: 预约单列表加载<1.5s (100条记录), 筛选响应<500ms, 操作响应<2s
- C端: "立即预约"页面首屏渲染<1.5s, 提交预约响应<3s
- 后端: API响应时间P95<1s, 并发预约处理50 TPS无超售

**Constraints**:
- 必须遵循Feature Branch Binding(U001规格绑定)
- 必须遵循Test-Driven Development(测试先行)
- 必须遵循Frontend Tech Stack Layering(B端React+AntD, C端Taro)
- 必须遵循API响应格式标准(统一ApiResponse结构)
- 后端必须使用Spring Boot + Supabase统一技术栈

**Scale/Scope**:
- B端: 预约单管理模块,包含列表、详情、确认、取消、修改、导出等功能页面
- C端: "立即预约"表单页 + "我的预约"列表页 + 预约单详情页
- 后端: 8个REST API端点(创建、查询、确认、取消、修改、支付回调、列表、导出)
- 数据规模: 预计日均100-500笔预约单,高峰期并发预约50 TPS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查:

- [x] **功能分支绑定**: 当前分支名 `U001-reservation-order-management` 中的specId(U001)必须等于active_spec指向路径中的specId
- [x] **测试驱动开发**: 关键业务流程(预约创建、状态转换、库存扣减)必须先编写测试,确保测试覆盖率100%
- [x] **组件化架构**: B端使用Ant Design Table/Form/Modal组件,C端使用Taro组件,遵循原子设计理念,组件清晰分层和可复用
- [x] **前端技术栈分层**: B端使用React+Ant Design,C端使用Taro框架,不混用(预约管理列表在B端,我的预约在C端Taro项目)
- [x] **数据驱动状态管理**: B端使用Zustand(客户端状态)+TanStack Query(服务器状态),C端使用Zustand,状态变更可预测
- [x] **代码质量工程化**: 前端通过TypeScript严格模式、ESLint、Prettier检查;后端通过Jakarta Validation、乐观锁、异常处理确保质量
- [x] **后端技术栈约束**: 后端使用Spring Boot 3.x集成Supabase,Supabase为主要数据源(PostgreSQL)与认证提供方
- [x] **API响应格式标准**: 所有API端点使用统一的ApiResponse<T>格式,成功返回data字段,失败返回error+message+details

### 性能与标准检查:
- [x] **性能标准**: B端预约单列表加载<1.5s,筛选<500ms,操作<2s;C端预约表单提交<3s;后端API P95<1s
- [x] **安全标准**: 使用Zod验证预约表单输入,防止XSS(手机号、备注字段过滤),API请求包含JWT认证,处理Token过期
- [x] **可访问性标准**: B端遵循WCAG 2.1 AA级别,支持键盘导航(Tab键切换),表单字段有明确label和错误提示

### 业务规则检查:
- [x] **支付可选性**: 运营人员确认预约时可选择"要求支付"或"直接完成(无需支付)",通过requiresPayment字段控制
- [x] **状态转换规则**: 待确认→已确认→已完成(若要求支付)或待确认→已完成(若无需支付),任意状态→已取消
- [x] **库存管理**: 预约创建时扣减库存,取消时释放库存,使用乐观锁防止并发超售
- [x] **操作审计**: 所有CRUD操作记录到operation_logs表,包含操作人、时间、IP、修改前后数据

## Project Structure

### Documentation (this feature)

```text
specs/U001-reservation-order-management/
├── spec.md                  # Feature specification (已存在)
├── plan.md                  # This file (实施计划)
├── research.md              # Phase 0 output (技术调研文档)
├── data-model.md            # Phase 1 output (数据模型设计)
├── quickstart.md            # Phase 1 output (开发快速启动指南)
├── contracts/               # Phase 1 output (API契约)
│   └── reservation-order-api.yaml
└── tasks.md                 # Phase 2 output (由/speckit.tasks生成)
```

### Source Code (repository root)

```text
# B端管理后台
frontend/src/
├── pages/
│   └── reservation-orders/            # 预约单管理模块
│       ├── ReservationOrderList.tsx   # 预约单列表页
│       ├── ReservationOrderDetail.tsx # 预约单详情页
│       ├── components/
│       │   ├── OrderStatusBadge.tsx   # 状态徽章组件
│       │   ├── OrderFilters.tsx       # 筛选表单组件
│       │   ├── ConfirmOrderModal.tsx  # 确认预约对话框
│       │   ├── CancelOrderModal.tsx   # 取消预约对话框
│       │   ├── EditOrderModal.tsx     # 编辑预约对话框
│       │   └── OperationLogTimeline.tsx # 操作日志时间线
│       ├── services/
│       │   └── reservationOrderService.ts # API服务
│       ├── types/
│       │   ├── reservation-order.types.ts # TypeScript类型定义
│       │   └── reservation-order.schema.ts # Zod验证Schema
│       └── hooks/
│           ├── useReservationOrders.ts    # 列表查询Hook
│           ├── useReservationDetail.ts    # 详情查询Hook
│           └── useOrderOperations.ts      # 操作Mutations Hook
├── mocks/
│   └── handlers/
│       └── reservationOrderHandlers.ts # MSW Mock数据
└── types/
    └── reservationOrder.ts             # 全局类型定义

# C端Taro项目
hall-reserve-taro/src/
├── pages/
│   ├── reservation-form/               # 预约表单页(新增)
│   │   ├── index.tsx
│   │   ├── index.less
│   │   └── components/
│   │       ├── PackageSelector.tsx    # 套餐选择器
│   │       ├── TimeSlotPicker.tsx     # 时段选择器
│   │       ├── AddonSelector.tsx      # 加购项选择器
│   │       └── ContactForm.tsx        # 联系人信息表单
│   └── my-reservations/                # 我的预约页(新增)
│       ├── index.tsx
│       ├── index.less
│       └── detail/
│           ├── index.tsx              # 预约单详情页
│           └── index.less
├── services/
│   ├── reservationService.ts          # 预约单API服务
│   └── types/
│       └── reservation.types.ts       # 类型定义
└── stores/
    └── reservationStore.ts            # 预约单状态管理

# 后端Spring Boot
backend/src/main/java/com/cinema/
├── reservation/                        # 预约单模块(新增包)
│   ├── controller/
│   │   ├── ReservationOrderController.java       # B端管理API
│   │   └── ReservationOrderClientController.java # C端用户API
│   ├── domain/
│   │   ├── ReservationOrder.java                 # 预约单实体
│   │   ├── ReservationItem.java                  # 预约明细实体
│   │   ├── ReservationOperationLog.java          # 操作日志实体
│   │   ├── SlotInventorySnapshot.java            # 库存快照实体
│   │   └── enums/
│   │       ├── ReservationStatus.java            # 状态枚举
│   │       └── OperationType.java                # 操作类型枚举
│   ├── dto/
│   │   ├── CreateReservationRequest.java         # 创建预约请求
│   │   ├── ConfirmReservationRequest.java        # 确认预约请求
│   │   ├── CancelReservationRequest.java         # 取消预约请求
│   │   ├── UpdateReservationRequest.java         # 修改预约请求
│   │   ├── ReservationOrderDTO.java              # 预约单DTO
│   │   ├── ReservationListResponse.java          # 列表响应
│   │   └── OperationLogDTO.java                  # 操作日志DTO
│   ├── repository/
│   │   ├── ReservationOrderRepository.java
│   │   ├── ReservationItemRepository.java
│   │   ├── ReservationOperationLogRepository.java
│   │   └── SlotInventorySnapshotRepository.java
│   ├── service/
│   │   ├── ReservationOrderService.java          # 核心业务服务
│   │   ├── InventoryService.java                 # 库存管理服务
│   │   ├── NotificationService.java              # 通知服务(接口)
│   │   └── ReservationNumberGenerator.java       # 预约单号生成器
│   ├── mapper/
│   │   └── ReservationOrderMapper.java           # DTO映射器
│   └── exception/
│       ├── ReservationNotFoundException.java
│       ├── InsufficientInventoryException.java
│       └── InvalidStatusTransitionException.java
└── resources/db/migration/
    └── VU001_001__create_reservation_tables.sql  # 数据库迁移脚本

# 测试文件
frontend/tests/
├── pages/reservation-orders/
│   ├── ReservationOrderList.test.tsx
│   ├── ReservationOrderDetail.test.tsx
│   └── services/
│       └── reservationOrderService.test.ts
└── e2e/
    └── reservation-order-management.spec.ts      # Playwright E2E测试

backend/src/test/java/com/cinema/reservation/
├── controller/
│   ├── ReservationOrderControllerTest.java       # Controller单元测试
│   └── ReservationOrderIntegrationTest.java      # 集成测试
├── service/
│   ├── ReservationOrderServiceTest.java
│   └── InventoryServiceTest.java
└── repository/
    └── ReservationOrderRepositoryTest.java
```

**Structure Decision**:
- B端管理后台采用feature-based模块化架构,预约单管理独立在`pages/reservation-orders`目录
- C端Taro项目采用pages-based架构,新增`reservation-form`和`my-reservations`页面
- 后端采用DDD(领域驱动设计)分层架构,预约单作为独立业务域在`com.cinema.reservation`包下
- 数据库迁移脚本按照U001规格编号命名,确保版本追溯性

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | 本功能完全符合宪法所有原则 | N/A |

---

## Phase 0: Research

### Objectives
1. **明确现有依赖**: 确认场景包、套餐、加购项、时段库存、用户管理等依赖模块的API契约和数据结构
2. **库存管理策略**: 研究并发场景下的库存扣减和释放机制,选择乐观锁或悲观锁方案
3. **支付集成方式**: 调研现有支付模块的API和回调机制,确定预约单与支付的集成方式
4. **通知服务接口**: 确认平台统一通知服务(短信/站内消息)的调用方式和参数格式
5. **预约单号生成规则**: 设计唯一的预约单号生成算法,确保分布式环境下的唯一性
6. **状态机验证**: 绘制完整的预约单状态转换图,验证所有边界情况和异常路径

### Key Questions
- Q1: 时段库存管理模块是否已提供原子性的扣减/释放API?(依赖016-store-reservation-settings)
- Q2: 现有支付模块的支付状态回调格式是什么?预约单如何监听支付成功事件?
- Q3: 用户认证模块是否提供JWT验证和用户信息获取接口?
- Q4: Supabase PostgreSQL是否启用了UUID扩展和Row Level Security(RLS)?
- Q5: 24小时自动取消预约单的定时任务如何实现?(Spring Scheduler或Supabase Edge Functions)
- Q6: C端"我的预约"页面是否需要实时推送状态变更通知?(WebSocket或轮询)

### Research Tasks
1. **阅读依赖模块文档**:
   - 场景包管理(017-scenario-package): 套餐、加购项数据结构
   - 时段库存管理(016-store-reservation-settings): 库存查询和更新API
   - 门店管理(022-store-crud): 门店状态和操作日志模式

2. **数据库schema探索**:
   - 检查现有表结构: `scenario_packages`, `package_tiers`, `addon_items`, `time_slot_templates`
   - 验证UUID扩展和触发器支持: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
   - 确认Supabase Row Level Security策略是否影响预约单查询

3. **后端API模式分析**:
   - 研究现有Controller的错误处理模式(参考StoreQueryController)
   - 确认ApiResponse<T>的使用规范和列表响应格式
   - 验证乐观锁实现方式(JPA @Version注解)

4. **前端状态管理模式**:
   - 分析现有TanStack Query的配置(queryKey命名规范、缓存时间)
   - 确认Zustand store的组织方式(单一store或多store)
   - 研究MSW handlers的Mock数据组织模式

### Deliverable
- `research.md` 文档,包含:
  - 依赖模块API契约清单
  - 库存管理并发控制方案(乐观锁 + 数据库约束)
  - 预约单号生成算法(R+yyyyMMddHHmmss+4位随机数)
  - 状态机图和状态转换验证表
  - 未解决问题清单(需要澄清的规格点)

---

## Phase 1: Design

### Data Model Design

#### Core Entities

1. **ReservationOrder (预约单主表)**
   - Table: `reservation_orders`
   - Fields:
     - `id` (UUID, PK)
     - `order_number` (VARCHAR(20), UNIQUE, 预约单号 R+timestamp+random)
     - `user_id` (UUID, FK to users, 客户ID)
     - `scenario_package_id` (UUID, FK to scenario_packages, 场景包ID)
     - `package_tier_id` (UUID, FK to package_tiers, 套餐ID)
     - `time_slot_template_id` (UUID, FK to time_slot_templates, 时段模板ID)
     - `reservation_date` (DATE, 预订日期)
     - `reservation_time` (TIME, 预订时段开始时间)
     - `contact_name` (VARCHAR(100), 联系人姓名)
     - `contact_phone` (VARCHAR(20), 联系人手机号)
     - `remark` (TEXT, 备注)
     - `total_amount` (DECIMAL(10,2), 总金额)
     - `status` (VARCHAR(20), 状态: PENDING/CONFIRMED/CANCELLED/COMPLETED)
     - `requires_payment` (BOOLEAN, 是否要求支付, DEFAULT false)
     - `payment_id` (VARCHAR(100), 支付流水号, NULLABLE)
     - `payment_time` (TIMESTAMPTZ, 支付时间, NULLABLE)
     - `version` (BIGINT, 乐观锁版本号, DEFAULT 0)
     - `created_at` (TIMESTAMPTZ, DEFAULT NOW())
     - `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
     - `cancelled_at` (TIMESTAMPTZ, 取消时间, NULLABLE)
     - `cancel_reason` (TEXT, 取消原因, NULLABLE)
   - Indexes:
     - `idx_reservation_user` ON (user_id, created_at DESC)
     - `idx_reservation_status` ON (status, created_at DESC)
     - `idx_reservation_date` ON (reservation_date, reservation_time)
     - `idx_reservation_number` UNIQUE ON (order_number)
   - Constraints:
     - CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
     - CHECK (total_amount > 0)
     - CHECK (contact_phone ~ '^1[3-9]\\d{9}$') -- 手机号格式验证

2. **ReservationItem (预约单加购项明细)**
   - Table: `reservation_items`
   - Fields:
     - `id` (UUID, PK)
     - `reservation_order_id` (UUID, FK to reservation_orders ON DELETE CASCADE)
     - `addon_item_id` (UUID, FK to addon_items)
     - `addon_name_snapshot` (VARCHAR(100), 加购项名称快照)
     - `addon_price_snapshot` (DECIMAL(10,2), 加购项单价快照)
     - `quantity` (INTEGER, 数量, CHECK > 0)
     - `subtotal` (DECIMAL(10,2), 小计金额)
     - `created_at` (TIMESTAMPTZ, DEFAULT NOW())
   - Indexes:
     - `idx_item_reservation` ON (reservation_order_id)
   - Business Rule: 加购项名称和价格在添加时快照存储,防止主数据变更影响历史订单

3. **ReservationOperationLog (操作日志)**
   - Table: `reservation_operation_logs`
   - Fields:
     - `id` (UUID, PK)
     - `reservation_order_id` (UUID, FK to reservation_orders ON DELETE CASCADE)
     - `operation_type` (VARCHAR(20), 操作类型: CREATE/CONFIRM/CANCEL/UPDATE/PAYMENT)
     - `operator_id` (UUID, 操作人ID, NULLABLE)
     - `operator_name` (VARCHAR(100), 操作人名称)
     - `before_value` (JSONB, 修改前数据, NULLABLE)
     - `after_value` (JSONB, 修改后数据)
     - `operation_time` (TIMESTAMPTZ, DEFAULT NOW())
     - `ip_address` (VARCHAR(45), 操作IP)
     - `remark` (TEXT, 备注如取消原因)
   - Indexes:
     - `idx_log_reservation` ON (reservation_order_id, operation_time DESC)
   - Constraints:
     - CHECK (operation_type IN ('CREATE', 'CONFIRM', 'CANCEL', 'UPDATE', 'PAYMENT'))

4. **SlotInventorySnapshot (时段库存快照)**
   - Table: `slot_inventory_snapshots`
   - Fields:
     - `id` (UUID, PK)
     - `reservation_order_id` (UUID, FK to reservation_orders ON DELETE CASCADE, UNIQUE)
     - `time_slot_template_id` (UUID, FK to time_slot_templates)
     - `reservation_date` (DATE)
     - `total_capacity` (INTEGER, 总容量)
     - `booked_count` (INTEGER, 已预订数量)
     - `remaining_capacity` (INTEGER, 剩余容量)
     - `snapshot_time` (TIMESTAMPTZ, DEFAULT NOW())
   - Purpose: 记录预约创建时的库存状态,用于异常核对和审计

#### Entity Relationships
```
User 1:N ReservationOrder
ScenarioPackage 1:N ReservationOrder
PackageTier 1:N ReservationOrder
TimeSlotTemplate 1:N ReservationOrder
ReservationOrder 1:N ReservationItem
ReservationOrder 1:N ReservationOperationLog
ReservationOrder 1:1 SlotInventorySnapshot
AddonItem 1:N ReservationItem (通过快照字段引用)
```

#### State Machine
```
PENDING (待确认)
  ├─ confirm(requires_payment=true) ──> CONFIRMED (已确认,需支付)
  ├─ confirm(requires_payment=false) ─> COMPLETED (已完成,无需支付)
  └─ cancel() ──────────────────────> CANCELLED (已取消)

CONFIRMED (已确认)
  ├─ pay() ─────────────────────────> COMPLETED (已完成,已支付)
  ├─ cancel() ──────────────────────> CANCELLED (已取消)
  └─ timeout(24h) ──────────────────> CANCELLED (超时自动取消)

COMPLETED (已完成) - Terminal State

CANCELLED (已取消) - Terminal State
```

### API Contract Design

**文件路径**: `specs/U001-reservation-order-management/contracts/reservation-order-api.yaml`

**核心端点**:

1. **B端管理API**:
   - `GET /api/admin/reservations` - 预约单列表查询(支持筛选、分页、搜索)
   - `GET /api/admin/reservations/{id}` - 预约单详情
   - `POST /api/admin/reservations/{id}/confirm` - 确认预约(支持支付选项)
   - `POST /api/admin/reservations/{id}/cancel` - 取消预约
   - `PUT /api/admin/reservations/{id}` - 修改预约信息(联系人、备注)
   - `GET /api/admin/reservations/{id}/logs` - 操作日志查询
   - `POST /api/admin/reservations/export` - 批量导出预约单

2. **C端用户API**:
   - `POST /api/client/reservations` - 创建预约单
   - `GET /api/client/reservations/my` - 我的预约列表
   - `GET /api/client/reservations/{id}` - 预约单详情

3. **内部回调API**:
   - `POST /api/internal/reservations/{id}/payment-callback` - 支付成功回调

**响应格式示例**:
```json
// 成功响应
{
  "data": {
    "id": "uuid",
    "orderNumber": "R202512230001",
    "status": "CONFIRMED",
    "requiresPayment": true,
    ...
  },
  "timestamp": "2025-12-23T15:00:00Z"
}

// 列表响应
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}

// 错误响应
{
  "error": "INSUFFICIENT_INVENTORY",
  "message": "该时段预约已满,请选择其他时段",
  "details": {
    "timeSlotId": "uuid",
    "requestedDate": "2025-12-25"
  },
  "timestamp": "2025-12-23T15:00:00Z"
}
```

### Component Architecture

#### B端组件树
```
ReservationOrderList (页面)
├─ OrderFilters (筛选组件)
│  ├─ StatusSelect (状态多选)
│  ├─ DateRangePicker (日期范围)
│  └─ SearchInput (搜索框)
├─ OrderTable (Ant Design Table)
│  ├─ OrderStatusBadge (状态徽章)
│  └─ ActionButtons (操作按钮组)
└─ ExportButton (导出按钮)

ReservationOrderDetail (详情页)
├─ OrderInfoCard (基本信息卡片)
├─ PackageInfoCard (场景包信息)
├─ ContactInfoCard (联系人信息)
├─ OperationLogTimeline (操作日志时间线)
├─ ConfirmOrderModal (确认对话框)
├─ CancelOrderModal (取消对话框)
└─ EditOrderModal (编辑对话框)
```

#### C端组件树(Taro)
```
ReservationFormPage (预约表单页)
├─ PackageInfo (场景包信息展示)
├─ DatePicker (日期选择器)
├─ TimeSlotPicker (时段选择器)
├─ PackageTierSelector (套餐选择器)
├─ AddonSelector (加购项选择器)
├─ ContactForm (联系人表单)
└─ SubmitButton (提交按钮 + 总价显示)

MyReservationsPage (我的预约列表)
├─ StatusTabs (状态筛选Tab)
└─ ReservationList (预约单列表)
    └─ ReservationCard (预约单卡片)
        ├─ OrderStatusBadge
        ├─ PackageInfo
        └─ ActionButtons

ReservationDetailPage (预约单详情)
├─ OrderHeader (订单号 + 状态)
├─ PackageSection (场景包信息)
├─ TimeSlotSection (预订时段)
├─ ContactSection (联系人信息)
├─ PriceSection (价格明细)
└─ ActionButtons (支付/取消按钮)
```

### Quickstart Guide

**文件路径**: `specs/U001-reservation-order-management/quickstart.md`

**内容大纲**:
1. **环境准备**:
   - 安装依赖: `npm install` (前端) + `mvn install` (后端)
   - 启动Supabase本地实例: `docker-compose up -d`
   - 运行数据库迁移: `mvn flyway:migrate`
   - 导入测试数据: 场景包、套餐、时段模板

2. **B端开发**:
   - 启动前端: `cd frontend && npm run dev`
   - 启动Mock服务: MSW自动拦截`/api/admin/reservations`请求
   - 访问: `http://localhost:5173/reservation-orders`
   - 测试账号: admin@cinema.com / password

3. **C端开发**:
   - 启动Taro H5: `cd hall-reserve-taro && npm run dev:h5`
   - 访问: `http://localhost:10086/pages/detail/index?id=<packageId>`
   - 测试预约流程: 选择套餐→加购→填写联系人→提交

4. **后端开发**:
   - 启动Spring Boot: `mvn spring-boot:run`
   - API文档: `http://localhost:8080/swagger-ui.html`
   - 测试API: 使用Postman Collection (在contracts/目录下)

5. **E2E测试**:
   - 运行Playwright测试: `npm run test:e2e`
   - 测试场景: 创建预约→B端确认→支付→状态变更验证

### Architecture Decisions

#### AD-001: 库存管理并发控制方案
- **Context**: 高并发场景下多个用户同时预订同一时段,需防止超售
- **Decision**: 使用**数据库层乐观锁 + 应用层库存检查**双重保障
- **Rationale**:
  - Supabase PostgreSQL支持原子性更新和CHECK约束
  - 应用层在创建预约前先查询库存,快速失败避免无效请求
  - 数据库层通过`UPDATE time_slot_templates SET capacity = capacity - 1 WHERE id = ? AND capacity > 0`确保原子性
  - 预约单表使用`@Version`注解实现乐观锁,防止状态并发修改
- **Consequences**:
  - 库存不足时用户会收到即时反馈"该时段已满"
  - 极少数并发冲突情况下应用层需重试

#### AD-002: 支付可选性实现方式
- **Context**: 运营人员确认预约时需选择是否要求客户支付
- **Decision**: 使用`requires_payment`布尔字段控制,状态转换根据该字段分支
- **Rationale**:
  - 简单明了,避免引入额外的"预付费/后付费"类型枚举
  - 状态机逻辑清晰: `confirm(requires_payment=false)`直接转为COMPLETED
  - C端UI根据该字段动态显示"立即支付"按钮
- **Consequences**:
  - 已确认但未支付的预约单(requires_payment=true)需定时任务处理超时

#### AD-003: 预约单号生成算法
- **Context**: 需要生成唯一、易读、可排序的预约单号
- **Decision**: 格式 `R + yyyyMMddHHmmss + 4位随机数` (如R202512231530001234)
- **Rationale**:
  - R前缀表示Reservation,区别于订单号
  - 时间戳确保大致有序,便于排序和归档
  - 4位随机数降低同一秒内冲突概率(最多10000笔/秒)
  - 数据库UNIQUE约束保证最终唯一性
- **Consequences**:
  - 预约单号长度固定19位,便于UI展示和数据库索引

#### AD-004: 操作日志存储格式
- **Context**: 需要记录预约单所有修改的前后值用于审计
- **Decision**: 使用JSONB字段存储before_value和after_value
- **Rationale**:
  - PostgreSQL JSONB支持高效索引和查询
  - 灵活存储不同操作类型的不同字段(如取消原因、支付选项)
  - 前端可直接解析JSON展示修改对比
- **Consequences**:
  - 需要在Service层构建规范的JSON结构
  - 查询日志时可使用JSONB操作符过滤特定字段

#### AD-005: C端"我的预约"实现方式
- **Context**: C端需要展示用户所有预约单历史和状态
- **Decision**: 使用Taro框架独立页面,调用后端API,通过user_id过滤
- **Rationale**:
  - 符合宪法"C端必须使用Taro框架"原则
  - 与B端管理后台技术栈分离,避免代码耦合
  - 用户认证通过JWT Token,后端根据Token解析user_id查询
- **Consequences**:
  - 需要维护两套前端代码(B端React + C端Taro)
  - API需区分B端管理权限和C端用户权限

#### AD-006: 预约单超时自动取消机制
- **Context**: 用户创建预约后24小时未确认支付需自动取消
- **Decision**: 使用Spring Boot Scheduler定时任务,每小时扫描一次
- **Rationale**:
  - Spring Boot内置@Scheduled注解,无需额外依赖
  - 每小时扫描`status=CONFIRMED AND requires_payment=true AND created_at < NOW() - INTERVAL '24 hours'`
  - 批量更新为CANCELLED状态并释放库存
- **Consequences**:
  - 取消操作可能存在最多1小时延迟(可接受)
  - 需要考虑分布式环境下的任务去重(使用数据库分布式锁)

---

## Phase 2: Implementation (由 /speckit.tasks 生成)

**Note**: Phase 2的详细任务清单将通过`/speckit.tasks`命令基于本plan.md和spec.md自动生成,存储在`tasks.md`文件中。任务将按照TDD流程组织,确保测试先行。

**预期任务分组**:
1. **数据库设计与迁移** (2-3 tasks)
2. **后端API开发** (8-10 tasks, 每个端点独立任务)
3. **B端管理界面开发** (6-8 tasks, 按组件和页面划分)
4. **C端预约界面开发** (4-6 tasks, Taro页面和组件)
5. **集成测试与E2E测试** (3-4 tasks)
6. **性能优化与安全审计** (2-3 tasks)

---

## Risk Assessment

### High Priority Risks

1. **库存并发超售风险**
   - **Impact**: 用户预约成功但实际无可用时段,导致客诉
   - **Probability**: Medium (高并发场景)
   - **Mitigation**:
     - 数据库层使用原子性UPDATE和CHECK约束
     - 应用层乐观锁 + 重试机制
     - 压力测试验证50 TPS并发场景无超售

2. **支付回调处理失败风险**
   - **Impact**: 用户已支付但预约单状态未更新为COMPLETED
   - **Probability**: Low (依赖支付模块稳定性)
   - **Mitigation**:
     - 支付回调接口实现幂等性(根据payment_id去重)
     - 增加手动补偿机制(B端运营人员可手动确认支付)
     - 记录所有支付回调日志用于审计

3. **B端与C端数据一致性风险**
   - **Impact**: B端确认预约后C端用户看到旧状态
   - **Probability**: Low (依赖API响应速度)
   - **Mitigation**:
     - C端使用TanStack Query的`staleTime`配置自动重新验证
     - 状态变更后发送通知提醒用户刷新
     - 考虑引入WebSocket实时推送(Phase 3优化)

### Medium Priority Risks

4. **定时任务分布式去重风险**
   - **Impact**: 多个应用实例同时执行超时取消任务,导致重复操作
   - **Probability**: Medium (生产环境多实例部署)
   - **Mitigation**:
     - 使用数据库分布式锁(Supabase Advisory Lock)
     - 任务执行前检查状态,避免重复取消

5. **大数据量列表查询性能风险**
   - **Impact**: 预约单数量增长到10万+后列表查询变慢
   - **Probability**: Low (短期内不会达到)
   - **Mitigation**:
     - 列表查询添加合理索引(status + created_at组合索引)
     - 限制单次查询最大返回100条,强制分页
     - 考虑历史数据归档策略(3个月以上归档到冷数据表)

---

## Testing Strategy

### Unit Tests (Vitest + JUnit 5)

**B端前端**:
- `reservationOrderService.test.ts`: 测试API调用逻辑、参数转换、错误处理
- `OrderFilters.test.tsx`: 测试筛选组件的表单验证和状态管理
- `ConfirmOrderModal.test.tsx`: 测试确认对话框的支付选项逻辑

**后端**:
- `ReservationOrderServiceTest.java`: 测试核心业务逻辑
  - 创建预约成功场景
  - 库存不足失败场景
  - 状态转换逻辑(confirm/cancel/pay)
  - 预约单号生成唯一性
- `InventoryServiceTest.java`: 测试库存扣减和释放的原子性
- `ReservationOrderRepositoryTest.java`: 测试数据库查询和约束

### Integration Tests (Testcontainers + MockMvc)

**后端集成测试**:
- `ReservationOrderIntegrationTest.java`:
  - 完整预约创建流程(含库存扣减)
  - 确认预约并选择支付选项
  - 取消预约并验证库存释放
  - 支付回调处理幂等性验证
  - 操作日志记录完整性验证

### E2E Tests (Playwright)

**B端管理后台**:
- `reservation-order-management.spec.ts`:
  - 测试场景1: 运营人员查看预约单列表并筛选
  - 测试场景2: 确认预约单并选择"要求支付"
  - 测试场景3: 确认预约单并选择"直接完成"
  - 测试场景4: 取消预约单并填写原因
  - 测试场景5: 修改预约单联系人信息
  - 测试场景6: 导出预约单Excel

**C端Taro**:
- (使用微信开发者工具或H5浏览器手动测试)
  - 测试场景1: 用户在场景包详情页点击"立即预约"
  - 测试场景2: 填写预约信息并提交成功
  - 测试场景3: 在"我的预约"查看预约单历史
  - 测试场景4: 点击"立即支付"跳转支付页面

### Performance Tests

**后端压力测试**:
- 并发预约创建: 50 TPS持续1分钟,验证无库存超售
- 列表查询性能: 100条记录加载时间<1s
- 状态变更响应: 确认/取消操作响应时间<500ms

**前端性能测试**:
- B端列表首屏渲染: Lighthouse Performance Score > 90
- C端预约表单提交: 端到端延迟<3s(含网络)

---

## Definition of Done

### Phase 1 (Design) Checklist
- [ ] `data-model.md` 完成,包含所有实体和关系图
- [ ] `contracts/reservation-order-api.yaml` 完成,所有API端点定义清晰
- [ ] `quickstart.md` 完成,开发人员可按步骤启动环境
- [ ] Constitution Check通过,无宪法原则违背
- [ ] 所有架构决策记录(AD-001至AD-006)并经团队评审

### Phase 2 (Implementation) Checklist
- [ ] 数据库迁移脚本通过,表结构符合设计
- [ ] 后端所有API端点实现并通过单元测试
- [ ] 后端集成测试覆盖率≥80%,关键路径100%
- [ ] B端预约单列表和详情页面功能完整
- [ ] B端确认/取消/修改操作正常工作
- [ ] C端预约表单提交成功创建预约单
- [ ] C端"我的预约"正确展示用户历史
- [ ] E2E测试覆盖所有6个User Story的Acceptance Scenarios
- [ ] 性能测试通过: 并发50 TPS无超售,列表<1.5s,操作<2s
- [ ] 代码通过ESLint/Prettier/TypeScript检查
- [ ] 后端代码通过Jakarta Validation和乐观锁验证
- [ ] 所有功能在Chrome/Firefox/Safari浏览器测试通过
- [ ] C端在微信小程序和H5平台测试通过
- [ ] Pull Request经代码审查批准

---

## Critical Files for Implementation

基于此实施计划,以下是实现本功能时最关键的5个文件:

1. **backend/src/main/resources/db/migration/VU001_001__create_reservation_tables.sql**
   - **原因**: 数据库schema是整个功能的基础,定义预约单、操作日志、库存快照等核心表结构,所有后续开发依赖此迁移脚本

2. **backend/src/main/java/com/cinema/reservation/service/ReservationOrderService.java**
   - **原因**: 核心业务逻辑层,实现预约创建、状态转换、库存扣减/释放、支付回调等关键业务规则,是后端API的心脏

3. **frontend/src/pages/reservation-orders/ReservationOrderList.tsx**
   - **原因**: B端管理后台的主入口页面,集成列表查询、筛选、分页、操作按钮等核心功能,是运营人员的主要工作界面

4. **hall-reserve-taro/src/pages/reservation-form/index.tsx**
   - **原因**: C端预约表单页面,用户创建预约的核心交互界面,直接影响用户体验和预订转化率,需遵循Taro多端兼容规范

5. **specs/U001-reservation-order-management/contracts/reservation-order-api.yaml**
   - **原因**: API契约定义文档,是前后端集成的"合同",确保B端、C端、后端三方对接口格式、参数、响应结构达成一致,避免集成问题

---

**Next Steps**:
1. Review this plan with the team
2. Execute Phase 0 research tasks
3. Refine data model and API contracts based on research findings
4. Run `/speckit.tasks` to generate detailed implementation tasks
5. Begin TDD implementation following the task sequence
