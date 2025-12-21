# Quick Start Guide: 前端路径结构优化

**Date**: 2025-01-27  
**Feature**: 006-frontend-structure-refactor

## 概述

本指南提供前端路径结构重构的快速开始步骤，帮助开发人员快速理解和执行重构任务。

## 前置条件

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Git
- 代码编辑器（推荐 VS Code）

### 检查清单
- [ ] 当前代码已提交到 Git
- [ ] 已创建功能分支 `006-frontend-structure-refactor`
- [ ] 已备份重要文件（可选但推荐）
- [ ] 已阅读 [spec.md](./spec.md) 和 [research.md](./research.md)

## 快速开始

### 步骤 1: 准备环境

```bash
# 1. 确保在项目根目录
cd /path/to/Cinema_Bussiness_Center_Platform

# 2. 创建功能分支（如果还没有）
git checkout -b 006-frontend-structure-refactor

# 3. 确保工作区干净
git status

# 4. 安装依赖
cd frontend
npm install
```

### 步骤 2: 分析当前结构

```bash
# 1. 查看根目录 src 文件列表
find src -type f -name "*.ts" -o -name "*.tsx" | head -20

# 2. 查看 Cinema_Operation_Admin 文件列表
find frontend/Cinema_Operation_Admin/src -type f | head -20

# 3. 查找所有使用 @admin 别名的文件
grep -r "@admin" frontend/src --include="*.ts" --include="*.tsx"

# 4. 检查文件冲突（同名文件）
# 这个需要手动检查，比较 src/ 和 frontend/src/ 以及 Cinema_Operation_Admin/src/ 中的同名文件
```

### 步骤 3: 执行文件合并

#### 3.1 合并根目录 src 到 frontend/src

```bash
# 从项目根目录执行
# 注意：使用 cp -r 复制而不是移动，保留源文件直到验证完成

# 复制根目录 src 到 frontend/src（如果目标目录不存在则创建）
rsync -av --ignore-existing src/ frontend/src/
```

#### 3.2 合并根目录 tests 到 frontend/tests

```bash
# 复制根目录 tests 到 frontend/tests
rsync -av --ignore-existing tests/ frontend/tests/
```

#### 3.3 合并 Cinema_Operation_Admin/src 到 frontend/src

```bash
# 复制 Cinema_Operation_Admin/src 到 frontend/src
rsync -av --ignore-existing frontend/Cinema_Operation_Admin/src/ frontend/src/
```

#### 3.4 合并 Cinema_Operation_Admin/tests 到 frontend/tests

```bash
# 复制 Cinema_Operation_Admin/tests 到 frontend/tests
rsync -av --ignore-existing frontend/Cinema_Operation_Admin/tests/ frontend/tests/
```

### 步骤 4: 更新导入路径

#### 4.1 查找所有使用 @admin 的文件

```bash
cd frontend

# 查找所有包含 @admin 的文件
grep -r "@admin" src --include="*.ts" --include="*.tsx" -l

# 或者使用更精确的正则表达式
grep -r "from ['\"]@admin" src --include="*.ts" --include="*.tsx" -l
```

#### 4.2 批量替换 @admin 为 @/

```bash
# 方法1: 使用 sed (macOS)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/@admin\//@\//g' {} +

# 方法2: 使用 VS Code 的查找替换功能
# 1. 打开 VS Code
# 2. 按 Cmd+Shift+F (macOS) 或 Ctrl+Shift+F (Windows/Linux)
# 3. 搜索: @admin/
# 4. 替换为: @/
# 5. 在 "files to include" 中输入: src/**/*.{ts,tsx}
# 6. 点击替换所有

# 注意：替换后需要手动检查每个文件，确保路径正确
```

### 步骤 5: 更新配置文件

#### 5.1 更新 vite.config.ts

编辑 `frontend/vite.config.ts`，移除 `@admin` 别名：

```typescript
// 删除或注释掉这一行
// '@admin': resolve(__dirname, 'Cinema_Operation_Admin/src'),
```

#### 5.2 更新 tsconfig.app.json

编辑 `frontend/tsconfig.app.json`，移除 `@admin/*` 路径映射：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      // 删除 "@admin/*": ["Cinema_Operation_Admin/src/*"]
      // ... 其他路径映射
    }
  }
}
```

#### 5.3 合并 package.json

比较 `frontend/package.json` 和 `frontend/Cinema_Operation_Admin/package.json`，合并依赖：

1. 对于相同的包，保留版本号较高的版本
2. 对于不同的包，全部添加到 `frontend/package.json`
3. 合并 scripts 命令（确保不冲突）

### 步骤 6: 验证更新

#### 6.1 类型检查

```bash
cd frontend

