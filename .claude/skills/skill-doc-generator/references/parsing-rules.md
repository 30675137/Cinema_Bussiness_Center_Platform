# 规格文档解析规则

本文档定义了从 Spec-Kit 规格文档中提取数据模型和 API 信息的解析规则。

## 文件源优先级规则

### 数据模型文件优先级

按以下顺序查找数据模型信息：
1. **专门文档优先**：`data-model.md`, `data_model.md`
2. **Spec 兜底**：`spec.md`（如果专门文档不存在）
3. **补充信息**：`quickstart.md`（优先级最低，仅作为补充）

### API 文档文件优先级

按以下顺序查找 API 信息：
1. **专门文档优先**：`api.md`, `api-spec.md`, `api_spec.md`
2. **Spec 兜底**：`spec.md`（如果专门文档不存在）
3. **补充信息**：`quickstart.md`（优先级最低，仅作为补充）

### 文件名匹配规则

- 支持连字符命名：`api-spec.md`, `data-model.md`
- 支持下划线命名：`api_spec.md`, `data_model.md`
- 支持简单命名：`api.md`, `data-model.md`

### 同目录冲突处理

当同一 spec 目录内多个文件都定义了相同内容时：
- **专门文档优先**：使用 `data-model.md` 或 `api.md` 的定义
- **忽略重复**：忽略 `spec.md` 中的重复定义，避免冲突
- **示例**：如果 `specs/020-store-address/` 同时包含 `data-model.md` 和 `spec.md`，仅使用 `data-model.md` 的实体定义

## 数据模型章节识别

### 章节关键词匹配

识别包含以下关键词的章节作为数据模型章节：

**中文关键词**：
- "Key Entities" / "关键实体"
- "实体定义"
- "Data Model" / "数据模型"
- "领域模型" / "Domain Model"
- "Database Design" / "数据库设计"
- "核心实体"

**章节标题示例**：
```markdown
## Key Entities *(include if feature involves data)*
### Key Entities
## 数据模型
## 核心实体
```

### 实体识别模式

**实体名称识别**：
- 粗体文本：`**Entity Name**:`
- Markdown 标题：`### Entity Name`
- 列表项：`- **Entity Name**: description`

**示例**：
```markdown
- **Store**: 门店信息，包含地址、联系方式
### User
**User**: 系统用户实体
```

### 字段定义识别

**表格格式**（首选）：
```markdown
| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | Long | 是 | 唯一标识 | 主键 |
| name | String | 是 | 名称 | 长度 ≤ 100 |
```

**列表格式**：
```markdown
- id: Long (必填) - 唯一标识，主键
- name: String (必填) - 名称，长度 ≤ 100
```

**字段提取规则**：
1. 第一列/行首：字段名（name, id, email 等）
2. 第二列/类型标注：数据类型（String, Integer, Boolean, Enum, Date 等）
3. 必填性：识别"是/否"、"required/optional"、"必填/可选"
4. 约束：长度限制、唯一性、外键关系等

### 关系识别

**关键词**：
- "一对一" / "one-to-one"
- "一对多" / "one-to-many" / "has many"
- "多对多" / "many-to-many"
- "belongs to" / "属于"
- "references" / "引用"

**示例**：
```markdown
**关系**：
- 与 User 的关系：多对一 - 一个门店属于一个用户
- 与 Hall 的关系：一对多 - 一个门店可以有多个影厅
```

### 业务规则识别

**章节标题**：
- "业务规则" / "Business Rules"
- "验证规则" / "Validation Rules"
- "约束条件" / "Constraints"

**提取内容**：
- 以列表或段落形式描述的业务逻辑
- 状态转换规则
- 数据验证条件

---

## API 章节识别

### 章节关键词匹配

识别包含以下关键词的章节作为 API 章节：

**中文关键词**：
- "API Endpoints" / "API 端点"
- "接口定义" / "Interface Definition"
- "API Design" / "API 设计"
- "REST API" / "RESTful API"
- "GraphQL API"
- "端点列表"

