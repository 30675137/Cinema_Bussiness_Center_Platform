# Feature Specification: E2E 测试管理规范

**Feature Branch**: `T007-e2e-test-management`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "基于已有的E2E端到端测试技skill，实现一个新的E2E测试管理规范，包括统一入口、人工测试用例、路径规划、服务自动化管理、测试报告系统等功能"

## Clarifications

### Session 2025-12-31

- Q: 生成人工测试用例 Markdown 文档的功能应该放在哪个 skill 中？ → A: 创建新的独立 skill `manual-testcase-generator`，专注于人工测试文档生成，保持单一职责原则
- Q: Markdown 文档是否需要包含执行结果记录区域？ → A: 仅作为只读操作指南，不含记录区，执行结果在 YAML 源文件中更新，保持单一数据源
- Q: `manual-testcase-generator` 的输入数据源应该支持哪些类型？ → A: 同时支持人工测试用例 YAML (`testcases/`) 和场景 YAML (`scenarios/`) 两种输入，可满足不同验证需求
- Q: 从场景 YAML 生成人工验证文档时，应该使用哪些内容字段？ → A: 仅使用场景元数据（title, description, preconditions）+ 步骤的 description 字段，避免暴露技术细节

## 概述

本规范定义了影院商品管理中台 E2E 测试体系的完整管理规范，基于现有的 E2E skill 生态系统（test-scenario-author、e2e-test-generator、e2e-runner、e2e-testdata-planner、e2e-report-configurator、e2e-admin）进行增强和整合，并新增 `manual-testcase-generator` skill 用于生成人工测试用例 Markdown 文档，实现统一的测试管理入口、人工测试用例文档标准、优化的路径结构、服务自动化管理和完整的测试报告系统。

### E2E Skill 生态

| Skill | Spec | 功能 |
|-------|------|------|
| **e2e** | - | 统一入口，包装所有 E2E 工具 |
| **test-scenario-author** | T001/T005 | 场景 YAML 创建、验证、列表 |
| **e2e-test-generator** | T002 | 将场景 YAML 转换为 Playwright 测试脚本 |
| **e2e-runner** | T003 | 多环境测试执行 |
| **e2e-testdata-planner** | T004 | 测试数据蓝图和 fixture 生成 |
| **e2e-report-configurator** | T006 | 报告配置和 CI/CD 集成 |
| **e2e-admin** | T001-orchestrator | 测试编排管理器 |
| **manual-testcase-generator** | T007 (新增) | 将人工测试用例 YAML 或场景 YAML 转换为 Markdown 人工验证文档 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 统一入口测试管理 (Priority: P1)

作为 QA 工程师，我希望通过 `/e2e` 命令作为统一入口管理所有 E2E 测试活动，包括用例编写、脚本生成、测试执行、报告查看和数据准备，无需记忆多个独立 skill 的命令。

**Why this priority**: 统一入口是整个测试管理规范的核心，其他功能都基于此入口进行调度和管理，是用户最常用的交互方式。

**Independent Test**: 可通过执行 `/e2e help` 查看所有可用命令，执行 `/e2e orchestrate --tags "module:inventory"` 验证完整工作流。

**Acceptance Scenarios**:

1. **Given** 用户输入 `/e2e help`，**When** 系统解析命令，**Then** 显示所有可用子命令及其说明（generate、run、orchestrate、create-scenario、validate-scenario、testdata、testcase、report）
2. **Given** 用户输入 `/e2e orchestrate --tags "module:inventory"`，**When** 系统执行编排流程，**Then** 系统调用 e2e-admin 执行完整工作流（场景选择→脚本生成→测试执行→报告生成）
3. **Given** 用户输入 `/e2e testcase list --module order`，**When** 系统查询测试用例，**Then** 显示 order 模块下所有人工测试用例列表

---

### User Story 2 - 人工测试用例文档管理 (Priority: P1)

作为 QA 工程师，我希望能够创建、管理和执行人工测试用例文档，用例格式标准化且支持与场景测试的数据结构复用，便于缺陷追踪和回归测试。

**Why this priority**: 人工测试用例是自动化测试的补充，覆盖无法自动化的场景（如视觉检查、用户体验），与自动化测试同等重要。

**Independent Test**: 可通过 `/e2e testcase create` 创建用例，`/e2e testcase list` 查看列表，验证用例格式完整性。

