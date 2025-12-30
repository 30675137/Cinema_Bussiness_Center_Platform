# Feature Specification: E2E测试脚本生成器 (e2e-test-generator)

**Feature Branch**: `T002-e2e-test-generator`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "基于T001-e2e的spec继续创建E2E测试脚本生成器"

<!--
  规格编号格式说明 (Spec ID Format):
  T002 - T=工具/基础设施, 002=模块内递增编号
-->

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 将 E2E 场景 YAML 转换为测试脚本（支持多框架） (Priority: P1)

QA 工程师希望使用 `/e2e-test-generator` skill 将 T001 skill 创建的场景 YAML 文件自动转换为可执行的测试脚本,无需手动编写测试代码。Skill 读取场景文件,解析 steps 和 assertions,根据场景类型（UI/API）或用户指定的 `--framework` 参数,生成对应测试框架的脚本（Playwright TypeScript、Postman Collection、REST Client .http 文件等）。

**Why this priority**: 这是核心功能 - 场景 YAML 本身无法执行,必须转换为测试脚本才能运行。支持多框架让 QA 团队为不同测试场景选择最合适的工具，自动生成脚本可节省 80% 的手动编码时间,并保证测试代码的一致性和规范性。

**Independent Test**: 可以通过准备一个包含 ui assertions 的场景 YAML 文件,调用 `/e2e-test-generator generate E2E-INVENTORY-001`,验证生成的 Playwright `.spec.ts` 文件包含正确的 test describe, beforeEach hook, test case 和断言。准备一个仅含 api assertions 的场景,验证生成对应的 Postman collection 或 REST Client .http 文件。

**Acceptance Scenarios**:

1. **Given** 存在场景文件 `scenarios/inventory/E2E-INVENTORY-001.yaml` 包含 login, navigate, create_order 等 steps,**When** 调用 `/e2e-test-generator generate E2E-INVENTORY-001` 时,**Then** 生成 `scenarios/inventory/E2E-INVENTORY-001.spec.ts` 文件(与 YAML 并列),包含 test describe block, beforeEach setup, test case 和对应的页面对象方法调用
2. **Given** 场景包含 API 类型的 assertion(如 database_field_equals),**When** 生成测试脚本时,**Then** 脚本包含 API 请求代码和响应验证逻辑(如 `expect(response.data.field).toBe(expected)`)
3. **Given** 场景包含 UI 类型的 assertion(如 element_visible),**When** 生成测试脚本时,**Then** 脚本包含 Playwright locator 和 toBeVisible() 断言
4. **Given** 场景引用 testdata_ref(如 `testdata_ref: bomTestData.scenario_001`),**When** 生成脚本时,**Then** 脚本包含从测试数据文件导入和使用测试数据的代码(如 `import { bomTestData } from '@/testdata/bom'`)
5. **Given** 场景包含多个 steps,**When** 生成脚本时,**Then** 步骤按顺序排列,每个 step 转换为对应的页面对象方法调用(如 `await loginPage.login()`)

---

### User Story 2 - 集成 e2e-testdata-planner 生成的 Fixtures (Priority: P1)

QA 工程师希望 `/e2e-test-generator` skill 能自动集成 T004-e2e-testdata-planner 生成的 Playwright fixtures,根据场景的 testdata_ref 引用,自动导入对应的 fixture 模块,并在测试函数签名中声明 fixture 参数,实现测试数据的自动 setup/teardown 生命周期管理。

**Why this priority**: 测试数据生命周期管理是 E2E 测试的核心基础设施。通过集成 T004 fixtures,测试脚本可以自动获得数据库初始化（setup）、数据清理（teardown）、依赖管理等能力,无需手动编写数据准备代码。这确保测试可重复运行、测试间隔离,减少 70% 的数据管理工作量。

**Independent Test**: 可以通过准备一个引用 `testdata_ref: TD-INVENTORY-BOM-WHISKEY-COLA` 的场景,验证生成的测试脚本：(1) 导入 T004 生成的 fixture 模块（`import { test } from '../../tests/fixtures/testdata/testdata-TD-INVENTORY-BOM-WHISKEY-COLA.fixture'`）；(2) 测试函数签名包含 fixture 参数（`async ({ page, TD_INVENTORY_BOM_WHISKEY_COLA }) => {...}`）；(3) 测试内使用 fixture 数据（如 `TD_INVENTORY_BOM_WHISKEY_COLA.whiskeySkuId`）。

