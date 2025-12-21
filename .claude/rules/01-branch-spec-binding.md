# 功能分支绑定规则

## 核心原则
每个功能开发必须严格绑定到唯一的规格标识符(specId)。

## 规则

### R1.1 分支命名
- **格式**: `feat/<specId>-<slug>`
- **示例**: `feat/017-scenario-package`

### R1.2 规格文档位置
- **路径**: `specs/<specId>-<slug>/spec.md`
- **示例**: `specs/017-scenario-package/spec.md`

### R1.3 激活规格引用
- 通过 `.specify/active_spec.txt` 维护当前激活规格

### R1.4 一致性检查
- 当前 git 分支名中的 specId **必须**等于 active_spec 指向路径中的 specId
- 任何不匹配必须先修正绑定（改分支名或 active_spec），再继续实现

### R1.5 修改范围限制
- AI 只允许在"当前分支 + active_spec"范围内修改内容
- 禁止跨规格修改代码

## 检查命令
```bash
# 查看当前分支
git branch --show-current

# 查看激活规格
cat .specify/active_spec.txt
```
