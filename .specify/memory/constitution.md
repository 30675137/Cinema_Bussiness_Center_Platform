<!-- Sync Impact Report -->
<!-- Version change: 1.5.0 → 1.6.0 -->
<!-- Modified principles:
  - 功能分支绑定 (Feature Branch Binding) - 更新规格编号格式从 ###-<slug> 改为 X###-<slug>
-->
<!-- Added sections:
  - 规格编号与模块映射规范 (Spec Numbering & Module Mapping Standards) - 新增模块字母编码规则
-->
<!-- Removed sections: None -->
<!-- Templates requiring updates:
  ⚠ .specify/templates/spec-template.md (需要更新分支名格式占位符)
  ⚠ .specify/templates/plan-template.md (需要检查分支名引用)
  ⚠ .specify/templates/tasks-template.md (需要检查分支名引用)
  ⚠ .specify/scripts/bash/create-new-feature.sh (需要重写编号生成逻辑)
-->
<!-- Follow-up TODOs:
  1. 迁移现有 specs 目录中的旧格式(###)到新格式(X###)
  2. 更新所有相关脚本以支持模块字母前缀
  3. 为现有 specs 分配合适的模块字母
-->

# 影院商品管理中台宪法

## 核心原则

### 一、功能分支绑定 (Feature Branch Binding)

每个功能开发必须严格绑定到唯一的规格标识符(specId)。分支命名采用 `feat/<specId>-<slug>` 格式,其中 specId 由**模块字母+三位数字**组成(如 S001、P012、A005)。规格文档存放于 `specs/<specId>-<slug>/spec.md`。系统通过 `.specify/active_spec.txt` 维护当前激活规格的引用。当前 git 分支名中的 specId 必须等于 active_spec 指向路径中的 specId,AI 只允许在"当前分支 + active_spec"范围内修改内容。任何不匹配必须先修正绑定(改分支名或 active_spec),再继续实现。

**规格编号格式**: `X###-<slug>`,其中:
- `X`: 单个大写字母,表示功能所属的业务模块(见下方模块映射表)
- `###`: 三位数字,在模块内递增编号(001-999)
- `<slug>`: 功能简短描述,使用小写字母和连字符,2-4个单词

**模块字母映射**:
- **S**: 门店/影厅管理 (Store/Hall Management)
- **P**: 商品/库存管理 (Product/Inventory Management)
- **B**: 品牌/分类管理 (Brand/Category Management)
- **A**: 活动/场景包管理 (Activity/Scenario Package Management)
- **U**: 用户/预订管理 (User/Reservation Management)
- **T**: 工具/基础设施 (Tool/Infrastructure)
- **F**: 前端基础 (Frontend Infrastructure)

**示例**:
- `S001-store-crud` - 门店CRUD功能
- `P012-inventory-management` - 库存管理
- `A005-scenario-package-tabs` - 场景包多标签页编辑

**基本原理**: 确保每个功能都有明确的规格定义和唯一的开发分支,通过模块字母前缀清晰区分功能所属的业务域,避免功能冲突和开发混乱,保证代码变更的可追溯性和规格的一致性。模块化编号便于快速识别功能归属,支持按模块并行开发和独立演进。

### 二、测试驱动开发 (Test-Driven Development)

测试先行的开发策略是强制性的。所有功能必须先编写测试用例,确保测试失败后再实现功能代码。严格遵循 Red-Green-Refactor 循环:先写测试(Red),实现最小可行代码使测试通过(Green),然后重构优化(Refactor)。使用 Playwright 进行端到端测试,Vitest 进行单元测试,确保关键业务流程的测试覆盖率达到 100%。

**基本原理**: 测试先行保证功能需求的明确性和代码设计的正确性,通过自动化测试确保代码质量和回归预防,提高代码的可维护性和系统的稳定性。

### 三、组件化架构 (Component-Based Architecture)

系统采用原子设计理念的分层组件架构:原子组件(Atoms)、分子组件(Molecules)、有机体(Organisms)、模板(Templates)和页面(Pages)。所有组件必须遵循单一职责原则,具有清晰的 Props 接口定义和 TypeScript 类型注解。使用 React.memo、useMemo、useCallback 进行性能优化,避免不必要的重渲染。

**B端(管理后台)** 使用 React + Ant Design 技术栈进行开发,侧重于复杂数据展示和管理操作。

**C端(客户端/小程序)** 使用 Taro 框架进行开发,确保多端统一(微信小程序、H5、App等),侧重于用户体验和跨平台兼容性。

**基本原理**: 组件化架构确保代码的可复用性、可维护性和可测试性,通过清晰的组件层次和性能优化策略,构建高效的用户界面系统。针对不同端的特性选择合适的技术栈,B端注重功能完整性和数据处理能力,C端注重多端兼容和用户体验。

### 四、前端技术栈分层 (Frontend Tech Stack Layering)

项目前端开发必须明确区分B端(管理后台)和C端(客户端/用户端)的技术栈选择,不得混用:

**B端管理后台技术栈**:
- 框架:React 19.2.0 + TypeScript 5.9.3
- UI 组件库:Ant Design 6.1.0
- 状态管理:Zustand 5.0.9(客户端状态)+ TanStack Query 5.90.12(服务器状态)
- 路由:React Router 7.10.1
- Mock 数据:MSW 2.12.4
- 表单处理:React Hook Form 7.68.0 + Zod 4.1.13(数据验证)
- 构建工具:Vite 6.0.7
- 适用场景:复杂数据管理、多表格操作、权限控制、后台管理系统

**C端客户端技术栈**:
- 框架:**Taro 框架**(多端统一开发框架)
- UI 组件库:Taro UI 或其他 Taro 兼容的 UI 组件库
- 状态管理:根据 Taro 最佳实践选择(Redux、Zustand 等)
- 目标平台:微信小程序、支付宝小程序、H5、React Native 等多端
- 适用场景:用户预订、商品浏览、个人中心、移动端体验优化

**技术栈选择原则**:
- 所有新开发的 C端 功能(小程序、H5、移动应用)**必须**使用 Taro 框架
- 禁止在 C端 项目中使用 B端 技术栈(如直接使用 Ant Design 而非 Taro 兼容组件)
- 现有非 Taro 实现的 C端 项目应逐步迁移至 Taro 框架
- B端 和 C端 可共享业务逻辑层(TypeScript 工具函数、数据模型定义、API 接口类型)

**基本原理**: 明确的技术栈分层避免技术选型混乱和跨端兼容性问题。B端技术栈专注于企业级管理能力和复杂交互,C端技术栈通过 Taro 框架实现"一次编写,多端运行",降低维护成本,提高开发效率,确保用户端体验的一致性。

### 五、数据驱动与状态管理 (Data-Driven & State Management)

使用 Zustand 管理客户端状态,TanStack Query 管理服务器状态,实现数据与 UI 的分离。所有 API 数据获取必须通过 TanStack Query 进行,利用其缓存、重试、后台刷新等特性。本地数据持久化使用 localStorage(B端)或平台特定存储 API(C端 Taro 项目中使用 Taro.setStorage/getStorage)。Mock 数据使用 MSW(Mock Service Worker)进行模拟。状态变更必须是可预测和可追踪的。

**基本原理**: 数据驱动的方法确保应用状态的一致性和可预测性,通过专业的状态管理工具和缓存策略,提供流畅的用户体验和可靠的数据处理能力。

### 六、代码质量与工程化 (Code Quality & Engineering Excellence)

遵循严格的代码规范和质量标准。使用 TypeScript 5.9.3 确保前端类型安全,
ESLint + Prettier 确保代码风格一致性,Husky + lint-staged 确保提交质量。
后端必须使用现代 Java 版本与 Spring Boot 框架,并遵循一致的编码规范、
日志规范和异常处理规范。所有 Java 代码在关键领域类、公共方法以及复杂业
务分支处必须编写**清晰、准确且有意义的注释**,说明领域含义、边界条件以及
与 Supabase 或外部系统交互的意图,禁止堆砌无信息量的"废话注释"。所有代码
必须通过静态分析、单元测试和集成测试。遵循 Git 提交规范(Conventional
Commits),使用语义化版本控制。代码审查必须检查功能实现、边界情况处理、
性能考虑、测试覆盖、安全考虑以及关键 Java 代码是否具备足够的注释可读性。

**基本原理**: 高标准的工程化实践确保代码质量、团队协作效率和项目的长期
可维护性,通过自动化工具和规范流程减少人为错误,提升开发效率。

## 后端架构与技术栈

### Spring Boot + Supabase 统一后端栈

后端服务必须使用 **Spring Boot** 作为主要应用框架,通过 **Supabase**
提供客户端 SDK 访问数据和后端能力(PostgreSQL 数据库、认证、
存储等)。禁止在同一服务中引入额外的数据库访问层(例如直接连接其他
数据库实例)绕过 Supabase,除非在规格和架构评审中获得明确批准并记录
在相关 feature 的 `data-model.md` 中。

所有持久化数据模型和权限规则应以 Supabase 为单一事实来源,Spring Boot
负责业务编排、领域逻辑和 API 暴露。对 Supabase 的调用必须有清晰的错误
处理、超时控制和重试/降级策略,并通过集成测试覆盖关键路径。

**基本原理**: 统一的后端技术栈(Spring Boot + Supabase)可以显著降低
架构复杂度和运维成本,避免多种数据源和框架并存导致的耦合和不一致,
同时利用 Supabase 托管能力加速开发,Spring Boot 聚焦业务逻辑和接口层。

### C端开发技术栈 (Client-Side Development Tech Stack)

所有面向最终用户的 C端 应用(小程序、H5、移动应用)必须使用 **Taro 框架** 进行开发。

**技术要求**:
- 使用 Taro 3.x 或更高版本(保持与官方稳定版本同步)
- 遵循 Taro 官方文档的最佳实践和开发规范
- 组件库选择必须兼容 Taro 多端编译能力(推荐 Taro UI、NutUI 等)
- 状态管理优先选择 Zustand 或 Redux(确保与 Taro 兼容)
- API 请求统一使用 Taro.request 封装,支持 Token 管理和错误处理
- 样式编写遵循 Taro 样式规范(支持 rpx/px 单位,避免使用不兼容的 CSS 特性)

**多端适配要求**:
- 新功能必须至少支持**微信小程序**和 **H5** 两端
- 使用 Taro 条件编译处理平台差异(process.env.TARO_ENV)
- 不得使用仅在单一平台可用的 API,必须使用 Taro 统一 API 或做兼容处理

**项目结构要求**:
- C端 项目代码应独立存放于 `client/` 或 `miniprogram/` 目录
- 与 B端 管理后台(`frontend/`)和后端(`backend/`)清晰分离
- 可与后端共享 TypeScript 类型定义(通过 workspace 或 package 引用)

**禁止行为**:
- 禁止在 C端 项目中直接引入 Ant Design、Element UI 等非 Taro 兼容的 UI 库
- 禁止使用浏览器专属 API(如 window、document)而不进行平台判断和兼容处理
- 禁止绕过 Taro 框架直接编写原生小程序代码(除非经架构评审批准并记录)

**基本原理**: Taro 框架提供了成熟的多端统一开发方案,显著降低跨平台开发和维护成本。通过统一的技术栈和开发规范,确保 C端 应用在不同平台上的体验一致性、代码可维护性和团队协作效率。强制使用 Taro 避免技术碎片化和平台迁移困难。

### API 响应格式标准化

所有后端 REST API 接口必须遵循统一的响应格式规范,确保前后端集成的一致性和可维护性。

**统一响应格式要求**:

1. **成功响应格式**:
   - 单个资源:使用 `ApiResponse<T>` 包装,格式为 `{ data: T, timestamp: string }`
   - 列表查询:使用统一的列表响应格式,必须包含 `{ success: boolean, data: T[], total: number, message?: string, code?: number }`
   - 所有成功响应必须包含明确的 `success: true` 字段(或通过 HTTP 状态码 2xx 表示成功)

2. **错误响应格式**:
   - 使用 `ApiResponse` 的 `failure()` 方法或 `ErrorResponse` 结构
   - 必须包含 `{ success: false, error: string, message: string, details?: object }`
   - HTTP 状态码必须正确反映错误类型(400/404/409/500 等)

3. **格式一致性要求**:
   - 同一功能域内的所有接口必须使用相同的响应格式
   - 列表查询接口(如 `GET /api/stores`、`GET /api/stores/{id}/halls`)必须统一格式
   - 禁止在同一 Controller 中混用不同的响应格式(如 `Map.of()` 和 `ApiResponse`)

4. **前后端契约对齐**:
   - 所有 API 接口必须在 `contracts/api.yaml` 中明确定义响应格式
   - 前端类型定义(TypeScript interfaces)必须与后端实际返回格式完全一致
   - 前后端开发前必须对齐 API 契约,禁止"先实现后适配"

5. **类型安全**:
   - 后端 DTO 中的可选字段(如 `region: string | null`)必须在类型定义中明确标注
   - 前端类型定义必须准确反映后端实际返回的数据结构(包括 null 值处理)

**基本原理**: 统一的 API 响应格式可以显著降低前后端集成成本,避免因格式不一致导致的解析错误和重复适配工作。明确的格式规范有助于提高代码可维护性、减少调试时间,并确保前后端类型定义的一致性。

**参考问题**: 见 `docs/问题总结/014-API响应格式不一致问题.md`

### API 测试规范 (API Testing Standards)

涉及 API 开发的功能必须提供 Postman 测试脚本,确保 API 契约的完整性验证和团队协作效率。

**Postman 测试脚本规范**:

1. **文件存放位置**:
   - Postman Collection 文件必须存放在对应的 spec 文件夹下
   - 路径格式:`specs/<specId>-<slug>/postman/`
   - 示例:`specs/S019-store-association/postman/`

2. **文件命名规范**:
   - Collection 文件名必须包含 spec 标识符
   - 格式:`<specId>-<feature-name>.postman_collection.json`
   - 示例:`S019-store-association.postman_collection.json`
   - Environment 文件格式:`<specId>-<env>.postman_environment.json`
   - 示例:`S019-local.postman_environment.json`

3. **测试覆盖要求**:
   - 必须覆盖功能涉及的所有 API 端点(CRUD 操作)
   - 每个请求必须包含描述说明和预期行为
   - 必须包含 Tests 脚本验证响应状态码和关键字段
   - 应包含 Pre-request Scripts 实现测试数据准备(如适用)

4. **环境变量要求**:
   - 必须提供至少本地开发环境配置
   - 使用环境变量引用(`{{baseUrl}}`、`{{token}}` 等)
   - 禁止在 Collection 中硬编码敏感信息

**基本原理**: Postman 测试脚本作为 API 契约的可执行验证工具,与 spec 文件统一管理可确保文档和测试的一致性,便于团队成员快速理解和验证 API 行为,支持 CI/CD 集成和开发联调。

## 开发工作流

### 规格驱动开发 (Specification-Driven Development)

所有功能开发必须基于完整的规格文档。规格文档包含用户场景、验收标准、功能需求、关键实体、成功标准等核心内容。开发前必须仔细阅读和理解规格,确保实现与规格一致。规格文档中的所有功能需求(FR-*)和成功标准(SC-*)都必须在实现中得到验证和满足。

### 分支管理策略 (Branch Management Strategy)

采用功能分支开发模式,每个功能对应独立的开发分支。分支命名严格遵循 `feat/<specId>-<slug>` 格式,其中 specId 使用新的**模块字母+三位数字**格式(如 S001、P012)。开发完成后通过 Pull Request 进行代码审查,审查通过后合并到主分支。禁止直接在主分支进行开发,确保代码质量和变更的可追溯性。

### 持续集成与质量门禁 (Continuous Integration & Quality Gates)

建立完整的质量门禁体系,包括代码规范检查、类型检查、单元测试、集成测试、端到端测试等。所有质量检查必须通过后才能合并代码。使用自动化工具确保质量标准的执行,减少人工审查的工作量和主观性。

## 质量标准

### 性能标准 (Performance Standards)

应用启动时间不超过 3 秒,页面切换响应时间不超过 500 毫秒,数据列表加载支持虚拟滚动优化。必须进行性能监控,使用 Web Vitals 指标评估用户体验。大型数据列表必须使用虚拟滚动或分页加载,避免页面卡顿。

对于 C端 Taro 项目,还需额外关注:
- 小程序包体积优化(主包 < 2MB,分包合理拆分)
- 首屏渲染时间 < 1.5 秒
- 列表滚动流畅度(FPS ≥ 50)

### 安全标准 (Security Standards)

前端必须有完善的输入验证和数据清理机制,使用 Zod 进行数据验证。防止 XSS 攻击,避免在前端存储敏感信息。API 请求必须包含适当的认证和授权机制,处理 Token 过期和刷新逻辑。

C端 项目还需注意:
- 敏感数据不得存储在本地存储(使用加密或服务端存储)
- 小程序中避免明文传输用户隐私信息
- 遵守平台安全规范(微信小程序、支付宝小程序等)

### 可访问性标准 (Accessibility Standards)

遵循 WCAG 2.1 AA 级别的可访问性标准,确保键盘导航、屏幕阅读器支持、色彩对比度等要求。所有交互元素必须有明确的焦点指示和语义化的 HTML 结构。

## 治理规则

本宪法作为项目开发的最高指导原则,所有开发活动和代码审查都必须验证其
合规性。任何对宪法的修改都必须通过团队讨论和批准,并更新版本号。版本
控制遵循语义化版本规则:主版本号(重大变更或不兼容的修改)、次版本号
(新功能添加)、修订号(错误修复和澄清)。

当开发实践与宪法原则发生冲突时,应以宪法原则为准,必要时通过正式流程
修订宪法。团队成员都有责任维护宪法的执行,确保项目的长期健康发展。

**版本**: 1.6.0 | **制定日期**: 2025-12-14 | **最后修订**: 2025-12-23
