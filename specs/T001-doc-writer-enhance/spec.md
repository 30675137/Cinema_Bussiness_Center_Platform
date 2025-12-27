# Feature Specification: Doc-Writer Skill Enhancement

**Feature Branch**: `T001-doc-writer-enhance`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "通过context7 了解claude skill 我要在doc-writer中增强编写软件文档的能力，并像/ops一样增加command的调用"

<!--
  规格编号格式说明 (Spec ID Format):
  T001: 工具/基础设施模块 - doc-writer 技能增强
-->

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 通过 /doc 命令快速生成设计文档 (Priority: P1)

作为开发者，我希望能通过简单的 `/doc` 命令快速启动设计文档生成流程，就像使用 `/ops` 命令一样便捷，这样可以减少操作步骤，提高文档编写效率。

**Why this priority**: 命令调用是用户交互的入口点，是实现所有其他功能的前提。没有便捷的命令入口，用户无法高效使用 doc-writer 技能。

**Independent Test**: 可以通过在 Claude Code 中输入 `/doc` 命令验证，用户能看到文档类型选择提示并开始文档生成流程。

**Acceptance Scenarios**:

1. **Given** 用户在 Claude Code 中工作, **When** 用户输入 `/doc` 命令, **Then** 系统显示可用的文档类型列表（TDD、架构设计、详细设计、接口设计、数据库设计）
2. **Given** 用户输入 `/doc tdd`, **When** 系统检测到当前激活的 spec, **Then** 系统自动读取 spec 信息并开始生成技术设计文档
3. **Given** 用户输入 `/doc tdd`, **When** 没有激活的 spec, **Then** 系统提示用户手动提供项目信息或先激活一个功能规格

---

### User Story 2 - 智能识别文档需求并推荐文档类型 (Priority: P2)

作为开发者，我希望系统能根据我的自然语言描述智能识别我需要的文档类型，这样我不需要记住所有文档类型的专业术语。

**Why this priority**: 智能意图识别可以降低用户学习成本，提升用户体验，但核心功能（命令调用）必须先实现。

**Independent Test**: 可以通过输入自然语言描述验证，如"写一份技术方案"应自动识别为 TDD 类型。

**Acceptance Scenarios**:

1. **Given** 用户输入 `/doc 技术方案`, **When** 系统解析输入, **Then** 系统识别为技术设计文档（TDD）类型并开始生成
2. **Given** 用户输入 `/doc 架构`, **When** 系统解析输入, **Then** 系统识别为架构设计文档类型
3. **Given** 用户输入 `/doc API设计`, **When** 系统解析输入, **Then** 系统识别为接口设计文档类型
4. **Given** 用户输入模糊描述 `/doc 设计`, **When** 系统无法确定具体类型, **Then** 系统询问用户选择具体的文档类型

---

### User Story 3 - 增量更新现有设计文档 (Priority: P3)

作为开发者，当需求变更后，我希望能增量更新已有的设计文档，而不是重新生成整个文档，这样可以保留之前的修改和批注。

**Why this priority**: 增量更新是高级功能，需要在基础文档生成功能稳定后实现。

**Independent Test**: 可以通过对已有文档执行更新操作验证，系统应只更新受影响的部分。

**Acceptance Scenarios**:

1. **Given** 已有设计文档且 spec 发生变更, **When** 用户输入 `/doc update`, **Then** 系统对比变更并只更新受影响的章节
2. **Given** 用户手动修改了文档中的某些内容, **When** 执行增量更新, **Then** 用户修改的内容被保留，只有自动生成的部分被更新
3. **Given** 更新后存在冲突（用户修改与新生成内容冲突）, **When** 系统检测到冲突, **Then** 系统标记冲突区域并请求用户确认

---

### User Story 4 - 支持多种软件文档类型 (Priority: P4)

作为开发者，除了设计文档外，我还希望能生成其他类型的软件文档，如用户手册、操作指南、发布说明等，这样可以统一文档风格和管理。

**Why this priority**: 扩展文档类型是功能增强，在核心设计文档功能完善后再实现。

**Independent Test**: 可以通过选择不同文档类型验证，系统应使用对应的模板生成文档。

