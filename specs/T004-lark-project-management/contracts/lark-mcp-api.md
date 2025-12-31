# Lark MCP API 契约文档

**Phase**: Phase 1 - Design
**Date**: 2025-12-31
**Spec**: [spec.md](../spec.md)

## 概述

本文档定义了 Lark MCP 项目管理系统使用的飞书 MCP API 端点、请求/响应格式、错误处理规范。

## API 基础信息

**Base URL**: 通过 Lark MCP 服务调用,不直接使用 HTTP URL

**认证方式**: User Access Token (用户身份)

**MCP Tool 调用格式**:
```typescript
await mcpClient.call('mcp__lark-mcp__<api_name>', {
  path: { ... },      // 路径参数
  params: { ... },    // 查询参数
  data: { ... },      // 请求体
  useUAT: true        // 使用 User Access Token
})
```

## 1. Base App 管理

### 1.1 创建 Base App

**MCP Tool**: `mcp__lark-mcp__bitable_v1_app_create`

**用途**: 创建项目管理用的飞书 Base 应用

**请求参数**:
```typescript
{
  data: {
    name: string                // Base App 名称 (如 "Cinema Platform 项目管理")
    folder_token?: string       // 文件夹 token (可选,默认根目录)
    time_zone: string          // 时区 (如 "Asia/Shanghai")
  },
  useUAT: true                 // 使用用户身份认证
}
```

**响应格式**:
```typescript
{
  code: 0,                     // 0 表示成功
  data: {
    app: {
      app_token: string        // Base App 唯一标识 (如 "bascnxxx")
      name: string
      folder_token: string
      url: string              // 飞书中打开的 URL
    }
  },
  msg: 'success'
}
```

**错误响应**:
```typescript
{
  code: 99991400,              // 错误码
  msg: '请求参数不合法',
  data: {}
}
```

**示例**:
```typescript
const response = await mcpClient.call('mcp__lark-mcp__bitable_v1_app_create', {
  data: {
    name: 'Cinema Platform 项目管理',
    time_zone: 'Asia/Shanghai',
  },
  useUAT: true,
})

const appToken = response.data.app.app_token
```

### 1.2 列出 Base Apps

**MCP Tool**: `mcp__lark-mcp__bitable_v1_app_list`

**用途**: 查询用户的所有 Base App (用于配置检查)

**请求参数**:
```typescript
{
  params: {
    page_size?: number         // 分页大小 (默认 20,最大 100)
    page_token?: string        // 分页 token
  },
  useUAT: true
}
```

**响应格式**:
```typescript
{
  code: 0,
  data: {
    items: Array<{
      app_token: string
      name: string
      folder_token: string
    }>,
    has_more: boolean
    page_token?: string
  }
}
```

## 2. 数据表管理

### 2.1 创建数据表

**MCP Tool**: `mcp__lark-mcp__bitable_v1_appTable_create`

**用途**: 在 Base App 中创建数据表

**请求参数**:
```typescript
{
  path: {
    app_token: string          // Base App token
  },
  data: {
    table: {
      name: string             // 表名 (如 "项目任务")
      default_view_name?: string   // 默认视图名称 (如 "所有任务")
      fields: Array<{
        field_name: string     // 字段名
        type: number           // 字段类型 (见下方类型映射)
        ui_type?: string       // UI 类型 (如 "Text", "SingleSelect")
        property?: object      // 字段属性 (如选项列表)
        description?: {
          text: string
          disable_sync: boolean
        }
      }>
    }
  },
  useUAT: true
}
```

**字段类型映射**:
| type | ui_type | 说明 |
|------|---------|------|
| 1 | Text | 多行文本 |
| 2 | Number | 数字 |
| 2 | Progress | 进度 (0-100) |
| 3 | SingleSelect | 单选 |
| 4 | MultiSelect | 多选 |
| 5 | DateTime | 日期时间 |
| 7 | Checkbox | 复选框 |
| 11 | User | 人员 |
| 1001 | CreatedTime | 创建时间 (自动) |

