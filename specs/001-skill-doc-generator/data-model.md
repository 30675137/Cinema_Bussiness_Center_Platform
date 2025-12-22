# Data Model: Claude Skill 文档生成器

**Feature**: 001-skill-doc-generator
**Date**: 2025-12-22
**Purpose**: 定义 Skill 的数据结构、工作流程和模板格式

## 概述

本文档定义 Claude Skill 文档生成器的核心数据结构，包括 Skill 元数据、工作流程定义和文档模板格式。由于这是一个 Skill 项目而非传统应用，"数据模型"指的是 Skill 的结构化定义和处理的信息模型。

## Skill 元数据结构

### Frontmatter（YAML 格式）

```yaml
name: skill-doc-generator
description: This skill should be used when the user asks to "从 spec.md 生成数据模型", "从规格说明生成 API 文档", "整合 Spec-Kit 文档", "抽取数据模型说明", "生成 API 接口说明", "consolidate data models from spec.md", "generate API documentation from specs", mentions "Spec-Kit", "spec.md", "data_model.md", or "api_spec.md". Provides guidance for extracting and consolidating structured documentation from Spec-Kit specifications.
version: 0.1.0
```

**字段定义**：

| 字段 | 类型 | 必填 | 说明 | 约束 |
|------|------|------|------|------|
| name | String | 是 | Skill 标识符 | kebab-case，全局唯一 |
| description | String | 是 | 触发条件说明 | 第三人称，包含具体触发短语 |
| version | String | 是 | 语义化版本号 | 格式：major.minor.patch |

## 核心数据实体

### 1. 规格文件（SpecificationFile）

**说明**：输入的 Spec-Kit 规格文档

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| path | String | 是 | 文件路径 | 格式：`specs/<specId>-<slug>/spec.md` |
| specId | String | 是 | 功能标识符 | 从路径提取 |
| content | String | 是 | Markdown 文本内容 | 通过 Read 工具获取 |
| hasDataModel | Boolean | 是 | 是否包含数据模型章节 | 通过章节匹配判断 |
| hasAPI | Boolean | 是 | 是否包含 API 定义章节 | 通过章节匹配判断 |

**业务规则**：
- path 必须以 `spec.md` 结尾
- specId 提取规则：`specs/(\d+)-([^/]+)/spec.md` → `$1`
- 如果 hasDataModel 和 hasAPI 都为 false，跳过该文件并记录

**关系**：
- 一个 SpecificationFile 可包含多个 DataEntity
- 一个 SpecificationFile 可包含多个 APIEndpoint

### 2. 数据实体（DataEntity）

**说明**：从规格中提取的领域实体定义

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| name | String | 是 | 实体名称 | 如 "Store", "User" |
| description | String | 否 | 实体业务含义 | 从规格描述提取 |
| fields | Field[] | 是 | 字段列表 | 至少包含 1 个字段 |
| businessRules | String[] | 否 | 业务规则列表 | 从规格提取 |
| relationships | Relationship[] | 否 | 与其他实体的关系 | 如 "一对多"、"多对多" |
| sourceSpec | String | 是 | 来源规格文件路径 | 用于冲突检测 |

**Field 子结构**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| name | String | 是 | 字段名 | 如 "name", "email" |
| type | String | 是 | 数据类型 | 如 "String", "Integer", "Enum" |
| required | Boolean | 是 | 是否必填 | true/false |
| description | String | 否 | 字段说明 | 业务含义 |
| constraints | String | 否 | 约束条件 | 如 "长度 ≤ 100", "唯一" |

**Relationship 子结构**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| targetEntity | String | 是 | 关联的实体名 | 如 "User", "Store" |
| type | String | 是 | 关系类型 | "一对一", "一对多", "多对多" |
| description | String | 否 | 关系说明 | 如 "一个门店有多个影厅" |

**业务规则**：
- 如果多个规格定义了同名实体（name 相同），必须检测字段差异
- 如果字段定义一致，合并为单一实体（sourceSpec 列出所有来源）
- 如果字段定义不一致，标记冲突并保留所有版本

