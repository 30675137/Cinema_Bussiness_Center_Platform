# Research: SKU编辑页面数据加载修复

**@spec P006-fix-sku-edit-data**

**Research Date**: 2025-12-31
**Status**: Complete

---

## 1. SKU/SPU/BOM数据关联查询策略

### Decision
**单次API调用返回完整数据** - 实现新的后端端点 `GET /api/skus/{id}/details` 返回包含SKU、SPU和BOM的嵌套数据结构。

### Rationale

1. **减少网络往返次数**: 单次请求比3次并行请求减少网络延迟，特别是在移动网络或高延迟环境下性能提升明显
2. **数据一致性保证**: 后端在同一事务内查询关联数据，避免并行请求导致的数据不一致（如SKU已更新但SPU未更新）
3. **简化前端逻辑**: 前端只需处理一个TanStack Query hook，错误处理和加载状态管理更简单
4. **已有实现基础**: 当前`skuService.getSkuById()`已展示了类似模式（通过SPU缓存填充关联信息），后端扩展为聚合端点是自然演进
5. **符合RESTful最佳实践**: 使用子资源路径`/skus/{id}/details`明确表示这是聚合视图，而不是基础资源

### Alternatives Considered

**Option 2: 前端并行请求三个独立API**
- ❌ **拒绝理由**: 增加3倍网络请求，在2秒性能目标下风险较高（每个API需<700ms才能达标）
- ❌ 并行请求的部分失败场景处理复杂（需分别处理SKU、SPU、BOM的错误状态）
- ❌ 数据一致性依赖客户端时间窗口，可能出现关联数据版本不匹配

**Option 3: GraphQL查询**
- ❌ **拒绝理由**: 项目当前技术栈为Spring Boot + RESTful API，引入GraphQL需额外依赖（Spring GraphQL 2.x）和学习成本
- ❌ 小规模数据聚合（仅3个实体）不足以抵消GraphQL的复杂性开销
- ❌ 前端需集成GraphQL客户端（如Apollo Client），与当前TanStack Query架构冲突

### Implementation Notes

1. **后端API设计**:
   ```java
   @GetMapping("/api/skus/{id}/details")
   public ResponseEntity<ApiResponse<SKUDetailResponse>> getSKUDetails(@PathVariable String id) {
       SKUDetailResponse response = skuService.getSKUWithRelations(id);
       return ResponseEntity.ok(ApiResponse.success(response));
   }
   ```

2. **响应数据结构** (参考plan.md中的定义):
   ```typescript
   interface SKUDetailResponse {
     sku: SKU;
     spu: SPU | null;
     bom: BOM | null;
     metadata: {
       spuLoadSuccess: boolean;
       bomLoadSuccess: boolean;
       spuStatus: 'valid' | 'invalid' | 'not_linked';
     };
   }
   ```

3. **Supabase查询优化**:
   - 使用单次JOIN查询 `SKU LEFT JOIN SPU ON sku.spu_id = spu.id LEFT JOIN BOM ON bom.sku_id = sku.id`
   - 利用Supabase的`select()`方法嵌套查询关联表数据
   - 设置30秒超时控制（符合后端架构规范）

4. **缓存策略**:
   - 后端使用Caffeine缓存SPU数据（TTL 5分钟），减少Supabase查询压力
   - 前端TanStack Query缓存设置`staleTime: 2 * 60 * 1000`（2分钟），平衡数据新鲜度和性能

5. **错误处理**:
   - 当SPU或BOM加载失败时，使用`metadata`字段标记部分失败，而非整体报错
   - 返回HTTP 200 + `metadata.spuLoadSuccess: false`，允许前端显示已加载的SKU数据

---

## 2. TanStack Query并行数据获取最佳实践

### Decision
**单个useQuery + 后端聚合** - 基于研究1的决策，前端使用单个`useQuery`调用后端聚合端点，而非并行查询。

### Rationale

1. **与研究1决策一致**: 既然后端提供聚合端点，前端无需并行请求
2. **简化错误处理**: 单个query的错误状态管理比多个query的协调更简单
3. **TanStack Query最佳实践**: 官方文档推荐"尽量减少query数量，服务器端聚合优于客户端拼接"
4. **代码可维护性**: 单个自定义Hook `useSKUEditData(id)`封装所有数据获取逻辑，易于测试和复用

### Alternatives Considered

