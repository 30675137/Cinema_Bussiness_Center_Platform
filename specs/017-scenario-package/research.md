# Research Findings: 场景包管理技术决策

**Date**: 2025-12-19
**Feature**: 017-scenario-package
**Purpose**: 解决 Technical Context 中标记的所有 NEEDS CLARIFICATION 项

---

## 1. Supabase Storage Integration with Spring Boot

### Decision
使用 **Supabase HTTP REST API** 通过 Spring Boot 的 RestTemplate/WebClient 直接调用，结合 **预签名 URL 模式** 进行图片上传。

### Rationale

1. **SDK 现状**：Supabase 官方 Java SDK 尚不成熟，功能覆盖不完整，社区维护活跃度较低。使用 HTTP REST API 更稳定可控。

2. **上传模式选择**：
   - **预签名 URL 模式**（推荐）：
     - 客户端直接上传到 Supabase Storage，减轻后端负载
     - 避免文件通过后端中转，提升上传速度
     - 后端仅负责生成预签名 URL 和验证权限
   - **直接上传模式**（备选）：
     - 客户端上传到后端，后端转发到 Supabase
     - 适用于需要服务端预处理（如压缩、水印）的场景
     - 本需求中图片仅需验证格式和大小，无需预处理

3. **安全考量**：
   - 预签名 URL 设置短期有效期（10分钟）
   - 后端生成 URL 前验证用户权限
   - Bucket 配置为 `public-read`（仅读公开，写需认证）

### Alternatives Considered

- **使用非官方 Supabase Java SDK**：依赖不稳定，版本更新滞后，不推荐用于生产环境
- **直接使用 AWS S3 SDK**：Supabase Storage 基于 S3 兼容协议，但使用原生 Supabase API 更贴合整体架构

### Implementation Notes

```java
// 示例：生成预签名上传 URL
public String generateUploadUrl(String fileName) {
    String bucketName = "scenario-packages";
    String path = "backgrounds/" + UUID.randomUUID() + "-" + fileName;

    // 调用 Supabase Storage API 生成预签名 URL
    String url = supabaseUrl + "/storage/v1/object/sign/" + bucketName + "/" + path;
    // 设置有效期 600 秒
    Map<String, Object> body = Map.of("expiresIn", 600);

    return restTemplate.postForObject(url, body, Map.class).get("signedUrl");
}
```

**验证策略**：
- 前端：文件类型（JPG/PNG/WebP）、大小（≤5MB）
- 后端：再次验证文件扩展名和 MIME type，防止绕过前端验证
- 上传成功后，后端存储公开访问 URL 到数据库

---

## 2. Version Management for Published Packages

### Decision
采用 **快照模式（Snapshot Pattern）** + **简单版本号递增策略**，修改已发布场景包时创建完整副本作为新版本。

### Rationale

1. **数据完整性**：快照模式确保历史版本完整保留，即使关联的影厅、单品被删除，旧订单仍可查看完整信息。

2. **查询简单性**：每个版本独立存储，查询特定版本无需复杂的时态查询或事件重放。

3. **版本触发时机**：
   - **仅在修改已发布状态的场景包时创建新版本**
   - 草稿状态修改不创建版本，直接覆盖
   - 新版本自动设为草稿状态，需重新发布

4. **版本号策略**：
   - 使用整数版本号（v1, v2, v3...），存储在 `version` 字段
   - 版本号在 ScenarioPackage 表内自增，不跨包共享

### Schema Design

```sql
-- scenario_packages 表
CREATE TABLE scenario_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_package_id UUID,  -- 指向原始包的ID（所有版本共享同一个base_id）
    version INT NOT NULL DEFAULT 1,  -- 版本号
    name VARCHAR(255) NOT NULL,
    description TEXT,
    background_image_url TEXT,
    status VARCHAR(20) NOT NULL,  -- DRAFT, PUBLISHED, UNPUBLISHED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    is_latest BOOLEAN DEFAULT true,  -- 标记是否为最新版本
    UNIQUE(base_package_id, version)
);

-- 索引优化
CREATE INDEX idx_base_package_latest ON scenario_packages(base_package_id, is_latest) WHERE is_latest = true;
CREATE INDEX idx_status ON scenario_packages(status);
```

