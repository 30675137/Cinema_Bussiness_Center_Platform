# 影院商品管理中台 - 统一 API 规范文档

**生成时间**: 2025-12-22
**来源规格**: 014-hall-store-backend, 016-store-reservation-settings, 019-store-association, 020-store-address, 022-store-crud, 017-scenario-package, 013-schedule-management, 007-category-management-by-claude, 010-attribute-dict-management
**OpenAPI 版本**: 3.0.3

---

## 概述

本文档整合了影院商品管理中台项目中所有核心功能的 REST API 接口规范，包括门店管理、影厅管理、场景包管理、排期管理、类目管理、属性字典管理等模块的端点定义、请求/响应格式、认证方式和错误处理。

---

## 通用规范

### 服务器地址

| 环境 | URL | 说明 |
|------|-----|------|
| 本地开发 | `http://localhost:8080/api` | 本地开发环境 |
| 开发环境 | `https://api-dev.cinema-platform.com/api` | 开发环境 |
| 生产环境 | `https://api.cinema-platform.com/api` | 生产环境 |

### 认证方式

**Bearer Token (JWT)**

所有需要认证的接口使用 JWT Token 进行认证。请求头格式:

```
Authorization: Bearer <token>
```

### 统一响应格式

遵循项目 API 响应格式标准（`.claude/rules/08-api-standards.md`）:

#### 成功响应 (单个资源)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "北京朝阳店",
    ...
  },
  "timestamp": "2025-12-22T15:00:00Z"
}
```

#### 成功响应 (列表查询)

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "门店A" },
    { "id": 2, "name": "门店B" }
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
  "error": "STORE_NOT_FOUND",
  "message": "未找到指定的门店",
  "details": {
    "storeId": "999"
  },
  "timestamp": "2025-12-22T15:00:00Z"
}
```

### HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|---------|
| 200 | OK | 请求成功 |
| 201 | Created | 创建成功 |
| 204 | No Content | 删除成功（无响应体） |
| 400 | Bad Request | 请求参数错误/验证失败 |
| 401 | Unauthorized | 未认证/Token无效 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如名称重复、版本冲突） |
| 500 | Internal Server Error | 服务器内部错误 |

### 常见错误码

| 错误码 | 说明 | HTTP状态码 |
|--------|------|-----------|
| VALIDATION_ERROR | 请求参数验证失败 | 400 |
| STORE_NOT_FOUND | 门店不存在 | 404 |
| HALL_NOT_FOUND | 影厅不存在 | 404 |
| SETTINGS_NOT_FOUND | 未配置预约设置 | 404 |
| DUPLICATE_STORE_NAME | 门店名称已存在 | 409 |
| OPTIMISTIC_LOCK_EXCEPTION | 乐观锁版本冲突 | 409 |
| STORE_HAS_DEPENDENCIES | 门店有依赖关系无法删除 | 409 |
| UNAUTHORIZED | 未认证或Token无效 | 401 |
| FORBIDDEN | 无权限执行此操作 | 403 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |

---

## API 端点目录

**总计**: 59 个 API 端点覆盖 8 个功能模块

### 一、门店管理 (Stores) - 6个端点

| 方法 | 端点 | 说明 | 来源功能 |
|------|------|------|---------|
| GET | `/stores` | 查询门店列表（含地址摘要） | 014, 020 |
| GET | `/stores/{id}` | 获取门店详情（含完整地址） | 014, 020 |
| POST | `/stores` | 创建新门店 | 022 |
| PUT | `/stores/{id}` | 更新门店信息（含地址） | 020, 022 |
| PATCH | `/stores/{id}/status` | 切换门店状态（启用/停用） | 022 |
| DELETE | `/stores/{id}` | 删除门店 | 022 |

### 二、影厅管理 (Halls) - 4个端点

| 方法 | 端点 | 说明 | 来源功能 |
|------|------|------|---------|
| GET | `/stores/{storeId}/halls` | 按门店查询影厅列表 | 014 |
| GET | `/admin/halls/{id}` | 获取影厅详情 | 014 |
| POST | `/admin/halls` | 创建影厅 | 014 |
| PUT | `/admin/halls/{id}` | 更新影厅信息 | 014 |

### 三、预约设置管理 (Reservation Settings) - 3个端点

| 方法 | 端点 | 说明 | 来源功能 |
|------|------|------|---------|
| GET | `/stores/{storeId}/reservation-settings` | 获取门店预约设置 | 016 |
| PUT | `/stores/{storeId}/reservation-settings` | 创建或更新预约设置 | 016 |
| DELETE | `/stores/{storeId}/reservation-settings` | 删除预约设置（恢复默认值） | 016 |

### 四、场景包门店关联 (Scenario Package Associations) - 3个端点

| 方法 | 端点 | 说明 | 来源功能 |
|------|------|------|---------|
| GET | `/scenario-packages/{id}` | 获取场景包详情（含关联门店） | 019 |
| POST | `/scenario-packages` | 创建场景包（含门店关联） | 019 |
| PUT | `/scenario-packages/{id}` | 更新场景包（含门店关联） | 019 |

### 五、场景包管理 (Scenario Packages) - 8个端点

| 方法 | 端点 | 说明 | 来源功能 |
|------|------|------|---------|
| GET | `/scenario-packages` | 查询场景包列表 | 017 |
| POST | `/scenario-packages` | 创建场景包 | 017 |
| PUT | `/scenario-packages/{id}` | 更新场景包 | 017 |
| POST | `/scenario-packages/{id}/publish` | 发布场景包 | 017 |
| POST | `/scenario-packages/{id}/unpublish` | 下架场景包 | 017 |
| POST | `/scenario-packages/{id}/image` | 生成图片上传URL | 017 |
| PATCH | `/scenario-packages/{id}/image` | 确认图片上传 | 017 |
| GET | `/scenario-packages/{id}/pricing/reference` | 计算参考定价 | 017 |

### 六、排期管理 (Schedules) - 6个端点

| 方法 | 端点 | 说明 | 来源功能 |
|------|------|------|---------|
| GET | `/schedules` | 查询排期事件 | 013 |
| POST | `/schedules` | 创建排期事件 | 013 |
| PUT | `/schedules/{id}` | 更新排期事件 | 013 |
| DELETE | `/schedules/{id}` | 删除排期事件 | 013 |
| POST | `/schedules/{id}/conflict-check` | 检测时间冲突 | 013 |
| GET | `/halls` | 获取影厅列表（用于排期筛选） | 013 |

### 七、类目管理 (Categories) - 11个端点

| 方法 | 端点 | 说明 | 来源功能 |
|------|------|------|---------|
| GET | `/categories/tree` | 获取类目树 | 007 |
| GET | `/categories` | 查询类目列表 | 007 |
| POST | `/categories` | 创建类目 | 007 |
| PUT | `/categories/{categoryId}` | 更新类目 | 007 |
| DELETE | `/categories/{categoryId}` | 删除类目 | 007 |
| GET | `/categories/{categoryId}/children` | 获取子类目（懒加载） | 007 |
| GET | `/categories/{categoryId}/attribute-template` | 获取属性模板 | 007 |
| PUT | `/categories/{categoryId}/attribute-template` | 保存属性模板 | 007 |
| POST | `/categories/{categoryId}/attributes` | 添加属性 | 007 |
| PUT | `/categories/{categoryId}/attributes/{attributeId}` | 更新属性 | 007 |
| DELETE | `/categories/{categoryId}/attributes/{attributeId}` | 删除属性 | 007 |

### 八、属性与数据字典管理 (Attributes & Dictionaries) - 20个端点

| 方法 | 端点 | 说明 | 来源功能 |
|------|------|------|---------|
| GET | `/dictionary-types` | 查询字典类型列表 | 010 |
| POST | `/dictionary-types` | 创建字典类型 | 010 |
| GET | `/dictionary-types/{typeId}` | 获取字典类型详情 | 010 |
| PUT | `/dictionary-types/{typeId}` | 更新字典类型 | 010 |
| DELETE | `/dictionary-types/{typeId}` | 删除字典类型 | 010 |
| GET | `/dictionary-types/{typeId}/items` | 获取字典项列表 | 010 |
| POST | `/dictionary-types/{typeId}/items` | 创建字典项 | 010 |
| PUT | `/dictionary-items/{itemId}` | 更新字典项 | 010 |
| DELETE | `/dictionary-items/{itemId}` | 删除字典项 | 010 |
| POST | `/dictionary-items/batch-update-sort` | 批量更新字典项排序 | 010 |
| GET | `/attribute-templates` | 查询属性模板列表 | 010 |
| POST | `/attribute-templates` | 创建属性模板 | 010 |
| GET | `/attribute-templates/{templateId}` | 获取属性模板详情 | 010 |
| PUT | `/attribute-templates/{templateId}` | 更新属性模板 | 010 |
| DELETE | `/attribute-templates/{templateId}` | 删除属性模板 | 010 |
| POST | `/attribute-templates/copy` | 复制属性模板 | 010 |
| POST | `/attributes/{attributeId}` | 创建属性（独立） | 010 |
| GET | `/attributes/{attributeId}` | 获取属性详情 | 010 |
| PUT | `/attributes/{attributeId}` | 更新属性 | 010 |
| DELETE | `/attributes/{attributeId}` | 删除属性 | 010 |

