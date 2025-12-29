# Data Model: 场景包多标签页编辑界面

**Feature**: 001-scenario-package-tabs
**Date**: 2025-12-23
**Status**: Complete

## Overview

本文档定义场景包编辑功能涉及的所有数据模型,包括TypeScript接口定义、Supabase数据库表结构、以及数据验证Schema。

---

## TypeScript Type Definitions

### Core Entities

```typescript
/**
 * 场景包(Scenario Package)
 * 核心实体,聚合所有配置信息
 */
export interface ScenarioPackage {
  id: string
  name: string  // 必填,最大100字符
  description?: string | null  // 可选,最大500字符
  category: string  // 必填,从预定义分类列表选择
  mainImage: string  // 必填,Supabase Storage URL
  status: PublishStatus  // 发布状态
  effectiveStartDate?: string | null  // 生效开始日期,YYYY-MM-DD格式
  effectiveEndDate?: string | null  // 生效结束日期,YYYY-MM-DD格式
  advanceBookingDays?: number | null  // 提前预订天数,如3表示需提前3天
  createdAt: string  // ISO 8601 timestamp
  updatedAt: string  // ISO 8601 timestamp
  createdBy: string  // 创建人ID
  updatedBy: string  // 最后修改人ID
}

export enum PublishStatus {
  DRAFT = 'DRAFT',  // 草稿
  PUBLISHED = 'PUBLISHED',  // 已发布
  ARCHIVED = 'ARCHIVED'  // 已下架
}

/**
 * 套餐(Package Tier)
 * 属于某个场景包,定义不同价格层级的服务
 */
export interface PackageTier {
  id: string
  scenarioPackageId: string
  name: string  // 必填,如"豪华套餐"、"标准套餐"
  price: number  // 必填,单位:分,如 388800 表示 ¥3888.00
  originalPrice?: number | null  // 可选,原价,用于显示折扣,必须 >= price
  tags?: string[] | null  // 可选,标签数组,如["推荐", "限时优惠"]
  serviceDescription?: string | null  // 可选,服务内容描述
  sortOrder: number  // 排序顺序,数值越小越靠前
  createdAt: string
  updatedAt: string
}

/**
 * 加购项(Add-on Item)
 * 全局资源,可被多个场景包关联
 */
export interface AddOnItem {
  id: string
  name: string  // 必填,如"高端茶歇"、"鲜花布置"
  price: number  // 必填,单位:分
  category: AddOnCategory  // 分类
  imageUrl?: string | null  // 可选,图片URL
  inventory?: number | null  // 可选,库存数量,null表示无限制
  isActive: boolean  // 是否上架,false时C端不显示
  createdAt: string
  updatedAt: string
}

export enum AddOnCategory {
  CATERING = 'CATERING',  // 餐饮
  BEVERAGE = 'BEVERAGE',  // 饮品
  SERVICE = 'SERVICE',  // 服务
  DECORATION = 'DECORATION'  // 布置
}

/**
 * 场景包-加购项关联(Scenario Package Add-on Association)
 * 多对多关联表
 */
export interface ScenarioPackageAddOn {
  id: string
  scenarioPackageId: string
  addOnItemId: string
  sortOrder: number  // 排序顺序,控制C端显示顺序
  isRequired: boolean  // 是否必选,true时C端默认数量为1且不可减为0
  createdAt: string
}

/**
 * 时段模板(Time Slot Template)
 * 按星期几定义默认可预订时段
 */
export interface TimeSlotTemplate {
  id: string
  scenarioPackageId: string
  dayOfWeek: DayOfWeek  // 星期几,0=周日, 1=周一...6=周六
  startTime: string  // HH:mm格式,如"10:00"
  endTime: string  // HH:mm格式,如"13:00"
  capacity?: number | null  // 可选,容量限制,null表示无限制
  priceAdjustment?: PriceAdjustment | null  // 可选,价格调整规则
  isEnabled: boolean  // 是否启用,false时该时段不生效
  createdAt: string
  updatedAt: string
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface PriceAdjustment {
  type: 'PERCENTAGE' | 'FIXED'  // 百分比调整或固定金额调整
  value: number  // 调整值,如 type=PERCENTAGE, value=10 表示+10%, value=-20表示-20%
}

/**
 * 时段日期覆盖(Time Slot Override)
 * 为特定日期定义覆盖规则,优先级高于周模板
 */
export interface TimeSlotOverride {
  id: string
  scenarioPackageId: string
  date: string  // YYYY-MM-DD格式,如"2025-12-25"
  overrideType: OverrideType
  startTime?: string | null  // overrideType=ADD/MODIFY时必填
  endTime?: string | null  // overrideType=ADD/MODIFY时必填
  capacity?: number | null  // overrideType=MODIFY时可选
  reason?: string | null  // 可选,覆盖原因说明,如"节假日"、"特殊活动"
  createdAt: string
  updatedAt: string
}

export enum OverrideType {
  ADD = 'ADD',  // 新增时段(该日期原本没有时段,或添加额外时段)
  MODIFY = 'MODIFY',  // 修改时段(修改容量或时间)
  CANCEL = 'CANCEL'  // 取消时段(该日期不可预订)
}

/**
 * 时段库存(Time Slot Inventory)
 * 记录特定日期特定时段的实际库存状态
 */
export interface TimeSlotInventory {
  id: string
  scenarioPackageId: string
  date: string  // YYYY-MM-DD
  timeSlot: string  // HH:mm-HH:mm格式,如"10:00-13:00"
  totalCapacity: number  // 总容量
  bookedCount: number  // 已预订数量
  availableCount: number  // 剩余可预订数量(totalCapacity - bookedCount)
  updatedAt: string
}
```