**Acceptance Scenarios**:

1. **Given** 用户输入 `/doc manual`, **When** 系统处理请求, **Then** 系统使用用户手册模板生成文档
2. **Given** 用户输入 `/doc release-notes`, **When** 系统处理请求, **Then** 系统从 git 历史提取变更并生成发布说明
3. **Given** 用户输入 `/doc readme`, **When** 系统处理请求, **Then** 系统分析项目结构并生成 README 文档

---

### Edge Cases

- 当 spec 文件不完整（缺少关键章节）时，系统应提示缺失内容并询问是否继续生成部分文档
- 当模板文件丢失或损坏时，系统应使用内置默认模板并警告用户
- 当用户取消文档生成过程时，已生成的部分内容应保存为草稿
- 当目标输出目录不存在时，系统应自动创建目录结构
- 当文档生成过程中发生错误，系统应提供错误详情和恢复建议

## Requirements *(mandatory)*

### Functional Requirements

#### 命令系统
- **FR-001**: 系统 MUST 支持 `/doc` 命令作为 doc-writer 技能的快捷入口
- **FR-002**: 系统 MUST 支持 `/doc <type>` 格式直接指定文档类型（tdd, arch, detail, api, db, manual, readme, release-notes, matrix）
- **FR-002.1**: 系统 MUST 支持 `/doc init` 命令进行全量初始化，扫描所有数据源生成完整文档集
- **FR-002.2**: `/doc init` 支持 `--source <path>` 参数指定额外的数据源文件夹（除 `specs/` 外）
- **FR-003**: 系统 MUST 支持 `/doc <自然语言描述>` 格式的智能意图识别
- **FR-004**: 命令 MUST 继承 doc-writer 技能定义的 allowed-tools 权限

#### 意图识别
- **FR-005**: 系统 MUST 能识别以下关键词映射到对应文档类型：
  - 技术方案/技术设计/TDD → 技术设计文档
  - 架构/架构设计/系统设计 → 架构设计文档
  - 详细设计/模块设计/DDD → 详细设计文档
  - 接口/API/接口设计 → 接口设计文档
  - 数据库/数据模型/表设计 → 数据库设计文档
  - 手册/使用说明/操作指南 → 用户手册
  - README/项目说明 → README 文档
  - 发布/更新日志/CHANGELOG → 发布说明
  - 功能矩阵/功能列表/功能清单 → 产品功能矩阵

- **FR-006**: 当无法确定文档类型时，系统 MUST 提供文档类型列表供用户选择

#### 文档生成
- **FR-007**: 系统 MUST 在生成文档前检查并加载当前激活的 spec（通过 `.specify/active_spec.txt`）
- **FR-007.1**: 系统 MUST 从 spec.md 文件头部读取以下元数据字段：
  - `**System**` - 系统名称（如：影院商品管理中台）
  - `**Module**` - 一级模块（如：库存管理）
  - `**SubModule**` - 二级模块（如：库存查询），可选字段
  - 用于产品文档、详细设计文档的目录组织，以及功能矩阵的自动汇总
- **FR-008**: 系统 MUST 支持从 spec.md、plan.md、data-model.md、contracts/api.yaml 等文件自动提取信息
- **FR-009**: 系统 MUST 使用对应的模板文件生成文档（位于 `.claude/skills/doc-writer/templates/`）
- **FR-010**: 系统 MUST 将生成的文档输出到 `docs/` 目录（与 `specs/` 独立并行），目录结构如下：
  - **技术类文档**（按类型组织）：
    - `docs/tdd/` - 技术设计文档
    - `docs/architecture/` - 架构设计文档
    - `docs/api/` - 接口设计文档
    - `docs/database/` - 数据库设计文档
  - **产品类文档**（按功能模块组织）：
    - `docs/product/{module}/` - PRD 产品需求文档
    - `docs/manual/{module}/` - 用户手册
    - `docs/guide/{module}/` - 操作指南
  - **详细设计文档**（按功能模块组织）：
    - `docs/detail-design/{module}/` - 详细设计文档
  - **全局文档**（项目级）：
    - `docs/matrix/` - 产品功能矩阵（自动从所有 spec 汇总生成）
  - 每个功能模块可包含多个 specId 相关的内容（如 inventory-management 模块包含 P003/P004 等）