**Acceptance Scenarios**:

1. **Given** 场景的 preconditions 包含 `testdata_ref: TD-INVENTORY-BOM-WHISKEY-COLA`,**When** 生成测试脚本时,**Then** 脚本顶部包含 fixture 导入语句 `import { test } from '../../tests/fixtures/testdata/testdata-TD-INVENTORY-BOM-WHISKEY-COLA.fixture'`,并且测试函数签名为 `test('...', async ({ page, TD_INVENTORY_BOM_WHISKEY_COLA }) => {...})`
2. **Given** 场景引用的 testdata_ref 对应的 testdata blueprint 存在（T004 已创建）,**When** 生成脚本时,**Then** 脚本使用 fixture 提供的数据字段（如 `TD_INVENTORY_BOM_WHISKEY_COLA.whiskeySkuId`）而非硬编码值
3. **Given** 场景引用的 testdata_ref 对应的 testdata blueprint 不存在,**When** 生成脚本时,**Then** 脚本包含 TODO 注释提示 QA 工程师使用 `/testdata-planner create` 创建蓝图,并生成临时的 `loadTestData()` 调用作为降级方案
4. **Given** 场景包含多个 testdata_ref 引用（如 preconditions 引用 TD-USER-001,steps 引用 TD-PRODUCT-002）,**When** 生成脚本时,**Then** 导入所有相关 fixtures 并在测试签名中声明所有 fixture 参数
5. **Given** 场景使用 db-script 策略的 testdata blueprint,**When** 运行测试时,**Then** fixture 自动执行 SQL 脚本进行 setup（插入初始数据）和 teardown（清理测试数据）,确保测试可重复运行

---

### User Story 3 - 批量生成测试脚本 (Priority: P2)

测试负责人希望使用 `/e2e-test-generator batch --module inventory` 命令批量生成指定模块所有场景的测试脚本,无需逐个场景手动转换,大幅提升测试代码生成效率。

**Why this priority**: 对于大量场景(如 20-50 个)的批量生成能力提升效率,但单个场景生成已足够初期使用。批量生成可在核心功能稳定后添加。

**Independent Test**: 可以通过在 `scenarios/inventory/` 目录下准备 10 个场景 YAML 文件,调用 `/e2e-test-generator batch --module inventory`,验证生成 10 个对应的 `.spec.ts` 文件,每个文件内容正确。

**Acceptance Scenarios**:

1. **Given** `scenarios/inventory/` 目录包含 10 个场景 YAML 文件,**When** 调用 `/e2e-test-generator batch --module inventory` 时,**Then** 生成 10 个对应的测试脚本文件,存储在 `scenarios/inventory/` 目录(与 YAML 文件并列)
2. **Given** 批量生成过程中某个场景文件格式错误,**When** 执行批量生成时,**Then** skill 跳过该场景并在报告中标记错误,继续处理其他场景
3. **Given** 批量生成完成,**When** skill 输出报告时,**Then** 报告包含成功生成数量、失败场景列表和存储路径

---

### User Story 4 - 生成页面对象模板 (Priority: P2)

QA 工程师希望 `/e2e-test-generator` skill 能检测场景中使用的页面对象(如 LoginPage, ProductPage),如果页面对象文件不存在,自动生成页面对象类模板,包含场景中用到的方法骨架,供 QA 工程师补充实现细节。

**Why this priority**: 页面对象模式是 E2E 测试最佳实践,自动生成模板减少重复工作。但初期可以手动创建页面对象,自动生成可后续添加。

**Independent Test**: 可以通过准备一个使用 `LoginPage.login()` 和 `ProductPage.selectProduct()` 方法的场景,调用 skill 生成测试脚本,验证如果页面对象文件不存在,skill 生成 `LoginPage.ts` 和 `ProductPage.ts` 模板,包含方法签名和 TODO 注释。

**Acceptance Scenarios**:

