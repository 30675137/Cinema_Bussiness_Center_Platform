# Quickstart: 门店预约设置

**Feature**: 015-store-reservation-settings  
**Date**: 2025-12-17

## 功能概述

门店预约设置功能允许运营人员为每个门店独立配置预约相关设置：
- **是否开放预约**: 控制门店是否允许预约
- **可预约天数**: 设置允许预约未来多少天（1-365天）

## 技术栈

- **前端**: React 19.2.0 + TypeScript 5.9.3 + Ant Design 6.1.0 + TanStack Query 5.90.12
- **后端**: Spring Boot 3.3.5 + Java 21 + Supabase PostgreSQL
- **测试**: Vitest (前端单元测试) + Playwright (E2E测试) + JUnit 5 (后端测试)

## 环境准备

### 1. 数据库设置

在 Supabase 中执行以下 SQL 创建 `store_reservation_settings` 表：

```sql
-- 见 data-model.md 中的完整 SQL 脚本
CREATE TABLE store_reservation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  is_reservation_enabled BOOLEAN NOT NULL DEFAULT false,
  max_reservation_days INTEGER NOT NULL DEFAULT 0 CHECK (max_reservation_days >= 0 AND max_reservation_days <= 365),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255)
);
```

### 2. 后端开发

#### 2.1 创建实体和 DTO

参考 `data-model.md` 创建：
- `StoreReservationSettings` 实体类
- `StoreReservationSettingsDTO` 数据传输对象
- `UpdateStoreReservationSettingsRequest` 请求DTO
- `BatchUpdateStoreReservationSettingsRequest` 批量更新请求DTO

#### 2.2 创建 Repository

```java
@Repository
public interface StoreReservationSettingsRepository extends JpaRepository<StoreReservationSettings, UUID> {
    Optional<StoreReservationSettings> findByStoreId(UUID storeId);
    List<StoreReservationSettings> findByStoreIdIn(List<UUID> storeIds);
}
```

#### 2.3 创建 Service

```java
@Service
public class StoreReservationSettingsService {
    // 获取门店预约设置
    public StoreReservationSettingsDTO getSettings(UUID storeId) { ... }
    
    // 更新门店预约设置
    public StoreReservationSettingsDTO updateSettings(UUID storeId, UpdateStoreReservationSettingsRequest request) { ... }
    
    // 批量更新预约设置
    public BatchUpdateResult batchUpdate(BatchUpdateStoreReservationSettingsRequest request) { ... }
}
```

#### 2.4 创建 Controller

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

@RestController
@RequestMapping("/api/stores/reservation-settings")
public class BatchStoreReservationSettingsController {
    @PutMapping("/batch")
    public ResponseEntity<ApiResponse<BatchUpdateResult>> batchUpdate(
        @RequestBody @Valid BatchUpdateStoreReservationSettingsRequest request
    ) { ... }
}
```

### 3. 前端开发

#### 3.1 创建类型定义

```typescript
// frontend/src/pages/store-reservation-settings/types/reservation-settings.types.ts
export interface StoreReservationSettings {
  id: string;
  storeId: string;
  isReservationEnabled: boolean;
  maxReservationDays: number;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}
```

#### 3.2 创建 API Service

```typescript
// frontend/src/pages/store-reservation-settings/services/reservationSettingsService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getStoreReservationSettings(storeId: string): Promise<StoreReservationSettings> {
  const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/reservation-settings`);
  if (!response.ok) {
    throw new Error(`Failed to fetch reservation settings: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function updateStoreReservationSettings(
  storeId: string,
  request: UpdateStoreReservationSettingsRequest
): Promise<StoreReservationSettings> {
  const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/reservation-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Failed to update reservation settings: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}
```

#### 3.3 创建 TanStack Query Hooks

```typescript
// frontend/src/pages/store-reservation-settings/hooks/useReservationSettingsQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreReservationSettings, updateStoreReservationSettings } from '../services/reservationSettingsService';

export function useStoreReservationSettings(storeId: string) {
  return useQuery({
    queryKey: ['store-reservation-settings', storeId],
    queryFn: () => getStoreReservationSettings(storeId),
    enabled: !!storeId,
  });
}

export function useUpdateStoreReservationSettings(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateStoreReservationSettingsRequest) =>
      updateStoreReservationSettings(storeId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-reservation-settings', storeId] });
    },
  });
}
```

#### 3.4 创建页面组件

```typescript
// frontend/src/pages/store-reservation-settings/index.tsx
import React from 'react';
import { Card, Typography } from 'antd';
import StoreTable from '../stores/components/StoreTable'; // 复用现有组件
import { ReservationSettingsTable } from './components/ReservationSettingsTable';
import { ReservationSettingsForm } from './components/ReservationSettingsForm';

