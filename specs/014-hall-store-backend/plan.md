# Implementation Plan: 影厅资源后端建模（Store-Hall 一致性）+ 门店管理前端页面

**Branch**: `014-hall-store-backend` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-hall-store-backend/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能实现影厅资源与门店的后端数据建模及前端展示能力，包括：
1. **后端建模**：基于 Spring Boot + Supabase 构建 Store（门店）与 Hall（影厅）主数据表，建立清晰的一对多关系
2. **API 一致性**：提供统一的 REST API（GET /api/stores, GET /api/stores/{storeId}/halls, GET /api/halls）供前端使用，确保返回结构与前端 TypeScript 类型完全一致
3. **前端门店管理页面**：创建独立的门店管理页面（只读列表），支持名称搜索、状态筛选和前端分页，作为影厅资源管理的参考数据入口
4. **影厅资源页面增强**：在影厅资源管理页面添加门店筛选器，支持按门店查看影厅或查看全部影厅

技术方案采用 Spring Boot WebClient 调用 Supabase REST API 实现数据访问，前端使用 TanStack Query 管理 API 调用和缓存，确保前后端数据模型的强类型一致性。

## Technical Context

**Language/Version**: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.3.5 (backend)

**Primary Dependencies**:
- Frontend: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13
- Backend: Spring Boot Web 3.3.5, Spring WebFlux WebClient, Jackson, Supabase REST API client

**Storage**: Supabase PostgreSQL 作为主要数据源，包含 `stores` 和 `halls` 两张主数据表；前端开发时可使用 MSW 模拟 API

**Testing**:
- Backend: JUnit 5 + Spring Boot Test + MockWebServer（模拟 Supabase）
- Frontend: Vitest (unit tests) + Playwright (e2e tests) + Testing Library

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API (port 8080)

**Project Type**: Full-stack web application (Spring Boot backend + React frontend)

**Performance Goals**:
- 门店列表加载 <3秒
- 名称搜索/状态筛选响应 <1秒
- 影厅列表加载 <2秒
- 页面切换 <500ms

**Constraints**:
- 必须遵循 Feature Branch Binding（specId: 014-hall-store-backend）
- 测试驱动开发（TDD），先写测试再实现
- 后端必须使用 Spring Boot + Supabase，不得直接连接其他数据库
- 前端组件必须遵循原子设计理念
- 前后端数据结构必须完全一致（字段名、类型、枚举值）

**Scale/Scope**:
- 预期门店数量：10-50家
- 预期影厅数量：100-500个
- 单个门店影厅数：2-20个
- 并发用户：10-100人

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `014-hall-store-backend` 中的specId与active_spec路径一致
- [x] **测试驱动开发**: 已规划测试策略（JUnit + Spring Boot Test + Vitest + Playwright）
- [x] **组件化架构**: 前端门店管理页面将遵循原子设计（Table组件、SearchInput、StatusFilter等）
- [x] **数据驱动状态管理**: 使用 TanStack Query 管理服务器状态，Zustand 管理客户端状态
- [x] **代码质量工程化**: TypeScript类型检查、ESLint、Java静态检查、单元测试和集成测试
- [x] **后端技术栈约束**: 使用 Spring Boot 3.3.5 + Supabase REST API，Supabase为唯一数据源

### 性能与标准检查：
- [x] **性能标准**: 门店列表<3秒，搜索/筛选<1秒，分页支持（前端分页）
- [x] **安全标准**: 使用 Zod 进行前端数据验证，后端使用 Bean Validation，API 认证通过 Supabase Auth
- [x] **可访问性标准**: 使用 Ant Design 组件自带的可访问性支持，遵循 WCAG 2.1 AA

## Project Structure

### Documentation (this feature)

```text
specs/014-hall-store-backend/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (技术决策记录)
├── data-model.md        # Phase 1 output (Store/Hall 实体设计)
├── quickstart.md        # Phase 1 output (开发快速启动指南)
├── contracts/           # Phase 1 output (API 契约定义)
│   ├── store-api.yaml  # 门店查询 API OpenAPI spec
│   └── hall-api.yaml   # 影厅查询 API OpenAPI spec
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/cinema/hallstore/
│   ├── controller/              # REST API 控制器
│   │   ├── StoreQueryController.java      # GET /api/stores
│   │   ├── HallQueryController.java       # GET /api/stores/{storeId}/halls
│   │   └── HallListController.java        # GET /api/halls
│   ├── service/                 # 业务逻辑层
│   │   ├── StoreService.java
│   │   └── HallService.java
│   ├── repository/              # 数据访问层（Supabase REST API）
│   │   ├── StoreRepository.java
│   │   └── HallRepository.java
│   ├── domain/                  # 领域模型
│   │   ├── Store.java
│   │   ├── Hall.java
│   │   └── enums/
│   │       ├── StoreStatus.java
│   │       ├── HallStatus.java
│   │       └── HallType.java
│   ├── dto/                     # 数据传输对象
│   │   ├── StoreDTO.java
│   │   ├── HallDTO.java
│   │   └── ApiResponse.java
│   ├── mapper/                  # 实体与 DTO 映射
│   │   ├── StoreMapper.java
│   │   └── HallMapper.java
│   ├── config/                  # 配置类
│   │   ├── SupabaseConfig.java
│   │   └── WebConfig.java
│   └── exception/               # 异常处理
│       ├── ResourceNotFoundException.java
│       └── GlobalExceptionHandler.java
├── src/test/java/               # 测试
│   ├── controller/              # 控制器集成测试
│   ├── service/                 # 服务单元测试
│   └── repository/              # 仓储层测试
└── pom.xml

frontend/
├── src/
│   ├── pages/
│   │   ├── stores/                      # 门店管理页面（新增）
│   │   │   ├── index.tsx               # 门店列表页面
│   │   │   ├── components/             # 页面专用组件
│   │   │   │   ├── StoreTable.tsx      # 门店列表表格
│   │   │   │   ├── StoreSearch.tsx     # 搜索框
│   │   │   │   └── StatusFilter.tsx    # 状态筛选器
│   │   │   ├── hooks/                  # 自定义 hooks
│   │   │   │   └── useStoresQuery.ts   # TanStack Query hook
│   │   │   ├── services/               # API 服务
│   │   │   │   └── storeService.ts     # 门店 API 调用
│   │   │   └── types/                  # TypeScript 类型
│   │   │       └── store.types.ts      # Store 接口定义
│   │   └── schedule/                    # 排期管理（已有）
│   │       ├── HallResources.tsx        # 影厅资源管理（需修改）
│   │       └── components/
│   │           └── StoreSelector.tsx    # 门店选择器（新增）
│   ├── components/layout/
│   │   ├── Router.tsx                   # 路由配置（需添加 /stores 路由）
│   │   └── AppLayout.tsx                # 应用布局（需添加菜单项）
│   └── services/
│       └── api.tsx                      # 通用 API 客户端
└── tests/
    ├── pages/stores/                    # 门店页面测试
    └── e2e/                             # E2E 测试
```

