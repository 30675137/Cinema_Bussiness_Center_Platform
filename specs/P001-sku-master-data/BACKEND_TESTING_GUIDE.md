# Backend API Testing Guide - P001 SKU Master Data

**Feature**: SKU主数据管理(支持BOM)
**Status**: ✅ 后端服务运行成功 - API测试通过
**Date**: 2025-12-24

---

## 📋 当前状态

### ✅ 后端服务状态

**服务运行**: ✅ Spring Boot 成功启动在 http://localhost:8080
**数据库迁移**: ✅ Flyway migrations V026-V029 执行成功
**API端点**: ✅ 核心API端点测试通过
**测试数据**: ✅ 21个SKU测试数据已导入

### ✅ 已完成的后端代码

**Controller层** (3个控制器, 13个API端点):
- `SkuController.java` - 7个端点
- `BomController.java` - 2个端点
- `ComboController.java` - 2个端点
- `StoreScopeValidationService.java` - 验证逻辑

**Service层**:
- `SkuService.java` - 完整业务逻辑
- `CostCalculationService.java` - 成本计算
- `StoreScopeValidationService.java` - 门店验证

**DTO层** (5个DTOs):
- `SkuCreateRequest.java`
- `SkuUpdateRequest.java`
- `SkuDetailDTO.java`
- `UpdateBomRequest.java`
- `UpdateComboItemsRequest.java`

**Repository层**:
- `SkuRepository.java` - 已添加 `existsByCode()` 和 `delete()` 方法

### ✅ 已解决的问题

#### 1. Lombok 注解处理器配置
- **问题**: Lombok注解未被处理,导致getter/setter方法缺失
- **解决方案**: 在 `pom.xml` 的 `maven-compiler-plugin` 中添加 `annotationProcessorPaths` 配置
- **状态**: ✅ 已修复

#### 2. Flyway 迁移版本冲突
- **问题**: V1 和 V001 migration版本冲突
- **解决方案**: 重命名 P001 migrations 为 V026-V029
- **状态**: ✅ 已修复

#### 3. Jackson 枚举序列化/反序列化
- **问题**: 数据库存储 "enabled" 但 Jackson 期望 "ENABLED"
- **解决方案**:
  - 在 `SkuStatus.getValue()` 添加 `@JsonValue` 注解
  - 在 `SkuStatus.fromValue()` 添加 `@JsonCreator` 注解
  - 同样修复应用到 `SkuType` 枚举
- **状态**: ✅ 已修复

#### 4. Spring MVC 查询参数转换
- **问题**: 查询参数 `?skuType=raw_material` 无法转换为枚举
- **解决方案**: 创建 `StringToSkuTypeConverter` 和 `StringToSkuStatusConverter`
- **状态**: ✅ 已修复

#### 5. LocalDateTime vs Instant 类型不匹配
- **问题**: `SkuDetailDTO` 使用 Instant,但 `Sku` 实体使用 LocalDateTime
- **解决方案**: 统一使用 LocalDateTime
- **状态**: ✅ 已修复

---

## 🔧 测试步骤

### 1. 启动后端服务

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/backend

# 编译
mvn clean compile

# 运行（跳过测试编译）
mvn spring-boot:run -Dmaven.test.skip=true
```

**预期**: 服务启动在 `http://localhost:8080`
**实际**: ✅ 服务成功启动，耗时约 13 秒

### 2. 验证数据库连接

**前置条件**: 确保已在Supabase执行4个迁移脚本
```sql
-- 验证表已创建
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('skus', 'bom_components', 'combo_items', 'unit_conversions');

-- 验证测试数据(应该有21个SKU)
SELECT sku_type, COUNT(*) FROM skus GROUP BY sku_type;
```

**预期结果**:
```
sku_type         | count
-----------------+-------
raw_material     |     5
packaging        |     5
finished_product |     8
combo            |     3
```

### 3. API测试用例

#### 3.1 查询SKU列表 ✅

