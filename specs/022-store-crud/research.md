# Research & Technical Decisions: 门店管理 - 增删改功能

**Feature**: 022-store-crud
**Date**: 2025-12-22
**Status**: Completed

## Overview

本文档记录了门店管理CRUD功能的技术调研和架构决策过程,确保所有技术选型都基于明确的评估和权衡。本功能扩展 014-hall-store-backend 的只读门店管理页面,增加完整的增删改操作,并引入 StoreOperationLog 实体实现审计日志。

## Research Areas

### 1. Store Status Enum Modeling

**问题**: 门店状态字段(ACTIVE/INACTIVE)应使用数据库级ENUM类型、VARCHAR + CHECK约束,还是单独的状态表?

**调研方案**:

**方案A: PostgreSQL ENUM 类型**
- 结构: `CREATE TYPE store_status AS ENUM ('ACTIVE', 'INACTIVE')`
- 优点:
  - 数据库原生类型检查,性能优异
  - 查询优化器可以利用ENUM顺序进行优化
  - 避免无效值插入(数据库级保护)
- 缺点:
  - ALTER TYPE较为复杂(需要先删除依赖,添加新值,重建依赖)
  - ORM映射需要额外配置(如Hibernate @Enumerated)
  - 数据库迁移脚本较复杂

**方案B: VARCHAR + CHECK 约束**
- 结构: `ALTER TABLE stores ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))`
- 优点:
  - 灵活性高,易于扩展新状态(修改CHECK约束即可)
  - ORM映射简单(Spring Boot自动映射String到VARCHAR)
  - 数据库迁移脚本简洁
- 缺点:
  - 存储空间略大(VARCHAR vs ENUM内部编码)
  - 无数据库级类型检查(仅依赖CHECK约束)

**方案C: 独立状态表 `store_statuses`**
- 结构: `store_statuses (id, name)` + `stores.status_id FK到store_statuses.id`
- 优点:
  - 完全动态化,可通过界面管理状态列表
  - 支持状态的额外属性(如display_name, color, icon)
- 缺点:
  - 过度设计(仅2个状态值不值得独立表)
  - 查询需要JOIN,性能略差
  - 增加数据模型复杂度

**决策**: **使用方案B(VARCHAR + CHECK约束)**

**理由**:
1. **扩展性考虑**: 未来可能增加 PENDING(待审核)、ARCHIVED(归档) 等状态,VARCHAR方案修改CHECK约束即可,无需复杂的ENUM迁移
2. **ORM兼容性**: Spring Boot + JPA对VARCHAR的支持最简单,仅需定义Java enum + @Enumerated(EnumType.STRING)
3. **团队熟悉度**: VARCHAR + CHECK约束是标准SQL特性,团队成员熟悉度高
4. **MVP原则**: 当前需求仅2个状态,独立表属于过度设计
5. **性能权衡**: ACTIVE/INACTIVE两个状态的存储空间差异可忽略不计(VARCHAR(20) vs ENUM约节省4-6字节/行)

**实现细节**:
```sql
-- 数据库迁移脚本
ALTER TABLE stores
ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));

-- 为status列创建索引(用于过滤查询,如只查询ACTIVE门店)
CREATE INDEX idx_stores_status ON stores(status);
```

```java
// Java枚举定义
public enum StoreStatus {
    ACTIVE,
    INACTIVE
}

// JPA实体映射
@Entity
@Table(name = "stores")
public class Store {
    // ...
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StoreStatus status = StoreStatus.ACTIVE;
    // ...
}
```

---

### 2. Audit Logging Strategy

**问题**: 如何记录门店操作日志(创建、编辑、状态变更、删除)?使用数据库触发器还是应用层日志?

**调研方案**:

**方案A: PostgreSQL 触发器**
- 使用Supabase的`before_update/after_update`触发器自动记录变更
- 优点:
  - 完全在数据库层实现,应用层无需额外代码
  - 即使应用层绕过Service直接操作数据库,也能记录日志
  - 性能优异(数据库内存中直接处理)
