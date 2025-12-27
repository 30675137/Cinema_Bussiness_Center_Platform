---
name: skill-doc-generator
description: This skill should be used when the user asks to "从 spec.md 生成数据模型", "从规格说明生成 API 文档", "整合 Spec-Kit 文档", "添加 [specId] 到数据模型", "将 [specId] 追加到 API 文档", "增量更新 [specId]", "合并 [specId] 到文档", or mentions keywords like "Spec-Kit", "data_model.md", "api_spec.md", "consolidate data models from spec.md", "generate API documentation from specs", "add [specId] to data model", "append [specId] to API documentation"
version: 0.1.0
---

# Spec-Kit 文档整合专家

## 概述

从 `specs/` 目录下的规格文档中自动提取和整合数据模型与 API 接口定义，生成统一的 `data_model.md` 和 `api_spec.md` 文档。支持全量生成和增量更新两种模式，提供结构化的文档输出和缺失项标记功能，确保项目文档的一致性和完整性。

## 何时使用

在以下场景中使用此 Skill：

- **全量生成数据模型**：需要从所有规格文档中提取实体定义、字段说明、业务规则和关系，生成统一的数据模型文档
- **全量生成 API 文档**：需要从所有规格文档中提取 API 端点、请求/响应格式、错误码，生成标准化的 API 接口文档
- **增量更新数据模型**：新增规格后，需要将新实体追加到现有的 data_model.md 而不重新生成整个文档
- **增量更新 API 文档**：新增 API 规格后，需要将新端点追加到现有的 api_spec.md
- **规格文档整合**：多个功能规格分散在不同文件中，需要统一视图查看所有数据模型和 API 定义
- **文档质量检查**：需要识别规格中的信息缺口（如缺少字段类型、错误响应定义）

## 工作流程

### Step 1: 识别目标规格文档

**全量生成模式**：
- 使用 `Glob: specs/*/` 获取所有规格目录路径
- 对于每个规格目录，按优先级查找数据源文件：
  1. 数据模型：查找 `data-model.md`, `data_model.md`（如不存在，从 spec.md 提取）
  2. API 文档：查找 `api.md`, `api-spec.md`, `api_spec.md`（如不存在，从 spec.md 提取）
  3. 补充信息：查找 `quickstart.md`（可选，作为补充数据源）
- 验证每个文件的可读性

**增量更新模式**：
- 从用户触发短语中提取 specId（如 "添加 021-新功能" → specId="021"）
- 构造目标路径 `specs/{specId}-*/`
- 使用 Glob 查找匹配的规格目录
- 应用相同的文件优先级规则查找数据源

### Step 2: 解析规格内容

**识别数据模型章节**：
- 匹配章节标题关键词：Key Entities、关键实体、数据模型、领域模型、Database Design、核心实体
- 在章节内容中查找实体定义模式：
  - 粗体文本：`**Entity Name**:`
  - Markdown 标题：`### Entity Name`
  - 列表项：`- **Entity Name**: description`

**提取字段定义**：
- 表格格式（首选）：解析 Markdown 表格，提取字段名、类型、必填性、说明、约束
- 列表格式：解析列表项，识别字段属性

**识别 API 章节**：
- 匹配章节标题关键词：API Endpoints、API 端点、接口定义、REST API、API 设计
- 使用正则表达式识别端点：`(GET|POST|PUT|DELETE|PATCH)\s+/[a-zA-Z0-9/_\-{}:]+`
- 提取请求参数、响应格式（JSON 代码块）、错误码（表格或列表）

**检测信息缺口**：
- 字段类型缺失：标记为 `TODO: 待规格明确类型`
- 枚举值未列出：标记为 `TODO: 待定义枚举值`
- 错误响应未定义：标记为 `TODO: 待定义错误响应`

### Step 3: 整合数据模型（全量或增量合并）

**全量生成模式**：
- 遍历所有解析的实体
- 使用字典去重：相同实体名称的定义合并为一个
- 记录实体来源规格（用于追溯）