---

## API 详细定义

## 一、门店管理 API

### 1.1 GET /stores - 查询门店列表

**描述**: 获取所有门店列表，返回包含地址摘要的门店信息。

**来源功能**: 014-hall-store-backend, 020-store-address

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| status | string | 否 | 按状态过滤 (`ACTIVE`, `INACTIVE`) | `ACTIVE` |
| province | string | 否 | 按省份过滤 | `北京市` |
| city | string | 否 | 按城市过滤 | `北京市` |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "code": "STORE-001",
      "name": "北京朝阳店",
      "region": "北京",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "address": "建国路88号SOHO现代城",
      "phone": "010-12345678",
      "addressSummary": "北京市 朝阳区",
      "status": "ACTIVE",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 1.2 GET /stores/{id} - 获取门店详情

**描述**: 获取单个门店的完整信息，包括详细地址。

**来源功能**: 014-hall-store-backend, 020-store-address

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 门店ID |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "code": "STORE-001",
    "name": "北京朝阳店",
    "region": "北京",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "address": "建国路88号SOHO现代城",
    "phone": "010-12345678",
    "addressSummary": "北京市 朝阳区",
    "status": "ACTIVE",
    "version": 0,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  },
  "timestamp": "2025-12-22T16:00:00Z"
}
```

**Response 404 - 门店不存在**:

```json
{
  "success": false,
  "error": "STORE_NOT_FOUND",
  "message": "门店不存在",
  "details": {
    "storeId": "550e8400-e29b-41d4-a716-446655440001"
  },
  "timestamp": "2025-12-22T16:00:00Z"
}
```

---

### 1.3 POST /stores - 创建新门店

**描述**: 创建新门店，填写基本信息、地址和联系方式。

**来源功能**: 022-store-crud

**Request Body**:

```json
{
  "name": "北京朝阳店",
  "region": "华北",
  "city": "北京",
  "province": "北京市",
  "district": "朝阳区",
  "address": "建国路88号SOHO现代城",
  "phone": "010-12345678"
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| name | string | 是 | max 100 chars | 门店名称（唯一） |
| region | string | 是 | | 所属区域 |
| city | string | 是 | | 所属城市 |
| province | string | 否 | | 所属省份 |
| district | string | 否 | | 所属区县 |
| address | string | 是 | | 详细地址 |
| phone | string | 是 | regex pattern | 联系电话（手机号/座机/400热线） |

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "北京朝阳店",
    "region": "华北",
    "city": "北京",
    "province": "北京市",
    "district": "朝阳区",
    "address": "建国路88号SOHO现代城",
    "phone": "010-12345678",
    "status": "ACTIVE",
    "version": 0,
    "createdAt": "2025-12-22T16:00:00Z",
    "updatedAt": "2025-12-22T16:00:00Z"
  },
  "timestamp": "2025-12-22T16:00:00Z"
}
```

**Response 400 - 验证失败**:

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "请求参数验证失败",
  "details": {
    "field": "phone",
    "message": "请输入有效的电话号码"
  },
  "timestamp": "2025-12-22T16:00:00Z"
}
```

**Response 409 - 门店名称冲突**:

```json
{
  "success": false,
  "error": "DUPLICATE_STORE_NAME",
  "message": "门店名称已存在",
  "details": {
    "name": "北京朝阳店"
  },
  "timestamp": "2025-12-22T16:00:00Z"
}
```

---

### 1.4 PUT /stores/{id} - 更新门店信息

**描述**: 更新门店信息，包括地址字段。使用乐观锁防止并发冲突。

**来源功能**: 020-store-address, 022-store-crud

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 门店ID |

**Request Body**:

```json
{
  "name": "北京朝阳店（更新）",
  "region": "华北",
  "city": "北京",
  "province": "北京市",
  "district": "朝阳区",
  "address": "建国路99号SOHO现代城",
  "phone": "010-87654321",
  "version": 0
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 门店名称 |
| region | string | 否 | 所属区域 |
| city | string | 否 | 所属城市 |
| province | string | 否 | 所属省份 |
| district | string | 否 | 所属区县 |
| address | string | 否 | 详细地址 |
| phone | string | 否 | 联系电话 |
| version | integer | 是 | 乐观锁版本号（必须与当前版本匹配） |

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "北京朝阳店（更新）",
    "province": "北京市",
    "city": "北京",
    "district": "朝阳区",
    "address": "建国路99号SOHO现代城",
    "phone": "010-87654321",
    "status": "ACTIVE",
    "version": 1,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-12-22T16:30:00Z"
  },
  "timestamp": "2025-12-22T16:30:00Z"
}
```

**Response 404 - 门店不存在**:

```json
{
  "success": false,
  "error": "STORE_NOT_FOUND",
  "message": "门店不存在",
  "timestamp": "2025-12-22T16:30:00Z"
}
```

**Response 409 - 版本冲突（乐观锁）**:

```json
{
  "success": false,
  "error": "OPTIMISTIC_LOCK_EXCEPTION",
  "message": "门店信息已被他人修改,请刷新后重试",
  "details": {
    "currentVersion": 1,
    "expectedVersion": 0
  },
  "timestamp": "2025-12-22T16:30:00Z"
}
```

---

### 1.5 PATCH /stores/{id}/status - 切换门店状态

**描述**: 切换门店状态（启用/停用）。

**来源功能**: 022-store-crud

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 门店ID |

**Request Body**:

```json
{
  "status": "INACTIVE"
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| status | string | 是 | `ACTIVE` 或 `INACTIVE` | 目标状态 |

**Response 200 - 状态切换成功**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "北京朝阳店",
    "status": "INACTIVE",
    "version": 1,
    "updatedAt": "2025-12-22T16:45:00Z"
  },
  "timestamp": "2025-12-22T16:45:00Z"
}
```

**Response 404 - 门店不存在**:

```json
{
  "success": false,
  "error": "STORE_NOT_FOUND",
  "message": "门店不存在",
  "timestamp": "2025-12-22T16:45:00Z"
}
```

---

### 1.6 DELETE /stores/{id} - 删除门店

**描述**: 删除门店。注意：如果门店有关联的影厅、预约设置或预约记录，删除将失败。

**来源功能**: 022-store-crud

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 门店ID |

**Response 204 - 删除成功**:

无响应体

**Response 404 - 门店不存在**:

```json
{
  "success": false,
  "error": "STORE_NOT_FOUND",
  "message": "门店不存在",
  "timestamp": "2025-12-22T17:00:00Z"
}
```

**Response 409 - 门店有依赖关系无法删除**:

```json
{
  "success": false,
  "error": "STORE_HAS_DEPENDENCIES",
  "message": "该门店有3个影厅,请先删除影厅再删除门店",
  "details": {
    "hallCount": 3
  },
  "timestamp": "2025-12-22T17:00:00Z"
}
```

---

## 二、影厅管理 API

### 2.1 GET /stores/{storeId}/halls - 按门店查询影厅列表

**描述**: 查询指定门店下的所有影厅，支持按状态和类型筛选。