**Acceptance Scenarios**:

1. **Given** 用户执行 `/e2e testcase create --module order`，**When** 系统启动交互式创建流程，**Then** 引导用户输入用例 ID、标题、模块、优先级、前置条件、测试数据、测试步骤、预期结果等字段
2. **Given** 用户完成用例创建，**When** 系统保存用例，**Then** 生成标准化 YAML 文件到 `testcases/<module>/TC-<MODULE>-<NUMBER>.yaml`
3. **Given** 用户执行 `/e2e testcase execute TC-ORDER-001`，**When** 系统启动执行流程，**Then** 显示用例详情并引导用户逐步执行，记录实际结果和缺陷链接
4. **Given** 测试用例需要引用测试数据，**When** 用户指定 `testdata_ref`，**Then** 系统从 e2e-testdata-planner 的数据结构中加载对应数据

---

### User Story 3 - 服务自动化管理 (Priority: P1)

作为 QA 工程师或开发人员，我希望 E2E 测试执行时能自动检测、启动和管理所需的服务（前端、后端），无需手动启动多个终端。

**Why this priority**: 服务管理是测试执行的前提条件，自动化管理可减少 80% 的测试准备时间，避免"服务未启动"导致的测试失败。

**Independent Test**: 执行 `/e2e run E2E-INVENTORY-002 --cross-system` 验证系统自动启动 C端(10086)和 B端(3000)服务。

**Acceptance Scenarios**:

1. **Given** 场景 YAML 定义了 `system: c-end` 和 `system: b-end` 步骤，**When** 执行测试前，**Then** 系统自动检测端口 10086 和 3000 是否被占用
2. **Given** 端口未被占用，**When** 系统启动服务，**Then** 在后台启动 C端（`npm run dev:h5`）和 B端（`npm run dev`）开发服务器
3. **Given** 端口已被占用但服务不健康，**When** 系统检测到异常，**Then** 自动 kill 进程并重新启动服务
4. **Given** 测试执行完成或超时，**When** 清理阶段，**Then** 系统自动停止所有启动的服务进程
5. **Given** 服务启动超时（默认 60 秒），**When** 服务未就绪，**Then** 显示详细错误信息并建议手动检查

---

### User Story 4 - 测试报告静态网站 (Priority: P2)

作为项目经理或 QA 主管，我希望有一个统一的测试报告网站，可以查看每次测试的详细报告、历史趋势和对比分析。

**Why this priority**: 报告系统是测试结果的可视化展示，对于团队沟通和问题追踪至关重要，但相比测试执行本身优先级稍低。

**Independent Test**: 执行测试后访问 `reports/e2e-portal/index.html` 查看报告聚合页面。

**Acceptance Scenarios**:

1. **Given** 用户执行 `/e2e report serve`，**When** 系统启动报告服务器，**Then** 在本地端口（默认 9323）启动静态网站服务
2. **Given** 测试执行完成，**When** 报告生成，**Then** 自动将报告索引添加到聚合页面
3. **Given** 用户访问报告聚合页面，**When** 页面加载，**Then** 显示所有历史测试报告列表，支持按时间、模块、状态筛选
4. **Given** 用户选择两次测试报告，**When** 点击对比按钮，**Then** 显示测试用例通过率变化、新增失败、已修复等对比信息

---

### User Story 5 - 优化的目录结构 (Priority: P2)

作为开发人员或 QA 工程师，我希望测试相关文件有清晰的目录结构，遵循行业最佳实践，便于查找和维护。

**Why this priority**: 清晰的目录结构是长期维护的基础，但不直接影响功能实现，属于代码质量范畴。

**Independent Test**: 检查项目目录结构是否符合规范定义。

**Acceptance Scenarios**:

1. **Given** 新创建的场景 YAML，**When** 保存文件，**Then** 文件位于 `scenarios/<module>/<scenario-id>.yaml`
2. **Given** 生成的 Playwright 测试脚本，**When** 保存文件，**Then** 文件位于 `frontend/tests/e2e/<module>/<scenario-id>.spec.ts`
3. **Given** 人工测试用例，**When** 保存文件，**Then** 文件位于 `testcases/<module>/TC-<MODULE>-<NUMBER>.yaml`
4. **Given** 测试数据蓝图，**When** 保存文件，**Then** 文件位于 `testdata/blueprints/<entity>.blueprint.yaml`
5. **Given** 测试报告，**When** 生成报告，**Then** 报告位于 `reports/e2e/run-<timestamp>/`

