# Feature Specification: Lark URL 支持增强 (Phase 1)

**Feature Branch**: `T007-lark-url-support`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "基于 T004-lark 的spec 调整需求，需求文件 phase-1-url-support.md"

## Clarifications

### Session 2025-12-31

- **问题 1：用户体验问题**
  - **现状**: init 命令仅支持手动输入 Base App Token
  - **需求**: 支持用户直接粘贴完整飞书 URL，自动提取 Token
  - **影响**: 当前用户体验不佳，容易出错，需要用户手动复制 Token
  - **解决方案**: 在 `init` 命令中增加 URL 解析逻辑，支持以下两种输入方式：
    1. 直接粘贴完整 URL: `https://example.feishu.cn/base/XXX?table=YYY&view=ZZZ`
    2. 手动输入 Token: `XXX` (保持向后兼容)
  - **URL 解析规则**:
    - 从 URL 路径中提取 Base App Token: `/base/XXX` → `XXX`
    - 从 URL 查询参数提取 Table ID: `?table=YYY` → `YYY`
    - 从 URL 查询参数提取 View ID (可选): `?view=ZZZ` → `ZZZ`

<!--
  规格编号格式说明 (Spec ID Format):
  T007 = 工具/基础设施模块第7个规格
  - T: Tool/Infrastructure (Claude Code skills、脚本、技术优化)
  - 007: 模块内递增序号

  本规格扩展自 T004-lark-project-management，增加 URL 支持功能
-->

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 初始化配置时支持粘贴完整 URL (Priority: P1)

作为项目管理者，我希望在初始化 Lark 项目管理系统时，能够直接粘贴从飞书多维表格页面复制的完整 URL，而不需要手动提取 Token，从而简化配置流程，减少配置错误。

**Why this priority**: 初始化配置是用户首次使用的关键步骤，优化这一步骤可以显著提升用户体验，降低使用门槛。

**Independent Test**: 可以通过以下操作独立测试：
1. 运行 `/lark-pm init` 命令
2. 粘贴完整飞书 URL: `https://example.feishu.cn/base/XXX?table=YYY&view=ZZZ`
3. 验证系统自动提取 Base App Token、Table ID、View ID
4. 验证配置文件正确保存

**Acceptance Scenarios**:

1. **Given** 用户运行 `/lark-pm init` 命令，**When** 粘贴完整 URL `https://example.feishu.cn/base/bascn123456?table=tbl123456&view=vew123456`，**Then** 系统自动提取：
   - Base App Token: `bascn123456`
   - Table ID: `tbl123456`
   - View ID: `vew123456`
   - 并保存到配置文件 `.lark-pm.config.json`

2. **Given** 用户运行 `/lark-pm init` 命令，**When** 手动输入 Token `bascn123456`（不带 URL），**Then** 系统识别为传统 Token 输入方式，正常保存配置（向后兼容）

3. **Given** 用户粘贴 URL 缺少必要参数，**When** 粘贴 `https://example.feishu.cn/base/bascn123456` (缺少 table 参数)，**Then** 系统提示：`检测到 URL 格式，但缺少必要的 table 参数，请输入完整的多维表格 URL`

4. **Given** 用户粘贴无效 URL，**When** 粘贴 `https://invalid-domain.com/base/XXX`，**Then** 系统提示：`无效的飞书 URL，请确保 URL 来自 feishu.cn 或 larksuite.com 域名`

---

### User Story 2 - 任务记录支持外部链接 (Priority: P2)

作为开发人员，我希望在创建任务时能够添加外部链接（如 GitHub Issue、技术文档、设计稿），方便直接访问相关资源，提升任务执行效率。

**Why this priority**: 外部链接可以减少信息查找时间，提升团队协作效率，但不是核心功能，优先级次于初始化配置优化。

**Independent Test**: 可以通过以下操作独立测试：
1. 创建任务并添加外部链接
2. 查看任务详情，验证链接可点击
3. 更新任务链接
4. 删除任务链接

**Acceptance Scenarios**:

1. **Given** 用户创建新任务，**When** 在任务描述中添加外部链接 `[GitHub Issue](https://github.com/org/repo/issues/123)`，**Then** 任务保存到飞书多维表格，链接字段包含 Markdown 格式链接

