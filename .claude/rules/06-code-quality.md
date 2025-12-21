# 代码质量与工程化规则

## 核心原则
遵循严格的代码规范和质量标准。

## 规则

### R6.1 TypeScript 规范
- 启用严格模式 `"strict": true`
- 禁止使用 `any` 类型（特殊情况需注释说明）
- 所有函数参数和返回值必须有类型注解

```typescript
// ✅ 正确
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ❌ 错误
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### R6.2 ESLint + Prettier 规范
- 代码提交前必须通过 ESLint 检查
- 使用 Prettier 统一代码格式
- 配置 Husky + lint-staged 自动检查

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### R6.3 Git 提交规范
遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 Bug |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构 |
| test | 测试相关 |
| chore | 构建/工具相关 |

**示例**:
```
feat(hall-reserve-taro): 新增影院场景预约 Taro H5/小程序项目

- 使用 Taro 4.1.9 + React + TypeScript 构建
- 集成 Zustand 状态管理和 TanStack Query 数据查询
- 适配 iPhone 移动端 UI 尺寸
```

### R6.4 Java 后端规范
- 使用 Java 21 + Spring Boot 3.x
- 关键领域类、公共方法、复杂业务分支必须编写清晰注释
- 禁止堆砌无信息量的"废话注释"

```java
/**
 * 计算场景包的总价格，包含基础套餐和加购项
 * 
 * @param booking 预订信息，包含套餐选择和加购项列表
 * @return 总价格（单位：分），如果预订无效返回 0
 */
public long calculateTotalPrice(Booking booking) {
    // 业务逻辑...
}
```

### R6.5 代码审查检查项
- [ ] 功能实现是否符合规格
- [ ] 边界情况处理是否完整
- [ ] 性能是否有优化空间
- [ ] 测试覆盖率是否达标
- [ ] 安全风险是否已评估
- [ ] 关键代码是否有足够注释

### R6.6 禁止行为
- ❌ 禁止提交未格式化的代码
- ❌ 禁止跳过 lint 检查（--no-verify）
- ❌ 禁止直接推送到 main/master 分支