**来源功能**: 014-hall-store-backend

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| storeId | UUID | 是 | 门店ID |

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| status | string | 否 | 筛选影厅状态 | `active`, `inactive`, `maintenance` |
| type | string | 否 | 筛选影厅类型 | `VIP`, `CP`, `Party`, `Public` |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "storeId": "550e8400-e29b-41d4-a716-446655440001",
      "name": "VIP影厅A",
      "capacity": 120,
      "type": "VIP",
      "tags": ["真皮沙发", "KTV设备"],
      "status": "active",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-10T14:20:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "storeId": "550e8400-e29b-41d4-a716-446655440001",
      "name": "公众厅B",
      "capacity": 200,
      "type": "Public",
      "tags": [],
      "status": "active",
      "createdAt": "2025-01-02T00:00:00Z",
      "updatedAt": "2025-01-02T00:00:00Z"
    }
  ],
  "total": 2
}
```

**Response 404 - 门店不存在**:

```json
{
  "success": false,
  "error": "STORE_NOT_FOUND",
  "message": "门店不存在",
  "timestamp": "2025-12-22T17:15:00Z"
}
```

---

### 2.2 POST /admin/halls - 创建影厅

**描述**: 运营后台为指定门店创建新影厅。

**来源功能**: 014-hall-store-backend

**Request Body**:

```json
{
  "storeId": "550e8400-e29b-41d4-a716-446655440001",
  "code": "HALL-001",
  "name": "VIP影厅A",
  "type": "VIP",
  "capacity": 120,
  "tags": ["真皮沙发", "KTV设备"],
  "status": "active"
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| storeId | UUID | 是 | | 所属门店ID |
| code | string | 否 | max 50 chars | 影厅编码（门店内唯一） |
| name | string | 是 | max 100 chars | 影厅名称 |
| type | string | 是 | enum | 影厅类型（VIP/CP/Party/Public） |
| capacity | integer | 是 | 1-1000 | 可容纳人数 |
| tags | string[] | 否 | | 标签列表 |
| status | string | 否 | enum | 影厅状态（默认active） |

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440003",
    "storeId": "550e8400-e29b-41d4-a716-446655440001",
    "code": "HALL-001",
    "name": "VIP影厅A",
    "type": "VIP",
    "capacity": 120,
    "tags": ["真皮沙发", "KTV设备"],
    "status": "active",
    "createdAt": "2025-12-22T17:30:00Z",
    "updatedAt": "2025-12-22T17:30:00Z"
  },
  "timestamp": "2025-12-22T17:30:00Z"
}
```

**Response 404 - 门店不存在**:

```json
{
  "success": false,
  "error": "STORE_NOT_FOUND",
  "message": "门店不存在",
  "timestamp": "2025-12-22T17:30:00Z"
}
```

---

### 2.3 PUT /admin/halls/{id} - 更新影厅信息

**描述**: 更新影厅信息，包括状态变更。

**来源功能**: 014-hall-store-backend

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 影厅ID |

**Request Body**:

```json
{
  "name": "VIP影厅A（升级版）",
  "type": "VIP",
  "capacity": 150,
  "tags": ["真皮沙发", "KTV设备", "杜比音效"],
  "status": "active"
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440003",
    "storeId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "VIP影厅A（升级版）",
    "type": "VIP",
    "capacity": 150,
    "tags": ["真皮沙发", "KTV设备", "杜比音效"],
    "status": "active",
    "createdAt": "2025-12-22T17:30:00Z",
    "updatedAt": "2025-12-22T17:45:00Z"
  },
  "timestamp": "2025-12-22T17:45:00Z"
}
```

**Response 404 - 影厅不存在**:

```json
{
  "success": false,
  "error": "HALL_NOT_FOUND",
  "message": "影厅不存在",
  "timestamp": "2025-12-22T17:45:00Z"
}
```

---

## 三、预约设置管理 API

### 3.1 GET /stores/{storeId}/reservation-settings - 获取门店预约设置

**描述**: 根据门店ID获取该门店的预约设置配置，包括时间段、提前量、时长单位和押金规则。

**来源功能**: 016-store-reservation-settings

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| storeId | UUID | 是 | 门店ID |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": {
    "id": "b1ffc99-8d1c-5fg9-cc7e-7cc0ce491b22",
    "storeId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "timeSlots": [
      {
        "dayOfWeek": 1,
        "startTime": "10:00",
        "endTime": "22:00"
      },
      {
        "dayOfWeek": 2,
        "startTime": "10:00",
        "endTime": "22:00"
      },
      {
        "dayOfWeek": 3,
        "startTime": "10:00",
        "endTime": "22:00"
      },
      {
        "dayOfWeek": 4,
        "startTime": "10:00",
        "endTime": "22:00"
      },
      {
        "dayOfWeek": 5,
        "startTime": "10:00",
        "endTime": "22:00"
      },
      {
        "dayOfWeek": 6,
        "startTime": "09:00",
        "endTime": "23:00"
      },
      {
        "dayOfWeek": 7,
        "startTime": "09:00",
        "endTime": "23:00"
      }
    ],
    "minAdvanceHours": 2,
    "maxAdvanceDays": 30,
    "durationUnit": 1,
    "depositRequired": false,
    "depositAmount": null,
    "depositPercentage": null,
    "isActive": true,
    "createdAt": "2025-12-22T10:00:00Z",
    "updatedAt": "2025-12-22T15:30:00Z"
  },
  "timestamp": "2025-12-22T16:00:00Z"
}
```

**Response 404 - 门店不存在或未配置预约设置**:

```json
{
  "success": false,
  "error": "SETTINGS_NOT_FOUND",
  "message": "该门店未配置预约设置",
  "details": {
    "storeId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
  },
  "timestamp": "2025-12-22T16:00:00Z"
}
```

---

### 3.2 PUT /stores/{storeId}/reservation-settings - 创建或更新预约设置

**描述**: 创建或更新指定门店的预约设置配置。如果门店已有配置则更新，否则创建新配置。

**来源功能**: 016-store-reservation-settings

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| storeId | UUID | 是 | 门店ID |

**Request Body**:

```json
{
  "timeSlots": [
    {
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "22:00"
    },
    {
      "dayOfWeek": 2,
      "startTime": "10:00",
      "endTime": "22:00"
    },
    {
      "dayOfWeek": 3,
      "startTime": "10:00",
      "endTime": "22:00"
    },
    {
      "dayOfWeek": 4,
      "startTime": "10:00",
      "endTime": "22:00"
    },
    {
      "dayOfWeek": 5,
      "startTime": "10:00",
      "endTime": "22:00"
    },
    {
      "dayOfWeek": 6,
      "startTime": "09:00",
      "endTime": "23:00"
    },
    {
      "dayOfWeek": 7,
      "startTime": "09:00",
      "endTime": "23:00"
    }
  ],
  "minAdvanceHours": 2,
  "maxAdvanceDays": 30,
  "durationUnit": 2,
  "depositRequired": true,
  "depositAmount": 200.00
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| timeSlots | TimeSlot[] | 是 | length 7 | 可预约时间段列表（必须包含7天） |
| minAdvanceHours | integer | 是 | >= 1 | 最小提前小时数 |
| maxAdvanceDays | integer | 是 | >= 1 | 最大提前天数 |
| durationUnit | integer | 是 | 1, 2, 或 4 | 预约单位时长（小时） |
| depositRequired | boolean | 是 | | 是否需要押金 |
| depositAmount | number | 否 | >= 0 | 押金金额（元），depositRequired为true时必填之一 |
| depositPercentage | integer | 否 | 0-100 | 押金比例（百分比），depositRequired为true时必填之一 |

**TimeSlot Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| dayOfWeek | integer | 是 | 1-7 | 星期几（1=周一, 7=周日） |
| startTime | string | 是 | HH:mm | 开始时间 |
| endTime | string | 是 | HH:mm | 结束时间 |

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "b1ffc99-8d1c-5fg9-cc7e-7cc0ce491b22",
    "storeId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "timeSlots": [...],
    "minAdvanceHours": 2,
    "maxAdvanceDays": 30,
    "durationUnit": 2,
    "depositRequired": true,
    "depositAmount": 200.00,
    "depositPercentage": null,
    "isActive": true,
    "createdAt": "2025-12-22T10:00:00Z",
    "updatedAt": "2025-12-22T18:00:00Z"
  },
  "timestamp": "2025-12-22T18:00:00Z"
}
```

**Response 201 - 创建成功**:

同200响应格式

**Response 400 - 验证失败**:

```json
{
  "success": false,
  "error": "INVALID_TIME_RANGE",
  "message": "开始时间必须早于结束时间",
  "details": {
    "field": "timeSlots[0].endTime",
    "value": "08:00"
  },
  "timestamp": "2025-12-22T18:00:00Z"
}
```

---

### 3.3 DELETE /stores/{storeId}/reservation-settings - 删除预约设置

**描述**: 删除指定门店的预约设置配置，恢复为系统默认值（周一至周日09:00-21:00，最小提前1小时，最大提前30天，时长单位1小时，无押金）。

**来源功能**: 016-store-reservation-settings

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| storeId | UUID | 是 | 门店ID |

**Response 204 - 删除成功**:

无响应体

**Response 404 - 门店不存在或未配置预约设置**:

```json
{
  "success": false,
  "error": "SETTINGS_NOT_FOUND",
  "message": "该门店未配置预约设置",
  "timestamp": "2025-12-22T18:15:00Z"
}
```

---

## 四、场景包门店关联 API

### 4.1 GET /scenario-packages/{id} - 获取场景包详情（含门店关联）

**描述**: 获取场景包详细信息，包含关联的门店列表。

