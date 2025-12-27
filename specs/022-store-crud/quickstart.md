# Quickstart Guide: 门店管理 - 增删改功能

**Feature**: 022-store-crud
**Last Updated**: 2025-12-22

## Prerequisites

### Required Features
- **014-hall-store-backend**: 门店和影厅后端建模(提供Store实体和只读管理页面)
- **020-store-address**: 门店地址信息管理(扩展Store实体添加address/phone等字段)

### Development Environment
- **Node.js**: 18+ (推荐使用nvm管理版本)
- **Java**: 21+ (OpenJDK或Oracle JDK)
- **PostgreSQL**: 14+ (通过Supabase提供)
- **Package Manager**: npm 9+ 或 pnpm 8+
- **IDE**: VS Code (推荐安装ESLint, Prettier插件) 或 IntelliJ IDEA

### Supabase Setup
- Supabase项目已创建
- `stores`表已通过014和020的迁移脚本创建
- Supabase连接信息已配置在`backend/src/main/resources/application.yml`

## Local Development Setup

### Step 1: Database Migration

运行数据库迁移脚本,添加status和version字段,创建store_operation_logs表:

```bash
# 连接Supabase PostgreSQL
psql "postgresql://<supabase-user>:<password>@<supabase-host>:5432/postgres"

# 运行迁移脚本(复制specs/022-store-crud/data-model.md中的Migration Script)
-- 或使用Supabase Dashboard的SQL Editor执行
```

**迁移内容**:
- `ALTER TABLE stores ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE'`
- `ALTER TABLE stores ADD COLUMN version BIGINT DEFAULT 0`
- `CREATE TABLE store_operation_logs (...)`
- `CREATE INDEX idx_stores_status ON stores(status)`

### Step 2: Backend Startup

```bash
# 进入backend目录
cd backend

# 安装依赖(首次运行或pom.xml变更后)
./mvnw clean install

# 启动Spring Boot应用
./mvnw spring-boot:run

# 验证后端启动成功
# 访问 http://localhost:8080/api/stores 应返回JSON响应
```

**后端运行端口**: 8080 (可在application.yml中修改)

### Step 3: Frontend Startup

```bash
# 进入frontend目录
cd frontend

# 安装依赖(首次运行或package.json变更后)
npm install

# 启动开发服务器
npm run dev

# 验证前端启动成功
# 浏览器自动打开 http://localhost:3000
```

**前端运行端口**: 3000 (Vite默认端口)

### Step 4: Navigate to Store Management Page

在浏览器中访问:
```
http://localhost:3000/stores
```

应看到门店管理页面,包含:
- 门店列表表格(StoreTable组件,来自014)
- "新建门店"按钮(CreateStoreModal)
- 每行的操作按钮:编辑、停用/启用、删除

## Testing CRUD Operations

### 1. Create Store (创建门店)

**步骤**:
1. 点击页面右上角的"新建门店"按钮
2. 填写表单字段:
   - 门店名称: `测试门店001`
   - 区域: 选择 `华北`
   - 城市: 选择 `北京`
   - 详细地址: `朝阳区建国路1号`
   - 联系电话: `010-12345678` 或 `13912345678`
3. 点击"确定"按钮

**预期结果**:
- 弹窗关闭
- 列表刷新,新门店出现在第一行
- 门店状态显示为"启用"
- 显示成功提示:"门店创建成功"

**验证数据库**:
```sql
SELECT * FROM stores WHERE name = '测试门店001';
-- 应看到新插入的记录,status='ACTIVE', version=0

SELECT * FROM store_operation_logs WHERE operation_type = 'CREATE' ORDER BY operation_time DESC LIMIT 1;
-- 应看到CREATE操作日志
```

### 2. Edit Store (编辑门店)

**步骤**:
1. 在列表中找到刚创建的"测试门店001"
2. 点击该行的"编辑"按钮
3. 修改字段(如将地址改为"朝阳区建国路2号")
4. 点击"确定"

**预期结果**:
- 弹窗关闭
- 列表刷新,门店地址已更新
- 显示成功提示:"门店更新成功"

**验证数据库**:
```sql
SELECT * FROM stores WHERE name = '测试门店001';
-- address应为"朝阳区建国路2号", version=1

SELECT * FROM store_operation_logs WHERE operation_type = 'UPDATE' ORDER BY operation_time DESC LIMIT 1;
-- 应看到UPDATE操作日志,before_value包含旧地址,after_value包含新地址
```

### 3. Toggle Status (切换状态)

**步骤**:
1. 在列表中找到"测试门店001"
2. 点击该行的"停用"按钮
3. 确认对话框中点击"确定"

**预期结果**:
- 门店状态显示为"停用"
- 操作按钮变为"启用"
- 显示成功提示:"门店已停用"

**验证数据库**:
```sql
SELECT status, version FROM stores WHERE name = '测试门店001';
-- status='INACTIVE', version=2

SELECT * FROM store_operation_logs WHERE operation_type = 'STATUS_CHANGE' ORDER BY operation_time DESC LIMIT 1;
-- 应看到STATUS_CHANGE操作日志
```

### 4. Delete Store (删除门店)

**注意**: 删除操作需要系统管理员权限,且门店不能有关联的影厅、预约设置或预约记录。