- 缺点:
  - 触发器调试困难(需要查看PostgreSQL日志)
  - 难以获取应用层上下文(如当前用户ID、IP地址、操作原因)
  - 代码可维护性差(逻辑分散在应用层和数据库层)

**方案B: Spring AOP 切面**
- 使用@Aspect拦截StoreService的@Transactional方法
- 优点:
  - 解耦审计逻辑,业务代码无需显式调用日志记录
  - 可轻松获取应用层上下文(SecurityContext获取用户、HttpServletRequest获取IP)
  - 统一处理多个Service(通过通配符切点表达式)
- 缺点:
  - AOP配置复杂,学习曲线较陡
  - 切点表达式需谨慎设计(避免误拦截或遗漏)
  - 事务管理需注意(审计日志失败是否回滚业务操作?)

**方案C: 应用层显式调用**
- 在StoreService的每个CRUD方法中显式调用 `storeOperationLogService.log()`
- 优点:
  - 逻辑清晰,易于理解和调试
  - 完全控制日志记录时机(如delete操作成功后才记录)
  - 单元测试简单(直接mock StoreOperationLogService)
- 缺点:
  - 代码重复(每个方法都需要调用log())
  - 容易遗漏(新增方法时忘记添加日志调用)

**决策**: **使用方案C(应用层显式调用)**

**理由**:
1. **可调试性**: 显式调用的代码路径清晰,出现问题时容易排查(触发器调试需要查看PostgreSQL日志,AOP需要理解切点表达式)
2. **上下文丰富性**: 应用层可轻松获取当前用户ID(从SecurityContext)、IP地址(从HttpServletRequest)、操作原因(如delete时的remark)
3. **事务控制**: 可明确控制审计日志的事务行为(如delete操作失败时不记录DELETE日志)
4. **团队能力**: Spring AOP虽强大但学习曲线陡,团队成员熟悉度不一,显式调用降低复杂度
5. **MVP原则**: 当前需求仅4个操作(create/update/status/delete),代码重复可接受,未来若扩展到更多操作再考虑AOP重构

**实现细节**:
```java
// StoreService示例
@Service
@Transactional
public class StoreService {
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private StoreOperationLogService logService;
    @Autowired
    private SecurityContext securityContext;  // 假设有Spring Security集成

    public Store createStore(CreateStoreDTO dto) {
        Store store = new Store();
        // ... 设置字段
        Store savedStore = storeRepository.save(store);

        // 记录审计日志
        logService.logCreate(savedStore, getCurrentUser(), getClientIp());
        return savedStore;
    }

    public Store updateStore(UUID id, UpdateStoreDTO dto) {
        Store store = storeRepository.findById(id).orElseThrow();
        Store beforeValue = store.clone();  // 深拷贝修改前状态

        // ... 应用更新
        Store updatedStore = storeRepository.save(store);

        // 记录审计日志(包含修改前后的值)
        logService.logUpdate(updatedStore, beforeValue, getCurrentUser(), getClientIp());
        return updatedStore;
    }

    // 辅助方法获取当前用户和IP
    private String getCurrentUser() {
        return securityContext.getAuthentication().getName();
    }

    private String getClientIp() {
        // 从HttpServletRequest获取IP(需注入)
        return "127.0.0.1";  // 示例
    }
}
```

---

### 3. Delete Safety Checks

**问题**: 删除门店前如何检查关联数据(影厅、预约设置、预约记录)?使用数据库外键约束还是应用层查询?

**调研方案**:

**方案A: 数据库外键 ON DELETE RESTRICT**
- 在halls/reservation_settings表的store_id外键上设置 `ON DELETE RESTRICT`
- 优点:
  - 数据库层保证数据完整性,即使应用层绕过检查也无法删除
  - 性能优异(数据库内核级检查)
- 缺点:
  - 错误信息不友好(PostgreSQL返回的constraint violation错误难以定制)
  - 无法区分具体原因(是因为有影厅还是有预约记录?)
  - 应用层需要捕获SQLException并解析错误信息

