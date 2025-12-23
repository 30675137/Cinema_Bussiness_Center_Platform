# Research: 场景包多标签页编辑界面

**Feature**: 场景包多标签页编辑界面
**Date**: 2025-12-23
**Status**: Complete

## Overview

本研究文档解决场景包编辑器实现中的关键技术选型和架构决策。该功能需要实现一个包含5个标签页的复杂表单编辑界面,涉及多种交互模式(基础表单、列表管理、穿梭框、日历配置等)。

## Research Areas

### 1. Ant Design 多标签页(Tabs)组件最佳实践

**Decision**: 使用 Ant Design 6.1.0 的 `<Tabs>` 组件,配合表单状态管理和未保存检测

**Rationale**:
- Ant Design Tabs 组件提供完整的标签页切换UI,支持键盘导航和可访问性
- 内置 `onChange` 事件可用于标签页切换前的数据验证和未保存提示
- 支持动态禁用标签页(如发布前验证不通过时禁用"发布设置"标签)
- 与 Ant Design Form 组件深度集成,共享设计语言

**Implementation Pattern**:
```typescript
<Tabs
  activeKey={activeTab}
  onChange={handleTabChange}
  items={[
    { key: 'basic', label: '基础信息', children: <BasicInfoTab /> },
    { key: 'packages', label: '套餐管理', children: <PackagesTab /> },
    { key: 'addons', label: '加购项配置', children: <AddonsTab /> },
    { key: 'timeslots', label: '时段管理', children: <TimeSlotsTab /> },
    { key: 'publish', label: '发布设置', children: <PublishTab /> }
  ]}
/>
```

**Best Practices**:
- 使用 `destroyInactiveTabPane={false}` 保留所有标签页的状态,避免切换时数据丢失
- 每个标签页作为独立组件,通过 props 接收数据和回调
- 使用 Zustand store 管理跨标签页的全局状态(如 scenarioPackageId, isDirty 等)

**Alternatives Considered**:
- React Router 路由切换: 过重,且会丢失未保存状态
- 自定义标签页组件: 开发成本高,无障碍性支持不完善

---

### 2. React Hook Form 与 Ant Design 表单集成

**Decision**: 使用 `react-hook-form` 7.68.0 配合 `@ant-design/compatible` 或自定义 Controller 集成

**Rationale**:
- React Hook Form 提供高性能的表单状态管理(非受控组件模式)
- 内置 Zod 集成,支持声明式数据验证
- `useForm` 的 `formState.isDirty` 可准确检测未保存修改
- 支持动态字段(套餐列表、时段列表等)

**Implementation Pattern**:
```typescript
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, Input, Select } from 'antd'

const { control, handleSubmit, formState: { isDirty, errors } } = useForm({
  resolver: zodResolver(basicInfoSchema),
  defaultValues: scenarioPackageData
})

<Controller
  name="name"
  control={control}
  render={({ field, fieldState }) => (
    <Form.Item
      label="场景包名称"
      validateStatus={fieldState.error ? 'error' : ''}
      help={fieldState.error?.message}
    >
      <Input {...field} maxLength={100} />
    </Form.Item>
  )}
/>
```

**Best Practices**:
- 每个标签页使用独立的 `useForm` 实例,避免表单状态耦合
- 使用 `watch()` 监听表单变化,实时更新 Zustand store 的 isDirty 标记
- 结合 TanStack Query 的 `useMutation` 进行表单提交和乐观更新

**Alternatives Considered**:
- Ant Design Form 原生API: 状态管理较重,与 Zod 集成不便
- Formik: 性能不如 React Hook Form,重渲染问题明显

---

### 3. 穿梭框(Transfer)组件用于加购项关联

**Decision**: 使用 Ant Design `<Transfer>` 组件,配合 TanStack Query 管理数据

**Rationale**:
- Transfer 组件提供直观的"可选项 ↔ 已选项"双列表UI
- 支持搜索、全选、自定义渲染等功能
- 与规格中的"全局加购项库选择与关联"需求完美匹配