**步骤**:
1. 确保"测试门店001"没有关联的影厅(可在halls表查询)
2. 点击该行的"删除"按钮
3. 阅读确认对话框的警告信息
4. 点击"确定"

**预期结果**:
- 门店从列表中移除
- 显示成功提示:"门店删除成功"

**验证数据库**:
```sql
SELECT * FROM stores WHERE name = '测试门店001';
-- 应返回空结果(记录已删除)

SELECT * FROM store_operation_logs WHERE operation_type = 'DELETE' ORDER BY operation_time DESC LIMIT 1;
-- 应看到DELETE操作日志,before_value包含删除前的门店数据
```

## Mock Data for Development

### Frontend Mock Setup

如果后端未启动,前端可使用MSW模拟CRUD操作:

```typescript
// frontend/src/mocks/handlers/stores.ts

import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

let mockStores = [
  {
    id: uuidv4(),
    name: 'Mock门店A',
    region: '华北',
    city: '北京',
    address: '测试地址A',
    phone: '010-12345678',
    status: 'ACTIVE',
    version: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const storeHandlers = [
  // GET /api/stores
  http.get('/api/stores', () => {
    return HttpResponse.json({
      success: true,
      data: mockStores,
      total: mockStores.length,
    });
  }),

  // POST /api/stores
  http.post('/api/stores', async ({ request }) => {
    const dto = await request.json();
    const newStore = {
      ...dto,
      id: uuidv4(),
      status: 'ACTIVE',
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockStores.push(newStore);
    return HttpResponse.json({
      success: true,
      data: newStore,
    }, { status: 201 });
  }),

  // PUT /api/stores/:id
  http.put('/api/stores/:id', async ({ params, request }) => {
    const { id } = params;
    const dto = await request.json();
    const storeIndex = mockStores.findIndex(s => s.id === id);

    if (storeIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'STORE_NOT_FOUND',
        message: '门店不存在',
      }, { status: 404 });
    }

    const store = mockStores[storeIndex];
    if (store.version !== dto.version) {
      return HttpResponse.json({
        success: false,
        error: 'OPTIMISTIC_LOCK_EXCEPTION',
        message: '门店信息已被他人修改,请刷新后重试',
      }, { status: 409 });
    }

    mockStores[storeIndex] = {
      ...store,
      ...dto,
      version: store.version + 1,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockStores[storeIndex],
    });
  }),

  // PATCH /api/stores/:id/status
  http.patch('/api/stores/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = await request.json();
    const storeIndex = mockStores.findIndex(s => s.id === id);

    if (storeIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'STORE_NOT_FOUND',
        message: '门店不存在',
      }, { status: 404 });
    }

    mockStores[storeIndex] = {
      ...mockStores[storeIndex],
      status,
      version: mockStores[storeIndex].version + 1,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockStores[storeIndex],
    });
  }),

  // DELETE /api/stores/:id
  http.delete('/api/stores/:id', ({ params }) => {
    const { id } = params;
    const storeIndex = mockStores.findIndex(s => s.id === id);

    if (storeIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'STORE_NOT_FOUND',
        message: '门店不存在',
      }, { status: 404 });
    }

    mockStores.splice(storeIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
```

### Persist Mock Data

使用localStorage持久化mock数据,页面刷新后数据不丢失:

```typescript
// frontend/src/mocks/storage.ts

const STORAGE_KEY = 'mock_stores';

export function loadMockStores() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveMockStores(stores: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
}
```

## Common Issues & Troubleshooting

### Issue 1: 门店名称重复错误

**现象**: 创建或编辑门店时提示"门店名称已存在"

**原因**: 门店名称有唯一性约束(去除前后空格后不区分大小写)

**解决方案**:
- 修改门店名称为不重复的值
- 检查数据库中是否有隐藏的空格或大小写差异

### Issue 2: 乐观锁冲突

**现象**: 编辑门店时提示"门店信息已被他人修改,请刷新后重试"

**原因**: 两个用户同时编辑了同一门店,版本号不匹配

**解决方案**:
- 点击"刷新"按钮重新加载门店列表
- 重新打开编辑表单,获取最新的version值
- 重新编辑并提交

### Issue 3: 删除失败 - 有依赖关系

**现象**: 删除门店时提示"该门店有3个影厅,请先删除影厅再删除门店"

**原因**: 门店有关联的影厅、预约设置或预约记录

**解决方案**:
- 先删除所有关联的影厅(通过影厅管理页面)
- 先删除预约设置(通过预约设置Modal)
- 或使用"停用"功能代替删除(推荐)

### Issue 4: 电话号码格式验证失败

**现象**: 提交表单时提示"请输入有效的电话号码"

**原因**: 电话号码格式不符合正则规则

**正确格式**:
- 手机号: `13912345678` (11位,以1开头)
- 座机号: `010-12345678` (区号-号码,如010, 021, 0755)

## Next Steps

1. 运行测试: `npm run test` (前端单元测试) 和 `npm run test:e2e` (端到端测试)
2. 查看代码覆盖率: `npm run test:coverage`
3. 运行后端测试: `cd backend && ./mvnw test`
4. 提交代码前检查: `npm run lint` 和 `npm run type-check`
