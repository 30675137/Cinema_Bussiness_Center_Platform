# Implementation Tasks: 预约单管理系统

**Feature**: U001-reservation-order-management
**Branch**: `U001-reservation-order-management`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task Execution Principles

1. **Test-Driven Development (TDD)**: 每个实现任务必须先编写测试
2. **Red-Green-Refactor**: 先写失败的测试(Red) → 实现最小代码通过测试(Green) → 重构优化(Refactor)
3. **Parallel Execution**: 标记[P]的任务可以并行执行
4. **Dependency Order**: 任务按依赖关系排序,依赖项必须先完成
5. **Atomic Tasks**: 每个任务2-4小时可完成
6. **Verifiable Acceptance**: 每个任务有明确的完成标准

---

## Phase 0: Research & Setup (研究与准备)

### Task 0.1: 研究现有依赖模块API [P]
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: None

**Description**:
调研项目中现有的依赖模块(场景包管理、时段库存管理、用户管理)的API契约和数据结构,为预约单集成做准备。

**Acceptance Criteria**:
- [ ] 记录`scenario_packages`表结构和查询API
- [ ] 记录`package_tiers`表结构和套餐价格获取方式
- [ ] 记录`addon_items`表结构和加购项数据格式
- [ ] 记录`time_slot_templates`表结构和库存查询API
- [ ] 记录`users`表结构和用户认证机制(JWT)
- [ ] 创建`research.md`文档记录所有依赖API
- [ ] 验证Supabase是否启用UUID扩展: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

**Files**:
- `specs/U001-reservation-order-management/research.md` (new)

---

### Task 0.2: 设计预约单号生成算法 [P]
**Priority**: P1
**Estimated Time**: 1.5h
**Dependencies**: None

**Description**:
设计并实现预约单号生成算法,格式为`R + yyyyMMddHHmmss + 4位随机数`,确保分布式环境下的唯一性。

**Acceptance Criteria**:
- [ ] 编写预约单号生成算法伪代码
- [ ] 验证格式: R202512231530001234 (19位固定长度)
- [ ] 考虑并发场景下的唯一性(时间戳+随机数)
- [ ] 记录算法到`research.md`的"预约单号生成规则"章节
- [ ] 确认数据库UNIQUE约束作为最终保障

**Files**:
- `specs/U001-reservation-order-management/research.md` (update)

---

### Task 0.3: 绘制状态机图并验证边界情况
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: None

**Description**:
绘制完整的预约单状态转换图,验证所有状态转换路径和边界情况,包括支付可选性的两条路径。

**Acceptance Criteria**:
- [ ] 绘制状态机图: PENDING → CONFIRMED → COMPLETED (支付路径)
- [ ] 绘制状态机图: PENDING → COMPLETED (直接完成路径)
- [ ] 绘制状态机图: 任意状态 → CANCELLED
- [ ] 列出所有非法状态转换(如COMPLETED → PENDING)
- [ ] 验证24小时超时自动取消的触发条件
- [ ] 创建状态转换验证表记录到`research.md`

**Files**:
- `specs/U001-reservation-order-management/research.md` (update)

---

## Phase 1: Database & Backend Foundation (数据库与后端基础)

### Task 1.1: 编写数据库迁移脚本测试
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 0.1

**Description**:
编写Testcontainers集成测试,验证数据库迁移脚本的正确性,包括表结构、索引、约束等。

**Acceptance Criteria**:
- [ ] 创建`DatabaseMigrationTest.java`测试类
- [ ] 测试`reservation_orders`表创建成功,包含所有字段
- [ ] 测试`reservation_items`表创建成功,外键关联正确
- [ ] 测试`reservation_operation_logs`表创建成功
- [ ] 测试`slot_inventory_snapshots`表创建成功
- [ ] 测试所有索引创建成功(idx_reservation_user, idx_reservation_status等)
- [ ] 测试CHECK约束生效(status枚举, 手机号格式, total_amount > 0)
- [ ] 测试UNIQUE约束生效(order_number)
- [ ] 测试运行通过: `mvn test -Dtest=DatabaseMigrationTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/DatabaseMigrationTest.java` (new)

---

### Task 1.2: 实现数据库迁移脚本
**Priority**: P1
**Estimated Time**: 3h
**Dependencies**: Task 1.1

**Description**:
创建Flyway数据库迁移脚本,定义4张核心表及其关系、索引和约束。

**Acceptance Criteria**:
- [ ] 创建`VU001_001__create_reservation_tables.sql`
- [ ] 定义`reservation_orders`表(21个字段,包含requiresPayment)
- [ ] 定义`reservation_items`表(7个字段,快照字段)
- [ ] 定义`reservation_operation_logs`表(9个字段,JSONB类型)
- [ ] 定义`slot_inventory_snapshots`表(8个字段)
- [ ] 创建5个索引(user, status, date, number, log)
- [ ] 创建4个CHECK约束(status枚举, 手机号, 金额, 数量)
- [ ] 创建2个UNIQUE约束(order_number, snapshot)
- [ ] 运行迁移成功: `mvn flyway:migrate`
- [ ] Task 1.1测试全部通过

**Files**:
- `backend/src/main/resources/db/migration/VU001_001__create_reservation_tables.sql` (new)

---

### Task 1.3: 编写预约单实体类测试 [P]
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 1.2

**Description**:
编写JUnit测试验证预约单实体类(ReservationOrder)的字段映射、验证注解和状态转换逻辑。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderTest.java`测试类
- [ ] 测试实体字段正确映射到数据库列
- [ ] 测试@Version乐观锁字段存在
- [ ] 测试Jakarta Validation注解(@NotNull, @Pattern等)
- [ ] 测试状态枚举值(PENDING/CONFIRMED/CANCELLED/COMPLETED)
- [ ] 测试requiresPayment默认值为false
- [ ] 测试contact_phone验证正则表达式
- [ ] 测试运行通过: `mvn test -Dtest=ReservationOrderTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/domain/ReservationOrderTest.java` (new)

---

### Task 1.4: 实现预约单实体类 [P]
**Priority**: P1
**Estimated Time**: 2.5h
**Dependencies**: Task 1.3

**Description**:
实现预约单领域模型类(ReservationOrder, ReservationItem, ReservationOperationLog, SlotInventorySnapshot)。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrder.java`实体类
- [ ] 创建`ReservationItem.java`实体类
- [ ] 创建`ReservationOperationLog.java`实体类
- [ ] 创建`SlotInventorySnapshot.java`实体类
- [ ] 创建`ReservationStatus.java`枚举(PENDING/CONFIRMED/CANCELLED/COMPLETED)
- [ ] 创建`OperationType.java`枚举(CREATE/CONFIRM/CANCEL/UPDATE/PAYMENT)
- [ ] 使用@Entity, @Table, @Column注解映射数据库
- [ ] 使用@Version注解实现乐观锁
- [ ] 使用Jakarta Validation注解(@NotNull, @Pattern, @Min等)
- [ ] Task 1.3测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/domain/ReservationOrder.java` (new)
- `backend/src/main/java/com/cinema/reservation/domain/ReservationItem.java` (new)
- `backend/src/main/java/com/cinema/reservation/domain/ReservationOperationLog.java` (new)
- `backend/src/main/java/com/cinema/reservation/domain/SlotInventorySnapshot.java` (new)
- `backend/src/main/java/com/cinema/reservation/domain/enums/ReservationStatus.java` (new)
- `backend/src/main/java/com/cinema/reservation/domain/enums/OperationType.java` (new)

---

### Task 1.5: 编写预约单号生成器测试
**Priority**: P1
**Estimated Time**: 1.5h
**Dependencies**: Task 0.2

**Description**:
编写单元测试验证预约单号生成器的格式正确性和唯一性。

**Acceptance Criteria**:
- [ ] 创建`ReservationNumberGeneratorTest.java`测试类
- [ ] 测试生成的预约单号格式为R+yyyyMMddHHmmss+4位随机数
- [ ] 测试预约单号长度固定19位
- [ ] 测试100次连续生成,验证无重复
- [ ] 测试时间戳部分可解析为有效日期
- [ ] 测试随机数部分为4位数字(0000-9999)
- [ ] 测试运行通过: `mvn test -Dtest=ReservationNumberGeneratorTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/service/ReservationNumberGeneratorTest.java` (new)

---

### Task 1.6: 实现预约单号生成器
**Priority**: P1
**Estimated Time**: 1h
**Dependencies**: Task 1.5

**Description**:
实现预约单号生成器服务类,生成唯一的预约单号。

**Acceptance Criteria**:
- [ ] 创建`ReservationNumberGenerator.java`服务类
- [ ] 使用@Service注解标记为Spring Bean
- [ ] 实现`generate()`方法返回格式化预约单号
- [ ] 使用SimpleDateFormat格式化时间戳(yyyyMMddHHmmss)
- [ ] 使用Random生成4位随机数(0000-9999,补零)
- [ ] 拼接前缀R + 时间戳 + 随机数
- [ ] Task 1.5测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/service/ReservationNumberGenerator.java` (new)

