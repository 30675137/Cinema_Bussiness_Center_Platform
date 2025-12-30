# Feature Specification: E2E 报告配置器 (e2e-report-configurator)

**Feature Branch**: `T005-e2e-report-configurator`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "E2E 报告配置器 - HTML报告必选，可选JSON/JUnit格式，规范化输出目录"

<!--
  规格编号格式说明 (Spec ID Format):
  T005 - T=工具/基础设施, 005=模块内递增编号
-->

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 配置 HTML 报告输出（必选） (Priority: P1)

测试负责人希望使用 `/e2e-report-configurator` skill 配置 E2E 测试的 HTML 报告输出，指定报告格式、输出目录、包含的工件类型（截图、视频、追踪），以便在测试执行后生成统一格式的可视化测试报告。

**Why this priority**: 这是核心功能 - HTML 报告是查看测试结果的主要方式，必须有清晰的配置机制。统一的报告格式和输出目录规范能提升团队协作效率，减少 CI/CD 集成的复杂度。

**Independent Test**: 可以通过调用 `/e2e-report-configurator setup --format html --output reports/e2e`，验证生成的 Playwright 配置包含正确的 HTML reporter 配置、输出路径、工件保留策略，并且测试运行后报告文件存储在规范化目录中。

**Acceptance Scenarios**:

1. **Given** 项目已配置 Playwright 测试框架，**When** 调用 `/e2e-report-configurator setup --format html` 时，**Then** skill 更新 `playwright.config.ts` 添加 HTML reporter 配置，包含默认输出目录 `reports/e2e/html`
2. **Given** 用户指定自定义输出目录 `--output reports/custom`，**When** 生成配置时，**Then** HTML reporter 配置使用用户指定路径 `reports/custom/html`
3. **Given** 用户希望包含截图和视频工件，**When** 配置报告时，**Then** reporter 配置包含 `screenshot: 'only-on-failure'` 和 `video: 'retain-on-failure'`
4. **Given** 配置完成后运行测试，**When** 测试执行结束时，**Then** HTML 报告文件（index.html）生成在配置的输出目录，报告包含嵌入的截图和视频链接

---

### User Story 2 - 配置可选的 JSON 和 JUnit 报告 (Priority: P1)

测试负责人希望能够同时配置多种报告格式（HTML + JSON + JUnit），其中 JSON 用于 CI/CD 流水线数据分析，JUnit XML 用于与现有 CI 工具集成，以便测试结果能够以多种格式消费。

**Why this priority**: 多格式报告是生产环境必需的 - HTML 用于人工查看，JSON 用于自动化分析，JUnit XML 用于 Jenkins/GitLab CI 集成。支持多格式是 MVP 的关键功能。

**Independent Test**: 可以通过调用 `/e2e-report-configurator setup --format html,json,junit`，验证生成的 Playwright 配置包含三个 reporter（html、json、junit），每个 reporter 有正确的输出路径（reports/e2e/html、reports/e2e/json、reports/e2e/junit）。

**Acceptance Scenarios**:

1. **Given** 用户指定 `--format html,json`，**When** 生成配置时，**Then** `playwright.config.ts` 包含 `reporters: [['html', { outputFolder: 'reports/e2e/html' }], ['json', { outputFile: 'reports/e2e/json/results.json' }]]`
2. **Given** 用户指定 `--format html,junit`，**When** 生成配置时，**Then** 配置包含 JUnit reporter，输出文件为 `reports/e2e/junit/results.xml`
3. **Given** 用户指定所有三种格式 `--format html,json,junit`，**When** 测试执行完成时，**Then** 三个目录分别生成对应格式的报告文件：`reports/e2e/html/index.html`、`reports/e2e/json/results.json`、`reports/e2e/junit/results.xml`

---

### User Story 3 - 规范化输出目录结构 (Priority: P1)

