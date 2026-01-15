# Data Model: 场景包小程序首页 API 集成

**Feature**: 018-hall-reserve-homepage
**Date**: 2025-12-21
**Purpose**: 定义前后端数据模型和实体结构

---

## 1. 前端数据模型（TypeScript）

### 1.1 ScenarioPackageListItem (场景包列表项)

小程序首页展示的场景包摘要数据。

```typescript
export interface ScenarioPackageListItem {
  /** 场景包唯一标识符 */
  id: string;

  /** 场景包标题 */
  title: string;

  /** 分类枚举 */
  category: 'MOVIE' | 'TEAM' | 'PARTY';

  /** 背景图片 URL */
  backgroundImageUrl: string;

  /** 打包一口价（起价） */
  packagePrice: number;

  /** 运营人员配置的固定评分（0-5分，可选） */
  rating?: number;

  /** 标签列表 */
  tags: string[];
}
```

**字段说明**:
- `id`: 后端生成的 UUID 或自增 ID
- `title`: 场景包名称，如"VIP 生日派对专场"
- `category`: 分类，对应前端 UI 的分组展示（私人订制/商务团建/派对策划）
- `backgroundImageUrl`: 由 017 场景包管理后台上传至 Supabase Storage 的图片 URL
- `packagePrice`: 打包价格，单位为元（数字类型）
- `rating`: 运营配置的推荐度评分，可选字段（未配置时为 undefined）
- `tags`: 业务标签，用于首页展示特性（如["浪漫", "惊喜", "求婚"]）

**验证规则**:
- `id`: 非空字符串
- `title`: 非空字符串
- `category`: 必须为 'MOVIE' | 'TEAM' | 'PARTY' 之一
- `backgroundImageUrl`: 有效的 URL 格式
- `packagePrice`: 正数
- `rating`: 0-5 之间的数字（可选）
- `tags`: 字符串数组

---

### 1.2 ApiResponse (API 响应)

后端统一响应格式。

```typescript
export interface ApiResponse<T = any> {
  /** 请求是否成功 */
  success: boolean;

  /** 响应数据体 */
  data: T;

  /** 错误或提示信息（可选） */
  message?: string;

  /** 服务器时间戳（可选，用于缓存基准） */
  timestamp?: string;
}
```

**使用示例**:
```typescript
// 场景包列表 API 响应
type ScenarioPackageListResponse = ApiResponse<ScenarioPackageListItem[]>;

// 成功响应示例
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "title": "VIP 生日派对专场",
      "category": "PARTY",
      "backgroundImageUrl": "https://storage.supabase.co/...",
      "packagePrice": 1888,
      "rating": 4.5,
      "tags": ["生日", "派对", "VIP"]
    }
  ],
  "timestamp": "2025-12-21T10:00:00Z"
}

// 错误响应示例
{
  "success": false,
  "data": [],
  "message": "服务暂时不可用，请稍后重试"
}
```

---

### 1.3 Zod Schema (运行时验证)

```typescript
import { z } from 'zod';

export const ScenarioPackageListItemSchema = z.object({
  id: z.string().min(1, '场景包 ID 不能为空'),
  title: z.string().min(1, '标题不能为空'),
  category: z.enum(['MOVIE', 'TEAM', 'PARTY'], {
    errorMap: () => ({ message: '无效的分类值' }),
  }),
  backgroundImageUrl: z.string().url('背景图片 URL 格式不正确'),
  packagePrice: z.number().positive('价格必须为正数'),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ScenarioPackageListItemSchema),
  message: z.string().optional(),
  timestamp: z.string().optional(),
});

// 类型推断
export type ScenarioPackageListItem = z.infer<typeof ScenarioPackageListItemSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
```

---

## 2. 后端数据模型（Java）

### 2.1 ScenarioPackageListItemDTO (DTO)

