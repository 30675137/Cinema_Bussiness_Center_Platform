# O005 渠道商品配置 E2E 测试清单

**@spec O005-channel-product-config**

## 测试概览

本文档列出了渠道商品配置模块的所有 E2E 测试场景，用于验证近期代码修改的正确性。

### 近期代码修改摘要

1. **后端 SKU 信息加载** (ChannelProductService.java)
   - 添加 `loadSkuInfo()` 和 `loadSkuInfoForSingle()` 方法
   - 使用 `@Transient` 字段 `skuInfo` 存储 SKU 数据
   - 价格从元（BigDecimal）转换为分（Long）
   - 图片 URL 来自 `ChannelProductConfig.mainImage`

2. **前端数据转换** (channelProductService.ts)
   - 添加 `toCamelCase()` 函数转换 snake_case 到 camelCase
   - 修改 `fetchChannelProducts()` 返回 `items` 替代 `content`
   - 修改 `fetchChannelProduct()` 应用 camelCase 转换

3. **前端页面适配** (ChannelProductListPage.tsx)
   - 数据访问从 `pagedData?.content` 改为 `pagedData?.items`
   - 总数从 `pagedData?.totalElements` 改为 `pagedData?.total`

---

## 测试场景清单

### ✅ E2E-CHANNEL-PRODUCT-001: 渠道商品列表展示测试

**优先级**: High
**文件**: `E2E-CHANNEL-PRODUCT-001.yaml`

**测试目标**:
- 验证列表页面能正确显示 SKU 信息
- 验证 API 数据转换（snake_case → camelCase）
- 验证分页数据结构正确

**关键测试点**:
- [ ] 页面成功加载商品列表
- [ ] API 返回正确的 snake_case 格式
- [ ] 前端正确转换为 camelCase
- [ ] 表格显示 SKU 编码和名称
- [ ] 商品图片正确加载
- [ ] 分页组件显示正确的 total

**预期结果**:
- SKU 编码显示格式：`SKU: SKU1766642685681`
- 图片从 Supabase 成功加载
- 数据结构：`{ items: [...], total: N, page: 1, size: 20 }`

---

### ✅ E2E-CHANNEL-PRODUCT-002: 数据转换边界测试

**优先级**: Medium
**文件**: `E2E-CHANNEL-PRODUCT-002.yaml`

**测试目标**:
- 验证 `toCamelCase()` 函数在各种边界情况下的正确性
- 测试 null、undefined、嵌套对象、数组的转换

**关键测试点**:
- [ ] null 值转换
- [ ] undefined 值转换
- [ ] 简单对象 snake_case 转换
- [ ] 嵌套对象递归转换
- [ ] 数组元素转换
- [ ] 已经是 camelCase 的字段保持不变

**测试数据**:
```javascript
// 输入
{ sku_id: "123", sku: { sku_code: "SKU001" } }

// 预期输出
{ skuId: "123", sku: { skuCode: "SKU001" } }
```

---

### ✅ E2E-CHANNEL-PRODUCT-003: SKU 信息加载与价格转换测试

**优先级**: High
**文件**: `E2E-CHANNEL-PRODUCT-003.yaml`

**测试目标**:
- 验证后端正确加载 SKU 信息
- 验证价格从元到分的转换
- 验证图片 URL 来自正确的字段

**关键测试点**:
- [ ] 单个商品查询时 SKU 信息已加载
- [ ] 列表查询时批量加载 SKU 信息
- [ ] 价格转换正确（29.90元 → 2990分）
- [ ] imageUrl 来自 `config.getMainImage()`
- [ ] SKU 不存在时不抛异常

**价格转换测试用例**:
| 输入 (元) | 预期输出 (分) |
|----------|-------------|
| 0.00     | 0           |
| 29.90    | 2990        |
| 100.00   | 10000       |
| null     | null        |

---

### ✅ E2E-CHANNEL-PRODUCT-004: 完整 CRUD 操作测试（含数据清理）

**优先级**: High
**文件**: `E2E-CHANNEL-PRODUCT-004.yaml`
**环境**: Development Only

**测试目标**:
- 执行完整的 CRUD 测试流程
- 验证前端 UI 正确显示
- 测试结束后清理所有测试数据

