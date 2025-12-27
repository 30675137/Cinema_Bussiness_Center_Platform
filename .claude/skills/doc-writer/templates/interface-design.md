# API 接口设计文档 - {{specId}}

**文档版本**: 1.0
**创建日期**: {{date}}
**作者**: {{author}}

---

## 1. 接口概述

### 1.1 设计原则

本 API 遵循以下设计原则：
- **RESTful 风格**: 使用标准 HTTP 方法和状态码
- **统一响应格式**: 所有接口遵循统一的响应结构
- **版本化**: 支持 API 版本管理
- **幂等性**: 关键操作支持幂等
- **安全性**: Token 认证 + HTTPS 传输

### 1.2 适用范围

{{scope}}

---

## 2. 通用规范

### 2.1 基础路径

| 环境 | 基础 URL |
|------|---------|
| 开发环境 | `http://localhost:8080/api` |
| 测试环境 | `https://api-test.example.com/api` |
| 生产环境 | `https://api.example.com/api` |

### 2.2 认证方式

**Bearer Token (JWT)**

所有需要认证的接口必须在请求头中包含 Token：

```http
Authorization: Bearer <access_token>
```

**Token 获取**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Token 刷新**:
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

### 2.3 通用响应格式

#### 成功响应

**单个资源**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "示例资源",
    "createdAt": "2025-12-26T10:00:00Z"
  },
  "timestamp": "2025-12-26T10:00:00Z"
}
```

**列表查询**:
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "资源1"},
    {"id": 2, "name": "资源2"}
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "message": "查询成功"
}
```

#### 错误响应

```json
{
  "success": false,
  "error": "RESOURCE_NOT_FOUND",
  "message": "未找到指定的资源",
  "details": {
    "resourceId": 999
  },
  "timestamp": "2025-12-26T10:00:00Z"
}
```

### 2.4 HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|-------|------|---------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 操作成功但无返回数据（如删除） |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或 Token 无效 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 422 | Unprocessable Entity | 业务逻辑验证失败 |
| 500 | Internal Server Error | 服务器内部错误 |

### 2.5 分页参数

所有列表查询接口支持分页参数：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码（从 1 开始） |
| pageSize | Integer | 否 | 20 | 每页数量（最大 100） |
| sortBy | String | 否 | - | 排序字段 |
| sortOrder | String | 否 | asc | 排序方向（asc/desc） |

**示例**:
```http
GET /api/products?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc
```

### 2.6 数据类型定义

| 类型 | 格式 | 示例 |
|------|------|------|
| ID | Long | `12345` |
| 时间戳 | ISO 8601 | `2025-12-26T10:00:00Z` |
| 日期 | YYYY-MM-DD | `2025-12-26` |
| 金额 | Decimal | `99.99` （单位：元） |
| 枚举 | String | `ACTIVE`, `INACTIVE` |

---

## 3. API 端点

### 3.1 端点概览