1. **Given** 场景包含 login action,**When** 生成测试脚本且 `LoginPage.ts` 不存在时,**Then** skill 生成页面对象模板文件,包含 `login()` 方法骨架和 TODO 注释
2. **Given** 页面对象文件已存在,**When** 生成测试脚本时,**Then** skill 不覆盖现有文件,仅在测试脚本中导入和使用
3. **Given** 场景使用自定义 action(如 `create_order`),**When** 生成页面对象模板时,**Then** 模板包含对应的 `createOrder()` 方法

---

### User Story 5 - 更新已存在的测试脚本 (Priority: P3)

QA 工程师希望当场景 YAML 文件修改后,使用 `/e2e-test-generator update E2E-INVENTORY-001` 命令更新对应的测试脚本,保留手动添加的自定义代码,仅更新与场景相关的部分。

**Why this priority**: 测试维护很重要,但初期可以重新生成整个脚本。智能更新功能可在成熟后添加,避免覆盖手动修改。

**Independent Test**: 可以通过修改场景 YAML 添加新步骤,调用 `/e2e-test-generator update E2E-INVENTORY-001`,验证测试脚本更新,新步骤被添加,但现有自定义断言代码保留。

**Acceptance Scenarios**:

1. **Given** 测试脚本包含手动添加的自定义断言,**When** 场景 YAML 修改后调用 update 命令时,**Then** skill 更新步骤代码但保留自定义断言
2. **Given** 场景删除某个 step,**When** 更新测试脚本时,**Then** 对应的页面对象调用被移除
3. **Given** 场景新增 assertion,**When** 更新测试脚本时,**Then** 新的断言代码被添加到 test case 末尾

---

### User Story 6 - 支持 API 专用测试框架（Postman/REST Client） (Priority: P2)

测试工程师希望对于仅包含 API assertions 的场景（无 UI 交互），能够生成 Postman Collection 或 REST Client .http 文件，使用专业的 API 测试工具执行，而不是用 Playwright 的 request API。

**Why this priority**: API 专用框架（Postman、REST Client）提供更直观的 API 测试体验（环境变量管理、请求历史、可视化响应查看）。但 P1 阶段 Playwright 已能覆盖 API 测试基本需求，API 框架支持可作为优化功能在 P2 添加。

**Independent Test**: 可以通过准备一个仅含 api assertions 的场景（如 `E2E-API-AUTH-001.yaml`），调用 `/e2e-test-generator generate E2E-API-AUTH-001 --framework postman`，验证生成符合 Postman Collection v2.1 格式的 JSON 文件，包含正确的请求方法、URL、headers、断言脚本。

**Acceptance Scenarios**:

1. **Given** 场景仅包含 api 类型 assertions，**When** 调用 `/e2e-test-generator generate --framework postman` 时，**Then** 生成 `.postman_collection.json` 文件，包含场景所有 API 请求和 pm.test() 断言
2. **Given** 场景仅包含 api 类型 assertions，**When** 调用 `/e2e-test-generator generate --framework restclient` 时，**Then** 生成 `.http` 文件，包含所有 HTTP 请求和响应断言注释
3. **Given** 场景包含 testdata_ref 引用，**When** 生成 Postman collection 时，**Then** collection 包含环境变量占位符（如 `{{baseUrl}}`、`{{authToken}}`）和预请求脚本加载测试数据

---

### Edge Cases

- ~~场景包含未知的 action 类型时如何处理(生成 TODO 注释还是报错)?~~ **[已解决]** 生成 TODO 注释，支持通过 action-mappings.yaml 自定义扩展
- 场景引用的页面对象方法参数不匹配时如何提示?
- ~~测试脚本文件已存在且被手动大幅修改时,如何避免覆盖丢失代码?~~ **[已解决]** 智能检测修改程度，大幅改动时生成 .spec.new.ts 供手动合并
- 场景的 steps 数量超过 50 个时,生成的测试脚本是否需要拆分为多个 test case?
- 场景包含异步等待逻辑(如 wait action)时如何转换为 Playwright 的 waitFor?
- 批量生成时遇到文件写入权限错误如何处理?
- 生成的测试脚本中 import 语句路径错误时如何调试?

