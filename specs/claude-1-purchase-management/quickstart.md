# 采购与入库管理模块快速入门指南

## 概述

本文档提供了采购与入库管理模块的快速入门指南，包括环境搭建、基础配置、核心功能演示和开发指导。

## 技术栈

- **前端框架**: React 18.2.0 + TypeScript 5.0.4
- **UI组件库**: Ant Design 6.1.0
- **样式框架**: Tailwind CSS 4.1.17
- **构建工具**: Vite 6.0.7
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **路由**: React Router 6

## 环境准备

### 1. 系统要求
- Node.js 18+
- npm 9+ 或 yarn 1.22+
- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)

### 2. 项目初始化
```bash
# 进入项目目录
cd Cinema_Bussiness_Center_Platform/frontend/Cinema_Operation_Admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 3. 开发环境访问
- 本地开发地址: http://localhost:3000
- 采购管理模块路径: /purchase-management

## 核心功能模块

### 1. 采购订单管理 (Purchase Orders)

#### 功能概述
采购订单管理是采购流程的核心模块，提供订单的创建、编辑、审批、跟踪等功能。

#### 主要界面
- **订单列表页**: `/purchase-management/orders`
- **订单详情页**: `/purchase-management/orders/:id`
- **创建订单页**: `/purchase-management/orders/new`
- **编辑订单页**: `/purchase-management/orders/:id/edit`

#### 核心功能演示

**1. 创建采购订单**
```typescript
// 示例代码：创建采购订单
import { usePurchaseOrderStore } from '../stores/purchaseOrderStore';

