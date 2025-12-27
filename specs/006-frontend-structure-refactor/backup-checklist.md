# 重构前备份清单

**创建日期**: 2025-01-27  
**功能**: 006-frontend-structure-refactor  
**目的**: 记录重构前需要备份的关键文件和目录

## 关键文件备份清单

### 源代码文件
- [x] 根目录 `src/` 目录（28 个文件）
- [x] 根目录 `tests/` 目录（7 个文件）
- [x] `frontend/src/` 目录（229 个文件）
- [x] `frontend/Cinema_Operation_Admin/src/` 目录（157 个文件）

### 配置文件
- [x] `frontend/vite.config.ts` - Vite 构建配置
- [x] `frontend/tsconfig.app.json` - TypeScript 配置
- [x] `frontend/package.json` - 依赖配置
- [x] `frontend/Cinema_Operation_Admin/package.json` - Admin 依赖配置
- [x] `frontend/playwright.config.ts` - Playwright 测试配置
- [x] `frontend/vitest.config.ts` - Vitest 测试配置

### 测试文件
- [x] `frontend/tests/` 目录
- [x] `frontend/Cinema_Operation_Admin/tests/` 目录（如果存在）

## Git 备份状态

- [x] 当前分支: `006-frontend-structure-refactor`
- [x] Git 工作目录状态已检查
- [x] 所有更改可通过 Git 历史追溯

## 备份方法

### Git 备份（推荐）
- 所有文件更改都记录在 Git 历史中
- 可以通过 `git checkout` 回滚到任何提交点
- 当前分支: `006-frontend-structure-refactor`

### 文件系统备份（可选）
如果需要额外的文件系统备份，可以：
1. 复制整个项目目录到备份位置
2. 使用 `rsync` 或 `cp -r` 命令创建备份

## 回滚计划

如果重构过程中出现问题，可以：

1. **使用 Git 回滚**:
   ```bash
   git checkout <commit-hash>
   # 或
   git reset --hard HEAD~1
   ```

2. **恢复特定文件**:
   ```bash
   git checkout <commit-hash> -- <file-path>
   ```

3. **恢复整个目录**:
   ```bash
   git checkout <commit-hash> -- <directory-path>
   ```

## 验证检查点

在开始重构前，确认：
- [x] Git 分支已创建
- [x] 当前工作目录状态已记录
- [x] 所有关键文件路径已记录
- [x] 回滚计划已制定

## 注意事项

1. **不要删除源文件**直到验证完成
2. **保留 Git 历史**以便追溯更改
3. **分阶段提交**以便于回滚
4. **记录所有冲突**和解决方案

