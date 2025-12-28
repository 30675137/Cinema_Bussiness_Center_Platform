# Implementation Plan: 饮品订单创建与出品管理

**Branch**: `O003-beverage-order` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O003-beverage-order/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能实现完整的饮品订单管理系统，包括三个核心模块：

1. **C端饮品下单模块 (US1)**: 小程序端顾客浏览菜单、选择规格、下单支付、查看订单状态的完整流程
2. **B端订单接收与出品模块 (US2)**: 管理后台端工作人员实时接收订单、执行BOM自动扣料、管理出品状态、叫号通知顾客取餐
3. **B端饮品配置管理模块 (US3)**: 管理后台端商品管理员配置饮品菜单、规格、配方(BOM)、状态管理
4. **订单历史与统计模块 (US4)**: C端历史订单查询复购、B端营业统计和报表导出

技术方案采用：
- **C端**: Taro 4.x + React 多端统一开发框架（微信小程序 + H5）
- **B端**: React 19.2.0 + Ant Design 6.1.0 管理后台
- **后端**: Spring Boot 3.x + Supabase (PostgreSQL数据库 + Storage图片存储)
- **认证**: C端真实JWT认证、B端MVP阶段Mock认证（允许匿名访问）
- **支付**: MVP阶段Mock支付（点击自动成功）
- **叫号**: MVP阶段Mock语音播报（B端显示状态）+ 小程序真实推送通知
- **BOM扣料**: 集成P003/P004库存管理模块API，实现真实库存查询和扣减

## Technical Context

**Language/Version**:
- C端（小程序/H5）: TypeScript 5.x + Taro 4.1.9 + React 18.3.1
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0
- 后端: Java 21 + Spring Boot 3.x

**Primary Dependencies**:
- C端: Taro 4.1.9, Taro UI / NutUI, Zustand 5.0.9, TanStack Query 5.90.12, Taro.request wrapper, dayjs
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13
- 后端: Spring Boot Web, Spring Security, Supabase Java Client, JWT Library, Jackson

**Storage**:
- 数据库: Supabase PostgreSQL（饮品数据、订单数据、用户数据、库存数据）
- 图片存储: Supabase Storage（饮品主图、详情图）
- 本地缓存: C端使用Taro.setStorage、B端使用localStorage

**Testing**:
- C端: Taro官方测试工具 + 微信开发者工具调试 + H5浏览器测试
- B端: Vitest (单元测试) + Playwright (E2E测试) + React Testing Library
- 后端: JUnit 5 + Spring Boot Test + Mockito

**Target Platform**:
- C端: 微信小程序 + H5（优先支持iPhone移动端）
- B端: Web浏览器（Chrome, Safari, Firefox, Edge）+ 平板设备
- 后端: Spring Boot REST API

**Project Type**:
- Full-stack multi-platform application
- C端: Taro多端统一客户端应用（小程序 + H5）
- B端: React单页面管理后台应用
- 后端: Spring Boot RESTful API服务

**Performance Goals**:
- C端: 首屏渲染<1.5秒，小程序主包<2MB，列表滚动FPS≥50
- B端: 应用启动<3秒，页面切换<500ms，订单列表支持虚拟滚动
- API: 响应时间<1秒(P95)，支持100并发订单无性能下降

**Constraints**:
- 必须遵循功能分支绑定规则（O003-beverage-order）
- 必须遵循测试驱动开发（关键流程测试覆盖率100%）
- C端必须使用Taro框架，禁止使用Ant Design等非Taro兼容UI库
- B端必须使用React + Ant Design，禁止使用Taro框架
- 后端必须使用Spring Boot + Supabase，Supabase为单一数据源
- MVP阶段B端Mock认证、Mock支付、Mock叫号语音
- 真实BOM扣料需集成P003/P004库存管理API

