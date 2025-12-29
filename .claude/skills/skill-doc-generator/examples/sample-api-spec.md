# API 接口规格说明

## 文档信息
- 功能标识：020-store-address
- 生成时间：2025-12-22T15:30:00Z
- 基于规格：specs/020-store-address/spec.md

## API 概述

本文档定义门店地址信息管理功能的 API 接口，包括门店地址信息的查询、创建、更新操作。支持 B端运营人员配置门店地址，C端用户查看门店详情。

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

### 1. 获取门店详情

**描述**：根据门店 ID 获取门店详细信息，包括完整的地址信息和联系电话

**端点**：`GET /api/stores/{storeId}`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| storeId | String | 是 | 门店唯一标识符 | "store_001" |

**请求示例**：
```json
GET /api/stores/store_001
```

**成功响应**（200 OK）：
```json
{
  "success": true,
  "data": {
    "id": "store_001",
    "name": "北京朝阳影院",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "address": "建国路88号SOHO现代城",
    "phone": "010-12345678",
    "addressSummary": "北京市朝阳区",
    "status": "ACTIVE",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-22T15:30:00Z"
  },
  "timestamp": "2025-12-22T15:30:00Z",
  "message": "获取门店详情成功"
}
```

**错误响应**：

| 错误码 | HTTP状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
| STORE_NOT_FOUND | 404 | 门店不存在 | 检查门店 ID 是否正确 |
| INVALID_TOKEN | 401 | Token 无效或过期 | 重新登录获取新 Token |

**业务规则**：
- 门店被停用（status=INACTIVE）时，C端不可访问此接口，B端可正常查询
- 地址摘要字段（addressSummary）由系统自动生成，格式为"城市+区县"

---

### 2. 获取门店列表

**描述**：分页查询门店列表，支持按状态和地区筛选，返回地址摘要信息

**端点**：`GET /api/stores`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| page | Integer | 否 | 页码（从1开始） | 1 |
| pageSize | Integer | 否 | 每页数量（默认20） | 20 |
| status | String | 否 | 门店状态（ACTIVE/INACTIVE） | "ACTIVE" |
| city | String | 否 | 城市筛选 | "北京市" |

**请求示例**：
```json
GET /api/stores?page=1&pageSize=20&status=ACTIVE&city=北京市
```

**成功响应**（200 OK）：
```json
{
  "success": true,
  "data": [
    {
      "id": "store_001",
      "name": "北京朝阳影院",
      "addressSummary": "北京市朝阳区",
      "phone": "010-12345678",
      "status": "ACTIVE"
    },
    {
      "id": "store_002",
      "name": "北京海淀影院",
      "addressSummary": "北京市海淀区",
      "phone": "010-87654321",
      "status": "ACTIVE"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "message": "查询门店列表成功"
}
```

**错误响应**：

| 错误码 | HTTP状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
| INVALID_PARAMETER | 400 | 请求参数错误（如 page < 1） | 检查参数格式和取值范围 |

**业务规则**：
- 列表接口返回地址摘要（addressSummary），不返回完整地址
- 已配置地址的门店显示正确的地址摘要，未配置地址的显示空字符串
- 默认按门店创建时间倒序排列

---

### 3. 创建门店

**描述**：创建新门店，包含完整的地址信息和联系电话

**端点**：`POST /api/stores`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| name | String | 是 | 门店名称 | "北京朝阳影院" |
| province | String | 是 | 省份 | "北京市" |
| city | String | 是 | 城市 | "北京市" |
| district | String | 是 | 区县 | "朝阳区" |
| address | String | 否 | 详细地址 | "建国路88号SOHO现代城" |
| phone | String | 否 | 联系电话 | "010-12345678" |

**请求示例**：
```json
{
  "name": "北京朝阳影院",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "address": "建国路88号SOHO现代城",
  "phone": "010-12345678"
}
```

**成功响应**（201 Created）：
```json
{
  "success": true,
  "data": {
    "id": "store_001",
    "name": "北京朝阳影院",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "address": "建国路88号SOHO现代城",
    "phone": "010-12345678",
    "addressSummary": "北京市朝阳区",
    "status": "ACTIVE",
    "createdAt": "2025-12-22T15:30:00Z",
    "updatedAt": "2025-12-22T15:30:00Z"
  },
  "timestamp": "2025-12-22T15:30:00Z",
  "message": "创建门店成功"
}
```

**错误响应**：