- **FR-011**: 文档输出文件命名规则：
  - 技术类文档：`docs/{type}/{specId}-{name}.md`（如 `docs/tdd/P003-inventory-query.md`）
  - 模块化文档：`docs/{category}/{module}/{specId}-{name}.md` 或合并为 `docs/{category}/{module}/index.md`

#### 全量初始化
- **FR-021**: `/doc init` MUST 扫描以下默认数据源：
  - `specs/` 目录下所有 spec.md 文件
  - 用户通过 `--source` 指定的额外文件夹
- **FR-021.1**: 全量初始化 MUST 按文档分类批量生成：
  - 技术类文档（TDD、架构、接口、数据库）
  - 产品类文档（PRD、手册、指南）
  - 全局文档（功能矩阵）
- **FR-021.2**: 初始化完成后 MUST 输出生成报告：文档数量、分类统计、输出路径列表
- **FR-021.3**: 如果 `docs/` 目录已存在文档，MUST 提示用户选择覆盖或跳过
- **FR-021.4**: 额外数据源 MUST 支持以下文件格式：
  - Markdown（`.md`）- 直接解析内容和元数据头
  - YAML（`.yaml/.yml`）- 结构化数据定义
  - JSON（`.json`）- 结构化数据定义
- **FR-021.5**: 数据源解析规则通过配置文件 `.claude/skills/doc-writer/source-parsers.yaml` 定义

#### 增量更新
- **FR-012**: 系统 MUST 支持 `/doc update` 命令进行增量更新
- **FR-012.1**: 增量更新 MUST 检测自上次生成后变更的 spec 文件，只更新受影响的文档
- **FR-013**: 增量更新 MUST 保留用户手动修改的内容（通过特殊标记识别）
- **FR-014**: 系统 MUST 在更新完成后显示变更摘要（新增、修改、删除的章节）

#### 产品功能矩阵
- **FR-019**: 系统 MUST 支持 `/doc matrix` 命令生成产品功能矩阵文档
- **FR-019.1**: 功能矩阵 MUST 自动扫描所有 `specs/` 目录下的 spec.md 文件，提取功能信息
- **FR-019.2**: 功能矩阵表格结构 MUST 包含以下列：系统、一级模块、二级模块、功能编码（specId）、功能名称、功能简述
- **FR-019.3**: 功能矩阵 MUST 输出到 `docs/matrix/feature-matrix.md`
- **FR-019.4**: 功能矩阵支持增量更新，新增 spec 时自动追加到对应模块位置

#### 流程描述格式
- **FR-020**: 系统 MUST 支持在用户故事级别生成基本流/备选流/异常流描述
- **FR-020.1**: 基本流（Basic Flow）MUST 描述正常执行过程，详细列出每个步骤，确保是最常见的操作路径
- **FR-020.2**: 备选流（Alternative Flow）MUST 描述特定情况下的操作路径变种，如用户选择其他方式完成任务
- **FR-020.3**: 异常流（Exception Flow）MUST 描述错误或异常情况的处理过程，明确系统如何处理和恢复
- **FR-020.4**: 流程描述格式与 Given/When/Then 验收场景并存，两者互补

#### 输出与反馈
- **FR-016**: 系统 MUST 在文档生成完成后显示摘要报告（文档类型、输出路径、章节列表、信息来源）
- **FR-017**: 系统 MUST 标记任何缺失信息为 `[待补充: 描述]`
- **FR-018**: 系统 MUST 提供后续操作建议（如"运行 /doc review 进行文档审查"）

### Key Entities