## Requirements *(mandatory)*

### Functional Requirements

#### Skill 基础功能

- **FR-001**: Skill 必须通过 `/e2e-test-generator` 命令调用,支持子命令(generate, batch, update, validate)
- **FR-002**: Skill 必须读取指定的场景 YAML 文件,解析 scenario_id, steps, assertions 等字段
- **FR-003**: Skill 必须支持测试框架选择机制，P1 阶段支持 Playwright 框架，P2 阶段扩展支持 Postman、REST Client、Jest/Vitest API 测试
- **FR-003a**: P1 阶段：默认使用 Playwright 框架生成 TypeScript 测试脚本（支持 UI 和 API 测试）
- **FR-003b**: P1 阶段：当场景包含 ui 类型 assertions 时，生成 Playwright UI 测试代码（页面对象模式）
- **FR-003c**: P1 阶段：当场景仅包含 api 类型 assertions 时，生成 Playwright API 测试代码（使用 request API）
- **FR-003d**: P2 阶段：用户可通过 `--framework <name>` 参数显式指定框架（如 `--framework postman`、`--framework restclient`）
- **FR-003e**: P2 阶段：支持生成 Postman Collection v2.1 格式（.postman_collection.json）和 REST Client .http 文件
- **FR-004**: 生成的测试脚本必须存储在 `scenarios/<module>/` 目录下,与场景 YAML 文件并列
- **FR-005**: 测试脚本文件命名格式为 `<scenario_id>.spec.ts`（Playwright/Jest）或 `<scenario_id>.postman_collection.json`（Postman）或 `<scenario_id>.http`（REST Client）

#### 测试脚本生成

- **FR-006**: Skill 必须生成包含 test describe block 的测试脚本,describe 名称来自场景 title
- **FR-007**: Skill 必须生成 beforeEach hook,包含测试数据加载和页面导航逻辑
- **FR-008**: Skill 必须生成 test case,包含场景 steps 对应的页面对象方法调用
- **FR-009**: Skill 必须生成断言代码,根据 assertions 类型(ui/api)选择 Playwright 或 API 断言方法
- **FR-010**: 生成的脚本必须包含必要的 import 语句(页面对象、测试数据、工具函数)

#### 步骤转换

- **FR-011**: Skill 必须将 action: login 转换为 `await loginPage.login(testData.user)`
- **FR-012**: Skill 必须将 action: navigate 转换为 `await page.goto(testData.url)`
- **FR-013**: Skill 必须将 action: click 转换为 `await page.click(testData.selector)`
- **FR-014**: Skill 必须将 action: input 转换为 `await page.fill(testData.selector, testData.value)`
- **FR-015**: Skill 必须将 action: browse_product 转换为 `await productPage.browseProduct(testData.product)`
- **FR-016**: Skill 必须将 action: add_to_cart 转换为 `await cartPage.addToCart(testData.product, testData.quantity)`
- **FR-017**: Skill 必须将 action: create_order 转换为 `await orderPage.createOrder(testData.orderParams)`
- **FR-018**: Skill 必须将未识别的 action 转换为 TODO 注释,提示 QA 工程师补充实现
- **FR-018a**: Skill 必须支持从配置文件（如 `.claude/skills/e2e-test-generator/action-mappings.yaml`）读取自定义 action 映射规则
- **FR-018b**: 自定义 action 映射配置必须包含：action 名称、生成的代码模板、参数占位符
- **FR-018c**: 自定义 action 映射优先级高于内置 actions，允许团队覆盖默认行为

#### 断言转换

- **FR-019**: Skill 必须将 ui/element_visible 断言转换为 `await expect(page.locator(selector)).toBeVisible()`
- **FR-020**: Skill 必须将 ui/toast_message_shown 断言转换为 `await expect(page.locator('.toast')).toContainText(expectedMessage)`
- **FR-021**: Skill 必须将 api/response_status_is 断言转换为 `expect(response.status).toBe(expectedStatus)`
- **FR-022**: Skill 必须将 api/database_field_equals 断言转换为 API 请求和字段验证代码
- **FR-023**: Skill 必须将未识别的 assertion 转换为 TODO 注释