**响应格式**:
```typescript
{
  code: 0,
  data: {
    table_id: string           // 表 ID (如 "tblxxx")
    default_view_id: string
    field_id_list: string[]
  }
}
```

**示例 - 创建任务表**:
```typescript
const response = await mcpClient.call('mcp__lark-mcp__bitable_v1_appTable_create', {
  path: { app_token: 'bascnxxx' },
  data: {
    table: {
      name: '项目任务',
      default_view_name: '所有任务',
      fields: [
        {
          field_name: '任务标题',
          type: 1,
          ui_type: 'Text',
        },
        {
          field_name: '优先级',
          type: 3,
          ui_type: 'SingleSelect',
          property: {
            options: [
              { name: '🔴 高', color: 1 },
              { name: '🟡 中', color: 2 },
              { name: '🟢 低', color: 3 },
            ],
          },
        },
        {
          field_name: '状态',
          type: 3,
          ui_type: 'SingleSelect',
          property: {
            options: [
              { name: '📝 待办', color: 0 },
              { name: '🚀 进行中', color: 2 },
              { name: '✅ 已完成', color: 3 },
              { name: '❌ 已取消', color: 1 },
            ],
          },
        },
        {
          field_name: '负责人',
          type: 11,
          ui_type: 'User',
          property: {
            multiple: true,
          },
        },
        {
          field_name: '截止日期',
          type: 5,
          ui_type: 'DateTime',
          property: {
            date_formatter: 'yyyy/MM/dd',
          },
        },
        {
          field_name: '进度',
          type: 2,
          ui_type: 'Progress',
          property: {
            min: 0,
            max: 100,
          },
        },
        {
          field_name: '创建时间',
          type: 1001,
          ui_type: 'CreatedTime',
        },
      ],
    },
  },
  useUAT: true,
})
```

### 2.2 列出所有数据表

**MCP Tool**: `mcp__lark-mcp__bitable_v1_appTable_list`

**用途**: 获取 Base App 中的所有表

**请求参数**:
```typescript
{
  path: {
    app_token: string
  },
  params: {
    page_size?: number
    page_token?: string
  },
  useUAT: true
}
```

**响应格式**:
```typescript
{
  code: 0,
  data: {
    items: Array<{
      table_id: string
      name: string
      revision: number
    }>,
    has_more: boolean,
    page_token?: string
  }
}
```

### 2.3 列出表字段

**MCP Tool**: `mcp__lark-mcp__bitable_v1_appTableField_list`

**用途**: 获取数据表的所有字段定义

**请求参数**:
```typescript
{
  path: {
    app_token: string
    table_id: string
  },
  params: {
    page_size?: number
    page_token?: string
    view_id?: string           // 可选,指定视图
    text_field_as_array?: boolean  // 是否以数组形式返回富文本
  },
  useUAT: true
}
```

**响应格式**:
```typescript
{
  code: 0,
  data: {
    items: Array<{
      field_id: string
      field_name: string
      type: number
      ui_type: string
      property: object
      description?: {
        text: string
        disable_sync: boolean
      }
    }>,
    has_more: boolean,
    page_token?: string
  }
}
```

## 3. 记录 CRUD 操作

### 3.1 创建记录

**MCP Tool**: `mcp__lark-mcp__bitable_v1_appTableRecord_create`

**用途**: 在表中创建新记录

**请求参数**:
```typescript
{
  path: {
    app_token: string
    table_id: string
  },
  data: {
    fields: {
      [fieldName: string]: any  // 字段名 → 字段值
    }
  },
  params: {
    user_id_type?: 'open_id' | 'union_id' | 'user_id'  // 人员字段 ID 类型
    client_token?: string      // 幂等 token (可选)
  },
  useUAT: true
}
```