const StoreReservationSettingsPage: React.FC = () => {
  // 实现查看、编辑、批量设置功能
  return (
    <div>
      <Typography.Title level={2}>门店预约设置</Typography.Title>
      {/* 页面内容 */}
    </div>
  );
};

export default StoreReservationSettingsPage;
```

## 开发流程

### 1. 测试驱动开发（TDD）

按照 TDD 流程：
1. 先编写测试用例（后端 JUnit 测试、前端 Vitest 测试）
2. 运行测试，确保测试失败（Red）
3. 实现最小可行代码使测试通过（Green）
4. 重构优化代码（Refactor）

### 2. 后端开发顺序

1. **Phase 1**: 创建实体、DTO、Repository（含测试）
2. **Phase 2**: 实现 Service 层（含测试）
3. **Phase 3**: 实现 Controller 层（含集成测试）
4. **Phase 4**: API 契约验证（确保与 OpenAPI spec 一致）

### 3. 前端开发顺序

1. **Phase 1**: 创建类型定义和 Zod schema
2. **Phase 2**: 实现 API Service（含 MSW mock）
3. **Phase 3**: 创建 TanStack Query hooks
4. **Phase 4**: 实现页面组件（复用现有组件 + 新增专用组件）
5. **Phase 5**: E2E 测试（Playwright）

## API 使用示例

### 获取门店预约设置

```bash
curl -X GET http://localhost:8080/api/stores/{storeId}/reservation-settings
```

响应：
```json
{
  "data": {
    "id": "uuid",
    "storeId": "uuid",
    "isReservationEnabled": true,
    "maxReservationDays": 7,
    "createdAt": "2025-12-17T10:00:00Z",
    "updatedAt": "2025-12-17T10:00:00Z"
  },
  "timestamp": "2025-12-17T10:00:00Z"
}
```

### 更新门店预约设置

```bash
curl -X PUT http://localhost:8080/api/stores/{storeId}/reservation-settings \
  -H "Content-Type: application/json" \
  -d '{
    "isReservationEnabled": true,
    "maxReservationDays": 14
  }'
```

### 批量更新预约设置

```bash
curl -X PUT http://localhost:8080/api/stores/reservation-settings/batch \
  -H "Content-Type: application/json" \
  -d '{
    "storeIds": ["uuid1", "uuid2", "uuid3"],
    "settings": {
      "isReservationEnabled": true,
      "maxReservationDays": 7
    }
  }'
```

响应：
```json
{
  "data": {
    "successCount": 2,
    "failureCount": 1,
    "failures": [
      {
        "storeId": "uuid3",
        "error": "NOT_FOUND",
        "message": "门店不存在"
      }
    ]
  },
  "timestamp": "2025-12-17T10:00:00Z"
}
```

## 注意事项

### API 响应格式标准化

所有 API 必须遵循项目统一的响应格式规范（见宪章 1.3.0）：
- 单个资源：`{ data: T, timestamp: string }`
- 列表查询：`{ success: boolean, data: T[], total: number }`
- 错误响应：`{ success: false, error: string, message: string, details?: object }`

### 数据验证

- **前端**: 使用 Zod schema 验证表单输入
- **后端**: 使用 Bean Validation (`@Min`, `@Max`, `@NotNull`) 验证请求体
- **验证规则**: 可预约天数范围 1-365，当 `isReservationEnabled=true` 时必填且 > 0

### 默认值策略

- 新建门店时，自动创建预约设置记录（`isReservationEnabled=false`, `maxReservationDays=0`）
- 查询不存在的预约设置时，应返回 404 错误，而不是默认值

### 批量操作

- 采用"部分成功"策略：成功更新的门店返回成功，失败的门店返回错误详情
- 前端应显示批量操作结果摘要（成功X个，失败Y个）

## 常见问题排查

### 1. 前端无法获取预约设置

- 检查 API URL 是否正确（`/api/stores/{storeId}/reservation-settings`）
- 检查门店ID是否为有效的 UUID
- 检查后端日志，确认是否有错误
- 检查 CORS 配置（如果跨域）

### 2. 数据验证失败

- 检查前端 Zod schema 和后端 Bean Validation 规则是否一致
- 检查 `maxReservationDays` 是否在 1-365 范围内
- 检查当 `isReservationEnabled=true` 时，`maxReservationDays` 是否 > 0

### 3. 批量更新部分失败

- 检查失败的门店ID是否存在
- 检查失败的门店状态（是否被停用）
- 查看批量更新结果中的 `failures` 数组，了解具体错误原因

## 参考文档

- [规格说明](./spec.md)
- [实施计划](./plan.md)
- [数据模型](./data-model.md)
- [API 契约](./contracts/reservation-settings-api.yaml)
- [技术决策](./research.md)

