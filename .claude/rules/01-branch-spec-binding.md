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

#### 业务功能模块

| 字母 | 模块名称 | 英文全称 | 适用范围 | 示例 |
|------|---------|---------|---------|------|
| **A** | 活动/场景包管理 | Activity/Scenario Package Management | 场景包、套餐、活动配置 | A005-scenario-package |
| **B** | 品牌/分类/BOM管理 | Brand/Category/BOM Management | 品牌、类目、物料配方 | B001-brand-management |
| **C** | 配置/基础设置 | Config/Settings | 组织、字典、参数配置 | C001-organization-config |
| **D** | 工作台/首页 | Dashboard | 首页、工作台、概览 | D001-dashboard-overview |
| **E** | 报表/数据分析 | rEport/Analytics | 运营报表、指标看板 | E001-sales-report |
| **I** | 库存管理 | Inventory Management | 库存查询、调整、盘点 | I003-inventory-query |
| **M** | 物料/BOM管理 | Materials/BOM Management | 原料库、配方、成本 | M001-material-master |
| **N** | 采购/入库管理 | iNbound/Procurement | 采购订单、收货入库 | N001-purchase-order |
| **O** | 订单管理 | Order Management | 商品订单、饮品订单 | O003-beverage-order |
| **P** | 商品管理 | Product Management | SPU/SKU、商品主数据 | P001-spu-management |
| **R** | 价格体系管理 | pRicing Management | 价目表、价格规则 | R001-price-list |
| **S** | 门店/影厅/档期管理 | Store/Hall/Schedule Management | 门店、影厅、排期 | S014-store-management |
| **U** | 用户/预订管理 | User/Reservation Management | 用户、预约、核销 | U001-reservation-orders |
| **Y** | 系统管理 | sYstem Management | 用户、权限、审计日志 | Y001-user-management |

#### 技术基础设施模块

| 字母 | 模块名称 | 英文全称 | 适用范围 | 示例 |
|------|---------|---------|---------|------|
| **T** | 工具/基础设施 | Tool/Infrastructure | E2E测试、脚本工具 | T002-e2e-test-generator |
| **F** | 前端基础 | Frontend Infrastructure | UI组件、布局、样式 | F001-ui-components |

#### 使用说明

1. **选择模块前缀**：根据功能所属领域选择对应字母
2. **避免冲突**：
   - ✅ 正确：库存功能使用 `I###`（Inventory），商品功能使用 `P###`（Product）
   - ❌ 错误：库存功能使用 `P###`（会与商品管理混淆）
3. **编号分配**：同一模块内编号递增（如 I001, I002, I003）
4. **跨模块功能**：选择主要业务领域的模块前缀

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
