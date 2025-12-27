# Data Model: 单位换算系统

**Branch**: `P002-unit-conversion` | **Date**: 2025-12-25

## 数据模型概述

本功能复用现有 `unit_conversions` 表（V028 迁移脚本已创建），定义前后端数据类型和状态管理。

---

## 1. 数据库实体

### 1.1 unit_conversions 表（现有）

> **注意**: 此表已由 V028 迁移脚本创建，本功能复用该表结构。

```sql
CREATE TABLE unit_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_unit VARCHAR(20) NOT NULL,
  to_unit VARCHAR(20) NOT NULL,
  conversion_rate DECIMAL(10,6) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('volume', 'weight', 'quantity')),
  CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);
```

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 主键 |
| `from_unit` | VARCHAR(20) | NOT NULL | 源单位名称 |
| `to_unit` | VARCHAR(20) | NOT NULL | 目标单位名称 |
| `conversion_rate` | DECIMAL(10,6) | NOT NULL | 换算率 (1 from_unit = ? to_unit) |
| `category` | VARCHAR(20) | NOT NULL, CHECK | 类别: 'volume'/'weight'/'quantity' |

**唯一约束**: `(from_unit, to_unit)` - 同一对单位只能有一条换算规则

**现有数据**: V028 迁移脚本已插入基础换算数据（ml↔l, g↔kg 等）

---

## 2. 后端领域模型 (Java)

### 2.1 UnitConversion 实体

```java
package com.cinema.unitconversion.domain;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 单位换算规则实体
 * 映射到 unit_conversions 表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unit_conversions")
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UnitConversion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "from_unit", nullable = false, length = 20)
    private String fromUnit;

    @Column(name = "to_unit", nullable = false, length = 20)
    private String toUnit;

    @Column(name = "conversion_rate", nullable = false, precision = 10, scale = 6)
    private BigDecimal conversionRate;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private UnitCategory category;
}
```

### 2.2 UnitCategory 枚举

```java
package com.cinema.unitconversion.domain;

/**
 * 单位类别枚举
 * 数据库存储小写值，Java 使用大写枚举
 */
public enum UnitCategory {
    volume(1),    // 体积类 - 默认1位小数
    weight(0),    // 重量类 - 默认0位小数
    quantity(0);  // 计数类 - 默认0位小数

    private final int defaultPrecision;

    UnitCategory(int defaultPrecision) {
        this.defaultPrecision = defaultPrecision;
    }

    public int getDefaultPrecision() {
        return defaultPrecision;
    }

    /**
     * 获取前端显示名称
     */
    public String getDisplayName() {
        return switch (this) {
            case volume -> "VOLUME";
            case weight -> "WEIGHT";
            case quantity -> "COUNT";
        };
    }
}
```

---

## 3. 后端 DTO 定义

### 3.1 UnitConversionDto

```java
package com.cinema.unitconversion.dto;

import com.cinema.unitconversion.domain.UnitCategory;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 单位换算规则响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitConversionDto {
    private UUID id;
    private String fromUnit;
    private String toUnit;
    private BigDecimal conversionRate;
    private String category;        // 数据库值: volume/weight/quantity
    private String categoryDisplay; // 前端显示: VOLUME/WEIGHT/COUNT

    public static UnitConversionDto from(UnitConversion entity) {
        return UnitConversionDto.builder()
            .id(entity.getId())
            .fromUnit(entity.getFromUnit())
            .toUnit(entity.getToUnit())
            .conversionRate(entity.getConversionRate())
            .category(entity.getCategory().name())
            .categoryDisplay(entity.getCategory().getDisplayName())
            .build();
    }
}
```

### 3.2 CreateConversionRequest

```java
package com.cinema.unitconversion.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 创建/更新换算规则请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversionRequest {

    @NotBlank(message = "源单位不能为空")
    @Size(max = 20, message = "源单位长度不能超过20字符")
    private String fromUnit;

    @NotBlank(message = "目标单位不能为空")
    @Size(max = 20, message = "目标单位长度不能超过20字符")
    private String toUnit;

    @NotNull(message = "换算率不能为空")
    @Positive(message = "换算率必须为正数")
    @DecimalMax(value = "999999.999999", message = "换算率超出范围")
    private BigDecimal conversionRate;

    @NotBlank(message = "单位类别不能为空")
    @Pattern(regexp = "^(volume|weight|quantity)$", message = "类别必须是 volume/weight/quantity")
    private String category;

    private String description; // 可选备注
}
```