**Scale/Scope**:
- 数据规模: 支持500+饮品SKU、10000+日均订单、100+并发订单
- 用户规模: 支持1000+顾客并发下单、50+B端工作人员同时出品
- 业务范围: 堂食饮品订单（不含外卖配送、桌号管理、排队叫号）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名为`O003-beverage-order`，与active_spec一致
- [x] **测试驱动开发**: 规划关键流程（下单、支付、BOM扣料、状态流转）的测试覆盖率100%
- [x] **组件化架构**: 遵循原子设计理念（Atoms/Molecules/Organisms/Templates/Pages）
- [x] **前端技术栈分层**: C端使用Taro框架、B端使用React+Ant Design，严格分离
- [x] **数据驱动状态管理**: 使用Zustand（客户端状态）+ TanStack Query（服务器状态）
- [x] **代码质量工程化**: TypeScript严格模式、ESLint/Prettier、Husky+lint-staged
- [x] **后端技术栈约束**: Spring Boot 3.x + Supabase PostgreSQL，Supabase为单一数据源
- [x] **代码归属标识**: 所有新增文件添加`@spec O003-beverage-order`注释

### 性能与标准检查：
- [x] **性能标准**: C端首屏<1.5s、B端启动<3s、API响应<1s、支持100并发订单
- [x] **安全标准**: 使用Zod数据验证、JWT认证、防止XSS、敏感数据加密传输
- [x] **可访问性标准**: 键盘导航、色彩对比度≥4.5:1、语义化HTML、ARIA属性

## Project Structure

### Documentation (this feature)

```text
specs/O003-beverage-order/
├── spec.md              # 功能规格说明（已完成）
├── plan.md              # 实施计划（本文件）
├── research.md          # 技术研究成果（Phase 0）
├── data-model.md        # 数据模型设计（Phase 1）
├── quickstart.md        # 开发快速入门（Phase 1）
├── contracts/           # API契约文档（Phase 1）
│   ├── api.yaml        # OpenAPI 3.0规范
│   └── README.md       # API文档说明
├── business-clarification.md  # 业务概念澄清文档
└── tasks.md             # 开发任务清单（Phase 2，由/speckit.tasks生成）
```

### Source Code (repository root)