**Implementation Pattern**:
```typescript
const [selectedKeys, setSelectedKeys] = useState<string[]>([])

<Transfer
  dataSource={allAddOnItems.map(item => ({
    key: item.id,
    title: item.name,
    description: `¥${item.price / 100} | ${item.category}`,
    disabled: !item.isActive
  }))}
  targetKeys={associatedAddOnIds}
  onChange={handleTransferChange}
  render={item => item.title}
  showSearch
  filterOption={(inputValue, item) =>
    item.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
  }
/>
```

**Data Flow**:
1. TanStack Query 获取全局加购项列表(`useQuery({ queryKey: ['add-on-items'] })`)
2. Transfer 组件双向绑定 `targetKeys`(已关联ID数组)
3. 用户拖拽或点击确认时,触发 `useMutation` 批量更新关联关系
4. 关联表存储排序顺序和必选标记

**Best Practices**:
- 使用虚拟滚动优化大列表性能(Ant Design Transfer 内置)
- 加购项下架时在 Transfer 中 disabled,但保留已关联的项
- 提供"按分类筛选"功能,减少用户查找成本

**Alternatives Considered**:
- 自定义双列表组件: 开发成本高,无障碍性难以保证
- Checkbox 多选: 无法直观展示"已选"状态,交互体验差

---

### 4. 周时段模板 + 日期覆盖的数据结构设计

**Decision**: 使用两级数据结构 - 周模板(Week Template) + 日期覆盖(Date Override)

**Rationale**:
- 符合用户心智模型:"默认规则 + 特例调整"
- 查询效率高:计算特定日期时段时,优先查覆盖表,无覆盖时使用周模板
- 灵活性强:支持新增、修改、取消三种覆盖类型

**Data Structure**:
```typescript
// 周时段模板
interface TimeSlotTemplate {
  id: string
  scenarioPackageId: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6  // 0=周日, 1=周一...6=周六
  startTime: string  // HH:mm 格式, 如"10:00"
  endTime: string    // HH:mm 格式, 如"13:00"
  capacity?: number  // 可选,默认无限制
  priceAdjustment?: { type: 'PERCENTAGE' | 'FIXED', value: number }  // 可选价格调整
  isEnabled: boolean
}

// 日期覆盖
interface TimeSlotOverride {
  id: string
  scenarioPackageId: string
  date: string  // YYYY-MM-DD 格式
  overrideType: 'ADD' | 'MODIFY' | 'CANCEL'
  startTime?: string  // overrideType=ADD/MODIFY时必填
  endTime?: string    // overrideType=ADD/MODIFY时必填
  capacity?: number   // overrideType=MODIFY时可选
  reason?: string     // 可选,如"节假日"、"特殊活动"
}
```

**Query Logic**:
```typescript
function getTimeSlotsForDate(packageId: string, date: string) {
  const dayOfWeek = new Date(date).getDay()
  const overrides = query `SELECT * FROM time_slot_overrides WHERE date = ${date} AND scenario_package_id = ${packageId}`

  if (overrides.length > 0) {
    // 应用覆盖规则,优先级: CANCEL > MODIFY > ADD
    return applyOverrides(weekTemplates, overrides)
  }

  return query `SELECT * FROM time_slot_templates WHERE day_of_week = ${dayOfWeek} AND scenario_package_id = ${packageId} AND is_enabled = true`
}
```

**UI Component**:
- 周视图: 7列(周一至周日),每列显示时段列表,支持批量复制
- 日历视图: 显示未来30天,特殊日期用标记高亮,点击可添加/编辑覆盖
- 使用 Ant Design `<Calendar>` 组件 + 自定义 `dateCellRender`

**Best Practices**:
- 周模板修改不影响已有覆盖记录
- 删除周模板时,提示影响范围(未来N天的时段)
- 日期覆盖优先级明确:CANCEL > MODIFY > ADD

**Alternatives Considered**:
- 纯日期配置(无模板): 重复配置工作量大,不符合运营习惯
- iCalendar格式: 过于复杂,学习成本高

---

### 5. 表单数据未保存检测与提示

**Decision**: 使用 React Hook Form 的 `formState.isDirty` + Zustand 全局状态 + `beforeunload` 事件

**Rationale**:
- `formState.isDirty` 精确反映表单是否被修改(对比 defaultValues)
- Zustand store 统一管理所有标签页的未保存状态
- `beforeunload` 事件防止用户意外关闭浏览器或刷新页面