---

### Task 1.7: 编写预约单Repository测试
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 1.4

**Description**:
编写Repository集成测试,验证预约单数据访问层的查询方法。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderRepositoryTest.java`测试类
- [ ] 测试`save()`方法保存预约单成功
- [ ] 测试`findById()`方法查询预约单成功
- [ ] 测试`findByOrderNumber()`方法根据预约单号查询
- [ ] 测试`findByUserId()`方法查询用户的所有预约单
- [ ] 测试`findByStatus()`方法按状态筛选
- [ ] 测试`findByCreatedAtBetween()`方法按日期范围查询
- [ ] 测试乐观锁冲突抛出OptimisticLockException
- [ ] 测试运行通过: `mvn test -Dtest=ReservationOrderRepositoryTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/repository/ReservationOrderRepositoryTest.java` (new)

---

### Task 1.8: 实现预约单Repository
**Priority**: P1
**Estimated Time**: 1.5h
**Dependencies**: Task 1.7

**Description**:
实现预约单Repository接口,提供数据访问方法。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderRepository.java`接口继承JpaRepository
- [ ] 定义`findByOrderNumber(String orderNumber)`方法
- [ ] 定义`findByUserId(UUID userId, Pageable pageable)`方法
- [ ] 定义`findByStatus(ReservationStatus status, Pageable pageable)`方法
- [ ] 定义`findByCreatedAtBetween(LocalDateTime start, LocalDateTime end)`方法
- [ ] 使用@Repository注解标记
- [ ] 创建`ReservationItemRepository.java`接口
- [ ] 创建`ReservationOperationLogRepository.java`接口
- [ ] 创建`SlotInventorySnapshotRepository.java`接口
- [ ] Task 1.7测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/repository/ReservationOrderRepository.java` (new)
- `backend/src/main/java/com/cinema/reservation/repository/ReservationItemRepository.java` (new)
- `backend/src/main/java/com/cinema/reservation/repository/ReservationOperationLogRepository.java` (new)
- `backend/src/main/java/com/cinema/reservation/repository/SlotInventorySnapshotRepository.java` (new)

---

### Task 1.9: 编写库存管理服务测试
**Priority**: P1
**Estimated Time**: 2.5h
**Dependencies**: Task 1.8

**Description**:
编写单元测试验证库存管理服务的扣减和释放逻辑,包括并发控制。

**Acceptance Criteria**:
- [ ] 创建`InventoryServiceTest.java`测试类
- [ ] 测试`checkAvailability()`方法查询库存是否充足
- [ ] 测试`reserveSlot()`方法扣减库存成功
- [ ] 测试库存不足时`reserveSlot()`抛出InsufficientInventoryException
- [ ] 测试`releaseSlot()`方法释放库存成功
- [ ] 测试并发场景下乐观锁生效(使用CompletableFuture模拟)
- [ ] 测试创建库存快照(SlotInventorySnapshot)
- [ ] 测试运行通过: `mvn test -Dtest=InventoryServiceTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/service/InventoryServiceTest.java` (new)

---

### Task 1.10: 实现库存管理服务
**Priority**: P1
**Estimated Time**: 3h
**Dependencies**: Task 1.9

**Description**:
实现库存管理服务,处理时段库存的查询、扣减和释放,使用乐观锁防止超售。

**Acceptance Criteria**:
- [ ] 创建`InventoryService.java`服务类
- [ ] 实现`checkAvailability(UUID slotId, LocalDate date)`方法查询可用库存
- [ ] 实现`reserveSlot(UUID slotId, LocalDate date, UUID orderId)`方法原子性扣减库存
- [ ] 使用数据库层原子UPDATE: `SET capacity = capacity - 1 WHERE id = ? AND capacity > 0`
- [ ] 库存不足时抛出`InsufficientInventoryException`
- [ ] 实现`releaseSlot(UUID slotId, LocalDate date, UUID orderId)`方法释放库存
- [ ] 实现`createSnapshot(UUID slotId, LocalDate date, UUID orderId)`创建库存快照
- [ ] 创建自定义异常`InsufficientInventoryException.java`
- [ ] Task 1.9测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/service/InventoryService.java` (new)
- `backend/src/main/java/com/cinema/reservation/exception/InsufficientInventoryException.java` (new)

---

### Task 1.11: 编写创建预约单服务测试
**Priority**: P1
**Estimated Time**: 3h
**Dependencies**: Task 1.10