| 错误码 | HTTP状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
| MISSING_REQUIRED_FIELD | 400 | 缺少必填字段（province/city/district） | 检查请求体是否包含所有必填字段 |
| INVALID_PHONE_FORMAT | 400 | 联系电话格式不正确 | 检查电话号码格式（11位手机号或区号+座机号） |
| DUPLICATE_STORE_NAME | 409 | 门店名称已存在 | 使用不同的门店名称 |

**业务规则**：
- province、city、district 为必填字段
- 联系电话如填写则需符合中国大陆手机号（11位，1开头）或座机格式（如 010-12345678）
- addressSummary 由系统自动生成，无需客户端传入
- 新创建的门店默认状态为 ACTIVE

---

### 4. 更新门店地址信息

**描述**：更新门店的地址信息和联系电话

**端点**：`PUT /api/stores/{storeId}/address`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| storeId | String | 是 | 门店唯一标识符（路径参数） | "store_001" |
| province | String | 是 | 省份 | "北京市" |
| city | String | 是 | 城市 | "北京市" |
| district | String | 是 | 区县 | "朝阳区" |
| address | String | 否 | 详细地址 | "建国路99号新地址" |
| phone | String | 否 | 联系电话 | "010-11111111" |

**请求示例**：
```json
{
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "address": "建国路99号新地址",
  "phone": "010-11111111"
}
```

**成功响应**（200 OK）：
```json
{
  "success": true,
  "data": {
    "id": "store_001",
    "name": "北京朝阳影院",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "address": "建国路99号新地址",
    "phone": "010-11111111",
    "addressSummary": "北京市朝阳区",
    "status": "ACTIVE",
    "updatedAt": "2025-12-22T16:00:00Z"
  },
  "timestamp": "2025-12-22T16:00:00Z",
  "message": "更新门店地址成功"
}
```

**错误响应**：

| 错误码 | HTTP状态 | 说明 | 处理建议 |
|-------|---------|------|---------|
| STORE_NOT_FOUND | 404 | 门店不存在 | 检查门店 ID 是否正确 |
| INVALID_PHONE_FORMAT | 400 | 联系电话格式不正确 | 检查电话号码格式 |
| PERMISSION_DENIED | 403 | 无权限修改门店信息 | 联系管理员授权 |

**业务规则**：
- 地址信息变更后，关联的场景包/活动展示时实时通过门店ID获取最新地址，无需手动同步
- 运营人员可以在 2 分钟内完成地址信息的配置
- 所有地址字段校验规则与创建门店接口一致

---

## 错误码表

### 通用错误码

| 错误码 | HTTP状态 | 说明 |
|-------|---------|------|
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| INVALID_TOKEN | 401 | Token 无效或过期 |
| PERMISSION_DENIED | 403 | 无访问权限 |

### 业务错误码

| 错误码 | HTTP状态 | 说明 |
|-------|---------|------|
| STORE_NOT_FOUND | 404 | 门店不存在 |
| MISSING_REQUIRED_FIELD | 400 | 缺少必填字段 |
| INVALID_PHONE_FORMAT | 400 | 联系电话格式不正确 |
| DUPLICATE_STORE_NAME | 409 | 门店名称已存在 |
| INVALID_PARAMETER | 400 | 请求参数错误 |

## 数据类型定义

### Store（门店）

**说明**：门店实体，包含基本信息和地址信息

```typescript
interface Store {
  id: string;                 // 门店唯一标识符
  name: string;               // 门店名称
  province: string;           // 省份（必填）
  city: string;               // 城市（必填）
  district: string;           // 区县（必填）
  address?: string;           // 详细地址（选填）
  phone?: string;             // 联系电话（选填）
  addressSummary: string;     // 地址摘要（派生字段，格式：城市+区县）
  status: 'ACTIVE' | 'INACTIVE'; // 门店状态
  createdAt: string;          // 创建时间（ISO 8601 格式）
  updatedAt: string;          // 更新时间（ISO 8601 格式）
}
```

## 附录

### 变更历史

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| 0.1.0 | 2025-12-22 | 初始版本 - 门店地址信息管理功能 API |

### 相关文档

- 数据模型说明：`data_model.md`
- 规格说明：`specs/020-store-address/spec.md`

---

**生成说明**：
- 本文档由 Claude Skill 文档生成器自动生成
- 所有 API 响应格式遵循项目 API 标准（`.claude/rules/08-api-standards.md`）
- 如发现信息缺失或不准确，请参考原始规格文档并手动补充
- 标记为 `TODO: 待定义错误响应` 的端点需要在规格文档中补充错误处理说明
