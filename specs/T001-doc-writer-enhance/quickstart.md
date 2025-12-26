# Quickstart: Doc-Writer Skill Enhancement

**Feature**: T001-doc-writer-enhance
**Date**: 2025-12-26

## Prerequisites

- Claude Code CLI installed and configured
- Project repository with `.claude/` directory structure
- Existing `specs/` directory with at least one spec.md file

## Files to Create/Modify

### 1. Create Command Configuration

**File**: `.claude/commands/doc.md`

```markdown
---
description: 设计文档编写专家 - 通过 /doc 命令生成和管理设计文档
allowed-tools: Read, Write, Glob, Grep, Edit
argument-hint: [文档类型或自然语言，如"tdd"、"init"、"技术方案"、"update"]
---

你是设计文档编写专家。使用 doc-writer skill 来生成和管理设计文档。

用户请求: $ARGUMENTS

## 执行指南

### 1. 意图识别

分析用户输入，确定操作类型：

| 意图 | 命令格式 | 执行方式 |
|-----|---------|---------|
| **单文档生成** | `/doc <type>` | 生成指定类型文档 |
| **全量初始化** | `/doc init` | 扫描所有源生成完整文档集 |
| **增量更新** | `/doc update` | 更新变更的文档 |
| **自然语言** | `/doc <描述>` | 意图识别后生成 |
| **帮助** | `/doc help` | 显示可用命令 |

### 2. 文档类型映射

| 类型代码 | 显示名称 | 关键词 |
|---------|---------|-------|
| tdd | 技术设计文档 | 技术方案, TDD, 技术设计 |
| arch | 架构设计文档 | 架构, 系统设计 |
| detail | 详细设计文档 | 详细设计, DDD |
| api | 接口设计文档 | 接口, API |
| db | 数据库设计文档 | 数据库, 表设计 |
| manual | 用户手册 | 手册, 使用说明 |
| readme | README | README, 项目说明 |
| release-notes | 发布说明 | 发布, CHANGELOG |
| matrix | 功能矩阵 | 功能矩阵, 功能列表 |

### 3. 执行流程

参考 `.claude/skills/doc-writer/SKILL.md` 中的工作流程执行。
```

### 2. Update Skill Definition

**File**: `.claude/skills/doc-writer/SKILL.md`

Add the following sections to the existing SKILL.md:

```markdown
## 命令入口

本技能支持 `/doc` 命令快捷调用：

- `/doc <type>` - 生成指定类型文档
- `/doc init` - 全量初始化文档
- `/doc update` - 增量更新文档
- `/doc help` - 显示帮助

## 新增文档类型

除现有的 5 种设计文档外，新增支持：

### 6. 用户手册
生成用户手册文档，包含：
- 功能概述
- 操作步骤
- 常见问题

### 7. README 文档
生成项目 README，包含：
- 项目简介
- 快速开始
- 功能特性

### 8. 发布说明
生成版本发布说明，包含：
- 版本信息
- 新增功能
- 问题修复

### 9. 产品功能矩阵
生成功能矩阵表格，自动汇总所有 spec 信息。

## 输出目录结构

文档输出到 `docs/` 目录（与 `specs/` 独立）：

```
docs/
├── tdd/                    # 技术设计文档
├── architecture/           # 架构设计文档
├── api/                    # 接口设计文档
├── database/               # 数据库设计文档
├── detail-design/{module}/ # 详细设计（按模块）
├── product/{module}/       # 产品文档（按模块）
├── manual/{module}/        # 用户手册（按模块）
├── matrix/                 # 功能矩阵
└── release-notes/          # 发布说明
```

## Spec 元数据扩展

在 spec.md 头部添加以下字段以支持模块组织：

```markdown
**System**: 系统名称
**Module**: 一级模块
**SubModule**: 二级模块（可选）
```
```

### 3. Create New Templates