**字段值格式**:
| 字段类型 | 值格式 | 示例 |
|---------|--------|------|
| 文本 | `string` | `"实现库存查询"` |
| 数字 | `number` | `42` |
| 单选 | `string` | `"🔴 高"` |
| 多选 | `string[]` | `["Frontend", "Backend"]` |
| 日期 | `number` (毫秒时间戳) | `1704038400000` |
| 人员 | `[{ id: string }]` | `[{ id: "ou_xxx" }]` |
| 进度 | `number` (0-100) | `50` |

**响应格式**:
```typescript
{
  code: 0,
  data: {
    record: {
      record_id: string        // 记录 ID (如 "recxxx")
      fields: {
        [fieldName: string]: any
      }
    }
  }
}
```

**示例 - 创建任务记录**:
```typescript
const response = await mcpClient.call('mcp__lark-mcp__bitable_v1_appTableRecord_create', {
  path: {
    app_token: 'bascnxxx',
    table_id: 'tblxxx',
  },
  data: {
    fields: {
      '任务标题': '实现库存查询功能',
      '优先级': '🔴 高',
      '状态': '📝 待办',
      '负责人': [{ id: 'ou_xxx' }],
      '关联规格': 'I003',
      '截止日期': 1704038400000,
      '标签': ['Backend', 'Frontend'],
      '进度': 0,
    },
  },
  params: {
    user_id_type: 'open_id',
  },
  useUAT: true,
})
```

### 3.2 查询记录 (搜索)

**MCP Tool**: `mcp__lark-mcp__bitable_v1_appTableRecord_search`

**用途**: 查询表中的记录 (支持过滤、排序、分页)

**请求参数**:
```typescript
{
  path: {
    app_token: string
    table_id: string
  },
  data: {
    view_id?: string           // 视图 ID (可选)
    field_names?: string[]     // 返回的字段列表 (可选)
    sort?: Array<{
      field_name: string
      desc: boolean
    }>,
    filter?: {
      conjunction: 'and' | 'or'
      conditions: Array<{
        field_name: string
        operator: 'is' | 'isNot' | 'contains' | 'doesNotContain' |
                  'isEmpty' | 'isNotEmpty' | 'isGreater' | 'isLess'
        value: string[]
      }>
    },
    automatic_fields?: boolean  // 是否返回自动字段 (创建时间等)
  },
  params: {
    page_size?: number         // 最大 500
    page_token?: string
    user_id_type?: 'open_id' | 'union_id' | 'user_id'
  },
  useUAT: true
}
```

**操作符说明**:
| operator | 说明 | 适用字段 |
|----------|------|---------|
| `is` | 等于 | 文本、单选、数字、日期 |
| `isNot` | 不等于 | 文本、单选、数字 |
| `contains` | 包含 | 文本、多选 |
| `doesNotContain` | 不包含 | 文本、多选 |
| `isEmpty` | 为空 | 所有类型 |
| `isNotEmpty` | 不为空 | 所有类型 |
| `isGreater` | 大于 | 数字、日期 |
| `isLess` | 小于 | 数字、日期 |

**响应格式**:
```typescript
{
  code: 0,
  data: {
    items: Array<{
      record_id: string
      fields: {
        [fieldName: string]: any
      }
    }>,
    has_more: boolean,
    page_token?: string,
    total: number
  }
}
```

**示例 - 查询进行中的任务**:
```typescript
const response = await mcpClient.call('mcp__lark-mcp__bitable_v1_appTableRecord_search', {
  path: {
    app_token: 'bascnxxx',
    table_id: 'tblxxx',
  },
  data: {
    filter: {
      conjunction: 'and',
      conditions: [
        {
          field_name: '状态',
          operator: 'is',
          value: ['🚀 进行中'],
        },
        {
          field_name: '关联规格',
          operator: 'contains',
          value: ['I003'],
        },
      ],
    },
    sort: [
      {
        field_name: '优先级',
        desc: true,
      },
    ],
    automatic_fields: true,
  },
  params: {
    page_size: 100,
    user_id_type: 'open_id',
  },
  useUAT: true,
})
```

