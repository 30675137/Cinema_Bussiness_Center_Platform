# Quickstart: P003-inventory-query

## Prerequisites

- Node.js 18+
- Java 21
- PostgreSQL (via Supabase)
- Git

## Setup

### 1. 切换到功能分支

```bash
git checkout P003-inventory-query
```

### 2. 运行数据库迁移

```bash
# 复制迁移文件到 resources/db/migration
cp specs/P003-inventory-query/migrations/*.sql backend/src/main/resources/db/migration/

# 启动后端（Flyway 自动执行迁移）
cd backend && ./mvnw spring-boot:run
```

### 3. 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev
```

### 4. 访问库存查询页面

打开浏览器访问: http://localhost:5173/inventory

## Development Workflow

### 后端开发

1. **创建实体类**
   ```
   backend/src/main/java/com/cinema/inventory/
   ├── domain/
   │   ├── StoreInventory.java
   │   ├── Category.java
   │   └── InventoryStatus.java
   ├── repository/
   │   ├── StoreInventoryRepository.java
   │   └── CategoryRepository.java
   ├── service/
   │   └── InventoryService.java
   ├── controller/
   │   └── InventoryController.java
   └── dto/
       ├── InventoryQueryParams.java
       └── InventoryListResponse.java
   ```

2. **运行后端测试**
   ```bash
   cd backend && ./mvnw test
   ```

### 前端开发

1. **创建组件**
   ```
   frontend/src/features/inventory/
   ├── components/
   │   ├── InventoryFilterBar.tsx
   │   ├── InventoryTable.tsx
   │   ├── InventoryStatusTag.tsx
   │   └── InventoryDetailDrawer.tsx
   ├── hooks/
   │   └── useInventory.ts
   ├── services/
   │   └── inventoryService.ts
   └── types/
       └── index.ts
   ```

2. **创建页面**
   ```
   frontend/src/pages/inventory/
   └── InventoryPage.tsx
   ```

3. **添加路由**
   ```typescript
   // frontend/src/router/index.tsx
   {
     path: '/inventory',
     element: <InventoryPage />,
   }
   ```

4. **运行前端测试**
   ```bash
   cd frontend
   npm run test        # 单元测试
   npm run test:e2e    # E2E 测试
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory | 查询库存列表 |
| GET | /api/inventory/{id} | 获取库存详情 |
| GET | /api/stores/accessible | 获取可访问门店 |
| GET | /api/categories | 获取分类列表 |

## Key Files

### 规格文档
- `specs/P003-inventory-query/spec.md` - 功能规格
- `specs/P003-inventory-query/data-model.md` - 数据模型
- `specs/P003-inventory-query/contracts/api.yaml` - API 契约

### 数据库
- `backend/src/main/resources/db/migration/V029__create_store_inventory.sql`

### 后端
- `backend/src/main/java/com/cinema/inventory/` - 库存模块

### 前端
- `frontend/src/features/inventory/` - 库存功能模块
- `frontend/src/pages/inventory/` - 库存页面
- `frontend/src/types/inventory.ts` - 类型定义（复用现有）

## Testing Checklist

### E2E 测试场景 (Playwright)
- [ ] 库存列表加载显示
- [ ] 搜索功能测试
- [ ] 门店筛选测试
- [ ] 库存状态筛选测试
- [ ] 商品分类筛选测试
- [ ] 多条件组合筛选
- [ ] 库存详情展开
- [ ] 空状态显示
- [ ] 分页功能

### 单元测试 (Vitest)
- [ ] 库存状态计算逻辑
- [ ] 筛选参数验证
- [ ] API 服务层
- [ ] 组件渲染

## Common Issues

### Q: 库存状态显示不正确？
A: 检查 `available_qty` 和 `safety_stock` 字段值，确保计算逻辑正确。

### Q: 门店筛选为空？
A: 确认用户已登录且有门店访问权限。

### Q: 分类筛选不生效？
A: 确认 SKU 的 `category_id` 字段已正确关联分类。