测试负责人希望 skill 能够参考 T001-T004 的最佳实践，生成规范化的输出目录结构（如 `reports/e2e/{html,json,junit}`），并提供 `.gitignore` 配置，以便团队遵循统一的报告存储规范，避免报告文件被误提交到 Git。

**Why this priority**: 规范化目录结构是团队协作的基础，避免每个开发者使用不同的报告路径，减少 CI/CD 配置维护成本。这是 MVP 必需功能。

**Independent Test**: 可以通过调用 skill 并检查生成的目录结构是否符合规范：`reports/e2e/html/`、`reports/e2e/json/`、`reports/e2e/junit/`、`reports/e2e/artifacts/`，同时验证项目根目录的 `.gitignore` 是否包含 `reports/` 条目。

**Acceptance Scenarios**:

1. **Given** 项目初次配置报告，**When** 调用 `/e2e-report-configurator setup` 时，**Then** skill 创建规范化目录结构 `reports/e2e/{html,json,junit,artifacts}/`，每个子目录包含 `.gitkeep` 文件
2. **Given** 项目已有 `.gitignore` 文件，**When** 配置报告时，**Then** skill 检查并追加 `reports/` 到 `.gitignore`（如果不存在）
3. **Given** 用户指定自定义根目录 `--output test-results`，**When** 生成配置时，**Then** 目录结构调整为 `test-results/{html,json,junit,artifacts}/`

---

### User Story 4 - 配置工件保留策略 (Priority: P2)

测试负责人希望能够配置测试工件（截图、视频、追踪）的保留策略（仅失败时保留、全部保留、不保留），以便平衡调试需求和存储成本。

**Why this priority**: 工件保留策略对存储成本和调试效率有重要影响，但默认策略（仅失败时保留）已能满足大部分需求。可配置性是优化功能，可在 P2 添加。

**Independent Test**: 可以通过调用 `/e2e-report-configurator setup --artifacts on-failure`，验证配置包含 `screenshot: 'only-on-failure'`、`video: 'retain-on-failure'`、`trace: 'on-first-retry'`。

**Acceptance Scenarios**:

1. **Given** 用户指定 `--artifacts on-failure`，**When** 生成配置时，**Then** 配置包含 `screenshot: 'only-on-failure'` 和 `video: 'retain-on-failure'`
2. **Given** 用户指定 `--artifacts always`，**When** 生成配置时，**Then** 配置包含 `screenshot: 'on'` 和 `video: 'on'`
3. **Given** 用户指定 `--artifacts never`，**When** 生成配置时，**Then** 配置包含 `screenshot: 'off'` 和 `video: 'off'`

---

### User Story 5 - 验证报告配置正确性 (Priority: P2)

测试开发者希望有 `/e2e-report-configurator validate` 命令验证当前报告配置的正确性（输出目录存在、权限正确、reporter 配置有效），以便在测试执行前发现配置问题。

**Why this priority**: 验证能力提升开发者体验，减少配置错误导致的测试失败。但手动检查也可完成，不是 MVP 关键功能。

**Independent Test**: 可以通过故意配置错误的输出路径（如只读目录），调用 `/e2e-report-configurator validate`，验证 skill 报告权限错误并提供补救建议。

**Acceptance Scenarios**:

1. **Given** 报告配置正确，**When** 运行 `validate` 命令时，**Then** skill 输出 "✅ 所有报告配置验证通过"
2. **Given** 输出目录不存在，**When** 运行 `validate` 时，**Then** skill 报告缺失目录并自动创建（或提示用户创建）
3. **Given** 输出目录权限不足，**When** 运行 `validate` 时，**Then** skill 报告权限错误并建议修复命令（如 `chmod`）

---

### User Story 6 - 生成报告配置文档 (Priority: P3)

测试负责人希望 skill 能够生成报告配置的文档（Markdown 格式），说明当前配置的报告格式、输出路径、工件策略，方便团队成员查阅和 CI/CD 集成参考。