**版本创建逻辑**：
1. 检测到修改已发布包时，复制整个包（包括关联的 rules、content、pricing）
2. 新版本的 `base_package_id` 指向原始包的 `base_package_id`（或自身 ID 如果是首版本）
3. 新版本的 `version` = 旧版本 + 1
4. 新版本的 `is_latest` = true，旧版本的 `is_latest` = false
5. 新版本的 `status` = DRAFT

### Alternatives Considered

- **时态表（Temporal Tables）**：PostgreSQL 支持，但查询复杂度高，ORM 支持有限
- **事件溯源（Event Sourcing）**：过度设计，不适合当前业务复杂度
- **仅版本化关键字段**：无法保证历史数据完整性，引用的影厅/单品变化时会丢失上下文

### Implementation Notes

- 使用 `base_package_id` 分组所有版本，查询"最新版本"时过滤 `is_latest = true`
- 订单表存储 `scenario_package_id`（具体版本 ID），不使用 `base_package_id`
- 删除操作：软删除仅标记当前版本，历史版本不受影响

---

## 3. Optimistic Locking in Supabase PostgreSQL

### Decision
使用 **version 列**（整数递增）实现乐观锁，结合 PostgreSQL 的 `UPDATE ... WHERE version = ?` 条件更新。

### Rationale

1. **标准模式**：Version 列是乐观锁的工业标准实现，JPA `@Version` 注解直接支持。

2. **冲突检测机制**：
   ```sql
   UPDATE scenario_packages
   SET name = ?, version = version + 1, updated_at = NOW()
   WHERE id = ? AND version = ?;
   ```
   - 如果 `affected_rows = 0`，说明 version 已被其他事务修改，抛出 409 Conflict
   - 如果 `affected_rows = 1`，更新成功

3. **用户体验**：
   - 后端返回 HTTP 409 Conflict + 错误消息："该场景包已被他人修改，请刷新后重试"
   - 前端显示冲突提示，用户手动刷新页面查看最新数据
   - 不实现自动合并（过度复杂，用户场景不常见）

### Implementation Pattern

```java
@Entity
@Table(name = "scenario_packages")
public class ScenarioPackage {
    @Id
    private UUID id;

    @Version  // JPA 乐观锁注解
    private Integer version;

    // 其他字段...
}

// Service 层
public void updatePackage(UUID id, UpdateRequest request, Integer expectedVersion) {
    ScenarioPackage pkg = repository.findById(id)
        .orElseThrow(() -> new NotFoundException("Package not found"));

    // JPA 会自动检查 version，如果不匹配抛出 OptimisticLockException
    if (!pkg.getVersion().equals(expectedVersion)) {
        throw new ConcurrentModificationException("Package已被他人修改，请刷新后重试");
    }

    // 执行更新...
    repository.save(pkg);  // version 自动 +1
}
```

### Alternatives Considered

- **Timestamp-based locking**（基于 `updated_at`）：时间戳可能不精确（毫秒级冲突），且时区问题复杂
- **Row-level locking**（`SELECT ... FOR UPDATE`）：悲观锁，会导致长事务阻塞，不适合 Web 应用
- **Application-level token**：需要额外维护 token 生成和验证逻辑，复杂度高

### Edge Cases

- **并发发布**：发布操作也使用 version 检查，确保只有一个发布成功
- **部分更新**：即使只更新单个字段，version 也会递增
- **版本回滚**：不支持，用户只能创建新版本

---

## 4. Multi-Entity Relationship Design

### Decision

采用 **多表策略** + **Junction Table** 模式：
- **Many-to-Many (Package-Hall)**：使用 `package_hall_associations` 中间表
- **One-to-Many (Package-Content)**：使用独立的 `package_benefits`、`package_items`、`package_services` 表
- **外键约束 + 软删除标记**：关联实体被删除时保留关联但标记失效