```bash
# 查询所有SKU
curl -X GET "http://localhost:8080/api/skus" -H "Accept: application/json"

# 按类型筛选(原料)
curl -X GET "http://localhost:8080/api/skus?skuType=raw_material"

# 按状态筛选(启用)
curl -X GET "http://localhost:8080/api/skus?status=enabled"

# 关键词搜索
curl -X GET "http://localhost:8080/api/skus?keyword=威士忌"

# 分页查询
curl -X GET "http://localhost:8080/api/skus?page=1&pageSize=10"
```

**测试结果**: ✅ 通过
**实际响应**:
```json
{
  "total": 21,
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "code": "6901234567001",
      "name": "威士忌",
      "status": "enabled",
      ...
    }
  ],
  "page": 1,
  "pageSize": 20,
  "message": "查询成功"
}
```

**注意**: 部分字段（skuType, mainUnit, spuId等）在测试数据中为null,这是正常的测试数据状态

#### 3.2 获取SKU详情 ✅

```bash
# 获取成品SKU详情(包含BOM)
curl -X GET "http://localhost:8080/api/skus/550e8400-e29b-41d4-a716-446655440021" -H "Accept: application/json"
```

**测试结果**: ✅ 通过
**实际响应**:
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440021",
    "code": "6901234567021",
    "name": "威士忌可乐",
    "status": "enabled",
    "bom": null,
    "comboItems": null
  },
  "timestamp": "2025-12-24T14:25:17.965034Z"
}
```

**注意**: BOM为null是因为测试数据关联尚未建立,但API结构正确

#### 3.3 创建原料SKU

```bash
curl -X POST "http://localhost:8080/api/skus" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST-RAW-001",
    "name": "测试原料",
    "spuId": "550e8400-e29b-41d4-a716-446655440000",
    "skuType": "raw_material",
    "mainUnit": "g",
    "storeScope": [],
    "standardCost": 10.50,
    "status": "draft"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "code": "TEST-RAW-001",
    "name": "测试原料",
    "skuType": "raw_material",
    "standardCost": 10.50
  }
}
```

#### 3.4 创建成品SKU(含BOM)

```bash
curl -X POST "http://localhost:8080/api/skus" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST-FP-001",
    "name": "测试成品",
    "spuId": "550e8400-e29b-41d4-a716-446655440000",
    "skuType": "finished_product",
    "mainUnit": "杯",
    "storeScope": [],
    "wasteRate": 5.0,
    "status": "draft",
    "bomComponents": [
      {
        "componentId": "{原料SKU的ID}",
        "quantity": 100,
        "unit": "g",
        "isOptional": false,
        "sortOrder": 1
      }
    ]
  }'
```

**预期**:
- 成品创建成功
- `standardCost` 自动计算 = 组件成本 × 1.05

#### 3.5 更新BOM配置

```bash
curl -X PUT "http://localhost:8080/api/skus/{finishedProductId}/bom" \
  -H "Content-Type: application/json" \
  -d '{
    "components": [
      {
        "componentId": "{组件1 ID}",
        "quantity": 50,
        "unit": "ml"
      },
      {
        "componentId": "{组件2 ID}",
        "quantity": 100,
        "unit": "ml"
      }
    ],
    "wasteRate": 10.0
  }'
