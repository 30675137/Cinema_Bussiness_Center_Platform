<!-- Sync Impact Report -->
<!-- Version change: 1.15.0 → 1.15.1 -->
<!-- Modified principles:
  - 十、Lark PM 项目管理集成规则: 新增 R11.5 API 记录规则
  - R11.4 禁止行为: 新增"禁止新增 API 后不记录到 API 表"
-->
<!-- Added sections:
  - R11.5 API 记录规则 - 新增 (v1.15.1)
-->
<!-- Removed sections: None -->
<!-- Templates requiring updates:
  ✅ .specify/memory/constitution.md (v1.15.1 - 新增 API 记录规则)
  ✅ .claude/skills/lark-pm/skill.md (规则与宪法对齐)
-->
<!-- Follow-up TODOs:
  1. 确保所有 Phase 执行时遵循 Lark PM 状态同步规则
  2. 验证 Lark PM Base App Token 配置正确
  3. 新增 API 时记录到 API 表
-->

# 影院商品管理中台宪法

## 核心原则

### 一、功能分支绑定 (Feature Branch Binding)

每个功能开发必须严格绑定到唯一的规格标识符(specId)。分支命名采用 `feat/<specId>-<slug>` 格式,其中 specId 由**模块字母+三位数字**组成(如 S001、P012、A005)。规格文档存放于 `specs/<specId>-<slug>/spec.md`。系统通过 `.specify/active_spec.txt` 维护当前激活规格的引用。当前 git 分支名中的 specId 必须等于 active_spec 指向路径中的 specId,AI 只允许在"当前分支 + active_spec"范围内修改内容。任何不匹配必须先修正绑定(改分支名或 active_spec),再继续实现。

**规格编号格式**: `X###-<slug>`,其中:
- `X`: 单个大写字母,表示功能所属的模块(见下方模块映射表)
- `###`: 三位数字,在模块内递增编号(001-999)
- `<slug>`: 功能简短描述,使用小写字母和连字符,2-4个单词

**模块选择优先级原则**:
1. **业务功能优先**: 如果开发的是业务功能(如库存管理、订单处理、门店配置),必须使用对应的业务模块字母(A, B, C, D, E, I, M, N, O, P, R, S, U, Y)
2. **技术基础设施同样强制**: 如果开发的是技术基础设施(如 Claude Code skills、脚本工具、UI 组件库、技术优化),**必须**使用技术模块字母(T, F)
3. **禁止混用**: 不得将业务功能编码为技术模块,也不得将技术基础设施编码为业务模块

**模块字母映射** (完整版):

#### 业务功能模块

| 字母 | 模块名称 | 英文全称 | 适用范围 | 示例 |
|------|---------|---------|---------|------|
| **A** | 活动/场景包管理 | Activity/Scenario Package Management | 场景包、套餐、活动配置 | A005-scenario-package |
| **B** | 品牌/分类/BOM管理 | Brand/Category/BOM Management | 品牌、类目、物料配方 | B001-brand-management |
| **C** | 配置/基础设置 | Config/Settings | 组织、字典、参数配置 | C001-organization-config |
| **D** | 工作台/首页 | Dashboard | 首页、工作台、概览 | D001-dashboard-overview |
| **E** | 报表/数据分析 | rEport/Analytics | 运营报表、指标看板 | E001-sales-report |
| **I** | 库存管理 | Inventory Management | 库存查询、调整、盘点 | I003-inventory-query |
| **M** | 物料/BOM管理 | Materials/BOM Management | 原料库、配方、成本 | M001-material-master |
| **N** | 采购/入库管理 | iNbound/Procurement | 采购订单、收货入库 | N001-purchase-order |
| **O** | 订单管理 | Order Management | 商品订单、饮品订单 | O003-beverage-order |
| **P** | 商品管理 | Product Management | SPU/SKU、商品主数据 | P001-spu-management |
| **R** | 价格体系管理 | pRicing Management | 价目表、价格规则 | R001-price-list |
| **S** | 门店/影厅/档期管理 | Store/Hall/Schedule Management | 门店、影厅、排期 | S014-store-management |
| **U** | 用户/预订管理 | User/Reservation Management | 用户、预约、核销 | U001-reservation-orders |
| **Y** | 系统管理 | sYstem Management | 用户、权限、审计日志 | Y001-user-management |

#### 技术基础设施模块 (强制编码)