2. **Given** 任务已创建，**When** 用户查看任务详情，**Then** 外部链接显示为可点击的超链接，点击后在新标签页打开

3. **Given** 任务包含多个外部链接，**When** 链接包含 GitHub、文档、设计稿等多种类型，**Then** 所有链接正确显示和跳转

---

### User Story 3 - Bug 记录支持代码仓库链接 (Priority: P2)

作为测试人员，我希望在创建 Bug 记录时能够关联代码仓库的提交记录或分支链接，方便开发人员快速定位问题代码，缩短 Bug 修复时间。

**Why this priority**: 代码仓库链接可以加速 Bug 修复流程，但不影响 Bug 记录的基本功能，优先级次于任务链接。

**Independent Test**: 可以通过以下操作独立测试：
1. 创建 Bug 记录并关联修复分支 URL
2. 查看 Bug 详情，验证分支链接可点击
3. 更新 Bug 关联的提交记录 URL

**Acceptance Scenarios**:

1. **Given** 测试人员发现 Bug，**When** 创建 Bug 记录并填写修复分支链接 `https://github.com/org/repo/tree/fix/bug-123`，**Then** Bug 记录保存，修复分支字段包含 URL

2. **Given** Bug 已修复，**When** 开发人员更新 Bug 记录，添加修复提交链接 `https://github.com/org/repo/commit/abc123`，**Then** Bug 记录包含修复提交 URL，可直接查看代码变更

3. **Given** Bug 记录包含代码链接，**When** 查看 Bug 详情，**Then** 代码仓库链接显示为可点击的超链接

---

### User Story 4 - 技术债支持文档链接 (Priority: P3)

作为技术负责人，我希望在记录技术债时能够关联技术文档、架构设计文档或历史讨论链接，方便团队理解技术债背景和解决方案。

**Why this priority**: 文档链接有助于技术债的理解和解决，但属于辅助功能，优先级较低。

**Independent Test**: 可以通过以下操作独立测试：
1. 创建技术债记录并添加文档链接
2. 查看技术债详情，验证文档链接可点击
3. 更新技术债关联的文档

**Acceptance Scenarios**:

1. **Given** 技术负责人记录技术债，**When** 添加架构文档链接 `https://confluence.company.com/architecture/XXX`，**Then** 技术债记录保存，文档链接字段包含 URL

2. **Given** 技术债已记录，**When** 团队成员查看技术债详情，**Then** 文档链接显示为可点击的超链接，点击后打开文档页面

---

### User Story 5 - 功能矩阵关联规格文档 (Priority: P3)

作为产品经理，我希望在功能矩阵中能够直接关联项目规格文档路径（如 `specs/P001-spu-management/spec.md`），方便快速查看功能的详细需求。

**Why this priority**: 规格文档关联可以提升功能矩阵的实用性，但不影响核心功能，优先级较低。

**Independent Test**: 可以通过以下操作独立测试：
1. 在功能矩阵中添加规格文档路径
2. 查看功能详情，验证规格文档路径正确显示
3. 点击规格文档路径，验证能够打开对应文件

**Acceptance Scenarios**:

1. **Given** 产品经理维护功能矩阵，**When** 为功能模块 `P001-spu-management` 添加规格文档路径 `specs/P001-spu-management/spec.md`，**Then** 功能记录保存，规格文档字段包含文件路径

2. **Given** 功能矩阵包含规格文档路径，**When** 查看功能详情，**Then** 规格文档路径显示为相对路径或绝对路径链接

---

### User Story 6 - 测试记录支持测试脚本链接 (Priority: P3)

作为测试负责人，我希望在测试记录中能够关联测试用例脚本文件或自动化测试报告链接，方便追溯测试执行细节。

**Why this priority**: 测试脚本链接可以提升测试记录的完整性，但不影响测试记录的基本功能，优先级最低。

**Independent Test**: 可以通过以下操作独立测试：
1. 创建测试记录并关联测试脚本文件
2. 查看测试记录详情，验证测试脚本路径正确显示
3. 更新测试记录关联的测试报告 URL

