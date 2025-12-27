# Feature Specification: Claude Skill 文档生成器

**Feature Branch**: `001-skill-doc-generator`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "通过context7 了解 claude skill的编写方法 我需要数据模型与接口文档撰写的skill,通过遍历 specs下的所有文档,抽取主数据模型与接口文档"

## Clarifications

### Session 2025-12-22

- Q: 增量更新时如何检测哪些规格文件需要处理？ → A: 用户指定范围 - 用户在触发短语中提供目标 spec ID（如"将 021-新功能 添加到数据模型"），Skill 追加到现有文档
- Q: 增量更新时遇到同名实体但字段定义不同时如何处理？ → A: 智能合并 - 自动合并字段列表（新字段追加，同名字段保留原定义），在文档中标注来源规格
- Q: 合并后的实体字段来源标注如何展示？ → A: 字段说明内联标注 - 在字段说明列末尾添加（来源：020-store-address），保持表格简洁
- Q: 增量更新功能需要哪些触发短语？ → A: 多样化自然语言 - 包含"添加 [specId] 到数据模型"、"将 [specId] 追加到 API 文档"、"增量更新 [specId]"、"合并 [specId] 到文档"等多种表达
- Q: 增量更新完成后如何报告处理结果？ → A: 结构化摘要报告 - 输出处理的 spec ID、新增实体数量、新增字段数量、合并的实体列表、生成文档路径
- Q: Skill 应该支持哪些文件源（spec.md vs 专门文档）？ → A: 既支持 spec.md 也支持专门文档（api*.md, data-model*.md, quickstart.md），优先读取专门文档
- Q: 多个数据源文件的查找优先级规则？ → A: 专门文档优先，spec.md 兜底 - 查找 data-model*.md / api*.md，如果不存在则从 spec.md 提取
- Q: quickstart.md 在文档提取中的角色？ → A: 作为补充数据源 - 优先级低于 data-model*.md 和 api*.md
- Q: 文件名模式匹配规则（api*.md, data-model*.md）？ → A: 支持常见命名变体 - api.md, api-spec.md, api_spec.md / data-model.md, data_model.md
- Q: 同一 spec 目录内多源冲突处理（如 data-model.md 和 spec.md 都定义了 Store）？ → A: 专门文档优先，忽略 spec.md 中的重复定义
- Q: 生成的文档应该存放在哪个目录结构下？ → A: docs/data-model/ 存放数据模型文档，docs/api/ 存放 API 文档
- Q: 生成脚本（generate_api_docs.py）应该存放在哪里？ → A: scripts/ 目录（与其他项目脚本统一管理）
- Q: 当 Skill 解析过程中遇到无法识别的实体定义格式时应该如何处理？ → A: 记录警告并跳过，在最终报告中列出未识别的章节
- Q: 生成的文档需要包含版本控制信息吗（如最后更新时间、版本号）？ → A: 包含生成时间戳和处理的源规格列表
- Q: Skill 工作流程中是否需要在生成文档前向用户确认规格范围？ → A: 全量生成自动执行，增量更新根据触发短语自动识别

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 自动生成数据模型文档 (Priority: P1)

作为项目开发者，我希望能够从 `specs/` 目录下的所有功能规格文档中自动提取和整合数据模型信息，生成统一的数据模型说明文档，这样我就不需要手动整理分散在各个规格中的实体定义、字段说明和关系描述。

**Why this priority**: 数据模型是后端开发的基础，统一的数据模型文档能够避免重复工作，确保所有开发者对数据结构有一致的理解。这是最核心的功能，能够立即带来价值。

**Independent Test**: 可以通过提供包含数据模型定义的 spec.md 文件来独立测试。系统应该能够识别实体、字段、约束和关系，并生成结构化的 `data_model.md` 文档。

**Acceptance Scenarios**:

1. **Given** specs 目录下有 3 个功能规格文件，每个文件都定义了不同的数据实体，**When** 用户触发文档生成命令，**Then** 系统应该生成包含所有实体定义的统一数据模型文档
2. **Given** 某个 spec.md 中定义了实体 Store 包含字段 name, address, phone，**When** 系统解析该规格，**Then** 生成的数据模型文档应该包含 Store 实体及其所有字段定义和约束
3. **Given** 多个规格文件中引用了相同的实体（如 User），**When** 生成数据模型文档，**Then** 系统应该合并相同实体的定义，避免重复
4. **Given** spec.md 中定义了实体间的关系（如一对多、多对多），**When** 生成文档，**Then** 数据模型文档应该清晰标注实体关系
5. **Given** 已存在 data_model.md 文档，**When** 用户说"将 021-新功能 添加到数据模型"，**Then** 系统应该仅处理 021 规格并将新实体追加到现有文档，保留原有内容

---

### User Story 2 - 自动生成 API 接口文档 (Priority: P1)

作为后端开发者，我希望能够从功能规格文档中自动提取 API 接口定义，生成标准化的 API 接口说明文档，包括端点、请求/响应格式、错误码等，这样我就能快速了解所有 API 的设计规范，无需在多个规格文件间跳转。

**Why this priority**: API 接口文档是前后端协作的桥梁，自动生成能够确保接口定义的一致性，减少沟通成本。与数据模型同等重要，是 MVP 的核心功能。

**Independent Test**: 可以通过提供包含 API 端点定义的 spec.md 文件来独立测试。系统应该能够提取端点路径、HTTP 方法、请求参数、响应格式和错误处理，生成标准化的 `api_spec.md` 文档。

**Acceptance Scenarios**:

1. **Given** spec.md 中定义了 POST /api/stores 端点用于创建门店，**When** 系统解析该规格，**Then** API 文档应该包含该端点的完整定义（方法、路径、请求参数、响应格式）
2. **Given** 规格中定义了多个 API 端点的错误响应码，**When** 生成 API 文档，**Then** 文档应该包含统一的错误码表
3. **Given** 规格中定义了通用的认证方式（如 Bearer Token），**When** 生成文档，**Then** API 文档应该在通用规范部分说明认证方式
4. **Given** 多个规格文件定义了不同的 API 端点，**When** 生成文档，**Then** 所有端点应该按照功能模块分组并统一展示
5. **Given** 已存在 api_spec.md 文档，**When** 用户指定"添加 022-订单管理 的 API 到接口文档"，**Then** 系统应该仅解析该规格的 API 端点并追加到现有文档

---

### User Story 3 - 通过 Claude Skill 方式提供文档生成能力 (Priority: P2)

作为 Claude Code 用户，我希望能够通过自然语言命令（如"生成数据模型文档"、"从 specs 整合 API 文档"）触发文档生成功能，而不是手动运行复杂的脚本，这样我就能更自然地将文档生成集成到开发工作流中。

**Why this priority**: Skill 方式提供了更好的用户体验和可维护性，但不影响核心功能的实现。可以在 P1 功能完成后独立开发和测试。

**Independent Test**: 可以通过编写包含正确 frontmatter 和内容的 SKILL.md 文件来测试。当用户说出触发短语时，Claude 应该能够加载该 skill 并按照指导流程执行文档生成任务。

**Acceptance Scenarios**:

1. **Given** skill 已正确配置 description 触发短语，**When** 用户说"从 spec.md 生成数据模型"，**Then** Claude 应该自动加载该 skill 并开始执行文档生成流程
2. **Given** skill 定义了清晰的工作流程，**When** skill 被触发，**Then** Claude 应该按照步骤读取 specs 文件、解析内容、生成文档
3. **Given** skill 包含了文档模板定义，**When** 生成文档时，**Then** 输出应该符合模板规定的格式和结构
4. **Given** 用户提到"Spec-Kit"或"api_spec.md"，**When** skill 触发，**Then** Claude 应该识别这是与文档生成相关的任务

---

### User Story 4 - 标记和报告信息缺口 (Priority: P3)

作为规格审查者，我希望系统在生成文档时能够标记出规格中缺失的关键信息（如未定义的字段类型、缺少的错误码定义），这样我就能知道哪些规格需要补充完善。