| 字母 | 模块名称 | 英文全称 | 适用范围 | 示例 |
|------|---------|---------|---------|------|
| **T** | 工具/基础设施 | Tool/Infrastructure | **Claude Code skills**、E2E 测试工具、脚本开发、技术优化、自动化工具 | T002-e2e-test-generator, T005-test-scenario-author |
| **F** | 前端基础 | Frontend Infrastructure | UI 组件库、布局系统、样式框架、前端工程化工具 | F001-ui-components, F002-design-system |

**技术基础设施模块编码要求**:
- **T 模块 (Tool/Infrastructure)**: 所有 Claude Code skills 开发、脚本编写、技术优化项目**必须**使用 `T###` 编码
- **F 模块 (Frontend Infrastructure)**: 所有前端基础设施开发(UI 库、设计系统、前端工具)**必须**使用 `F###` 编码
- **强制性**: 技术基础设施模块的编码要求与业务功能模块同等强制,不得省略或使用其他编码方式

**模块选择决策树**:

1. **首先判断开发类型**:
   - 是否为 **Claude Code skill** 开发? → 使用 `T###` (Tool/Infrastructure)
   - 是否为 **脚本工具、技术优化、自动化工具**? → 使用 `T###` (Tool/Infrastructure)
   - 是否为 **前端基础设施**(UI 组件库、设计系统、工程化工具)? → 使用 `F###` (Frontend Infrastructure)
   - 是否为 **业务功能**? → 继续下一步

2. **业务功能模块选择**:
   - 库存相关 → `I###` (Inventory)
   - 商品管理 → `P###` (Product)
   - 品牌/分类 → `B###` (Brand)
   - 门店/影厅 → `S###` (Store)
   - 订单管理 → `O###` (Order)
   - 用户/预订 → `U###` (User)
   - 场景包/活动 → `A###` (Activity)
   - [其他业务模块参照映射表]

3. **避免冲突**:
   - ✅ 正确: 库存功能使用 `I###` (Inventory),商品功能使用 `P###` (Product)
   - ✅ 正确: Claude Code skill 使用 `T002-e2e-test-generator`
   - ❌ 错误: 库存功能使用 `P###` (会与商品管理混淆)
   - ❌ 错误: skill 开发不使用 `T###` 编码

4. **编号分配**: 同一模块内编号递增(如 I001, I002, I003; T001, T002, T003)

5. **跨模块功能**: 选择主要业务领域的模块前缀

**编码示例**:

业务功能模块:
- `S001-store-crud` - 门店 CRUD 功能 (Store 模块)
- `I003-inventory-query` - 库存查询 (Inventory 模块)
- `P001-spu-management` - SPU 管理 (Product 模块)
- `B001-brand-management` - 品牌管理 (Brand 模块)
- `A005-scenario-package-tabs` - 场景包多标签页编辑 (Activity 模块)
- `O003-beverage-order` - 饮品订单管理 (Order 模块)

技术基础设施模块:
- `T001-e2e-scenario-author` - E2E 测试场景生成 skill (Tool 模块)
- `T002-e2e-test-generator` - E2E 测试脚本生成器 (Tool 模块)
- `T005-test-scenario-author` - 测试场景编写工具 (Tool 模块)
- `T006-e2e-report-configurator` - E2E 报告配置器 (Tool 模块)
- `F001-ui-components` - UI 组件库开发 (Frontend 模块)
- `F002-design-system` - 设计系统实现 (Frontend 模块)

**基本原理**: 确保每个功能都有明确的规格定义和唯一的开发分支,通过模块字母前缀清晰区分功能所属的业务域或技术领域,避免功能冲突和开发混乱,保证代码变更的可追溯性和规格的一致性。模块化编号便于快速识别功能归属,支持按模块并行开发和独立演进。扩展的16个模块字母覆盖了系统的全部业务领域(14个)和技术基础设施(2个),消除了模块归属的歧义性,为大型项目的长期演进提供了清晰的组织结构。**技术基础设施模块(T, F)与业务功能模块享有同等的编码强制性**,确保技术工具、Claude Code skills、前端基础设施开发同样具备完整的规格文档和可追溯性。

### 二、代码归属标识 (Code Attribution Marking)

所有新增或修改的代码文件必须在文件头部明确标识其所属的规格标识符(specId),确保代码与功能规格的可追溯性。

**标识要求**:

1. **文件头部注释格式**:
   - TypeScript/JavaScript 文件:使用 `/** @spec <specId> */` 或 `// @spec <specId>` 注释
   - Java 文件:使用 `/** @spec <specId> */` JavaDoc 注释
   - CSS/SCSS 文件:使用 `/* @spec <specId> */` 注释
   - 注释必须放在文件开头(license 头之后,import 语句之前)