**章节标题示例**：
```markdown
## API Endpoints
### REST API 设计
## 接口定义
```

### 端点识别模式

**HTTP 方法 + 路径格式**：
- `POST /api/stores`
- `GET /api/users/{id}`
- `PUT /api/orders/:orderId`
- `DELETE /api/products/{productId}`

**正则表达式模式**：
```regex
(GET|POST|PUT|DELETE|PATCH)\s+/[a-zA-Z0-9/_\-{}:]+
```

**代码块中的端点**：
````markdown
```http
POST /api/stores
GET /api/users/{id}
```
````

### 请求/响应格式识别

**JSON 代码块**：
````markdown
**请求示例**：
```json
{
  "name": "示例门店",
  "address": "北京市朝阳区"
}
```

**成功响应**（200 OK）：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "示例门店"
  }
}
```
````

**表格格式参数**：
```markdown
| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| name | String | 是 | 门店名称 | "示例门店" |
```

### 错误码识别

**表格格式**（首选）：
```markdown
| 错误码 | HTTP状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
| INVALID_PARAMETER | 400 | 参数验证失败 | 检查请求参数 |
| STORE_NOT_FOUND | 404 | 门店不存在 | 确认门店ID |
```

**列表格式**：
```markdown
**错误响应**：
- INVALID_PARAMETER (400): 参数验证失败
- STORE_NOT_FOUND (404): 门店不存在
```

### 认证方式识别

**关键词**：
- "认证" / "Authentication"
- "授权" / "Authorization"
- "Bearer Token"
- "JWT"
- "API Key"

**示例**：
```markdown
### 认证方式
- Bearer Token (JWT)
- 请求头：`Authorization: Bearer <token>`
```

---

## 内容提取策略

### 优先级规则

1. **结构化内容优先**：表格 > 代码块 > 列表 > 段落
2. **明确标注优先**：有类型标注的字段 > 无类型标注
3. **完整信息优先**：包含约束的定义 > 仅有名称

### 信息缺口检测

当遇到以下情况时，标记为 `TODO: 待规格明确`：

**数据模型缺口**：
- 字段类型未定义：`type: TODO: 待规格明确类型`
- 枚举值未列出：`constraints: TODO: 待定义枚举值`
- 关系不明确：`relationship: TODO: 待规格明确关系类型`

**API 缺口**：
- 错误响应未定义：`**错误响应**：TODO: 待定义错误响应`
- 请求参数缺失：`**请求参数**：TODO: 待规格明确请求参数`
- 认证方式不明确：`**认证**：TODO: 待规格明确认证方式`

### 冲突检测

**同名实体冲突**：
当多个规格文件定义了同名实体但字段不同时：

```markdown
## 实体：User

⚠️ **冲突检测**：该实体在以下规格中有不同定义：
- specs/001-brand-management/spec.md：包含字段 `username, email`
- specs/019-store-association/spec.md：包含字段 `user_id, role`

**建议**：请人工确认是否为同一实体，或应拆分为不同实体。
```

**同名 API 冲突**：
当多个规格定义了相同端点但请求/响应不同时，按 sourceSpec 分组展示。

---

## 解析流程

### 第一步：章节扫描

1. 读取 spec.md 全文
2. 识别所有 Markdown 标题（`##`, `###`）
3. 根据关键词匹配，标记数据模型和 API 章节
4. 提取章节内容（标题到下一个同级标题之间的文本）

### 第二步：内容解析

**数据模型解析**：
1. 在数据模型章节中查找实体名称（粗体或标题）
2. 对每个实体，提取字段定义（表格或列表）
3. 提取业务规则（"业务规则"、"验证规则"小节）
4. 提取关系（"关系"小节或包含关键词的段落）

