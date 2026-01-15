# 审计与日志策略：影厅资源后端建模

**Branch**: `014-hall-store-backend`
**Date**: 2025-12-16
**Version**: 1.0

## 1. 概述

本文档描述影厅资源后端服务的审计与日志策略，以满足安全合规要求（SC-004）和运维可观测性需求。

## 2. 日志级别与分类

### 2.1 日志级别定义

| 级别 | 用途 | 示例 |
|------|------|------|
| ERROR | 系统错误，需立即关注 | Supabase 连接失败、数据写入异常 |
| WARN | 潜在问题，需监控 | 请求超时重试、数据校验失败 |
| INFO | 关键业务操作记录 | 影厅创建/更新/停用操作 |
| DEBUG | 调试信息（生产环境关闭） | 请求参数、响应详情 |

### 2.2 日志分类

1. **业务操作日志**: 影厅/门店 CRUD 操作记录
2. **访问日志**: API 请求/响应记录
3. **异常日志**: 错误与异常捕获
4. **审计日志**: 敏感操作追踪（谁、何时、做了什么）

## 3. 审计日志策略

### 3.1 审计对象

以下操作需记录审计日志：

| 操作类型 | 审计内容 |
|---------|---------|
| 创建影厅 | 操作人、门店ID、影厅名称、创建时间 |
| 更新影厅 | 操作人、影厅ID、变更字段、变更前后值 |
| 停用影厅 | 操作人、影厅ID、停用原因、时间 |
| 启用影厅 | 操作人、影厅ID、时间 |
| 批量操作 | 操作人、操作类型、影响记录数 |

### 3.2 审计日志格式

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "INFO",
  "event_type": "HALL_CREATED",
  "actor": {
    "user_id": "operator-123",
    "username": "admin",
    "ip_address": "192.168.1.100"
  },
  "resource": {
    "type": "Hall",
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "store_id": "550e8400-e29b-41d4-a716-446655440001"
  },
  "action": "CREATE",
  "details": {
    "name": "VIP影厅A",
    "type": "VIP",
    "capacity": 120
  },
  "status": "SUCCESS"
}
```

### 3.3 审计日志存储

- **短期存储**: 应用日志文件（30天滚动）
- **长期存储**: 发送至日志聚合服务（如 ELK/Loki）保留1年
- **合规存储**: 敏感操作同步写入 Supabase `audit_logs` 表

## 4. 日志实现指南

### 4.1 Spring Boot 日志配置

```yaml
# application.yml
logging:
  level:
    root: INFO
    com.cinema.hallstore: DEBUG  # 开发环境
    org.springframework.web: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/hall-store-backend.log
    max-size: 50MB
    max-history: 30
```

### 4.2 服务层日志示例

```java
@Service
public class HallService {
    private static final Logger logger = LoggerFactory.getLogger(HallService.class);

    public HallDTO createHall(CreateHallRequest request) {
        logger.info("创建影厅请求: storeId={}, name={}",
            request.getStoreId(), request.getName());

        try {
            Hall created = hallRepository.create(hall);
            logger.info("影厅创建成功: hallId={}", created.getId());

            // 审计日志
            auditLogger.log(AuditEvent.builder()
                .eventType("HALL_CREATED")
                .resourceType("Hall")
                .resourceId(created.getId().toString())
                .details(Map.of("name", request.getName()))
                .build());

            return HallMapper.toDto(created);
        } catch (Exception e) {
            logger.error("影厅创建失败: storeId={}, error={}",
                request.getStoreId(), e.getMessage(), e);
            throw e;
        }
    }
}
```

### 4.3 Controller 层请求日志

```java
@RestController
@Slf4j
public class HallAdminController {

    @PostMapping
    public ResponseEntity<ApiResponse<HallDTO>> createHall(
            @Valid @RequestBody CreateHallRequest request) {
        log.info("POST /api/admin/halls - 创建影厅请求");
        HallDTO hall = hallService.createHall(request);
        log.info("POST /api/admin/halls - 响应成功: hallId={}", hall.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(hall));
    }
}
```

## 5. 异常日志策略

### 5.1 全局异常处理日志

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException e) {
        logger.warn("资源未找到: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericError(Exception e) {
        logger.error("系统错误: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_ERROR", "系统内部错误"));
    }
}
```

## 6. 可观测性指标

### 6.1 关键指标

| 指标名称 | 类型 | 描述 |
|---------|------|------|
| `hall_operations_total` | Counter | 影厅操作总数（按类型） |
| `hall_operations_duration` | Histogram | 操作耗时分布 |
| `supabase_api_errors_total` | Counter | Supabase API 错误数 |
| `api_request_duration` | Histogram | API 请求耗时 |

### 6.2 告警规则

| 告警 | 条件 | 严重程度 |
|------|------|---------|
| 高错误率 | 5分钟内错误率 > 5% | Critical |
| Supabase 连接失败 | 连续3次连接失败 | Critical |
| 慢查询 | 查询耗时 > 5s | Warning |
| 异常操作频率 | 1分钟内停用操作 > 10 | Warning |

## 7. 日志安全

### 7.1 敏感信息脱敏

- 不记录完整的 Supabase Service Role Key
- 用户密码、Token 等敏感字段不打印
- PII 数据（如客户信息）需脱敏处理

### 7.2 日志访问控制

- 日志文件权限限制为运维团队
- 审计日志需额外权限访问
- 生产环境禁止 DEBUG 级别输出

## 8. 实施计划

### Phase 1: 基础日志（已完成）
- [x] 配置 logback 日志框架
- [x] 服务层关键操作 INFO 日志
- [x] 异常捕获与 ERROR 日志

### Phase 2: 审计日志（待实施）
- [ ] 创建 `audit_logs` 表结构
- [ ] 实现 AuditLogger 服务
- [ ] 集成到业务操作流程

### Phase 3: 监控告警（待实施）
- [ ] 集成 Micrometer 指标
- [ ] 配置 Prometheus 采集
- [ ] 设置 Grafana 告警规则

## 9. 参考文档

- Spring Boot Logging: https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging
- Supabase Audit Logs: https://supabase.com/docs/guides/platform/logs
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
