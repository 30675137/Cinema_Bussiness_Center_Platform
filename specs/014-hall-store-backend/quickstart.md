# 快速开始指南：影厅资源后端建模（Store-Hall 一致性）

**分支**: `014-hall-store-backend` | **日期**: 2025-12-16 | **版本**: 1.0

## 概述

本文档提供影厅资源后端建模功能的快速入门指南，包括环境设置、开发流程、测试方法和部署指南。基于 Spring Boot 3.x + Supabase 技术栈，为前端"影厅资源管理"和"排期甘特图"页面提供统一的数据模型和 API。

## 技术栈概览

### 核心技术

```yaml
backend:
  framework: Spring Boot 3.x
  language: Java 21
  database: Supabase (PostgreSQL)
  integration: Supabase REST API / HTTP Client
  testing:
    unit: JUnit 5
    integration: Spring Boot Test + Testcontainers (可选)
```

### 前置要求

```bash
# Java版本要求
java -version  # >= 21

# Maven版本要求
mvn --version  # >= 3.8.0

# Supabase配置
# 需要 Supabase 项目 URL 和 Service Role Key
# 环境变量：
# - SUPABASE_URL=https://your-project.supabase.co
# - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 项目结构

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── cinema/
│   │   │           └── hallstore/
│   │   │               ├── domain/              # 领域模型
│   │   │               │   ├── Store.java
│   │   │               │   ├── Hall.java
│   │   │               │   └── enums/           # 枚举类型
│   │   │               │       ├── StoreStatus.java
│   │   │               │       └── HallStatus.java
│   │   │               ├── repository/          # 数据访问层（Supabase）
│   │   │               │   ├── StoreRepository.java
│   │   │               │   └── HallRepository.java
│   │   │               ├── service/             # 业务逻辑层
│   │   │               │   ├── StoreService.java
│   │   │               │   └── HallService.java
│   │   │               ├── controller/          # API 控制器
│   │   │               │   ├── StoreController.java
│   │   │               │   └── HallController.java
│   │   │               ├── dto/                 # 数据传输对象
│   │   │               │   ├── StoreDTO.java
│   │   │               │   └── HallDTO.java
│   │   │               └── config/              # 配置类
│   │   │                   └── SupabaseConfig.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-dev.yml
│   └── test/
│       └── java/
│           └── com/
│               └── cinema/
│                   └── hallstore/
│                       ├── repository/          # Repository 测试
│                       ├── service/              # Service 测试
│                       └── controller/           # Controller 集成测试
```

## 环境设置

### 1. 创建 Supabase 表结构

在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL：

```sql
-- 创建门店表
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建影厅表
CREATE TABLE halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  code TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('VIP', 'CP', 'Party', 'Public')),
  capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, code)
);

-- 创建索引
CREATE INDEX idx_halls_store_id ON halls(store_id);
CREATE INDEX idx_halls_status ON halls(status);
CREATE INDEX idx_stores_status ON stores(status);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 stores 表添加触发器
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 halls 表添加触发器
CREATE TRIGGER update_halls_updated_at
  BEFORE UPDATE ON halls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. 配置 Spring Boot 应用

在 `application.yml` 中配置 Supabase 连接：

```yaml
spring:
  application:
    name: cinema-hall-store-backend
  profiles:
    active: dev