```text
# C端项目结构（Taro）
hall-reserve-taro/
├── src/
│   ├── pages/                    # 页面组件
│   │   └── beverage/            # 饮品订单功能页面
│   │       ├── menu/            # 饮品菜单页
│   │       │   ├── index.tsx    # @spec O003-beverage-order - 菜单列表
│   │       │   └── index.config.ts
│   │       ├── detail/          # 饮品详情页
│   │       │   ├── index.tsx    # @spec O003-beverage-order - 详情与规格选择
│   │       │   └── index.config.ts
│   │       ├── cart/            # 订单确认页（类似购物车）
│   │       │   ├── index.tsx    # @spec O003-beverage-order - 订单确认
│   │       │   └── index.config.ts
│   │       ├── payment/         # 支付结果页
│   │       │   ├── index.tsx    # @spec O003-beverage-order - 支付成功/失败
│   │       │   └── index.config.ts
│   │       └── orders/          # 我的订单页
│   │           ├── index.tsx    # @spec O003-beverage-order - 订单列表
│   │           ├── detail.tsx   # @spec O003-beverage-order - 订单详情
│   │           └── index.config.ts
│   ├── components/              # 通用组件
│   │   └── beverage/           # 饮品订单相关组件
│   │       ├── BeverageCard.tsx      # @spec O003 - 饮品卡片
│   │       ├── SpecSelector.tsx      # @spec O003 - 规格选择器
│   │       ├── OrderItem.tsx         # @spec O003 - 订单项组件
│   │       └── OrderStatusBadge.tsx  # @spec O003 - 订单状态标签
│   ├── services/                # API服务
│   │   └── beverageService.ts   # @spec O003-beverage-order - 饮品订单API
│   ├── stores/                  # Zustand状态管理
│   │   └── beverageStore.ts     # @spec O003-beverage-order - 饮品订单状态
│   ├── types/                   # TypeScript类型
│   │   └── beverage.ts          # @spec O003-beverage-order - 饮品订单类型
│   └── utils/                   # 工具函数
│       └── orderHelper.ts       # @spec O003-beverage-order - 订单辅助函数
├── tests/                       # 测试文件
│   └── beverage/
│       ├── menu.test.ts        # 菜单页测试
│       ├── order.test.ts       # 下单流程测试
│       └── payment.test.ts     # 支付流程测试
└── app.config.ts               # Taro配置（添加tabBar配置）

# B端项目结构（React + Ant Design）
frontend/
├── src/
│   ├── features/                         # 功能模块
│   │   ├── beverage-order-management/   # B端订单出品管理
│   │   │   ├── components/
│   │   │   │   ├── OrderList.tsx        # @spec O003 - 订单列表
│   │   │   │   ├── OrderCard.tsx        # @spec O003 - 订单卡片
│   │   │   │   ├── OrderDetail.tsx      # @spec O003 - 订单详情
│   │   │   │   ├── OrderStatusButton.tsx # @spec O003 - 状态操作按钮
│   │   │   │   └── CallNumberModal.tsx  # @spec O003 - 叫号模态框
│   │   │   ├── hooks/
│   │   │   │   ├── useOrderPolling.ts   # @spec O003 - 订单轮询Hook
│   │   │   │   └── useBOMDeduction.ts   # @spec O003 - BOM扣料Hook
│   │   │   ├── services/
│   │   │   │   └── orderService.ts      # @spec O003 - 订单API服务
│   │   │   ├── types/
│   │   │   │   └── order.ts             # @spec O003 - 订单类型定义
│   │   │   └── index.tsx                # 模块导出
│   │   └── beverage-config-management/  # B端饮品配置管理
│   │       ├── components/
│   │       │   ├── BeverageList.tsx     # @spec O003 - 饮品列表
│   │       │   ├── BeverageForm.tsx     # @spec O003 - 饮品表单
│   │       │   ├── SpecConfig.tsx       # @spec O003 - 规格配置
│   │       │   └── RecipeConfig.tsx     # @spec O003 - 配方配置
│   │       ├── services/
│   │       │   └── beverageService.ts   # @spec O003 - 饮品管理API
│   │       └── types/
│   │           └── beverage.ts          # @spec O003 - 饮品类型
│   ├── pages/                           # 页面组件
│   │   ├── BeverageOrderPage.tsx        # @spec O003 - 订单管理页面
│   │   └── BeverageConfigPage.tsx       # @spec O003 - 饮品配置页面
│   └── components/                      # 全局组件
│       └── layout/
│           └── MainLayout.tsx           # 主布局（添加饮品订单菜单项）
├── tests/
│   └── beverage/
│       ├── order-management.test.tsx    # 订单管理测试
│       └── beverage-config.test.tsx     # 饮品配置测试
└── public/
    └── mockServiceWorker.js             # MSW Worker

# 后端项目结构（Spring Boot）
backend/
├── src/main/java/com/cinema/
│   ├── beverage/                        # 饮品订单模块
│   │   ├── controller/
│   │   │   ├── ClientBeverageController.java    # @spec O003 - C端饮品API
│   │   │   ├── ClientOrderController.java       # @spec O003 - C端订单API
│   │   │   ├── AdminOrderController.java        # @spec O003 - B端订单API
│   │   │   └── AdminBeverageController.java     # @spec O003 - B端饮品配置API
│   │   ├── service/
│   │   │   ├── BeverageService.java             # @spec O003 - 饮品业务逻辑
│   │   │   ├── OrderService.java                # @spec O003 - 订单业务逻辑
│   │   │   ├── BOMService.java                  # @spec O003 - BOM扣料逻辑
│   │   │   ├── PaymentService.java              # @spec O003 - 支付服务（Mock）
│   │   │   └── CallNumberService.java           # @spec O003 - 叫号服务（Mock）
│   │   ├── repository/
│   │   │   ├── BeverageRepository.java          # @spec O003 - 饮品数据访问
│   │   │   ├── BeverageOrderRepository.java     # @spec O003 - 订单数据访问
│   │   │   └── RecipeRepository.java            # @spec O003 - 配方数据访问
│   │   ├── dto/
│   │   │   ├── BeverageDTO.java                 # @spec O003 - 饮品DTO
│   │   │   ├── OrderDTO.java                    # @spec O003 - 订单DTO
│   │   │   └── SpecDTO.java                     # @spec O003 - 规格DTO
│   │   ├── entity/
│   │   │   ├── Beverage.java                    # @spec O003 - 饮品实体
│   │   │   ├── BeverageSpec.java                # @spec O003 - 规格实体
│   │   │   ├── BeverageRecipe.java              # @spec O003 - 配方实体
│   │   │   ├── BeverageOrder.java               # @spec O003 - 订单实体
│   │   │   └── BeverageOrderItem.java           # @spec O003 - 订单项实体
│   │   └── exception/
│   │       ├── BeverageNotFoundException.java   # @spec O003 - 饮品未找到异常
│   │       ├── OrderNotFoundException.java      # @spec O003 - 订单未找到异常
│   │       └── InsufficientStockException.java  # @spec O003 - 库存不足异常
│   └── config/
│       └── SecurityConfig.java                  # 修改：添加饮品订单API路由配置
├── src/test/java/com/cinema/
│   └── beverage/
│       ├── BeverageServiceTest.java             # 饮品服务测试
│       ├── OrderServiceTest.java                # 订单服务测试
│       └── BOMServiceTest.java                  # BOM扣料测试
└── src/main/resources/
    └── db/migration/
        └── V003__create_beverage_order_tables.sql  # Supabase数据库迁移脚本
```