**Files to create in** `.claude/skills/doc-writer/templates/`:

#### manual.md
```markdown
# {title} - 用户手册

**版本**: {version}
**更新日期**: {date}
**功能编码**: {specId}

## 功能概述

[待补充: 功能简要描述]

## 适用对象

[待补充: 目标用户群体]

## 操作步骤

### 1. 进入功能

[待补充: 入口路径]

### 2. 基本操作

[待补充: 主要操作步骤]

### 3. 高级功能

[待补充: 可选的高级功能]

## 常见问题

### Q1: [问题]
A: [答案]

## 注意事项

- [待补充: 使用注意事项]
```

#### readme.md
```markdown
# {title}

{description}

## 快速开始

### 前置条件

[待补充: 环境要求]

### 安装

[待补充: 安装步骤]

### 使用

[待补充: 基本使用方法]

## 功能特性

- [待补充: 主要功能列表]

## 目录结构

```
[待补充: 项目目录结构]
```

## 相关文档

- [待补充: 相关链接]
```

#### release-notes.md
```markdown
# 发布说明 - {version}

**发布日期**: {date}

## 概述

[待补充: 版本概述]

## 新增功能

- [待补充: 新功能列表]

## 功能优化

- [待补充: 优化内容]

## 问题修复

- [待补充: 修复的问题]

## 已知问题

- [待补充: 已知问题]

## 升级说明

[待补充: 升级步骤和注意事项]
```

#### feature-matrix.md
```markdown
# 产品功能矩阵

**生成时间**: {generatedAt}
**统计范围**: specs/ 目录

## 功能汇总

| 系统 | 一级模块 | 二级模块 | 功能编码 | 功能名称 | 功能简述 |
|------|---------|---------|---------|---------|---------|
{matrixRows}

## 统计信息

- 系统数量: {systemCount}
- 模块数量: {moduleCount}
- 功能数量: {featureCount}
```

### 4. Create Source Parser Config

**File**: `.claude/skills/doc-writer/source-parsers.yaml`

```yaml
parsers:
  markdown:
    extensions: [".md"]
    metadata_pattern: "^\\*\\*(.+?)\\*\\*:\\s*(.+)$"
    content_sections:
      - "## Summary"
      - "## Requirements"
      - "## User Scenarios"

  yaml:
    extensions: [".yaml", ".yml"]
    root_key: "spec"
    required_fields: ["name", "description"]

  json:
    extensions: [".json"]
    root_key: "spec"
    required_fields: ["name", "description"]

default_source_paths:
  - "specs/"

output_base: "docs/"
```

## Verification Steps

### Step 1: Verify Command Registration

```bash
# In Claude Code, type:
/doc help
```

Expected: Display available document types and commands.

### Step 2: Test Single Document Generation

```bash
# Activate a spec first
echo "specs/P003-inventory-query" > .specify/active_spec.txt

# Generate TDD
/doc tdd
```

Expected: TDD document generated at `docs/tdd/P003-inventory-query.md`

### Step 3: Test Natural Language Intent

```bash
/doc 生成技术方案
```

Expected: System recognizes intent as TDD and generates document.

### Step 4: Test Full Initialization

```bash
/doc init
```

Expected: All documents generated, summary report displayed.

### Step 5: Test Feature Matrix

```bash
/doc matrix
```

Expected: Feature matrix generated at `docs/matrix/feature-matrix.md`

## Common Issues

### Issue: Command not recognized
**Solution**: Ensure `.claude/commands/doc.md` exists with correct frontmatter.

### Issue: Template not found
**Solution**: Check templates exist in `.claude/skills/doc-writer/templates/`

### Issue: Module path incorrect
**Solution**: Add `**Module**` field to spec.md header.

## Next Steps

After basic setup:

1. Customize templates for your project style
2. Add project-specific keywords to intent recognition
3. Configure additional source paths if needed
4. Run `/doc init` to generate initial document set
