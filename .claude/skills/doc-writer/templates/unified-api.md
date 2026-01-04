# 统一 API 接口文档

**文档版本**: {{version}}
**生成时间**: {{generatedAt}}
**扫描范围**: specs/ (共 {{specCount}} 个 spec)
**API 总数**: {{totalEndpoints}} 个端点

---

## 概述

本文档汇总了项目中所有功能模块的 API 接口定义，由 doc-writer skill 自动生成。

### 文档说明

- **来源**: 扫描 `specs/` 目录下所有 spec 的 API 定义
- **分组方式**: {{groupBy}} (system/module/none)
- **去重处理**: 相同路径+方法的端点已合并，标注来源

### 通用规范

#### 基础路径

| 环境 | 基础 URL |
|------|---------|
| 开发环境 | `http://localhost:8080/api` |
| 测试环境 | `https://api-test.example.com/api` |
| 生产环境 | `https://api.example.com/api` |

#### 认证方式

所有需要认证的接口必须在请求头中包含 Token：

```http
Authorization: Bearer <access_token>
```

#### 通用响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述"
}
```

---

## 目录

<!-- DOC-WRITER: AUTO-GENERATED START -->
{{#each groups}}
- [{{name}}](#{{anchor}}) ({{endpointCount}} 个端点)
{{/each}}
<!-- DOC-WRITER: AUTO-GENERATED END -->

---

<!-- DOC-WRITER: AUTO-GENERATED START -->
{{#each groups}}
## {{name}}

{{#each specs}}
### {{specId}}: {{specName}}

**模块**: {{module}} | **状态**: {{status}}

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
{{#each endpoints}}
| {{method}} | `{{path}}` | {{description}} | {{#if requiresAuth}}是{{else}}否{{/if}} |
{{/each}}

{{#if hasDetails}}
<details>
<summary>查看详细定义</summary>

{{#each endpoints}}
#### {{method}} {{path}}

**说明**: {{description}}

{{#if pathParams}}
**路径参数**:

| 参数名 | 类型 | 说明 |
|-------|------|------|
{{#each pathParams}}
| {{name}} | {{type}} | {{description}} |
{{/each}}
{{/if}}

{{#if queryParams}}
**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
{{#each queryParams}}
| {{name}} | {{type}} | {{#if required}}是{{else}}否{{/if}} | {{description}} |
{{/each}}
{{/if}}

{{#if requestBody}}
**请求体**:
```json
{{requestBody}}
```
{{/if}}

{{#if responseExample}}
**响应示例**:
```json
{{responseExample}}
```
{{/if}}

---

{{/each}}
</details>
{{/if}}

{{/each}}

---

{{/each}}
<!-- DOC-WRITER: AUTO-GENERATED END -->

## 统计摘要

### 按模块统计

| 模块 | Spec 数量 | API 端点数 | GET | POST | PUT | DELETE |
|------|----------|-----------|-----|------|-----|--------|
{{#each moduleStats}}
| {{module}} | {{specCount}} | {{total}} | {{get}} | {{post}} | {{put}} | {{delete}} |
{{/each}}
| **合计** | {{totalSpecs}} | {{totalEndpoints}} | {{totalGet}} | {{totalPost}} | {{totalPut}} | {{totalDelete}} |

### 去重统计

{{#if hasDuplicates}}
以下端点在多个 spec 中定义，已合并处理：

| 端点 | 涉及 Spec | 处理方式 |
|------|----------|---------|
{{#each duplicates}}
| `{{method}} {{path}}` | {{sources}} | {{resolution}} |
{{/each}}
{{else}}
未检测到重复的 API 端点定义。
{{/if}}

---

## 附录

### A. Spec 来源列表

| Spec ID | 功能名称 | 模块 | API 数量 | 状态 |
|---------|---------|------|---------|------|
{{#each specs}}
| {{specId}} | {{name}} | {{module}} | {{endpointCount}} | {{status}} |
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

*本文档由 doc-writer `/doc scan api` 命令自动生成*
