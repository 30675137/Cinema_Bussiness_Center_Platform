# Research Findings: 场景包小程序首页 API 集成

**Feature**: 018-hall-reserve-homepage
**Date**: 2025-12-21
**Purpose**: 解决技术实现中的关键技术选型和最佳实践问题

---

## 1. Taro 框架中使用 TanStack Query (React Query)

### Decision
在 Taro 小程序项目中使用 **@tanstack/react-query** 进行服务器状态管理和缓存策略。

### Rationale
1. **原生支持**: TanStack Query 是框架无关的，完全兼容 React 生态，Taro 3.x 使用 React 作为运行时，可直接使用
2. **缓存能力**: 提供开箱即用的缓存、重试、后台刷新等功能，满足 5 分钟缓存需求
3. **类型安全**: 完整的 TypeScript 支持，与 Zod 数据验证无缝集成
4. **社区成熟**: 成熟的解决方案，广泛应用于生产环境

### Alternatives Considered
- **SWR**: 轻量级但功能相对简单，缓存策略不如 TanStack Query 灵活
- **Redux Toolkit Query**: 需要引入整个 Redux 生态，对于仅需服务器状态管理的场景过重
- **手动实现**: 使用 Taro.setStorage + useEffect 手动管理缓存，维护成本高且容易出错

### Implementation Notes
```typescript
// 安装依赖
npm install @tanstack/react-query

// 配置 QueryClient（在 app.tsx 中）
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟缓存
      cacheTime: 10 * 60 * 1000, // 10 分钟内存保留
      retry: 2, // 失败重试 2 次
    },
  },
})

// 在页面组件中使用
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['scenarioPackages'],
  queryFn: fetchScenarioPackages,
})
```

---

## 2. Taro.request 网络请求封装策略

### Decision
封装统一的 `request.ts` 工具函数，基于 `Taro.request` 实现，支持：
- 统一的 Base URL 配置
- 请求/响应拦截器（添加 Token、处理错误）
- 超时控制（10秒）
- TypeScript 类型推断

### Rationale
1. **平台兼容**: Taro.request 自动适配微信小程序、H5 等多端环境
2. **类型安全**: 封装后可提供更好的 TypeScript 支持
3. **统一错误处理**: 集中处理网络错误、超时、服务端错误
4. **可测试性**: 便于 Mock 和单元测试

### Alternatives Considered
- **直接使用 Taro.request**: 代码重复，缺乏统一的错误处理
- **axios**: 不支持小程序环境，需要额外适配层
- **fetch API**: 不支持小程序环境

### Implementation Notes
```typescript
// utils/request.ts
import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_ENV === 'h5'
  ? 'http://localhost:8080'
  : 'https://api.yourdomain.com'

export async function request<T>(url: string, options?: Taro.request.Option): Promise<T> {
  const response = await Taro.request({
    url: `${BASE_URL}${url}`,
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      // Token 可在此处添加
    },
    ...options,
  })

  if (response.statusCode !== 200) {
    throw new Error(`HTTP ${response.statusCode}: ${response.data.message || 'Request failed'}`)
  }

  return response.data as T
}
```

---

## 3. API 响应数据的 Zod 验证策略

### Decision
使用 **Zod** 对 API 返回的数据进行运行时验证，确保类型安全和数据完整性。

### Rationale
1. **运行时验证**: TypeScript 仅提供编译时类型检查，Zod 可在运行时验证 API 响应格式
2. **自动类型推断**: Zod schema 可自动推断出 TypeScript 类型，减少重复定义
3. **错误提示清晰**: 验证失败时提供详细的错误信息，便于调试
4. **与 TanStack Query 集成**: 可在 queryFn 中验证数据，失败时自动触发 error 状态

### Alternatives Considered
- **手动验证**: 使用 if 语句逐字段检查，代码冗长且易出错
- **io-ts**: 功能类似但语法复杂，学习曲线陡峭
- **Yup**: 主要用于表单验证，API 验证场景不如 Zod 简洁

### Implementation Notes
```typescript
// types/scenario.ts
import { z } from 'zod'

export const ScenarioPackageListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(['MOVIE', 'TEAM', 'PARTY']),
  backgroundImageUrl: z.string().url(),
  packagePrice: z.number().positive(),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()),
})

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ScenarioPackageListItemSchema),
  message: z.string().optional(),
  timestamp: z.string().optional(),
})

export type ScenarioPackageListItem = z.infer<typeof ScenarioPackageListItemSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>

// 在 service 中使用
export async function fetchScenarioPackages(): Promise<ScenarioPackageListItem[]> {
  const response = await request('/api/scenario-packages')
  const validated = ApiResponseSchema.parse(response) // 验证失败会抛出 ZodError
  return validated.data
}
```

---

## 4. Spring Boot + Supabase 查询场景包数据的最佳实践

### Decision
使用 **Supabase Java SDK**（或 HTTP Client）查询 PostgreSQL 数据库，通过服务端过滤返回 `status = PUBLISHED` 的场景包。

### Rationale
1. **统一后端栈**: 符合宪法要求，Supabase 作为主要数据源
2. **服务端过滤**: 减少网络传输，提升安全性（客户端无法访问未发布数据）
3. **SQL 灵活性**: Supabase 支持复杂 SQL 查询，便于未来扩展（如分页、排序）
4. **权限控制**: Supabase Row Level Security (RLS) 可进一步控制数据访问权限