### 3.3 更新记录

**MCP Tool**: `mcp__lark-mcp__bitable_v1_appTableRecord_update`

**用途**: 更新指定记录的字段值

**请求参数**:
```typescript
{
  path: {
    app_token: string
    table_id: string
    record_id: string          // 要更新的记录 ID
  },
  data: {
    fields: {
      [fieldName: string]: any  // 要更新的字段
    }
  },
  params: {
    user_id_type?: 'open_id' | 'union_id' | 'user_id'
  },
  useUAT: true
}
```

**响应格式**:
```typescript
{
  code: 0,
  data: {
    record: {
      record_id: string
      fields: {
        [fieldName: string]: any
      }
    }
  }
}
```

**示例 - 更新任务状态**:
```typescript
const response = await mcpClient.call('mcp__lark-mcp__bitable_v1_appTableRecord_update', {
  path: {
    app_token: 'bascnxxx',
    table_id: 'tblxxx',
    record_id: 'recxxx',
  },
  data: {
    fields: {
      '状态': '✅ 已完成',
      '进度': 100,
      '实际工时': 8.5,
    },
  },
  params: {
    user_id_type: 'open_id',
  },
  useUAT: true,
})
```

### 3.4 删除记录

**MCP Tool**: `mcp__lark-mcp__bitable_v1_appTableRecord_delete`

**用途**: 删除指定记录

**请求参数**:
```typescript
{
  path: {
    app_token: string
    table_id: string
    record_id: string
  },
  useUAT: true
}
```

**响应格式**:
```typescript
{
  code: 0,
  data: {
    deleted: boolean
    record_id: string
  }
}
```

### 3.5 批量创建记录

**MCP Tool**: `mcp__lark-mcp__bitable_v1_appTableRecord_batchCreate`

**用途**: 批量创建记录 (最多 500 条/次)

**请求参数**:
```typescript
{
  path: {
    app_token: string
    table_id: string
  },
  data: {
    records: Array<{
      fields: {
        [fieldName: string]: any
      }
    }>
  },
  params: {
    user_id_type?: 'open_id' | 'union_id' | 'user_id'
  },
  useUAT: true
}
```

**响应格式**:
```typescript
{
  code: 0,
  data: {
    records: Array<{
      record_id: string
      fields: {
        [fieldName: string]: any
      }
    }>
  }
}
```

## 4. 错误处理

### 4.1 标准错误码

| code | 说明 | HTTP 等价 |
|------|------|----------|
| 0 | 成功 | 200 |
| 99991400 | 请求参数不合法 | 400 |
| 99991401 | 未认证 | 401 |
| 99991403 | 无权限 | 403 |
| 99991404 | 资源不存在 | 404 |
| 99991429 | 请求过于频繁 | 429 |
| 99991500 | 服务器内部错误 | 500 |

### 4.2 错误响应格式

```typescript
{
  code: number,              // 错误码
  msg: string,               // 错误信息
  data: {}
}
```

### 4.3 错误处理策略

```typescript
/**
 * 处理飞书 API 错误
 */
export function handleLarkApiError(error: any): never {
  const code = error.code || 99991500
  const msg = error.msg || '未知错误'

  switch (code) {
    case 99991429:
      throw new Error(`API 请求过于频繁,请稍后重试: ${msg}`)

    case 99991404:
      throw new Error(`资源不存在: ${msg}`)

    case 99991403:
      throw new Error(`无权限访问: ${msg}`)

    case 99991401:
      throw new Error(`认证失败,请检查 Token: ${msg}`)

    case 99991400:
      throw new Error(`请求参数错误: ${msg}`)

    default:
      throw new Error(`飞书 API 调用失败 (code: ${code}): ${msg}`)
  }
}
```

### 4.4 重试策略

**适用场景**:
- 网络波动 (超时)
- 限流 (code: 99991429)
- 服务器临时不可用 (code: 99991500)

