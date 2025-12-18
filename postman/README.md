# Cinema Hall & Store API - Postman Collection

影厅资源后端建模 API 的 Postman 测试集合文档

## 文件说明

- `Cinema_Hall_Store_API.postman_collection.json` - API 接口集合（Collection）
- `Cinema_Hall_Store_Dev.postman_environment.json` - 开发环境变量（Environment）

## 导入到 Postman

### 方法 1: 通过 Postman 应用导入

1. 打开 Postman 应用
2. 点击左上角 **Import** 按钮
3. 选择 **File** 选项卡
4. 拖拽或选择以下文件：
   - `Cinema_Hall_Store_API.postman_collection.json`
   - `Cinema_Hall_Store_Dev.postman_environment.json`
5. 点击 **Import** 完成导入

### 方法 2: 使用 Postman CLI

```bash
# 安装 Postman CLI (如果未安装)
npm install -g postman

# 运行 Collection
postman collection run Cinema_Hall_Store_API.postman_collection.json \
  --environment Cinema_Hall_Store_Dev.postman_environment.json
```

## 环境配置

导入后，在 Postman 右上角选择 **Cinema Hall Store - Development** 环境。

### 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `base_url` | `http://localhost:8080` | 后端服务器地址 |
| `store_id` | `11111111-1111-1111-1111-111111111111` | 默认门店 ID（北京朝阳店） |
| `hall_id` | `569cdeae-5c28-4a4d-82e6-92eba281c2f9` | 默认影厅 ID（VIP豪华厅A） |
| `store_id_shanghai` | `22222222-2222-2222-2222-222222222222` | 上海浦东店 ID |
| `store_id_shenzhen` | `33333333-3333-3333-3333-333333333333` | 深圳南山店 ID（已停业） |
| `hall_id_cp` | `ea5fbdee-8050-48d5-9a3b-e54d7402216a` | 情侣专属厅B ID |
| `hall_id_party` | `05c96e5b-6bed-4cd8-a677-e8ee0b836225` | 派对狂欢厅C ID |

### 修改环境变量

如需修改环境变量（例如切换到生产环境）：

1. 点击 Postman 右上角的 **环境下拉菜单**
2. 选择 **Manage Environments**
3. 选择对应的环境进行编辑
4. 修改 `base_url` 为生产环境地址

## API 接口分组

### 1. Store APIs（门店查询接口）

| 接口名称 | 方法 | 路径 | 说明 |
|---------|------|------|------|
| Get All Stores | GET | `/api/stores` | 查询所有门店 |
| Get Stores By Status | GET | `/api/stores?status=active` | 按状态筛选门店 |
| Get Store By ID | GET | `/api/stores/{storeId}` | 查询门店详情 |

**门店状态（status）:**
- `active` - 营业中
- `inactive` - 已停业

### 2. Hall Query APIs（影厅查询接口）

| 接口名称 | 方法 | 路径 | 说明 |
|---------|------|------|------|
| Get Halls By Store | GET | `/api/stores/{storeId}/halls` | 查询门店所有影厅 |
| Get Halls By Store With Filters | GET | `/api/stores/{storeId}/halls?status=active&type=VIP` | 按条件筛选影厅 |

**影厅状态（status）:**
- `active` - 可用
- `inactive` - 停用
- `maintenance` - 维护中

**影厅类型（type）:**
- `VIP` - VIP厅
- `PUBLIC` - 普通厅
- `CP` - 情侣厅
- `PARTY` - 派对厅

### 3. Hall Admin APIs（影厅管理接口）

| 接口名称 | 方法 | 路径 | 说明 |
|---------|------|------|------|
| Create Hall | POST | `/api/admin/halls` | 创建新影厅 |
| Update Hall | PUT | `/api/admin/halls/{hallId}` | 更新影厅信息 |
| Get Hall By ID | GET | `/api/admin/halls/{hallId}` | 查询影厅详情 |

## 使用示例

### 查询门店列表

