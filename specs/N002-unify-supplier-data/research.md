# Research: 统一供应商数据源

**Spec**: N002-unify-supplier-data
**Date**: 2026-01-11

## 1. 后端 API 分析

### 1.1 已有 API 端点

**端点**: `GET /api/suppliers`

**实现位置**: `backend/src/main/java/com/cinema/procurement/controller/SupplierController.java`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | String | 否 | 筛选状态: ACTIVE, SUSPENDED, TERMINATED |

**响应格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "SUP001",
      "name": "北京食品供应商",
      "contactName": "张三",
      "contactPhone": "13800138000",
      "status": "ACTIVE"
    }
  ],
  "timestamp": "2026-01-11T10:00:00Z"
}
```

### 1.2 后端 DTO 定义

**位置**: `backend/src/main/java/com/cinema/procurement/dto/SupplierDTO.java`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 供应商唯一标识 |
| code | String | 供应商编码 |
| name | String | 供应商名称 |
| contactName | String | 联系人姓名 |
| contactPhone | String | 联系电话 |
| status | String | 状态 |

## 2. 前端现状分析

### 2.1 数据不一致问题

| 页面 | 文件 | 数据来源 | 问题 |
|------|------|---------|------|
| 供应商列表 | `pages/procurement/SupplierList.tsx` | 硬编码 mockData (L57-118) | 4 条假数据 |
| 供应商管理 | `pages/procurement/SupplierManagePage.tsx` | useSupplierStore | 返回空数组 |

### 2.2 现有 Store 分析

**位置**: `frontend/src/stores/supplierStore.ts`

**问题**: `fetchSuppliers` 方法返回空数组 (L298-300):
```typescript
// Mock数据 - 暂时返回空数组
setItems([]);
return [];
```

### 2.3 现有类型定义

**位置**: `frontend/src/types/supplier.ts`

需要确认前端 `Supplier` 接口是否与后端 `SupplierDTO` 字段对齐。

## 3. 技术决策

### 3.1 API 调用方式

**决策**: 使用原生 fetch API

**理由**:
- 简单直接，无需额外依赖
- 项目已有类似实现模式
- 后续可迁移到 TanStack Query

**备选方案**: axios
- 被拒绝原因: 增加依赖，当前场景不需要其高级功能

### 3.2 数据获取架构

**决策**: 创建独立的 `supplierApi.ts` 服务层

**理由**:
- 分离关注点
- 便于单元测试
- 便于复用

**备选方案**: 直接在 store 中写 fetch
- 被拒绝原因: 耦合度高，测试困难

### 3.3 字段映射策略

**决策**: 在 API 服务层进行字段映射

**理由**:
- 集中处理前后端字段差异
- 其他组件无需关心后端字段名

**映射规则**:
| 后端字段 | 前端字段 |
|---------|---------|
| contactName | contactPerson |

## 4. 实现策略

### 4.1 最小改动原则

1. 创建 `supplierApi.ts` 封装 API 调用
2. 修改 `supplierStore.ts` 调用 API 服务
3. 修改 `SupplierList.tsx` 使用 store
4. 保持现有组件接口不变

### 4.2 兼容性考虑

- 保留 `SupplierManagePage.tsx` 现有逻辑
- 两个页面统一使用同一个 store
- 不改变组件的 props 接口

## 5. 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| 后端 API 返回格式变化 | 低 | 中 | API 已稳定，有类型检查 |
| 类型定义不兼容 | 中 | 低 | 创建适配层进行映射 |
| 性能问题 | 低 | 低 | API 已有性能优化 |

## 6. 结论

本次改造范围明确，风险可控。主要工作是：
1. 创建 API 服务层
2. 修改 store 调用真实 API
3. 修改 SupplierList.tsx 使用 store

预计改动 3-4 个文件，约 150-200 行代码。
