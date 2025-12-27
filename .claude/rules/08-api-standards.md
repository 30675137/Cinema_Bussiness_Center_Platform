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

### R8.8 异常编号规范

所有业务异常必须使用标准化编号，格式为 `<模块前缀>_<类别>_<序号>`。

#### 编号结构
- **模块前缀**: 2-4 个大写字母（如 `INV` 库存、`SKU` 商品、`STR` 门店）
- **类别**: 3 个大写字母（如 `VAL` 验证、`NTF` 未找到、`DUP` 重复）
- **序号**: 3 位数字（001-999）
- **示例**: `INV_NTF_001`、`SKU_VAL_003`

#### 标准错误类别
| 类别 | 含义 | HTTP 状态码 |
|------|------|------------|
| VAL | 验证错误 | 400 |
| NTF | 未找到 | 404 |
| DUP | 重复冲突 | 409 |
| AUT | 认证错误 | 401 |
| PRM | 权限错误 | 403 |
| BIZ | 业务规则 | 422 |
| SYS | 系统错误 | 500 |

#### 错误响应示例
```json
{
  "success": false,
  "error": "INV_NTF_001",
  "message": "库存记录不存在",
  "details": { "inventoryId": "xxx" },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

#### 实现要求
- 所有业务异常类必须定义错误编号常量
- `GlobalExceptionHandler` 统一格式化异常响应
- 错误编号集中定义在枚举或常量类中，禁止硬编码
- 前端根据 `error` 编号而非 `message` 处理错误

#### 模块前缀映射
| 前缀 | 模块 |
|-----|------|
| CMN | 通用 |
| AUT | 认证 |
| STR | 门店 |
| HAL | 影厅 |
| SKU | 商品 |
| INV | 库存 |
| CAT | 分类 |
| BRD | 品牌 |
| ORD | 订单 |
| RSV | 预订 |
| PKG | 场景包 |