{{#each endpointGroups}}
#### {{groupName}}

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
{{#each endpoints}}
| {{method}} | {{path}} | {{description}} | {{#if requiresAuth}}是{{else}}否{{/if}} |
{{/each}}
{{/each}}

---

{{#each endpoints}}
### 3.{{@index}}. {{name}}

**描述**: {{description}}

**端点**: `{{method}} {{path}}`

**认证**: {{#if requiresAuth}}必须{{else}}无需{{/if}}

#### 请求参数

{{#if pathParams}}
**路径参数**:

| 参数名 | 类型 | 说明 | 示例 |
|-------|------|------|------|
{{#each pathParams}}
| {{name}} | {{type}} | {{description}} | {{example}} |
{{/each}}
{{/if}}

{{#if queryParams}}
**查询参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
{{#each queryParams}}
| {{name}} | {{type}} | {{#if required}}是{{else}}否{{/if}} | {{description}} | {{example}} |
{{/each}}
{{/if}}

{{#if requestBody}}
**请求体**:

```json
{{requestBody}}
```

**字段说明**:

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
{{#each requestFields}}
| {{name}} | {{type}} | {{#if required}}是{{else}}否{{/if}} | {{description}} | {{constraints}} |
{{/each}}
{{/if}}

#### 请求示例

```http
{{method}} {{path}}
{{#if requiresAuth}}Authorization: Bearer <token>{{/if}}
Content-Type: application/json

{{requestExample}}
```

#### 成功响应 ({{successStatus}})

```json
{{responseExample}}
```

{{#if responseFields}}
**响应字段说明**:

| 字段名 | 类型 | 说明 |
|-------|------|------|
{{#each responseFields}}
| {{name}} | {{type}} | {{description}} |
{{/each}}
{{/if}}

#### 错误响应

{{#if errorCodes}}
| 错误码 | HTTP 状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
{{#each errorCodes}}
| {{code}} | {{httpStatus}} | {{message}} | {{handling}} |
{{/each}}
{{else}}
暂无特定错误码，参考通用错误码表。
{{/if}}

#### 业务规则

{{#if businessRules}}
{{#each businessRules}}
- {{this}}
{{/each}}
{{else}}
无特殊业务规则。
{{/if}}

#### 调用示例

**cURL**:
```bash
{{curlExample}}
```

**JavaScript (fetch)**:
```javascript
{{jsExample}}
```

---

{{/each}}

## 4. 错误码表

### 4.1 通用错误码

| 错误码 | HTTP 状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
| INTERNAL_ERROR | 500 | 服务器内部错误 | 重试或联系技术支持 |
| INVALID_TOKEN | 401 | Token 无效或过期 | 重新登录获取 Token |
| PERMISSION_DENIED | 403 | 无访问权限 | 检查用户权限 |
| RESOURCE_NOT_FOUND | 404 | 资源不存在 | 检查资源 ID |
| INVALID_PARAMETER | 400 | 参数验证失败 | 检查请求参数 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超限 | 稍后重试 |

### 4.2 业务错误码

{{#each businessErrorCodes}}
| {{code}} | {{httpStatus}} | {{message}} | {{handling}} |
{{/each}}

---

## 5. 数据类型定义

{{#each dataTypes}}
### 5.{{@index}}. {{name}}

**说明**: {{description}}

**TypeScript 定义**:
```typescript
{{typeDefinition}}
```

**示例**:
```json
{{example}}
```

{{/each}}

---

## 6. 版本管理

### 6.1 版本策略

- **当前版本**: v1
- **版本格式**: URL 路径版本（如 `/api/v1/users`）
- **兼容性承诺**:
  - 向后兼容的变更（如新增字段）可在同一版本内发布
  - 破坏性变更必须发布新版本

### 6.2 废弃策略

- 废弃的 API 将在响应头中添加 `X-Deprecated: true`
- 废弃后至少保留 6 个月过渡期
- 新版本发布后通过邮件/公告通知开发者

---

## 7. 限流策略

### 7.1 限流规则

| 接口类型 | 限流阈值 | 时间窗口 |
|---------|---------|---------|
| 查询接口 | 100 次/分钟 | 1 分钟 |
| 写入接口 | 50 次/分钟 | 1 分钟 |
| 登录接口 | 10 次/分钟 | 1 分钟 |

### 7.2 限流响应

当请求超过限流阈值时，返回：

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "请求频率超限，请稍后重试",
  "retryAfter": 60,
  "timestamp": "2025-12-26T10:00:00Z"
}
```

响应头包含：
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735210860
Retry-After: 60
```

---

## 8. 最佳实践

### 8.1 客户端实现建议

1. **错误处理**: 实现统一的错误处理逻辑
2. **Token 管理**: 自动刷新 Token，避免过期
3. **请求重试**: 对 5xx 错误实现指数退避重试
4. **请求缓存**: 合理使用缓存减少请求次数
5. **并发控制**: 使用请求队列控制并发数量

### 8.2 性能优化

1. **分页查询**: 大数据量使用分页，避免一次性查询
2. **字段过滤**: 支持 `fields` 参数仅返回需要的字段
3. **批量操作**: 使用批量接口减少请求次数
4. **条件查询**: 使用过滤条件减少数据传输量

---

## 9. 附录

### 9.1 变更历史

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| 1.0 | {{date}} | 初始版本 |

### 9.2 相关文档

- 技术设计文档: `specs/{{specId}}/design/tdd-{{specId}}.md`
- 数据模型文档: `specs/{{specId}}/data-model.md`
- 规格说明: `specs/{{specId}}/spec.md`

### 9.3 联系方式

技术支持: {{supportContact}}
API 讨论群: {{discussionGroup}}
