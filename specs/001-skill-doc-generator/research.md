# Research: Claude Code Skill 文档生成器设计

**Feature**: 001-skill-doc-generator
**Date**: 2025-12-22
**Purpose**: 研究 Claude Code Skill 设计最佳实践，为实现 Spec-Kit 文档生成器 Skill 提供技术指导

## 研究目标

1. 确定 Claude Code Skill 的核心结构和编写规范
2. 研究渐进式披露设计模式在 Skill 中的应用
3. 确定文档模板的最佳设计方式
4. 研究 Spec-Kit 规格文档的通用解析方法
5. 确定 Skill 的触发机制和工作流程设计

## Decision 1: Claude Code Skill 核心结构

### 选择：采用标准 Skill 三层结构（SKILL.md + references/ + examples/）

**Rationale**:
- **SKILL.md**：包含 frontmatter（name, description, version）和核心工作流程（1500-2000 字）
- **references/**：存放详细的模板定义和解析规则，按需加载
- **examples/**：提供完整的示例输入输出，便于测试和参考

**Alternatives Considered**:
1. **单文件 SKILL.md** - 简单但会超过 3000 字限制，违反渐进式披露原则
2. **SKILL.md + scripts/**  - 不需要可执行脚本，纯文档生成任务
3. **仅 references 无 SKILL.md** - 违反 Skill 框架要求，无法被 Claude Code 识别

**Supporting Evidence**:
- Plugin-dev skill (`hook-development`) 使用 3 个 references 文件，SKILL.md 仅 1651 字
- `skill-development` skill 明确要求 SKILL.md < 3000 字，推荐 1500-2000 字
- 渐进式披露确保 Skill 加载时上下文开销最小

## Decision 2: Description（触发短语）设计

### 选择：使用多语言混合的具体触发短语

**Description 内容**:
```yaml
description: This skill should be used when the user asks to "从 spec.md 生成数据模型", "从规格说明生成 API 文档", "整合 Spec-Kit 文档", "抽取数据模型说明", "生成 API 接口说明", "consolidate data models from spec.md", "generate API documentation from specs", mentions "Spec-Kit", "spec.md", "data_model.md", or "api_spec.md". Provides guidance for extracting and consolidating structured documentation from Spec-Kit specifications.
```

**Rationale**:
- 包含中英文触发短语，覆盖不同用户的表达习惯
- 列出具体的关键词（"Spec-Kit"、"spec.md"、"data_model.md"）
- 使用第三人称格式（"This skill should be used when..."）
- 包含 Skill 功能的简要说明

**Alternatives Considered**:
1. **仅中文触发短语** - 限制了国际化使用场景
2. **仅关键词匹配** - 可能导致误触发
3. **过于宽泛的描述** - 触发准确率低，不符合 95% 准确率目标

**Supporting Evidence**:
- `hook-development` skill 使用混合中英文触发短语，包含具体命令
- `skill-development` 明确要求包含用户会说的具体短语
- 项目规格要求 95% 触发准确率（SC-008）

## Decision 3: 工作流程设计

### 选择：六步工作流程（识别→解析→整合→生成→验证→报告）

**Workflow Steps**:

1. **识别规格文档**：使用 Glob 扫描 `specs/*/spec.md`
2. **解析规格内容**：使用 Read 读取并识别以下章节：
   - 数据模型：Key Entities、数据库设计、实体定义
   - API 定义：API 端点、请求/响应格式、错误处理
3. **整合信息**：合并多个规格文件中的相同实体，检测冲突
4. **生成文档**：使用模板生成 `data_model.md` 和 `api_spec.md`
5. **验证完整性**：检查覆盖率，标记缺失信息
6. **报告结果**：汇总生成的文档路径和缺失项列表

**Rationale**:
- 遵循清晰的线性流程，每步职责单一
- 第 2 步（解析）和第 3 步（整合）是核心难点，需要详细的 references
- 第 5 步（验证）确保 100% 覆盖率目标（SC-003, SC-004）
- 第 6 步（报告）提供用户反馈和质量保证

**Alternatives Considered**:
1. **简化为四步流程（识别→解析→生成→验证）** - 缺少整合步骤，无法处理多规格合并
2. **增加自动修复步骤** - 超出 Skill 职责，可能编造内容（违反 FR-010）
3. **并行处理多文件** - 增加复杂度，对 10 个文件 < 1 分钟的目标不必要

## Decision 4: 模板定义方式

### 选择：在 references/templates.md 中提供完整的 Markdown 模板

**Template Structure** (data_model.md):
```markdown
# 数据/领域模型说明

