# Feature Specification: Lark Init 多维表格 Base ID 交互输入

**Feature Branch**: `T008-lark-init-link`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "基于 T004-lark 的spec 调整需求，需求是init 初始化的时候 需要通过交互的方式 向我询问 多维表格的Base ID"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 初始化时交互式输入多维表格 Base ID (Priority: P1)

作为项目管理工具的使用者，我希望在初次运行 init 命令时，系统能够通过清晰的交互提示引导我输入飞书多维表格的 Base ID（可以是完整 URL 或直接输入 Base ID），这样我就能快速完成项目管理系统的初始化配置，无需提前阅读冗长的文档。

**Why this priority**: 初始化配置是用户使用项目管理工具的第一步，良好的交互体验直接影响用户的第一印象和后续使用意愿。如果初始化流程复杂或不友好，用户可能会放弃使用。

**Independent Test**: 可以通过运行 init 命令并按照交互提示输入多维表格链接来独立测试。测试通过标准是用户能够在无文档指导的情况下，仅凭交互提示完成初始化。

**Acceptance Scenarios**:

1. **Given** 用户首次运行项目管理工具的 init 命令，**When** 系统显示欢迎信息和交互提示，**Then** 用户看到清晰的输入说明，包含两种输入方式的示例（完整 URL 或直接输入 Base ID）

2. **Given** 用户在交互提示中粘贴完整的飞书多维表格 URL（如 `https://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb`），**When** 系统接收到输入，**Then** 系统自动从 URL 中提取 Base ID 并显示提取结果（如"已提取 Base ID: Y05Mb7greapFiSseRpoc5XkXnrb"）

3. **Given** 用户在交互提示中直接输入 Base ID（如 `Y05Mb7greapFiSseRpoc5XkXnrb`），**When** 系统接收到输入，**Then** 系统直接使用该 Base ID 进行验证，无需额外提取

4. **Given** 用户输入的 URL 或 Base ID 无效（如格式错误或无权限访问），**When** 系统验证失败，**Then** 系统显示友好的错误提示并询问用户是否重新输入（提供最多3次重试机会）

5. **Given** 用户提供的 Base ID 验证成功，**When** 系统保存配置，**Then** 用户看到成功提示信息，包含已配置的 Base App 名称和后续操作指引

---

### User Story 2 - Base ID 格式验证与友好提示 (Priority: P2)

作为项目管理工具的使用者，我希望系统在我输入错误格式的 Base ID 或 URL 时，能够立即告诉我问题所在并提供正确的示例，这样我就能快速纠正错误，避免反复试错浪费时间。

**Why this priority**: 输入验证和错误提示能够显著提升用户体验，减少用户因输入错误导致的挫败感，但不影响核心的初始化流程，因此优先级次于 P1。

**Independent Test**: 可以通过输入各种无效格式（如不完整的 URL、包含特殊字符的 Token）来独立测试。测试通过标准是系统能针对每种错误情况提供清晰的错误说明和正确示例。

**Acceptance Scenarios**:

1. **Given** 用户输入不完整的 URL（如缺少 `/base/` 路径），**When** 系统检测到格式错误，**Then** 系统显示错误提示："URL 格式不正确，请确保 URL 包含 '/base/' 路径"，并展示正确示例

2. **Given** 用户输入空字符串或仅包含空格，**When** 系统检测到空输入，**Then** 系统提示"输入不能为空，请输入飞书多维表格 URL 或 Base ID"

3. **Given** 用户输入包含非法字符的 Base ID（如特殊符号 `@#%`），**When** 系统检测到格式错误，**Then** 系统提示"Base ID 格式不正确，Base ID 只能包含字母、数字、下划线和连字符"

4. **Given** 用户连续3次输入无效内容，**When** 重试次数耗尽，**Then** 系统显示终止提示："已达到最大重试次数，请确认您的 Base App URL 或 Token 是否正确，并重新运行 init 命令"

---

### User Story 3 - 支持多种 URL 格式 (Priority: P3)

作为项目管理工具的使用者，我希望系统能够识别并接受多种常见的飞书多维表格 URL 格式（如包含查询参数的 URL、HTTP/HTTPS 协议），这样我就能直接从浏览器地址栏或分享链接复制粘贴，无需手动编辑。

**Why this priority**: 支持多种 URL 格式能够进一步提升用户体验，但属于增强功能，对核心初始化流程的影响较小，因此优先级最低。

**Independent Test**: 可以通过输入带查询参数的 URL（如 `https://xxx.feishu.cn/base/TOKEN?table=xxx&view=xxx`）、HTTP 协议的 URL 等变体来独立测试。

**Acceptance Scenarios**:

1. **Given** 用户输入包含查询参数的 URL（如 `https://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tbl123&view=vew456`），**When** 系统解析 URL，**Then** 系统成功提取 Token（忽略查询参数）并继续验证

2. **Given** 用户输入 HTTP 协议的 URL（如 `http://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb`），**When** 系统解析 URL，**Then** 系统接受该 URL 并正常提取 Token

3. **Given** 用户输入来自飞书国际版的 URL（如 `https://xxx.larksuite.com/base/TOKEN`），**When** 系统解析 URL，**Then** 系统识别为有效的飞书 URL 并提取 Token

### Edge Cases

- **URL 末尾包含斜杠**: 当用户输入 `https://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb/` 时，系统应正确提取 Base ID，忽略末尾斜杠

