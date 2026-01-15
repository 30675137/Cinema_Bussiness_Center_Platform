# Research: 门店预约设置

**Feature**: 015-store-reservation-settings  
**Date**: 2025-12-17  
**Purpose**: 技术决策和实现模式研究

## Decision 1: 数据模型设计 - 门店预约设置表结构

**Decision**: 在 Supabase 中创建独立的 `store_reservation_settings` 表，与 `stores` 表建立一对一关系（通过 `store_id` 外键）。

**Rationale**:
- 预约设置是门店的扩展属性，独立表设计更灵活，便于未来扩展（如添加更多预约相关配置）
- 一对一关系通过 `store_id` 唯一约束保证，确保每个门店只有一个预约设置记录
- 与现有门店表解耦，不影响门店主数据查询性能
- 支持预约设置的独立生命周期管理（如软删除、审计日志）

**Alternatives Considered**:
- **方案A**: 在 `stores` 表中直接添加 `is_reservation_enabled` 和 `max_reservation_days` 字段
  - 优点：简单直接，查询性能好
  - 缺点：门店表字段过多，扩展性差，不符合单一职责原则
- **方案B**: 使用 JSONB 字段存储预约设置
  - 优点：灵活，可存储任意结构
  - 缺点：查询和验证困难，类型安全性差

**Implementation Pattern**:
```sql
CREATE TABLE store_reservation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  is_reservation_enabled BOOLEAN NOT NULL DEFAULT false,
  max_reservation_days INTEGER NOT NULL DEFAULT 0 CHECK (max_reservation_days >= 0 AND max_reservation_days <= 365),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) -- 如果支持用户追踪
);
```

## Decision 2: API 设计模式 - RESTful 资源嵌套

**Decision**: 使用嵌套资源模式，预约设置作为门店的子资源：
- `GET /api/stores/{storeId}/reservation-settings` - 获取门店预约设置
- `PUT /api/stores/{storeId}/reservation-settings` - 更新门店预约设置
- `PUT /api/stores/reservation-settings/batch` - 批量更新预约设置

**Rationale**:
- 符合 RESTful 设计原则，预约设置是门店的附属资源
- 语义清晰，URL 结构直观表达资源关系
- 便于权限控制（基于门店ID）
- 批量更新使用独立端点，避免 URL 过长

**Alternatives Considered**:
- **方案A**: 使用 `/api/reservation-settings?storeId={storeId}` 查询参数模式
  - 优点：扁平化结构
  - 缺点：语义不够清晰，不符合 RESTful 嵌套资源模式
- **方案B**: 使用 `/api/reservation-settings/{id}` 直接访问
  - 优点：直接访问
  - 缺点：需要先知道预约设置的ID，不符合业务场景

**Implementation Pattern**:
```java
@RestController
@RequestMapping("/api/stores/{storeId}/reservation-settings")
public class StoreReservationSettingsController {
    @GetMapping
    public ResponseEntity<ApiResponse<StoreReservationSettingsDTO>> getSettings(@PathVariable UUID storeId) { ... }
    
    @PutMapping
    public ResponseEntity<ApiResponse<StoreReservationSettingsDTO>> updateSettings(
        @PathVariable UUID storeId,
        @RequestBody @Valid UpdateStoreReservationSettingsRequest request
    ) { ... }
}
```

## Decision 3: 数据验证策略 - 前后端统一验证

**Decision**: 前后端都进行数据验证，确保数据一致性：
- 前端：使用 Zod schema 验证表单输入（可预约天数范围 1-365）
- 后端：使用 Bean Validation（`@Min(1) @Max(365)`）验证请求体

**Rationale**:
- 前端验证提供即时反馈，提升用户体验
- 后端验证确保数据安全，防止恶意请求
- 前后端验证规则必须一致，避免数据不一致
- 符合"防御性编程"原则

**Validation Rules**:
- `isReservationEnabled`: 布尔值，必填
- `maxReservationDays`: 整数，范围 1-365，当 `isReservationEnabled=true` 时必填且 > 0

**Implementation Pattern**:
```typescript
// Frontend: Zod schema
const reservationSettingsSchema = z.object({
  isReservationEnabled: z.boolean(),
  maxReservationDays: z.number().int().min(1).max(365).optional(),
}).refine(data => {
  if (data.isReservationEnabled && (!data.maxReservationDays || data.maxReservationDays <= 0)) {
    return false;
  }
  return true;
}, { message: "开启预约时必须设置可预约天数" });
```

```java
// Backend: Bean Validation
public class UpdateStoreReservationSettingsRequest {
    @NotNull
    private Boolean isReservationEnabled;
    
    @Min(1)
    @Max(365)
    private Integer maxReservationDays;
    
    // Custom validator: if enabled, maxReservationDays must be > 0
}
```