**Description**:
编写单元测试验证创建预约单的核心业务逻辑,包括库存扣减、数据验证、操作日志。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderServiceTest.java`测试类
- [ ] 测试`createReservation()`方法成功创建预约单
- [ ] 测试生成唯一的预约单号
- [ ] 测试扣减时段库存
- [ ] 测试保存加购项明细(快照名称和价格)
- [ ] 测试创建库存快照
- [ ] 测试记录操作日志(operation_type=CREATE)
- [ ] 测试计算总金额(套餐价格+加购项小计)
- [ ] 测试库存不足时抛出异常并回滚事务
- [ ] 测试手机号格式验证失败抛出ValidationException
- [ ] 测试运行通过: `mvn test -Dtest=ReservationOrderServiceTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/service/ReservationOrderServiceTest.java` (new)

---

### Task 1.12: 实现创建预约单服务
**Priority**: P1
**Estimated Time**: 4h
**Dependencies**: Task 1.11

**Description**:
实现创建预约单的核心业务逻辑,包括库存扣减、数据保存、操作日志记录。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderService.java`服务类
- [ ] 实现`createReservation(CreateReservationRequest request)`方法
- [ ] 注入`ReservationNumberGenerator`生成预约单号
- [ ] 注入`InventoryService`扣减库存
- [ ] 查询场景包、套餐、加购项数据并计算总金额
- [ ] 保存预约单主记录(status=PENDING, requiresPayment=false默认值)
- [ ] 保存加购项明细(快照名称和价格)
- [ ] 创建库存快照
- [ ] 记录操作日志(operation_type=CREATE, after_value为预约单JSON)
- [ ] 使用@Transactional注解确保事务一致性
- [ ] 创建DTO: `CreateReservationRequest.java`, `ReservationOrderDTO.java`
- [ ] Task 1.11测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/service/ReservationOrderService.java` (new)
- `backend/src/main/java/com/cinema/reservation/dto/CreateReservationRequest.java` (new)
- `backend/src/main/java/com/cinema/reservation/dto/ReservationOrderDTO.java` (new)

---

### Task 1.13: 编写确认预约单服务测试
**Priority**: P1
**Estimated Time**: 2.5h
**Dependencies**: Task 1.12

**Description**:
编写单元测试验证确认预约单的业务逻辑,包括支付可选性的两条路径。

**Acceptance Criteria**:
- [ ] 创建测试方法`testConfirmReservation_WithPayment()`
- [ ] 测试requiresPayment=true时状态变更为CONFIRMED
- [ ] 测试requiresPayment=false时状态直接变更为COMPLETED
- [ ] 测试乐观锁冲突时抛出异常
- [ ] 测试状态非PENDING时抛出InvalidStatusTransitionException
- [ ] 测试记录操作日志(operation_type=CONFIRM, before_value和after_value)
- [ ] 测试发送通知(调用NotificationService)
- [ ] 测试运行通过: `mvn test -Dtest=ReservationOrderServiceTest::testConfirm*`

**Files**:
- `backend/src/test/java/com/cinema/reservation/service/ReservationOrderServiceTest.java` (update)

---

### Task 1.14: 实现确认预约单服务
**Priority**: P1
**Estimated Time**: 2.5h
**Dependencies**: Task 1.13

**Description**:
实现确认预约单的业务逻辑,支持可选支付。

**Acceptance Criteria**:
- [ ] 在`ReservationOrderService`中实现`confirmReservation(UUID id, boolean requiresPayment)`
- [ ] 查询预约单并检查状态必须为PENDING
- [ ] 状态非PENDING时抛出`InvalidStatusTransitionException`
- [ ] 设置`requiresPayment`字段
- [ ] requiresPayment=true时状态变更为CONFIRMED
- [ ] requiresPayment=false时状态直接变更为COMPLETED
- [ ] 记录操作日志(before_value=旧状态JSON, after_value=新状态JSON)
- [ ] 调用`NotificationService.sendConfirmNotification()`发送通知
- [ ] 创建自定义异常`InvalidStatusTransitionException.java`
- [ ] 创建DTO: `ConfirmReservationRequest.java`
- [ ] Task 1.13测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/service/ReservationOrderService.java` (update)
- `backend/src/main/java/com/cinema/reservation/exception/InvalidStatusTransitionException.java` (new)
- `backend/src/main/java/com/cinema/reservation/dto/ConfirmReservationRequest.java` (new)
- `backend/src/main/java/com/cinema/reservation/service/NotificationService.java` (new, interface)

---

### Task 1.15: 编写取消预约单服务测试
**Priority**: P2
**Estimated Time**: 2h
**Dependencies**: Task 1.14

**Description**:
编写单元测试验证取消预约单的业务逻辑,包括库存释放和状态验证。

**Acceptance Criteria**:
- [ ] 创建测试方法`testCancelReservation()`
- [ ] 测试状态变更为CANCELLED
- [ ] 测试记录取消原因
- [ ] 测试释放时段库存
- [ ] 测试记录操作日志(operation_type=CANCEL)
- [ ] 测试状态为COMPLETED时抛出异常(已完成无法取消)
- [ ] 测试发送取消通知
- [ ] 测试运行通过: `mvn test -Dtest=ReservationOrderServiceTest::testCancel*`

**Files**:
- `backend/src/test/java/com/cinema/reservation/service/ReservationOrderServiceTest.java` (update)

---

### Task 1.16: 实现取消预约单服务
**Priority**: P2
**Estimated Time**: 2h
**Dependencies**: Task 1.15

**Description**:
实现取消预约单的业务逻辑,释放库存并记录取消原因。

**Acceptance Criteria**:
- [ ] 在`ReservationOrderService`中实现`cancelReservation(UUID id, String reason)`
- [ ] 查询预约单并检查状态不为COMPLETED
- [ ] 状态为COMPLETED时抛出`InvalidStatusTransitionException`
- [ ] 状态变更为CANCELLED
- [ ] 记录取消原因和取消时间
- [ ] 调用`InventoryService.releaseSlot()`释放库存
- [ ] 记录操作日志(operation_type=CANCEL, remark=取消原因)
- [ ] 调用`NotificationService.sendCancelNotification()`发送通知
- [ ] 创建DTO: `CancelReservationRequest.java`
- [ ] Task 1.15测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/service/ReservationOrderService.java` (update)
- `backend/src/main/java/com/cinema/reservation/dto/CancelReservationRequest.java` (new)

---

### Task 1.17: 编写C端创建预约API测试
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 1.12

**Description**:
编写MockMvc集成测试验证C端创建预约API的请求响应格式。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderClientControllerTest.java`测试类
- [ ] 测试`POST /api/client/reservations`成功响应200
- [ ] 测试响应体符合ApiResponse<ReservationOrderDTO>格式
- [ ] 测试返回的预约单号不为空
- [ ] 测试返回的状态为PENDING
- [ ] 测试库存不足时返回400错误和INSUFFICIENT_INVENTORY错误码
- [ ] 测试手机号格式错误时返回400错误
- [ ] 测试JWT Token无效时返回401错误
- [ ] 测试运行通过: `mvn test -Dtest=ReservationOrderClientControllerTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/controller/ReservationOrderClientControllerTest.java` (new)

---

### Task 1.18: 实现C端创建预约API
**Priority**: P1
**Estimated Time**: 2.5h
**Dependencies**: Task 1.17

**Description**:
实现C端创建预约的REST API端点,处理用户预约请求。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderClientController.java`控制器
- [ ] 实现`POST /api/client/reservations`端点
- [ ] 使用@RestController和@RequestMapping("/api/client/reservations")
- [ ] 从JWT Token解析user_id
- [ ] 调用`ReservationOrderService.createReservation()`
- [ ] 返回ApiResponse<ReservationOrderDTO>格式
- [ ] 捕获InsufficientInventoryException返回400错误
- [ ] 捕获ValidationException返回400错误
- [ ] 捕获其他异常返回500错误
- [ ] Task 1.17测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/controller/ReservationOrderClientController.java` (new)

---

