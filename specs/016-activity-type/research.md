# Research: 活动类型管理

**Feature**: 016-activity-type  
**Date**: 2025-12-18

## Technical Decisions

### 1. 数据模型设计

**Decision**: 使用简单的单表结构 `activity_types`，包含基本字段和状态字段（启用/停用/已删除）

**Rationale**: 
- 活动类型是简单的字典数据，不需要复杂的层级关系或分类
- 单表结构简单高效，符合功能需求
- 状态字段（status）使用枚举类型，支持启用/停用/已删除三种状态
- 软删除通过状态字段实现，数据保留在数据库中

**Alternatives considered**:
- 使用独立的 `deleted_at` 字段进行软删除：更符合传统软删除模式，但当前需求中状态字段已足够
- 使用分类表关联：功能需求中明确说明不需要分类或层级管理

**Implementation**:
- 数据库表：`activity_types`
- 状态枚举：`ENABLED`, `DISABLED`, `DELETED`
- 软删除：通过 `status = 'DELETED'` 实现，查询时过滤已删除记录

### 2. API 设计模式

**Decision**: 使用标准 RESTful API 设计，遵循项目的 API 响应格式标准化规范

**Rationale**:
- 与现有项目模式保持一致（参考 `015-store-reservation-settings`）
- 使用统一的 `ApiResponse<T>` 包装响应
- 列表查询接口返回 `{ success, data, total }` 格式
- 遵循 RESTful 资源命名规范

**Alternatives considered**:
- GraphQL：项目当前使用 RESTful API，保持一致性
- 嵌套资源模式（如 `/api/stores/{id}/activity-types`）：活动类型是独立资源，不需要嵌套

**Implementation**:
- 基础路径：`/api/activity-types`
- GET `/api/activity-types` - 获取列表（运营后台，包含启用和停用）
- GET `/api/activity-types/enabled` - 获取启用列表（小程序端）
- GET `/api/activity-types/{id}` - 获取单个活动类型
- POST `/api/activity-types` - 创建活动类型
- PUT `/api/activity-types/{id}` - 更新活动类型
- DELETE `/api/activity-types/{id}` - 软删除活动类型
- PATCH `/api/activity-types/{id}/status` - 启用/停用活动类型

### 3. 数据验证策略

**Decision**: 前后端双重验证，前端使用 Zod，后端使用 Jakarta Bean Validation

**Rationale**:
- 前端验证提供即时反馈，提升用户体验
- 后端验证确保数据安全，防止恶意请求
- 名称唯一性验证在数据库层面通过唯一约束保证
- 必填字段验证在前后端都进行

**Alternatives considered**:
- 仅后端验证：缺少即时反馈，用户体验较差
- 仅前端验证：安全性不足，无法防止绕过前端的恶意请求

**Implementation**:
- 前端：Zod schema 验证名称、描述、排序号
- 后端：Jakarta Bean Validation (@NotNull, @NotBlank, @Size, @Min, @Max)
- 数据库：唯一约束（name），非空约束（name, status, sort）

### 4. 权限控制策略

**Decision**: 在 Controller 层进行权限检查，使用 Spring Security 或自定义权限注解

**Rationale**:
- 权限控制是业务需求的核心（FR-003）
- Controller 层检查可以统一处理，避免在每个 Service 方法中重复
- 与现有项目权限控制模式保持一致

**Alternatives considered**:
- Service 层权限检查：Controller 层检查更早拦截，减少不必要的业务逻辑执行
- 数据库层面权限控制（RLS）：项目使用 Supabase，可以考虑，但业务逻辑层面的权限控制更灵活

**Implementation**:
- 使用 `@PreAuthorize` 或自定义权限注解
- 权限角色：`ROLE_ADMIN`, `ROLE_OPERATOR`（运营人员）
- 小程序端查询接口无需权限检查（公开接口）

### 5. 前端页面架构

**Decision**: 使用 Atomic Design 原则，创建独立的页面组件和可复用组件

**Rationale**:
- 遵循项目组件化架构原则
- 活动类型管理是独立功能模块，应该有独立的页面
- 组件可复用性高，便于维护和测试

**Alternatives considered**:
- 集成到现有页面：活动类型管理是独立功能，应该有独立页面
- 使用通用CRUD组件：需要定制化（启用/停用、软删除），使用专门组件更合适

