# Feature Specification: E2E Test Runner Skill

**Feature Branch**: `T003-e2e-runner`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "通过conext7 了解claude skills 规范，这个spec是要开发一个 skill e2e-runner：统一执行入口（npx playwright test ...），落盘结果与报告, 该skill 依赖于 test-scenario-author 和 e2e-test-generator, Contract: E2ERunConfig（运行配置）用于多环境复用同一套场景资产与测试脚本"

<!--
  规格编号格式说明 (Spec ID Format):
  T003 其中:
  - T: 工具/基础设施 (Tool/Infrastructure)
  - 003: 模块内递增的三位数字

  该 skill 是 Claude Code Skills 体系的一部分，必须遵循 Principle 8 的所有规范。
-->

## Clarifications

### Session 2025-12-30

- Q: Browser Support Scope - Should the skill support multi-browser testing (Chromium, Firefox, Mobile Chrome) or focus on Chrome-only initially? → A: Chrome-only initially (simplify to single browser support, remove multi-browser complexity from MVP)

## User Scenarios & Testing

### User Story 1 - Execute E2E Tests with Environment Configuration (Priority: P1)

作为 QA 工程师或开发人员，我需要能够使用统一的命令执行 E2E 测试，并指定目标环境配置，以便在不同环境（staging、UAT、production）复用同一套测试脚本。

**Why this priority**: 这是 skill 的核心价值 - 提供统一的测试执行入口。没有这个功能，团队无法标准化 E2E 测试流程。这是 MVP 的最小可行功能。

**Independent Test**: 可以通过以下方式独立测试：
1. 创建一个简单的运行配置文件（指定环境 URL 和基本参数）
2. 调用 `/e2e-runner run --config saas-staging.json`
3. 验证 Playwright 测试被正确执行并生成报告

**Acceptance Scenarios**:

1. **Given** 我有一个 E2ERunConfig 配置文件（包含 env_profile、baseURL）
   **When** 我运行 `/e2e-runner run --config saas-staging.json`
   **Then** 系统应该使用指定的配置执行 Playwright 测试（使用 Chrome 浏览器）

2. **Given** 配置文件指定了 baseURL 为 `https://staging.example.com`
   **When** 测试执行时
   **Then** 所有测试应该针对该 URL 运行（而非硬编码在测试脚本中的 URL）

3. **Given** 配置文件指定了 retries=2 和 workers=4
   **When** 测试执行时
   **Then** Playwright 应该使用这些参数（失败重试 2 次，4 个并发 worker）

4. **Given** 测试执行完成
   **When** 我查看输出
   **Then** 系统应该显示测试结果摘要（通过/失败数量、执行时间）

---

### User Story 2 - Generate and Persist Test Reports (Priority: P1)

作为 QA 工程师，我需要系统自动生成并保存测试报告到指定目录，以便后续分析测试结果和追溯历史执行记录。

**Why this priority**: 测试报告是测试执行的核心输出，没有报告则无法分析测试结果。这与 US1 同等重要，是 MVP 的必需功能。

**Independent Test**: 可以通过以下方式独立测试：
1. 运行测试并指定 report_output_dir
2. 验证报告文件（HTML、JSON、截图）被正确生成
3. 验证报告目录结构符合预期

**Acceptance Scenarios**:

1. **Given** 配置文件指定了 `report_output_dir: "./reports/run-2025-12-30-14-30"`
   **When** 测试执行完成
   **Then** 系统应该在该目录生成 Playwright HTML 报告、JSON 结果、截图和视频（如果测试失败）

2. **Given** 两次测试运行使用不同的 report_output_dir
   **When** 我查看报告目录
   **Then** 每次运行的报告应该独立存储，不会互相覆盖

3. **Given** 测试运行包含失败的测试
   **When** 我打开 HTML 报告
   **Then** 报告应该包含失败详情、错误信息、截图和执行追踪

4. **Given** 测试运行成功完成
   **When** 我查看 report_output_dir
   **Then** 目录应该包含：
   - HTML 报告（index.html）
   - JSON 结果文件（results.json）
   - 截图/视频（如果配置了）
   - 测试执行日志

---

### User Story 3 - Manage Environment Credentials Securely (Priority: P1)

作为 QA 工程师，我需要能够通过 credentials_ref 引用环境凭据（而不是硬编码在配置文件中），以确保敏感信息不会泄露到代码仓库。

**Why this priority**: 安全性是关键需求。如果凭据硬编码在配置文件中，会导致严重的安全风险。这是 P1 功能，因为它直接影响系统安全性。

**Independent Test**: 可以通过以下方式独立测试：
1. 创建 credentials 文件（username/password）
2. 在运行配置中使用 `credentials_ref: "credentials/saas-staging.json"`
3. 验证测试可以成功登录（凭据被正确读取）
4. 验证配置文件本身不包含明文密码

