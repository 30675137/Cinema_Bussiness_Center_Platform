# Quickstart: P008 SKU 类型重构

**@spec P008-sku-type-refactor**
**Date**: 2026-01-10

## 1. 快速开始

### 1.1 分支切换

```bash
git checkout P008-sku-type-refactor
```

### 1.2 启动开发环境

```bash
# Terminal 1: 后端
cd backend
./mvnw spring-boot:run

# Terminal 2: 前端
cd frontend
npm run dev
```

## 2. 修改清单

### 2.1 后端修改 (Java)

#### Step 1: 更新 SPU 实体

**文件**: `backend/src/main/java/com/cinema/hallstore/domain/Spu.java`

```java
// 移除以下代码:
// @Column(name = "product_type", length = 20)
// private String productType;
//
// public String getProductType() { return productType; }
// public void setProductType(String productType) { this.productType = productType; }
```

#### Step 2: 更新 SKU 服务

**文件**: `backend/src/main/java/com/cinema/hallstore/service/SkuService.java`

```java
// 在 updateSku 方法中添加:
public Sku updateSku(String id, SkuUpdateRequest request) {
    Sku sku = skuRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("SKU not found"));

    // 禁止修改 skuType
    if (request.getSkuType() != null && request.getSkuType() != sku.getSkuType()) {
        throw new BusinessException("SKU_BIZ_001", "SKU类型创建后不可修改");
    }

    // 更新其他字段...
}
```

#### Step 3: 更新 SPU Controller

**文件**: `backend/src/main/java/com/cinema/hallstore/controller/SpuController.java`

移除所有 `productType` 相关的参数和响应字段处理。

### 2.2 前端修改 (TypeScript/React)

#### Step 1: 更新 SPU 类型定义

**文件**: `frontend/src/types/spu.ts`

```diff
-export type ProductType = 'raw_material' | 'packaging' | 'finished_product' | 'combo';

-export const PRODUCT_TYPE_OPTIONS = [
-  { value: 'raw_material', label: '原料', color: 'blue' },
-  { value: 'packaging', label: '包材', color: 'purple' },
-  { value: 'finished_product', label: '成品', color: 'green' },
-  { value: 'combo', label: '套餐', color: 'orange' },
-];

 export interface SPUItem {
   id: string;
   name: string;
-  productType?: ProductType;
   brandId: string;
   // ...
 }
```

#### Step 2: 添加 SKU 类型选择器

**文件**: `frontend/src/components/sku/SkuForm/BasicInfoTab.tsx`

```tsx
import { SkuType, SKU_TYPE_CONFIG } from '@/types/sku';

// 在表单中添加:
<Form.Item
  label="SKU 类型"
  name="skuType"
  rules={[{ required: true, message: '请选择 SKU 类型' }]}
  tooltip="创建后不可修改"
>
  <Select
    placeholder="请选择 SKU 类型"
    disabled={isEditMode}  // 编辑模式下禁用
  >
    {Object.entries(SKU_TYPE_CONFIG).map(([value, config]) => (
      <Select.Option key={value} value={value}>
        <Tag color={config.color}>{config.label}</Tag>
        <span style={{ marginLeft: 8, color: '#999' }}>
          {config.description}
        </span>
      </Select.Option>
    ))}
  </Select>
</Form.Item>
```

#### Step 3: 更新表单 Schema

**文件**: `frontend/src/components/sku/SkuForm/schema.ts`

```typescript
import { z } from 'zod';
import { SkuType } from '@/types/sku';

export const skuFormSchema = z.object({
  skuType: z.nativeEnum(SkuType, {
    errorMap: () => ({ message: '请选择 SKU 类型' }),
  }),
  spuId: z.string().min(1, 'SPU 不能为空'),
  name: z.string().min(1, 'SKU 名称不能为空'),
  standardCost: z.number().optional(),
  // ...
}).refine(
  (data) => {
    // 原料/包材类型必须填写标准成本
    if (
      (data.skuType === SkuType.RAW_MATERIAL || data.skuType === SkuType.PACKAGING) &&
      (data.standardCost === undefined || data.standardCost <= 0)
    ) {
      return false;
    }
    return true;
  },
  {
    message: '原料和包材类型必须填写标准成本',
    path: ['standardCost'],
  }
);
```

## 3. 测试要点

### 3.1 SKU 创建测试

```bash
# 测试创建原料类型 SKU
curl -X POST http://localhost:8080/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "spuId": "spu-001",
    "name": "测试原料",
    "skuType": "raw_material",
    "standardCost": 10.5
  }'

# 预期: 201 Created
```

### 3.2 SKU 类型不可修改测试

```bash
# 测试修改 SKU 类型 (应该失败)
curl -X PUT http://localhost:8080/api/skus/sku-001 \
  -H "Content-Type: application/json" \
  -d '{
    "skuType": "finished_product"
  }'

# 预期: 400 Bad Request
# {
#   "success": false,
#   "error": "SKU_BIZ_001",
#   "message": "SKU类型创建后不可修改"
# }
```

### 3.3 SPU 不再返回 productType

```bash
# 获取 SPU 详情
curl http://localhost:8080/api/spu/spu-001

# 预期响应中不包含 productType 字段
```

## 4. 常见问题

### Q1: 现有 SKU 没有 skuType 怎么办？

**A**: 运行数据验证脚本检查：

```sql
SELECT COUNT(*) FROM sku WHERE sku_type IS NULL;
```

如果有记录，需要手动设置默认类型。

### Q2: 编辑模式下如何显示 SKU 类型？

**A**: 使用只读模式显示：

```tsx
{isEditMode ? (
  <Form.Item label="SKU 类型">
    <Tag color={SKU_TYPE_CONFIG[currentSkuType].color}>
      {SKU_TYPE_CONFIG[currentSkuType].label}
    </Tag>
    <Text type="secondary">创建后不可修改</Text>
  </Form.Item>
) : (
  // 创建模式下的选择器
)}
```

### Q3: SPU 的 productType 数据库列怎么处理？

**A**: 保留数据库列，后端代码忽略即可。不做物理删除，避免数据迁移风险。

## 5. 验收检查

- [ ] SKU 创建页面显示类型选择器
- [ ] SKU 类型选择后正确显示对应表单字段
- [ ] SKU 编辑页面类型为只读
- [ ] SPU 创建/编辑页面不再显示产品类型
- [ ] SPU 列表不再显示产品类型列
- [ ] 后端 SKU 更新拒绝修改 skuType
- [ ] 所有测试通过