# 运行 TypeScript 类型检查
npm run build
# 或者
npx tsc --noEmit
```

#### 6.2 代码检查

```bash
# 运行 ESLint
npm run lint

# 修复可自动修复的问题
npm run lint:fix
```

#### 6.3 构建验证

```bash
# 运行生产构建
npm run build

# 检查是否有构建错误
```

#### 6.4 开发服务器验证

```bash
# 启动开发服务器
npm run dev

# 访问应用，检查是否正常运行
# 打开浏览器访问 http://localhost:3000
```

#### 6.5 测试验证

```bash
# 运行单元测试
npm run test:unit

# 运行 E2E 测试
npm run test
```

### 步骤 7: 处理文件冲突

如果在步骤 3 中发现同名文件冲突：

1. 查看冲突报告（如果有生成）
2. 对于每个冲突文件：
   - 比较两个文件的内容
   - 如果 `frontend/src/` 中的版本较新或更完整，保留它
   - 如果 `Cinema_Operation_Admin/src/` 中的版本需要保留，手动合并内容
   - 如果两个版本都需要，考虑重命名一个文件

### 步骤 8: 删除源目录（可选）

**重要**: 只有在确认所有功能正常后才执行此步骤！

```bash
# 1. 再次运行完整测试
cd frontend
npm run test:unit
npm run test

# 2. 手动测试主要功能
# 确保应用的主要功能都能正常工作

# 3. 如果一切正常，删除源目录
# 注意：建议先提交当前更改，再删除

# 删除根目录的 src 和 tests
cd ..
rm -rf src tests

# 删除 Cinema_Operation_Admin 目录
rm -rf frontend/Cinema_Operation_Admin
```

### 步骤 9: 提交更改

```bash
# 1. 查看更改
git status

# 2. 添加更改
git add .

# 3. 提交（遵循提交规范）
git commit -m "refactor(frontend): 合并路径结构到 frontend 目录

- 合并根目录 src/ 到 frontend/src/
- 合并根目录 tests/ 到 frontend/tests/
- 合并 Cinema_Operation_Admin/ 到 frontend/
- 更新所有 @admin 导入路径为 @/
- 更新 vite.config.ts 和 tsconfig.app.json
- 合并 package.json 依赖
- 删除冗余目录"
```

## 常见问题

### Q1: 文件复制时提示 "文件已存在" 怎么办？

**A**: 这是正常的，说明目标位置已经有同名文件。你需要：
1. 比较两个文件的内容
2. 根据优先级决定保留哪个版本
3. 如果需要合并，手动合并内容

### Q2: 替换 @admin 后，TypeScript 报错找不到模块？

**A**: 检查以下几点：
1. 确保文件已经正确复制到目标位置
2. 确保路径映射正确（检查 tsconfig.app.json）
3. 确保 Vite 别名配置正确（检查 vite.config.ts）
4. 重启 TypeScript 服务器（VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"）

### Q3: 依赖合并后，npm install 失败？

**A**: 
1. 检查 package.json 语法是否正确（JSON 格式）
2. 删除 node_modules 和 package-lock.json，重新安装：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Q4: 测试失败怎么办？

**A**: 
1. 检查测试文件的路径是否正确
2. 检查测试配置（playwright.config.ts, vitest.config.ts）是否正确
3. 检查测试 setup 文件路径是否正确
4. 查看测试错误信息，定位具体问题

## 验证清单

完成重构后，请确认以下项目：

- [ ] 所有文件已成功复制到目标位置
- [ ] 所有 `@admin` 导入已更新为 `@/`
- [ ] `vite.config.ts` 已移除 `@admin` 别名
- [ ] `tsconfig.app.json` 已移除 `@admin/*` 路径映射
- [ ] `package.json` 依赖已正确合并
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 项目能够正常构建
- [ ] 开发服务器能够正常启动
- [ ] 所有测试通过
- [ ] 主要功能手动测试通过
- [ ] 源目录已删除（如果执行了步骤 8）
- [ ] 更改已提交到 Git

## 下一步

完成重构后：

1. 创建 Pull Request（如果使用 Git 工作流）
2. 进行代码审查
3. 部署到测试环境进行验证
4. 更新相关文档

## 参考资料

- [Feature Specification](./spec.md)
- [Research Document](./research.md)
- [Data Model](./data-model.md)
- [Implementation Plan](./plan.md)