**方案B: 应用层手动查询**
- 在deleteStore方法中先执行 `SELECT COUNT(*) FROM halls WHERE store_id = ?`
- 优点:
  - 错误信息可定制(如"该门店有3个影厅,请先删除影厅再删除门店")
  - 可区分不同依赖类型(影厅、预约设置、预约记录)
  - 前端可根据错误类型显示不同提示
- 缺点:
  - 性能略差(需要额外的SELECT查询)
  - 存在竞态条件(检查通过后,删除前可能有新关联数据插入)

**方案C: 组合方案(数据库约束 + 应用层查询)**
- 应用层先查询关联数据,提供友好错误信息
- 数据库外键作为最后防线,确保数据完整性
- 优点:
  - 兼具友好性和安全性
  - 防止竞态条件导致的数据不一致
- 缺点:
  - 实现复杂度略高(需要同时维护应用层和数据库层逻辑)

**决策**: **使用方案C(组合方案)**

**理由**:
1. **用户体验**: 应用层查询提供明确的错误信息(如"该门店有3个影厅,请先删除影厅"),优于数据库通用错误信息
2. **数据完整性**: 数据库外键约束作为最后防线,即使应用层逻辑有bug也能保证数据不被错误删除
3. **竞态条件**: 组合方案避免check-then-delete的竞态条件(应用层检查通过后,删除前可能有新影厅创建)
4. **规格要求**: FR-008明确要求"违反任一条件则阻止删除并提示原因",需要应用层详细检查

**实现细节**:
```java
// StoreService.deleteStore示例
public void deleteStore(UUID id) {
    Store store = storeRepository.findById(id).orElseThrow(StoreNotFoundException::new);

    // 检查关联的影厅
    long hallCount = hallRepository.countByStoreId(id);
    if (hallCount > 0) {
        throw new StoreHasDependenciesException(
            String.format("该门店有%d个影厅,请先删除影厅再删除门店", hallCount)
        );
    }

    // 检查关联的预约设置
    boolean hasReservationSettings = reservationSettingsRepository.existsByStoreId(id);
    if (hasReservationSettings) {
        throw new StoreHasDependenciesException("该门店有预约设置,请先删除预约设置再删除门店");
    }

    // 检查预约记录(假设有bookings表)
    long bookingCount = bookingRepository.countByStoreId(id);
    if (bookingCount > 0) {
        throw new StoreHasDependenciesException(
            String.format("该门店有%d条预约记录,无法删除。建议使用停用功能代替删除", bookingCount)
        );
    }

    // 所有检查通过,执行删除(数据库外键作为最后防线)
    storeRepository.delete(store);
    logService.logDelete(store, getCurrentUser(), getClientIp());
}
```

```sql
-- 数据库外键约束(已存在于014/016的迁移脚本中,此处强调ON DELETE RESTRICT)
ALTER TABLE halls
ADD CONSTRAINT fk_halls_store_id
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT;

ALTER TABLE reservation_settings
ADD CONSTRAINT fk_reservation_settings_store_id
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT;
```

---

### 4. Form Validation Strategy

**问题**: 表单验证应仅在客户端(Zod)还是同时在客户端和服务器端(Zod + Bean Validation)?

**调研方案**:

**方案A: 仅客户端Zod验证**
- 前端使用React Hook Form + Zod进行验证
- 后端信任前端验证结果,不做重复验证
- 优点:
  - 实现简单,避免验证逻辑重复
  - 性能优异(仅一次验证,客户端完成)
- 缺点:
  - 安全风险(恶意用户绕过前端直接调用API)
  - 数据完整性无法保证(如前端bug导致无效数据提交)

**方案B: Zod + Bean Validation 双重验证**
- 前端使用Zod提供即时反馈
- 后端使用Spring Boot Bean Validation (@Valid, @NotNull, @Pattern)进行二次验证
- 优点:
  - 安全性高(后端验证防止恶意用户绕过前端)
  - 数据完整性保证(后端作为最后防线)
  - 符合防御性编程原则(不信任客户端输入)
