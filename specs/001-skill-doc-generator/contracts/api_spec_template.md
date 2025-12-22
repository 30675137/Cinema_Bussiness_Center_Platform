# API 接口规格说明

## 文档信息
- 功能标识：{{specId}}-{{slug}}
- 生成时间：{{generationTimestamp}}
- 基于规格：specs/{{specId}}-{{slug}}/spec.md

## API 概述

{{apiOverview}}

## 通用规范

### 基础路径
- 开发环境：`http://localhost:8080/api`
- 生产环境：`https://api.example.com/api`

### 认证方式
- **Bearer Token (JWT)**
- 请求头：`Authorization: Bearer <token>`

### 通用响应格式

**成功响应**：
```json
{
  "success": true,
  "data": <数据对象或数组>,
  "timestamp": "2025-12-22T10:00:00Z",
  "message": "操作成功"
}
```

**错误响应**：
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述",
  "details": {},
  "timestamp": "2025-12-22T10:00:00Z"
}
```

### HTTP 状态码

| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

## API 端点

{{#each endpoints}}
### {{@index}}. {{name}}

**描述**：{{description}}

**端点**：`{{method}} {{path}}`

**请求参数**：

{{#if requestParams}}
| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
{{#each requestParams}}
| {{name}} | {{type}} | {{#if required}}是{{else}}否{{/if}} | {{description}} | {{example}} |
{{/each}}
{{else}}
无请求参数
{{/if}}

**请求示例**：
```json
{{requestExample}}
```

**成功响应**（200 OK）：
```json
{{responseFormat}}
```

**错误响应**：

{{#if errorCodes}}
| 错误码 | HTTP状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
{{#each errorCodes}}
| {{code}} | {{httpStatus}} | {{message}} | {{handling}} |
{{/each}}
{{else}}
TODO: 待定义错误响应
{{/if}}

**业务规则**：
{{#each businessRules}}
- {{this}}
{{/each}}

---

{{/each}}

## 错误码表

### 通用错误码

| 错误码 | HTTP状态 | 说明 |
|-------|---------|------|
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| INVALID_TOKEN | 401 | Token 无效或过期 |
| PERMISSION_DENIED | 403 | 无访问权限 |

### 业务错误码

{{#each businessErrorCodes}}
| {{code}} | {{httpStatus}} | {{message}} |
{{/each}}

## 数据类型定义

{{#each dataTypes}}
### {{name}}

**说明**：{{description}}

```typescript
{{typeDefinition}}
```

{{/each}}

## 附录

### 变更历史

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| 0.1.0 | {{generationDate}} | 初始版本 |

### 相关文档

- 数据模型说明：`data_model.md`
- 规格说明：`specs/{{specId}}-{{slug}}/spec.md`

---

**生成说明**：
- 本文档由 Claude Skill 文档生成器自动生成
- 所有 API 响应格式遵循项目 API 标准（`.claude/rules/08-api-standards.md`）
- 如发现信息缺失或不准确，请参考原始规格文档并手动补充
- 标记为 `TODO: 待定义错误响应` 的端点需要在规格文档中补充错误处理说明