**Why this priority**: 这是质量保证功能，能够提升文档质量，但不影响基本的文档生成能力。可以作为后续优化功能。

**Independent Test**: 可以通过提供故意包含不完整信息的 spec.md 文件来测试。系统应该识别缺失项并在生成的文档中使用 `TODO` 或 `待确认` 标记。

**Acceptance Scenarios**:

1. **Given** spec.md 中定义了实体但缺少某些字段的类型说明，**When** 生成数据模型文档，**Then** 文档应该在相应字段处标注 `TODO: 待规格明确类型`
2. **Given** API 端点定义缺少错误响应说明，**When** 生成 API 文档，**Then** 文档应该标注 `TODO: 待定义错误响应`
3. **Given** 生成文档完成后，**When** 系统输出报告，**Then** 报告应该汇总所有标记的缺失项，便于规格补充

### Edge Cases

- **规格文件格式不一致**：不同的 spec.md 可能使用不同的 Markdown 结构或章节命名，系统应该能够识别常见的变体（如"数据模型" vs "Domain Model" vs "实体定义"），无法识别的格式应记录警告并在报告中列出
- **实体定义部分重叠**：增量更新时，新规格定义的实体与现有实体同名但字段不完全相同，系统应该智能合并（追加新字段，保留原字段，标注来源）
- **规格文件缺失关键章节**：某些 spec.md 可能完全没有数据模型或 API 定义章节，系统应该跳过该文件并在报告中说明（不应导致整个流程失败）
- **循环依赖**：实体间存在循环引用关系（A 引用 B，B 引用 A）时，文档应该能够正确表示双向关系
- **大量规格文件**：当 specs 目录下有 50+ 个规格文件时，生成过程应该在合理时间内完成（建议 < 2 分钟）
- **多源文件同时存在**：当某个 spec 目录同时包含 data-model.md 和 spec.md（两者都定义实体）时，系统应使用 data-model.md 的定义，忽略 spec.md 中的重复内容
- **文件名变体混合**：当某个 spec 目录同时包含 api.md 和 api-spec.md 时，系统应按字母顺序优先使用第一个匹配的文件（api.md）
- **quickstart.md 内容不完整**：quickstart.md 可能仅包含简化的示例而非完整定义，系统应能识别并补充从其他源提取的信息

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须能够扫描并读取 `specs/` 目录下所有子目录中的规格文件，包括 `spec.md` 以及专门的数据模型文档（`data-model*.md`）、API 文档（`api*.md`）和快速入门文档（`quickstart.md`）
- **FR-001a**: 文件查找必须遵循优先级规则：data-model*.md > api*.md > quickstart.md > spec.md（专门文档优先，spec.md 兜底）
- **FR-001b**: 文件名模式匹配必须支持常见命名变体：api.md, api-spec.md, api_spec.md / data-model.md, data_model.md
- **FR-001c**: 当同一 spec 目录内多个文件都定义了相同内容时，必须使用专门文档的定义，忽略 spec.md 中的重复定义（避免冲突）
- **FR-002**: 系统必须能够从规格文件（优先从 data-model*.md，其次从 spec.md）中识别和提取数据模型相关信息，包括实体名称、字段定义、约束条件、实体关系
- **FR-003**: 系统必须能够从规格文件（优先从 api*.md，其次从 spec.md）中识别和提取 API 相关信息，包括端点定义、请求/响应格式、错误处理、认证方式
- **FR-004**: 系统必须生成结构化的数据模型文档并输出到 `docs/data-model/data_model.md`，包含实体定义、字段说明、业务规则、关系图
- **FR-005**: 系统必须生成结构化的 API 接口文档并输出到 `docs/api/api_spec.md`，包含端点列表、请求/响应示例、错误码表、认证说明
- **FR-006**: 系统必须遵循项目定义的 API 响应格式标准（参考 `.claude/rules/08-api-standards.md`）
- **FR-007**: 生成的文档必须使用中文撰写，技术术语可保留英文
- **FR-008**: 系统必须能够合并多个规格文件中对同一实体的定义，避免重复
- **FR-009**: 当遇到同名实体但定义不一致时，系统必须采用智能合并策略：新字段追加到字段列表，同名字段保留原定义，并在字段说明列末尾标注来源（格式：`（来源：specId-slug）`）
- **FR-010**: 当规格中缺少关键信息时，系统必须使用 `TODO: 待规格明确` 标记，而不是编造内容
- **FR-011**: 系统必须以 Claude Skill 形式实现，包含正确的 frontmatter（name, description, version）
- **FR-012**: Skill 的 description 必须包含明确的触发短语，包括全量生成（"从 spec.md 生成数据模型"、"整合 API 文档"、"Spec-Kit"）和增量更新（"添加 [specId] 到数据模型"、"将 [specId] 追加到 API 文档"、"增量更新 [specId]"、"合并 [specId] 到文档"）
- **FR-013**: Skill 必须提供清晰的工作流程说明，指导 Claude 按步骤执行文档生成任务
- **FR-014**: Skill 必须包含数据模型文档和 API 文档的模板定义
- **FR-015**: 生成的文档必须包含元数据，包括：生成时间戳（ISO 8601 格式）、处理的源规格列表（包含路径）、文档类型标识
- **FR-016**: 系统必须支持增量更新模式，当用户指定特定 spec ID 时，仅处理该规格并追加到现有文档
- **FR-017**: 增量更新时，系统必须保留现有文档的所有内容，仅在相应章节追加新内容
- **FR-018**: Skill 必须能够识别用户触发短语中的 spec ID（如"添加 021-新功能"、"将 022-订单 追加到文档"）
- **FR-019**: 增量更新完成后，系统必须输出结构化摘要报告，包含：处理的 spec ID、新增实体数量、新增字段数量、合并的实体列表、生成文档路径
- **FR-020**: 文档生成脚本必须存放在 `scripts/` 目录下，遵循项目脚本管理规范
- **FR-021**: 当遇到无法识别的实体定义格式时，系统必须记录警告、跳过该部分，并在最终报告中列出未识别的章节和文件位置，确保容错性
- **FR-022**: 全量生成模式下，系统必须自动扫描并处理所有 specs 目录下的规格文件，无需用户确认；增量更新模式下，系统必须根据触发短语自动识别目标 spec ID 并处理