2. **标识内容**:
   - 必须包含完整的 specId(如 `I003-inventory-query`)
   - 可选:添加简短的功能描述
   - 可选:添加相关规格文档路径

3. **示例**:

```typescript
/**
 * @spec I003-inventory-query
 * 库存查询功能 - 商品库存列表组件
 * Spec: specs/I003-inventory-query/spec.md
 */
import React from 'react';
// ... rest of the code
```

```java
/**
 * @spec S019-store-association
 * 门店关联管理 - 影厅关联服务层
 * @see specs/S019-store-association/spec.md
 */
@Service
public class StoreAssociationService {
    // ... implementation
}
```

4. **共享代码处理**:
   - 对于被多个 spec 共享的工具类/组件,可标识多个 spec:`@spec I003,I004`
   - 对于基础设施代码(不属于特定功能),使用 `@spec T###` 或 `@spec F###`
   - 对于第三方依赖和框架代码,无需添加标识

5. **强制要求**:
   - 所有新增的业务逻辑文件(页面、组件、服务、控制器等)必须包含 `@spec` 标识
   - 代码审查时必须检查归属标识的完整性和正确性
   - 修改现有文件时,如文件无标识,应添加对应的 spec 标识
   - 跨 spec 修改时,应在 commit message 中说明涉及的所有 spec

**基本原理**: 代码归属标识建立了代码文件与功能规格之间的直接关联,显著提高代码的可追溯性和可维护性。通过明确的归属关系,开发者可以快速定位功能的规格文档、理解代码的业务背景、评估变更的影响范围,同时便于代码审查、依赖分析和重构决策。这一实践确保了"规格驱动开发"理念在代码层面的落地,避免孤立代码和规格文档脱节的问题。

### 三、测试驱动开发 (Test-Driven Development)

测试先行的开发策略是强制性的。所有功能必须先编写测试用例,确保测试失败后再实现功能代码。严格遵循 Red-Green-Refactor 循环:先写测试(Red),实现最小可行代码使测试通过(Green),然后重构优化(Refactor)。

**测试策略与覆盖率要求**:

1. **强制测试类型**:
   - **单元测试(Unit Tests)**: 必须使用 Vitest 进行单元测试,测试覆盖工具函数、业务逻辑、组件行为
   - **集成测试(Integration Tests)**: 必须测试模块间交互、API 调用、数据流转

2. **可选测试类型**:
   - **端到端测试(E2E Tests)**: 使用 Playwright 进行端到端测试为**可选策略**,不强制要求每个 spec 都编写 E2E 测试
   - **建议编写 E2E 测试的场景**: 关键业务流程(如支付流程、订单创建)、复杂用户交互(如多步骤表单)、跨模块集成场景

3. **覆盖率标准**:
   - 关键业务逻辑的单元测试覆盖率: **100%**(强制)
   - 工具函数测试覆盖率: ≥ 80%
   - 组件测试覆盖率: ≥ 70%
   - E2E 测试覆盖率: 无强制要求,由团队根据功能重要性和风险评估决定

4. **测试框架与工具**:
   - **单元测试**: Vitest(前端)、JUnit(后端)
   - **集成测试**: MSW(API Mock)、Supertest(后端 API 测试)
   - **E2E 测试**(可选): Playwright(B端)、微信开发者工具(C端小程序)

**基本原理**: 测试先行保证功能需求的明确性和代码设计的正确性,通过自动化测试确保代码质量和回归预防,提高代码的可维护性和系统的稳定性。强制单元测试和集成测试确保代码逻辑的正确性,而将 E2E 测试设为可选策略,允许团队根据功能特点、风险评估和资源情况灵活决定是否编写,避免过度测试增加开发成本。对于关键业务流程,仍建议编写 E2E 测试以确保用户体验的完整性。

### 四、组件化架构 (Component-Based Architecture)

系统采用原子设计理念的分层组件架构:原子组件(Atoms)、分子组件(Molecules)、有机体(Organisms)、模板(Templates)和页面(Pages)。所有组件必须遵循单一职责原则,具有清晰的 Props 接口定义和 TypeScript 类型注解。使用 React.memo、useMemo、useCallback 进行性能优化,避免不必要的重渲染。

**B端(管理后台)** 使用 React + Ant Design 技术栈进行开发,侧重于复杂数据展示和管理操作。

