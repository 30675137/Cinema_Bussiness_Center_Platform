# Cinema_Operation_Admin 合并冲突报告

**创建日期**: 2025-01-27  
**功能**: 006-frontend-structure-refactor  
**合并操作**: `frontend/Cinema_Operation_Admin/src/` 和 `frontend/Cinema_Operation_Admin/tests/` 合并到 `frontend/src/` 和 `frontend/tests/`

## 文件冲突列表

### 源代码文件冲突 (Cinema_Operation_Admin/src/ → frontend/src/)

以下文件在 `Cinema_Operation_Admin/src/` 和 `frontend/src/` 中都存在，需要手动审查：

1. **App.tsx**
   - 源: `frontend/Cinema_Operation_Admin/src/App.tsx`
   - 目标: `frontend/src/App.tsx`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

2. **main.tsx**
   - 源: `frontend/Cinema_Operation_Admin/src/main.tsx`
   - 目标: `frontend/src/main.tsx`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

3. **router/index.tsx**
   - 源: `frontend/Cinema_Operation_Admin/src/router/index.tsx`
   - 目标: `frontend/src/router/index.tsx`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

4. **components/layout/Breadcrumb/index.tsx**
   - 源: `frontend/Cinema_Operation_Admin/src/components/layout/Breadcrumb/index.tsx`
   - 目标: `frontend/src/components/layout/Breadcrumb/index.tsx`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

5. **components/layout/index.ts**
   - 源: `frontend/Cinema_Operation_Admin/src/components/layout/index.ts`
   - 目标: `frontend/src/components/layout/index.ts`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

6. **hooks/usePermissions.ts**
   - 源: `frontend/Cinema_Operation_Admin/src/hooks/usePermissions.ts`
   - 目标: `frontend/src/hooks/usePermissions.ts`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

7. **hooks/useResponsive.ts**
   - 源: `frontend/Cinema_Operation_Admin/src/hooks/useResponsive.ts`
   - 目标: `frontend/src/hooks/useResponsive.ts`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

8. **pages/Dashboard/index.tsx**
   - 源: `frontend/Cinema_Operation_Admin/src/pages/Dashboard/index.tsx`
   - 目标: `frontend/src/pages/Dashboard/index.tsx`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

9. **pages/product/ProductList/index.tsx**
   - 源: `frontend/Cinema_Operation_Admin/src/pages/product/ProductList/index.tsx`
   - 目标: `frontend/src/pages/product/ProductList/index.tsx`
   - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
   - 状态: 待审查

10. **services/index.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/services/index.ts`
    - 目标: `frontend/src/services/index.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

11. **stores/appStore.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/stores/appStore.ts`
    - 目标: `frontend/src/stores/appStore.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

12. **stores/index.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/stores/index.ts`
    - 目标: `frontend/src/stores/index.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

13. **stores/inventoryStore.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/stores/inventoryStore.ts`
    - 目标: `frontend/src/stores/inventoryStore.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

14. **stores/productStore.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/stores/productStore.ts`
    - 目标: `frontend/src/stores/productStore.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

15. **styles/globals.css**
    - 源: `frontend/Cinema_Operation_Admin/src/styles/globals.css`
    - 目标: `frontend/src/styles/globals.css`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

16. **types/common.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/types/common.ts`
    - 目标: `frontend/src/types/common.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

17. **types/index.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/types/index.ts`
    - 目标: `frontend/src/types/index.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

18. **types/inventory.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/types/inventory.ts`
    - 目标: `frontend/src/types/inventory.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

19. **utils/errorHandler.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/utils/errorHandler.ts`
    - 目标: `frontend/src/utils/errorHandler.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

20. **utils/index.ts**
    - 源: `frontend/Cinema_Operation_Admin/src/utils/index.ts`
    - 目标: `frontend/src/utils/index.ts`
    - 优先级: frontend/src/ > Cinema_Operation_Admin/src/
    - 状态: 待审查

## 冲突解决策略

根据优先级规则：**frontend/src/ > Cinema_Operation_Admin/src/**

对于所有冲突文件：
1. **保留 frontend/src/ 中的版本**（优先级最高）
2. **跳过 Cinema_Operation_Admin/src/ 中的同名文件**（使用 `--ignore-existing` 标志）
3. **记录所有跳过的文件**以便后续审查

## 需要手动审查的文件

以下文件虽然存在冲突，但可能需要手动合并内容（如果 Cinema_Operation_Admin 版本有独特功能）：

- `App.tsx` - 应用入口，需要检查是否有不同的配置
- `main.tsx` - 入口文件，需要检查是否有不同的初始化逻辑
- `router/index.tsx` - 路由配置，可能需要合并路由定义
- `stores/*.ts` - 状态管理文件，可能需要合并状态定义

## 执行计划

1. 使用 `rsync --ignore-existing` 复制所有非冲突文件
2. 跳过所有冲突文件（保留 frontend/src/ 中的版本）
3. 记录所有跳过的文件
4. 查找并更新所有 `@admin` 导入路径为 `@/`
5. 验证合并结果

## 状态跟踪

- [x] 冲突检测完成
- [ ] 文件复制完成
- [ ] @admin 导入路径更新完成
- [ ] 验证完成

