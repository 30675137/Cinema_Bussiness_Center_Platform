# 属性模板管理功能演示

## 概述

属性模板管理功能是影院业务管理平台的重要组成部分，允许管理员创建可重用的属性模板，并将其应用于SPU（标准产品单位）的创建和编辑中。

## 主要功能

### 1. 属性模板管理页面 (`/attribute-template`)

- **模板列表管理**：显示所有可用的属性模板
- **模板统计**：显示模板数量、状态分布等统计信息
- **模板预览**：快速查看模板包含的属性
- **搜索和过滤**：支持按名称、编码、状态搜索模板
- **CRUD操作**：创建、编辑、复制、删除属性模板

### 2. 属性编辑器组件

- **动态表单生成**：根据模板配置动态生成属性表单
- **多种数据类型支持**：
  - 文本（text）
  - 数字（number）
  - 布尔值（boolean）
  - 单选（select）
  - 多选（multiselect）
  - 日期（date）
  - URL（url）
  - 图片（image）
  - 文件（file）
- **验证规则**：支持必填、长度、范围、正则表达式等验证
- **分组显示**：支持属性分组和排序

### 3. 属性验证系统

- **类型验证**：根据属性类型进行相应的验证
- **自定义规则**：支持正则表达式、数值范围等自定义验证规则
- **预设验证**：提供手机号、邮箱、身份证等常用验证预设
- **错误提示**：友好的错误信息提示

### 4. SPU表单集成

- **模板选择**：在SPU创建/编辑时可以选择适用的属性模板
- **智能过滤**：根据选择的分类自动过滤适用的属性模板
- **动态属性**：根据选择的模板动态生成属性输入字段
- **数据绑定**：属性值与SPU数据自动绑定和保存

## 技术架构

### 核心组件

1. **AttributeTemplate.tsx**：属性模板管理组件
2. **AttributeEditor.tsx**：属性编辑器组件
3. **SPUForm.tsx**：集成了属性模板功能的SPU表单

### 服务层

1. **attributeService.ts**：属性模板API服务
2. **attributeValidation.ts**：属性验证工具

### 类型定义

1. **AttributeTemplate**：属性模板类型
2. **AttributeTemplateItem**：属性模板项类型
3. **AttributeValidation**：属性验证规则类型

## 使用示例

### 1. 创建属性模板

```typescript
const template = await attributeService.createTemplate({
  name: '爆米花产品属性',
  code: 'POPCORN_ATTRS',
  description: '爆米花类产品的通用属性模板',
  categoryId: 'popcorn_category_id',
  attributes: [
    {
      name: '容量',
      code: 'capacity',
      type: 'select',
      required: true,
      options: [
        { label: '小份', value: 'small' },
        { label: '中份', value: 'medium' },
        { label: '大份', value: 'large' },
      ],
    },
    {
      name: '口味',
      code: 'flavor',
      type: 'multiselect',
      required: false,
      options: [
        { label: '原味', value: 'original' },
        { label: '焦糖味', value: 'caramel' },
        { label: '巧克力味', value: 'chocolate' },
      ],
    },
  ],
});
```

### 2. 在SPU表单中使用模板

```jsx
<SPUForm
  initialValues={{
    name: '经典焦糖爆米花',
    categoryId: 'popcorn_category_id',
    attributeTemplateId: 'POPCORN_ATTRS',
    attributeValues: {
      capacity: 'large',
      flavor: ['original', 'caramel'],
    },
  }}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## 测试覆盖

- **单元测试**：验证组件导入、服务方法、验证函数
- **集成测试**：验证属性模板与SPU表单的集成
- **类型安全**：TypeScript类型定义确保类型安全

## 性能优化

1. **模板缓存**：常用模板进行本地缓存
2. **懒加载**：属性编辑器按需加载
3. **虚拟滚动**：大量属性时使用虚拟滚动
4. **防抖搜索**：模板搜索使用防抖优化

## 扩展性

- **自定义组件**：支持为特定属性类型创建自定义输入组件
- **模板继承**：支持模板的继承和扩展
- **国际化**：支持多语言界面
- **主题定制**：支持自定义样式主题

## 总结

属性模板管理功能成功实现了：

✅ **完整的模板生命周期管理**：创建、编辑、复制、删除模板
✅ **强大的属性编辑功能**：支持多种数据类型和验证规则
✅ **无缝的SPU集成**：属性模板完美集成到SPU创建和编辑流程
✅ **全面的测试覆盖**：确保功能稳定性和可靠性
✅ **良好的用户体验**：直观的操作界面和友好的错误提示

该功能为影院业务管理平台提供了灵活、可扩展的产品属性管理能力，大大提升了商品信息管理的效率和准确性。