**C端(客户端/小程序)** 使用 Taro 框架进行开发,确保多端统一(微信小程序、H5、App等),侧重于用户体验和跨平台兼容性。

**基本原理**: 组件化架构确保代码的可复用性、可维护性和可测试性,通过清晰的组件层次和性能优化策略,构建高效的用户界面系统。针对不同端的特性选择合适的技术栈,B端注重功能完整性和数据处理能力,C端注重多端兼容和用户体验。

### 五、前端技术栈分层 (Frontend Tech Stack Layering)

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

### 六、数据驱动与状态管理 (Data-Driven & State Management)

使用 Zustand 管理客户端状态,TanStack Query 管理服务器状态,实现数据与 UI 的分离。所有 API 数据获取必须通过 TanStack Query 进行,利用其缓存、重试、后台刷新等特性。本地数据持久化使用 localStorage(B端)或平台特定存储 API(C端 Taro 项目中使用 Taro.setStorage/getStorage)。Mock 数据使用 MSW(Mock Service Worker)进行模拟。状态变更必须是可预测和可追踪的。

**基本原理**: 数据驱动的方法确保应用状态的一致性和可预测性,通过专业的状态管理工具和缓存策略,提供流畅的用户体验和可靠的数据处理能力。

### 七、代码质量与工程化 (Code Quality & Engineering Excellence)

遵循严格的代码规范和质量标准。使用 TypeScript 5.9.3 确保前端类型安全,
ESLint + Prettier 确保代码风格一致性,Husky + lint-staged 确保提交质量。
后端必须使用 **Java 17** 与 Spring Boot 3.x 框架,并遵循一致的编码规范、
日志规范和异常处理规范。项目必须配置使用 Java 17 进行编译和运行,禁止
使用其他 Java 版本(如 Java 21、Java 23)以确保环境一致性和依赖兼容性。
所有 Java 代码在关键领域类、公共方法以及复杂业务分支处必须编写**清晰、
准确且有意义的注释**,说明领域含义、边界条件以及与 Supabase 或外部系统
交互的意图,禁止堆砌无信息量的"废话注释"。所有代码必须通过静态分析、
单元测试和集成测试。遵循 Git 提交规范(Conventional Commits),使用语义化
版本控制。代码审查必须检查功能实现、边界情况处理、性能考虑、测试覆盖、
安全考虑、代码归属标识(`@spec`)的完整性以及关键 Java 代码是否具备足够
的注释可读性。

**基本原理**: 高标准的工程化实践确保代码质量、团队协作效率和项目的长期
可维护性,通过自动化工具和规范流程减少人为错误,提升开发效率。统一使用
Java 17 避免不同 Java 版本之间的兼容性问题、SSL/TLS 协议差异和运行时
行为不一致,确保开发、测试和生产环境的一致性。

### 八、Claude Code Skills 开发规范 (Claude Code Skills Development Standards)

当创建 Claude Code skill(即通过 Claude Code CLI 调用的命令行工具扩展)时,必须遵循特定的规格文档结构和开发规范,确保 skill 的可维护性、可发现性和团队协作效率。

**Skill Spec 识别**:
- 所有创建 Claude Code skill 的规格必须使用 `T###` 模块前缀(Tool/Infrastructure)
- Spec 标题必须明确标注"Claude Code skill"或"skill"关键词
- 示例:`T001-e2e-scenario-author`, `T002-api-test-generator`

**强制文档要求**:

1. **skill.md 文件**:
   - 位置: `.claude/skills/<skill-name>/skill.md`
   - 内容: Skill 的完整功能说明、命令参数、使用示例、工作流程
   - 必须包含 `@spec T###` 归属标识

2. **spec.md 文件**:
   - 位置: `specs/T###-<skill-name>/spec.md`
   - 内容: 用户故事、功能需求、验收标准、成功指标
   - 必须包含明确的 skill 调用方式说明(如 `/scenario-author create`)

3. **data-model.md 文件**:
   - 位置: `specs/T###-<skill-name>/data-model.md`
   - 内容: Skill 处理的数据模型定义(如 YAML schema, JSON schema)
   - 必须包含数据验证规则和约束条件

4. **quickstart.md 文件**:
   - 位置: `specs/T###-<skill-name>/quickstart.md`
   - 内容: 快速上手指南、基本用法示例、常见问题排查
   - 必须包含完整的命令使用示例和预期输出

**Skill 实现规范**:

1. **YAML Frontmatter 要求**(强制):
   - 所有 skill.md 文件**必须**在开头包含 YAML frontmatter
   - Frontmatter 格式:
     ```yaml
     ---
     name: skill-name
     description: Detailed description with trigger keywords
     version: 1.0.0
     ---
     ```
   - `name` 字段: skill 的唯一标识符(必需)
   - `description` 字段: 详细功能说明,必须包含触发关键词(中英文)(必需)
   - `version` 字段: 遵循语义化版本规范(必需)
   - **基本原理**: YAML frontmatter 是 Claude Code 识别和加载 skill 的必要条件,缺少 frontmatter 会导致 skill 无法被系统识别和调用

2. **命令调用格式**:
   - 统一使用 `/<skill-name>` 格式(如 `/scenario-author`, `/doc-writer`)
   - 支持参数传递(如 `/scenario-author create --spec P005`)
   - 必须提供清晰的帮助文档(`/<skill-name> --help`)

3. **工作流定义**:
   - 必须在 skill.md 中明确定义对话流程或自动化流程
   - 对话式 skill 必须提供引导性问题和选项
   - 自动化 skill 必须提供详细的执行步骤说明

4. **输出规范**:
   - 生成的文件必须使用标准化命名(如 `E2E-MODULE-001.yaml`)
   - 必须提供执行结果摘要(成功/失败、生成文件列表)
   - 错误信息必须清晰说明问题和解决建议

5. **资源文件组织**:
   - 模板文件: `.claude/skills/<skill-name>/assets/templates/`
   - 参考文档: `.claude/skills/<skill-name>/references/`
   - 辅助脚本: `.claude/skills/<skill-name>/scripts/`(可选)

**验证与测试**:

1. **Skill 功能测试**:
   - 必须提供至少 3 个真实使用场景的测试用例
   - 必须验证 skill 对话流程的完整性和容错性
   - 必须验证生成文件的格式正确性和完整性

2. **文档完整性检查**:
   - 必须确保 spec.md, data-model.md, quickstart.md 三个文档齐全
   - 必须确保 skill.md 与 spec.md 中的功能描述一致
   - 必须确保所有示例代码和命令可正常执行

3. **Constitution Check 适配**:
   - Skill 开发的 Constitution Check 应标注 N/A 的规则(如组件化架构、前端技术栈等)
   - 必须保留适用的规则检查(如功能分支绑定、代码归属标识、测试驱动开发)

**禁止行为**:
- ❌ 禁止 skill.md 文件缺少 YAML frontmatter(导致 skill 无法被识别)
- ❌ 禁止创建 skill 而不编写完整的 spec 文档
- ❌ 禁止 skill.md 与 spec.md 功能描述不一致
- ❌ 禁止跳过 data-model.md 或 quickstart.md 文档
- ❌ 禁止 skill 生成的文件缺少格式验证
- ❌ 禁止 skill 功能变更后不同步更新文档

**基本原理**: Claude Code skills 作为开发工作流的自动化扩展,必须有完整的规格文档确保可维护性和可发现性。通过强制文档要求和标准化规范,团队成员可以快速理解 skill 功能、正确使用 skill 命令、贡献改进建议。明确的数据模型定义和 quickstart 指南降低 skill 的学习成本,提高开发效率。

### 九、认证与权限要求分层 (Authentication & Authorization Layering)

**核心规定**: 系统在开发阶段对认证与权限的实现要求进行分层管理,以平衡开发效率和实际业务需求。

**B端(管理后台)认证与权限策略**:

1. **当前阶段要求**:
   - B端功能开发**暂不考虑认证与权限逻辑**
   - API 接口无需实现 Token 验证、用户身份校验、角色权限控制
   - 前端组件无需实现登录状态检查、权限按钮隐藏/禁用逻辑
   - 数据访问无需基于用户身份进行过滤和限制

2. **设计考虑**:
   - 代码设计应预留权限扩展点,但无需实现具体逻辑
   - 避免硬编码"无权限"假设,使用可配置的安全策略
   - 数据模型可包含 `createdBy`、`updatedBy` 等字段,但无需强制填充

3. **后续演进**:
   - 认证与权限功能将在后续独立 spec 中统一实现
   - 届时通过 AOP、拦截器、装饰器等机制全局注入认证授权逻辑
   - 现有功能代码无需大规模重构,仅需配置权限规则

**C端(客户端/小程序)认证与权限策略**:

1. **按实际需求实现**:
   - C端功能必须根据业务实际需求实现认证与权限逻辑
   - 用户登录、身份验证、会话管理等功能按规格要求实现
   - 敏感数据访问、操作权限控制按业务规则实现

