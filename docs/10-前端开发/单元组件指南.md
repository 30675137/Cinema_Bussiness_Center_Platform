<!-- @spec M001-material-unit-system -->

# 前端单位组件使用指南

## 概述

本文档说明如何在前端项目中使用统一的单位选择器和换算组件。

## 核心组件

### 1. UnitSelector - 单位选择器

**用途**：在表单中选择单位

```tsx
import { UnitSelector } from '@/components/common/UnitSelector'

<Form.Item name="inventoryUnitId" label="库存单位">
  <UnitSelector
    category="VOLUME"
    placeholder="选择库存单位"
  />
</Form.Item>
```

**Props**:
- `value?: string` - 当前选中的单位ID
- `onChange?: (value: string) => void` - 选择回调
- `category?: UnitCategory` - 单位分类筛选 (VOLUME/WEIGHT/COUNT)
- `placeholder?: string` - 占位符文本
- `disabled?: boolean` - 是否禁用
- `style?: React.CSSProperties` - 自定义样式

**特性**：
- ✅ 支持搜索过滤
- ✅ 支持分类筛选
- ✅ 自动加载单位列表
- ✅ 显示单位名称和代码

### 2. UnitDisplay - 单位展示

**用途**：在列表/详情页展示单位信息

```tsx
import { UnitDisplay } from '@/components/common/UnitDisplay'

<UnitDisplay
  unit={material.inventoryUnit}
  showCode={true}
  showCategory={true}
/>
// 输出: 毫升 (ml) [体积]
```

**Props**:
- `unit?: Unit | null` - 单位对象
- `showCode?: boolean` - 是否显示单位代码（默认true）
- `showCategory?: boolean` - 是否显示分类标签（默认false）

### 3. UnitConversionModal - 单位换算弹窗

**用途**：提供交互式单位换算功能

```tsx
import { UnitConversionModal } from '@/components/common/UnitConversionModal'

const [modalOpen, setModalOpen] = useState(false)

<Button onClick={() => setModalOpen(true)}>换算</Button>

<UnitConversionModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  category="VOLUME"
  materialId={materialId}
/>
```

**Props**:
- `open: boolean` - 是否显示弹窗
- `onClose: () => void` - 关闭回调
- `category?: UnitCategory` - 单位分类筛选
- `materialId?: string` - 物料ID（用于物料级换算）

## Hooks

### useUnitConversion

**用途**：在组件中调用换算服务

```tsx
import { useUnitConversion } from '@/hooks/useUnitConversion'

const MyComponent = () => {
  const { convert, checkCanConvert, loading, result } = useUnitConversion()

  const handleConvert = async () => {
    const response = await convert({
      fromUnitCode: 'L',
      toUnitCode: 'ml',
      quantity: 2.5,
      materialId: 'uuid'
    })

    if (response) {
      console.log(`${response.originalQuantity} ${response.fromUnitCode} = ${response.convertedQuantity} ${response.toUnitCode}`)
    }
  }

  const checkConversion = async () => {
    const canConvertResult = await checkCanConvert('L', 'ml', 'uuid')
    console.log('Can convert:', canConvertResult)
  }

  return <Button onClick={handleConvert} loading={loading}>换算</Button>
}
```

**返回值**:
- `convert: (request: ConversionRequest) => Promise<ConversionResponse | null>` - 执行换算
- `checkCanConvert: (from, to, materialId?) => Promise<boolean>` - 检查是否可换算
- `loading: boolean` - 加载状态
- `result: ConversionResponse | null` - 最近一次换算结果

## 工具函数

### unitConversion.ts

```tsx
import { convertUnit, canConvert, formatQuantity } from '@/utils/unitConversion'

// 调用后端换算服务
const result = await convertUnit({
  fromUnitCode: 'L',
  toUnitCode: 'ml',
  quantity: 2.5,
  materialId: 'uuid'
})

// 检查是否可换算
const canConvertResult = await canConvert('L', 'ml', 'uuid')

// 格式化数量显示
const formatted = formatQuantity(2500, 'ml', 2) // "2500.00 ml"
```

## 使用场景

### 场景1：物料管理表单

```tsx
<Form.Item name="inventoryUnitId" label="库存单位">
  <UnitSelector category="VOLUME" placeholder="选择库存单位" />
</Form.Item>

<Form.Item name="purchaseUnitId" label="采购单位">
  <UnitSelector category="VOLUME" placeholder="选择采购单位" />
</Form.Item>
```

### 场景2：BOM配方表单

```tsx
<Form.Item name="bomUnitCode" label="配方单位">
  <UnitSelector placeholder="选择BOM单位" />
</Form.Item>
```

