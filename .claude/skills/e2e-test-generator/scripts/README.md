# 测试数据自动生成脚本

**@spec T002-e2e-test-generator**

## 📖 概述

`generate_testdata.py` 是一个自动化脚本,扫描指定模块的所有 E2E 场景 YAML 文件,提取 `testdata_ref` 引用,自动生成完整的 TypeScript 测试数据模块。

## 🚀 使用方法

### 基本用法

```bash
# 进入项目根目录
cd /path/to/Cinema_Bussiness_Center_Platform

# 运行脚本生成测试数据
python3 .claude/skills/e2e-test-generator/scripts/generate_testdata.py <module_name>
```

### 示例

```bash
# 生成 inventory 模块的测试数据
python3 .claude/skills/e2e-test-generator/scripts/generate_testdata.py inventory

# 生成 order 模块的测试数据
python3 .claude/skills/e2e-test-generator/scripts/generate_testdata.py order

# 生成 product 模块的测试数据
python3 .claude/skills/e2e-test-generator/scripts/generate_testdata.py product
```

## 📊 脚本功能

### 1. 扫描 YAML 文件

脚本会扫描 `scenarios/<module_name>/*.yaml` 目录下的所有场景文件。

**示例输出**:
```
🔍 扫描 scenarios/inventory 目录...
📁 找到 9 个场景文件
  ├─ 解析 E2E-INVENTORY-001.yaml
  ├─ 解析 E2E-INVENTORY-002.yaml
  ...
```

### 2. 提取测试数据引用

从 YAML 文件中提取所有 `testdata_ref` 引用。

**YAML 示例**:
```yaml
steps:
  - action: login
    params:
      testdata_ref: inventoryTestData.admin_user  # ✅ 会被提取
```

**提取结果**:
```
✅ 提取到 30 个唯一的测试数据引用
📊 数据集分布:
  - inventoryTestData: 19 个数据项
  - bomTestData: 11 个数据项
```

### 3. 智能数据类型推断

根据 key 名称自动推断数据类型和结构。

| Key 模式 | 推断类型 | 生成模板 |
|---------|---------|---------|
| `*_user`, `user_*` | `user_credentials` | 用户凭证结构 |
| `*_config` | `config` | 配置数据结构 |
| `product_*`, `*_sku` | `product` | 商品数据结构 |
| `order_*` | `order` | 订单数据结构 |
| `*_page` | `page_path` | 页面路径 |
| `*_btn`, `*_selector` | `selector` | CSS 选择器 |
| `*_transaction` | `transaction` | 事务数据结构 |
| `inventory_*`, `*_stock` | `inventory` | 库存数据结构 |
| `store_*` | `store` | 门店数据结构 |
| `payment_*` | `payment` | 支付数据结构 |
| `scenario_*` | `scenario` | 场景数据集 |

### 4. 生成 TypeScript 模块

自动生成完整的 TypeScript 测试数据模块,包含:

- **数据定义**: 每个 `testdata_ref` 对应的变量定义
- **类型推断**: 根据命名模式自动推断数据结构
- **场景数据集**: 每个场景对应的完整数据集
- **默认导出**: 统一导出所有数据

**生成文件位置**: `frontend/src/testdata/<module_name>.ts`

## 📝 生成的文件结构

```typescript
/**
 * @spec T002-e2e-test-generator
 * E2E 测试数据 - INVENTORY 模块
 */

// ==================== bomTestData ====================

export const product_whiskey_cola = {
  id: '550e8400-e29b-41d4-a716-105564',
  code: '6901234567153',
  name: 'Product Whiskey Cola',
  category: '分类',
  price: 35.00,
  unit: '个',
};

// ==================== inventoryTestData ====================

export const admin_user = {
  username: 'admin_user',
  password: 'test123',
  email: 'admin_user@example.com',
  role: 'admin',
};

export const manager_user = {
  username: 'manager_user',
  password: 'test123',
  email: 'manager_user@example.com',
  role: 'manager',
};

// ==================== 场景数据集 ====================

export const scenario_001 = {
  baseUrl: 'http://localhost:3000',
  // TODO: Add specific data for E2E-INVENTORY-001
};

// ==================== 导出默认数据集 ====================

export const inventoryTestData = {
  product_whiskey_cola,
  admin_user,
  manager_user,
  scenario_001,
  // ...
};

export default inventoryTestData;
```

## ⚙️ 工作原理

### 流程图

```
1. 扫描 YAML 文件
   ↓
2. 解析 YAML 内容
   ↓
3. 提取所有 testdata_ref
   ↓
4. 按数据集分组 (inventoryTestData, bomTestData, etc.)
   ↓
5. 为每个 key 推断数据类型
   ↓
6. 生成对应的数据模板
   ↓
7. 生成场景数据集
   ↓
8. 生成统一导出
   ↓
9. 写入 TypeScript 文件
```

### 数据类型推断逻辑

```python
def infer_data_type(key: str) -> str:
    if '_user' in key or key.startswith('user_'):
        return 'user_credentials'
    if '_config' in key:
        return 'config'
    if 'product' in key or 'sku' in key:
        return 'product'
    # ... 更多规则
    return 'generic'
```

### 模板生成逻辑

```python
templates = {
    'user_credentials': """{{
      username: '{key}',
      password: 'test123',
      email: '{key}@example.com',
      role: '{role}',
    }}""",
    'product': """{{
      id: '550e8400-e29b-41d4-a716-{random_uuid}',
      code: '690123456{random_num}',
      name: '{name}',
      category: '分类',
      price: 35.00,
      unit: '个',
    }}""",
    # ... 更多模板
}
```