---

## Zod Validation Schemas

```typescript
import { z } from 'zod'

/**
 * 基础信息验证Schema
 */
export const basicInfoSchema = z.object({
  name: z.string()
    .min(1, '场景包名称不能为空')
    .max(100, '场景包名称最多100字符'),
  description: z.string()
    .max(500, '描述最多500字符')
    .optional()
    .nullable(),
  category: z.string()
    .min(1, '必须选择分类'),
  mainImage: z.string()
    .url('必须是有效的图片URL')
    .min(1, '必须上传主图')
})

/**
 * 套餐验证Schema
 */
export const packageTierSchema = z.object({
  name: z.string()
    .min(1, '套餐名称不能为空'),
  price: z.number()
    .int('价格必须是整数(分)')
    .positive('价格必须大于0'),
  originalPrice: z.number()
    .int('原价必须是整数(分)')
    .positive('原价必须大于0')
    .optional()
    .nullable(),
  tags: z.array(z.string())
    .optional()
    .nullable(),
  serviceDescription: z.string()
    .optional()
    .nullable(),
  sortOrder: z.number().int().min(0)
}).refine(
  data => !data.originalPrice || data.originalPrice >= data.price,
  { message: '原价必须大于或等于售价', path: ['originalPrice'] }
)

/**
 * 时段模板验证Schema
 */
export const timeSlotTemplateSchema = z.object({
  dayOfWeek: z.union([
    z.literal(0), z.literal(1), z.literal(2), z.literal(3),
    z.literal(4), z.literal(5), z.literal(6)
  ]),
  startTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '时间格式必须为HH:mm'),
  endTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '时间格式必须为HH:mm'),
  capacity: z.number()
    .int('容量必须是整数')
    .positive('容量必须大于0')
    .optional()
    .nullable(),
  priceAdjustment: z.object({
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number()
  }).optional().nullable(),
  isEnabled: z.boolean()
}).refine(
  data => data.startTime < data.endTime,
  { message: '结束时间必须晚于开始时间', path: ['endTime'] }
)

/**
 * 时段日期覆盖验证Schema
 */
export const timeSlotOverrideSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD'),
  overrideType: z.enum(['ADD', 'MODIFY', 'CANCEL']),
  startTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '时间格式必须为HH:mm')
    .optional()
    .nullable(),
  endTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '时间格式必须为HH:mm')
    .optional()
    .nullable(),
  capacity: z.number()
    .int('容量必须是整数')
    .positive('容量必须大于0')
    .optional()
    .nullable(),
  reason: z.string()
    .max(200, '原因说明最多200字符')
    .optional()
    .nullable()
}).refine(
  data => {
    if (data.overrideType === 'ADD' || data.overrideType === 'MODIFY') {
      return !!data.startTime && !!data.endTime
    }
    return true
  },
  { message: 'ADD/MODIFY类型必须提供开始和结束时间', path: ['startTime'] }
)

/**
 * 发布前全局验证Schema
 */
export const publishValidationSchema = z.object({
  basicInfo: basicInfoSchema,
  packages: z.array(packageTierSchema)
    .min(1, '至少需要配置1个套餐'),
  timeSlots: z.union([
    z.array(timeSlotTemplateSchema).min(1),
    z.array(timeSlotOverrideSchema).min(1)
  ]).refine(
    data => data.length > 0,
    '至少需要配置1个可预订时段(周模板或日期覆盖)'
  )
})
```

---

## Supabase Database Schema

### Tables