## 文档信息
- 功能标识：<feature-id>
- 生成时间：YYYY-MM-DD
- 基于规格：specs/<feature-id>/spec.md

## 领域概述
[简要描述]

## 核心实体

### 实体名称 1
**说明**：[业务含义]

**字段定义**：
| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| ... | ... | ... | ... | ... |

**业务规则**：
- ...

**关系**：
- ...
```

**Template Structure** (api_spec.md):
```markdown
# API 接口规格说明

## 文档信息
- 功能标识：<feature-id>
- 生成时间：YYYY-MM-DD
- 基于规格：specs/<feature-id>/spec.md

## API 概述
[简要描述]

## 通用规范
### 基础路径
### 认证方式
### 通用响应格式

## API 端点

### 1. 端点名称
**描述**：...
**端点**：POST /api/resource
**请求参数**：...
**成功响应**：...
**错误响应**：...
```

**Rationale**:
- 完整模板放在 references/ 避免 SKILL.md 过长
- 使用占位符（`<feature-id>`）便于 Claude 替换
- 表格格式便于结构化信息展示
- 遵循项目 API 标准（参考 `.claude/rules/08-api-standards.md`）

**Alternatives Considered**:
1. **硬编码模板在 SKILL.md** - 超过字数限制
2. **动态生成模板** - 增加复杂度，不必要
3. **使用 JSON 模板** - 不符合项目 Markdown 文档习惯

## Decision 5: 规格文档解析规则

### 选择：章节关键词匹配 + 内容模式识别

**Parsing Rules** (references/parsing-rules.md):

**数据模型解析**：
- **章节匹配**：识别包含以下关键词的章节
  - "Key Entities" / "关键实体" / "实体定义"
  - "Data Model" / "数据模型" / "领域模型"
  - "Database Design" / "数据库设计"
- **内容模式**：
  - 实体名称：通常为粗体（`**Entity Name**`）或标题（`### Entity`）
  - 字段定义：表格格式或列表格式
  - 关系：包含 "一对多"、"多对多"、"belongs to"、"has many" 等关键词

**API 解析**：
- **章节匹配**：
  - "API Endpoints" / "API 端点" / "接口定义"
  - "API Design" / "API 设计"
  - "REST API" / "GraphQL API"
- **内容模式**：
  - 端点路径：HTTP 方法 + 路径（如 `POST /api/stores`）
  - 请求/响应：代码块（JSON 格式）
  - 错误码：表格或列表

**Rationale**:
- 兼容不同的 spec.md 结构和命名约定
- 关键词匹配处理格式不一致问题（Edge Case 1）
- 模式识别提高提取准确性

**Alternatives Considered**:
1. **严格的章节名称要求** - 不灵活，无法处理现有规格文件
2. **AI 自由解析** - 不可预测，可能遗漏信息
3. **正则表达式匹配** - 过于复杂，维护困难

## Decision 6: 冲突检测与信息缺口处理

### 选择：显式标记 + 人工介入

**冲突检测**：
- 当发现同名实体但字段定义不同时：
  ```markdown
  ## 实体：User

  ⚠️ **冲突检测**：该实体在以下规格中有不同定义：
  - specs/001-brand-management/spec.md：包含字段 `username, email`
  - specs/019-store-association/spec.md：包含字段 `user_id, role`

  **建议**：请人工确认是否为同一实体，或应拆分为不同实体。
  ```

