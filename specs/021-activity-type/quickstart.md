# Quickstart: 活动类型管理

**Feature**: 016-activity-type  
**Date**: 2025-12-18

## 概述

活动类型管理功能允许运营人员在后台配置预约活动类型（如"企业团建"、"订婚"、"生日Party"等），小程序端用户在预约时可以选择这些类型。功能包括活动类型的CRUD操作、启用/停用控制、软删除支持，以及权限控制。

## 环境设置

### 后端环境

1. **数据库表创建**: 在 Supabase 中执行 `backend/src/main/resources/db/schema.sql` 中的 `activity_types` 表定义
2. **环境变量**: 确保 `application.yml` 中配置了 Supabase 连接信息
3. **启动后端**: `cd backend && ./mvnw spring-boot:run`

### 前端环境

1. **安装依赖**: `cd frontend && npm install`
2. **启动开发服务器**: `npm run dev`
3. **Mock 数据**: MSW handlers 已配置，开发时自动使用 mock 数据

## 开发指南

### 后端开发

#### 1. 创建领域实体

创建 `ActivityType` 实体和 `ActivityTypeStatus` 枚举：

```java
// domain/ActivityType.java
// domain/enums/ActivityTypeStatus.java
```

#### 2. 创建 Repository

创建 `ActivityTypeRepository`，使用 WebClient 调用 Supabase REST API：

```java
// repository/ActivityTypeRepository.java
// 参考 StoreReservationSettingsRepository 的实现模式
```

#### 3. 创建 Service

创建 `ActivityTypeService`，实现业务逻辑：

```java
// service/ActivityTypeService.java
// - getActivityTypes(status): 获取列表（运营后台）
// - getEnabledActivityTypes(): 获取启用列表（小程序端）
// - getActivityType(id): 获取单个活动类型
// - createActivityType(request): 创建活动类型
// - updateActivityType(id, request): 更新活动类型
// - deleteActivityType(id): 软删除活动类型
// - toggleStatus(id, status): 启用/停用活动类型
```

#### 4. 创建 Controller

创建 `ActivityTypeController`，提供 REST API：

```java
// controller/ActivityTypeController.java
// - GET /api/activity-types
// - GET /api/activity-types/enabled
// - GET /api/activity-types/{id}
// - POST /api/activity-types
// - PUT /api/activity-types/{id}
// - DELETE /api/activity-types/{id}
// - PATCH /api/activity-types/{id}/status
```

#### 5. 权限控制

在 Controller 方法上添加权限注解：

```java
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OPERATOR')")
```

小程序端查询接口（`/api/activity-types/enabled`）无需权限检查。

### 前端开发

#### 1. 创建类型定义

创建 `activity-type.types.ts` 和 `activity-type.schema.ts`：

```typescript
// types/activity-type.types.ts
// types/activity-type.schema.ts
```

#### 2. 创建 API 服务

创建 `activityTypeService.ts`：

```typescript
// services/activityTypeService.ts
// - getActivityTypes(params)
// - getEnabledActivityTypes()
// - getActivityType(id)
// - createActivityType(payload)
// - updateActivityType(id, payload)
// - deleteActivityType(id)
// - toggleStatus(id, status)
```

#### 3. 创建 TanStack Query Hooks

创建 `useActivityTypesQuery.ts`：

```typescript
// hooks/useActivityTypesQuery.ts
// - useActivityTypesQuery(status)
// - useEnabledActivityTypesQuery()
// - useActivityTypeQuery(id)
// - useCreateActivityType()
// - useUpdateActivityType()
// - useDeleteActivityType()
// - useToggleActivityTypeStatus()
```

#### 4. 创建组件

按照 Atomic Design 原则创建组件：

- **Atoms**: 使用 Ant Design 基础组件
- **Molecules**: `ActivityTypeForm`, `ActivityTypeStatusSwitch`
- **Organisms**: `ActivityTypeTable`
- **Pages**: `ActivityTypePage`

#### 5. 创建页面

创建 `activity-types/index.tsx`，集成所有组件：

