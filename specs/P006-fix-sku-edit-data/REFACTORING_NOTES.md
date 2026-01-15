# 性能优化和代码重构建议

**@spec P006-fix-sku-edit-data**

本文档记录 MVP 实现完成后的性能优化和代码重构建议。

---

## 1. 后端性能优化

### 1.1 减少数据库查询次数（N+1 问题）

#### 当前实现问题
`BOMService.findBySKUId()` 中存在 N+1 查询问题：

```java
// 当前实现：为每个 BOM 组件单独查询 SKU
private BOMComponentDTO mapToComponentDTO(BomComponent component) {
    Optional<Sku> componentSkuOpt = skuRepository.findById(component.getComponentId());
    // ...
}
```

**影响**: 如果 BOM 有 10 个组件，会产生 1 + 10 = 11 次数据库查询。

#### 优化方案
批量查询所有组件 SKU：

```java
public Optional<BOMDetailDTO> findBySKUId(UUID skuId) {
    List<BomComponent> components = bomComponentRepository.findByFinishedProductId(skuId);

    // 提取所有 componentId
    Set<UUID> componentIds = components.stream()
        .map(BomComponent::getComponentId)
        .collect(Collectors.toSet());

    // 批量查询所有组件 SKU（1次查询）
    Map<UUID, Sku> componentSkuMap = skuRepository.findByIdIn(componentIds).stream()
        .collect(Collectors.toMap(Sku::getId, Function.identity()));

    // 映射 DTO（使用缓存的 Map）
    List<BOMComponentDTO> componentDTOs = components.stream()
        .map(comp -> mapToComponentDTO(comp, componentSkuMap))
        .collect(Collectors.toList());

    // ...
}
```

**需要新增的 Repository 方法**:
```java
// SkuRepository.java
List<Sku> findByIdIn(Set<UUID> ids);
```

**预期改进**: 查询次数从 O(n) 降至 O(1)，响应时间减少 50-70%。

---

### 1.2 添加缓存层

#### 缓存策略
对不常变更的数据添加缓存：

```java
@Service
public class SPUService {

    @Cacheable(value = "spu", key = "#spuId", unless = "#result == null")
    public Optional<SPUBasicDTO> findById(UUID spuId) {
        // ...
    }

    @CacheEvict(value = "spu", key = "#spu.id")
    public void updateSPU(Spu spu) {
        // ...
    }
}
```

**缓存配置**:
```yaml
# application.yml
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=500,expireAfterWrite=10m
```

**预期改进**: SPU 重复查询响应时间从 ~200ms 降至 ~5ms。

---

### 1.3 异步加载 BOM 数据（可选）

如果 BOM 数据不是必需的，可以异步加载：

```java
@Async
public CompletableFuture<Optional<BOMDetailDTO>> findBySKUIdAsync(UUID skuId) {
    return CompletableFuture.completedFuture(findBySKUId(skuId));
}
```

前端使用分步加载：
```typescript
// 先加载 SKU + SPU
const { data: skuData } = useSKUEditData(skuId);

// BOM 数据延迟加载（可展开查看）
const { data: bomData } = useBOMData(skuId, { enabled: expandBOM });
```

---

## 2. 前端性能优化

### 2.1 useSKUEditData Hook 优化

#### 当前实现
```typescript
export function useSKUEditData(skuId: string) {
  return useQuery({
    queryKey: ['sku-details', skuId],
    queryFn: () => fetchSKUDetails(skuId),
    staleTime: 2 * 60 * 1000,
  })
}
```

#### 优化建议

**2.1.1 启用 Retry 和 Error Handling**:
```typescript
export function useSKUEditData(skuId: string) {
  return useQuery({
    queryKey: ['sku-details', skuId],
    queryFn: () => fetchSKUDetails(skuId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // 404 错误不重试
      if (error.message.includes('404')) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
```

**2.1.2 添加 Prefetch**:
在列表页悬停时预加载数据：

```typescript
// SKU 列表页
const queryClient = useQueryClient();

const handleRowHover = (skuId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['sku-details', skuId],
    queryFn: () => fetchSKUDetails(skuId),
  });
};
```

---

### 2.2 组件懒加载

大型组件使用 React.lazy：

```typescript
// SKU 编辑页面
const BOMSection = React.lazy(() => import('./components/BOMSection'));
const SPUInfoSection = React.lazy(() => import('./components/SPUInfoSection'));

function SKUEditPage() {
  return (
    <div>
      <SKUBasicInfo />

      <Suspense fallback={<Skeleton />}>
        <SPUInfoSection />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <BOMSection />
      </Suspense>
    </div>
  );
}
```

---

## 3. 代码重构建议

### 3.1 提取 Mapper 为独立工具类

#### 当前问题
Mapper 逻辑分散在 Service 层：

```java
// SPUService.java
private SPUBasicDTO mapToDTO(Spu spu) { ... }

// BOMService.java
private BOMComponentDTO mapToComponentDTO(BomComponent component) { ... }
```

#### 重构方案
创建专用 Mapper 类：

```java
// com.cinema.product.mapper.SPUMapper
@Component
public class SPUMapper {

    public SPUBasicDTO toBasicDTO(Spu spu) {
        if (spu == null) return null;

        return SPUBasicDTO.builder()
            .id(spu.getId())
            .name(spu.getName())
            .categoryId(parseUUID(spu.getCategoryId()))
            .categoryName(spu.getCategoryName())
            // ...
            .build();
    }

    private UUID parseUUID(String uuidStr) {
        try {
            return UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format: {}", uuidStr);
            return null;
        }
    }
}
```