## 🔧 后续步骤

生成文件后,您需要:

### 1. 审查生成的文件

```bash
# 查看生成的文件
cat frontend/src/testdata/inventory.ts
```

### 2. 填充 TODO 部分

脚本会标记需要手动填充的部分:

```typescript
// ✅ 自动生成的部分 - 保持不变
export const admin_user = {
  username: 'admin_user',
  password: 'test123',
  email: 'admin_user@example.com',
  role: 'admin',
};

// ⚠️ 需要手动填充的部分
export const adjustment_data = {
  // TODO: Define structure for adjustment_data  ← 手动补充
};

export const scenario_001 = {
  baseUrl: 'http://localhost:3000',
  // TODO: Add specific data for E2E-INVENTORY-001  ← 手动补充
};
```

### 3. 补充业务逻辑数据

根据实际业务需求,补充以下数据:

- **商品 SKU ID**: 使用真实的 UUID 或固定的测试 ID
- **订单数据**: 订单项、总金额等
- **库存数据**: 库存数量、单位、阈值等
- **场景数据集**: 每个场景的完整测试数据

**示例**:

```typescript
// 手动补充的 adjustment_data
export const adjustment_data = {
  skuId: '550e8400-e29b-41d4-a716-446655440001',
  skuCode: '6901234567001',
  skuName: '威士忌',
  adjustmentType: 'surplus',
  quantity: 50,
  reason: 'E2E 测试盘盈',
  remark: '自动化测试数据',
};

// 手动补充的 scenario_004
export const scenario_004 = {
  baseUrl: 'http://localhost:3000',
  manager_user: manager_user,
  safety_stock_config: safety_stock_config,
  product_sku: product_sku,
  manager_email: manager_email,
};
```

### 4. 验证生成的文件

```bash
# TypeScript 语法检查
cd frontend
npx tsc --noEmit src/testdata/inventory.ts

# 在测试中导入验证
npm run test:e2e:ui -- ../scenarios/inventory/E2E-INVENTORY-004.spec.ts
```

## 📋 命令行选项

### 当前支持

```bash
python3 generate_testdata.py <module_name>
```

### 未来计划

```bash
# 覆盖已存在的文件
python3 generate_testdata.py inventory --force

# 仅显示预览,不写入文件
python3 generate_testdata.py inventory --dry-run

# 指定输出目录
python3 generate_testdata.py inventory --output /path/to/output

# 详细日志
python3 generate_testdata.py inventory --verbose
```

## ⚠️ 注意事项

### 1. 文件覆盖警告

⚠️ **重要**: 如果目标文件已存在,脚本会**直接覆盖**它。

**建议**:
- 首次运行前备份现有文件
- 使用 Git 追踪变更
- 手动合并生成的数据和现有数据

### 2. 数据完整性

生成的文件包含很多 `// TODO` 注释,需要手动补充:

```typescript
// ✅ 完整的数据
export const admin_user = {
  username: 'admin_user',
  password: 'test123',
  email: 'admin_user@example.com',
  role: 'admin',
};

// ❌ 不完整的数据 - 需要手动补充
export const adjustment_data = {
  // TODO: Define structure for adjustment_data
};
```

### 3. 随机 ID 问题

脚本生成的 UUID 和编码是随机的,**不保证**每次运行结果相同:

```typescript
// 每次运行可能生成不同的 ID
export const product_sku = {
  id: '550e8400-e29b-41d4-a716-236926',  // ← 随机
  code: '6901234564004',                 // ← 随机
  name: 'Product Sku',
  category: '分类',
  price: 35.00,
  unit: '个',
};
```

**建议**: 生成后手动修改为固定 ID,确保测试可复现。

## 🆘 常见问题

### Q1: 脚本报错 "No module named 'yaml'"

**A**: 安装 PyYAML 依赖:

```bash
pip3 install pyyaml
```

### Q2: 生成的文件在哪里?

**A**: 生成的文件位于:

```
frontend/src/testdata/<module_name>.ts
```

例如: `frontend/src/testdata/inventory.ts`

### Q3: 如何自定义数据类型推断规则?

**A**: 编辑 `generate_testdata.py` 中的 `infer_data_type()` 方法:

```python
def infer_data_type(self, key: str) -> str:
    key_lower = key.lower()

    # 添加自定义规则
    if 'my_custom_pattern' in key_lower:
        return 'my_custom_type'

    # 现有规则...
```

### Q4: 如何自定义生成的数据模板?

**A**: 编辑 `generate_data_template()` 方法中的 `templates` 字典:

```python
templates = {
    'my_custom_type': """{{
      customField1: '{key}',
      customField2: 'default_value',
    }}""",
    # 现有模板...
}
```

### Q5: 脚本能处理嵌套的 testdata_ref 吗?

**A**: 当前版本仅处理简单的 `<dataset>.<key>` 格式。不支持嵌套引用如 `data.nested.field`。

## 📚 相关文档

- [E2E 测试数据创建指南](../../../../docs/E2E_TEST_DATA_GUIDE.md)
- [e2e-test-generator Skill](../skill.md)
- [测试数据模块 README](../../../../frontend/src/testdata/README.md)

## 🔄 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0.0 | 2025-12-30 | 初始版本,支持基本的测试数据自动生成 |

---

**维护者**: e2e-test-generator skill
**反馈**: 项目 Issues 或 Pull Requests