```sql
-- 场景包表
CREATE TABLE scenario_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  main_image TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  effective_start_date DATE,
  effective_end_date DATE,
  advance_booking_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id),

  CONSTRAINT valid_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  CONSTRAINT valid_date_range CHECK (effective_end_date IS NULL OR effective_start_date <= effective_end_date)
);

CREATE INDEX idx_scenario_packages_status ON scenario_packages(status);
CREATE INDEX idx_scenario_packages_category ON scenario_packages(category);

-- 套餐表
CREATE TABLE package_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  tags TEXT[],
  service_description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT positive_price CHECK (price > 0),
  CONSTRAINT valid_original_price CHECK (original_price IS NULL OR original_price >= price)
);

CREATE INDEX idx_package_tiers_scenario ON package_tiers(scenario_package_id);

-- 全局加购项表
CREATE TABLE add_on_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  category VARCHAR(20) NOT NULL,
  image_url TEXT,
  inventory INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_category CHECK (category IN ('CATERING', 'BEVERAGE', 'SERVICE', 'DECORATION')),
  CONSTRAINT positive_price CHECK (price > 0),
  CONSTRAINT valid_inventory CHECK (inventory IS NULL OR inventory >= 0)
);

CREATE INDEX idx_add_on_items_category ON add_on_items(category);
CREATE INDEX idx_add_on_items_active ON add_on_items(is_active);

-- 场景包-加购项关联表
CREATE TABLE scenario_package_add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
  add_on_item_id UUID NOT NULL REFERENCES add_on_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(scenario_package_id, add_on_item_id)
);

CREATE INDEX idx_sp_addons_package ON scenario_package_add_ons(scenario_package_id);

-- 时段模板表
CREATE TABLE time_slot_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER,
  price_adjustment JSONB,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_day_of_week CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity > 0)
);

CREATE INDEX idx_tst_scenario ON time_slot_templates(scenario_package_id);
CREATE INDEX idx_tst_day ON time_slot_templates(day_of_week);

-- 时段日期覆盖表
CREATE TABLE time_slot_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  override_type VARCHAR(10) NOT NULL,
  start_time TIME,
  end_time TIME,
  capacity INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_override_type CHECK (override_type IN ('ADD', 'MODIFY', 'CANCEL')),
  CONSTRAINT valid_time_for_add_modify CHECK (
    (override_type = 'CANCEL') OR (start_time IS NOT NULL AND end_time IS NOT NULL)
  ),
  CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity > 0)
);

CREATE INDEX idx_tso_scenario_date ON time_slot_overrides(scenario_package_id, date);

-- 时段库存表
CREATE TABLE time_slot_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  total_capacity INTEGER NOT NULL,
  booked_count INTEGER NOT NULL DEFAULT 0,
  available_count INTEGER GENERATED ALWAYS AS (total_capacity - booked_count) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(scenario_package_id, date, time_slot),
  CONSTRAINT valid_capacity CHECK (total_capacity > 0),
  CONSTRAINT valid_booked_count CHECK (booked_count >= 0 AND booked_count <= total_capacity)
);

CREATE INDEX idx_tsi_scenario_date ON time_slot_inventory(scenario_package_id, date);
```

---

## Data Relationships

```
scenario_packages (1)
  ├── package_tiers (N)
  ├── scenario_package_add_ons (N)
  │     └── add_on_items (N) [many-to-many]
  ├── time_slot_templates (N)
  ├── time_slot_overrides (N)
  └── time_slot_inventory (N)
```

---

## Sample Data

### Scenario Package Example

```json
{
  "id": "sp-001",
  "name": "商务团建套餐",
  "description": "适合20-50人的中小型企业团建活动",
  "category": "团建活动",
  "mainImage": "https://storage.supabase.co/bucket/images/sp-001-main.jpg",
  "status": "PUBLISHED",
  "effectiveStartDate": "2025-01-01",
  "effectiveEndDate": "2025-12-31",
  "advanceBookingDays": 3,
  "createdAt": "2025-12-23T10:00:00Z",
  "updatedAt": "2025-12-23T15:30:00Z"
}
```

### Package Tier Example

```json
{
  "id": "pt-001",
  "scenarioPackageId": "sp-001",
  "name": "豪华套餐",
  "price": 388800,  // ¥3888.00
  "originalPrice": 499900,  // ¥4999.00
  "tags": ["推荐", "限时优惠"],
  "serviceDescription": "包含专业主持、摄影摄像、高端茶歇、精美礼品",
  "sortOrder": 0
}
```

### Time Slot Template Example

```json
{
  "id": "tst-001",
  "scenarioPackageId": "sp-001",
  "dayOfWeek": 1,  // 周一
  "startTime": "10:00",
  "endTime": "13:00",
  "capacity": 5,
  "priceAdjustment": {
    "type": "PERCENTAGE",
    "value": -10  // 工作日-10%折扣
  },
  "isEnabled": true
}
```

---

**Data Model Complete**: 2025-12-23
**Ready for API Contract Design**: Yes