```java
package com.cinema.dto;

import java.util.List;

/**
 * 场景包列表项 DTO（用于 API 响应）
 * 仅包含小程序首页展示所需的摘要字段
 */
public record ScenarioPackageListItemDTO(
    String id,
    String title,
    String category,
    String backgroundImageUrl,
    Double packagePrice,
    Double rating,  // 可选字段，Java 使用 Double 类型（可为 null）
    List<String> tags
) {
    /**
     * 验证 DTO 数据完整性
     */
    public void validate() {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("场景包 ID 不能为空");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("标题不能为空");
        }
        if (category == null || !List.of("MOVIE", "TEAM", "PARTY").contains(category)) {
            throw new IllegalArgumentException("无效的分类值");
        }
        if (packagePrice == null || packagePrice <= 0) {
            throw new IllegalArgumentException("价格必须为正数");
        }
        if (rating != null && (rating < 0 || rating > 5)) {
            throw new IllegalArgumentException("评分必须在 0-5 之间");
        }
    }
}
```

---

### 2.2 ApiResponse (统一响应格式)

```java
package com.cinema.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/**
 * 统一 API 响应格式
 * @param <T> 数据体类型
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    boolean success,
    T data,
    String message,
    String timestamp
) {
    /**
     * 成功响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(
            true,
            data,
            null,
            Instant.now().toString()
        );
    }

    /**
     * 失败响应
     */
    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(
            false,
            null,
            message,
            Instant.now().toString()
        );
    }
}
```

---

## 3. 数据库模型（Supabase PostgreSQL）

### 3.1 scenario_packages 表结构

基于 017-scenario-package 规格说明，后端数据库表结构如下：

```sql
CREATE TABLE scenario_packages (
    -- 基本信息
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('MOVIE', 'TEAM', 'PARTY')),
    background_image_url TEXT,

    -- 状态管理
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED')),

    -- 定价信息（存储在 pricing JSONB 字段或单独字段）
    package_price DECIMAL(10, 2) NOT NULL,
    reference_price DECIMAL(10, 2),
    discount_rate DECIMAL(5, 2),

    -- 评分（运营配置）
    rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),

    -- 标签（JSONB 数组）
    tags JSONB DEFAULT '[]'::jsonb,

    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP WITH TIME ZONE  -- 软删除
);

-- 索引
CREATE INDEX idx_scenario_packages_status ON scenario_packages(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_scenario_packages_category ON scenario_packages(category) WHERE deleted_at IS NULL;

-- 注释
COMMENT ON TABLE scenario_packages IS '场景包主表（与 017-scenario-package 规格对应）';
COMMENT ON COLUMN scenario_packages.status IS '状态：DRAFT（草稿）、PUBLISHED（已发布）、UNPUBLISHED（已下架）';
COMMENT ON COLUMN scenario_packages.rating IS '运营人员配置的固定评分（0-5分），非用户评价';
```

**说明**:
- `status` 字段用于服务端过滤（仅返回 PUBLISHED 状态）
- `rating` 字段为运营配置，与用户评价系统无关
- `tags` 使用 JSONB 类型存储字符串数组
- `deleted_at` 用于软删除（符合 017 规格要求）

---

### 3.2 查询示例（Supabase REST API 或 SDK）

```sql
-- 查询已发布的场景包列表（用于小程序首页）
SELECT
    id,
    title,
    category,
    background_image_url,
    package_price,
    rating,
    tags
FROM scenario_packages
WHERE status = 'PUBLISHED'
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

---

## 4. 数据流向

```
┌─────────────────────────────────────────────────────────────────┐
│  Taro 小程序（前端）                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  首页组件 (index.tsx)                                      │   │
│  │  ├─ useQuery({ queryKey: ['scenarioPackages'], ... })   │   │
│  │  └─ 展示 ScenarioPackageListItem[]                       │   │
│  └───────────────┬──────────────────────────────────────────┘   │
│                  │                                               │
│  ┌───────────────▼──────────────────────────────────────────┐   │
│  │  TanStack Query（缓存层）                                  │   │
│  │  ├─ 缓存 5 分钟                                            │   │
│  │  ├─ 自动重试                                               │   │
│  │  └─ 后台刷新                                               │   │
│  └───────────────┬──────────────────────────────────────────┘   │
│                  │                                               │
│  ┌───────────────▼──────────────────────────────────────────┐   │
│  │  scenarioService.ts                                       │   │
│  │  ├─ fetchScenarioPackages()                               │   │
│  │  └─ Zod 验证（ScenarioPackageListItemSchema）             │   │
│  └───────────────┬──────────────────────────────────────────┘   │
│                  │                                               │
│  ┌───────────────▼──────────────────────────────────────────┐   │
│  │  request.ts（Taro.request 封装）                           │   │
│  │  ├─ GET /api/scenario-packages                            │   │
│  │  ├─ 超时 10 秒                                             │   │
│  │  └─ 统一错误处理                                           │   │
│  └───────────────┬──────────────────────────────────────────┘   │
└──────────────────┼───────────────────────────────────────────────┘
                   │ HTTP Request
                   │
