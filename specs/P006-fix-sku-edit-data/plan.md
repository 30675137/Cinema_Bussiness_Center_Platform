# Implementation Plan: SKU编辑页面数据加载修复

**Branch**: `P006-fix-sku-edit-data` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/P006-fix-sku-edit-data/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: 修复SKU编辑页面未加载SPU（标准产品单元）数据和BOM（物料清单）配方数据的问题。

**Technical Approach**:
- **前端**: 修改SKU编辑页面组件,在页面加载时通过TanStack Query并行获取SKU、SPU和BOM数据
- **后端**: 确保现有API端点正确返回完整的SPU和BOM关联数据,添加必要的日志记录
- **测试**: 使用e2e-test-generator创建Playwright E2E测试,通过API动态创建测试数据验证数据加载正确性

**Scope**: 仅修复数据加载问题,不涉及SPU/BOM数据的编辑功能（SPU数据为只读显示）

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.3.5 (backend)
- 此bugfix仅涉及B端管理后台

**Primary Dependencies**:
- B端前端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1
- B端后端: Spring Boot Web 3.3.5, Supabase Java/HTTP client
- 测试: Playwright 1.57.0, Vitest 4.0.15, MSW 2.12.4

**Storage**: Supabase (PostgreSQL) 作为主要后端数据源,存储SKU、SPU、BOM数据及关联关系

**Testing**:
- 单元测试: Vitest (组件级)
- 集成测试: MSW (模拟API响应)
- E2E测试: Playwright (使用e2e-test-generator生成,API动态创建测试数据)

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge)
- 后端API: Spring Boot RESTful API

**Project Type**:
- Bugfix for existing full-stack web application (Spring Boot backend + React frontend for B端 admin interface)

**Performance Goals**:
- SKU编辑页面数据加载: <2秒 (P95) - 包含SKU基本信息、SPU信息和BOM配方数据
- 首屏渲染: <1.5秒 (P95)
- BOM配方列表滚动: ≥60 FPS (当原料超过10种时使用虚拟滚动)

**Constraints**:
- Must comply with Feature Branch Binding (P001编码正确)
- Test-Driven Development (必须先编写E2E测试)
- Frontend Tech Stack (B端使用React+Ant Design+TanStack Query)
- Backend Architecture (Spring Boot + Supabase)
- 不修改SPU/BOM核心业务逻辑,仅修复数据加载问题

**Scale/Scope**:
- 影响范围: SKU编辑页面 (`frontend/src/pages/ProductManagement/SKUEdit.tsx` 或类似路径)
- API端点: 预计涉及3-4个现有或新增API (`GET /api/skus/{id}`, `GET /api/spus/{id}`, `GET /api/boms/{skuId}`)
- 测试用例: 至少3个E2E测试场景 (加载完整数据、部分加载失败、脏数据处理)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `P006-fix-sku-edit-data` 中的specId (`P001`) 使用商品管理模块(P=Product Management),符合规范。active_spec已设置。
- [x] **测试驱动开发**: 将使用e2e-test-generator创建Playwright E2E测试,通过API动态创建测试数据,测试先于实现编写。
- [x] **组件化架构**: 修改现有SKU编辑页面组件,保持组件分层(页面组件、表单组件、数据加载hooks)。
- [x] **前端技术栈分层**: 仅涉及B端管理后台,使用React 19 + Ant Design 6 + TanStack Query,符合B端技术栈要求。
- [x] **数据驱动状态管理**: 使用TanStack Query管理服务器状态(SKU/SPU/BOM数据获取),必要时使用Zustand管理客户端UI状态(加载状态、错误状态)。
- [x] **代码质量工程化**: 所有新增代码必须包含 `@spec P006-fix-sku-edit-data` 标识,通过TypeScript strict模式检查和ESLint检查。
- [x] **后端技术栈约束**: 后端使用Spring Boot 3.3.5集成Supabase,Supabase为主要数据源,符合约束。

### 性能与标准检查：
- [x] **性能标准**: 数据加载<2秒,首屏渲染<1.5秒,BOM配方>10种原料使用虚拟滚动(NFR-003)。
- [x] **安全标准**: 使用Zod验证API响应数据,防止XSS(数据渲染使用Ant Design安全组件),仅认证用户可访问(NFR-002)。
- [x] **可访问性标准**: 使用Ant Design组件保证WCAG 2.1 AA级别,加载状态使用骨架屏(Skeleton)提供可访问提示(FR-010)。

### 评审结果
✅ **所有宪法原则检查通过**,无需在Complexity Tracking表中记录违规。