### Task 1.19: 编写B端管理API测试 [P]
**Priority**: P1
**Estimated Time**: 3h
**Dependencies**: Task 1.14, Task 1.16

**Description**:
编写MockMvc集成测试验证B端管理预约API的所有端点。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderControllerTest.java`测试类
- [ ] 测试`GET /api/admin/reservations`列表查询成功
- [ ] 测试`GET /api/admin/reservations/{id}`详情查询成功
- [ ] 测试`POST /api/admin/reservations/{id}/confirm`确认预约成功
- [ ] 测试确认时选择requiresPayment=true状态变为CONFIRMED
- [ ] 测试确认时选择requiresPayment=false状态变为COMPLETED
- [ ] 测试`POST /api/admin/reservations/{id}/cancel`取消预约成功
- [ ] 测试列表查询支持筛选(status, dateRange)和分页
- [ ] 测试运行通过: `mvn test -Dtest=ReservationOrderControllerTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/controller/ReservationOrderControllerTest.java` (new)

---

### Task 1.20: 实现B端管理API [P]
**Priority**: P1
**Estimated Time**: 3.5h
**Dependencies**: Task 1.19

**Description**:
实现B端管理预约的REST API端点,包括列表、详情、确认、取消等操作。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderController.java`控制器
- [ ] 实现`GET /api/admin/reservations`列表查询(支持筛选和分页)
- [ ] 实现`GET /api/admin/reservations/{id}`详情查询
- [ ] 实现`POST /api/admin/reservations/{id}/confirm`确认预约
- [ ] 实现`POST /api/admin/reservations/{id}/cancel`取消预约
- [ ] 所有端点返回统一的ApiResponse格式
- [ ] 列表查询返回ReservationListResponse(data, total, page, pageSize)
- [ ] 使用@PreAuthorize验证运营人员权限
- [ ] 创建DTO: `ReservationListResponse.java`
- [ ] Task 1.19测试全部通过

**Files**:
- `backend/src/main/java/com/cinema/reservation/controller/ReservationOrderController.java` (new)
- `backend/src/main/java/com/cinema/reservation/dto/ReservationListResponse.java` (new)

---

## Phase 2: B端 Management Interface (B端管理界面)

### Task 2.1: 创建预约单TypeScript类型定义
**Priority**: P1
**Estimated Time**: 1.5h
**Dependencies**: Task 1.18, Task 1.20

**Description**:
创建前端TypeScript类型定义,与后端DTO对齐。

**Acceptance Criteria**:
- [ ] 创建`reservation-order.types.ts`文件
- [ ] 定义`ReservationOrder`接口(与后端ReservationOrderDTO一致)
- [ ] 定义`ReservationItem`接口
- [ ] 定义`ReservationStatus`类型('PENDING'|'CONFIRMED'|'CANCELLED'|'COMPLETED')
- [ ] 定义`CreateReservationRequest`接口
- [ ] 定义`ConfirmReservationRequest`接口(包含requiresPayment字段)
- [ ] 定义`CancelReservationRequest`接口
- [ ] 定义`ReservationListResponse`接口
- [ ] 定义`ApiResponse<T>`泛型接口

**Files**:
- `frontend/src/types/reservationOrder.ts` (new)
- `frontend/src/pages/reservation-orders/types/reservation-order.types.ts` (new)

---

### Task 2.2: 创建预约单Zod验证Schema
**Priority**: P1
**Estimated Time**: 1h
**Dependencies**: Task 2.1

**Description**:
使用Zod创建表单验证Schema,确保数据合法性。

**Acceptance Criteria**:
- [ ] 创建`reservation-order.schema.ts`文件
- [ ] 定义`confirmReservationSchema`验证确认表单
- [ ] 定义`cancelReservationSchema`验证取消原因(必填,最多200字符)
- [ ] 定义`updateReservationSchema`验证联系人信息
- [ ] 手机号验证正则: `/^1[3-9]\d{9}$/`
- [ ] 导出所有schema供React Hook Form使用

**Files**:
- `frontend/src/pages/reservation-orders/types/reservation-order.schema.ts` (new)

---

### Task 2.3: 创建预约单API服务模块
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 2.1

**Description**:
封装预约单API调用服务,使用统一的错误处理。

**Acceptance Criteria**:
- [ ] 创建`reservationOrderService.ts`文件
- [ ] 实现`getReservationList(params)`方法(支持筛选和分页)
- [ ] 实现`getReservationDetail(id)`方法
- [ ] 实现`confirmReservation(id, requiresPayment)`方法
- [ ] 实现`cancelReservation(id, reason)`方法
- [ ] 实现`updateReservation(id, data)`方法
- [ ] 使用axios发送请求,自动添加JWT Token
- [ ] 统一处理错误响应(401, 400, 500)
- [ ] 导出ApiResponse<T>类型的返回值

**Files**:
- `frontend/src/pages/reservation-orders/services/reservationOrderService.ts` (new)

---

### Task 2.4: 编写预约单API服务单元测试
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 2.3

**Description**:
编写Vitest单元测试验证API服务的调用逻辑。

**Acceptance Criteria**:
- [ ] 创建`reservationOrderService.test.ts`测试文件
- [ ] 使用vi.mock模拟axios请求
- [ ] 测试`getReservationList()`成功返回列表数据
- [ ] 测试`getReservationDetail()`成功返回详情
- [ ] 测试`confirmReservation()`发送正确的请求参数
- [ ] 测试`cancelReservation()`发送正确的取消原因
- [ ] 测试API错误时抛出异常
- [ ] 测试运行通过: `npm run test -- reservationOrderService.test.ts`

**Files**:
- `frontend/tests/pages/reservation-orders/services/reservationOrderService.test.ts` (new)

---

### Task 2.5: 创建TanStack Query Hooks
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 2.4

**Description**:
使用TanStack Query封装预约单数据查询和变更Hooks。

**Acceptance Criteria**:
- [ ] 创建`useReservationOrders.ts` Hook
- [ ] 使用`useQuery`实现列表查询,queryKey: ['reservations', filters]
- [ ] 创建`useReservationDetail.ts` Hook
- [ ] 使用`useQuery`实现详情查询,queryKey: ['reservation', id]
- [ ] 创建`useOrderOperations.ts` Hook
- [ ] 使用`useMutation`实现确认操作,成功后invalidate查询缓存
- [ ] 使用`useMutation`实现取消操作,成功后invalidate查询缓存
- [ ] 使用`useMutation`实现修改操作
- [ ] 设置staleTime: 5分钟

**Files**:
- `frontend/src/pages/reservation-orders/hooks/useReservationOrders.ts` (new)
- `frontend/src/pages/reservation-orders/hooks/useReservationDetail.ts` (new)
- `frontend/src/pages/reservation-orders/hooks/useOrderOperations.ts` (new)

---

### Task 2.6: 创建MSW Mock数据处理器
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 2.5

**Description**:
创建MSW handlers模拟后端API响应,支持本地开发和测试。

**Acceptance Criteria**:
- [ ] 创建`reservationOrderHandlers.ts`文件
- [ ] Mock `GET /api/admin/reservations`返回分页列表
- [ ] Mock `GET /api/admin/reservations/:id`返回详情
- [ ] Mock `POST /api/admin/reservations/:id/confirm`模拟确认成功
- [ ] Mock `POST /api/admin/reservations/:id/cancel`模拟取消成功
- [ ] 使用内存状态存储模拟数据变更
- [ ] 生成10条测试预约单数据(不同状态)
- [ ] 注册handlers到MSW worker