#### 测试数据集成（T004 Fixtures）

- **FR-024**: Skill 必须检测场景的 testdata_ref 是否为 testdata blueprint ID（格式：TD-<ENTITY>-<ID>）,如果是,则集成 T004 生成的 fixture；如果不是（如旧式 `bomTestData.scenario_001`）,则降级为传统 loadTestData() 调用
- **FR-025**: Skill 必须生成 fixture 导入语句,格式为 `import { test } from '<相对路径>/tests/fixtures/testdata/testdata-<BLUEPRINT_ID>.fixture'`,并替换测试脚本中的 `import { test } from '@playwright/test'`
- **FR-026**: Skill 必须在测试函数签名中添加 fixture 参数,格式为 `test('...', async ({ page, <BLUEPRINT_ID> }) => {...})`,其中 `<BLUEPRINT_ID>` 为去除连字符的 ID（如 TD-INVENTORY-BOM-WHISKEY-COLA → TD_INVENTORY_BOM_WHISKEY_COLA）
- **FR-027**: 如果 testdata_ref 对应的 fixture 文件不存在（路径 `tests/fixtures/testdata/testdata-<BLUEPRINT_ID>.fixture.ts`）,Skill 必须在生成的脚本中添加 TODO 注释,提示使用 `/testdata-planner create` 创建蓝图并生成 fixture
- **FR-027a**: Skill 必须支持多个 testdata_ref 引用（从 preconditions、steps.params 等字段提取）,生成多个 fixture 导入和参数声明
- **FR-027b**: Skill 必须在测试脚本中使用 fixture 提供的数据字段（如 `TD_INVENTORY_BOM_WHISKEY_COLA.whiskeySkuId`）替代硬编码的 testdata 引用

#### 页面对象生成

- **FR-028**: Skill 必须检测场景使用的页面对象(如 LoginPage, ProductPage)
- **FR-029**: 如果页面对象文件不存在,Skill 必须生成页面对象类模板
- **FR-030**: 页面对象模板必须包含场景中用到的方法签名和 TODO 注释
- **FR-031**: 页面对象文件命名格式为 `<PageName>Page.ts`,存储在 `frontend/tests/e2e/pages/` 目录

#### 批量生成

- **FR-032**: Skill 必须支持 `/e2e-test-generator batch --module <module>` 命令
- **FR-033**: 批量生成必须处理指定模块 `scenarios/<module>/` 目录下的所有场景 YAML 文件
- **FR-034**: 批量生成遇到错误场景时必须跳过并记录到报告,继续处理其他场景
- **FR-035**: 批量生成完成后必须输出报告,包含成功数量、失败列表和存储路径

#### 脚本更新

- **FR-036**: Skill 必须支持 `/e2e-test-generator update <scenario-id>` 命令
- **FR-037**: 更新模式必须读取现有测试脚本，计算文件哈希或扫描特定代码标记（如 `// CUSTOM CODE START`）检测手动修改程度
- **FR-038**: 若文件修改程度低（变更行数 < 30% 或仅在标记区域外），更新模式必须智能更新场景相关部分（steps, assertions），保留 CUSTOM CODE 标记内的代码
- **FR-039**: 若文件大幅修改（变更行数 ≥ 30% 或结构变化），更新模式必须拒绝更新并生成新文件（如 `<scenario_id>.spec.new.ts`），提示用户手动合并或使用 diff 工具对比
- **FR-039a**: 更新模式必须在生成的测试脚本中添加标记注释（`// AUTO-GENERATED: Do not modify above this line` 和 `// CUSTOM CODE START`），明确自动生成和手动代码边界

#### 脚本验证

- **FR-040**: Skill 必须支持 `/e2e-test-generator validate <scenario-id>` 命令
- **FR-041**: 验证必须检查生成的测试脚本 TypeScript 语法正确性
- **FR-042**: 验证必须检查测试脚本能通过 `npx playwright test --dry-run` 校验
- **FR-043**: 验证必须检查页面对象导入路径正确性

### Key Entities