**Implementation**:
- 页面：`ActivityTypePage` (organisms)
- 表格：`ActivityTypeTable` (organisms)
- 表单：`ActivityTypeForm` (molecules)
- 状态开关：`ActivityTypeStatusSwitch` (molecules)
- 使用 Ant Design Table, Form, Modal 等组件

### 6. 状态管理策略

**Decision**: 使用 TanStack Query 管理服务器状态，Zustand 管理本地UI状态

**Rationale**:
- 遵循项目数据驱动状态管理原则
- TanStack Query 提供缓存、重试、后台刷新等特性
- Zustand 管理模态框显示/隐藏、选中项等本地状态
- 与现有功能（如门店预约设置）保持一致

**Alternatives considered**:
- 仅使用 TanStack Query：本地UI状态（如模态框）不适合用 TanStack Query 管理
- 仅使用 Zustand：服务器状态管理功能不如 TanStack Query 完善

**Implementation**:
- TanStack Query: `useActivityTypesQuery`, `useCreateActivityType`, `useUpdateActivityType`, `useDeleteActivityType`, `useToggleActivityTypeStatus`
- Zustand: `activityTypeStore` (管理模态框状态、选中项等)

### 7. 软删除实现策略

**Decision**: 通过 `status` 字段实现软删除，查询时过滤 `status != 'DELETED'`

**Rationale**:
- 符合规格说明中的决策（选项C）
- 数据保留在数据库中，历史预约记录可以正常关联
- 实现简单，不需要额外的 `deleted_at` 字段（虽然规格中有提到，但可以通过 `updated_at` 记录删除时间）
- 查询时统一过滤已删除记录

**Alternatives considered**:
- 物理删除：会丢失历史数据，不符合需求
- 使用 `deleted_at` 字段：更传统，但当前需求中状态字段已足够

**Implementation**:
- 删除操作：将 `status` 更新为 `'DELETED'`，记录 `updated_at`
- 查询过滤：所有列表查询自动过滤 `status != 'DELETED'`
- 历史记录：通过 ID 关联，即使状态为已删除，仍可查询到完整信息

### 8. 排序策略

**Decision**: 使用 `sort` 字段控制显示顺序，支持手动设置，查询时按 `sort ASC, created_at ASC` 排序

**Rationale**:
- 符合规格说明要求（FR-013）
- 运营人员可以手动控制显示顺序
- 排序号相同时按创建时间排序，保证顺序一致性

**Alternatives considered**:
- 自动生成排序号：规格说明中明确要求手动设置
- 仅按创建时间排序：无法满足运营人员自定义顺序的需求

**Implementation**:
- 数据库查询：`ORDER BY sort ASC, created_at ASC`
- 前端显示：按相同规则排序
- 排序号验证：允许重复，但建议唯一以便精确控制顺序

## Best Practices Applied

1. **API 响应格式标准化**: 所有接口遵循统一的 `ApiResponse<T>` 格式
2. **错误处理**: 使用 `GlobalExceptionHandler` 统一处理异常
3. **日志记录**: 关键操作（创建、更新、删除、状态切换）记录日志
4. **测试覆盖**: 单元测试覆盖 Service 层，集成测试覆盖 Controller 层
5. **类型安全**: 前后端都使用强类型（TypeScript + Java）
6. **数据验证**: 前后端双重验证，确保数据完整性

## Integration Points

1. **小程序端预约功能**: 小程序端需要调用 `GET /api/activity-types/enabled` 获取启用状态的活动类型列表
2. **权限系统**: 需要与现有的用户认证和权限管理系统集成
3. **预约记录关联**: 预约记录通过 `activity_type_id` 关联活动类型，即使活动类型被删除，历史记录仍可正常显示

## Performance Considerations

1. **列表查询优化**: 使用数据库索引（name, status, sort），支持快速查询
2. **缓存策略**: TanStack Query 自动缓存，减少重复请求
3. **分页支持**: 虽然当前需求是50个以内，但预留分页接口以便未来扩展
4. **响应时间**: 列表查询响应时间<1秒（SC-003要求）

## Security Considerations

1. **权限控制**: 仅运营人员和管理员可以维护活动类型
2. **输入验证**: 前后端双重验证，防止恶意输入
3. **SQL注入防护**: 使用 Supabase REST API，自动防护SQL注入
4. **XSS防护**: 前端使用 React 自动转义，后端验证输入内容