**Files**:
- `frontend/src/mocks/handlers/reservationOrderHandlers.ts` (new)

---

### Task 2.7: 创建预约单状态徽章组件
**Priority**: P1
**Estimated Time**: 1h
**Dependencies**: Task 2.1

**Description**:
创建可复用的状态徽章组件,显示预约单状态。

**Acceptance Criteria**:
- [ ] 创建`OrderStatusBadge.tsx`组件
- [ ] 使用Ant Design Badge组件
- [ ] PENDING显示黄色"待确认"
- [ ] CONFIRMED显示蓝色"已确认"
- [ ] COMPLETED显示绿色"已完成"
- [ ] CANCELLED显示灰色"已取消"
- [ ] Props接口: `{ status: ReservationStatus }`
- [ ] 使用React.memo优化性能

**Files**:
- `frontend/src/pages/reservation-orders/components/OrderStatusBadge.tsx` (new)

---

### Task 2.8: 编写预约单列表筛选组件测试
**Priority**: P1
**Estimated Time**: 1.5h
**Dependencies**: Task 2.7

**Description**:
编写React Testing Library测试验证筛选组件的交互逻辑。

**Acceptance Criteria**:
- [ ] 创建`OrderFilters.test.tsx`测试文件
- [ ] 测试状态多选组件渲染正确
- [ ] 测试日期范围选择器工作正常
- [ ] 测试搜索框输入触发onChange回调
- [ ] 测试重置按钮清空所有筛选条件
- [ ] 测试筛选条件变更触发onFilterChange回调
- [ ] 测试运行通过: `npm run test -- OrderFilters.test.tsx`

**Files**:
- `frontend/tests/pages/reservation-orders/components/OrderFilters.test.tsx` (new)

---

### Task 2.9: 创建预约单列表筛选组件
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 2.8

**Description**:
创建筛选表单组件,支持按状态、日期范围、关键词筛选。

**Acceptance Criteria**:
- [ ] 创建`OrderFilters.tsx`组件
- [ ] 使用Ant Design Form, Select, DatePicker, Input组件
- [ ] 状态多选: Checkbox.Group (PENDING/CONFIRMED/CANCELLED/COMPLETED)
- [ ] 日期范围: DatePicker.RangePicker
- [ ] 搜索框: Input.Search (预约单号/手机号)
- [ ] 重置按钮: Button清空所有筛选条件
- [ ] Props接口: `{ onFilterChange: (filters) => void }`
- [ ] Task 2.8测试全部通过

**Files**:
- `frontend/src/pages/reservation-orders/components/OrderFilters.tsx` (new)

---

### Task 2.10: 编写预约单列表页测试
**Priority**: P1
**Estimated Time**: 2.5h
**Dependencies**: Task 2.9

**Description**:
编写React Testing Library测试验证列表页的核心功能。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderList.test.tsx`测试文件
- [ ] 测试页面加载时显示loading状态
- [ ] 测试列表数据渲染正确(20条记录)
- [ ] 测试分页控件显示正确
- [ ] 测试筛选条件变更触发重新查询
- [ ] 测试点击详情按钮跳转到详情页
- [ ] 测试空列表显示"暂无预约单"提示
- [ ] 测试运行通过: `npm run test -- ReservationOrderList.test.tsx`

**Files**:
- `frontend/tests/pages/reservation-orders/ReservationOrderList.test.tsx` (new)

---

### Task 2.11: 创建预约单列表页
**Priority**: P1
**Estimated Time**: 3h
**Dependencies**: Task 2.10

**Description**:
创建B端预约单管理列表页面,集成筛选、分页、操作按钮。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderList.tsx`页面组件
- [ ] 使用`useReservationOrders` Hook获取列表数据
- [ ] 集成`OrderFilters`筛选组件
- [ ] 使用Ant Design Table组件展示列表(20条/页)
- [ ] 表格列: 预约单号、客户姓名、手机号、场景包、时段、状态、创建时间
- [ ] 操作列: "查看详情"按钮(跳转到详情页)
- [ ] 空列表显示Empty组件"暂无预约单"
- [ ] 加载中显示Spin组件
- [ ] Task 2.10测试全部通过

**Files**:
- `frontend/src/pages/reservation-orders/ReservationOrderList.tsx` (new)

---

### Task 2.12: 编写确认预约对话框测试
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 2.7

**Description**:
编写React Testing Library测试验证确认对话框的支付选项逻辑。

**Acceptance Criteria**:
- [ ] 创建`ConfirmOrderModal.test.tsx`测试文件
- [ ] 测试对话框打开时显示两个单选按钮
- [ ] 测试选择"要求客户支付"时requiresPayment=true
- [ ] 测试选择"直接完成(无需支付)"时requiresPayment=false
- [ ] 测试点击确定按钮触发onConfirm回调
- [ ] 测试点击取消按钮关闭对话框
- [ ] 测试运行通过: `npm run test -- ConfirmOrderModal.test.tsx`

**Files**:
- `frontend/tests/pages/reservation-orders/components/ConfirmOrderModal.test.tsx` (new)

---

### Task 2.13: 创建确认预约对话框组件
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 2.12

**Description**:
创建确认预约对话框,支持选择是否要求支付。

**Acceptance Criteria**:
- [ ] 创建`ConfirmOrderModal.tsx`组件
- [ ] 使用Ant Design Modal组件
- [ ] 使用Radio.Group显示两个选项:
   - "要求客户支付" (value: true)
   - "直接完成(无需支付)" (value: false)
- [ ] 默认选中"要求客户支付"
- [ ] 点击确定按钮调用`useOrderOperations().confirm(id, requiresPayment)`
- [ ] 成功后显示Success提示并关闭对话框
- [ ] Props接口: `{ open, orderId, onClose, onSuccess }`
- [ ] Task 2.12测试全部通过

**Files**:
- `frontend/src/pages/reservation-orders/components/ConfirmOrderModal.tsx` (new)

---

### Task 2.14: 创建取消预约对话框组件 [P]
**Priority**: P2
**Estimated Time**: 1.5h
**Dependencies**: Task 2.2

**Description**:
创建取消预约对话框,填写取消原因。

**Acceptance Criteria**:
- [ ] 创建`CancelOrderModal.tsx`组件
- [ ] 使用Ant Design Modal + Form组件
- [ ] 使用Radio.Group显示常见原因选项(资源冲突/客户要求/其他)
- [ ] 使用TextArea输入自定义原因(必填,最多200字符)
- [ ] 使用React Hook Form + Zod验证
- [ ] 点击确定调用`useOrderOperations().cancel(id, reason)`
- [ ] 成功后显示Success提示并关闭对话框
- [ ] Props接口: `{ open, orderId, onClose, onSuccess }`

**Files**:
- `frontend/src/pages/reservation-orders/components/CancelOrderModal.tsx` (new)

---

### Task 2.15: 创建编辑预约对话框组件 [P]
**Priority**: P2
**Estimated Time**: 2h
**Dependencies**: Task 2.2

