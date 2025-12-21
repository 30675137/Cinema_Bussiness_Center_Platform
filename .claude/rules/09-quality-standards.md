# 质量标准规则

## 一、性能标准

### R9.1 通用性能指标
| 指标 | 标准 |
|------|------|
| 应用启动时间 | ≤ 3 秒 |
| 页面切换响应 | ≤ 500 毫秒 |
| API 响应时间 | ≤ 1 秒（P95） |

### R9.2 B端性能要求
- 大型数据列表必须使用虚拟滚动或分页加载
- 使用 Web Vitals 指标评估用户体验
- 避免不必要的重渲染

### R9.3 C端（Taro）性能要求
| 指标 | 标准 |
|------|------|
| 小程序主包体积 | < 2MB |
| 首屏渲染时间 | < 1.5 秒 |
| 列表滚动 FPS | ≥ 50 |

### R9.4 性能优化策略
```typescript
// 使用 React.memo 避免不必要渲染
export const ExpensiveComponent = React.memo(({ data }) => {
  // ...
})

// 使用 useMemo 缓存计算结果
const filteredData = useMemo(() => {
  return data.filter(item => item.active)
}, [data])

// 使用 useCallback 缓存回调函数
const handleClick = useCallback(() => {
  // ...
}, [dependencies])
```

## 二、安全标准

### R9.5 前端安全规范
- 使用 Zod 进行输入数据验证
- 防止 XSS 攻击（避免使用 dangerouslySetInnerHTML）
- 避免在前端存储敏感信息

### R9.6 API 安全规范
- 所有 API 请求必须包含 Token 认证
- 处理 Token 过期和刷新逻辑

```typescript
// Token 刷新示例
const refreshToken = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getRefreshToken()}`
    }
  })
  const { accessToken } = await response.json()
  setAccessToken(accessToken)
}
```

### R9.7 C端安全规范
- 敏感数据不得存储在本地存储
- 避免明文传输用户隐私信息
- 遵守平台安全规范（微信小程序等）

## 三、可访问性标准

### R9.8 WCAG 2.1 AA 级别要求
- 支持键盘导航
- 支持屏幕阅读器
- 色彩对比度达标（≥ 4.5:1）
- 所有交互元素有明确的焦点指示

```tsx
// 可访问性示例
<button
  aria-label="关闭对话框"
  onClick={onClose}
  className="focus:ring-2 focus:ring-blue-500"
>
  <CloseIcon aria-hidden="true" />
</button>
```

### R9.9 语义化 HTML
- 使用正确的 HTML 标签（button、nav、main 等）
- 提供有意义的 alt 文本
- 使用 ARIA 属性增强可访问性

## 四、禁止行为
- ❌ 禁止上线未经性能测试的功能
- ❌ 禁止忽略安全审计发现的问题
- ❌ 禁止使用低对比度的颜色组合
