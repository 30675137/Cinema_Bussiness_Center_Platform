# 状态管理规则

## 核心原则
数据与 UI 分离，使用专业的状态管理工具。

## 状态分类

### 客户端状态 (Zustand)
- UI 状态（侧边栏展开/收起、模态框显示等）
- 表单草稿状态
- 用户偏好设置

### 服务器状态 (TanStack Query)
- API 数据获取
- 数据缓存
- 后台刷新

## 规则

### R5.1 Zustand Store 规范
```typescript
import { create } from 'zustand'

interface AppState {
  // 状态
  sidebarCollapsed: boolean
  
  // 动作
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
}))
```

### R5.2 TanStack Query 规范
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 查询
export const useScenarios = () => {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// 变更
export const useCreateScenario = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
    }
  })
}
```

### R5.3 数据持久化规范

#### B端（管理后台）
```typescript
// 使用 localStorage
localStorage.setItem('key', JSON.stringify(value))
const value = JSON.parse(localStorage.getItem('key') || '{}')
```

#### C端（Taro 项目）
```typescript
// 使用 Taro 存储 API
import Taro from '@tarojs/taro'

Taro.setStorageSync('key', value)
const value = Taro.getStorageSync('key')
```

### R5.4 禁止行为
- ❌ 禁止在组件中直接调用 API（必须通过 TanStack Query）
- ❌ 禁止使用 Redux（除非在复杂 C端 场景且团队达成共识）
- ❌ 禁止状态变更不可追踪（必须通过明确的 action）

## 最佳实践
1. 保持 Store 职责单一
2. 避免 Store 之间循环依赖
3. 使用选择器优化渲染性能
4. 服务器数据优先使用 TanStack Query 管理