## Project Structure

### Documentation (this feature)

```text
specs/P006-fix-sku-edit-data/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   └── api.yaml         # OpenAPI 3.0 spec for SKU/SPU/BOM APIs
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (created by /speckit.tasks - NOT by this command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── pages/
│   │   └── ProductManagement/
│   │       ├── SKUEdit.tsx                    # 🔧 修改: 添加SPU和BOM数据加载
│   │       └── SKUEdit.test.tsx               # ✅ 新增: 单元测试
│   ├── services/
│   │   ├── skuService.ts                      # 🔧 修改: 添加getSKUWithRelations API
│   │   ├── spuService.ts                      # ✅ 检查: 确保getSPU API存在
│   │   └── bomService.ts                      # ✅ 检查: 确保getBOM API存在
│   ├── hooks/
│   │   └── useSKUEditData.ts                  # ✅ 新增: 自定义Hook封装数据加载逻辑
│   ├── components/
│   │   └── ProductManagement/
│   │       ├── SPUInfoDisplay.tsx             # ✅ 新增: SPU信息只读显示组件
│   │       ├── BOMListDisplay.tsx             # ✅ 新增: BOM配方列表显示组件(支持虚拟滚动)
│   │       └── DataLoadingError.tsx           # ✅ 新增: 数据加载错误提示组件
│   ├── types/
│   │   └── product.ts                         # 🔧 修改: 添加SKUWithRelations、SPU、BOM类型定义
│   └── mocks/
│       └── handlers/
│           └── productHandlers.ts             # ✅ 新增: MSW handlers for SKU/SPU/BOM APIs
├── tests/
│   └── e2e/
│       └── sku-edit-data-loading.spec.ts      # ✅ 新增: E2E测试(使用e2e-test-generator生成)
└── scenarios/
    └── product/
        └── E2E-PRODUCT-001.yaml               # ✅ 新增: E2E场景定义(使用test-scenario-author)

backend/
├── src/main/java/com/cinema/
│   ├── product/
│   │   ├── controller/
│   │   │   └── SKUController.java             # 🔧 修改: 添加SKU详情API返回SPU和BOM数据
│   │   ├── service/
│   │   │   ├── SKUService.java                # 🔧 修改: 添加获取SKU关联数据逻辑
│   │   │   ├── SPUService.java                # ✅ 检查: 确保getSPU方法存在
│   │   │   └── BOMService.java                # ✅ 检查: 确保getBOM方法存在
│   │   ├── dto/
│   │   │   ├── SKUDetailResponse.java         # ✅ 新增: SKU详情响应DTO(包含SPU和BOM)
│   │   │   ├── SPUDto.java                    # ✅ 检查: 确保SPU DTO存在
│   │   │   └── BOMDto.java                    # ✅ 检查: 确保BOM DTO存在
│   │   └── exception/
│   │       └── DataLoadingException.java      # ✅ 新增: 数据加载异常类(用于日志记录)
│   └── common/
│       └── logging/
│           └── DataLoadingLogger.java         # ✅ 新增: 数据加载日志记录工具(NFR-001)
└── src/test/java/com/cinema/
    └── product/
        ├── controller/
        │   └── SKUControllerTest.java         # ✅ 新增: SKU API单元测试
        └── service/
            └── SKUServiceTest.java            # ✅ 新增: SKU服务单元测试
```

**Structure Decision**:
- **前端**: 采用页面组件 + 自定义Hook + 服务层分离架构,页面组件负责布局,自定义Hook封装TanStack Query数据获取逻辑,服务层封装API调用。
- **后端**: 遵循Spring Boot分层架构(Controller → Service → Repository),添加DTO封装SKU关联数据。
- **测试**: 单元测试(Vitest) + 集成测试(MSW) + E2E测试(Playwright,使用e2e-test-generator)。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

本bugfix无宪法原则违规,Complexity Tracking表留空。

---

## Phase 0: Research & Technical Decisions

*Prerequisites: Constitution Check passed*

### Research Tasks

本阶段需要研究以下技术决策点,解决所有 NEEDS CLARIFICATION 标记的问题。

#### Research 1: SKU/SPU/BOM数据关联查询策略

**Question**: 后端应该如何高效返回SKU关联的SPU和BOM数据？

**Options to Research**:
1. **单次API调用返回完整数据** (推荐): `GET /api/skus/{id}/details` 返回嵌套的SPU和BOM数据
2. **前端并行请求三个独立API**: `GET /api/skus/{id}`, `GET /api/spus/{spuId}`, `GET /api/boms/{skuId}`
3. **GraphQL查询**: 使用GraphQL按需获取关联数据