**来源功能**: 019-store-association

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 场景包ID |

**Response 200 - 成功**:

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "VIP 生日派对专场",
    "description": "为您打造专属的生日派对体验",
    "backgroundImageUrl": "https://example.com/images/birthday.jpg",
    "status": "DRAFT",
    "versionLock": 1,
    "hallTypes": [
      {
        "id": "VIP",
        "name": "VIP厅"
      },
      {
        "id": "PARTY",
        "name": "派对厅"
      }
    ],
    "stores": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "code": "SH001",
        "name": "上海万达影城（五角场店）",
        "region": "上海市杨浦区",
        "status": "active"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "code": "SH002",
        "name": "上海百丽宫影城（环贸店）",
        "region": "上海市徐汇区",
        "status": "active"
      }
    ],
    "storeIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ],
    "rules": {
      "durationHours": 3,
      "minPeople": 10,
      "maxPeople": 20
    },
    "createdAt": "2025-12-21T10:00:00Z",
    "updatedAt": "2025-12-21T10:00:00Z"
  },
  "timestamp": "2025-12-21T15:30:00Z"
}
```

**Response 404 - 场景包不存在**:

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "未找到指定的场景包",
  "timestamp": "2025-12-21T15:30:00Z"
}
```

---

### 4.2 POST /scenario-packages - 创建场景包（含门店关联）

**描述**: 创建新的场景包，必须包含至少一个门店关联。

**来源功能**: 019-store-association

**Request Body**:

```json
{
  "name": "VIP 生日派对专场",
  "description": "为您打造专属的生日派对体验",
  "backgroundImageUrl": "https://example.com/images/birthday.jpg",
  "hallTypeIds": ["VIP", "PARTY"],
  "storeIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "rules": {
    "durationHours": 3,
    "minPeople": 10,
    "maxPeople": 20
  }
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| name | string | 是 | 1-255 chars | 场景包名称 |
| description | string | 否 | | 场景包描述 |
| backgroundImageUrl | string | 否 | | 背景图片URL |
| hallTypeIds | string[] | 否 | | 关联的影厅类型ID列表 |
| storeIds | UUID[] | 是 | min 1 | 关联的门店ID列表（至少一个） |
| rules | PackageRules | 否 | | 场景包规则 |

**Response 201 - 创建成功**:

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "VIP 生日派对专场",
    "description": "为您打造专属的生日派对体验",
    "status": "DRAFT",
    "versionLock": 0,
    "stores": [...],
    "storeIds": [...],
    "createdAt": "2025-12-22T18:30:00Z",
    "updatedAt": "2025-12-22T18:30:00Z"
  },
  "timestamp": "2025-12-22T18:30:00Z"
}
```

**Response 400 - 验证失败**:

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "请至少选择一个门店",
  "details": {
    "field": "storeIds"
  },
  "timestamp": "2025-12-22T18:30:00Z"
}
```

---

### 4.3 PUT /scenario-packages/{id} - 更新场景包（含门店关联）

**描述**: 更新场景包信息，包括门店关联。使用乐观锁防止并发冲突。门店关联采用全量更新（覆盖原有关联）。

**来源功能**: 019-store-association

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 场景包ID |

**Request Body**:

```json
{
  "name": "VIP 生日派对专场（升级版）",
  "description": "为您打造专属的生日派对体验，全新升级！",
  "versionLock": 1,
  "storeIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| name | string | 否 | | 场景包名称 |
| description | string | 否 | | 场景包描述 |
| backgroundImageUrl | string | 否 | | 背景图片URL |
| hallTypeIds | string[] | 否 | | 关联的影厅类型ID列表 |
| storeIds | UUID[] | 是 | min 1 | 关联的门店ID列表（至少一个） |
| rules | PackageRules | 否 | | 场景包规则 |
| versionLock | integer | 是 | | 乐观锁版本号（必须与当前版本匹配） |

**Response 200 - 更新成功**:

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "VIP 生日派对专场（升级版）",
    "versionLock": 2,
    "stores": [...],
    "storeIds": [...],
    "updatedAt": "2025-12-22T18:45:00Z"
  },
  "timestamp": "2025-12-22T18:45:00Z"
}
```

**Response 409 - 版本冲突（乐观锁）**:

```json
{
  "success": false,
  "error": "VERSION_CONFLICT",
  "message": "场馆关联已被其他用户修改，请刷新后重试",
  "details": {
    "currentVersion": 2,
    "expectedVersion": 1
  },
  "timestamp": "2025-12-22T18:45:00Z"
}
```

---

## 五、场景包管理 API (详细版本控制)

### 5.1 GET /scenario-packages - 查询场景包列表

**描述**: 查询场景包列表,支持分页、筛选和排序。

**来源功能**: 017-scenario-package

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | integer | 否 | 页码（从1开始） | 1 |
| pageSize | integer | 否 | 每页数量（默认20） | 20 |
| status | string | 否 | 按状态筛选 | DRAFT, PUBLISHED, UNPUBLISHED |
| basePackageId | UUID | 否 | 按基础包ID筛选 | 550e8400-... |
| keyword | string | 否 | 按名称或描述搜索 | 生日派对 |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "basePackageId": "770e8400-e29b-41d4-a716-446655440000",
      "version": 2,
      "versionLock": 5,
      "name": "VIP 生日派对专场",
      "status": "PUBLISHED",
      "backgroundImageUrl": "https://cdn.cinema.com/images/birthday.jpg",
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-15T14:30:00Z",
      "publishedAt": "2025-12-10T09:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20
}
```

---

### 5.2 POST /scenario-packages - 创建场景包

**描述**: 创建新的场景包草稿（状态为DRAFT）。

**来源功能**: 017-scenario-package

**Request Body**:

```json
{
  "name": "浪漫情侣专场",
  "description": "为情侣打造浪漫私密的观影体验",
  "backgroundImageUrl": "https://cdn.cinema.com/images/romance.jpg",
  "content": {
    "benefits": [
      {
        "id": "benefit-001",
        "title": "私密空间",
        "description": "独立包厢，专属服务"
      }
    ],
    "items": [
      {
        "id": "item-001",
        "name": "玫瑰花束",
        "quantity": 1
      }
    ],
    "services": [
      {
        "id": "service-001",
        "name": "专业摄影",
        "duration": 30
      }
    ]
  },
  "rule": {
    "durationHours": 3,
    "minPeople": 2,
    "maxPeople": 2
  },
  "pricing": {
    "basePrice": 999.00,
    "currency": "CNY"
  }
}
```

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440010",
    "basePackageId": "770e8400-e29b-41d4-a716-446655440010",
    "version": 1,
    "versionLock": 0,
    "name": "浪漫情侣专场",
    "status": "DRAFT",
    "createdAt": "2025-12-22T19:00:00Z",
    "updatedAt": "2025-12-22T19:00:00Z"
  },
  "timestamp": "2025-12-22T19:00:00Z"
}
```

---

### 5.3 PUT /scenario-packages/{id} - 更新场景包

**描述**: 更新场景包信息（仅DRAFT状态可全量更新）。使用乐观锁。

**来源功能**: 017-scenario-package

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 场景包ID |

**Request Body**:

```json
{
  "name": "浪漫情侣专场（升级版）",
  "description": "全新升级的浪漫体验",
  "versionLock": 0,
  "content": {
    "benefits": [...]
  },
  "pricing": {
    "basePrice": 1299.00,
    "currency": "CNY"
  }
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440010",
    "versionLock": 1,
    "name": "浪漫情侣专场（升级版）",
    "updatedAt": "2025-12-22T19:15:00Z"
  },
  "timestamp": "2025-12-22T19:15:00Z"
}
```

**Response 409 - 版本冲突**:

```json
{
  "success": false,
  "error": "OPTIMISTIC_LOCK_EXCEPTION",
  "message": "场景包已被其他用户修改，请刷新后重试",
  "details": {
    "currentVersionLock": 1,
    "expectedVersionLock": 0
  },
  "timestamp": "2025-12-22T19:15:00Z"
}
```

---

### 5.4 POST /scenario-packages/{id}/publish - 发布场景包

**描述**: 将DRAFT状态的场景包发布为PUBLISHED（对C端可见）。

**来源功能**: 017-scenario-package

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 场景包ID |

**Response 200 - 发布成功**:

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440010",
    "status": "PUBLISHED",
    "publishedAt": "2025-12-22T19:30:00Z"
  },
  "timestamp": "2025-12-22T19:30:00Z"
}
```

**Response 400 - 场景包未就绪**:

```json
{
  "success": false,
  "error": "PACKAGE_NOT_READY",
  "message": "场景包信息不完整，无法发布",
  "details": {
    "missingFields": ["backgroundImageUrl", "pricing"]
  },
  "timestamp": "2025-12-22T19:30:00Z"
}
```