**Acceptance Scenarios**:

1. **Given** 配置文件包含 `credentials_ref: "credentials/saas-staging.json"`
   **When** 测试执行时
   **Then** 系统应该从指定路径读取凭据，并将其传递给测试脚本

2. **Given** credentials 文件包含 `{ "username": "test@example.com", "password": "secret123" }`
   **When** 测试需要登录时
   **Then** 测试应该使用这些凭据成功登录

3. **Given** credentials_ref 指向的文件不存在
   **When** 测试执行时
   **Then** 系统应该报错并提示凭据文件缺失（而不是静默失败）

4. **Given** 我需要切换到不同环境
   **When** 我更改配置文件中的 credentials_ref
   **Then** 测试应该使用新的凭据（无需修改测试脚本）

---

### User Story 4 - Integration with test-scenario-author and e2e-test-generator (Priority: P2)

作为开发人员，我希望 e2e-runner 能够自动发现并执行由 test-scenario-author 创建、e2e-test-generator 生成的测试脚本，以实现端到端的测试工作流集成。

**Why this priority**: 这是 skill 集成的增强功能，可以提升工作流效率，但不是核心执行功能的阻塞需求。可以先手动指定测试路径（P1），后续实现自动发现（P2）。

**Independent Test**: 可以通过以下方式独立测试：
1. 使用 test-scenario-author 创建场景 YAML
2. 使用 e2e-test-generator 生成 Playwright 测试
3. 使用 e2e-runner 执行生成的测试
4. 验证整个工作流无缝衔接

**Acceptance Scenarios**:

1. **Given** 我使用 `/test-scenario-author create` 创建了场景 YAML
   **And** 我使用 `/e2e-test-generator generate` 生成了 Playwright 测试
   **When** 我运行 `/e2e-runner run --config saas-staging.json`
   **Then** 系统应该自动发现并执行这些生成的测试

2. **Given** 测试脚本路径为 `scenarios/inventory/E2E-INVENTORY-001.spec.ts`
   **When** 配置文件未显式指定测试路径
   **Then** 系统应该按照约定自动发现该路径下的测试脚本

3. **Given** 测试脚本包含 testdata_ref（由 e2e-test-generator 生成）
   **When** 测试执行时
   **Then** 系统应该正确加载 testdata 模块（与生成的测试兼容）

---

### User Story 5 - Validate Run Configuration Before Execution (Priority: P3)

作为 QA 工程师，我希望在测试执行前验证配置文件的格式和完整性，以便及早发现配置错误。

**Why this priority**: 配置验证可以提升用户体验，但不是核心功能。可以先依赖 Playwright 的错误提示（P1），后续增强为更友好的验证（P3）。

**Independent Test**: 可以通过以下方式独立测试：
1. 创建包含错误的配置文件（缺失必需字段、格式错误）
2. 运行 `/e2e-runner validate --config invalid.json`
3. 验证系统给出清晰的错误提示

**Acceptance Scenarios**:

1. **Given** 配置文件缺少必需字段 `baseURL`
   **When** 我运行 `/e2e-runner validate --config invalid.json`
   **Then** 系统应该报错："Configuration error: 'baseURL' is required"

2. **Given** 配置文件的 `retries` 字段是字符串（应该是数字）
   **When** 我运行 validate 命令
   **Then** 系统应该报错："Configuration error: 'retries' must be a number"

3. **Given** credentials_ref 指向不存在的文件
   **When** 我运行 validate 命令
   **Then** 系统应该警告："Warning: credentials file not found at 'credentials/missing.json'"

---

### Edge Cases

- **并发测试冲突**: 如果两个测试运行同时修改同一测试数据，如何处理？
  - **建议**: 使用独立的测试数据（通过 testdata_ref 隔离），或使用数据库事务回滚

- **测试执行超时**: 如果单个测试运行时间过长，如何处理？
  - **建议**: 在 E2ERunConfig 中添加 `timeout` 配置（默认 30 秒/测试）

- **报告目录已存在**: 如果 report_output_dir 已存在（上次运行残留），是否覆盖？
  - **建议**: 报错并要求用户使用唯一的目录名（或添加 `--force` 标志覆盖）

- **凭据文件权限**: 如果 credentials 文件权限过于开放（如 777），是否警告？
  - **建议**: 检查文件权限，如果 > 600 则警告安全风险

- **环境 URL 无法访问**: 如果 baseURL 配置的环境不可达，如何处理？
  - **建议**: 在测试执行前进行健康检查（HTTP GET baseURL），如果失败则提前终止

