# 后端架构规则

## 核心原则
使用 Spring Boot + Supabase 作为统一后端技术栈。

## 技术栈

| 技术 | 版本 | 用途 |
|-----|------|------|
| Java | 21 | 运行时 |
| Spring Boot | 3.x | 应用框架 |
| Supabase | - | 数据库/认证/存储 |

## 规则

### R7.1 Supabase 作为单一数据源
- 所有持久化数据模型以 Supabase 为单一事实来源
- Spring Boot 负责业务编排、领域逻辑和 API 暴露
- 禁止引入额外的数据库访问层绕过 Supabase

### R7.2 错误处理规范
```java
@RestController
public class ScenarioController {
    
    @GetMapping("/api/scenarios/{id}")
    public ResponseEntity<ApiResponse<Scenario>> getScenario(@PathVariable Long id) {
        try {
            Scenario scenario = scenarioService.findById(id);
            return ResponseEntity.ok(ApiResponse.success(scenario));
        } catch (NotFoundException e) {
            return ResponseEntity.status(404)
                .body(ApiResponse.failure("SCENARIO_NOT_FOUND", e.getMessage()));
        } catch (Exception e) {
            log.error("获取场景失败: {}", id, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.failure("INTERNAL_ERROR", "服务器内部错误"));
        }
    }
}
```

### R7.3 超时与重试策略
- Supabase 调用必须设置超时控制（推荐 30 秒）
- 关键路径需要有重试/降级策略
- 通过集成测试覆盖关键路径

### R7.4 项目结构
```
backend/src/main/java/com/cinema/
├── config/          # 配置类
├── controller/      # API 控制器
├── domain/          # 领域模型
├── dto/             # 数据传输对象
├── mapper/          # 对象映射
├── repository/      # 数据访问层
├── service/         # 业务逻辑层
└── exception/       # 异常处理
```

### R7.5 禁止行为
- ❌ 禁止绕过 Supabase 直接连接其他数据库
- ❌ 禁止在 Controller 层编写业务逻辑
- ❌ 禁止硬编码 API Key 和敏感配置
