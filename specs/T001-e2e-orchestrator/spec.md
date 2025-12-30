# 功能规格说明：E2E 测试编排器

**功能分支**: `T001-e2e-orchestrator`
**创建时间**: 2025-12-30
**状态**: 草稿
**输入**: 用户描述："e2e-orchestrator：把'要跑哪些 E2E 场景'编排成一次可执行的 Playwright 运行（projects/重试/并发/数据准备），并产出独立的 HTML 报告包与摘要。"

<!--
  规格编号格式说明 (Spec ID Format):
  T001 - Tools/Infrastructure module (T###)
-->

## 概述

E2E 测试编排器是一个 Claude Code skill，通过编排多个专业 skill 来协调端到端测试工作流，执行 Playwright 测试运行。它管理场景选择、配置组装、测试执行和报告生成，产出包含执行摘要的完整 HTML 报告。

**一句话总结**: 将"要跑哪些 E2E 场景"编排成可执行的 Playwright 运行（包含 projects/重试/并发/数据准备），产出独立的 HTML 报告包与摘要。

## Clarifications

### Session 2025-12-30

- Q: 用户输入约束 → A: 不需要冒烟测试，仅支持 Chrome 浏览器
- Q: Skill 编排顺序的灵活性 → A: 固定顺序但允许部分跳过 - 用户可通过参数（如 `--skip-validation`）跳过特定步骤
- Q: 跨系统测试中服务启动的责任归属 → A: 编排器负责启动服务 - orchestrator 检测场景需要的系统（C端/B端），自动启动对应的 dev servers
- Q: 未创建依赖 skills 时的处理策略 → A: 使用内置默认实现 - 当依赖 skills 不存在时，编排器使用内置的默认配置和逻辑
- Q: 测试执行失败时的重试粒度 → A: 单个测试用例级别重试 - 每个 test case 失败时独立重试，与 Playwright 原生行为一致
- Q: Skill 调用接口设计 → A: `/e2e-admin` 命令行接口 - 用户在 Claude Code 对话中输入 `/e2e-admin [参数]`，Claude 解析参数并执行 Python 脚本，与 ops-expert skill 调用方式一致
- Q: e2e-testdata-planner 集成方式（工作流步骤 2）→ A: 编排器调用 `e2e-testdata-planner` skill（如可用），否则提示用户手动运行 - 保持 skills 解耦，允许优雅降级

## 用户场景与测试 *(必填)*

### 用户故事 1 - 按模块/优先级选择场景运行 (优先级: P1)

作为 QA 工程师，我希望按模块或优先级标签选择测试场景运行，以便在不运行完整测试套件的情况下验证特定功能模块是否正常工作。

**优先级原因**: 这是最常见的用例 - 运行目标测试子集以获得快速反馈。通过启用选择性测试执行提供即时价值。

**独立测试**: 可以通过选择标记为 `module: inventory` 或 `priority: p1` 的测试并验证仅执行这些测试，产生包含正确测试计数和通过/失败状态的报告来完全测试。

**验收场景**:

1. **假设** 我有 50 个总测试场景，其中 8 个标记为 inventory 模块，**当** 我使用 `--tags module:inventory` 运行编排器时，**那么** 仅执行 8 个场景，报告显示 8/8 个场景
2. **假设** 场景按模块标记（inventory、order、product），**当** 我使用 `--tags inventory` 运行编排器时，**那么** 仅执行库存场景
3. **假设** 执行成功完成，**当** 我检查输出时，**那么** 我看到显示通过/失败计数和报告位置的摘要

---

### 用户故事 2 - 跨系统集成测试 (优先级: P1)

作为 QA 工程师，我希望运行跨越 C 端和 B 端系统的测试，并配置适当的环境，以便验证端到端业务流程是否正确工作。

**优先级原因**: 对于测试涉及多个系统的真实用户旅程至关重要。对于在生产前捕获集成问题至关重要。

**独立测试**: 可以通过运行跨系统场景（如 E2E-INVENTORY-002）并验证 C 端（端口 10086）和 B 端（端口 3000）服务都已启动、测试正确执行以及工件捕获两个系统的交互来测试。

**验收场景**:

1. **假设** 一个跨系统测试场景，**当** 编排器执行它时，**那么** C 端和 B 端开发服务器都会自动启动
2. **假设** 测试需要特定的环境 URL，**当** 编排器使用 `--env staging` 运行时，**那么** 测试使用 staging URL 而不是 localhost
3. **假设** 跨系统测试失败，**当** 我查看跟踪时，**那么** 我可以看到两个系统的交互被捕获

---

### 用户故事 3 - 并行执行以获得快速反馈 (优先级: P2)

作为 QA 工程师，我希望并行运行多个测试场景，以便更快地获得测试结果，无需等待顺序执行。

**优先级原因**: 通过减少总测试执行时间提高生产力。对于 CI/CD 管道和大型测试套件很重要。

**独立测试**: 可以通过使用 `--workers 4` 运行 10 个场景并验证执行时间明显少于顺序执行，且正确处理测试隔离来测试。

**验收场景**:

1. **假设** 我有 20 个测试场景，**当** 我使用 `--workers 4` 运行时，**那么** 测试以 4 个为一批并行执行
2. **假设** 并行执行，**当** 测试共享测试数据时，**那么** 每个测试获得隔离的数据，没有冲突
3. **假设** 并行执行中的一个测试失败，**当** 其他测试仍在运行时，**那么** 所有测试完成，报告显示准确的结果

---

### 用户故事 4 - 自动重试失败的测试 (优先级: P2)

作为 QA 工程师，我希望不稳定的测试自动重试，以便在不需要手动干预的情况下区分真实失败和瞬态问题。

**优先级原因**: 减少网络故障或时序问题导致的误报。提高测试可靠性和信心。

**独立测试**: 可以通过引入间歇性失败并验证测试重试到配置的限制，报告中显示重试尝试来测试。

**验收场景**:

1. **假设** 编排器配置为 `--retries 2`，**当** 测试失败一次然后通过时，**那么** 报告将其标记为带重试注释的通过
2. **假设** 编排器配置为 `--retries 2`，**当** 测试失败 3 次时，**那么** 报告在耗尽重试后将其标记为失败
3. **假设** 重试执行，**当** 查看报告时，**那么** 我可以看到每个测试的重试历史

---

### 用户故事 5 - 为每次运行生成隔离的报告 (优先级: P1)

作为 QA 工程师，我希望每次测试运行都产生具有自己目录的唯一报告，以便我可以比较不同运行的结果，而不会覆盖以前的报告。

**优先级原因**: 对于跟踪测试历史、调试回归和维护审计轨迹至关重要。

**独立测试**: 可以通过运行编排器两次并验证创建了两个具有唯一运行 ID 的单独报告目录，两者都可独立访问来测试。

**验收场景**:

1. **假设** 我运行编排器，**当** 执行完成时，**那么** 生成一个唯一的 run_id（基于时间戳）
2. **假设** 唯一的 run_id，**当** 生成报告时，**那么** 它存储在 `test-results/run-{run_id}/`
3. **假设** 多次运行，**当** 我列出 test-results 目录时，**那么** 我看到每次运行的单独目录，保留了工件

---

### 边缘情况

- 当没有场景匹配所选标签时会发生什么？
  - 系统应警告用户并优雅地退出，不运行测试
- 当引用场景的测试数据文件缺失时会发生什么？
  - 编排器调用 e2e-testdata-planner skill（如可用）检测缺失的数据文件并提示用户生成；若 skill 不可用，则直接提示用户手动运行 e2e-testdata-planner 或编辑 testdata/ 目录中的文件
- 当开发服务器启动失败（端口冲突）时会发生什么？
  - 系统应检测启动失败，提供包含冲突端口的清晰错误消息，并优雅地清理
- 当所有测试都失败时会发生什么？
  - 报告仍应成功生成，显示失败详细信息和堆栈跟踪
- 当磁盘空间不足以存储工件（视频、截图）时会发生什么？
  - 系统应在执行前警告并允许用户禁用昂贵的工件
- 当使用不兼容的 Playwright 配置运行时（例如，无头模式与调试标志）会发生什么？
  - 系统应验证配置并在执行前警告冲突

## 需求 *(必填)*

### 功能需求

#### 核心编排

- **FR-001**: 系统必须通过标签（例如 `--tags module:inventory,priority:p1`）或显式场景 ID 接受场景选择条件
- **FR-002**: 系统必须为每次测试执行生成唯一的 run_id（基于时间戳的 UUID）
- **FR-003**: 系统必须在执行前组装包含环境、baseURL、workers、retries 的 RunConfig（项目固定为 chromium）
- **FR-004**: 系统必须按以下固定顺序编排 skills，但允许通过参数跳过特定步骤：
  1. test-scenario-author（验证场景资源）- 可通过 `--skip-scenario-validation` 跳过
  2. e2e-testdata-planner（验证测试数据）- 可通过 `--skip-data-validation` 跳过，若 skill 不可用则提示用户手动运行
  3. e2e-test-generator（如果需要生成测试脚本）- 可通过 `--skip-generation` 跳过
  4. e2e-report-configurator（设置报告配置）- 可通过 `--skip-report-config` 跳过
  5. e2e-artifacts-policy（配置跟踪/视频/截图设置）- 可通过 `--skip-artifacts-config` 跳过
  6. e2e-runner（执行 Playwright 测试）- 必需，不可跳过
- **FR-005**: 系统必须通过 `--env` 标志支持环境切换（dev、staging、prod）
- **FR-006**: 系统必须在开始编排前验证所有先决条件 skills 是否可用（未被跳过的步骤），对于 e2e-testdata-planner，如不存在则提示用户手动运行该 skill；对于其他依赖 skill，如不存在则使用内置默认实现

#### 场景选择

- **FR-007**: 系统必须按 YAML 标签（module、channel、deploy、priority）过滤场景，不支持 smoke 标签
- **FR-008**: 系统必须支持具有 AND/OR 逻辑的多标签选择（例如 `--tags module:inventory AND priority:p1`）
- **FR-009**: 系统必须从 `scenarios/` 目录结构加载场景清单
- **FR-010**: 系统必须在执行前显示所选场景计数和列表以供用户确认

#### 配置组装

- **FR-011**: 系统必须允许配置：
  - 每个环境的 baseURL
  - 并行执行的 Worker 计数（1-10）
  - 不稳定测试的重试计数（0-3）
  - 超时值
  - 项目固定为 chromium（不支持其他浏览器）
- **FR-012**: 系统必须验证配置值在可接受的范围内
- **FR-013**: 系统必须将用户提供的配置与特定于环境的默认值合并

#### 测试执行

- **FR-014**: 系统必须在执行测试前分析所选场景，识别需要的系统（C端/B端），自动启动对应的开发服务器
- **FR-015**: 系统必须使用组装的配置通过 `npx playwright test --project=chromium` 执行 Playwright
- **FR-016**: 系统必须捕获实时执行输出并显示进度
- **FR-017**: 系统必须优雅地处理执行中断（Ctrl+C），停止开发服务器并生成部分报告
- **FR-018**: 系统必须等待所有并行 workers 完成后再最终确定报告和清理服务

#### 报告生成

- **FR-019**: 系统必须在 `test-results/run-{run_id}/index.html` 中生成 HTML 报告
- **FR-020**: 系统必须创建包含以下内容的 ReportPack：
  - HTML 报告（index.html）
  - 测试工件（根据配置的策略的跟踪、视频、截图）
  - 执行摘要 JSON
  - 运行配置快照
- **FR-021**: 系统必须提供打开报告的命令：`npx playwright show-report test-results/run-{run_id}`
- **FR-022**: 系统必须生成显示以下内容的执行摘要：
  - 执行的场景总数
  - 通过/失败/跳过计数
  - 总持续时间
  - 重试统计信息

#### 工件管理

- **FR-023**: 系统必须尊重 e2e-artifacts-policy skill 配置的工件策略
- **FR-024**: 系统必须按以下方式组织工件：
  - run_id（顶层）
  - scenario_id（第二层）
- **FR-025**: 系统必须压缩大型工件（视频、跟踪）以节省磁盘空间
- **FR-026**: 系统必须在执行前提供工件大小估计

### 关键实体

- **TestScenario**: 表示来自 YAML 文件的 E2E 测试场景
  - 属性：scenario_id、title、tags（module、channel、priority、deploy）、testdata_ref、steps、assertions
  - 关系：通过 testdata_ref 引用测试数据，包含多个测试步骤

- **RunConfig**: 单次测试执行的配置
  - 属性：run_id、environment、baseURL、workers、retries、timeout、selected_scenarios
  - 关系：每次执行生成，引用多个 TestScenarios，项目固定为 chromium

- **ReportPack**: 测试执行输出的捆绑包
  - 属性：run_id、html_report_path、artifacts_directory、summary_json、execution_timestamp、total_duration
  - 关系：包含多个 TestScenarios 的工件

- **TestArtifact**: 单个测试证据（跟踪、视频、截图）
  - 属性：artifact_type、scenario_id、file_path、file_size
  - 关系：属于一个 ReportPack，与一个 TestScenario 关联

## 成功标准 *(必填)*

### 可衡量的结果

- **SC-001**: QA 工程师可以在 30 秒内（不包括实际测试执行时间）使用单个命令执行完整的测试运行
- **SC-002**: 系统成功编排 100+ 个测试场景，并行执行（4 个 workers）而不耗尽资源
- **SC-003**: 生成的 HTML 报告无需额外工具安装即可访问和阅读
- **SC-004**: 95% 的测试运行即使在测试失败时也会产生完整的报告
- **SC-005**: 报告生成的开销占总测试执行时间的不到 5%
- **SC-006**: 用户可以在 2 分钟内从报告中定位和理解测试失败
- **SC-007**: 跨系统测试（C 端 + B 端）在 90% 的运行中可靠地执行，自动服务启动
- **SC-008**: 工件存储遵循配置的策略，100% 准确（没有缺失或额外的工件）

## 假设

1. **环境假设**：
   - Playwright 安装在前端目录（`frontend/node_modules`）
   - Node.js 版本支持 ESM 模块（v18+）
   - 有足够的磁盘空间用于工件（每次运行建议至少 1GB）

2. **Skill 依赖**：
   - test-scenario-author skill 存在且功能正常
   - e2e-test-generator skill 可以生成有效的 Playwright 测试
   - Skills 可以通过编程方式调用（不仅仅是通过聊天命令）

3. **测试数据**：
   - 测试数据文件遵循命名约定 `testdata/<dataFile>.json`
   - 测试数据是特定于环境的（dev/staging/prod 变体）

4. **浏览器可用性**：
   - Playwright Chromium 浏览器通过 `npx playwright install chromium` 预安装
   - 仅支持 Chromium 浏览器，不支持 Firefox、WebKit 或移动浏览器

5. **网络**：
   - 开发服务器可以绑定到预期的端口（C 端为 10086，B 端为 3000）
   - 没有防火墙阻止 localhost 连接

6. **默认配置**（未指定时）：
   - Workers：1（顺序执行）
   - Retries：0（无自动重试）
   - Timeout：30000ms（每个测试 30 秒）
   - Project：chromium（固定）
   - Environment：dev
   - Artifacts：on-failure（仅在测试失败时捕获跟踪、视频、截图）

## 依赖

### 内部依赖
- **test-scenario-author**（T005-e2e-scenario-author）：用于验证场景 YAML 文件存在且完整
- **e2e-testdata-planner**（计划中）：用于确保所有引用的 testdata_ref 都存在测试数据文件；编排器尝试调用该 skill，若不可用则提示用户手动运行（不使用内置实现，保持解耦）
- **e2e-test-generator**（T002-e2e-test-generator）：用于从场景生成 Playwright 测试脚本
- **e2e-report-configurator**（待创建，使用默认实现前可选）：用于配置 HTML 报告输出和样式，缺失时使用 Playwright 默认配置
- **e2e-artifacts-policy**（待创建，使用默认实现前可选）：用于定义跟踪/视频/截图捕获规则，缺失时使用 on-failure 策略
- **e2e-runner**（待创建，使用默认实现前可选）：用于使用适当的配置执行 npx playwright test，缺失时直接调用 Playwright CLI

### 外部依赖
- Playwright CLI：用于测试执行和报告生成（仅 Chromium 项目）
- Node.js：用于运行 Playwright 和支持脚本
- Git：用于分支管理和版本跟踪（可选但推荐）

## 范围外

以下内容明确排除在此功能之外：

1. **测试编写**：编写实际测试代码（由 e2e-test-generator 处理）
2. **测试数据生成**：创建测试数据 JSON 文件（由 e2e-testdata-planner 处理）
3. **CI/CD 集成**：从 GitHub Actions 自动触发（未来增强）
4. **测试结果分析**：AI 驱动的失败分析和建议（未来增强）
5. **性能测试**：负载/压力测试能力（不同工具领域）
6. **视觉回归**：截图比较和差异报告（Playwright 支持这个，但编排器不管理它）
7. **测试不稳定性检测**：跨多次运行自动识别不稳定的测试（未来增强）
8. **自定义报告模板**：用户定义的报告样式（使用 Playwright 默认 HTML 报告器）
9. **多浏览器支持**：Firefox、WebKit、移动浏览器（仅支持 Chromium）
10. **冒烟测试标签支持**：不支持 smoke 标签过滤（已移除用户故事 1）

## 相关功能

- **T005-e2e-scenario-author**：创建和管理测试场景 YAML 文件
- **T002-e2e-test-generator**：从场景生成 Playwright 测试脚本
- **T003-testdata-manager**（建议）：管理测试数据生命周期
- **Playwright Configuration**（frontend/playwright.config.ts）：定义基本 Playwright 设置
- **Cross-System Testing Guide**（scenarios/CROSS_SYSTEM_TESTING.md）：记录跨系统测试模式

## 注意事项

- 此 skill 充当协调其他专业 skills 的"指挥者"，而不是单体测试运行器
- 编排器应该是无状态的 - 所有状态都持久化在 RunConfig 和 ReportPack 中
- 具有唯一 run_id 的报告目录使并行 CI 运行不会冲突
- 默认使用保守设置（顺序执行、最小工件）以避免资源问题
- 在执行前提供清晰的错误消息和验证，防止在配置错误的运行上浪费时间
- 仅支持 Chromium 浏览器以简化实现和维护成本