---

### User Story 6 - 测试执行通过 e2e-admin 调度 (Priority: P2)

作为 QA 工程师，我希望所有测试执行都通过 e2e-admin 进行统一调度，确保执行流程标准化、可追溯、可配置。

**Why this priority**: 统一调度确保测试执行的一致性和可追溯性，是 CI/CD 集成的基础。

**Independent Test**: 执行 `/e2e run` 验证其内部调用 e2e-admin 进行执行。

**Acceptance Scenarios**:

1. **Given** 用户执行 `/e2e run E2E-INVENTORY-001`，**When** 系统处理命令，**Then** 内部调用 `/e2e-admin --scenario-ids E2E-INVENTORY-001`
2. **Given** 用户执行 `/e2e orchestrate --tags "module:order"`，**When** 系统处理命令，**Then** 内部调用 `/e2e-admin --tags "module:order"`
3. **Given** e2e-admin 执行完成，**When** 返回结果，**Then** 统一格式输出执行摘要（通过/失败/跳过数量、耗时、报告路径）

---

### Edge Cases

- **服务启动失败**: 当服务启动失败时，系统应显示详细错误日志并提供手动启动命令供用户参考
- **端口冲突**: 当端口被其他进程占用时，系统应提示用户是否自动 kill 进程或手动处理
- **测试数据缺失**: 当 testdata_ref 引用的数据不存在时，系统应在测试执行前提示用户创建数据
- **报告目录已存在**: 当报告目录已存在时，应生成带时间戳的唯一目录名
- **场景 YAML 验证失败**: 当场景文件格式错误时，应在执行前显示详细验证错误

## Requirements *(mandatory)*

### Functional Requirements

#### 统一入口 (e2e skill 增强)

- **FR-001**: `/e2e` skill MUST 作为所有 E2E 测试活动的统一入口
- **FR-002**: `/e2e` skill MUST 支持以下子命令：generate、run、orchestrate、create-scenario、validate-scenario、testdata、testcase、report
- **FR-003**: `/e2e run` 命令 MUST 内部调用 e2e-admin 进行测试执行
- **FR-004**: `/e2e orchestrate` 命令 MUST 内部调用 e2e-admin 进行完整工作流编排

#### 人工测试用例文档

- **FR-005**: 系统 MUST 支持创建人工测试用例，格式包含：用例ID、标题、模块、优先级、前置条件、测试数据、测试步骤、预期结果、实际结果、缺陷链接
- **FR-006**: 用例 ID 格式 MUST 为 `TC-<MODULE>-<NUMBER>`（如 TC-ORDER-001）
- **FR-007**: 用例优先级 MUST 支持 P0/P1/P2 三个等级
- **FR-008**: 测试数据字段 MUST 支持 `testdata_ref` 引用，复用 e2e-testdata-planner 的数据结构
- **FR-009**: 用例文件 MUST 以 YAML 格式存储在 `testcases/<module>/` 目录下
- **FR-010**: 系统 MUST 支持用例执行记录，包含执行时间、执行人、实际结果、缺陷关联

#### 人工测试用例 Markdown 生成 (manual-testcase-generator skill)

- **FR-033**: `manual-testcase-generator` skill MUST 支持两种输入源：人工测试用例 YAML (`testcases/<module>/TC-*.yaml`) 和场景 YAML (`scenarios/<module>/E2E-*.yaml`)
- **FR-034**: 生成的 Markdown 文档 MUST 为只读操作指南，包含清晰的操作步骤，便于 QA 工程师阅读和执行
- **FR-035**: Markdown 文档 MUST 存储在 `testcases/<module>/docs/TC-<MODULE>-<NUMBER>.md`（人工用例）或 `scenarios/<module>/docs/E2E-<MODULE>-<NUMBER>.md`（场景验证）
- **FR-036**: `/e2e testcase generate-doc TC-ORDER-001` 命令 MUST 调用 `manual-testcase-generator` 从人工用例 YAML 生成文档
- **FR-037**: 批量生成命令 `/e2e testcase generate-doc --module order` MUST 生成该模块下所有用例的 Markdown 文档
- **FR-038**: 执行结果 MUST 在 YAML 源文件的 `executions` 字段中记录，Markdown 文档不包含执行记录区域
- **FR-039**: `/e2e scenario generate-doc E2E-ORDER-001` 命令 MUST 调用 `manual-testcase-generator` 从场景 YAML 生成人工验证文档，用于自动化测试的人工复核
- **FR-040**: 从场景 YAML 生成文档时，MUST 仅提取人类可读字段：scenario_id、title、description、preconditions、以及每个步骤的 description 属性，禁止包含 CSS selectors 等技术细节