- **Playwright 版本不兼容**: 如果本地 Playwright 版本与生成的测试不兼容，如何处理？
  - **建议**: 在 skill.md 中明确依赖版本要求（如 Playwright >= 1.40）

## Requirements

### Functional Requirements

#### Core Execution (P1)

- **FR-001**: System MUST 接受 E2ERunConfig 配置文件作为输入，包含以下必需字段：
  - `env_profile`: 环境标识符（如 "saas-staging", "onprem-uat"）
  - `baseURL`: 目标环境的基础 URL
  - `report_output_dir`: 报告输出目录路径（必须唯一）

- **FR-002**: System MUST 使用配置文件中的 `baseURL` 覆盖测试脚本中的硬编码 URL

- **FR-003**: System MUST 执行 Playwright 测试并将结果输出到 `report_output_dir`（默认使用 Chrome 浏览器）

- **FR-004**: System MUST 支持以下可选配置参数：
  - `retries`: 测试失败重试次数（默认 0）
  - `workers`: 并发 worker 数量（默认 CPU 核心数）
  - `timeout`: 单个测试超时时间（默认 30000ms）

- **FR-005**: System MUST 在 `report_output_dir` 生成以下报告文件：
  - Playwright HTML 报告（index.html）
  - JSON 格式的测试结果（results.json）
  - 失败测试的截图和视频（如果配置了）

#### Security & Credentials (P1)

- **FR-006**: System MUST 支持 `credentials_ref` 字段，引用外部凭据文件（JSON 格式）

- **FR-007**: System MUST 从 `credentials_ref` 指定的文件读取凭据，并将其注入测试环境变量

- **FR-008**: System MUST 禁止在配置文件中明文存储密码或 API 密钥

- **FR-009**: System MUST 在凭据文件缺失时报错并终止执行

#### Integration (P2)

- **FR-010**: System MUST 自动发现 `scenarios/` 目录下由 e2e-test-generator 生成的 `.spec.ts` 文件

- **FR-011**: System MUST 支持指定测试路径（glob 模式，如 `scenarios/inventory/**/*.spec.ts`）

- **FR-012**: System MUST 与 e2e-test-generator 生成的 testdata 加载逻辑兼容

#### Validation (P3)

- **FR-013**: System SHOULD 提供 `validate` 命令，验证配置文件格式和完整性

- **FR-014**: System SHOULD 在测试执行前检查 baseURL 的可达性

- **FR-015**: System SHOULD 在报告目录已存在时警告用户（避免覆盖）

### Key Entities

- **E2ERunConfig**: 测试运行配置对象
  - `env_profile` (string): 环境标识符
  - `baseURL` (string): 目标环境 URL
  - `credentials_ref` (string, optional): 凭据文件路径
  - `retries` (number, optional): 失败重试次数
  - `workers` (number, optional): 并发 worker 数
  - `timeout` (number, optional): 测试超时时间（ms）
  - `report_output_dir` (string): 报告输出目录
  - `testMatch` (string, optional): 测试文件匹配模式（默认 `scenarios/**/*.spec.ts`）

- **CredentialsFile**: 凭据文件对象
  - `env_profile` (string): 环境标识符（必须与 E2ERunConfig 的 env_profile 匹配）
  - `users[]` (array, optional): 用户凭据列表
    - `role` (string): 角色名称
    - `username` (string): 用户名
    - `password` (string): 密码
    - `display_name` (string, optional): 显示名称
  - `api_keys[]` (array, optional): API 密钥列表
    - `service` (string): 服务名称
    - `api_key` (string): API 密钥
    - `api_secret` (string, optional): API 密钥

- **TestReport**: 测试报告对象
  - `metadata` (object): 元数据
    - `env_profile` (string): 环境标识符
    - `timestamp` (string): 执行时间戳
    - `duration` (number): 总执行时间（ms）
    - `playwright_version` (string, optional): Playwright 版本
  - `stats` (object): 统计信息
    - `total` (number): 总测试数
    - `passed` (number): 通过数
    - `failed` (number): 失败数
    - `skipped` (number): 跳过数
    - `flaky` (number, optional): 不稳定测试数
  - `artifacts` (object): 报告文件路径
    - `html_report` (string): HTML 报告路径
    - `json_results` (string): JSON 结果路径
    - `traces_dir` (string, optional): 追踪文件目录
    - `screenshots_dir` (string, optional): 截图目录
    - `videos_dir` (string, optional): 视频目录
  - `failures[]` (array, optional): 失败测试列表
    - `file` (string): 测试文件
    - `title` (string): 测试标题
    - `error` (string): 错误信息
    - `stack` (string, optional): 错误堆栈
    - `screenshot` (string, optional): 截图路径
    - `video` (string, optional): 视频路径

## Success Criteria

### Measurable Outcomes

