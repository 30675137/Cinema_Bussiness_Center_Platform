# 功能分支绑定规则

## 核心原则
每个功能开发必须严格绑定到唯一的规格标识符(specId)。

## 规则

### R1.1 分支命名
- **格式**: `feat/<specId>-<slug>`,其中 specId 为 `X###` (模块字母+三位数字)
- **示例**: `feat/S017-store-crud`, `feat/A005-scenario-package`

### R1.2 规格文档位置
- **路径**: `specs/<specId>-<slug>/spec.md`
- **示例**: `specs/S017-store-crud/spec.md`, `specs/A005-scenario-package/spec.md`

### R1.2.1 模块字母映射
- **S**: 门店/影厅管理 (Store/Hall Management)
- **P**: 商品/库存管理 (Product/Inventory Management)
- **B**: 品牌/分类管理 (Brand/Category Management)
- **A**: 活动/场景包管理 (Activity/Scenario Package Management)
- **U**: 用户/预订管理 (User/Reservation Management)
- **O**: 订单管理 (Order Management - 商品订单)
- **T**: 工具/基础设施 (Tool/Infrastructure)
- **F**: 前端基础 (Frontend Infrastructure)

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
