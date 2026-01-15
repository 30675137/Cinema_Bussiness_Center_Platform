# Data Model: Doc-Writer Skill Enhancement

**Feature**: T001-doc-writer-enhance
**Date**: 2025-12-26
**Type**: Configuration Files (Non-Database)

## Overview

This feature involves configuration files rather than database tables. The "data model" describes the structure of configuration files, templates, and state tracking files.

## 1. Command Configuration

### File: `.claude/commands/doc.md`

```yaml
# Frontmatter Structure
---
description: string          # Command description for help
allowed-tools: string[]      # Permitted tools for this command
argument-hint: string        # Usage hint for users
---
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | Yes | Brief description shown in `/help` |
| allowed-tools | string (CSV) | Yes | Comma-separated tool names |
| argument-hint | string | Yes | Example arguments for users |

## 2. Skill Definition

### File: `.claude/skills/doc-writer/SKILL.md`

```yaml
# Frontmatter Structure
---
name: string               # Skill identifier
description: string        # Full description with trigger words
version: string           # Semantic version
---
```

**Extended Content Sections**:
| Section | Purpose |
|---------|---------|
| Core Capabilities | List of document types and features |
| Workflow | Step-by-step execution guide |
| Intent Recognition | Keyword → document type mapping |
| Output Specification | File naming and directory rules |

## 3. Document Type Entity

### Conceptual Structure

```typescript
interface DocumentType {
  // Identifier
  code: string;           // e.g., "tdd", "arch", "manual"
  displayName: string;    // e.g., "技术设计文档"

  // Classification
  category: "technical" | "product" | "detail-design" | "global";

  // Output Configuration
  outputPath: string;     // Path template, e.g., "docs/tdd/{specId}-{name}.md"
  usesModule: boolean;    // Whether path includes {module}

  // Template Reference
  templatePath: string;   // e.g., "templates/technical-design.md"

  // Intent Recognition
  keywords: string[];     // Trigger words for intent matching
}
```

**Document Types Registry**:

| code | displayName | category | outputPath | usesModule | keywords |
|------|-------------|----------|------------|------------|----------|
| tdd | 技术设计文档 | technical | docs/tdd/{specId}-{name}.md | false | 技术方案, TDD, 技术设计 |
| arch | 架构设计文档 | technical | docs/architecture/{specId}-{name}.md | false | 架构, 系统设计 |
| detail | 详细设计文档 | detail-design | docs/detail-design/{module}/{specId}-{name}.md | true | 详细设计, DDD, 模块设计 |
| api | 接口设计文档 | technical | docs/api/{specId}-{name}.md | false | 接口, API |
| db | 数据库设计文档 | technical | docs/database/{specId}-{name}.md | false | 数据库, 表设计 |
| manual | 用户手册 | product | docs/manual/{module}/{specId}-{name}.md | true | 手册, 使用说明 |
| guide | 操作指南 | product | docs/guide/{module}/{specId}-{name}.md | true | 指南, 操作说明 |
| readme | README | global | docs/readme/{specId}-{name}.md | false | README, 项目说明 |
| release-notes | 发布说明 | global | docs/release-notes/{version}.md | false | 发布, CHANGELOG |
| matrix | 功能矩阵 | global | docs/matrix/feature-matrix.md | false | 功能矩阵, 功能列表 |

## 4. Spec Metadata Extension

### Extended Frontmatter

```yaml
# spec.md Header Structure
**Feature Branch**: `{specId}-{slug}`
**System**: string          # NEW: System name for matrix grouping
**Module**: string          # NEW: Level 1 module for doc organization
**SubModule**: string       # NEW: Level 2 module (optional)
**Created**: date
**Status**: Draft | Review | Approved
```

**Metadata Fields**:
| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| Feature Branch | string | Yes | - | Spec identifier |
| System | string | No | "默认系统" | Feature matrix grouping |
| Module | string | No | "未分类" | Document directory organization |
| SubModule | string | No | "" | Secondary classification |
| Created | date | Yes | - | Creation date |
| Status | enum | Yes | Draft | Workflow status |

## 5. Source Parser Configuration

### File: `.claude/skills/doc-writer/source-parsers.yaml`

```yaml
# Schema
parsers:
  <format_name>:
    extensions: string[]        # File extensions
    metadata_pattern: string    # Regex for metadata extraction
    content_sections: string[]  # Sections to extract