**Implementation Pattern**:
```typescript
// Zustand Store
interface ScenarioPackageStore {
  isDirty: Record<string, boolean>  // { 'basic': true, 'packages': false, ... }
  setDirty: (tab: string, dirty: boolean) => void
  hasUnsavedChanges: () => boolean
}

// 在每个Tab组件中
const { formState: { isDirty } } = useForm()
const setDirty = useScenarioPackageStore(state => state.setDirty)

useEffect(() => {
  setDirty('basic', isDirty)
}, [isDirty])

// 标签页切换拦截
const handleTabChange = (newTab: string) => {
  if (hasUnsavedChanges()) {
    Modal.confirm({
      title: '有未保存的修改',
      content: '切换标签页将丢弃当前修改,是否继续?',
      onOk: () => {
        setActiveTab(newTab)
        // 可选: 重置当前标签页表单
      }
    })
  } else {
    setActiveTab(newTab)
  }
}

// 页面关闭拦截
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges()) {
      e.preventDefault()
      e.returnValue = ''  // Chrome requires returnValue to be set
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [hasUnsavedChanges])
```

**Best Practices**:
- 提供"保存草稿"功能,自动保存到 localStorage 或后端草稿表
- 使用 Modal.confirm 而非原生 confirm,提供更好的UI体验
- 表单保存成功后,重置 `defaultValues` 以清除 isDirty 标记

**Alternatives Considered**:
- React Router Prompt: 仅在路由切换时生效,不适用于标签页内部切换
- 手动追踪每个字段变化: 复杂度高,易出错

---

### 6. 图片上传组件集成

**Decision**: 使用 Ant Design `<Upload>` 组件 + 后端返回 Supabase Storage URL

**Rationale**:
- Upload 组件提供完整的上传流程UI(选择、预览、删除、进度条)
- 支持拖拽上传和多文件上传(虽然场景包主图仅需1张)
- 集成 Supabase Storage,上传后返回 公开URL,前端直接存储URL字符串

**Implementation Pattern**:
```typescript
const [imageUrl, setImageUrl] = useState<string | null>(null)

const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post('/api/upload/image', formData)
  setImageUrl(data.url)  // Supabase Storage 公开URL
  return false  // 阻止 Upload 组件默认上传行为
}

<Upload
  name="image"
  listType="picture-card"
  showUploadList={false}
  beforeUpload={handleUpload}
  accept="image/jpeg,image/png"
  maxCount={1}
>
  {imageUrl ? (
    <img src={imageUrl} alt="场景包主图" style={{ width: '100%' }} />
  ) : (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  )}
</Upload>
```

**Validation**:
- 文件类型: 仅允许 JPG/PNG
- 文件大小: 最大 5MB
- 图片尺寸: 建议 16:9 比例,最小 1280x720px
- 使用 Zod schema 验证:
  ```typescript
  z.object({
    mainImage: z.string().url().min(1, '必须上传主图')
  })
  ```

**Best Practices**:
- 上传前压缩图片(使用 browser-image-compression)
- 显示上传进度条(Upload 组件内置)
- 提供裁剪功能(可选,使用 react-image-crop)

**Alternatives Considered**:
- 直接前端上传到 Supabase Storage: 需要暴露 Supabase API Key,安全风险
- Base64 存储: 数据库体积膨胀,查询性能差

---

### 7. 发布前数据完整性验证策略

**Decision**: 使用 Zod Schema 进行多级验证 + 后端二次验证

**Rationale**:
- Zod 提供声明式验证,易于维护和测试
- 前后端共享验证逻辑(Zod schema 可导出为 JSON Schema)
- 后端二次验证确保数据一致性,防止前端绕过验证

**Validation Levels**:

**Level 1: 字段级验证** (每个表单字段)
```typescript
const basicInfoSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称最多100字符'),
  description: z.string().max(500, '描述最多500字符').optional(),
  category: z.string().min(1, '必须选择分类'),
  mainImage: z.string().url('必须上传主图')
})
```

**Level 2: 标签页级验证** (切换标签页时)
```typescript
const validateTab = (tab: string) => {
  if (tab === 'packages' && packages.length === 0) {
    showWarning('套餐管理', '至少需要配置1个套餐')
  }
}
```