### 3.3 ConversionPathResponse

```java
package com.cinema.unitconversion.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 换算路径计算响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionPathResponse {
    private String fromUnit;
    private String toUnit;
    private List<String> path;       // 换算路径: ["瓶", "ml", "L"]
    private BigDecimal totalRate;    // 累积换算率
    private int steps;               // 中间步骤数
    private boolean found;           // 是否找到路径
}
```

### 3.4 ValidationErrorResponse

```java
package com.cinema.unitconversion.dto;

import lombok.*;

import java.util.List;

/**
 * 验证错误响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorResponse {
    private String error;           // 错误类型
    private String message;         // 错误消息
    private List<String> cyclePath; // 循环路径（如有）
    private List<String> references; // 引用的 BOM（如有）
}
```

---

## 4. 前端类型定义 (TypeScript)

### 4.1 核心类型

```typescript
// frontend/src/features/unit-conversion/types/index.ts

/**
 * 单位类别枚举
 */
export type UnitCategory = 'VOLUME' | 'WEIGHT' | 'COUNT';

/**
 * 数据库存储的类别值（小写）
 */
export type DbUnitCategory = 'volume' | 'weight' | 'quantity';

/**
 * 单位换算规则
 */
export interface UnitConversion {
  id: string;
  fromUnit: string;
  toUnit: string;
  conversionRate: number;
  category: DbUnitCategory;
  categoryDisplay: UnitCategory;
}

/**
 * 创建/更新换算规则请求
 */
export interface CreateConversionRequest {
  fromUnit: string;
  toUnit: string;
  conversionRate: number;
  category: DbUnitCategory;
  description?: string;
}

/**
 * 换算路径计算响应
 */
export interface ConversionPath {
  fromUnit: string;
  toUnit: string;
  path: string[];
  totalRate: number;
  steps: number;
  found: boolean;
}

/**
 * 统计信息
 */
export interface ConversionStats {
  volumeCount: number;
  weightCount: number;
  countCount: number;
  totalCount: number;
}
```

### 4.2 类别映射工具

```typescript
// frontend/src/features/unit-conversion/utils/categoryMapping.ts

import { UnitCategory, DbUnitCategory } from '../types';

/**
 * 数据库值到前端显示的映射
 */
export const DB_TO_DISPLAY: Record<DbUnitCategory, UnitCategory> = {
  volume: 'VOLUME',
  weight: 'WEIGHT',
  quantity: 'COUNT',
};

/**
 * 前端显示到数据库值的映射
 */
export const DISPLAY_TO_DB: Record<UnitCategory, DbUnitCategory> = {
  VOLUME: 'volume',
  WEIGHT: 'weight',
  COUNT: 'quantity',
};

/**
 * 类别中文显示名
 */
export const CATEGORY_LABELS: Record<UnitCategory, string> = {
  VOLUME: '体积',
  WEIGHT: '重量',
  COUNT: '计数',
};

/**
 * 默认舍入精度
 */
export const DEFAULT_PRECISION: Record<UnitCategory, number> = {
  VOLUME: 1,
  WEIGHT: 0,
  COUNT: 0,
};
```

### 4.3 Zod 验证 Schema

```typescript
// frontend/src/features/unit-conversion/types/schema.ts

import { z } from 'zod';

export const createConversionSchema = z.object({
  fromUnit: z.string()
    .min(1, '源单位不能为空')
    .max(20, '源单位不能超过20字符'),
  toUnit: z.string()
    .min(1, '目标单位不能为空')
    .max(20, '目标单位不能超过20字符'),
  conversionRate: z.number()
    .positive('换算率必须为正数')
    .max(999999.999999, '换算率超出范围'),
  category: z.enum(['volume', 'weight', 'quantity'], {
    errorMap: () => ({ message: '请选择单位类别' }),
  }),
  description: z.string().optional(),
}).refine(
  (data) => data.fromUnit !== data.toUnit,
  { message: '源单位和目标单位不能相同', path: ['toUnit'] }
);

export type CreateConversionInput = z.infer<typeof createConversionSchema>;
```