**优点**:
- 可复用性高
- 易于单元测试
- 职责分离清晰

---

### 3.2 统一异常处理

创建全局异常处理器：

```java
@ControllerAdvice
public class ProductExceptionHandler {

    @ExceptionHandler(SkuNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleSkuNotFound(SkuNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of(
            "success", false,
            "error", "SKU_NTF_001",
            "message", e.getMessage(),
            "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericError(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity.status(500).body(Map.of(
            "success", false,
            "error", "SKU_SYS_001",
            "message", "服务器内部错误",
            "timestamp", Instant.now().toString()
        ));
    }
}
```

**优点**:
- 统一错误响应格式
- Controller 层代码简化
- 易于维护

---

### 3.3 使用 MapStruct 替代手动映射

#### 引入依赖
```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>
```

#### 定义 Mapper 接口
```java
@Mapper(componentModel = "spring")
public interface SPUMapper {

    @Mapping(source = "categoryId", target = "categoryId", qualifiedByName = "stringToUUID")
    @Mapping(source = "brandId", target = "brandId", qualifiedByName = "stringToUUID")
    SPUBasicDTO toBasicDTO(Spu spu);

    @Named("stringToUUID")
    default UUID stringToUUID(String uuidStr) {
        try {
            return UUID.fromString(uuidStr);
        } catch (Exception e) {
            return null;
        }
    }
}
```

**优点**:
- 编译时生成代码（零性能开销）
- 类型安全
- 自动处理嵌套对象

---

## 4. 测试改进

### 4.1 添加单元测试

#### SPUService 单元测试
```java
@ExtendWith(MockitoExtension.class)
class SPUServiceTest {

    @Mock
    private SpuRepository spuRepository;

    @InjectMocks
    private SPUService spuService;

    @Test
    void findById_whenExists_shouldReturnDTO() {
        // Given
        UUID spuId = UUID.randomUUID();
        Spu spu = Spu.builder()
            .id(spuId)
            .name("测试SPU")
            .build();

        when(spuRepository.findById(spuId)).thenReturn(Optional.of(spu));

        // When
        Optional<SPUBasicDTO> result = spuService.findById(spuId);

        // Then
        assertTrue(result.isPresent());
        assertEquals("测试SPU", result.get().getName());
    }

    @Test
    void findById_whenNotExists_shouldReturnEmpty() {
        UUID spuId = UUID.randomUUID();
        when(spuRepository.findById(spuId)).thenReturn(Optional.empty());

        Optional<SPUBasicDTO> result = spuService.findById(spuId);

        assertTrue(result.isEmpty());
    }
}
```

---

### 4.2 添加集成测试

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SKUControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getSKUDetails_shouldReturn200() {
        UUID skuId = UUID.fromString("550e8400-e29b-41d4-a716-446655440021");

        ResponseEntity<Map> response = restTemplate.getForEntity(
            "/api/skus/{id}/details",
            Map.class,
            skuId
        );

        assertEquals(200, response.getStatusCodeValue());
        assertTrue((Boolean) response.getBody().get("success"));
    }
}
```

---

## 5. 监控和日志

### 5.1 添加性能监控

使用 Spring Boot Actuator：

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

### 5.2 结构化日志

```java
@Slf4j
@Service
public class SKUService {

    public SKUDetailDTO getSKUWithRelations(UUID skuId) {
        long startTime = System.currentTimeMillis();

        try {
            SKUDetailDTO result = ... // 业务逻辑

            long duration = System.currentTimeMillis() - startTime;
            log.info("operation=GET_SKU_DETAILS,skuId={},duration={}ms,success=true",
                skuId, duration);

            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("operation=GET_SKU_DETAILS,skuId={},duration={}ms,success=false,error={}",
                skuId, duration, e.getMessage(), e);
            throw e;
        }
    }
}
```

---

## 6. 安全性增强

### 6.1 输入验证

```java
@RestController
@Validated
public class SKUController {

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getSKUDetails(
        @PathVariable("id")
        @Pattern(regexp = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
        String id
    ) {
        UUID skuId = UUID.fromString(id);
        // ...
    }
}
```

### 6.2 CORS 配置

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .maxAge(3600);
    }
}
```

---

## 7. 优先级排序

| 优化项 | 优先级 | 预期改进 | 实施难度 |
|--------|--------|----------|----------|
| 批量查询 BOM 组件 SKU | P1 | 响应时间 -50% | 低 |
| 统一异常处理 | P1 | 代码质量 +30% | 低 |
| 添加单元测试 | P1 | 代码可靠性 +50% | 中 |
| 提取 Mapper 工具类 | P2 | 代码可维护性 +20% | 低 |
| 添加缓存层 | P2 | 响应时间 -70% | 中 |
| 使用 MapStruct | P3 | 性能 +5% | 中 |
| 组件懒加载 | P3 | 首屏加载 -20% | 低 |
| 异步加载 BOM | P3 | 首屏加载 -30% | 高 |

---

## 8. 后续计划

### Phase 1 (1-2 周)
- ✅ 批量查询优化
- ✅ 统一异常处理
- ✅ 单元测试覆盖率 > 80%

### Phase 2 (2-3 周)
- ⏳ 添加缓存层
- ⏳ 提取 Mapper 工具类
- ⏳ 集成测试

### Phase 3 (长期)
- 📝 使用 MapStruct
- 📝 异步加载优化
- 📝 性能监控集成

---

**最后更新**: 2025-12-31
**维护者**: P006 团队