**Description**:
创建编辑预约对话框,修改联系人信息和备注。

**Acceptance Criteria**:
- [ ] 创建`EditOrderModal.tsx`组件
- [ ] 使用Ant Design Modal + Form组件
- [ ] 表单字段: 联系人姓名、联系人手机号、备注
- [ ] 使用React Hook Form + Zod验证
- [ ] 手机号验证: `/^1[3-9]\d{9}$/`
- [ ] 点击保存调用`useOrderOperations().update(id, data)`
- [ ] 成功后显示Success提示并关闭对话框
- [ ] Props接口: `{ open, order, onClose, onSuccess }`

**Files**:
- `frontend/src/pages/reservation-orders/components/EditOrderModal.tsx` (new)

---

### Task 2.16: 编写预约单详情页测试
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 2.13

**Description**:
编写React Testing Library测试验证详情页的数据展示和操作按钮。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderDetail.test.tsx`测试文件
- [ ] 测试页面加载时显示预约单详情
- [ ] 测试显示场景包信息、时段信息、联系人信息
- [ ] 测试状态为PENDING时显示"确认预约"和"取消预约"按钮
- [ ] 测试点击"确认预约"按钮打开ConfirmOrderModal
- [ ] 测试点击"取消预约"按钮打开CancelOrderModal
- [ ] 测试状态为COMPLETED时不显示操作按钮
- [ ] 测试运行通过: `npm run test -- ReservationOrderDetail.test.tsx`

**Files**:
- `frontend/tests/pages/reservation-orders/ReservationOrderDetail.test.tsx` (new)

---

### Task 2.17: 创建预约单详情页
**Priority**: P1
**Estimated Time**: 3h
**Dependencies**: Task 2.16

**Description**:
创建B端预约单详情页面,显示完整信息和操作按钮。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderDetail.tsx`页面组件
- [ ] 使用`useReservationDetail` Hook获取详情数据
- [ ] 使用Ant Design Card组件分组展示信息:
   - 基本信息卡片(订单号、状态、创建时间)
   - 场景包信息卡片(名称、套餐、加购项)
   - 联系人信息卡片(姓名、手机号、备注)
- [ ] 状态为PENDING时显示"确认预约"和"取消预约"按钮
- [ ] 状态为CONFIRMED时显示"取消预约"按钮
- [ ] 状态为COMPLETED/CANCELLED时无操作按钮
- [ ] 集成`ConfirmOrderModal`和`CancelOrderModal`
- [ ] Task 2.16测试全部通过

**Files**:
- `frontend/src/pages/reservation-orders/ReservationOrderDetail.tsx` (new)

---

## Phase 3: C端 User Interface (C端用户界面)

### Task 3.1: 创建Taro预约表单类型定义
**Priority**: P1
**Estimated Time**: 1h
**Dependencies**: Task 2.1

**Description**:
在Taro项目中创建预约表单相关的TypeScript类型定义。

**Acceptance Criteria**:
- [ ] 创建`reservation.types.ts`文件
- [ ] 定义`ReservationFormData`接口(日期、时段、套餐、加购项、联系人)
- [ ] 定义`PackageTier`接口(套餐信息)
- [ ] 定义`AddonItem`接口(加购项信息)
- [ ] 定义`TimeSlot`接口(时段信息)
- [ ] 复用B端的`ReservationOrder`和`ReservationStatus`类型

**Files**:
- `hall-reserve-taro/src/services/types/reservation.types.ts` (new)

---

### Task 3.2: 创建Taro预约API服务
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 3.1, Task 1.18

**Description**:
封装Taro项目的预约单API服务,使用Taro.request。

**Acceptance Criteria**:
- [ ] 创建`reservationService.ts`文件
- [ ] 实现`createReservation(data)`方法调用`POST /api/client/reservations`
- [ ] 实现`getMyReservations()`方法调用`GET /api/client/reservations/my`
- [ ] 实现`getReservationDetail(id)`方法调用`GET /api/client/reservations/{id}`
- [ ] 使用Taro.request发送请求
- [ ] 自动添加JWT Token到请求头
- [ ] 统一处理错误响应,使用Taro.showToast提示

**Files**:
- `hall-reserve-taro/src/services/reservationService.ts` (new)

---

### Task 3.3: 创建Taro预约表单状态管理
**Priority**: P1
**Estimated Time**: 1.5h
**Dependencies**: Task 3.1

**Description**:
使用Zustand创建预约表单的状态管理store。

**Acceptance Criteria**:
- [ ] 创建`reservationStore.ts`文件
- [ ] 定义state: selectedDate, selectedSlot, selectedTier, selectedAddons, contactInfo
- [ ] 定义actions: setDate, setSlot, setTier, addAddon, removeAddon, setContactInfo, resetForm
- [ ] 定义computed: totalAmount (套餐价格+加购项总价)
- [ ] 使用create<ReservationState>((set, get) => ({ ... }))创建store
- [ ] 导出useReservationStore Hook

**Files**:
- `hall-reserve-taro/src/stores/reservationStore.ts` (new)

---

### Task 3.4: 创建场景包详情页"立即预约"按钮
**Priority**: P1
**Estimated Time**: 1h
**Dependencies**: None

**Description**:
修改场景包详情页,将"立即支付"按钮改为"立即预约"按钮。

**Acceptance Criteria**:
- [ ] 定位`hall-reserve-taro/src/pages/detail/index.tsx`
- [ ] 将按钮文案从"立即支付"改为"立即预约"
- [ ] 点击按钮跳转到`/pages/reservation-form/index`
- [ ] 使用Taro.navigateTo传递场景包ID参数
- [ ] 验证按钮样式符合UI设计(颜色、大小)

**Files**:
- `hall-reserve-taro/src/pages/detail/index.tsx` (update)

---

### Task 3.5: 创建预约表单页面框架
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 3.3, Task 3.4

**Description**:
创建预约表单页面,集成日期选择、时段选择、套餐选择等组件。

**Acceptance Criteria**:
- [ ] 创建`hall-reserve-taro/src/pages/reservation-form/index.tsx`
- [ ] 创建`hall-reserve-taro/src/pages/reservation-form/index.less`
- [ ] 使用`useReservationStore`获取和更新表单状态
- [ ] 页面顶部显示场景包名称和图片
- [ ] 页面底部固定显示总价和"提交预约"按钮
- [ ] 将表单区域划分为4个section: 日期时段、套餐选择、加购项、联系人
- [ ] 提交按钮初始禁用,所有必填项填写后启用

**Files**:
- `hall-reserve-taro/src/pages/reservation-form/index.tsx` (new)
- `hall-reserve-taro/src/pages/reservation-form/index.less` (new)

---

### Task 3.6: 创建时段选择器组件
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 3.5

**Description**:
创建时段选择器组件,显示可用时段列表并支持选择。

**Acceptance Criteria**:
- [ ] 创建`TimeSlotPicker.tsx`组件
- [ ] 使用Taro Picker或自定义列表展示可用时段
- [ ] 显示时段名称、开始时间、剩余库存
- [ ] 库存为0的时段禁用并显示"已满"
- [ ] 选中时段后调用`useReservationStore().setSlot(slot)`
- [ ] Props接口: `{ slots: TimeSlot[], selectedSlot: TimeSlot | null }`
- [ ] 适配微信小程序和H5两端