1. 选择 **Store APIs** → **Get All Stores**
2. 点击 **Send**
3. 查看响应：

```json
{
  "success": true,
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "code": "STORE-001",
      "name": "北京朝阳店",
      "address": "北京朝阳区",
      "status": "active"
    }
  ]
}
```

### 查询指定门店的影厅列表

1. 选择 **Hall Query APIs** → **Get Halls By Store**
2. 确认 URL 中的 `{{store_id}}` 已替换为环境变量
3. 点击 **Send**
4. 查看响应：包含该门店所有影厅信息

### 创建新影厅

1. 选择 **Hall Admin APIs** → **Create Hall**
2. 在 **Body** 选项卡中查看/修改请求体：

```json
{
  "storeId": "11111111-1111-1111-1111-111111111111",
  "code": "HALL-E01",
  "name": "IMAX巨幕厅",
  "type": "VIP",
  "capacity": 200,
  "tags": ["IMAX屏幕", "杜比全景声", "真皮座椅"],
  "status": "active"
}
```

3. 点击 **Send**
4. 查看响应：返回创建的影厅信息

## 测试数据说明

当前数据库中已有的测试数据：

### 门店数据

| ID | 编码 | 名称 | 状态 |
|----|------|------|------|
| `11111111-1111-1111-1111-111111111111` | STORE-001 | 北京朝阳店 | active |
| `22222222-2222-2222-2222-222222222222` | STORE-002 | 上海浦东店 | active |
| `33333333-3333-3333-3333-333333333333` | STORE-003 | 深圳南山店 | inactive |

### 影厅数据（北京朝阳店）

| ID | 编码 | 名称 | 类型 | 容量 | 状态 |
|----|------|------|------|------|------|
| `569cdeae-5c28-4a4d-82e6-92eba281c2f9` | HALL-A01 | VIP豪华厅A | VIP | 80 | active |
| `ea5fbdee-8050-48d5-9a3b-e54d7402216a` | HALL-B01 | 情侣专属厅B | CP | 40 | active |
| `05c96e5b-6bed-4cd8-a677-e8ee0b836225` | HALL-C01 | 派对狂欢厅C | PARTY | 60 | active |

## 前置条件

在使用 Postman 测试前，请确保：

1. ✅ 后端服务已启动（默认端口 8080）
2. ✅ Supabase 数据库已配置并运行
3. ✅ 测试数据已导入数据库
4. ✅ 环境变量 `base_url` 指向正确的服务器地址

### 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

### 验证服务是否启动

```bash
curl http://localhost:8080/api/stores
```

## 常见问题

### Q1: 请求返回 404 Not Found

**原因**: 后端服务未启动或路径错误

**解决方案**:
1. 检查后端服务是否运行：`curl http://localhost:8080/api/stores`
2. 确认 Postman 环境中的 `base_url` 配置正确

### Q2: 请求返回 500 Internal Server Error

**原因**: Supabase 数据库连接失败

**解决方案**:
1. 检查 `application.yml` 中的 Supabase 配置
2. 确认环境变量 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 已设置

### Q3: 查询影厅时返回空数组

**原因**: 测试数据未导入或门店 ID 不存在

**解决方案**:
1. 执行 `/backend/src/main/resources/db/schema.sql`
2. 执行 `/backend/src/main/resources/db/test-data.sql`
3. 使用环境变量中提供的有效门店 ID

## 相关文档

- [快速开始指南](../specs/014-hall-store-backend/quickstart.md)
- [API 接口文档](../specs/014-hall-store-backend/api-spec.md)
- [数据库表结构](../backend/src/main/resources/db/schema.sql)

## 更新日志

### 2025-12-17
- ✅ 初始版本发布
- ✅ 包含 Store APIs（3个接口）
- ✅ 包含 Hall Query APIs（2个接口）
- ✅ 包含 Hall Admin APIs（3个接口）
- ✅ 使用真实的测试数据 ID
- ✅ 提供开发环境配置文件
