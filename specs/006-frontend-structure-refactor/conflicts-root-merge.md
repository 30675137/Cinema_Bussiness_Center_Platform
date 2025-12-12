# 根目录合并冲突报告

**创建日期**: 2025-01-27  
**功能**: 006-frontend-structure-refactor  
**合并操作**: 根目录 `src/` 和 `tests/` 合并到 `frontend/src/` 和 `frontend/tests/`

## 文件冲突列表

### 源代码文件冲突 (src/ → frontend/src/)

以下文件在根目录 `src/` 和 `frontend/src/` 中都存在，需要手动审查：

1. **App.tsx**
   - 根目录: `src/App.tsx`
   - 目标: `frontend/src/App.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

2. **main.tsx**
   - 根目录: `src/main.tsx`
   - 目标: `frontend/src/main.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

3. **router/index.tsx**
   - 根目录: `src/router/index.tsx`
   - 目标: `frontend/src/router/index.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

4. **components/Inventory/AdjustmentModal.tsx**
   - 根目录: `src/components/Inventory/AdjustmentModal.tsx`
   - 目标: `frontend/src/components/Inventory/AdjustmentModal.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

5. **components/Inventory/InventoryFilters.tsx**
   - 根目录: `src/components/Inventory/InventoryFilters.tsx`
   - 目标: `frontend/src/components/Inventory/InventoryFilters.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

6. **components/Inventory/InventoryTable.tsx**
   - 根目录: `src/components/Inventory/InventoryTable.tsx`
   - 目标: `frontend/src/components/Inventory/InventoryTable.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

7. **components/Inventory/MovementsFilters.tsx**
   - 根目录: `src/components/Inventory/MovementsFilters.tsx`
   - 目标: `frontend/src/components/Inventory/MovementsFilters.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

8. **components/Inventory/MovementsTable.tsx**
   - 根目录: `src/components/Inventory/MovementsTable.tsx`
   - 目标: `frontend/src/components/Inventory/MovementsTable.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

9. **components/Inventory/PermissionGuard.tsx**
   - 根目录: `src/components/Inventory/PermissionGuard.tsx`
   - 目标: `frontend/src/components/Inventory/PermissionGuard.tsx`
   - 优先级: frontend/src/ > root src/
   - 状态: 待审查

10. **components/Inventory/UserRoleSelector.tsx**
    - 根目录: `src/components/Inventory/UserRoleSelector.tsx`
    - 目标: `frontend/src/components/Inventory/UserRoleSelector.tsx`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

11. **hooks/useInventoryAdjustment.ts**
    - 根目录: `src/hooks/useInventoryAdjustment.ts`
    - 目标: `frontend/src/hooks/useInventoryAdjustment.ts`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

12. **hooks/useInventoryData.ts**
    - 根目录: `src/hooks/useInventoryData.ts`
    - 目标: `frontend/src/hooks/useInventoryData.ts`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

13. **hooks/usePermissions.ts**
    - 根目录: `src/hooks/usePermissions.ts`
    - 目标: `frontend/src/hooks/usePermissions.ts`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

14. **hooks/useResponsive.ts**
    - 根目录: `src/hooks/useResponsive.ts`
    - 目标: `frontend/src/hooks/useResponsive.ts`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

15. **pages/inventory/InventoryLedger.tsx**
    - 根目录: `src/pages/inventory/InventoryLedger.tsx`
    - 目标: `frontend/src/pages/inventory/InventoryLedger.tsx`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

16. **pages/inventory/InventoryMovements.tsx**
    - 根目录: `src/pages/inventory/InventoryMovements.tsx`
    - 目标: `frontend/src/pages/inventory/InventoryMovements.tsx`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

17. **stores/inventoryStore.ts**
    - 根目录: `src/stores/inventoryStore.ts`
    - 目标: `frontend/src/stores/inventoryStore.ts`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

18. **types/inventory.ts**
    - 根目录: `src/types/inventory.ts`
    - 目标: `frontend/src/types/inventory.ts`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

19. **utils/inventoryHelpers.ts**
    - 根目录: `src/utils/inventoryHelpers.ts`
    - 目标: `frontend/src/utils/inventoryHelpers.ts`
    - 优先级: frontend/src/ > root src/
    - 状态: 待审查

### 测试文件冲突 (tests/ → frontend/tests/)

以下文件在根目录 `tests/` 和 `frontend/tests/` 中都存在：

1. **setup.ts**
   - 根目录: `tests/setup.ts`
   - 目标: `frontend/tests/setup.ts`
   - 优先级: frontend/tests/ > root tests/
   - 状态: 待审查

## 冲突解决策略

根据优先级规则：**frontend/src/ > root src/**

对于所有冲突文件：
1. **保留 frontend/src/ 中的版本**（优先级最高）
2. **跳过根目录 src/ 中的同名文件**（使用 `--ignore-existing` 标志）
3. **记录所有跳过的文件**以便后续审查

## 需要手动审查的文件

以下文件虽然存在冲突，但可能需要手动合并内容（如果根目录版本有独特功能）：

- `App.tsx` - 应用入口，需要检查是否有不同的配置
- `main.tsx` - 入口文件，需要检查是否有不同的初始化逻辑
- `router/index.tsx` - 路由配置，可能需要合并路由定义

## 执行计划

1. 使用 `rsync --ignore-existing` 复制所有非冲突文件
2. 跳过所有冲突文件（保留 frontend/src/ 中的版本）
3. 记录所有跳过的文件
4. 手动审查关键文件（App.tsx, main.tsx, router/index.tsx）
5. 验证合并结果

## 状态跟踪

- [x] 冲突检测完成
- [ ] 文件复制完成
- [ ] 冲突文件审查完成
- [ ] 验证完成