### Schema Design

```sql
-- Many-to-Many: Package <-> HallType
CREATE TABLE package_hall_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    hall_type_id UUID NOT NULL REFERENCES hall_types(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(package_id, hall_type_id)
);
CREATE INDEX idx_pkg_hall_package ON package_hall_associations(package_id);
CREATE INDEX idx_pkg_hall_hall ON package_hall_associations(hall_type_id);

-- One-to-Many: Package -> PackageBenefit (硬权益)
CREATE TABLE package_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    benefit_type VARCHAR(50) NOT NULL,  -- DISCOUNT_TICKET, FREE_SCREENING
    discount_rate DECIMAL(5,2),  -- 折扣率（如 0.75 表示 75 折）
    free_count INT,  -- 免费场次数
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_benefits_package ON package_benefits(package_id);

-- One-to-Many: Package -> PackageItem (软权益 - 单品)
CREATE TABLE package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    item_name_snapshot VARCHAR(255),  -- 快照字段，防止 item 改名后历史包名称丢失
    item_price_snapshot DECIMAL(10,2),  -- 快照字段，记录添加时的价格
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_items_package ON package_items(package_id);
CREATE INDEX idx_items_item ON package_items(item_id);

-- One-to-Many: Package -> PackageService (服务项目)
CREATE TABLE package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    service_name_snapshot VARCHAR(255),
    service_price_snapshot DECIMAL(10,2),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_services_package ON package_services(package_id);
CREATE INDEX idx_services_service ON package_services(service_id);
```

### Rationale

1. **独立表 vs 多态表**：
   - 独立表（推荐）：类型安全，字段明确，查询性能好
   - 多态表（不推荐）：需要 `type` 字段区分类型，JSON 存储差异字段，查询和约束复杂

2. **快照字段**：
   - `item_name_snapshot`、`item_price_snapshot` 记录添加时的状态
   - 即使主数据（items 表）改名或改价，场景包历史版本仍保留原始信息
   - 查询时优先使用快照字段，如需最新价格则 JOIN items 表

3. **删除策略**：
   - `ON DELETE CASCADE`：删除场景包时级联删除所有关联
   - `ON DELETE RESTRICT`：删除 HallType/Item/Service 时禁止删除（必须先解除关联）
   - 替代方案：主数据表使用软删除 (`deleted_at`)，关联表增加 `is_valid` 字段标记失效

4. **排序支持**：
   - `sort_order` 字段支持运营人员调整展示顺序
   - 前端拖拽排序后更新 `sort_order` 值

### Query Optimization

```sql
-- 查询场景包及所有关联（避免 N+1）
SELECT
    sp.*,
    json_agg(DISTINCT jsonb_build_object('id', ht.id, 'name', ht.name)) AS hall_types,
    json_agg(DISTINCT jsonb_build_object('id', pi.id, 'name', pi.item_name_snapshot, 'quantity', pi.quantity, 'price', pi.item_price_snapshot)) AS items,
    json_agg(DISTINCT jsonb_build_object('id', ps.id, 'name', ps.service_name_snapshot, 'price', ps.service_price_snapshot)) AS services
FROM scenario_packages sp
LEFT JOIN package_hall_associations pha ON sp.id = pha.package_id
LEFT JOIN hall_types ht ON pha.hall_type_id = ht.id
LEFT JOIN package_items pi ON sp.id = pi.package_id
LEFT JOIN package_services ps ON sp.id = ps.package_id
WHERE sp.id = ?
GROUP BY sp.id;
```

### Alternatives Considered

- **JSON 字段存储关联**：查询和约束复杂，不支持外键，不推荐
- **EAV 模式（Entity-Attribute-Value）**：过度灵活，查询性能差，不适合结构化数据

---

## 5. Pricing Calculation & Reference Price Logic

### Decision
采用 **混合策略**：
- **参考总价**：实时计算（JOIN item/service 表获取当前价格）
- **缓存优化**：前端在编辑页面缓存计算结果，后端API仅按需计算
- **快照字段**：`package_items` 和 `package_services` 表存储添加时的价格快照，用于历史版本查询

