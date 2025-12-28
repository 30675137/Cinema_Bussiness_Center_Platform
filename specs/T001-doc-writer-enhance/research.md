# Research: Doc-Writer Skill Enhancement

**Feature**: T001-doc-writer-enhance
**Date**: 2025-12-26
**Status**: Complete

## 1. Current State Analysis

### 1.1 Existing doc-writer Skill

**Location**: `.claude/skills/doc-writer/SKILL.md`

**Current Capabilities**:
- 5 document types: TDD, Architecture, Detail Design, API, Database
- Two modes: Auto (from spec files) and Manual (user-provided info)
- Template-based generation using `templates/` directory
- Output to `specs/{specId}/design/` directory

**Current Templates**:
| Template | File | Status |
|----------|------|--------|
| Technical Design (TDD) | `templates/technical-design.md` | Existing |
| Architecture Design | `templates/architecture-design.md` | Existing |
| Detail Design | `templates/detail-design.md` | Existing |
| Interface Design (API) | `templates/interface-design.md` | Existing |
| Database Design | `templates/database-design.md` | Existing |

**Gaps Identified**:
1. No `/doc` command entry point (only triggered by natural language)
2. Missing document types: Manual, README, Release Notes, Feature Matrix
3. Output location fixed to `specs/{specId}/design/` (needs `docs/` separation)
4. No full initialization mode (`/doc init`)
5. No incremental update capability (`/doc update`)
6. No module-based organization for product/detail-design docs
7. No feature matrix auto-generation

### 1.2 Reference: ops-expert Command Pattern

**Command File**: `.claude/commands/ops.md`

**Key Structure**:
```yaml
---
description: 运营专家 - 通过对话查询数据和执行操作
allowed-tools: Read, Bash(python:*), mcp__supabase__*
argument-hint: [自然语言指令，如"查看场景包"...]
---
```

**Pattern Elements**:
1. **Frontmatter**: YAML metadata with description, allowed-tools, argument-hint
2. **Role Definition**: Clear role statement at the start
3. **Intent Recognition Table**: Keyword → Intent → Execution method mapping
4. **Execution Guides**: Detailed instructions per intent type
5. **Output Templates**: Standardized response formats
6. **Error Handling**: Clear error message templates

## 2. Technical Design Decisions

### 2.1 Command Configuration

**File**: `.claude/commands/doc.md`

**Frontmatter Design**:
```yaml
---
description: 设计文档编写专家 - 通过 /doc 命令生成和管理设计文档
allowed-tools: Read, Write, Glob, Grep, Edit
argument-hint: [文档类型或自然语言，如"tdd"、"init"、"技术方案"、"update"]
---
```

**Tool Selection Rationale**:
- `Read`: Read spec files, templates, existing docs
- `Write`: Create new document files
- `Glob`: Scan specs/ and docs/ directories
- `Grep`: Search content in spec files
- `Edit`: Incremental document updates

### 2.2 Intent Recognition Design

| Intent | Keywords | Command Format | Action |
|--------|----------|----------------|--------|
| Single Document | tdd, arch, detail, api, db, manual, readme, release-notes, matrix | `/doc <type>` | Generate specific document |
| Full Init | init, 初始化, 全量生成 | `/doc init [--source <path>]` | Scan all sources, generate all docs |
| Incremental Update | update, 更新, 同步 | `/doc update` | Update changed docs only |
| Natural Language | 技术方案, 架构设计, 接口文档... | `/doc <description>` | Intent recognition → type mapping |
| Help | help, 帮助 | `/doc help` | Show available commands |

### 2.3 Document Type Mapping

| Type Code | Display Name | Category | Output Path |
|-----------|--------------|----------|-------------|
| `tdd` | 技术设计文档 | Technical | `docs/tdd/{specId}-{name}.md` |
| `arch` | 架构设计文档 | Technical | `docs/architecture/{specId}-{name}.md` |
| `detail` | 详细设计文档 | Detail Design | `docs/detail-design/{module}/{specId}-{name}.md` |
| `api` | 接口设计文档 | Technical | `docs/api/{specId}-{name}.md` |
| `db` | 数据库设计文档 | Technical | `docs/database/{specId}-{name}.md` |
| `manual` | 用户手册 | Product | `docs/manual/{module}/{specId}-{name}.md` |
| `guide` | 操作指南 | Product | `docs/guide/{module}/{specId}-{name}.md` |
| `readme` | README 文档 | Global | `docs/readme/{specId}-{name}.md` |
| `release-notes` | 发布说明 | Global | `docs/release-notes/{version}.md` |
| `matrix` | 功能矩阵 | Global | `docs/matrix/feature-matrix.md` |

### 2.4 Spec Metadata Extension

**Current Spec Header**:
```markdown
**Feature Branch**: `P003-inventory-query`
**Created**: 2025-12-20
**Status**: Draft
```

**Extended Spec Header** (for module organization):
```markdown
**Feature Branch**: `P003-inventory-query`
**System**: 影院商品管理中台
**Module**: inventory-management
**SubModule**: inventory-query
**Created**: 2025-12-20
**Status**: Draft
```

### 2.5 Full Initialization Flow

