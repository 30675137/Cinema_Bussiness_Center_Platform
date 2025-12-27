# 目录结构分析报告

**创建日期**: 2025-01-27  
**功能**: 006-frontend-structure-refactor  
**目的**: 记录重构前的目录结构和文件统计，作为重构参考

## 文件统计

### 根目录源代码 (src/)
- **文件总数**: 28 个文件
- **主要目录**:
  - `src/components/Inventory/`
  - `src/hooks/`
  - `src/pages/inventory/`
  - `src/router/`
  - `src/services/`
  - `src/stores/`
  - `src/styles/`
  - `src/types/`
  - `src/utils/`

### 根目录测试文件 (tests/)
- **文件总数**: 7 个文件
- **主要目录**:
  - `tests/e2e/`
  - `tests/unit/components/`
  - `tests/unit/helpers/`

### Frontend 源代码 (frontend/src/)
- **文件总数**: 229 个文件
- **主要目录**:
  - `frontend/src/components/` (包含多个子目录)
  - `frontend/src/pages/` (包含多个子目录)
  - `frontend/src/services/`
  - `frontend/src/stores/`
  - `frontend/src/types/`
  - `frontend/src/utils/`
  - `frontend/src/router/`
  - `frontend/src/hooks/`
  - `frontend/src/i18n/`
  - `frontend/src/mocks/`
  - `frontend/src/monitoring/`
  - `frontend/src/optimization/`
  - `frontend/src/theme/`

### Cinema_Operation_Admin 源代码 (frontend/Cinema_Operation_Admin/src/)
- **文件总数**: 157 个文件
- **主要目录**:
  - `frontend/Cinema_Operation_Admin/src/components/` (包含多个子目录)
  - `frontend/Cinema_Operation_Admin/src/pages/` (包含多个子目录)
  - `frontend/Cinema_Operation_Admin/src/router/`
  - `frontend/Cinema_Operation_Admin/src/services/`
  - `frontend/Cinema_Operation_Admin/src/stores/`
  - `frontend/Cinema_Operation_Admin/src/types/`
  - `frontend/Cinema_Operation_Admin/src/utils/`
  - `frontend/Cinema_Operation_Admin/src/hooks/`
  - `frontend/Cinema_Operation_Admin/src/styles/`
  - `frontend/Cinema_Operation_Admin/src/data/`

## 目录结构详情

### 根目录结构
```
项目根目录/
├── src/                          # 28 个文件
│   ├── components/Inventory/
│   ├── hooks/
│   ├── pages/inventory/
│   ├── router/
│   ├── services/
│   ├── stores/
│   ├── styles/
│   ├── types/
│   └── utils/
│
└── tests/                        # 7 个文件
    ├── e2e/
    └── unit/
        ├── components/
        └── helpers/
```

### Frontend 目录结构
```
frontend/
├── src/                          # 229 个文件
│   ├── components/              # 多个子目录
│   ├── pages/                   # 多个子目录
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── router/
│   ├── hooks/
│   ├── i18n/
│   ├── mocks/
│   ├── monitoring/
│   ├── optimization/
│   └── theme/
│
└── Cinema_Operation_Admin/
    └── src/                      # 157 个文件
        ├── components/           # 多个子目录
        ├── pages/                # 多个子目录
        ├── router/
        ├── services/
        ├── stores/
        ├── types/
        ├── utils/
        ├── hooks/
        ├── styles/
        └── data/
```

## 合并策略

### 优先级顺序
1. **frontend/src/** (优先级最高) - 229 个文件
2. **frontend/Cinema_Operation_Admin/src/** (优先级中等) - 157 个文件
3. **根目录 src/** (优先级最低) - 28 个文件

### 预期合并结果
- **目标目录**: `frontend/src/`
- **预期文件总数**: 约 400+ 个文件（考虑可能的文件冲突和合并）

## 注意事项

1. **文件冲突**: 需要检查同名文件，特别是：
   - `App.tsx`
   - `main.tsx`
   - 组件文件
   - 工具函数文件

2. **导入路径**: 
   - 需要更新所有 `@admin/*` 引用为 `@/*`
   - 需要验证所有 `@/` 引用指向正确的路径

3. **配置文件**: 
   - 需要合并 `package.json` 依赖
   - 需要更新 `vite.config.ts` 和 `tsconfig.app.json`

## 下一步行动

1. 分析文件冲突
2. 执行文件合并
3. 更新导入路径
4. 更新配置文件
5. 验证功能完整性