**不重试场景**:
- 参数错误 (code: 99991400)
- 认证失败 (code: 99991401)
- 无权限 (code: 99991403)
- 资源不存在 (code: 99991404)

**实现**:
```typescript
export async function callLarkApiWithRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number
    baseDelay: number
    backoffFactor: number
  }
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const result = await fn()
      return result
    } catch (error: any) {
      lastError = error

      // 不重试的错误码
      const noRetryErrorCodes = [99991400, 99991401, 99991403, 99991404]
      if (noRetryErrorCodes.includes(error.code)) {
        throw error
      }

      // 最后一次尝试失败
      if (attempt >= options.maxRetries) {
        break
      }

      // 计算延迟
      const delay = options.baseDelay * Math.pow(options.backoffFactor, attempt)
      await sleep(delay)

      console.log(`重试第 ${attempt + 1} 次,延迟 ${delay}ms`)
    }
  }

  throw new Error(`API 调用失败,已重试 ${options.maxRetries} 次: ${lastError.message}`)
}
```

## 5. 性能优化建议

### 5.1 批量操作

**推荐**: 使用批量 API 减少请求次数
```typescript
// ❌ 不推荐: 循环单次创建
for (const task of tasks) {
  await createRecord(task)
}

// ✅ 推荐: 批量创建
await batchCreateRecords(tasks)
```

### 5.2 字段缓存

**推荐**: 缓存表字段定义
```typescript
const fieldCache = new Map<string, Field[]>()

async function getFields(appToken: string, tableId: string): Promise<Field[]> {
  const key = `${appToken}:${tableId}`
  if (fieldCache.has(key)) {
    return fieldCache.get(key)!
  }

  const fields = await listFields(appToken, tableId)
  fieldCache.set(key, fields)
  return fields
}
```

### 5.3 分页查询

**推荐**: 使用分页避免一次加载大量数据
```typescript
async function* getAllRecords(appToken: string, tableId: string) {
  let pageToken: string | undefined

  do {
    const response = await searchRecords(appToken, tableId, { page_token: pageToken })
    yield* response.data.items

    pageToken = response.data.has_more ? response.data.page_token : undefined
  } while (pageToken)
}

// 使用
for await (const record of getAllRecords(appToken, tableId)) {
  console.log(record)
}
```

## 6. 使用限制

### 6.1 速率限制

| 操作类型 | 限制 |
|---------|------|
| 查询记录 | 100 次/分钟 |
| 创建记录 | 50 次/分钟 |
| 更新记录 | 50 次/分钟 |
| 批量操作 | 10 次/分钟 |

**注意**: 超出限制会返回 code: 99991429

### 6.2 数据限制

| 限制项 | 上限 |
|-------|------|
| 单表最大行数 | 100,000 |
| 单表最大字段数 | 500 |
| 单次批量创建 | 500 条 |
| 单次查询返回 | 500 条 |
| 字段名最大长度 | 100 字符 |
| 文本字段最大长度 | 20,000 字符 |

## 7. 调试与监控

### 7.1 请求日志

**推荐**: 记录所有 API 调用
```typescript
export async function loggedApiCall<T>(
  toolName: string,
  params: any,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  logger.info(`[API Call] ${toolName}`, {
    params: JSON.stringify(params),
  })

  try {
    const result = await fn()
    const duration = Date.now() - startTime

    logger.info(`[API Success] ${toolName}`, {
      duration: `${duration}ms`,
    })

    return result
  } catch (error: any) {
    const duration = Date.now() - startTime

    logger.error(`[API Error] ${toolName}`, {
      duration: `${duration}ms`,
      error: error.message,
      code: error.code,
    })

    throw error
  }
}
```

### 7.2 性能指标

**建议监控**:
- API 调用次数
- 平均响应时间
- 错误率
- 重试次数

---

**契约版本**: 1.0.0
**最后更新**: 2025-12-31
**下一步**: 生成快速上手指南 (quickstart.md)