#### 目录结构规范

- **FR-011**: Playwright 测试脚本 MUST 存放在 `frontend/tests/e2e/<module>/` 目录下
- **FR-012**: 场景 YAML 文件 MUST 存放在 `scenarios/<module>/` 目录下
- **FR-013**: 人工测试用例 MUST 存放在 `testcases/<module>/` 目录下
- **FR-014**: 测试数据蓝图 MUST 存放在 `testdata/blueprints/` 目录下
- **FR-015**: 测试报告 MUST 存放在 `reports/e2e/` 目录下，每次运行生成唯一子目录
- **FR-016**: Page Objects MUST 存放在 `frontend/tests/e2e/pages/` 目录下

#### 服务自动化管理

- **FR-017**: 系统 MUST 能够自动检测场景所需的服务类型（c-end、b-end、api）
- **FR-018**: 系统 MUST 能够检测端口占用状态（C端: 10086, B端: 3000, 后端: 8080）
- **FR-019**: 系统 MUST 能够自动启动所需服务（执行对应的 npm run 命令）
- **FR-020**: 系统 MUST 能够检测服务健康状态（HTTP 请求检查）
- **FR-021**: 系统 MUST 能够在端口冲突时提供 kill 进程的选项
- **FR-022**: 系统 MUST 在测试完成后自动停止启动的服务
- **FR-023**: 服务启动超时时间 MUST 可配置（默认 60 秒）

#### 测试报告系统

- **FR-024**: 系统 MUST 生成包含唯一 run_id 的测试报告目录
- **FR-025**: 系统 MUST 支持 HTML、JSON、JUnit 三种报告格式
- **FR-026**: 系统 MUST 生成报告聚合页面，列出所有历史报告
- **FR-027**: 报告聚合页面 MUST 支持按时间、模块、状态筛选
- **FR-028**: 系统 MUST 支持本地报告服务器，方便查看 HTML 报告
- **FR-029**: 系统 SHOULD 支持报告对比功能，显示两次运行的差异

#### 执行流程规范

- **FR-030**: 所有测试执行 MUST 通过 e2e-admin skill 进行调度
- **FR-031**: 执行流程 MUST 按固定顺序执行：场景加载→场景验证→数据验证→脚本生成→报告配置→服务启动→测试执行→报告生成→服务清理
- **FR-032**: 每个步骤 MUST 支持跳过选项（如 --skip-generation）

### Key Entities

- **ManualTestCase**: 人工测试用例，包含用例ID、标题、模块、优先级、前置条件、测试数据、测试步骤、预期结果、执行记录、缺陷关联
- **ExecutionRecord**: 执行记录，包含执行时间、执行人、实际结果、缺陷ID、备注
- **TestReport**: 测试报告，包含 run_id、执行时间、通过/失败/跳过数量、耗时、工件路径
- **ServiceConfig**: 服务配置，包含服务类型、端口、启动命令、健康检查URL、超时时间
- **ReportPortal**: 报告聚合页面，包含所有历史报告索引、筛选条件、对比功能

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: QA 工程师使用统一入口 `/e2e` 完成完整测试流程的时间 ≤ 5 分钟
- **SC-002**: 服务自动管理功能使测试准备时间减少 80%（从约 5 分钟减少到 1 分钟内）
- **SC-003**: 100% 的人工测试用例遵循标准化格式，可通过格式验证
- **SC-004**: 测试报告聚合页面能够在 3 秒内加载完成（本地服务器）
- **SC-005**: 系统能够正确检测和管理 C端、B端、后端三种服务类型
- **SC-006**: 90% 的测试执行无需手动干预服务启动
- **SC-007**: 报告历史保留至少最近 30 次运行记录

## Assumptions