const CreateOrderForm = () => {
  const { createOrder } = usePurchaseOrderStore();

  const handleSubmit = async (values: CreateOrderParams) => {
    try {
      const result = await createOrder(values);
      message.success('采购订单创建成功');
      // 跳转到订单详情页
      navigate(`/purchase-management/orders/${result.id}`);
    } catch (error) {
      message.error('创建失败：' + error.message);
    }
  };

  return (
    <Form onFinish={handleSubmit}>
      {/* 表单组件 */}
    </Form>
  );
};
```

**2. 订单状态管理**
```typescript
// 状态流转逻辑
const handleStatusTransition = async (orderId: string, action: string) => {
  switch (action) {
    case 'submit':
      await submitForApproval(orderId);
      break;
    case 'approve':
      await approveOrder(orderId);
      break;
    case 'close':
      await closeOrder(orderId);
      break;
  }
};
```

### 2. 收货入库管理 (Goods Receipt)

#### 功能概述
基于采购订单执行收货入库操作，管理商品的实际入库流程。

#### 主要界面
- **收货单列表页**: `/purchase-management/receipts`
- **收货单详情页**: `/purchase-management/receipts/:id`
- **创建收货单页**: `/purchase-management/receipts/new`

#### 核心功能演示

**1. 基于采购订单创建收货单**
```typescript
const CreateReceiptForm = ({ purchaseOrderId }: Props) => {
  const [purchaseOrder, setPurchaseOrder] = useState(null);

  useEffect(() => {
    // 加载采购订单数据
    loadPurchaseOrder(purchaseOrderId);
  }, [purchaseOrderId]);

  return (
    <Form>
      <Form.Item label="关联采购订单">
        <Input value={purchaseOrder?.orderNumber} disabled />
      </Form.Item>

      <Form.List name="items">
        {(fields) => (
          <>
            {fields.map(({ key, name }) => (
              <div key={key}>
                {/* 收货明细表单 */}
              </div>
            ))}
          </>
        )}
      </Form.List>
    </Form>
  );
};
```

### 3. 供应商管理 (Suppliers)

#### 功能概述
管理供应商信息，为采购订单提供供应商选择支持。

#### 主要界面
- **供应商列表页**: `/purchase-management/suppliers`
- **供应商详情页**: `/purchase-management/suppliers/:id`

#### 供应商选择组件
```typescript
const SupplierSelector = ({ value, onChange }: Props) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (keyword: string) => {
    setLoading(true);
    try {
      const result = await searchSuppliers({ keyword, limit: 20 });
      setSuppliers(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      showSearch
      filterOption={false}
      loading={loading}
    >
      {suppliers.map(supplier => (
        <Select.Option key={supplier.id} value={supplier.id}>
          {supplier.name}
        </Select.Option>
      ))}
    </Select>
  );
};
```

## 组件库使用指南

### 1. 通用组件

#### DataTable - 数据表格组件
```typescript
<DataTable
  columns={columns}
  dataSource={dataSource}
  loading={loading}
  pagination={{
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    onChange: handlePageChange,
  }}
  rowSelection={{
    selectedRowKeys: selectedKeys,
    onChange: handleSelectionChange,
  }}
/>
```

#### SearchForm - 搜索表单组件
```typescript
<SearchForm
  fields={[
    { name: 'orderNumber', label: '订单号', type: 'input' },
    { name: 'status', label: '状态', type: 'select', options: statusOptions },
    { name: 'dateRange', label: '日期范围', type: 'dateRange' },
  ]}
  onSearch={handleSearch}
  onReset={handleReset}
/>
```

#### StatusTag - 状态标签组件
```typescript
<StatusTag
  status={order.status}
  statusMap={{
    draft: { color: 'default', text: '草稿' },
    pending: { color: 'processing', text: '审批中' },
    approved: { color: 'success', text: '已审批' },
  }}
/>
```

### 2. 业务组件

#### OrderItemForm - 订单明细表单
```typescript
<OrderItemForm
  value={items}
  onChange={setItems}
  onCalculate={handleCalculate}
/>
```

#### ReceiptProgress - 收货进度组件
```typescript
<ReceiptProgress
  received={order.receivedAmount}
  total={order.totalAmount}
  percentage={order.receiptProgress}
/>
```

## Mock数据管理

### 1. 数据初始化
```typescript
// src/data/mockData.ts
export const initializeMockData = () => {
  if (!localStorage.getItem('purchase-management-initialized')) {
    // 初始化供应商数据
    localStorage.setItem('suppliers', JSON.stringify(mockSuppliers));

    // 初始化商品数据
    localStorage.setItem('products', JSON.stringify(mockProducts));

    // 初始化仓库数据
    localStorage.setItem('warehouses', JSON.stringify(mockWarehouses));

    // 初始化采购订单数据
    localStorage.setItem('purchase-orders', JSON.stringify(mockPurchaseOrders));

    // 初始化收货单数据
    localStorage.setItem('goods-receipts', JSON.stringify(mockGoodsReceipts));

    localStorage.setItem('purchase-management-initialized', 'true');
  }
};
```

### 2. API服务层
```typescript
// src/services/purchaseOrderService.ts
class PurchaseOrderService {
  async getOrders(params: GetOrdersParams) {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    const orders = JSON.parse(localStorage.getItem('purchase-orders') || '[]');

    // 应用筛选条件
    let filteredOrders = orders;
    if (params.status) {
      filteredOrders = filteredOrders.filter((order: any) => order.status === params.status);
    }
    if (params.keyword) {
      filteredOrders = filteredOrders.filter((order: any) =>
        order.orderNumber.includes(params.keyword) ||
        order.supplier.name.includes(params.keyword)
      );
    }

    // 分页处理
    const startIndex = (params.current! - 1) * params.pageSize!;
    const endIndex = startIndex + params.pageSize!;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      items: paginatedOrders,
      pagination: {
        current: params.current!,
        pageSize: params.pageSize!,
        total: filteredOrders.length,
      },
    };
  }

  async createOrder(params: CreateOrderParams) {
    const orders = JSON.parse(localStorage.getItem('purchase-orders') || '[]');

    const newOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      ...params,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    localStorage.setItem('purchase-orders', JSON.stringify(orders));

    return newOrder;
  }
}

export const purchaseOrderService = new PurchaseOrderService();
```

### 3. 数据生成工具
```typescript
// src/tools/dataGenerator.ts
export const generateMockPurchaseOrders = (count: number) => {
  const orders = [];
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const warehouses = JSON.parse(localStorage.getItem('warehouses') || '[]');
  const products = JSON.parse(localStorage.getItem('products') || '[]');

  for (let i = 0; i < count; i++) {
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
    const status = ['draft', 'pending', 'approved', 'partial_received', 'received'][Math.floor(Math.random() * 5)];

    const items = generateMockOrderItems(1 + Math.floor(Math.random() * 5), products);

    orders.push({
      id: `po_${i + 1}`,
      orderNumber: `PO202512${String(i + 1).padStart(6, '0')}`,
      supplier,
      warehouse,
      status,
      orderDate: randomPastDate(30),
      expectedDate: randomFutureDate(30),
      items,
      totalAmount: calculateTotalAmount(items),
      receiptProgress: status === 'received' ? 1 : Math.random(),
      createdAt: randomPastDate(30),
      updatedAt: new Date().toISOString(),
    });
  }

  return orders;
};
```

## 样式定制

### 1. Tailwind CSS配置
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
```