- 缺点:
  - 验证逻辑重复(前后端都需要定义验证规则)
  - 维护成本略高(修改验证规则需同步更新前后端)

**方案C: Zod + 自定义验证器**
- 前端使用Zod验证
- 后端使用自定义StoreValidator类进行业务逻辑验证(如唯一性检查)
- 优点:
  - 灵活性高(可实现Bean Validation无法表达的复杂逻辑)
  - 解耦验证逻辑和实体定义
- 缺点:
  - 标准化程度低(Bean Validation是Spring标准方案)
  - 错误处理需要额外封装(Bean Validation自动返回400错误)

**决策**: **使用方案B(Zod + Bean Validation双重验证)**

**理由**:
1. **安全第一**: 后端验证是防止恶意用户绕过前端的必要措施,符合OWASP安全最佳实践
2. **宪章合规**: 宪章要求"使用Zod进行数据验证",并强调"代码质量与工程化",双重验证符合高标准要求
3. **类型安全**: Bean Validation与JPA实体定义结合,利用Java注解提供编译时类型检查
4. **错误处理统一**: Spring Boot的@ControllerAdvice可统一处理MethodArgumentNotValidException,返回标准化错误响应
5. **维护成本可控**: 验证规则变更频率低(如电话号码格式),前后端同步维护的成本可接受

**实现细节**:
```typescript
// 前端Zod schema
import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(1, '门店名称不能为空').max(100, '门店名称不能超过100字符'),
  region: z.string().min(1, '区域不能为空'),
  city: z.string().min(1, '城市不能为空'),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().min(1, '地址不能为空'),
  phone: z.string().regex(
    /^(1[3-9]\d{9}|0\d{2,3}-\d{7,8})$/,
    '请输入有效的电话号码(手机号或座机号)'
  ),
});
```

```java
// 后端Bean Validation
@Data
public class CreateStoreDTO {
    @NotBlank(message = "门店名称不能为空")
    @Size(max = 100, message = "门店名称不能超过100字符")
    private String name;

    @NotBlank(message = "区域不能为空")
    private String region;

    @NotBlank(message = "城市不能为空")
    private String city;

    private String province;
    private String district;

    @NotBlank(message = "地址不能为空")
    private String address;

    @NotBlank(message = "电话号码不能为空")
    @Pattern(
        regexp = "^(1[3-9]\\d{9}|0\\d{2,3}-\\d{7,8})$",
        message = "请输入有效的电话号码(手机号或座机号)"
    )
    private String phone;
}

// Controller使用@Valid触发验证
@PostMapping
public ResponseEntity<ApiResponse<Store>> createStore(@Valid @RequestBody CreateStoreDTO dto) {
    // Bean Validation自动验证,失败时抛出MethodArgumentNotValidException
    Store store = storeService.createStore(dto);
    return ResponseEntity.status(201).body(ApiResponse.success(store));
}
```

---

### 5. Concurrent Edit Handling

**问题**: 如何处理并发编辑冲突(两个运营人员同时编辑同一门店)?

**调研方案**:

**方案A: 乐观锁(@Version字段)**
- 在Store实体添加@Version字段(Long version)
- JPA自动在UPDATE时检查版本号,不匹配则抛出OptimisticLockException
- 优点:
  - 防止丢失更新(lost update)问题
  - 性能优异(无需锁表,仅在UPDATE时检查)
  - Spring Data JPA原生支持
- 缺点:
  - 需要前端传递version字段(增加API复杂度)
  - 冲突时用户体验略差(需要重新填写表单)

**方案B: 最后写入覆盖(Last-Write-Wins)**
- 不做冲突检测,后提交的修改直接覆盖先提交的修改
- 优点:
  - 实现最简单,无需额外字段
  - 用户体验好(无冲突提示)
- 缺点:
  - 可能导致丢失更新(用户A的修改被用户B覆盖,用户A不知情)
  - 不符合宪章"并发编辑冲突时提示用户"的要求

