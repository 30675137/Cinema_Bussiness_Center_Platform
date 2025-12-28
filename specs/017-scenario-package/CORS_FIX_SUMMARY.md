# CORS 和 API 路径问题修复总结

**日期**: 2025-12-19 18:20
**问题**: CORS跨域错误 + API路径不匹配

---

## 🐛 发现的问题

### 错误信息
```
Access to fetch at 'http://localhost:8080/api/v1/scenario-packages?page=0&size=20&sortBy=createdAt&sortOrder=desc'
from origin 'http://localhost:3000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 根本原因
1. **API路径不匹配**: 前端请求 `/api/v1/scenario-packages`，但后端定义的是 `/api/scenario-packages`
2. **CORS未配置**: 缺少全局CORS配置，允许前端跨域访问

---

## ✅ 已修复的问题

### 1. API路径统一

**前端修改** - `frontend/src/services/api.ts:6`

```typescript
// 修改前
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',

// 修改后
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
```

**影响**: 所有前端API请求现在统一使用 `/api` 前缀，匹配后端Controller路径。

---

### 2. 全局CORS配置

**新增文件** - `backend/src/main/java/com/cinema/config/CorsConfig.java`

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 允许的源（前端开发服务器）
        config.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ));

        // 允许的HTTP方法
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // 允许的请求头
        config.setAllowedHeaders(Arrays.asList("*"));

        // 允许携带凭证
        config.setAllowCredentials(true);

        // 预检请求有效期（1小时）
        config.setMaxAge(3600L);

        // 暴露的响应头
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Request-ID",
            "X-Total-Count"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
```

**功能**:
- ✅ 允许 `localhost:3000` 和 `localhost:5173` 跨域访问
- ✅ 支持所有标准HTTP方法
- ✅ 允许携带认证信息（cookies, headers）
- ✅ 预检请求缓存1小时

---

### 3. 临时Mock端点（数据库配置前）

**新增文件** - `backend/src/main/java/com/cinema/common/controller/HealthController.java`

```java
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", Instant.now().toString());
        response.put("message", "Backend is running");
        return response;
    }

    @GetMapping("/scenario-packages")
    public Map<String, Object> mockScenarioPackages() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", new Object[]{});
        response.put("total", 0);
        response.put("timestamp", Instant.now().toString());
        response.put("message", "数据库未配置，返回Mock数据。请先执行数据库迁移脚本。");
        return response;
    }
}
```

**目的**: 在数据库配置完成前，提供基本的API响应，验证CORS配置正确。

---

## 🔴 当前阻塞问题

### 数据库依赖导致后端无法启动

**错误信息**:
```
UnsatisfiedDependencyException: Error creating bean with name 'scenarioPackageController'
...
No qualifying bean of type 'com.cinema.scenariopackage.repository.ScenarioPackageRepository'
```

**原因**:
- `ScenarioPackageController` 依赖 `ScenarioPackageService`
- `ScenarioPackageService` 依赖 `ScenarioPackageRepository`（JPA Repository）
- JPA Repository 需要数据库连接
- 数据库尚未配置（表未创建）

**临时解决方案（已尝试）**:
禁用JPA自动配置：
```java
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class
})
```

但这导致所有依赖JPA的bean都无法创建。

---

## 🎯 最佳解决方案

### 方案A: 配置数据库（推荐）

这是正式的解决方案，需要您手动执行：

#### 步骤1: 执行数据库迁移

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 执行迁移脚本:
   ```sql
   -- 文件: backend/src/main/resources/db/migration/V1__create_scenario_packages.sql
   -- 复制全部内容并执行
   ```

#### 步骤2: 恢复JPA配置

撤销临时修改，恢复 `HallStoreBackendApplication.java`:

```java
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.cinema.hallstore",
    "com.cinema.scenariopackage",
    "com.cinema.common"
})
@EnableJpaRepositories(basePackages = {
    "com.cinema.hallstore.repository",
    "com.cinema.scenariopackage.repository"
})
@EntityScan(basePackages = {
    "com.cinema.hallstore.model",
    "com.cinema.scenariopackage.model"
})
public class HallStoreBackendApplication {
    // ...
}
```

#### 步骤3: 重新编译并启动

```bash
cd backend
mvn clean package -DskipTests
java -jar target/hall-store-backend-0.0.1-SNAPSHOT.jar
```

#### 步骤4: 验证

```bash
# 测试健康检查
curl http://localhost:8080/api/health

# 测试场景包API
curl http://localhost:8080/api/scenario-packages
```

#### 步骤5: 测试前端

访问: http://localhost:3000/scenario-packages

应该能够：
- ✅ 无CORS错误
- ✅ API路径正确
- ✅ 成功获取数据（可能为空列表）

---

### 方案B: 使用前端Mock数据（临时）

如果暂时无法配置数据库，可以使用前端的MSW（Mock Service Worker）：

1. 前端已有MSW配置
2. 可以完全在前端模拟数据
3. 无需后端运行

但这不适合测试真实的CORS和API集成。

---

## 📊 修复验证清单

完成数据库配置后，请验证：

### 前端检查
- [  ] 访问 http://localhost:3000/scenario-packages 无CORS错误
- [ ] Network标签显示请求 `http://localhost:8080/api/scenario-packages`（无`/v1`）
- [ ] 响应头包含 `Access-Control-Allow-Origin: http://localhost:3000`
- [ ] 响应状态 200 OK

### 后端检查
- [ ] 后端成功启动（无UnsatisfiedDependencyException）
- [ ] 访问 http://localhost:8080/api/health 返回 `{"status":"UP",...}`
- [ ] 访问 http://localhost:8080/api/scenario-packages 返回空列表或数据

### CORS验证
```bash
# 使用curl模拟预检请求
curl -X OPTIONS http://localhost:8080/api/scenario-packages \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v

# 应该看到:
# < Access-Control-Allow-Origin: http://localhost:3000
# < Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
# < Access-Control-Allow-Credentials: true
```

---

## 📝 修改文件清单

### 前端
1. ✅ `frontend/src/services/api.ts` - 修改 baseURL

### 后端
1. ✅ `backend/src/main/java/com/cinema/config/CorsConfig.java` - 新增CORS配置
2. ✅ `backend/src/main/java/com/cinema/common/controller/HealthController.java` - 新增Mock端点
3. 🔄 `backend/src/main/java/com/cinema/hallstore/HallStoreBackendApplication.java` - 需恢复JPA配置

---

## 🚀 下一步操作

**立即需要您执行**:

1. ✅ 执行 Supabase 数据库迁移脚本
2. ✅ 恢复 `HallStoreBackendApplication.java` 中的JPA配置
3. ✅ 重新编译并启动后端
4. ✅ 刷新前端页面测试

完成后，CORS问题和API路径问题都将彻底解决！

---

**文档版本**: v1.0
**最后更新**: 2025-12-19 18:20 CST
**状态**: ⏳ 等待数据库配置