**Option 2: 并行useQuery + enabled依赖**
```typescript
// ❌ 不采用
const { data: sku } = useQuery(['sku', id], () => fetchSKU(id));
const { data: spu } = useQuery(['spu', sku?.spuId], () => fetchSPU(sku.spuId), {
  enabled: !!sku?.spuId
});
const { data: bom } = useQuery(['bom', id], () => fetchBOM(id));
```
- ❌ **拒绝理由**: 引入查询依赖链，SPU查询等待SKU完成，总延迟增加
- ❌ 部分失败场景处理复杂（如SKU成功但SPU失败，需手动同步状态）

**Option 3: useQueries批量查询**
```typescript
// ❌ 不采用
const results = useQueries([
  { queryKey: ['sku', id], queryFn: () => fetchSKU(id) },
  { queryKey: ['spu', spuId], queryFn: () => fetchSPU(spuId) },
  { queryKey: ['bom', id], queryFn: () => fetchBOM(id) }
]);
```
- ❌ **拒绝理由**: 虽然实现了并行，但仍需处理3个独立的loading/error状态
- ❌ 需要手动合并results数组，代码复杂度高

### Implementation Notes

1. **自定义Hook设计**:
   ```typescript
   // frontend/src/hooks/useSKUEditData.ts
   export function useSKUEditData(skuId: string) {
     return useQuery({
       queryKey: ['skuDetails', skuId],
       queryFn: () => skuService.getSKUDetails(skuId),
       staleTime: 2 * 60 * 1000, // 2分钟缓存
       retry: 2, // 失败重试2次
       onError: (error) => {
         // 统一错误日志记录
         console.error('[P001] SKU详情加载失败', { skuId, error });
       }
     });
   }
   ```

2. **部分失败场景处理**:
   ```typescript
   const { data, isLoading, error } = useSKUEditData(skuId);

   if (data && !data.metadata.spuLoadSuccess) {
     message.warning('SPU信息加载失败，其他数据正常显示');
   }
   ```

3. **加载状态优化**:
   - 使用Ant Design Skeleton组件显示骨架屏（FR-010）
   - 分区域显示加载状态（SKU区、SPU区、BOM区独立渲染）

4. **缓存失效策略**:
   - 当SKU更新成功后，调用`queryClient.invalidateQueries(['skuDetails', skuId])`刷新缓存
   - 避免显示过期数据

---

## 3. BOM配方虚拟滚动实现方案

### Decision
**Ant Design Table虚拟滚动** - 使用Ant Design 6.x内置的`virtual`属性实现BOM配方列表的虚拟滚动。

### Rationale

1. **零额外依赖**: Ant Design 6.1.0已内置虚拟滚动支持，无需引入react-window（7KB）或react-virtualized（28KB）
2. **API一致性**: 使用`<Table virtual scroll={{ y: 400 }} />`即可启用，与现有Table代码完全兼容
3. **性能验证**: Ant Design Table虚拟滚动在10-1000行数据场景下性能表现优秀（内部使用rc-virtual-list）
4. **样式一致性**: 虚拟滚动表格与普通Table样式完全一致，无需额外CSS调整
5. **符合项目规范**: B端前端技术栈规则要求使用Ant Design组件，避免引入第三方库

### Alternatives Considered

**Option 1: react-window**
- ❌ **拒绝理由**: 需额外安装依赖（+7KB bundle size），且需自定义Table样式适配
- ❌ 与Ant Design Table的列排序、筛选等功能集成复杂
- ⚠️ 仅在需要高度定制化虚拟滚动时考虑

**Option 2: react-virtualized**
- ❌ **拒绝理由**: 体积过大（28KB gzipped），维护不活跃（最后更新2021年）
- ❌ API设计过时，官方推荐使用react-window替代

**Option 4: 自定义实现（Intersection Observer + CSS transform）**
- ❌ **拒绝理由**: 开发成本高，需处理行高计算、滚动同步、动态插入等复杂逻辑
- ❌ 维护成本高，bugfix和性能优化需额外投入

### Implementation Notes

1. **Ant Design Table虚拟滚动配置**:
   ```typescript
   // frontend/src/components/ProductManagement/BOMListDisplay.tsx
   <Table
     columns={bomColumns}
     dataSource={bomComponents}
     virtual
     scroll={{ y: 400 }} // 固定高度400px，触发虚拟滚动
     pagination={false}
     rowKey="id"
   />
   ```

2. **触发条件**:
   - 当BOM配方原料数量 > 10种时，使用虚拟滚动表格
   - ≤ 10种时使用普通Table，避免虚拟滚动的额外开销

   ```typescript
   const shouldUseVirtualScroll = bomComponents.length > 10;

   <Table
     virtual={shouldUseVirtualScroll}
     scroll={shouldUseVirtualScroll ? { y: 400 } : undefined}
     // ...
   />
   ```

