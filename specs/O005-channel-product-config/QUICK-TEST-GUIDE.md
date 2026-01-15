# O005 渠道商品配置 - 快速测试指南

**@spec O005-channel-product-config**

## 5分钟快速验证

针对最近的代码修改，这里提供最快速的验证步骤。

### 前置条件检查

```bash
# 1. 检查后端运行状态
curl http://localhost:8080/actuator/health

# 2. 检查前端运行状态
curl http://localhost:3000

# 预期：两个服务都返回成功响应
```

---

## 测试 1: API 数据结构验证（2分钟）

### 步骤 1: 调用 API

```bash
curl -s 'http://localhost:8080/api/channel-products?channelType=MINI_PROGRAM&page=1&size=1' \
  | python3 -m json.tool
```

### 预期结果：

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "...",
        "sku_id": "...",           // ✅ snake_case
        "channel_type": "...",     // ✅ snake_case
        "display_name": "...",     // ✅ snake_case
        "main_image": "...",       // ✅ snake_case
        "sku": {                    // ✅ SKU 信息已加载
          "id": "...",
          "skuCode": "...",         // ✅ camelCase
          "skuName": "...",         // ✅ camelCase
          "price": 0,               // ✅ 单位：分
          "imageUrl": "..."         // ✅ 来自 mainImage
        }
      }
    ],
    "totalElements": 1
  }
}
```

### 验证点：

- [ ] `sku` 对象存在且不为 null
- [ ] `sku.skuCode` 和 `sku.skuName` 有值
- [ ] `sku.price` 是整数（分为单位）
- [ ] `sku.imageUrl` 与 `main_image` 相同

---

## 测试 2: 前端页面验证（2分钟）

### 步骤 1: 打开浏览器

访问：http://localhost:3000/channel-products/mini-program

### 步骤 2: 打开开发者工具

1. 按 `F12` 打开 DevTools
2. 切换到 **Network** 标签
3. 刷新页面

### 步骤 3: 检查网络请求

找到 `/api/channel-products` 请求，查看 **Preview** 标签：

```javascript
{
  items: [       // ✅ 前端使用 items
    {
      skuId: "...",      // ✅ camelCase
      channelType: "...", // ✅ camelCase
      mainImage: "...",   // ✅ camelCase
      sku: {
        skuCode: "...",
        skuName: "..."
      }
    }
  ],
  total: 1,      // ✅ 前端使用 total
  page: 1,
  size: 20
}
```

### 步骤 4: 检查页面显示

在商品列表中验证：

- [ ] 显示商品图片（不是占位符）
- [ ] 显示 SKU 编码（格式：`SKU: SKU1766642685681`）
- [ ] 显示商品名称
- [ ] 分页组件显示正确的总数

---

## 测试 3: 数据转换验证（1分钟）

在浏览器 Console 中执行：

```javascript
// 复制 toCamelCase 函数（从 channelProductService.ts）
const toCamelCase = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

// 测试转换
const testData = {
  sku_id: "123",
  channel_type: "MINI_PROGRAM",
  main_image: "url",
  sku: {
    sku_code: "SKU001",
    sku_name: "商品"
  }
};

console.log(toCamelCase(testData));
```

### 预期输出：

```javascript
{
  skuId: "123",
  channelType: "MINI_PROGRAM",
  mainImage: "url",
  sku: {
    skuCode: "SKU001",
    skuName: "商品"
  }
}
```

---

## 常见问题排查

### 问题 1: SKU 信息为 null

**症状**: API 返回的 `sku` 字段为 null

**检查**:
```bash
# 查看后端日志
tail -f backend/backend-runtime.log | grep -i "sku"
```

**可能原因**:
- SKU ID 不存在于 SKU 表
- `loadSkuInfo()` 方法未调用
- Supabase API 连接失败

---

### 问题 2: 前端显示 undefined

**症状**: 页面显示 `SKU: undefined`

**检查**:
在 Console 中查看数据结构：
```javascript
// 打印 table 的 dataSource
const table = document.querySelector('.ant-table-tbody');
console.log(table.__reactProps$);  // 查看 React props
```

**可能原因**:
- 数据未转换为 camelCase
- `pagedData?.items` 为空
- `record.sku?.skuCode` 路径错误

---

### 问题 3: 图片不显示

**症状**: 显示图片占位符图标

**检查**:
1. 打开 Network 标签，查看图片请求是否 404
2. 检查 `mainImage` 字段是否有值
3. 验证 Supabase Storage 公开访问权限

**可能原因**:
- `mainImage` 为 null
- Supabase 图片 URL 过期
- CORS 配置问题

---

## 快速数据清理

如果需要清理测试数据：

```bash
# 执行清理脚本
psql -h localhost -U postgres -d cinema_db \
  -f specs/O005-channel-product-config/cleanup-e2e-data.sql
```

或通过 API：

```bash
# 软删除所有测试商品
curl -X DELETE http://localhost:8080/api/channel-products/{id}
```

---

## 完整测试流程

### Playwright E2E 测试命令

```bash
# 进入前端目录
cd frontend

# 执行所有 O005 渠道商品配置相关测试
npx playwright test --grep "channel-product"

# 执行特定测试场景
npx playwright test --grep "E2E-CHANNEL-PRODUCT-001"  # 列表展示测试
npx playwright test --grep "E2E-CHANNEL-PRODUCT-002"  # 数据转换测试
npx playwright test --grep "E2E-CHANNEL-PRODUCT-003"  # SKU 加载测试
npx playwright test --grep "E2E-CHANNEL-PRODUCT-004"  # CRUD 完整流程

# 使用 UI 模式（可视化调试）
npx playwright test --ui --grep "channel-product"

# 查看测试报告
npx playwright show-report

# 调试模式（逐步执行）
npx playwright test --debug --grep "E2E-CHANNEL-PRODUCT-001"

# 指定浏览器执行
npx playwright test --project=chromium --grep "channel-product"
npx playwright test --project=firefox --grep "channel-product"
npx playwright test --project=webkit --grep "channel-product"

# 生成代码（录制测试）
npx playwright codegen http://localhost:3000/channel-products/mini-program
```

### 手动测试步骤

如果 Playwright 测试尚未编写，按以下顺序手动执行：

1. **E2E-CHANNEL-PRODUCT-002**: 数据转换边界测试（5分钟）
2. **E2E-CHANNEL-PRODUCT-003**: SKU 信息加载测试（15分钟）
3. **E2E-CHANNEL-PRODUCT-001**: 列表展示测试（10分钟）
4. **E2E-CHANNEL-PRODUCT-004**: CRUD 完整流程（20分钟，⚠️ 含数据清理）

---

## 成功标志

所有测试通过后，你应该看到：

✅ API 返回包含 `sku` 对象的数据
✅ 前端正确转换 snake_case 为 camelCase
✅ 页面显示 SKU 编码和商品图片
✅ 价格正确转换为分
✅ 分页数据结构正确（items, total）

如果以上都通过，恭喜！代码修改已验证无误。

---

**最后更新**: 2026-01-01
**适用版本**: O005 当前分支
**估计时间**: 5-50分钟（根据测试深度）