**信息缺口标记**：
- 使用 `TODO: 待规格明确` 标记：
  ```markdown
  | 字段名 | 类型 | 必填 | 说明 | 约束 |
  |-------|------|------|------|------|
  | status | Enum | TODO: 待规格明确 | 状态 | TODO: 待定义枚举值 |
  ```

**Rationale**:
- 显式标记确保 100% 缺失项标记（SC-006）
- 冲突检测避免静默合并错误数据（Edge Case 2）
- 人工介入确保数据准确性（不编造内容，FR-010）

**Alternatives Considered**:
1. **自动合并冲突** - 可能引入错误，违反不编造内容原则
2. **跳过冲突实体** - 降低覆盖率，违反 100% 目标
3. **详细的冲突解析算法** - 过度工程化，不必要

## Decision 7: 性能优化策略

### 选择：批量读取 + 简单缓存

**Implementation**:
- 使用单次 `Glob specs/*/spec.md` 获取所有规格文件路径
- 使用并行 `Read` 调用读取多个文件（如果 Claude Code 支持）
- 解析结果在内存中缓存（实体字典、API 列表）

**Expected Performance**:
- 10 个规格文件读取：< 10 秒（假设每个文件 1 秒）
- 解析和整合：< 20 秒
- 文档生成：< 10 秒
- 总计：< 40 秒（符合 < 1 分钟目标，SC-002）

**Rationale**:
- 批量操作减少工具调用次数
- 内存缓存避免重复解析
- 简单设计符合 Skill 的轻量化原则

**Alternatives Considered**:
1. **逐个文件顺序处理** - 慢，可能超时
2. **持久化缓存（文件系统）** - 过度工程化，增加复杂度
3. **增量更新** - 第一版不需要，可作为未来优化

## Research Summary

### 核心设计决策

| 决策点 | 选择 | 关键原因 |
|-------|------|---------|
| Skill 结构 | SKILL.md + references/ + examples/ | 渐进式披露，遵循最佳实践 |
| Description | 混合中英文具体触发短语 | 95% 触发准确率目标 |
| 工作流程 | 六步流程（识别→解析→整合→生成→验证→报告） | 清晰、可测试、符合需求 |
| 模板定义 | Markdown 模板在 references/templates.md | 完整、易维护、符合项目规范 |
| 解析规则 | 关键词匹配 + 内容模式识别 | 兼容性好、准确率高 |
| 冲突处理 | 显式标记 + 人工介入 | 不编造内容，确保准确性 |
| 性能策略 | 批量读取 + 内存缓存 | 简单有效，符合性能目标 |

### 风险与缓解

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| 规格格式不一致 | 高 | 中 | 多关键词匹配，提供解析规则文档 |
| 触发准确率不达标 | 中 | 高 | 详细的触发短语列表，用户反馈迭代 |
| 性能目标未达成 | 低 | 中 | 批量操作，必要时增加并行处理 |
| 信息缺口标记遗漏 | 中 | 高 | 严格的验证步骤，测试覆盖 |

### 下一步（Phase 1）

1. 编写 `data-model.md`：定义 Skill 的数据结构（frontmatter, workflow, templates）
2. 创建 `contracts/` 目录：提供完整的文档模板示例
3. 编写 `quickstart.md`：Skill 开发和测试指南
4. 更新 agent context：无需更新（Skill 项目无外部依赖）

### 参考文档

- Claude Code Skill 最佳实践：`~/.claude/plugins/.../plugin-dev/skills/skill-development/skill.md`
- 项目 API 标准：`.claude/rules/08-api-standards.md`
- 现有 Skill 示例：`~/.claude/plugins/.../plugin-dev/skills/hook-development/`