3. **性能目标验证**:
   - 目标: 60 FPS滚动帧率（NFR-003）
   - 测试场景: 50种原料BOM配方列表
   - 预期表现: 虚拟滚动仅渲染可见区域~10行，滚动流畅无卡顿

4. **兼容性说明**:
   - Ant Design 6.1.0的`virtual`属性支持Chrome 90+, Firefox 88+, Safari 14+
   - 符合项目B端目标浏览器要求

5. **Fallback策略**:
   - 如果虚拟滚动在某些边缘浏览器出现问题，保留`virtual={false}`降级方案
   - 监控用户反馈和性能指标，必要时调整阈值（从10种调整为20种）

---

## 4. 并发编辑冲突检测机制

### Decision
**乐观锁（版本号）** - 在SKU实体添加`version`字段，更新时对比版本号，检测到冲突时显示覆盖警告弹窗。

### Rationale

1. **Spring Data JPA原生支持**: 使用`@Version`注解即可自动实现版本号递增和冲突检测
2. **数据库无关性**: 版本号机制不依赖数据库特性，Supabase（PostgreSQL）完全支持
3. **性能优越**: 无额外查询开销，版本号检查在UPDATE语句中完成（WHERE id = ? AND version = ?）
4. **冲突检测精确**: 版本号严格递增，任何并发修改都会导致冲突，无漏检
5. **前端实现简单**: 提交时携带当前version，后端返回409冲突时弹窗提示用户

### Alternatives Considered

**Option 2: 乐观锁（时间戳）**
```sql
UPDATE sku SET ..., updated_at = NOW() WHERE id = ? AND updated_at = ?
```
- ⚠️ **部分可行但不推荐**: 时间戳精度问题（毫秒级冲突可能漏检）
- ⚠️ 时区处理复杂（后端、数据库、前端时区不一致风险）
- ⚠️ 时钟回拨导致时间戳倒退，冲突检测失效

**Option 3: ETag + If-Match**
```http
GET /api/skus/123
ETag: "v3"

PUT /api/skus/123
If-Match: "v3"
```
- ⚠️ **HTTP协议级实现可行但复杂**: 需在每个响应头添加ETag，前端需手动管理ETag缓存
- ⚠️ TanStack Query的缓存机制与ETag管理耦合，集成复杂
- ⚠️ ETag内容仍需基于version或hash，本质未简化

### Implementation Notes

1. **后端实体设计**:
   ```java
   @Entity
   @Table(name = "sku")
   public class SKU {
       @Id
       private String id;

       @Version // JPA自动管理版本号
       private Long version;

       // 其他字段...
   }
   ```

2. **后端更新逻辑**:
   ```java
   @PutMapping("/api/skus/{id}")
   public ResponseEntity<ApiResponse<SKU>> updateSKU(
       @PathVariable String id,
       @RequestBody UpdateSKURequest request
   ) {
       try {
           SKU updated = skuService.updateSKU(id, request.getVersion(), request);
           return ResponseEntity.ok(ApiResponse.success(updated));
       } catch (OptimisticLockException e) {
           // 版本号冲突
           ConflictResponse conflict = new ConflictResponse(
               "SKU_CONFLICT_001",
               "数据已被其他用户修改，您确认要覆盖吗？",
               skuService.getCurrentVersion(id), // 当前最新版本
               request.getVersion() // 请求的版本
           );
           return ResponseEntity.status(409).body(ApiResponse.failure(conflict));
       }
   }
   ```

3. **前端冲突处理**:
   ```typescript
   const mutation = useMutation({
     mutationFn: (data) => skuService.updateSKU(skuId, data),
     onError: (error) => {
       if (error.code === 'SKU_CONFLICT_001') {
         Modal.confirm({
           title: '数据冲突',
           content: '数据已被其他用户修改，您确认要覆盖吗？',
           onOk: () => {
             // 强制覆盖（重新获取最新数据并提交）
             refetch().then(latestData => {
               mutation.mutate({ ...formData, version: latestData.version });
             });
           }
         });
       }
     }
   });
   ```

4. **数据库迁移**:
   - 在Supabase中为`sku`表添加`version BIGINT NOT NULL DEFAULT 1`字段
   - 为现有数据初始化version=1
   - 添加索引`CREATE INDEX idx_sku_version ON sku(id, version)`优化冲突检测性能