**Files**:
- `hall-reserve-taro/src/pages/reservation-form/components/TimeSlotPicker.tsx` (new)

---

### Task 3.7: 创建套餐选择器组件
**Priority**: P1
**Estimated Time**: 1.5h
**Dependencies**: Task 3.5

**Description**:
创建套餐选择器组件,单选模式展示套餐列表。

**Acceptance Criteria**:
- [ ] 创建`PackageTierSelector.tsx`组件
- [ ] 使用Radio.Group展示套餐列表
- [ ] 每个套餐卡片显示: 名称、价格、包含内容
- [ ] 选中套餐后调用`useReservationStore().setTier(tier)`
- [ ] Props接口: `{ tiers: PackageTier[], selectedTier: PackageTier | null }`
- [ ] 使用Taro UI或NutUI组件

**Files**:
- `hall-reserve-taro/src/pages/reservation-form/components/PackageTierSelector.tsx` (new)

---

### Task 3.8: 创建加购项选择器组件
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 3.5

**Description**:
创建加购项选择器组件,多选模式展示加购项列表。

**Acceptance Criteria**:
- [ ] 创建`AddonSelector.tsx`组件
- [ ] 使用Checkbox.Group展示加购项列表
- [ ] 每个加购项卡片显示: 名称、价格、数量选择器
- [ ] 选中加购项后调用`useReservationStore().addAddon(addon)`
- [ ] 修改数量时更新store
- [ ] 取消选中时调用`useReservationStore().removeAddon(addonId)`
- [ ] Props接口: `{ addons: AddonItem[], selectedAddons: Map<string, number> }`

**Files**:
- `hall-reserve-taro/src/pages/reservation-form/components/AddonSelector.tsx` (new)

---

### Task 3.9: 创建联系人表单组件
**Priority**: P1
**Estimated Time**: 1.5h
**Dependencies**: Task 3.5

**Description**:
创建联系人信息表单组件,收集姓名和手机号。

**Acceptance Criteria**:
- [ ] 创建`ContactForm.tsx`组件
- [ ] 使用Taro Input组件显示两个输入框: 姓名、手机号
- [ ] 手机号输入框type="number",maxlength=11
- [ ] 实时验证手机号格式(11位数字)
- [ ] 验证失败显示错误提示
- [ ] 表单变更调用`useReservationStore().setContactInfo(info)`
- [ ] Props接口: `{ contactInfo: { name: string, phone: string } }`

**Files**:
- `hall-reserve-taro/src/pages/reservation-form/components/ContactForm.tsx` (new)

---

### Task 3.10: 实现预约表单提交逻辑
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 3.2, Task 3.6, Task 3.7, Task 3.8, Task 3.9

**Description**:
实现预约表单的提交逻辑,调用API创建预约单。

**Acceptance Criteria**:
- [ ] 在`reservation-form/index.tsx`中实现`handleSubmit()`方法
- [ ] 从`useReservationStore`获取所有表单数据
- [ ] 验证所有必填项已填写(日期、时段、套餐、姓名、手机号)
- [ ] 调用`reservationService.createReservation(data)`
- [ ] 成功后使用Taro.showToast提示"预约成功"
- [ ] 跳转到预约成功页面显示预约单号
- [ ] 失败时显示错误提示(如"该时段已满")
- [ ] 重置表单状态`useReservationStore().resetForm()`

**Files**:
- `hall-reserve-taro/src/pages/reservation-form/index.tsx` (update)

---

### Task 3.11: 创建"我的预约"列表页
**Priority**: P2
**Estimated Time**: 2.5h
**Dependencies**: Task 3.2

**Description**:
创建"我的预约"列表页,展示用户的所有预约单历史。

**Acceptance Criteria**:
- [ ] 创建`hall-reserve-taro/src/pages/my-reservations/index.tsx`
- [ ] 使用`reservationService.getMyReservations()`获取列表
- [ ] 使用Tabs组件显示状态筛选(全部/待确认/已确认/已取消/已完成)
- [ ] 使用ScrollView + List展示预约单卡片
- [ ] 每个卡片显示: 预约单号、场景包名称、时段、状态、总金额
- [ ] 点击卡片跳转到详情页
- [ ] 空列表显示空状态提示
- [ ] 支持下拉刷新

**Files**:
- `hall-reserve-taro/src/pages/my-reservations/index.tsx` (new)
- `hall-reserve-taro/src/pages/my-reservations/index.less` (new)

---

### Task 3.12: 创建预约单详情页(C端)
**Priority**: P2
**Estimated Time**: 2h
**Dependencies**: Task 3.11

**Description**:
创建C端预约单详情页,显示预约单信息和支付按钮(条件显示)。

**Acceptance Criteria**:
- [ ] 创建`hall-reserve-taro/src/pages/my-reservations/detail/index.tsx`
- [ ] 使用`reservationService.getReservationDetail(id)`获取详情
- [ ] 显示订单号、状态、场景包、时段、套餐、加购项、联系人、总金额
- [ ] 状态为CONFIRMED且requiresPayment=true时显示"立即支付"按钮
- [ ] 点击"立即支付"跳转到支付页面(集成现有支付功能)
- [ ] 状态为COMPLETED时显示"已完成"标识
- [ ] 状态为CANCELLED时显示取消原因

**Files**:
- `hall-reserve-taro/src/pages/my-reservations/detail/index.tsx` (new)
- `hall-reserve-taro/src/pages/my-reservations/detail/index.less` (new)

---

## Phase 4: Integration & E2E Testing (集成与端到端测试)

### Task 4.1: 编写创建预约端到端测试
**Priority**: P1
**Estimated Time**: 3h
**Dependencies**: Task 3.10

**Description**:
编写Playwright E2E测试验证完整的预约创建流程。

**Acceptance Criteria**:
- [ ] 创建`reservation-order-management.spec.ts`测试文件
- [ ] 测试场景1: C端用户创建预约单
   - 访问场景包详情页
   - 点击"立即预约"按钮
   - 选择日期、时段、套餐、加购项
   - 填写联系人信息
   - 提交预约并验证跳转到成功页面
   - 验证预约单号显示
- [ ] 验证预约单状态为PENDING
- [ ] 测试运行通过: `npm run test:e2e`

**Files**:
- `frontend/tests/e2e/reservation-order-management.spec.ts` (new)

---

### Task 4.2: 编写B端确认预约端到端测试
**Priority**: P1
**Estimated Time**: 2.5h
**Dependencies**: Task 4.1, Task 2.17

**Description**:
编写Playwright E2E测试验证B端确认预约流程。

**Acceptance Criteria**:
- [ ] 在`reservation-order-management.spec.ts`中添加测试场景2
- [ ] 测试场景2: B端运营人员确认预约(要求支付)
   - 登录后台管理平台
   - 进入预约管理列表页
   - 点击"待确认"状态的预约单
   - 点击"确认预约"按钮
   - 选择"要求客户支付"
   - 确认后验证状态变更为CONFIRMED
   - 验证requiresPayment=true