┌──────────────────▼───────────────────────────────────────────────┐
│  Spring Boot 后端                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ScenarioPackageController.java                          │   │
│  │  @GetMapping("/api/scenario-packages")                   │   │
│  │  └─ 返回 ApiResponse<ScenarioPackageListItemDTO[]>       │   │
│  └───────────────┬──────────────────────────────────────────┘   │
│                  │                                               │
│  ┌───────────────▼──────────────────────────────────────────┐   │
│  │  ScenarioPackageService.java                             │   │
│  │  └─ 业务逻辑处理                                           │   │
│  └───────────────┬──────────────────────────────────────────┘   │
│                  │                                               │
│  ┌───────────────▼──────────────────────────────────────────┐   │
│  │  ScenarioPackageRepository.java                          │   │
│  │  └─ Supabase SDK 查询（WHERE status = 'PUBLISHED'）       │   │
│  └───────────────┬──────────────────────────────────────────┘   │
└──────────────────┼───────────────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────────────┐
│  Supabase PostgreSQL                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  scenario_packages 表                                     │   │
│  │  └─ 返回已发布的场景包数据                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据完整性约束

### 5.1 必填字段
- 前端: `id`, `title`, `category`, `backgroundImageUrl`, `packagePrice`, `tags`
- 后端: `id`, `title`, `category`, `packagePrice`, `status`

### 5.2 可选字段
- 前端: `rating`（未配置时为 `undefined`）
- 后端: `rating`, `description`, `background_image_url`

### 5.3 数据验证
- 前端使用 Zod 在运行时验证 API 响应
- 后端使用 DTO 的 `validate()` 方法验证数据
- 数据库使用 CHECK 约束确保数据合法性

### 5.4 错误处理
- 数据验证失败: 前端展示错误提示，后端返回 400 Bad Request
- 数据库查询失败: 后端返回 500 Internal Server Error
- 网络超时: 前端展示超时提示并提供重试按钮

---

## 6. 扩展性考虑

### 6.1 未来可能新增的字段
- `location`: 地点信息（当前规格中提到但未明确定义）
- `viewCount`: 浏览次数（运营数据）
- `bookingCount`: 预订次数（运营数据）
- `priority`: 排序优先级（运营配置）

### 6.2 分页支持
当前为简单列表查询，未来如果场景包数量增长，可增加分页参数：
```
GET /api/scenario-packages?page=1&size=20
```

### 6.3 过滤和排序
未来可支持更多查询参数：
```
GET /api/scenario-packages?category=PARTY&sortBy=rating&order=desc
```

---

## Summary

- **前端数据模型**: ScenarioPackageListItem（7 个字段）+ ApiResponse
- **后端数据模型**: ScenarioPackageListItemDTO + ApiResponse<T>
- **数据库模型**: scenario_packages 表（与 017 规格对齐）
- **验证策略**: 前端 Zod + 后端 DTO 验证 + 数据库 CHECK 约束
- **数据流向**: 小程序 → TanStack Query → Taro.request → Spring Boot → Supabase

所有数据模型符合宪法要求，前后端类型定义完全一致，确保类型安全和数据完整性。
