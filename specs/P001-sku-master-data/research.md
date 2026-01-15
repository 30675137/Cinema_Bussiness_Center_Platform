# 研究文档: SKU主数据管理(支持BOM)

**功能分支**: P001-sku-master-data
**研究日期**: 2025-12-24
**研究目的**: 确定如何在现有SKU管理系统中扩展BOM支持的SKU类型功能

## 研究总结

基于对现有代码库的分析和业务需求,确定以下关键技术决策:

### 决策 1: SKU类型字段实现方案

**选择**: TypeScript枚举 + Ant Design Select组件

**实施方案**:
```typescript
// frontend/src/types/sku.ts 中已存在基础结构,需扩展
export enum SkuType {
  RAW_MATERIAL = 'raw_material',      // 原料
  PACKAGING = 'packaging',             // 包材
  FINISHED_PRODUCT = 'finished_product', // 成品
  COMBO = 'combo'                      // 组合/套餐
}

// SKU接口扩展
export interface SKU {
  // ...现有字段
  skuType: SkuType; // 新增类型字段
  // ...
}
```

**UI实现**: 在BasicInfoTab.tsx中添加SKU类型选择器
```tsx
<Form.Item label="SKU类型" required>
  <Controller
    name="skuType"
    control={control}
    rules={{ required: '请选择SKU类型' }}
    render={({ field }) => (
      <Select {...field} placeholder="请选择SKU类型">
        <Option value={SkuType.RAW_MATERIAL}>原料</Option>
        <Option value={SkuType.PACKAGING}>包材</Option>
        <Option value={SkuType.FINISHED_PRODUCT}>成品</Option>
        <Option value={SkuType.COMBO}>组合/套餐</Option>
      </Select>
    )}
  />
</Form.Item>
```

**类型特定验证**: 使用Zod条件验证
```typescript
// schema.ts
const skuFormSchema = z.object({
  skuType: z.nativeEnum(SkuType),
  standardCost: z.number().optional(),
  // ... 其他字段
}).refine((data) => {
  // 原料和包材必须有标准成本
  if ([SkuType.RAW_MATERIAL, SkuType.PACKAGING].includes(data.skuType)) {
    return data.standardCost !== undefined && data.standardCost > 0;
  }
  return true;
}, {
  message: "原料和包材必须输入标准成本",
  path: ["standardCost"]
});
```

**类型标签/徽章**: 使用Ant Design Tag组件
```tsx
// SkuTable.tsx列配置
{
  title: 'SKU类型',
  dataIndex: 'skuType',
  key: 'skuType',
  render: (type: SkuType) => {
    const typeConfig = {
      [SkuType.RAW_MATERIAL]: { color: 'blue', text: '原料' },
      [SkuType.PACKAGING]: { color: 'green', text: '包材' },
      [SkuType.FINISHED_PRODUCT]: { color: 'orange', text: '成品' },
      [SkuType.COMBO]: { color: 'purple', text: '套餐' }
    };
    const config = typeConfig[type];
    return <Tag color={config.color}>{config.text}</Tag>;
  }
}
```

**基本原理**: TypeScript枚举提供类型安全,Ant Design组件提供一致的UI体验,Zod验证确保数据完整性。

**替代方案**:
- 字符串常量: 更简单但类型安全性较弱
- 数字枚举: 节省存储但可读性差

---

### 决策 2: 门店范围配置实现

**选择**: PostgreSQL数组字段 + Ant Design Select多选组件

**数据模型设计**:
```sql
-- Supabase PostgreSQL表结构扩展
ALTER TABLE skus ADD COLUMN store_scope TEXT[] DEFAULT '{}';
-- 空数组表示"全门店可用",非空数组表示特定门店列表
```

**前端数据结构**:
```typescript
export interface SKU {
  // ...
  storeScope: string[]; // 门店ID列表,空数组=全门店
  // ...
}
```

**UI组件**: Ant Design Select多选模式
```tsx
<Form.Item label="门店范围">
  <Controller
    name="storeScope"
    control={control}
    render={({ field }) => (
      <Select
        {...field}
        mode="multiple"
        placeholder="留空表示全门店可用,或选择特定门店"
        allowClear
        showSearch
        filterOption={(input, option) =>
          (option?.children as string)
            ?.toLowerCase()
            .includes(input.toLowerCase())
        }
      >
        {stores.map(store => (
          <Option key={store.id} value={store.id}>
            {store.name}
          </Option>
        ))}
      </Select>
    )}
  />
</Form.Item>
```

