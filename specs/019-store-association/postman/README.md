# 019-store-association Postman API 测试说明

## 功能概述

**功能名称**: 场景包门店关联配置 (Store Association for Scenario Packages)

**功能标识**: `019-store-association`

**功能描述**:
B端运营人员在创建或编辑场景包时，能够选择关联的门店（stores），实现场景包与门店的多对多关联关系。该功能扩展了现有的场景包管理模块（017-scenario-package），新增门店关联配置能力。

**核心能力**:
- 在场景包编辑页面展示可用门店列表
- 支持多选门店并保存关联关系
- 支持按门店名称/区域搜索过滤
- 编辑时自动回显已关联的门店
- 门店存在性和激活状态验证

---

## API 端点列表

### 门店相关 API

| 方法 | 端点 | 说明 | 来源模块 |
|------|------|------|----------|
| GET | `/api/stores` | 获取门店列表 | 014-hall-store-backend |
| GET | `/api/stores?status=active` | 获取活跃门店列表 | 014-hall-store-backend |

### 场景包相关 API

| 方法 | 端点 | 说明 | 来源模块 |
|------|------|------|----------|
| GET | `/api/scenario-packages` | 获取场景包列表 | 017-scenario-package |
| GET | `/api/scenario-packages/{id}` | 获取场景包详情（含 storeIds） | 017-scenario-package + **019扩展** |
| POST | `/api/scenario-packages` | 创建场景包（含 storeIds） | 017-scenario-package + **019扩展** |
| PUT | `/api/scenario-packages/{id}` | 更新场景包（含 storeIds） | 017-scenario-package + **019扩展** |
| DELETE | `/api/scenario-packages/{id}` | 删除场景包 | 017-scenario-package |

---

## API 请求/响应格式

### 1. GET /api/stores - 获取门店列表

**请求**:
```http
GET /api/stores HTTP/1.1
Accept: application/json
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-store-1",
      "code": "STORE001",
      "name": "北京朝阳店",
      "region": "北京",
      "status": "active"
    },
    {
      "id": "uuid-store-2",
      "code": "STORE002",
      "name": "上海浦东店",
      "region": "上海",
      "status": "active"
    }
  ],
  "total": 2
}
```

---

### 2. POST /api/scenario-packages - 创建场景包（含门店关联）

**请求**:
```http
POST /api/scenario-packages HTTP/1.1
Content-Type: application/json

{
  "name": "VIP 生日派对专场",
  "description": "专属生日派对场景包",
  "rule": {
    "durationHours": 2,
    "minPeople": 2,
    "maxPeople": 10
  },
  "storeIds": [
    "uuid-store-1",
    "uuid-store-2"
  ]
}
```

**响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid-package-1",
    "name": "VIP 生日派对专场",
    "status": "DRAFT",
    "version": 1,
    "versionLock": 0,
    "storeIds": ["uuid-store-1", "uuid-store-2"],
    "createdAt": "2025-12-21T12:00:00Z"
  }
}
```

**错误响应** (400 Bad Request - 未选择门店):
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "请至少选择一个关联门店"
}
```

---

### 3. GET /api/scenario-packages/{id} - 获取场景包详情

**请求**:
```http
GET /api/scenario-packages/uuid-package-1 HTTP/1.1
Accept: application/json
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-package-1",
    "name": "VIP 生日派对专场",
    "description": "专属生日派对场景包",
    "status": "DRAFT",
    "version": 1,
    "versionLock": 0,
    "rule": {
      "durationHours": 2,
      "minPeople": 2,
      "maxPeople": 10
    },
    "storeIds": [
      "uuid-store-1",
      "uuid-store-2"
    ],
    "hallTypes": [],
    "benefits": [],
    "items": [],
    "services": [],
    "createdAt": "2025-12-21T12:00:00Z",
    "updatedAt": "2025-12-21T12:00:00Z"
  }
}
```

---

### 4. PUT /api/scenario-packages/{id} - 更新场景包门店关联

**请求**:
```http
PUT /api/scenario-packages/uuid-package-1 HTTP/1.1
Content-Type: application/json

{
  "versionLock": 0,
  "name": "VIP 生日派对专场（已更新）",
  "storeIds": [
    "uuid-store-2",
    "uuid-store-3"
  ]
}
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-package-1",
    "name": "VIP 生日派对专场（已更新）",
    "versionLock": 1,
    "storeIds": ["uuid-store-2", "uuid-store-3"]
  }
}
```