### Key Entities

- **Skill 元数据**：包含 name（skill-doc-generator）、description（触发短语列表）、version（版本号）
- **规格文件源**：路径（如 specs/020-store-address/spec.md, data-model.md, api-spec.md, quickstart.md）、文件类型（spec/data-model/api/quickstart）、优先级（专门文档 > spec.md）、内容（Markdown 文本）、解析状态
- **数据实体**：实体名称、字段列表（字段名、类型、必填性、约束）、业务规则、与其他实体的关系、来源文件（用于追溯）
- **API 端点**：HTTP 方法、路径、请求参数、响应格式、错误码、认证要求、来源文件
- **生成文档**：文档类型（data_model 或 api_spec）、输出路径（`docs/data-model/data_model.md` 或 `docs/api/api_spec.md`）、内容、生成时间戳、缺失项列表、源文件列表（记录使用了哪些源）

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 开发者能够在 30 秒内通过自然语言命令触发文档生成，无需记忆复杂的脚本路径或参数
- **SC-002**: 系统能够在 1 分钟内处理包含 10 个规格文件的项目，生成完整的数据模型和 API 文档
- **SC-003**: 生成的数据模型文档覆盖率达到 100%（所有规格中定义的实体都被提取）
- **SC-004**: 生成的 API 文档覆盖率达到 100%（所有规格中定义的端点都被提取）
- **SC-005**: 生成的文档格式一致性达到 100%（所有文档遵循相同的章节结构和命名规范）
- **SC-006**: 当规格信息不完整时，系统能够标记 100% 的缺失项，无遗漏
- **SC-007**: 减少开发者手动整理文档的时间 80% 以上（从平均 2 小时降低到 20 分钟以内）
- **SC-008**: Skill 触发准确率达到 95% 以上（用户说出相关触发短语时，Claude 正确加载 skill 的比例）