---

## 5. 状态管理

### 5.1 TanStack Query Hooks

```typescript
// frontend/src/features/unit-conversion/hooks/useConversions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversionService } from '../services/conversionService';
import type { CreateConversionRequest, UnitConversion } from '../types';

// 查询键
export const CONVERSION_KEYS = {
  all: ['conversions'] as const,
  list: () => [...CONVERSION_KEYS.all, 'list'] as const,
  stats: () => [...CONVERSION_KEYS.all, 'stats'] as const,
  detail: (id: string) => [...CONVERSION_KEYS.all, 'detail', id] as const,
};

// 获取所有换算规则
export function useConversions() {
  return useQuery({
    queryKey: CONVERSION_KEYS.list(),
    queryFn: conversionService.getAll,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 获取统计信息
export function useConversionStats() {
  return useQuery({
    queryKey: CONVERSION_KEYS.stats(),
    queryFn: conversionService.getStats,
    staleTime: 5 * 60 * 1000,
  });
}

// 创建换算规则
export function useCreateConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversionRequest) => conversionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSION_KEYS.all });
    },
  });
}

// 更新换算规则
export function useUpdateConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateConversionRequest }) =>
      conversionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSION_KEYS.all });
    },
  });
}

// 删除换算规则
export function useDeleteConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSION_KEYS.all });
    },
  });
}
```

### 5.2 UI 状态 (Zustand)

```typescript
// frontend/src/features/unit-conversion/stores/conversionUIStore.ts

import { create } from 'zustand';
import type { UnitConversion, UnitCategory } from '../types';

interface ConversionUIState {
  // 搜索过滤
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // 类别过滤
  categoryFilter: UnitCategory | null;
  setCategoryFilter: (category: UnitCategory | null) => void;

  // 模态框状态
  isModalOpen: boolean;
  editingRule: Partial<UnitConversion> | null;
  openCreateModal: () => void;
  openEditModal: (rule: UnitConversion) => void;
  closeModal: () => void;
}

export const useConversionUIStore = create<ConversionUIState>((set) => ({
  // 搜索过滤
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),

  // 类别过滤
  categoryFilter: null,
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  // 模态框状态
  isModalOpen: false,
  editingRule: null,
  openCreateModal: () => set({
    isModalOpen: true,
    editingRule: { category: 'volume' },
  }),
  openEditModal: (rule) => set({
    isModalOpen: true,
    editingRule: { ...rule },
  }),
  closeModal: () => set({
    isModalOpen: false,
    editingRule: null,
  }),
}));
```

---

## 6. 验证规则汇总

| 字段 | 验证规则 | 错误消息 |
|------|----------|----------|
| `fromUnit` | 非空, 最大20字符 | "源单位不能为空" / "长度不能超过20字符" |
| `toUnit` | 非空, 最大20字符, 不等于 fromUnit | "目标单位不能为空" / "源单位和目标单位不能相同" |
| `conversionRate` | 非空, 正数, ≤999999.999999 | "换算率必须为正数" / "换算率超出范围" |
| `category` | 非空, 枚举值 | "请选择单位类别" |
| `(from_unit, to_unit)` | 唯一约束 | "该换算关系已存在" |

---

## 7. 状态转换图

本功能无复杂状态机，换算规则为简单 CRUD 实体。

```text
[新建] ──创建──> [已保存]
          │
          ├──编辑──> [已保存]
          │
          └──删除──> [已删除]

删除前检查:
  └── BOM 引用检查 ──有引用──> [阻止删除，显示引用列表]
                    └──无引用──> [允许删除]
```

---

## 8. 关系图

```text
┌─────────────────────────────────────────────────────────────┐
│                    unit_conversions                         │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                               │
│ from_unit (VARCHAR)                                         │
│ to_unit (VARCHAR)                                           │
│ conversion_rate (DECIMAL)                                   │
│ category (VARCHAR)                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ 被引用 (软关系，删除时检查)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    bom_components                           │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                               │
│ finished_product_id (UUID, FK)                              │
│ component_id (UUID, FK)                                     │
│ quantity (DECIMAL)                                          │
│ unit (VARCHAR) ◄─── 引用换算规则中的 from_unit 或 to_unit   │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```
