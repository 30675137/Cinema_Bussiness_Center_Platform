# 公共接口API文档

## 概述

本文档说明了系统中的公共API接口，包括文件上传、字典数据、用户认证等通用功能。

## 1. 文件上传

### 1.1 单文件上传

**接口地址**: `POST /upload/single`

**功能描述**: 上传单个文件（图片、文档等）

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 限制 |
|--------|------|------|------|------|
| file | File | 是 | 上传的文件 | 最大10MB |
| type | string | 否 | 文件类型 | image/document/video |
| category | string | 否 | 文件分类 | product/avatar/document |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "file_001",
    "url": "https://example.com/files/image_001.jpg",
    "fileName": "image_001.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2025-12-10T10:30:00.000Z"
  }
}
```

### 1.2 批量文件上传

**接口地址**: `POST /upload/batch`

**功能描述**: 批量上传多个文件

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| files | File[] | 是 | 文件数组，最多20个 |
| type | string | 否 | 文件类型 |

### 1.3 获取上传进度

**接口地址**: `GET /upload/progress/{uploadId}`

**功能描述**: 获取文件上传进度

## 2. 字典数据

### 2.1 获取字典列表

**接口地址**: `GET /dicts`

**功能描述**: 获取系统字典数据

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 字典类型 |
| code | string | 否 | 字典编码 |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "type": "product_status",
      "code": "active",
      "label": "已发布",
      "value": "active",
      "sortOrder": 1,
      "isActive": true
    },
    {
      "type": "product_status",
      "code": "draft",
      "label": "草稿",
      "value": "draft",
      "sortOrder": 2,
      "isActive": true
    }
  ]
}
```

### 2.2 获取特定字典

**接口地址**: `GET /dicts/{type}`

**功能描述**: 根据类型获取字典值

## 3. 用户认证

### 3.1 用户登录

**接口地址**: `POST /auth/login`

**功能描述**: 用户登录获取访问令牌

**请求体**:

```json
{
  "username": "admin",
  "password": "password123",
  "captcha": "ABCD",
  "captchaKey": "captcha_001"
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_123",
    "expiresIn": 3600,
    "user": {
      "id": "user_001",
      "username": "admin",
      "name": "管理员",
      "roles": ["admin"],
      "permissions": ["product:read", "product:write"]
    }
  }
}
```

### 3.2 刷新令牌

**接口地址**: `POST /auth/refresh`

**功能描述**: 使用刷新令牌获取新的访问令牌

**请求体**:

```json
{
  "refreshToken": "refresh_token_123"
}
```

### 3.3 用户登出

**接口地址**: `POST /auth/logout`

**功能描述**: 用户登出，使令牌失效

### 3.4 获取当前用户信息

**接口地址**: `GET /auth/me`

**功能描述**: 获取当前登录用户信息

## 4. 系统配置

### 4.1 获取系统配置

**接口地址**: `GET /config`

**功能描述**: 获取系统配置信息

**响应示例**:

```json
{
  "success": true,
  "data": {
    "system": {
      "name": "商品管理中台",
      "version": "1.0.0",
      "environment": "production"
    },
    "upload": {
      "maxFileSize": 10485760,
      "allowedTypes": ["jpg", "png", "gif", "pdf"],
      "uploadUrl": "https://upload.example.com"
    },
    "features": {
      "enableImport": true,
      "enableExport": true,
      "enableBatchOperation": true
    }
  }
}
```

## 5. 操作日志

### 5.1 获取操作日志

**接口地址**: `GET /logs/operations`

**功能描述**: 获取用户操作日志

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | string | 否 | 用户ID |
| action | string | 否 | 操作类型 |
| resource | string | 否 | 资源类型 |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

## 6. 通知消息

### 6.1 获取通知列表

**接口地址**: `GET /notifications`

**功能描述**: 获取用户通知消息

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 通知类型 |
| status | string | 否 | 消息状态 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

### 6.2 标记已读

**接口地址**: `POST /notifications/{id}/read`

**功能描述**: 标记通知为已读

### 6.3 获取未读数量

**接口地址**: `GET /notifications/unread-count`

**功能描述**: 获取当前用户未读消息数量

## 7. 搜索服务

### 7.1 全局搜索

**接口地址**: `GET /search`

**功能描述**: 全局搜索接口，支持多种资源类型

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| type | string | 否 | 搜索类型 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "iPhone 15 Pro",
        "type": "product",
        "highlight": "iPhone 15 <em>Pro</em>"
      }
    ],
    "categories": [],
    "total": 1
  }
}
```

## 8. 统计分析

### 8.1 获取仪表板数据

**接口地址**: `GET /dashboard/stats`

**功能描述**: 获取首页仪表板统计数据

**响应示例**:

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProducts": 1000,
      "activeProducts": 800,
      "totalCategories": 50,
      "today新增": 10
    },
    "trends": [
      {
        "date": "2025-12-01",
        "productCount": 950,
        "newCount": 5
      }
    ],
    "topCategories": [
      {
        "name": "电子产品",
        "productCount": 200,
        "percentage": 20
      }
    ]
  }
}
```

## 9. 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| UPLOAD_FILE_TOO_LARGE | 413 | 上传文件过大 |
| UPLOAD_INVALID_FILE_TYPE | 400 | 不支持的文件类型 |
| AUTH_INVALID_CREDENTIALS | 401 | 用户名或密码错误 |
| AUTH_TOKEN_EXPIRED | 401 | 访问令牌已过期 |
| AUTH_INSUFFICIENT_PERMISSION | 403 | 权限不足 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超限 |
| INTERNAL_SERVER_ERROR | 500 | 服务器内部错误 |

## 10. 使用限制

- **上传文件大小**: 单个文件最大10MB，批量上传总大小最大50MB
- **请求频率**: 普通接口100次/分钟，上传接口20次/分钟
- **搜索关键词**: 最少2个字符，最多50个字符
- **分页限制**: 每页最大100条记录
- **批量操作**: 单次最多处理1000条记录

## 11. WebSocket实时通信

### 11.1 连接地址

```
ws://localhost:8080/ws
```

### 11.2 连接参数

连接时需要传递认证令牌：

```javascript
const ws = new WebSocket('ws://localhost:8080/ws?token=your_access_token');
```

### 11.3 消息格式

**客户端发送消息**:

```json
{
  "type": "subscribe",
  "channel": "product_updates",
  "data": {}
}
```

**服务器推送消息**:

```json
{
  "type": "notification",
  "channel": "product_updates",
  "data": {
    "action": "product_created",
    "productId": "prod_001",
    "message": "新商品已创建"
  },
  "timestamp": "2025-12-10T10:30:00.000Z"
}
```

### 11.4 支持的频道

| 频道名 | 说明 | 数据内容 |
|--------|------|----------|
| product_updates | 商品更新通知 | 商品变更信息 |
| system_notifications | 系统通知 | 系统公告和警告 |
| user_messages | 用户消息 | 个人消息和提醒 |