**Acceptance Scenarios**:

1. **Given** 测试负责人创建测试记录，**When** 关联测试脚本文件 `tests/e2e/order-flow.spec.ts`，**Then** 测试记录保存，测试脚本字段包含文件路径

2. **Given** 测试执行完成，**When** 添加测试报告链接 `https://ci.company.com/reports/build-123`，**Then** 测试记录包含测试报告 URL

3. **Given** 测试记录包含测试脚本和报告链接，**When** 查看测试记录详情，**Then** 测试脚本路径和测试报告 URL 正确显示

### Edge Cases

- **URL 格式兼容性**:
  - 支持飞书国内域名: `feishu.cn`
  - 支持飞书国际域名: `larksuite.com`
  - 支持 HTTP 和 HTTPS 协议
  - 示例: `https://example.feishu.cn/base/XXX` 和 `http://example.larksuite.com/base/XXX` 都应正确解析

- **URL 参数变体**:
  - 支持 URL 参数顺序任意: `?table=XXX&view=YYY` 和 `?view=YYY&table=XXX` 都应正确解析
  - 支持 URL 包含额外参数: `?table=XXX&view=YYY&from=share` 应忽略无关参数

- **链接验证**:
  - 外部链接（GitHub、文档）支持任意 HTTPS 链接
  - 代码仓库链接自动识别 GitHub、GitLab、Bitbucket 等平台
  - 规格文档路径支持相对路径和绝对路径

- **链接更新**:
  - 当任务/Bug/技术债的外部链接失效（404）时，如何提示用户？
  - 当用户更新链接时，是否保留历史链接记录？

- **权限控制**:
  - 外部链接是否需要访问权限验证？（如私有 GitHub 仓库）
  - 规格文档路径是否需要文件存在性检查？

## Requirements *(mandatory)*

### Functional Requirements

#### 初始化配置增强 (User Story 1)

- **FR-001**: init 命令必须支持两种输入方式：
  1. 完整 URL: `https://example.feishu.cn/base/XXX?table=YYY&view=ZZZ`
  2. 传统 Token: `XXX`（向后兼容）
- **FR-002**: 系统必须从 URL 中自动提取以下参数：
  - Base App Token: 从路径 `/base/XXX` 中提取
  - Table ID: 从查询参数 `?table=YYY` 中提取
  - View ID (可选): 从查询参数 `?view=ZZZ` 中提取
- **FR-003**: 系统必须验证 URL 域名，仅接受 `feishu.cn` 和 `larksuite.com` 域名
- **FR-004**: 系统必须在 URL 缺少必要参数时提示用户：
  - 缺少 Base App Token: `无效的 URL，未找到 Base App Token`
  - 缺少 Table ID: `检测到 URL 格式，但缺少必要的 table 参数`
- **FR-005**: 系统必须将提取的配置保存到 `.lark-pm.config.json` 文件，格式如下：
  ```json
  {
    "baseAppToken": "bascn123456",
    "tableId": "tbl123456",
    "viewId": "vew123456",
    "createdAt": "2025-12-31T12:00:00Z"
  }
  ```

#### 任务链接支持 (User Story 2)

- **FR-006**: 任务记录必须支持 `externalLinks` 字段，存储外部链接列表（Markdown 格式）
- **FR-007**: 系统必须支持在任务描述中添加 Markdown 链接：`[链接文本](URL)`
- **FR-008**: 系统必须在查看任务详情时将 Markdown 链接渲染为可点击的超链接
- **FR-009**: 系统必须支持在任务中添加多个外部链接（最多10个）

#### Bug 代码链接支持 (User Story 3)

- **FR-010**: Bug 记录必须支持 `fixBranchUrl` 字段，存储修复分支的 URL
- **FR-011**: Bug 记录必须支持 `fixCommitUrl` 字段，存储修复提交的 URL
- **FR-012**: 系统必须在 Bug 详情中显示代码链接为可点击的超链接
- **FR-013**: 系统必须支持自动识别代码仓库平台（GitHub、GitLab、Bitbucket）

#### 技术债文档链接支持 (User Story 4)