**Structure Decision**:
- 后端采用分层架构（Controller → Service → Repository），Repository 层通过 WebClient 调用 Supabase REST API
- 前端采用 feature-based 模块化架构，门店管理为独立的 page module
- 前后端数据模型完全对齐，使用相同的字段命名和类型定义

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无宪法原则违反。本功能完全遵循项目宪法的所有要求。

## Phase 0: Research & Decisions

*Output: `research.md`*

### Research Tasks

本阶段需要研究和决策以下技术点：

1. **Spring Boot 与 Supabase REST API 集成模式**
   - 研究 WebClient vs RestTemplate 的选择
   - 研究 Supabase REST API 的过滤、排序语法
   - 研究超时、重试、错误处理策略

2. **前后端枚举值一致性策略**
   - 研究 Java Enum 与 TypeScript 枚举的映射方案
   - 研究 Jackson @JsonValue/@JsonCreator 用于枚举序列化
   - 研究前端枚举值大小写一致性（active vs ACTIVE）

3. **前端门店列表前端分页方案**
   - 研究 Ant Design Table 前端分页最佳实践
   - 研究一次性加载 vs 分批加载的性能权衡
   - 研究搜索筛选与分页的交互方式

4. **API 响应结构标准化**
   - 研究统一响应格式（{ success, data, message, code }）
   - 研究分页响应结构（{ data, total }）
   - 研究错误响应结构

5. **测试策略**
   - 研究 Spring Boot Test 与 MockWebServer 模拟 Supabase
   - 研究前端 MSW 模拟后端 API
   - 研究集成测试覆盖关键路径

## Phase 1: Design & Contracts

*Output: `data-model.md`, `contracts/*.yaml`, `quickstart.md`*

### Data Model Design

将在 `data-model.md` 中详细定义：

1. **Store（门店）实体**
   - 数据库表：`stores`
   - 后端 Domain 模型：`Store.java`
   - 后端 DTO：`StoreDTO.java`
   - 前端类型：`Store` interface
   - 字段：id, code, name, region, status, createdAt, updatedAt

2. **Hall（影厅）实体**
   - 数据库表：`halls`
   - 后端 Domain 模型：`Hall.java`
   - 后端 DTO：`HallDTO.java`
   - 前端类型：`Hall` interface
   - 字段：id, storeId, code, name, type, capacity, tags, status, createdAt, updatedAt

3. **Store-Hall 关系**
   - 关系类型：一对多（一个 Store 拥有多个 Hall）
   - 实现方式：Hall 表中的 storeId 外键
   - 查询模式：通过 storeId 过滤 halls

### API Contracts

将在 `contracts/` 目录生成 OpenAPI 规范：

1. **GET /api/stores** - 查询门店列表
   - Query参数：status（可选）
   - 响应：`{ success: boolean, data: Store[], total: number, message: string, code: number }`

2. **GET /api/stores/{storeId}/halls** - 按门店查询影厅列表
   - Path参数：storeId（UUID）
   - Query参数：status（可选）, type（可选）
   - 响应：`{ data: Hall[], total: number }`

3. **GET /api/halls** - 查询所有影厅
   - Query参数：status（可选）, type（可选）
   - 响应：`{ success: boolean, data: Hall[], total: number, message: string, code: number }`

### Quickstart Guide

将在 `quickstart.md` 中提供：
- 后端启动步骤（配置 Supabase 连接、运行 Spring Boot）
- 前端启动步骤（安装依赖、启动开发服务器）
- 数据初始化（创建测试门店和影厅）
- 关键 API 测试命令

## Phase 2: Task Breakdown

*Output: Generated by `/speckit.tasks` command (not by `/speckit.plan`)*

任务分解将在执行 `/speckit.tasks` 命令时完成，预期包括：

1. **后端任务**
   - 创建 Supabase 数据表
   - 实现 Domain 模型和 DTO
   - 实现 Repository 层（Supabase REST API 调用）
   - 实现 Service 层
   - 实现 Controller 层
   - 编写单元测试和集成测试

2. **前端任务**
   - 创建门店管理页面
   - 实现门店列表组件（Table、Search、Filter）
   - 实现 TanStack Query hooks
   - 在影厅资源页面添加门店筛选器
   - 更新路由和菜单
   - 编写单元测试和 E2E 测试

3. **集成任务**
   - 前后端联调
   - 端到端测试
   - 性能测试
   - 文档更新