**Research Actions**:
- 检查现有 `SKUController` 是否已有详情API
- 评估Supabase JOIN查询性能（SKU JOIN SPU JOIN BOM）
- 对比单次API vs 并行请求的网络开销和前端复杂度
- 考虑后端缓存策略（Caffeine缓存SPU数据）

**Expected Output**: 选择最优数据获取策略,记录在research.md

#### Research 2: TanStack Query并行数据获取最佳实践

**Question**: 如何使用TanStack Query高效并行获取SKU、SPU、BOM数据并处理部分失败场景？

**Options to Research**:
1. **单个useQuery + 后端聚合**: `useQuery(['skuDetails', id], () => fetchSKUDetails(id))`
2. **并行useQuery + enabled依赖**: 先获取SKU,再根据SKU.spuId获取SPU
3. **useQueries批量查询**: `useQueries([...queries])`

**Research Actions**:
- 研究TanStack Query错误处理最佳实践（部分成功场景处理）
- 评估enabled依赖链 vs 批量查询的性能差异
- 查阅TanStack Query文档关于并行请求和错误恢复的建议
- 研究如何展示部分加载成功状态（FR-006要求）

**Expected Output**: 选择TanStack Query数据获取模式,记录在research.md

#### Research 3: BOM配方虚拟滚动实现方案

**Question**: 当BOM配方超过10种原料时,如何实现虚拟滚动保证60 FPS性能？

**Options to Research**:
1. **react-window**: 轻量级虚拟滚动库
2. **react-virtualized**: 功能更全但体积更大
3. **Ant Design Table虚拟滚动**: Ant Design 6.x内置虚拟滚动支持
4. **自定义实现**: 使用Intersection Observer + CSS transform

**Research Actions**:
- 对比react-window和Ant Design Table虚拟滚动的API和性能
- 评估bundle size影响（react-window ~7KB vs Ant Design内置）
- 研究Ant Design 6.1.0 Table的`virtual`属性支持情况
- 测试虚拟滚动在10-100种原料场景下的帧率

**Expected Output**: 选择虚拟滚动实现方案,记录在research.md

#### Research 4: 并发编辑冲突检测机制

**Question**: 如何实现版本号或时间戳机制检测并发编辑冲突(FR-011)?

**Options to Research**:
1. **乐观锁（版本号）**: SKU实体添加`version`字段,更新时对比版本号
2. **乐观锁（时间戳）**: 使用`updated_at`时间戳对比
3. **ETag + If-Match**: HTTP协议级别冲突检测

**Research Actions**:
- 检查Supabase表结构是否已有`version`或`updated_at`字段
- 研究Spring Data JPA的`@Version`注解使用
- 评估ETag机制在React + Spring Boot中的实现复杂度
- 设计冲突检测的前端UI交互（覆盖警告弹窗）

**Expected Output**: 选择冲突检测机制,记录在research.md

#### Research 5: 前后端日志记录集成方案

**Question**: 如何实现前端日志服务和后端应用日志的统一记录(NFR-001)?

**Options to Research**:
1. **前端**: Sentry (错误追踪) + 自定义日志收集器
2. **前端**: console.error + 后端日志API转发
3. **后端**: Spring Boot SLF4J + Logback + 结构化日志（JSON格式）

**Research Actions**:
- 检查项目是否已集成Sentry或其他前端日志服务
- 研究如何在TanStack Query的`onError`回调中记录日志
- 设计后端日志格式（包含SKU ID、失败类型、HTTP状态码等字段）
- 评估前端日志是否需要独立服务或直接输出到浏览器console

**Expected Output**: 选择日志记录方案,定义日志格式标准,记录在research.md

### Research Output Structure

`research.md` 文件应包含以下章节:

```markdown
# Research: SKU编辑页面数据加载修复

## 1. SKU/SPU/BOM数据关联查询策略

**Decision**: [选择的方案]
**Rationale**: [为什么选择此方案]
**Alternatives Considered**: [其他方案及拒绝理由]
**Implementation Notes**: [实现要点]

## 2. TanStack Query并行数据获取最佳实践

**Decision**: ...
**Rationale**: ...
**Alternatives Considered**: ...

## 3. BOM配方虚拟滚动实现方案

**Decision**: ...
**Rationale**: ...
**Alternatives Considered**: ...

## 4. 并发编辑冲突检测机制

**Decision**: ...
**Rationale**: ...
**Alternatives Considered**: ...

## 5. 前后端日志记录集成方案

**Decision**: ...
**Rationale**: ...
**Alternatives Considered**: ...
```