2. **实现标准**:
   - 使用平台推荐的认证方案(微信小程序登录、H5 手机号验证等)
   - Token 管理遵循平台安全规范和最佳实践
   - 敏感数据存储加密,避免明文传输用户隐私信息

3. **规格明确性**:
   - 每个 C端 功能 spec 必须明确说明认证授权需求
   - 登录流程、权限边界、会话过期处理必须在规格中定义
   - 验收标准必须包含认证授权场景的测试

**代码标识与文档要求**:

1. **B端代码注释**: 涉及权限相关逻辑的代码位置应添加注释说明"当前不实现认证授权,预留扩展点"
2. **C端规格文档**: spec.md 必须包含"认证与权限需求"专门章节
3. **API 契约**: contracts/api.yaml 应标注哪些接口需要认证(C端)或暂不需要(B端)

**示例说明**:

```typescript
// B端示例 - 暂不实现权限校验
/**
 * @spec P001-product-management
 * 商品列表查询接口
 * 注意: 当前不实现认证与权限校验,后续通过全局拦截器统一注入
 */
export async function fetchProducts(params: ProductQueryParams) {
  // 无需 Token 验证,直接调用后端 API
  return apiService.get('/api/products', { params });
}
```

```typescript
// C端示例 - 按实际需求实现认证
/**
 * @spec U001-reservation-orders
 * 用户预约订单查询接口
 * 需要用户登录态,使用微信小程序 Token
 */
export async function fetchUserReservations(userId: string) {
  const token = Taro.getStorageSync('userToken');
  if (!token) {
    throw new Error('用户未登录');
  }
  return apiService.get(`/api/reservations/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

**基本原理**: 分层的认证与权限策略允许开发团队在早期阶段专注于核心业务功能的实现,避免权限系统的复杂性阻塞功能开发进度。B端管理后台作为内部工具,可在原型验证阶段暂不考虑权限控制,待业务逻辑稳定后统一补充。C端面向最终用户,涉及数据安全和隐私保护,必须从一开始按实际需求实现认证授权。这种策略平衡了开发效率和安全需求,确保项目按优先级有序推进。

### 十、Lark PM 项目管理集成规则 (Lark PM Project Management Integration)

当项目使用 Lark PM (飞书多维表格) 进行任务跟踪时,必须遵循以下集成规则,确保开发进度与项目管理系统的一致性。

**R11.1 Phase 状态同步**:
- 每个 Phase 开始执行时,必须更新 Lark PM 任务状态为 `🚀 进行中`
- 每个 Phase 完成后,必须更新状态为 `✅完成` 并填写执行结果
- 状态更新顺序:先 Git Commit,后 Lark PM 更新

**R11.2 执行结果记录**:
执行结果字段必须包含:
1. 已完成任务清单(按模块分组)
2. Git Commit 信息(hash + message + 统计)
3. 遇到的问题(无则标注"无")

**示例**:
```markdown
## 执行结果

### 已完成任务
- 后端: T027-T033 Service 层完成
- 前端: T040-T046 组件和页面完成

### Git Commit
- `baa01ba` feat(O002): implement Phase 3 Admin CRUD
- 13 files changed, 1777 insertions(+)

### 遇到的问题
无
```

**R11.3 临时任务记录**:
- 发现需要额外任务时(如文档更新),使用 `bitable_v1_appTableRecord_create` 创建新任务
- 任务标识格式:`<specId>-<类型>` (如 `O002-DOC`)

**R11.4 禁止行为**:
- ❌ 禁止 Phase 完成后不更新 Lark PM
- ❌ 禁止执行结果字段留空
- ❌ 禁止在 Git Commit 之前标记任务完成
- ❌ 禁止新增 API 后不记录到 API 表

**R11.5 API 记录规则**:
- 新增 API 接口时,必须记录到 Lark PM 的 API 表 (`tblmNcitMxHPrOMv`)
- API 记录必须包含:端点路径、HTTP 方法、功能描述、所属 specId
- 使用 `bitable_v1_appTableRecord_create` 工具创建 API 记录
- API 表地址: `https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblmNcitMxHPrOMv`

**基本原理**: Lark PM 集成规则确保开发进度的可见性和可追溯性。API 记录规则确保所有新增接口都有完整的文档记录,便于团队成员查阅和维护。通过强制状态同步和执行结果记录,项目干系人可以实时了解开发进展,便于识别风险和调整计划。先提交代码后更新状态的顺序避免了"标记完成但代码未提交"的不一致情况。

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