5. **测试场景**:
   - **场景1**: 用户A编辑SKU（version=3），用户B同时编辑并先保存（version=4），用户A保存时触发冲突
   - **场景2**: 单用户编辑，刷新页面后再保存，版本号一致无冲突
   - **场景3**: 用户选择"覆盖"后，使用最新version重新提交，成功保存

6. **性能影响**:
   - 版本号检查在WHERE子句中完成，无额外查询
   - 索引优化后，冲突检测耗时<1ms（可忽略）

---

## 5. 前后端日志记录集成方案

### Decision
**前端: console.error + TanStack Query onError回调** | **后端: Spring Boot SLF4J + Logback结构化日志（JSON格式）**

### Rationale

1. **前端日志方案选择**:
   - ✅ 当前项目**未集成Sentry**或其他前端日志服务，引入需额外成本和配置
   - ✅ `console.error`在开发环境直接可见，生产环境可通过浏览器DevTools或日志采集工具收集
   - ✅ TanStack Query的`onError`回调提供统一错误拦截点，集中记录API失败日志
   - ⚠️ 未来如项目引入Sentry，可无缝迁移（仅需在onError中添加`Sentry.captureException(error)`）

2. **后端日志方案选择**:
   - ✅ Spring Boot默认集成SLF4J + Logback，无需额外依赖
   - ✅ 结构化日志（JSON格式）便于ELK/Splunk等日志分析工具解析
   - ✅ 包含完整上下文（SKU ID、失败类型、HTTP状态码、时间戳、用户ID），满足NFR-001要求

3. **集成优势**:
   - 前端日志包含请求ID（通过axios拦截器生成），后端日志包含相同请求ID，便于关联排查
   - 数据加载失败时，前后端日志同时记录，提供完整调用链路

### Alternatives Considered

**Option 1: 前端集成Sentry**
- ⚠️ **暂不采用**: Sentry需额外配置（DSN、项目创建、权限管理），且有成本考虑（免费版限额5000事件/月）
- ⚠️ 当前bugfix范围小，引入Sentry性价比低
- ✅ **推荐未来采用**: 如项目规模扩大或错误监控需求增加，Sentry是最佳选择

**Option 2: 前端日志API转发**
```typescript
// ❌ 不采用
axios.post('/api/logs/frontend', { level: 'error', message, context });
```
- ❌ **拒绝理由**: 增加后端API负担，每个前端错误都发送HTTP请求，可能影响性能
- ❌ 网络故障时日志无法发送，丢失关键错误信息
- ❌ 需实现日志去重、限流等逻辑，复杂度高

**Option 3: 后端使用其他日志框架（如Log4j2）**
- ⚠️ **不推荐**: Spring Boot默认Logback，切换至Log4j2需额外配置且无明显收益
- ⚠️ Log4j2的异步日志性能优势在当前小规模日志场景下不明显

### Implementation Notes

#### 前端日志记录

1. **TanStack Query全局错误处理**:
   ```typescript
   // frontend/src/services/queryClient.ts
   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         onError: (error) => {
           // 统一日志记录
           console.error('[TanStack Query Error]', {
             message: error.message,
             stack: error.stack,
             timestamp: new Date().toISOString(),
           });
         }
       }
     }
   });
   ```

2. **SKU数据加载专用日志**:
   ```typescript
   // frontend/src/hooks/useSKUEditData.ts
   export function useSKUEditData(skuId: string) {
     return useQuery({
       queryKey: ['skuDetails', skuId],
       queryFn: () => skuService.getSKUDetails(skuId),
       onError: (error) => {
         console.error('[P001] SKU详情加载失败', {
           skuId,
           errorType: error.code || 'UNKNOWN',
           errorMessage: error.message,
           httpStatus: error.response?.status,
           timestamp: new Date().toISOString(),
           userId: getCurrentUserId(), // 假设有用户上下文
         });
       }
     });
   }
   ```

3. **部分失败场景日志**:
   ```typescript
   if (data && !data.metadata.spuLoadSuccess) {
     console.warn('[P001] SPU数据加载失败', {
       skuId,
       spuStatus: data.metadata.spuStatus,
       timestamp: new Date().toISOString(),
     });
   }
   ```

#### 后端日志记录

1. **Logback配置（结构化JSON日志）**:
   ```xml
   <!-- backend/src/main/resources/logback-spring.xml -->
   <configuration>
     <appender name="JSON_FILE" class="ch.qos.logback.core.FileAppender">
       <file>logs/application.log</file>
       <encoder class="net.logstash.logback.encoder.LogstashEncoder">
         <includeMdc>true</includeMdc>
         <includeContext>false</includeContext>
       </encoder>
     </appender>

     <logger name="com.cinema.sku" level="INFO" />
     <root level="INFO">
       <appender-ref ref="JSON_FILE" />
     </root>
   </configuration>
   ```