- 现有的 E2E skill 生态（test-scenario-author、e2e-test-generator、e2e-runner、e2e-testdata-planner、e2e-report-configurator、e2e-admin）已经实现并可用
- 开发环境已安装 Node.js 18+、npm、Playwright
- C端使用 Taro H5 开发模式（端口 10086）
- B端使用 Vite 开发模式（端口 3000）
- 后端使用 Spring Boot（端口 8080）
- 测试数据蓝图格式遵循 T004-e2e-testdata-planner 规范
- 场景 YAML 格式遵循 T001/T005 规范

## Dependencies

| 依赖 | Spec | 说明 |
|------|------|------|
| test-scenario-author | T001/T005 | 场景创建和验证 |
| e2e-test-generator | T002 | 测试脚本生成 |
| e2e-runner | T003 | 测试执行 |
| e2e-testdata-planner | T004 | 测试数据管理 |
| e2e-report-configurator | T006 | 报告配置 |
| e2e-admin | T001-orchestrator | 编排调度 |

## Appendix A: 人工测试用例 YAML 格式

```yaml
# testcases/order/TC-ORDER-001.yaml
testcase_id: TC-ORDER-001
title: 验证用户能够成功创建饮品订单并完成支付
module: order
feature: 饮品订单创建
priority: P0  # P0/P1/P2

preconditions:
  account: 已登录的普通用户账号
  permissions: 普通用户权限
  switches: []  # 开关配置
  environment: staging
  dependencies:
    - 门店已开业
    - 商品已上架
    - 库存充足

test_data:
  testdata_ref: orderTestData.beverage_order_001  # 引用 testdata-planner 数据
  # 或显式定义
  # user_id: ${testdata.user_001.id}
  # store_id: ${testdata.store_main.id}
  # product_id: ${testdata.product_cola.id}

steps:
  - step_no: 1
    action: 打开门店页面
    input: 点击首页门店入口
    expected: 显示门店列表页

  - step_no: 2
    action: 选择门店
    input: 点击第一个门店
    expected: 进入门店商品页

  - step_no: 3
    action: 添加商品到购物车
    input: 选择可乐，数量2，点击添加
    expected: 购物车显示商品数量2

  - step_no: 4
    action: 提交订单
    input: 点击结算按钮
    expected: 跳转支付页面

  - step_no: 5
    action: 完成支付
    input: 选择微信支付
    expected: 显示支付成功页面

assertions:
  - 订单状态变为"已支付"
  - 库存扣减正确
  - 订单详情页显示正确商品和数量

# 执行记录（执行时填写）
executions:
  - executed_at: "2025-12-31T10:30:00Z"
    executed_by: QA-张三
    actual_result: Pass
    defect_id: null
    notes: null

  - executed_at: "2025-12-30T15:00:00Z"
    executed_by: QA-李四
    actual_result: Fail
    defect_id: FEISHU-BUG-12345  # 关联飞书多维表格
    notes: 支付超时导致失败，已提交缺陷

# 元数据
metadata:
  created_at: "2025-12-29T09:00:00Z"
  created_by: QA-张三
  updated_at: "2025-12-31T10:30:00Z"
  version: "1.2.0"
  tags:
    - smoke
    - regression
    - payment
```

## Appendix B: 目录结构规范