**Structure Decision**:
- C端采用Taro框架多端统一开发，以页面为核心组织结构，支持微信小程序和H5
- B端采用功能模块化架构（features/），每个功能模块包含组件、服务、类型
- 后端采用领域驱动设计（DDD），按业务模块组织，清晰分层（Controller/Service/Repository）
- 前后端通过OpenAPI契约对齐接口，确保类型一致性

## Complexity Tracking

无宪法违规项需要说明。本项目完全符合所有宪法原则要求。

## Phase 0: Research & Technical Decisions

### 0.1 Research Tasks

基于技术上下文中的NEEDS CLARIFICATION标记，以下研究任务需要完成：

1. **Taro框架小程序底部导航栏（tabBar）配置最佳实践**
   - 研究目标：如何在Taro项目中正确配置tabBar，添加"点餐菜单"tab
   - 输出：tabBar配置方案、路由绑定策略、图标资源准备

2. **Supabase Storage图片上传与访问最佳实践**
   - 研究目标：饮品图片（主图、详情图）的上传、存储、访问URL生成
   - 输出：图片上传API封装、URL签名策略、CDN加速配置

3. **BOM自动扣料与库存集成方案**
   - 研究目标：如何集成P003/P004库存管理API，实现BOM配方驱动的自动扣料
   - 输出：库存查询API调用、扣料接口设计、事务一致性保证

4. **订单状态实时同步方案（MVP轮询策略）**
   - 研究目标：B端每5-10秒轮询新订单，C端订单状态实时更新
   - 输出：轮询频率设计、前端状态同步机制、性能优化建议

5. **Mock支付与Mock叫号实现方案**
   - 研究目标：MVP阶段如何实现Mock支付（点击自动成功）和Mock叫号（显示状态）
   - 输出：Mock支付流程设计、叫号状态管理、后续真实集成预留接口

6. **订单数据快照设计（防止菜单变更影响历史订单）**
   - 研究目标：订单项如何保存饮品名称、规格、价格快照
   - 输出：快照字段设计、数据冗余策略、查询性能优化

### 0.2 Research Deliverables

将在`research.md`中记录以下内容：
- 每个研究任务的技术决策（Decision）
- 选择的技术方案及其理由（Rationale）
- 评估过的替代方案（Alternatives Considered）
- 相关代码示例和配置样例

## Phase 1: Design & Contracts

### 1.1 Data Model Design (`data-model.md`)

核心实体设计（详细定义见data-model.md）：

**饮品管理实体**：
- `Beverage`（饮品）：id, name, category, base_price, description, main_image, detail_images, status, is_recommended, created_at, updated_at
- `BeverageSpec`（饮品规格）：id, beverage_id, spec_type（SIZE/TEMPERATURE/SWEETNESS/TOPPING）, spec_name, price_adjustment, is_default, sort_order
- `BeverageRecipe`（饮品配方/BOM）：id, beverage_id, spec_combination（JSON：规格组合）, ingredients（JSON：原料列表）, created_at, updated_at

**订单管理实体**：
- `BeverageOrder`（饮品订单）：id, order_no, queue_number, user_id, status, total_price, payment_time, created_at, completed_at
- `BeverageOrderItem`（订单项）：id, order_id, beverage_snapshot（JSON：饮品快照）, spec_snapshot（JSON：规格快照）, quantity, unit_price, subtotal
- `QueueNumber`（取餐号）：id, queue_no, order_id, status, called_at, created_at