- **e2e-test-generator Skill (E2E测试生成器技能)**: Claude Code skill,通过 `/e2e-test-generator` 命令调用,将场景 YAML 文件转换为可执行的测试脚本，支持多种测试框架（Playwright、Postman、REST Client 等）
- **Test Framework (测试框架)**: 支持的测试框架类型，包括 Playwright（UI 测试）、Postman（API 集合）、REST Client（HTTP 文件）、Jest/Vitest（API 单元测试）
- **Generated Test Script (生成的测试脚本)**: 根据框架类型生成不同格式的文件：`.spec.ts`（Playwright/Jest）、`.postman_collection.json`（Postman）、`.http`（REST Client）
- **Page Object (页面对象)**: 封装页面交互逻辑的 TypeScript 类,包含页面元素定位和操作方法,遵循页面对象模式最佳实践（仅 Playwright 框架使用）
- **Test Data Loader (测试数据加载器)**: 根据 testdata_ref 引用加载测试数据的工具函数
- **Action Mapping (动作映射)**: 场景 YAML 中 action 类型到测试框架方法的映射规则（如 login → loginPage.login() for Playwright，或 POST /auth/login for REST）
- **Assertion Mapping (断言映射)**: 场景 YAML 中 assertion 类型到测试框架断言方法的映射规则（如 element_visible → toBeVisible() for Playwright，response_status_is → pm.response.to.have.status(200) for Postman）
- **Framework Detector (框架检测器)**: 分析场景 YAML 的 assertions 类型自动选择合适框架的逻辑组件
- **Action Mappings Configuration (动作映射配置文件)**: YAML 格式的配置文件（action-mappings.yaml），允许团队自定义 action → 代码模板的映射规则，包含 action 名称、代码模板、参数占位符

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: QA 工程师使用 `/e2e-test-generator generate` 命令可以在 1 分钟内将一个场景 YAML 转换为可执行的测试脚本
- **SC-002**: 生成的测试脚本 100% 通过 TypeScript 编译检查(无语法错误)
- **SC-003**: 生成的测试脚本 90% 能通过 `npx playwright test --dry-run` 校验(无 import 错误或页面对象缺失)
- **SC-004**: 批量生成 50 个场景的测试脚本在 3 分钟内完成
- **SC-005**: 生成的测试脚本中测试数据引用准确率 100%(testdata_ref 正确转换为 import 和变量引用)
- **SC-006**: 生成的测试脚本能覆盖场景 YAML 中 95% 以上的 steps 和 assertions(未识别的转换为 TODO)
- **SC-007**: 页面对象模板生成准确率 90%(包含场景用到的方法签名)
- **SC-008**: 更新模式下保留手动代码的准确率 85%(避免覆盖自定义断言和辅助逻辑)

## Dependencies *(optional)*

- **T001-e2e-scenario-author**: 依赖 T001 skill 生成的场景 YAML 文件作为输入
- **T004-e2e-testdata-planner** (强依赖): 依赖 T004 skill 生成的 Playwright fixtures 提供测试数据生命周期管理（setup/teardown）。当场景引用 testdata blueprint ID（格式：TD-<ENTITY>-<ID>）时，必须使用 T004 生成的 fixture 文件（路径：`tests/fixtures/testdata/testdata-<BLUEPRINT_ID>.fixture.ts`）。
- **Testing Frameworks**: 依赖项目已配置至少一种测试框架（Playwright、Postman、REST Client、Jest/Vitest）
- **Playwright Framework** (可选): 如需生成 Playwright 脚本，依赖 Playwright 测试框架已在项目中配置(package.json, playwright.config.ts)
- **Postman** (可选): 如需生成 Postman collections，依赖 Postman 或 Newman CLI 可访问
- **Test Data Management**: 依赖项目存在测试数据管理机制,testdata_ref 引用的数据可访问（通过 T004 fixtures 或传统 loadTestData() 函数）

## Assumptions *(optional)*