---

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

### 1.1 Data Model Design

`data-model.md` should define:

#### Entities (from spec Key Entities section)

```typescript
// SKU (Stock Keeping Unit) - 库存量单位
interface SKU {
  id: string;                    // SKU唯一标识
  code: string;                  // SKU编码（如"FIN-COCKTAIL"）
  name: string;                  // SKU名称
  price: number;                 // 零售价格（单位：分）
  stock: number;                 // 库存数量
  status: 'draft' | 'enabled' | 'disabled';  // 状态
  spuId: string | null;          // 关联的SPU ID（可为null）
  version: number;               // 乐观锁版本号（用于并发冲突检测，FR-011）
  createdAt: Date;
  updatedAt: Date;
}

// SPU (Standard Product Unit) - 标准产品单元
interface SPU {
  id: string;                    // SPU唯一标识
  name: string;                  // 产品名称
  categoryId: string;            // 分类ID
  categoryName: string;          // 分类名称（冗余字段，便于显示）
  brandId: string | null;        // 品牌ID
  brandName: string | null;      // 品牌名称（冗余字段）
  description: string;           // 产品描述
  status: 'active' | 'inactive'; // 状态
  createdAt: Date;
  updatedAt: Date;
}

// BOM (Bill of Materials) - 物料清单/配方
interface BOM {
  id: string;                    // BOM唯一标识
  skuId: string;                 // 关联的成品SKU ID
  wasteRate: number;             // 损耗率（百分比，如5表示5%）
  components: BOMComponent[];    // 配方组成项列表
  createdAt: Date;
  updatedAt: Date;
}

// BOM Component - BOM配方组成项
interface BOMComponent {
  id: string;                    // 组成项唯一标识
  bomId: string;                 // 所属BOM ID
  componentSkuId: string;        // 原料SKU ID
  componentSkuCode: string;      // 原料SKU编码（冗余字段）
  componentSkuName: string;      // 原料SKU名称（冗余字段）
  quantity: number;              // 用量
  unit: string;                  // 单位（如"ml", "个", "根"）
  standardCost: number;          // 标准成本（单位：分）
  status: 'active' | 'invalid';  // 状态（用于标记原料是否已失效，FR-008）
}
```

#### Aggregated Response Types (for API contracts)

```typescript
// SKU详情响应（包含关联的SPU和BOM数据）
interface SKUDetailResponse {
  sku: SKU;
  spu: SPU | null;               // 如果SKU未关联SPU，则为null
  bom: BOM | null;               // 如果SKU未配置BOM，则为null（仅成品SKU有BOM）
  metadata: {
    spuLoadSuccess: boolean;     // SPU数据是否加载成功（用于部分失败场景，FR-006）
    bomLoadSuccess: boolean;     // BOM数据是否加载成功
    spuStatus: 'valid' | 'invalid' | 'not_linked';  // SPU状态（valid=正常, invalid=已删除, not_linked=未关联）
  };
}
```

#### Data Validation Rules

- **SKU.code**: 必填,格式 `[A-Z]+-[A-Z]+-[0-9]+` (如"FIN-COCKTAIL-001")
- **SKU.price**: 必填,大于0
- **SKU.version**: 必填,初始值为1,每次更新递增
- **SPU.name**: 必填,长度2-100字符
- **BOM.wasteRate**: 可选,范围0-100
- **BOMComponent.quantity**: 必填,大于0
- **BOMComponent.unit**: 必填,枚举值（"ml", "L", "g", "kg", "个", "根", "片"）

#### State Transitions

**SKU状态转换** (不受本bugfix影响,但需了解):
```
draft → enabled → disabled
  ↓       ↓
disabled ← disabled
```

**BOMComponent.status状态转换**:
```
active (原料正常) → invalid (原料被删除或禁用，FR-008)
```

### 1.2 API Contracts Design

`contracts/api.yaml` should define OpenAPI 3.0 spec for:

#### Endpoint 1: Get SKU Detail with Relations