**错误响应** (409 Conflict - 并发冲突):
```json
{
  "success": false,
  "error": "CONCURRENT_MODIFICATION",
  "message": "数据已被其他用户修改，请刷新后重试"
}
```

---

## Postman 测试集合说明

### 文件结构

```
specs/019-store-association/postman/
├── 019-store-association.postman_collection.json  # API 测试集合
├── 019-local.postman_environment.json             # 本地环境配置
└── README.md                                       # 本说明文档
```

### 测试用例列表

| # | 文件夹 | 请求名称 | 测试内容 |
|---|--------|----------|----------|
| 1 | Setup | Get Stores List (Setup) | 获取门店列表，验证返回格式，保存 storeId 变量 |
| 2 | Scenario Package CRUD | Create Package with Store Association | 创建带门店关联的场景包，验证 201 状态码 |
| 3 | Scenario Package CRUD | Get Package Detail (Verify storeIds) | 获取场景包详情，验证 storeIds 字段存在 |
| 4 | Scenario Package CRUD | Update Package Store Association | 更新门店关联，验证乐观锁机制 |
| 5 | Scenario Package CRUD | Verify Updated Store Association | 验证更新后的门店关联正确 |
| 6 | Validation Tests | Create Package without storeIds | 验证空 storeIds 返回 400 错误 |
| 7 | Cleanup | Delete Test Package | 删除测试数据，清理环境变量 |

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `baseUrl` | `http://localhost:8080` | API 服务器地址 |
| `apiPrefix` | `/api` | API 路径前缀 |
| `storeId1` | (自动填充) | 第一个门店 ID |
| `storeId2` | (自动填充) | 第二个门店 ID |
| `testPackageId` | (自动填充) | 测试创建的场景包 ID |
| `testPackageVersionLock` | (自动填充) | 乐观锁版本号 |

---

## 使用指南

### 方式一：Postman GUI

1. **导入文件**:
   - 打开 Postman
   - 点击 Import → 选择 `019-store-association.postman_collection.json`
   - 点击 Import → 选择 `019-local.postman_environment.json`

2. **选择环境**:
   - 右上角环境下拉框选择 "019-store-association Local"

3. **运行测试**:
   - 点击 Collection 旁的 "..." → "Run collection"
   - 或逐个点击请求的 "Send" 按钮

### 方式二：Newman CLI

```bash
# 安装 Newman
npm install -g newman

# 运行测试集合
newman run specs/019-store-association/postman/019-store-association.postman_collection.json \
  -e specs/019-store-association/postman/019-local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json

# 查看详细输出
newman run specs/019-store-association/postman/019-store-association.postman_collection.json \
  -e specs/019-store-association/postman/019-local.postman_environment.json \
  --verbose
```

### 方式三：CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Run Postman Tests
  run: |
    npm install -g newman
    newman run specs/019-store-association/postman/019-store-association.postman_collection.json \
      -e specs/019-store-association/postman/019-local.postman_environment.json \
      --reporters cli,junit \
      --reporter-junit-export results.xml
```

---

## 测试验证点

### 功能验证

| 验证项 | 预期结果 | 对应请求 |
|--------|----------|----------|
| 门店列表获取 | 返回 data 数组，包含 id/name/status | Get Stores List |
| 创建场景包含门店 | 201 Created，返回 storeIds | Create Package |
| 场景包详情含 storeIds | storeIds 数组包含关联门店 | Get Package Detail |
| 更新门店关联 | 200 OK，storeIds 更新成功 | Update Package |
| 空门店列表验证 | 400 Bad Request | Create Without storeIds |

### 性能验证

- 所有请求响应时间 < 2000ms（全局 Tests 脚本验证）

### 数据清理

- 测试结束后自动删除创建的测试场景包
- 自动清理环境变量

---

## 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 功能规格 | `specs/019-store-association/spec.md` | 完整功能规格说明 |
| 实现计划 | `specs/019-store-association/plan.md` | 技术实现计划 |
| 任务清单 | `specs/019-store-association/tasks.md` | 开发任务分解 |
| API 契约 | `specs/019-store-association/contracts/api.yaml` | OpenAPI 规范（如有） |
| 项目宪法 | `.specify/memory/constitution.md` | API 测试规范 (v1.5.0) |

---

## 版本信息

| 项目 | 值 |
|------|------|
| 功能标识 | 019-store-association |
| Collection 版本 | 1.0.0 |
| 创建日期 | 2025-12-21 |
| 宪法版本 | 1.5.0 |
| 作者 | Cinema Platform |