- 项目已配置至少一种测试框架（Playwright、Postman、REST Client、Jest/Vitest）
- 对于 Playwright 框架：项目包含 playwright.config.ts 配置文件，测试脚本使用 TypeScript 编写，页面对象模式已作为最佳实践被团队采纳
- 对于 Postman 框架：团队熟悉 Postman Collections v2.1 格式，可使用 Postman 或 Newman 运行生成的集合
- 对于 REST Client 框架：团队使用 VS Code REST Client 插件或类似工具执行 .http 文件
- 测试数据文件存储在统一位置（如 `frontend/tests/testdata/` 或 `scenarios/testdata/`），支持通过 testdata_ref 引用
- 场景 YAML 文件遵循 T001 定义的 E2EScenarioSpec 规范
- QA 团队熟悉所选测试框架的基本概念和 API
- 生成的测试脚本可能需要 QA 工程师补充实现细节（如 Playwright 页面对象实现、Postman 环境变量配置）
- Skill 运行环境支持文件系统读写、YAML 解析和多种格式代码生成（TypeScript、JSON、HTTP）

## Out of Scope *(optional)*

- 测试脚本的实际执行(由 Playwright 测试运行器负责)
- 测试数据的创建和管理(由测试数据工具负责)
- 页面对象的完整实现(Skill 仅生成模板骨架)
- 测试报告和结果分析
- 测试脚本的性能优化建议
- 与 CI/CD 流水线的集成
- 测试脚本的可视化编辑器
- 跨浏览器兼容性测试代码生成(Playwright 自动支持)

## Clarifications *(session history)*

### Clarification Session - 2025-12-30

**Q1: 测试脚本存储位置 - 应该放在 scenarios 文件夹下还是 frontend/tests?**

**Answer**: `scenarios/<module>/<scenario_id>.spec.ts` (与 YAML 文件并列)

**Rationale**:
- 测试脚本与场景 YAML 文件在同一目录,便于版本控制和同步更新
- 避免跨目录维护,场景定义和测试实现高内聚
- 简化文件查找,一个模块的所有测试相关文件在同一位置
- 符合"统一管理"的用户需求

**Q2: 测试框架支持范围 - 仅支持 Playwright 还是支持多种测试框架（Playwright、Postman、REST Client 等）？**

**Answer**: 多框架支持，显式选择

**Rationale**:
- 允许 QA 团队为不同场景选择合适的工具（UI 流程用 Playwright，纯 API 测试用 Postman/REST）
- Skill 可以从 YAML 的 assertions 类型自动检测框架（ui → Playwright，纯 api → Postman/REST）
- 用户也可通过 `--framework` 参数显式指定框架
- 符合现代测试最佳实践：不同测试类型使用专用工具

**Q3: 多框架支持的实现优先级 - 是同时实现所有框架，还是分阶段实现？**

**Answer**: UI 优先，API 补充

**Rationale**:
- P1 阶段仅实现 Playwright 框架支持（UI 测试为主，API 测试也可用 Playwright 实现）
- P2 阶段添加 Postman/REST Client 等专用 API 测试框架支持
- 降低初期实现复杂度，快速验证核心功能和用户反馈
- Playwright 作为通用框架可覆盖大部分测试场景，为 API 框架开发争取时间

**Q4: 未识别 action 的处理策略 - 仅支持预定义 actions 还是提供扩展机制？**

**Answer**: 明确边界，提供扩展机制

**Rationale**:
- 内置常用 actions（login、navigate、click、input、browse_product、add_to_cart、checkout、create_order 等 10-15 个）
- 未识别的 action 生成 TODO 注释提示 QA 工程师补充实现
- 提供扩展配置文件（如 `action-mappings.yaml`）让团队自定义 action → Playwright 代码的映射规则
- 平衡开箱即用和可扩展性，避免 Skill 代码无限膨胀

**Q5: 文件已存在且被手动大幅修改时的更新策略 - 如何避免覆盖丢失代码？**

**Answer**: 智能检测 + 警告提示

**Rationale**:
- 使用文件哈希或特定代码标记（如 `// CUSTOM CODE START ... // CUSTOM CODE END`）检测手动修改程度
- 若改动小（仅断言调整、变量重命名等）则智能更新，保留自定义部分
- 若大幅改动（结构变化、大量新增代码）则拒绝更新，建议用户手动合并或生成新文件（.spec.new.ts）作对比
- 平衡代码安全和自动化便利性，明确提示用户下一步操作