```
/doc init [--source <path>]
    │
    ├── 1. Scan Data Sources
    │   ├── specs/**/*.md (default)
    │   └── --source paths (optional)
    │
    ├── 2. Parse Metadata
    │   ├── Extract System/Module/SubModule
    │   └── Group by module
    │
    ├── 3. Generate Documents
    │   ├── Technical docs (by type)
    │   ├── Product docs (by module)
    │   ├── Detail design docs (by module)
    │   └── Global docs (matrix)
    │
    ├── 4. Handle Conflicts
    │   └── Prompt: overwrite/skip/backup
    │
    └── 5. Output Report
        ├── Total documents: N
        ├── By category: ...
        └── Output paths: ...
```

### 2.6 Incremental Update Strategy

**Change Detection**:
1. Compare spec file modification time vs generated doc time
2. Track source → doc mapping in `.doc-writer-state.json`
3. Detect content changes using hash comparison

**User Modification Preservation**:
```markdown
<!-- AUTO-GENERATED: START -->
System-generated content here...
<!-- AUTO-GENERATED: END -->

<!-- USER-MODIFIED: This section was manually edited -->
User's custom content here (preserved during updates)
<!-- USER-MODIFIED: END -->
```

**Conflict Handling**:
- Detect overlapping changes
- Show diff and request user decision
- Options: Keep user version / Accept generated / Merge manually

### 2.7 Feature Matrix Generation

**Data Collection**:
```python
# Pseudo-code for matrix generation
for spec in scan_specs("specs/"):
    metadata = parse_frontmatter(spec)
    matrix_row = {
        "system": metadata.get("System", "默认系统"),
        "module": metadata.get("Module", "未分类"),
        "submodule": metadata.get("SubModule", ""),
        "spec_id": extract_spec_id(spec.path),
        "name": metadata.get("Feature Branch", ""),
        "description": extract_first_paragraph(spec.content)
    }
    append_to_matrix(matrix_row)
```

**Output Format**:
```markdown
# 产品功能矩阵

| 系统 | 一级模块 | 二级模块 | 功能编码 | 功能名称 | 功能简述 |
|------|---------|---------|---------|---------|---------|
| 影院商品管理中台 | 库存管理 | 库存查询 | P003 | inventory-query | 支持按门店、品类查询库存... |
| 影院商品管理中台 | 库存管理 | 库存调整 | P004 | inventory-adjustment | 支持库存盘点、调整审批... |
```

## 3. Source Parser Configuration

**File**: `.claude/skills/doc-writer/source-parsers.yaml`

```yaml
parsers:
  markdown:
    extensions: [".md"]
    metadata_pattern: "^---([\\s\\S]*?)---"
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

## 4. New Templates Required

| Template | Purpose | Status |
|----------|---------|--------|
| `manual.md` | User manual generation | To create |
| `readme.md` | README document generation | To create |
| `release-notes.md` | Release notes generation | To create |
| `feature-matrix.md` | Feature matrix layout | To create |

## 5. Flow Description Format

### Basic/Alternative/Exception Flow Structure

```markdown
### User Story X - [Story Title]

#### Basic Flow (正常流程)
1. 用户打开库存查询页面
2. 系统显示默认查询条件和空白结果区域
3. 用户输入查询条件（门店、品类、关键词）
4. 用户点击"查询"按钮
5. 系统执行查询并显示结果列表
6. 用户查看结果，流程结束

#### Alternative Flow (备选流程)
**A1: 使用快捷筛选**
- 在步骤 3，用户可以选择预设的快捷筛选条件
- 系统自动填充查询条件
- 继续步骤 4

**A2: 导出查询结果**
- 在步骤 6 后，用户点击"导出"按钮
- 系统生成 Excel 文件并下载

#### Exception Flow (异常流程)
**E1: 无查询结果**
- 在步骤 5，如果查询无结果
- 系统显示"暂无数据"提示
- 用户可以修改条件重新查询

**E2: 查询超时**
- 在步骤 5，如果查询超过 10 秒
- 系统显示超时提示
- 用户可以缩小查询范围重试
```

## 6. Implementation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing docs overwritten | High | Prompt confirmation, backup option |
| Spec metadata missing | Medium | Default values, warning in output |
| Template parsing errors | Medium | Fallback to basic template |
| Large codebase scan slow | Low | Progress indicator, incremental scan |

## 7. Dependencies

### Required Files to Create
1. `.claude/commands/doc.md` - Command configuration
2. `.claude/skills/doc-writer/source-parsers.yaml` - Parser config
3. `templates/manual.md` - User manual template
4. `templates/readme.md` - README template
5. `templates/release-notes.md` - Release notes template
6. `templates/feature-matrix.md` - Matrix template

### Required Files to Modify
1. `.claude/skills/doc-writer/SKILL.md` - Add new capabilities, update workflow

## 8. Success Metrics Validation

| Criteria | How to Verify |
|----------|---------------|
| SC-001: 5s command start | Manual timing test |
| SC-002: 90% intent recognition | Test with 20+ sample inputs |
| SC-003: 30s TDD generation | Manual timing test |
| SC-004: 100% user content preserved | Before/after comparison test |
| SC-005: Project compliance | Manual review against rules |
| SC-006: 95% first-use success | User testing (pilot) |
| SC-007: 100% structure completeness | Template section checklist |
| SC-008: 2s command response | Manual timing test |

## 9. Open Questions (Resolved)

All clarification questions from spec.md have been resolved. No remaining open questions.

## 10. References

- `.claude/skills/doc-writer/SKILL.md` - Current skill definition
- `.claude/skills/ops-expert/SKILL.md` - Reference skill structure
- `.claude/commands/ops.md` - Reference command configuration
- `specs/T001-doc-writer-enhance/spec.md` - Feature specification