supabase:
  url: ${SUPABASE_URL:https://your-project.supabase.co}
  service-role-key: ${SUPABASE_SERVICE_ROLE_KEY:your-service-role-key}
  api:
    timeout: 60000  # 60秒

server:
  port: 8080
```

### 3. 添加依赖

在 `pom.xml` 中添加必要的依赖：

```xml
<dependencies>
  <!-- Spring Boot Starter Web -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  
  <!-- Spring Boot Starter Validation -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
  
  <!-- HTTP Client for Supabase -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
  </dependency>
  
  <!-- Jackson for JSON -->
  <dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
  </dependency>
  
  <!-- Test Dependencies -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

## 开发流程

### 1. 实现 Supabase 配置类

```java
@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseConfig {
  private String url;
  private String serviceRoleKey;
  private long apiTimeout;
  
  @Bean
  public WebClient supabaseWebClient() {
    return WebClient.builder()
        .baseUrl(url + "/rest/v1")
        .defaultHeader("apikey", serviceRoleKey)
        .defaultHeader("Authorization", "Bearer " + serviceRoleKey)
        .defaultHeader("Content-Type", "application/json")
        .defaultHeader("Prefer", "return=representation")
        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
        .build();
  }
}
```

### 2. 实现 Repository 层

```java
@Repository
public class HallRepository {
  private final WebClient webClient;
  
  public HallRepository(WebClient supabaseWebClient) {
    this.webClient = supabaseWebClient;
  }
  
  public List<Hall> findByStoreId(UUID storeId, HallStatus status, HallType type) {
    // 构建查询参数
    UriComponentsBuilder builder = UriComponentsBuilder
        .fromUriString("/halls")
        .queryParam("store_id", "eq." + storeId);
    
    if (status != null) {
      builder.queryParam("status", "eq." + status.name().toLowerCase());
    }
    if (type != null) {
      builder.queryParam("type", "eq." + type.name());
    }
    
    return webClient.get()
        .uri(builder.build().toUri())
        .retrieve()
        .bodyToFlux(Hall.class)
        .collectList()
        .block(Duration.ofSeconds(30));
  }
  
  // 其他 CRUD 方法...
}
```

### 3. 实现 Service 层

```java
@Service
public class HallService {
  private final HallRepository hallRepository;
  
  public List<HallDTO> getHallsByStore(UUID storeId, HallStatus status, HallType type) {
    List<Hall> halls = hallRepository.findByStoreId(storeId, status, type);
    return halls.stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }
  
  private HallDTO toDTO(Hall hall) {
    // 映射领域模型到 DTO
  }
}
```

### 4. 实现 Controller 层

```java
@RestController
@RequestMapping("/api/stores/{storeId}/halls")
public class HallController {
  private final HallService hallService;
  
  @GetMapping
  public ResponseEntity<ApiResponse<List<HallDTO>>> getHalls(
      @PathVariable UUID storeId,
      @RequestParam(required = false) HallStatus status,
      @RequestParam(required = false) HallType type) {
    List<HallDTO> halls = hallService.getHallsByStore(storeId, status, type);
    return ResponseEntity.ok(ApiResponse.success(halls));
  }
}
```

## 测试

### 单元测试示例

```java
@ExtendWith(MockitoExtension.class)
class HallServiceTest {
  @Mock
  private HallRepository hallRepository;
  
  @InjectMocks
  private HallService hallService;
  
  @Test
  void shouldReturnHallsByStore() {
    UUID storeId = UUID.randomUUID();
    List<Hall> mockHalls = List.of(/* mock data */);
    when(hallRepository.findByStoreId(storeId, null, null))
        .thenReturn(mockHalls);
    
    List<HallDTO> result = hallService.getHallsByStore(storeId, null, null);
    
    assertThat(result).hasSize(mockHalls.size());
  }
}
```

### 集成测试示例

```java
@SpringBootTest
@AutoConfigureWebTestClient
class HallControllerIntegrationTest {
  @Autowired
  private WebTestClient webTestClient;
  
  @Test
  void shouldGetHallsByStore() {
    UUID storeId = UUID.randomUUID();
    
    webTestClient.get()
        .uri("/api/stores/{storeId}/halls", storeId)
        .exchange()
        .expectStatus().isOk()
        .expectBody()
        .jsonPath("$.data").isArray();
  }
}
```

## API 使用示例

### 查询门店列表

```bash
curl -X GET "http://localhost:8080/api/stores?status=active" \
  -H "Content-Type: application/json"
```

### 按门店查询影厅列表

```bash
curl -X GET "http://localhost:8080/api/stores/{storeId}/halls?status=active&type=VIP" \
  -H "Content-Type: application/json"
```

### 创建影厅（管理接口）

```bash
curl -X POST "http://localhost:8080/api/admin/halls" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "VIP影厅A",
    "type": "VIP",
    "capacity": 120,
    "tags": ["真皮沙发", "KTV设备"]
  }'
```

## 与前端集成

### 前端类型对齐

确保后端返回的 DTO 字段与前端 `Hall` 类型一致：

```typescript
// frontend/src/pages/schedule/types/schedule.types.ts
export interface Hall {
  id: string;           // UUID 字符串
  name: string;
  capacity: number;
  type: HallType;       // 'VIP' | 'Public' | 'CP' | 'Party'
  tags: string[];
  status: HallStatus;   // 'active' | 'inactive' | 'maintenance'
  createdAt: string;    // ISO 8601 格式
  updatedAt: string;
}
```

### 更新前端 Service

```typescript
// frontend/src/pages/schedule/services/scheduleService.ts
export class ScheduleService {
  async getHallsByStore(storeId: string, params?: HallQueryParams): Promise<Hall[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    
    const response = await fetch(
      `${this.baseUrl}/stores/${storeId}/halls?${queryParams}`,
      { headers: this.getHeaders() }
    );
    const result = await response.json();
    return result.data;
  }
}
```

## 部署

### 环境变量配置

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 构建和运行

```bash
# 构建
mvn clean package

# 运行
java -jar target/cinema-hall-store-backend-1.0.0.jar
```

## 注意事项

1. **Supabase 权限**: 确保使用 Service Role Key 时注意安全性，不要暴露在客户端代码中。
2. **错误处理**: 实现统一的异常处理机制，返回符合 OpenAPI 规范的错误响应。
3. **数据验证**: 在 Service 层和 Controller 层都进行数据验证，确保数据完整性。
4. **性能优化**: 对于频繁查询的接口，考虑在 Supabase 中添加适当的索引。
5. **日志记录**: 记录关键操作和错误，便于问题排查和审计。

## 实现状态

### 已完成

- ✅ Phase 1: Setup (T001-T004) - 后端模块骨架、Supabase 配置、全局异常处理
- ✅ Phase 2: Foundational (T005-T011) - 领域模型、DTO、Mapper、枚举定义
- ✅ Phase 3: US1 影厅主数据 (T012-T020) - HallRepository、HallService、HallAdminController、HallQueryController
- ✅ Phase 4: US2 门店关系 (T021-T026) - StoreRepository、StoreService、StoreQueryController
- ✅ Phase 5: US3 前后端一致性 (T027-T031) - 前端 API 适配、集成测试

### 待完成

- 🔲 Phase 6: Polish (T032-T036) - 文档完善、代码清理、性能优化

## 已实现的 API 端点

### 门店查询接口

```bash
# 查询门店列表（支持按状态筛选）
GET /api/stores
GET /api/stores?status=ACTIVE

# 查询门店详情
GET /api/stores/{storeId}
```

### 影厅查询接口

```bash
# 按门店查询影厅列表（支持状态/类型筛选）
GET /api/stores/{storeId}/halls
GET /api/stores/{storeId}/halls?status=ACTIVE&type=VIP
```

### 影厅管理接口

```bash
# 创建影厅
POST /api/admin/halls
{
  "storeId": "uuid",
  "name": "VIP影厅A",
  "type": "VIP",
  "capacity": 120,
  "tags": ["真皮沙发"]
}

# 更新影厅
PUT /api/admin/halls/{hallId}

# 查询影厅详情
GET /api/admin/halls/{hallId}
```

## 前端集成示例

### 使用 TanStack Query Hooks

```typescript
import {
  useStoresListQuery,
  useHallsByStoreQuery
} from '../hooks/useScheduleQueries';

// 获取门店列表
const { data: stores } = useStoresListQuery({ status: 'ACTIVE' });

// 按门店获取影厅列表
const { data: halls } = useHallsByStoreQuery(selectedStoreId);
```

### 直接调用 scheduleService

```typescript
import { scheduleService } from '../services/scheduleService';

// 获取门店列表
const stores = await scheduleService.getStoreList({ status: 'ACTIVE' });

// 按门店获取影厅
const halls = await scheduleService.getHallsByStore(storeId, {
  status: 'active',
  type: 'VIP'
});
```

## 下一步

- 完成 Phase 6 收尾工作（文档、代码清理、性能优化）
- 与真实 Supabase 环境集成测试
- 添加审计日志记录