```typescript
// pages/activity-types/index.tsx
// - 使用 ActivityTypeTable 显示列表
// - 使用 ActivityTypeForm 进行新建/编辑
// - 使用 ActivityTypeStatusSwitch 进行启用/停用
// - 处理删除确认提示
```

#### 6. 添加路由

在 `Router.tsx` 中添加路由：

```typescript
<Route path="/activity-types" element={<ActivityTypePage />} />
```

#### 7. 添加菜单项

在 `AppLayout.tsx` 中添加菜单项：

```typescript
{
  key: 'activity-types',
  label: '活动类型管理',
  icon: <TagOutlined />,
}
```

## API 使用示例

### 运营后台 - 获取活动类型列表

```bash
GET /api/activity-types?status=ENABLED
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "企业团建",
      "description": "企业团队建设活动",
      "status": "ENABLED",
      "sort": 1,
      "createdAt": "2025-12-18T10:00:00Z",
      "updatedAt": "2025-12-18T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 小程序端 - 获取启用状态的活动类型列表

```bash
GET /api/activity-types/enabled

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "企业团建",
      "description": "企业团队建设活动",
      "status": "ENABLED",
      "sort": 1
    }
  ],
  "total": 1
}
```

### 创建活动类型

```bash
POST /api/activity-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "生日Party",
  "description": "生日聚会活动",
  "sort": 2
}

Response:
{
  "data": {
    "id": "uuid",
    "name": "生日Party",
    "description": "生日聚会活动",
    "status": "ENABLED",
    "sort": 2,
    "createdAt": "2025-12-18T10:00:00Z",
    "updatedAt": "2025-12-18T10:00:00Z"
  },
  "timestamp": "2025-12-18T10:00:00Z"
}
```

### 启用/停用活动类型

```bash
PATCH /api/activity-types/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "DISABLED"
}

Response:
{
  "data": {
    "id": "uuid",
    "name": "企业团建",
    "status": "DISABLED",
    ...
  },
  "timestamp": "2025-12-18T10:00:00Z"
}
```

## 测试

### 后端测试

1. **单元测试**: `ActivityTypeServiceTest.java`
   - 测试 CRUD 操作
   - 测试状态切换
   - 测试名称唯一性验证
   - 测试软删除

2. **集成测试**: `ActivityTypeControllerTest.java`
   - 测试所有 API 端点
   - 测试权限控制
   - 测试错误处理

### 前端测试

1. **单元测试**: `activity-type.schema.test.ts`
   - 测试 Zod schema 验证

2. **E2E 测试**: `activity-types.spec.ts`
   - 测试活动类型管理完整流程
   - 测试启用/停用功能
   - 测试删除功能

## 注意事项

1. **API 响应格式**: 所有接口必须遵循统一的 API 响应格式（`ApiResponse<T>` 或 `ActivityTypeListResponse`）
2. **权限控制**: 运营后台接口需要权限验证，小程序端查询接口无需权限
3. **软删除**: 删除操作采用软删除，数据保留在数据库中，历史预约记录仍可正常关联
4. **状态过滤**: 运营后台列表显示启用和停用状态，小程序端仅显示启用状态
5. **名称唯一性**: 在非已删除状态下，活动类型名称必须唯一
6. **排序**: 列表按 `sort ASC, created_at ASC` 排序

## 常见问题排查

### 问题：活动类型名称重复错误

**原因**: 名称唯一性验证失败

**解决**: 检查是否已存在相同名称的活动类型（非已删除状态），或修改名称

### 问题：小程序端无法获取活动类型列表

**原因**: 
1. 后端接口未正确实现
2. 状态过滤逻辑错误
3. 网络请求失败

**解决**: 
1. 检查后端日志
2. 验证 `/api/activity-types/enabled` 接口返回的数据
3. 检查前端网络请求和错误处理

### 问题：权限控制不生效

**原因**: 
1. 权限注解未正确配置
2. Spring Security 配置问题
3. Token 无效或过期

**解决**: 
1. 检查 Controller 方法上的权限注解
2. 验证 Spring Security 配置
3. 检查 Token 有效性

## 下一步

完成开发后，可以：
1. 运行所有测试确保功能正常
2. 进行代码审查
3. 更新 API 文档
4. 部署到测试环境进行验证