**门店范围筛选**:
- 前端筛选: 简单场景下在SKU列表中按用户当前门店过滤
- 后端筛选: 复杂查询时使用PostgreSQL数组操作符

```sql
-- 后端查询示例(Spring Boot + Supabase)
SELECT * FROM skus
WHERE store_scope = '{}' -- 全门店
   OR :storeId = ANY(store_scope); -- 特定门店
```

**BOM组件门店一致性验证**:
```typescript
// services/bomValidation.ts
export function validateStoreScopeConsistency(
  finishedProduct: SKU,
  components: SKU[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 成品的门店范围
  const productStores = finishedProduct.storeScope.length === 0
    ? 'ALL'
    : new Set(finishedProduct.storeScope);

  components.forEach(comp => {
    const compStores = comp.storeScope.length === 0
      ? 'ALL'
      : new Set(comp.storeScope);

    // 规则: 成品门店必须是组件门店的子集
    if (productStores !== 'ALL' && compStores !== 'ALL') {
      const hasIntersection = [...productStores].some(s =>
        compStores.has(s)
      );
      if (!hasIntersection) {
        errors.push(`组件"${comp.name}"在成品的门店范围内不可用`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}
```

**性能考虑**:
- 门店数量 < 100: 使用数组字段,性能良好
- 门店数量 > 100: 考虑引入关联表 `sku_store_mapping`,但会增加复杂度

**基本原理**: PostgreSQL原生数组字段支持高效查询,避免额外关联表的复杂性。前端组件提供直观的多选体验。

**替代方案**:
- 关联表: 适合大规模门店,但增加查询复杂度
- JSON字段: 灵活但查询性能不如数组

---

### 决策 3: 标准成本计算实现

**选择**: 前端实时计算 + 后端缓存策略

**成本计算逻辑位置**:
- **前端**: BOM编辑时实时计算并显示(用户体验)
- **后端**: 保存时计算并缓存到数据库(数据一致性)

**实时计算实现** (基于现有BomTab.tsx):
```typescript
// 扩展现有BomTab组件
const calculateStandardCost = (
  components: BomComponent[],
  wasteRate: number = 0 // 损耗率,默认0%
): number => {
  const componentCost = components.reduce((total, comp) => {
    return total + (comp.unitCost || 0) * comp.quantity;
  }, 0);

  // 应用损耗率: 成本 × (1 + 损耗率)
  return componentCost * (1 + wasteRate / 100);
};

// 在BomTab中添加实时计算
useEffect(() => {
  const components = getValues('bom.components') || [];
  const wasteRate = getValues('bom.wasteRate') || 0;
  const totalCost = calculateStandardCost(components, wasteRate);
  setValue('standardCost', totalCost, { shouldValidate: true });
}, [watch('bom.components'), watch('bom.wasteRate')]);
```

**成本明细展示**: 表格形式
```tsx
<Table
  dataSource={components}
  columns={[
    { title: '组件', dataIndex: 'materialName' },
    { title: '数量', dataIndex: 'quantity' },
    { title: '单位', dataIndex: 'unit' },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      render: (cost) => `¥${cost.toFixed(2)}`
    },
    {
      title: '小计',
      dataIndex: 'totalCost',
      render: (cost) => `¥${cost.toFixed(2)}`
    }
  ]}
  summary={() => (
    <Table.Summary>
      <Table.Summary.Row>
        <Table.Summary.Cell colSpan={4}>
          <Text strong>组件成本合计</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <Text strong>¥{componentTotal.toFixed(2)}</Text>
        </Table.Summary.Cell>
      </Table.Summary.Row>
      <Table.Summary.Row>
        <Table.Summary.Cell colSpan={4}>
          <Text>损耗率 ({wasteRate}%)</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <Text>¥{wasteCost.toFixed(2)}</Text>
        </Table.Summary.Cell>
      </Table.Summary.Row>
      <Table.Summary.Row>
        <Table.Summary.Cell colSpan={4}>
          <Text strong type="danger">标准成本</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <Text strong type="danger">
            ¥{standardCost.toFixed(2)}
          </Text>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  )}
/>
```