### Alternatives Considered
- **直接使用 JDBC**: 需要手动管理连接池，Supabase SDK 更简洁
- **客户端过滤**: 不安全，且浪费网络带宽
- **GraphQL**: 对于简单列表查询过于复杂

### Implementation Notes
```java
// repository/ScenarioPackageRepository.java
@Repository
public class ScenarioPackageRepository {

    private final Supabase supabase;

    public List<ScenarioPackageListItemDTO> findPublishedPackages() {
        // 使用 Supabase SDK 查询（示例，具体 API 需参考 Supabase Java SDK 文档）
        return supabase
            .from("scenario_packages")
            .select("id, title, category, background_image_url, package_price, rating, tags")
            .eq("status", "PUBLISHED")
            .execute()
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    private ScenarioPackageListItemDTO mapToDTO(Map<String, Object> row) {
        // 映射数据库行到 DTO
        return new ScenarioPackageListItemDTO(
            (String) row.get("id"),
            (String) row.get("title"),
            (String) row.get("category"),
            (String) row.get("background_image_url"),
            ((Number) row.get("package_price")).doubleValue(),
            row.get("rating") != null ? ((Number) row.get("rating")).doubleValue() : null,
            (List<String>) row.get("tags")
        );
    }
}
```

---

## 5. 错误处理和降级策略

### Decision
实现分层错误处理策略：
1. **网络层**: Taro.request 超时和连接错误
2. **数据验证层**: Zod 验证失败
3. **业务层**: 后端返回的业务错误
4. **UI 层**: 向用户展示友好的错误提示和重试按钮

### Rationale
1. **用户体验**: 避免白屏或无响应，提供明确的错误提示
2. **可调试性**: 不同层级的错误有不同的处理逻辑，便于排查问题
3. **降级方案**: 支持展示缓存数据或占位内容

### Alternatives Considered
- **全局错误处理**: 不够灵活，无法针对不同场景定制错误提示
- **忽略错误**: 用户体验差，生产环境不可接受

### Implementation Notes
```typescript
// 在组件中使用 TanStack Query 的 error 处理
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['scenarioPackages'],
  queryFn: fetchScenarioPackages,
  retry: 2,
  onError: (err) => {
    console.error('加载场景包失败:', err)
  },
})

if (error) {
  return (
    <View className="error-container">
      <Text>网络连接失败，请检查网络设置</Text>
      <Button onClick={() => refetch()}>重试</Button>
    </View>
  )
}
```

---

## 6. 跨端兼容性处理（微信小程序 vs H5）

### Decision
使用 Taro 条件编译和环境变量处理平台差异：
- API Base URL 根据环境切换（H5 使用 localhost，小程序使用生产域名）
- 图片加载失败时使用默认占位图
- 存储使用 Taro.setStorage（自动适配平台）

### Rationale
1. **Taro 内置支持**: 提供 `process.env.TARO_ENV` 判断当前平台
2. **代码复用**: 大部分业务逻辑无需平台判断
3. **开发效率**: H5 开发调试更快，小程序真机测试更准确

### Alternatives Considered
- **分别开发**: 维护成本高，代码重复
- **仅支持小程序**: 开发调试不便

### Implementation Notes
```typescript
// utils/config.ts
export const API_BASE_URL = process.env.TARO_ENV === 'weapp'
  ? 'https://api.production.com'
  : 'http://localhost:8080'

// 图片加载失败处理
<Image
  src={item.backgroundImageUrl}
  onError={(e) => {
    e.currentTarget.src = '/assets/placeholder.png'
  }}
/>
```

---

## 7. 性能优化策略

### Decision
1. **列表虚拟滚动**: 如果场景包数量超过 50 个，使用 Taro 的虚拟列表组件
2. **图片懒加载**: 使用 Taro Image 组件的 lazy-load 属性
3. **缓存策略**: TanStack Query 5分钟缓存 + staleWhileRevalidate 模式

### Rationale
1. **首屏性能**: 减少初次渲染时间，提升用户体验
2. **内存优化**: 虚拟滚动减少 DOM 节点数量
3. **网络优化**: 缓存减少不必要的请求

### Alternatives Considered
- **全量渲染**: 数据量小时可接受，但不具备扩展性
- **分页加载**: 增加交互复杂度，首页列表场景不适合

### Implementation Notes
```typescript
// 使用 Taro VirtualList（如果需要）
import { VirtualList } from '@tarojs/components'

<VirtualList
  height={500}
  itemData={scenarioPackages}
  itemCount={scenarioPackages.length}
  itemSize={100}
  item={ScenarioCard}
/>
```

---

## Summary

通过以上研究，确定了以下关键技术决策：

1. **数据管理**: TanStack Query + Zod 验证
2. **网络请求**: Taro.request 封装 + 统一错误处理
3. **后端查询**: Spring Boot + Supabase SDK + 服务端过滤
4. **跨端兼容**: Taro 条件编译 + 环境变量
5. **性能优化**: 缓存策略 + 图片懒加载

所有技术选型符合宪法要求（C端使用 Taro，后端使用 Spring Boot + Supabase），且基于最佳实践和成熟方案。