**关系**：
- 多个 DataEntity 可能引用同一实体（通过 targetEntity）
- 一个 DataEntity 可能在多个 SpecificationFile 中定义

### 3. API 端点（APIEndpoint）

**说明**：从规格中提取的 API 接口定义

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| name | String | 是 | 端点名称 | 如 "创建门店", "查询用户列表" |
| method | String | 是 | HTTP 方法 | GET, POST, PUT, DELETE, PATCH |
| path | String | 是 | 端点路径 | 如 "/api/stores", "/api/users/{id}" |
| description | String | 否 | 功能描述 | 业务功能说明 |
| requestParams | RequestParam[] | 否 | 请求参数列表 | 可为空（如 GET 无 body） |
| responseFormat | String | 否 | 响应格式 | JSON 代码块或描述 |
| errorCodes | ErrorCode[] | 否 | 错误码列表 | 可为空（标记为 TODO） |
| authRequired | Boolean | 是 | 是否需要认证 | true/false |
| sourceSpec | String | 是 | 来源规格文件路径 | 用于分组 |

**RequestParam 子结构**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| name | String | 是 | 参数名 | 如 "name", "type" |
| type | String | 是 | 数据类型 | String, Integer, Boolean, Enum |
| required | Boolean | 是 | 是否必填 | true/false |
| description | String | 否 | 参数说明 | 业务含义 |
| example | String | 否 | 示例值 | 如 "示例名称", "TYPE_A" |

**ErrorCode 子结构**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| code | String | 是 | 错误码 | 如 "INVALID_PARAMETER" |
| httpStatus | Integer | 是 | HTTP 状态码 | 400, 404, 409, 500 等 |
| message | String | 是 | 错误说明 | 如 "参数验证失败" |
| handling | String | 否 | 处理建议 | 如 "检查请求参数" |

**业务规则**：
- 同一功能模块的 API 应该分组（通过 sourceSpec 路径）
- 响应格式必须符合项目 API 标准（`.claude/rules/08-api-standards.md`）
- 如果 errorCodes 为空，标记为 `TODO: 待定义错误响应`

## 工作流程定义

### Workflow Steps（工作流程步骤）

```yaml
steps:
  1_identify:
    name: "识别规格文档"
    tool: Glob
    pattern: "specs/*/spec.md"
    output: "SpecificationFile[]"

  2_parse:
    name: "解析规格内容"
    tool: Read
    input: "SpecificationFile.path"
    operations:
      - identify_data_model_section
      - identify_api_section
      - extract_entities
      - extract_endpoints
    output: "DataEntity[], APIEndpoint[]"

  3_consolidate:
    name: "整合信息"
    operations:
      - merge_duplicate_entities
      - detect_conflicts
      - group_apis_by_module
    output: "ConsolidatedDataModel, ConsolidatedAPISpec"

  4_generate:
    name: "生成文档"
    tool: Write
    templates:
      - data_model_template
      - api_spec_template
    output: "data_model.md, api_spec.md"

  5_validate:
    name: "验证完整性"
    operations:
      - check_entity_coverage
      - check_api_coverage
      - mark_missing_info
    output: "ValidationReport"

  6_report:
    name: "报告结果"
    content:
      - generated_files_paths
      - missing_info_summary
      - conflict_warnings
```

### 章节匹配规则（Section Matching Rules）

**数据模型章节关键词**：
- "Key Entities" / "关键实体" / "实体定义"
- "Data Model" / "数据模型" / "领域模型"
- "Database Design" / "数据库设计"

**API 章节关键词**：
- "API Endpoints" / "API 端点" / "接口定义"
- "API Design" / "API 设计"
- "REST API" / "GraphQL API"

### 信息缺口标记规则（Missing Info Marking Rules）