**Why this priority**: 文档能提升团队协作效率，但初期可以手动编写或通过代码注释说明。自动生成文档是生活质量改进，可在成熟后添加。

**Independent Test**: 可以通过调用 `/e2e-report-configurator docs`，验证生成的 `docs/e2e-reports.md` 文件包含当前配置的所有 reporter、输出路径、工件策略、示例命令。

**Acceptance Scenarios**:

1. **Given** 报告配置包含 HTML 和 JSON reporter，**When** 生成文档时，**Then** 文档包含两个 reporter 的配置说明、输出路径、查看方式
2. **Given** 配置包含自定义工件策略，**When** 生成文档时，**Then** 文档说明截图、视频、追踪的保留策略
3. **Given** 文档生成后，**When** 团队成员查阅时，**Then** 文档包含 CI/CD 集成示例（如 GitHub Actions 上传报告工件）

---

### Edge Cases

- **多 reporter 冲突**: 当 HTML 和 JSON reporter 配置相同输出目录时如何处理？Skill 必须检测并报错，要求每个 reporter 有独立子目录。
- **输出目录权限**: 当 CI 环境的输出目录为只读时会发生什么？Skill 必须在 `validate` 命令中检测并提供清晰的错误消息。
- **大量工件存储**: 当测试生成大量截图/视频导致磁盘空间不足时如何处理？Skill 文档应建议配置工件清理策略（如保留最近 N 次运行）。
- **Reporter 插件缺失**: 当用户配置 JUnit reporter 但未安装对应依赖时会发生什么？Skill 必须检查依赖并提示安装命令（如 `npm install -D @playwright/test`）。
- **并发测试报告冲突**: 当多个测试 worker 并发写入同一报告文件时如何处理？Skill 配置必须使用 Playwright 的内置 reporter 合并机制，避免冲突。
- **历史报告清理**: 系统如何处理历史报告文件（避免无限堆积）？Skill 文档应建议配置清理脚本（如 CI 中保留最近 10 次报告）。

## Requirements *(mandatory)*

### Functional Requirements

#### Skill 基础功能

- **FR-001**: Skill 必须通过 `/e2e-report-configurator` 命令调用，支持子命令（setup、validate、docs）
- **FR-002**: Skill 必须读取和更新项目的 Playwright 配置文件（`playwright.config.ts` 或 `playwright.config.js`）
- **FR-003**: Skill 必须支持配置多种报告格式：HTML（必选）、JSON（可选）、JUnit XML（可选）
- **FR-004**: Skill 必须生成规范化的输出目录结构，默认为 `reports/e2e/{html,json,junit,artifacts}/`
- **FR-005**: Skill 必须更新或创建项目根目录的 `.gitignore` 文件，确保报告目录不被提交

#### HTML Reporter 配置

- **FR-006**: Skill 必须配置 Playwright HTML reporter，默认输出路径为 `reports/e2e/html/`
- **FR-007**: Skill 必须支持自定义 HTML reporter 选项（如 `open: 'never'` 避免 CI 环境打开浏览器）
- **FR-008**: HTML reporter 配置必须包含工件链接（截图、视频、追踪文件）

#### JSON Reporter 配置

- **FR-009**: Skill 必须配置 Playwright JSON reporter（可选），输出文件为 `reports/e2e/json/results.json`
- **FR-010**: JSON reporter 配置必须包含测试结果、执行时间、错误消息、工件路径
- **FR-011**: JSON 输出格式必须符合 Playwright JSON reporter schema，便于 CI/CD 工具解析

#### JUnit Reporter 配置

- **FR-012**: Skill 必须配置 JUnit XML reporter（可选），输出文件为 `reports/e2e/junit/results.xml`
- **FR-013**: JUnit XML 格式必须符合 JUnit XML schema，兼容 Jenkins、GitLab CI、GitHub Actions 等 CI 工具
- **FR-014**: JUnit reporter 配置必须包含测试套件名称、测试用例名称、执行时间、失败原因