**后端缓存策略** (Spring Boot):
```java
// SkuService.java
public SKU saveSKU(SKUCreateRequest request) {
    SKU sku = new SKU();
    // ... 设置基础字段

    // 如果是成品且有BOM,计算并缓存标准成本
    if (sku.getSkuType() == SkuType.FINISHED_PRODUCT
        && request.getBom() != null) {
        BigDecimal standardCost = bomService
            .calculateStandardCost(request.getBom());
        sku.setStandardCost(standardCost);
    }

    // 如果是套餐,汇总子项成本
    if (sku.getSkuType() == SkuType.COMBO
        && request.getSubItems() != null) {
        BigDecimal standardCost = calculateComboCoSt(
            request.getSubItems()
        );
        sku.setStandardCost(standardCost);
    }

    return supabaseSkuRepository.save(sku);
}
```

**单位换算与成本计算集成**:
- 依赖FR-02单位换算体系
- 成本计算时所有组件数量统一换算到基础单位
- 示例: 1瓶(700ml) × 0.5元/ml = 350元

**基本原理**: 前端实时计算提供即时反馈,后端缓存避免重复计算,两者结合平衡性能和准确性。

**替代方案**:
- 纯后端计算: 每次查询都计算,性能差
- 纯前端计算: 数据一致性风险高

---

### 决策 4: 技术栈遵循性验证

基于宪法要求,本功能技术栈符合性检查:

**B端管理后台** (本功能主要实现)
- ✅ React 19.2.0 + TypeScript 5.9.3
- ✅ Ant Design 6.1.0 UI组件
- ✅ Zustand 5.0.9 (SKU列表状态管理)
- ✅ TanStack Query 5.90.12 (SKU数据查询)
- ✅ React Hook Form 7.68.0 + Zod 4.1.13 (表单验证)
- ✅ MSW 2.12.4 (开发阶段Mock数据)

**后端API**
- ✅ Spring Boot 3.x + Java 21
- ✅ Supabase PostgreSQL (主数据存储)
- ✅ 统一API响应格式 (ApiResponse<T>)

**C端支持** (未来扩展)
- 如需C端SKU浏览功能,必须使用Taro框架实现
- 当前P001仅实现B端管理界面

---

## 未解决问题与风险

### 风险 1: 单位换算依赖

**问题**: 成本计算依赖FR-02单位换算体系,但单位换算功能尚未完整实现

**缓解措施**:
1. Phase 1数据模型中明确定义单位换算关系表
2. 提供基础单位换算Mock数据(瓶/ml/克等常用单位)
3. 在BOM配置时校验单位换算是否存在,避免运行时错误

### 风险 2: BOM循环依赖

**问题**: 成品A的BOM包含成品B,成品B的BOM又包含成品A

**缓解措施**:
1. 前端表单中限制BOM组件仅能选择原料和包材类型SKU
2. 后端保存时增加循环依赖检测逻辑
3. 组合/套餐类型的子项可以包含成品,但成品的BOM组件不能包含成品

### 风险 3: 门店范围验证性能

**问题**: 大量SKU的门店范围验证可能影响BOM保存性能

**缓解措施**:
1. 仅在启用成品/套餐状态时执行验证
2. 使用PostgreSQL数组操作符优化查询
3. 前端显示验证进度,避免用户等待焦虑

---

## 技术债务

1. **类型定义不完整**: 现有sku.ts类型定义缺少skuType字段,需补充
2. **BOM组件可复用性**: 现有BomTab位于product模块,需评估是否重构为通用组件
3. **测试覆盖不足**: 现有SKU模块测试覆盖率未知,需补充单元测试和E2E测试

---

## 参考资料

- 现有代码: `frontend/src/components/sku/*`
- BOM组件参考: `frontend/src/components/product/ProductForm/BomTab.tsx`
- 类型定义: `frontend/src/types/sku.ts`
- 规格说明: `specs/P001-sku-master-data/spec.md`
- 宪法文档: `.specify/memory/constitution.md`