**测试阶段**:
1. **CREATE**: 创建测试商品
2. **READ**: 单个查询 + 列表查询
3. **UPDATE**: 更新商品信息 + 状态变更
4. **UI_TEST**: 前端页面验证
5. **DELETE**: 软删除
6. **CLEANUP**: 数据清理

**关键测试点**:
- [ ] 创建商品成功并返回 ID
- [ ] 查询返回完整 SKU 信息
- [ ] 更新操作正确应用
- [ ] 前端 UI 显示 SKU 编码和图片
- [ ] 软删除后不可查询
- [ ] 测试数据完全清理

**数据清理策略**:
- 自动删除所有包含 "E2E测试" 的记录
- 使用 `cleanup-e2e-data.sql` 脚本
- 验证无残留测试数据

⚠️ **警告**: 此测试包含删除操作，仅在开发环境执行！

---

## 测试执行指南

### 前置条件

1. **后端服务运行**:
   ```bash
   cd backend
   JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home \
   ./mvnw spring-boot:run -DskipTests > backend-runtime.log 2>&1 &
   ```

2. **前端服务运行**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **数据库准备**:
   - 至少有一条渠道商品配置记录
   - SKU 数据已正确关联

### 手动测试步骤

#### 测试 1: 列表展示
1. 访问 http://localhost:3000/channel-products/mini-program
2. 打开浏览器开发者工具 → Network 标签
3. 检查 `/api/channel-products` 请求和响应
4. 验证表格显示 SKU 编码和图片

#### 测试 2: 数据转换
1. 在浏览器 Console 执行：
   ```javascript
   // 复制 toCamelCase 函数到 Console
   const testData = { sku_id: "123", main_image: "url" };
   console.log(toCamelCase(testData));
   // 预期: { skuId: "123", mainImage: "url" }
   ```

#### 测试 3: SKU 加载
1. 使用 curl 测试 API：
   ```bash
   curl -s 'http://localhost:8080/api/channel-products?channelType=MINI_PROGRAM&page=1&size=1' \
   | python3 -m json.tool
   ```
2. 验证响应包含 `sku` 对象
3. 验证 `sku.price` 是以分为单位
4. 验证 `sku.imageUrl` 存在

### 自动化测试（未来）

使用 Playwright 自动化执行：
```bash
cd frontend
npm run test:e2e -- E2E-CHANNEL-PRODUCT-001
```

---

## 测试结果记录

### 测试执行记录

| 场景ID | 日期 | 执行人 | 结果 | 备注 |
|-------|------|-------|------|------|
| E2E-CHANNEL-PRODUCT-001 | 2026-01-01 | - | ⏳ Pending | 列表展示测试 |
| E2E-CHANNEL-PRODUCT-002 | 2026-01-01 | - | ⏳ Pending | 数据转换边界测试 |
| E2E-CHANNEL-PRODUCT-003 | 2026-01-01 | - | ⏳ Pending | SKU 加载测试 |
| E2E-CHANNEL-PRODUCT-004 | 2026-01-01 | - | ⏳ Pending | CRUD 完整流程（含清理） |

### 已知问题

1. **SKU 不存在时的处理**
   - 当前实现：返回 null，不抛异常 ✅
   - 预期行为：前端显示占位符或默认文本

2. **性能考虑**
   - 列表查询时循环调用 `skuRepository.findById()`
   - 未来优化：实现批量查询接口

---

## 回归测试建议

每次修改以下代码时，必须重新执行测试：

1. **后端**:
   - `ChannelProductService.java` - SKU 加载逻辑
   - `ChannelProductConfig.java` - SKU 信息 DTO
   - `ChannelProductController.java` - API 端点

2. **前端**:
   - `channelProductService.ts` - 数据转换
   - `ChannelProductListPage.tsx` - 数据访问
   - `ChannelProductTable.tsx` - SKU 显示

---

## 相关文档

- **规格文档**: `specs/O005-channel-product-config/spec.md`
- **代码修改记录**: Git commits on `feat/O005-channel-product-config`
- **Bug 修复记录**: "商品信息没有展现 SKU 名称和图片" (2026-01-01)

---

**最后更新**: 2026-01-01
**测试覆盖率**: 3 个场景，覆盖核心功能
**下一步**: 执行手动测试并记录结果