- **Base ID 包含特殊格式**: 如果飞书未来修改 Base ID 格式（如引入新的字符类型），系统的 Base ID 验证逻辑应能适配或提供明确的不支持提示

- **网络连接失败**: 当系统验证 Base ID 时网络不可用，应显示"网络连接失败，请检查网络后重试"，而不是"Base ID 无效"

- **权限不足**: 当用户提供的 Base ID 有效但无权限访问 Base App 时，系统应明确区分"Base ID 有效但无权限"和"Base ID 无效"两种情况

- **Base App 已删除**: 当 Base ID 对应的 Base App 已被删除时，系统应提示"该 Base App 不存在或已被删除，请确认 URL 是否正确"

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: init 命令在启动时必须显示欢迎信息和清晰的交互提示，说明用户可以输入"飞书多维表格完整 URL"或"Base ID"（注：Base ID 即 Base App Token）

- **FR-002**: 系统必须在交互提示中展示两种输入方式的具体示例：
  - 示例1（完整 URL）: `https://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb`
  - 示例2（Base ID）: `Y05Mb7greapFiSseRpoc5XkXnrb`

- **FR-003**: 系统必须能够自动识别用户输入是 URL 还是 Base ID：
  - 如果输入以 `http://` 或 `https://` 开头，则视为 URL
  - 否则视为 Base ID

- **FR-004**: 当用户输入 URL 时，系统必须从 URL 路径中提取 Base ID：
  - 匹配 `/base/<base_id>` 模式
  - Base ID 格式：字母、数字、下划线、连字符的组合

- **FR-005**: 当用户输入 Base ID 时，系统必须验证 Base ID 格式：
  - 允许的字符：字母（A-Z, a-z）、数字（0-9）、下划线（_）、连字符（-）
  - 不允许的字符：空格、特殊符号（@#$%等）

- **FR-006**: 系统必须在提取或接收 Base ID 后，立即验证其有效性（通过调用飞书 API 访问 Base App）

- **FR-007**: 系统必须在 Base ID 验证失败时，提供明确的错误分类：
  - 格式错误：Base ID/URL 格式不符合要求
  - 网络错误：无法连接到飞书服务
  - 权限错误：Base ID 有效但无权限访问
  - 不存在错误：Base App 不存在或已删除

- **FR-008**: 系统必须在用户输入无效内容时，提供最多3次重试机会，每次重试前显示剩余重试次数

- **FR-009**: 系统必须在 Base ID 验证成功后，保存配置到本地配置文件，并显示成功提示信息

- **FR-010**: 成功提示信息必须包含：
  - 已配置的 Base App 名称（从飞书 API 获取）
  - 后续操作指引（如"运行 list-tables 查看数据表"）

- **FR-011**: 系统必须支持以下 URL 格式变体：
  - 包含查询参数的 URL（如 `?table=xxx&view=xxx`）
  - HTTP 和 HTTPS 协议
  - 飞书国内版（feishu.cn）和国际版（larksuite.com）域名

- **FR-012**: 系统必须在用户输入空字符串或仅包含空格时，提示"输入不能为空"并重新询问

### Key Entities

- **Base ID (Base App Token)**: 飞书多维表格的唯一标识符，用于访问和操作数据表。格式为字母、数字、下划线和连字符的组合，长度通常为15-30个字符。在飞书系统中也称为 Base App Token。

- **Base App URL**: 飞书多维表格的完整访问链接，格式为 `https://<domain>.feishu.cn/base/<base_id>` 或 `https://<domain>.larksuite.com/base/<base_id>`，可能包含查询参数（如 `?table=xxx&view=xxx`）。

- **Configuration**: 存储已验证的 Base ID 和相关信息（如 Base App 名称）的本地配置文件，用于后续命令的执行。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 用户能够在30秒内完成 init 命令的交互流程（从启动命令到配置成功）

- **SC-002**: 90%的用户在首次尝试时就能成功输入有效的 URL 或 Base ID（基于清晰的交互提示和示例）

- **SC-003**: 用户在输入无效内容时，能够在3秒内看到明确的错误提示和正确示例

- **SC-004**: 系统能够正确识别和处理至少5种常见的 URL 格式变体（如带查询参数、HTTP/HTTPS、不同域名）

- **SC-005**: Base ID 提取准确率达到100%（对于符合格式要求的 URL）

- **SC-006**: 用户在完成初始化后，能够立即理解后续操作步骤（通过成功提示中的后续指引）

- **SC-007**: 错误提示的准确率达到95%（能够正确区分格式错误、网络错误、权限错误、不存在错误）

## Assumptions

- 假设用户能够从飞书客户端或网页版获取到多维表格的完整 URL 或 Base ID

- 假设用户的网络环境允许访问飞书 API 服务（未被防火墙屏蔽）

- 假设飞书 Base ID (Base App Token) 的格式在短期内不会发生重大变化（保持字母数字下划线连字符的组合）

- 假设用户在输入 URL 时不会手动修改关键部分（如 `/base/` 路径）

- 假设用户提供的 Base ID 或 URL 对应的 Base App 已经创建并可访问

- 假设本地配置文件的存储路径有写入权限

- 假设用户在重试次数耗尽后，能够根据提示信息排查问题（如检查 Base ID 有效性、网络连接）

- 假设飞书 API 的验证响应时间在正常情况下不超过5秒

- 假设用户理解"Base App"、"多维表格"和"Base ID"是相关概念，Base ID 是 Base App 的唯一标识符
