# API 接口规格文档（整合版）

## 文档信息
- 生成时间: 2025-12-22 12:47:18
- 数据来源: specs/ 目录下所有规格
- 总端点数: 10
- 处理规格数: 24

## 通用规范

### 基础路径
- 开发环境: `http://localhost:8080/api`
- 生产环境: `https://api.example.com/api`

### 认证方式
- **Bearer Token (JWT)**
- 请求头: `Authorization: Bearer <token>`

### 通用响应格式

**成功响应**:
```json
{
  "success": true,
  "data": <数据对象或数组>,
  "timestamp": "2025-12-22T10:00:00Z",
  "message": "操作成功"
}
```

**错误响应**:
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

### 1. DELETE /api/scenario-packages/{id}

**端点**: `DELETE /api/scenario-packages/{id}`

**描述**: DELETE /api/scenario-packages/{id}

**来源规格**: 019-store-association

**成功响应**: TODO: 待定义响应格式

**错误响应**: TODO: 待定义错误响应

---

### 2. GET /api/scenario-packages/published

**端点**: `GET /api/scenario-packages/published`

**描述**: GET /api/scenario-packages/published

**来源规格**: 018-hall-reserve-homepage

**成功响应**: TODO: 待定义响应格式

**错误响应**: TODO: 待定义错误响应

---

### 3. GET /api/scenario-packages/{id}

**端点**: `GET /api/scenario-packages/{id}`

**描述**: GET /api/scenario-packages/{id}

**来源规格**: 019-store-association

**成功响应**: TODO: 待定义响应格式

**错误响应**: TODO: 待定义错误响应

---

### 4. GET /api/stores

**端点**: `GET /api/stores`

**描述**: GET /api/stores

**来源规格**: 019-store-association

**成功响应**: TODO: 待定义响应格式

**错误响应**: TODO: 待定义错误响应

---

### 5. POST /api/scenario-packages

**端点**: `POST /api/scenario-packages`

**描述**: POST /api/scenario-packages

**来源规格**: 019-store-association

**成功响应**: TODO: 待定义响应格式

**错误响应**: TODO: 待定义错误响应

---

### 6. POST /api/stores

**端点**: `POST /api/stores`

**描述**: POST /api/stores

**来源规格**: 001-skill-doc-generator

**成功响应**: TODO: 待定义响应格式

**错误响应**: TODO: 待定义错误响应

---

### 7. PUT /api/scenario-packages/{id}

**端点**: `PUT /api/scenario-packages/{id}`

**描述**: PUT /api/scenario-packages/{id}

**来源规格**: 019-store-association

**成功响应**: TODO: 待定义响应格式

**错误响应**: TODO: 待定义错误响应

---


## 附录

### 处理的规格文件

- 001-claude-cleanup-script
- 001-menu-navigation
- 001-skill-doc-generator
- 001-ui-framework-upgrade
- 002-upgrade-ant6
- 003-inventory-management
- 004-spu-management
- 005-sku-management
- 006-frontend-structure-refactor
- 007-category-management
- 007-category-management-by-claude
- 008-env-preset-commands
- 009-brand-management
- 010-attribute-dict-management
- 011-uninstall-env-cleanup
- 012-set-config-enhancement
- 013-schedule-management
- 014-hall-store-backend
- 015-store-reservation-settings
- 017-scenario-package
- 018-hall-reserve-homepage
- 019-store-association
- 020-store-address
- claude-1-purchase-management

---

**生成说明**:
- 本文档由 generate_api_docs.py 自动生成
- 所有 API 响应格式遵循项目 API 标准（`.claude/rules/08-api-standards.md`）
- 标记为 `TODO: 待定义` 的端点需要在规格文档中补充详细信息
