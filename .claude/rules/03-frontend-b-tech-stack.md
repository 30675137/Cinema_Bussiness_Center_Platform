# B端（管理后台）技术栈规则

## 适用范围
- 后台管理系统
- 数据管理界面
- 运营配置平台

## 技术栈

### 核心框架
| 技术 | 版本 | 用途 |
|-----|------|------|
| React | 19.2.0 | UI 框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Vite | 6.0.7 | 构建工具 |

### UI 组件库
| 技术 | 版本 | 用途 |
|-----|------|------|
| Ant Design | 6.1.0 | UI 组件库 |
| TailwindCSS | - | 样式工具 |

### 状态管理
| 技术 | 版本 | 用途 |
|-----|------|------|
| Zustand | 5.0.9 | 客户端状态 |
| TanStack Query | 5.90.12 | 服务器状态 |

### 其他
| 技术 | 版本 | 用途 |
|-----|------|------|
| React Router | 7.10.1 | 路由管理 |
| React Hook Form | 7.68.0 | 表单处理 |
| Zod | 4.1.13 | 数据验证 |
| MSW | 2.12.4 | Mock 数据 |

## 规则

### R3.1 组件架构
遵循原子设计理念：
- **Atoms**: 原子组件（Button, Input, Icon）
- **Molecules**: 分子组件（SearchBar, FormField）
- **Organisms**: 有机体（Header, Sidebar, Table）
- **Templates**: 模板（PageLayout）
- **Pages**: 页面

### R3.2 组件规范
```typescript
// 必须有明确的 Props 接口定义
interface ComponentProps {
  title: string
  onSubmit: (data: FormData) => void
}

// 使用 React.memo 优化性能
export const Component = React.memo<ComponentProps>(({ title, onSubmit }) => {
  // ...
})
```

### R3.3 目录结构
```
frontend/src/
├── components/     # 通用组件
├── pages/          # 页面组件
├── hooks/          # 自定义 Hooks
├── services/       # API 服务
├── stores/         # 状态管理
├── types/          # 类型定义
└── utils/          # 工具函数
```

### R3.4 禁止行为
- ❌ 禁止在 B端 使用 Taro 框架
- ❌ 禁止使用非 Ant Design 的 UI 组件库
- ❌ 禁止直接操作 DOM（应使用 React ref）