default_source_paths: string[]  # Default scan directories
output_base: string             # Base output directory
```

**Example Configuration**:
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

## 6. Document State Tracking

### File: `.doc-writer-state.json` (Auto-generated)

```typescript
interface DocWriterState {
  version: string;              // State file format version
  lastFullInit: string | null;  // ISO timestamp of last /doc init

  documents: {
    [outputPath: string]: {
      sourceFiles: string[];    // Source files used
      sourceHashes: {           // Content hashes for change detection
        [filePath: string]: string;
      };
      generatedAt: string;      // ISO timestamp
      generatedHash: string;    // Hash of generated content
      userModified: boolean;    // Whether user has edited
    };
  };
}
```

**Example State**:
```json
{
  "version": "1.0.0",
  "lastFullInit": "2025-12-26T10:00:00Z",
  "documents": {
    "docs/tdd/P003-inventory-query.md": {
      "sourceFiles": [
        "specs/P003-inventory-query/spec.md",
        "specs/P003-inventory-query/plan.md"
      ],
      "sourceHashes": {
        "specs/P003-inventory-query/spec.md": "a1b2c3d4...",
        "specs/P003-inventory-query/plan.md": "e5f6g7h8..."
      },
      "generatedAt": "2025-12-26T10:05:00Z",
      "generatedHash": "i9j0k1l2...",
      "userModified": false
    }
  }
}
```

## 7. Feature Matrix Data Structure

### Generated Matrix Format

```typescript
interface FeatureMatrixRow {
  system: string;       // 系统名称
  module: string;       // 一级模块
  subModule: string;    // 二级模块
  specId: string;       // 功能编码 (e.g., P003)
  name: string;         // 功能名称
  description: string;  // 功能简述
}

interface FeatureMatrix {
  generatedAt: string;
  rows: FeatureMatrixRow[];
}
```

**Output Table Format**:
```markdown
| 系统 | 一级模块 | 二级模块 | 功能编码 | 功能名称 | 功能简述 |
|------|---------|---------|---------|---------|---------|
| 影院商品管理中台 | 库存管理 | 库存查询 | P003 | inventory-query | 支持按门店查询库存 |
```

## 8. Template Structure

### Common Template Sections

```typescript
interface DocumentTemplate {
  // Header
  title: string;
  version: string;
  date: string;
  author: string;

  // Metadata
  specId: string;
  module?: string;

  // Content Sections (varies by type)
  sections: TemplateSection[];
}

interface TemplateSection {
  name: string;           // Section heading
  required: boolean;      // Must have content
  placeholder: string;    // Default placeholder text
  sourceMapping?: string; // Where to extract content from
}
```

## 9. User Modification Markers

### Marker Format

```markdown
<!-- DOC-WRITER: AUTO-GENERATED START -->
Auto-generated content...
<!-- DOC-WRITER: AUTO-GENERATED END -->

<!-- DOC-WRITER: USER-SECTION START -->
User can safely edit this section.
Changes will be preserved during updates.
<!-- DOC-WRITER: USER-SECTION END -->
```

**Marker Types**:
| Marker | Purpose |
|--------|---------|
| AUTO-GENERATED | System-managed content, may be overwritten |
| USER-SECTION | User-editable section, always preserved |
| CONFLICT | Indicates merge conflict requiring resolution |

## 10. Directory Structure

### Output Directory Layout

```
docs/
├── tdd/                          # Technical design documents
│   ├── P003-inventory-query.md
│   └── P004-inventory-adjustment.md
├── architecture/                 # Architecture documents
├── api/                          # API design documents
├── database/                     # Database design documents
├── detail-design/                # Detail design (by module)
│   └── inventory-management/
│       ├── P003-inventory-query.md
│       └── P004-inventory-adjustment.md
├── product/                      # Product documents (by module)
│   └── inventory-management/
├── manual/                       # User manuals (by module)
│   └── inventory-management/
├── guide/                        # Operation guides (by module)
├── readme/                       # README documents
├── release-notes/                # Release notes
│   └── v1.0.0.md
└── matrix/                       # Feature matrix
    └── feature-matrix.md
```

## 11. No Database Tables

This feature does not require any database tables. All data is stored in:
1. Configuration files (YAML, JSON, Markdown)
2. Generated documents (Markdown)
3. State tracking file (JSON)

The `/doc` command operates entirely on the file system without database interaction.
