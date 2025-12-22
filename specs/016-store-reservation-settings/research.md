# Research & Technical Decisions: 门店预约设置管理

**Feature**: 016-store-reservation-settings
**Date**: 2025-12-22
**Status**: Completed

## Overview

本文档记录了门店预约设置管理功能的技术调研和架构决策过程，确保所有技术选型都基于明确的评估和权衡。

## Research Areas

### 1. Supabase 表设计：Time Slots 存储策略

**问题**: 预约时间段数据（ReservationTimeSlot）应该使用独立表还是JSONB字段存储？

**调研方案**:

**方案A: 独立表 `reservation_time_slots`**
- 结构：`id, settings_id (FK), day_of_week, start_time, end_time`
- 优点：
  - 规范化设计，符合关系型数据库最佳实践
  - 查询和索引优化简单（可以按day_of_week建立索引）
  - 数据验证和约束容易实现（CHECK约束确保start_time < end_time）
  - 支持复杂查询（如查询所有周末营业的门店）
- 缺点：
  - 需要JOIN操作获取完整配置
  - 写入需要多次INSERT（7条记录对应7天）

**方案B: JSONB字段存储在 `reservation_settings` 表**
- 结构：`time_slots JSONB` (存储数组：`[{dayOfWeek: 1, startTime: "10:00", endTime: "22:00"}, ...]`)
- 优点：
  - 单次查询获取完整配置，性能更好
  - 写入原子性（单条UPDATE语句）
  - 减少表数量，简化数据模型
- 缺点：
  - JSONB字段不如关系型字段易于验证和约束
  - 复杂查询需要使用PostgreSQL的JSONB运算符（学习曲线）
  - 索引策略较复杂（需要GIN索引）

**决策**: **使用方案B（JSONB字段）**

**理由**:
1. **读写模式分析**: 预约设置配置属于"读多写少"场景，运营人员配置后很少修改，但前端预约页面会频繁读取。JSONB单次查询性能优于JOIN
2. **原子性需求**: 时间段配置通常作为一个整体修改（例如调整所有工作日时间），JSONB的原子性更新更符合业务逻辑
3. **Supabase特性**: Supabase基于PostgreSQL，JSONB支持完善（JSON运算符、GIN索引、性能优化），且Supabase客户端SDK对JSONB序列化/反序列化支持良好
4. **规模考虑**: 每个门店最多7条时间段记录，数据量小，JSONB不会造成性能瓶颈
5. **简化架构**: 减少一张表的管理成本，降低Spring Boot实体映射复杂度

**实现细节**:
```sql
-- reservation_settings 表结构
CREATE TABLE reservation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  time_slots JSONB DEFAULT '[]'::jsonb, -- [{dayOfWeek: 1-7, startTime: "HH:mm", endTime: "HH:mm"}]
  min_advance_hours INTEGER DEFAULT 1 CHECK (min_advance_hours > 0),
  max_advance_days INTEGER DEFAULT 30 CHECK (max_advance_days > min_advance_hours / 24),
  duration_unit INTEGER DEFAULT 1 CHECK (duration_unit IN (1, 2, 4)), -- 预约单位时长（小时）
  deposit_required BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(10, 2) CHECK (deposit_amount >= 0),
  deposit_percentage INTEGER CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN 索引加速 JSONB 查询
CREATE INDEX idx_time_slots ON reservation_settings USING GIN (time_slots);
```

---

### 2. 审计日志策略

**问题**: 如何记录预约设置修改日志（FR-008要求记录修改人、修改时间、修改前后的值）？

**调研方案**:

**方案A: Supabase 自动时间戳 + 触发器**
- 使用Supabase的`created_at`和`updated_at`自动时间戳
- 创建PostgreSQL触发器记录修改历史到`reservation_settings_audit`表
- 优点：完全在数据库层实现，应用层无需额外逻辑
- 缺点：触发器调试困难，需要额外编写SQL函数

**方案B: 应用层审计（Spring Boot AOP）**
- 使用Spring AOP拦截Repository层的update操作
- 在拦截器中记录修改前后的值到审计表
- 优点：逻辑清晰，易于调试和扩展
- 缺点：需要在应用层编写额外代码

**方案C: 简化审计（仅记录时间戳和修改人）**
- 在`reservation_settings`表中仅记录`updated_at`和`updated_by`
- 不记录修改前后的值（通过Git历史或日志系统追踪详细变更）
- 优点：实现简单，满足基本审计需求
- 缺点：无法直接查询历史修改记录

**决策**: **使用方案C（简化审计）**

**理由**:
1. **需求分析**: FR-008要求"记录修改日志"，但未明确要求查询历史修改记录。当前需求仅需满足"谁在什么时间修改了配置"，不需要详细的diff对比
2. **Supabase内置支持**: Supabase自动维护`created_at`和`updated_at`时间戳，仅需添加`created_by`和`updated_by`字段
3. **扩展性**: 若未来需要详细审计，可通过Supabase的Row Level Security (RLS) + 触发器扩展，或使用Supabase的实时订阅功能记录变更事件
4. **复杂度权衡**: 完整审计表需要额外的表结构、查询逻辑和存储成本，当前MVP阶段不必过度设计