- **FR-014**: 技术债记录必须支持 `documentationLinks` 字段，存储文档链接列表
- **FR-015**: 系统必须在技术债详情中显示文档链接为可点击的超链接

#### 功能矩阵规格文档关联 (User Story 5)

- **FR-016**: 功能矩阵记录必须支持 `specPath` 字段，存储规格文档的相对路径（如 `specs/P001-spu-management/spec.md`）
- **FR-017**: 系统必须在功能详情中显示规格文档路径为相对路径或绝对路径链接

#### 测试记录测试脚本链接支持 (User Story 6)

- **FR-018**: 测试记录必须支持 `testScriptPath` 字段，存储测试脚本的相对路径（如 `tests/e2e/order-flow.spec.ts`）
- **FR-019**: 测试记录必须支持 `testReportUrl` 字段，存储测试报告的 URL（如 CI 系统的报告链接）

#### 通用链接验证

- **FR-020**: 系统必须验证外部链接的格式，仅接受 HTTPS 协议的 URL（HTTP 协议显示警告但不阻止）
- **FR-021**: 系统必须在用户输入无效链接时提示：`无效的 URL 格式，请输入完整的 HTTPS 链接`

### Key Entities

所有实体扩展自 T004-lark-project-management 规格，新增字段如下：

- **任务(Task)**:
  - 新增字段: `externalLinks` (外部链接列表，JSON 数组，最多10个)
  - 示例: `["[GitHub Issue](https://github.com/org/repo/issues/123)", "[设计稿](https://figma.com/XXX)"]`

- **Bug**:
  - 新增字段: `fixBranchUrl` (修复分支 URL，字符串)
  - 新增字段: `fixCommitUrl` (修复提交 URL，字符串)

- **技术债(TechnicalDebt)**:
  - 新增字段: `documentationLinks` (文档链接列表，JSON 数组)

- **功能模块(FeatureModule)**:
  - 新增字段: `specPath` (规格文档路径，字符串，如 `specs/P001-spu-management/spec.md`)

- **测试记录(TestRecord)**:
  - 新增字段: `testScriptPath` (测试脚本路径，字符串)
  - 新增字段: `testReportUrl` (测试报告 URL，字符串)

## Success Criteria

### Measurable Outcomes

- **SC-001**: 用户使用 `/lark-pm init` 命令时，可以在10秒内完成配置（粘贴 URL + 回车），比手动提取 Token 的方式快50%
- **SC-002**: 90%的用户能够直接粘贴 URL 完成配置，无需阅读文档或查看帮助
- **SC-003**: 任务中添加外部链接后，团队成员可以在1次点击内访问相关资源（无需复制粘贴）
- **SC-004**: Bug 修复时间平均缩短15%（通过快速访问代码仓库链接）
- **SC-005**: 技术债记录中80%的条目包含文档链接，提升技术债的可追溯性
- **SC-006**: 功能矩阵中90%的功能模块关联了规格文档路径
- **SC-007**: 测试记录中70%的条目包含测试脚本路径或测试报告链接
- **SC-008**: URL 解析成功率达到95%（对于符合飞书 URL 格式的输入）
- **SC-009**: 用户在粘贴无效 URL 时，可以在3秒内收到清晰的错误提示

## Assumptions

- 假设用户使用的飞书多维表格 URL 格式为标准格式：`https://example.feishu.cn/base/XXX?table=YYY&view=ZZZ`
- 假设用户能够从浏览器地址栏或分享链接中复制完整 URL
- 假设飞书 URL 格式在短期内不会发生重大变化
- 假设外部链接（GitHub、文档）的 URL 格式符合标准 HTTP/HTTPS 协议
- 假设代码仓库链接的域名包含 `github.com`、`gitlab.com` 或 `bitbucket.org`
- 假设规格文档路径基于项目根目录的相对路径（如 `specs/P001-spu-management/spec.md`）
- 假设测试脚本路径基于项目根目录的相对路径（如 `tests/e2e/order-flow.spec.ts`）
- 假设用户不需要验证外部链接的有效性（系统不执行 URL 可达性检查）
- 假设链接字段的存储使用飞书多维表格的文本或 URL 字段类型
- 假设用户在粘贴 URL 时不会修改 URL 参数顺序或格式