### 2. 自定义样式
```css
/* src/styles/purchase-management.css */
.purchase-management {
  @apply min-h-screen bg-gray-50;
}

.order-status-tag {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.order-status-draft {
  @apply bg-gray-100 text-gray-800;
}

.order-status-approved {
  @apply bg-green-100 text-green-800;
}

.receipt-progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.receipt-progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}
```

## 测试指南

### 1. 单元测试
```typescript
// src/components/__tests__/OrderForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderForm } from '../OrderForm';

describe('OrderForm', () => {
  test('should render form fields correctly', () => {
    render(<OrderForm />);

    expect(screen.getByLabelText('供应商')).toBeInTheDocument();
    expect(screen.getByLabelText('仓库')).toBeInTheDocument();
    expect(screen.getByLabelText('下单日期')).toBeInTheDocument();
  });

  test('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<OrderForm onSubmit={onSubmit} />);

    // 填写表单数据
    fireEvent.change(screen.getByLabelText('供应商'), {
      target: { value: 'supplier_001' },
    });

    // 提交表单
    fireEvent.click(screen.getByText('保存'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        supplierId: 'supplier_001',
      })
    );
  });
});
```

### 2. E2E测试
```typescript
// tests/e2e/purchase-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('采购管理模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchase-management/orders');
  });

  test('应该正确显示采购订单列表', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('采购订单');
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('应该能够创建新的采购订单', async ({ page }) => {
    await page.click('text=新建采购订单');

    // 填写表单
    await page.selectOption('[data-testid="supplier-select"]', '北京影视器材供应商');
    await page.selectOption('[data-testid="warehouse-select"]', '北京总仓');

    // 提交表单
    await page.click('text=保存');

    // 验证成功提示
    await expect(page.locator('.ant-message-success')).toBeVisible();
  });
});
```

## 部署指南

### 1. 构建配置
```bash
# 生产环境构建
npm run build

# 预览构建结果
npm run preview
```

### 2. 环境变量配置
```bash
# .env.production
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_TITLE=影院商品管理中台
VITE_MOCK_DATA=true
```

### 3. 性能优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          utils: ['lodash', 'dayjs'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

## 常见问题

### 1. 开发环境问题
**Q: 开发服务器启动失败**
A: 检查Node.js版本是否为18+，删除node_modules后重新安装依赖

**Q: 组件样式不生效**
A: 确认Tailwind CSS配置正确，重启开发服务器

### 2. 功能问题
**Q: Mock数据初始化失败**
A: 清除浏览器localStorage，刷新页面重新初始化

**Q: 表单验证不生效**
A: 检查表单字段的name属性和验证规则配置

### 3. 性能问题
**Q: 大数据量表格卡顿**
A: 启用虚拟滚动，使用useMemo优化渲染

**Q: 页面切换性能差**
A: 使用React.lazy进行路由级代码分割

## 扩展开发

### 1. 添加新功能模块
1. 在`src/pages`下创建新组件
2. 配置路由
3. 添加API服务
4. 编写测试用例

### 2. 自定义组件开发
1. 在`src/components`下创建组件
2. 编写组件文档
3. 添加单元测试
4. 更新组件库文档

## 技术支持

### 1. 文档资源
- [React官方文档](https://react.dev/)
- [Ant Design组件库](https://ant.design/)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [Vite构建工具](https://vitejs.dev/)

### 2. 问题反馈
如遇到技术问题，请：
1. 查看控制台错误信息
2. 检查相关文档
3. 联系开发团队

---

**文档版本**: v1.0
**创建日期**: 2025-12-11
**维护人**: 开发团队
**适用分支**: claude-1-purchase-management