```
Cinema_Bussiness_Center_Platform/
├── frontend/
│   ├── tests/
│   │   └── e2e/                          # Playwright 测试目录
│   │       ├── inventory/                # 按模块组织
│   │       │   ├── E2E-INVENTORY-001.spec.ts
│   │       │   └── E2E-INVENTORY-002.spec.ts
│   │       ├── order/
│   │       │   └── E2E-ORDER-001.spec.ts
│   │       ├── pages/                    # Page Objects
│   │       │   ├── LoginPage.ts
│   │       │   ├── InventoryPage.ts
│   │       │   └── OrderPage.ts
│   │       ├── fixtures/                 # Playwright fixtures
│   │       │   └── testdata/
│   │       │       └── testdata-TD-ORDER-001.fixture.ts
│   │       └── utils/                    # 测试工具函数
│   │           └── helpers.ts
│   └── playwright.config.ts
│
├── scenarios/                            # 场景 YAML 文件
│   ├── inventory/
│   │   ├── E2E-INVENTORY-001.yaml
│   │   ├── E2E-INVENTORY-002.yaml
│   │   └── docs/                         # 场景的人工验证文档（只读）
│   │       ├── E2E-INVENTORY-001.md
│   │       └── E2E-INVENTORY-002.md
│   ├── order/
│   │   ├── E2E-ORDER-001.yaml
│   │   └── docs/
│   │       └── E2E-ORDER-001.md
│   └── README.md
│
├── testcases/                            # 人工测试用例
│   ├── inventory/
│   │   ├── TC-INVENTORY-001.yaml
│   │   └── docs/                         # 生成的 Markdown 文档（只读）
│   │       └── TC-INVENTORY-001.md
│   ├── order/
│   │   ├── TC-ORDER-001.yaml
│   │   ├── TC-ORDER-002.yaml
│   │   └── docs/
│   │       ├── TC-ORDER-001.md
│   │       └── TC-ORDER-002.md
│   └── README.md
│
├── testdata/                             # 测试数据
│   ├── blueprints/                       # 数据蓝图
│   │   ├── order.blueprint.yaml
│   │   └── user.blueprint.yaml
│   ├── seeds/                            # 种子数据
│   │   ├── users.json
│   │   └── products.json
│   └── scripts/                          # 数据库脚本
│       └── seed-products.sql
│
├── reports/                              # 测试报告
│   └── e2e/
│       ├── e2e-portal/                   # 报告聚合页面
│       │   ├── index.html
│       │   └── reports.json
│       ├── run-20251231-103052-a3f8b921/ # 单次运行报告
│       │   ├── index.html
│       │   ├── summary.json
│       │   └── artifacts/
│       └── run-20251230-143052-b7c2d456/
│
└── .claude/skills/                       # Claude Code skills
    ├── e2e/                              # 统一入口
    │   ├── skill.md
    │   └── scripts/
    ├── test-scenario-author/
    ├── e2e-test-generator/
    ├── e2e-runner/
    ├── e2e-testdata-planner/
    ├── e2e-report-configurator/
    └── e2e-admin/
```

## Appendix C: 服务配置规范

```yaml
# .claude/skills/e2e-admin/assets/service-config.yaml
services:
  c-end:
    name: "C端 (Taro H5)"
    port: 10086
    directory: "./hall-reserve-taro"
    start_command: "npm run dev:h5"
    health_check_url: "http://localhost:10086"
    startup_timeout: 60000
    shutdown_signal: SIGTERM

  b-end:
    name: "B端 (React Admin)"
    port: 3000
    directory: "./frontend"
    start_command: "npm run dev"
    health_check_url: "http://localhost:3000"
    startup_timeout: 60000
    shutdown_signal: SIGTERM

  backend:
    name: "后端 (Spring Boot)"
    port: 8080
    directory: "./backend"
    start_command: "./mvnw spring-boot:run"
    health_check_url: "http://localhost:8080/actuator/health"
    startup_timeout: 120000
    shutdown_signal: SIGTERM

port_conflict_strategy:
  default: prompt  # prompt | auto-kill | fail
  options:
    prompt: "询问用户是否 kill 进程"
    auto-kill: "自动 kill 占用进程"
    fail: "直接报错退出"
```

## Appendix D: 报告聚合页面结构

```json
// reports/e2e/e2e-portal/reports.json
{
  "portal_version": "1.0.0",
  "generated_at": "2025-12-31T12:00:00Z",
  "reports": [
    {
      "run_id": "20251231-103052-a3f8b921",
      "execution_timestamp": "2025-12-31T10:30:52Z",
      "duration_seconds": 125.3,
      "summary": {
        "total": 15,
        "passed": 13,
        "failed": 2,
        "skipped": 0
      },
      "tags_filter": "module:inventory AND priority:p1",
      "environment": "dev",
      "report_path": "./run-20251231-103052-a3f8b921/index.html",
      "artifacts_path": "./run-20251231-103052-a3f8b921/artifacts/"
    },
    {
      "run_id": "20251230-143052-b7c2d456",
      "execution_timestamp": "2025-12-30T14:30:52Z",
      "duration_seconds": 98.7,
      "summary": {
        "total": 10,
        "passed": 10,
        "failed": 0,
        "skipped": 0
      },
      "tags_filter": "module:order",
      "environment": "staging",
      "report_path": "./run-20251230-143052-b7c2d456/index.html",
      "artifacts_path": "./run-20251230-143052-b7c2d456/artifacts/"
    }
  ]
}
```