## Decision 4: 前端页面架构 - 复用门店管理组件

**Decision**: 创建独立的"门店预约设置"页面，但复用现有门店管理页面的组件（StoreTable、StoreSearch、StatusFilter），新增预约设置相关的编辑组件。

**Rationale**:
- 保持代码一致性，降低维护成本
- 复用已验证的组件，减少开发时间
- 独立页面便于权限控制和路由管理
- 新增组件专注于预约设置编辑功能

**Component Structure**:
- 复用：`StoreTable`（显示门店列表）、`StoreSearch`（搜索门店）、`StatusFilter`（筛选状态）
- 新增：`ReservationSettingsForm`（编辑表单）、`ReservationSettingsTable`（显示预约设置列）、`BatchReservationSettingsModal`（批量设置弹窗）

**Implementation Pattern**:
```typescript
// pages/store-reservation-settings/index.tsx
import StoreTable from '../stores/components/StoreTable';
import StoreSearch from '../stores/components/StoreSearch';
import { ReservationSettingsTable } from './components/ReservationSettingsTable';
import { BatchReservationSettingsModal } from './components/BatchReservationSettingsModal';
```

## Decision 5: 批量操作策略 - 部分成功处理

**Decision**: 批量更新预约设置时，如果部分门店更新失败，采用"部分成功"策略：
- 成功更新的门店返回成功状态
- 失败的门店返回错误信息（包含门店ID和错误原因）
- 前端显示批量操作结果摘要（成功X个，失败Y个）

**Rationale**:
- 提高用户体验，避免因单个门店失败导致全部回滚
- 运营人员可以针对失败的门店单独处理
- 符合实际业务场景（部分门店可能因状态、权限等原因无法更新）

**Alternatives Considered**:
- **方案A**: 全部成功或全部失败（事务回滚）
  - 优点：数据一致性保证
  - 缺点：用户体验差，一个失败导致全部失败
- **方案B**: 静默失败，只返回成功数量
  - 优点：简单
  - 缺点：无法知道哪些门店失败，难以排查问题

**Implementation Pattern**:
```java
@PutMapping("/batch")
public ResponseEntity<ApiResponse<BatchUpdateResult>> batchUpdate(
    @RequestBody @Valid BatchUpdateStoreReservationSettingsRequest request
) {
    BatchUpdateResult result = service.batchUpdate(request);
    // result contains: successCount, failureCount, failures: List<{storeId, error}>
    return ResponseEntity.ok(ApiResponse.success(result));
}
```

## Decision 6: 默认值策略 - 新建门店时自动创建预约设置

**Decision**: 当新建门店时，自动创建对应的预约设置记录，使用系统默认值（`isReservationEnabled=false`, `maxReservationDays=0`）。

**Rationale**:
- 确保每个门店都有预约设置，避免前端查询时出现 null
- 简化前端逻辑，无需处理"未设置"状态
- 符合"约定优于配置"原则

**Implementation Pattern**:
- 方案A（推荐）：在门店创建时通过数据库触发器自动创建
- 方案B：在门店 Service 层创建门店后自动创建预约设置
- 方案C：前端查询时，如果不存在则使用默认值（不推荐，数据不一致）

**Chosen**: 方案B - 在门店 Service 层处理，便于控制和测试。

## Decision 7: API 响应格式 - 遵循统一规范

**Decision**: 所有预约设置相关 API 必须遵循项目统一的 API 响应格式规范（见宪章 1.3.0）：
- 单个资源：`ApiResponse<T>` 格式 `{ data: T, timestamp: string }`
- 列表查询：`{ success: boolean, data: T[], total: number, message?: string, code?: number }`
- 错误响应：`{ success: false, error: string, message: string, details?: object }`

**Rationale**:
- 确保前后端集成一致性
- 符合项目宪章要求
- 便于前端统一处理响应

**Implementation Pattern**:
```java
// 单个资源
return ResponseEntity.ok(ApiResponse.success(settingsDTO));

// 列表查询（如果需要）
return ResponseEntity.ok(Map.of(
    "success", true,
    "data", settingsList,
    "total", settingsList.size()
));

// 错误响应
return ResponseEntity.badRequest()
    .body(ApiResponse.failure("VALIDATION_ERROR", "可预约天数必须在1-365之间", validationErrors));
```

## Summary

所有技术决策已明确，无需要进一步澄清的问题。实施将遵循：
1. Supabase 独立表设计（一对一关系）
2. RESTful 嵌套资源 API 模式
3. 前后端统一数据验证
4. 复用现有组件 + 新增专用组件
5. 批量操作部分成功策略
6. 新建门店时自动创建预约设置
7. 遵循统一 API 响应格式规范