---

### 5.5 POST /scenario-packages/{id}/unpublish - 下架场景包

**描述**: 将PUBLISHED状态的场景包下架为UNPUBLISHED（C端不可见）。

**来源功能**: 017-scenario-package

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 场景包ID |

**Response 200 - 下架成功**:

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440010",
    "status": "UNPUBLISHED",
    "unpublishedAt": "2025-12-22T19:45:00Z"
  },
  "timestamp": "2025-12-22T19:45:00Z"
}
```

---

### 5.6 POST /scenario-packages/{id}/image - 生成图片上传URL

**描述**: 生成预签名的图片上传URL，用于上传场景包背景图片。

**来源功能**: 017-scenario-package

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 场景包ID |

**Request Body**:

```json
{
  "fileName": "birthday-bg.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2048576
}
```

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://supabase.storage.api/v1/object/upload/...",
    "imageKey": "scenario-packages/770e8400.../birthday-bg.jpg",
    "expiresAt": "2025-12-22T20:00:00Z"
  },
  "timestamp": "2025-12-22T19:50:00Z"
}
```

---

### 5.7 PATCH /scenario-packages/{id}/image - 确认图片上传

**描述**: 图片上传成功后，确认图片URL并更新场景包记录。

**来源功能**: 017-scenario-package

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 场景包ID |

**Request Body**:

```json
{
  "imageKey": "scenario-packages/770e8400.../birthday-bg.jpg"
}
```

**Response 200 - 确认成功**:

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440010",
    "backgroundImageUrl": "https://cdn.cinema.com/scenario-packages/770e8400.../birthday-bg.jpg",
    "updatedAt": "2025-12-22T19:55:00Z"
  },
  "timestamp": "2025-12-22T19:55:00Z"
}
```

---

### 5.8 GET /scenario-packages/{id}/pricing/reference - 计算参考定价

**描述**: 根据场景包内容自动计算推荐定价（基于成本、市场价格等）。

**来源功能**: 017-scenario-package

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 场景包ID |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": {
    "referencePrice": 1199.00,
    "breakdown": {
      "baseCost": 500.00,
      "itemsCost": 300.00,
      "servicesCost": 200.00,
      "profitMargin": 199.00
    },
    "currency": "CNY"
  },
  "timestamp": "2025-12-22T20:00:00Z"
}
```

---

## 六、排期管理 API (Gantt 甘特图视图)

### 6.1 GET /schedules - 查询排期事件

**描述**: 查询排期事件列表，支持按日期、影厅、事件类型筛选，用于甘特图展示。

**来源功能**: 013-schedule-management

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| date | string | 否 | 按日期筛选（YYYY-MM-DD） | 2025-12-25 |
| startDate | string | 否 | 起始日期（与endDate配合使用） | 2025-12-20 |
| endDate | string | 否 | 结束日期 | 2025-12-27 |
| hallId | UUID | 否 | 按影厅筛选 | 660e8400-... |
| type | string | 否 | 按事件类型筛选 | public, private, maintenance, cleaning |
| status | string | 否 | 按状态筛选 | confirmed, pending, locked |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440001",
      "hallId": "660e8400-e29b-41d4-a716-446655440001",
      "hallName": "VIP影厅A",
      "date": "2025-12-25",
      "startHour": 14.0,
      "duration": 3.0,
      "title": "VIP生日派对",
      "type": "private",
      "status": "confirmed",
      "scenarioPackageId": "770e8400-e29b-41d4-a716-446655440001",
      "customerName": "张三",
      "customerPhone": "138****5678",
      "createdAt": "2025-12-20T10:00:00Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440002",
      "hallId": "660e8400-e29b-41d4-a716-446655440001",
      "hallName": "VIP影厅A",
      "date": "2025-12-25",
      "startHour": 18.5,
      "duration": 2.0,
      "title": "设备维护",
      "type": "maintenance",
      "status": "locked",
      "createdAt": "2025-12-18T15:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 6.2 POST /schedules - 创建排期事件

**描述**: 创建新的排期事件，自动检测时间冲突。

**来源功能**: 013-schedule-management

**Request Body**:

```json
{
  "hallId": "660e8400-e29b-41d4-a716-446655440001",
  "date": "2025-12-26",
  "startHour": 10.0,
  "duration": 3.0,
  "title": "公司团建活动",
  "type": "private",
  "status": "confirmed",
  "scenarioPackageId": "770e8400-e29b-41d4-a716-446655440005",
  "customerName": "李四",
  "customerPhone": "139****1234"
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| hallId | UUID | 是 | | 影厅ID |
| date | string | 是 | YYYY-MM-DD | 排期日期 |
| startHour | number | 是 | 0-24 | 开始时间（小时，支持小数如10.5=10:30） |
| duration | number | 是 | > 0 | 时长（小时） |
| title | string | 是 | max 200 chars | 事件标题 |
| type | string | 是 | enum | 事件类型（public/private/maintenance/cleaning） |
| status | string | 否 | enum | 状态（默认pending） |
| scenarioPackageId | UUID | 否 | | 关联的场景包ID（仅private类型） |
| customerName | string | 否 | | 客户姓名（仅private类型） |
| customerPhone | string | 否 | | 客户电话（仅private类型） |

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440020",
    "hallId": "660e8400-e29b-41d4-a716-446655440001",
    "date": "2025-12-26",
    "startHour": 10.0,
    "duration": 3.0,
    "title": "公司团建活动",
    "type": "private",
    "status": "confirmed",
    "createdAt": "2025-12-22T20:15:00Z"
  },
  "timestamp": "2025-12-22T20:15:00Z"
}
```

**Response 409 - 时间冲突**:

```json
{
  "success": false,
  "error": "SCHEDULE_CONFLICT",
  "message": "该时间段已有排期，请选择其他时间",
  "details": {
    "conflictingEvents": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440001",
        "title": "VIP生日派对",
        "startHour": 9.0,
        "duration": 4.0
      }
    ]
  },
  "timestamp": "2025-12-22T20:15:00Z"
}
```

---

### 6.3 PUT /schedules/{id} - 更新排期事件

**描述**: 更新排期事件信息，修改时间时自动检测冲突。

**来源功能**: 013-schedule-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 排期事件ID |

**Request Body**:

```json
{
  "startHour": 11.0,
  "duration": 2.5,
  "status": "confirmed"
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440020",
    "startHour": 11.0,
    "duration": 2.5,
    "status": "confirmed",
    "updatedAt": "2025-12-22T20:30:00Z"
  },
  "timestamp": "2025-12-22T20:30:00Z"
}
```

---

### 6.4 DELETE /schedules/{id} - 删除排期事件

**描述**: 删除排期事件（仅pending状态可删除）。

**来源功能**: 013-schedule-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 排期事件ID |

**Response 204 - 删除成功**:

无响应体

**Response 409 - 无法删除**:

```json
{
  "success": false,
  "error": "CANNOT_DELETE_CONFIRMED",
  "message": "已确认的排期无法删除，请先取消状态",
  "timestamp": "2025-12-22T20:45:00Z"
}
```

---

### 6.5 POST /schedules/{id}/conflict-check - 检测时间冲突

**描述**: 检测指定时间段是否与现有排期冲突（用于前端实时验证）。

**来源功能**: 013-schedule-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 排期事件ID（修改时需要排除自身） |

**Request Body**:

```json
{
  "hallId": "660e8400-e29b-41d4-a716-446655440001",
  "date": "2025-12-26",
  "startHour": 10.0,
  "duration": 3.0
}
```

**Response 200 - 无冲突**:

```json
{
  "success": true,
  "data": {
    "hasConflict": false
  },
  "timestamp": "2025-12-22T21:00:00Z"
}
```

**Response 200 - 有冲突**:

```json
{
  "success": true,
  "data": {
    "hasConflict": true,
    "conflictingEvents": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440001",
        "title": "VIP生日派对",
        "startHour": 9.0,
        "endHour": 12.0
      }
    ]
  },
  "timestamp": "2025-12-22T21:00:00Z"
}
```

---

### 6.6 GET /halls - 获取影厅列表（用于排期筛选）

**描述**: 获取所有影厅列表，用于排期页面的影厅筛选器。