**关系设计**：
- Beverage 1-N BeverageSpec：一个饮品可有多个规格（不同类型）
- Beverage 1-N BeverageRecipe：一个饮品可有多个配方（对应不同规格组合）
- BeverageOrder 1-N BeverageOrderItem：一个订单包含多个订单项
- BeverageOrder 1-1 QueueNumber：一个订单对应一个取餐号

### 1.2 API Contracts (`contracts/api.yaml`)

遵循OpenAPI 3.0规范，定义以下API端点：

**C端饮品与订单API**：
```
GET    /api/client/beverages                      # 饮品菜单列表
GET    /api/client/beverages/{id}                 # 饮品详情
GET    /api/client/beverage-specs/{beverageId}    # 饮品规格列表
POST   /api/client/beverage-orders                # 创建订单
POST   /api/client/beverage-orders/{id}/pay       # 订单支付（Mock）
GET    /api/client/beverage-orders/{id}           # 订单详情
GET    /api/client/beverage-orders/my             # 我的订单列表
```

**B端订单管理API**：
```
GET    /api/admin/beverage-orders                 # 订单列表（支持轮询）
GET    /api/admin/beverage-orders/{id}            # 订单详情
PATCH  /api/admin/beverage-orders/{id}/status     # 更新订单状态
POST   /api/admin/beverage-orders/{id}/call       # 叫号（Mock）
```

**B端饮品配置API**：
```
GET    /api/admin/beverages                       # 饮品列表（分页/搜索/筛选）
POST   /api/admin/beverages                       # 新增饮品
GET    /api/admin/beverages/{id}                  # 饮品详情
PUT    /api/admin/beverages/{id}                  # 更新饮品
DELETE /api/admin/beverages/{id}                  # 删除饮品（软删除）
PATCH  /api/admin/beverages/{id}/status           # 切换饮品状态
GET    /api/admin/beverages/{id}/specs            # 获取饮品规格
POST   /api/admin/beverages/{id}/specs            # 添加规格
PUT    /api/admin/beverages/{id}/specs/{specId}   # 更新规格
DELETE /api/admin/beverages/{id}/specs/{specId}   # 删除规格
GET    /api/admin/beverages/{id}/recipes          # 获取饮品配方
POST   /api/admin/beverages/{id}/recipes          # 添加配方
PUT    /api/admin/beverages/{id}/recipes/{recipeId}  # 更新配方
DELETE /api/admin/beverages/{id}/recipes/{recipeId}  # 删除配方
```

### 1.3 Development Quickstart (`quickstart.md`)

快速入门文档包含：
- 环境准备（Node.js版本、Java版本、Supabase账号）
- 项目克隆与依赖安装（C端、B端、后端）
- Supabase数据库初始化（执行迁移脚本）
- 本地开发启动命令（C端Taro、B端React、后端Spring Boot）
- 测试数据准备（Mock饮品菜单、Mock订单）
- 常见问题排查（端口冲突、依赖版本问题）

### 1.4 Agent Context Update

执行`.specify/scripts/bash/update-agent-context.sh claude`脚本，更新`CLAUDE.md`文件：
- 添加技术栈：Taro 4.1.9, Spring Boot 3.x, Supabase PostgreSQL
- 添加存储信息：Supabase Storage（饮品图片）
- 保留手工添加的内容（MANUAL ADDITIONS标记）

## Next Steps

Phase 0-1完成后，后续步骤：

1. ✅ **Phase 0 Complete**: 生成`research.md`，解决所有技术决策问题
2. ✅ **Phase 1 Complete**: 生成`data-model.md`、`contracts/api.yaml`、`quickstart.md`
3. ⏳ **Phase 2 (Next)**: 使用`/speckit.tasks`命令生成`tasks.md`，将功能需求拆解为可执行任务
4. ⏳ **Implementation**: 执行`tasks.md`中的任务，遵循TDD原则（先写测试）
5. ⏳ **Testing & Review**: 完成所有测试，代码审查，确保质量标准

**注意**: 本plan.md由`/speckit.plan`命令生成，Phase 2的`tasks.md`需要单独使用`/speckit.tasks`命令生成。