**方案C: 悲观锁(SELECT FOR UPDATE)**
- 编辑时锁定记录,其他用户无法同时编辑
- 优点:
  - 绝对避免冲突(同一时间只有一个用户能编辑)
- 缺点:
  - 性能差(长时间持有锁会阻塞其他用户)
  - 实现复杂(需要管理锁的获取和释放)
  - 用户体验差(编辑时其他用户被阻塞)

**决策**: **使用方案A(乐观锁 @Version字段)**

**理由**:
1. **规格要求**: spec.md的Edge Cases明确提到"并发编辑冲突需要提示用户",乐观锁符合此要求
2. **数据完整性**: 防止丢失更新问题,确保每次修改都基于最新数据
3. **性能考虑**: 门店编辑频率不高,乐观锁的重试成本可接受
4. **用户体验**: 冲突时前端可显示友好提示"门店信息已被他人修改,请刷新后重试",并自动刷新最新数据
5. **Spring生态**: Spring Data JPA对@Version的支持成熟,仅需添加一个字段即可

**实现细节**:
```java
// Store实体添加version字段
@Entity
@Table(name = "stores")
public class Store {
    // ...
    @Version
    @Column(name = "version")
    private Long version;
    // ...
}
```

```java
// StoreService处理OptimisticLockException
public Store updateStore(UUID id, UpdateStoreDTO dto) {
    try {
        Store store = storeRepository.findById(id).orElseThrow();
        // 检查version是否匹配
        if (!store.getVersion().equals(dto.getVersion())) {
            throw new OptimisticLockException("门店信息已被他人修改,请刷新后重试");
        }
        // ... 应用更新
        return storeRepository.save(store);
    } catch (OptimisticLockException e) {
        throw new StoreConflictException("门店信息已被他人修改,请刷新后重试");
    }
}
```

```typescript
// 前端处理冲突错误
const { mutate: updateStore } = useUpdateStore({
  onError: (error) => {
    if (error.response?.data?.error === 'OPTIMISTIC_LOCK_EXCEPTION') {
      message.error('门店信息已被他人修改,请刷新后重试');
      queryClient.invalidateQueries(['stores']);  // 刷新列表获取最新数据
    }
  },
});
```

---

### 6. Phone Number Validation

**问题**: 电话号码验证规则是什么?如何同时支持手机号和座机号?

**调研方案**:

**手机号格式**: `^1[3-9]\\d{9}$`
- 解释: 11位数字,第一位是1,第二位是3-9,后9位是任意数字
- 示例: 13912345678, 18800001111

**座机号格式**: `^0\\d{2,3}-\\d{7,8}$`
- 解释: 以0开头,后跟2-3位区号(如010, 021, 0755),连字符,后跟7-8位号码
- 示例: 010-12345678, 021-1234567, 0755-12345678

**组合正则**:
```regex
^(1[3-9]\d{9}|0\d{2,3}-\d{7,8})$
```

**决策**: 使用组合正则同时验证手机号和座机号

**理由**:
1. **规格要求**: spec.md的Assumptions明确要求"支持手机号和座机,使用正则表达式验证"
2. **用户体验**: 一个输入框同时接受两种格式,简化表单设计
3. **覆盖常见格式**: 中国大陆99%的电话号码符合此规则

**实现细节**:
```typescript
// Zod schema
phone: z.string().regex(
  /^(1[3-9]\d{9}|0\d{2,3}-\d{7,8})$/,
  '请输入有效的电话号码(手机号11位或座机号如010-12345678)'
),
```

```java
// Bean Validation
@Pattern(
    regexp = "^(1[3-9]\\d{9}|0\\d{2,3}-\\d{7,8})$",
    message = "请输入有效的电话号码(手机号11位或座机号如010-12345678)"
)
private String phone;
```

---

### 7. Region/City Data Source

**问题**: 区域和城市数据是硬编码下拉选项还是从数据库表读取?

**调研方案**:

**方案A: 静态TypeScript常量**
- 在 `frontend/src/constants/regions.ts` 定义区域和城市列表
- 优点:
  - 实现简单,无需额外API
  - 前端加载速度快(无网络请求)
  - MVP阶段足够用
- 缺点:
  - 修改需要重新部署前端
  - 后端无法验证region/city有效性(仅前端限制)

**方案B: 数据库表 + API**
- 创建 `regions` 和 `cities` 表,提供 `GET /api/regions` 和 `GET /api/cities` 接口
- 优点:
  - 动态管理,无需重新部署
  - 后端可验证region/city有效性(通过外键)
  - 支持后台管理界面修改区域列表
- 缺点:
  - 过度设计(区域列表变更频率极低)
  - 增加数据库表和API端点

**方案C: JSON配置文件**
- 在 `public/config/regions.json` 定义区域列表,前端通过fetch加载
- 优点:
  - 修改配置无需重新部署前端(仅替换JSON文件)
  - 无需数据库和API
- 缺点:
  - 前端需要处理异步加载(loading状态)
  - 后端仍无法验证有效性

**决策**: **使用方案A(静态TypeScript常量),未来按需迁移到方案B**

**理由**:
1. **MVP原则**: 区域列表变更频率极低(如"华北"、"华东"基本不变),静态常量满足MVP需求
2. **性能优先**: 避免额外的网络请求和数据库查询
3. **实现简单**: 前端直接import regions即可,无需处理loading/error状态
4. **可扩展性**: 若未来需要动态管理,可平滑迁移到方案B(仅需将常量替换为API调用)

**实现细节**:
```typescript
// frontend/src/constants/regions.ts
export const REGIONS = [
  { label: '华北', value: 'north' },
  { label: '华东', value: 'east' },
  { label: '华南', value: 'south' },
  { label: '华中', value: 'central' },
  { label: '西南', value: 'southwest' },
  { label: '西北', value: 'northwest' },
  { label: '东北', value: 'northeast' },
];

export const CITIES = {
  north: ['北京', '天津', '石家庄', '太原'],
  east: ['上海', '南京', '杭州', '合肥'],
  south: ['广州', '深圳', '福州', '南宁'],
  // ...
};
```

---

## Summary

### Key Decisions

| 决策点 | 选择方案 | 主要理由 |
|-------|---------|---------|
| Store Status Enum | VARCHAR + CHECK约束 | 扩展性好,ORM兼容性强,修改简单 |
| Audit Logging | 应用层显式调用 | 逻辑清晰,上下文丰富,易于调试 |
| Delete Safety Checks | 组合方案(应用层查询 + 数据库约束) | 友好错误信息 + 数据完整性保证 |
| Form Validation | Zod + Bean Validation双重验证 | 安全第一,防止恶意用户绕过前端 |
| Concurrent Edit | 乐观锁(@Version字段) | 防止丢失更新,性能优异,JPA原生支持 |
| Phone Validation | 组合正则(手机号+座机号) | 支持两种格式,用户体验好 |
| Region/City Data | 静态TypeScript常量 | MVP简单实现,未来可扩展为数据库 |

### Risks & Mitigation

| 风险 | 缓解措施 |
|-----|---------|
| 乐观锁冲突频繁 | 前端显示友好提示并自动刷新最新数据,降低用户重填成本 |
| 审计日志事务失败 | 审计日志失败不回滚业务操作(使用@Transactional(propagation=REQUIRES_NEW)独立事务) |
| 删除检查竞态条件 | 数据库外键约束作为最后防线,确保数据完整性 |
| 静态区域列表变更 | 通过环境变量或配置文件控制区域列表,未来迁移到数据库API |
| 电话号码格式覆盖不全 | 正则规则覆盖99%常见格式,特殊格式可通过后台数据库直接修改 |

### Next Steps

1. 基于research.md决策,生成data-model.md(定义Store和StoreOperationLog实体结构)
2. 生成contracts/api.yaml(定义CRUD端点的OpenAPI规范)
3. 生成quickstart.md(本地开发环境搭建和测试指南)
