# 统一数据库设计文档

**文档版本**: {{version}}
**生成时间**: {{generatedAt}}
**扫描范围**: specs/ (共 {{specCount}} 个 spec)
**数据表总数**: {{totalTables}} 张表

---

## 概述

本文档汇总了项目中所有功能模块的数据库表定义，由 doc-writer skill 自动生成。

### 文档说明

- **来源**: 扫描 `specs/` 目录下所有 spec 的 `data-model.md` 文件
- **分组方式**: {{groupBy}} (system/module/none)
- **去重处理**: 相同表名的定义已合并，标注来源和字段差异

### 数据库规范

- **命名规范**: 表名使用 snake_case，字段名使用 snake_case
- **主键**: 默认使用 `id` 作为主键，类型为 `bigint` 或 `uuid`
- **时间字段**: 包含 `created_at` 和 `updated_at` 时间戳
- **软删除**: 使用 `deleted_at` 字段标记删除状态

---

## ER 图（全局）

```mermaid
erDiagram
{{#each tables}}
    {{name}} {
{{#each fields}}
        {{type}} {{name}} {{#if isPK}}PK{{/if}}{{#if isFK}}FK{{/if}}
{{/each}}
    }
{{/each}}

{{#each relationships}}
    {{from}} {{relation}} {{to}} : {{label}}
{{/each}}
```

---

## 目录

<!-- DOC-WRITER: AUTO-GENERATED START -->
{{#each groups}}
- [{{name}}](#{{anchor}}) ({{tableCount}} 张表)
{{/each}}
<!-- DOC-WRITER: AUTO-GENERATED END -->

---

<!-- DOC-WRITER: AUTO-GENERATED START -->
{{#each groups}}
## {{name}}

{{#each specs}}
### {{specId}}: {{specName}}

**模块**: {{module}} | **状态**: {{status}}

{{#each tables}}
#### {{tableName}} ({{tableNameCn}})

{{#if sources}}
> **来源**: {{sources}}
{{/if}}

{{#if description}}
{{description}}
{{/if}}

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|-------|------|------|--------|------|
{{#each fields}}
| {{name}} | {{type}} | {{constraints}} | {{default}} | {{description}} |
{{/each}}

{{#if indexes}}
**索引设计**:

| 索引名 | 类型 | 字段 | 说明 |
|-------|------|------|------|
{{#each indexes}}
| {{name}} | {{type}} | {{columns}} | {{description}} |
{{/each}}
{{/if}}

{{#if hasNewFields}}
**扩展字段** (来自其他 spec):

| 字段名 | 类型 | 来源 | 说明 |
|-------|------|------|------|
{{#each newFields}}
| {{name}} | {{type}} | {{source}} | {{description}} |
{{/each}}
{{/if}}

---

{{/each}}

{{/each}}

{{/each}}
<!-- DOC-WRITER: AUTO-GENERATED END -->

## 统计摘要

### 按模块统计

| 模块 | Spec 数量 | 表数量 | 字段总数 |
|------|----------|--------|---------|
{{#each moduleStats}}
| {{module}} | {{specCount}} | {{tableCount}} | {{fieldCount}} |
{{/each}}
| **合计** | {{totalSpecs}} | {{totalTables}} | {{totalFields}} |

### 表去重统计

{{#if hasDuplicates}}
以下表在多个 spec 中定义，已合并处理：

| 表名 | 涉及 Spec | 字段差异 | 处理方式 |
|------|----------|---------|---------|
{{#each duplicates}}
| `{{tableName}}` | {{sources}} | {{fieldDiff}} | {{resolution}} |
{{/each}}
{{else}}
未检测到重复的表定义。
{{/if}}

---

## 数据字典

### 枚举类型

{{#each enums}}
#### {{name}}

**说明**: {{description}}

| 值 | 说明 |
|----|------|
{{#each values}}
| `{{value}}` | {{description}} |
{{/each}}

{{/each}}

### 通用字段

以下字段在多个表中复用：

| 字段名 | 类型 | 说明 | 使用表 |
|-------|------|------|--------|
| id | bigint/uuid | 主键 | 所有表 |
| created_at | timestamp | 创建时间 | 所有表 |
| updated_at | timestamp | 更新时间 | 所有表 |
| created_by | bigint | 创建人 ID | 业务表 |
| updated_by | bigint | 更新人 ID | 业务表 |
| deleted_at | timestamp | 删除时间（软删除） | 业务表 |

---

## 附录

### A. Spec 来源列表

| Spec ID | 功能名称 | 模块 | 表数量 | 状态 |
|---------|---------|------|--------|------|
{{#each specs}}
| {{specId}} | {{name}} | {{module}} | {{tableCount}} | {{status}} |
{{/each}}

### B. 变更历史

| 日期 | 版本 | 变更说明 |
|-----|------|---------|
| {{generatedAt}} | {{version}} | 自动生成 |

<!-- DOC-WRITER: USER-SECTION START -->
### C. 补充说明

[用户可在此添加补充说明，增量更新时将保留此区域内容]

<!-- DOC-WRITER: USER-SECTION END -->

---

*本文档由 doc-writer `/doc scan db` 命令自动生成*