### API 异常编号规范 (API Error Code Standards)

所有后端 API 抛出的业务异常必须使用标准化的异常编号,以便前端针对编号编写统一的处理逻辑,并为用户文档提供可查询的错误参考。

**异常编号格式规范**:

1. **编号结构**: `<模块前缀>_<类别>_<序号>`
   - 模块前缀:2-4 个大写字母,对应业务模块(如 `INV` 库存、`ORD` 订单、`SKU` 商品)
   - 类别:3 个大写字母,表示错误类型(如 `VAL` 验证、`NTF` 未找到、`DUP` 重复、`AUT` 认证)
   - 序号:3 位数字,模块内递增(001-999)
   - 示例:`INV_NTF_001`(库存模块-未找到-001)、`SKU_VAL_003`(商品模块-验证错误-003)

2. **标准错误类别**:
   | 类别代码 | 含义 | HTTP 状态码 | 示例 |
   |---------|------|------------|------|
   | VAL | 验证错误 | 400 | 参数格式错误、必填字段缺失 |
   | NTF | 未找到 | 404 | 资源不存在 |
   | DUP | 重复冲突 | 409 | 唯一约束冲突 |
   | AUT | 认证错误 | 401 | Token 无效或过期 |
   | PRM | 权限错误 | 403 | 无操作权限 |
   | BIZ | 业务规则 | 422 | 业务逻辑不允许的操作 |
   | SYS | 系统错误 | 500 | 内部服务异常 |

3. **错误响应格式要求**:
   ```json
   {
     "success": false,
     "error": "INV_NTF_001",
     "message": "库存记录不存在",
     "details": {
       "inventoryId": "550e8400-e29b-41d4-a716-446655440000",
       "storeId": "store-001"
     },
     "timestamp": "2025-12-27T10:30:00Z"
   }
   ```

4. **后端实现要求**:
   - 所有业务异常类必须定义对应的错误编号常量
   - `GlobalExceptionHandler` 必须统一捕获并格式化异常响应
   - 错误编号必须在异常类或枚举中集中定义,禁止硬编码字符串
   - 每个模块的错误编号必须在 `contracts/api.yaml` 或独立文档中声明

5. **前端处理要求**:
   - 前端必须根据 `error` 编号而非 `message` 文本进行错误处理
   - 提供统一的错误处理工具函数,支持按编号映射用户友好提示
   - 对于未知编号,显示通用错误提示并记录日志

6. **文档要求**:
   - 必须维护 `docs/api-error-codes.md` 错误编号文档
   - 文档包含:编号、含义、触发场景、建议处理方式
   - 新增错误编号时必须同步更新文档

**模块前缀映射**:
| 前缀 | 模块 | 说明 |
|-----|------|------|
| CMN | Common | 通用/公共错误 |
| AUT | Auth | 认证授权 |
| USR | User | 用户管理 |
| STR | Store | 门店管理 |
| HAL | Hall | 影厅管理 |
| SKU | SKU | 商品管理 |
| INV | Inventory | 库存管理 |
| CAT | Category | 分类管理 |
| BRD | Brand | 品牌管理 |
| ORD | Order | 订单管理(商品订单) |
| RSV | Reservation | 预订管理(预约订单) |
| PKG | Package | 场景包管理 |

**基本原理**: 标准化的异常编号使错误处理更加精确和可维护。前端可以根据编号实现差异化的用户提示和自动化处理逻辑(如特定错误自动重试、跳转登录等),而不依赖可能变化的错误消息文本。同时,编号化的错误便于编写用户手册、FAQ 和技术支持文档,提高问题排查效率

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

### 业务概念澄清文档要求 (Business Clarification Documentation)

每个功能规格的 spec 目录下**必须**创建 `business-clarification.md` 文档,用于对关键的业务概念、术语、规则进行明确澄清,确保开发团队对业务语义的理解一致性。

**文档位置**:
- 路径格式:`specs/<specId>-<slug>/business-clarification.md`
- 示例:`specs/I004-inventory-adjustment/business-clarification.md`

**文档内容要求**:

1. **业务术语定义 (Business Terminology)**:
   - 明确定义功能涉及的关键业务术语
   - 说明术语的业务含义、使用场景、与其他术语的区别
   - 示例:区分"盘盈"、"盘亏"、"报损"的业务含义和应用场景

