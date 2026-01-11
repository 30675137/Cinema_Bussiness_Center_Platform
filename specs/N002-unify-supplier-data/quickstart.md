# Quickstart: 统一供应商数据源

**Spec**: N002-unify-supplier-data
**Date**: 2026-01-11

## 快速开始

### 1. 前置条件

确保后端服务已启动：

```bash
cd backend
./mvnw spring-boot:run
# 服务启动在 http://localhost:8080
```

验证 API 可用：

```bash
curl http://localhost:8080/api/suppliers
# 应返回 { "success": true, "data": [...], "timestamp": "..." }
```

### 2. 前端开发

```bash
cd frontend
npm run dev
# 启动在 http://localhost:3000
```

### 3. 测试页面

- 供应商列表页面: http://localhost:3000/purchase-management/suppliers
- 供应商管理页面: http://localhost:3000/procurement/supplier

## 实现步骤

### Step 1: 创建 API 服务

创建 `frontend/src/services/supplierApi.ts`:

```typescript
/**
 * @spec N002-unify-supplier-data
 * 供应商 API 服务
 */

const API_BASE = '/api';

interface SupplierDTO {
  id: string;
  code: string;
  name: string;
  contactName: string | null;
  contactPhone: string | null;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const fetchSuppliers = async (status?: string): Promise<Supplier[]> => {
  const url = status
    ? `${API_BASE}/suppliers?status=${status}`
    : `${API_BASE}/suppliers`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('获取供应商列表失败');
  }

  const result: ApiResponse<SupplierDTO[]> = await response.json();

  if (!result.success) {
    throw new Error('API 返回错误');
  }

  return result.data.map(mapDTOToSupplier);
};

const mapDTOToSupplier = (dto: SupplierDTO): Supplier => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  contactPerson: dto.contactName || '',
  contactPhone: dto.contactPhone || '',
  status: dto.status,
});
```

### Step 2: 修改 Store

修改 `frontend/src/stores/supplierStore.ts`:

```typescript
// 导入 API 服务
import { fetchSuppliers as fetchSuppliersApi } from '@/services/supplierApi';

// 修改 fetchSuppliers 方法
fetchSuppliers: async () => {
  try {
    set({ loading: true, error: null });
    const suppliers = await fetchSuppliersApi();
    set({ items: suppliers, loading: false });
    return suppliers;
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取供应商失败';
    set({ error: message, loading: false });
    return [];
  }
},
```

### Step 3: 修改 SupplierList.tsx

修改 `frontend/src/pages/procurement/SupplierList.tsx`:

```typescript
// 1. 导入 store
import { useSupplierStore } from '@/stores/supplierStore';

// 2. 使用 store 替代 mockData
const SupplierListPage: React.FC = () => {
  const { items: suppliers, loading, fetchSuppliers } = useSupplierStore();

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // 3. 删除 mockData 变量
  // 4. 使用 suppliers 替代 mockData
  return (
    <Table
      dataSource={suppliers}
      loading={loading}
      // ...
    />
  );
};
```

## 验收测试

### 测试 1: 数据一致性

1. 打开供应商列表页面 `/purchase-management/suppliers`
2. 打开供应商管理页面 `/procurement/supplier`
3. **验证**: 两个页面显示的供应商数据完全一致

### 测试 2: 数据真实性

1. 在数据库中添加/修改一条供应商记录
2. 刷新前端页面
3. **验证**: 页面显示更新后的数据

### 测试 3: 空数据处理

1. 清空数据库中的供应商数据
2. 访问供应商列表页面
3. **验证**: 显示"暂无供应商数据"提示

### 测试 4: 错误处理

1. 停止后端服务
2. 访问供应商列表页面
3. **验证**: 显示友好的错误提示

## 常见问题

### Q1: API 返回 401 Unauthorized

**原因**: 未配置认证头

**解决**: 当前 B端 暂不实现认证，确保后端接口已开放

### Q2: 跨域错误 (CORS)

**原因**: 前端直接请求后端

**解决**: Vite 代理已配置，确保使用 `/api` 前缀

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

### Q3: 字段映射错误

**原因**: 后端 `contactName` vs 前端 `contactPerson`

**解决**: 在 `supplierApi.ts` 中进行映射

## 相关文档

- [Spec 文档](./spec.md)
- [实现计划](./plan.md)
- [数据模型](./data-model.md)
- [研究笔记](./research.md)