**来源功能**: 013-schedule-management

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "VIP影厅A",
      "storeId": "550e8400-e29b-41d4-a716-446655440001",
      "storeName": "北京朝阳店",
      "type": "VIP",
      "capacity": 120,
      "status": "active"
    }
  ],
  "total": 5
}
```

---

## 七、类目管理 API (3级类目树)

### 7.1 GET /categories/tree - 获取类目树

**描述**: 获取类目树结构，支持懒加载（仅加载指定level的子节点）。

**来源功能**: 007-category-management-by-claude

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| parentId | string | 否 | 父类目ID（为空时返回一级类目） | null或UUID |
| level | integer | 否 | 类目层级（1/2/3） | 1 |
| lazy | boolean | 否 | 是否懒加载（默认false，全量返回树） | true |

**Response 200 - 成功（全量树）**:

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "name": "食品饮料",
      "code": "CAT-FOOD",
      "level": 1,
      "parentId": null,
      "sortOrder": 1,
      "status": "enabled",
      "children": [
        {
          "id": "990e8400-e29b-41d4-a716-446655440011",
          "name": "零食",
          "code": "CAT-FOOD-SNACK",
          "level": 2,
          "parentId": "990e8400-e29b-41d4-a716-446655440001",
          "sortOrder": 1,
          "status": "enabled",
          "children": [
            {
              "id": "990e8400-e29b-41d4-a716-446655440021",
              "name": "爆米花",
              "code": "CAT-FOOD-SNACK-POPCORN",
              "level": 3,
              "parentId": "990e8400-e29b-41d4-a716-446655440011",
              "sortOrder": 1,
              "status": "enabled",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

**Response 200 - 成功（懒加载，仅一级类目）**:

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "name": "食品饮料",
      "code": "CAT-FOOD",
      "level": 1,
      "parentId": null,
      "sortOrder": 1,
      "status": "enabled",
      "hasChildren": true
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440002",
      "name": "影视周边",
      "code": "CAT-MERCHANDISE",
      "level": 1,
      "parentId": null,
      "sortOrder": 2,
      "status": "enabled",
      "hasChildren": true
    }
  ]
}
```

---

### 7.2 GET /categories - 查询类目列表

**描述**: 查询类目列表，支持分页和筛选。

**来源功能**: 007-category-management-by-claude

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| pageSize | integer | 否 | 每页数量（默认20） |
| parentId | string | 否 | 按父类目筛选 |
| status | string | 否 | 按状态筛选（enabled/disabled） |
| keyword | string | 否 | 按名称或编码搜索 |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "name": "食品饮料",
      "code": "CAT-FOOD",
      "level": 1,
      "parentId": null,
      "sortOrder": 1,
      "status": "enabled",
      "createdAt": "2025-10-01T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

---

### 7.3 POST /categories - 创建类目

**描述**: 创建新类目（支持1-3级）。

**来源功能**: 007-category-management-by-claude

**Request Body**:

```json
{
  "name": "零食",
  "code": "CAT-FOOD-SNACK",
  "parentId": "990e8400-e29b-41d4-a716-446655440001",
  "level": 2,
  "sortOrder": 1,
  "status": "enabled"
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| name | string | 是 | max 100 chars, unique within parent | 类目名称 |
| code | string | 是 | max 50 chars, unique globally | 类目编码 |
| parentId | UUID | level>1时必填 | | 父类目ID（一级类目为null） |
| level | integer | 是 | 1/2/3 | 类目层级 |
| sortOrder | integer | 否 | | 排序值（默认999） |
| status | string | 否 | enum | 状态（默认enabled） |

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440011",
    "name": "零食",
    "code": "CAT-FOOD-SNACK",
    "level": 2,
    "parentId": "990e8400-e29b-41d4-a716-446655440001",
    "sortOrder": 1,
    "status": "enabled",
    "createdAt": "2025-12-22T21:15:00Z",
    "updatedAt": "2025-12-22T21:15:00Z"
  },
  "timestamp": "2025-12-22T21:15:00Z"
}
```

**Response 400 - 验证失败**:

```json
{
  "success": false,
  "error": "DUPLICATE_CATEGORY_NAME",
  "message": "同级类目名称已存在",
  "details": {
    "name": "零食",
    "parentId": "990e8400-e29b-41d4-a716-446655440001"
  },
  "timestamp": "2025-12-22T21:15:00Z"
}
```

---

### 7.4 PUT /categories/{categoryId} - 更新类目

**描述**: 更新类目信息（不能修改level和parentId，需重新创建）。

**来源功能**: 007-category-management-by-claude

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 是 | 类目ID |

**Request Body**:

```json
{
  "name": "休闲零食",
  "code": "CAT-FOOD-SNACK-CASUAL",
  "sortOrder": 2,
  "status": "enabled"
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440011",
    "name": "休闲零食",
    "code": "CAT-FOOD-SNACK-CASUAL",
    "sortOrder": 2,
    "updatedAt": "2025-12-22T21:30:00Z"
  },
  "timestamp": "2025-12-22T21:30:00Z"
}
```

---

### 7.5 DELETE /categories/{categoryId} - 删除类目

**描述**: 删除类目（必须先删除所有子类目和关联商品）。

**来源功能**: 007-category-management-by-claude

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 是 | 类目ID |

**Response 204 - 删除成功**:

无响应体

**Response 409 - 有依赖无法删除**:

```json
{
  "success": false,
  "error": "CATEGORY_HAS_CHILDREN",
  "message": "该类目有3个子类目，请先删除子类目",
  "details": {
    "childrenCount": 3
  },
  "timestamp": "2025-12-22T21:45:00Z"
}
```

---

### 7.6 GET /categories/{categoryId}/children - 获取子类目（懒加载）

**描述**: 获取指定类目的直接子类目列表，用于树形组件懒加载。

**来源功能**: 007-category-management-by-claude

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 是 | 父类目ID |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440011",
      "name": "零食",
      "code": "CAT-FOOD-SNACK",
      "level": 2,
      "parentId": "990e8400-e29b-41d4-a716-446655440001",
      "sortOrder": 1,
      "status": "enabled",
      "hasChildren": true
    }
  ]
}
```

---

### 7.7 GET /categories/{categoryId}/attribute-template - 获取属性模板

**描述**: 获取类目关联的属性模板（商品属性定义）。

**来源功能**: 007-category-management-by-claude

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 是 | 类目ID |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "categoryId": "990e8400-e29b-41d4-a716-446655440021",
    "name": "爆米花属性模板",
    "version": 1,
    "isActive": true,
    "attributes": [
      {
        "id": "attr-001",
        "name": "口味",
        "type": "single-select",
        "required": true,
        "optionalValues": ["原味", "焦糖", "芝士"],
        "validation": []
      },
      {
        "id": "attr-002",
        "name": "重量",
        "type": "number",
        "required": true,
        "validation": [
          {
            "rule": "min",
            "value": 50
          },
          {
            "rule": "max",
            "value": 500
          }
        ]
      }
    ],
    "createdAt": "2025-11-01T00:00:00Z",
    "updatedAt": "2025-11-01T00:00:00Z"
  },
  "timestamp": "2025-12-22T22:00:00Z"
}
```

---

### 7.8 PUT /categories/{categoryId}/attribute-template - 保存属性模板

**描述**: 创建或更新类目的属性模板。

**来源功能**: 007-category-management-by-claude

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 是 | 类目ID |

**Request Body**:

```json
{
  "name": "爆米花属性模板",
  "attributes": [
    {
      "id": "attr-001",
      "name": "口味",
      "type": "single-select",
      "required": true,
      "optionalValues": ["原味", "焦糖", "芝士", "黄油"]
    }
  ]
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "version": 2,
    "updatedAt": "2025-12-22T22:15:00Z"
  },
  "timestamp": "2025-12-22T22:15:00Z"
}
```

---

### 7.9 POST /categories/{categoryId}/attributes - 添加属性

**描述**: 向类目属性模板中添加新属性。

**来源功能**: 007-category-management-by-claude

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 是 | 类目ID |

**Request Body**:

```json
{
  "name": "包装类型",
  "type": "single-select",
  "required": false,
  "optionalValues": ["桶装", "盒装", "袋装"]
}
```

**Response 201 - 添加成功**:

```json
{
  "success": true,
  "data": {
    "id": "attr-003",
    "name": "包装类型",
    "type": "single-select",
    "required": false,
    "optionalValues": ["桶装", "盒装", "袋装"],
    "createdAt": "2025-12-22T22:30:00Z"
  },
  "timestamp": "2025-12-22T22:30:00Z"
}
```

---

### 7.10 PUT /categories/{categoryId}/attributes/{attributeId} - 更新属性

**描述**: 更新类目属性模板中的指定属性。

**来源功能**: 007-category-management-by-claude

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 是 | 类目ID |
| attributeId | string | 是 | 属性ID |

**Request Body**:

```json
{
  "name": "包装规格",
  "type": "single-select",
  "required": true,
  "optionalValues": ["大桶", "中桶", "小桶"]
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "attr-003",
    "name": "包装规格",
    "type": "single-select",
    "required": true,
    "optionalValues": ["大桶", "中桶", "小桶"],
    "updatedAt": "2025-12-22T22:45:00Z"
  },
  "timestamp": "2025-12-22T22:45:00Z"
}
```

---

### 7.11 DELETE /categories/{categoryId}/attributes/{attributeId} - 删除属性

**描述**: 从类目属性模板中删除指定属性。

**来源功能**: 007-category-management-by-claude

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | string | 是 | 类目ID |
| attributeId | string | 是 | 属性ID |

**Response 204 - 删除成功**:

无响应体

---

## 八、属性与数据字典管理 API

### 8.1 GET /dictionary-types - 查询字典类型列表

**描述**: 查询所有数据字典类型，支持分页和筛选。

**来源功能**: 010-attribute-dict-management

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| pageSize | integer | 否 | 每页数量（默认20） |
| category | string | 否 | 按分类筛选（basic/business/custom） |
| status | string | 否 | 按状态筛选（active/inactive） |
| keyword | string | 否 | 按名称或编码搜索 |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440001",
      "code": "FLAVOR_TYPE",
      "name": "口味类型",
      "category": "business",
      "status": "active",
      "itemCount": 15,
      "createdAt": "2025-09-01T00:00:00Z",
      "updatedAt": "2025-09-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

---

### 8.2 POST /dictionary-types - 创建字典类型

**描述**: 创建新的数据字典类型。

**来源功能**: 010-attribute-dict-management

**Request Body**:

```json
{
  "code": "PACKAGING_TYPE",
  "name": "包装类型",
  "category": "business",
  "status": "active"
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| code | string | 是 | max 50 chars, unique, uppercase | 字典编码 |
| name | string | 是 | max 100 chars | 字典名称 |
| category | string | 是 | enum: basic/business/custom | 字典分类 |
| status | string | 否 | enum: active/inactive | 状态（默认active） |

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440010",
    "code": "PACKAGING_TYPE",
    "name": "包装类型",
    "category": "business",
    "status": "active",
    "itemCount": 0,
    "createdAt": "2025-12-22T23:00:00Z",
    "updatedAt": "2025-12-22T23:00:00Z"
  },
  "timestamp": "2025-12-22T23:00:00Z"
}
```

---

### 8.3 GET /dictionary-types/{typeId} - 获取字典类型详情

**描述**: 获取字典类型详情及其所有字典项。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| typeId | UUID | 是 | 字典类型ID |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440001",
    "code": "FLAVOR_TYPE",
    "name": "口味类型",
    "category": "business",
    "status": "active",
    "items": [
      {
        "id": "item-001",
        "label": "原味",
        "value": "ORIGINAL",
        "sortOrder": 1,
        "isDefault": true,
        "status": "active"
      },
      {
        "id": "item-002",
        "label": "焦糖",
        "value": "CARAMEL",
        "sortOrder": 2,
        "isDefault": false,
        "status": "active"
      }
    ],
    "itemCount": 2,
    "createdAt": "2025-09-01T00:00:00Z",
    "updatedAt": "2025-09-01T00:00:00Z"
  },
  "timestamp": "2025-12-22T23:15:00Z"
}
```

---

### 8.4 PUT /dictionary-types/{typeId} - 更新字典类型

**描述**: 更新字典类型信息（不包含字典项）。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| typeId | UUID | 是 | 字典类型ID |

**Request Body**:

```json
{
  "name": "口味分类",
  "category": "business",
  "status": "active"
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440001",
    "code": "FLAVOR_TYPE",
    "name": "口味分类",
    "updatedAt": "2025-12-22T23:30:00Z"
  },
  "timestamp": "2025-12-22T23:30:00Z"
}
```

---

### 8.5 DELETE /dictionary-types/{typeId} - 删除字典类型

**描述**: 删除字典类型（必须先删除所有字典项和关联的属性）。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| typeId | UUID | 是 | 字典类型ID |

**Response 204 - 删除成功**:

无响应体

**Response 409 - 有依赖无法删除**:

```json
{
  "success": false,
  "error": "DICTIONARY_HAS_ITEMS",
  "message": "该字典有5个字典项，请先删除所有字典项",
  "details": {
    "itemCount": 5
  },
  "timestamp": "2025-12-22T23:45:00Z"
}
```

---

### 8.6 GET /dictionary-types/{typeId}/items - 获取字典项列表

**描述**: 获取指定字典类型的所有字典项。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| typeId | UUID | 是 | 字典类型ID |

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 按状态筛选（active/inactive） |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "item-001",
      "dictionaryTypeId": "bb0e8400-e29b-41d4-a716-446655440001",
      "label": "原味",
      "value": "ORIGINAL",
      "sortOrder": 1,
      "isDefault": true,
      "status": "active",
      "createdAt": "2025-09-01T00:00:00Z",
      "updatedAt": "2025-09-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 8.7 POST /dictionary-types/{typeId}/items - 创建字典项

**描述**: 向字典类型中添加新的字典项。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| typeId | UUID | 是 | 字典类型ID |

**Request Body**:

```json
{
  "label": "芝士",
  "value": "CHEESE",
  "sortOrder": 3,
  "isDefault": false,
  "status": "active"
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| label | string | 是 | max 100 chars | 显示标签 |
| value | string | 是 | max 50 chars, unique within type | 值（通常为大写英文） |
| sortOrder | integer | 否 | | 排序值（默认999） |
| isDefault | boolean | 否 | | 是否默认值（默认false） |
| status | string | 否 | enum | 状态（默认active） |

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "item-003",
    "dictionaryTypeId": "bb0e8400-e29b-41d4-a716-446655440001",
    "label": "芝士",
    "value": "CHEESE",
    "sortOrder": 3,
    "isDefault": false,
    "status": "active",
    "createdAt": "2025-12-23T00:00:00Z",
    "updatedAt": "2025-12-23T00:00:00Z"
  },
  "timestamp": "2025-12-23T00:00:00Z"
}
```

---

### 8.8 PUT /dictionary-items/{itemId} - 更新字典项

**描述**: 更新字典项信息。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| itemId | string | 是 | 字典项ID |

**Request Body**:

```json
{
  "label": "芝士味",
  "value": "CHEESE",
  "sortOrder": 4,
  "isDefault": false,
  "status": "active"
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "item-003",
    "label": "芝士味",
    "sortOrder": 4,
    "updatedAt": "2025-12-23T00:15:00Z"
  },
  "timestamp": "2025-12-23T00:15:00Z"
}
```

---

### 8.9 DELETE /dictionary-items/{itemId} - 删除字典项

**描述**: 删除字典项。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| itemId | string | 是 | 字典项ID |

**Response 204 - 删除成功**:

无响应体

---

### 8.10 POST /dictionary-items/batch-update-sort - 批量更新字典项排序

**描述**: 批量更新同一字典类型下多个字典项的排序值。

**来源功能**: 010-attribute-dict-management

**Request Body**:

```json
{
  "dictionaryTypeId": "bb0e8400-e29b-41d4-a716-446655440001",
  "items": [
    {
      "id": "item-001",
      "sortOrder": 3
    },
    {
      "id": "item-002",
      "sortOrder": 1
    },
    {
      "id": "item-003",
      "sortOrder": 2
    }
  ]
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "updatedCount": 3
  },
  "timestamp": "2025-12-23T00:30:00Z"
}
```

---

### 8.11 GET /attribute-templates - 查询属性模板列表

**描述**: 查询所有属性模板，支持按类目筛选。

**来源功能**: 010-attribute-dict-management

**Query Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| pageSize | integer | 否 | 每页数量（默认20） |
| categoryId | UUID | 否 | 按类目筛选 |
| isActive | boolean | 否 | 按激活状态筛选 |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "categoryId": "990e8400-e29b-41d4-a716-446655440021",
      "categoryName": "爆米花",
      "name": "爆米花属性模板",
      "version": 2,
      "isActive": true,
      "attributeCount": 5,
      "createdAt": "2025-11-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

---

### 8.12 POST /attribute-templates - 创建属性模板

**描述**: 为指定类目创建属性模板。

**来源功能**: 010-attribute-dict-management

**Request Body**:

```json
{
  "categoryId": "990e8400-e29b-41d4-a716-446655440021",
  "name": "爆米花属性模板",
  "isActive": true,
  "attributes": [
    {
      "id": "attr-001",
      "name": "口味",
      "type": "single-select",
      "required": true,
      "dictionaryTypeId": "bb0e8400-e29b-41d4-a716-446655440001",
      "level": "SKU"
    }
  ]
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| categoryId | UUID | 是 | | 关联的类目ID |
| name | string | 是 | max 200 chars | 模板名称 |
| isActive | boolean | 否 | | 是否激活（默认true） |
| attributes | Attribute[] | 否 | | 属性列表 |

**Attribute Schema**:

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| id | string | 否 | | 属性ID（新建时自动生成） |
| name | string | 是 | max 100 chars | 属性名称 |
| type | string | 是 | enum | 属性类型（text/number/single-select/multi-select/boolean/date） |
| required | boolean | 否 | | 是否必填（默认false） |
| dictionaryTypeId | UUID | 否 | | 关联的字典类型ID（select类型时必填） |
| level | string | 是 | enum | 属性层级（SPU/SKU/both） |
| validation | ValidationRule[] | 否 | | 验证规则 |

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440010",
    "categoryId": "990e8400-e29b-41d4-a716-446655440021",
    "name": "爆米花属性模板",
    "version": 1,
    "isActive": true,
    "createdAt": "2025-12-23T00:45:00Z",
    "updatedAt": "2025-12-23T00:45:00Z"
  },
  "timestamp": "2025-12-23T00:45:00Z"
}
```

---

### 8.13 GET /attribute-templates/{templateId} - 获取属性模板详情

**描述**: 获取属性模板详情及所有属性定义。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateId | UUID | 是 | 属性模板ID |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "categoryId": "990e8400-e29b-41d4-a716-446655440021",
    "categoryName": "爆米花",
    "name": "爆米花属性模板",
    "version": 2,
    "isActive": true,
    "attributes": [
      {
        "id": "attr-001",
        "name": "口味",
        "type": "single-select",
        "required": true,
        "dictionaryTypeId": "bb0e8400-e29b-41d4-a716-446655440001",
        "dictionaryTypeName": "口味类型",
        "level": "SKU",
        "validation": []
      },
      {
        "id": "attr-002",
        "name": "重量",
        "type": "number",
        "required": true,
        "level": "SKU",
        "validation": [
          {
            "rule": "min",
            "value": 50,
            "message": "最小重量50克"
          },
          {
            "rule": "max",
            "value": 500,
            "message": "最大重量500克"
          }
        ]
      }
    ],
    "createdAt": "2025-11-01T00:00:00Z",
    "updatedAt": "2025-12-01T00:00:00Z"
  },
  "timestamp": "2025-12-23T01:00:00Z"
}
```