- **DocumentType**: 文档类型实体，包含类型标识、显示名称、模板路径、关键词列表
- **DocumentTemplate**: 文档模板实体，包含模板结构、必填章节、可选章节
- **GeneratedDocument**: 生成的文档实体，包含源 spec、文档类型、生成时间、输出路径、内容结构
- **DocumentSection**: 文档章节实体，包含章节标题、内容、是否自动生成、是否已修改

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在 5 秒内通过 `/doc` 命令启动文档生成流程（无需翻阅文档了解 skill 用法）
- **SC-002**: 90% 的常见文档类型请求（技术方案、架构设计、接口设计）能被正确识别
- **SC-003**: 完整的技术设计文档（TDD）可以在 30 秒内生成
- **SC-004**: 增量更新后，用户手动修改的内容 100% 被保留
- **SC-005**: 生成的文档符合项目技术规范（遵循 `.claude/rules/` 中定义的规则）
- **SC-006**: 用户对文档生成功能的首次使用成功率达到 95%（无需多次尝试）
- **SC-007**: 生成文档的结构完整性达到 100%（所有模板必填章节都有内容或明确标记为待补充）
- **SC-008**: 命令响应时间（从输入到开始生成）不超过 2 秒

## Assumptions

1. 用户已在 Claude Code 环境中工作，并且 doc-writer skill 已正确安装
2. 项目遵循 Speckit 工作流，存在标准的 specs 目录结构
3. 文档模板文件位于 `.claude/skills/doc-writer/templates/` 目录
4. 用户对基本的设计文档概念有一定了解（知道 TDD、架构设计等术语的含义）
5. 生成的文档主要面向开发团队内部使用，而非最终用户
6. 命令配置文件将创建在 `.claude/commands/doc.md`

## Clarifications

### Session 2025-12-26

- Q: 用户流程描述格式选择（Given/When/Then vs 基本流/备选流/异常流）？ → A: 同时支持两种格式，保留 Given/When/Then 验收场景，新增基本流/备选流/异常流作为补充的详细操作步骤描述
- Q: 生成的文档存放位置？ → A: 放在 `docs/` 路径下，与 `specs/` 目录独立并行
- Q: docs 目录结构组织方式？ → A: 按文档类型组织，但产品文档和详细设计文档按功能模块划分（每个模块可包含多个 specId，如库存管理模块包含查询/盘点/审批/入库/调拨等）
- Q: 功能模块与 specId 的映射关系如何确定？ → A: 在每个 spec.md 文件头部声明所属模块（如 `**Module**: inventory-management`），生成文档时读取
- Q: 基本流/备选流/异常流的描述粒度？ → A: 用户故事级别，每个用户故事编写独立的基本流/备选流/异常流
- Q: 哪些文档类型属于产品类文档？ → A: PRD、用户手册、操作指南属于产品类文档（按功能模块组织）；TDD、架构设计、接口设计、数据库设计属于技术类文档（按类型组织）
- Q: 产品功能矩阵文档如何组织？ → A: 作为独立的全局文档类型，存放在 `docs/matrix/` 目录，命令为 `/doc matrix`，自动从所有 spec 汇总生成，表格结构为：系统 → 一级模块 → 二级模块 → 功能编码 → 功能简述
- Q: 功能矩阵中"系统"和"一级模块"的数据来源？ → A: 在 spec.md 头部扩展元数据：`**System**`（系统）、`**Module**`（一级模块）、`**SubModule**`（二级模块）
- Q: 文档生成模式（初始化 vs 增量）？ → A: 提供三种命令模式：`/doc init` 全量初始化（扫描所有 spec 及额外指定文件夹生成完整文档集）、`/doc <type>` 单文档生成、`/doc update` 增量更新。支持指定额外文件夹作为数据源
- Q: 额外数据源文件夹支持的内容类型？ → A: 支持多种格式：Markdown（`.md`）、YAML（`.yaml/.yml`）、JSON（`.json`），通过配置文件定义解析规则

## Out of Scope

1. 文档的自动翻译（如中英文互译）
2. 文档的导出格式转换（如导出为 PDF、Word）
3. 文档的版本控制和差异比较（超出增量更新范围的高级版本管理）
4. 文档的协作编辑功能
5. 文档的在线预览和分享功能
6. 与外部文档管理系统的集成
7. 图片和附件的自动生成
8. 文档审批流程的实现
9. 多项目/多 spec 的批量文档生成
10. 自定义模板的创建和管理界面