```yaml
/api/skus/{id}/details:
  get:
    summary: 获取SKU详情（包含关联的SPU和BOM数据）
    operationId: getSKUDetails
    tags:
      - SKU
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
        description: SKU唯一标识
    responses:
      '200':
        description: SKU详情获取成功
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SKUDetailResponse'
            example:
              sku:
                id: "sku-001"
                code: "FIN-COCKTAIL"
                name: "威士忌可乐鸡尾酒"
                price: 3500
                stock: 100
                status: "enabled"
                spuId: "spu-001"
                version: 3
                createdAt: "2025-01-15T10:00:00Z"
                updatedAt: "2025-01-20T15:30:00Z"
              spu:
                id: "spu-001"
                name: "威士忌可乐鸡尾酒"
                categoryId: "cat-001"
                categoryName: "鸡尾酒"
                brandId: "brand-001"
                brandName: "自制品牌"
                description: "经典威士忌可乐配方"
                status: "active"
              bom:
                id: "bom-001"
                skuId: "sku-001"
                wasteRate: 5.0
                components:
                  - id: "comp-001"
                    componentSkuCode: "SKU-WHISKEY-40ML"
                    componentSkuName: "威士忌 40ml"
                    quantity: 45
                    unit: "ml"
                    standardCost: 2250
                    status: "active"
                  - id: "comp-002"
                    componentSkuCode: "SKU-COLA-150ML"
                    componentSkuName: "可乐 150ml"
                    quantity: 150
                    unit: "ml"
                    standardCost: 300
                    status: "active"
              metadata:
                spuLoadSuccess: true
                bomLoadSuccess: true
                spuStatus: "valid"
      '404':
        description: SKU不存在
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'
            example:
              success: false
              error: "SKU_NTF_001"
              message: "SKU不存在"
              timestamp: "2025-12-31T10:00:00Z"
      '500':
        description: 服务器内部错误
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'
```

#### Endpoint 2: Update SKU (with Conflict Detection)

```yaml
/api/skus/{id}:
  put:
    summary: 更新SKU信息（包含并发冲突检测）
    operationId: updateSKU
    tags:
      - SKU
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              price:
                type: number
                description: 零售价格（单位：分）
              stock:
                type: number
                description: 库存数量
              status:
                type: string
                enum: [draft, enabled, disabled]
              version:
                type: number
                description: 当前版本号（用于乐观锁冲突检测，FR-011）
            required:
              - version
          example:
            price: 3800
            stock: 120
            status: "enabled"
            version: 3
    responses:
      '200':
        description: SKU更新成功
      '409':
        description: 并发冲突（版本号不匹配）
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConflictResponse'
            example:
              success: false
              error: "SKU_CONFLICT_001"
              message: "数据已被其他用户修改，您确认要覆盖吗？"
              currentVersion: 4
              requestedVersion: 3
```

### 1.3 Quickstart Guide

`quickstart.md` should include:

1. **环境准备**:
   - 安装依赖: `cd frontend && npm install`
   - 启动后端: `cd backend && ./mvnw spring-boot:run`
   - 启动前端: `cd frontend && npm run dev`

2. **开发步骤**:
   - Step 1: 编写E2E测试场景 (使用test-scenario-author)
   - Step 2: 生成E2E测试脚本 (使用e2e-test-generator)
   - Step 3: 运行E2E测试 (应该失败 - Red phase)
   - Step 4: 实现前端数据加载逻辑 (useSKUEditData Hook)
   - Step 5: 实现后端API (SKUController.getSKUDetails)
   - Step 6: 运行E2E测试 (应该通过 - Green phase)
   - Step 7: 重构和优化 (Refactor phase)

3. **测试命令**:
   ```bash
   # 单元测试
   cd frontend && npm run test:unit

   # E2E测试
   cd frontend && npm run test:e2e

   # 后端测试
   cd backend && ./mvnw test
   ```

4. **调试技巧**:
   - 使用React DevTools查看TanStack Query缓存状态
   - 使用MSW查看模拟的API请求和响应
   - 使用Playwright UI模式调试E2E测试

---

## Next Steps

**After this command completes**:

1. ✅ Phase 0 & Phase 1 artifacts generated:
   - `research.md` (5 research decisions)
   - `data-model.md` (SKU/SPU/BOM entities and validation rules)
   - `contracts/api.yaml` (OpenAPI 3.0 spec for APIs)
   - `quickstart.md` (development guide)

2. 🔜 **Run `/speckit.tasks`** to generate `tasks.md`:
   - Will break down implementation into atomic tasks
   - Will sequence tasks based on dependencies
   - Will assign priorities and estimates

3. 🔜 **Run `/speckit.implement`** to execute tasks:
   - Will follow TDD cycle (Red → Green → Refactor)
   - Will create E2E tests using e2e-test-generator
   - Will implement frontend and backend changes
   - Will validate against success criteria

4. 🔜 **Manual steps**:
   - Review and approve generated artifacts
   - Run constitution check after implementation
   - Execute E2E tests and validate data loading works correctly
   - Update documentation if needed