| 缺失类型 | 标记格式 | 示例 |
|---------|---------|------|
| 字段类型未定义 | `TODO: 待规格明确类型` | `type: TODO: 待规格明确类型` |
| 枚举值未定义 | `TODO: 待定义枚举值` | `constraints: TODO: 待定义枚举值` |
| 错误响应缺失 | `TODO: 待定义错误响应` | `**错误响应**：TODO: 待定义错误响应` |
| 业务规则缺失 | `TODO: 待规格明确业务规则` | `**业务规则**：TODO: 待规格明确业务规则` |

## 输出文档结构

### 1. data_model.md（数据模型文档）

```markdown
# 数据/领域模型说明

## 文档信息
- 功能标识：<specId>-<slug>
- 生成时间：YYYY-MM-DD HH:MM:SS
- 基于规格：specs/<specId>-<slug>/spec.md

## 领域概述
[从规格 Summary 提取或生成简要描述]

## 核心实体

### <EntityName>
**说明**：[entity.description]

**字段定义**：
| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| [field.name] | [field.type] | [field.required] | [field.description] | [field.constraints] |

**业务规则**：
- [businessRule 1]
- [businessRule 2]

**关系**：
- 与 [targetEntity] 的关系：[relationship.type] - [relationship.description]

## 数据验证规则
[从规格的 Functional Requirements 提取验证相关需求]

## 附录
### 术语表
### 状态机图（如适用）
### ER 图（如适用）
```

### 2. api_spec.md（API 接口文档）

```markdown
# API 接口规格说明

## 文档信息
- 功能标识：<specId>-<slug>
- 生成时间：YYYY-MM-DD HH:MM:SS
- 基于规格：specs/<specId>-<slug>/spec.md

## API 概述
[从规格 Summary 提取]

## 通用规范
### 基础路径
- 开发环境：http://localhost:8080/api
- 生产环境：https://api.example.com/api

### 认证方式
- Bearer Token (JWT)
- 请求头：`Authorization: Bearer <token>`

### 通用响应格式
[参考 .claude/rules/08-api-standards.md]

## API 端点

### [endpoint.name]
**描述**：[endpoint.description]
**端点**：[endpoint.method] [endpoint.path]

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| [param.name] | [param.type] | [param.required] | [param.description] | [param.example] |

**成功响应**（200 OK）：
```json
[endpoint.responseFormat]
```

**错误响应**：
| 错误码 | HTTP状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
| [error.code] | [error.httpStatus] | [error.message] | [error.handling] |

## 错误码表
[汇总所有 errorCodes]

## 附录
### 变更历史
### 相关文档
```

## 验证规则

### 覆盖率验证

**数据模型覆盖率**：
- 检查所有规格文件中定义的实体是否都已提取
- 公式：`extracted_entities / total_entities_in_specs * 100%`
- 目标：100%（SC-003）

**API 覆盖率**：
- 检查所有规格文件中定义的端点是否都已提取
- 公式：`extracted_endpoints / total_endpoints_in_specs * 100%`
- 目标：100%（SC-004）

### 格式一致性验证

- 所有文档章节结构一致
- 所有表格格式一致（列名、对齐）
- 所有代码块有正确的语言标记

### 信息缺口验证

- 所有缺失信息都已标记
- 无遗漏的 undefined 或 null 值
- 目标：100% 缺失项标记（SC-006）

## 实施注意事项

### 性能考虑

- 批量读取所有规格文件（单次 Glob）
- 解析结果在内存中缓存
- 预计处理时间：< 1 分钟（10 个文件）

### 冲突处理策略

- 同名实体但字段不同：显式标记冲突，保留所有版本
- 同名 API 但定义不同：按 sourceSpec 分组，标记差异
- 不进行自动合并或假设

### 错误处理

- 规格文件无法读取：跳过并记录警告
- 章节匹配失败：标记为"无数据模型/API 定义"
- 解析失败：标记为 `TODO: 解析失败，需人工检查`

## 相关文档

- 规格文档：`specs/001-skill-doc-generator/spec.md`
- 研究文档：`specs/001-skill-doc-generator/research.md`
- 项目 API 标准：`.claude/rules/08-api-standards.md`
- Skill 开发指南：`~/.claude/plugins/.../plugin-dev/skills/skill-development/skill.md`