- **SC-001**: 用户可以在 1 分钟内完成运行配置文件的创建和测试执行（从创建配置到查看报告）

- **SC-002**: 同一套测试脚本可以在至少 3 个不同环境（staging, UAT, production）成功执行，无需修改测试代码

- **SC-003**: 测试报告生成时间不超过测试执行时间的 5%（报告生成不应成为性能瓶颈）

- **SC-004**: 95% 的配置错误在测试执行前被发现（通过 validate 命令）

- **SC-005**: 凭据文件从未出现在 Git 提交记录中（通过 credentials_ref 机制确保）

- **SC-006**: 测试执行失败时，用户可以在报告中找到失败原因（包括截图、错误堆栈、执行追踪）

- **SC-007**: 集成工作流（scenario-author → test-generator → e2e-runner）的端到端执行时间不超过 5 分钟（对于 10 个测试场景）

- **SC-008**: 并发测试（workers > 1）相比串行测试（workers = 1）的执行时间减少至少 40%

## Assumptions

1. **Playwright 已安装**: 假设项目中已安装 Playwright 及其依赖（`@playwright/test` >= 1.40）

2. **测试脚本格式**: 假设测试脚本由 e2e-test-generator 生成，遵循标准 Playwright 测试格式

3. **Node.js 环境**: 假设运行环境为 Node.js 18+

4. **文件系统访问**: 假设 skill 有权限读取配置文件和写入报告目录

5. **网络连接**: 假设测试执行环境可以访问目标环境 baseURL

6. **凭据文件格式**: 假设凭据文件为 JSON 格式，包含 `env_profile` 和 `users`/`api_keys` 数组

7. **报告存储**: 假设本地文件系统有足够空间存储报告（包括截图和视频）

8. **Git 配置**: 假设 `.gitignore` 已配置忽略 credentials 目录和报告目录

9. **浏览器支持**: MVP 阶段仅支持 Chrome 浏览器，多浏览器支持（Firefox、Safari、Edge）不在初始范围内

## Dependencies

- **test-scenario-author (T001)**: 提供场景 YAML 文件作为测试输入
- **e2e-test-generator (T002)**: 生成 Playwright 测试脚本供 e2e-runner 执行
- **Playwright (@playwright/test)**: 底层测试执行引擎
- **Node.js**: 运行时环境

## Out of Scope

以下功能不在本 spec 范围内：

- **多浏览器支持**: MVP 阶段不支持 Firefox、Safari、Edge 等其他浏览器（仅支持 Chrome）
- **移动设备模拟**: 不支持移动视口或设备仿真（仅桌面 Chrome）
- **CI/CD 集成**: 不提供 GitHub Actions/Jenkins 配置（用户自行集成）
- **测试数据管理**: 不负责创建或清理测试数据（由测试脚本自行处理）
- **分布式执行**: 不支持跨多台机器的分布式测试执行
- **实时监控**: 不提供测试执行过程的实时 dashboard
- **报告聚合**: 不提供跨多次运行的报告聚合和趋势分析
- **自动重试策略**: 不提供智能重试（如仅重试 flaky tests），只支持简单的固定次数重试
- **测试优先级**: 不支持基于优先级的测试执行顺序（按文件顺序执行）

## Constraints

- **浏览器限制**: MVP 阶段仅支持 Chrome 浏览器（不支持 projects 数组配置多浏览器）
- **报告目录唯一性**: 每次运行必须使用唯一的 `report_output_dir`，避免覆盖历史报告
- **凭据文件安全**: 凭据文件不得提交到代码仓库，必须在 `.gitignore` 中排除
- **配置文件格式**: 仅支持 JSON 格式的配置文件（不支持 YAML 或 TOML）
- **Playwright 版本**: 要求 Playwright 版本 >= 1.40（以支持最新的报告功能）
- **测试路径约定**: 默认扫描 `scenarios/` 目录，其他路径需显式指定

## Risks

1. **配置复杂性**: E2ERunConfig 的字段较多，用户可能配置错误
   - **缓解**: 提供详细的 quickstart.md 和配置示例

2. **凭据泄露**: 用户可能误将凭据文件提交到 Git
   - **缓解**: 在 skill.md 中明确警告，提供 `.gitignore` 模板

3. **环境差异**: 不同环境的行为差异（如 API 速率限制）可能导致测试不稳定
   - **缓解**: 在配置中支持环境特定的 timeout 和 retry 策略

4. **报告存储**: 长期积累的报告文件可能占用大量磁盘空间
   - **缓解**: 在 skill.md 中建议用户定期清理历史报告

## Document Metadata

- **Spec Version**: 1.1.0
- **Last Updated**: 2025-12-30
- **Author**: Claude (AI-generated from user description)
- **Review Status**: Clarified (1 question resolved)