**实现细节**:
- 在Spring Boot Service层的update方法中，从SecurityContext获取当前用户ID，设置`updated_by`字段
- Supabase自动更新`updated_at`字段

---

### 3. Spring Boot + Supabase 集成模式

**问题**: Spring Boot如何与Supabase交互？使用官方Java SDK还是REST API？

**调研方案**:

**方案A: Supabase Java SDK (supabase-java)**
- 使用官方SDK封装的API调用
- 优点：类型安全，提供Repository模式抽象
- 缺点：Java SDK成熟度不如JS/Python SDK，文档较少

**方案B: Supabase REST API + HTTP Client**
- 使用Spring WebClient或RestTemplate直接调用Supabase REST API
- 优点：灵活性高，不依赖第三方SDK
- 缺点：需要手动处理序列化/反序列化和错误处理

**方案C: Spring Data JPA + Supabase PostgreSQL**
- 使用Spring Data JPA直接连接Supabase PostgreSQL数据库
- 优点：标准JPA模式，团队熟悉度高，ORM映射简化开发
- 缺点：绕过Supabase的Auth和Row Level Security特性

**决策**: **使用方案C（Spring Data JPA + PostgreSQL JDBC连接）+ Supabase Auth集成**

**理由**:
1. **团队能力**: Spring Data JPA是Java后端的标准技术栈，团队成员熟悉度高，降低学习成本
2. **Supabase定位**: Supabase的PostgreSQL数据库支持标准JDBC连接，JPA访问无兼容性问题
3. **Auth集成**: 使用Supabase Auth生成JWT Token，Spring Boot通过JWT验证用户身份，满足认证需求（不依赖Row Level Security，在应用层实现权限控制）
4. **宪章合规**: 宪章要求"Supabase为主要数据源"，使用JPA直接连接PostgreSQL符合此原则（未引入额外数据库）

**实现细节**:
```java
// application.yml 配置
spring:
  datasource:
    url: jdbc:postgresql://<supabase-host>:5432/postgres
    username: <supabase-user>
    password: <supabase-password>
  jpa:
    hibernate:
      ddl-auto: validate  // 生产环境使用 validate，开发环境使用 update
    show-sql: true

// Entity 定义
@Entity
@Table(name = "reservation_settings")
public class ReservationSettings {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "store_id", nullable = false, unique = true)
    private UUID storeId;

    @Type(JsonBinaryType.class)  // Hibernate JSONB 支持
    @Column(name = "time_slots", columnDefinition = "jsonb")
    private List<TimeSlot> timeSlots;

    // ... other fields
}

// Repository
public interface ReservationSettingsRepository extends JpaRepository<ReservationSettings, UUID> {
    Optional<ReservationSettings> findByStoreId(UUID storeId);
}
```

---

### 4. Ant Design Form 复杂表单设计

**问题**: 如何使用Ant Design Form + React Hook Form处理复杂的嵌套表单（时间段列表、条件渲染的押金配置）？

**调研方案**:

**方案A: Ant Design Form.List + useFieldArray**
- 使用Ant Design的Form.List组件管理动态表单项（7个时间段）
- 结合React Hook Form的useFieldArray处理数组字段
- 优点：官方推荐方案，文档完善
- 缺点：需要处理Ant Design Form和React Hook Form的双重状态同步

**方案B: 自定义表单组件 + Zustand状态管理**
- 放弃React Hook Form，使用Zustand管理表单状态
- 自定义验证逻辑
- 优点：完全控制状态管理，灵活性高
- 缺点：重复造轮子，增加维护成本

**方案C: Ant Design Form (受控模式) + Zod验证**
- 使用Ant Design Form的受控模式（value + onChange）
- 使用Zod定义验证schema，在onFinish时验证
- 优点：简化状态管理，Ant Design组件与Zod验证解耦
- 缺点：失去React Hook Form的实时验证特性

**决策**: **使用方案A（Ant Design Form.List + React Hook Form）**

**理由**:
1. **官方最佳实践**: Ant Design官方文档推荐Form.List处理动态表单，React Hook Form提供良好的表单状态管理
2. **实时验证**: React Hook Form支持实时验证和错误提示，提升用户体验（例如startTime必须早于endTime的实时校验）
3. **类型安全**: React Hook Form + Zod提供完整的TypeScript类型推导，减少运行时错误
4. **宪章合规**: 宪章要求使用React Hook Form + Zod进行表单处理