#### 工件配置

- **FR-015**: Skill 必须配置截图保留策略，支持选项：`off`、`on`、`only-on-failure`（默认）
- **FR-016**: Skill 必须配置视频保留策略，支持选项：`off`、`on`、`retain-on-failure`（默认）、`on-first-retry`
- **FR-017**: Skill 必须配置追踪文件保留策略，支持选项：`off`、`on`、`on-first-retry`（默认）、`retain-on-failure`
- **FR-018**: 工件文件必须存储在 `reports/e2e/artifacts/` 目录，按测试名称和时间戳组织

#### 目录管理

- **FR-019**: Skill 必须在配置时创建输出目录结构，包含 `.gitkeep` 文件确保空目录被 Git 跟踪
- **FR-020**: Skill 必须验证输出目录的写入权限，在权限不足时提供清晰的错误消息
- **FR-021**: Skill 必须支持自定义输出根目录（通过 `--output` 参数），调整所有子目录路径

#### 验证功能

- **FR-022**: Skill 必须支持 `validate` 命令，检查输出目录存在性、权限、reporter 配置有效性
- **FR-023**: 验证必须检查必需的 npm 依赖（如 `@playwright/test`）是否已安装
- **FR-024**: 验证必须检查 `.gitignore` 是否包含报告目录条目
- **FR-025**: 验证失败时必须提供可操作的错误消息和修复建议

#### 文档生成

- **FR-026**: Skill 必须支持 `docs` 命令，生成 Markdown 格式的报告配置文档
- **FR-027**: 文档必须包含当前配置的所有 reporter、输出路径、工件策略
- **FR-028**: 文档必须包含 CI/CD 集成示例（如 GitHub Actions 上传报告工件的 YAML 配置）
- **FR-029**: 文档必须存储在 `docs/e2e-reports.md` 或用户指定路径

#### 集成其他 Skills

- **FR-030**: Skill 配置必须与 e2e-runner (T003) 兼容，确保测试执行时使用配置的 reporters
- **FR-031**: Skill 生成的目录结构必须参考 T001-T004 的最佳实践，保持一致性
- **FR-032**: Skill 必须在配置文件中添加注释，说明配置由 `/e2e-report-configurator` 生成，避免手动修改

### Key Entities

- **e2e-report-configurator Skill**: Claude Code skill，通过 `/e2e-report-configurator` 命令调用，配置 E2E 测试报告输出格式、目录结构、工件策略
- **Report Format**: 报告格式类型，包括 HTML（必选）、JSON（可选）、JUnit XML（可选）
- **Output Directory Structure**: 规范化的输出目录结构，默认为 `reports/e2e/{html,json,junit,artifacts}/`
- **Artifact Retention Policy**: 工件保留策略，包括截图（screenshot）、视频（video）、追踪（trace）的保留规则
- **Reporter Configuration**: Playwright 配置文件中的 `reporters` 数组，包含每个 reporter 的类型、选项、输出路径
- **Validation Result**: 验证结果对象，包含检查项（目录、权限、依赖）、状态（通过/失败）、错误消息、修复建议

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 测试负责人使用 `/e2e-report-configurator setup` 命令可以在 1 分钟内完成报告配置
- **SC-002**: 生成的 Playwright 配置 100% 通过 TypeScript 编译检查（无语法错误）
- **SC-003**: 配置完成后运行测试，报告文件 100% 生成在规范化的输出目录中
- **SC-004**: 验证命令能检测 90%+ 的常见配置错误（目录缺失、权限不足、依赖缺失）
- **SC-005**: 生成的文档能被团队成员 95%+ 正确理解并用于 CI/CD 集成
- **SC-006**: 工件保留策略配置后，存储空间使用量减少 50%+（相比全部保留策略）
- **SC-007**: `.gitignore` 配置准确率 100%，避免报告文件被误提交到 Git

## Dependencies *(optional)*