2. **业务规则澄清 (Business Rules Clarification)**:
   - 对复杂的业务规则进行详细说明
   - 明确规则的触发条件、执行逻辑、例外情况
   - 示例:审批阈值的计算方法、审批流程的状态流转规则

3. **业务流程说明 (Business Process Description)**:
   - 描述关键业务流程的步骤和决策点
   - 使用流程图或文字说明业务操作的完整路径
   - 示例:库存调整从录入到审批通过的完整流程

4. **边界情况与例外 (Edge Cases & Exceptions)**:
   - 说明业务操作的边界条件和例外情况
   - 明确在特殊情况下的业务处理策略
   - 示例:调整后库存为负数的处理、并发调整的处理

5. **业务假设与约束 (Business Assumptions & Constraints)**:
   - 明确业务功能的前提假设
   - 说明业务操作的限制和约束条件
   - 示例:审批阈值的配置方式、权限角色的划分

**强制要求**:
- 所有新创建的 spec 必须包含 `business-clarification.md` 文档
- 文档内容必须在功能开发前完成,并在规格评审中审核
- 代码审查时必须验证业务实现与澄清文档的一致性
- 如业务规则发生变更,必须同步更新澄清文档

**基本原理**: 业务概念澄清文档作为业务知识的明确载体,消除团队成员之间的理解偏差,避免因业务语义不清导致的开发返工和功能偏差。通过强制要求编写澄清文档,确保业务规则、术语、流程在开发前得到明确定义和团队共识,提高需求的准确性和开发效率。澄清文档也为后续的代码审查、功能测试、用户培训提供了权威的业务参考。

## 开发工作流

### 规格驱动开发 (Specification-Driven Development)

所有功能开发必须基于完整的规格文档。规格文档包含用户场景、验收标准、功能需求、关键实体、成功标准等核心内容。开发前必须仔细阅读和理解规格,确保实现与规格一致。规格文档中的所有功能需求(FR-*)和成功标准(SC-*)都必须在实现中得到验证和满足。

### 分支管理策略 (Branch Management Strategy)

采用功能分支开发模式,每个功能对应独立的开发分支。分支命名严格遵循 `feat/<specId>-<slug>` 格式,其中 specId 使用新的**模块字母+三位数字**格式(如 S001、P012、I003)。开发完成后通过 Pull Request 进行代码审查,审查通过后合并到主分支。禁止直接在主分支进行开发,确保代码质量和变更的可追溯性。

### 持续集成与质量门禁 (Continuous Integration & Quality Gates)

建立完整的质量门禁体系,包括代码规范检查、类型检查、单元测试、集成测试等。所有质量检查必须通过后才能合并代码。使用自动化工具确保质量标准的执行,减少人工审查的工作量和主观性。

**注意**: E2E 测试为可选策略,E2E 测试失败可设置为警告而非阻塞发布,由团队根据功能重要性决定是否强制通过 E2E 测试。

## 质量标准

### 性能标准 (Performance Standards)

应用启动时间不超过 3 秒,页面切换响应时间不超过 500 毫秒,数据列表加载支持虚拟滚动优化。必须进行性能监控,使用 Web Vitals 指标评估用户体验。大型数据列表必须使用虚拟滚动或分页加载,避免页面卡顿。

对于 C端 Taro 项目,还需额外关注:
- 小程序包体积优化(主包 < 2MB,分包合理拆分)
- 首屏渲染时间 < 1.5 秒
- 列表滚动流畅度(FPS ≥ 50)

### 安全标准 (Security Standards)

**通用安全要求**(B端与C端均适用):
- 前端必须有完善的输入验证和数据清理机制,使用 Zod 进行数据验证
- 防止 XSS 攻击,避免在前端存储敏感信息(如密码、密钥等)
- 使用 HTTPS 进行数据传输(生产环境)

**B端(管理后台)安全策略**:
- 当前阶段**暂不实现认证与权限逻辑**(详见"认证与权限要求分层"原则)
- API 请求无需包含 Token 验证和用户身份校验
- 数据模型可预留 `createdBy`、`updatedBy` 字段,但无需强制填充
- 后续通过全局拦截器、AOP 等机制统一注入认证授权逻辑

**C端(客户端/小程序)安全策略**:
- **必须**根据业务实际需求实现认证与权限逻辑
- API 请求必须包含 Token 验证(如微信小程序 Token、手机验证码)
- 处理 Token 过期和刷新逻辑,确保会话安全
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

**版本**: 1.15.1 | **制定日期**: 2025-12-14 | **最后修订**: 2026-01-03
