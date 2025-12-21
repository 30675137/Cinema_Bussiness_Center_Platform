# API 响应格式标准规则

## 核心原则
所有后端 REST API 接口必须遵循统一的响应格式规范。

## 规则

### R8.1 成功响应格式

#### 单个资源
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "商务团建",
    "price": 3500
  },
  "timestamp": "2025-12-21T15:00:00Z"
}
```

#### 列表查询
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "商务团建" },
    { "id": 2, "name": "私人订制" }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "message": "查询成功"
}
```

### R8.2 错误响应格式
```json
{
  "success": false,
  "error": "SCENARIO_NOT_FOUND",
  "message": "未找到指定的场景包",
  "details": {
    "scenarioId": 999
  },
  "timestamp": "2025-12-21T15:00:00Z"
}
```

### R8.3 HTTP 状态码使用
| 状态码 | 场景 |
|-------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

### R8.4 格式一致性要求
- 同一功能域内的所有接口**必须**使用相同的响应格式
- 禁止在同一 Controller 中混用不同的响应格式

### R8.5 前后端契约对齐
- 所有 API 接口必须在 `contracts/api.yaml` 中明确定义响应格式
- 前端 TypeScript 类型定义必须与后端实际返回格式完全一致

```typescript
// 前端类型定义示例
interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
  message?: string
}

interface ListResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pageSize: number
}
```

### R8.6 可选字段处理
- 后端 DTO 中的可选字段（如 `region: string | null`）必须在类型定义中明确标注
- 前端必须正确处理 null 值

### R8.7 禁止行为
- ❌ 禁止返回裸数据（必须包装在统一格式中）
- ❌ 禁止混用 `Map.of()` 和 `ApiResponse` 等不同格式
- ❌ 禁止"先实现后适配"，必须先对齐 API 契约
