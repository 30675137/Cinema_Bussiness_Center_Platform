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

**响应格式**（列表查询）:
```json
{
  "total": 3,
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "code": "STORE-001",
      "name": "北京朝阳店",
      "region": null,
      "status": "active",
      "createdAt": "2025-12-17T13:15:36.583437Z",
      "updatedAt": "2025-12-17T13:15:36.583437Z"
    }
  ]
}
```

### 按门店查询影厅列表

```bash
curl -X GET "http://localhost:8080/api/stores/{storeId}/halls?status=active&type=VIP" \
  -H "Content-Type: application/json"
```

**响应格式**（列表查询）:
```json
{
  "total": 2,
  "data": [
    {
      "id": "uuid",
      "storeId": "uuid",
      "name": "VIP影厅A",
      "type": "VIP",
      "capacity": 120,
      "tags": ["真皮沙发"],
      "status": "active",
      "createdAt": "2025-12-17T13:15:36.583437Z",
      "updatedAt": "2025-12-17T13:15:36.583437Z"
    }
  ]
}
```

### 查询门店详情

```bash
curl -X GET "http://localhost:8080/api/stores/{storeId}" \
  -H "Content-Type: application/json"
```

**响应格式**（单个资源）:
```json
{
  "data": {
    "id": "11111111-1111-1111-1111-111111111111",
    "code": "STORE-001",
    "name": "北京朝阳店",
    "region": null,
    "status": "active",
    "createdAt": "2025-12-17T13:15:36.583437Z",
    "updatedAt": "2025-12-17T13:15:36.583437Z"
  },
  "timestamp": "2025-12-17T13:15:36.583437Z"
}
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

**响应格式**（单个资源）:
```json
{
  "data": {
    "id": "uuid",
    "storeId": "uuid",
    "name": "VIP影厅A",
    "type": "VIP",
    "capacity": 120,
    "tags": ["真皮沙发", "KTV设备"],
    "status": "active",
    "createdAt": "2025-12-17T13:15:36.583437Z",
    "updatedAt": "2025-12-17T13:15:36.583437Z"
  },
  "timestamp": "2025-12-17T13:15:36.583437Z"
}
```

### ⚠️ API 响应格式说明

**重要**：根据项目宪章要求（见 `.specify/memory/constitution.md`），所有 API 必须遵循统一的响应格式：

1. **列表查询接口**（如 `GET /api/stores`、`GET /api/stores/{id}/halls`）：
   - 当前实现：`{ "total": number, "data": T[] }`
   - **注意**：前端代码已兼容此格式，但未来应统一为包含 `success` 字段的标准格式

2. **单个资源接口**（如 `GET /api/stores/{id}`、`POST /api/admin/halls`）：
   - 使用 `ApiResponse<T>` 包装：`{ "data": T, "timestamp": string }`

3. **错误响应**：
   - 使用 `ErrorResponse` 或 `ApiResponse.failure()`：`{ "success": false, "error": string, "message": string, "details": object }`

**参考**：`docs/问题总结/014-API响应格式不一致问题.md`

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
// frontend/src/pages/stores/services/storeService.ts
export async function getStores(params?: StoreQueryParams): Promise<Store[]> {
  const url = new URL(`${API_BASE_URL}/api/stores`);
  
  // Add query parameters
  if (params?.status) {
    url.searchParams.append('status', params.status);
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch stores: ${response.statusText}`);
  }
  
  // Backend returns format: { data, total }
  // 兼容两种格式：{ data, total } 或 { success, data, total, message, code }
  const result = await response.json();
  
  if (result.success === false) {
    throw new Error(result.message || 'Failed to fetch stores');
  }
  
  // Return data array (compatible with both formats)
  return result.data || [];
}
```

**重要提示**：
- 后端列表查询接口当前返回 `{ data, total }` 格式（无 `success` 字段）
- 前端代码已兼容此格式，但应确保类型定义准确反映实际返回结构
- 未来应统一为包含 `success` 字段的标准格式（见项目宪章要求）

## 部署

### 环境变量配置

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 构建和运行

```bash
# 后端启动
cd backend
mvn clean package
java -jar target/cinema-hall-store-backend-1.0.0.jar

# 或使用 Maven 直接运行
mvn spring-boot:run
```

### 前端启动

```bash
# 安装依赖（首次运行）
cd frontend
npm install

# 启动开发服务器
npm run dev