### 场景3：库存列表展示

```tsx
const columns = [
  {
    title: '库存数量',
    dataIndex: 'quantity',
    render: (qty: number, record) => (
      <span>
        {qty.toFixed(2)} <UnitDisplay unit={record.inventoryUnit} />
      </span>
    ),
  },
]
```

### 场景4：单位换算按钮

```tsx
const [conversionModalOpen, setConversionModalOpen] = useState(false)

<Button icon={<SwapOutlined />} onClick={() => setConversionModalOpen(true)}>
  单位换算
</Button>

<UnitConversionModal
  open={conversionModalOpen}
  onClose={() => setConversionModalOpen(false)}
  materialId={material.id}
/>
```

### 场景5：动态验证换算可用性

```tsx
const { checkCanConvert } = useUnitConversion()

const validateBomUnit = async (bomUnitCode: string) => {
  const canConvertResult = await checkCanConvert(
    bomUnitCode,
    material.inventoryUnit.code,
    material.id
  )

  if (!canConvertResult) {
    message.error('BOM单位无法换算到库存单位')
    return false
  }
  return true
}
```

## 最佳实践

### 1. 表单字段命名规范

```tsx
// ✅ 推荐：使用 unitId 后缀
<Form.Item name="inventoryUnitId">
  <UnitSelector />
</Form.Item>

// ❌ 不推荐：使用 unit 或其他名称
<Form.Item name="inventoryUnit">
  <UnitSelector />
</Form.Item>
```

### 2. 分类筛选

```tsx
// ✅ 推荐：为特定分类提供筛选
<UnitSelector category="VOLUME" /> // 只显示体积单位

// ⚠️ 不推荐：不使用筛选（除非业务需要）
<UnitSelector /> // 显示所有单位
```

### 3. 单位展示格式

```tsx
// ✅ 推荐：在列表中显示代码
<UnitDisplay unit={unit} showCode={true} />

// ✅ 推荐：在详情页显示分类
<UnitDisplay unit={unit} showCategory={true} />
```

### 4. 错误处理

```tsx
const { convert } = useUnitConversion()

const handleConvert = async () => {
  try {
    const result = await convert({ ... })
    if (!result) {
      message.error('换算失败，请检查单位配置')
      return
    }
    message.success('换算成功')
  } catch (error) {
    message.error('换算服务异常')
  }
}
```

## 测试用例

### 单元测试

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react'
import { UnitSelector } from '@/components/common/UnitSelector'

test('should render unit options', async () => {
  const { getByText } = render(<UnitSelector />)

  await waitFor(() => {
    expect(getByText('毫升 (ml)')).toBeInTheDocument()
    expect(getByText('升 (L)')).toBeInTheDocument()
  })
})

test('should filter by category', async () => {
  const { getByText, queryByText } = render(
    <UnitSelector category="VOLUME" />
  )

  await waitFor(() => {
    expect(getByText('毫升 (ml)')).toBeInTheDocument()
    expect(queryByText('千克 (kg)')).not.toBeInTheDocument()
  })
})
```

### 集成测试

```tsx
test('should convert units via modal', async () => {
  const { getByText, getByPlaceholderText } = render(
    <UnitConversionModal open={true} onClose={() => {}} />
  )

  fireEvent.change(getByPlaceholderText('输入数量'), { target: { value: '2.5' } })
  fireEvent.click(getByText('换算'))

  await waitFor(() => {
    expect(getByText(/2500/)).toBeInTheDocument()
  })
})
```

## 常见问题

### Q1: 如何获取选中单位的详细信息？

```tsx
const { data: units } = useUnits()

const getUnitById = (unitId: string) => {
  return units?.data?.find(u => u.id === unitId)
}
```

### Q2: 如何在FormItem中同时保存单位ID和代码？

```tsx
// 方案1：使用自定义onChange
<Form.Item name="inventoryUnitId">
  <UnitSelector
    onChange={(unitId) => {
      const unit = getUnitById(unitId)
      form.setFieldsValue({ inventoryUnitCode: unit?.code })
    }}
  />
</Form.Item>

// 方案2：提交时转换
const onSubmit = (values) => {
  const unit = getUnitById(values.inventoryUnitId)
  const payload = {
    ...values,
    inventoryUnitCode: unit.code
  }
}
```

### Q3: 如何支持自定义单位？

暂不支持前端自定义单位，需通过单位管理页面创建。

## 后续扩展

- [ ] 支持单位分组展示
- [ ] 支持最近使用单位优先
- [ ] 支持单位换算缓存
- [ ] 支持批量换算