2. **SKU Service日志记录**:
   ```java
   @Service
   public class SKUService {
       private static final Logger logger = LoggerFactory.getLogger(SKUService.class);

       public SKUDetailResponse getSKUWithRelations(String skuId) {
           logger.info("Loading SKU details", Map.of(
               "skuId", skuId,
               "operation", "GET_SKU_DETAILS"
           ));

           try {
               SKU sku = skuRepository.findById(skuId)
                   .orElseThrow(() -> new NotFoundException("SKU_NTF_001", "SKU不存在"));

               SPU spu = null;
               boolean spuLoadSuccess = false;
               try {
                   spu = spuRepository.findById(sku.getSpuId()).orElse(null);
                   spuLoadSuccess = spu != null;
               } catch (Exception e) {
                   logger.error("SPU加载失败", Map.of(
                       "skuId", skuId,
                       "spuId", sku.getSpuId(),
                       "failureType", "SPU_LOAD_FAILURE",
                       "errorMessage", e.getMessage()
                   ), e);
               }

               BOM bom = null;
               boolean bomLoadSuccess = false;
               try {
                   bom = bomRepository.findBySkuId(skuId).orElse(null);
                   bomLoadSuccess = bom != null;
               } catch (Exception e) {
                   logger.error("BOM加载失败", Map.of(
                       "skuId", skuId,
                       "failureType", "BOM_LOAD_FAILURE",
                       "errorMessage", e.getMessage()
                   ), e);
               }

               logger.info("SKU详情加载完成", Map.of(
                   "skuId", skuId,
                   "spuLoadSuccess", spuLoadSuccess,
                   "bomLoadSuccess", bomLoadSuccess
               ));

               return new SKUDetailResponse(sku, spu, bom, spuLoadSuccess, bomLoadSuccess);
           } catch (Exception e) {
               logger.error("SKU详情加载失败", Map.of(
                   "skuId", skuId,
                   "failureType", "SKU_LOAD_FAILURE",
                   "httpStatus", 500
               ), e);
               throw e;
           }
       }
   }
   ```

3. **日志字段标准**（符合NFR-001要求）:
   - `skuId`: SKU唯一标识
   - `failureType`: 失败类型（SPU_LOAD_FAILURE, BOM_LOAD_FAILURE, SKU_LOAD_FAILURE）
   - `errorMessage`: 错误消息
   - `httpStatus`: HTTP状态码（如500, 404）
   - `timestamp`: ISO 8601格式时间戳（Logback自动添加）
   - `userId`: 用户ID（从Spring Security上下文获取）
   - `operation`: 操作类型（GET_SKU_DETAILS）

4. **日志分析查询示例**:
   ```bash
   # 查询所有SKU加载失败日志
   grep "SKU_LOAD_FAILURE" logs/application.log | jq '.skuId, .errorMessage'

   # 查询特定SKU的加载日志
   grep '"skuId":"sku-123"' logs/application.log | jq .
   ```

5. **未来Sentry集成迁移路径**:
   - 前端: 在TanStack Query的`onError`中添加`Sentry.captureException(error)`
   - 后端: 添加Sentry Java SDK依赖，配置`SentryAppender`
   - 保留现有日志格式，Sentry作为补充监控手段

---

## Summary of Decisions

| 研究任务 | 选择方案 | 关键优势 |
|---------|---------|---------|
| 1. 数据关联查询 | 单次API调用 | 减少网络往返，保证数据一致性，简化前端逻辑 |
| 2. TanStack Query | 单个useQuery | 与方案1一致，简化错误处理，符合最佳实践 |
| 3. 虚拟滚动 | Ant Design Table | 零额外依赖，API一致性，样式兼容 |
| 4. 冲突检测 | 乐观锁（版本号） | JPA原生支持，数据库无关，性能优越 |
| 5. 日志记录 | 前端console.error + 后端SLF4J JSON | 低成本，符合现有技术栈，满足NFR-001要求 |

---

## Next Steps

1. ✅ 研究决策已完成，可进入Phase 1设计阶段
2. 🔜 基于以上决策编写`data-model.md`和`contracts/api.yaml`
3. 🔜 实现自定义Hook `useSKUEditData`和后端`getSKUDetails`端点
4. 🔜 编写E2E测试验证所有决策的正确性

---

**Version**: 1.0
**Last Updated**: 2025-12-31