**增量更新模式（智能合并）**：
- 读取现有的 data_model.md 文档
- 解析现有实体和字段
- 对于新规格中的每个实体：
  - 如果实体名不存在：直接追加新实体
  - 如果实体名已存在：
    - 遍历新实体的字段列表
    - 同名字段：保留原定义，不覆盖
    - 新字段：追加到字段列表，在说明列末尾添加 `（来源：{specId}）`
- 合并业务规则和关系定义

### Step 4: 生成数据模型文档

- 填充 `references/templates.md` 中的 data_model.md 模板
- 替换占位符：`{{specId}}`、`{{generationTimestamp}}`、`{{entities}}`
- 对于每个实体，生成字段表格、业务规则列表、关系说明
- 标记缺失项（如字段类型为空，写入 `TODO: 待规格明确类型`）
- 全量模式：写入新文件 `data_model.md`
- 增量模式：追加到现有 `data_model.md` 的 "核心实体" 章节

### Step 5: 生成 API 文档（并行执行）

- 填充 `references/templates.md` 中的 api_spec.md 模板
- 整合所有 API 端点，按功能模块分组
- 遵循项目 API 响应格式标准（参考 `.claude/rules/08-api-standards.md`）
- 生成通用规范部分（认证方式、响应格式、HTTP 状态码）
- 对于每个端点，生成请求参数表格、响应示例、错误码表
- 标记缺失项（如错误响应未定义，写入 `TODO: 待定义错误响应`）

### Step 6: 输出结构化摘要报告

**全量生成报告**：
```
✅ 文档生成完成

处理的规格文件：
- specs/020-store-address/spec.md
- specs/019-store-association/spec.md
- specs/014-hall-store-backend/spec.md

生成的数据模型：
- 总实体数：12
- 总字段数：87
- 文档路径：data_model.md

生成的 API 文档：
- 总端点数：15
- 文档路径：api_spec.md

信息缺口：
- data_model.md: 3 项待补充（实体 Store 的 region 字段类型、实体 User 的业务规则、实体 Hall 的关系）
- api_spec.md: 2 项待补充（POST /api/stores 的错误响应、GET /api/halls 的认证方式）
```

**增量更新报告**：
```
✅ 增量更新完成

处理的规格：021-new-feature

数据模型更新：
- 新增实体：2 个（Order, Payment）
- 新增字段：8 个
- 合并实体：1 个（Store - 新增 3 个字段）
- 文档路径：data_model.md

API 文档更新：
- 新增端点：4 个
- 文档路径：api_spec.md
```

## 引用资源

- **文档模板**：`references/templates.md` - 包含 data_model.md 和 api_spec.md 的完整模板结构
- **解析规则**：`references/parsing-rules.md` - 详细的章节识别规则、实体定义模式、字段提取规则
- **示例文件**：`examples/sample-spec.md` - 示例规格文档
- **预期输出**：`examples/sample-data-model.md` - 预期的数据模型文档格式
- **API 标准**：`.claude/rules/08-api-standards.md` - 项目统一的 API 响应格式规范

## 注意事项

- **不编造内容**：遇到缺失信息时，使用 `TODO: 待规格明确` 标记，不得编造或猜测
- **保留原定义**：增量更新时，同名字段保留原定义，避免意外覆盖
- **来源标注**：增量更新的新字段必须标注来源规格（格式：`（来源：specId-slug）`）
- **格式一致**：生成的文档必须严格遵循模板格式，确保所有文档结构统一
- **冲突报告**：如果检测到同名实体但定义不一致，在报告中明确标注，建议人工确认
- **文件源优先级**：优先使用专门文档（data-model*.md, api*.md），如不存在则从 spec.md 提取，避免重复读取导致定义冲突
- **文件名匹配**：支持常见命名变体（连字符、下划线），按字母顺序使用第一个匹配的文件