**Level 3: 发布前全局验证**
```typescript
const publishValidation = z.object({
  basicInfo: basicInfoSchema.refine(data => !!data.mainImage, '必须上传主图'),
  packages: z.array(packageSchema).min(1, '至少需要1个套餐'),
  timeSlots: z.union([
    z.array(timeSlotTemplateSchema).min(1),
    z.array(timeSlotOverrideSchema).min(1)
  ]).refine(data => data.length > 0, '至少需要配置1个可预订时段'),
  publishSettings: publishSettingsSchema
})

const handlePublish = async () => {
  const result = publishValidation.safeParse(allData)
  if (!result.success) {
    Modal.error({
      title: '发布前检查失败',
      content: (
        <ul>
          {result.error.errors.map(err => (
            <li key={err.path.join('.')}>{err.message}</li>
          ))}
        </ul>
      )
    })
    return
  }

  // 调用后端发布API
  await publishMutation.mutateAsync(scenarioPackageId)
}
```

**Backend Validation**:
```java
@PostMapping("/api/scenario-packages/{id}/publish")
public ApiResponse<?> publishScenarioPackage(@PathVariable Long id) {
    ScenarioPackage pkg = scenarioPackageService.findById(id);

    // 验证必填字段
    if (pkg.getName() == null || pkg.getMainImage() == null) {
        return ApiResponse.failure("INVALID_DATA", "基础信息不完整");
    }

    // 验证至少1个套餐
    if (pkg.getPackages().isEmpty()) {
        return ApiResponse.failure("NO_PACKAGES", "至少需要配置1个套餐");
    }

    // 验证至少1个时段
    boolean hasTimeSlots = !pkg.getTimeSlotTemplates().isEmpty() ||
                          !pkg.getTimeSlotOverrides().isEmpty();
    if (!hasTimeSlots) {
        return ApiResponse.failure("NO_TIMESLOTS", "至少需要配置1个可预订时段");
    }

    // 执行发布
    pkg.setStatus(PublishStatus.PUBLISHED);
    scenarioPackageService.save(pkg);

    return ApiResponse.success(null);
}
```

**Best Practices**:
- 验证失败时,自动跳转到对应标签页并高亮错误字段
- 提供"发布预检"功能,列出所有缺失项
- 发布后记录审计日志(谁在何时发布了哪个场景包)

**Alternatives Considered**:
- 仅后端验证: 用户体验差,需要往返服务器才能知道错误
- 仅前端验证: 安全风险,用户可绕过前端直接调用API

---

## Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| UI Framework | React | 19.2.0 | 组件化UI |
| UI Library | Ant Design | 6.1.0 | 企业级组件库 |
| Form Management | React Hook Form | 7.68.0 | 高性能表单状态管理 |
| Validation | Zod | 4.1.13 | 声明式数据验证 |
| State Management | Zustand | 5.0.9 | 轻量级全局状态 |
| Data Fetching | TanStack Query | 5.90.12 | 服务器状态管理 |
| Routing | React Router | 7.10.1 | 页面路由 |
| HTTP Client | Axios | - | API请求 |
| Date Handling | dayjs | 1.11.19 | 日期时间处理 |
| Backend | Spring Boot + Supabase | 3.x | API + 数据库 |

---

## Open Questions (Resolved)

All technical unknowns have been resolved through research:

1. ✅ 标签页切换模式 → Ant Design Tabs with destroyInactiveTabPane=false
2. ✅ 表单状态管理 → React Hook Form + Controller
3. ✅ 加购项关联UI → Ant Design Transfer component
4. ✅ 时段数据模型 → 周模板 + 日期覆盖两级结构
5. ✅ 未保存检测 → formState.isDirty + Zustand + beforeunload
6. ✅ 图片上传策略 → Ant Design Upload + Supabase Storage
7. ✅ 发布验证策略 → Zod 多级验证 + 后端二次验证

---

## Next Steps

1. ✅ Research Complete → Proceed to Phase 1 (Design)
2. 🔄 Generate `data-model.md` with TypeScript interfaces
3. 🔄 Generate `contracts/api.yaml` with OpenAPI 3.0 spec
4. 🔄 Update `plan.md` with implementation phases
5. ⏭ Run `/speckit.tasks` to generate task breakdown

---

**Research Completed**: 2025-12-23
**Ready for Phase 1**: Yes