# 前端将运行在 http://localhost:5173
```

### 访问门店管理页面

启动后访问以下页面:
- 门店管理: http://localhost:5173/stores
- 影厅资源管理: http://localhost:5173/schedule/hall-resources

## 注意事项

1. **Supabase 权限**: 确保使用 Service Role Key 时注意安全性，不要暴露在客户端代码中。
2. **错误处理**: 实现统一的异常处理机制，返回符合 OpenAPI 规范的错误响应。
3. **数据验证**: 在 Service 层和 Controller 层都进行数据验证，确保数据完整性。
4. **性能优化**: 对于频繁查询的接口，考虑在 Supabase 中添加适当的索引。
5. **日志记录**: 记录关键操作和错误，便于问题排查和审计。
6. **API 响应格式标准化** ⚠️：
   - 所有 API 接口必须遵循项目宪章中定义的统一响应格式（见 `.specify/memory/constitution.md`）
   - 列表查询接口应统一使用包含 `success` 字段的标准格式
   - 前后端开发前必须对齐 API 契约，确保类型定义与实际返回格式一致
   - 参考：`docs/问题总结/014-API响应格式不一致问题.md`

## 实现状态

### 已完成

- ✅ Phase 1: Setup (T001-T004) - 后端模块骨架、Supabase 配置、全局异常处理
- ✅ Phase 2: Foundational (T005-T016) - 领域模型、DTO、Mapper、枚举定义、异常处理
- ✅ Phase 3: US1 影厅主数据 (T017-T021) - HallRepository、HallService、HallListController、HallQueryController、HallAdminController
- ✅ Phase 4: US2 门店关系 (T022-T026) - StoreRepository、StoreService、StoreQueryController
- ✅ Phase 5: US3 前后端一致性 (T027-T034) - 前端类型定义、API 服务、TanStack Query hooks
- ✅ Phase 6: US4 门店管理页面 (T035-T042) - StoreTable、StoreSearch、StatusFilter、门店管理页面、路由配置
- ✅ Phase 7: Polish (T043-T049) - 错误处理、CORS配置、加载状态、空状态处理

### 待完成

- 🔲 Phase 7: E2E 测试 (T050) - 端到端测试验证

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

## 常见问题排查

### 问题 1: 前端无法获取门店信息（`http://localhost:3000/stores` 无数据）

**症状**：页面加载但显示空列表，浏览器控制台无错误。

**可能原因**：
1. 后端 API 响应格式与前端期望不一致
2. 前端类型定义与实际返回格式不匹配
3. CORS 配置问题

**排查步骤**：

1. **检查后端 API 是否正常**：
   ```bash
   curl http://localhost:8080/api/stores
   ```
   应该返回 `{ "total": number, "data": [...] }` 格式

2. **检查浏览器 Network 标签**：
   - 查看 `/api/stores` 请求是否成功（状态码 200）
   - 查看响应体格式是否正确

3. **检查前端 Service 代码**：
   - 确认 `storeService.ts` 正确处理响应格式
   - 确认类型定义 `StoreListResponse` 与实际返回一致

4. **检查 CORS 配置**：
   ```bash
   curl -X OPTIONS http://localhost:8080/api/stores \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" -v
   ```
   应该返回 `Access-Control-Allow-Origin: http://localhost:3000`

**解决方案**：
- 如果后端返回格式为 `{ data, total }`，确保前端代码兼容此格式（见 `frontend/src/pages/stores/services/storeService.ts`）
- 如果类型定义不匹配，更新 `frontend/src/pages/stores/types/store.types.ts`（如 `region: string | null`）

**参考文档**：`docs/问题总结/014-API响应格式不一致问题.md`

---

### 问题 2: 后端返回 404 或 500 错误

**排查步骤**：
1. 确认后端服务已启动：`curl http://localhost:8080/actuator/health`
2. 检查 Supabase 配置是否正确（`application.yml` 中的 `supabase.url` 和 `supabase.service-role-key`）
3. 检查 Supabase 表结构是否已创建（见"环境设置"部分）
4. 查看后端日志中的错误信息

---

### 问题 3: 前端类型错误（TypeScript 编译错误）

**排查步骤**：
1. 确认后端 DTO 字段与前端类型定义完全一致（字段名、类型、可选性）
2. 特别注意 `null` 值处理：后端可能返回 `null`，前端类型应定义为 `string | null`
3. 运行类型检查：`cd frontend && npm run type-check`

---

## 下一步

- 完成 Phase 6 收尾工作（文档、代码清理、性能优化）
- 统一后端 API 响应格式，确保所有列表查询接口包含 `success` 字段
- 与真实 Supabase 环境集成测试
- 添加审计日志记录
- 更新 API 契约文档（`contracts/api.yaml`），确保前后端类型定义一致