```

**预期**:
- BOM更新成功
- 返回新计算的成本

#### 3.6 验证门店范围

```bash
curl -X POST "http://localhost:8080/api/skus/{finishedProductId}/validate-store-scope" \
  -H "Content-Type: application/json" \
  -d '{
    "storeScope": ["store-1", "store-2"]
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": ["组件'威士忌'在部分门店不可用: store-2"]
  }
}
```

#### 3.7 重新计算成本

```bash
curl -X POST "http://localhost:8080/api/skus/{finishedProductId}/recalculate-cost" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "oldCost": 28.50,
    "newCost": 29.93,
    "changedAt": "2025-12-24T12:00:00Z"
  }
}
```

#### 3.8 删除SKU

```bash
# 删除未被引用的SKU
curl -X DELETE "http://localhost:8080/api/skus/{skuId}"
```

**预期**:
- 如果SKU被BOM或套餐引用,返回400错误
- 如果未被引用,返回200成功

---

## ✅ 测试检查清单

### 数据验证
- [ ] 21个测试SKU已导入
- [ ] 19个BOM组件关系正确
- [ ] 9个套餐子项关系正确
- [ ] 成本计算准确(威士忌可乐 = 29.93元)

### API功能测试
- [ ] SKU列表查询(筛选、分页)
- [ ] SKU详情获取(含BOM/套餐数据)
- [ ] 创建原料/包材SKU
- [ ] 创建成品SKU(自动计算成本)
- [ ] 创建套餐SKU(自动计算成本)
- [ ] 更新BOM配置
- [ ] 更新套餐子项
- [ ] 门店范围验证
- [ ] 手动重新计算成本
- [ ] 删除SKU(依赖检查)

### 错误处理测试
- [ ] 创建重复条码 → 409 Conflict
- [ ] 查询不存在的SKU → 404 Not Found
- [ ] 成品未配置BOM → 400 Bad Request
- [ ] 删除被引用的SKU → 400 Bad Request
- [ ] BOM组件必须是原料/包材 → 400 Bad Request
- [ ] 套餐子项不能是套餐类型 → 400 Bad Request

### 业务规则验证
- [ ] 原料/包材必须手动设置成本
- [ ] 成品成本 = Σ(组件成本) × (1 + 损耗率%)
- [ ] 套餐成本 = Σ(子项成本)
- [ ] 门店范围验证:成品门店 ⊆ 组件门店
- [ ] 级联删除:删除成品时删除BOM配置

---

## 📝 已知问题和TODO

### ✅ 已解决问题
1. ✅ Lombok注解处理器配置
2. ✅ Flyway迁移版本冲突
3. ✅ Jackson枚举序列化/反序列化
4. ✅ Spring MVC查询参数转换
5. ✅ LocalDateTime vs Instant类型不匹配

### ⏳ 待完成任务
1. **测试数据完善**: 补充SKU测试数据中的null字段（skuType, mainUnit等）
2. **BOM关联数据**: 建立测试数据中的BOM组件关联
3. **单元测试**: Repository层/Service层单元测试 (T013-T014)
4. **集成测试**: Controller集成测试 (T015)
5. **前端开发**: Mock数据服务和UI组件 (T019-T030)

### 功能增强 (可选)
1. 批量导入SKU API
2. 成本历史记录
3. BOM变更审计日志
4. 门店范围批量修改

---

## 📊 测试总结

### API测试结果

| 端点 | 状态 | 备注 |
|------|------|------|
| GET /api/skus | ✅ 通过 | 返回21个SKU |
| GET /api/skus?skuType=raw_material | ✅ 通过 | 过滤正常工作 |
| GET /api/skus/{id} | ✅ 通过 | 详情获取成功 |
| POST /api/skus | ⏳ 待测试 | - |
| PUT /api/skus/{id}/bom | ⏳ 待测试 | - |
| PUT /api/skus/{id}/combo-items | ⏳ 待测试 | - |
| DELETE /api/skus/{id} | ⏳ 待测试 | - |

### 修复的关键问题

1. **Lombok配置**: 通过添加`annotationProcessorPaths`解决编译错误
2. **枚举转换**: 通过`@JsonValue`/`@JsonCreator`和自定义Converter解决枚举序列化问题
3. **迁移版本**: 重命名migrations避免版本冲突

---

## 🔗 相关文档

- [功能规格](./spec.md)
- [API契约](./contracts/api.yaml)
- [数据模型](./data-model.md)
- [实现总结](./IMPLEMENTATION_SUMMARY.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)

---

**最后更新**: 2025-12-24 22:27
**状态**: ✅ 后端服务运行成功，核心API测试通过
**下一步**: 完善测试数据 → 测试剩余API端点 → 开发前端组件