- [ ] 测试运行通过: `npm run test:e2e`

**Files**:
- `frontend/tests/e2e/reservation-order-management.spec.ts` (update)

---

### Task 4.3: 编写B端直接完成预约端到端测试
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 4.2

**Description**:
编写Playwright E2E测试验证B端直接完成预约流程(无需支付)。

**Acceptance Criteria**:
- [ ] 在`reservation-order-management.spec.ts`中添加测试场景3
- [ ] 测试场景3: B端运营人员确认预约(直接完成)
   - 创建新预约单
   - B端打开预约单详情
   - 点击"确认预约"按钮
   - 选择"直接完成(无需支付)"
   - 确认后验证状态直接变更为COMPLETED
   - 验证requiresPayment=false
- [ ] 测试运行通过: `npm run test:e2e`

**Files**:
- `frontend/tests/e2e/reservation-order-management.spec.ts` (update)

---

### Task 4.4: 编写B端取消预约端到端测试
**Priority**: P2
**Estimated Time**: 2h
**Dependencies**: Task 4.3

**Description**:
编写Playwright E2E测试验证B端取消预约流程。

**Acceptance Criteria**:
- [ ] 在`reservation-order-management.spec.ts`中添加测试场景4
- [ ] 测试场景4: B端运营人员取消预约
   - 创建新预约单
   - B端打开预约单详情
   - 点击"取消预约"按钮
   - 填写取消原因"资源冲突"
   - 确认后验证状态变更为CANCELLED
   - 验证取消原因记录成功
- [ ] 测试运行通过: `npm run test:e2e`

**Files**:
- `frontend/tests/e2e/reservation-order-management.spec.ts` (update)

---

### Task 4.5: 编写后端集成测试
**Priority**: P1
**Estimated Time**: 3h
**Dependencies**: Task 1.20

**Description**:
编写完整的后端集成测试,验证预约创建到完成的全流程。

**Acceptance Criteria**:
- [ ] 创建`ReservationOrderIntegrationTest.java`测试类
- [ ] 使用Testcontainers启动Supabase PostgreSQL
- [ ] 测试场景1: 完整预约创建流程(含库存扣减)
- [ ] 测试场景2: 确认预约并选择支付选项(requiresPayment=true)
- [ ] 测试场景3: 确认预约直接完成(requiresPayment=false)
- [ ] 测试场景4: 取消预约并验证库存释放
- [ ] 测试场景5: 支付回调处理幂等性
- [ ] 测试场景6: 操作日志记录完整性
- [ ] 测试场景7: 并发预约防超售
- [ ] 测试运行通过: `mvn test -Dtest=ReservationOrderIntegrationTest`

**Files**:
- `backend/src/test/java/com/cinema/reservation/ReservationOrderIntegrationTest.java` (new)

---

## Phase 5: Performance & Security (性能与安全)

### Task 5.1: 后端并发性能测试
**Priority**: P1
**Estimated Time**: 2h
**Dependencies**: Task 4.5

**Description**:
编写并发压力测试,验证50 TPS并发预约无超售。

**Acceptance Criteria**:
- [ ] 使用JMeter或Gatling创建压力测试脚本
- [ ] 模拟50个并发用户同时预订同一时段
- [ ] 验证库存扣减准确(无超售,无负数)
- [ ] 验证所有成功的预约单数量≤时段容量
- [ ] 验证乐观锁冲突被正确处理
- [ ] API响应时间P95<1s
- [ ] 生成性能测试报告

**Files**:
- `backend/src/test/jmeter/reservation-concurrency-test.jmx` (new)

---

### Task 5.2: 前端性能优化
**Priority**: P2
**Estimated Time**: 2h
**Dependencies**: Task 2.11

**Description**:
优化B端列表页性能,确保100条记录加载时间<1.5s。

**Acceptance Criteria**:
- [ ] 使用Lighthouse测试列表页Performance Score
- [ ] 优化TanStack Query缓存配置(staleTime, cacheTime)
- [ ] 对列表组件使用React.memo避免不必要重渲染
- [ ] 对筛选表单使用useMemo缓存计算结果
- [ ] 对操作按钮使用useCallback缓存回调函数
- [ ] Lighthouse Performance Score > 90
- [ ] 列表加载时间<1.5s (100条记录)

**Files**:
- `frontend/src/pages/reservation-orders/ReservationOrderList.tsx` (update)

---

### Task 5.3: 安全审计与修复
**Priority**: P1
**Estimated Time**: 2.5h
**Dependencies**: Task 4.5

**Description**:
执行安全审计,检查并修复潜在的安全漏洞。

**Acceptance Criteria**:
- [ ] 验证所有API端点有JWT认证
- [ ] 验证B端API端点有角色权限检查(@PreAuthorize)
- [ ] 验证手机号、备注字段有XSS防护
- [ ] 验证SQL注入防护(使用JPA参数化查询)
- [ ] 验证CSRF防护(Spring Security配置)
- [ ] 验证敏感信息不在日志中输出(手机号脱敏)
- [ ] 验证预约单号不可预测(包含随机数)
- [ ] 生成安全审计报告

**Files**:
- `docs/security-audit-U001.md` (new)

---

### Task 5.4: 可访问性验证
**Priority**: P2
**Estimated Time**: 1.5h
**Dependencies**: Task 2.17

**Description**:
验证B端界面符合WCAG 2.1 AA可访问性标准。

**Acceptance Criteria**:
- [ ] 使用axe DevTools扫描列表页和详情页
- [ ] 验证所有表单字段有明确的label
- [ ] 验证所有按钮有可见的焦点指示器
- [ ] 验证颜色对比度≥4.5:1
- [ ] 验证支持Tab键导航所有交互元素
- [ ] 验证屏幕阅读器可正确朗读状态徽章
- [ ] 修复所有可访问性问题
- [ ] axe扫描无Critical/Serious问题

**Files**:
- `frontend/src/pages/reservation-orders/` (update components)

---

## Summary

**Total Tasks**: 54 tasks
**Phases**: 5 phases
**Estimated Total Time**: ~110 hours

**Key Milestones**:
- Phase 0 (Research): 3 tasks, ~5.5h
- Phase 1 (Backend): 20 tasks, ~47.5h
- Phase 2 (B端 UI): 17 tasks, ~33h
- Phase 3 (C端 UI): 12 tasks, ~22h
- Phase 4 (Testing): 5 tasks, ~12.5h
- Phase 5 (Performance): 4 tasks, ~8h

**Critical Path**:
Task 0.1 → 1.1 → 1.2 → 1.4 → 1.8 → 1.10 → 1.12 → 1.18 → 2.1 → 2.3 → 2.5 → 2.11 → 4.1

**Parallel Execution Opportunities**:
- Tasks 0.1, 0.2, 0.3 可并行执行
- Tasks 1.3, 1.5 可并行执行(在1.2完成后)
- Tasks 2.14, 2.15 可并行执行
- Tasks 1.19, 1.7 可并行执行

**Next Steps**:
1. Team review and approval of task breakdown
2. Assign tasks to team members
3. Set up CI/CD pipeline for automated testing
4. Begin Phase 0 research tasks
5. Follow TDD workflow strictly: Test → Implement → Refactor