---

### 8.14 PUT /attribute-templates/{templateId} - 更新属性模板

**描述**: 更新属性模板信息及属性列表。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateId | UUID | 是 | 属性模板ID |

**Request Body**:

```json
{
  "name": "爆米花属性模板（升级版）",
  "isActive": true,
  "attributes": [
    {
      "id": "attr-001",
      "name": "口味",
      "type": "multi-select",
      "required": true,
      "dictionaryTypeId": "bb0e8400-e29b-41d4-a716-446655440001",
      "level": "SKU"
    }
  ]
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "version": 3,
    "updatedAt": "2025-12-23T01:15:00Z"
  },
  "timestamp": "2025-12-23T01:15:00Z"
}
```

---

### 8.15 DELETE /attribute-templates/{templateId} - 删除属性模板

**描述**: 删除属性模板（会级联删除所有属性）。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateId | UUID | 是 | 属性模板ID |

**Response 204 - 删除成功**:

无响应体

---

### 8.16 POST /attribute-templates/copy - 复制属性模板

**描述**: 将一个类目的属性模板复制到另一个类目。

**来源功能**: 010-attribute-dict-management

**Request Body**:

```json
{
  "sourceTemplateId": "aa0e8400-e29b-41d4-a716-446655440001",
  "targetCategoryId": "990e8400-e29b-41d4-a716-446655440022",
  "newName": "饮料属性模板"
}
```

**Request Body Schema**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sourceTemplateId | UUID | 是 | 源属性模板ID |
| targetCategoryId | UUID | 是 | 目标类目ID |
| newName | string | 是 | 新模板名称 |

**Response 201 - 复制成功**:

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440020",
    "categoryId": "990e8400-e29b-41d4-a716-446655440022",
    "name": "饮料属性模板",
    "version": 1,
    "isActive": true,
    "copiedFromTemplateId": "aa0e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2025-12-23T01:30:00Z"
  },
  "timestamp": "2025-12-23T01:30:00Z"
}
```

---

### 8.17 POST /attributes/{attributeId} - 创建属性（独立）

**描述**: 在属性模板中创建新属性（与POST /categories/{categoryId}/attributes功能相同，提供统一入口）。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| attributeId | string | 是 | 属性ID（通常为新生成的UUID） |

**Request Body**:

```json
{
  "templateId": "aa0e8400-e29b-41d4-a716-446655440001",
  "name": "保质期",
  "type": "date",
  "required": false,
  "level": "SPU"
}
```

**Response 201 - 创建成功**:

```json
{
  "success": true,
  "data": {
    "id": "attr-004",
    "name": "保质期",
    "type": "date",
    "required": false,
    "level": "SPU",
    "createdAt": "2025-12-23T01:45:00Z"
  },
  "timestamp": "2025-12-23T01:45:00Z"
}
```

---

### 8.18 GET /attributes/{attributeId} - 获取属性详情

**描述**: 获取单个属性的详细信息。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| attributeId | string | 是 | 属性ID |

**Response 200 - 成功**:

```json
{
  "success": true,
  "data": {
    "id": "attr-001",
    "templateId": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "口味",
    "type": "single-select",
    "required": true,
    "dictionaryTypeId": "bb0e8400-e29b-41d4-a716-446655440001",
    "dictionaryTypeName": "口味类型",
    "level": "SKU",
    "validation": [],
    "createdAt": "2025-11-01T00:00:00Z",
    "updatedAt": "2025-11-01T00:00:00Z"
  },
  "timestamp": "2025-12-23T02:00:00Z"
}
```

---

### 8.19 PUT /attributes/{attributeId} - 更新属性

**描述**: 更新属性信息。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| attributeId | string | 是 | 属性ID |

**Request Body**:

```json
{
  "name": "口味选择",
  "type": "multi-select",
  "required": false,
  "dictionaryTypeId": "bb0e8400-e29b-41d4-a716-446655440001",
  "level": "SKU"
}
```

**Response 200 - 更新成功**:

```json
{
  "success": true,
  "data": {
    "id": "attr-001",
    "name": "口味选择",
    "type": "multi-select",
    "required": false,
    "updatedAt": "2025-12-23T02:15:00Z"
  },
  "timestamp": "2025-12-23T02:15:00Z"
}
```

---

### 8.20 DELETE /attributes/{attributeId} - 删除属性

**描述**: 从属性模板中删除指定属性。

**来源功能**: 010-attribute-dict-management

**Path Parameters**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| attributeId | string | 是 | 属性ID |

**Response 204 - 删除成功**:

无响应体

---

## 附录

### A. 数据类型定义

#### PackageRules (场景包规则)

```json
{
  "durationHours": 3,
  "minPeople": 10,
  "maxPeople": 20
}
```

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| durationHours | number | >= 0.5 | 时长（小时） |
| minPeople | integer | >= 1 | 最少人数 |
| maxPeople | integer | | 最多人数 |

---

### B. 变更历史

| 版本 | 日期 | 变更内容 | 来源功能 |
|------|------|---------|---------|
| 1.0.0 | 2025-12-22 | 初版发布，整合门店管理相关功能的所有API（15个端点） | 014, 016, 019, 020, 022 |
| 2.0.0 | 2025-12-22 | 重大扩展，新增场景包管理、排期管理、类目管理、属性字典管理API（+44个端点，总计59个） | 017, 013, 007, 010 |

### C. API 统计摘要

| 功能模块 | 端点数量 | 来源规格 | 主要特性 |
|---------|---------|---------|---------|
| 门店管理 | 6 | 014, 020, 022 | CRUD + 状态切换 + 地址管理 |
| 影厅管理 | 4 | 014 | CRUD + 门店关联 |
| 预约设置 | 3 | 016 | 时间段配置 + 押金规则 |
| 场景包关联 | 3 | 019 | M:N 门店关联 + 乐观锁 |
| 场景包管理 | 8 | 017 | 版本控制 + 发布流程 + 图片上传 |
| 排期管理 | 6 | 013 | Gantt 视图 + 冲突检测 |
| 类目管理 | 11 | 007 | 3级树形结构 + 懒加载 + 属性模板 |
| 属性字典 | 20 | 010 | 字典类型 + 字典项 + 属性模板 + 模板复制 |
| **总计** | **61** | **9个规格** | **覆盖 8 大功能域** |

---

**文档结束**