**实现细节**:
```tsx
// 时间段配置表单
import { Form } from 'antd';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod 验证 schema
const timeSlotSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
}).refine(data => data.startTime < data.endTime, {
  message: '开始时间必须早于结束时间',
  path: ['endTime'],
});

const reservationSettingsSchema = z.object({
  timeSlots: z.array(timeSlotSchema).length(7),
  minAdvanceHours: z.number().int().positive(),
  maxAdvanceDays: z.number().int().positive(),
  durationUnit: z.enum([1, 2, 4]),
  depositRequired: z.boolean(),
  depositAmount: z.number().nonnegative().optional(),
  depositPercentage: z.number().int().min(0).max(100).optional(),
}).refine(data => data.maxAdvanceDays * 24 > data.minAdvanceHours, {
  message: '最大提前天数必须大于最小提前小时数',
  path: ['maxAdvanceDays'],
});

// 组件实现
const ReservationSettingsForm = () => {
  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(reservationSettingsSchema),
    defaultValues: {
      timeSlots: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i + 1,
        startTime: '09:00',
        endTime: '21:00',
      })),
      // ... other defaults
    },
  });

  const { fields } = useFieldArray({ control, name: 'timeSlots' });
  const depositRequired = watch('depositRequired');

  return (
    <Form onFinish={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <TimeSlotFormItem key={field.id} control={control} index={index} />
      ))}
      {/* 条件渲染押金配置 */}
      {depositRequired && <DepositFormItem control={control} />}
    </Form>
  );
};
```

---

### 5. API 响应格式标准化

**问题**: 如何确保API响应格式符合宪章要求的统一标准（ApiResponse包装）？

**调研方案**:

**方案A: Controller层手动包装**
- 每个Controller方法手动返回`ApiResponse.success(data)`或`ApiResponse.failure()`
- 优点：显式控制，灵活性高
- 缺点：重复代码，容易遗漏

**方案B: AOP全局拦截**
- 使用Spring AOP拦截所有Controller方法，自动包装返回值
- 优点：统一处理，无重复代码
- 缺点：隐式行为，调试困难

**方案C: @RestControllerAdvice + ResponseBodyAdvice**
- 使用Spring的ResponseBodyAdvice接口全局处理响应
- 优点：官方推荐方案，清晰明确
- 缺点：需要处理已包装的响应（避免双重包装）

**决策**: **使用方案C（ResponseBodyAdvice）+ Controller层显式包装关键端点**

**理由**:
1. **最佳实践**: Spring官方推荐使用ResponseBodyAdvice实现全局响应处理
2. **灵活性**: 对于简单的CRUD端点使用自动包装，复杂业务逻辑手动包装以保留控制力
3. **宪章合规**: 确保所有API响应符合`ApiResponse<T>`格式，前端类型定义一致

**实现细节**:
```java
// ApiResponse 统一响应格式
@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private String timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, "Success", Instant.now().toString());
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, null, message, Instant.now().toString());
    }
}

// ResponseBodyAdvice 全局包装
@RestControllerAdvice
public class ApiResponseAdvice implements ResponseBodyAdvice<Object> {
    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        // 仅包装未被 @NoWrap 注解的方法
        return !returnType.hasMethodAnnotation(NoWrap.class);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType,
                                   MediaType selectedContentType,
                                   Class selectedConverterType,
                                   ServerHttpRequest request,
                                   ServerHttpResponse response) {
        if (body instanceof ApiResponse) {
            return body; // 已包装，直接返回
        }
        return ApiResponse.success(body);
    }
}

// Controller 示例
@RestController
@RequestMapping("/api/reservation-settings")
public class ReservationSettingsController {
    @GetMapping("/{storeId}")
    public ReservationSettings getByStoreId(@PathVariable UUID storeId) {
        // 自动包装为 ApiResponse<ReservationSettings>
        return reservationSettingsService.findByStoreId(storeId);
    }

    @PutMapping("/{storeId}")
    public ReservationSettings update(@PathVariable UUID storeId,
                                        @RequestBody @Valid ReservationSettingsDTO dto) {
        // 自动包装为 ApiResponse<ReservationSettings>
        return reservationSettingsService.update(storeId, dto);
    }
}
```

---

## Summary

### Key Decisions

| 决策点 | 选择方案 | 主要理由 |
|-------|---------|---------|
| Time Slots 存储 | JSONB字段 | 读多写少场景，原子性更新，简化架构 |
| 审计日志 | 简化审计（时间戳+修改人） | 满足当前需求，降低复杂度，可扩展 |
| Spring Boot集成 | JPA + PostgreSQL JDBC | 团队熟悉度高，符合宪章，支持标准ORM |
| 表单设计 | Ant Design Form.List + React Hook Form | 官方最佳实践，实时验证，类型安全 |
| API响应格式 | ResponseBodyAdvice全局包装 | 统一标准，减少重复代码 |

### Risks & Mitigation

| 风险 | 缓解措施 |
|-----|---------|
| JSONB字段验证复杂 | 前端使用Zod严格验证，后端使用@Valid + 自定义校验器双重校验 |
| JPA绕过Supabase RLS | 在应用层实现权限控制（通过JWT验证用户角色） |
| 表单状态同步问题 | 使用React Hook Form统一状态管理，避免Zustand和Form双重状态 |

### Next Steps

1. 基于research.md决策，生成data-model.md（定义Entity结构和关系）
2. 生成contracts/（定义API端点规范和OpenAPI schema）
3. 生成quickstart.md（开发环境搭建和本地调试指南）