- **Playwright Framework**: 依赖项目已配置 Playwright 测试框架（`@playwright/test` 已安装）
- **TypeScript**: 依赖项目使用 TypeScript 编写配置文件（`playwright.config.ts`）
- **e2e-runner (T003)**: 依赖 e2e-runner skill 执行测试并使用配置的 reporters
- **File System Access**: Skill 需要读写权限以创建目录、更新配置文件、生成文档

## Assumptions *(optional)*

- 项目已配置 Playwright 测试框架，存在 `playwright.config.ts` 或 `playwright.config.js` 配置文件
- 项目使用 TypeScript（至少用于 Playwright 配置），启用严格模式
- 测试运行环境（本地、CI）有足够的磁盘空间存储报告和工件
- 团队成员熟悉 Playwright reporters 的基本概念
- CI/CD 环境支持上传测试报告工件（如 GitHub Actions artifacts、GitLab CI artifacts）
- 报告输出目录不应提交到 Git（通过 `.gitignore` 排除）
- Skill 运行环境支持文件系统读写、YAML/JSON 解析、Markdown 生成

## Out of Scope *(optional)*

- 报告内容的自定义样式或主题配置（使用 Playwright 默认样式）
- 报告文件的自动上传到云存储（由 CI/CD 流程负责）
- 历史报告的趋势分析和可视化（由专用报告分析工具负责）
- 报告的邮件通知或 Slack 集成（由 CI/CD 通知机制负责）
- 报告文件的压缩和归档策略（由 CI/CD 清理脚本负责）
- 自定义 reporter 插件的开发和集成
- 报告的国际化（i18n）支持
- 报告的实时生成和增量更新（仅支持测试完成后生成完整报告）

## Integration with Existing Skills

### Workflow Chain

```
test-scenario-author (T001)
  ↓ (生成场景 YAML)
e2e-testdata-planner (T004)
  ↓ (生成测试数据 fixtures)
e2e-test-generator (T002)
  ↓ (生成 .spec.ts 测试脚本)
e2e-runner (T003)
  ↓ (执行测试)
e2e-report-configurator (T005) ← 当前位置
  ↓ (配置报告输出)
测试报告查看与分析
```

### Key Integration Points

1. **输出到 e2e-runner**: 配置 Playwright reporters，确保测试执行时生成报告
2. **参考 T001-T004**: 遵循现有 skills 的目录结构规范（如 `scenarios/`、`testdata/`、`reports/`）
3. **文档生成**: 生成的文档包含与 T001-T004 集成的完整工作流说明

### Directory Structure Convention

参考 T001-T004 的目录规范，报告目录结构如下：

```
Cinema_Bussiness_Center_Platform/
├── scenarios/                    # 场景 YAML (T001)
├── testdata/                     # 测试数据蓝图 (T004)
├── tests/                        # 测试脚本 (T002)
├── reports/                      # 报告输出目录 (T005) ← NEW
│   └── e2e/
│       ├── html/                # HTML 报告
│       │   └── index.html
│       ├── json/                # JSON 报告
│       │   └── results.json
│       ├── junit/               # JUnit XML 报告
│       │   └── results.xml
│       └── artifacts/           # 测试工件
│           ├── screenshots/
│           ├── videos/
│           └── traces/
├── docs/                        # 文档
│   └── e2e-reports.md          # 报告配置文档 (自动生成)
└── .gitignore                  # 排除 reports/ 目录
```

## Notes

- 此 skill 专注于**报告配置和目录规范化**，而非报告内容生成（由 Playwright 负责）
- 报告配置是**一次性设置**，除非测试需求变化，否则无需频繁调整
- Skill 生成的配置应**包含注释**，说明各项配置的用途，便于团队理解
- 工件保留策略应**平衡调试需求和存储成本**，建议默认使用 `on-failure` 策略
- CI/CD 集成示例应**覆盖主流工具**（GitHub Actions、GitLab CI、Jenkins）