### Rationale

1. **实时计算 vs 缓存**：
   - **实时计算**（推荐）：确保价格始终反映最新主数据，适合运营场景
   - **缓存/预计算**（不推荐）：需要监听 item/service 价格变更并触发更新，复杂度高

2. **价格变更处理**：
   - **运营视角**：参考总价实时反映最新价格，提示运营人员"参考总价已变更，请重新确认打包价格"
   - **已发布包**：修改会触发版本创建，新版本使用最新价格，历史版本使用快照价格
   - **用户视角**：已订购的场景包价格不变（锁定到具体版本）

3. **公式与边缘案例**：
   ```
   参考总价 = Σ(item_price × quantity) + Σ(service_price)
   优惠比例 = (打包价格 / 参考总价) × 100%
   优惠金额 = 参考总价 - 打包价格
   ```
   - **零价格 item**：允许，参考总价仍包含（贡献0）
   - **参考总价 = 0**：阻止发布，提示"参考总价为0，无法计算优惠比例"
   - **打包价格 > 参考总价**：允许但警告，显示"无优惠"或"加价 X%"
   - **精度处理**：使用 `DECIMAL(10,2)` 存储价格，避免浮点误差

### API Design

```java
// 端点：GET /api/scenario-packages/{id}/pricing/reference
public ReferencePriceResponse calculateReferencePrice(UUID packageId) {
    ScenarioPackage pkg = repository.findById(packageId);

    // 实时计算
    BigDecimal itemsTotal = packageItemRepository.findByPackageId(packageId).stream()
        .map(pi -> {
            Item item = itemRepository.findById(pi.getItemId());
            return item.getPrice().multiply(new BigDecimal(pi.getQuantity()));
        })
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal servicesTotal = packageServiceRepository.findByPackageId(packageId).stream()
        .map(ps -> {
            Service service = serviceRepository.findById(ps.getServiceId());
            return service.getPrice();
        })
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal referencePrice = itemsTotal.add(servicesTotal);

    return new ReferencePriceResponse(
        referencePrice,
        itemsTotal,
        servicesTotal,
        calculateDiscountPercentage(pkg.getPackagePrice(), referencePrice)
    );
}
```

### Frontend UX

- **编辑页面**：运营人员添加/删除 item/service 时，前端立即调用 `/pricing/reference` API 更新显示
- **价格输入区域**：
  - 显示参考总价
  - 显示打包价格输入框
  - 实时显示优惠比例和优惠金额
  - 如果打包价格 > 参考总价，显示红色警告

### Alternatives Considered

- **完全预计算**：存储 `reference_price` 字段，定时任务更新。复杂且可能不及时。
- **纯快照模式**：仅使用快照价格，不反映最新价格。不符合运营需求。

### Implementation Notes

- **性能优化**：如果一个场景包包含大量 item/service，考虑使用单次批量查询而非 N 次独立查询
- **缓存策略**：前端可缓存计算结果 5 分钟，减少 API 调用频率
- **监控告警**：如果参考总价计算结果为负数或异常值，记录日志并告警

---

## Summary of Decisions

| 未知项 | 决策 | 关键理由 |
|--------|------|---------|
| Supabase Storage 集成 | 使用 REST API + 预签名 URL | SDK 不成熟，预签名 URL 性能更优 |
| 版本管理 | 快照模式 + 版本号递增 | 数据完整性和查询简单性平衡 |
| 乐观锁 | Version 列 + WHERE 条件更新 | JPA 标准支持，工业最佳实践 |
| 多实体关系 | 独立表 + Junction Table | 类型安全，查询优化，支持快照 |
| 定价计算 | 实时计算 + 快照字段 | 反映最新价格，历史版本保留快照 |

---

## Next Steps

1. ✅ 所有技术决策已完成
2. 🔄 进入 Phase 1：基于研究结果生成 `data-model.md`、`contracts/api.yaml`、`quickstart.md`
3. ⏳ 实施阶段将参考本文档的设计模式和代码示例