**API 解析**：
1. 在 API 章节中查找 HTTP 方法 + 路径模式
2. 对每个端点，提取请求参数（表格或代码块）
3. 提取响应格式（JSON 代码块）
4. 提取错误码（表格或列表）

### 第三步：整合与验证

1. 合并来自多个规格文件的相同实体（字段一致则合并，不一致则标记冲突）
2. 检查信息完整性，标记缺失项
3. 按功能模块分组 API 端点
4. 生成最终的 data_model.md 和 api_spec.md

---

## 性能优化

### 批量读取策略

```bash
# 使用单次 Glob 获取所有规格文件
Glob: specs/*/spec.md

# 批量 Read（如果 Claude Code 支持并行）
for each file in files:
    Read(file.path)
```

### 内存缓存

- 解析后的实体存储在字典中：`entities[entityName] = EntityObject`
- 解析后的 API 端点存储在列表中：`endpoints = [EndpointObject1, EndpointObject2, ...]`
- 避免重复解析相同内容

### 性能目标

- 单个文件解析时间：< 6 秒
- 10 个文件总处理时间：< 1 分钟

---

## 示例解析案例

### 案例 1：数据模型提取

**输入（spec.md 片段）**：
```markdown
## Key Entities

- **Store**: 门店信息，包含地址、联系方式等

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | Long | 是 | 门店ID | 主键，自增 |
| name | String | 是 | 门店名称 | 长度 ≤ 100 |
| address | String | 是 | 详细地址 | 长度 ≤ 500 |
| phone | String | 否 | 联系电话 | 格式：11位数字 |

**关系**：
- 与 User 的关系：多对一 - 一个门店属于一个用户
```

**输出（data_model.md 片段）**：
```markdown
### Store

**说明**：门店信息，包含地址、联系方式等

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| id | Long | 是 | 门店ID | 主键，自增 |
| name | String | 是 | 门店名称 | 长度 ≤ 100 |
| address | String | 是 | 详细地址 | 长度 ≤ 500 |
| phone | String | 否 | 联系电话 | 格式：11位数字 |

**关系**：
- 与 User 的关系：多对一 - 一个门店属于一个用户
```

### 案例 2：API 端点提取

**输入（spec.md 片段）**：
```markdown
## API Endpoints

### 创建门店

**端点**：`POST /api/stores`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| name | String | 是 | 门店名称 |
| address | String | 是 | 详细地址 |

**成功响应**（201 Created）：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "示例门店",
    "address": "北京市朝阳区"
  }
}
```

**错误响应**：

| 错误码 | HTTP状态 | 说明 |
|-------|---------|------|
| INVALID_PARAMETER | 400 | 参数验证失败 |
| DUPLICATE_STORE | 409 | 门店已存在 |
```

**输出（api_spec.md 片段）**：
```markdown
### 1. 创建门店

**描述**：创建新的门店

**端点**：`POST /api/stores`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| name | String | 是 | 门店名称 | "示例门店" |
| address | String | 是 | 详细地址 | "北京市朝阳区" |

**成功响应**（201 Created）：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "示例门店",
    "address": "北京市朝阳区"
  }
}
```

**错误响应**：

| 错误码 | HTTP状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
| INVALID_PARAMETER | 400 | 参数验证失败 | 检查请求参数 |
| DUPLICATE_STORE | 409 | 门店已存在 | 使用唯一的门店名称 |
```

---

## 总结

本解析规则文档提供了从 Spec-Kit 规格文档中提取数据模型和 API 信息的完整指南。遵循这些规则可以确保：

1. **高准确率**：通过多关键词匹配和模式识别，覆盖不同格式的规格文档
2. **高覆盖率**：100% 提取所有定义的实体和端点
3. **信息完整性**：明确标记缺失项，不编造内容
4. **冲突检测**：自动识别并报告同名实体/API 的定义差异
5. **性能优化**：批量处理和内存缓存确保处理速度

在实际使用中，根据项目规格文档的具体格式，可以灵活调整关键词列表和匹配模式。
